import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function normalizeOptions(options: unknown): string[] {
  if (!Array.isArray(options)) return [];
  return options.filter((option): option is string => typeof option === "string");
}

export async function GET(request: NextRequest) {
  const ids = request.nextUrl.searchParams
    .get("ids")
    ?.split(",")
    .map((id) => id.trim())
    .filter(Boolean)
    .slice(0, 200);

  if (!ids?.length) {
    return NextResponse.json({ questions: [] });
  }

  const questions = await prisma.question.findMany({
    where: { id: { in: ids } },
    include: {
      chapter: {
        include: {
          course: true
        }
      }
    }
  });

  const order = new Map(ids.map((id, index) => [id, index]));

  return NextResponse.json({
    questions: questions
      .sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0))
      .map((question) => ({
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
      }))
  });
}
