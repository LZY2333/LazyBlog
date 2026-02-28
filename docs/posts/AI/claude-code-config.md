---
title: Claude Code 配置全解析：CLAUDE.md、config.json、Skills、Memory 的区别与最佳实践
date: 2025-06-15 14:30:00
categories: 经验帖
tags:
    - AI
    - Claude Code
summary: Claude Code 有四种持久化机制，职责完全不同。CLAUDE.md 是你写给 Claude 的规则书，config.json 是工具本身的设置项，Skills 是可复用的工作流模板，Memory 是 Claude 自动积累的项目经验。搞混它们会导致重复配置、失效指令和混乱的上下文管理。
---

## 为什么要搞清楚这四个东西

本文适合已经在日常开发中使用 Claude Code 的开发者。如果你还没装过它，先看[官方文档](https://docs.anthropic.com/en/docs/claude-code)。

用了一段时间 Claude Code 后，很多人会遇到这些困惑：

- "我在 CLAUDE.md 里写了规范，为什么 Claude 没遵守？"
- "我的 Skills 里的提示词和 CLAUDE.md 里的说明重复了，该放哪里？"
- "Memory 是什么？我没让它写，它为什么自己更新了？"

根本原因是这四个机制的**触发时机、生命周期、写入者**都不一样，混用会导致行为不可预测。

## 四者总览

```
~/.claude/
├── config.json          # 工具配置（模型、权限、hooks）
├── CLAUDE.md            # 全局指令（对所有项目生效）
├── skills/              # 可复用工作流
│   └── my-skill/
│       └── SKILL.md
└── projects/
    └── -Users-you-code-myapp/
        └── memory/
            └── MEMORY.md  # 项目级自动记忆

./CLAUDE.md              # 项目级指令（优先级高于全局）
```

## CLAUDE.md：你写给 Claude 的规则书

CLAUDE.md 是纯 Markdown 文件，在每次对话开始时**自动注入**到 Claude 的上下文里。它是你和 Claude 之间的"团队规范文档"。有两个级别：`~/.claude/CLAUDE.md` 全局生效，`./CLAUDE.md` 项目级优先级更高，会覆盖全局同类指令。

任何你希望 Claude **始终遵守**的内容都可以写在这里：

```markdown
# ./CLAUDE.md

## 代码风格

- 禁用枚举，用 `as const` 代替
- 每个文件最多 800 行
- 包管理器必须用 pnpm@10.14.0

## 流程规范

对任何代码的新增、删除、修改，必须先输出执行计划，
等待用户同意后再执行。

## 项目上下文

这是一个 Next.js 16 + tRPC v10 的全栈应用。
API 路由在 /server/src/routers/，前端页面在 /web/src/pages/。
```

每次启动新对话时读取一次，整个对话期间持续生效，**不会**在对话过程中动态更新。

| 场景               | 放 CLAUDE.md    |
| ------------------ | --------------- |
| 项目编码规范       | ✅              |
| 禁止使用某些库     | ✅              |
| 目录结构说明       | ✅              |
| 工作流流程要求     | ✅              |
| 当前任务的具体要求 | ❌（放对话里）  |
| 单次执行的脚本     | ❌（放 Skills） |

注意：CLAUDE.md 会占用 context window。全局文件超过 200 行后前 200 行之外会被截断（Memory 的 MEMORY.md 同样如此）。**保持精简，只写稳定不变的规则。**

## config.json：工具本身的设置项

`~/.claude/config.json` 控制的是 **Claude Code 工具自身的行为**，而不是 Claude 模型的行为。这是最容易和 CLAUDE.md 混淆的地方。

```json
{
    "model": "claude-opus-4-6",
    "permissions": {
        "allow": ["Bash(git status)", "Bash(git diff *)"],
        "deny": ["Bash(git push --force *)"]
    },
    "hooks": {
        "PreToolUse": [
            {
                "matcher": "Bash",
                "hooks": [
                    {
                        "type": "command",
                        "command": "echo 'Running bash command'"
                    }
                ]
            }
        ]
    }
}
```

| 配置项                   | 作用                              |
| ------------------------ | --------------------------------- |
| `model`                  | 默认使用哪个模型                  |
| `permissions.allow/deny` | 哪些工具调用自动允许或拒绝        |
| `hooks`                  | 工具调用前后自动执行的 shell 命令 |
| `env`                    | 注入到所有命令的环境变量          |

> CLAUDE.md 影响 Claude **怎么思考和回答**。
> config.json 影响 Claude Code **能做什么操作**。

举个例子：你想让 Claude 每次提交前都跑测试。

- **错误做法**：在 CLAUDE.md 写 "提交前必须跑测试" —— Claude 可能遵守也可能忘记，无法保证
- **正确做法**：在 config.json 的 hooks 里配 `PreToolUse` 拦截 `Bash(git commit *)` 并执行测试命令 —— 工具层面强制执行

## Skills：可复用的工作流模板

Skills 是带结构的 Markdown 文件，通过斜杠命令触发。存放在 `~/.claude/skills/<skill-name>/SKILL.md`。

```markdown
---
name: custom-git
description: 'Git 提交和创建新分支的工作流'
allowed-tools: Bash(git *)
---

# Git 工作流

## 提交流程

1. 运行 `git status` 和 `git diff` 查看变更
2. 生成符合 Conventional Commits 规范的提交信息
3. 输出计划，等待用户确认
4. 执行提交
```

| 维度     | CLAUDE.md          | Skills                |
| -------- | ------------------ | --------------------- |
| 触发方式 | 自动（每次对话）   | 主动（`/skill-name`） |
| 适用范围 | 始终生效的规则     | 特定场景的工作流      |
| 内容类型 | 规范、上下文、约束 | 步骤化流程、命令序列  |
| 粒度     | 全局背景知识       | 单次任务执行          |

判断标准：**这个工作流会被反复触发，而且步骤固定。**

```
✅ git 提交流程（每次提交都一样）
✅ 创建新组件（固定目录结构和模板）
✅ 写技术博客（固定文章结构）
❌ 项目编码规范（应该在 CLAUDE.md）
❌ 当前 bug 的修复步骤（放对话里）
```

Skills 可以通过 `allowed-tools` 预授权特定工具，避免每次都要手动确认。这样在 Skill 执行期间，这些命令会自动获得权限，不用打断工作流去点确认。

### permission 失效场景

以下场景中，即使 `settings.json` 的 allow 列表里已经配了对应规则，仍然会弹出权限确认框。

**1. 项目级 `settings.local.json` 覆盖而非合并全局权限**

项目目录下存在 `.claude/settings.local.json` 时，全局 `~/.claude/settings.json` 的 allow 规则**整体失效**，不是增量合并。必须在项目级文件中重新声明所有需要的 allow 规则。

**2. 命令中含双引号触发安全检测**

与 allow 规则无关，属于独立的安全拦截。例如 `git log && echo "---" && git status` 中的 `echo "---"` 会触发 "Command contains quoted characters in flag names" 弹框。解决方式：去掉引号，或将命令拆分为独立调用。

**3. Bash 命令访问当前项目外路径触发跨项目安全确认**

Claude Code 的 Bash 权限规则按**当前项目作用域**生效。当工作目录在项目 A，但 Bash 命令访问项目 B 的路径时，即使命令本身（如 `ls`）已在 allow 列表中，仍会弹出确认框。而 Read、Glob 等内置工具不受此限制。例如：工作目录为 `~/demo/LazyBlog`，执行 `ls ~/demo/OtherProject/` 会被拦截，但用 Glob 工具查看同一路径则直接通过。

## Memory：Claude 自动积累的项目经验

Memory 是 Claude Code 的**自动记忆系统**。Claude 在工作过程中会自动把发现的稳定模式、架构信息、用户偏好写入 Markdown 文件，供后续对话使用。

```
~/.claude/projects/<project-path-encoded>/memory/
├── MEMORY.md        # 总览，每次对话自动加载
├── debugging.md     # 调试经验（Claude 按需创建）
└── patterns.md      # 代码模式（Claude 按需创建）
```

这是四个机制里唯一**由 Claude 主动写入**的。你也可以明确告诉它要记住什么：

```
"记住：这个项目永远用 bun 而不是 npm"
"记住：useReactive 在这里被禁用了，不要推荐它"
```

Claude 也会主动记录它认为跨会话有价值的发现：

```markdown
# MEMORY.md

## 项目架构

- API 路由：/server/src/routers/
- 前端页面：/web/src/pages/
- 状态管理：Zustand + TanStack Query

## 用户偏好

- 代码改动前必须先生成计划，用户同意后再执行
- 不使用 Prettier
- 提交信息用 Conventional Commits 格式

## 调试经验

- Turbopack 缓存问题：运行 pre-dev 脚本清理
- pnpm workspace 依赖解析：优先检查 auto-imports.d.ts
```

| 维度     | CLAUDE.md      | Memory             |
| -------- | -------------- | ------------------ |
| 写入者   | 开发者         | Claude（自动）     |
| 内容性质 | 规范和约束     | 经验和观察         |
| 更新方式 | 手动编辑       | Claude 自动更新    |
| 适合内容 | "你必须遵守 X" | "我发现这个项目 X" |

Memory 是 Claude 自己写的，**可能出现错误或过时的内容**。定期检查 MEMORY.md，删除不准确的记录。如果发现错误，直接告诉它："你 MEMORY.md 里关于 X 的记录是错的，请删除它"。

## 综合对比

```
四个机制的决策树：

这个信息需要跨会话持久化吗？
├── 否 → 直接放对话上下文
└── 是 → 继续判断...
    │
    ├── 这是工具行为配置（权限/hooks/模型）？
    │   └── → config.json
    │
    ├── 这是固定规范/约束/项目背景？
    │   └── → CLAUDE.md
    │
    ├── 这是可复用的多步骤工作流？
    │   └── → Skills
    │
    └── 这是 Claude 在工作中发现的经验？
        └── → Memory（Claude 自动写，或你告诉它记住）
```

| 维度         | CLAUDE.md          | config.json       | Skills             | Memory             |
| ------------ | ------------------ | ----------------- | ------------------ | ------------------ |
| **写入者**   | 开发者             | 开发者            | 开发者             | Claude（自动）     |
| **触发时机** | 每次对话自动加载   | 工具运行时        | `/skill-name` 触发 | 每次对话自动加载   |
| **控制对象** | Claude 的行为      | 工具本身          | 单次工作流         | Claude 的经验      |
| **生命周期** | 手动维护           | 手动维护          | 手动维护           | Claude 自动更新    |
| **作用范围** | 全局或项目         | 全局              | 全局               | 按项目隔离         |
| **典型内容** | 规范、禁令、上下文 | 权限、hooks、模型 | 工作流步骤         | 架构发现、用户偏好 |

## 真实配置示例

一个完整的 Claude Code 项目配置长这样：

**`~/.claude/CLAUDE.md`（全局规范）**

```markdown
# 全局行为规范

## 代码操作流程

对任何代码的新增、删除、修改，必须先输出完整执行步骤，
等待用户明确同意后再执行。

## 大量 token 操作需审批

启动子 agent、并发调用 3 个以上工具、大范围代码库搜索，
需先说明意图等待同意。
```

**`./CLAUDE.md`（项目规范）**

```markdown
# 项目规范

## 技术栈

Next.js 16、React 18、TypeScript、tRPC v10

## 禁止项

- 禁用枚举，用 `as const`
- 禁止从 `antd/lib/*` 导入
- 禁止使用 Prettier
- 每文件最多 800 行
```

**`~/.claude/config.json`（工具配置）**

```json
{
    "model": "claude-sonnet-4-6",
    "permissions": {
        "allow": ["Bash(git status)", "Bash(git diff *)"],
        "deny": ["Bash(git push --force *)"]
    }
}
```

**`~/.claude/skills/<skill-name>/SKILL.md`（工作流）**

```markdown
---
name: custom-git
allowed-tools: Bash(git *)
---

# Git 提交流程

1. git status + git diff 查看变更
2. 生成 Conventional Commits 格式提交信息
3. 输出计划等待确认
4. 执行提交
```

**`~/.claude/projects/<project-path>/memory/MEMORY.md`（自动记忆）**

```markdown
# Claude Memory

## 用户偏好

- 代码操作前必须生成计划
- 使用 pnpm，不用 npm 或 yarn

## 项目架构

- API：/server/src/routers/
- 前端：/web/src/pages/

## 调试经验

- 启动前运行 pre-dev 脚本清理 Turbopack 缓存
```

## 权衡与局限

| 机制 | 局限 |
|------|------|
| CLAUDE.md | 不能保证 Claude 100% 遵守（它是提示，不是代码约束）；超过约 200 行会被截断；对工具行为无控制力 |
| config.json | 只能做简单的允许/拒绝，复杂逻辑需要 hooks 脚本；Hooks 目前调试体验较差，错误信息不直观 |
| Skills | 需要手动触发，不适合"每次都要"的规范；`allowed-tools` 权限范围粗粒度，无法精确到参数级别 |
| Memory | Claude 写的内容可能有错，需要人工定期校验；同样受 200 行截断限制；不能完全依赖它存储关键约束 |

## 总结

四个机制的本质：

- **CLAUDE.md** — 告诉 Claude _应该怎么做_
- **config.json** — 告诉工具 _能做什么_
- **Skills** — 定义 _怎么做某件具体的事_
- **Memory** — Claude 记录 _它学到了什么_

从最小配置开始：先写项目级 CLAUDE.md，再按需添加其他机制。过度配置和配置不足一样会出问题。

## 延伸阅读

- [Claude Code 官方文档 — Memory & Persistence](https://docs.anthropic.com/en/docs/claude-code/memory)
- [Claude Code 官方文档 — Settings & Configuration](https://docs.anthropic.com/en/docs/claude-code/settings)
- [Claude Code 官方文档 — Slash Commands (Skills)](https://docs.anthropic.com/en/docs/claude-code/slash-commands)
- [Claude Code 官方文档 — Hooks](https://docs.anthropic.com/en/docs/claude-code/hooks)
- [Conventional Commits 规范](https://www.conventionalcommits.org/)
