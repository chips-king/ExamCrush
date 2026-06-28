import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { courseInputSchema } from "@/lib/schemas";

export const dynamic = "force-dynamic";

export async function GET() {
  const courses = await prisma.course.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      chapters: {
        orderBy: { order: "asc" },
        include: { _count: { select: { questions: true } } }
      }
    }
  });

  return NextResponse.json(courses);
}

export async function POST(request: NextRequest) {
  const adminError = requireAdmin(request);
  if (adminError) return adminError;

  const body = courseInputSchema.parse(await request.json());
  const course = await prisma.course.create({ data: body });

  return NextResponse.json(course, { status: 201 });
}
