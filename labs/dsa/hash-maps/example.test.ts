import { expect, it } from 'vitest';
import { frequencies } from './example';

it('counts repeated keys and preserves first-key insertion order', () => {
  expect([...frequencies(['array', 'map', 'array'])]).toEqual([
    ['array', 2],
    ['map', 1],
  ]);
});
it('handles empty input and prototype-like string keys', () => {
  expect([...frequencies([])]).toEqual([]);
  expect(frequencies(['__proto__', '__proto__']).get('__proto__')).toBe(2);
});
