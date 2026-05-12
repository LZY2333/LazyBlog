---
title: Vue3 API 易漏点
date: 2026-05-11 15:37:13
categories: 技术栈
tags:
    - Vue3
---

## :(布尔型attribute)="",真值及''代表开启

```html
<button :disabled="isButtonDisabled">Button</button>
```

`''`/`true`/`1`/`'hello'`/`'false'` 均为真值, 渲染为 `disabled`

`false`/`null`/`undefined` 为假值, 不渲染 `disabled`

## :(无参)="对象类型"，该对象所有子属性 被绑定为attribute

对象的每个键值对会逐一展开为元素的 attribute, 等价于手动写 `:id="..." :class="..." :style="..."`

```vue
<script setup>
const objectOfAttrs = {
  id: 'container',
  class: 'wrapper',
  style: 'background-color:green',
}
</script>

<template>
  <div :="objectOfAttrs">hi</div>
</template>
```

渲染结果:

```html
<div id="container" class="wrapper" style="background-color: green;">hi</div>
```

## `{{}}` 及 `v-xx`指令 的值中 均可使用 JS表达式

JS表达式 检验标准为 可以合法的被表达在 `return` 后面

包括函数调用(该函数可以但不应该内含副作用)

但下面的例子都是无效的：

```template
<!-- 这是一个语句，而非表达式 -->
{{ var a = 1 }}
<!-- 条件控制也不支持，请使用三元表达式 -->
{{ if (ok) { return message } }}
```

## 模板中的 JS表达式 仅能够访问到有限的常用的全局对象列表

`Math`/`Date` 等可以访问

用户附加在window上的属性 等没有显式包含在列表中的全局对象不能访问

通过 `app.config.globalProperties` 可以进行配置

## `v-xx`内置指令及其参数意义

### 必须无参数

只接表达式，不接 `:arg`

| 指令 | 用途 |
| --- | --- |
| `v-text` | 设置 textContent |
| `v-html` | 设置 innerHTML |
| `v-show` | 切换 display |
| `v-if` / `v-else-if` / `v-else` | 条件渲染（`v-else` 连表达式都不要） |
| `v-for` | 列表渲染 |
| `v-pre` | 跳过该元素及子元素的编译 |
| `v-once` | 只渲染一次 |
| `v-memo` | 依赖数组未变则跳过更新 |
| `v-cloak` | 编译完成前的占位钩子（CSS 配合） |

### 参数可选（无参时绑定对象 / 默认名）

| 指令 | 有参 | 无参语义 |
| --- | --- | --- |
| `v-bind`（`:`） | `:id="x"` 绑定单个 attr | `v-bind="{id, class}"` 展开对象 |
| `v-on`（`@`） | `@click="fn"` 绑定单事件 | `v-on="{click: fn, blur: fn2}"` 对象批量绑定 |
| `v-model` | `v-model:title="x"`（组件多 prop） | 默认绑定 `modelValue`（组件）或对应表单值 |
| `v-slot`（`#`） | `#header` 指定具名插槽 | 默认 `default` 插槽 |

### `:[动态参数]="xxx"`

动态参数 必须为 string 或 特殊值null(移除该绑定)

```template
<!-- 动态参数 []内不允许含''和空格,会触发编译器警告 -->
<a :['foo' + bar]="value"> ... </a>
```

```template
<!-- DOM 内嵌模板下 动态参数 需要避免在名称中使用大写字母 -->
<a :[someAttr]="value"> ... </a>

<!-- DOM 内嵌模板:   直接写在 .html 里、由 #app 这种挂载点拿到的模板 -->
<!-- SFC(.vue 文件): 模板由 Vue 的编译器解析 -->
```

## await nextTick(), DOM 更新完成后再执行

```js
import { nextTick } from 'vue'

async function increment() {
  count.value++
  await nextTick()
  // 现在 DOM 已经更新了
}
```

## ref 是带有响应式的引用传递, 使得 Composable 模式成为可能

### Composable 模式

