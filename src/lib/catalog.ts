import { getCollection } from 'astro:content';
import { paths } from '../data/paths';
import { validateCatalog } from './path-model';

export async function getCatalog() {
  const lessons = await getCollection('lessons');
  validateCatalog(lessons, paths);
  return { lessons, paths };
}
