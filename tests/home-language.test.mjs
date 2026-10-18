import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveHomeLanguage } from '../src/lib/home-language.server.ts';

for (const [acceptLanguage, expected] of [
  ['en-US,en;q=0.9', 'en'],
  ['zh-CN,zh;q=0.9,en;q=0.8', 'zh'],
  ['zh-TW', 'zh'],
  ['zh-HK', 'zh'],
  ['ZH-cn', 'zh'],
  ['zh;q=0.5,en-US;q=0.9', 'en'],
  ['en;q=0.4,zh-CN;q=0.9', 'zh'],
  ['fr-FR,zh;q=0.8,en;q=0.7', 'zh'],
  ['zh;q=0,*;q=0.8', 'en'],
  ['en;q=0,*;q=0.8', 'zh'],
  ['de-DE', 'zh'],
  ['*', 'zh'],
  ['', 'zh'],
  [null, 'zh']
]) test(`browser language ${acceptLanguage} => ${expected}`, () => {
  assert.equal(resolveHomeLanguage({ acceptLanguage }), expected);
});

test('presentation links override saved and browser preferences in both directions', () => {
  assert.equal(resolveHomeLanguage({ requested: 'en', saved: 'zh', acceptLanguage: 'zh-CN' }), 'en');
  assert.equal(resolveHomeLanguage({ requested: 'zh', saved: 'en', acceptLanguage: 'en-US' }), 'zh');
});

test('manual preference overrides browser language in both directions', () => {
  assert.equal(resolveHomeLanguage({ saved: 'en', acceptLanguage: 'zh-CN' }), 'en');
  assert.equal(resolveHomeLanguage({ saved: 'zh', acceptLanguage: 'en-US' }), 'zh');
});

test('invalid parameters and invalid saved preferences fall through safely', () => {
  assert.equal(resolveHomeLanguage({ requested: 'fr', saved: 'zh', acceptLanguage: 'en' }), 'zh');
  assert.equal(resolveHomeLanguage({ requested: '', saved: 'invalid', acceptLanguage: 'zh-CN' }), 'zh');
  assert.equal(resolveHomeLanguage({ requested: ['en', 'zh'], saved: 'en' }), 'en');
  assert.equal(resolveHomeLanguage({}), 'zh');
});
