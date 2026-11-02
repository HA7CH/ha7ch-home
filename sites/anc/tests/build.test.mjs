import test from 'node:test';
import assert from 'node:assert/strict';
import { cp, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { buildArtifacts, verifyArtifacts, PROJECT_ROOT } from '../scripts/build.mjs';

test('two independent builds are byte-identical and match committed release files', async () => {
  const first = await buildArtifacts();
  const second = await buildArtifacts();
  assert.deepEqual(second, first);
  await verifyArtifacts(PROJECT_ROOT, first);
  const manifest = JSON.parse(first['release/manifest.json']);
  assert.equal(Object.keys(manifest).some(key => /time|date|generated_at/i.test(key)), false);
});

test('CLI --check detects stale output and source changes without writing files', async t => {
  const temporary = await mkdtemp(path.join(tmpdir(), 'anc-release-test-'));
  t.after(() => rm(temporary, { recursive: true, force: true }));
  for (const name of ['scripts', 'integration', 'dist', 'release']) {
    await cp(path.join(PROJECT_ROOT, name), path.join(temporary, name), { recursive: true });
  }
  const run = args => spawnSync(process.execPath, ['scripts/build.mjs', ...args], { cwd: temporary, encoding: 'utf8' });
  assert.equal(run(['--check']).status, 0);
  const outputPath = path.join(temporary, 'release/anc-standalone.html');
  await writeFile(outputPath, '<!-- stale output -->');
  const staleOutput = run(['--check']);
  assert.notEqual(staleOutput.status, 0);
  assert.match(staleOutput.stderr, /Missing\/stale release files/);
  assert.equal(await readFile(outputPath, 'utf8'), '<!-- stale output -->');
  assert.equal(run([]).status, 0);
  assert.equal(run(['--check']).status, 0);
  const before = await readFile(outputPath, 'utf8');
  const cssPath = path.join(temporary, 'dist/style.css');
  await writeFile(cssPath, `${await readFile(cssPath, 'utf8')}\n/* changed source */\n`);
  const staleSource = run(['--check']);
  assert.notEqual(staleSource.status, 0);
  assert.match(staleSource.stderr, /Missing\/stale release files/);
  assert.equal(await readFile(outputPath, 'utf8'), before);
  assert.equal(run([]).status, 0);
  assert.equal(run(['--check']).status, 0);
  assert.notEqual(await readFile(outputPath, 'utf8'), before);
});
