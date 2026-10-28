import { afterEach, beforeEach, expect, it } from 'vitest';
import { initPathContext } from '../../src/scripts/path-context';
let dispose = () => {};
beforeEach(() => {
  document.body.innerHTML = `
    <main data-default-path="foundations"></main>
    <aside data-path-sidebar="foundations" data-path-context="foundations">
      <select aria-label="Path" data-path-switch><option value="foundations">Foundations</option><option value="practice">Practice</option></select>
    </aside>
    <aside data-path-sidebar="practice" data-path-context="practice" hidden>
      <select aria-label="Path" data-path-switch><option value="foundations">Foundations</option><option value="practice">Practice</option></select>
    </aside>
    <nav data-path-context="foundations"><a href="/learn/next/">Next in foundations</a></nav>
    <nav data-path-context="practice" hidden><a href="/learn/other/?path=practice">Next in practice</a></nav>`;
  history.replaceState(null, '', '/learn/shared/?source=library#practice');
});
afterEach(() => {
  dispose();
  document.body.replaceChildren();
});
const visibleContexts = () =>
  Array.from(
    document.querySelectorAll<HTMLElement>('[data-path-context]:not([hidden])'),
    (node) => node.dataset.pathContext,
  );
it('selects an alternate membership from the URL and falls back for unknown context', () => {
  history.replaceState(null, '', '?path=practice');
  dispose = initPathContext();
  expect(visibleContexts()).toEqual(['practice', 'practice']);
  expect(
    document.querySelector<HTMLSelectElement>(
      '[data-path-sidebar="practice"] select',
    )?.value,
  ).toBe('practice');
  history.replaceState(null, '', '?path=unknown');
  window.dispatchEvent(new PopStateEvent('popstate'));
  expect(visibleContexts()).toEqual(['foundations', 'foundations']);
});
it('switches outline and adjacency together, preserving location and keyboard focus', () => {
  dispose = initPathContext();
  const primary = document.querySelector<HTMLSelectElement>(
    '[data-path-sidebar="foundations"] select',
  )!;
  primary.value = 'practice';
  primary.dispatchEvent(new Event('change'));
  expect(visibleContexts()).toEqual(['practice', 'practice']);
  expect(location.search).toBe('?source=library&path=practice');
  expect(location.hash).toBe('#practice');
  const alternate = document.querySelector<HTMLSelectElement>(
    '[data-path-sidebar="practice"] select',
  )!;
  expect(alternate).toHaveFocus();
  expect(document.querySelector('nav:not([hidden]) a')).toHaveAttribute(
    'href',
    '/learn/other/?path=practice',
  );
  alternate.value = 'foundations';
  alternate.dispatchEvent(new Event('change'));
  expect(location.search).toBe('?source=library');
  expect(visibleContexts()).toEqual(['foundations', 'foundations']);
  expect(primary).toHaveFocus();
});
it('leaves standalone content readable when there is no path', () => {
  document.body.innerHTML =
    '<main data-default-path><h1>Independent lesson</h1></main>';
  dispose = initPathContext();
  expect(document.querySelector('main')).not.toHaveAttribute('hidden');
  expect(location.search).toBe('?source=library');
});
