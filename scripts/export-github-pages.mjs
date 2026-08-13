import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const output = resolve(root, "github-pages");
const basePath = "/knowledge-pages";
const source = await readFile(resolve(root, "app/data.ts"), "utf8");
const slugs = [...new Set([...source.matchAll(/slug:\s*"([^"]+)"/g)].map((match) => match[1]))];

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(resolve(root, "dist/client"), output, { recursive: true });
await writeFile(resolve(output, ".nojekyll"), "");

const workerUrl = new URL("../dist/server/index.js", import.meta.url);
workerUrl.searchParams.set("export", Date.now().toString());
const { default: worker } = await import(workerUrl.href);

function addBasePath(html) {
  return html
    .replaceAll('href="/', `href="${basePath}/`)
    .replaceAll('src="/', `src="${basePath}/`)
    .replaceAll('content="/', `content="${basePath}/`)
    .replaceAll("href='/", `href='${basePath}/`)
    .replaceAll("src='/", `src='${basePath}/`);
}

async function render(pathname, target) {
  const response = await worker.fetch(
    new Request(`https://example.test${pathname}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
  if (!response.ok) throw new Error(`Failed to render ${pathname}: ${response.status}`);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, addBasePath(await response.text()));
}

await render("/", resolve(output, "index.html"));
for (const slug of slugs) {
  await render(`/knowledge/${slug}`, resolve(output, "knowledge", slug, "index.html"));
}

const fallback = await readFile(resolve(output, "index.html"), "utf8");
await writeFile(resolve(output, "404.html"), fallback);
console.log(`Exported ${slugs.length + 1} pages to ${output}`);