Composable 模式 = 把组件里"一段带响应式状态 + 生命周期 + 副作用"的逻辑，抽到一个普通 JS 函数里，让多个组件 import 后复用。

是 Vue 3 Composition API 提供的官方逻辑复用方案，取代 Vue 2 的 mixin, 参考 VueUse库。

> why not 普通工具函数? 其没法复用"带状态、带生命周期、和组件响应式系统连着的逻辑"
> why not mixin? 其 直接黑盒注入this

### ref = 引用(跨函数传递不丢失状态) + 响应式(读写会被 track/trigger)

两者都成立时 都成立时，composable 模式才能跑通。

### Composition API 与 ref/reactive

Vue 2 响应式只能挂在组件实例 this 上，所以复用带状态的逻辑只能靠 mixin 黑盒注入

Vue 3 用 Composition API 让响应式脱离实例独立存在，

配合 ref/reactive 可传递的响应式容器，就能把逻辑抽象成普通函数（composable）

显式return、显式接收，可读性、可组合性、类型推导都比 mixin 好

## 推荐使用 `ref()` 而非 `reactive(仅限对象)`

`ref(对象)` 比 `reactive` 多套一层 `.value` 壳，内层仍是 `reactive`

```js
ref(obj)       // 返回 { value: reactive(obj) }
reactive(obj)  // 返回 Proxy(obj)
```

reactive() 缺点: 只能用于对象类型, 替换整个对象丢失响应性, 解构出的属性丢失响应性

ref() 缺点: 必须通过.value访问(模板里不需要), 解构出的属性丢失响应性

| 维度 | `ref(对象)` | `reactive(对象)` |
| --- | --- | --- |
| 访问语法（JS） | `a.value.n` | `b.n` |
| 模板访问 | 自动解包 `{{ a.n }}` | `{{ b.n }}` |
| 整体替换 | `a.value = {...}` ✅ | `b = {...}` ❌（丢失响应性） |
| 解构是否丢响应 | `.value` 解构会丢，需用 `toRefs` 或保留 `.value` | 直接解构会丢，需 `toRefs(b)` |
| 容器类型 | 原始类型 / 对象 / Map / Set 全支持 | 仅对象类引用类型 |

壳的价值在于「可整体替换、可解构后保留响应、能装原始值」，代价是写 `.value`

## toRef() 解构不丢失响应性，本质是代理到原reactive上

```js
import { reactive, ref, toRefs } from 'vue'

// reactive
const state = reactive({ name: 'a', age: 1 })
const { name, age } = toRefs(state)
name.value = 'b'        // ✅ 改 name.value 等于改 state.name

// ref(对象) —— 对 .value 用 toRefs
const userRef = ref({ name: 'a', age: 1 })
const { name: n, age: g } = toRefs(userRef.value)
n.value = 'b'           // ✅ 同步到 userRef.value.name

// toRef 另一个用法
const ageRef = toRef(state, 'age')
ageRef.value++          // ✅ 等于 state.age++
```

## ref 自动解包(不用写.value)

下面两种情况会自动解包

### 1. 模板中使用的, setup 暴露的顶层 ref

```vue
<script setup>
const count = ref(0)
const user = ref({ name: 'foo' })
const object = { count: ref(0) }
const list = [ref(0)]
</script>

<template>
  {{ count }}          <!-- ✅ 自动解包 -->
  {{ user.name }}      <!-- ✅ -->
  {{ count + 1 }}      <!-- ✅ -->
  {{ object.count }}     <!-- ❌ object 是普通对象、count 是 ref 时不解包 -->
  {{ list[0] }}          <!-- ❌ 数组索引访问不解包 -->
</template>
```

绕过方法: 先在JS中解构出顶层引用 `const { count } = object`

### 2. 模板 或 js中使用的, reactive 对象的属性的 ref

```js
const count = ref(0)
const state = reactive({ count })

state.count       // ✅ 0(自动解包,不是 ref 对象)
state.count++     // ✅ 等价于 count.value++
```

