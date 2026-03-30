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

describe('index.html: Barrierefreiheit (Accessibility)', () => {
  let html;
  beforeAll(() => { html = read('index.html'); });

  test('Alle Buttons haben aria-label oder Textinhalt', () => {
    const buttons = [...html.matchAll(/<button([^>]+)>/g)];
    buttons.forEach(([full, attrs]) => {
      const hasLabel = /aria-label=/i.test(attrs);
      const hasText  = />\s*[^<\s]/.test(full) || html.substring(html.indexOf(full)).split('</button>')[0].length > full.length;
      expect(hasLabel || hasText).toBe(true);
    });
  });

  test('Bilder haben alt-Attribute', () => {
    const imgs = [...html.matchAll(/<img([^>]+)>/g)];
    imgs.forEach(([_, attrs]) => {
      expect(attrs).toMatch(/alt=/i);
    });
  });
});

describe('index.html: Interne Anker-Links & IDs', () => {
  let html;
  beforeAll(() => { html = read('index.html'); });

  test('Navigations-Links verweisen auf existierende IDs', () => {
    // Collect all href="#..." from nav and mobile menu
    const navAnchors = [...html.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]).filter(id => id && id !== '#');
    const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]));
    
    const missing = navAnchors.filter((a) => !ids.has(a) && a !== '');
    expect(missing).toEqual([]);
  });

  test('Alle Sektionen haben eindeutige IDs', () => {
    const idMatches = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
    const uniqueIds = new Set(idMatches);
    expect(idMatches.length).toBe(uniqueIds.size);
  });
});

describe('CSS & Design System: Globale Validierung', () => {
  let css, html;
  beforeAll(() => { 
    css = read('style.css'); 
    html = read('index.html');
  });

  test('CSS Variablen (Design Tokens) sind definiert', () => {
    // Check either in style.css or in style block of index.html
    const hasTokens = (css.includes('--color-accent') && css.includes('--color-bg')) ||
                      (html.includes('--color-accent') && html.includes('--color-bg'));
    expect(hasTokens).toBe(true);
  });

  test('Alle @keyframes werden verwendet', () => {
    const keyframes = [...css.matchAll(/@keyframes\s+([a-zA-Z0-9_-]+)/g)].map(m => m[1]);
    const allContent = css + html;
    keyframes.forEach(name => {
      // Use regex to find the animation name in any animation shorthand or specific property
      const usageRegex = new RegExp(`animation(-name)?\\s*:\\s*([^;}]*\\b)?${name}\\b`, 'i');
      const isUsed = usageRegex.test(allContent);
      if (!isUsed) {
        console.warn(`Keyframe "${name}" seems unused in CSS/HTML.`);
      }
      expect(isUsed).toBe(true);
    });
  });
});

describe('Rechtliche Seiten: Grundstruktur & Konsistenz', () => {
  const legalPages = ['legal/agb.html', 'legal/datenschutz.html', 'legal/impressum.html'];
  
  test.each(legalPages)(
    '%s hat gültige HTML-Struktur und enthält TeamRadar Branding',
    (page) => {
      const content = read(page);
      expect(content.toLowerCase()).toContain('<!doctype html');
      expect(content).toContain('TeamRadar');
      expect(content).toContain('href="../style.css"'); // Correct relative path
    }
  );

  test('Abgleich der Impressums-Daten', () => {
    const impressum = read('legal/impressum.html');
    expect(impressum).toContain('Wamocon');
    expect(impressum).toContain('Vertreten durch');
  });
});
