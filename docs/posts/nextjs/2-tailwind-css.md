---
title: Tailwind CSS
date: 2026-02-07 13:16:52
categories: 技术栈
tags:
    - NextJS
---

## tailwindcss.config.js

```js
/** @type {import('tailwindcss').Config} */
// 第一行: JSDoc 类型注释, TypeScript 的类型导入语法, 意为从 tailwindcss 包里拿 Config 类型
// 作用是 给下面的对象加上类型提示, 是给 编辑器 + TypeScript 类型系统 读取的
// 如果改名.ts 就直接 import 就行了。
module.exports = {
    content: [],
    theme: {},
    plugins: [],
}
```

`content: ["./src/**/*.{js,ts,jsx,tsx}"]` 请配置后缀

> 某些页面没样式, tailwindcss.config content 没有添加这个页面

## 动态类名丢失问题

源码中任意位置出现了完整类名都会被打包, `tailwindcss.config` 的 `content` 范围内

换句话说 注释里的类名都会被打包, 但 `bg-${color}-600`动态类名 非完整类名不会被打包

动态类名不打包 解决方案:

1. 提前使用变量写成 完整类名, 而非使用时拼接

2. tailwind.config.js 中配置 safelist

## 类名优先级问题

tagged-classnames-free

__类的优先级 取决于 样式文件中出现的先后顺序__ 越晚出现，优先级越高

className中的先后顺序不影响优先级
```tsx
// 最终结果为红色
function Button({className}) {
  return (
    <button type="submit" className={`bg-red-600 w-1/2 p-2 m-2 rounded text-white ${className}`} >
      提交
    </button>
  )
}

export default function Home() {
  return (
    <Button className="bg-blue-600" />
  );
}
```

`npm i tailwind-merge` 解决这个问题

twMerge() 函数支持传入多个参数，如果发生冲突，后传入的类名优先级更高，会覆盖之前的类名
```tsx
import { twMerge } from 'tailwind-merge'
className={twMerge("bg-red-60 w-1/2 p-2 m-2 rounded text-white", className)}
```




[辅助书写 tailwind css 的网站](https://tailwind.spacet.me/)
