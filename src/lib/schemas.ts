import { z } from "zod";

export const questionTypes = ["single", "blank", "short", "code"] as const;

export const questionInputSchema = z.object({
  chapterId: z.string().min(1),
  type: z.enum(questionTypes),
  content: z.string().min(1),
  options: z.array(z.string()).default([]),
  answer: z.string().default(""),
  analysis: z.string().default(""),
  order: z.coerce.number().int().positive().default(1)
});

export const questionUpdateSchema = questionInputSchema
  .omit({ chapterId: true })
  .partial()
  .extend({
    type: z.enum(questionTypes).optional(),
    options: z.array(z.string()).optional(),
    order: z.coerce.number().int().positive().optional()
  });

export const chapterInputSchema = z.object({
  courseId: z.string().min(1),
  title: z.string().min(1),
  order: z.coerce.number().int().positive().default(1)
});

export const courseInputSchema = z.object({
  name: z.string().min(1),
  description: z.string().default("")
});

export const importPreviewSchema = z.object({
  course: z.object({
    name: z.string().min(1),
    description: z.string().default("")
  }),
  chapters: z
    .array(
      z.object({
        title: z.string().min(1),
        order: z.coerce.number().int().positive().default(1),
        questions: z
          .array(
            z.object({
              type: z.enum(questionTypes),
              order: z.coerce.number().int().positive().default(1),
              content: z.string().min(1),
              options: z.array(z.string()).default([]),
              answer: z.string().default(""),
              analysis: z.string().default("")
            })
          )
          .default([])
      })
    )
    .default([])
});

export type ImportPreview = z.infer<typeof importPreviewSchema>;
