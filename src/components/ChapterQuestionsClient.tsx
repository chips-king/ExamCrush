"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { LatexText } from "@/components/LatexText";
import { EmptyState } from "@/components/ui";
import { questionTypes } from "@/lib/schemas";

type Question = {
  id: string;
  type: (typeof questionTypes)[number];
  content: string;
  order: number;
};

const typeLabels: Record<Question["type"], string> = {
  single: "单选",
  blank: "填空",
  short: "简答",
  code: "编程"
};

export function ChapterQuestionsClient({ questions }: { questions: Question[] }) {
  const [type, setType] = useState<"all" | Question["type"]>("all");

  const filtered = useMemo(() => {
    if (type === "all") return questions;
    return questions.filter((question) => question.type === type);
  }, [questions, type]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {["all", ...questionTypes].map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setType(item as typeof type)}
            className={`focus-ring rounded-md border px-3 py-2 text-sm font-bold transition ${
              type === item
                ? "border-ink bg-ink text-white"
                : "border-line bg-white text-ink/70 hover:border-mint hover:text-ink"
            }`}
          >
            {item === "all" ? "全部" : typeLabels[item as Question["type"]]}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState>当前筛选下暂无题目。</EmptyState>
      ) : (
        <div className="divide-y divide-line overflow-hidden rounded-lg border border-line bg-white">
          {filtered.map((question) => (
            <Link
              key={question.id}
              href={`/question/${question.id}`}
              className="block p-4 transition hover:bg-paper"
            >
              <div className="mb-2 flex items-center gap-2 text-xs font-bold text-ink/50">
                <span>#{question.order}</span>
                <span className="rounded bg-paper px-2 py-1 text-ink/70">
                  {typeLabels[question.type]}
                </span>
              </div>
              <LatexText
                text={question.content}
                className="line-clamp-2 text-sm font-semibold leading-6 text-ink"
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
