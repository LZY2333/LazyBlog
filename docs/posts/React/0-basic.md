---
title: React基础汇总
date: 2023-01-28 09:32:51
categories: 经验帖
tags:
    - React
---

[一文带你梳理React面试题（2023年版本）](https://juejin.cn/post/7182382408807743548#heading-13)

[🔥 连八股文都不懂还指望在前端混下去么](https://juejin.cn/post/7016593221815910408#heading-71)

## React版本区别

__React 15__  
【stack架构】Stack Reconciler, 不可中断 递归更新  
【Reconciler协调器】比较新旧VDOM, 找出变化的组件  
【Renderer  渲染器】将VDOM变化渲染到真实DOM  
【评价】            阻塞主线程 卡顿 无分片 无优先级调度

__React 16__  
【Fiber架构】Fiber Reconciler, 渲染任务拆分为小单元, 支持暂停, 优先级调度  
【Scheduler调度器】requestIdleCallback模拟时间片调度，expirationTime控制优先级  
【Hooks】生命周期、状态管理、逻辑复用, 让函数组件得以独立于类组件  
【评价】性能更好 可以中断让出线程给渲染, 为 并发渲染 奠定基础, 但是同步模式

__React 17__  
【事件委托变更】不再挂在document上，挂载在根DOM容器中，使React可多版本并存  
【新jsx-runtime】无需引入React，减小包装尺寸，考虑多版本React共存的情况  
【移除事件池复用机制】简化事件系统  
【评价】提供 兼容性与渐进升级 能力，为 React18并发 铺路

__React 18__  
【并发渲染】  Lane+Scheduler 优先级调度, 可以切换任务  
【自动批处理】所有上下文 自动合并只更新一次, 无论同步异步  
【createRoot】ReactDOM.render 改变为 ReactDOM.createRoot  
【Lanes模型】 作为调度模型, 取代expirationTime  
【subtreeFlags】 收集副作用, 取代 17的Effect List  
【useSyncExternalStore】 大小1Kb 的Zustand 核心原理

## JSX是什么
【语法糖】JSX本质上是 React.createElement() 的语法糖。  
【Babel解析】Babel解析 源码 生成AST，反向解析 生成 打包后的源码  
【JS与HTML标签结合】UI与逻辑与数据 结合 降低心智负担  
【只写JS】不同于模板语法 不引入新的概念和语法 只写JS 且支持JS所有功能  
【组件化】React团队希望 UI与逻辑结合 高内聚形成组件, 复用和组合

## 虚拟DOM
【JS对象】createElement 执行返回的 JS对象, 用于描述真实DOM  
【性能 兼容】批处理 自动Diff，跨平台兼容，跨浏览器兼容(事件系统)  
【数据驱动视图】减少心智负担，专注业务逻辑，从而提升开发效率。  
【缺点】虚拟DOM占内存，首屏渲染相对慢，需要从零遍历构建第一颗fiber树

__虚拟DOM具有哪些属性__: key, type, props, children, ref  
props内拿不到 父组件传递的ref key, 被delete并挂载在了vdom上

__Fiber具有哪些属性__  
child sibling updateQueue flags lanes childLanes  
memoizedState memoizedProps alternate

## Diff算法(React15)
根本目的 __复用旧真实dom,减少渲染消耗__  
Diff原则 __同层比较__ __key比较__ __type比较__

### Reconciliation 协调阶段
节点比较

1. 如果二者type不同, 卸载 oldVdom 整个分支, 根据 新vdom 创建 新真实DOM分支, 并插入。
2. 如果二者type相同, 复用旧Vdom(真实Dom), `updateElement`更新props真实DOM, `updateChildren` Diff子节点。

子节点比较

1. 【map】旧Vdom生成map结构, key为旧Vdom的key
2. 【顺序遍历】 新Vdom, 同key同type 则复用旧Vdom
3. 【同key同type】命中且顺序对 标记 Update, 命中但顺序 不对标记 Move
4. 【插入移动删除】未命中新Vdom Placement插入, 未命中旧Vdom Unmount卸载

### Patch阶段
进行DOM操作

1. 未命中者 插入 删除
2. 命中者 进行move update(内新旧vdom对比, `updateElement`, 递归`updateChildren`)

> 其实有两轮遍历, 第一轮只一对一比较, 应对大部分场景, 节省性能  
> 函数组件和类组件没有自己的真实DOM，需要递归调用findDOM，拿到子代vdom的真实DOM  
> 判定Move: 命中的旧VDOM索引 比上一个不需要移动的节点的索引lastPlacedIndex要小的话

### ReactDiff的劣势

场景: [A, B, C, D] -> [D, A, B, C]  
尾部旧vdom在新vdom队列头部, 则其余旧vdom全会被标记为move。  
此时性能最差，vue中存在双端Diff 解决了这个极端情况。  
React团队 希望保持算法简单 极端场景较少。

## Diff算法(React16-17)
关键特性: __性能进一步提升__ __可中断__  
关键机制: 双Fiber树 Fiber链 EffectList Scheduler调度  
>批量更新: 双Fiber树 EffectList  
>可中断: Fiber链  
>优先级：Scheduler调度

Render阶段/Reconciliation协调 由 reconciler渲染器(react-reconciler包)负责  
Commit阶段 render渲染器(react-dom包)负责  
Scheduler包 调度workLoop
### Reconciliation协调
与React15相同，也是旧Fiber树 与 新VDOM 对比, 构建 WorkInProgress Fiber 树  
不同type不同key卸载,同type同key 复用并更新自己 再子节点Diff  
`reconcileChildren`顺序遍历 新Vdom, 标记旧Vdom update move placement unmount  
产出 workInProgress Fiber 树 + 副作用标记

### BeginWork阶段
BeginWork()  
对比旧Fiber节点与新VDOM 构建新Fiber树  
1.【新旧Fiber树】`current`旧Fiber树 和 `workInProgress`新Fiber树  
2.【Fiber链表】子节点是 Fiber链表 不是数组  
3.【Effect】每个Fiber记录自己的 `effectTag`

### CompleteWork阶段
completeWork()

1. 【遍历Fiber链表】自底向上Fiber链表, 遍历Fiber树，收集effectList。
2. 【EffectList】每个Fiber有自己的effectList记录 自己及子树需要执行的DOM操作。

### Commit阶段
commitRoot()

1. 【Fiber树替换】执行effectList内的DOM操作,形成新UI,workInProgress树替换current树，。
Diff 比较 新VDOM 和 旧Fiber 树 生成 新Fiber树(workInProgress)  
VDOM 是 Fiber生命周期前期的形态

<https://react.iamkasong.com/diff/multi.html#demo1>  
<https://www.lumin.tech/blog/react-0-base/>  
<https://zhuanlan.zhihu.com/p/570962640>  
<https://qborfy.com/today/20230117.html>

### key的作用
【提升diff速度】 key不同直接卸载，key相同，才进一步判断type，进一步updateElement、  
【用index作为key】 性能差(key没起到作用), 旧节点被错误复用(key没变)  
【可以使用index】静态列表 无删除重排, 纯展示UI, 仅末尾新增

## Fiber是什么

可简单认为是,以链表结构相连的 虚拟DOM结构,同时挂载了 组件状态和更新操作 等数据

__一种架构名称__ : React16的Reconciler基于Fiber节点实现，被称为Fiber Reconciler。

React15的Reconciler采用递归的方式执行，数据保存在递归调用栈中，所以被称为stack Reconciler。

__一种数据结构名称__ : 一个Fiber节点对应一个React element，也对应一个虚拟DOM，以及更多的信息，组件的类型，虚拟DOM、真实DOM等信息。

__React的最小工作单元__ : 运行时,Fiber 储存了该组件改变的状态、要执行的操作（删除/插入/更新...）。

__核心理念__: 可中断 可恢复 优先级

### 为什么Vue不需要Fiber

详情见 vue文件夹下的《React和Vue的区别》

### React 和 Vue 对比

详情见 vue文件夹下的《React和Vue的区别》

[珠峰](http://zhufengpeixun.com/strong/html/126.11.react-1.html#t112.%E4%B8%BA%E4%BB%80%E4%B9%88%20React%20%E4%BC%9A%E5%BC%95%E5%85%A5%20JSX?)

虚拟dom是什么? 原理? 优缺点?

vue 和 react 在虚拟dom的diff上，做了哪些改进使得速度很快?

vue 和 react 里的key的作用是什么? 为什么不能用Index？用了会怎样? 如果不加key会怎样?  
react 与 vue 数组中 key 的作用是什么？  
提升diff算法的判断速度，  
diff算法 会首先判断 新旧 key 和 元素类型 是否一致，如果一致再去递归判断子节点

React 和 Vue 的本质区别:  
Vue 是静态分析 template 文件，采用预编译优化，在解析模板的同时构建 AST 依赖树，同时标记出可能会变化的动态节点。  
利用数据双向绑定，进行数据拦截或代理，进行响应式处理。从而能够比较精准的计算出有改变的 DOM，减少计算量。

React 是局部渲重新渲染，核心就是一堆递归的 React.createElement 的执行调用。  
其优化的方向是不断的优化 React.createElement 的执行速度，让其更快，更合理的创建最终的元素。

### AOT vs JIT

AOT，Ahead Of Time，提前编译或预编译，宿主环境获得的是编译后的代码，在浏览器中我们可以直接下载并运行编译后的代码，比如：Vue的template是通过Vue-loader编译后才能使用。

JIT，Just In Time，即时编译 ，代码在宿主环境编译并执行，每个文件都是单独编译的，当我们更改代码时不需要再次构建整个项目，比如：React中JSX只有在浏览器运行的时候才知道具体代码。

## Hooks(React 16.8)
Hooks exist to avoid keys or name mapping systems

__为什么不能在条件和循环里使用Hooks__  
React的hooks用于存储状态，但函数是无法储存状态的，因为执行完后函数执行栈就会销毁  
所以，hooks的状态保存在函数组件的 虚拟dom上，  
采用的数据结构也不是 object的键值对模式，而是链表模式。  
每个hooks执行都属于链表的一环，初始化执行时顺序储存数据，  
后续更新时，顺序读取数据，所以顺序不能被打乱，所以不能在条件和循环内使用。

__useState 和 useReducer 的区别__  
useState直接在fiber中储存用户传入的值  
useReducer将 用户传入的值 传给reducer处理函数执行后 储存在fiber中。  
useState，内部其实就是调用的 useReducer。  
useReducer，用于处理复杂的数据处理逻辑。

__useMemo 和 useCallback 的区别__  
接收创建函数和依赖项数组作为参数，依赖项改变时才重新计算 memoized 值。  
用于避免每次渲染都进行高开销的属性计算  
useCallback，依赖变更时才返回新函数，适用于父节点传递函数给子节点调用的情况，可以优化性能。

__useEffect 和 useLayoutEffect 区别__

__useContext原理__  
useContext本身的原理非常简单，就是从传入的context对象上读取了他的，下划线currentValue属性  
使用react.createContext的时候会创建一个全局对象context，  
这个对象有provider consumer _currentValue属性  
在父节点调用provider 会对 currentValue进行赋值，在子节点再从currentValue取值。

__useRef是单例的__  
useRef的返回值ref 对象在组件的整个生命周期内持续存在  
而不像setState一样，其值需要在下一个生命周期才得到体现。  
但是注意， 变更 .current 属性不会引发组件重新渲染。

__useEffect 依赖为空数组与 componentDidMount 区别__  
二者都是会在组件初次渲染完成后执行一次。  
两者最根本的区别在于，  
componentDidMount 的时机更为精确，他确确实实是在组件创建完真实DOM并挂载完成后立即调用的。  
useEffect 实际上是创建了一个宏任务，在下个事件循环执行，这个时候也必然已经完成了渲染流程。

__函数组件的useState和类组件的setState有什么区别__  
类组件的setState，修改的数据储存在其实例中，useState储存在当前函数组件对应的fiber中。  
类组件的setState，是真正的修改数据的操作，useState不是。

__1. 为什么 React 和 Vue3 都选择了hooks，它带来了那些便利？__  
[浅谈: 为啥vue和react都选择了Hooks🏂？](https://juejin.cn/post/7066951709678895141)

[在 Vue3 中实现 React 原生 Hooks（useState、useEffect）进而深入理解 React Hooks 的本质原理](https://juejin.cn/post/7121363865840910372)

[大厂面试题每日一题](https://q.shanyue.tech/fe/react/14.html)

[Hooks 对于 Vue 意味着什么？](https://juejin.cn/post/7062259204941152293)

[React Hooks: 给React带来了什么变化？](https://juejin.cn/post/6844904149453111304)

__为什么传入二次相同的状态，函数组件不更新__  
数据和虚拟dom是更新了的，UI没更新，DOM复用了旧DOM。  
数据都没更新只可能是使用了PureComponent

__hooks和生命周期的异同__  
类组件的生命周期函数，是在注册之后，在组件运行的特定时间进行调用。  
函数组件的hooks，在函数每次执行的时候都会被调用。

__自定义Hook__  
自定义Hook必须以use开头，内部可以调用其他hooks，用于抽离公共逻辑  
hooks的特性更像是组件，两个组件调用同一个hooks，state不会共享。

__6. HOC 和 hook 的区别？__  
[【React深入】从Mixin到HOC再到Hook](https://juejin.cn/post/6844903815762673671)

## ref原理

ref的本质就是创建一个 `{current:null}` 对象，并将ref对象传递给子组件

子组件在 初始化过程中， 真实dom 创建完成后，赋值给 ref.current

这样，在初始化完成后，外部即可通过ref.current获取到，真实dom

## context原理

1. provider和consumer 的context属性 指向同一个对象

2. provider consumer 本质是渲染其 子vdom，就像函数组件，类组件一样，只不过会给子代添加一些属性。

3. 父Provider往共有对象上存值，在其初始化完成后，子代开始初始化，此时子代consumer就可以从这个对象里拿值并使用

> 本质，createContext() 返回一个context，具有两个属性，provider和consumer，  
> 这两个属性对象具有 _context属性，又指向context  
> 之后所有给provider挂载的属性，都会挂载进provider._context对象中，供子代consumer使用。

## 事件机制
### 合成事件
【SyntheticEvent】DOM原生事件再次封装，加上了一些自定义的属性和函数  
type target currentTarget eventPhase  
【stopPropagation】阻止React事件冒泡  
【preventDefault】 阻止浏览器默认行为  
【nativeEvent】代表原生DOM  
【利用事件冒泡机制】，将DOM事件在根节点处注册的机制。  
【多个事件只绑定一次】，减少事件绑定，减少DOM交互次数  
【抹平平台差异】，浏览器兼容，ReactNative也可使用  
【切片编程】统一进行事件处理  
【批量更新】交互触发多个事件状态变化，可进行一次更新。  
【事件池机制】避免频繁创建和销毁SyntheticEvent对象，释放过程将SyntheticEvent对象的大部分属性置为null，提升旧浏览器的性能。

### React事件代理流程
事件绑定时  
1.事件监听 绑定在 容器root上，  
2.事件处理函数 以 键值对的形式储存在 DOM.store中，key为事件类型 value为事件处理函数。

事件触发时  
1.事件冒泡，触发 容器root 的事件监听，容器root 调用其 统一事件处理函数 dispatchEvent，  
2.dispatchEvent 通过event.target 拿到对应DOM， event.type 拿到事件类型  
3.通过 DOM.store[event.type] 调用 真正的相应 事件处理函数handler(并传入 合成事件 )  
4.handler内的setState将数据存入更新队列，最后 dispatchEvent 批量更新。  
> 这种做法叫切片编程，react可以在事件处理时做一些统一的事情，比如 处理浏览器兼容性

### 批量更新

一次浏览器事件触发多个监听handler，一个监听handler调用多个setState，多次属性修改，合并为一次vdom更新，和渲染更新。

1. 统一事件处理函数被调用时，将标记 isBatchingUpdate 置为true，随后 循环调用 事件触发的所有handler

2. 当标记为true时，所有 handler 内 setState 的属性更新都会储存在更新队列中。

3. 等 所有 handler执行完毕，再 更新所有vdom，并将 标记 isBatchingUpdate 置为false，再 diff创建真实DOM。

> 标记为false时，setState 的属性更新 会直接更新vdom，diff创建真实DOM。  
> 其实并没有异步,还在当次同步任务内,只不过数据更新在所有handler执行完之后  
> 这么做使得React无法控制的异步setState变为了更安全的立即更新，而React控制范围内的setState为批量更新。

### React 17以后 事件机制有什么不同？

1. 以前委托到document，17事件委托到root
为了允许同时运行多个版本React

2. React事件处理捕获和冒泡：
React17以前，是捕获到冒泡，再自己模拟一遍捕获和冒泡，一个个去触发捕获事件和冒泡事件，与原生事件顺序不兼容。  
React17以后，是每个事件注册两道，一道捕获，一道冒泡，捕获触发的时候一个个去触发捕获事件，冒泡触发的时候一个个去触发冒泡事件。  
React capture阶段的合成事件提前到原生事件capture阶段执行

3. 移除事件池机制
不再复用事件对象，每次都是新的  
旧事件池会清空事件对象属性 导致setTimeout调用e.target报错，且新浏览器性能足够

4. 事件有优先级。
连续事件 > 用户阻塞事件 > 离散事件，但仍然主要是Expiration Time

## 组件通信
[八股文](https://juejin.cn/post/7016593221815910408#heading-71)

## Lane优先级
相比 expiration time 可以快速选出高优先级task

[react - 关于 react 为什么要从 ExpirationTime 切换到 lane 的一次考古](https://juejin.cn/post/7095307142046941191)  
顺便看看这个大佬的其他文章

## 并发渲染
并发渲染并不是多线程  
而是在必要的时候暂停，让出主线程给优先级较高的任务，如UI交互

## 类组件 和 函数组件 对比
类组件面向对象编程，函数组件函数式思想  
都可以接收属性并返回ReactElement

__函数组件更加契合 React 框架的设计理念__  
React 组件的主要工作 就是 一个吃进数据、吐出 UI 的函数。  
React 框架的主要工作 就是 把声明式的代码转换为命令式的 DOM 操作。

__函数组件的优点__  
语法简单  
易于测试  
Hooks 提供了更细粒度的逻辑组织与复用  
更好地适用于时间切片与并发模式

__类组件的缺点__  
this 的模糊性  
业务逻辑散落在生命周期中，生命周期在继承时不可见  
类组件可以通过继承实现逻辑复用，但是继承的灵活性差，细节屏蔽多，不推荐使用  
类组件需要创建并保存实例，会占用一定内存

## 性能优化
React.PureComponent,React.memo,当属性不变时，不重新渲染，跳过更新逻辑  
memo在渲染的时候和函数组件一样，拿到vdom然后渲染，  
但是在更新的时候，会通过传入的compare函数执行，进行props对比，如果不同，才会更新，如果相同，则会复用旧虚拟dom

最外层加上，内层也会相当于PureComponent，因为父组件不更新子组件也不会更新

使用 React.memo 来缓存组件。  
使用 React.useMemo 缓存大量的计算。  
避免使用匿名函数。  
利用 React.lazy 和 React.Suspense 延迟加载不是立即需要的组件。  
尽量使用 CSS 而不是强制加载和卸载组件。  
使用 React.Fragment 避免添加额外的 DOM。

[React性能优化的8种方式了解一下？](https://juejin.cn/post/6844903924302888973)

1. 在 React 中如何做好性能优化 ?
代码分割 [在 React 中如何实现代码分割](https://zh-hans.reactjs.org/docs/code-splitting.html)

在React16.6引入了Suspense和React.lazy，用来分割组件代码。

## 生命周期

挂载  
constructor  
componentWillMount  
render  
componentDidMount

更新  
componentWillReceiveProps  
shouldComponentUpdate  
componentWillUpdate  
render  
componentDidUpdate

卸载  
componentWillUnmount

React 16.3 开始  
【__getDerivedStateFromProps__】从props获取派发状态,static函数,无法使用this  
> 被故意设计成 static 函数,因为以前在 componentWillReceiveProps中用setState会死循环,现在不让用this了

【__getSnapshotBeforeUpdate__】render之后新旧vdom即将对比替换时执行  
用于在组件真实DOM更新之前,拿到老真实DOM的一些信息,返回值会传给 componentDidUpdate

挂载  
constructor  
getDerivedStateFromProps  
render  
componentDidMount

更新  
getDerivedStateFromProps  
shouldComponentUpdate  
render  
getSnapshotBeforeUpdate  
componentDidUpdate

卸载  
componentWillUnmount

__生命周期的父子组件的执行顺序？__  
父子组件初始化

父组件 constructor  
父组件 getDerivedStateFromProps  
父组件 render  
子组件 constructor  
子组件 getDerivedStateFromProps  
子组件 render  
子组件 componentDidMount  
父组件 componentDidMount

子组件修改自身state

子组件 getDerivedStateFromProps  
子组件 shouldComponentUpdate  
子组件 render  
子组件 getSnapShotBeforeUpdate  
子组件 componentDidUpdate

父组件修改props

父组件 getDerivedStateFromProps  
父组件 shouldComponentUpdate  
父组件 render  
子组件 getDerivedStateFromProps  
子组件 shouldComponentUpdate  
子组件 render  
子组件 getSnapShotBeforeUpdate  
父组件 getSnapShotBeforeUpdate  
子组件 componentDidUpdate  
父组件 componentDidUpdate

卸载子组件

父组件 getDerivedStateFromProps  
父组件 shouldComponentUpdate  
父组件 render  
父组件 getSnapShotBeforeUpdate  
子组件 componentWillUnmount  
父组件 componentDidUpdate

__函数组件的生命周期？__

## React 涉及的算法
__LRU算法__  
在React16.6引入了Suspense和React.lazy，用来分割组件代码。

## React-router
[React/Vue 中的 router 实现原理如何](https://q.shanyue.tech/fe/react/463.html#history-api)

## React面试题

### 请说一下你对 React 的理解  
用于构建UI的 声明式的 虚拟DOM优化的 组件化的 框架

[珠峰](http://zhufengpeixun.com/strong/html/126.11.react-1.html)

### 请说一下React中的渲染流程
JSX -> 可执行代码 -> VDOM -> Fiber -> 真实DOM  
[珠峰](http://zhufengpeixun.com/strong/html/126.11.react-1.html#t485.%20%E8%AF%B7%E8%AF%B4%E4%B8%80%E4%B8%8B%20React%20%E4%B8%AD%E7%9A%84%E6%B8%B2%E6%9F%93%E6%B5%81%E7%A8%8B)

__受控组件和非受控组件__  
React没有双向绑定

受控组件: 使用state控制表单元素的value，使用onChange 与 setState更新state，从而更新视图，控制用户输入过程表单的操作。

非受控组件: 通过使用Ref属性拿到DOM，再通过.value拿到数据。

绝大部分时候推荐使用受控组件来实现表单，因为在受控组件中，表单数据由React组件负责处理

当然如果选择非受控组件的话，表单数据相当于由DOM自己处理。

file类型的表单控件只能由用户设置值，作为非受控组件

[受控组件与非受控组件](https://juejin.cn/post/6858276396968951822#heading-2)

__React 组件是怎么渲染为 DOM 元素到页面上的__  
__React 中 setState 调用以后会经历哪些流程__  
__如何进行数据管理__  
__你提到了 React Context，说一下它的原理__  
__能说一下 Redux 的原理吗__  
__useState 是怎么实现的__  
__通过下标指定 key 的话会有什么问题？__
