---
title: TS类型技巧(六):特殊类型
date: 2025-05-27 22:05:31
categories: 技术栈
tags: 
    - TypeScript
---


## 1. IsAny

__any 与任何类型的交叉类型都是 any__
```ts
type IsAny<T> = 0 extends (2 & T) ? true : false
```
0 和 1 可以换成任意两个不同的类型

## 2. IsEqual(待理解)

```ts
// 之前的简易实现
type IsEqual0<A, B> = (A extends B ? true : false) &
    (B extends A ? true : false)
// true, 无法判别any
type isEqualRes0 = IsEqual0<'a', any>
```

```ts
// 最终实现
type IsEqual<A, B> =
    (<T>() => T extends A ? 1 : 2) extends 
    (<T>() => T extends B ? 1 : 2)
    ? true : false;
// false
type isEqualRes1 = IsEqual<'a', any>
```

`IsEqual` 中 `any` 的万能特性似乎失效了

__函数参数的双重泛型分发差异__, `IsEqual` 中

这是比较两个泛型函数签名的 assignability（能否赋值给彼此）。

当 A 是 any 时，T extends A 会总是 true，所以整个函数返回类型恒为 1。

而 T extends B 就看 B 是否为 any 或其它类型，结果是变化的。

函数类型的判断是整体结构相同且参数类型相容才算相等；

在泛型中加入条件逻辑后，any 的透明性会失效。

```ts
type F1 = <T>() => T extends any ? 1 : 2;    // always 1
type F2 = <T>() => T extends string ? 1 : 2;

type Test = F1 extends F2 ? true : false;    // false ✅
```
如果 F1 是完全相同的结构，它应该被认为是 F2 的子类型；

但由于 F1 总是返回 1，而 F2 的行为依赖于 T，因此两者不等。

这就是 any 被“识破”的机制。

## 3. NotEqual

```ts
type NotEqual<A, B> =
    (<T>() => T extends A ? 1 : 2) extends
    (<T>() => T extends B ? 1 : 2)
    ? false : true
```

## 4. IsUnion

```ts
type IsUnion<A, B = A> = A extends A
    ? [B] extends [A]
        ? false
        : true
    : never
```

## 5. IsNever

```ts
type IsNever<T> = [T] extends [never] ? true : false
```

如果条件类型左边是never, 那永远返回never
```ts
type BadIsNever<T> = T extends never ? true : false;
// never
type testBadIsNever = BadIsNever<never>
```

## 6. IsTuple

元组类型的 length 是数字字面量，而数组的 length 是 number

```ts
type IsTuple<T> = T extends [...params: infer args]
    ? NotEqual<args['length'], number>
    : false
    
type NotEqual<A, B> =
    (<T>() => T extends A ? 1 : 2) extends
    (<T>() => T extends B ? 1 : 2)
    ? false : true
// true
type test9 = IsTuple<[1, 2, 3]>
```

## 7. UnionToIntersection

联合类型转交叉类型
```ts
type UnionToIntersection<U> =
    (U extends U ? (x: U) => unknown : never) extends
    (x: infer R) => unknown
    ? R
    : never
```

`U extends U` 是为了触发联合类型的分发，每个类型单独计算,最后合并

利用 U 做为参数构造个函数，通过模式匹配取参数的类型

TS 中有函数参数是有逆变性，如果参数是多个类型，参数类型会变成它们的交叉类型

## 8. GetOptional

提取索引类型中的可选索引

可选属性其Key可能没有,即`{}`是其子类型
```ts
type GetOptional<Obj extends Record<string, any>> = {
    [Key in keyof Obj as {} extends Pick<Obj, Key>
        ? Key
        : never]: Obj[Key]
}
// { b?: number | undefined; }
type testGetOptional = GetOptional<{ a: 1; b?: number }>
```

可选索引 表现为值是 `T | undefined`, 但 `T | undefined` 不代表是可选索引

可选索引 必须有 `?`

## 9. GetRequired

与可选索引相反的就是required
```ts
type isRequired<
    Key extends keyof Obj,
    Obj
> = {} extends Pick<Obj, Key> ? never : Key

type GetRequired<Obj extends Record<string, any>> = {
    [Key in keyof Obj as isRequired<Key, Obj>]: Obj[Key]
}
// { a: 1 }
type testGetRequired = GetRequired<{ a: 1; b?: number }>
```

## 10. RemoveIndexSignature

`{[key: string]: any}` 索引签名, 代表可添加任意 Key 为 string 索引

```ts
// 删除 索引签名
type RemoveIndexSignature<Obj extends Record<string, any>> = {
    [Key in keyof Obj as Key extends `${infer Str}`
        ? Str
        : never] : Obj[Key]
}
// { a: 1 }
type testGetRemoveIndexSignature = RemoveIndexSignature<{
    [key: string]: any
    a: 1
}>
```

索引签名不能构造成字符串字面量类型，因为它没有名字，而其他索引可以

## 11. ClassPublicProps

过滤出 class 的 public属性

keyof 只能拿到 class 的 public 索引，不能拿到 private 和 protected
```ts
type ClassPublicProps<Obj extends Record<string, any>> = {
    [Key in keyof Obj]: Obj[Key]
}
class testClass {
    public a: boolean
    protected b: number
    private c: string
}
// { a: boolean }
type testGetClassPublicProps = ClassPublicProps<testClass>
```

## 12. as const

TS 默认推导出来的类型不会是字面量类型,也就是某一固定值
```ts
const obj = { a:1,b:2 }
// { a: number; b: number; }
type TypeObj = typeof obj

const obj2 = { a:1,b:2 } as const
// { readonly a: 1; readonly b: 2; }
type TypeObj = typeof obj2
```

`as const` 具有常量 和 readonly 双重含义

所以通过`typeof (常量 as const)` 推导出 的字面量类型必含 readonly属性

所以再通过 模式匹配提取类型 时也要加上 readonly 的修饰才行

```ts
const arrConst = [1, 2] as const
type arrConstType = typeof arrConst

type IsConstOnly<Arr> =
    // 这里必须加 readonly
    Arr extends readonly [infer A, infer B] ? true : false
// true
type testGetConstOnly = IsConstOnly<arrConstType>
```

`as const` 常见使用场景, 模拟枚举
```ts
const colors = ['red', 'green', 'blue'] as const;
// "red" | "green" | "blue"
type Color = typeof colors[number];
```


