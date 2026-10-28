import type { LearningPath } from '../data/paths';

export interface LessonReference {
  id: string;
  data: { path: string; subject: string; prerequisites: string[] };
}

export const lessonUrl = (id: string) => `/learn/${id}/`;
export const pathUrl = (id: string) => `/paths/${id}/`;

export function validateCatalog(
  lessons: LessonReference[],
  paths: LearningPath[],
) {
  const byId = new Map(lessons.map((lesson) => [lesson.id, lesson]));
  if (byId.size !== lessons.length) throw new Error('Duplicate lesson ID');
  if (new Set(paths.map((path) => path.id)).size !== paths.length)
    throw new Error('Duplicate path ID');
  const assigned = new Set<string>();
  for (const path of paths) {
    if (!/^[a-z0-9-]+$/.test(path.id))
      throw new Error(`Invalid path ID: ${path.id}`);
    if (new Set(path.lessons).size !== path.lessons.length)
      throw new Error('Duplicate path entry');
    for (const id of path.lessons) {
      const lesson = byId.get(id);
      if (
        !lesson ||
        lesson.data.path !== path.id ||
        lesson.data.subject !== path.subject
      ) {
        throw new Error(`Invalid path reference: ${id}`);
      }
      assigned.add(id);
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
    if (!/^[a-z0-9-]+(?:\/[a-z0-9-]+)*$/.test(lesson.id))
      throw new Error(`Invalid lesson ID: ${lesson.id}`);
    if (!assigned.has(lesson.id))
      throw new Error(`Orphaned lesson: ${lesson.id}`);
    visit(lesson.id);
  }
}

export function neighbors(ids: string[], id: string) {
  const index = ids.indexOf(id);
  return index < 0 ? {} : { previous: ids[index - 1], next: ids[index + 1] };
}
