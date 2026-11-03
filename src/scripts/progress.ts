// Device-local learner progress (bootstrap §6.3). Storage is optional:
// corrupt data is ignored and blocked storage falls back to memory.
export const PROGRESS_KEY = 'anvaya:progress:v1';
export const PROGRESS_EVENT = 'anvaya:progress';

export const problemStatuses = [
  'todo',
  'attempted',
  'solved',
  'review',
] as const;
export type ProblemStatus = (typeof problemStatuses)[number];

export interface Progress {
  version: 1;
  lastLesson?: { id: string; title: string; url: string; at: string };
  completed: Record<string, string>;
  problems: Record<string, { status: ProblemStatus; at: string }>;
  questions: Record<string, { result: 'known' | 'again'; at: string }>;
}

export const emptyProgress = (): Progress => ({
  version: 1,
  completed: {},
  problems: {},
  questions: {},
});

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const isDate = (value: unknown): value is string =>
  typeof value === 'string' && !Number.isNaN(Date.parse(value));

/** Keep only well-formed entries; anything else becomes an empty record. */
export function parseProgress(value: unknown): Progress {
  const progress = emptyProgress();
  if (!isRecord(value) || value.version !== 1) return progress;
  const last = value.lastLesson;
  if (
    isRecord(last) &&
    typeof last.id === 'string' &&
    typeof last.title === 'string' &&
    typeof last.url === 'string' &&
    last.url.startsWith('/') &&
    isDate(last.at)
  )
    progress.lastLesson = {
      id: last.id,
      title: last.title,
      url: last.url,
      at: last.at,
    };
  if (isRecord(value.completed))
    for (const [id, at] of Object.entries(value.completed))
      if (isDate(at)) progress.completed[id] = at;
  if (isRecord(value.problems))
    for (const [id, entry] of Object.entries(value.problems))
      if (
        isRecord(entry) &&
        problemStatuses.includes(entry.status as ProblemStatus) &&
        isDate(entry.at)
      )
        progress.problems[id] = {
          status: entry.status as ProblemStatus,
          at: entry.at,
        };
  if (isRecord(value.questions))
    for (const [id, entry] of Object.entries(value.questions))
      if (
        isRecord(entry) &&
        (entry.result === 'known' || entry.result === 'again') &&
        isDate(entry.at)
      )
        progress.questions[id] = { result: entry.result, at: entry.at };
  return progress;
}

let memory: Progress | undefined;
let storageFailed = false;

export function loadProgress(): Progress {
  if (storageFailed && memory) return parseProgress(memory);
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    return raw ? parseProgress(JSON.parse(raw)) : emptyProgress();
  } catch {
    return memory ? parseProgress(memory) : emptyProgress();
  }
}

export function saveProgress(progress: Progress) {
  memory = progress;
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
    storageFailed = false;
    return true;
  } catch {
    storageFailed = true;
    return false;
  }
}

const announce = () => window.dispatchEvent(new CustomEvent(PROGRESS_EVENT));

export function updateProgress(change: (progress: Progress) => void) {
  const progress = loadProgress();
  change(progress);
  saveProgress(progress);
  announce();
  return progress;
}

export function clearProgress() {
  memory = undefined;
  storageFailed = false;
  try {
    localStorage.removeItem(PROGRESS_KEY);
  } catch {
    /* Nothing stored. */
  }
  announce();
}

export const exportProgress = () => JSON.stringify(loadProgress(), null, 2);

/** Replace progress with an exported file. Throws on anything else. */
export function importProgress(text: string) {
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    throw new Error('That file is not valid JSON.');
  }
  if (!isRecord(value) || value.version !== 1)
    throw new Error('That file is not an Anvaya progress export.');
  const progress = parseProgress(value);
  saveProgress(progress);
  announce();
  return progress;
}
