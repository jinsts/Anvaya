import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { load } from 'cheerio';

const root = path.resolve('dist');
async function walk(directory) {
  const files = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    files.map((file) =>
      file.isDirectory()
        ? walk(path.join(directory, file.name))
        : [path.join(directory, file.name)],
    ),
  );
  return nested.flat();
}
const files = await walk(root);
const fileSet = new Set(files);
// Keep only IDs and links per page so memory stays flat as the library grows.
const pages = new Map();
for (const file of files.filter((name) => name.endsWith('.html'))) {
  const route =
    '/' +
    path
      .relative(root, file)
      .replaceAll(path.sep, '/')
      .replace(/index\.html$/, '');
  if (pages.has(route)) throw new Error(`Duplicate route: ${route}`);
  const $ = load(await readFile(file, 'utf8'));
  const ids = $('[id]')
    .map((_, node) => $(node).attr('id'))
    .get();
  if (new Set(ids).size !== ids.length)
    throw new Error(`Duplicate anchor on ${route}`);
  if ($('main h1').length !== 1)
    throw new Error(`Expected one main heading: ${route}`);
  if ($('img:not([alt])').length)
    throw new Error(`Image missing alternative text: ${route}`);
  if (route.startsWith('/learn/') && !ids.includes('two-minute-recap'))
    throw new Error(`Lesson needs recap: ${route}`);
  const links = $('a[href], script[src], link[href], img[src]')
    .map((_, element) => $(element).attr('href') ?? $(element).attr('src'))
    .get();
  pages.set(route, { ids: new Set(ids), links });
}
for (const [route, { links }] of pages) {
  for (const href of links) {
    if (!href || /^(https?:|mailto:|tel:|data:)/.test(href)) continue;
    const url = new URL(href, `http://anvaya.local${route}`);
    const target = pages.get(url.pathname) ?? pages.get(url.pathname + '/');
    if (target) {
      if (url.hash && !target.ids.has(decodeURIComponent(url.hash.slice(1))))
        throw new Error(`Broken anchor: ${route} → ${href}`);
    } else if (
      !fileSet.has(path.join(root, decodeURIComponent(url.pathname)))
    ) {
      throw new Error(`Broken local link: ${route} → ${href}`);
    }
  }
}
console.log(
  `Validated ${pages.size} static pages: links, anchors, headings, image alternatives and recaps.`,
);
