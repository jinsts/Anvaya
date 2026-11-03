import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import {
  PROGRESS_EVENT,
  PROGRESS_KEY,
  clearProgress,
  emptyProgress,
  exportProgress,
  importProgress,
  loadProgress,
  parseProgress,
  updateProgress,
} from '../../src/scripts/progress';

const at = '2026-10-28T10:00:00.000Z';
beforeEach(() => {
  localStorage.clear();
  clearProgress();
});
afterEach(() => vi.restoreAllMocks());

it('keeps valid entries and drops corrupt or foreign data', () => {
  expect(parseProgress(null)).toEqual(emptyProgress());
  expect(parseProgress({ version: 2, completed: { a: at } })).toEqual(
    emptyProgress(),
  );
  const parsed = parseProgress({
    version: 1,
    lastLesson: {
      id: 'dsa/arrays',
      title: 'Arrays',
      url: '/learn/dsa/arrays/',
      at,
    },
    completed: { 'dsa/arrays': at, broken: 'not a date' },
    problems: {
      'two-sum': { status: 'solved', at },
      odd: { status: 'unknown', at },
    },
    questions: { q: { result: 'again', at }, bad: { result: 'maybe', at } },
  });
  expect(parsed.completed).toEqual({ 'dsa/arrays': at });
  expect(parsed.problems).toEqual({ 'two-sum': { status: 'solved', at } });
  expect(parsed.questions).toEqual({ q: { result: 'again', at } });
  expect(parsed.lastLesson?.url).toBe('/learn/dsa/arrays/');
  expect(
    parseProgress({
      version: 1,
      lastLesson: { id: 'x', title: 'X', url: 'https://evil.test/', at },
    }).lastLesson,
  ).toBeUndefined();
});

it('persists updates under the versioned key and announces changes', () => {
  const listener = vi.fn();
  window.addEventListener(PROGRESS_EVENT, listener);
  updateProgress((progress) => {
    progress.completed['dsa/arrays'] = at;
  });
  expect(JSON.parse(localStorage.getItem(PROGRESS_KEY)!).completed).toEqual({
    'dsa/arrays': at,
  });
  expect(loadProgress().completed['dsa/arrays']).toBe(at);
  expect(listener).toHaveBeenCalledTimes(1);
  window.removeEventListener(PROGRESS_EVENT, listener);
});

it('ignores unreadable stored JSON', () => {
  localStorage.setItem(PROGRESS_KEY, '{not json');
  expect(loadProgress()).toEqual(emptyProgress());
});

it('keeps working in memory when storage is blocked', () => {
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
    throw new DOMException('Blocked', 'SecurityError');
  });
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new DOMException('Blocked', 'SecurityError');
  });
  updateProgress((progress) => {
    progress.problems['two-sum'] = { status: 'attempted', at };
  });
  expect(loadProgress().problems['two-sum']?.status).toBe('attempted');
});

it('round-trips exports and rejects files that are not progress exports', () => {
  updateProgress((progress) => {
    progress.questions['dsa/arrays#why'] = { result: 'known', at };
  });
  const exported = exportProgress();
  clearProgress();
  expect(loadProgress()).toEqual(emptyProgress());
  importProgress(exported);
  expect(loadProgress().questions['dsa/arrays#why']?.result).toBe('known');
  expect(() => importProgress('nope')).toThrow('not valid JSON');
  expect(() => importProgress('{"version":3}')).toThrow('not an Anvaya');
});
