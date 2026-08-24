# OpenClaw 架构深度研究报告

> **研究对象**：[openclaw/openclaw](https://github.com/openclaw/openclaw)（commit `6b3f7272`，版本 2026.8.1）
> **数据来源**：GitHub 仓库源码、README.md、package.json、[DeepWiki 技术文档](https://deepwiki.com/openclaw/openclaw)（2026 年 8 月 20 日索引）
> **报告日期**：2026 年 8 月 24 日

---

## 目录

1. [项目概述与设计理念](#1-项目概述与设计理念)
2. [系统架构总览](#2-系统架构总览)
3. [Gateway 深度解析](#3-gateway-深度解析)
4. [Agent 执行引擎与执行管线](#4-agent-执行引擎与执行管线)
5. [系统提示词与上下文管理](#5-系统提示词与上下文管理)
6. [多通道架构](#6-多通道架构)
7. [工具系统](#7-工具系统)
8. [模型提供商与认证体系](#8-模型提供商与认证体系)
9. [多智能体路由与 ACP 子代理](#9-多智能体路由与-acp-子代理)
10. [插件架构与生命周期](#10-插件架构与生命周期)
11. [Plugin SDK 与类型共享](#11-plugin-sdk-与类型共享)
12. [Plugin Registry 注册表与配置启用](#12-plugin-registry-注册表与配置启用)
13. [MCP 集成与 Skills 系统](#13-mcp-集成与-skills-系统)
14. [命令系统与自动回复](#14-命令系统与自动回复)
15. [自动化与定时任务](#15-自动化与定时任务)
16. [上下文压缩机制](#16-上下文压缩机制)
17. [安全架构](#17-安全架构)
18. [节点系统与原生客户端](#18-节点系统与原生客户端)
19. [关键设计决策](#19-关键设计决策)
20. [构建与发布系统](#20-构建与发布系统)
21. [挑战与展望](#21-挑战与展望)

---

## 1. 项目概述与设计理念

### 1.1 项目定位

OpenClaw 是一个开源的多平台 AI 网关与个人助手框架，采用 TypeScript 编写，以本地优先（local-first）为核心理念。项目版本为 2026.8.1，采用 MIT 许可证，在 GitHub 上获得了超过 387k stars 的关注。OpenClaw 的核心目标是构建一个统一的 AI 助手平台，将多种 LLM 提供商（Anthropic、OpenAI、Google Gemini、Ollama 等）抽象为统一接口，同时支持通过 Telegram、Discord、Slack 等消息通道与用户交互。项目的 monorepo 采用 pnpm workspace 组织方式，内置完整的 Gateway 控制平面、Agent Runtime 执行引擎、Plugin SDK 扩展框架和多平台原生客户端，形成了一个从后端到前端、从服务到客户端的完整生态。

### 1.2 设计理念

OpenClaw 的设计围绕以下核心理念展开：

- **个人助手信任模型（Personal Assistant Trust Model）**：系统假设单一信任操作者（single trusted operator），所有安全机制围绕"保护用户免受 agent 意外行为伤害"而非"多租户隔离"设计。这一决策从根本上简化了安全架构，使开发团队能够将精力集中在 agent 行为安全和工具执行安全上。
- **本地优先**：数据存储在本地（SQLite/JSONL），Gateway 运行在用户控制的机器上，减少对云服务的依赖。会话历史、凭证信息、插件配置等敏感数据始终留在用户设备上。
- **可扩展性**：通过插件系统、MCP 集成和 Skills 系统，允许社区扩展 agent 能力。插件可以添加新的工具、通道、模型提供商、命令和技能，形成开放的生态系统。
- **多通道接入**：同一 agent 可通过 WebSocket（Web UI）、Telegram、Discord、Slack 等多个通道与用户交互，每个通道以插件形式实现，遵循统一的 Ingress → Resolution → Egress 生命周期。
- **多模型支持**：支持主流 LLM 提供商，通过 Provider Normalization 层抹平差异。Transport Stream 归一化机制将不同提供商的流式响应统一为内部 assistant 事件格式。

### 1.3 项目结构

OpenClaw 采用 monorepo + pnpm workspace 组织方式，主要目录及其职责如下：

| 目录 | 说明 |
|------|------|
| `src/` | 核心源码（Gateway、Agent Runtime、Sessions、Cron、Plugins 等） |
| `packages/` | 可复用包（ai、agent-core、gateway-protocol、llm-core、plugin-sdk 等） |
| `extensions/` | 扩展模块（codex、google、ollama、github-copilot、memory-core、discord、slack、whatsapp 等） |
| `ui/` | Web 控制面板与 WebChat 前端（React 组件库） |
| `docs/` | 项目文档（plugins/、tools/、automation/、gateway/ 等） |
| `test/` | 测试固件与场景包（fixtures/、helpers/、scripts/ 等） |
| `qa/` | QA 实验室与场景包（YAML 格式的场景定义） |

根据 package.json 文件，项目的 schema 版本为 state: 9、agent: 17，表明数据 schema 经历了多次迭代演化。项目内置了大量测试脚本，包括 `test:e2e`（端到端测试）、`test:gateway`（Gateway 集成测试）等，体现了对代码质量的重视。

---

## 2. 系统架构总览

### 2.1 架构层次

OpenClaw 的系统架构从上到下可分为以下层次：

**Native Clients 层**：iOS/macOS（Swift）、Android（Kotlin）、Linux（原生）、Web UI（React）、TUI（终端界面）等多种客户端形态，通过 WebSocket 或 HTTP API 与 Gateway 通信。

**Gateway 层**：系统的控制平面，包含 WebSocket Protocol & RPC（双向实时通信）、HTTP API Routes（RESTful 接口，兼容 OpenAI API 格式）、Cron Scheduler（定时任务调度器）、Control UI & WebChat（Web 管理界面）四个主要子模块。其下层是 Session & State Management（会话与状态管理），负责 Multi-Agent Routing（多智能体路由）和 Session Scoping（会话作用域管理）。

**Agent Runtime 层**：执行引擎层，包含 Execution Pipeline（执行管线）、System Prompt（系统提示词构建）、Tools System（工具系统）、Model Providers（模型提供商适配）四个核心模块，以及 Context Compaction（上下文压缩）、Commands & Auto-Reply（命令与自动回复）、Automation & Cron（自动化与定时任务）、ACP & Sub-Agents（ACP 与子代理）四个辅助模块。

**Extensions & Plugins 层**：插件与扩展层，包含 Plugin Registry（插件注册表）、Skills（技能系统）、MCP（Model Context Protocol 集成）、Channels（消息通道插件）。

**Security & Sandboxing 层**：安全与沙箱层，包含 Trust Boundaries（信任边界）、Audit（审计系统）、Secret Management（密钥管理）、Isolation（隔离机制）。

### 2.2 核心概念

根据 DeepWiki Core Concepts 页面，OpenClaw 的核心概念包括：

**Gateway**：系统的控制平面，扮演三个角色——**Crestodian**（守护者，管理凭证和认证，确保只有授权用户和设备可以访问系统）、**Delegate**（委托者，将请求路由到正确的 agent session，处理多智能体分发）、**Doctor**（诊断者，执行健康检查和自我修复，通过 bundled-health-checks 模块监控系统状态）。

**Agents**：执行 AI 任务的实体，通过 `buildAgentSystemPrompt` 函数动态构建系统提示词，支持通过 ACP `sessions_spawn` 创建子代理来委派任务。每个 agent 拥有独立的工作区（`workspace-<agentId>`）和状态存储（`agents/<agentId>/`）。

**Sessions**：会话管理单元，支持 per-sender（每发送者独立会话，适用于 Telegram/Discord 等多用户通道）、shared（共享会话，适用于团队协作场景）、global（全局唯一会话，适用于单用户本地场景）三种作用域。底层使用 SQLite 和 JSONL 存储会话数据，支持 Compaction（压缩）机制在上下文超限时自动摘要历史。

**Channels**：消息通道，以插件形式实现，处理 Ingress（入站消息接收）→ Resolution（消息解析与会话关联）→ Egress（响应发送回外部平台）三个阶段。ChannelManager 管理所有通道的完整生命周期。

**Tools & Skills**：通过 `createOpenClawTools` 函数组装工具集，`skill_workshop` 管理技能定义和加载，`active-memory` 维护 agent 的活跃记忆，支持跨会话知识保留。

**Trust Model**：单用户信任模型，支持 token（令牌认证）、password（密码认证）、none（无认证，仅本地使用）三种认证方式，配合沙箱隔离和工具策略管线确保 agent 行为安全。

### 2.3 平台架构

OpenClaw 支持多种部署形态，覆盖从服务器到移动设备的全平台：

| 平台 | 技术栈 | 说明 |
|------|--------|------|
| Server | Node.js + TypeScript | 核心服务进程，承载 Gateway 和 Agent Runtime |
| Web | React | 浏览器端 Control UI 和 WebChat |
| iOS & macOS | Swift | 原生 Apple 平台客户端 |
| Android | Kotlin | 原生 Android 客户端 |
| Linux | 原生 | Linux 桌面伴侣应用 |
| Container | Docker | 容器化部署，使用多阶段 Dockerfile |

---

## 3. Gateway 深度解析

### 3.1 Gateway 控制平面

Gateway 是 OpenClaw 的核心控制平面，负责接收来自各通道的请求、路由到正确的 agent session、管理生命周期和状态。Gateway 的核心组件包括：

- **WebSocket Protocol & RPC**：通过 WebSocket 提供双向实时通信，支持 RPC 方法调用，是原生客户端和 Web UI 的主要通信通道。
- **HTTP APIs**：提供 RESTful HTTP 接口，兼容 OpenAI API 格式（`/v1/chat/completions` 等），允许第三方工具无缝接入。
- **Authentication & Authorization**：支持 token、password、none 三种认证模式。设备配对（device pairing）机制用于原生客户端的安全注册。
- **Configuration System**：通过 `openclaw.json` 配置文件管理全局配置，Schema 自动生成并与 Control UI 集成，支持配置热重载。

### 3.2 Session 与状态管理

Session 是 Gateway 的核心状态单元。根据 DeepWiki 文档，session 管理涉及以下关键机制：

**Session Scoping（会话作用域）**：per-sender 模式下每个发送者拥有独立会话，适用于 Telegram/Discord 等多用户通道；shared 模式允许多个发送者共享一个会话，适用于团队协作场景；global 模式使用全局唯一会话，适用于单用户本地场景。

**Session Key 结构**：Session Key 是会话的唯一标识，其结构根据通道和智能体类型有所不同。explicit lane 用于显式指定的会话通道；legacy lane 用于向后兼容的旧式会话通道；ACP lane 是 ACP 子代理专用通道，包含 `subagent` 段以标识子代理命名空间，通过 `isSubagentSessionKey` 函数验证。

**Dispatch Pipeline（分派管线）**：请求从入站到 agent 执行经历以下管线——`resolveSessionStoreKey`（解析会话存储键）→ `resolveGatewaySessionStoreTarget`（解析会话存储目标）→ `loadGatewaySessionEntry`（加载会话条目）→ `replyRunRegistry`（并发控制，确保同一会话不并发执行）。这一管线确保了请求的有序处理和会话状态的一致性。

### 3.3 服务生命周期与诊断

Gateway 内置了完整的诊断系统。Service Lifecycle 管理 Gateway 启动、运行、关闭的全生命周期，包括插件的加载和卸载、定时任务的启动和恢复等。Diagnostics 通过 `ingress-diagnostics` 模块追踪请求从入站到执行的全链路，便于问题定位。Restart Recovery 通过 `buildRestartRecoveryClaimCleanupPatch` 和 `buildCurrentRunRestartRecoveryClaim` 处理 Gateway 崩溃后的会话恢复，确保正在执行的 agent 任务不会因崩溃而丢失。

---

## 4. Agent 执行引擎与执行管线

### 4.1 执行管线概述

根据 DeepWiki Execution Pipeline 页面，OpenClaw 的 agent 执行管线将入站消息转化为模型响应，涵盖指令解析、命令检测、模型选择与回退、认证 Profile 解析、系统提示词构建、工具策略执行、流式响应交付和上下文压缩等完整流程。管线以 `runEmbeddedPiAgent` 生命周期和 `runEmbeddedAttempt` 编排为核心。

**7 个执行阶段**：

| 阶段 | 关键函数 | 职责 |
|------|----------|------|
| Admission（准入） | `prepareReplyRunAdmission` | 验证会话可用性和并发锁 |
| Model Resolution（模型解析） | `resolveQueuedReplyRuntimeConfig` | 选择模型并解析认证凭证 |
| Preparation（准备） | `prepareEmbeddedAttemptSetup` | 设置沙箱环境、加载技能 |
| Execution（执行） | `runEmbeddedAgent` | 编排 turn 生命周期、重试循环 |
| Tool Dispatch（工具分派） | `prepareEmbeddedAttemptToolCatalog` | 执行工具调用、执行策略 |
| Response Processing（响应处理） | `buildEmbeddedRunPayloads` | 流式 delta、错误分类 |
| State Management（状态管理） | `logSessionTurnCreated` | 更新会话历史、清理心跳 |

### 4.2 4 层调用链

执行管线通过嵌套函数调用路由，每层添加重试逻辑、并发控制或错误处理：

- **L1 Dispatch Orchestration**：`dispatchReplyFromConfig` 是 Gateway 消息的入口点，管理高级回复路由和去重。
- **L2 Prepared Reply**：`runPreparedReply` 准备上下文和准入，然后调用执行引擎。
- **L3 Agent Runtime**：`runEmbeddedAgent` 是特定 agent 运行的顶层编排，处理 failover 和流式输出。
- **L4 Attempt Execution**：`runEmbeddedAttempt` 直接与底层模型提供商交互，执行单次网络尝试。

### 4.3 Failover 与上下文管理

管线通过将原始提供商错误映射到内部恢复策略来管理模型级 failover 和上下文溢出：

**错误分类与 Failover**：
- **Context Overflow**：`isContextOverflowError` 检测对话超出模型限制的情况，触发压缩。
- **Model Fallback**：`executeAgentFallbackCycle` 管理主模型和回退模型之间的切换。
- **Auth Profile Rotation**：如果运行因提供商凭证失败，系统可以在可用 profile 之间轮换。

**上下文压缩循环**：当模型发出上下文窗口溢出信号时，`runEmbeddedAttempt` 与 `contextEngine` 交互，摘要或截断历史。执行层通过 `autoCompactionCount` 跟踪压缩次数，防止无限循环。

### 4.4 会话注册表管理

`replyRunRegistry` 跟踪活跃运行以协调用户中止、重启和状态命令。系统使用 "lifecycle generations"（通过 `withAgentRunLifecycleGeneration`）确保事件和操作与正确的运行实例关联，防止来自之前 turn 的过期回复。注册表还支持 "message injection"（消息注入），允许系统在工具运行时引导活跃运行（如提供用户反馈）。

---

## 5. 系统提示词与上下文管理

### 5.1 系统提示词构建

根据 DeepWiki System Prompt & Context 页面，OpenClaw 通过 `buildAgentSystemPrompt` 函数动态构建系统提示词。系统支持三种提示词模式：**full**（完整模式，包含所有上下文文件，适用于需要完整 agent 人格和工具说明的场景）、**minimal**（精简模式，仅包含核心指令，适用于资源受限或快速响应场景）、**none**（无系统提示词模式，适用于纯工具调用场景）。

**上下文文件优先级（CONTEXT_FILE_ORDER）**：

| 文件 | 优先级 | 用途 |
|------|--------|------|
| `AGENTS.md` | 10 | Agent 行为指令，定义 agent 应如何行动 |
| `SOUL.md` | 20 | Agent 人格与身份，定义 agent 的性格和说话风格 |
| `IDENTITY.md` | 30 | Agent 身份信息，定义 agent 的名称和基本属性 |
| `USER.md` | 40 | 用户信息，定义用户的偏好和背景 |
| `TOOLS.md` | 50 | 工具使用指南，定义可用工具及其用法 |
| `BOOTSTRAP.md` | 60 | 启动配置，定义 agent 初始化参数 |
| `MEMORY.md` | 70 | 长期记忆，存储跨会话的重要信息 |

### 5.2 工具结果截断

为防止上下文窗口溢出，OpenClaw 实现了三级工具结果截断策略：**Live Truncation**（实时截断，在工具执行时立即裁剪输出，防止超长结果进入上下文）、**Cache-TTL Truncation**（基于缓存 TTL 的延迟截断，保留近期完整结果以提高响应质量）、**Soft Pruning**（软修剪，标记旧工具结果为可压缩状态，在后续压缩时优先处理）。

### 5.3 缓存稳定性

为优化 LLM 调用成本，OpenClaw 实现了 prompt 缓存机制。**stablePromptPrefixCache** 确保系统提示词中不变的部分命中提供商的 prompt 缓存，大幅降低 token 消耗和延迟。**SYSTEM_PROMPT_CACHE_BOUNDARY** 是系统提示词中的缓存边界标记，明确区分可缓存与不可缓存部分。**Sub-Agent Delegation Context** 确保子代理继承必要的父会话上下文，同时维护缓存稳定性。

---

## 6. 多通道架构

### 6.1 ChannelManager 生命周期

根据 DeepWiki Channel Architecture 页面，OpenClaw 的通道架构以 `ChannelManager` 为核心，管理所有消息通道的完整生命周期：**Registration**（注册，通道插件向 ChannelManager 注册自身）→ **Initialization**（初始化，通道建立连接）→ **Ingress**（入站，接收来自外部平台的消息）→ **Resolution**（解析，将消息解析为统一的内部格式）→ **Egress**（出站，将 agent 响应发送回外部平台）→ **Disposal**（销毁，通道断开连接并释放资源）。

### 6.2 Durable Ingress（持久入站）

OpenClaw 的通道架构支持 Durable Ingress，确保消息不丢失。消息在入站时即持久化到本地存储，即使 Gateway 在处理过程中崩溃，消息也能在重启后恢复。通过 `readChannelSourceTurnId` 确保回复与原始消息正确关联，这对异步子代理返回尤为重要。

### 6.3 流式输出

通道架构支持 4 种流式输出模式：**Full Streaming**（完整流式，逐 token 推送到客户端，提供最佳用户体验）、**Chunked Streaming**（分块流式，按段落或工具调用边界分块，平衡体验和性能）、**Batch Mode**（批量模式，等待完整响应后一次性发送，适用于不支持流式的通道）、**Adaptive Mode**（自适应模式，根据通道能力自动选择最佳模式）。

### 6.4 平台集成

OpenClaw 支持多种平台集成：Telegram（通过 Bot API 长轮询实现）、Discord（通过 Discord Gateway WebSocket 实现，支持自动线程创建）、Slack（通过 Slack Events API 实现）、Web UI/WebChat（通过 WebSocket 与 Gateway 直接通信）。每个通道以插件形式实现，遵循统一的 `defineChannelPluginEntry` 和 `createChatChannelPlugin` 接口。

---

## 7. 工具系统

### 7.1 工具组装与生命周期

根据 DeepWiki Tools System 页面，OpenClaw 的工具系统通过 `createOpenClawCodingTools` 函数组装可用工具集。工具调用的生命周期包括四个阶段：**Inventory Resolution**（清单解析，根据策略、工具配置和显式允许/拒绝列表确定 agent 可见的工具）、**Pre-Execution Hooks**（执行前钩子，通过 `wrapToolWithBeforeToolCallHook` 包装工具，处理循环检测、插件审批和诊断遥测）、**Schema Normalization**（Schema 归一化，适配不同模型提供商的工具定义格式，处理 `const`/`enum` 映射，剥离不支持的关键字）、**Execution Handling**（执行处理，将模型的工具调用路由到对应的内部处理器，返回 `AgentToolResult`）。

### 7.2 工具类别

**消息与通道操作**：`createMessageTool` 生成消息发送和管理工具，`resolveGatewayMessageChannel` 管理出站投递，`listChannelAgentTools` 列出通道特定的 agent 工具。

**文件与工作区**：`read`、`write`、`edit` 工具与宿主或沙箱环境交互，`resolveToolFsConfig` 防止未授权的目录遍历，`agent-tools.read.ts` 提供自适应分页和图像验证的读取包装器。

**工具搜索与代码模式**：当 agent 可访问数百个工具时（如通过 MCP 或大量插件），`tool_search` 通过关键词发现工具，**Code Mode** 允许模型编写 JavaScript/TypeScript 代码在隔离的 QuickJS-WASI worker 中搜索和组合工具。

### 7.3 安全与策略解析

工具系统实现了多层安全模型。**Conversation Capability Profile** 通过 `ResolvedConversationCapabilityProfile` 汇总发送者、通道和工作区的事实信息。**Policy Resolution** 通过 `resolveConversationToolPolicies` 基于 agent 身份和当前上下文确定有效权限集。**Owner-Only Tools** 通过 `GATEWAY_OWNER_ONLY_CORE_TOOLS` 限制危险工具仅对网关所有者可用。**Tool Policy Pipeline** 通过 `applyToolPolicyPipeline` 依次经过全局策略、agent 策略和 profile 策略三层过滤，确保工具安全。

### 7.4 Code Mode 详解

Code Mode 是 OpenClaw 的创新特性，解决"工具爆炸"问题。当可用工具数量超过模型处理能力时自动启用，在 QuickJS-WASI 隔离 worker 中执行确保安全性。agent 可以编写代码来搜索、组合和链式调用多个工具，而非逐个调用，大幅提升了复杂任务的处理效率。相关模块包括 `code-mode.ts`（主控制器）、`code-mode-worker.ts`（worker 执行环境）、`code-mode-runtime.ts`（运行时管理）、`code-mode-bridge.ts`（桥接层）、`code-mode-shell-source.ts`（Shell 源码）等十余个文件。

---

## 8. 模型提供商与认证体系

### 8.1 Auth Profiles 与凭证存储

根据 DeepWiki Model Providers & Authentication 页面，OpenClaw 的凭证管理系统以 `auth-profiles.json` 为核心。凭证存储在各 agent 状态目录下，系统跟踪每个 profile 的使用统计和失败计数，用于管理冷却期和故障转移。

**Profile 管理**：`resolveAuthProfileOrder` 根据 profile 健康度和优先级确定最佳凭证；`executeWithApiKeyRotation` 支持多 key 提供商的凭证轮换，在 API key 失败时自动切换；运行时维护 auth profile 快照确保单次 agent 运行中的一致性。

**Profile 发现**：`getEnvApiKey` 自动从环境变量发现凭证；维护旧式继承 auth ID 的向后兼容性；某些提供商使用合成认证引用（如 `claude-cli` 映射到 Anthropic）。

### 8.2 Provider 配置与发现

OpenClaw 采用双层配置系统：`openclaw.json` 为显式配置文件，`models.json` 为与 agent 运行时同步的模型清单。`normalizeProviderId` 将 provider ID 归一化为标准形式。Catalog 支持三种视图：`configured`（已配置的模型）、`provider-config`（按提供商分组的配置）、`all`（所有可用模型）。`resolveGatewayModelThinkingProfile` 解析模型的推理/thinking 能力。

### 8.3 本地服务管理

对于 Ollama、LM Studio 等本地提供商，OpenClaw 通过 `ensureProviderLocalService` 管理底层服务进程的生命周期：按需启动（发送请求前确保本地服务运行且健康）、Ollama 集成（剥离 `ollama/` 前缀后发送请求到本地 daemon）、Base URL 动态解析（根据运行上下文解析本地服务 URL）、SSRF 防护（所有本地服务请求都包裹在 SSRF 防护中，防止未授权的内部网络访问）。

### 8.4 Transport 与流归一化

OpenClaw 通过专用传输流桥接内部 assistant 事件与提供商 SDK：

- **OpenAI Completions**：适配 OpenAI chat completions，处理工具调用 delta 和 usage 解析，支持 legacy function call 兼容。
- **Google Gemini**：实现 Google Generative AI 和 Vertex AI 的传输流，支持 GCP Application Default Credentials (ADC) 认证。
- **Ollama/Kimi 兼容**：专用包装器处理兼容 OpenAI API 但需要特定 thinking 配置的提供商。

**流处理**：NDJSON 解析（Ollama 等提供商的流式响应从 NDJSON 解析为结构化 assistant 事件）、Reasoning Partitioning（推理模型的 reasoning token 与最终响应分离）、Usage Tracking（跨所有提供商归一化使用统计，包括输入/输出 token 和成本）。

---

## 9. 多智能体路由与 ACP 子代理

### 9.1 多智能体路由

根据 DeepWiki Multi-Agent Routing 页面，OpenClaw 的多智能体路由系统实现了完整的 Agent 隔离模型——每个 agent 拥有独立的工作区 `workspace-<agentId>` 和状态存储 `agents/<agentId>/`。

**Session Key 结构**支持 explicit lane（显式指定的会话通道）、legacy lane（向后兼容的旧式通道）、ACP lane（ACP 子代理专用通道）三种类型。Dispatch Pipeline 从 `resolveSessionStoreKey` 开始，经过 `resolveGatewaySessionStoreTarget` 和 `loadGatewaySessionEntry`，最终通过 `replyRunRegistry` 进行并发控制。

**Delegate Architecture** 使用 `SessionAcpIdentity` 标识 ACP 会话身份，`sessionEntryForkedFromParent` 处理从父会话 fork 的会话条目。Model/Auth Profile Resolution 遵循 `resolveSessionModelRef` → `resolveImplicitProviders` → `ModelAuthAvailabilityResolver` 的解析链。

### 9.2 Agent Control Protocol (ACP)

ACP 是专为多会话编排设计的运行时框架，支持与外部 AI CLI 工具（Codex、Claude Code、Gemini CLI）的集成。`AcpManager` 协调 ACP session 元数据、运行时句柄、每会话队列和 turn 执行。支持会话恢复、流式输出路由和高级配置。Turn Timeouts 为 ACP turn 提供专用超时处理，`formatAcpErrorChain` 提供详细的错误诊断，`resolveAcpToolTerminalOutcome` 解析 ACP 工具调用的终态结果。

### 9.3 Sub-Agent 系统架构

子代理是由父会话启动的隔离 agent 会话，运行在以 `subagent` 段标识的独立 session key 空间中。

**生命周期与交接**：`isSubagentSessionKey` 验证 session key 是否属于子代理命名空间；`sessions_spawn` 是创建子会话的核心工具，支持指定运行时、模型和沙箱；`sessions_yield` 结束当前 turn 允许结果在下一消息中到达；`visible=true` 参数用于持久会话（如编码/PR），在 UI 中可见。

**注册与持久化**：回复会话、路由更新和标签被持久化以处理异步子代理返回；`beginSessionWorkAdmission` 确保会话准备好执行并管理并发访问；子代理默认继承父代理的工作区，但可以 checkout 特定的 git worktree。

### 9.4 数据流：Spawn 到 Announcement

子代理编排涉及工具触发的 spawn 和异步完成通知。父代理调用 `sessions_spawn` 创建子会话，子代理在隔离会话中执行任务，完成后结果通过 `readChannelSourceTurnId` 路由回请求者会话，`cliBackendAcceptsAuthProfileForwarding` 支持子代理继承或轮换 auth profile。

### 9.5 持久绑定与 Origin 解析

OpenClaw 支持持久绑定，确保子代理结果在 Gateway 重启后仍能返回正确的会话线程。`buildRestartRecoveryClaimCleanupPatch` 处理崩溃后的会话恢复，`resolveTargetPrefixedChannel` 基于目标前缀（如 `tg:`、`slack:`）识别正确的出站路径。

---

## 10. 插件架构与生命周期

### 10.1 插件系统概述

根据 DeepWiki Plugin Architecture 页面，OpenClaw 的插件系统是一个模块化扩展框架，支持动态集成新的模型提供商、工具、消息通道和钩子，无需修改核心代码。插件是一等公民，通过丰富的 SDK 注册自身并遵循严格的契约暴露能力。

**核心框架组件**：

- **PluginRegistry**：中央记录 keeper，维护每个能力类型的插件和注册信息（`src/plugins/compat/registry.ts`）。
- **Plugin SDK**：插件注册期间呈现的类型化接口，通过 `register(api)` 回调添加提供商、工具和钩子。
- **Plugin Manifest**：通过 `openclaw.plugin.json` 文件发现的元数据，支持在不执行插件代码的情况下进行 manifest 驱动的发现和能力激活。
- **Activation Planner**：基于 manifest 中的激活提示（如 `onStartup`、`onProviders`、`onChannels`）决定何时加载插件。
- **Capability Boundary Enforcement**：确保只有已启用和已授权的插件参与，拒绝潜在危险的插件或无效状态。

插件有不同的"形状"（shape）——如 provider-only（仅提供商）、hook-only（仅钩子）或 hybrid（混合型）——定义了它们可以暴露的注册方法。

### 10.2 插件发现与加载

**发现机制**：OpenClaw 通过扫描目录中的 manifest 或配置中定义的显式路径发现插件。发现顺序遵循：显式加载路径（用户配置中显式指定的路径）→ 工作区扩展（`extensions/` 目录中的插件）→ 全局安装 → 内置捆绑插件。此外，还支持通过 Official External Catalogs 发现托管在 npm 或 ClawHub 上的插件元数据，以及 ClawHub Integration 提供的中央仓库。

**加载与激活计划**：加载例程接收发现的 manifest 和激活提示，决定导入哪些插件并执行其 `register(api)` 调用。Activation Planner 评估 `onStartup`、`onProviders`、`onChannels` 等激活条件。OpenClaw 使用复杂的别名系统（`sdk-alias.ts`）将插件 SDK 导入解析到 `src` 或 `dist` 文件，确保插件在开发期间也能与正确的 SDK 版本交互。JITI Runtime 利用 `jiti` 进行动态 TypeScript 执行，在用户缓存目录中使用专用文件系统缓存。

### 10.3 插件签名验证与供应链安全

为保障插件供应链安全，OpenClaw 实现了完整的签名验证体系：

- **Signed Feeds**：Official External Catalogs 使用 DSSEv1 信封和 Ed25519 签名验证插件元数据的真实性。
- **Monotonicity Checks**：快照中的 `monotonic` 状态确保插件目录不能回滚到更旧的、可能不安全的版本。
- **Trust Verification**：目录支持 `unsigned` 或 `signed` 模式，后者要求达到有效密钥的阈值。
- **Integrity Checks**：ClawHub 集成提供完整性检查，确保下载的插件包未被篡改。

### 10.4 插件生命周期

插件从安装到卸载经历以下阶段：**Discovery**（发现，扫描插件目录）→ **Loading**（加载，JITI 动态加载插件代码）→ **Registration**（注册，插件向 PluginRegistry 注册自身能力）→ **Activation**（激活，根据配置和激活计划启用插件）→ **Execution**（执行，处理来自 agent 的工具调用或通道消息）→ **Deactivation**（停用，根据配置或错误条件停用）→ **Disposal**（销毁，释放插件占用的资源）。

---

## 11. Plugin SDK 与类型共享

### 11.1 Plugin SDK 概述

OpenClaw 提供了完整的 Plugin SDK，以 `openclaw/plugin-sdk/` 下的窄公共子路径形式暴露。这些子路径经过严格审计以维护稳定的 API 表面。SDK 包含大量 `.d.ts` 类型声明文件，覆盖插件开发的各个方面。

### 11.2 关键 SDK 子路径

| 子路径 | 关键导出 | 用途 |
|--------|----------|------|
| `plugin-sdk/plugin-entry` | `definePluginEntry` | 主插件入口点 |
| `plugin-sdk/core` | `defineChannelPluginEntry`、`createChatChannelPlugin` | 消息通道和设置集成 |
| `plugin-sdk/health` | Doctor health-check 注册 | 诊断和修复注册 |
| `plugin-sdk/setup-runtime` | `defineChannelSetupContract`、`createSetupTranslator` | 配置和引导 UI |
| `plugin-sdk/account-id` | `DEFAULT_ACCOUNT_ID` | 账户标识和归一化 |
| `plugin-sdk/llm` | `Model` 类型 | 语言模型提供商契约 |
| `plugin-sdk/process-runtime` | `SpawnResult` | 受管子进程交互 |

### 11.3 注册接口

`register(api)` 回调接收 `OpenClawPluginApi` 对象，关键注册方法包括：`api.registerProvider()`（注册 LLM 文本推理提供商）、`api.registerChannel()`（注册消息通道）、`api.registerWorkerProvider()`（注册 Cloud-worker 生命周期租约）、`api.registerHook()`（注册系统生命周期和工具钩子）。

### 11.4 插件运行时辅助

插件通过 `api.runtime` 访问核心服务：**Config Mutation** 通过 `api.runtime.config.mutateConfigFile()` 持久化配置变更，支持显式重载策略（`auto`、`restart` 或 `none`）；**Local Services** 通过 `ensureProviderLocalService` 管理模型提供商的 sidecar 进程，处理进程生命周期、健康探测和空闲超时；**Worker Providers** 通过 `registerWorkerProvider` 管理基于云的执行环境，允许将会话工作分派到临时机器。

### 11.5 类型共享与版本管理

核心类型定义在 `packages/` 下的可复用包中，插件通过导入获取。package.json 中声明了 `schemaVersions`（state: 9, agent: 17），用于版本兼容性检查，确保插件与核心系统的接口契约一致。SDK Surface Auditing 通过 `plugin-sdk-entrypoints.json` 维护严格的入口点清单，CI 检查确保 SDK 表面预算（如最大公共入口点数）不被超出。

---

## 12. Plugin Registry 注册表与配置启用

### 12.1 注册表管理

PluginRegistry 维护所有已安装插件的注册信息，包括插件名称、版本、能力声明和状态。注册表处理插件间的依赖关系解析，检测多个插件提供的同名工具或通道冲突。`loader-registration-plan.ts` 模块制定注册计划，`loader-runtime-candidate.ts` 管理运行时候选插件，`loader-runtime-load.ts` 执行实际加载。

### 12.2 配置与启用

插件的启用通过配置系统管理。`openclaw.json` 声明启用的插件列表，不同 agent 可以启用不同的插件集，支持在运行时通过命令动态启用/停用插件。`facade-activation-check.runtime.ts` 检查插件激活状态，`loader-load-context.ts` 管理加载上下文。

### 12.3 插件工具集成

插件提供的工具通过以下机制集成到 agent 工具集：插件在激活时向工具系统注册其工具（`capability-provider.types.ts`），插件工具受相同的 Tool Policy Pipeline 约束，插件工具定义经过相同的 Schema Normalization 流程。`agent-harness-tool-runtime.ts` 提供 agent 工具运行时支持，`runtime-agent.ts` 管理插件提供的 agent 运行时。

---

## 13. MCP 集成与 Skills 系统

### 13.1 MCP Runtime 生命周期

根据 DeepWiki ACP & Sub-Agents 页面，MCP（Model Context Protocol）集成是 OpenClaw 工具生态的重要组成部分。`createSessionMcpRuntime` 和 `getOrCreateSessionMcpRuntime` 管理 MCP 运行时，MCP 运行时是 session 作用域的，动态管理。Transport 层支持 `stdio`、`sse` 和 `streamable-http` 三种传输协议。`collectMcpPaginatedItems` 处理大型工具目录的分页，限制最多 128 页、每页最多 16,384 项。`materializeBundleMcpToolsForRun` 为特定运行动态物化 MCP 工具。

### 13.2 MCP 运行时数据流

MCP Server 通过 Transport 层（stdio/sse/http）与 McpRuntime 通信，McpRuntime 将工具目录注册到 agent 工具清单中。`agent-bundle-mcp-combined.ts` 合并多个 MCP bundle，`agent-bundle-mcp-harness.ts` 提供 MCP 测试工具，`agent-bundle-mcp-materialize.ts` 物化工具，`mcp-app-sandbox.ts` 提供 MCP 应用的沙箱环境。MCP 工具的元数据通过 `mcp-tool-metadata.ts` 管理，UI 资源通过 `mcp-ui-resource.ts` 暴露。

### 13.3 Skills 系统

Skills 系统通过 `skill_workshop` 管理。技能以声明式方式定义，包含触发条件、执行逻辑和输出格式。`active-memory` 维护 agent 的活跃记忆，支持跨会话的知识保留。agent 可以根据当前任务动态发现和加载技能。Skills 与 Code Mode 集成，允许 agent 在需要时编写代码组合技能和工具。

---

## 14. 命令系统与自动回复

### 14.1 命令系统

根据 DeepWiki Commands & Auto-Reply 页面，OpenClaw 的命令系统允许用户通过特定指令控制 agent 行为。入站消息首先经过命令解析器识别是否为命令，命令直接执行不经过 LLM，减少延迟和成本。Status & Directives 子系统管理 agent 的运行状态和用户指令。Command System 支持 `src/commands/` 下的多种命令，包括 `agent.test.ts`（agent 命令）和 `status.summary.runtime.normalization.test.ts`（状态摘要归一化）等。

### 14.2 自动回复

Auto-Reply 系统处理不需要 LLM 参与的自动回复。`src/auto-reply/reply/model-selection.ts` 为自动回复选择合适的模型，`stored-model-override.ts` 支持存储的模型覆盖，`session.ts` 管理回复会话、路由更新和标签。`dispatch-from-config.harness-defaults.ts` 从配置中提取默认值，`model-runtime-normalization.ts` 归一化模型运行时。

---

## 15. 自动化与定时任务

### 15.1 Cron Job 架构

根据 DeepWiki Automation & Cron 页面，OpenClaw 内置了完整的自动化引擎，管理定时任务、循环 agent turn、监督进程监控和主动 "heartbeat" 交互。系统以 Gateway 内部调度器为中心，处理持久 job 存储、调度逻辑和跨会话执行。

**Job 类型和 Session 目标**：

| Session Target | 说明 | 适用场景 |
|----------------|------|----------|
| `main` | 在 agent 主会话中运行 | 提醒、系统事件 |
| `isolated` | 在专用临时会话中运行 | 报告、后台任务 |
| `current` | 绑定到创建时的活跃会话 | 上下文感知循环工作 |
| `session:id` | 在持久命名会话中运行 | 基于特定历史的工作流 |

### 15.2 调度语法

OpenClaw 支持五种调度类型：`at`（一次性执行，指定时间戳）、`every`（固定间隔执行，基于 `everyMs`）、`cron`（标准 cron 表达式，可选 `staggerMs` 防止资源尖峰）、`on-exit`（事件驱动，当 gateway 监控的进程退出时触发）、`stream`（监督源 `argv`，当长时间运行的命令产生批量行时触发）。循环 job 使用稳定、确定性的偏移防止资源尖峰，通过 `normalizeCronStaggerMs` 实现手动或基于 cron 表达式的默认偏移。

### 15.3 Isolated Agent Runner

隔离会话 cron job 使用独立会话执行后台任务，避免污染主对话记忆。执行生命周期包括四个阶段：**Context Preparation**（`prepareCronRunContext` 设置临时会话、验证权限、处理 `CronSessionLifecycleClaimError`）、**Lifecycle Management**（`runCronIsolatedAgentTurn` 分派任务，跟踪 `runLifecycleGeneration`）、**Resource Cleanup**（`disposeCronRunContext` 释放 `AgentRunContext`，通过 `retireSessionMcpRuntime` 退役 MCP 运行时防止内存泄漏）、**Continuation Management**（`removeCronRunContinuationSessionIfIdle` 清理过期续接会话）。

### 15.4 Delivery Dispatch

投递分派管理 agent 输出如何到达用户或外部系统：**Announce** 通过 `resolveCronDeliveryPlan` 将输出投递到目标通道（Telegram、Discord 等）；**Webhook** 通过 `sendGatewayCronWebhook` 将结果 POST 到外部 HTTP 端点；**Failure Alerts** 通过 `sendGatewayCronFailureAlert` 在 job 失败时分派告警。`delivery-channel-validation.ts` 验证投递通道有效性，`delivery.failure-notify.test.ts` 测试失败通知机制。

### 15.5 Heartbeat 集成

Heartbeat 是允许 agent 主动浮现需要关注事项的周期性 turn。**Wake Requests** 通过 `armTimer()` 调度下次评估；**Catch-up** 通过 `runMissedJobs()` 确保启动或停机后不丢失计划的 heartbeat；**Tool Response** 通过 `heartbeat_respond` 工具结束 heartbeat turn，提供 `outcome` 和 `summary`。`heartbeat-failure-notice.ts` 处理 heartbeat 失败通知，`voicewake-routing.ts` 和 `voicewake.ts` 支持语音唤醒路由。

### 15.6 执行安全与可靠性

系统通过多种机制确保执行安全：**Process Isolation** 跟踪活跃 job 并通过适当间隔重新 arm timer 防止"热循环"；**Concurrency Limits** 通过 `DEFAULT_CRON_MAX_CONCURRENT_RUNS` 强制并发限制；**Error Handling** 通过 `normalizeCronRunErrorText` 归一化和分类错误；**Timeouts** 通过 `executeJobCoreWithTimeout` 监控 wall-clock 超时；**Cleanup** 通过 `cleanupCronRunSessionAfterRun` 和 `cleanupBrowserSessionsForLifecycleEnd` 确保浏览器实例等资源被终止；**Task Reconciliation** 通过 `applyJobResult` 和 `applyTriggerRunResult` 同步临时执行状态与持久存储。

### 15.7 Cron Tool API

`cron` 工具允许 agent 直接管理定时 job，支持四种操作：`add`（创建新 job，`capCronJobToolsAllowOnCreate` 确保 agent 不能授予自身超出当前权限的能力）、`update`（通过 `normalizeCronJobPatch` 应用补丁）、`remove`（删除 job，`assertCronSelfRemoveScope` 防止 agent 删除不属于自己的 job）、`list`（返回 job 列表，受 `CRON_TOOL_LIST_MAX_LIMIT` 限制）。`buildReminderContextLines` 构建提醒上下文，`consumeCronNextCheckProposal` 检索建议的未来检查时间。

---

## 16. 上下文压缩机制

### 16.1 Context Compaction 概述

根据 DeepWiki Context Compaction 页面，OpenClaw 实现了自动上下文压缩机制，当对话历史超过 token 阈值时自动触发。压缩流程包括：**Token 阈值检测**（监控当前会话的 token 使用量）、**排他锁获取**（压缩过程获取排他锁防止并发修改）、**ContextEngine 执行压缩**（通过 ContextEngine 分析对话历史，识别可压缩部分）、**摘要生成**（将旧对话段生成摘要保留关键信息）、**会话更新**（用压缩后的上下文替换原始历史）。

### 16.2 压缩策略

- **Tool Result Pruning**：优先压缩旧的工具调用结果，因为它们通常体积大但信息密度低。
- **Message Summarization**：将多轮对话摘要为简洁总结，保留关键决策和用户意图。
- **Preservation Rules**：保留系统提示词、最近对话和关键决策点，确保 agent 行为连续性。
- **Compaction Loop Guard**：`autoCompactionCount` 跟踪压缩次数，防止压缩循环导致的无限重试。`run.overflow-compaction.loop.test.ts` 专门测试这一场景。

---

## 17. 安全架构

### 17.1 信任模型与信任边界

根据 DeepWiki Security Model & Trust Boundaries 页面，OpenClaw 采用**单一信任操作者模型**。系统假设只有一个信任操作者（用户本人），安全机制聚焦于"保护用户免受 agent 意外行为伤害"而非多租户隔离。所有安全决策以此为前提。

**6 类信任边界**：User ↔ Gateway（用户与 Gateway 之间的认证边界）、Gateway ↔ Agent（Gateway 与 Agent 运行时之间的权限边界）、Agent ↔ Tools（Agent 与工具系统之间的能力边界）、Agent ↔ External Services（Agent 与外部服务之间的网络边界）、Plugin ↔ Core（插件与核心系统之间的隔离边界）、Sub-Agent ↔ Parent Agent（子代理与父代理之间的会话边界）。

### 17.2 安全审计系统

所有敏感操作（文件读写、命令执行、网络请求）都被记录到审计日志。审计日志包含操作类型、时间戳、agent ID、会话 ID 和操作详情，支持审计日志查询和导出。`Security Audit System` 通过结构化日志记录每一次工具调用和 agent 决策，为事后分析和合规审计提供数据支持。

### 17.3 沙箱与隔离

OpenClaw 实现了多层沙箱。**Process Isolation** 将 agent 执行隔离在独立进程中，通过 IPC 通信。**Filesystem Isolation** 限制 agent 可访问的文件系统范围，`resolveToolFsConfig` 实现工作区守卫。**Network Isolation** 通过 SSRF 防护限制网络访问。**Code Mode Isolation** 在 QuickJS-WASI worker 中提供 JavaScript 执行隔离。**Exec Approval** 要求危险命令执行需要用户明确批准，支持命令白名单/黑名单配置。**Dockerfile 多阶段构建** 最小化容器化部署的攻击面，运行时镜像仅包含必要依赖。

### 17.4 Secret 管理

**SecretRef** 机制使敏感信息通过引用而非明文存储。支持从环境变量读取密钥。API 密钥存储在 `auth-profiles.json` 中并跟踪使用统计。所有出站网络请求都经过 SSRF 检查。`secret-management` 模块确保密钥不会出现在日志或 agent 上下文中。

---

## 18. 节点系统与原生客户端

### 18.1 Device Node Protocol

OpenClaw 的节点系统允许设备作为 Gateway 的扩展节点。Device Node Protocol 定义设备节点与 Gateway 之间的通信协议，设备配对流程用于原生客户端与 Gateway 建立信任关系，设备节点声明自身能力（如摄像头、麦克风、传感器）供 agent 调用。`packages/gateway-protocol/src/schema/nodes.ts` 定义节点 schema，`session-placement.ts` 管理会话放置策略。

### 18.2 原生客户端

OpenClaw 提供多平台原生客户端：iOS & macOS（Swift 原生 Apple 平台客户端）、Android（Kotlin 原生 Android 客户端）、Linux（原生桌面伴侣应用）。每个客户端通过 WebSocket 与 Gateway 通信，支持设备配对、推送通知和离线消息。

### 18.3 Node Plugin Tools

`src/agents/node-plugin-tools.ts` 模块管理来自设备节点的工具。设备节点提供的工具通过该模块注册到 agent 工具清单，受相同的 Tool Policy Pipeline 约束，支持动态发现和加载。`node-selection-runtime.ts` 提供节点选择运行时支持。

---

## 19. 关键设计决策

### 19.1 单一信任操作者模型

**决策**：采用单用户信任模型而非多租户隔离。**理由**：OpenClaw 定位为个人助手，核心使用场景是单用户；多租户隔离引入的复杂性与个人助手的定位不匹配；简化安全模型，将精力集中在"防止 agent 意外行为"上。**影响**：所有安全机制围绕单用户设计，不支持多租户场景。

### 19.2 Code Mode 解决工具爆炸

**决策**：引入 Code Mode，允许 agent 编写代码组合工具。**理由**：MCP 和插件系统导致工具数量爆炸，超出模型处理能力；传统的 `tool_search` 仅能按关键词查找，无法组合工具；Code Mode 在安全沙箱中执行，兼顾灵活性和安全性。**影响**：agent 能力大幅提升，但增加了执行复杂度和延迟。

### 19.3 JITI 动态加载

**决策**：使用 JITI 机制动态加载插件。**理由**：减少启动时间，仅在需要时加载插件；支持热重载，改善开发体验；加载失败隔离，不影响核心系统。**影响**：首次使用插件时有轻微延迟，但整体系统健壮性提升。

### 19.4 ACP 支持外部 CLI 工具

**决策**：通过 ACP 支持外部 AI CLI 工具。**理由**：允许用户使用最喜欢的 AI 编码工具而非锁定在某一提供商；ACP 提供统一的会话管理和结果路由；支持混合使用不同提供商的工具。**影响**：系统复杂度增加，但灵活性和用户选择权大幅提升。

### 19.5 Durable Ingress

**决策**：消息在入站时即持久化。**理由**：确保 Gateway 崩溃后消息不丢失；支持离线处理和重放；提高系统可靠性。**影响**：增加 I/O 开销，但保证了消息可靠性。

### 19.6 Stable Prompt Prefix Cache

**决策**：通过稳定前缀缓存优化 LLM 调用成本。**理由**：系统提示词的大部分内容在会话期间不变；缓存命中可大幅降低 token 消耗和延迟；`SYSTEM_PROMPT_CACHE_BOUNDARY` 明确划分可缓存边界。**影响**：需要谨慎管理上下文文件顺序，确保缓存稳定性。

### 19.7 Manifest 驱动的插件发现

**决策**：通过 `openclaw.plugin.json` manifest 实现插件发现。**理由**：在不执行插件代码的情况下即可了解插件能力；支持 Activation Planner 提前决策；降低启动开销。**影响**：插件开发者需要维护 manifest 文件，但整体系统安全性提升。

---

## 20. 构建与发布系统

### 20.1 多平台构建

OpenClaw 的构建系统支持多平台。Node.js 包通过 pnpm workspace 管理，发布到 npm。原生客户端通过 Xcode（iOS/macOS）和 Gradle（Android）构建。容器镜像通过多阶段 Dockerfile 构建。`tsdown.config.ts` 和 `tsdown.ai.config.ts` 配置 TypeScript 编译和打包。

### 20.2 CI/CD Pipeline

OpenClaw 的 CI/CD 管道包括代码检查（ESLint、Prettier）、类型检查（TypeScript 编译器）、单元测试（Vitest/Jest）、集成测试（`test:e2e`、`test:gateway` 等脚本）和构建验证（多平台构建验证）。

### 20.3 测试策略

OpenClaw 采用了全面的测试策略：**单元测试**（每个模块都有对应的 `.test.ts` 文件）、**集成测试**（`.integration.test.ts` 文件测试模块间交互）、**端到端测试**（`.e2e.test.ts` 文件测试完整流程）、**QA Lab & Scenario Packs**（`qa/scenarios/` 目录包含 YAML 格式的场景包，用于自动化 QA 测试，覆盖 scheduling、channels 等场景）。`test-harness.ts` 和 `test-support.ts` 文件提供测试工具和固件支持。

### 20.4 发布流程

版本管理采用 CalVer（日历版本）方案，当前版本 2026.8.1。`schemaVersions`（state: 9, agent: 17）管理数据 schema 的版本兼容性。发布渠道包括 npm（Node.js 包）、App Store/Google Play（原生客户端）、Docker Hub（容器镜像）。`plugin-sdk-surface-report.mts` 生成 SDK 表面报告，确保 API 兼容性。

---

## 21. 挑战与展望

### 21.1 当前挑战

**工具爆炸管理**：随着 MCP 生态和插件系统的发展，可用工具数量持续增长。Code Mode 部分解决了问题，但增加了执行复杂度，需要更好的工具发现和推荐机制。

**多模型兼容性**：不同 LLM 提供商的能力差异（工具调用格式、推理能力、上下文窗口大小）需要持续的 Transport Normalization，新模型发布需要快速适配。

**安全与便利的平衡**：单一信任操作者模型简化了安全，但限制了多用户场景的适用性。Exec Approval 机制在安全性和交互流畅性之间需要平衡。

**上下文管理**：长对话的上下文压缩可能导致信息丢失，需要更智能的压缩策略保留关键决策点。

**插件供应链安全**：虽然支持 Ed25519 签名验证和 Monotonicity Checks，但未签名插件仍可加载，需要建立插件信任评分机制。

### 21.2 未来展望

**ACP 生态扩展**：随着更多 AI CLI 工具的出现，ACP 将成为连接不同 AI 生态的桥梁，可能支持更多后端类型（如本地 LLM、专用 AI 硬件）。

**Skills 市场**：技能系统有潜力发展为社区驱动的技能市场，需要建立技能质量评估和发现机制。

**多模态能力**：当前工具系统已支持 Browser Automation 和 Image & Media Tools，未来可能集成更多多模态能力（语音、视频分析、AR/VR）。

**边缘部署**：本地优先的设计理念适合边缘部署，可能支持在嵌入式设备或 IoT 节点上运行轻量级 agent。

**协作智能体**：ACP 和 Sub-Agent 系统为多智能体协作奠定了基础，未来可能支持更复杂的多智能体编排模式（如投票、辩论、分层委派）。

---

## 附录：关键代码实体索引

| 代码实体 | 文件路径 | 说明 |
|----------|----------|------|
| `createOpenClawCodingTools` | `src/agents/agent-tools.ts` | 工具集组装工厂 |
| `createOpenClawTools` | `src/agents/openclaw-tools.ts` | OpenClaw 专用工具组装 |
| `buildAgentSystemPrompt` | `src/agents/agent-command.ts` | 系统提示词构建 |
| `resolveSessionStoreKey` | `src/routing/session-key.ts` | 会话键解析 |
| `sessions_spawn` | `src/agents/tools/sessions-spawn-tool.ts` | 子代理创建工具 |
| `AcpManager` | `src/acp/runtime/` | ACP 运行时管理器 |
| `PluginRegistry` | `src/plugins/compat/registry.ts` | 插件注册表 |
| `createSessionMcpRuntime` | `src/agents/agent-bundle-mcp-runtime.ts` | MCP 运行时创建 |
| `applyToolPolicyPipeline` | `src/agents/agent-tools.ts` | 工具策略管线 |
| `runCodeModeExec` | `src/agents/code-mode.ts` | Code Mode 执行 |
| `resolveAuthProfileOrder` | `src/agents/command/attempt-execution.ts` | 认证 Profile 排序 |
| `normalizeProviderId` | `src/gateway/server-methods/models-list-result.ts` | Provider ID 归一化 |
| `prepareCronRunContext` | `src/cron/isolated-agent/run.ts` | Cron 运行上下文准备 |
| `resolveCronDeliveryPlan` | `src/gateway/server-cron.ts` | Cron 投递计划解析 |
| `dispatchReplyFromConfig` | `src/auto-reply/reply/dispatch-from-config.ts` | 执行管线 L1 入口 |
| `runEmbeddedAgent` | `src/agents/embedded-agent-runner/run.ts` | 执行管线 L3 编排 |
| `runEmbeddedAttempt` | `src/agents/embedded-agent-runner/run/attempt.ts` | 执行管线 L4 单次尝试 |
| `replyRunRegistry` | `src/auto-reply/reply/agent-runner-execution.ts` | 活跃运行注册表 |
| `definePluginEntry` | `packages/plugin-sdk/` | 插件入口定义 |
| `ensureProviderLocalService` | `src/agents/provider-local-service.ts` | 本地服务管理 |

---

*本报告基于 OpenClaw 仓库 commit `6b3f7272`（2026.8.1 版本）和 DeepWiki 技术文档（2026 年 8 月 20 日索引）编写。报告涵盖 21 个章节，涵盖项目概述、系统架构、Gateway、Agent Runtime、工具系统、模型提供商、多智能体路由、插件架构、Plugin SDK、Plugin Registry、MCP 集成、命令系统、自动化定时任务、上下文压缩、安全架构、节点系统、关键设计决策、构建发布系统及未来展望。*
