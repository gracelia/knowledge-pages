import { businessDomains, technicalGroups, topics } from "./data";
import { SiteHeader } from "./SiteHeader";

export default function Home() {
  const businessFirst = topics.find((topic) => topic.category === "business")!;
  const technicalFirst = topics.find((topic) => topic.category === "technical")!;
  return <main>
    <SiteHeader />
    <section className="hero split-hero">
      <div className="hero-copy">
        <p className="kicker"><span>●</span> 工程师的双线知识系统</p>
        <h1>懂技术，也懂<br /><span>为何而做。</span></h1>
        <p className="hero-lead">好的工程师不仅知道系统怎么建，也能判断产品是否解决了真正的问题。以产品视角理解业务，以工程视角稳定承接业务。</p>
        <div className="hero-actions"><a className="primary-button" href="#map">查看知识框架 <span>↓</span></a><a className="text-button" href="/knowledge/financial-risk-control">从业务开始 <span>→</span></a></div>
        <div className="stats"><div><b>2</b><span>一级主线</span></div><div><b>7</b><span>业务领域</span></div><div><b>3</b><span>技术层级</span></div></div>
      </div>
      <div className="dual-core" aria-label="业务与技术双线知识体系">
        <div className="track-panel business-panel"><span className="track-index">01 / BUSINESS</span><h2>业务认知</h2><p>问题 · 流程 · 术语 · 逻辑 · 价值</p><div className="track-tags"><span>传统行业</span><span>科技行业</span><span>产品视角</span></div><a href={`/knowledge/${businessFirst.slug}`}>进入业务知识 →</a></div>
        <div className="bridge"><span>业务问题</span><i>↔</i><span>工程承接</span></div>
        <div className="track-panel technical-panel"><span className="track-index">02 / TECHNOLOGY</span><h2>技术能力</h2><p>基础 · 系统设计 · 架构演进</p><div className="track-tags"><span>原理</span><span>取舍</span><span>稳定性</span></div><a href={`/knowledge/${technicalFirst.slug}`}>进入技术知识 →</a></div>
      </div>
    </section>

    <section className="map-section" id="map">
      <div className="section-heading"><div><p className="kicker">BUSINESS KNOWLEDGE</p><h2>业务认知 · 产品视角</h2></div><p>每个领域都按同一套骨架沉淀，并补充工程承接与技术难点。</p></div>
      <div className="business-framework"><span>核心问题</span><i>→</i><span>业务流程</span><i>→</i><span>术语与逻辑</span><i>→</i><span>业务价值</span><i>→</i><strong>工程承接</strong></div>
      <div className="domain-grid">
        {businessDomains.map((domain, index) => <a className="domain-card" href={`/knowledge/${domain.slug}`} key={domain.slug}><span>0{index + 1}</span><small>{index < 5 ? "传统行业" : "科技行业"}</small><h3>{domain.title}</h3><b>{domain.example}</b><p>{domain.focus}</p><i>↗</i></a>)}
      </div>
    </section>

    <section className="technical-section">
      <div className="section-heading"><div><p className="kicker">TECHNICAL KNOWLEDGE</p><h2>技术能力 · 工程师视角</h2></div><p>先打牢原理，再训练系统设计，最终形成架构判断力。</p></div>
      <div className="technical-ladder">
        {technicalGroups.map((group, index) => <article key={group.title}><span className="ladder-number">0{index + 1}</span><div><small>{index === 0 ? "FOUNDATION" : index === 1 ? "SYSTEM DESIGN" : "ARCHITECTURE"}</small><h3>{group.title}</h3><p>{group.description}</p></div><ul>{group.items.map((item) => <li key={item}>{item}</li>)}</ul></article>)}
      </div>
      <div className="technical-links"><a href="/knowledge/agent-architecture">AI / Agent →</a><a href="/knowledge/frontend-foundation">前端 →</a><a href="/knowledge/backend-foundation">后端 →</a><a href="/knowledge/data-network-security">数据 / 网络 / 安全 →</a><a href="/knowledge/system-design">系统设计 →</a><a href="/knowledge/architecture-design">架构设计 →</a></div>
    </section>

    <section className="method-section" id="progress"><p className="kicker">HOW TO GROW</p><h2>后续内容如何持续落盘</h2><div className="method-grid"><div><b>01</b><h3>先挂框架</h3><p>新项目或新知识先归入业务 / 技术主线，明确层级和边界。</p></div><div><b>02</b><h3>再填案例</h3><p>面试复盘后补充真实问题、方案、取舍、指标与失败经验。</p></div><div><b>03</b><h3>建立连接</h3><p>把业务问题连接到系统设计，把技术方案回扣到业务价值。</p></div><div><b>04</b><h3>持续校正</h3><p>用追问和线上反馈暴露薄弱点，更新术语、逻辑和架构演进。</p></div></div></section>
    <footer id="about"><a className="brand" href="/"><span className="brand-mark">Q</span><span><b>QUARRY</b><small>面试知识库</small></span></a><p>理解价值，再设计系统。</p><span>持续更新 · 2026</span></footer>
  </main>;
}
