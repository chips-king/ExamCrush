"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { LatexText } from "@/components/LatexText";
import { EmptyState, PageTitle, Panel } from "@/components/ui";
import { readJsonResponse } from "@/lib/client-json";

type AdminQuestion = {
  id: string;
  chapterId: string;
  type: "single" | "blank" | "short" | "code";
  content: string;
  options: string[];
  answer: string;
  analysis: string;
  order: number;
};

type AdminChapter = {
  id: string;
  courseId: string;
  title: string;
  order: number;
  questions: AdminQuestion[];
  _count?: { questions: number };
};

type AdminCourse = {
  id: string;
  name: string;
  description: string;
  chapters: AdminChapter[];
};

const typeOptions = [
  { value: "single", label: "单选" },
  { value: "blank", label: "填空" },
  { value: "short", label: "简答" },
  { value: "code", label: "编程" }
] as const;

const emptyQuestion = {
  chapterId: "",
  type: "single" as AdminQuestion["type"],
  content: "",
  options: "",
  answer: "",
  analysis: "",
  order: 1
};

function normalizeQuestion(question: AdminQuestion): AdminQuestion {
  return {
    ...question,
    options: Array.isArray(question.options) ? question.options : []
  };
}

export function AdminDashboard() {
  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [courseForm, setCourseForm] = useState({ name: "", description: "" });
  const [chapterForm, setChapterForm] = useState({
    courseId: "",
    title: "",
    order: 1
  });
  const [questionForm, setQuestionForm] = useState(emptyQuestion);
  const [editingId, setEditingId] = useState("");

  const flatQuestions = useMemo(
    () =>
      courses.flatMap((course) =>
        course.chapters.flatMap((chapter) =>
          chapter.questions.map((question) => ({
            ...normalizeQuestion(question),
            courseName: course.name,
            chapterTitle: chapter.title
          }))
        )
      ),
    [courses]
  );

  async function loadCourses() {
    const response = await fetch("/api/courses", { cache: "no-store" });
    const data = await readJsonResponse(response);
    if (!response.ok || !Array.isArray(data)) {
      throw new Error(data.error || "课程加载失败。");
    }
    setCourses(
      data.map((course: AdminCourse) => ({
        ...course,
        chapters: course.chapters.map((chapter) => ({
          ...chapter,
          questions: (chapter.questions ?? []).map(normalizeQuestion)
        }))
      }))
    );
  }

  async function adminFetch(url: string, init: RequestInit = {}) {
    const response = await fetch(url, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        "x-admin-password": password,
        ...(init.headers ?? {})
      }
    });
    const data = await readJsonResponse(response);

    if (!response.ok) {
      throw new Error(data.error || "操作失败");
    }

    return data;
  }

  useEffect(() => {
    const saved = window.sessionStorage.getItem("examcrush:admin-password");
    if (saved) {
      setPassword(saved);
      setUnlocked(true);
    }
  }, []);

  useEffect(() => {
    if (unlocked) {
      loadCourses().catch((error) => setMessage(error.message));
    }
  }, [unlocked]);

  function unlock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    window.sessionStorage.setItem("examcrush:admin-password", password);
    setUnlocked(true);
  }

  async function run(action: () => Promise<void>, success: string) {
    setLoading(true);
    setMessage("");
    try {
      await action();
      await loadCourses();
      setMessage(success);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "操作失败");
    } finally {
      setLoading(false);
    }
  }

  async function createCourse(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await run(async () => {
      await adminFetch("/api/courses", {
        method: "POST",
        body: JSON.stringify(courseForm)
      });
      setCourseForm({ name: "", description: "" });
    }, "课程已创建。");
  }

  async function createChapter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await run(async () => {
      await adminFetch("/api/chapters", {
        method: "POST",
        body: JSON.stringify(chapterForm)
      });
      setChapterForm({ courseId: "", title: "", order: 1 });
    }, "章节已创建。");
  }

  async function saveQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = {
      ...questionForm,
      options: questionForm.options
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean)
    };

    await run(async () => {
      if (editingId) {
        await adminFetch(`/api/questions/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload)
        });
      } else {
        await adminFetch("/api/questions", {
          method: "POST",
          body: JSON.stringify(payload)
        });
      }
      setEditingId("");
      setQuestionForm(emptyQuestion);
    }, editingId ? "题目已更新。" : "题目已创建。");
  }

  async function deleteCourse(course: AdminCourse) {
    if (
      !window.confirm(
        `确认删除课程「${course.name}」？这会同时删除它的章节和题目。`
      )
    ) {
      return;
    }

    await run(async () => {
      await adminFetch(`/api/courses/${course.id}`, { method: "DELETE" });
    }, "课程已删除。");
  }

  async function deleteChapter(chapter: AdminChapter) {
    if (
      !window.confirm(`确认删除章节「${chapter.title}」？这会同时删除本章题目。`)
    ) {
      return;
    }

    await run(async () => {
      await adminFetch(`/api/chapters/${chapter.id}`, { method: "DELETE" });
    }, "章节已删除。");
  }

  async function deleteQuestion(question: AdminQuestion) {
    if (!window.confirm("确认删除这道题目？")) return;

    await run(async () => {
      await adminFetch(`/api/questions/${question.id}`, { method: "DELETE" });
    }, "题目已删除。");
  }

  function startEdit(question: AdminQuestion) {
    setEditingId(question.id);
    setQuestionForm({
      chapterId: question.chapterId,
      type: question.type,
      content: question.content,
      options: question.options.join("\n"),
      answer: question.answer,
      analysis: question.analysis,
      order: question.order
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (!unlocked) {
    return (
      <div className="mx-auto max-w-md">
        <PageTitle title="后台管理" description="输入管理员密码后继续。" />
        <Panel>
          <form onSubmit={unlock} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="ADMIN_PASSWORD"
              className="focus-ring w-full rounded-md border-line"
              required
            />
            <button className="focus-ring w-full rounded-md bg-ink px-4 py-2 text-sm font-black text-white hover:bg-mint">
              进入后台
            </button>
          </form>
        </Panel>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageTitle
          eyebrow="Admin"
          title="后台管理"
          description="管理课程、章节、题目，或从电子版 PDF 导入题库。"
        />
        <Link
          href="/admin/import"
          className="focus-ring rounded-md bg-mint px-4 py-2 text-sm font-black text-white hover:bg-ink"
        >
          PDF 导入
        </Link>
      </div>

      {message ? (
        <div className="rounded-md border border-line bg-white px-4 py-3 text-sm font-bold text-ink/70">
          {message}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel>
          <h2 className="mb-3 text-base font-black">新建课程</h2>
          <form onSubmit={createCourse} className="space-y-3">
            <input
              value={courseForm.name}
              onChange={(event) =>
                setCourseForm({ ...courseForm, name: event.target.value })
              }
              placeholder="课程名称"
              className="focus-ring w-full rounded-md border-line"
              required
            />
            <textarea
              value={courseForm.description}
              onChange={(event) =>
                setCourseForm({
                  ...courseForm,
                  description: event.target.value
                })
              }
              placeholder="课程描述"
              rows={3}
              className="focus-ring w-full rounded-md border-line"
            />
            <button
              disabled={loading}
              className="focus-ring w-full rounded-md bg-ink px-4 py-2 text-sm font-black text-white hover:bg-mint disabled:opacity-50"
            >
              保存课程
            </button>
          </form>
        </Panel>

        <Panel>
          <h2 className="mb-3 text-base font-black">新建章节</h2>
          <form onSubmit={createChapter} className="space-y-3">
            <select
              value={chapterForm.courseId}
              onChange={(event) =>
                setChapterForm({ ...chapterForm, courseId: event.target.value })
              }
              className="focus-ring w-full rounded-md border-line"
              required
            >
              <option value="">选择课程</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
            <input
              value={chapterForm.title}
              onChange={(event) =>
                setChapterForm({ ...chapterForm, title: event.target.value })
              }
              placeholder="章节名称"
              className="focus-ring w-full rounded-md border-line"
              required
            />
            <input
              type="number"
              min={1}
              value={chapterForm.order}
              onChange={(event) =>
                setChapterForm({
                  ...chapterForm,
                  order: Number(event.target.value)
                })
              }
              className="focus-ring w-full rounded-md border-line"
            />
            <button
              disabled={loading}
              className="focus-ring w-full rounded-md bg-ink px-4 py-2 text-sm font-black text-white hover:bg-mint disabled:opacity-50"
            >
              保存章节
            </button>
          </form>
        </Panel>

        <Panel>
          <h2 className="mb-3 text-base font-black">
            {editingId ? "编辑题目" : "新建题目"}
          </h2>
          <form onSubmit={saveQuestion} className="space-y-3">
            <select
              value={questionForm.chapterId}
              onChange={(event) =>
                setQuestionForm({
                  ...questionForm,
                  chapterId: event.target.value
                })
              }
              className="focus-ring w-full rounded-md border-line"
              required={!editingId}
              disabled={Boolean(editingId)}
            >
              <option value="">选择章节</option>
              {courses.map((course) =>
                course.chapters.map((chapter) => (
                  <option key={chapter.id} value={chapter.id}>
                    {course.name} / {chapter.title}
                  </option>
                ))
              )}
            </select>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={questionForm.type}
                onChange={(event) =>
                  setQuestionForm({
                    ...questionForm,
                    type: event.target.value as AdminQuestion["type"]
                  })
                }
                className="focus-ring rounded-md border-line"
              >
                {typeOptions.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={1}
                value={questionForm.order}
                onChange={(event) =>
                  setQuestionForm({
                    ...questionForm,
                    order: Number(event.target.value)
                  })
                }
                className="focus-ring rounded-md border-line"
              />
            </div>
            <textarea
              value={questionForm.content}
              onChange={(event) =>
                setQuestionForm({ ...questionForm, content: event.target.value })
              }
              placeholder="题目内容"
              rows={4}
              className="focus-ring w-full rounded-md border-line"
              required
            />
            <textarea
              value={questionForm.options}
              onChange={(event) =>
                setQuestionForm({ ...questionForm, options: event.target.value })
              }
              placeholder="单选题选项，每行一个"
              rows={4}
              className="focus-ring w-full rounded-md border-line"
            />
            <textarea
              value={questionForm.answer}
              onChange={(event) =>
                setQuestionForm({ ...questionForm, answer: event.target.value })
              }
              placeholder="参考答案"
              rows={3}
              className="focus-ring w-full rounded-md border-line"
            />
            <textarea
              value={questionForm.analysis}
              onChange={(event) =>
                setQuestionForm({
                  ...questionForm,
                  analysis: event.target.value
                })
              }
              placeholder="解析"
              rows={3}
              className="focus-ring w-full rounded-md border-line"
            />
            <div className="flex gap-2">
              <button
                disabled={loading}
                className="focus-ring flex-1 rounded-md bg-ink px-4 py-2 text-sm font-black text-white hover:bg-mint disabled:opacity-50"
              >
                {editingId ? "更新题目" : "保存题目"}
              </button>
              {editingId ? (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId("");
                    setQuestionForm(emptyQuestion);
                  }}
                  className="focus-ring rounded-md border border-line bg-white px-4 py-2 text-sm font-black hover:border-mint"
                >
                  取消
                </button>
              ) : null}
            </div>
          </form>
        </Panel>
      </div>

      <Panel>
        <h2 className="mb-4 text-base font-black">课程结构</h2>
        {courses.length === 0 ? (
          <EmptyState>暂无课程。</EmptyState>
        ) : (
          <div className="space-y-5">
            {courses.map((course) => (
              <div key={course.id} className="rounded-md border border-line p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-black">{course.name}</h3>
                    <p className="mt-1 text-sm text-ink/60">
                      {course.description || "暂无描述"}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteCourse(course)}
                    className="focus-ring rounded-md border border-tomato/40 px-3 py-2 text-sm font-black text-tomato hover:bg-tomato hover:text-white"
                  >
                    删除课程
                  </button>
                </div>

                <div className="mt-4 space-y-3">
                  {course.chapters.map((chapter) => (
                    <div key={chapter.id} className="rounded-md bg-paper p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="text-sm font-black">
                          {chapter.order}. {chapter.title}
                          <span className="ml-2 text-ink/50">
                            {chapter.questions.length} 题
                          </span>
                        </div>
                        <button
                          onClick={() => deleteChapter(chapter)}
                          className="focus-ring rounded-md border border-line bg-white px-3 py-1.5 text-xs font-black text-tomato hover:border-tomato"
                        >
                          删除章节
                        </button>
                      </div>
                      <div className="mt-3 divide-y divide-line rounded-md bg-white">
                        {chapter.questions.map((question) => (
                          <div
                            key={question.id}
                            className="flex flex-wrap items-center justify-between gap-3 p-3"
                          >
                            <div className="min-w-0 flex-1 text-sm font-semibold leading-6">
                              <span>#{question.order} </span>
                              <LatexText text={question.content} className="inline" />
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => startEdit(question)}
                                className="focus-ring rounded-md border border-line px-3 py-1.5 text-xs font-black hover:border-mint"
                              >
                                编辑
                              </button>
                              <button
                                onClick={() => deleteQuestion(question)}
                                className="focus-ring rounded-md border border-line px-3 py-1.5 text-xs font-black text-tomato hover:border-tomato"
                              >
                                删除
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>

      <Panel>
        <h2 className="mb-3 text-base font-black">题目速查</h2>
        {flatQuestions.length === 0 ? (
          <EmptyState>暂无题目。</EmptyState>
        ) : (
          <div className="grid gap-2 md:grid-cols-2">
            {flatQuestions.slice(0, 20).map((question) => (
              <Link
                key={question.id}
                href={`/question/${question.id}`}
                className="rounded-md border border-line bg-white p-3 text-sm hover:border-mint"
              >
                <p className="mb-1 text-xs font-bold text-ink/45">
                  {question.courseName} / {question.chapterTitle}
                </p>
                <LatexText
                  text={question.content}
                  className="line-clamp-2 font-semibold leading-6"
                />
              </Link>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
