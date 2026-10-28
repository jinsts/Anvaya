import { z } from 'astro/zod';

export const lessonSchema = z
  .object({
    title: z.string().min(3),
    summary: z.string().min(15),
    subject: z.string().min(2),
    path: z.string().min(2),
    difficulty: z.enum(['foundation', 'intermediate', 'advanced']),
    estimatedMinutes: z.number().int().positive(),
    learningObjectives: z.array(z.string().min(5)).min(1),
    prerequisites: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    status: z.enum(['draft', 'reviewed', 'published']).default('draft'),
    reviewedAt: z.coerce.date().optional(),
    sources: z
      .array(z.object({ label: z.string().min(3), url: z.url() }))
      .min(1),
  })
  .superRefine((lesson, context) => {
    if (lesson.status !== 'draft' && !lesson.reviewedAt) {
      context.addIssue({
        code: 'custom',
        message: 'Reviewed/published lessons require reviewedAt.',
      });
    }
    if (
      lesson.sources.some((source) =>
        /example\.(org|com)|replace-before/i.test(source.url),
      )
    ) {
      context.addIssue({
        code: 'custom',
        message: 'Replace placeholder sources.',
      });
    }
  });
