import { categories, topics } from "./data";
import { SiteHeader } from "./SiteHeader";

export default function Home() {
  return <main>
    <SiteHeader />
    <section className="hero">
      <div className="hero-copy">
        <p className="kicker"><span>●</span> 持续生长的面试知识系统</p>
        <h1>把零散的准备，<br />连成一张<span>知识地图。</span></h1>
        <p className="hero-lead">为高级工程师打造的结构化面试题库。沿着知识脉络探索、复习、沉淀，让每一次准备都有迹可循。</p>
        <div className="hero-actions"><a className="primary-button" href="#map">开始探索 <span>↗</span></a><a className="text-button" href="/knowledge/agent-architecture">浏览全部题目 <span>→</span></a></div>
        <div className="stats"><div><b>90</b><span>知识节点</span></div><div><b>4</b><span>核心领域</span></div><div><b>12h</b><span>本周学习</span></div></div>
      </div>
      <div className="orbit-card" aria-label="知识体系概览">
        <div className="orbit orbit-a"></div><div className="orbit orbit-b"></div><div className="orbit orbit-c"></div>
        <div className="core"><span>Q</span><small>KNOWLEDGE<br/>CORE</small></div>
        <a className="orbit-node node-agent" href="/knowledge/agent-architecture"><i></i><b>Agent / AI</b><small>18 节点</small></a>
        <a className="orbit-node node-project" href="/knowledge/d2c-agent"><i></i><b>项目深挖</b><small>12 节点</small></a>
        <a className="orbit-node node-system" href="/knowledge/frontend-system-design"><i></i><b>系统 / 前端</b><small>24 节点</small></a>
        <a className="orbit-node node-algorithm" href="/knowledge/sliding-window"><i></i><b>算法</b><small>36 节点</small></a>
        <span className="tiny-dot dot-one"></span><span className="tiny-dot dot-two"></span><span className="tiny-dot dot-three"></span>
      </div>
    </section>

    <section className="map-section" id="map">
      <div className="section-heading"><div><p className="kicker">KNOWLEDGE GRAPH</p><h2>知识图谱</h2></div><p>点击节点，沿着关联路径进入你的知识库。</p></div>
      <div className="category-grid">
        {categories.map((category) => {
          const first = topics.find((topic) => topic.category === category.id);
          return <a href={`/knowledge/${first?.slug}`} className={`category-card ${category.id}`} key={category.id}>
            <div className="category-top"><span>{category.index}</span><i>↗</i></div>
            <div className="category-glyph">{category.id === "agent" ? "✣" : category.id === "project" ? "◇" : category.id === "system" ? "▦" : "⌘"}</div>
            <h3>{category.title}</h3><p>{category.desc}</p>
            <div className="category-foot"><span>{category.count} 个知识节点</span><span className="mini-line"></span></div>
          </a>;
        })}
      </div>
    </section>

    <section className="recent-section" id="progress">
      <div className="section-heading"><div><p className="kicker">CONTINUE LEARNING</p><h2>继续学习</h2></div><a href="/knowledge/agent-architecture">查看全部 <span>→</span></a></div>
      <div className="recent-list">
        {topics.slice(0, 3).map((topic, index) => <a href={`/knowledge/${topic.slug}`} key={topic.slug}><span className={`number ${topic.category}`}>0{index + 1}</span><span className="recent-copy"><small>{topic.eyebrow}</small><b>{topic.title}</b><em>{topic.description}</em></span><span className="progress-ring">{index === 0 ? "72%" : index === 1 ? "38%" : "12%"}</span><i>→</i></a>)}
      </div>
    </section>
    <footer id="about"><a className="brand" href="/"><span className="brand-mark">Q</span><span><b>QUARRY</b><small>面试知识库</small></span></a><p>把经验沉淀成体系，把准备转化为底气。</p><span>持续更新 · 2026</span></footer>
  </main>;
}
