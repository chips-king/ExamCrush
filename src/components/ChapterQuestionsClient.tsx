"use client";

import { useEffect, useMemo, useState } from "react";
import { LatexText } from "@/components/LatexText";
import {
  PracticeQuestion,
  QuestionPracticeClient
} from "@/components/QuestionPracticeClient";
import { ButtonLink, EmptyState, Panel } from "@/components/ui";
import { questionTypes } from "@/lib/schemas";

type Question = PracticeQuestion;

const typeLabels: Record<Question["type"], string> = {
  single: "单选",
  blank: "填空",
  short: "简答",
  code: "编程"
};

export function ChapterQuestionsClient({
  courseHref,
  questions,
  initialQuestionId
}: {
  courseHref: string;
  questions: Question[];
  initialQuestionId?: string;
}) {
  const [type, setType] = useState<"all" | Question["type"]>("all");
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(() =>
    questions.some((question) => question.id === initialQuestionId)
      ? (initialQuestionId ?? null)
      : null
  );

  const filtered = useMemo(() => {
    if (type === "all") return questions;
    return questions.filter((question) => question.type === type);
  }, [questions, type]);

  const activeIndex = activeQuestionId
    ? questions.findIndex((question) => question.id === activeQuestionId)
    : -1;
  const activeQuestion = activeIndex >= 0 ? questions[activeIndex] : null;
  const previousId = activeIndex > 0 ? questions[activeIndex - 1].id : null;
  const nextId =
    activeIndex >= 0 && activeIndex < questions.length - 1
      ? questions[activeIndex + 1].id
      : null;
  const chapterHref = questions[0]
    ? `/course/${questions[0].chapter.course.id}/chapter/${questions[0].chapter.id}`
    : "";

  useEffect(() => {
    if (!chapterHref) return;

    const url = activeQuestionId
      ? `${chapterHref}?question=${activeQuestionId}`
      : chapterHref;
    window.history.replaceState(null, "", url);
  }, [activeQuestionId, chapterHref]);

  function openQuestion(id: string) {
    setActiveQuestionId(id);
  }

  if (activeQuestion) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col items-start gap-2">
          <ButtonLink href={courseHref} tone="plain">
            返回课程
          </ButtonLink>
          <button
            type="button"
            onClick={() => setActiveQuestionId(null)}
            className="focus-ring rounded-md border border-line bg-white px-4 py-2 text-sm font-bold hover:border-mint"
          >
            返回题目列表
          </button>
        </div>

        <QuestionPracticeClient
          question={activeQuestion}
          previousId={previousId}
          nextId={nextId}
          onPrevious={() => previousId && openQuestion(previousId)}
          onNext={() => nextId && openQuestion(nextId)}
          onReturnToChapter={() => setActiveQuestionId(null)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-start gap-2">
        <ButtonLink href={courseHref} tone="plain">
          返回课程
        </ButtonLink>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
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

        <button
          type="button"
          onClick={() => openQuestion(questions[0].id)}
          className="focus-ring rounded-md bg-ink px-4 py-2 text-sm font-black text-white transition hover:bg-mint"
        >
          从第一题开始
        </button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState>当前筛选下暂无题目。</EmptyState>
      ) : (
        <div className="grid gap-3">
          {filtered.map((question) => (
            <button
              key={question.id}
              type="button"
              onClick={() => openQuestion(question.id)}
              className="block text-left"
            >
              <Panel className="transition hover:border-mint hover:bg-white">
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
              </Panel>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
