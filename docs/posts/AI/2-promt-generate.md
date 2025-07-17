---
title: 提示词(二):如何生成提示词
date: 2025-07-17 09:39:48
tags:
    - AI
---

一句话就是: __找到最佳实践__ 然后使用 __提示词生成工具__

## 步骤---------------------

1. 确定 特定场景下的 最佳实践

2. 使用提示词生成工具：
    - [月之暗面 Kimi × LangGPT 提示词专家](https://kimi.moonshot.cn/kimiplus/conpg00t7lagbbsfqkq0)
    - [OpenAI 商店 LangGPT 提示词专家](https://chatgpt.com/g/g-Apzuylaqk-langgpt-ti-shi-ci-zhuan-jia)
    - [302 提示词专家](https://promptgenerate-prompter.302.ai/)
    - [Claude 提示词工具](https://console.anthropic.com/)

3. 手动优化提示词

4. 将提示词给大模型

## 提示词技巧1---------------------

技巧就是 __使用提示词生成工具__

但是 给工具的也可以是提示词，所以要会写，要了解提示词结构

按以下流程确定提示词

1. 确定提示词载体: 自然语言、XML、MD、JSON、伪代码...

2. 确定提示词结构: LangGPT 结构、CO-STAR 结构

3. 确定提示词模块: LangGPT 模块(role、task、constraints、global)

4. 确定提示词内容: 内容本身可以使用不同 载体

## LangGPT 结构

全称 [Language For GPT like llm](https://github.com/langgptai/LangGPT/tree/main)

核心理念：将复杂任务分解成结构化的指令

载体：XML 语法（非强制要求）

```xml
<role>你是一位专业的中英双语翻译专家</role>
<task>将用户输入的文本在中英文之间互译</task>
<rules>
    - 保持原文的意思和语气 - 翻译要自然流畅 -
    专业术语需准确翻译 - 如遇到歧义词，提供多种可能的翻译
</rules>
<workflow>
    1. 分析源文本的上下文和语境 2. 进行翻译 3.
    校对和优化译文 4. 对专业术语或歧义处提供解释说明
</workflow>
```

## 提示词模块（以 LangGPT 为例）

模块按需组装，常见模块：

- role：设定 AI 助手的专业背景和行为模式，明确特定场景
- task：具体执行的任务，原始需求
- constraints：对内容输出的限定条件
- global：定义贯穿整个会话的全局变量
- workflow：规范任务执行步骤，特定场景下的最佳实践
- output_format：限定输出格式，功能类似 formatInstructions
- error_handling：当遇到不符合规范的输入时如何处理

可以根据需要自行扩展模块。

```xml
<global>
    $style = "有美感" $language = "中文" $topic = "春天"
</global>
<role>你是一位经验丰富的诗人</role>
<task>撰写一首关于{$topic}的诗歌</task>
<constraints>
    - 字数限制: 100词 - 风格要求: {$style} - 语言:
    {$language}
</constraints>
```

## 模块内容（以 LangGPT 为例）

模块内容本身也可以是多种载体，可以多层嵌套

```xml
<global>
    $style = "专业简洁" $length = "中等" $format =
    "markdown"
</global>

<role>
    你是一位经验丰富的技术写作专家，擅长{$style}风格写作
</role>

<task>创建技术文档和教程</task>

<constraints>
    - 文章长度: {$length} - 输出格式: {$format} - 语言: 中文
</constraints>

<workflow>
    1. 分析需求阶段: IF 用户提供主题: 分析主题关键点 ELSE:
    请求用户明确主题 END IF 2. 内容规划阶段: - 创建大纲 -
    确定重点内容 - 设计示例代码 3. 写作阶段: FOREACH 章节 IN
    大纲: - 撰写内容 - 添加示例 - 进行解释 END FOREACH 4.
    审查阶段: - 检查专业术语使用 - 确保格式统一 -
    优化表达方式
</workflow>

<output_format>
    # {标题} ## 概述 {概述内容} ## 主要内容 {详细内容} ##
    示例 {示例代码和说明} ## 总结 {关键点总结}
</output_format>
```

## CO-STAR 结构

政府组织的首届 GPT-4 提示工程大赛的获奖提示词框架

一条提示词要包含如下模块：

- C：context 上下文 要做事的背景信息
- O：Objective 目标 明确要实现什么目标
- S：Style 风格 写作风格
- T：Tone 语气 输出的语气
- A：Audience 受众 输出的受众，会根据受众理解能力调整输出
- R：Response 响应 规定输出的格式，JSON、专业报告等
