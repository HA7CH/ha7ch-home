import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import ts from 'typescript';

function catalog() {
  const root = new URL('../src/content/catalog.ts', import.meta.url);
  const require = createRequire(root);
  const cache = new Map();
  function load(file) {
    if (cache.has(file)) return cache.get(file);
    const exports = {};
    cache.set(file, exports);
    const code = ts.transpileModule(readFileSync(file, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true }
    }).outputText;
    vm.runInNewContext(code, { exports, require: id => id.endsWith('.json') ? require(id) : load(new URL(`${id}.ts`, root)), Intl, Date });
    return exports;
  }
  return load(root);
}

test('confirmed Beijing archive survives the mobile and agent release merge', () => {
  const item = catalog().events.find(item => item.title === 'FDE PRO S26 · Beijing');
  assert.ok(item);
  assert.equal(item.eventStatus, 'end');
  assert.equal(item.date, '2026-09-05');
  assert.equal(item.href, 'https://mee7.ha7ch.com/e/beijing-fde-pro');
  assert.match(item.description, /311/);
});

test('open events precede ended events and historical dates remain available', () => {
  const { events } = catalog();
  const firstEnded = events.findIndex(item => item.eventStatus === 'end');
  assert.ok(firstEnded >= 0);
  assert.ok(events.slice(firstEnded).every(item => item.eventStatus === 'end'));
  assert.equal(events.find(item => item.title.includes('San Francisco'))?.date, '2026-07-18');
  assert.equal(events.find(item => item.title.includes('Hangzhou'))?.date, '2026-06-27');
});
