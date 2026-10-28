import { expect, it } from 'vitest';
import {
  emptyFilters,
  formatClock,
  matchesProblem,
  orderQuestions,
  pickRandom,
  questionId,
} from '../../src/lib/practice-model';
import { escapeHtml, inlineMarkdown } from '../../src/lib/format';

const facts = {
  text: 'two sum hashing arrays hash maps',
  difficulty: 'easy',
  lessons: ['dsa/hash-maps'],
  lists: ['blind-75'],
};

it('filters problems by text, topic, subject, difficulty, list and status', () => {
  const match = (filters: Partial<typeof emptyFilters>, status = 'todo') =>
    matchesProblem(facts, { ...emptyFilters, ...filters }, status);
  expect(match({})).toBe(true);
  expect(match({ query: 'Two hash' })).toBe(true);
  expect(match({ query: 'graph' })).toBe(false);
  expect(match({ lesson: 'dsa/hash-maps' })).toBe(true);
  expect(match({ lesson: 'dsa/arrays' })).toBe(false);
  expect(match({ lesson: 'subject:dsa' })).toBe(true);
  expect(match({ lesson: 'subject:french' })).toBe(false);
  expect(match({ difficulty: 'medium' })).toBe(false);
  expect(match({ list: 'blind-75' })).toBe(true);
  expect(match({ list: 'neetcode-150' })).toBe(false);
  expect(match({ status: 'solved' }, 'solved')).toBe(true);
  expect(match({ status: 'solved' })).toBe(false);
});

it('derives stable, readable question IDs', () => {
  expect(questionId('dsa/arrays', 'Why is `values[i]` O(1)?')).toBe(
    'dsa/arrays#why-is-values-i-o-1',
  );
  expect(questionId('dsa/arrays', 'x'.repeat(100)).length).toBeLessThanOrEqual(
    'dsa/arrays#'.length + 60,
  );
});

it('orders review-again first, then unseen, then known, oldest first', () => {
  const items = ['a', 'b', 'c', 'd', 'e'].map((id) => ({ id }));
  const ordered = orderQuestions(items, {
    a: { result: 'known', at: '2026-10-02T00:00:00Z' },
    b: { result: 'again', at: '2026-10-05T00:00:00Z' },
    d: { result: 'again', at: '2026-10-01T00:00:00Z' },
    e: { result: 'known', at: '2026-10-01T00:00:00Z' },
  });
  expect(ordered.map((item) => item.id)).toEqual(['d', 'b', 'c', 'e', 'a']);
});

it('formats the mock interview clock and picks deterministic random items', () => {
  expect(formatClock(45 * 60_000)).toBe('45:00');
  expect(formatClock(61_001)).toBe('01:02');
  expect(formatClock(-5)).toBe('00:00');
  expect(pickRandom(['a', 'b', 'c'], () => 0.99)).toBe('c');
  expect(pickRandom([], () => 0)).toBe(undefined);
});

it('escapes frontmatter text before adding inline code and emphasis', () => {
  expect(escapeHtml(`<a href="x">'&'</a>`)).toBe(
    '&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;',
  );
  expect(inlineMarkdown('Use `a<b` and **care**')).toBe(
    'Use <code>a&lt;b</code> and <strong>care</strong>',
  );
  expect(inlineMarkdown('<script>alert(1)</script>')).not.toContain('<script');
});
