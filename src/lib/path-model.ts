export interface Category {
  id: string;
  title: string;
  description: string;
  parent?: string;
}

export interface Subject {
  id: string;
  title: string;
  description: string;
  category: string;
  icon?: string;
  tone?: string;
}

export interface PathSection {
  id: string;
  title: string;
  lessons: string[];
  planned?: string[];
}

interface LearningPathDetails {
  id: string;
  title: string;
  description: string;
  subject: string;
  order?: number;
}

// Store order once: a short path can be flat, a longer path can group its lessons.
export type LearningPath = LearningPathDetails &
  (
    | { lessons: string[]; planned?: string[]; sections?: never }
    | { sections: PathSection[]; lessons?: never; planned?: never }
  );

export interface Source {
  id: string;
  name: string;
  kind: string;
  by?: string;
  url: string;
  prefixes?: string[];
}

export interface Problem {
  id: string;
  title: string;
  url: string;
  difficulty: 'easy' | 'medium' | 'hard';
  lessons: string[];
  topics: string[];
  lists: string[];
  hints: string[];
}

export interface LessonReference {
  id: string;
  data: {
    path?: string;
    subject: string;
    prerequisites: string[];
    sources?: { url: string }[];
    interviewQuestions?: { prompt: string }[];
  };
}

export interface CatalogInput {
  lessons: LessonReference[];
  paths: LearningPath[];
  subjects: Subject[];
  categories: Category[];
  sources?: Source[];
  problems?: Problem[];
}

export const lessonUrl = (id: string, pathId?: string) =>
  `/learn/${id}/${pathId ? `?path=${encodeURIComponent(pathId)}` : ''}`;
export const pathUrl = (id: string) => `/paths/${id}/`;
export const subjectUrl = (id: string) => `/subjects/${id}/`;
export const categoryUrl = (id: string) =>
  `/explore/?category=${encodeURIComponent(id)}`;

export function pathSections(path: LearningPath): PathSection[] {
  return (
    path.sections ?? [
      {
        id: 'lessons',
        title: 'Lessons',
        lessons: path.lessons,
        planned: path.planned ?? [],
      },
    ]
  );
}

export function pathLessonIds(path: LearningPath): string[] {
  return pathSections(path).flatMap((section) => section.lessons);
}

export const plannedCount = (path: LearningPath) =>
  pathSections(path).reduce(
    (count, section) => count + (section.planned?.length ?? 0),
    0,
  );

/** Root-first category trail, including the selected category. */
export function categoryAncestors(
  id: string,
  categories: Category[],
): Category[] {
  const byId = new Map(categories.map((category) => [category.id, category]));
  const trail: Category[] = [];
  const seen = new Set<string>();
  let current: string | undefined = id;
  while (current) {
    if (seen.has(current)) throw new Error(`Category cycle: ${current}`);
    seen.add(current);
    const category = byId.get(current);
    if (!category) throw new Error(`Missing category reference: ${current}`);
    trail.unshift(category);
    current = category.parent;
  }
  return trail;
}

export function subjectsInCategory<T extends Subject>(
  id: string,
  subjects: T[],
  categories: Category[],
): T[] {
  return subjects.filter((subject) =>
    categoryAncestors(subject.category, categories).some(
      (category) => category.id === id,
    ),
  );
}

