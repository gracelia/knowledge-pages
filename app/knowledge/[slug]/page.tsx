import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { categories, getCategory, getTopic, technicalTopicGroups, topics } from "../../data";
import { SiteHeader } from "../../SiteHeader";
import ragMarkdownSource from "../../content/rag-production.md?raw";

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

const ragMarkdown = normalizeSimpleTables(ragMarkdownSource)
  .replace(/^# .+\n+/, "")
  .replace(/^# (\d+\.)/gm, "## $1")
  .replace(/^## (\d+\.\d+)/gm, "### $1");

const ragHeadings = [...ragMarkdown.matchAll(/^## (.+)$/gm)].map((match) => ({
  title: match[1],
  id: headingId(match[1]),
}));

export function generateStaticParams() { return topics.map((topic) => ({ slug: topic.slug })); }

export default async function KnowledgePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const topic = getTopic(slug);
  if (!topic) notFound();
  const category = getCategory(topic.category)!;
  const categoryTopics = topics.filter((item) => item.category === topic.category);
  return <main className="docs-page">
    <SiteHeader />
    <div className="docs-layout">
      <aside className="docs-sidebar">
        <a className="back-link" href="/">← 返回知识图谱</a>
        <p className="side-label">题库目录</p>
        {categories.map((item) => <div className="side-group" key={item.id}>
          <div className={`side-title ${item.id}`}><span>{item.index}</span><b>{item.title}</b></div>
          {item.id === "technical" ? technicalTopicGroups.map((group) => <div className="side-subgroup" key={group}>
            <p>{group}</p>
            {topics.filter((t) => t.category === item.id && t.group === group).map((t) => <a className={t.slug === slug ? "active" : ""} key={t.slug} href={`/knowledge/${t.slug}`}>{t.title}</a>)}
          </div>) : topics.filter((t) => t.category === item.id).map((t) => <a className={t.slug === slug ? "active" : ""} key={t.slug} href={`/knowledge/${t.slug}`}>{t.title}</a>)}
          {topics.filter((t) => t.category === item.id).length === 0 && <span className="coming">内容整理中</span>}
        </div>)}
      </aside>
      <article className="doc-content">
        <div className="breadcrumbs"><a href="/">知识图谱</a><span>/</span><span>{category.title}</span>{topic.group && <><span>/</span><span>{topic.group}</span></>}</div>
        <p className={`doc-eyebrow ${topic.category}`}><span>●</span>{topic.eyebrow}</p>
        <h1>{topic.title}</h1>
        <p className="doc-lead">{topic.description}</p>
        <div className="doc-meta"><span>◷ {topic.readTime}</span><span>最后更新：今天</span><span>难度：中级</span></div>
        <div className="doc-note"><b>面试提示</b><p>回答时先给结论，再展开关键链路与取舍，最后用项目中的真实案例收束。</p></div>
        {topic.slug === "rag-production" ? <div className="markdown-content">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h2: ({ children }) => <h2 id={headingId(String(children))}>{children}</h2>,
              h3: ({ children }) => <h3 id={headingId(String(children))}>{children}</h3>,
            }}
          >{ragMarkdown}</ReactMarkdown>
        </div> : topic.sections.map((section, index) => <section id={section.id} className="doc-section" key={section.id}>
          <span className="section-number">0{index + 1}</span><h2>{section.title}</h2><p>{section.body}</p>
          {section.bullets && <ul>{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>}
        </section>)}
        <div className="doc-bottom"><span>这篇内容有帮助吗？</span><button>有帮助</button><button>需要补充</button></div>
      </article>
      <aside className="toc"><p>本页目录</p>{topic.slug === "rag-production" ? ragHeadings.map((heading) => <a key={heading.id} href={`#${heading.id}`}>{heading.title}</a>) : topic.sections.map((section) => <a key={section.id} href={`#${section.id}`}>{section.title}</a>)}<div className="toc-progress"><span>阅读进度</span><div><i style={{width: "42%"}}></i></div><small>42%</small></div></aside>
    </div>
    <div className="mobile-doc-nav">{categoryTopics.map((item) => <a className={item.slug === slug ? "active" : ""} key={item.slug} href={`/knowledge/${item.slug}`}>{item.title}</a>)}</div>
  </main>;
}
