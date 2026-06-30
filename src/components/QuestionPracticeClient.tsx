"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { LatexText } from "@/components/LatexText";
import { Panel } from "@/components/ui";

export type PracticeQuestion = {
  id: string;
  type: "single" | "blank" | "short" | "code";
  content: string;
  options: string[];
  answer: string;
  analysis: string;
  order: number;
  chapter: {
    id: string;
    title: string;
    course: {
      id: string;
      name: string;
    };
  };
};

const typeLabels: Record<PracticeQuestion["type"], string> = {
  single: "单选题",
  blank: "填空题",
  short: "简答题",
  code: "编程题"
};

function readJson<T>(storage: Storage, key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const value = storage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function getOptionKey(option: string) {
  return option.trim().match(/^([A-D])[\s.．、]/)?.[1] ?? "";
}

function getAnswerKey(answer: string) {
  return answer.trim().match(/^([A-D])/)?.[1] ?? "";
}

export function QuestionPracticeClient({
  question,
  previousId,
  nextId,
  onPrevious,
  onNext,
  onReturnToChapter,
  returnLabel = "返回章节"
}: {
  question: PracticeQuestion;
  previousId: string | null;
  nextId: string | null;
  onPrevious: () => void;
  onNext: () => void;
  onReturnToChapter: () => void;
  returnLabel?: string;
}) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [value, setValue] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState<string[]>([]);

  const favorite = favorites.includes(question.id);
  const mistake = mistakes.includes(question.id);
  const correctOptionKey = getAnswerKey(question.answer);
  const chapterHref = `/course/${question.chapter.course.id}/chapter/${question.chapter.id}`;

  useEffect(() => {
    setShowAnswer(false);
    setValue("");
    window.sessionStorage.removeItem("examcrush:progress");
    window.localStorage.removeItem("examcrush:progress");
    setFavorites(readJson<string[]>(window.localStorage, "examcrush:favorites", []));
    setMistakes(readJson<string[]>(window.localStorage, "examcrush:mistakes", []));
  }, [question.id]);

  const input = useMemo(() => {
    if (question.type === "single") {
      return (
        <div className="space-y-2">
          {question.options.map((option) => {
            const optionKey = getOptionKey(option);
            const isCorrect = showAnswer && optionKey === correctOptionKey;
            const isWrong =
              showAnswer && value === option && optionKey !== correctOptionKey;

            return (
              <label
                key={option}
                className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 transition ${
                  isCorrect
                    ? "border-mint bg-mint/15"
                    : isWrong
                      ? "border-tomato bg-tomato/10"
                      : value === option
                        ? "border-mint bg-mint/10"
                        : "border-line bg-white hover:border-mint"
                }`}
              >
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={value === option}
                  onChange={(event) => setValue(event.target.value)}
                  className="mt-1 text-mint focus:ring-mint"
                />
                <LatexText text={option} className="text-sm leading-6" />
              </label>
            );
          })}
        </div>
      );
    }

    if (question.type === "blank") {
      return (
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="写下你的答案"
          className="focus-ring w-full rounded-md border-line bg-white"
        />
      );
    }

    return (
      <textarea
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={question.type === "code" ? "写下代码思路或代码" : "写下你的回答"}
        rows={question.type === "code" ? 10 : 6}
        className="focus-ring w-full rounded-md border-line bg-white font-mono text-sm leading-6"
      />
    );
  }, [correctOptionKey, question, showAnswer, value]);

  function toggleStoredList(
    key: "examcrush:favorites" | "examcrush:mistakes",
    current: string[],
    setter: (items: string[]) => void
  ) {
    const next = current.includes(question.id)
      ? current.filter((id) => id !== question.id)
      : [...current, question.id];
    setter(next);
    window.localStorage.setItem(key, JSON.stringify(next));
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2 text-sm text-ink/60">
        <Link
          href={`/course/${question.chapter.course.id}`}
          className="font-bold text-mint hover:underline"
        >
          {question.chapter.course.name}
        </Link>
        <span>/</span>
        <Link
          href={chapterHref}
          className="font-bold text-mint hover:underline"
        >
          {question.chapter.title}
        </Link>
      </div>

      <Panel>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="rounded bg-paper px-2 py-1 text-xs font-black text-ink/70">
              #{question.order}
            </span>
            <span className="rounded bg-mint/10 px-2 py-1 text-xs font-black text-mint">
              {typeLabels[question.type]}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() =>
                toggleStoredList("examcrush:favorites", favorites, setFavorites)
              }
              className="focus-ring rounded-md border border-line bg-white px-3 py-2 text-sm font-bold hover:border-mint"
            >
              {favorite ? "已收藏" : "收藏"}
            </button>
            <button
              type="button"
              onClick={() =>
                toggleStoredList("examcrush:mistakes", mistakes, setMistakes)
              }
              className="focus-ring rounded-md border border-line bg-white px-3 py-2 text-sm font-bold hover:border-tomato"
            >
              {mistake ? "已入错题本" : "加入错题本"}
            </button>
          </div>
        </div>

        <LatexText
          text={question.content}
          className="text-base font-semibold leading-8 text-ink"
        />
      </Panel>

      <Panel>
        <h2 className="mb-3 text-sm font-black text-ink/70">我的作答</h2>
        {input}
      </Panel>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {previousId ? (
            <button
              type="button"
              onClick={onPrevious}
              className="focus-ring inline-flex items-center justify-center rounded-md border border-line bg-white px-4 py-2 text-sm font-bold text-ink transition hover:border-mint"
            >
              上一题
            </button>
          ) : null}
        </div>
        {showAnswer ? (
          <button
            type="button"
            onClick={nextId ? onNext : onReturnToChapter}
            className="focus-ring inline-flex items-center justify-center rounded-md bg-ink px-4 py-2 text-sm font-bold text-white transition hover:bg-mint"
          >
            {nextId ? "下一题" : returnLabel}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setShowAnswer(true)}
            className="focus-ring rounded-md bg-ink px-4 py-2 text-sm font-black text-white transition hover:bg-mint"
          >
            查看答案
          </button>
        )}
      </div>

      {showAnswer ? (
        <Panel className="border-mint/30">
          <h2 className="mb-2 text-sm font-black text-mint">参考答案</h2>
          <LatexText
            text={question.answer || "暂无答案"}
            className="text-sm leading-7 text-ink"
          />
          <h2 className="mb-2 mt-5 text-sm font-black text-mint">解析</h2>
          <LatexText
            text={question.analysis || "暂无解析"}
            className="text-sm leading-7 text-ink/75"
          />
        </Panel>
      ) : null}
    </div>
  );
}
