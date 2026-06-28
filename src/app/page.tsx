import Link from "next/link";
import { EmptyState, PageTitle, Panel } from "@/components/ui";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const courses = await prisma.course.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      chapters: {
        include: { _count: { select: { questions: true } } }
      }
    }
  });

  return (
    <div>
      <PageTitle
        eyebrow="Final sprint"
        title="期末刷题"
        description="按课程和章节快速进入题目，答案解析按需展开，收藏和错题本保存在当前浏览器。"
      />

      {courses.length === 0 ? (
        <EmptyState>暂无课程，请先到后台创建课程或导入 PDF。</EmptyState>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => {
            const questionCount = course.chapters.reduce(
              (sum, chapter) => sum + chapter._count.questions,
              0
            );

            return (
              <Link key={course.id} href={`/course/${course.id}`}>
                <Panel className="h-full transition hover:-translate-y-0.5 hover:border-mint">
                  <div className="flex h-full flex-col justify-between gap-5">
                    <div>
                      <h2 className="text-lg font-black text-ink">
                        {course.name}
                      </h2>
                      <p className="mt-2 line-clamp-3 text-sm leading-6 text-ink/65">
                        {course.description || "暂无课程描述"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-bold text-ink/55">
                      <span>{course.chapters.length} 章</span>
                      <span>{questionCount} 题</span>
                    </div>
                  </div>
                </Panel>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
