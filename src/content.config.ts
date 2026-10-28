import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { lessonSchema } from './lib/lesson-schema';

export const collections = {
  lessons: defineCollection({
    loader: glob({ base: './src/content/lessons', pattern: '**/*.mdx' }),
    schema: lessonSchema,
  }),
};
