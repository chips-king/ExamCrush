import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

type Params = Promise<{ id: string }>;

export async function DELETE(request: NextRequest, context: { params: Params }) {
  const adminError = requireAdmin(request);
  if (adminError) return adminError;

  const { id } = await context.params;
  await prisma.chapter.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
