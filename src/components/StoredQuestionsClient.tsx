"use client";

import { useEffect, useMemo, useState } from "react";
import { LatexText } from "@/components/LatexText";
import {
  PracticeQuestion,
  QuestionPracticeClient
} from "@/components/QuestionPracticeClient";
import { EmptyState, Panel } from "@/components/ui";
import { readJsonResponse } from "@/lib/client-json";

type StoredQuestion = PracticeQuestion;

type StoredQuestionsResponse = {
  questions: StoredQuestion[];
};

const typeLabels: Record<StoredQuestion["type"], string> = {
  single: "单选题",
  blank: "填空题",
  short: "简答题",
  code: "编程题"
};

export function StoredQuestionsClient({
  storageKey,
  emptyText
}: {
  storageKey: "examcrush:favorites" | "examcrush:mistakes";
  emptyText: string;
}) {
  const [ids, setIds] = useState<string[]>([]);
  const [questions, setQuestions] = useState<StoredQuestion[]>([]);
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey);
      const parsed = saved ? (JSON.parse(saved) as unknown) : [];
      setIds(Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : []);
    } catch {
      setIds([]);
    }
  }, [storageKey]);

  useEffect(() => {
    if (ids.length === 0) {
      setQuestions([]);
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    setMessage("");

    fetch(`/api/questions/lookup?ids=${encodeURIComponent(ids.join(","))}`, {
      cache: "no-store"
    })
      .then(readJsonResponse)
      .then((data: StoredQuestionsResponse) => {
        if (!active) return;
        setQuestions(data.questions);
        setActiveQuestionId((current) =>
          current && data.questions.some((question) => question.id === current)
            ? current
            : null
        );
      })
      .catch((error: unknown) => {
        if (!active) return;
        setMessage(error instanceof Error ? error.message : "读取题目失败。");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [ids]);

  const missingCount = useMemo(
    () => Math.max(0, ids.length - questions.length),
    [ids.length, questions.length]
  );
  const activeIndex = activeQuestionId
    ? questions.findIndex((question) => question.id === activeQuestionId)
    : -1;
  const activeQuestion = activeIndex >= 0 ? questions[activeIndex] : null;
  const previousId = activeIndex > 0 ? questions[activeIndex - 1].id : null;
  const nextId =
    activeIndex >= 0 && activeIndex < questions.length - 1
      ? questions[activeIndex + 1].id
      : null;

  function removeQuestion(id: string) {
    const next = ids.filter((item) => item !== id);
    setIds(next);
    setQuestions((current) => current.filter((question) => question.id !== id));
    setActiveQuestionId((current) => (current === id ? null : current));
    window.localStorage.setItem(storageKey, JSON.stringify(next));
  }

  function openQuestion(id: string) {
    setActiveQuestionId(id);
  }

  if (loading) {
    return <EmptyState>正在读取题目...</EmptyState>;
  }

  if (message) {
    return <EmptyState>{message}</EmptyState>;
  }

  if (questions.length === 0) {
    return <EmptyState>{emptyText}</EmptyState>;
  }

  if (activeQuestion) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => setActiveQuestionId(null)}
          className="focus-ring rounded-md border border-line bg-white px-4 py-2 text-sm font-bold hover:border-mint"
        >
          返回列表
        </button>

        <QuestionPracticeClient
          question={activeQuestion}
          previousId={previousId}
          nextId={nextId}
          onPrevious={() => previousId && openQuestion(previousId)}
          onNext={() => nextId && openQuestion(nextId)}
          onReturnToChapter={() => setActiveQuestionId(null)}
          returnLabel="返回列表"
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {missingCount > 0 ? (
        <div className="rounded-md border border-line bg-white/70 px-4 py-3 text-sm text-ink/60">
          有 {missingCount} 道已保存题目不存在，可能已被后台删除。
        </div>
      ) : null}

      <div className="grid gap-4">
        {questions.map((question) => (
          <Panel key={question.id} className="transition hover:border-mint">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <button
                type="button"
                onClick={() => openQuestion(question.id)}
                className="min-w-0 flex-1 text-left"
              >
                <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-bold text-ink/55">
                  <span>{question.chapter.course.name}</span>
                  <span>/</span>
                  <span>{question.chapter.title}</span>
                  <span className="rounded bg-paper px-2 py-1 text-ink/70">
                    #{question.order}
                  </span>
                  <span className="rounded bg-mint/10 px-2 py-1 text-mint">
                    {typeLabels[question.type]}
                  </span>
                </div>
                <LatexText
                  text={question.content}
                  className="line-clamp-3 text-sm font-semibold leading-6 text-ink"
                />
              </button>

              <button
                type="button"
                onClick={() => removeQuestion(question.id)}
                className="focus-ring shrink-0 rounded-md border border-line bg-white px-3 py-2 text-sm font-bold text-ink/70 transition hover:border-tomato hover:text-tomato"
              >
                移除
              </button>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
