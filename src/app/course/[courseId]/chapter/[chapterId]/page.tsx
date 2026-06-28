import { notFound } from "next/navigation";
import { ChapterQuestionsClient } from "@/components/ChapterQuestionsClient";
import { ButtonLink, EmptyState, PageTitle } from "@/components/ui";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ChapterPage({
  params
}: {
  params: Promise<{ courseId: string; chapterId: string }>;
}) {
  const { courseId, chapterId } = await params;
  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
    include: {
      course: true,
      questions: { orderBy: { order: "asc" } }
    }
  });

  if (!chapter || chapter.courseId !== courseId) notFound();

  const firstQuestion = chapter.questions[0];

  return (
    <div>
      <PageTitle
        eyebrow={chapter.course.name}
        title={chapter.title}
        description={`本章共 ${chapter.questions.length} 题，可按题型筛选。`}
      />

      <div className="mb-5 flex flex-wrap gap-2">
        <ButtonLink href={`/course/${chapter.courseId}`} tone="plain">
          返回课程
        </ButtonLink>
        {firstQuestion ? (
          <ButtonLink href={`/question/${firstQuestion.id}`}>从第一题开始</ButtonLink>
        ) : null}
      </div>

      {chapter.questions.length === 0 ? (
        <EmptyState>这个章节还没有题目。</EmptyState>
      ) : (
        <ChapterQuestionsClient
          questions={chapter.questions.map((question) => ({
            id: question.id,
            type: question.type,
            content: question.content,
            order: question.order
          }))}
        />
      )}
    </div>
  );
}
