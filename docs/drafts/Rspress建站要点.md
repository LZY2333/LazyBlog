---
title: Rspress建站要点
date: 2025-04-16 22:18:37
---

Rspress建站一些容易疏忽的点

## 路由是自动生成的

【约定式路由】就是我们提前约定好按 文件路径映射到路由路径，自动生成路由

值得注意的是【组件路由】，其实就是写`.tsx`的react组件 和`.md`一样会被视为文章，生成路由

`foo.tsx`文件，`foo`被视为路径，内容中的`export default`导出会被视为页面内容

`export const frontmatter = {}` 可进行页面配置, 同 `.md` 中的 `Front Matter`

[约定式路由](https://rspress.dev/zh/guide/basic/conventional-route)

## 目录结构

## 下面是文章相关的内容

写文章有两个很关键的点 Markdown 掘金的大家应该都知道了大家可以跳过

Front Matter 可能很多人没接触过


## 为什么选择Rspress

1. 适配我的React技术栈

2. 可以学习 Rspack 和 Rsbuild

3. 文档非常友好
   
4. 全栈搜索功能性能强，UI高亮显示友好

5. 构建速度快，我有上百篇文章需要构建

6. 大厂背书

借此可以慢慢完全掌控和理解项目，基于项目做一些新技术的尝试和练习

缺点: 可选扩展功能少，有问题需要自己翻源码，更新频繁