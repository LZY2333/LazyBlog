---
title: Zustand Scoped Store：Zustand + ReactContext
date: 2026-02-24 00:08:00
categories: 技术栈
tags:
  - React
  - Zustand
---

- Context 解决的是“**store 实例分发**”问题
- Zustand 解决的是“**状态更新与订阅**”问题
- 两者配合是为了实现 **scoped store（作用域 store）**，不是重复造轮子

---

## 1. 核心思想

### 1.1 两层职责拆分

- `React Context`：把当前页面/模块的 store 实例注入给子树
- `Zustand`：管理状态、变更、订阅
- `selector + equalityFn`：控制渲染粒度，减少无效重渲染

### 1.2 为什么不只用 `useRouter` / 全局单例 store

- 只用路由状态：组件容易被路由对象变化牵连重渲染
- 只用全局单例 store：不同页面/模块间状态容易互相污染
- scoped store：页面级隔离、可按路由初始化、测试可注入

---

## 2. Demo代码

```tsx
import { createContext, useContext, useRef } from 'react'
import { create } from 'zustand'
import { useStoreWithEqualityFn } from 'zustand/traditional'
import { shallow } from 'zustand/shallow'

// 1) store state + action
interface CounterState {
  count: number
  step: number
  setStep: (n: number) => void
  increment: () => void
  reset: () => void
}

// 2) store 工厂：每次调用可生成独立实例（关键）
const createCounterStore = (initialCount = 0, initialStep = 1) =>
  create<CounterState>()((set, get) => ({
    count: initialCount,
    step: initialStep,
    setStep: (n) => set({ step: Math.max(1, n) }),
    increment: () => set({ count: get().count + get().step }),
    reset: () => set({ count: initialCount }),
  }))

// 3) Context 只负责“传 store 实例”
const CounterStoreContext = createContext<
  ReturnType<typeof createCounterStore> | null
>(null)

interface CounterProviderProps {
  initialCount?: number
  initialStep?: number
  children: React.ReactNode
}

export function CounterProvider({
  initialCount = 0,
  initialStep = 1,
  children,
}: CounterProviderProps) {
  // 用 ref 保证 Provider 生命周期内 store 实例稳定
  const storeRef = useRef<ReturnType<typeof createCounterStore> | null>(null)

  if (!storeRef.current) {
    storeRef.current = createCounterStore(initialCount, initialStep)
  }

  return (
    <CounterStoreContext.Provider value={storeRef.current}>
      {children}
    </CounterStoreContext.Provider>
  )
}

// 4) 统一消费 hook：selector + shallow 做精准订阅
export function useCounterStore<T>(selector: (s: CounterState) => T): T {
  const store = useContext(CounterStoreContext)
  if (!store) {
    throw new Error('useCounterStore must be used within CounterProvider')
  }
  return useStoreWithEqualityFn(store, selector, shallow)
}

// 5) 业务组件：仅订阅自己需要的字段
function CounterPanel() {
  const { count, step, setStep, increment, reset } = useCounterStore((s) => ({
    count: s.count,
    step: s.step,
    setStep: s.setStep,
    increment: s.increment,
    reset: s.reset,
  }))

  return (
    <div style={{ border: '1px solid #ddd', padding: 12, marginBottom: 12 }}>
      <p>count: {count}</p>
      <p>step: {step}</p>
      <button onClick={increment}>+step</button>
      <button onClick={reset} style={{ marginLeft: 8 }}>
        reset
      </button>
      <button onClick={() => setStep(step + 1)} style={{ marginLeft: 8 }}>
        step + 1
      </button>
    </div>
  )
}

// 6) 同页多个 Provider：状态互不干扰（scoped store 的价值）
export default function App() {
  return (
    <>
      <h3>Counter A</h3>
      <CounterProvider initialCount={0} initialStep={1}>
        <CounterPanel />
      </CounterProvider>

      <h3>Counter B</h3>
      <CounterProvider initialCount={100} initialStep={10}>
        <CounterPanel />
      </CounterProvider>
    </>
  )
}
```

---

## 3. 优点与对比

| 方案 | 优点 | 缺点 | 适合场景 |
| --- | --- | --- | --- |
| 全局单例 Zustand | 简单、上手快 | 容易全局污染，测试隔离差 | 小项目/全局偏好状态 |
| 纯 Context + useState/useReducer | 无外部依赖 | 粒度粗，重渲染控制弱 | 轻量状态、低频更新 |
| Zustand + Context（scoped store） | 实例隔离、精准订阅、初始化可控 | 实现复杂度略高 | 页面级复杂工作流 |

重点收益：

- 同类模块可多实例并存，互不影响
- 通过 selector/equality 控制渲染粒度
- 可按页面路由参数创建初始状态
- 测试时可以注入不同 Provider 初始值

---

## 4. 适用场景

推荐使用 scoped store 的场景：

- 页面像“工作台”一样复杂（左表单 + 右结果/历史）
- 同一页面有多个同类型状态区域，需要实例隔离
- 需要“URL 参数 -> store 初始状态 -> UI”的稳定链路
- 需要高可测性（每个测试用例独立初始化）

不必使用 scoped store 的场景：

- 仅有少量全局状态（主题、用户偏好）
- 模块简单且不会多实例复用

---

一句话收尾：

> Context 管实例边界，Zustand 管状态订阅；当你要“页面级隔离 + 渲染可控”，就用 scoped store。
