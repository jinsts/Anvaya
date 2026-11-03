import { describe, expect, it } from 'vitest';

export interface Exercise {
  solve(values: readonly number[]): number;
}

// Shared by the learner attempt and the reference solution.
export function exerciseContracts(implementation: Exercise) {
  describe('solve', () => {
    it.each([
      // TODO: Normal, boundary and invalid cases as [input, expected].
      [[1, 2, 3], 6],
      [[], 0],
    ] as const)('solves %j → %s', (values, expected) => {
      expect(implementation.solve(values)).toBe(expected);
    });
  });
}
