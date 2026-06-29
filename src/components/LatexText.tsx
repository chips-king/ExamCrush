import katex from "katex";
import { clsx } from "clsx";
import { parseLatexParts } from "@/lib/latex";

export function LatexText({
  text,
  className
}: {
  text: string;
  className?: string;
}) {
  const parts = parseLatexParts(text);

  return (
    <div className={clsx("latex-text whitespace-pre-wrap", className)}>
      {parts.map((part, index) => {
        if (part.kind === "text") {
          return <span key={index}>{part.value}</span>;
        }

        const html = katex.renderToString(part.value, {
          displayMode: part.display,
          throwOnError: false,
          strict: false,
          trust: false
        });

        const Component = part.display ? "div" : "span";

        return (
          <Component
            key={index}
            className={part.display ? "latex-display" : "latex-inline"}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      })}
    </div>
  );
}
