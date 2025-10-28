---
title: TS类型技巧(三):递归
date: 2025-05-22 21:40:37
categories: 技术栈
tags: 
    - TypeScript
---

应对数量不确定的情况时, 需要使用 __递归__

## 1. 提取Promise value类型

```ts
type ttt = Promise<Promise<Promise<number>>>
type DeepPromiseValueType<T> = T extends Promise<infer U>
    ? DeepPromiseValueType<U>
    : T
// number
type ttt2 = DeepPromiseValueType<ttt>
```

## 2. 反转数组

```ts
type ReverseArr<Arr extends unknown[]> = Arr extends [
    infer First,
    ...infer Rest
]
    ? [...ReverseArr<Rest>, First]
    : Arr
// [5,4,3,2,1]
type arr2 = ReverseArr<arr>
```

注意泛型不能写成 `type ReverseArray<T: any[]>`, `:`是函数的语法

## 3. 查找数组元素

```ts
type Includes<
    Arr extends unknown[],
    FindItem
> = Arr extends [infer First, ...infer Rest]
    ? IsEqual<First, FindItem> extends true
        ? true
        : Includes<Rest, FindItem>
    : false

type IsEqual<A, B> = (A extends B ? true : false) &
    (B extends A ? true : false)

type arr3 = [1, 2, 3, 4, 5]
type res = Includes<arr3, 3> // true
type res2 = Includes<arr3, 6> // false
```

## 4. 删除数组元素

```ts
type RemoveItem<
    T extends unknown[],
    DeleteItem,
    Result extends unknown[] = []
> =
    // 不管相不相等都继续递归 RemoveItem, 直到数组为空返回Result, 做到全部删除
    T extends [infer First, ...infer Rest]
        ? IsEqual<First, DeleteItem> extends true
            ? // 如果相等就不放进Result,
              RemoveItem<Rest, DeleteItem, Result>
            : // 如果不相等,就放进Result, 注意...Result在前面
              RemoveItem< Rest, DeleteItem, [...Result, First] >
        : Result

type IsEqual<A, B> = (A extends B ? true : false) &
    (B extends A ? true : false)

type arr5 = [1, 2, 3, 3, 4, 5, 3]
type res4 = RemoveItem<arr5, 3> // [1,2,4,5]
```

## 5. 扁平化数组

```ts
// 两层
type Flatten<
    Arr extends unknown[],
    Result extends unknown[] = []
> = Arr extends [infer First, ...infer Rest]
    ? First extends unknown[]
        ? Flatten<Rest, [...Result, ...First]>
        : Flatten<Rest, [...Result, First]>
    : Result

// 多层
type DeepFlatten<
    Arr extends unknown[],
    Result extends unknown[] = []
> = Arr extends [infer First, ...infer Rest]
    ? First extends unknown[]
        ? Flatten<[...First, ...Rest], Result>
        : Flatten<Rest, [...Result, First]>
    : Result

```

## 6. 构造数组

每次判断下 Arr 的长度是否到了 Length, 是的话就返回 Arr, 否则在 Arr 上加一个元素, 然后递归构造

```ts
type BuildArray<
    Length extends number,
    Ele = unknown,
    R extends unknown[] = []
> = R['length'] extends Length
    ? R
    : BuildArray<Length, Ele, [...R, Ele]>

// [string, string, string, string, string]
type a = BuildArray<5, string>
```

## 技巧! 积累参数（accumulator）

在`4.`中使用了 带累加器的尾递归写法

积累参数（accumulator）+ 尾递归（tail recursion）

具有更好的编译性能, 更受开源库欢迎

不使用累加器, 递归发生在最后一步, 堆栈的“回溯阶段”更重, 而且生成的类型树更大

```ts
// 非累加器写法
type RemoveItem<
    T extends unknown[],
    DeleteItem
> = T extends [infer First, ...infer Rest]
    ? IsEqual<First, DeleteItem> extends true
        ? RemoveItem<Rest, DeleteItem>
        : [First, ...RemoveItem<Rest, DeleteItem>]
    : []
    
// 累加器写法
type RemoveItem2<
    T extends unknown[],
    DeleteItem,
    Result extends unknown[] = []
> = T extends [infer First, ...infer Rest]
    ? IsEqual<First, DeleteItem> extends true
        ? RemoveItem2<Rest, DeleteItem, Result>
        : RemoveItem2<Rest, DeleteItem, [...Result, First]>
    : Result
```

## 7. 字符串递归

__ReplaceStrAll__

```ts
type ReplaceStrAll<
    Str extends string,
    From extends string,
    To extends string
> = Str extends `${infer Prefix}${From}${infer Suffix}`
    ? `${Prefix}${To}${ReplaceStrAll<Suffix, From, To>}`
    : Str

// 'hello typescript typescript'
type f = ReplaceStrAll<'hello world world', 'world', 'typescript'>
```

__StringToUnion__

```ts
type StringToUnion<T extends string> =
    T extends `${infer C}${infer Rest}`
        ? C | StringToUnion<Rest>
        : never

// 'h' | 'e' | 'l' | 'o'
type a = StringToUnion<'hello'>
```

__ReverseStr__

```ts
type ReverseStr<
    T extends string,
    Result extends string = ''
> = T extends `${infer First}${infer Rest}`
    ? ReverseStr<Rest, `${First}${Result}`>
    : Result

type c = ReverseStr<'tenet'> // 'tenet'
```

## 8. 对象类型的递归

__DeepReadonly__

```ts
type DeepReadonly<Obj extends Record<string, any>> = {
    readonly [Key in keyof Obj]: Obj[Key] extends object
        ? Obj[Key] extends Function
            ? Obj[Key]
            : DeepReadonly<Obj[Key]>
        : Obj[Key]
}

type DeepReadonly2<Obj extends Record<string, any>> =
    Obj extends any
        ? {
              readonly [Key in keyof Obj]: Obj[Key] extends object
                  ? Obj[Key] extends Function
                      ? Obj[Key]
                      : DeepReadonly2<Obj[Key]>
                  : Obj[Key]
          }
        : never
type obj = { a: { b: { c: string } } }

// {readonly a: DeepReadonly<{b:{c: string}}>}
type obj1 = DeepReadonly<obj>
// {readonly a: {readonly b: {readonly c: string}}}
type obj2 = DeepReadonly2<obj>
```

`Obj extends any ? { ... } : never` 是 借用条件类型引发 __强制计算/归一化__ 的技巧

## 技巧！强制计算/归一化

### 延迟推导(Deferred Type Resolution)

`type obj1 = {readonly a: DeepReadonly<{b: { c: string}}>}`

非归一化的类型, TS 默认类型推导是惰性的

一个类型别名或泛型引用，在没有访问其属性或结构的上下文中时，不会被立即展开。

只有当上下文 需要 知道类型的具体结构时才会展开,例如`a.b.c`

### 归一化(Normalized)

`type obj2 = {readonly a: {readonly b: {readonly c: string}}}`

__归一化类型(Normalized Type)__, 即表现为最终结构的类型

解开了所有类型别名, 条件类型, 类型推导, 并合并了结果

__条件类型的计算__ 具有优先性 / 触发强制计算 / 触发归一化, 导致当前层被展开

每一层的 `Obj extends any ? ... : never` 都会触发 __分布式条件类型的计算__

```ts
// 条件类型归一化/强制计算
type Distribute<T> = T extends unknown ? T : never;
// 映射类型归一化
type Simplify<T> = { [P in keyof T]: T[P] }
```

条件类型归一化(Distribute, ForceCompute)，映射类型归一化(Simplify)
