import Link from "next/link";
import { notFound } from "next/navigation";
import { EmptyState, PageTitle, Panel } from "@/components/ui";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CoursePage({
  params
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      chapters: {
        orderBy: { order: "asc" },
        include: { _count: { select: { questions: true } } }
      }
    }
  });

  if (!course) notFound();

  return (
    <div>
      <PageTitle
        eyebrow="Course"
        title={course.name}
        description={course.description || "选择章节开始刷题。"}
      />

      {course.chapters.length === 0 ? (
        <EmptyState>这个课程还没有章节。</EmptyState>
      ) : (
        <div className="space-y-3">
          {course.chapters.map((chapter) => (
            <Link
              key={chapter.id}
              href={`/course/${course.id}/chapter/${chapter.id}`}
              className="block"
            >
              <Panel className="transition hover:border-mint hover:bg-white">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-ink/40">
                      Chapter {chapter.order}
                    </p>
                    <h2 className="mt-1 text-base font-black text-ink md:text-lg">
                      {chapter.title}
                    </h2>
                  </div>
                  <div className="shrink-0 rounded bg-paper px-3 py-2 text-sm font-black text-ink/65">
                    {chapter._count.questions} 题
                  </div>
                </div>
              </Panel>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
