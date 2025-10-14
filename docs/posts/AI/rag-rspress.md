---
title: 基于 Rspress 博客的 RAG
date: 2025-10-10 10:31:07
tags: 
    - AI
    - Rspress
---

## 需求

方便找工作，构建RAG应用，可基于自己的知识库博客进行模拟面试问答。

## 技术栈

- OpenAI SDK            (Model)
- ChromaJS              (Vector Store)
- LlamaIndex.js         (RAG Framework)
- Vercel AI SDK + React (Frontend)

### 使用 LlamaIndex 而不使用 LangChain

LlamaIndex.js 本身就能替代 LangChain 的 80% 核心功能，且JS-only

| 模块        | 对应 LangChain 的功能       | LlamaIndex.js 的实现方式     |
| --------- | ---------------------- | ----------------------- |
| Prompt 处理 | `PromptTemplate`       | `PromptHelper`          |
| 向量索引      | `VectorStoreRetriever` | `VectorIndexRetriever`  |
| RAG 管线    | `RetrievalQAChain`     | `RetrieverQueryEngine`  |
| 数据加载      | `DocumentLoader`       | `SimpleDirectoryReader` |
| 嵌入模型      | `OpenAIEmbeddings`     | `OpenAIEmbedding`       |
| 输出接口      | LangChain OutputParser | LlamaIndex Response对象   |

## Jupyter + Deno

Jupyter 提供 UI(Notebook)、执行代码(Kernel(内核))、结果展示、Markdown、可视化等功能

Jupyter 自带的默认内核是 IPython kernel(Python 的解释器)

这里将起解释器替换为 Deno, 使其能运行JS代码

Deno优势(对比NodeJS Kernel): TypeScript支持,原生ESM,跨平台

> Jupyter 是 AI 技术栈中 __交互与展示层__ 的工具
> LangChain / LlamaIndex 是 __应用层__ 的工具
