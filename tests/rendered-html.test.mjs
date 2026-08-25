import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const contentRoot = new URL("../app/content/", import.meta.url);
const pagesRoot = new URL("../github-pages/knowledge/", import.meta.url);

test("every knowledge source is Markdown and compiles to HTML", async () => {
  const markdownFiles = (await readdir(contentRoot)).filter((file) => file.endsWith(".md"));
  const registry = await readFile(new URL("../app/data.ts", import.meta.url), "utf8");
  const topicRegistry = registry.slice(registry.indexOf("export const topics"));
  const registeredSlugs = [...topicRegistry.matchAll(/"slug":\s*"([^"]+)"/g)].map((match) => match[1]).sort();
  const markdownSlugs = markdownFiles.map((file) => file.replace(/\.md$/, "")).sort();
  assert.ok(markdownFiles.length > 0);
  assert.deepEqual(markdownSlugs, registeredSlugs, "topic metadata and Markdown files must stay one-to-one");

  for (const file of markdownFiles) {
    const slug = file.replace(/\.md$/, "");
    const source = await readFile(new URL(file, contentRoot), "utf8");
    assert.match(source, /^#\s+.+/m, `${file} must contain a title`);

    const output = new URL(`${slug}/index.html`, pagesRoot);
    await access(output);
    const html = await readFile(output, "utf8");
    assert.match(html, /class="markdown-content"/);
    assert.match(html, /<h2(?:\s|>)/);
  }
});

test("topic registry contains metadata only", async () => {
  const registry = await readFile(new URL("../app/data.ts", import.meta.url), "utf8");
  assert.doesNotMatch(registry, /\bsections\s*:/);
  assert.doesNotMatch(registry, /\bbody\s*:/);
});

test("the shared HTML template renders Markdown", async () => {
  const template = await readFile(new URL("../app/KnowledgeArticle.tsx", import.meta.url), "utf8");
  const page = await readFile(new URL("../app/knowledge/[slug]/page.tsx", import.meta.url), "utf8");
  assert.match(template, /ReactMarkdown/);
  assert.match(template, /remarkGfm/);
  assert.match(page, /<KnowledgeArticle markdown=\{topicMarkdown\}/);
});
