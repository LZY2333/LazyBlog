---
title: qiankun 学习笔记
date: 2023-09-22 16:33:05
categories: 技术栈
tags:
  - 微前端
---

## 微前端
### 第一步，解决了什么痛点

**大应用拆分**  
**渐进式技术栈升级**

附带优势:  
**多团队合作，独立部署**  
**技术栈无关**  
**不同微应用可以组合形成新的产品**

### 第二步，实现了什么功能

**沙箱:CSS 隔离，JS 隔离，路由隔离**  
**微应用调度**

### 第三步，如何实现沙箱和微应用调度

qiankun: 实现沙箱，实现微应用接入配置简化，无痛接入  
singleSpa: 实现基于路由进行微应用调度，定义了微应用生命周期  
systemJS: 实现动态加载模块

## Why Not Iframe

iframe 优势是能完美解决 样式隔离、js 隔离, 劣势是 无法突破这些隔离.

**URL 隔离**. 例如: 刷新丢失 URL,无法 前进 后退

**UI 隔离**,DOM 结构不共享,无法合并计算样式. 例如: iframe 内弹出的弹出,要求 遮罩 居中 随浏览器 Resize

**JS 隔离**,全局上下文隔离，内存变量不共享 例如: 无法 数据状态同步, iframe 设置的 cookie 会被视为第三方 cookie, 被浏览器禁止.

**慢** 每次进入 都须 重新加载资源, 重建浏览器上下文

