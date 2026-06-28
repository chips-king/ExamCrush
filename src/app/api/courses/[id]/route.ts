import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

export async function GET(_request: NextRequest, context: { params: Params }) {
  const { id } = await context.params;
  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      chapters: {
        orderBy: { order: "asc" },
        include: {
          questions: {
            orderBy: { order: "asc" }
          },
          _count: { select: { questions: true } }
        }
      }
    }
  });

  if (!course) {
    return NextResponse.json({ error: "课程不存在。" }, { status: 404 });
  }

  return NextResponse.json(course);
}

export async function DELETE(request: NextRequest, context: { params: Params }) {
  const adminError = requireAdmin(request);
  if (adminError) return adminError;

  const { id } = await context.params;
  await prisma.course.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
