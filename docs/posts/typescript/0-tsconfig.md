---
title: .tsconfig.ts
date: 2026-02-07 13:16:52
categories: 技术栈
tags:
    - TypeScript
    - NextJS
---

## TS类型来源

1. 当前项目 ts文件 .d.ts文件

2. tsconfig 内的 paths 映射的包内的 ts文件 .d.ts文件

3. import node_modules 包内置 package.json的types 或 .d.ts

4. tsconfig 内的 target lib

## tsconfig是否影响编译

tsconfig 只影响 tsc编译, 但 NextJS 编译会默认读取

Webpack Vite 编译默认不读取, 可以使用 ts-loader / tsconfig-paths 读取

以减少 paths / alias 的重复配置

一般配置`noEmit: true` 不生成任何输出文件仅用于类型检查

## 待填坑