[Why Not Iframe](https://www.yuque.com/kuitos/gky7yw/gesexv)

Why Not Single-spa: 无 JS 沙箱，无通信机制，无预加载

京东的 Micro App，字节的 GarFish，腾讯的 无界

选择 qiankun 最重要的一点: 阿里大品牌背书，社区活跃度高，demo，使用者众多，甚至有钉钉群微信群，大佬免费在线解答。

不管用哪个新技术，在本地化的过程中，不出问题是不可能的，重要的是有没有解决方案，有没有人遇过这个问题。

## 微应用通信

路由参数、localStorage/sessionStorage 、eventBus

官方提供的props: 注册时挂载的props变量，可以在子应用render函数内拿到

## import-html-entry

### JS Entry
1.通过 正则匹配，解析出 html 中的 CSS 和 js 文件  
2.拉取CSS和JS文件，并内嵌到 微应用HTML文件中  
3.使微应用成为 已内嵌好所有CSS和JS的一个HTML文件  
4.抛出entry文件等待主应用调用

singleSpa 使用 js entry  
qiankun 使用 html entry

**js entry的缺点**  
无法识别 HTML 内部声明的资源  
丢失 HTML 结构信息  
CSS 加载困难  
资源列表不可预知

### HTML Entry
而 html entry 可以获得独立开发完全相同的体验  
主应用拿子应用完整的 index.html，解析里面的 script link，再按顺序加载。

```js
// qiankun html entry 由 import-html-entry 负责
import importHTML from "import-html-entry";
importHTML("./xxxApp/index.html").then((res) => {
    const { template, scripts, entry, styles } = res
    // template html模板
    // entry    子应用的入口文件
    // scripts  JS文件，含内嵌JS代码及链接加载后的文件的代码
    // styles   样式文件，含内嵌代码及链接加载后的文件的代码

});
```

### 执行流程
qiankun的微应用须打包为 UMD格式, 即自动执行往window上挂载对象

```js
window["myApp"] = { bootstrap, mount, unmount }
```

1. 通过 import-html-entry fetch entry HTML
2. 解析 HTML → 提取 JS/CSS 链接
3. 通过 onload, 顺序 拉取并执行 JS包, 再拉取并执行 下一个JS包
4. 最后一个 JS包 onload检查 `window["myApp"]` 属性

## CSS 隔离方案

css-module，scoped 打包的时候生成选择器名字实现隔离  
BEM 规范  
CSS in js  
shadowDOM 严格的隔离

insertBefore, appendChild 和 removeChild  
防止主应用样式DOM被修改

## JS 隔离方案

**snapshotSandbox： 记录 window 对象，每次 unmount 都要和微应用的环境进行 Diff**  
激活沙箱时，将 window 的快照信息存到 windowSnapshot 中，  
如果 modifyPropsMap 有值，还需要还原上次的状态；  
激活期间，可能修改了 window 的数据；  
退出沙箱时，将修改过的信息存到 modifyPropsMap 里面，并且把 window 还原成初始进入的状态。

可应用于不支持 proxy 的浏览器，浪费内存，污染 window

**legacySandbox:在微应用修改 window.xxx 时直接记录 Diff，将其用于环境恢复**  
在 snapshotSandbox 的基础上优化掉了 双重循环diff 的过程，  
监听每一次微应用对 window 的 修改 新增操作。  
将修改新增前的属性记录在两个对象上，这样在还原的时候就不需要 diff 对比新旧 window，直接还原。  
addedPropsMapInSandbox、modifiedPropsOriginalValueMapInSandbox

减少了 diff 过程，依旧污染 window，依旧同时只能 **单例运行**

**proxySandbox：每个微应用都有自己的 proxy**  
激活沙箱后，每次对 window 取值的时候，先从自己沙箱环境的 fakeWindow 里面找，  
如果不存在，就从 rawWindow(外部的 window)里去找；  
当对沙箱内部的 window 对象赋值的时候，会直接操作 fakeWindow，而不会影响到 rawWindow。  
每个微应用都有自己的 proxy

支持多个子应用同时运行，不污染全局 window

## 为什么JS沙箱只需要隔离window
__【JS内存天然隔离】__  
多个项目同时运行，有模块作用域，函数作用域隔离  
没有引用，JS 不可能“不能凭空访问别人的内存”

__【window全局副作用唯一入口】__

__【qiankun没有隔离原型链】__ `Array.prototype.xxx`

__【qiankun没有隔离DOM】__

> JS沙箱不止隔离了window 还接管了 `setInterval`,`addEventListener`,`appendChild`

## qiankun 使用

```js
registerMicroApps(
  [
    {
      name: "reactApp",
      entry: "//localhost:40000", // 默认react启动的入口是10000端口
      activeRule: "/react", // 当路径是 /react的时候启动
      container: "#container", // 应用挂载的位置
      loader, // 微应用加载时触发钩子
      props: { a: 1, util: {} }, // 可传给微应用生命周期的属性
    },
    {
      name: "vueApp",
      entry: "//localhost:20000", // 默认react启动的入口是10000端口
      activeRule: "/vue", // 当路径是 /react的时候启动
      container: "#container", // 应用挂载的位置
      loader,
      props: { a: 1, util: {} },
    },
  ],
  {
    // qiankun的生命周期钩子，作用不大
    beforeLoad() {
      console.log("before load");
    },
    beforeMount() {
      console.log("before mount");
    },
    afterMount() {
      console.log("after mount");
    },
    beforeUnmount() {
      console.log("before unmount");
    },
    afterUnmount() {
      console.log("after unmount");
    },
  }
);
// start可以传入一些额外的配置
start();
```

## qiankun 接入过程中遇到的问题

解决方案去哪找: 谷歌，qiankun github的issue，qiankun的微信支持群。

**配置问题**  
【子应用nginx要配置跨域】  
【子应用entry结尾必须加/】, 且上线要用CDN域名。  
【子应用入口 生命周期函数 以及 **webpack_public_path** 注入】  
【资源引入方式一定要写相对路径】否则只会走主站地址，不会走 **webpack_public_path**  
【publicPath配错】

```js
if (window.__POWERED_BY_QIANKUN__) {
    __webpack_public_path__ = window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__;
}
```

**微应用通信**

**路由跳转问题**  
子应用的路由跳转会基于子应用的base，无法使用`<router-link>` `router.push/router.replace`  
`<a>`标签可以跳，但会刷新页面  
解决：将主应用路由实例传给子应用，子应用进行封装

**qiankun在子应用中引入资源时报错解决**  
qiankun会把静态资源的加载拦截，改用fetch方式获取资源，所以要求这些资源支持跨域，  
解决: 使用qiankun提供的 start 接收的对象内的 excludeAssetFilter 判断url放行。

**对微应用实现 keep-alive 需求**  

**样式相互影响**  
css module，每个模块配置自己的模块前缀

**各个微应用UI风格不统一**  
css token，边距 颜色 字体大小，根据场景不同强制要求使用token变量，宣讲

## 子应用如何接入
1.修改构建配置 library:'moduleName' libraryTarget:'umd'  
2.暴露生命周期 bootstrap mount unmount  
3.路由设置 basename:'/moduleName'  
4.nginx配置 子应用路径 fallback

```nginx
# fallback
location / {
    try_files $uri /index.html;
}
# 子应用路径
location /moduleName/ {
    try_files $uri /moduleName/index.html;
    add_header Access-Control-Allow-Origin *;
}
```

## url问题
经过 webpack JS 模块处理的资源 会运行时拼接 `__webpack_public_path__`  
即 webpack publicPath 配置

### 子应用分包
所以, 想正确拿到子应用资源  
子应用被主应用挂载时，要动态覆盖 `__webpack_public_path__`

```js
// qiankun 将会在微应用 bootstrap 之前注入这个 publicPath 
if (window.__POWERED_BY_QIANKUN__) {
    __webpack_public_path__ = window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__;
}
// __INJECTED_PUBLIC_PATH_BY_QIANKUN__ 即对应 entry
registerMicroApps([
  {
    name: 'moduleName',
    entry: 'https://cdn.example.com/moduleName/',
    container: '#moduleName',
    activeRule: '/moduleName',
  },
])
```

运行时拼接 `__webpack_public_path__`:  
import / require / url() / HTML loader  
+相对路径(`./xxx` / `../xxx`)

运行时不拼接 `__webpack_public_path__`:  
非相对路径 的 都是绝对路径(`/img/logo.png`)

```js
// 会拼: JS chunk 动态 import
const PageA = React.lazy(() => import('./PageA'));

// 会拼: 静态资源 import
import logo from './logo.png';
```

```css
/* 会拼: CSS url()中的 相对路径 经过 css-loader 处理  */
.logo { background-image: url('./logo.png'); }
.logo { background-image: url('../logo.png'); }
```

```css
/* 不会拼: CSS url()中的 绝对路径 */
.logo { background-image: url('logo.png'); }
.logo { background-image: url('/logo.png'); }
.logo { background-image: url('https://xxx.com/logo.png'); }
```

### CSS URL
支持 运行时拼接 `__webpack_public_path__`  
支持 小文件转 base64, 大文件 file-loader

```js
// module.exports={module:{rules:[]}};
{
    test: /\.css$/i,
    use: [
        // 把解析后的 CSS 模块注入到 DOM
        'style-loader', // 或 MiniCssExtractPlugin.loader 提取成单独文件
        {
            // 解析 @import 和 url() => require('./logo.png')
            loader: 'css-loader',
            options: { url: true },
        },
    ],
}
{
    test: /\.(png|jpg|gif|woff2?|eot|ttf|otf)$/i,
    use: [
        {
            loader: 'url-loader',
            options: {
                limit: 8 * 1024, // 小于8KB 转 base64
                fallback: {
                    loader: 'file-loader',
                    options: {
                        name: '[name].[hash:8].[ext]',
                        // 效果：不要写死 publicPath，交给 __webpack_public_path__ 动态拼接
                        publicPath: 'auto',
                    },
                },
            },
        },
    ],
}
```

支持 CSS Module 样式隔离  
支持 less

```js
// 放上面 .css 的上一个
// module.exports={module:{rules:[]}};
// const MiniCssExtractPlugin = require("mini-css-extract-plugin");
{
test: /\.less$/,
use: [
    // MiniCssExtractPlugin 的 loader 形式
    isProd ? MiniCssExtractPlugin.loader : "style-loader",
    {
        loader: 'css-loader',
        options: {
            // css module 开启
            modules: {
                // class name 格式：localName + module 名 + hash
                localIdentName: `${moduleName}__[local]__[hash:base64:5]`
            }
        }
    },
    'less-loader'
]
}
```

> style-loader CSS直接写进JS,运行时创建全局`<style/>`, 不利于CDN缓存  
> MiniCssExtractPlugin.loader 独立CSS文件，利于CDN缓存  
> css-loader url('./logo.png') 转成 require('./logo.png')  
> Webpack 会遍历 module.rules 数组，从上到下匹配 test 条件  
> 对于每个模块文件，只会应用第一个匹配到的规则

## 静态资源必须支持跨域
[配置nginx解决](https://segmentfault.com/a/1190000012550346)

```nginx
location / {  
    add_header Access-Control-Allow-Origin *;
    add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS';
    add_header Access-Control-Allow-Headers 'DNT,X-Mx-ReqToken,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Authorization';

    if ($request_method = 'OPTIONS') {
        return 204;
    }
} 
```

## 样式隔离
qiankun 统一插入到 document.head,卸载时完全清理,无法避免全局样式污染  
主应用 与 微应用 CSS隔离 建议加前缀自行处理

```js
// 主应用webpack 修改less变量
{
  loader: 'less-loader',
+ options: {
+   modifyVars: {
+     '@ant-prefix': 'yourPrefix',
+   },
+   javascriptEnabled: true,
+ },
}
```

## 微应用互相跳转
使用 `window.location.href = /moduleName/xxx` 进行跳转  
注意: 以/开头,会自动拼接 域名及端口

## 微应用文件更新之后，访问的还是旧版文件
JS包通过 版本号/Hash等更新后 注入index.html  
index.html 则需要配置 no-cache

```nginx
location = /index.html {
  add_header Cache-Control no-cache;
}
```

## qiankun window.onXxx = fn不生效
因为 proxy沙箱机制, 其并不会被赋值到真正的 window上  
改用 事件注册 `window.addEventListener('resize', handler);`  
记得及时卸载 `window.removeEventListener('resize', handler)`  
调用真实 window 原型链方法的行为，qiankun 不会拦截或隔离这一类 DOM API
