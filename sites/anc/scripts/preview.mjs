// Local QA server only. The production helper returns null for unmatched routes.
import http from 'node:http';
import { createAncHomepageHandler } from '../release/anc-homepage.mjs';

const port = Number(process.env.PORT || 4173);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be a valid TCP port.');
const handle = createAncHomepageHandler({ allowedHosts: ['localhost', '127.0.0.1', 'terminal.local'] });
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', `http://${req.headers.host || `localhost:${port}`}`);
    const request = new Request(url, { method: req.method });
    const result = handle(request) || new Response('No local preview route. Production requests must fall through to the existing Worker.', { status: 404 });
    res.writeHead(result.status, Object.fromEntries(result.headers.entries()));
    res.end(req.method === 'HEAD' ? undefined : Buffer.from(await result.arrayBuffer()));
  } catch (error) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Invalid preview request.');
  }
});
server.listen(port, '0.0.0.0', () => console.log(`ANC release preview: http://localhost:${port}`));
