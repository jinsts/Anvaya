import {
  PROGRESS_EVENT,
  PROGRESS_KEY,
  clearProgress,
  exportProgress,
  importProgress,
  loadProgress,
  updateProgress,
  type Progress,
} from './progress';

// Progressive enhancement driven by data attributes; static pages never claim progress.

const label = (link: HTMLElement) =>
  link.dataset.label ?? link.textContent?.trim() ?? '';

function relativeDay(iso: string) {
  const days = Math.round(
    (new Date().setHours(0, 0, 0, 0) - new Date(iso).setHours(0, 0, 0, 0)) /
      86_400_000,
  );
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  return days < 7
    ? `${days} days ago`
    : new Date(iso).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      });
}

function setBar(
  bar: HTMLElement | null,
  done: number,
  total: number,
  unit: string,
) {
  if (!bar) return;
  bar.setAttribute('aria-valuemax', String(total));
  bar.setAttribute('aria-valuenow', String(done));
  bar.setAttribute('aria-valuetext', `${done} of ${total} ${unit}`);
  bar.style.setProperty('--value', `${total ? (done / total) * 100 : 0}%`);
}

function applyScopes(progress: Progress) {
  document
    .querySelectorAll<HTMLElement>('[data-progress-scope]')
    .forEach((scope) => {
      const seen = new Set<string>();
      const lessons = [
        ...scope.querySelectorAll<HTMLAnchorElement>('a[data-lesson-id]'),
      ].filter((link) => {
        const id = link.dataset.lessonId!;
        return !seen.has(id) && seen.add(id);
      });
      const done = lessons.filter(
        (link) => progress.completed[link.dataset.lessonId!],
      ).length;
      const next = lessons.find(
        (link) => !progress.completed[link.dataset.lessonId!],
      );
      scope
        .querySelectorAll<HTMLElement>('[data-progress-text]')
        .forEach((text) => {
          text.textContent = `${done} of ${lessons.length} complete`;
        });
      setBar(
        scope.querySelector('[data-progress-bar]'),
        done,
        lessons.length,
        'lessons complete',
      );
      const nextLink = scope.querySelector<HTMLAnchorElement>(
        '[data-progress-next]',
      );
      // Copy attributes, not resolved properties, so links stay root-relative.
      const href = (link: HTMLAnchorElement) => link.getAttribute('href') ?? '';
      if (nextLink && next) {
        nextLink.setAttribute('href', href(next));
        nextLink.textContent = label(next);
      }
      scope
        .querySelector<HTMLElement>('[data-progress-next-wrap]')
        ?.toggleAttribute('hidden', !next);
      scope
        .querySelector<HTMLElement>('[data-progress-done]')
        ?.toggleAttribute('hidden', Boolean(next) || !lessons.length);
      const resume = scope.querySelector<HTMLAnchorElement>(
        '[data-progress-resume]',
      );
      const resumeLabel = resume?.querySelector('[data-progress-resume-label]');
      if (resume && resumeLabel) {
        resume.dataset.start ??= href(resume);
        resume.dataset.startLabel ??= resumeLabel.textContent ?? '';
        if (!done) {
          resume.setAttribute('href', resume.dataset.start);
          resumeLabel.textContent = resume.dataset.startLabel;
        } else if (next) {
          resume.setAttribute('href', href(next));
          resumeLabel.textContent = `Continue with ${label(next)}`;
        } else {
          resume.setAttribute('href', resume.dataset.start);
          resumeLabel.textContent = 'Review from the start';
        }
      }
    });
}

function applyContinue(progress: Progress) {
  const card = document.querySelector<HTMLElement>('[data-continue]');
  const last = progress.lastLesson;
  if (!card || !last) return;
  const set = (selector: string, text: string) => {
    const node = card.querySelector(selector);
    if (node) node.textContent = text;
  };
  set('[data-continue-label]', 'Continue where you left off');
  set(
    '[data-continue-summary]',
    `Last opened ${relativeDay(last.at)}${progress.completed[last.id] ? ' · completed' : ''}.`,
  );
  set('[data-continue-button-label]', 'Resume lesson');
  card
    .querySelectorAll<HTMLAnchorElement>('[data-continue-link]')
    .forEach((link) => {
      link.setAttribute('href', last.url);
      if (!link.matches('.button')) link.textContent = last.title;
    });
  card
    .querySelectorAll<HTMLElement>('[data-continue-static]')
    .forEach((node) => (node.hidden = true));
}

