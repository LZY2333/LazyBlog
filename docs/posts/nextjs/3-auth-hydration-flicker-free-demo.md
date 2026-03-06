---
title: Next.js 登录态无闪烁渲染（Hydration Flicker Free）
date: 2026-03-04 18:20:00
categories: 技术栈
tags:
    - NextJS
    - Hydration
    - SSR
    - TailwindCSS
---

## TL;DR

避免“首屏先看到 Login，水合后又变头像”这类闪烁，可以用这套方案：

1. 在 React 水合前，用内联脚本从 cookie 计算登录态。
2. 把结果写到 `html[data-user-status]`。
3. 用 Tailwind 自定义变体 `user-valid` / `user-vague` 做首屏分流。

这个方案的核心价值是：**首屏稳定，不依赖 `useSession()` 的 loading 结束**。

## 这个问题为什么会出现

Next.js SSR 输出的是“服务端那一刻的 UI”，但真实登录态通常要等客户端拿到 cookie/session 再确认。

于是经常出现：

- SSR 先输出了未登录按钮。
- 客户端水合后发现其实已登录。
- UI 立刻切换成头像，造成闪烁。

## Demo 目标

我们做一个最小 Demo，保证：

- 首屏直接展示正确登录态。
- 不出现登录按钮/头像的瞬时互跳。
- 登录、登出后无需刷新页面，状态立即切换。

## Demo 目录

```txt
app/
  layout.tsx
  globals.css
  page.tsx
components/
  AuthEntry.tsx
lib/
  user-status-script.ts
tailwind.config.ts
```

## Step 1: 水合前写入 `data-user-status`

`lib/user-status-script.ts`

```ts
export function userStatusScript() {
  const cookieKey = 'user-info'

  const detectIsValidUser = () => {
    const cookieDecoded = document.cookie.includes('%')
      ? decodeURIComponent(document.cookie)
      : document.cookie

    // 匹配 user-info={...}
    const userInfoReg = new RegExp(`${cookieKey}=\\{(.*?)\\}`)
    const matched = userInfoReg.exec(cookieDecoded)
    if (!matched || !matched[1]) return false

    // 只要有 email 就视为 valid
    return /.*"email":"(.+?)".*/.test(matched[1])
  }

  const updateHtmlUserStatus = () => {
    document.documentElement.dataset.userStatus = detectIsValidUser()
      ? 'valid'
      : 'vague'
  }

  updateHtmlUserStatus()
  ;(window as any).updateHtmlUserStatus = updateHtmlUserStatus
}
```

`app/layout.tsx`

```tsx
import Script from 'next/script'
import { userStatusScript } from '@/lib/user-status-script'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='zh-CN'>
      <body>
        <Script
          id='user-status-script'
          strategy='beforeInteractive'
          dangerouslySetInnerHTML={{
            __html: `(${userStatusScript.toString()})()`,
          }}
        />
        {children}
      </body>
    </html>
  )
}
```

这里的关键点是 `beforeInteractive`，让状态在 React 接管前就落到 DOM 上。

## Step 2: Tailwind 增加用户态变体

`tailwind.config.ts`

```ts
import plugin from 'tailwindcss/plugin'

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  plugins: [
    plugin(({ addVariant }) => {
      addVariant('user-vague', ':is(:where([data-user-status="vague"]) &)')
      addVariant('user-valid', ':is(:where([data-user-status="valid"]) &)')
      addVariant('user-checked', ':is(:where([data-user-status]) &)')
    }),
  ],
}
```

## Step 3: 用 CSS 分流登录入口和头像

`components/AuthEntry.tsx`

```tsx
'use client'

export function AuthEntry() {
  return (
    <div className='flex items-center gap-3'>
      <div className='user-vague:block hidden'>
        <button className='rounded bg-black px-3 py-1 text-white'>Login</button>
      </div>

      <div className='user-valid:block hidden'>
        <button className='flex size-8 items-center justify-center rounded-full bg-orange-500 text-white'>
          A
        </button>
      </div>
    </div>
  )
}
```

说明：

- 这两个分支都会挂载。
- 但首屏显示由 `data-user-status` 决定，因此视觉上不会闪。

## Step 4: 登录/登出后实时更新

`app/page.tsx`

