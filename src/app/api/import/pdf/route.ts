import { NextRequest, NextResponse } from "next/server";
import pdfParse from "pdf-parse";
import { requireAdmin } from "@/lib/admin";
import { apiError } from "@/lib/api";
import { parseQuestionsWithDeepSeek } from "@/lib/deepseek";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const adminError = requireAdmin(request);
    if (adminError) return adminError;

    const form = await request.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "请上传 PDF 文件。" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const parsed = await pdfParse(buffer);
    const text = parsed.text?.trim() ?? "";

    if (text.length < 30) {
      return NextResponse.json(
        { error: "当前 PDF 可能是扫描版，暂不支持。" },
        { status: 400 }
      );
    }

    const preview = await parseQuestionsWithDeepSeek(text);

    return NextResponse.json(preview);
  } catch (error) {
    return apiError(
      error,
      "PDF 导入失败，请检查 PDF 内容或稍后重试。"
    );
  }
}