/** The registered source whose prefix matches a citation URL, if any. */
export function sourceForUrl(url: string, sources: Source[]) {
  return sources.find((source) =>
    (source.prefixes ?? [source.url]).some((prefix) => url.startsWith(prefix)),
  );
}

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const lessonIdPattern =
  /^[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*$/;

function assertUniqueIds(items: { id: string }[], kind: string) {
  if (new Set(items.map((item) => item.id)).size !== items.length)
    throw new Error(`Duplicate ${kind} ID`);
  for (const item of items) {
    if (!slugPattern.test(item.id))
      throw new Error(`Invalid ${kind} ID: ${item.id}`);
  }
}

export function validateTaxonomy(categories: Category[], subjects: Subject[]) {
  assertUniqueIds(categories, 'category');
  assertUniqueIds(subjects, 'subject');
  for (const category of categories) categoryAncestors(category.id, categories);
  for (const subject of subjects) {
    if (!categories.some((category) => category.id === subject.category))
      throw new Error(
        `Missing subject category reference: ${subject.category}`,
      );
  }
}

export function validateCatalog({
  lessons,
  paths,
  subjects,
  categories,
  sources = [],
  problems = [],
}: CatalogInput) {
  validateTaxonomy(categories, subjects);
  const subjectIds = new Set(subjects.map((subject) => subject.id));
  const byId = new Map(lessons.map((lesson) => [lesson.id, lesson]));
  if (byId.size !== lessons.length) throw new Error('Duplicate lesson ID');
  assertUniqueIds(paths, 'path');
  for (const path of paths) {
    if (!subjectIds.has(path.subject))
      throw new Error(`Missing path subject reference: ${path.subject}`);
    if ((path.lessons !== undefined) === (path.sections !== undefined))
      throw new Error(`Path must use either lessons or sections: ${path.id}`);
    const sections = pathSections(path);
    assertUniqueIds(sections, 'section');
    for (const section of sections) {
      if (!section.lessons.length && !section.planned?.length)
        throw new Error(`Empty path section: ${path.id}/${section.id}`);
    }
    const ids = pathLessonIds(path);
    if (new Set(ids).size !== ids.length)
      throw new Error('Duplicate path entry');
    for (const id of ids) {
      if (!byId.has(id)) throw new Error(`Invalid path reference: ${id}`);
    }
  }
  const visiting = new Set<string>();
  const visited = new Set<string>();
  function visit(id: string) {
    if (visiting.has(id)) throw new Error(`Prerequisite cycle: ${id}`);
    if (visited.has(id)) return;
    const lesson = byId.get(id);
    if (!lesson) throw new Error(`Missing prerequisite: ${id}`);
    visiting.add(id);
    lesson.data.prerequisites.forEach(visit);
    visiting.delete(id);
    visited.add(id);
  }
  for (const lesson of lessons) {
    if (!lessonIdPattern.test(lesson.id))
      throw new Error(`Invalid lesson ID: ${lesson.id}`);
    if (!subjectIds.has(lesson.data.subject))
      throw new Error(
        `Missing lesson subject reference: ${lesson.data.subject}`,
      );
    if (
      lesson.id.includes('/') &&
      !lesson.id.startsWith(`${lesson.data.subject}/`)
    )
      throw new Error(`Lesson folder must match its subject: ${lesson.id}`);
    if (
      lesson.data.path &&
      !paths.some(
        (path) =>
          path.id === lesson.data.path &&
          pathLessonIds(path).includes(lesson.id),
      )
    )
      throw new Error(
        `Lesson ${lesson.id} names default path "${lesson.data.path}" but is not in it. Add it to that path's lessons.`,
      );
    if (
      new Set(lesson.data.prerequisites).size !==
      lesson.data.prerequisites.length
    )
      throw new Error(`Duplicate prerequisite: ${lesson.id}`);
    const prompts = (lesson.data.interviewQuestions ?? []).map(
      (question) => question.prompt,
    );
    if (new Set(prompts).size !== prompts.length)
      throw new Error(`Duplicate interview question: ${lesson.id}`);
    if (sources.length) {
      for (const { url } of lesson.data.sources ?? []) {
        if (!sourceForUrl(url, sources))
          throw new Error(`Unregistered source in ${lesson.id}: ${url}`);
      }
    }
    visit(lesson.id);
  }
  validateProblems(problems, byId, sources);
}

function validateProblems(
  problems: Problem[],
  lessons: Map<string, LessonReference>,
  sources: Source[],
) {
  assertUniqueIds(problems, 'problem');
  const lists = new Set(
    sources
      .filter((source) => source.kind === 'problem-list')
      .map((source) => source.id),
  );
  for (const problem of problems) {
    for (const id of problem.lessons) {
      if (!lessons.has(id))
        throw new Error(`Invalid problem lesson: ${problem.id} → ${id}`);
    }
    for (const id of problem.lists) {
      if (!lists.has(id))
        throw new Error(`Unknown problem list: ${problem.id} → ${id}`);
    }
    if (sources.length && !sourceForUrl(problem.url, sources))
      throw new Error(`Unregistered problem source: ${problem.url}`);
  }
}

export function neighbors(ids: string[], id: string) {
  const index = ids.indexOf(id);
  return index < 0 ? {} : { previous: ids[index - 1], next: ids[index + 1] };
}
