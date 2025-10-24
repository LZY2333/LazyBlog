---
title: TS基础
date: 2022-11-14 18:34:35
categories: 技术栈
tags: 
    - TypeScript
---

针对入参 动态生成 更精准的类型提示和检查

## 1. 环境准备

`npm i typescript -g` 全局安装TS编译器

`npm i ts-node -g` 安装好后可在vscode右键run直接运行ts

`tsc hello.ts`可运行编译文件

`tsc --init`生成TS配置文件

配置tsconfig.json

```js
{
  "compilerOptions": {
    "target": "es5",
    "module": "commonjs",
    "outDir": "./js"
  }
}
```

运行vscode检视任务

vscode -> 终端 -> 运行生成任务 -> tsc:监视

这样保存ts文件时 会自动编译出js文件,方便查看

## 2. 基本数据类型

### __布尔__ __数字__ __字符串__

```ts
let married: boolean = false;   // boolean
let age: number = 25;           // number
let firstName: string = 'lzy'; // string

let arr2: number[]=[4,5,6];     // array
let arr3: Array<number>=[7,8,9];// array
let arr4: (string | number)[]=[7,8,9,'a'];// array
```

### __数组__ __元组__

__元组__: 表示 类型 和 数量 固定的 数组

与 __数组__ 的区别: 每一项可以是不同类型, 有预定义的长度,

```ts
const animal:[string,number,boolean] = ['lzy',25,true];  // tuple
// 此处如果没定义元组类型，则后两行会报错
let lzy:[string,number] = ['lzy',5]; // tuple
lzy[0].length; // OK
lzy[1].toFixed(2); // OK
```

### __枚举__

__枚举__: 该数据类型的变量 只能为事先写好的几个类型

```ts
// 普通枚举
enum Color {
    Red,// 默认值为 0 
    Yellow,// 默认值为1
    Blue// 默认值为2
}
// 常量枚举
const enum Color2 {
    Red,// 默认值为 0 
    Yellow,// 默认值为1
    Blue// 默认值为2
}
// 常量枚举的变量名(如Red)会在编译时被完全删除,节省变量名开销
// 因为是常量,必然是固定值,调用这个固定值的地方会直接被替换为值

let myColors = [Colors.Red, Colors.Yellow, Colors.Blue];
```

### __symbol__

__symbol__: 表示唯一不变的类型

```ts
const sym1 = Symbol('key');
const sym2 = Symbol('key');
// 报错:此条件将始终返回false
console.log(sym1 === sym2)
```

使用Symbol 需要 ES6 编译辅助库

### __bigint__

__bigint__: 可以安全的 储存 和 操作 大整数

```ts
const max = Number.MAX_SAFE_INTEGER;// 2**53-1
console.log(max + 1 === max + 2); // true,因为溢出了

const max:bigint = BigInt(Number.MAX_SAFE_INTEGER);
console.log(max + 1 === max + 2); // 报错,BigInt 不能直接 + number类型
console.log(max + 1n === max + 2n); // 代表BigInt(1)
```

使用 BigInt 需要 ESNext 的编译辅助库

JS 原始数据类型 BigInt Number,ts 里的类型 bigint number

### any unknown 最大的类型

`any`: 表示任意类型，是所有类型的父类型，是所有类型的子类型

`unknown`: 表示未知，是所有类型的父类型

`any` > `unknown` > `object` | `number` | `string` | `boolean` >

`void` > `undefined` > `null` > `never`

> 是所有类型父类型意味着,不可赋值给任何类型(协变)
>
> 是所有类型子类型意味着,可赋值给任何类型(协变)

### undefined null void never 最小的类型

`void`: 表示没有返回值，是所有类型子类型

`null`: 表示不该有值，是所有类型子类型

`undefined`: 表示未赋值，是所有类型子类型

`never`: 表示永远不会被执行到的类型，是所有类型子类型

__可赋值关系表__

| From \ To   | `void` | `undefined` | `null` | `never` |
| ----------- | ------ | ----------- | ------ | ------- |
| `void`      | ✅      | ❌           | ❌      | ❌       |
| `undefined` | ✅      | ✅           | ✅\*    | ❌       |
| `null`      | ✅\*    | ✅\*         | ✅      | ❌       |
| `never`     | ✅      | ✅           | ✅      | ✅       |

