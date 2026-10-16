import assert from 'node:assert/strict';
import test from 'node:test';
import { T } from '../lib/i18n.js';

const legalPages = ['privacy', 'terms', 'security', 'cookies'];
const footerKeys = [
  'tagline',
  'newsletter',
  'newsletterHint',
  'newsletterEmail',
  'newsletterSuccess',
  'newsletterError',
  'newsletterRateLimit',
  'newsletterInvalid',
  'emailPlaceholder',
  'subscribing',
  'subscribe',
  'rights',
  'product',
  'company',
  'legal',
  'overview',
  'about',
  'news',
  'contact',
  'privacy',
  'terms',
  'security',
  'cookies',
];

test('legal pages provide complete, distinct English and Azerbaijani copy', () => {
  for (const pageKey of legalPages) {
    const english = T.en.legal.pages[pageKey];
    const azerbaijani = T.az.legal.pages[pageKey];
    assert.ok(english?.title && english?.description);
    assert.ok(azerbaijani?.title && azerbaijani?.description);
    assert.notEqual(english.title, azerbaijani.title);
    assert.notEqual(english.description, azerbaijani.description);
    assert.equal(english.sections.length, azerbaijani.sections.length);

    for (const [index, section] of english.sections.entries()) {
      const translated = azerbaijani.sections[index];
      assert.ok(section.heading && translated.heading);
      assert.notEqual(section.heading, translated.heading);
      assert.equal(section.paragraphs.length, translated.paragraphs.length);
      assert.ok(section.paragraphs.every(Boolean));
      assert.ok(translated.paragraphs.every(Boolean));
      assert.ok(section.paragraphs.every((paragraph, paragraphIndex) => (
        paragraph !== translated.paragraphs[paragraphIndex]
      )));
    }
  }
});

test('footer and legal navigation copy is available in both languages', () => {
  for (const key of footerKeys) {
    assert.equal(typeof T.en.footer[key], 'string', `English footer translation missing: ${key}`);
    assert.equal(typeof T.az.footer[key], 'string', `Azerbaijani footer translation missing: ${key}`);
    assert.notEqual(T.en.footer[key], T.az.footer[key], `Footer key was not translated: ${key}`);
  }

  for (const key of ['home', 'breadcrumb', 'lastUpdated', 'contactLabel']) {
    assert.ok(T.en.legal[key]);
    assert.ok(T.az.legal[key]);
    assert.notEqual(T.en.legal[key], T.az.legal[key]);
  }

  for (const key of ['news', 'language', 'lightMode', 'darkMode', 'newsManagement', 'switchToLight', 'switchToDark', 'openMenu', 'closeMenu']) {
    assert.ok(T.en.nav[key], `English navigation translation missing: ${key}`);
    assert.ok(T.az.nav[key], `Azerbaijani navigation translation missing: ${key}`);
    assert.notEqual(T.en.nav[key], T.az.nav[key]);
  }
});
