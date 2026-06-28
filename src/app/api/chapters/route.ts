import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { chapterInputSchema } from "@/lib/schemas";

export async function POST(request: NextRequest) {
  const adminError = requireAdmin(request);
  if (adminError) return adminError;

  const body = chapterInputSchema.parse(await request.json());
  const chapter = await prisma.chapter.create({ data: body });

  return NextResponse.json(chapter, { status: 201 });
}