```tsx
'use client'

import { AuthEntry } from '@/components/AuthEntry'

function setCookie(value: string) {
  document.cookie = value
  ;(window as any).updateHtmlUserStatus?.()
}

export default function Page() {
  return (
    <main className='space-y-4 p-6'>
      <h1 className='text-xl font-semibold'>Hydration Flicker Free Demo</h1>
      <AuthEntry />

      <div className='flex gap-3'>
        <button
          className='rounded border px-3 py-1'
          onClick={() => {
            // 模拟登录：写入有 email 的 user-info
            setCookie(
              'user-info={"id":"u_1","name":"Alice","email":"alice@demo.com"}; path=/'
            )
          }}
        >
          Mock Login
        </button>

        <button
          className='rounded border px-3 py-1'
          onClick={() => {
            // 模拟登出：清理 cookie
            setCookie('user-info={"id":""}; max-age=0; path=/')
          }}
        >
          Mock Logout
        </button>
      </div>
    </main>
  )
}
```

## 效果验证

你应该观察到：

- 刷新页面时不再出现“先 Login 再头像”或反向跳变。
- 点击 `Mock Login/Logout` 后，UI 立即切换，不需要刷新。

## 方案二：组件始终渲染 + CSS 类名控制显隐

除了 Tailwind 变体，还有一种更通用的做法：**所有分支组件都始终渲染到 DOM，通过动态 className 控制显隐**。

核心区别在于——不用条件渲染：

```tsx
// ❌ 条件渲染：切换时组件会卸载/挂载，容易闪烁
{isLogin ? <Avatar /> : <LoginButton />}
```

而是始终挂载，用 CSS 切换可见性：

```tsx
// ✅ 始终渲染，CSS 控制显隐
<div className={isLogin ? '' : 'hidden'}>
  <Avatar />
</div>
<div className={isLogin ? 'hidden' : ''}>
  <LoginButton />
</div>
```

### 实际项目示例

以下代码来自项目中的 `ProjectName.tsx`，创建项目按钮始终渲染，通过 `hidden` 类名控制显隐：

```tsx
{/* 创建项目按钮 - 始终渲染，通过 CSS 控制显示/隐藏 */}
<div className={`my-2 ${newProjectButtonDisabled ? 'hidden' : ''}`}>
  <div
    className='flex h-9 w-full cursor-pointer items-center justify-center gap-2 rounded-lg ...'
    onClick={handleCreateProject}
  >
    <CssIcon className='i-cus--pol-add size-[18px]' />
    <Trans>Project</Trans>
  </div>
</div>
```

### 适用于登录态的 Demo

```tsx
'use client'

export function AuthEntry({ isLogin }: { isLogin: boolean }) {
  return (
    <div className='flex items-center gap-3'>
      {/* 两个分支始终挂载，仅通过 hidden 切换 */}
      <div className={isLogin ? 'hidden' : ''}>
        <button className='rounded bg-black px-3 py-1 text-white'>Login</button>
      </div>

      <div className={isLogin ? '' : 'hidden'}>
        <button className='flex size-8 items-center justify-center rounded-full bg-orange-500 text-white'>
          A
        </button>
      </div>
    </div>
  )
}
```

### 为什么有效

1. **组件始终在 DOM 中**，状态变更时不触发挂载/卸载，避免了 React 生命周期引起的闪烁。
2. `hidden`（即 `display: none`）切换是纯 CSS 操作，浏览器处理极快。
3. 不依赖 Tailwind 自定义变体，任何 CSS 方案都能用。

### 与方案一的对比

| | 方案一（Tailwind 变体） | 方案二（CSS 类名显隐） |
|---|---|---|
| 首屏（React 水合前） | CSS 直接生效，无闪烁 | 需要依赖初始 className 的正确性 |
| 依赖 | Tailwind 自定义变体 + 内联脚本 | 仅需 `hidden` 类 |
| 适用场景 | 首屏关键路径（Header 等） | 非首屏或已有状态的交互区域 |
| 复杂度 | 需要配置 Tailwind plugin | 零配置 |

> 两个方案可以组合使用：首屏关键路径用方案一保证水合前无闪烁，其余交互区域用方案二简化代码。

## 这个方案的代价

这是方案的真实 trade-off：

1. 登录分支和未登录分支都渲染了。
2. 两套分支的 hooks 也会执行（如果你写在分支内部组件里）。
3. 对重组件不友好，可能增加一点运行成本。

## 工程化建议

推荐分层使用：

1. **Header 关键入口**（最怕闪烁）用这套 CSS 分流。
2. **重组件区域**（例如复杂弹层、列表）用 React 条件渲染，避免双挂载。
3. hydration 完成后，可以切换到单分支渲染，进一步降成本。

## 结论

如果你的目标是“首屏稳态优先”，这个方案是非常实用的：

- 它不是消灭 hydration 问题。
- 它是把“首屏显示决策”前置到 React 之前。
- 代价可控，收益直观。
