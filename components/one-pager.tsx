// Renders the markdown-ish one-pager string into clean, styled sections.
// Minimal parser: `# ` title, `## ` section, `- ` list item, blank lines ignored.

import { Fragment } from "react";

export function OnePager({ content }: { content: string }) {
  const lines = content.split("\n");
  const blocks: React.ReactNode[] = [];
  let list: string[] = [];

  const flushList = (key: string) => {
    if (list.length === 0) return;
    blocks.push(
      <ul key={key} className="space-y-1 text-sm text-muted-foreground">
        {list.map((item, i) => (
          <li key={i} className="flex gap-2">
            <span className="text-brand">·</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>,
    );
    list = [];
  };

  lines.forEach((raw, i) => {
    const line = raw.trimEnd();
    if (line.startsWith("# ")) {
      flushList(`l-${i}`);
      blocks.push(
        <h3 key={i} className="text-base font-semibold tracking-tight">
          {line.slice(2)}
        </h3>,
      );
    } else if (line.startsWith("## ")) {
      flushList(`l-${i}`);
      blocks.push(
        <p
          key={i}
          className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
        >
          {line.slice(3)}
        </p>,
      );
    } else if (line.startsWith("- ")) {
      list.push(line.slice(2));
    } else if (line.length > 0) {
      flushList(`l-${i}`);
      blocks.push(
        <p key={i} className="text-sm text-foreground/80">
          {line}
        </p>,
      );
    }
  });
  flushList("l-end");

  return <div className="space-y-1.5">{blocks.map((b, i) => <Fragment key={i}>{b}</Fragment>)}</div>;
}
