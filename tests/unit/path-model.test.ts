import { expect, it } from 'vitest';
import {
  categoryAncestors,
  lessonUrl,
  neighbors,
  pathLessonIds,
  pathSections,
  plannedCount,
  sourceForUrl,
  subjectsInCategory,
  validateCatalog,
  validateTaxonomy,
  type Category,
  type CatalogInput,
  type LearningPath,
  type LessonReference,
  type Problem,
  type Source,
  type Subject,
} from '../../src/lib/path-model';

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
const path: LearningPath = {
  id: 'test-path',
  subject: 'dsa',
  title: 'Test',
  description: 'Test path',
  lessons: ['one', 'two'],
};
const lessons: LessonReference[] = [
  {
    id: 'one',
    data: { path: 'test-path', subject: 'dsa', prerequisites: [] },
  },
  {
    id: 'two',
    data: { path: 'test-path', subject: 'dsa', prerequisites: ['one'] },
  },
];
const check = (
  checkedLessons: LessonReference[],
  paths: LearningPath[],
  extra: Partial<CatalogInput> = {},
) =>
  validateCatalog({
    lessons: checkedLessons,
    paths,
    subjects,
    categories,
    ...extra,
  });

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
  expect(() => check(lessons, [path])).not.toThrow();
  expect(() => check(lessons, [{ ...path, lessons: ['missing'] }])).toThrow(
    'reference',
  );
  expect(() => check([...lessons, lessons[0]!], [path])).toThrow('Duplicate');
  expect(() => check(lessons, [{ ...path, lessons: ['one', 'one'] }])).toThrow(
    'Duplicate',
  );
  expect(() => check(lessons, [{ ...path, lessons: ['one'] }])).toThrow(
    'default path',
  );
  expect(() =>
    check(
      [
        { id: 'one', data: { ...lessons[0]!.data, prerequisites: ['two'] } },
        lessons[1]!,
      ],
      [path],
    ),
  ).toThrow('cycle');
  expect(() =>
    check(
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

it('preserves section order, carries planned topics and supplies a single outline for flat paths', () => {
  const grouped: LearningPath = {
    id: 'grouped',
    subject: 'dsa',
    title: 'Grouped',
    description: 'Section ordering',
    sections: [
      { id: 'first', title: 'First', lessons: ['one'] },
      {
        id: 'second',
        title: 'Second',
        lessons: ['two'],
        planned: ['Linked lists', 'Stacks'],
      },
    ],
  };
  expect(pathLessonIds(grouped)).toEqual(['one', 'two']);
  expect(pathSections(grouped).map((section) => section.title)).toEqual([
    'First',
    'Second',
  ]);
  expect(plannedCount(grouped)).toBe(2);
  expect(pathSections(path)).toEqual([
    { id: 'lessons', title: 'Lessons', lessons: ['one', 'two'], planned: [] },
  ]);
  expect(plannedCount({ ...path, planned: ['Queues'] })).toBe(1);
  expect(neighbors(pathLessonIds(grouped), 'one').next).toBe('two');
});

it('rejects repeated section IDs, repeated lessons across sections, empty sections and ambiguous ordering', () => {
  const details = {
    id: 'grouped',
    subject: 'dsa',
    title: 'Grouped',
    description: 'Section validation',
  };
  const first = { id: 'first', title: 'First', lessons: ['one'] };
  expect(() =>
    check(lessons, [
      path,
      { ...details, sections: [first, { ...first, lessons: ['two'] }] },
    ]),
  ).toThrow('Duplicate section');
  expect(() =>
    check(lessons, [
      path,
      { ...details, sections: [first, { ...first, id: 'second' }] },
    ]),
  ).toThrow('Duplicate path entry');
  expect(() =>
    check(lessons, [
      path,
      {
        ...details,
        sections: [first, { id: 'later', title: 'Later', lessons: [] }],
      },
    ]),
  ).toThrow('Empty path section');
  expect(() =>
    check(lessons, [
      path,
      {
        ...details,
        sections: [
          first,
          { id: 'later', title: 'Later', lessons: [], planned: ['Trees'] },
        ],
      },
    ]),
  ).not.toThrow();
  expect(() =>
    check(lessons, [
      {
        ...path,
        sections: [first],
      } as unknown as LearningPath,
    ]),
  ).toThrow('either lessons or sections');
});

it('supports a non-CS standalone lesson and cross-subject shared path membership', () => {
  const standalone: LessonReference = {
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
  expect(() => check([...lessons, standalone], [path])).not.toThrow();
  expect(() => check([...lessons, standalone], [path, another])).not.toThrow();
  expect(neighbors(pathLessonIds(another), 'one').previous).toBe(
    'french/greeting',
  );
  expect(lessonUrl('one')).toBe('/learn/one/');
  expect(lessonUrl('one', another.id)).toBe('/learn/one/?path=another-path');
});

it('rejects missing default paths, unknown subjects and folders that disagree with the subject', () => {
  expect(() =>
    check(
      [{ ...lessons[0]!, data: { ...lessons[0]!.data, path: 'missing' } }],
      [{ ...path, lessons: ['one'] }],
    ),
  ).toThrow('default path');
  expect(() => check(lessons, [{ ...path, subject: 'missing' }])).toThrow(
    'path subject',
  );
  expect(() =>
    check(
      [
        { ...lessons[0]!, data: { ...lessons[0]!.data, subject: 'missing' } },
        lessons[1]!,
      ],
      [path],
    ),
  ).toThrow('lesson subject');
  expect(() =>
    check(
      [
        ...lessons,
        { id: 'dsa/greeting', data: { subject: 'french', prerequisites: [] } },
      ],
      [path],
    ),
  ).toThrow('folder must match');
});

const sources: Source[] = [
  {
    id: 'leetcode',
    name: 'LeetCode',
    kind: 'problem-bank',
    url: 'https://leetcode.com/',
    prefixes: ['https://leetcode.com/problems/'],
  },
  {
    id: 'list-75',
    name: 'A list',
    kind: 'problem-list',
    url: 'https://lists.example.net/75',
  },
  {
    id: 'spec',
    name: 'Spec',
    kind: 'specification',
    url: 'https://spec.example.net/',
  },
];
const problem: Problem = {
  id: 'two-sum',
  title: 'Two Sum',
  url: 'https://leetcode.com/problems/two-sum/',
  difficulty: 'easy',
  lessons: ['one'],
  topics: ['hashing'],
  lists: ['list-75'],
  hints: ['Think about complements.'],
};

it('matches citations to registered source prefixes', () => {
  expect(sourceForUrl('https://spec.example.net/arrays', sources)?.id).toBe(
    'spec',
  );
  expect(sourceForUrl('https://leetcode.com/problems/x/', sources)?.id).toBe(
    'leetcode',
  );
  expect(sourceForUrl('https://leetcode.com/discuss/', sources)).toBe(
    undefined,
  );
});

it('requires lesson citations and problems to use registered sources and lists', () => {
  const cited = (url: string): LessonReference[] => [
    { ...lessons[0]!, data: { ...lessons[0]!.data, sources: [{ url }] } },
    lessons[1]!,
  ];
  expect(() =>
    check(cited('https://spec.example.net/x'), [path], { sources }),
  ).not.toThrow();
  expect(() =>
    check(cited('https://unknown.example.net/x'), [path], { sources }),
  ).toThrow('Unregistered source');
  expect(() =>
    check(lessons, [path], { sources, problems: [problem] }),
  ).not.toThrow();
  expect(() =>
    check(lessons, [path], {
      sources,
      problems: [{ ...problem, lessons: ['missing'] }],
    }),
  ).toThrow('Invalid problem lesson');
  expect(() =>
    check(lessons, [path], {
      sources,
      problems: [{ ...problem, lists: ['spec'] }],
    }),
  ).toThrow('Unknown problem list');
  expect(() =>
    check(lessons, [path], {
      sources,
      problems: [{ ...problem, url: 'https://elsewhere.example.net/p' }],
    }),
  ).toThrow('Unregistered problem source');
  expect(() =>
    check(lessons, [path], { sources, problems: [problem, problem] }),
  ).toThrow('Duplicate problem');
});

it('rejects repeated interview questions within a lesson', () => {
  const question = { prompt: 'Why is indexed access constant time?' };
  expect(() =>
    check(
      [
        {
          ...lessons[0]!,
          data: {
            ...lessons[0]!.data,
            interviewQuestions: [question, question],
          },
        },
        lessons[1]!,
      ],
      [path],
    ),
  ).toThrow('Duplicate interview question');
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
