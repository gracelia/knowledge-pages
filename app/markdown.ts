function headingId(value: string) {
  return value.toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, "").trim().replace(/\s+/g, "-");
}

function normalizeSimpleTables(markdown: string) {
  const lines = markdown.split("\n");
  const result: string[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    const header = lines[index];
    const divider = lines[index + 1] ?? "";
    if (/^\s{2}\S/.test(header) && /^\s{2}-+(?:\s+-+)+\s*$/.test(divider)) {
      const headers = header.trim().split(/\s{2,}/);
      result.push(`| ${headers.join(" | ")} |`);
      result.push(`| ${headers.map(() => "---").join(" | ")} |`);
      index += 2;
      while (index < lines.length && /^\s{2}\S/.test(lines[index])) {
        const cells = lines[index].trim().split(/\s{2,}/);
        result.push(`| ${cells.join(" | ")} |`);
        index += 1;
      }
      result.push("");
      index -= 1;
      continue;
    }
    result.push(header);
  }

  return result.join("\n");
}

function prepareMarkdown(source: string) {
  return normalizeSimpleTables(source)
    .replace(/^# .+\n+/, "")
    .replace(/^# (\d+\.)/gm, "## $1")
    .replace(/^## (\d+\.\d+)/gm, "### $1");
}

const markdownModules = import.meta.glob("./content/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

const markdownTopics = Object.fromEntries(
  Object.entries(markdownModules).map(([path, source]) => {
    const slug = path.split("/").pop()!.replace(/\.md$/, "");
    return [slug, prepareMarkdown(source)];
  }),
) as Record<string, string>;

export function getMarkdown(slug: string) {
  return markdownTopics[slug];
}

export function getMarkdownHeadings(markdown: string) {
  return [...markdown.matchAll(/^## (.+)$/gm)].map((match) => ({
    title: match[1],
    id: headingId(match[1]),
  }));
}

export { headingId };
