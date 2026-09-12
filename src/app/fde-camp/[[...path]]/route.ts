import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { CAMP_PATH, COOKIE_NAME, SESSION_SECONDS, sameOriginSubmission, allowAttempt, configuration, decryptArtifact, decryptClassroomArtifact, destination, issueSession, verifyPassword, verifySession } from '@/lib/fde-camp-access';
import { indexView, loginView } from '@/lib/fde-camp-view';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
type Context = { params: Promise<{ path?: string[] }> };
const securityHeaders = {
  'Cache-Control': 'private, no-store, max-age=0',
  'CDN-Cache-Control': 'no-store',
  'Vercel-CDN-Cache-Control': 'no-store',
  'X-Robots-Tag': 'noindex, nofollow, noarchive',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer',
  'Content-Security-Policy': "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; font-src data:; connect-src 'none'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
};
function html(body: string, status = 200) {
  return new NextResponse(body, { status, headers: { ...securityHeaders, 'Content-Type': 'text/html; charset=utf-8' } });
}
function redirect(request: NextRequest, target: string) {
  const response = NextResponse.redirect(new URL(target, request.url), 303);
  for (const [key, value] of Object.entries(securityHeaders)) response.headers.set(key, value);
  return response;
}
function cookieOptions(request: NextRequest, maxAge: number) {
  return { httpOnly: true, secure: request.nextUrl.protocol === 'https:', sameSite: 'strict' as const, path: CAMP_PATH, maxAge };
}
export async function GET(request: NextRequest, context: Context) {
  const part = (await context.params).path || [];
  const name = part.join('/');
  if (part.length > 1 || !['', 'book', 'book.html', 'slides', 'slides.html', 'setup', 'setup.html', 'lesson', 'lesson.html', 'login'].includes(name)) return html('Not found', 404);
  if (!configuration()) return html('课程暂时无法访问，请稍后再试。', 503);
  const target = destination(name);
  if (!verifySession(request.cookies.get(COOKIE_NAME)?.value)) return html(loginView(target), target ? 401 : 200);
  if (!target) return html(indexView());
  try {
    const encrypted = await readFile(join(process.cwd(), 'private', 'fde-camp-20260913', `${target}.enc`));
    return html(['setup','lesson'].includes(target) ? decryptClassroomArtifact(encrypted) : decryptArtifact(encrypted));
  } catch {
    return html('课程暂时无法读取，请稍后再试。', 503);
  }
}
export async function POST(request: NextRequest, context: Context) {
  const name = ((await context.params).path || []).join('/');
  if (!['login', 'logout'].includes(name)) return html('Not found', 404);
  if (!sameOriginSubmission(request.headers.get('origin'), request.headers.get('sec-fetch-site'), request.nextUrl.origin)) return html('请求来源不匹配，请从课程页面重试。', 403);
  if (name === 'logout') {
    const response = redirect(request, CAMP_PATH);
    response.cookies.set(COOKIE_NAME, '', cookieOptions(request, 0));
    return response;
  }
  if (!configuration()) return html('课程暂时无法访问，请稍后再试。', 503);
  const contentType = request.headers.get('content-type') || '';
  if (!contentType.startsWith('application/x-www-form-urlencoded') || Number(request.headers.get('content-length') || 0) > 4096) return html('Invalid request', 400);
  const body = await request.text();
  if (body.length > 4096) return html('Invalid request', 400);
  const fields = new URLSearchParams(body);
  const next = destination(fields.get('next'));
  const ip = request.headers.get('x-vercel-forwarded-for') || request.headers.get('x-forwarded-for') || 'local';
  const client = createHash('sha256').update(ip.split(',')[0].trim()).digest('hex');
  if (!allowAttempt(client)) {
    const response = html(loginView(next, '尝试次数较多，请五分钟后重试。'), 429);
    response.headers.set('Retry-After', '300');
    return response;
  }
  if (!await verifyPassword(fields.get('password') || '')) return html(loginView(next, '密码不正确，请重新输入。'), 401);
  const response = redirect(request, `${CAMP_PATH}${next ? `/${next}` : ''}`);
  response.cookies.set(COOKIE_NAME, issueSession(), cookieOptions(request, SESSION_SECONDS));
  return response;
}
