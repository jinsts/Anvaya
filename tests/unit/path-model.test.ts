import { expect, it } from 'vitest';
import {
  categoryAncestors,
  lessonUrl,
  neighbors,
  pathLessonIds,
  pathSections,
  subjectsInCategory,
  validateCatalog,
  validateTaxonomy,
} from '../../src/lib/path-model';
import type { LearningPath } from '../../src/data/paths';
import type { Category, Subject } from '../../src/data/taxonomy';

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
it('accepts consistent paths and rejects missing links, duplicates, invalid defaults, and cycles', () => {
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
  ).toThrow('default path');
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

it('preserves section order and supplies a single outline for flat paths', () => {
  const grouped: LearningPath = {
    id: 'grouped',
    subject: 'dsa',
    title: 'Grouped',
    description: 'Section ordering',
    sections: [
      { id: 'first', title: 'First', lessons: ['one'] },
      { id: 'second', title: 'Second', lessons: ['two'] },
    ],
  };
  expect(pathLessonIds(grouped)).toEqual(['one', 'two']);
  expect(pathSections(grouped).map((section) => section.title)).toEqual([
    'First',
    'Second',
  ]);
  expect(pathSections(path)).toEqual([
    { id: 'lessons', title: 'Lessons', lessons: ['one', 'two'] },
  ]);
  expect(neighbors(pathLessonIds(grouped), 'one').next).toBe('two');
});

it('rejects repeated section IDs, repeated lessons across sections, and ambiguous ordering', () => {
  const details = {
    id: 'grouped',
    subject: 'dsa',
    title: 'Grouped',
    description: 'Section validation',
  };
  const first = { id: 'first', title: 'First', lessons: ['one'] };
  expect(() =>
    validateCatalog(lessons, [
      path,
      { ...details, sections: [first, { ...first, lessons: ['two'] }] },
    ]),
  ).toThrow('Duplicate section');
  expect(() =>
    validateCatalog(lessons, [
      path,
      {
        ...details,
        sections: [first, { ...first, id: 'second' }],
      },
    ]),
  ).toThrow('Duplicate path entry');
  expect(() =>
    validateCatalog(lessons, [
      {
        ...path,
        sections: [first],
      } as unknown as LearningPath,
    ]),
  ).toThrow('either lessons or sections');
});

const categories: Category[] = [
  { id: 'technology', title: 'Technology', description: 'Test technology' },
  {
    id: 'computer-science',
    title: 'Computer Science',
    description: 'Test computation',
    parent: 'technology',
  },
  { id: 'languages', title: 'Languages', description: 'Test languages' },
];
const subjects: Subject[] = [
  {
    id: 'dsa',
    title: 'DSA',
    description: 'Test algorithms',
    category: 'computer-science',
  },
  {
    id: 'french',
    title: 'French',
    description: 'Test non-CS subject',
    category: 'languages',
  },
];

it('supports a non-CS standalone lesson and cross-subject shared path membership', () => {
  const standalone = {
    id: 'french/greeting',
    data: { subject: 'french', prerequisites: [] },
  };
  const another: LearningPath = {
    id: 'another-path',
    subject: 'french',
    title: 'Another',
    description: 'Test shared membership',
    lessons: ['french/greeting', 'one'],
  };
  expect(() =>
    validateCatalog([...lessons, standalone], [path], subjects, categories),
  ).not.toThrow();
  expect(() =>
    validateCatalog(
      [...lessons, standalone],
      [path, another],
      subjects,
      categories,
    ),
  ).not.toThrow();
  expect(neighbors(pathLessonIds(another), 'one').previous).toBe(
    'french/greeting',
  );
  expect(lessonUrl('one')).toBe('/learn/one/');
  expect(lessonUrl('one', another.id)).toBe('/learn/one/?path=another-path');
});

it('rejects missing default paths and unknown lesson/path subjects', () => {
  expect(() =>
    validateCatalog(
      [{ ...lessons[0]!, data: { ...lessons[0]!.data, path: 'missing' } }],
      [{ ...path, lessons: ['one'] }],
    ),
  ).toThrow('default path');
  expect(() =>
    validateCatalog(lessons, [{ ...path, subject: 'missing' }]),
  ).toThrow('path subject');
  expect(() =>
    validateCatalog(
      [
        { ...lessons[0]!, data: { ...lessons[0]!.data, subject: 'missing' } },
        lessons[1]!,
      ],
      [path],
    ),
  ).toThrow('lesson subject');
});

it('finds category ancestry and subjects in descendant categories', () => {
  expect(
    categoryAncestors('computer-science', categories).map((c) => c.id),
  ).toEqual(['technology', 'computer-science']);
  expect(
    subjectsInCategory('technology', subjects, categories).map((s) => s.id),
  ).toEqual(['dsa']);
  expect(
    subjectsInCategory('languages', subjects, categories).map((s) => s.id),
  ).toEqual(['french']);
});

it('rejects category cycles, missing parents, invalid IDs and duplicate taxonomy records', () => {
  expect(() => validateTaxonomy(categories, subjects)).not.toThrow();
  expect(() =>
    validateTaxonomy(
      [
        { ...categories[0]!, parent: 'computer-science' },
        ...categories.slice(1),
      ],
      subjects,
    ),
  ).toThrow('Category cycle');
  expect(() =>
    validateTaxonomy([{ ...categories[0]!, parent: 'missing' }], []),
  ).toThrow('Missing category');
  expect(() =>
    validateTaxonomy(categories, [{ ...subjects[0]!, category: 'missing' }]),
  ).toThrow('Missing subject category');
  expect(() =>
    validateTaxonomy([...categories, categories[0]!], subjects),
  ).toThrow('Duplicate category');
  expect(() =>
    validateTaxonomy(categories, [...subjects, subjects[0]!]),
  ).toThrow('Duplicate subject');
  expect(() =>
    validateTaxonomy([{ ...categories[0]!, id: '../invalid' }], []),
  ).toThrow('Invalid category ID');
});