> *表示在 strictNullChecks: false 或 strict: false 下成立,
> strictNullChecks:true时, 任意类型被赋值为null undefined会报错
> 除了void 永远可以被赋值 undefined
> 如果配置未生效，请检查tsconfig中的 include属性是否包含当前文件
> VSCode → Ctrl+Shift+P → TypeScript: Go to Project Configuration
> → 检查是否跳转到预期 tsconfig.json

```ts
// 可赋值关系演示
let a: void
let b: undefined = undefined
let c: null = null
let d: never = undefined as never

a = c // ✅ void 可以接收 null（strictNullChecks: false）
a = b // ✅ void 可以接收 undefined(特殊)
a = c // ✅ void 可接收 null（strictNullChecks: false）

b = a // ❌ undefined 不能接收 void
b = c // ✅ undefined 可以接收 null（strictNullChecks: false）
b = d // ✅ undefined 可以接收 never

c = a // ❌ null 不能接收 void
c = b // ✅ null 可以接收 undefined（strictNullChecks: false）
c = d // ✅ null 可以接收 never

d = a // ❌ never 不能接收 void
d = b // ❌ never 不能接收 undefined
d = c // ❌ never 不能接收 null
```

## 3. 联合类型

表示 取值可以时多种类型中的一种

未赋值时 联合类型 上只能访问 两个类型共有的 属性或方法

```TS
let name:string | number // 联合类型  
console.log(name!.toString()); // 公共方法
name = 10;
console.log(name!.toFixed(2)); // number方法
name = 'zf';
console.log(name!.toLowerCase()); // 字符串方法
```

TS中，谁更具体谁是子类型，并不是属性多就是子类型，例如联合类型内的类型越少越具体

## 4. 字面量类型和类型字面量

__字面量类型__ 一个字面量就是一个类型,类型和值必须一致.

```ts
const a: `#${string}` = '#123' // 要求#开头，模板字面量类型
type OneToFive = 1 | 2 | 3 | 4 | 5;
type Bool = true | false;
const up:'Up' = 'Up' // 这样写也是字面量类型，只不过无法复用
```

字面量类型本身并不是很实用，但是可以在一个联合类型中组合成一个强大的抽象

__类型字面量__ 写法很像一个对象

```ts
type Person = {
  name:string,
  age:number
};

// 注意写法: 不要和enum的写法搞混
enum Color {
    Red,// 默认值为 0 
    Yellow,// 默认值为1
    Blue// 默认值为2
}
```

## 5. 类型推导

指 编程语言中 能自动推导出 值 的类型的能力,一般强类型语言才有

定义未赋值时,会推论为any类型

```ts
let username2;
username2 = 25; // 自动推理为number类型
username2 = 'lzy';// string类型
```

## 6. 包装对象

JS有两类数据类型, 原始数据类型(null undefined boolean number string symbol bigint) 和 object

所有原始数据类型都没有 属性 或 方法 可供使用,仅仅是储存一个数据.

但字符串数据 却可以直接调用 splice等方法,

这是因为 当 调用 基本数据类型 的方法时, JS 会把 原始数据类型 强制性切换为 对象类型,

c# Java中都有这个概念,叫 __自动装箱__,

TS承认这一概念，因此可以对 string 等原始类型调用方法

```ts
let isOK: boolean = true; // 编译通过
let isOK: boolean = Boolean(1) // 编译通过
let isOK: boolean = new Boolean(1); // 编译失败 期望的 isOK 是一个原始数据类型
```

## 7. 类型断言

将联合类型的变量 指定为 更加具体的类型

```ts
let name: string | number;
console.log((name as string).length);
console.log((name as boolean).length); // 报错,不能指定为联合类型外的类型
console.log((name as any as boolean).length); // 双重断言,OK
```

## 8. 函数类型

函数的类型约束主要是 入参 和 返回值

函数的声明方式有两种，function关键字来声明 表达式声明

表达式声明时，如果把类型约束写在函数里，则变量类型是根据函数推导出来的类型。

```ts
// function关键字声明 定义类型
function hello(name:string):void {
    console.log('hello',name);
}

