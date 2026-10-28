// Static pages render every valid membership; optional URL context selects one.
export function initPathContext() {
  const variants = document.querySelectorAll<HTMLElement>(
    '[data-path-context]',
  );
  const defaultPath = document.querySelector<HTMLElement>('[data-default-path]')
    ?.dataset.defaultPath;
  if (!defaultPath) return () => {};
  const validPaths = new Set(
    Array.from(variants, (element) => element.dataset.pathContext),
  );
  const switches =
    document.querySelectorAll<HTMLSelectElement>('[data-path-switch]');
  function applyPathContext() {
    const requested = new URL(location.href).searchParams.get('path');
    const selected =
      requested && validPaths.has(requested) ? requested : defaultPath;
    variants.forEach((element) => {
      element.hidden = element.dataset.pathContext !== selected;
    });
    switches.forEach((select) => {
      if (selected) select.value = selected;
    });
  }
  const switchPath = (event: Event) => {
    const select = event.currentTarget;
    if (!(select instanceof HTMLSelectElement) || !validPaths.has(select.value))
      return;
    const url = new URL(location.href);
    if (select.value === defaultPath) url.searchParams.delete('path');
    else url.searchParams.set('path', select.value);
    history.pushState(null, '', url);
    applyPathContext();
    document
      .querySelector<HTMLSelectElement>(
        '[data-path-sidebar]:not([hidden]) [data-path-switch]',
      )
      ?.focus();
  };
  applyPathContext();
  window.addEventListener('popstate', applyPathContext);
  switches.forEach((select) => select.addEventListener('change', switchPath));
  return () => {
    window.removeEventListener('popstate', applyPathContext);
    switches.forEach((select) =>
      select.removeEventListener('change', switchPath),
    );
  };
}
