export type Track = "business" | "technical";

export type Topic = {
  slug: string;
  category: Track;
  group?: string;
  title: string;
  eyebrow: string;
  description: string;
  readTime: string;
};

export const categories = [
  {
    "id": "business",
    "index": "01",
    "title": "业务认知",
    "short": "BUSINESS",
    "desc": "站在产品视角理解问题、流程、逻辑与价值，再追问工程如何稳定承接。",
    "count": 7
  },
  {
    "id": "technical",
    "index": "02",
    "title": "技术能力",
    "short": "TECHNOLOGY",
    "desc": "从基础能力到系统设计与架构设计，建立可迁移、可落地的工程能力。",
    "count": 25
  }
] as const;

export const technicalTopicGroups = [
  "AI / Agent 基础",
  "前端",
  "后端",
  "数据 / 网络 / 安全",
  "系统设计",
  "架构设计"
] as const;

export const businessDomains = [
  {
    "title": "金融",
    "example": "银行风控系统",
    "focus": "风险识别、策略决策、合规与审计",
    "slug": "financial-risk-control"
  },
  {
    "title": "消费",
    "example": "消费者全链路",
    "focus": "需求、决策、购买、履约与复购",
    "slug": "consumer-business"
  },
  {
    "title": "零售",
    "example": "百胜中国",
    "focus": "门店、商品、库存、交易与会员",
    "slug": "retail-business"
  },
  {
    "title": "能源",
    "example": "供暖项目",
    "focus": "供需调度、设备运行、能效与安全",
    "slug": "heating-energy"
  },
  {
    "title": "医疗器械",
    "example": "器械匀速相关",
    "focus": "设备控制、临床流程、质量与合规",
    "slug": "medical-device"
  },
  {
    "title": "AI 应用平台",
    "example": "行业全流程模型方案",
    "focus": "场景抽象、模型编排、交付与效果闭环",
    "slug": "ai-application-platform"
  },
  {
    "title": "搜索",
    "example": "搜索产品",
    "focus": "意图理解、召回排序、体验与商业价值",
    "slug": "search-business"
  }
] as const;

export const technicalGroups = [
  {
    "title": "基础能力",
    "description": "理解原理、职责边界与常见取舍",
    "items": [
      "AI / Agent：规划、LangChain、Tool、RAG",
      "前端：JavaScript、React、浏览器原理",
      "后端：Java、Spring Boot、FastAPI、并发与 IO",
      "数据库：MySQL、MongoDB、向量数据库",
      "网络与安全：HTTP、SSE、XSS",
      "算法与数据结构基础"
    ]
  },
  {
    "title": "工程能力 · 系统设计",
    "description": "从需求和约束出发，设计可演进的系统",
    "items": [
      "权限管理与身份体系",
      "文件与对象存储系统",
      "协同编辑器系统",
      "部署与发布平台",
      "埋点与数据采集系统",
      "组件库与设计系统",
      "检索 / 搜索系统",
      "可观测性与稳定性体系"
    ]
  },
  {
    "title": "架构能力",
    "description": "处理跨模块、跨团队和长期演进问题",
    "items": [
      "AI 助手架构",
      "AI 应用平台架构",
      "微前端与前端平台化",
      "微服务与分布式架构",
      "高可用、弹性与容灾",
      "业务迭代下的架构演进"
    ]
  }
] as const;

