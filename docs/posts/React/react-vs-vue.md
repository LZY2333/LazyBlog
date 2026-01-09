---
title: React VS Vue
date: 2025-11-24 15:48:26
categories: 经验帖
hide: true
tags:
    - React
    - Vue
---


React缺点
【灵活度高,下线低】使得项目需要大量规范和约定
【对开发者要求高】 TS/性能

React优点
【支持TS】
【大厂背书】
【生态更好】且组件库antd也有大厂背书
【AI友好】语法 TS 以及github react项目多

Vue缺点
【TS支持略差】
【转vue3会有技术债务】

Vue优点
【上手更快】
【性能更好】MVVM，模板语法静态优化
【官方生态一套】技术选型成本低

> TS 的优势, 最典型的就是 npm包 有了TS之后 智能提示用的非常舒服
> React本质是状态机 任何组件State变化，整个树都需要重新render，

## React的定位

React团队对React的定位 仅仅是 用于构建UI的前端库，而非MVVM框架

优点是: 灵活性高 学习成本低 生态丰富

但是 less is more, 更多的东西由开发者掌控，则开发者的素质决定了项目性能的高低

### React 和 Vue 的本质区别

React的本质是状态机, 由事件触发状态迁移 再依赖更新, 事件驱动

Vue的本质是响应式, 由数据变化触发 依赖更新, 数据驱动

React 使用JSX, 核心是嵌套的 render 的执行调用, 然后比对新旧Fiber树找出修改点

Vue 使用模板语法, 数据与模板绑定直接定位修改点, 且模板可以预编译优化

Vue 是静态分析 template 文件，采用预编译优化，在解析模板的同时构建 AST 依赖树，同时标记出可能会变化的动态节点。  
利用数据双向绑定，进行数据拦截或代理，进行响应式处理。从而能够比较精准的计算出有改变的 DOM，减少计算量。

React 是局部渲重新渲染，核心就是一堆递归的 React.createElement 的执行调用。  
其优化的方向是不断的优化 React.createElement 的执行速度，让其更快，更合理的创建最终的元素。

## 为什么Vue不需要Fiber(待更新)

### AOT vs JIT

AOT，Ahead Of Time，提前编译或预编译，宿主环境获得的是编译后的代码，在浏览器中我们可以直接下载并运行编译后的代码，比如：Vue的template是通过Vue-loader编译后才能使用。

JIT，Just In Time，即时编译 ，代码在宿主环境编译并执行，每个文件都是单独编译的，当我们更改代码时不需要再次构建整个项目，比如：React中JSX只有在浏览器运行的时候才知道具体代码。

模版语法AOT空间比较大  
[为什么react需要fiber时间分片而vue没有](https://juejin.cn/post/7255876429518405687)

你以为react不想做编译时优化吗？做不到太多啊，Dan也提过issues，用prepack做render的优化，但是做的事情最多也只是循环展开，静态变量计算，还是跳不过diff。所以只能做一些runtime的优化，比如Fiber。

模板优化，不同语言直接走不同策略  
react性能确实不如vue，原因在于vue模板的语法做了限制（v-xxx）于是可以在编译时进行优化（给节点加flag走不同策略，甚至是静态节点），jsx却是支持几乎所有的语法就没法在这方面进行优化了（如果AI接入提前理解全部代码优化也是可能的）。

### vue性能更好为什么不用vue

更好的生态

更好的TS支持

更好的开发体验(jsx支持几乎所有的语法)

更高素质的开发者

有句话就less is more, 作为一个定为为工具库的UI框架， react 给的 api非常少 实际上是给了开发者更大的自由度，

很多功能需要自己去实现，也因此很多性能上的问题都是开发者自己造成的，

对react理解不深

react作为一个仅仅是定为为工具库的UI框架并没有掌控整个项目 (vue在这方面更像是完形填空)

react框架自己迭代能做的优化不及用户一行代码造成的性能损失大

用react就必须用ES6 用TS，必须踩过无数react的坑，react优化，理解react原理

### 待更新

[React和Vue全方位对比](https://juejin.cn/post/7250834664260829243?searchId=2024050611250976DA66D7732C54253995)

[个人理解Vue和React区别](https://juejin.cn/post/6844904158093377549?from=search-suggest)
