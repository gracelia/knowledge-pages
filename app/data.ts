export type Track = "business" | "technical";

export type Topic = {
  slug: string;
  category: Track;
  group?: string;
  title: string;
  eyebrow: string;
  description: string;
  readTime: string;
  sections: { id: string; title: string; body: string; bullets?: string[] }[];
};

export const categories = [
  { id: "business", index: "01", title: "业务认知", short: "BUSINESS", desc: "站在产品视角理解问题、流程、逻辑与价值，再追问工程如何稳定承接。", count: 7 },
  { id: "technical", index: "02", title: "技术能力", short: "TECHNOLOGY", desc: "从基础能力到系统设计与架构设计，建立可迁移、可落地的工程能力。", count: 25 },
] as const;

export const technicalTopicGroups = ["AI / Agent 基础", "前端", "后端", "数据 / 网络 / 安全", "系统设计", "架构设计"] as const;

export const businessDomains = [
  { title: "金融", example: "花旗软件风控系统", focus: "风险识别、策略决策、合规与审计", slug: "financial-risk-control" },
  { title: "消费", example: "消费者全链路", focus: "需求、决策、购买、履约与复购", slug: "consumer-business" },
  { title: "零售", example: "百胜中国", focus: "门店、商品、库存、交易与会员", slug: "retail-business" },
  { title: "能源", example: "供暖项目", focus: "供需调度、设备运行、能效与安全", slug: "heating-energy" },
  { title: "医疗器械", example: "器械匀速相关", focus: "设备控制、临床流程、质量与合规", slug: "medical-device" },
  { title: "AI 应用平台", example: "行业全流程模型方案", focus: "场景抽象、模型编排、交付与效果闭环", slug: "ai-application-platform" },
  { title: "搜索", example: "搜索产品", focus: "意图理解、召回排序、体验与商业价值", slug: "search-business" },
] as const;

export const technicalGroups = [
  { title: "基础能力", description: "理解原理、职责边界与常见取舍", items: ["AI / Agent：规划、LangChain、Tool、RAG", "前端：JavaScript、React、浏览器原理", "后端：Java、Spring Boot、FastAPI、并发与 IO", "数据库：MySQL、MongoDB、向量数据库", "网络与安全：HTTP、SSE、XSS", "算法与数据结构基础"] },
  { title: "工程能力 · 系统设计", description: "从需求和约束出发，设计可演进的系统", items: ["权限管理与身份体系", "文件与对象存储系统", "协同编辑器系统", "部署与发布平台", "埋点与数据采集系统", "组件库与设计系统", "检索 / 搜索系统", "可观测性与稳定性体系"] },
  { title: "架构能力", description: "处理跨模块、跨团队和长期演进问题", items: ["AI 助手架构", "AI 应用平台架构", "微前端与前端平台化", "微服务与分布式架构", "高可用、弹性与容灾", "业务迭代下的架构演进"] },
] as const;

const businessTemplate = (problem: string, flow: string, value: string, engineering: string) => [
  { id: "problem", title: "核心问题", body: problem },
  { id: "flow", title: "业务流程与关键角色", body: flow },
  { id: "logic", title: "术语、规则与业务逻辑", body: "沉淀领域术语、核心实体、状态流转、规则边界与异常分支。重点说明规则为何存在，以及规则变化会影响哪些角色与环节。" },
  { id: "value", title: "业务价值与衡量", body: value },
  { id: "engineering", title: "工程如何承接", body: engineering, bullets: ["识别一致性、时效性、规模与合规约束", "将高频变化隔离为可配置规则或稳定领域模型", "用监控、降级、灰度和审计承接稳定性要求"] },
];

