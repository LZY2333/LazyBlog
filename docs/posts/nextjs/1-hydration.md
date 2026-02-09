---
title: 水合问题
date: 2026-02-07 22:22:26
categories: 技术栈
tags:
    - NextJS
    - React
---

## 水合（Hydration）

1.浏览器已有 SSR 的 HTML,

2.React等框架 正常执行构建fiber树，却不重新创建节点，

3.而是复用 SSR HTML 使其变为可交互。

干html+css => fiber构建挂载 => 原commit生成DOM 变为 水合激活 => useEffect钩子执行

## 水合问题（Hydration Mismatch）

__服务端渲染的 HTML 与客户端首次渲染的 DOM 不一致，React 无法安全挂载。__

报错: `Hydration failed because the initial UI does not match`。

SSR框架不会有水合问题, 只有天然依赖客户端的业务, 服务的端无法模拟

造成 SSR 与 CSR 输出不一致, 从而出现水合问题

核心目标不是“消灭水合问题”，而是“管理水合风险”。

| 来源          | 示例                                   |
| ------------- | -------------------------------------- |
| 浏览器 API    | `window`、`document`、`localStorage`   |
| 脚本 用户状态 | 埋点、广告、是否登录、语言、地区、主题 |
| 随机/时间     | `Math.random()`、`Date.now()`          |
| 动态逻辑      | AB 测试、Feature Flag、客户端配置      |

__不可避免型水合问题__

数据只能在浏览器中获取 → 不可避免

时间 屏幕尺寸 localStorage 广告系统 Canvas DOM尺寸

## 水合问题解决方案

## useEffect + mountedState 控制

```tsx
function Comp() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 也可先返回定制占位符, SEO更友好
  if (!mounted) return null;

  return <div>{Date.now()}</div>;
}
```

## Data Down

数据下沉（）:Server → Client

服务端组件先算好数据 → 通过 props 传给客户端组件用

```tsx
export default async function Page() {
  const now = Date.now(); // 在服务端执行
  return <ClientComp now={now} />;
}

function ClientComp({ now }) {
  return <div>{now}</div>;
}
```
天然水和 两端一致

## suppressHydrationWarning

```tsx
<span suppressHydrationWarning>
  {Date.now()}
</span>
```
忽略差异 不建议滥用

## next/dynamic关闭 SSR（Client Only）

```tsx
import dynamic from "next/dynamic";
import { Suspense } from "react";

const ClientComp = dynamic(() => import("./Comp"), {
  ssr: false,
  // loading: () => null // 使用suspense更符合规范
});

<Suspense fallback={<div>Loading...</div>}>
  <ClientComp />
</Suspense>;
```
关闭SSR 客户端渲染 完全绕过水合 失去 SEO

适用场景：编辑器 图表 地图 广告组件

## props 序列化问题

Next.js 将 RSC 与 SSR 结合,即 首屏SSR 与 组件和其props(flight) 同步传输给浏览器。

hydration 时, props 传给 组件再执行一遍, 挂载给HTML

props必须序列化成json 才能通过 http发送过去

Next 用 **`JSON.stringify`** 序列化 `getServerSideProps` / `getStaticProps` 的返回值

再通过 `<script id="__NEXT_DATA__">` 等把字符串发到客户端，客户端用 **`JSON.parse`** 还原。

**能正确往返的类型**：字符串、数字、布尔、`null`、纯对象、数组（即「JSON 可序列化」的类型）。

**会变形或丢失的**：

| 类型 | 序列化结果 | 反序列化后 |
|------|------------|------------|
| `Date` | ISO 字符串 `"2025-02-08T12:00:00.000Z"` | **字符串**，不是 Date 实例 |
| `undefined` | 被省略（或在某些结构中变成 `null`） | 丢失 / 变成 `null` |
| `Map` / `Set` | 转成 `{}`（空对象） | 普通对象，不是 Map/Set |
| `BigInt` | **直接报错**（JSON.stringify 不支持） | - |
| `RegExp` | 转成 `{}` | 丢失 |
| `NaN` / `Infinity` | 变成 `null` | 丢失 |

**示例**（假设 props = `{ name: 'pollo', createdAt: new Date('2025-02-08') }`）：

{  
  "name": "pollo",  
  "createdAt": "2025-02-08T00:00:00.000Z"  
}

## SuperJSON 解决序列化问题
