export type LatexPart =
  | { kind: "text"; value: string }
  | { kind: "math"; value: string; display: boolean };

type Delimiter = {
  open: string;
  close: string;
  display: boolean;
};

const delimiters: Delimiter[] = [
  { open: "\\[", close: "\\]", display: true },
  { open: "\\(", close: "\\)", display: false },
  { open: "$$", close: "$$", display: true },
  { open: "$", close: "$", display: false }
];

function isEscaped(text: string, index: number) {
  let slashCount = 0;

  for (let i = index - 1; i >= 0 && text[i] === "\\"; i -= 1) {
    slashCount += 1;
  }

  return slashCount % 2 === 1;
}

function findSingleDollarClose(text: string, start: number) {
  for (let i = start; i < text.length; i += 1) {
    if (text[i] !== "$" || isEscaped(text, i)) continue;
    if (/\s/.test(text[i - 1] ?? "")) continue;
    return i;
  }

  return -1;
}

function findNextDelimiter(text: string, start: number) {
  for (let index = start; index < text.length; index += 1) {
    for (const delimiter of delimiters) {
      if (!text.startsWith(delimiter.open, index)) continue;
      if (delimiter.open === "$" && isEscaped(text, index)) continue;
      if (delimiter.open === "$" && /\s/.test(text[index + 1] ?? "")) continue;

      return { delimiter, index };
    }
  }

  return null;
}

export function parseLatexParts(text: string): LatexPart[] {
  const parts: LatexPart[] = [];
  let cursor = 0;

  while (cursor < text.length) {
    const next = findNextDelimiter(text, cursor);

    if (!next) {
      parts.push({ kind: "text", value: text.slice(cursor) });
      break;
    }

    const { delimiter, index } = next;
    const contentStart = index + delimiter.open.length;
    const closeIndex =
      delimiter.open === "$"
        ? findSingleDollarClose(text, contentStart)
        : text.indexOf(delimiter.close, contentStart);

    if (closeIndex === -1) {
      parts.push({ kind: "text", value: text.slice(cursor) });
      break;
    }

    if (index > cursor) {
      parts.push({ kind: "text", value: text.slice(cursor, index) });
    }

    const value = text.slice(contentStart, closeIndex).trim();
    if (value) {
      parts.push({ kind: "math", value, display: delimiter.display });
    } else {
      parts.push({
        kind: "text",
        value: text.slice(index, closeIndex + delimiter.close.length)
      });
    }

    cursor = closeIndex + delimiter.close.length;
  }

  return parts;
}
