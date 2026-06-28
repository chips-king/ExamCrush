import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { apiError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { importPreviewSchema } from "@/lib/schemas";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const adminError = requireAdmin(request);
    if (adminError) return adminError;

    const preview = importPreviewSchema.parse(await request.json());

    const course = await prisma.$transaction(async (tx) => {
      const createdCourse = await tx.course.create({
        data: {
          name: preview.course.name,
          description: preview.course.description
        }
      });

      for (const chapter of preview.chapters) {
        const createdChapter = await tx.chapter.create({
          data: {
            courseId: createdCourse.id,
            title: chapter.title,
            order: chapter.order
          }
        });

        if (chapter.questions.length > 0) {
          await tx.question.createMany({
            data: chapter.questions.map((question) => ({
              chapterId: createdChapter.id,
              type: question.type,
              content: question.content,
              options: question.options,
              answer: question.answer,
              analysis: question.analysis,
              order: question.order
            }))
          });
        }
      }

      return createdCourse;
    });

    return NextResponse.json({ ok: true, courseId: course.id });
  } catch (error) {
    return apiError(error, "确认导入失败。");
  }
}
