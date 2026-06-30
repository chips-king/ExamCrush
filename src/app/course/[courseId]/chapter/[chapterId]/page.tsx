import { notFound } from "next/navigation";
import { ChapterQuestionsClient } from "@/components/ChapterQuestionsClient";
import { EmptyState, PageTitle } from "@/components/ui";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function normalizeOptions(options: unknown): string[] {
  if (!Array.isArray(options)) return [];
  return options.filter((option): option is string => typeof option === "string");
}

export default async function ChapterPage({
  params,
  searchParams
}: {
  params: Promise<{ courseId: string; chapterId: string }>;
  searchParams?: Promise<{ question?: string }>;
}) {
  const { courseId, chapterId } = await params;
  const { question: initialQuestionId } = (await searchParams) ?? {};
  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
    include: {
      course: true,
      questions: { orderBy: { order: "asc" } }
    }
  });

  if (!chapter || chapter.courseId !== courseId) notFound();

  return (
    <div>
      <PageTitle
        eyebrow={chapter.course.name}
        title={chapter.title}
        description={`本章共 ${chapter.questions.length} 题，可按题型筛选。`}
      />

      {chapter.questions.length === 0 ? (
        <EmptyState>这个章节还没有题目。</EmptyState>
      ) : (
        <ChapterQuestionsClient
          courseHref={`/course/${chapter.courseId}`}
          initialQuestionId={initialQuestionId}
          questions={chapter.questions.map((question) => ({
            id: question.id,
            type: question.type,
            content: question.content,
            options: normalizeOptions(question.options),
            answer: question.answer,
            analysis: question.analysis,
            order: question.order,
            chapter: {
              id: chapter.id,
              title: chapter.title,
              course: {
                id: chapter.course.id,
                name: chapter.course.name
              }
            }
          }))}
        />
      )}
    </div>
  );
}