export const topics: Topic[] = [
  { slug: "financial-risk-control", category: "business", title: "金融 · 风控系统", eyebrow: "业务认知 / 传统行业", description: "从风险识别到策略决策，理解风控系统为何存在、如何创造价值。", readTime: "12 分钟", sections: businessTemplate("在控制信用、欺诈与合规风险的同时，尽量减少对正常客户体验和业务增长的误伤。", "客户或交易进入 → 数据与特征准备 → 规则 / 模型判断 → 审批、拦截或人工复核 → 结果反馈与策略迭代。", "用损失率、通过率、误杀率、审批时延、人工复核成本等指标平衡风险与增长。", "核心难点是低延迟决策、数据一致性、规则可解释、全链路审计，以及策略快速迭代时不破坏线上稳定性。") },
  { slug: "consumer-business", category: "business", title: "消费 · 用户全链路", eyebrow: "业务认知 / 传统行业", description: "围绕消费者从产生需求到复购的完整旅程理解产品价值。", readTime: "9 分钟", sections: businessTemplate("降低用户发现、决策和购买的成本，并持续建立信任和复购。", "触达 → 浏览与比较 → 决策 → 交易 → 履约 → 售后 → 复购与推荐。", "关注转化率、客单价、履约体验、留存、复购和客户终身价值。", "工程侧要支撑用户身份、商品内容、交易履约和增长实验的协同，同时避免局部优化损害整体体验。") },
  { slug: "retail-business", category: "business", title: "零售 · 门店与会员", eyebrow: "业务认知 / 传统行业", description: "以百胜中国等连锁零售场景理解人、货、场的协同。", readTime: "11 分钟", sections: businessTemplate("在多门店、多渠道下，让商品供给、库存、交易和履约高效协同。", "选品与定价 → 采购与库存 → 到店 / 到家交易 → 制作或拣货 → 履约 → 会员运营。", "关注同店增长、库存周转、缺货率、履约时长、会员复购与门店效率。", "峰值交易、库存一致性、门店弱网、多渠道订单编排和区域差异化配置是核心工程难点。") },
  { slug: "heating-energy", category: "business", title: "能源 · 智慧供暖", eyebrow: "业务认知 / 传统行业", description: "理解热源、管网、站点与用户之间的供需和调度。", readTime: "10 分钟", sections: businessTemplate("在满足室温与安全要求的前提下，降低能源消耗和人工运维成本。", "气象与需求预测 → 热源生产 → 管网输送 → 换热站调节 → 用户供热 → 监测与反馈。", "关注达标率、单位面积能耗、故障时长、投诉率和调度效率。", "工程需面对设备协议异构、时序数据、边缘断网、控制安全，以及算法建议与人工调度之间的责任边界。") },
  { slug: "medical-device", category: "business", title: "医疗器械 · 设备控制", eyebrow: "业务认知 / 传统行业", description: "从临床使用与质量合规出发理解器械控制类产品。", readTime: "10 分钟", sections: businessTemplate("让设备在明确适用范围内稳定、准确、可追溯地完成临床或辅助任务。", "参数配置 → 自检与校准 → 运行控制 → 实时监测 → 告警与处置 → 记录留存。", "价值由准确性、稳定性、操作效率、安全事件率和可追溯性共同衡量。", "实时控制、软硬件协同、异常保护、数据完整性和变更验证通常比功能丰富度更重要。") },
  { slug: "ai-application-platform", category: "business", title: "AI 应用平台", eyebrow: "业务认知 / 科技行业", description: "面向多行业定制全流程模型方案，沉淀平台化价值。", readTime: "12 分钟", sections: businessTemplate("把行业问题转化为可交付、可评估、可持续优化的 AI 工作流，而不只是一次模型调用。", "场景诊断 → 数据与知识接入 → 模型 / 工具编排 → 评估验收 → 发布运营 → 反馈迭代。", "关注交付周期、任务成功率、人工节省、推理成本、复用率和客户业务指标改善。", "难点在于行业差异与平台复用的平衡、模型不确定性、数据权限、全链路评估以及模型升级时的稳定迁移。") },
  { slug: "search-business", category: "business", title: "搜索 · 信息获取", eyebrow: "业务认知 / 科技行业", description: "从用户意图到结果满意度，理解搜索的产品逻辑。", readTime: "10 分钟", sections: businessTemplate("帮助用户以更低成本获得可信、相关且可行动的信息。", "表达需求 → 意图理解 → 候选召回 → 排序与展现 → 点击 / 转化 → 反馈学习。", "关注成功搜索率、结果相关性、零结果率、改写率、点击满意度与任务完成率。", "工程上要平衡召回率、排序质量、索引新鲜度、延迟和成本，并为不同意图提供可解释的降级路径。") },
  { slug: "agent-architecture", category: "technical", group: "AI / Agent 基础", title: "Agent 基础与架构", eyebrow: "技术能力 / AI / AGENT 基础", description: "规划、工具调用、记忆、评估与 Agent 编排。", readTime: "12 分钟", sections: [
    { id: "model", title: "能力模型", body: "从模型能力、上下文、规划、工具、记忆和反馈闭环理解 Agent。边界不在“是否用了 LLM”，而在控制流如何推进、状态如何管理、失败如何收敛。" },
    { id: "stack", title: "知识清单", body: "规划与任务拆解、LangChain 等编排框架、Tool 协议与权限、RAG 全链路、记忆机制、评估与可观测性。", bullets: ["单 Agent 与多 Agent 的适用边界", "结构化输出、重试与幂等", "模型、延迟、成本与效果取舍"] },
    { id: "engineering", title: "工程化重点", body: "将不确定的模型能力包裹在可验证的流程中：输入输出有契约，工具调用有权限和审计，关键节点可回放，失败时能降级或转人工。" },
    { id: "interview", title: "面试表达", body: "先讲业务目标，再画控制流与状态流；说明为何需要 Agent、关键取舍是什么，最后以离线评估和线上指标证明价值。" },
  ] },
  { slug: "rag-production", category: "technical", group: "AI / Agent 基础", title: "RAG：从检索到生产落地", eyebrow: "技术能力 / AI / AGENT 基础 / RAG", description: "完整掌握数据处理、混合检索、重排、生成、评估与生产优化。", readTime: "28 分钟", sections: [
    { id: "why", title: "为什么需要 RAG", body: "RAG（Retrieval-Augmented Generation，检索增强生成）在生成答案前，先从外部知识库取得证据，再让模型基于证据回答。它主要解决模型知识滞后、企业私有知识不可见和无依据生成的问题。核心变化是从“依赖模型参数记忆知识”转为“运行时查询知识”。", bullets: ["RAG 适合补充频繁更新或私有的事实知识", "微调更适合改变输出风格、行为模式或专项能力", "RAG 能降低幻觉风险，但不能天然消灭幻觉"] },
    { id: "boundary", title: "先分清：RAG、Memory 与 Tool", body: "RAG 解决“去哪里找到回答所需知识”；Memory 解决“如何保留一次任务或长期交互中的状态与偏好”；Tool 解决“如何执行外部动作或获取实时结构化数据”。滑动窗口与摘要记忆属于上下文管理，不是 RAG 的检索效率优化。", bullets: ["RAG：产品文档、代码库、制度与知识检索", "Memory：最近对话、任务状态、用户偏好", "Tool：查数据库、调用 API、执行搜索或修改外部系统"] },
    { id: "architecture", title: "整体架构：离线建库 + 在线问答", body: "离线链路负责把原始资料转成可检索资产：加载 → 解析 → 清洗 → 切片 → 向量化 → 建索引。在线链路负责完成一次问答：查询理解 → 权限与元数据过滤 → 多路召回 → 融合与重排 → 上下文组装 → 生成 → 引用与反馈。两条链路要分别监控、分别评估。", bullets: ["离线关注数据质量、索引新鲜度和增量更新", "在线关注召回质量、端到端延迟、成本和答案可信度", "文档、Chunk、索引版本必须可追踪，才能定位线上问题"] },
    { id: "documents", title: "文档解析与数据治理", body: "RAG 的上限往往由数据质量决定。PDF、Word、HTML、Markdown、表格和代码不能只做纯文本抽取；需要保留标题层级、页码、表格结构、代码块、来源、更新时间、产品线、租户和权限等元数据。重复、过期、冲突文档应在入库前治理。", bullets: ["每个 Chunk 保留 source、page、section_path、version、updated_at", "对表格、代码、FAQ 使用独立解析策略", "建立删除与重建机制，避免索引里长期残留失效知识"] },
    { id: "chunking", title: "Chunk：切片不是固定字数截断", body: "Chunk 决定检索粒度。过大时主题混杂、无关内容多、上下文成本高；过小时语义和因果关系断裂。优先按文档结构、语义段落和内容类型切分，再用适量 overlap 缓解边界信息丢失。300～1000 tokens 只能作为实验起点，不是通用答案。", bullets: ["技术文档按标题、步骤和代码块切分", "FAQ 可按问答对切分，代码按符号或模块切分", "Parent-Child Retrieval：小块负责命中，大块负责补全上下文", "通过评估集比较 chunk_size、overlap 和结构化切片策略"] },
    { id: "embedding-index", title: "Embedding、向量库与 ANN 索引", body: "Embedding 把文本映射到向量空间，语义相近的文本通常距离更近。向量数据库保存向量、原文和元数据，并通过 ANN（近似最近邻）索引避免对全部向量逐一比较。HNSW 查询快、内存开销较高；IVF 先缩小候选区域；PQ 通过压缩降低存储与计算成本。", bullets: ["Embedding 模型要匹配语言、领域和检索任务", "文档与查询必须使用兼容的向量空间", "索引参数是在召回率、延迟、内存和构建成本之间取舍", "模型升级通常需要版本化与重建索引，不能静默替换"] },
    { id: "retrieval", title: "检索：Filter、Hybrid 与 Fusion", body: "纯向量检索擅长语义近似，但对错误码、版本号、产品名和精确术语未必稳定；BM25 等稀疏检索擅长关键词匹配。生产系统常用元数据与权限过滤缩小范围，再并行执行 Dense Retrieval 与 Sparse Retrieval，最后通过 RRF 或加权分数融合候选集。", bullets: ["过滤条件应尽量在检索前执行，而不是召回后再剔除", "Query Rewrite 可补全缩写、指代和领域表达", "多查询扩展能提高召回，但会增加延迟与噪声", "TopK 不是越大越好：它同时影响重排成本和上下文污染"] },
    { id: "rerank", title: "Reranker：先求不漏，再求排准", body: "Retriever 的目标是以较低成本获得高召回候选，例如 Top50；Reranker 再使用 Cross-Encoder 或更强模型对“查询—文档”成对打分，筛出最相关的 Top5。这样能提高排序质量并减少送入 LLM 的噪声，但增加一次模型推理，需要做批处理、缓存和超时降级。", bullets: ["召回阶段优化 Recall，重排阶段优化 Precision 与排序", "重排失败时可回退到融合排序结果", "对重复或高度相似 Chunk 做去重与多样性控制", "最终上下文按来源、顺序和 token 预算组装"] },
    { id: "generation", title: "生成、引用与拒答", body: "生成层需要明确要求模型仅依据给定证据回答，并输出可回溯引用。若检索分数、重排分数或证据覆盖度低于阈值，应触发查询改写、扩大检索、追问用户或明确拒答，而不是让模型基于低质量上下文硬答。", bullets: ["Prompt 明确证据边界和冲突处理规则", "引用应映射到真实文档与页码，而非模型自行生成", "对相互冲突的来源展示版本与时间，并说明不确定性", "Relevance Gate：低相关 → Rewrite / Retry → 仍不足则 No Answer"] },
    { id: "evaluation", title: "评估：拆开看检索与生成", body: "只看最终答案无法判断问题出在检索还是生成。检索侧关注 Recall@K、Precision@K、MRR、NDCG 和权限过滤正确率；生成侧关注 Faithfulness、Answer Relevance、Correctness、引用准确性与完整性；线上还要监控任务成功率、无答案率、用户反馈、P95 延迟和单次成本。", bullets: ["建立包含标准答案、相关文档和困难负样本的评估集", "评估集覆盖同义表达、错误码、多跳问题、过期文档和越权查询", "每次修改切片、Embedding、索引、Prompt 或模型后做回归", "使用线上失败样本持续扩充评估集，而不是只依赖合成问题"] },
    { id: "performance", title: "性能、成本与稳定性", body: "端到端延迟由查询理解、Embedding、过滤、检索、重排和生成共同组成。优化时先用链路指标定位瓶颈，再考虑索引、缓存、并行、批处理、TopK、上下文压缩和模型分层。稳定性设计要包含限流、超时、重试、熔断、降级和索引版本切换。", bullets: ["缓存查询向量、稳定检索结果与热点答案，但要考虑权限和新鲜度", "Dense 与 Sparse 可并行，重排设置独立超时", "索引采用蓝绿版本切换，失败可快速回滚", "为每个阶段记录 trace_id、耗时、候选数量、分数和 token"] },
    { id: "security", title: "企业 RAG 的权限与安全", body: "RAG 可能把原本隔离的私有资料汇聚到同一检索系统，因此权限过滤必须成为检索条件，而不是生成后的文本处理。还要防范 Prompt Injection、恶意文档污染、敏感信息泄露、租户串读和日志中的隐私数据。", bullets: ["Chunk 继承文档 ACL，并在召回前按用户、租户和角色过滤", "不把文档中的指令当作系统指令执行", "入库阶段做内容扫描、来源信任与版本审计", "日志脱敏；对下载、引用和工具调用做二次授权"] },
    { id: "advanced", title: "Advanced RAG：何时值得增加复杂度", body: "Query Rewrite 适合表达模糊或领域术语不统一；HyDE 用模型生成假设性答案再检索，可能改善问题与文档表达空间不一致；Agentic RAG 让 Agent 规划、评估证据并多轮检索，适合复杂、多跳任务。它们都会增加成本和不可预测性，应在基础检索有明确瓶颈且评估证明有效时引入。", bullets: ["Multi-Query：生成多个查询扩大覆盖", "HyDE：以假设文档向量寻找真实文档", "Corrective RAG：评估证据质量后纠正或补检索", "Agentic RAG：Plan → Retrieve → Evaluate → Rewrite → Retrieve"] },
    { id: "demo", title: "项目 Demo：Personal Knowledge Assistant", body: "做一个可上传 PDF / Markdown 的个人知识助手。后端用 FastAPI，前端用 React；离线任务完成解析、结构化切片、Embedding 与向量入库；在线接口执行权限过滤、BM25 + Vector 混合召回、RRF 融合、Rerank、证据门控和带引用回答。项目重点不是跑通调用，而是能测量、解释和迭代。", bullets: ["核心模块：loader、parser、splitter、indexer、retriever、reranker、generator、evaluator", "提供 /documents、/index-jobs、/query、/feedback 与 /evaluation 接口", "记录检索候选、分数、最终上下文、引用、耗时和 token 成本", "准备一组 30～100 条评估问题，对比纯向量、Hybrid、Rerank 的增益"] },
    { id: "interview", title: "面试回答框架与高频追问", body: "回答 RAG 设计题时按“业务目标与知识边界 → 离线 / 在线架构 → 数据与切片 → 检索与重排 → 拒答与权限 → 评估指标 → 性能和演进”展开。任何优化都要说明解决什么失败模式、牺牲什么，以及如何用数据验证。", bullets: ["为什么不用微调？知识更新与私有事实更适合 RAG，能力和风格改变更适合微调", "最大难点是什么？数据质量、召回质量、上下文污染、幻觉与权限", "如何提升效果？数据治理 → Chunk → Filter → Hybrid → Rerank → Evaluation", "如何判断好不好？检索、生成、线上业务与成本指标必须同时观察"] },
  ] },
  { slug: "frontend-foundation", category: "technical", group: "前端", title: "前端基础与工程", eyebrow: "技术能力 / 基础能力", description: "JavaScript、React、浏览器原理、性能与工程化。", readTime: "10 分钟", sections: [
    { id: "language", title: "JavaScript", body: "执行上下文、作用域、原型、异步模型、事件循环、模块化与类型系统。" },
    { id: "react", title: "React", body: "渲染模型、状态与副作用、组件边界、并发特性、服务端与客户端职责。" },
    { id: "browser", title: "浏览器原理", body: "导航、解析、渲染流水线、网络调度、缓存、安全边界和性能指标。" },
    { id: "engineering", title: "工程化", body: "构建、测试、监控、性能预算、灰度发布和可访问性，最终都应回到用户体验和团队交付效率。" },
  ] },
  { slug: "backend-foundation", category: "technical", group: "后端", title: "后端与分布式基础", eyebrow: "技术能力 / 基础能力", description: "Java、Spring Boot、FastAPI、并发、IO 与分布式。", readTime: "12 分钟", sections: [
    { id: "runtime", title: "语言与运行时", body: "Java / Python 语法、内存模型、异常、集合、泛型和运行时机制。" },
    { id: "framework", title: "框架与职责边界", body: "Spring Boot、FastAPI 的请求链路、依赖注入、生命周期、中间件、事务和错误处理。" },
    { id: "concurrency", title: "并发与 IO", body: "线程、线程池、锁、异步 IO、背压与资源隔离，并理解吞吐、延迟和一致性的取舍。" },
    { id: "distributed", title: "分布式基础", body: "缓存、消息、幂等、分布式事务、一致性、限流、熔断与故障恢复。" },
  ] },
  { slug: "data-network-security", category: "technical", group: "数据 / 网络 / 安全", title: "数据、网络与安全", eyebrow: "技术能力 / 基础能力", description: "数据库、网络协议、安全与算法的共同底座。", readTime: "12 分钟", sections: [
    { id: "database", title: "数据库", body: "MySQL、MongoDB 与向量数据库的数据模型、索引、事务、查询和适用边界。" },
    { id: "network", title: "网络协议", body: "HTTP、长连接、SSE、WebSocket、缓存与代理，理解一次请求从客户端到服务端的完整链路。" },
    { id: "security", title: "安全", body: "XSS（常误写为 XXS）、CSRF、注入、鉴权、密钥与数据保护；安全应进入设计阶段，而不是上线前补丁。" },
    { id: "algorithm", title: "算法基础", body: "数组、链表、树、图、哈希、堆、排序、搜索、动态规划与复杂度分析。" },
  ] },
  { slug: "system-design", category: "technical", group: "系统设计", title: "系统设计方法", eyebrow: "技术能力 / 工程能力", description: "权限、文件、编辑器、部署、埋点和组件系统的统一设计框架。", readTime: "14 分钟", sections: [
    { id: "method", title: "统一方法", body: "需求与约束 → 核心角色和流程 → 数据模型 → 高层架构 → 关键链路 → 非功能目标 → 取舍与演进。" },
    { id: "systems", title: "重点题目", body: "权限管理、文件系统、协同编辑器、部署平台、埋点平台、组件库与设计系统。", bullets: ["补充：检索 / 搜索系统", "补充：通知与任务调度系统", "补充：可观测性与稳定性平台"] },
    { id: "quality", title: "稳定承接业务", body: "把容量、延迟、一致性、安全、灰度、降级、容灾、可观测性和成本转化为可验证目标。" },
    { id: "evolution", title: "承接业务迭代", body: "识别稳定内核与高频变化点，通过领域建模、配置化、契约和版本机制控制变化扩散。" },
  ] },
  { slug: "architecture-design", category: "technical", group: "架构设计", title: "架构设计与演进", eyebrow: "技术能力 / 架构能力", description: "AI 助手、AI 平台、微前端、微服务与高可用架构。", readTime: "14 分钟", sections: [
    { id: "scope", title: "架构关注什么", body: "架构处理的是跨模块、跨团队和长期演进问题：边界、依赖、质量属性、交付方式和组织协作。" },
    { id: "ai", title: "AI 架构", body: "AI 助手关注上下文、编排、工具、记忆、评估和安全；AI 应用平台还要解决多租户、资产复用、模型治理与行业交付。" },
    { id: "frameworks", title: "常用架构形态", body: "微前端、模块化单体、微服务、事件驱动与分层架构。先说明问题，再选择形态，避免为了架构而架构。" },
    { id: "evolution", title: "演进原则", body: "以当前约束下的最小可行架构起步，用指标识别瓶颈；通过清晰边界和迁移路径渐进拆分。" },
  ] },
];

export function getTopic(slug: string) { return topics.find((topic) => topic.slug === slug); }
export function getCategory(id: string) { return categories.find((category) => category.id === id); }
