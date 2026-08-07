/**
 * Minimal markdown → HTML for the editor's preview pane. Deliberately small:
 * it covers what the toolbar can insert, nothing more.
 *
 * Colours come from theme CSS custom properties because the output is an HTML
 * string — inline styles can't reach `sx`, but they can read variables, so the
 * preview re-themes with everything else.
 */

export const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const inline = (s: string) =>
  s
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/~~([^~]+)~~/g, `<del style="color:${tokens.muted}">$1</del>`)
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(
      /`([^`]+)`/g,
      `<code style="background:${tokens.fill};padding:1px 6px;border-radius:5px;font-size:12px">$1</code>`,
    )
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, `<a href="$2" style="color:${tokens.accentFg}">$1</a>`);

/**
 * Theme values for the generated preview HTML. Inline styles can't reach `sx`,
 * but the theme emits CSS custom properties, so the markup references those and
 * re-themes with everything else — no values threaded through, no literals.
 */
export const tokens = {
  muted: "var(--mui-palette-text-disabled)",
  fill: "var(--mui-palette-surface-hover)",
  border: "var(--mui-palette-surface-border)",
  accent: "var(--mui-palette-primary-main)",
  accentSoft: "var(--mui-palette-surface-primarySoftBg)",
  accentFg: "var(--mui-palette-surface-primarySoftFg)",
  text: "var(--mui-palette-surface-textMuted)",
  success: "var(--mui-palette-success-light)",
};

export function markdownToHtml(md: string): string {
  const lines = esc(md).split("\n");
  let html = "";
  let list: "ul" | "ol" | null = null;
  let inCode = false;
  let codeBuf: string[] = [];
  const closeList = () => {
    if (list) {
      html += list === "ul" ? "</ul>" : "</ol>";
      list = null;
    }
  };
  for (const line of lines) {
    if (/^```/.test(line.trim())) {
      if (inCode) {
        html += `<pre style="background:${tokens.fill};border:1px solid ${tokens.border};border-radius:9px;padding:12px 14px;font-size:12px;line-height:1.55;overflow-x:auto;margin:10px 0">${codeBuf.join("\n")}</pre>`;
        inCode = false;
        codeBuf = [];
      } else {
        closeList();
        inCode = true;
      }
      continue;
    }
    if (inCode) {
      codeBuf.push(line);
      continue;
    }
    if (/^---\s*$/.test(line)) {
      closeList();
      html += `<hr style="border:none;border-top:1px solid ${tokens.border};margin:14px 0">`;
    } else if (/^&gt; /.test(line)) {
      closeList();
      html += `<blockquote style="margin:8px 0;padding:6px 14px;border-left:3px solid ${tokens.accent};background:${tokens.accentSoft};border-radius:0 8px 8px 0;color:${tokens.text}">${inline(line.slice(5))}</blockquote>`;
    } else if (/^- \[( |x)\] /.test(line)) {
      if (list !== "ul") {
        closeList();
        html += '<ul style="margin:6px 0;padding-left:6px;list-style:none">';
        list = "ul";
      }
      const done = line[3] === "x";
      html += `<li style="margin:4px 0;display:flex;gap:8px;align-items:baseline"><span style="color:${done ? tokens.success : tokens.muted}">${done ? "☑" : "☐"}</span><span${done ? ` style="color:${tokens.muted};text-decoration:line-through"` : ""}>${inline(line.slice(6))}</span></li>`;
    } else if (/^### /.test(line)) {
      closeList();
      html += `<h3 style="font-size:14px;font-weight:700;margin:14px 0 6px">${inline(line.slice(4))}</h3>`;
    } else if (/^## /.test(line)) {
      closeList();
      html += `<h2 style="font-size:15.5px;font-weight:700;margin:16px 0 7px">${inline(line.slice(3))}</h2>`;
    } else if (/^# /.test(line)) {
      closeList();
      html += `<h1 style="font-size:17px;font-weight:700;margin:16px 0 8px">${inline(line.slice(2))}</h1>`;
    } else if (/^- /.test(line)) {
      if (list !== "ul") {
        closeList();
        html += '<ul style="margin:6px 0;padding-left:22px">';
        list = "ul";
      }
      html += `<li style="margin:3px 0">${inline(line.slice(2))}</li>`;
    } else if (/^\d+\. /.test(line)) {
      if (list !== "ol") {
        closeList();
        html += '<ol style="margin:6px 0;padding-left:22px">';
        list = "ol";
      }
      html += `<li style="margin:3px 0">${inline(line.replace(/^\d+\. /, ""))}</li>`;
    } else if (line.trim() === "") {
      closeList();
    } else {
      closeList();
      html += `<p style="margin:7px 0">${inline(line)}</p>`;
    }
  }
  closeList();
  return html;
}
