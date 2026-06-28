import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function apiError(error: unknown, fallback = "请求失败。", status = 500) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: "数据格式不正确。", details: error.flatten() },
      { status: 400 }
    );
  }

  if (error instanceof Error) {
    return NextResponse.json({ error: error.message || fallback }, { status });
  }

  return NextResponse.json({ error: fallback }, { status });
}
