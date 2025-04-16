---
title: Rspress建站要点
date: 2025-04-16 22:18:37
---

## 目录结构



## 下面是文章相关的内容

写文章有两个很关键的点 Markdown 掘金的大家应该都知道了大家可以跳过

Front Matter 可能很多人没接触过

## Markdown

rspress和其他静态站点构建器一样选择了 markdown-it 作为 Markdown 解析器，所以语法完全一致

[Markdown语法速查表](https://markdown.com.cn/cheat-sheet.html#%E6%80%BB%E8%A7%88)

## Front Matter

Rspress 在处理 Front Matter 时，实际上是使用了开源工具 gray-matter

### 什么是 Front Matter

Front Matter 是一种用于在 Markdown 文件开头添加**元数据（metadata）**的语法块，通常使用 YAML 格式编写，并用 --- 包裹。

这些元数据不会渲染到页面内容中，而是供静态站点生成器（如 Rspress、VitePress、Hexo、Hugo 等）读取并用于生成导航、标签、布局等功能。

Front Matter 不是 markdown-it(Markdown) 的语法

```markdown
---
title: 我的文章标题
date: 2025-04-16
tags: [前端, markdown, 笔记]
draft: false
---

## 正文开始

这是一篇关于 Front Matter 的介绍文章。
```

### 有哪些配置可选

以下是官网提到的可配置项

https://rspress.dev/zh/api/config/config-frontmatter

实际上, 正如前文所讲, Rspress实际使用的是开源包 gray-matter, 因此还具备许多官网未提及的功能

可任意书写符合YAML格式的配置参数，并在主题构建内进行读取并自定义处理方式(这部分我还在研究中)

