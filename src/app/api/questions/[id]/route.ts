import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { questionUpdateSchema } from "@/lib/schemas";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

export async function GET(_request: NextRequest, context: { params: Params }) {
  const { id } = await context.params;
  const question = await prisma.question.findUnique({
    where: { id },
    include: {
      chapter: {
        include: {
          course: true,
          questions: { orderBy: { order: "asc" } }
        }
      }
    }
  });

  if (!question) {
    return NextResponse.json({ error: "题目不存在。" }, { status: 404 });
  }

  const siblings = question.chapter.questions;
  const currentIndex = siblings.findIndex((item) => item.id === question.id);

  return NextResponse.json({
    question,
    previousId: currentIndex > 0 ? siblings[currentIndex - 1].id : null,
    nextId:
      currentIndex >= 0 && currentIndex < siblings.length - 1
        ? siblings[currentIndex + 1].id
        : null
  });
}

export async function PUT(request: NextRequest, context: { params: Params }) {
  const adminError = requireAdmin(request);
  if (adminError) return adminError;

  const { id } = await context.params;
  const body = questionUpdateSchema.parse(await request.json());
  const question = await prisma.question.update({
    where: { id },
    data: body
  });

  return NextResponse.json(question);
}

export async function DELETE(request: NextRequest, context: { params: Params }) {
  const adminError = requireAdmin(request);
  if (adminError) return adminError;

  const { id } = await context.params;
  await prisma.question.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
