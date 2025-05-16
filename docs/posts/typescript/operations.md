---
title: TS类型运算
date: 2025-05-15 21:58:58
categories: 技术栈
tags: 
    - TypeScript
---

# TypeScript 类型运算简明指南

TypeScript 提供了丰富的类型运算能力，可以对类型进行提取、转换、组合等高级操作，以下是常见的五类类型运算及其用法：

---

## 条件类型（extends ? :）

**用途**：根据类型是否符合某种条件，选择不同的类型，常用于类型分发、类型重定向。

```ts
type IsString<T> = T extends string ? true : false;

type A = IsString<'hello'>; // true
type B = IsString<123>;     // false

// 联合类型将分发：
type C = IsString<string | number>; // true | false
```

---

## 类型推导（infer）

**用途**：在条件类型中提取某部分类型，常用于解构、提取函数参数或返回值等。

```ts
type ReturnTypeOf<T> = T extends (...args: any[]) => infer R ? R : never;

type Fn = (a: number) => string;
type R = ReturnTypeOf<Fn>; // string

// 提取 Promise 的值类型
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;
type X = UnwrapPromise<Promise<number>>; // number
```

---

## 联合类型（`|`）

**用途**：表示类型可以是多个类型之一，用于建模“多选一”的类型结构。

```ts
type Status = 'success' | 'error' | 'loading';

function handle(status: Status) {
  // 参数只能是这三者之一
}
```

联合类型配合条件类型可用于分发操作。

```ts
type ToArray<T> = T extends any ? T[] : never;
type Arr = ToArray<1 | 2>; // 1[] | 2[]
```

---

## 交叉类型（`&`）

**用途**：将多个类型合并为一个，同时具有所有成员，常用于扩展类型。

```ts
type A = { name: string };
type B = { age: number };
type C = A & B; // { name: string; age: number }

const person: C = { name: 'Tom', age: 30 };
```

---

## 类型映射（Mapped Types）

**用途**：批量转换对象的键类型或值类型，常用于构造工具类型。

```ts
type Readonly<T> = {
  readonly [K in keyof T]: T[K];
};

type User = { name: string; age: number };
type ReadonlyUser = Readonly<User>; 
// { readonly name: string; readonly age: number }

type ToBoolean<T> = {
  [K in keyof T]: boolean;
};
type Flags = ToBoolean<{ dark: string; sound: number }>;
// { dark: boolean; sound: boolean }
```

---

## 小结

| 运算符/关键字    | 功能概述           |
| ---------------- | ------------------ |
| `extends ? :`    | 条件判断分支类型   |
| `infer`          | 在条件中推导子类型 |
| `                | `                  | 联合类型（或） |
| `&`              | 交叉类型（与）     |
| `[K in keyof T]` | 映射类型转换       |

以上类型运算是构建复杂类型逻辑、提升类型安全的基础工具，广泛应用于泛型工具类型设计、框架类型推导等场景中。


## 🧠 类型系统运算符与工具表

| 运算符 / 机制              | 名称                     | 功能描述                                      |
| -------------------------- | ------------------------ | --------------------------------------------- |
| `extends`                  | 条件类型判断             | 判断类型是否兼容，常与三元结构 `? :` 配合使用 |
| `? :`                      | 条件类型分支             | 返回不同类型结果                              |
| `infer`                    | 类型推导                 | 在条件类型中提取子类型                        |
| `                          | `                        | 联合类型（Union）                             | 多种可能之一 |
| `&`                        | 交叉类型（Intersection） | 多个类型合并为一个                            |
| `keyof`                    | 索引类型查询             | 提取对象类型的所有键名组成联合类型            |
| `typeof`（类型上下文）     | 获取值的类型             | 从变量或函数中获取类型信息                    |
| `in`（Mapped Type 中）     | 键映射遍历               | 遍历类型键名构造新类型                        |
| `as`（Mapped Type 中）     | 键名重映射               | 映射类型中重命名键                            |
| `[]`（索引访问类型）       | 索引类型                 | 提取指定属性的类型                            |
| `T[K]`                     | 泛型索引访问             | 动态访问属性类型                              |
| `Partial<T>`               | 工具类型                 | 所有属性变为可选                              |
| `Required<T>`              | 工具类型                 | 所有属性变为必选                              |
| `Readonly<T>`              | 工具类型                 | 所有属性变为只读                              |
| `Pick<T, K>`               | 工具类型                 | 从类型中选取部分键组成新类型                  |
| `Omit<T, K>`               | 工具类型                 | 从类型中排除指定属性                          |
| `Record<K, T>`             | 工具类型                 | 构建键为 K，值为 T 的对象类型                 |
| `Exclude<T, U>`            | 类型排除                 | 从 T 中排除 U 类型成员                        |
| `Extract<T, U>`            | 类型提取                 | 从 T 中提取出可赋给 U 的成员                  |
| `NonNullable<T>`           | 移除 null/undefined      | 从类型中排除 null 和 undefined                |
| `ReturnType<T>`            | 函数返回类型             | 获取函数的返回值类型                          |
| `Parameters<T>`            | 函数参数类型             | 获取函数参数列表的元组类型                    |
| `ConstructorParameters<T>` | 构造函数参数类型         | 获取构造函数参数类型列表                      |
| `InstanceType<T>`          | 构造函数实例类型         | 获取构造函数创建出的实例类型                  |
| `ThisType<T>`              | 设置 this 类型上下文     | 用于对象字面量中指定 `this` 的类型            |
| `Awaited<T>`               | Promise 解包             | 提取 Promise 中的值类型                       |

---

## 📌 附加说明：

- 工具类型如 `Partial`、`Pick` 等实质是对基本类型运算的封装。
- Mapped Type、Conditional Type、Indexed Access 是高级类型构造的基础。
- `infer` 与 `extends` 的组合支持类型推导、反推和提取。
- TypeScript 5.x 之后新增如 `satisfies` 表达式、精准 const 推导等语法糖。

---
