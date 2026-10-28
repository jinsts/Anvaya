import { describe, expect, it } from 'vitest';

interface Exercises {
  linearSearch(values: readonly number[], target: number): number;
  removeAt(values: number[], index: number): number;
}
export function exerciseContracts(implementation: Exercises) {
  describe('Exercise 1: linearSearch', () => {
    it.each([
      [[12, 24, 36], 24, 1],
      [[], 1, -1],
      [[2], 2, 0],
      [[2], 3, -1],
      [[5, 5, 5], 5, 0],
      [[-2, 0, 2], -2, 0],
      [[1, 2, 3], 3, 2],
    ] as const)('searches %j for %s → %s', (values, target, expected) => {
      const original = [...values];
      expect(implementation.linearSearch(Object.freeze(original), target)).toBe(
        expected,
      );
      expect(original).toEqual(values);
    });
  });
  describe('Exercise 2: removeAt', () => {
    it.each([
      [[12, 24, 36, 48], 2, 36, [12, 24, 48]],
      [[9], 0, 9, []],
      [[1, 2], 0, 1, [2]],
      [[1, 2], 1, 2, [1]],
    ] as const)('removes index %s from %j', (input, index, removed, result) => {
      const values = [...input];
      expect(implementation.removeAt(values, index)).toBe(removed);
      expect(values).toEqual(result);
    });
    it.each([-1, 3, 1.5, NaN, Infinity])(
      'rejects invalid index %s without mutation',
      (index) => {
        const values = [1, 2, 3];
        expect(() => implementation.removeAt(values, index)).toThrow(
          RangeError,
        );
        expect(values).toEqual([1, 2, 3]);
      },
    );
    it('rejects removal from empty input', () => {
      expect(() => implementation.removeAt([], 0)).toThrow(RangeError);
    });
  });
}
