"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { EmptyState, PageTitle, Panel } from "@/components/ui";
import { readJsonResponse } from "@/lib/client-json";
import type { ImportPreview } from "@/lib/schemas";

const emptyPreview: ImportPreview = {
  course: { name: "", description: "" },
  chapters: []
};

export function ImportPdfClient() {
  const [password, setPassword] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setPassword(window.sessionStorage.getItem("examcrush:admin-password") ?? "");
  }, []);

  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) return;

    const form = new FormData();
    form.append("file", file);
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/import/pdf", {
        method: "POST",
        headers: { "x-admin-password": password },
        body: form
      });
      const data = await readJsonResponse(response);
      if (!response.ok) throw new Error(data.error || "导入失败");
      setPreview(data as ImportPreview);
      setMessage("PDF 解析完成，请检查预览后确认导入。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "导入失败");
    } finally {
      setLoading(false);
    }
  }

  async function confirmImport() {
    if (!preview) return;

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/import/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password
        },
        body: JSON.stringify(preview)
      });
      const data = await readJsonResponse(response);
      if (!response.ok) throw new Error(data.error || "确认导入失败");
      setMessage("题库已导入。");
      setPreview(emptyPreview);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "确认导入失败");
    } finally {
      setLoading(false);
    }
  }

  function updatePreview(next: ImportPreview) {
    setPreview(next);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageTitle
          eyebrow="Import"
          title="PDF 导入题库"
          description="仅支持电子版 PDF。扫描版 PDF 暂不做 OCR。"
        />
        <Link
          href="/admin"
          className="focus-ring rounded-md border border-line bg-white px-4 py-2 text-sm font-black hover:border-mint"
        >
          返回后台
        </Link>
      </div>

      <Panel>
        <form onSubmit={upload} className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <input
            type="password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              window.sessionStorage.setItem(
                "examcrush:admin-password",
                event.target.value
              );
            }}
            placeholder="管理员密码"
            className="focus-ring rounded-md border-line"
            required
          />
          <input
            type="file"
            accept="application/pdf"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            className="focus-ring rounded-md border border-line bg-white text-sm file:mr-3 file:border-0 file:bg-ink file:px-3 file:py-2 file:text-sm file:font-bold file:text-white"
            required
          />
          <button
            disabled={loading}
            className="focus-ring rounded-md bg-ink px-4 py-2 text-sm font-black text-white hover:bg-mint disabled:opacity-50"
          >
            {loading ? "处理中" : "上传解析"}
          </button>
        </form>
      </Panel>

      {message ? (
        <div className="rounded-md border border-line bg-white px-4 py-3 text-sm font-bold text-ink/70">
          {message}
        </div>
      ) : null}

      {!preview ? (
        <EmptyState>上传 PDF 后会在这里展示可编辑预览。</EmptyState>
      ) : (
        <Panel>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-black">导入预览</h2>
            <button
              type="button"
              disabled={loading}
              onClick={confirmImport}
              className="focus-ring rounded-md bg-mint px-4 py-2 text-sm font-black text-white hover:bg-ink disabled:opacity-50"
            >
              确认导入
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <input
                value={preview.course.name}
                onChange={(event) =>
                  updatePreview({
                    ...preview,
                    course: { ...preview.course, name: event.target.value }
                  })
                }
                placeholder="课程名称"
                className="focus-ring rounded-md border-line"
              />
              <input
                value={preview.course.description}
                onChange={(event) =>
                  updatePreview({
                    ...preview,
                    course: {
                      ...preview.course,
                      description: event.target.value
                    }
                  })
                }
                placeholder="课程描述"
                className="focus-ring rounded-md border-line"
              />
            </div>

            {preview.chapters.map((chapter, chapterIndex) => (
              <div
                key={`${chapter.title}-${chapterIndex}`}
                className="rounded-md border border-line bg-paper p-3"
              >
                <div className="grid gap-2 md:grid-cols-[80px_1fr_auto]">
                  <input
                    type="number"
                    min={1}
                    value={chapter.order}
                    onChange={(event) => {
                      const chapters = [...preview.chapters];
                      chapters[chapterIndex] = {
                        ...chapter,
                        order: Number(event.target.value)
                      };
                      updatePreview({ ...preview, chapters });
                    }}
                    className="focus-ring rounded-md border-line"
                  />
                  <input
                    value={chapter.title}
                    onChange={(event) => {
                      const chapters = [...preview.chapters];
                      chapters[chapterIndex] = {
                        ...chapter,
                        title: event.target.value
                      };
                      updatePreview({ ...preview, chapters });
                    }}
                    className="focus-ring rounded-md border-line"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      updatePreview({
                        ...preview,
                        chapters: preview.chapters.filter(
                          (_item, index) => index !== chapterIndex
                        )
                      })
                    }
                    className="focus-ring rounded-md border border-line bg-white px-3 py-2 text-sm font-black text-tomato hover:border-tomato"
                  >
                    删除章节
                  </button>
                </div>

                <div className="mt-3 space-y-3">
                  {chapter.questions.map((question, questionIndex) => (
                    <div
                      key={`${question.content}-${questionIndex}`}
                      className="rounded-md bg-white p-3"
                    >
                      <div className="grid gap-2 md:grid-cols-[80px_120px_1fr_auto]">
                        <input
                          type="number"
                          min={1}
                          value={question.order}
                          onChange={(event) => {
                            const chapters = [...preview.chapters];
                            const questions = [...chapter.questions];
                            questions[questionIndex] = {
                              ...question,
                              order: Number(event.target.value)
                            };
                            chapters[chapterIndex] = { ...chapter, questions };
                            updatePreview({ ...preview, chapters });
                          }}
                          className="focus-ring rounded-md border-line"
                        />
                        <select
                          value={question.type}
                          onChange={(event) => {
                            const chapters = [...preview.chapters];
                            const questions = [...chapter.questions];
                            questions[questionIndex] = {
                              ...question,
                              type: event.target.value as typeof question.type
                            };
                            chapters[chapterIndex] = { ...chapter, questions };
                            updatePreview({ ...preview, chapters });
                          }}
                          className="focus-ring rounded-md border-line"
                        >
                          <option value="single">单选</option>
                          <option value="blank">填空</option>
                          <option value="short">简答</option>
                          <option value="code">编程</option>
                        </select>
                        <input
                          value={question.content}
                          onChange={(event) => {
                            const chapters = [...preview.chapters];
                            const questions = [...chapter.questions];
                            questions[questionIndex] = {
                              ...question,
                              content: event.target.value
                            };
                            chapters[chapterIndex] = { ...chapter, questions };
                            updatePreview({ ...preview, chapters });
                          }}
                          className="focus-ring rounded-md border-line"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const chapters = [...preview.chapters];
                            chapters[chapterIndex] = {
                              ...chapter,
                              questions: chapter.questions.filter(
                                (_item, index) => index !== questionIndex
                              )
                            };
                            updatePreview({ ...preview, chapters });
                          }}
                          className="focus-ring rounded-md border border-line px-3 py-2 text-sm font-black text-tomato hover:border-tomato"
                        >
                          删除
                        </button>
                      </div>

                      <div className="mt-2 grid gap-2 md:grid-cols-3">
                        <textarea
                          value={question.options.join("\n")}
                          onChange={(event) => {
                            const chapters = [...preview.chapters];
                            const questions = [...chapter.questions];
                            questions[questionIndex] = {
                              ...question,
                              options: event.target.value
                                .split("\n")
                                .map((item) => item.trim())
                                .filter(Boolean)
                            };
                            chapters[chapterIndex] = { ...chapter, questions };
                            updatePreview({ ...preview, chapters });
                          }}
                          rows={3}
                          placeholder="选项，每行一个"
                          className="focus-ring rounded-md border-line text-sm"
                        />
                        <textarea
                          value={question.answer}
                          onChange={(event) => {
                            const chapters = [...preview.chapters];
                            const questions = [...chapter.questions];
                            questions[questionIndex] = {
                              ...question,
                              answer: event.target.value
                            };
                            chapters[chapterIndex] = { ...chapter, questions };
                            updatePreview({ ...preview, chapters });
                          }}
                          rows={3}
                          placeholder="答案"
                          className="focus-ring rounded-md border-line text-sm"
                        />
                        <textarea
                          value={question.analysis}
                          onChange={(event) => {
                            const chapters = [...preview.chapters];
                            const questions = [...chapter.questions];
                            questions[questionIndex] = {
                              ...question,
                              analysis: event.target.value
                            };
                            chapters[chapterIndex] = { ...chapter, questions };
                            updatePreview({ ...preview, chapters });
                          }}
                          rows={3}
                          placeholder="解析"
                          className="focus-ring rounded-md border-line text-sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}