// 表达式声明 定义类型
type GetUsernameFunction = (x:string,y:string)=>string;
type GetUsernameFunction2 = {(x:string,y:string):string}
let getUsername:GetUsernameFunction = 
function(firstName,lastName){
  return firstName + lastName;
}
// 表达式声明时，如果把类型约束写在函数里，则变量类型是根据函数推导出来的类型。
```

支持 __可选__ __默认值__ __剩余参数__ __函数重载__ 四种写法

注意`print(name:string = 'lzy',age?:number)` 可不传第二个参数，

age的类型改成`age:number | undefined` 还是必须传第二个参数，只不过可以为undefined

```ts
// 默认参数,可选参数 和 ES6一样
function print(name:string = 'lzy',age?:number):void {
    console.log(name,age);
}
// 剩余参数
const sum = (...args: string[]): string => {
    return args.reduce((memo, current) => memo += current, '')
}
sum('a', 'b', 'c', 'd')
```

Function关键字声明的函数才能重载(伪重载,只是对类型的重载)

__重载使用场景,输入和输出存在某种关联,参数的个数不一致时实现的逻辑也不一致__

注意: 函数的重载，无法用泛型替代。????????? 存疑???

```ts
// 函数重载
// TS中的函数重载,表现为 同一个函数提供多个函数类型定义
// Java中的重载,表现为 同名函数 参数不一样
function toArray(value: number): number[];
function toArray(value: string): string[];
function toArray(value: string | number): string[] | number[] {
  // 只有一个具体的实现
  // 此处返回值可不写 : string[] | number[] ，但入参必须能兼容上面两个重载。
  if (typeof value === "string") {
    return value.split("");
  } else {
    return value.toString().split("").map(Number);
  }
}
let arr1 = toArray(1);
let arr2 = toArray("2");

// 上面的重载和这里一样的效果,那这样看重载好像也没什么用?
function attr2(val: string|number): void {
    if (typeof val === 'string') {
        obj.name=val;
    } else {
        obj.age=val;
    }
}
// 重载解决了下面这种情况
// 要求两个参数,要不都是string,要不都是string[]
function attr3(a: string,b: string): void;
function attr3(a: string[],b: string[]): void;
function attr3(a: any,b: any): void {
}
```

## 8. 函数重载三种写法

```ts
// 1. 交叉类型实现重载效果
type Overloaded = ((x: number) => string) &
    ((x: string) => number)

// 2. interface 中定义多个函数签名
interface OverloadedFn {
    (x: number): string
    (x: string): number
}

// 3. 函数实现时重载语法（签名 + 实现）
function fn(x: number): string
function fn(x: string): number
function fn(x: any): any {
    return typeof x === 'number' ? x.toString() : x.length
}
```

## 9. typeof keyof 函数this类型约束

TS中:

`typeof 变量`取变量的类型

`keyof 类型`取类型的key的集合

函数第一个参数 可写明为`this`关键字，借此对其做TS约束

```ts
const person = { name: "lzy", age: 25 }
type Person = typeof person;
type PersonKey = keyof Person;

function getName(this: Person, key: PersonKey) {
  return this[key];
}
getName.call(person, "name");

let a = typeof person
// let a: "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function"
```

this 约束几乎只出现在该函数可能被BindCallApply调用的情况下

如果没有报错，说明没开启 strictBindCallApply 的编译选项，

这个是控制是否按照原函数的类型来检查 bind、call、apply

> 注意区分当前代码是 TS层面 还是 JS层面
> 如果 type 关键字后面的 typeof 会被视为 TS语法，获取 对象的类型
> 或 getName(this: typeof person, key: PersonKey) 冒号后的typeof
> 也能被识别为 TS语法，返回的是 类型本身
> 而语句中的 typeof 会被视为 js语法，非获取类型的功能，而是返回类型字符串

## 10. interface 和 type

__语义和定位__:

interface 代表形状, 通常用于 定义对象或类的结构

type 代表工具, 用于给任意类型起别名，功能强大

__interface 可重名__: 自动合并，type不可重名

__type 可做 类型计算__: 如 条件类型 联合类型

__都可以组合__: type 用&, interface 用extends

```ts
// 重名/声明合并, 在`.d.ts`或第三方扩展中非常重要
interface Window {
  myAppVersion: string;
}
// 组合
type C = A & B;
interface C extends A, B {}
```

> interface 和 class, enum 用于 描述对象结构
> type, infer, extends, keyof 用于 构造复杂类型
> declare, export, import 用于 声明

## 其它

`?.` 是js语法，链运算判断符，这个值没有值就不继续取值了

`!` 是TS语法，非空断言，断言该值必不为空，无需进行null检测。

注意: `ele?.style.color = "red"` 编译器会报错，

因为 `ele?.` 真不存在时实际上是返回undefined，运行会报错。

类 也是一个 类型(就像symbol,number,boolean一样),

构造完一个类后得到两个类型,一个构造函数类型 一个实例类型.

__dts 中，如果没有 import、export 语法，那所有的类型声明都是全局的，否则是模块内的__