export const topics: Topic[] = [
  {
    "slug": "financial-risk-control",
    "category": "business",
    "title": "金融 · 风控系统",
    "eyebrow": "业务认知 / 传统行业",
    "description": "从风险识别到策略决策，理解风控系统为何存在、如何创造价值。",
    "readTime": "12 分钟"
  },
  {
    "slug": "consumer-business",
    "category": "business",
    "title": "消费 · 用户全链路",
    "eyebrow": "业务认知 / 传统行业",
    "description": "围绕消费者从产生需求到复购的完整旅程理解产品价值。",
    "readTime": "9 分钟"
  },
  {
    "slug": "retail-business",
    "category": "business",
    "title": "零售 · 门店与会员",
    "eyebrow": "业务认知 / 传统行业",
    "description": "以百胜中国等连锁零售场景理解人、货、场的协同。",
    "readTime": "11 分钟"
  },
  {
    "slug": "heating-energy",
    "category": "business",
    "title": "能源 · 智慧供暖",
    "eyebrow": "业务认知 / 传统行业",
    "description": "理解热源、管网、站点与用户之间的供需和调度。",
    "readTime": "10 分钟"
  },
  {
    "slug": "medical-device",
    "category": "business",
    "title": "医疗器械 · 设备控制",
    "eyebrow": "业务认知 / 传统行业",
    "description": "从临床使用与质量合规出发理解器械控制类产品。",
    "readTime": "10 分钟"
  },
  {
    "slug": "ai-application-platform",
    "category": "business",
    "title": "AI 应用平台",
    "eyebrow": "业务认知 / 科技行业",
    "description": "面向多行业定制全流程模型方案，沉淀平台化价值。",
    "readTime": "12 分钟"
  },
  {
    "slug": "search-business",
    "category": "business",
    "title": "搜索 · 信息获取",
    "eyebrow": "业务认知 / 科技行业",
    "description": "从用户意图到结果满意度，理解搜索的产品逻辑。",
    "readTime": "10 分钟"
  },
  {
    "slug": "agent-architecture",
    "category": "technical",
    "group": "AI / Agent 基础",
    "title": "Agent 基础与架构",
    "eyebrow": "技术能力 / AI / AGENT 基础",
    "description": "规划、工具调用、记忆、评估与 Agent 编排。",
    "readTime": "12 分钟"
  },
  {
    "slug": "rag-production",
    "category": "technical",
    "group": "AI / Agent 基础",
    "title": "RAG：从检索到生产落地",
    "eyebrow": "技术能力 / AI / AGENT 基础 / RAG",
    "description": "完整掌握数据处理、混合检索、重排、生成、评估与生产优化。",
    "readTime": "28 分钟"
  },
  {
    "slug": "openclaw-architecture",
    "category": "technical",
    "group": "架构设计",
    "title": "OpenClaw 架构深度研究",
    "eyebrow": "技术能力 / 架构设计 / AI 助手",
    "description": "从 Gateway、Agent Runtime、多通道、插件、MCP、上下文压缩与安全体系，拆解本地优先 AI 助手架构。",
    "readTime": "35 分钟"
  },
  {
    "slug": "deepseek-harness-architecture",
    "category": "technical",
    "group": "架构设计",
    "title": "DeepSeek Harness 架构深度研究",
    "eyebrow": "技术能力 / 架构设计 / AGENT HARNESS",
    "description": "围绕 Cordis、Capability Seam、Agent Loop、事件溯源、沙箱、子代理与扩展生态，拆解插件式 Agent Harness。",
    "readTime": "40 分钟"
  },
  {
    "slug": "frontend-foundation",
    "category": "technical",
    "group": "前端",
    "title": "前端基础与工程",
    "eyebrow": "技术能力 / 基础能力",
    "description": "JavaScript、React、浏览器原理、性能与工程化。",
    "readTime": "10 分钟"
  },
  {
    "slug": "backend-foundation",
    "category": "technical",
    "group": "后端",
    "title": "后端与分布式基础",
    "eyebrow": "技术能力 / 基础能力",
    "description": "Java、Spring Boot、FastAPI、并发、IO 与分布式。",
    "readTime": "12 分钟"
  },
  {
    "slug": "data-network-security",
    "category": "technical",
    "group": "数据 / 网络 / 安全",
    "title": "数据、网络与安全",
    "eyebrow": "技术能力 / 基础能力",
    "description": "数据库、网络协议、安全与算法的共同底座。",
    "readTime": "12 分钟"
  },
  {
    "slug": "system-design",
    "category": "technical",
    "group": "系统设计",
    "title": "系统设计方法",
    "eyebrow": "技术能力 / 工程能力",
    "description": "权限、文件、编辑器、部署、埋点和组件系统的统一设计框架。",
    "readTime": "14 分钟"
  },
  {
    "slug": "architecture-design",
    "category": "technical",
    "group": "架构设计",
    "title": "架构设计与演进",
    "eyebrow": "技术能力 / 架构能力",
    "description": "AI 助手、AI 平台、微前端、微服务与高可用架构。",
    "readTime": "14 分钟"
  }
];

export function getTopic(slug: string) { return topics.find((topic) => topic.slug === slug); }
export function getCategory(id: string) { return categories.find((category) => category.id === id); }