注意:
1.`state.count =` 非proxy 原始类型 值, `count` 也会变化, 两者指向同一份数据。(上例)
2.`state.count =` (proxy或)引用类型 值, `count` 作为旧ref,依赖解除,关联新ref。(下例)

```js
const otherCount = ref(2)
state.count = otherCount
console.log(state.count) // 2
// 原始 ref 现在已经和 state.count 失去联系
console.log(count.value) // 1
```

### shallowReactive / shallowRef 嵌套 ref 不解包

只有当嵌套在一个深层响应式对象内时，才会发生 ref 解包。当其作为浅层响应式对象的属性被访问时不会解包。

```js
const count = ref(0)
const obj = shallowReactive({ c: count })
obj.c          // ❌ ref 对象,需 obj.c.value
const state = shallowRef({ c: count })
state.value.c  // ❌ ref 对象,需 state.value.c.value
```

> 什么时候用 shallow?
> 大型不可变数据:  第三方库实例、大 JSON、Three.js 场景对象 —— 深响应代价高且无意义
> 手动控制更新时机:用 triggerRef(shallowRef) 强制触发
> 集成外部状态库: 状态对象内部由库管理,只需要"指针变了"这一层信号

## reactive / ref 重新赋值 → 响应性丢失

响应式追踪发生在 **属性访问** 层面(`proxy.count` 触发 Proxy 的 `get`/`set`)。变量本身只是 JS 绑定,重新赋值只改变绑定指向,Vue 无从感知。

```js
// reactive
let state = reactive({ count: 0 })
state = reactive({ count: 1 })   // ❌ 断链:旧依赖仍追踪旧 Proxy
state = { count: 1 }             // ❌ 更糟:新对象彻底失去响应性

// ref
let state = ref(0)
state = ref(1)        // ❌ 断链(替换了整个 ref 对象)
state.value = 1       // ✅ 触发 ref 的 setter,依赖正常通知
```

整体替换推荐方式

| 容器 | 安全写法 | 原因 |
| --- | --- | --- |
| `reactive` | `Object.assign(state, {...})` | 改的是原 Proxy 的属性 |
| `ref(对象)` | `state.value = {...}` | 触发 ref 的 setter |
| `reactive` 想整体替换 | 改用 `ref(对象)` 包一层 | 通过 `.value` 替换 |

核心规则:`reactive` 返回的 Proxy 一旦创建就不能让变量再指向别的对象,只能修改它的属性;这也是官方推荐 `ref` 优先于 `reactive` 的主要原因之一。

## `v-if` 与 `v-for` 不应同元素并用，二者优先级不明显

两种典型场景及替代写法：

| 场景 | 反例 | 推荐 |
| --- | --- | --- |
| 过滤列表项 | `v-for="user in users" v-if="user.isActive"` | 用 `computed` 派生 `activeUsers`，再 `v-for` 它 |
| 整体显隐列表 | `v-for="user in users" v-if="shouldShowUsers"` | 把 `v-if` 提到容器(`<ul>`/`<ol>`)上 |

## computed 返回的也是 ref, 解包规则同 ref, 避免副作用

computed 与 函数 的区别在于，计算属性存在缓存, 自动收集依赖，依赖未变，则直接使用缓存

### 作为派生值, 过滤数组(代替模板内for循环嵌套if), 创建classObject

```js
// computed 返回 classObject 是一个常见技巧
const isActive = ref(true)
const error = ref(null)

const classObject = computed(() => ({
  active: isActive.value && !error.value,
  'text-danger': error.value && error.value.type === 'fatal'
}))
```

```html
<div :class="classObject"></div>
```

### 注意 要避免副作用

computed 声明中描述的是如何根据其他值派生一个值, 本质是派生状态,因而
computed 或者说其 getter 不该含有副作用, 且 不该直接修改 computed值, 保证数据自上而下

```js
// 尤其注意数组中改变原数组的七个函数
- return numbers.reverse()
- return [...numbers].reverse()
```
