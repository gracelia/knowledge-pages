export type Topic = {
  slug: string;
  category: "agent" | "project" | "system" | "algorithm";
  title: string;
  eyebrow: string;
  description: string;
  readTime: string;
  sections: { id: string; title: string; body: string; bullets?: string[] }[];
};

export const categories = [
  { id: "agent", index: "01", title: "Agent / AI 基础", short: "AGENT / AI", desc: "理解智能体从推理到执行的完整链路", count: 18 },
  { id: "project", index: "02", title: "项目深挖", short: "项目深挖", desc: "把复杂经历讲成有判断力的项目故事", count: 12 },
  { id: "system", index: "03", title: "系统设计 / 前端工程", short: "系统 / 前端", desc: "架构取舍、性能与工程化能力", count: 24 },
  { id: "algorithm", index: "04", title: "算法", short: "算法", desc: "建立高频题型的稳定解题框架", count: 36 },
] as const;

export const topics: Topic[] = [
  {
    slug: "agent-architecture", category: "agent", title: "Agent 架构与编排", eyebrow: "Agent / AI 基础",
    description: "从单 Agent 到多 Agent：职责拆分、控制流与状态管理。", readTime: "8 分钟",
    sections: [
      { id: "definition", title: "什么是 Agent 架构", body: "Agent 架构描述模型如何感知上下文、形成计划、调用工具并根据结果继续决策。面试回答不要停在“LLM + Tool”，而要说清控制权在哪里、状态如何流动、失败如何收敛。" },
      { id: "orchestration", title: "主 Agent 与子 Agent", body: "主 Agent 负责理解目标、拆解任务与验收结果；子 Agent 聚焦边界清晰的专业任务。拆分的核心不是角色数量，而是上下文隔离、能力复用和故障边界。", bullets: ["按领域能力拆分，而不是按页面拆分", "对子任务定义明确输入、输出与超时", "主 Agent 保留最终决策权和用户上下文"] },
      { id: "tradeoffs", title: "常见取舍", body: "单 Agent 链路短、调试简单；多 Agent 更适合复杂并行任务，但会增加延迟、成本和不可预测性。应根据任务复杂度渐进演进，而不是一开始就多 Agent 化。" },
      { id: "interview", title: "面试回答框架", body: "先讲业务目标，再讲为什么需要 Agent；随后画出控制流与状态流，解释关键取舍；最后用评估指标和线上问题证明方案有效。" },
    ],
  },
  {
    slug: "rag-retrieval", category: "agent", title: "RAG：切片、召回与重排", eyebrow: "Agent / AI 基础",
    description: "围绕检索增强生成，建立从数据处理到效果评估的全链路认知。", readTime: "10 分钟",
    sections: [
      { id: "pipeline", title: "RAG 的完整链路", body: "离线侧完成解析、清洗、切片、向量化与索引；在线侧完成查询改写、混合召回、重排、上下文拼装和生成。每一步都应有可观测指标。" },
      { id: "chunking", title: "如何设计切片", body: "切片不是固定字符截断。需要结合文档结构、语义完整性和模型上下文预算，保留标题路径与来源元数据。", bullets: ["结构化文档优先按标题层级切分", "表格和代码块保持整体语义", "用重叠窗口缓解边界信息丢失"] },
      { id: "retrieval", title: "召回与 Rerank", body: "向量召回擅长语义相似，关键词召回擅长专有名词与精确匹配。混合召回提高覆盖率，再用重排模型把相关性强的片段送入上下文。" },
      { id: "evaluation", title: "如何评估", body: "拆开评估检索与生成：关注 Recall@K、MRR、上下文相关性、答案忠实度和任务成功率，同时维护一组覆盖真实失败模式的回归集。" },
    ],
  },
  {
    slug: "d2c-agent", category: "project", title: "D2C 设计稿转码 Agent", eyebrow: "项目深挖",
    description: "把核心 Agent 项目组织成结构清晰、经得住追问的项目故事。", readTime: "12 分钟",
    sections: [
      { id: "context", title: "背景与目标", body: "目标是把设计稿稳定转化为可维护的前端代码，减少从视觉交付到可运行页面之间的大量重复工作。难点不只是生成代码，而是理解设计语义、选择正确组件并保证工程可用。" },
      { id: "architecture", title: "架构设计", body: "主 Agent 负责任务规划和结果验收，根据目标技术栈路由到专业子 Agent；RunContext 贯穿设计数据、组件约束与阶段产物，工具层隔离外部能力。" },
      { id: "hard-parts", title: "关键难点", body: "设计稿信息密度高且存在歧义，需要在视觉还原、组件复用和代码质量之间平衡。通过组件知识检索、阶段化生成与校验闭环降低一次性生成的不确定性。", bullets: ["设计节点到语义组件的映射", "不同技术栈的生成策略隔离", "长上下文压缩与中间产物管理"] },
      { id: "reflection", title: "复盘与演进", body: "下一步应把评估从主观验收升级为多维基准：视觉相似度、组件命中率、代码可运行率和人工修改成本，并用失败样本驱动提示词与工具迭代。" },
    ],
  },
  {
    slug: "frontend-system-design", category: "system", title: "前端系统设计方法", eyebrow: "系统设计 / 前端工程",
    description: "从需求澄清到架构落地，建立可复用的系统设计回答框架。", readTime: "9 分钟",
    sections: [
      { id: "scope", title: "先定义问题边界", body: "先确认用户规模、核心场景、实时性、兼容性和团队约束。系统设计题没有唯一答案，面试官更关注你是否能主动澄清并做有依据的取舍。" },
      { id: "layers", title: "分层思考", body: "从客户端体验、数据流、接口层、缓存与存储、部署和可观测性逐层展开。前端侧还要覆盖状态管理、组件边界、资源加载与异常恢复。" },
      { id: "quality", title: "非功能性要求", body: "把性能、稳定性、安全、可访问性和可维护性变成可验证目标，而不是口号。", bullets: ["核心体验指标与性能预算", "灰度、降级和错误隔离", "日志、指标与链路追踪"] },
      { id: "answer", title: "表达顺序", body: "需求与约束 → 核心数据模型 → 高层架构 → 关键链路 → 瓶颈与取舍 → 演进路线。每一层都回扣最初目标。" },
    ],
  },
  {
    slug: "sliding-window", category: "algorithm", title: "滑动窗口", eyebrow: "算法",
    description: "识别连续区间题型，用一套模板处理窗口扩张与收缩。", readTime: "7 分钟",
    sections: [
      { id: "signal", title: "题型信号", body: "当题目要求在数组或字符串的连续区间中寻找最长、最短或满足条件的子区间时，优先考虑滑动窗口。" },
      { id: "template", title: "通用框架", body: "右指针负责扩张并纳入新元素；当窗口不再合法时移动左指针收缩；在合法时机更新答案。关键是定义窗口状态和合法条件。" },
      { id: "pitfalls", title: "常见错误", body: "最容易错在更新答案的时机、重复元素计数和窗口为空的边界。写代码前先用一句话定义窗口中保存的是什么。", bullets: ["明确是 while 收缩还是 if 收缩", "计数归零后及时移除键", "分清定长窗口与不定长窗口"] },
      { id: "practice", title: "练习路径", body: "从无重复字符的最长子串开始，再练最小覆盖子串、长度最小的子数组，最后处理带权重或多条件约束的变体。" },
    ],
  },
];

export function getTopic(slug: string) { return topics.find((topic) => topic.slug === slug); }
export function getCategory(id: string) { return categories.find((category) => category.id === id); }
