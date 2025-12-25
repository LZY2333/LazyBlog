---
title: React18
date: 2025-12-17 14:32:16
categories: 经验帖
hide: true
tags:
    - React
---

React18有三类链  
1️⃣ Fiber 通过 child / sibling 形成一棵可遍历的树  
2️⃣ Update 以链表形式保存状态更新  
3️⃣ Hook 以链表形式保存 Hook 顺序  
React18有两大循环  
1️⃣ Render 循环（render work loop） performUnitOfWork  
2️⃣ Commit 循环（commit work loop） commitRoot

## Fiber树链表
用途: 非递归DFS遍历  
fiberRoot  
树状链表(child/sibling/return)  
双缓冲

## updateQueue链表
用途：管理状态更新，支持优先级调度  
fiber.updateQueue  
环形链表（pending）+ 单向链表（baseUpdate）

什么时候会插入数据?

## Hooks 链表
用途：保存函数组件的状态和副作用  
Fiber.memoizedState  
单向链表（next）

## Fiber架构
Fiber架构 + 时间切片, 做到了暂停和继续, 以让渡主线程

优先级抢占 则会直接丢失render进度, 可以恢复(updateQueue还在,且为纯函数)

## 其他待整理
  完整流程对比

  ┌─────────────────────────────────────────┐  
  │         Render Phase (可中断)            │  
  ├─────────────────────────────────────────┤  
  │                                         │  
  │ 输入：                                   │  
  │ ├─ current tree                        │  
  │ ├─ ReactElement (新的)                 │  
  │ └─ updateQueue                         │  
  │                                         │  
  │ 处理：                                   │  
  │ ├─ 执行组件函数                         │  
  │ ├─ reconcileChildren (Diff)           │  
  │ ├─ beginWork (向下)                    │  
  │ └─ completeWork (向上)                 │  
  │                                         │  
  │ 【如果被打断】⭐                         │  
  │ ├─ 丢弃 workInProgress 树               │  
  │ ├─ 保存 updateQueue 到 current 树       │  
  │ └─ 下次从头重新开始                     │  
  │                                         │  
  │ 产出：⭐⭐⭐                              │  
  │ ├─ workInProgress 树（完整新树）        │  
  │ ├─ flags（副作用标记）                  │  
  │ ├─ subtreeFlags（子树副作用）           │  
  │ ├─ updateQueue（具体更新内容）          │  
  │ └─ finishedWork（指向根节点）           │  
  │                                         │  
  └─────────────────────────────────────────┘
                ↓
  ┌─────────────────────────────────────────┐  
  │        Commit Phase (同步)               │  
  ├─────────────────────────────────────────┤  
  │                                         │  
  │ 输入：                                   │  
  │ └─ finishedWork (render phase 产出)    │  
  │                                         │  
  │ 处理：                                   │  
  │ ├─ 遍历 Fiber 树                        │  
  │ ├─ 根据 flags 执行 DOM 操作              │  
  │ ├─ 切换 current 树                      │  
  │ └─ 执行副作用                            │  
  │                                         │  
  │ 产出：                                   │  
  │ └─ 更新的 DOM，用户可见 ✅               │  
  │                                         │  
  └─────────────────────────────────────────┘

高优先级

  Render Phase (Reconciliation)

  在内存中操作，不影响 UI

  // beginWork + completeWork 遍历整棵树  
  performUnitOfWork(workInProgress)
    ↓
  beginWork(current, workInProgress)
    ├─ 执行组件函数
    ├─ reconcileChildren (Diff)
    ├─ 创建/复用 Fiber 节点
    ├─ 标记 flags (Placement, Update, Deletion)
    └─ 设置 pendingProps, updateQueue 等
    ↓
  completeWork(current, workInProgress)
    ├─ 创建 DOM 实例（但不插入）
    ├─ 收集 props 变化（diffProperties）
    ├─ 准备 updatePayload
    └─ 冒泡 childLanes

  此时：

- ✅ 已经知道哪些节点需要新增/更新/删除
- ✅ 已经创建了 DOM 实例（但还在内存中）
- ✅ 已经计算出了 props 的变化
- ❌ 还没有真正插入/更新 DOM
- ❌ 用户看不到任何变化

  ---
  Commit Phase

  一次性同步更新 DOM

  与 render 阶段不同，commit 是同步的，一次完成，不会中断，以确保 DOM 永远不会显示部分结果。

  commitRoot(root)
    ↓
  commitRootImpl(root)
    ↓
  // 阶段1: Before Mutation
  commitBeforeMutationEffects(finishedWork)
    ├─ getSnapshotBeforeUpdate
    └─ 异步调度 useEffect
    ↓
  // 阶段2: Mutation (真正的 DOM 操作) ⭐
  commitMutationEffects(root, finishedWork)
    ├─ 遍历 Fiber 树，根据 flags 执行：
    │   ├─ Placement → insertBefore/appendChild  (插入 DOM)
    │   ├─ Update → updateProperties            (更新属性)
    │   └─ Deletion → removeChild               (删除 DOM)
    ├─ componentWillUnmount
    └─ 解绑 ref
    ↓
  // 切换 Fiber 树
  root.current = finishedWork
    ↓
  // 阶段3: Layout
  commitLayoutEffects(root, finishedWork)
    ├─ componentDidMount/Update
    ├─ useLayoutEffect
    └─ 绑定 ref
    ↓
  // 异步执行 useEffect
  flushPassiveEffects()

  此时：

