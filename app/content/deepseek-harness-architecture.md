# DeepSeek Harness (dsh) 深度调研报告

> **信息来源**：本报告所有架构细节均来自 [DeepWiki - deepseek-ai/deepseek-harness](https://deepwiki.com/deepseek-ai/deepseek-harness)（索引日期：2026-08-20，commit `141eb6fe`）及 GitHub 仓库 [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness) 源码。  
> **报告日期**：2026-08-24  
> **目标读者**：专业从业者（AI Agent 架构师、平台工程师、LLM 工具链开发者）

---

## 目录

1. [背景与概述](#1-背景与概述)
2. [核心架构：Cordis 框架与插件体系](#2-核心架构cordis-框架与插件体系)
3. [配置系统：Profile、Bundle 与 Patch 三层模型](#3-配置系统profilebundle-与-patch-三层模型)
4. [事件总线与 Capability Seam 模式](#4-事件总线与-capability-seam-模式)
5. [Agent 系统深度解析](#5-agent-系统深度解析)
6. [Session 日志与持久化架构](#6-session-日志与持久化架构)
7. [LLM 适配器与流式传输协议](#7-llm-适配器与流式传输协议)
8. [执行环境与安全沙箱](#8-执行环境与安全沙箱)
9. [子代理编排与多代理通信](#9-子代理编排与多代理通信)
10. [扩展生态：MCP、Hooks 与 Skills](#10-扩展生态mcphooks-与-skills)
11. [API 层与 Host-Client 桥接](#11-api-层与-host-client-桥接)
12. [竞品对比与生态定位](#12-竞品对比与生态定位)
13. [挑战、局限与未来展望](#13-挑战局限与未来展望)

---

## 1. 背景与概述

### 1.1 项目定位

DeepSeek Harness（`dsh`）是由 [DeepSeek AI](https://deepseek.com/) 开发的开源插件式 Agent 框架，旨在为 LLM Agent 的构建、测试和部署提供灵活可扩展的基础设施。项目采用 pnpm monorepo 结构组织，核心代码使用 TypeScript 编写。

dsh 的核心设计哲学是 **"everything-is-a-plugin"**（万物皆插件）——从模型适配器、工具注册表到 Agent Loop 本身，每一个组件都可以通过配置替换或扩展。

### 1.2 Monorepo 结构

dsh 以 pnpm monorepo 组织代码，主要目录结构如下：

| 目录 | 职责 | 关键包 |
|------|------|--------|
| `apps/` | 入口点 | `dsh` CLI |
| `packages/core/` | 核心 API 脊柱 | session、agent、tools |
| `packages/llm/` | LLM 能力定义与适配器 | `llm-deepseek`、`llm-pi-ai`、`llm-retry` |
| `packages/sandbox/` | 沙箱能力 | `sandbox-local`、`sandbox-windows-acl` |
| `packages/subagent/` | 子代理编排 | `subagent`、`subagent-acp`、`subagent-claude-code`、`subagent-codex` |
| `packages/acp/` | ACP 协议 | `acp` bridge |
| `packages/mcp/` | MCP 客户端 | `mcp-client` |
| `packages/hooks/` | Hook 协议 | `hook-protocol`、`hooks-codex` |
| `packages/skill/` | Skill 系统 | `skill`、`tool-skill` |
| `packages/session/` | 会话持久化 | `session-persistence` |
| `packages/session-query/` | 会话查询 | `session-query`、`session-query-sqlite` |
| `vendor/` | Cordis 源码（vendored） | cordis、loader、schemastery、cosmokit |

**技术栈要求**：Node.js 22.19+ 或 24+，pnpm 包管理器。

### 1.3 核心设计哲学：Capability Seam

dsh 架构围绕 **"Capability Seam"**（能力接缝）模式构建。一个 Seam 由三个角色组成：

1. **Service Definition（服务定义）**：声明接口（如 `ctx.llm`、`ctx.fs`、`ctx.shell`）
2. **Service Provider（服务提供者）**：实现接口（如 `llm-deepseek`、`fs-local`）
3. **Consumer（消费者）**：使用能力，通常是模型面向的工具（如 `tool-bash` 消费 shell 能力）

这种模式允许通过替换单个 Provider 来改变 Agent 的整体行为——例如从本地文件系统切换到远程沙箱环境，只需替换 `ctx.fs` 的实现。

> 来源：[DeepWiki - Overview](https://deepwiki.com/deepseek-ai/deepseek-harness/1-overview)，引用 `AGENTS.md:3`、`AGENTS.md:18-25`

---

## 2. 核心架构：Cordis 框架与插件体系

### 2.1 Cordis 框架概述

dsh 的插件系统并非从零构建，而是基于 **vendored（内嵌源码）的 Cordis 框架**。Cordis 是一个 TypeScript 应用框架，dsh 将其完整源码（包括 `cordis`、`loader`、`schemastery`、`cosmokit` 四个包）直接嵌入 `vendor/` 目录，并在其上进行了针对性加固。

**为什么 vendored 而非 npm 依赖？** 因为 dsh 需要对 Cordis 的 Fiber 生命周期、Service Injection 机制和 Event Bus 进行深度定制，这些修改频繁且与核心逻辑紧耦合，vendored 模式允许即时修改而无需等待上游发版。

### 2.2 Fiber 生命周期加固

Cordis 的核心运行单元是 **Fiber**——一个轻量级的协程式执行上下文。dsh 对 Fiber 生命周期进行了加固，关键机制包括：

- **Disposal Flow**：Fiber 销毁时按注册逆序执行清理回调，确保资源（文件句柄、子进程、网络连接）被正确释放
- **Service Injection 与 Declaration Merging**：Cordis 使用 TypeScript 的 Declaration Merging 将服务接口注入到全局 `ctx` 对象上，dsh 在此基础上增加了类型安全检查，防止 Fiber 销毁后访问已失效的服务
- **Scoped Contexts**：每个 Fiber 拥有独立的 scoped context，插件注册的服务实例仅在创建它的 Fiber 及其子 Fiber 中可见，避免跨会话状态泄漏

### 2.3 Agent Loop Seam 实现

Cordis 的 Event Bus 提供了 `emit`、`parallel`、`waterfall` 三种事件模式。dsh 利用 `waterfall`（瀑布式）事件实现了 Agent Loop 的关键接缝：

- `agent/pre-step`：在每个 Step 执行前触发，允许插件拦截或修改即将执行的动作
- `tools/pre-execute`：工具执行前触发，用于权限检查和参数校验
- `tools/post-execute`：工具执行后触发，用于结果处理和日志记录
- `agent/turn-stopping`：Turn 即将结束时触发，允许插件阻止结束或注入后续动作

这些 waterfall 事件构成了 dsh 插件干预 Agent 行为的主要入口点。

### 2.4 Configuration & Bootstrapping

Cordis 使用 `schemastery` 库进行配置解析。dsh 在此基础上构建了完整的配置目录（Config Catalog）机制，支持 YAML 配置文件的声明式插件组合。启动流程为：

1. 读取 `cordis.yml` 配置文件
2. `schemastery` 解析配置并实例化插件
3. 各插件通过 `register()` 方法注册到 `ctx` 上的对应服务位
4. Agent Loop 开始监听事件

> 来源：[DeepWiki - Cordis Framework & Vendored Dependencies](https://deepwiki.com/deepseek-ai/deepseek-harness/2.1-cordis-framework-and-vendored-dependencies)

---

## 3. 配置系统：Profile、Bundle 与 Patch 三层模型

dsh 的配置系统采用三层组合模型，从粗到细控制 Agent 的行为。

### 3.1 Profile 层（预设档位）

Profile 是最高层的预设配置，定义了一组 Agent 运行参数的默认值。dsh 提供的主要 Profile 类型包括：

- **CLI Profile**：命令行交互模式，包含终端 UI、用户审批流程、本地文件系统访问等默认配置
- **Agent Presets**：面向特定任务的 Agent 预设，如代码模式（Code Mode）、研究模式等

Profile 通过 `cordis.yml` 的 `profile` 字段指定，一个配置文件只能选择一个 Profile。

### 3.2 Bundle 层（功能包）

Bundle 是一组协同工作的插件的集合，代表一个可部署的功能单元。dsh 的核心 Bundle 包括：

| Bundle | 职责 | 包含的关键插件 |
|--------|------|---------------|
| `dsh-base` | 基础能力 | session、agent-loop、tool-registry |
| `dsh-headless` | 无头模式 | ACP server、JSONL 持久化、无 UI 工具集 |
| `dsh-web-app` | Web 应用 | Web UI、Typert RPC、浏览器端工具 |

Bundle 通过 `bundles` 字段在配置中声明，可以组合使用（如 headless + ACP）。

### 3.3 Patch 层（配置补丁）

Patch 是最细粒度的配置覆盖层，允许在不修改 Profile 和 Bundle 的情况下微调单个插件的行为。Patch 直接映射到 `ctx` 上的配置键。

**Config-to-Code 映射机制**：dsh 维护了一份从 YAML 配置键到 `ctx` 运行时键的映射表。例如：

```yaml
# cordis.yml 中的配置
llm:
  provider: deepseek-official
  model: deepseek-chat
  reasoning_effort: high
```

对应到代码中的 `ctx.llm.config.provider`、`ctx.llm.config.model` 等。

### 3.4 Config Catalog 与 dump-config 工具

dsh 提供了 `dump-config` 工具，可以将当前加载的完整配置（Profile + Bundle + Patch 合并后的结果）输出为 YAML，用于调试和验证。此外，`verify-cordis-config` 脚本在 CI 中自动验证配置的合法性。

**Service Roles 表**：每个 Bundle 声明了其所提供和消费的 Service Roles，dsh 在启动时验证所有必需的 Service Roles 都有对应的 Provider，缺失则抛出明确错误。

> 来源：[DeepWiki - Plugin Composition](https://deepwiki.com/deepseek-ai/deepseek-harness/2.2-plugin-composition:-profiles-bundles-and-configuration)

---

## 4. 事件总线与 Capability Seam 模式

### 4.1 事件模式

Cordis Event Bus 提供三种事件分发模式：

| 模式 | 行为 | 使用场景 |
|------|------|----------|
| `emit` | 广播给所有监听器，不收集返回值 | 通知类事件（如 `session/event`） |
| `parallel` | 并行调用所有监听器，等待全部完成 | 独立并行处理（如 `tools/post-execute`） |
| `waterfall` | 串行调用，前一个的返回值传递给后一个 | 拦截链（如 `tools/pre-execute`、`agent/pre-step`） |

### 4.2 三域事件体系

dsh 的事件分为三个域：

**Session 域**：
- `session/event`：新事件追加到 Session Log
- `session/flush`：持久化检查点
- `session/create`、`session/fork`：会话生命周期

**Agent 域**：
- `agent/pre-step`：Step 执行前拦截
- `agent/turn-starting`、`agent/turn-stopping`：Turn 生命周期
- `agent/maintenance`：维护模式触发

**Capability 域**：
- `llm/stream`：LLM 流式输出
- `tools/pre-execute`、`tools/post-execute`：工具执行拦截
- `tools/dispatch`、`tools/finalize-content`：工具执行管线内部阶段

### 4.3 Capability Seam 完整映射表

dsh 定义的 Capability Seam 及其实现映射：

| Seam (`ctx.*`) | 接口定义 | 内置 Provider | 典型消费者 |
|----------------|----------|--------------|-----------|
| `ctx.llm` | LLM 流式推理 | `llm-deepseek`、`llm-pi-ai` | Agent Loop |
| `ctx.fs` | 文件系统操作 | `fs-local` | `tool-fs-read`、`tool-fs-write`、`tool-fs-search` |
| `ctx.shell` | Shell 命令执行 | `shell-bash`、`shell-pwsh` | `tool-bash` |
| `ctx.subprocess` | 子进程管理 | `subprocess-local` | Sandbox runner |
| `ctx.tools` | 工具注册表 | `tool-registry` | Agent Loop（工具分发） |
| `ctx.agents` | Agent 管理 | `agent-registry` | `tool-subagent` |
| `ctx.sandbox` | 沙箱执行 | `sandbox-local`、`sandbox-windows-acl` | `dsh-bash-sandbox` |
| `ctx.sessions` | 会话存储 | `session-store` | Agent Loop、持久化插件 |
| `ctx.sessionQuery` | 会话查询 | `session-query-sqlite` | `tool-session-query` |
| `ctx.skills` | Skill 注册表 | `skill-registry` | `tool-skill` |
| `ctx.subagents` | 子代理运行时 | `subagent-runtime` | `tool-subagent` |

### 4.4 Event Producer-Consumer 映射

关键事件的生产者和消费者关系：

| 事件 | 生产者 | 消费者 |
|------|--------|--------|
| `session/event` | Session Log | Persistence 插件、UI |
| `llm/stream` | LlmRuntime | Agent Loop、llm-retry |
| `tools/pre-execute` | Agent Loop | hooks-codex、sandbox |
| `tools/post-execute` | Agent Loop | hooks-codex |
| `agent/pre-step` | Agent Loop | hooks-codex、tool-skill |
| `agent/turn-stopping` | Agent Loop | hooks-codex |

> 来源：[DeepWiki - Event Bus & Capability Seams](https://deepwiki.com/deepseek-ai/deepseek-harness/2.3-event-bus-and-capability-seams)

---

## 5. Agent 系统深度解析

### 5.1 核心组件

Agent 系统由三个核心组件构成：

**AgentRegistry**（`ctx.agents`）：管理 Agent 实例的注册表，负责创建、查找和销毁 Agent。每个 Agent 拥有唯一的 `AgentId`。

**AgentLoop**：驱动 Agent 执行的核心循环。dsh 的默认实现是 `ReactLoopAgent`，采用 ReAct（Reasoning + Acting）模式。

**ToolRegistry**（`ctx.tools`）：工具注册表，管理所有可供模型调用的工具定义。

### 5.2 Turn/Step 状态机

dsh 的执行模型基于 **Turn（轮次）** 和 **Step（步骤）** 两个层次：

**Turn**：从用户输入（或系统触发）开始，到 Agent 达到 idle 状态结束。一个 Turn 包含多个 Step。

**Step**：一次完整的 LLM 推理 + 工具执行循环。Step 的执行序列为：

1. **Pre-step waterfall**：`agent/pre-step` 事件触发，插件可拦截
2. **LLM 调用**：通过 `ctx.llm.stream()` 获取流式输出
3. **Block Assembly**：`BlockAssembler` 将流式 chunk 重组为完整消息
4. **Tool Dispatch**：如果 LLM 输出包含工具调用，分发到对应工具
5. **Tool Execution**：7 步 waterfall 执行管线（见 5.4）
6. **Post-step**：结果写回 Session Log
7. **Turn 检查**：如果没有更多工具调用，进入 idle；否则继续下一个 Step

### 5.3 Agent 三态与 Inbox

Agent 有三种运行状态：

| 状态 | 含义 | 触发条件 |
|------|------|----------|
| `idle` | 空闲，等待输入 | Turn 结束且无待处理消息 |
| `maintenance` | 维护模式 | 系统级操作（如配置热重载） |
| `running` | 正在执行 | Turn 进行中 |

**Inbox（收件箱）** 接收三类输入：

- **Followup**：用户后续消息，排入当前 Turn 队列
- **Steer**：转向指令，可修改当前 Turn 的行为参数（如切换工具集）
- **Inject**：注入消息，直接加入上下文但不触发新 Turn

**Cancellation 机制**：支持协作式取消——用户或系统可以请求取消当前 Turn，Agent Loop 在下一个 Step 边界检查取消信号并优雅终止。

**Epoch Headers**：每个 Turn 开始时写入 Epoch Header 到 Session Log，标记 Turn 的起始位置，用于崩溃恢复时的 Turn 边界识别。

**Publication Transaction Pattern**：Step 的结果写入 Session Log 时使用事务模式——先准备所有事件，再一次性提交，确保不会出现部分写入导致的 inconsistent 状态。

### 5.4 Tool Execution Pipeline（7 步执行管线）

工具执行采用 7 步 waterfall 管线：

| 步骤 | 事件 | 职责 |
|------|------|------|
| 1 | `tools/pre-execute` | 前置拦截（权限检查、Hook） |
| 2 | Monotonic Guards | 单调性守卫（防重入、参数不可变） |
| 3 | `execute` | 实际执行工具逻辑 |
| 4 | `tools/dispatch` | 结果分发 |
| 5 | `tools/post-execute` | 后置处理（Hook、日志） |
| 6 | `finalizeContent` | 内容终结化（截断、格式化） |
| 7 | `result` | 写入 Session Log |

**ToolDefinition 注册**：每个工具通过 `ctx.tools.define(definition)` 注册，包含名称、描述、参数 schema（JSON Schema）和执行函数。

**Shadowing 与 Restriction**：
- **Shadowing**：后注册的同名工具覆盖先注册的，用于插件升级
- **Restriction**：通过 `toolFilter` 限制特定 Agent 可访问的工具子集

**Code Mode**：dsh 支持特殊的 `run_code` 工具，允许模型生成并执行 TypeScript 或 Python 代码。该工具内置 SDK 生成能力，支持双语言代码执行。

**Parallel vs Exclusive 调度**：
- **Parallel**：多个独立工具调用可并行执行
- **Exclusive**：有依赖关系的工具调用串行执行

dsh 通过分析工具调用的依赖关系（前一个工具的输出是否被后一个工具的参数引用）自动选择调度策略。

> 来源：[DeepWiki - Agent System](https://deepwiki.com/deepseek-ai/deepseek-harness/3-agent-system)、[Agent Loop & Lifecycle](https://deepwiki.com/deepseek-ai/deepseek-harness/3.1-agent-loop-and-lifecycle)、[Tool Registry & Execution Pipeline](https://deepwiki.com/deepseek-ai/deepseek-harness/3.2-tool-registry-and-execution-pipeline)

---

## 6. Session 日志与持久化架构

### 6.1 Event-Sourced 设计

dsh 的 Session 系统采用 **Event Sourcing（事件溯源）** 模式——不存储可变状态，而是记录离散的 `SessionEvent` 对象，所有状态（包括模型可见的消息历史）都从事件流派生。

**SessionEvent 信封结构**：

| 字段 | 类型 | 说明 |
|------|------|------|
| `type` | `SessionEventType` | 事件类型唯一键（如 `user/message`、`turn/start`） |
| `seq` | `number` | 会话内单调递增序列号 |
| `time` | `number` | Unix 毫秒时间戳 |
| `data` | `SessionEventMap[K]` | 类型化载荷 |
| `ignorable` | `true?` | 标记为可忽略（未知类型的读取者可安全跳过） |
| `surfaceOp` | `SurfaceOp?` | LLM 可见表面的操作元数据（append 或 replace） |

### 6.2 Surface Projection 与 `deriveMessages()`

**Surface** 是事件流的有序投影，仅包含产生 LLM 消息的事件（目前为 `user/message`、`assistant/message` 和 `tool/result`）。

虽然 Session Log 严格 append-only，但 Surface 支持 **位置替换（positional replacement）**，用于历史压缩和精炼：

- `assistant/chunk` 事件被 Surface 忽略——只有最终的 `assistant/message` 被投影，避免部分 Turn 出现在 Provider 转录中
- 当遇到 `replace` 类型的 `SurfaceOp` 时，`SurfaceManager` 移除被遮蔽的 seq 范围并插入新事件——用于工具结果更新或历史重写

`deriveMessages()` 函数遍历 Surface 中的 nodes（序列号），将每个对应事件转换为 LLM 可用的 `Message` 对象。

### 6.3 Session Forking 与 Lineage

`ctx.sessions.fork(source, boundary?)` 创建一个继承父会话事件前缀的新会话：

- **Boundary**：定义父会话历史结束位置的 inclusive seq 号
- **Lineage Metadata**：新会话的 `SessionHeader` 记录 `parentSession` ID 和 `seedLength`
- **Safety**：Forking 要求 boundary 必须结束在一个已关闭的 Turn 之外，确保子会话以干净状态启动

### 6.4 持久化架构

持久化作为插件关注点实现，插件通过订阅 `session/event` 和 `session/flush` 事件参与持久化。

**PersistenceCoordinator**：

- **Write-Behind**：事件先缓冲，再批量写入，减少 I/O 开销
- **Crash Repair**：重载时，协调器使用 `interruptedTurnClosers` 为崩溃时未关闭的 Turn 合成 `turn/end` 标记
- **Revisions**：`SessionPersistenceRevision` 标识存储日志的精确状态

**SQLite Backend（`session-query-sqlite`）**：

提供全文搜索（FTS5）和复杂过滤的派生索引：

- 维护 `sessions`（头部信息）和 `events`（载荷与 FTS 片段）两张表
- 实现 `SessionQueryEngine` 抽象类，提供 `searchSessions` 和 `searchEvents` 方法

**Session Query & Tracing**：

- `traceSession(sessionId)`：沿 `parentSession` 指针重建祖先/后代树
- `traceEvent(request)`：跟踪位置替换和引用源事件链接
- `searchSessions`/`searchEvents`：基于 SQLite 后端执行全文查询
- `filterSessions`/`filterEvents`：应用 provider 无关的元数据谓词（如 `cwd`、时间范围）

> 来源：[DeepWiki - Session Log & Persistence](https://deepwiki.com/deepseek-ai/deepseek-harness/3.3-session-log-and-persistence)

---

## 7. LLM 适配器与流式传输协议

### 7.1 LlmRuntime 与适配器注册

`LlmRuntime` 服务作为所有 LLM 操作的中央注册表和分发中心，定义了一个将 Agent Loop 和其他插件与特定 Provider 实现（如 DeepSeek、Pi.ai）解耦的 Capability Seam。

**关键方法**：

| 方法 | 职责 |
|------|------|
| `registerAdapter(providers, adapter)` | 将 `LlmAdapter` 挂载到特定 provider 路由字符串，注册是原子的且 fiber-scoped |
| `prepareCall(config, signal)` | 解析模型元数据（上下文窗口、推理力度）并捕获当前适配器注册和重试策略到一次性可执行对象 |
| `stream(options)` | 生成补全的主入口点，返回 `AsyncIterableIterator<StreamChunk>` 并触发 `llm/stream` waterfall |

### 7.2 流式传输协议与 StreamChunk

dsh 使用统一的 `StreamChunk` 协议表示所有 LLM 输出：

| Chunk 类型 | 说明 |
|------------|------|
| `block-start` / `block-end` | 标记内容块（如 `text` 或 `reasoning`）的开始和结束 |
| `text-delta` | 生成文本片段 |
| `reasoning-delta` | 模型内部推理过程片段 |
| `usage` | Token 计数（输入/输出） |
| `finish` | 终止 chunk，指示成功（`stop`）、长度耗尽（`length`）或错误（`error`） |

**BlockAssembler**：由于原始流是碎片化的，`BlockAssembler` 被消费者（如 Agent Loop）用于在迭代过程中重组完整消息并跟踪状态。

### 7.3 DeepSeek 适配器实现

`DeepSeekAdapter` 使用 `fetch` 和自定义 SSE 解析器的直接实现，目标路由为 `deepseek-official`：

- **协议**：OpenAI 兼容的 chat completions，扩展支持 `reasoning_effort` 和 `thinking` 模式
- **归因**：自动注入 `x-deepseek-harness-user-id` 和 `x-deepseek-harness-session-id` 头部，用于遥测和轨迹路由
- **Idle Timeout**：实现 `idleWatchdog`，如果 Provider 在配置时长内停止发送 chunk 则中止请求

### 7.4 Pi.ai 适配器实现

`PiAiAdapter` 作为多 Provider 网关，由 `@earendil-works/pi-ai` 库支持，允许通过单个适配器实例支持 OpenAI、Anthropic 等 Provider：

- **Dynamic Catalog**：解析 `PiAiProviderProfile`，可逐字段覆盖端点、协议和模型目录
- **Reasoning Dialects**：将 dsh 推理级别（`off`、`high`、`max`）映射到 Provider 特定的线协议拼写

### 7.5 重试策略与错误处理

重试逻辑在两个层级处理：

1. **Provider 层级**：通过 `ctx.llm.providerRetryPolicy(provider)` 在注册时捕获，定义适配器对瞬态网络问题的行为
2. **Agent 层级**：`llm-retry` 插件拦截 `llm/stream` waterfall，使用 `ResolvedRetryPolicy` 将流生成包装在重试循环中

**错误归一化**：适配器将 HTTP 状态码和 Provider 特定错误体映射为稳定的 `LlmError` 代码：

| 错误代码 | 含义 |
|----------|------|
| `AUTH` | API 密钥缺失或无效 |
| `TIMEOUT` | 迭代期间超过 `streamIdleTimeoutMs` |
| `CONTEXT_WINDOW_EXCEEDED` | 请求超出模型 Token 限制 |

> 来源：[DeepWiki - LLM Adapters & Streaming](https://deepwiki.com/deepseek-ai/deepseek-harness/3.5-llm-adapters-and-streaming)

---

## 8. 执行环境与安全沙箱

### 8.1 多层沙箱策略

dsh 的执行环境采用多层沙箱策略，用于限制子进程（主要是 `bash` 和 `pwsh` 执行器）的文件系统访问。沙箱不是一个硬编码特性，而是通过 Cordis 插件框架组合的 **Capability**，核心抽象是 `ctx.sandbox`。

**SandboxMode（沙箱模式）**：

| 模式 | 文件效果边界 |
|------|-------------|
| `read-only` | 仅允许 FILE 读取效果 |
| `workspace-write` | 允许写入工作区根目录和后端定义的私有临时区域 |
| `danger-full-access` | 完全访问（需用户明确批准） |

**SandboxEnforcement（执行强度）**：指示后端是否达到 `full`（完全）或 `partial`（部分）限制。

### 8.2 Linux 沙箱：Landlock 与 Bubblewrap

在 Linux 上，`dsh-sandbox-local` 尝试一个 runner 链：

1. 首先探测 `bwrap`（Bubblewrap）
2. 如果 `bwrap` 不可用（如在禁用了非特权用户命名空间的最小容器中），回退到原生 `landlock-run` 二进制

**landlock-run 原生二进制**：

位于 `native/landlock-run` 的 C11 程序，使用 Linux Landlock UAPI 强制执行跨 `execve` 持久的规则集：

- **Probing**：启动一个短命子进程带最大规则集来通过 `--probe` 验证内核支持
- **Enforcement**：支持 `--ro <path>` 和 `--rw <path>` 标志；如果内核版本过旧无法治理所有请求操作，报告 `partial` 执行
- **Failure Handling**：所有 launcher 失败以退出码 `125` 退出并打印 `landlock-run:` 诊断信息，与子进程退出区分

### 8.3 Windows 沙箱：Restricted Tokens

Windows 限制在 `@deepseek-ai/dsh-sandbox-windows-acl` 中实现，使用 `WRITE_RESTRICTED` 令牌：

1. **Token Derivation**：使用 `CreateRestrictedToken` 和 `WRITE_RESTRICTED`、`DISABLE_MAX_PRIVILEGE`、`LUA_TOKEN` 标志复制调用者令牌
2. **Capability SIDs**：
   - **Workspace SID**：通过 `workspaceWriteSid(path)` 从工作区路径确定性派生，ACE 一次性应用并持久化为缓存
   - **Temp SID**：每个会话随机生成的 SID，用于私有临时目录，确保会话隔离
3. **Partial Enforcement**：报告为 `partial`，因为某些环境写访问（如 `Everyone` 对 `NUL` 的授权或 NTFS 硬链接）无法被受限令牌完全阻止
4. **Runner Logic**：`runner.ts` 创建令牌，在 `KILL_ON_JOB_CLOSE` job 下生成子进程，管理临时目录的 DACL 撤销

### 8.4 Approval Seam 与升级路径

dsh 沙箱的关键特性是 **Escalation Path（升级路径）**：

1. **Denial Detection**：执行器（如 `dsh-bash-sandbox`）将 stderr 与 `denialSignatures` 匹配
2. **User Approval**：如果配置了 `dsh-user-approval`，Agent Loop 暂停等待用户同意
3. **Retry**：批准后，命令以严格宽于会话默认模式的 `SandboxExecutionPolicy` 重试一次

### 8.5 安全边界对比

| 特性 | Linux (Landlock/bwrap) | Windows (Restricted Token) |
|------|------------------------|---------------------------|
| 写限制 | Full（旧内核为 Partial） | Partial（Logon SID/Everyone 缺口） |
| 读限制 | 支持（read-only 模式） | 不支持（环境访问） |
| 网络限制 | 未在此 seam 中声明 | 不支持 |
| 进程可见性 | 未在此 seam 中声明 | 不支持 |
| 控制台隔离 | 支持 | 不可用（初始化即终止） |

### 8.6 配置与失败安全

沙箱行为通过 `cordis.yml` 控制。系统采用 **fail-closed** 策略：如果请求的沙箱后端不可用，抛出 `SANDBOX_UNAVAILABLE` 错误而非无限制执行。

> 来源：[DeepWiki - Sandboxing & Security](https://deepwiki.com/deepseek-ai/deepseek-harness/4.3-sandboxing-and-security)

---

## 9. 子代理编排与多代理通信

### 9.1 Subagent Seam 概述

dsh 通过专用的 Capability Seam 管理子代理编排，允许父代理将任务委托给子代理。`SubagentRuntime` 服务（`ctx.subagents`）作为命名 Provider 注册表，处理从模型委托意图（通过工具）到子代理实际执行的转换。

**两种委托模式**：

| 模式 | 生命周期 | 所有权 |
|------|----------|--------|
| **One-shot** | 运行单个 Turn 并返回最终结果 | 调用者通过 `SubagentRun` 句柄拥有 |
| **Continuable** | 建立跨多个 Turn 持久的会话 | 由 `SubagentContinuationManager` 管理 |

### 9.2 Subagent Provider 类型

Provider 实现 `SubagentProvider` 接口并注册唯一名称：

1. **In-Process（`spawn`/`fork`）**：在同一 Node.js 进程内运行子代理
   - `spawn`：全新 Agent 上下文
   - `fork`：继承父代理已完成的 Turn

2. **ACP（Agent Client Protocol）**：生成外部进程，通过 stdio 上的 ACP JSON-RPC 协议通信
   - 实现协作式拆除阶梯：`stdin.end()` → `SIGTERM` → `SIGKILL`

3. **Product Drivers（产品驱动）**：
   - **Claude Code**：封装官方 `@anthropic-ai/claude-agent-sdk`，管理 `ManagedClaudeCodeProcess` 并映射 SDK 结果到 `SubagentResult`
   - **Codex**：生成 `codex app-server --stdio` 子进程，使用 `CodexAppServerWire` 处理 JSON-RPC 行传输和线程初始化

### 9.3 Continuable 子代理

Continuable 子代理设计用于长期交互，父代理和子代理可随时间交换多条消息。

**Continuation Manager**：

- **Activation**：子代理的进程局部驻留 epoch
- **Cold Resume**：如果子代理不驻留，管理器在新消息到达时从持久化会话日志重建
- **Admission**：确保每个 `SessionId` 只有一个 Activation，通过 Agent 的 inbox 处理 FIFO Turn 队列

**通信机制**：

- `followup`：父代理向子代理发送消息
- `reportFrom`：子代理向父代理发送消息
- **Delivery Policy**：Report 可以是 `quiet`（注入上下文）或 `wakeup`（触发新的父代理 Turn）

### 9.4 策略继承与深度控制

为防止无限递归并确保安全，子代理从父代理继承策略：

- **Delegation Depth**：系统通过检查会话谱系跟踪 `delegationDepth`，`assertSubagentMaxDepth` 在子代理超过配置的 `maxDepth`（默认 3）时抛出 `SubagentDepthError`
- **Policy Composition**：`applyChildComposition` 合并父代理的预设组合与子代理的特定覆盖
  - **Tool Filtering**：通过 `toolFilter` 明确允许或拒绝子代理可访问的工具
  - **Persona Shadowing**：子代理可拥有特定的 `persona`，遮蔽部署 persona

### 9.5 SubagentRuntime 核心方法

| 方法 | 职责 |
|------|------|
| `registerProvider` | 向注册表添加 `SubagentProvider` |
| `start` | 启动 one-shot 运行，返回 `SubagentRun` |
| `startContinuable` | 启动持久子代理，返回 `ContinuableStart` |
| `listChildren` | 查询会话存储中某父代理的子代理 |

### 9.6 ACP 协议

ACP（Agent Client Protocol）是 dsh 用于向程序化客户端暴露 Agent 能力的面向自动化通信标准：

- **传输**：stdio 上的换行分隔 JSON-RPC
- **Purity**：协议通道保持"纯净"——不安装 stdout logger，确保只有有效 JSON-RPC 帧被传输；诊断信息必须使用 `stderr`
- **Scope**：聚焦于 prompt 文本/图片、assistant 文本/图片、取消和一次性权限决策

**Turn Codec**：ACP bridge 将内部 `SessionEvent` 类型映射为 ACP 兼容的 JSON-RPC 通知。`turnEndToStopReason` 编解码器将内部 `TurnEndReason`（如 `stop`、`error`、`max-tokens`）映射为 ACP `StopReason` 字符串（如 `end_turn`、`cancelled`）。

**Dispose Semantics**：ACP 连接关闭时执行严格的拆除序列：
1. 取消所有进行中的 Prompt
2. 排空子代理（`drainContinuableDescendants`，子代理先于父代理终止）
3. 会话清理（子代理优先销毁，触发持久化层刷新日志）

> 来源：[DeepWiki - Subagent Orchestration](https://deepwiki.com/deepseek-ai/deepseek-harness/3.4-subagent-orchestration)、[ACP Protocol & Agent Communication](https://deepwiki.com/deepseek-ai/deepseek-harness/7.1-acp-protocol-and-agent-communication)

---

## 10. 扩展生态：MCP、Hooks 与 Skills

### 10.1 MCP Client Bridge

`mcp-client` 插件将 dsh 连接到外部 MCP（Model Context Protocol）服务器，将远程工具投影到本地 `ctx.tools` 注册表。每个插件实例管理到一个特定 MCP 服务器的连接。

**工具命名空间**：为防止多个 MCP 服务器或原生工具之间的命名冲突，远程工具以服务器限定命名空间注册：`mcp__<serverName>__<rawName>`。`publicToolName` 函数处理规范化，对超长名称使用确定性身份哈希（SHA-256）确保名称在 64 字符预算内。

**连接生命周期**：支持两种传输——`stdio`（生成子进程）和 `streamable-http`（SSE），实现带指数退避的自动重连策略。

### 10.2 Hook Protocol

Hook Protocol 允许 pre-tool 和 pre-step 拦截，分为方言中立库（`dsh-hook-protocol`）和特定实现的 bridge 插件。

**Codex Bridge（`hooks-codex`）** 实现五个拦截点：

| 拦截点 | 触发时机 | 事件 |
|--------|----------|------|
| `SessionStart` | 会话初始化 | 分离运行 |
| `UserPromptSubmit` | 用户提交 Prompt | `agent/pre-step` |
| `PreToolUse` | 工具执行前 | `tools/pre-execute` |
| `PostToolUse` | 工具执行后 | `tools/post-execute` |
| `Stop` | Turn 完成 | `agent/turn-stopping` |

**执行与决策**：Hook 作为 shell 命令通过 `runHook` 执行，协议解析退出码和 stdout 产生 `MergedHookOutcome`：

- **Exit Code 2**：阻止动作（如 `PreToolDecision.deny` 或 `PreStepDecision.reject`）
- **stdout/additionalContext**：注入到 Agent 转录中作为 `plugin` 来源消息

### 10.3 Skill System

Skill 是可重用的指令集（Markdown），为 Agent 提供领域特定指导。由 `SkillRegistry` 服务管理，支持分层作用域（全局 vs Agent 特定）。

**Skill Catalog（`tool-skill`）**：

- 在 Session Log 中维护持久化目录
- 监控 `agent/pre-step` waterfall 确保模型始终拥有最新的可用 Skill 列表
- 如果有可用 Skill，注入 `<system-reminder>` 块包含 `<available_skills>` 列表
- 目录仅在可用 Skill 集合变化时重新发布（通过条目哈希检测）

**Skill 加载**：模型通过 `skill` 工具与 Skill 交互。调用 `skill(name="xyz")` 检索完整 Markdown 内容并注入到下一个模型 Turn。用户也可通过 `/<name>` 手势确定性加载用户可调用 Skill。

| 组件 | 代码实体 | 职责 |
|------|----------|------|
| Registry | `SkillRegistry` | 合并 `SkillFileSystem` 和运行时 Provider 的 Skill |
| Tool | `skillTool` | `defineTool` 实例，允许模型获取指令 |
| Catalog | `SkillCatalogSource` | 跟踪已发布 Skill 摘要的 `MessageSource` |
| User Gesture | `/<name>` | 用户可调用 Skill 的确定性加载手势 |

> 来源：[DeepWiki - MCP Client, Hooks & Skills](https://deepwiki.com/deepseek-ai/deepseek-harness/7.2-mcp-client-hooks-and-skills)

---

## 11. API 层与 Host-Client 桥接

### 11.1 架构概述

dsh 的 API 层负责 Host（Node.js 后端）和 Client（浏览器前端）之间的通信。与 ACP 使用标准 JSON-RPC 不同，Web UI 使用 dsh 自有的类型安全 RPC 系统 **Typert**。

### 11.2 Typert：类型安全 RPC 生成

Typert 是 dsh 的类型安全 RPC 代码生成系统，从 TypeScript 类型定义自动生成前后端共享的 RPC 接口代码，确保编译时类型安全。

### 11.3 API Proxy 与 RPC 协议

API Proxy 层作为 Host 和 Client 之间的中间层，处理 RPC 请求路由、会话管理和权限验证。关键 API 端点包括：

- **Session 管理**：创建、列表、fork 会话
- **Agent 交互**：发送 Prompt、获取 Turn 结果、取消 Turn
- **子代理管理**：列表、启动、停止子代理
- **文件操作**：工作区文件浏览、读写

### 11.4 Client Runtime 与会话管理

Client Runtime 在浏览器端管理会话状态，包括：

- 与 Host 的 WebSocket/HTTP 连接
- 本地会话缓存
- UI 组件状态同步
- 用户输入处理

> 来源：[DeepWiki - API Layer & Host-Client Bridge](https://deepwiki.com/deepseek-ai/deepseek-harness/5-api-layer-and-host-client-bridge)

---

## 12. 竞品对比与生态定位

### 12.1 竞品横向对比

| 维度 | dsh (DeepSeek Harness) | Claude Code (Anthropic) | OpenAI Codex | Cursor Agent | Aider |
|------|------------------------|-------------------------|--------------|--------------|-------|
| **开源** | 是（MIT/Apache） | 否 | 否 | 否 | 是 |
| **插件框架** | Cordis（vendored） | 闭源 | 闭源 | 闭源 | 无 |
| **Capability Seam** | 三角色模式 | 无 | 无 | 无 | 无 |
| **沙箱** | Landlock + ACL（跨平台） | 内置 | 内置 | 无 | 无 |
| **子代理** | ACP + Product Drivers | 有限 | 有限 | 无 | 无 |
| **MCP 支持** | 原生客户端 | 原生 | 无 | 无 | 无 |
| **Hook 协议** | Codex/Claude Code 兼容 | 自有 | 自有 | 无 | 无 |
| **Skill 系统** | 持久化目录 + 用户手势 | 无 | 无 | 无 | 无 |
| **LLM 适配器** | DeepSeek + Pi.ai（多 Provider） | Anthropic only | OpenAI only | 多 Provider | 多 Provider |
| **Session 持久化** | Event Sourcing + SQLite FTS | 闭源 | 闭源 | 闭源 | Git-based |
| **协议** | ACP（开放标准） | 闭源 | 闭源 | 闭源 | 无 |

### 12.2 生态定位

dsh 在 AI Agent 生态中的定位是 **Agent 基础设施框架**，而非终端用户产品：

- **对框架开发者**：提供 Cordis 插件体系和 Capability Seam 模式作为 Agent 架构的参考实现
- **对工具集成者**：通过 MCP 客户端和 Hook 协议实现与现有工具生态的互操作
- **对多代理系统设计者**：通过 ACP 和子代理编排提供可组合的多代理架构
- **对安全工程师**：提供跨平台沙箱实现（Landlock/ACL）和升级路径模式

### 12.3 与 Claude Code 和 Codex 的互操作

dsh 通过 Product Driver 机制实现了与 Claude Code 和 Codex 的深度互操作：

- `subagent-claude-code`：封装 `@anthropic-ai/claude-agent-sdk`，可作为子代理驱动
- `subagent-codex`：封装 `codex app-server --stdio`，支持 Codex 线程管理
- `hooks-codex`：兼容 Codex Hook 协议，支持 5 个拦截点
- `hooks-claude-code`：兼容 Claude Code Hook 协议

这意味着 dsh 可以作为 **元编排器（meta-orchestrator）**，在自身框架内同时驱动 DeepSeek、Claude Code 和 Codex 作为子代理。

> 来源：基于 DeepWiki 各页面的综合分析

---

## 13. 挑战、局限与未来展望

### 13.1 当前局限

**沙箱安全边界不完整**：

| 平台 | 主要缺口 |
|------|----------|
| Linux | 网络限制未声明、进程可见性未声明 |
| Windows | 读限制不支持（环境访问）、网络不支持、控制台隔离不可用 |

Windows 上的 Restricted Token 方案本质上是 Partial Enforcement——无法完全阻止 `Everyone` 授权的写入（如 `NUL` 设备或 NTFS 硬链接），这意味着在 Windows 上不能依赖沙箱作为唯一安全边界。

**LLM 适配器覆盖范围有限**：虽然 Pi.ai 适配器理论上支持多 Provider，但原生优化的适配器仅有 DeepSeek 和 Pi.ai 两个。对于需要极致性能的场景（如 Anthropic 的 prompt caching、Google 的 context window API），可能需要编写原生适配器。

**子代理深度限制**：默认 `maxDepth=3` 的委托深度限制可能不足以处理复杂的多级分解任务，但提高限制会增加递归风险和资源消耗。

**ACP 协议范围有限**：当前 ACP 聚焦于 prompt 文本/图片、assistant 文本/图片、取消和一次性权限决策，不支持更丰富的交互模式（如流式工具结果、多模态交互）。

### 13.2 架构优势

**Event Sourcing 的审计能力**：Session Log 的 append-only 设计加上 SQLite FTS5 全文搜索，提供了完整的交互审计和回溯能力——任何 Agent 决策都可以追溯到具体的事件序列。

**Capability Seam 的可替换性**：三角色模式使得每个能力都可以独立替换。例如，可以将本地文件系统替换为远程沙箱环境，或将 DeepSeek LLM 替换为 Anthropic，而不影响其他组件。

**插件体系的深度定制能力**：vendored Cordis 允许 dsh 对框架核心进行深度修改，而 7 步 waterfall 工具执行管线为安全检查、Hook 拦截和结果处理提供了充足的扩展点。

**跨平台沙箱策略**：虽然各平台有局限，但 dsh 是少数在 Linux（Landlock）和 Windows（ACL Restricted Token）上都实现了原生沙箱的 Agent 框架。

### 13.3 未来展望

基于 dsh 的架构设计和 DeepWiki 中记录的实现笔记（`.agents/notes/`），可以观察到以下发展方向：

1. **网络沙箱**：当前沙箱未声明网络限制能力，未来可能通过网络命名空间（Linux）或 WFP 过滤器（Windows）补充
2. **ACP 协议扩展**：可能增加流式工具结果、多模态交互等更丰富的通信模式
3. **更多 Product Driver**：除了 Claude Code 和 Codex，可能增加对其他 Agent 产品（如 GitHub Copilot Agent）的子代理驱动
4. **Python SDK 完善**：`packages/extensions` 中已有 Python SDK 相关包，可能提供更完整的 Python 生态集成
5. **会话查询增强**：SQLite FTS5 后端可能扩展为向量搜索，支持语义级别的会话历史查询

### 13.4 对从业者的建议

**如果你是 Agent 框架开发者**：dsh 的 Capability Seam 模式和 7 步工具执行管线是最值得学习的架构模式。特别是 waterfall 事件链为安全拦截提供了优雅的扩展点。

**如果你是工具集成者**：dsh 的 MCP 客户端实现（带命名空间隔离和自动重连）和 Hook 协议（Codex/Claude Code 兼容）是直接可用的集成路径。

**如果你是安全工程师**：dsh 的 fail-closed 策略和升级路径模式（Denial Detection → User Approval → Retry）是 Agent 安全设计的良好参考。但需注意 Windows 上的 Partial Enforcement 限制。

**如果你是多代理系统设计者**：dsh 的 Continuable 子代理模式（Cold Resume、FIFO Turn 队列、深度控制）和 ACP 协议提供了比简单 fork/exec 更完善的多代理通信基础设施。

---

## 附录：DeepWiki 页面索引

本报告引用的 DeepWiki 页面及其在 GitHub 仓库中的对应源码区域：

| DeepWiki 页面 | URL | 关键源码路径 |
|--------------|-----|-------------|
| Overview | `/1-overview` | `AGENTS.md`、`package.json`、`README.md` |
| Cordis Framework | `/2.1` | `vendor/cordis/`、`vendor/loader/` |
| Plugin Composition | `/2.2` | `docs/config-catalog.md`、`docs/module-graph.md` |
| Event Bus & Capability Seams | `/2.3` | `docs/event-producer-consumer.md`、`docs/capability-seams.md` |
| Agent System | `/3` | `packages/core/agent/` |
| Agent Loop & Lifecycle | `/3.1` | `packages/core/agent/src/` |
| Tool Registry & Execution Pipeline | `/3.2` | `packages/core/tools/src/` |
| Session Log & Persistence | `/3.3` | `packages/core/session/`、`packages/session/` |
| Subagent Orchestration | `/3.4` | `packages/subagent/` |
| LLM Adapters & Streaming | `/3.5` | `packages/llm/` |
| Sandboxing & Security | `/4.3` | `packages/sandbox/`、`native/landlock-run/` |
| ACP Protocol | `/7.1` | `packages/acp/`、`examples/acp-agent/` |
| MCP Client, Hooks & Skills | `/7.2` | `packages/mcp/`、`packages/hooks/`、`packages/skill/` |

---

*报告完*
