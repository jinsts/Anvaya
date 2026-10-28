import { expect, it } from 'vitest';
import { neighbors, validateCatalog } from '../../src/lib/path-model';
import type { LearningPath } from '../../src/data/paths';

const path: LearningPath = {
  id: 'test-path',
  subject: 'dsa',
  title: 'Test',
  description: 'Test path',
  lessons: ['one', 'two'],
};
const lessons = [
  {
    id: 'one',
    data: { path: 'test-path', subject: 'dsa', prerequisites: [] as string[] },
  },
  {
    id: 'two',
    data: { path: 'test-path', subject: 'dsa', prerequisites: ['one'] },
  },
];
it('resolves first, middle, last and unknown neighbors from canonical ordering', () => {
  expect(neighbors(['one', 'two', 'three'], 'two')).toEqual({
    previous: 'one',
    next: 'three',
  });
  expect(neighbors(['one', 'two'], 'one')).toEqual({
    previous: undefined,
    next: 'two',
  });
  expect(neighbors(['one', 'two'], 'two')).toEqual({
    previous: 'one',
    next: undefined,
  });
  expect(neighbors(['one'], 'absent')).toEqual({});
});
it('accepts consistent paths and rejects missing links, duplicates, orphans, and cycles', () => {
  expect(() => validateCatalog(lessons, [path])).not.toThrow();
  expect(() =>
    validateCatalog(lessons, [{ ...path, lessons: ['missing'] }]),
  ).toThrow('reference');
  expect(() => validateCatalog([...lessons, lessons[0]!], [path])).toThrow(
    'Duplicate',
  );
  expect(() =>
    validateCatalog(lessons, [{ ...path, lessons: ['one', 'one'] }]),
  ).toThrow('Duplicate');
  expect(() =>
    validateCatalog(lessons, [{ ...path, lessons: ['one'] }]),
  ).toThrow('Orphaned');
  expect(() =>
    validateCatalog(
      [
        { id: 'one', data: { ...lessons[0]!.data, prerequisites: ['two'] } },
        lessons[1]!,
      ],
      [path],
    ),
  ).toThrow('cycle');
  expect(() =>
    validateCatalog(
      [
        lessons[0]!,
        {
          ...lessons[1]!,
          data: { ...lessons[1]!.data, prerequisites: ['missing'] },
        },
      ],
      [path],
    ),
  ).toThrow('Missing');
});
