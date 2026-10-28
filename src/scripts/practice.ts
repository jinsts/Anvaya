import {
  PROGRESS_EVENT,
  loadProgress,
  updateProgress,
  type ProblemStatus,
} from './progress';
import {
  formatClock,
  matchesProblem,
  pickRandom,
  type ProblemFilters,
} from '../lib/practice-model';

const filterNames = ['q', 'lesson', 'difficulty', 'list', 'status'] as const;
const statusLabels: Record<ProblemStatus, string> = {
  todo: 'to do',
  attempted: 'attempted',
  solved: 'solved',
  review: 'needs review',
};

function readFilters(form: HTMLFormElement): ProblemFilters {
  const data = new FormData(form);
  const value = (name: string) => String(data.get(name) ?? '');
  return {
    query: value('q'),
    lesson: value('lesson'),
    difficulty: value('difficulty'),
    list: value('list'),
    status: value('status'),
  };
}

function initMock(rows: HTMLElement[]) {
  const root = document.querySelector<HTMLElement>('[data-mock]');
  if (!root) return;
  const $ = <T extends Element>(selector: string) =>
    root.querySelector<T>(selector)!;
  const intro = $<HTMLElement>('[data-mock-intro]');
  const session = $<HTMLElement>('[data-mock-session]');
  const message = $<HTMLElement>('[data-mock-message]');
  const start = $<HTMLButtonElement>('[data-mock-start]');
  const duration = $<HTMLSelectElement>('[data-mock-duration]');
  const link = $<HTMLAnchorElement>('[data-mock-problem]');
  const meta = $<HTMLElement>('[data-mock-meta]');
  const clock = $<HTMLElement>('[data-mock-clock]');
  const pauseLabel = $<HTMLElement>('[data-mock-pause-label]');
  let problemId = '';
  let endsAt = 0;
  let remaining = 0;
  let timer: ReturnType<typeof setInterval> | undefined;

  const stopTimer = () => {
    clearInterval(timer);
    timer = undefined;
  };
  const tick = () => {
    const left = endsAt - Date.now();
    clock.textContent = formatClock(left);
    if (left <= 0) {
      stopTimer();
      message.textContent =
        'Time is up. Finish your explanation, then record how it went.';
    }
  };
  const run = () => {
    endsAt = Date.now() + remaining;
    timer = setInterval(tick, 1000);
    tick();
  };
  const end = (text: string) => {
    stopTimer();
    session.hidden = true;
    intro.hidden = false;
    message.textContent = text;
    start.focus();
  };

  start.addEventListener('click', () => {
    const progress = loadProgress();
    const visible = rows.filter((row) => !row.hidden);
    const unsolved = visible.filter(
      (row) => progress.problems[row.dataset.problem!]?.status !== 'solved',
    );
    const row = pickRandom(unsolved.length ? unsolved : visible);
    if (!row) {
      message.textContent =
        'No problems match your filters. Change them and try again.';
      return;
    }
    problemId = row.dataset.problem!;
    link.href = row.dataset.url!;
    link.textContent = row.dataset.title!;
    meta.textContent = `${row.querySelector('.badge')?.textContent ?? ''} · ${duration.value} minutes`;
    remaining = Number(duration.value) * 60_000;
    pauseLabel.textContent = 'Pause';
    intro.hidden = true;
    session.hidden = false;
    message.textContent = `Mock interview started: ${row.dataset.title}, ${duration.value} minutes.`;
    stopTimer();
    run();
    link.focus();
  });
  $('[data-mock-pause]').addEventListener('click', () => {
    if (timer) {
      stopTimer();
      remaining = Math.max(0, endsAt - Date.now());
      pauseLabel.textContent = 'Resume';
      message.textContent = 'Timer paused.';
    } else if (remaining > 0) {
      pauseLabel.textContent = 'Pause';
      message.textContent = 'Timer resumed.';
      run();
    }
  });
  root
    .querySelectorAll<HTMLButtonElement>('[data-mock-finish]')
    .forEach((button) =>
      button.addEventListener('click', () => {
        const status = button.dataset.mockFinish as ProblemStatus;
        updateProgress((progress) => {
          progress.problems[problemId] = {
            status,
            at: new Date().toISOString(),
          };
        });
        end(`Recorded ${link.textContent} as ${statusLabels[status]}.`);
      }),
    );
  $('[data-mock-cancel]').addEventListener('click', () =>
    end('Session ended. Nothing was recorded.'),
  );
}

export function initPractice() {
  const form = document.querySelector<HTMLFormElement>(
    '[data-problem-filters]',
  );
  const rows = [...document.querySelectorAll<HTMLElement>('[data-problem]')];
  const count = document.querySelector<HTMLElement>('[data-problem-count]');
  const empty = document.querySelector<HTMLElement>('[data-problem-empty]');
  if (!form) return;

  const params = new URLSearchParams(location.search);
  for (const name of filterNames) {
    const field = form.elements.namedItem(name) as
      HTMLInputElement | HTMLSelectElement | null;
    const value = params.get(name);
    if (field && value) field.value = value;
  }

  function apply() {
    const progress = loadProgress();
    const filters = readFilters(form!);
    let visible = 0;
    let solved = 0;
    for (const row of rows) {
      const id = row.dataset.problem!;
      const status = progress.problems[id]?.status ?? 'todo';
      if (status === 'solved') solved++;
      row.dataset.status = status;
      const select = row.querySelector<HTMLSelectElement>(
        '[data-problem-status]',
      );
      if (select) select.value = status;
      row.hidden = !matchesProblem(
        {
          text: row.dataset.text ?? '',
          difficulty: row.dataset.difficulty ?? '',
          lessons: (row.dataset.lessons ?? '').split(' '),
          lists: (row.dataset.lists ?? '').split(' ').filter(Boolean),
        },
        filters,
        status,
      );
      if (!row.hidden) visible++;
    }
    if (count)
      count.textContent = `${visible} of ${rows.length} problems · ${solved} solved`;
    if (empty) empty.hidden = visible > 0;
  }

  function syncUrl() {
    const filters = readFilters(form!);
    const url = new URL(location.href);
    const values = {
      q: filters.query,
      lesson: filters.lesson,
      difficulty: filters.difficulty,
      list: filters.list,
      status: filters.status,
    };
    for (const name of filterNames) {
      if (values[name]) url.searchParams.set(name, values[name]);
      else url.searchParams.delete(name);
    }
    history.replaceState(null, '', url);
  }

  form.addEventListener('submit', (event) => event.preventDefault());
  form.addEventListener('input', () => {
    apply();
    syncUrl();
  });
  form.addEventListener('reset', () =>
    setTimeout(() => {
      apply();
      syncUrl();
    }),
  );
  for (const row of rows) {
    row
      .querySelector<HTMLSelectElement>('[data-problem-status]')
      ?.addEventListener('change', (event) => {
        const status = (event.currentTarget as HTMLSelectElement)
          .value as ProblemStatus;
        updateProgress((progress) => {
          if (status === 'todo') delete progress.problems[row.dataset.problem!];
          else
            progress.problems[row.dataset.problem!] = {
              status,
              at: new Date().toISOString(),
            };
        });
      });
  }
  window.addEventListener(PROGRESS_EVENT, apply);
  initMock(rows);
  apply();
}
