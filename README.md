# LazyBlog —— 个人技术博客与知识库

LazyBlog 是一个基于 [Rspress](https://rspress.rs/) 构建的个人 __技术栈与生活记录__ 博客。

仓库内含自定义主题、插件与文档组织结构，支持分类、标签与站内搜索。

## 功能与特性

- 自定义主题与组件：见 `theme/` 目录（导航、首页页脚、样式等）
- 内容组织完善：按分类与标签归档，目录在 `docs/` 与 `docs/posts/` 下
- 实用插件：
  - `ChinesePunctuationReplacePlugin`：中文半角/全角标点修正
  - `FrontMatterCountPlugin`：FrontMatter 标签统计与计数
- 辅助脚本：`src/scripts/generateOverview.ts` 预览页自动生成

## 目录结构

```text
public/             静态资源（图片、图标等）
docs/                 文档与文章
    _meta.json          顶部导航栏
    index.md            总预览页
    posts/              博文主体（按主题分组）
        AI/               AI 文章
            _meta.json      AI 分预览页配置
        javascript/       JavaScript 文章
            _meta.json      JavaScript 分预览页配置
        typescript/       TypeScript 文章
            _meta.json      TypeScript 分预览页配置
        ...
        _meta.json        总预览页配置
        AI.md               AI 分预览页
        javascript.md       JavaScript 分预览页
        typescript.md       TypeScript 分预览页
        ...
doc_build/            预构建数据（搜索索引、分类/标签聚合）
src/
    plugins/            自定义 Rspress 插件
      ChinesePunctuationReplacePlugin.ts
      FrontMatterCountPlugin.ts
    scripts/            辅助脚本
      generateOverview.ts
theme/                自定义主题与组件
```

## git 日志

- 提交信息格式分为 `系统: <主题>` 或 `文章: <主题>` 以区分。例如：
  - `系统: 新增 tag 标签生成功能`
  - `文章: 完成 AI 大模型的应用`

## FrontMatter 示例

```yaml
---
title: 从 Webpack 到 Rspack
date: 2025-08-13
categories: [workflow]
tags: [webpack, rspack, 构建]
hide: true
---
```

## 快速开始

```bash
npm i && npm run dev
# 构建与预览
npm run build && npm run preview
```