function applyPracticeSummary(progress: Progress) {
  const summary = document.querySelector<HTMLElement>(
    '[data-practice-summary]',
  );
  if (!summary) return;
  const ids = (summary.dataset.problemIds ?? '').split(' ').filter(Boolean);
  const solved = ids.filter(
    (id) => progress.problems[id]?.status === 'solved',
  ).length;
  const text = summary.querySelector('[data-solved-text]');
  if (text) text.textContent = `${solved} of ${ids.length} problems solved`;
  setBar(
    summary.querySelector('[data-progress-bar]'),
    solved,
    ids.length,
    'problems solved',
  );
  const review = Object.values(progress.questions).filter(
    (entry) => entry.result === 'again',
  ).length;
  const reviewText = summary.querySelector('[data-review-text]');
  if (reviewText && review)
    reviewText.textContent = `${review} ${review === 1 ? 'question' : 'questions'} marked for review`;
}

export function applyProgress(progress = loadProgress()) {
  document
    .querySelectorAll<HTMLAnchorElement>('a[data-lesson-id]')
    .forEach((link) => {
      const complete = Boolean(progress.completed[link.dataset.lessonId!]);
      link.toggleAttribute('data-complete', complete);
      link
        .querySelector<HTMLElement>('[data-complete-label]')
        ?.toggleAttribute('hidden', !complete);
    });
  document
    .querySelectorAll<HTMLButtonElement>('[data-complete-toggle]')
    .forEach((button) => {
      const complete = Boolean(progress.completed[button.dataset.lessonId!]);
      button.setAttribute('aria-pressed', String(complete));
      const text = button.querySelector('[data-complete-text]');
      if (text) text.textContent = complete ? 'Completed' : 'Mark as complete';
    });
  applyScopes(progress);
  applyContinue(progress);
  applyPracticeSummary(progress);
}

function initDataControls() {
  const message = document.querySelector<HTMLElement>(
    '[data-progress-message]',
  );
  const say = (text: string) => {
    if (message) message.textContent = text;
  };
  document
    .querySelector('[data-progress-export]')
    ?.addEventListener('click', () => {
      const url = URL.createObjectURL(
        new Blob([exportProgress()], { type: 'application/json' }),
      );
      const link = Object.assign(document.createElement('a'), {
        href: url,
        download: `anvaya-progress-${new Date().toISOString().slice(0, 10)}.json`,
      });
      link.click();
      URL.revokeObjectURL(url);
      say('Progress exported.');
    });
  document
    .querySelector<HTMLInputElement>('[data-progress-import]')
    ?.addEventListener('change', async (event) => {
      const input = event.currentTarget as HTMLInputElement;
      const file = input.files?.[0];
      if (!file) return;
      try {
        importProgress(await file.text());
        say('Progress imported from file.');
      } catch (error) {
        say(error instanceof Error ? error.message : 'Import failed.');
      }
      input.value = '';
    });
  document
    .querySelector('[data-progress-clear]')
    ?.addEventListener('click', () => {
      if (!confirm('Clear all progress stored in this browser?')) return;
      clearProgress();
      say('Progress cleared.');
    });
}

export function initProgressUI() {
  const page = document.querySelector<HTMLElement>('[data-lesson-page]');
  if (page)
    updateProgress((progress) => {
      progress.lastLesson = {
        id: page.dataset.lessonPage!,
        title: page.dataset.lessonTitle ?? document.title,
        url: location.pathname + location.search,
        at: new Date().toISOString(),
      };
    });
  document
    .querySelectorAll<HTMLButtonElement>('[data-complete-toggle]')
    .forEach((button) =>
      button.addEventListener('click', () => {
        const id = button.dataset.lessonId!;
        updateProgress((progress) => {
          if (progress.completed[id]) delete progress.completed[id];
          else progress.completed[id] = new Date().toISOString();
        });
      }),
    );
  initDataControls();
  window.addEventListener(PROGRESS_EVENT, () => applyProgress());
  window.addEventListener('storage', (event) => {
    if (event.key === PROGRESS_KEY) applyProgress();
  });
  applyProgress();
}
