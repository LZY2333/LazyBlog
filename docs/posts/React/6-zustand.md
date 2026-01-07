---
title: Zustand
date: 2024-09-18 09:53:05
categories: 技术栈
tags: 
    - React
    - Zustand
---

## 使用

## Zustand优势

```tsx
// 支持selector精确订阅
const useStore = create(set => ({
  count: 0,
  text: 'hello',
  inc: () => set(state => ({ count: state.count + 1 }))
}))

function Counter() {
  const count = useStore(state => state.count)   // 👈 精准订阅
  const inc = useStore(state => state.inc)
  console.log('Counter rendered')
  // 点击 inc 时只会触发 Counter render，不会触发 TextDisplay render
  return <button onClick={inc}>{count}</button>
}

function TextDisplay() {
  const text = useStore(state => state.text)
  console.log('TextDisplay rendered')
  return <p>{text}</p>
}
```

> Context存在的问题:  
> 粒度粗，a字段的修改会影响b字段的使用者也重新render  
> Provider Hell

### useSyncExternalStore
React18 新API 用于订阅外部状态

```js
// 需要外部store提供: 供注册监听器 供获取store状态 SSR使用(可忽略)
useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot?)
```

```js
// 一个外部全局 store
const store = {
    state: { count: 0 },
    listeners: new Set(),

    setState(update) {
        store.state = { ...store.state, ...update };
        store.listeners.forEach((listener) => listener()); // 通知订阅者
    },
    subscribe(listener) {
        store.listeners.add(listener);
        return () => store.listeners.delete(listener);
    },
    getSnapshot() {
        return store.state;
    },
};

// 组件订阅外部全局store
import { useSyncExternalStore } from 'react';

function useStore() {
    return useSyncExternalStore(
        store.subscribe, // 订阅变更
        store.getSnapshot // 获取 snapshot
    );
}

export default function App() {
    const { count } = useStore();
    return (
        <button
            onClick={() =>
                store.setState({ count: count + 1 })
            }>
            {count}
        </button>
    );
}
```

useSyncExternalStore 使得 Zustand 关键特性得以实现:  
局部订阅 + 避免额外re-render + 并发模式兼容

```js
// 为react注册监听器 
useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot?)
```

## 待填坑
