import Link from "next/link";
import { clsx } from "clsx";

export function PageTitle({
  eyebrow,
  title,
  description
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-6">
      {eyebrow ? (
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-mint">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="text-2xl font-black tracking-tight text-ink md:text-4xl">
        {title}
      </h1>
      {description ? (
        <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/65 md:text-base">
          {description}
        </p>
      ) : null}
    </div>
  );
}

export function Panel({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={clsx(
        "rounded-lg border border-line bg-white/82 p-4 shadow-panel md:p-5",
        className
      )}
    >
      {children}
    </section>
  );
}

export function ButtonLink({
  href,
  children,
  tone = "primary"
}: {
  href: string;
  children: React.ReactNode;
  tone?: "primary" | "plain";
}) {
  return (
    <Link
      href={href}
      className={clsx(
        "focus-ring inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-bold transition",
        tone === "primary"
          ? "bg-ink text-white hover:bg-mint"
          : "border border-line bg-white text-ink hover:border-mint"
      )}
    >
      {children}
    </Link>
  );
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-line bg-white/60 p-8 text-center text-sm text-ink/60">
      {children}
    </div>
  );
}
