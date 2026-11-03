import { z } from 'astro/zod';
import { iconNames } from './icons';

// Schemas for the YAML data collections. One file per entity; the filename is its ID.
export const slug = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase kebab-case');
export const lessonId = z
  .string()
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)+$/,
    'Use a subject/slug lesson ID',
  );

export const tones = [
  'blue',
  'violet',
  'teal',
  'amber',
  'rose',
  'green',
] as const;
export type Tone = (typeof tones)[number];

export const categorySchema = z.object({
  title: z.string().min(2),
  description: z.string().min(10),
  parent: slug.optional(),
});

export const subjectSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(10),
  category: slug,
  icon: z.enum(iconNames).default('book-open'),
  tone: z.enum(tones).default('blue'),
});

// `planned` holds owner-approved topic titles that do not have a lesson yet.
const planned = z.array(z.string().min(3)).default([]);
const sectionSchema = z.object({
  id: slug,
  title: z.string().min(2),
  lessons: z.array(lessonId).default([]),
  planned,
});

export const pathSchema = z
  .object({
    title: z.string().min(2),
    description: z.string().min(10),
    subject: slug,
    order: z.number().int().default(100),
    lessons: z.array(lessonId).optional(),
    planned: z.array(z.string().min(3)).optional(),
    sections: z.array(sectionSchema).min(1).optional(),
  })
  .superRefine((path, context) => {
    if ((path.lessons === undefined) === (path.sections === undefined))
      context.addIssue({
        code: 'custom',
        message: 'A path uses either lessons or sections.',
      });
    if (path.sections && path.planned)
      context.addIssue({
        code: 'custom',
        message: 'Put planned topics inside the relevant section.',
      });
  });

export const sourceKinds = [
  'specification',
  'documentation',
  'book',
  'course',
  'reference',
  'guide',
  'problem-bank',
  'problem-list',
] as const;

export const sourceSchema = z.object({
  name: z.string().min(2),
  kind: z.enum(sourceKinds),
  by: z.string().min(2).optional(),
  url: z.url(),
  // Citations must start with one of these. Defaults to `url`.
  prefixes: z.array(z.url()).min(1).optional(),
  description: z.string().min(10),
});

export const problemSchema = z.object({
  title: z.string().min(2),
  url: z.url(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  lessons: z.array(lessonId).min(1),
  topics: z.array(slug).default([]),
  lists: z.array(slug).default([]),
  hints: z.array(z.string().min(10)).min(1).max(4),
});
