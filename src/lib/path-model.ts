import type { LearningPath, PathSection } from '../data/paths';
import {
  categories as defaultCategories,
  subjects as defaultSubjects,
  type Category,
  type Subject,
} from '../data/taxonomy';

export interface LessonReference {
  id: string;
  data: { path?: string; subject: string; prerequisites: string[] };
}

export const lessonUrl = (id: string, pathId?: string) =>
  `/learn/${id}/${pathId ? `?path=${encodeURIComponent(pathId)}` : ''}`;
export const pathUrl = (id: string) => `/paths/${id}/`;
export const subjectUrl = (id: string) => `/subjects/${id}/`;

export function pathSections(path: LearningPath): PathSection[] {
  return (
    path.sections ?? [
      { id: 'lessons', title: 'Lessons', lessons: path.lessons },
    ]
  );
}

export function pathLessonIds(path: LearningPath): string[] {
  return pathSections(path).flatMap((section) => section.lessons);
}

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

export function subjectsInCategory(
  id: string,
  subjects: Subject[],
  categories: Category[],
): Subject[] {
  return subjects.filter((subject) =>
    categoryAncestors(subject.category, categories).some(
      (category) => category.id === id,
    ),
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

export function validateCatalog(
  lessons: LessonReference[],
  paths: LearningPath[],
  subjects: Subject[] = defaultSubjects,
  categories: Category[] = defaultCategories,
) {
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
      lesson.data.path &&
      !paths.some(
        (path) =>
          path.id === lesson.data.path &&
          pathLessonIds(path).includes(lesson.id),
      )
    )
      throw new Error(`Invalid default path reference: ${lesson.id}`);
    if (
      new Set(lesson.data.prerequisites).size !==
      lesson.data.prerequisites.length
    )
      throw new Error(`Duplicate prerequisite: ${lesson.id}`);
    visit(lesson.id);
  }
}

export function neighbors(ids: string[], id: string) {
  const index = ids.indexOf(id);
  return index < 0 ? {} : { previous: ids[index - 1], next: ids[index + 1] };
}
