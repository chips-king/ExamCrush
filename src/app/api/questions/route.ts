import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { questionInputSchema } from "@/lib/schemas";

export async function POST(request: NextRequest) {
  const adminError = requireAdmin(request);
  if (adminError) return adminError;

  const body = questionInputSchema.parse(await request.json());
  const question = await prisma.question.create({ data: body });

  return NextResponse.json(question, { status: 201 });
}
