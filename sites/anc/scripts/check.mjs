import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { buildArtifacts, verifyArtifacts, PROJECT_ROOT } from './build.mjs';

for (const filename of ['dist/app.js', 'dist/faq.js', 'integration/homepage-handler.mjs', 'scripts/build.mjs', 'scripts/preview.mjs', 'release/anc-homepage.mjs']) {
  const result = spawnSync(process.execPath, ['--check', path.join(PROJECT_ROOT, filename)], { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status || 1);
}
await verifyArtifacts(PROJECT_ROOT, await buildArtifacts());
console.log('Syntax and release-source checks passed.');