- ✅ DOM 已经更新
- ✅ 用户可以看到变化
- ✅ 所有生命周期/副作用已执行

  ---
  完整流程图示

  用户触发更新 (setState)
    ↓
  ======= Render Phase (可中断/异步) =======
    ↓
  workLoopConcurrent()
    while (workInProgress !== null) {
      performUnitOfWork(workInProgress)
    }
    ↓
  performUnitOfWork(fiber)
    ├─ beginWork(fiber)                    👈 往下走
    │   ├─ 执行组件函数
    │   ├─ 获取 children (ReactElement)
    │   ├─ reconcileChildren             👈 Diff 算法
    │   │   ├─ 对比 oldFiber vs newChildren
    │   │   ├─ 创建/复用 Fiber 节点
    │   │   └─ 标记 flags (Placement/Update/Deletion)
    │   └─ return fiber.child
    ├─ 继续 beginWork(child)
    ├─ ...
    ├─ completeWork(fiber)                 👈 往上走
    │   ├─ 创建 DOM 实例（内存中）
    │   ├─ 计算 props 变化
    │   ├─ 准备 updatePayload
    │   └─ 冒泡 childLanes
    └─ 继续 completeWork(sibling/return)
    ↓
  【此时：只是标记了要做什么，还没真正改 DOM】
    ↓
  ======= Commit Phase (同步/不可中断) =======
    ↓
  commitMutationEffects()                  👈 一次性更新所有 DOM
    ├─ 遍历 Fiber 树
    ├─ 根据 flags 执行真正的 DOM 操作：
    │   ├─ Placement → appendChild        ✅ 真正插入
    │   ├─ Update → updateProperties      ✅ 真正更新
    │   └─ Deletion → removeChild         ✅ 真正删除
    └─ 执行生命周期
    ↓
  【此时：DOM 更新完成，用户看到变化】

  为什么要分两个阶段？

  1. Render Phase 可中断：
  - 可以暂停，让出主线程处理用户输入
  - 可以丢弃，重新开始（如优先级更高的更新到来）
  - 因为只是计算，没有副作用
  
  2.Commit Phase 必须同步：
  - 保证 UI 一致性，不出现中间状态
  - 一次性更新，用户体验更好
  - 必须执行副作用，不能中断

  ---

- beginWork 主要工作是 Diff 和创建/复用 Fiber 节点
- 标记 effect（flags）是在 beginWork 和 completeWork 中都会做
- 收集 effect 链表主要在 completeWork 中（React 17 及以前）
- React 18+ 改为在 commit 阶段遍历 Fiber 树收集 effect

 在 beginWork 和 reconcileChildren 阶段，并没有真正更新组件，而是：

  1. 计算：执行组件函数，得到新的 ReactElement
  2. 对比：Diff 新旧 ReactElement
  3. 标记：给 Fiber 节点打上 flags（Placement、Update、Deletion）
  4. 准备：创建 Fiber 节点，设置 props

 官方术语定义

  Reconciliation 分为两个主要阶段：render phase 和 commit phase。

  Reconciliation (协调/调和)
  ├─ Render Phase (渲染阶段)
  │   ├─ beginWork
  │   ├─ completeWork
  │   └─ 构建 workInProgress 树
  └─ Commit Phase (提交阶段)
      ├─ commitBeforeMutationEffects
      ├─ commitMutationEffects
      └─ commitLayoutEffects

```js
 // 示例：函数组件的 Fiber 节点

const demo = {
    type: MyComponent,

    // 保存 props（中断恢复后使用）
    pendingProps: { count: 1, name: 'new' }, // 新传入的 props
    memoizedProps: { count: 0, name: 'old' }, // 上次的 props

    // 保存 state（Hooks 的数据）
    memoizedState: { // Hooks 链表 ⭐
        // useState 的 Hook
        memoizedState: 0, // count 的值
        queue: { // 更新队列
            pending: {
                // 待处理的更新
                action: (prev) => prev + 1,
                next: null,
            },
        },
        next: { // 下一个 Hook
            // useEffect 的 Hook
            memoizedState: {
                create: () => {}, // effect 函数
                deps: [count], // 依赖
                destroy: undefined, // 清理函数
            },
            next: null,
        },
    },

    // 更新队列（类组件的 setState）
    updateQueue: {
        baseState: { count: 0 },
        firstBaseUpdate: null,
        lastBaseUpdate: null,
        shared: {
            pending: { // 环形链表 ⭐
                payload: { count: 1 },
                next: [circular],
            },
        },
    },

    // 副作用标记
    flags: Update | Passive, // 需要更新 + 有 useEffect

    // 优先级
    lanes: 0b0010, // 当前更新的优先级
    childLanes: 0b0110, // 子树的优先级
};
```

刚刚的回答是react16,react18也是一样分为的调度器 协调器 渲染器吗
react18是 render phase 和 commit phase 是属于 Reconciliation的子阶段, 还是各自是一个大阶段，已经没有 Reconciliation 的概念了? react18 分为哪些大阶段?
FunctionComponent 的 updateQueue 在哪个阶段会存入数据，其数据在哪个阶段会被使用，其内部是哪些数据(新state?新style?)?

```js
// setCount 会创建 update 对象，加入 hook.queue.pending
  const update = {
    eventTime,
    lane,
    tag: UpdateState,
    payload: {
      element: element  // 要渲染的根元素
    },
    callback: callback,  // ReactDOM.render 的第三个参数
    next: null,
  };

  // updateQueue 结构（环形链表）
  updateQueue = {
    baseState: { element: null },
    firstBaseUpdate: null,
    lastBaseUpdate: null,
    shared: {
      pending: update1 → update2 → update1  // 环形
    },
    effects: null,
  };
```
