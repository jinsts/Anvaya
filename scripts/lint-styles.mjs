// Design-token guard: font sizes and colors must come from src/styles/global.css tokens.
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve('src');
const tokenFile = path.join(root, 'styles', 'global.css');

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const full = path.join(directory, entry.name);
      return entry.isDirectory() ? walk(full) : [full];
    }),
  );
  return nested.flat();
}

/** CSS text with line numbers: whole .css files, or <style> blocks in .astro files. */
function cssBlocks(file, text) {
  if (file.endsWith('.css')) return [{ css: text, offset: 0 }];
  const blocks = [];
  for (const match of text.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) {
    const before = text.slice(0, match.index);
    blocks.push({ css: match[1], offset: before.split('\n').length - 1 });
  }
  return blocks;
}

const sizeValue = /^(var\(--text-[a-z0-9-]+\)|inherit|[\d.]+em|[\d.]+%)$/;
const rules = [
  {
    pattern: /(?<![\w-])font-size\s*:\s*([^;]+)/g,
    invalid: (value) => !sizeValue.test(value),
    message: 'use a --text-* token (or a relative em/% size) for font-size',
  },
  {
    pattern: /(?<![\w-])font\s*:\s*([^;]+)/g,
    invalid: (value) => value !== 'inherit',
    message: 'avoid the font shorthand; set font-family/font-size with tokens',
  },
  {
    pattern: /#[0-9a-fA-F]{3,8}\b|\b(?:rgb|hsl)a?\(/g,
    invalid: () => true,
    message: 'use a color token from global.css instead of a literal color',
    skipTokenFile: true,
  },
];

const problems = [];
for (const file of await walk(root)) {
  if (!/\.(css|astro)$/.test(file)) continue;
  const text = await readFile(file, 'utf8');
  for (const { css, offset } of cssBlocks(file, text)) {
    const lines = css.split('\n');
    lines.forEach((line, index) => {
      for (const rule of rules) {
        if (rule.skipTokenFile && file === tokenFile) continue;
        for (const match of line.matchAll(rule.pattern)) {
          if (!rule.invalid(match[1]?.trim() ?? '')) continue;
          problems.push(
            `${path.relative(process.cwd(), file)}:${offset + index + 1}: ${rule.message} (${match[0].trim()})`,
          );
        }
      }
    });
  }
}
if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log('Styles use design tokens for font sizes and colors.');
