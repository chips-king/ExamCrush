import { notFound } from "next/navigation";
import { QuestionPracticeClient } from "@/components/QuestionPracticeClient";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function normalizeOptions(options: unknown): string[] {
  if (!Array.isArray(options)) return [];
  return options.filter((option): option is string => typeof option === "string");
}

export default async function QuestionPage({
  params
}: {
  params: Promise<{ questionId: string }>;
}) {
  const { questionId } = await params;
  const question = await prisma.question.findUnique({
    where: { id: questionId },
    include: {
      chapter: {
        include: {
          course: true,
          questions: { orderBy: { order: "asc" } }
        }
      }
    }
  });

  if (!question) notFound();

  const siblings = question.chapter.questions;
  const currentIndex = siblings.findIndex((item) => item.id === question.id);
  const previousId = currentIndex > 0 ? siblings[currentIndex - 1].id : null;
  const nextId =
    currentIndex >= 0 && currentIndex < siblings.length - 1
      ? siblings[currentIndex + 1].id
      : null;

  return (
    <QuestionPracticeClient
      previousId={previousId}
      nextId={nextId}
      question={{
        id: question.id,
        type: question.type,
        content: question.content,
        options: normalizeOptions(question.options),
        answer: question.answer,
        analysis: question.analysis,
        order: question.order,
        chapter: {
          id: question.chapter.id,
          title: question.chapter.title,
          course: {
            id: question.chapter.course.id,
            name: question.chapter.course.name
          }
        }
      }}
    />
  );
}
