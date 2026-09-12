import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { createHmac, randomBytes, createCipheriv } from 'node:crypto';
import { gzipSync } from 'node:zlib';
const key = process.env.FDE_CAMP_20260913_KEY || '';
if (!/^[a-f0-9]{64}$/i.test(key) || !process.argv[2]) throw new Error('Provide the source directory and server-side encryption key');
const derived = createHmac('sha256', Buffer.from(key, 'hex')).update('ha7ch/fde-camp/20260913/content').digest();
const output = resolve('private/fde-camp-20260913');
await mkdir(output, { recursive: true });
for (const name of ['book', 'slides']) {
  let source = await readFile(join(resolve(process.argv[2]), `${name}.html`), 'utf8');
  source = source.replaceAll('href="book.html"', 'href="/fde-camp/book"').replaceAll('href="slides.html"', 'href="/fde-camp/slides"');
  if (name === 'book') source = source.replaceAll('讲师备课全书 · 本地完整版','讲师备课全书 · 密码访问').replaceAll('含客户原件和私人对话的研究内容仅在本地版呈现。','研究附录在密码保护下提供；原始文件仍保存在讲师资料库中。').replaceAll('讲师研究附录 · 本地阅读','讲师研究附录 · 密码访问');
  const iv = randomBytes(12), cipher = createCipheriv('aes-256-gcm', derived, iv);
  const ciphertext = Buffer.concat([cipher.update(gzipSync(source)), cipher.final()]);
  await writeFile(join(output, `${name}.enc`), Buffer.concat([iv, cipher.getAuthTag(), ciphertext]));
  console.log(`Encrypted ${name}; plaintext is not included in this repository.`);
}
