import { jsonrepair } from "jsonrepair";
import { importPreviewSchema } from "@/lib/schemas";

function extractJson(content: string) {
  const fenced = content.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced?.[1] ?? content;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("DeepSeek 未返回有效 JSON。");
  }

  const jsonText = candidate.slice(start, end + 1);

  try {
    return JSON.parse(jsonText);
  } catch {
    return JSON.parse(jsonrepair(jsonText));
  }
}

export async function parseQuestionsWithDeepSeek(pdfText: string) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  const model = process.env.DEEPSEEK_MODEL || "deepseek-v4-flash";

  if (!apiKey) {
    throw new Error("DEEPSEEK_API_KEY is not configured.");
  }

  const response = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      temperature: 0.1,
      response_format: { type: "json_object" },
      thinking: { type: "disabled" },
      messages: [
        {
          role: "system",
          content:
            "你是题库结构化助手。只输出严格 JSON，不要输出 Markdown。不要省略逗号，不要写注释。type 只能是 single、blank、short、code。"
        },
        {
          role: "user",
          content: `请把下面 PDF 文本整理为题库 JSON，格式必须为：
{
  "course": {"name": "课程名称", "description": "课程描述"},
  "chapters": [
    {
      "title": "章节名称",
      "order": 1,
      "questions": [
        {
          "type": "single",
          "order": 1,
          "content": "题目内容",
          "options": ["A.xxx", "B.xxx", "C.xxx", "D.xxx"],
          "answer": "B",
          "analysis": "解析内容"
        }
      ]
    }
  ]
}

PDF 文本：
${pdfText.slice(0, 55000)}`
        }
      ]
    })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`DeepSeek 请求失败：${response.status} ${body}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;

  if (typeof content !== "string" || !content.trim()) {
    throw new Error("DeepSeek 返回内容为空。");
  }

  return importPreviewSchema.parse(extractJson(content));
}
