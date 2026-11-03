// Full-text search over the Pagefind index that `pnpm build` writes to dist/pagefind.

interface PagefindData {
  url: string;
  excerpt: string;
  meta: { title?: string; subject?: string };
  filters?: Record<string, string[]>;
  sub_results?: { title: string; url: string }[];
}
interface Pagefind {
  init?: () => Promise<void>;
  search: (
    query: string,
  ) => Promise<{ results: { data: () => Promise<PagefindData> }[] }>;
}

let pagefind: Promise<Pagefind | null> | undefined;
function loadPagefind() {
  const url = '/pagefind/pagefind.js';
  pagefind ??= import(/* @vite-ignore */ url)
    .then(async (module: Pagefind) => {
      await module.init?.();
      return module;
    })
    .catch(() => null);
  return pagefind;
}

function renderResult(data: PagefindData, headingId: string) {
  const item = document.createElement('li');
  item.className = 'result';
  const meta = document.createElement('p');
  meta.className = 'result-meta';
  const type = data.filters?.type?.[0];
  if (type) {
    const badge = document.createElement('span');
    badge.className = 'badge';
    badge.dataset.variant = 'accent';
    badge.textContent = type;
    meta.append(badge);
  }
  if (data.meta.subject) meta.append(data.meta.subject);
  const heading = document.createElement('h2');
  heading.id = headingId;
  const link = document.createElement('a');
  link.href = data.url;
  link.textContent = data.meta.title ?? data.url;
  heading.append(link);
  const excerpt = document.createElement('p');
  excerpt.className = 'excerpt';
  // Pagefind escapes indexed text and adds only <mark> around matches.
  excerpt.innerHTML = data.excerpt;
  item.append(meta, heading, excerpt);
  const sections = (data.sub_results ?? [])
    .filter((section) => section.url.includes('#'))
    .slice(0, 3);
  if (sections.length) {
    const list = document.createElement('ul');
    list.className = 'sections';
    list.setAttribute('aria-label', `Sections in ${link.textContent}`);
    for (const section of sections) {
      const entry = document.createElement('li');
      const anchor = document.createElement('a');
      anchor.href = section.url;
      anchor.textContent = section.title;
      entry.append(anchor);
      list.append(entry);
    }
    item.append(list);
  }
  return item;
}

export function initSearch() {
  const input = document.querySelector<HTMLInputElement>('#search');
  const status = document.querySelector<HTMLElement>('#search-status');
  const results = document.querySelector<HTMLOListElement>('#results');
  const empty = document.querySelector<HTMLElement>('#empty');
  const clear = document.querySelector<HTMLButtonElement>('#clear-search');
  if (!input || !status || !results || !empty || !clear) return;
  let latest = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;

  async function run() {
    const query = input!.value.trim();
    const url = new URL(location.href);
    if (query) url.searchParams.set('q', query);
    else url.searchParams.delete('q');
    history.replaceState(null, '', url);
    clear!.hidden = !query;
    const request = ++latest;
    if (!query) {
      results!.replaceChildren();
      empty!.hidden = true;
      status!.textContent =
        'Type to search lessons, learning paths, subjects and practice.';
      return;
    }
    const engine = await loadPagefind();
    if (!engine) {
      status!.textContent =
        'The search index is created by pnpm build. Run pnpm preview to search.';
      return;
    }
    const search = await engine.search(query);
    const found = await Promise.all(
      search.results.slice(0, 20).map((result) => result.data()),
    );
    if (request !== latest) return;
    results!.replaceChildren(
      ...found.map((data, index) => renderResult(data, `result-${index}`)),
    );
    empty!.hidden = found.length > 0;
    const count = search.results.length;
    status!.textContent = `${count} ${count === 1 ? 'result' : 'results'} for “${query}”`;
  }

  input.value = new URLSearchParams(location.search).get('q') ?? '';
  input.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(run, 150);
  });
  input.form?.addEventListener('submit', (event) => {
    event.preventDefault();
    clearTimeout(timer);
    void run();
  });
  clear.addEventListener('click', () => {
    input.value = '';
    void run();
    input.focus();
  });
  window.addEventListener('popstate', () => {
    input.value = new URLSearchParams(location.search).get('q') ?? '';
    void run();
  });
  void run();
}
