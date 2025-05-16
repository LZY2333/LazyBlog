---
title: 博客写作涉及的技术栈指南
date: 2025-05-08 10:49:05
---

写一篇博客文章除了干货以外 你还需要知道这些技术栈支持

## Markdown语法 和 markdown-it

markdown-it 是使用范围最广的 Markdown语法 解析器，rspress等常见的静态站点构建器均有使用。

[Markdown语法速查表](https://markdown.com.cn/cheat-sheet.html#%E6%80%BB%E8%A7%88)

## Front Matter 和 gray-matter

gray-matter 是使用范围最广的 Front Matter 解析器，本质是 YAML语法

[rspress 的 Front Matter的可选配置](https://rspress.dev/zh/api/config/config-frontmatter)

### 什么是 Front Matter

Front Matter 是一种用于在 Markdown 文件开头添加**元数据（metadata）**的语法块，通常使用 YAML 格式编写，并用 --- 包裹。

这些元数据不会渲染到页面内容中，而是供静态站点生成器读取并用于生成导航、标签、布局等功能。

```md
---
title: 我的文章标题
date: 2025-04-16
tags: [前端, markdown, 笔记]
draft: false
---

## h2标题测试

这是一篇关于 Front Matter 的介绍文章。
```

实际上, 正如前文所讲, Rspress实际使用的是开源包 gray-matter, 因此还具备许多官网未提及的功能

也就是说**支持所有YAML语法**, 例如 配置时增加一个 `|` 渲染时纵向展示当前属性

也可以实现YAML格式的配置一些参数，并在主题构建内进行读取并自定义处理方式

### 可以在正文中访问 Front Matter 中定义的属性

`{frontmatter.title}` 语法为大括号

### head属性

`head` 可在当前html页面内的 `<head></head>` 标签内注入 自定义DOM标签并定义其属性

对于当前文章来说 用于添加 Open Graph 应该是最常见且实用的操作

### Open Graph

首先是属性速查表，详情后面解释

### 📌 基础属性（推荐必填）

| 属性名           | 描述                       | 示例值                        |
| ---------------- | -------------------------- | ----------------------------- |
| `og:title`       | 内容标题                   | "文章标题"                    |
| `og:type`        | 内容类型（见下方类型列表） | "website", "article"          |
| `og:image`       | 分享时显示的图片 URL       | "https://example.com/img.jpg" |
| `og:url`         | 页面地址                   | "https://example.com"         |
| `og:description` | 内容描述                   | "这是文章摘要..."             |
| `og:site_name`   | 网站名称                   | "我的博客"                    |
| `og:locale`      | 当前语言区域（默认 en_US） | "zh_CN"                       |

---

### 📰 类型为 `article` 时的附加属性

| 属性名                    | 描述                 | 示例值                            |
| ------------------------- | -------------------- | --------------------------------- |
| `article:published_time`  | 发布时间（ISO 格式） | "2025-04-17T12:00:00+00:00"       |
| `article:modified_time`   | 修改时间（ISO 格式） | "2025-04-18T08:00:00+00:00"       |
| `article:expiration_time` | 过期时间（可选）     | "2025-05-01T00:00:00+00:00"       |
| `article:author`          | 作者页面 URL         | "https://example.com/author/john" |
| `article:section`         | 主题分类             | "技术", "生活", "前端"            |
| `article:tag`             | 标签（可多个）       | "OpenGraph", "SEO", "分享优化"    |

---

### Front Matter 创建 OG 的使用方式 head

```md
---
head:
  - - meta
    - property: og:title
      content: My Home Page
  - - meta
    - property: og:url
      content: https://example.com/foo/
  - - meta
    - property: og:image
      content: https://example.com/bar.jpg
---
```

### 什么是 Open Graph？

`Open Graph`（开放图谱协议，简称 OG） 是由 Facebook 提出的一种网页元数据协议

用于让网页在社交媒体（比如 Facebook、Twitter、微信等）上分享时，能展现出更丰富清晰的预览信息

举个例子

当你在微信或者微博里贴一个网页链接，自动就会出现带有标题、图像和描述的卡片，那就是用到了Open Graph协议。

```html
<meta property="og:title" content="这是一篇文章的标题" />
<meta property="og:description" content="这是一篇关于Open Graph的介绍文章" />
<meta property="og:image" content="https://example.com/image.jpg" />
<meta property="og:url" content="https://example.com/article" />
<meta property="og:type" content="article" />
```

[OG协议官网，其实内容很少，可以看看](https://ogp.me/)


## 最后,一个配置项拉满的文章示例

这里举一个常用配置项拉满的文章示例，也是我现在正在使用的基本模板

大家可以复制后在vscode配置映射片段，也可以在项目中增加命令行生成脚本，一键生成

```md
---
title: 我的文章标题
date: 2025-04-16
tags: [前端, markdown, 笔记]
draft: false
---

## h2标题测试

这是一篇关于 Front Matter 的介绍文章。
```
