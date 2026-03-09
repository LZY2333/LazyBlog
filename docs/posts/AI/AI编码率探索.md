# AI 编码率探索

## 直接先上结论

基于**四阶段门控**思想，通过两个 custom skill（`ai-spec` / `ai-plan`）将需求到代码的链路结构化，提高 AI 编码一次性成功率。

**why 四阶段门控？** — 业内验证有效的 spec-driven 开发范式，前置约束优于后置修补。

**why custom skill？** — 开源方案太重且难以贴合团队工作流，custom skill 轻量、灵活、可持续迭代。

## 一、Vibe Coding 的核心瓶颈

反复 prompt 与 review，AI编码体验差, AI 编码一次性成功率低, 习得性心慌。

- **需求模糊直接生成代码**：AI 缺少明确的约束边界，输出方向不可控，返工成本高
- **上下文逐步衰减**：长对话后 AI 丢失前序约定，输出前后矛盾
- **单次生成体量过大**：千行 diff 无法有效 review，缺陷隐藏在细节中
- **缺少结构化中间产物**：人脑中的需求 ≠ AI 理解的需求，中间缺少可验证的规格描述层

**本质问题**：需求到代码之间缺少一层结构化的、可校验的中间表示。

## 解决路径：四阶段门控（GitHub Spec Kit）

[GitHub Spec Kit](https://github.com/github/spec-kit) — GitHub 官方开源的 spec-driven 开发工具包
[Addy Osmani - How to Write a Good Spec for AI Agents](https://addyosmani.com/blog/good-spec/)

核心理念：从"代码即真相"转向"意图即真相"，specification 作为 source of truth 驱动全流程。每个阶段产出经人工审核后，方可进入下一阶段。

| 阶段          | 输入     | 输出               | 门控动作         |
| ------------- | -------- | ------------------ | ---------------- |
| **Specify**   | 高层需求 | 结构化规格文档     | 审核意图与边界   |
| **Plan**      | Spec     | 架构方案、文件清单 | 审核技术方案     |
| **Tasks**     | Plan     | 离散任务列表       | 确认粒度与优先级 |
| **Implement** | Task     | 聚焦代码变更       | 逐任务 review    |

### 优势

- **前置投入减少后置返工**：spec 阶段发现问题的修复成本远低于代码阶段
- **Spec 作为持久化锚点**：跨会话保持上下文一致性，缓解 AI 上下文衰减
- **约束生成范围**：AI 在明确的 spec + plan + task 边界内执行，不会发散

### 局限

- **产出过重**：默认输出冗长，review 负担反而增加
- **格式与团队规范不匹配**：输出模板无法直接对齐现有工作流
- **定制成本高**：修改生成逻辑需要深入理解框架内部实现
- **工具链耦合**：需安装专用 CLI，学习专有指令体系
- **项目绑定**：生成的 spec 深度耦合特定项目结构，复用性差

## 提高 AI 编码率的两个核心 Custom Skill

### 核心思路

借鉴四阶段门控的思想，但不依赖其工具链 — 从零编写自己的 skill，按团队需求持续简化与迭代。

Custom Skill：更轻量、更灵活、更可控

### `ai-spec`：PRD → Spec

将一句话需求或产品文档转换为**同时面向开发者和 AI** 的结构化规格文档。

- **输出**：`plan/0.AI-SPEC.md`
- **覆盖维度**：功能边界、验收条件、接口契约、依赖关系、约束条件
- **关键设计**：
    - 每条 spec 均为可验证的陈述，消除歧义空间
    - 显式标注"不做什么"（negative scope），防止 AI 发散
    - 引用项目现有代码路径与模式，降低 AI 的推测成本

### `ai-plan`：Spec → Plan / Task

基于 AI-SPEC 生成可执行的 离散实施计划，涵盖代码修改细项、文件路径、执行进度。

- **前置条件**：`plan/0.AI-SPEC.md` 已存在且经开发者审核
- **输出**：代码修改细项列表，每项包含目标文件、修改类型、依赖顺序
- **关键设计**：
    - 先分析现有代码结构，再规划修改方案（基于现状设计，非凭空构建）
    - 每个 task 标注预估影响范围与风险等级
    - 生成的 plan 可直接作为 Claude Code Task List 驱动执行

### 前置阶段：Discuss（按需）

以上两个 skill 适用于需求已相对明确的场景。若需求本身模糊或需要发散探索，应在 spec 之前增加 `discuss` 阶段。

参考实现：

- [superpowers/brainstorming](https://skills.sh/obra/superpowers/brainstorming)
- [adonis-skills/discuss-before-plan](https://skills.sh/adonis0123/adonis-skills/discuss-before-plan)

## 五、总结

| 问题                             | 解法                                       |
| -------------------------------- | ------------------------------------------ |
| 反复 prompt 与 review 导致体验差 | 前置结构化约束，减少后置修补循环           |
| 如何提高一次性成功率             | 四阶段门控：spec → plan → task → implement |
| 开源方案太重、不灵活             | Skill 机制：轻量按需加载                   |
| 通用 skill 无法贴合团队          | Custom skill：从零定制，持续迭代           |
