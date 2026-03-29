/**
 * TeamRadar Landing Page — Regression Tests
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(ROOT, file), 'utf8');

describe('Pflichtdateien', () => {
  test.each([
    'index.html',
    'style.css',
    'script.js',
    'favicon.svg',
    'legal/agb.html',
    'legal/datenschutz.html',
    'legal/impressum.html',
  ])('%s ist vorhanden', (file) => {
    expect(fs.existsSync(path.join(ROOT, file))).toBe(true);
  });
});

describe('Keine Legacy-Inhalte', () => {
  const files = ['index.html', 'style.css', 'script.js'];
  const banned = [
    { pattern: /\bLFA\b/,      label: 'LFA'         },
    { pattern: /\bIHK\b/,      label: 'IHK'         },
    { pattern: /\bFIAE\b/,     label: 'FIAE'         },
    { pattern: /\bplan-IT\b/i,  label: 'plan-IT'     },
    { pattern: /\bUstafix\b/i, label: 'Ustafix'      },
  ];

  files.forEach((file) => {
    banned.forEach(({ pattern, label }) => {
      test(`${file}: enthält kein "${label}"`, () => {
        expect(read(file)).not.toMatch(pattern);
      });
    });
  });
});

describe('index.html: Pflicht-Sektionen vorhanden', () => {
  let html;
  beforeAll(() => { html = read('index.html'); });

  test.each([
    'hero', 'features', 'onboarding', 'presence-engine',
  ])('id="%s" vorhanden', (id) => {
    expect(html).toContain(`id="${id}"`);
  });
});

describe('index.html: Navigation & Branding', () => {
  let html;
  beforeAll(() => { html = read('index.html'); });

  test('favicon.svg im <head> verlinkt', () => {
    expect(html).toMatch(/href="favicon\.svg"/);
  });

  test('Markenname "TeamRadar" vorhanden', () => {
    expect(html).toContain('TeamRadar');
  });
});

describe('index.html: Meta-Tags', () => {
  let html;
  beforeAll(() => { html = read('index.html'); });

  test('charset deklariert', () => {
    expect(html.toLowerCase()).toMatch(/charset/);
  });

  test('viewport Meta-Tag vorhanden', () => {
    expect(html).toContain('name="viewport"');
  });

  test('description Meta-Tag vorhanden', () => {
    expect(html).toContain('name="description"');
  });
});

describe('index.html: SVG-Sprite Symbole', () => {
  let html;
  beforeAll(() => { html = read('index.html'); });

  test.each([
    'i-zap', 'i-check', 'i-calendar', 'i-github', 'i-radar'
  ])('Symbol #%s ist definiert', (sym) => {
    expect(html).toContain(`id="${sym}"`);
  });
});

describe('index.html: Interne Anker-Links', () => {
  let html;
  beforeAll(() => { html = read('index.html'); });

  test('Navigations-Links verweisen auf existierende IDs', () => {
    const anchors = [...html.matchAll(/href="#(features|onboarding|demo|presence-engine)"/g)].map((m) => m[1]);
    const ids     = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]));
    const missing = anchors.filter((a) => !ids.has(a));
    expect(missing).toEqual([]);
  });
});

describe('Rechtliche Seiten: Grundstruktur', () => {
  test.each(['legal/agb.html', 'legal/datenschutz.html', 'legal/impressum.html'])(
    '%s hat gültige HTML-Struktur und enthält TeamRadar',
    (page) => {
      const content = read(page);
      expect(content.toLowerCase()).toContain('<!doctype html');
      expect(content.toLowerCase()).toContain('<html');
      expect(content).toContain('TeamRadar');
    }
  );
});
