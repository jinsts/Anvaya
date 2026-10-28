import { getCollection } from 'astro:content';
import { paths } from '../data/paths';
import { categories, subjects } from '../data/taxonomy';
import { pathLessonIds, validateCatalog } from './path-model';

export async function getCatalog() {
  const lessons = await getCollection('lessons');
  validateCatalog(lessons, paths, subjects, categories);
  const availableSubjects = subjects.filter(
    (subject) =>
      lessons.some((lesson) => lesson.data.subject === subject.id) ||
      paths.some(
        (path) => path.subject === subject.id && pathLessonIds(path).length > 0,
      ),
  );
  return { lessons, paths, categories, subjects, availableSubjects };
}
