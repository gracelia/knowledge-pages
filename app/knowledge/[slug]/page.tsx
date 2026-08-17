import { notFound } from "next/navigation";
import { categories, getCategory, getTopic, technicalTopicGroups, topics } from "../../data";
import { SiteHeader } from "../../SiteHeader";

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
        {topic.sections.map((section, index) => <section id={section.id} className="doc-section" key={section.id}>
          <span className="section-number">0{index + 1}</span><h2>{section.title}</h2><p>{section.body}</p>
          {section.bullets && <ul>{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>}
        </section>)}
        <div className="doc-bottom"><span>这篇内容有帮助吗？</span><button>有帮助</button><button>需要补充</button></div>
      </article>
      <aside className="toc"><p>本页目录</p>{topic.sections.map((section) => <a key={section.id} href={`#${section.id}`}>{section.title}</a>)}<div className="toc-progress"><span>阅读进度</span><div><i style={{width: "42%"}}></i></div><small>42%</small></div></aside>
    </div>
    <div className="mobile-doc-nav">{categoryTopics.map((item) => <a className={item.slug === slug ? "active" : ""} key={item.slug} href={`/knowledge/${item.slug}`}>{item.title}</a>)}</div>
  </main>;
}
