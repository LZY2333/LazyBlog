---
title: 构建打包中静态资源URL处理
date: 2025-11-26 23:30:48
categories: 经验帖
tags:
  - webpack
---

## publicPath静态资源地址

__建议配置__  
webpack
```js
output: {
    filename: 'js/[name].[contenthash].js',
    chunkFilename: 'js/[name].[contenthash].js',
    publicPath: 'auto',
}
```

入口文件, 必须在所有 import 之前  
`__webpack_public_path__ = process.env.CDN_BASE + '/';`

CI/CD 注入、灰度发布  
`CDN_BASE=https://cdn.xxx.com/ npm run start`

webpack 中配置 publicPath 后, 静态资源(含分包)会运行时拼接  
`__webpack_public_path__`

__哪些代码写法会__  
运行时拼接 `__webpack_public_path__`:  
import / require / url() / HTML loader  
+相对路径(`./xxx` / `../xxx`)

运行时不拼接 `__webpack_public_path__`:  
绝对路径(非相对路径的都是绝对路径,会由浏览器发起请求)

```js
// 会拼: JS chunk 动态 import
const PageA = React.lazy(() => import('./PageA'));
// 会拼: 静态资源 import
import logo from './logo.png';
// 会拼: 会拼(因为可以静态解析)
import(`./assets/${value}.png`)
// 不会拼: 无法静态分析
import(path + ".png")
```

```css
/* √: CSS url()中的 相对路径 经过 css-loader 处理  */
.logo { background-image: url('./logo.png'); }
.logo { background-image: url('../logo.png'); }

/* X: CSS url()中的 绝对路径 */
.logo { background-image: url('logo.png'); }
.logo { background-image: url('/logo.png'); }
.logo { background-image: url('https://xxx.com/logo.png'); }
```

另外提一句, qiankun框架  
主应用的`__webpack_public_path__`大概率会和子应用不一致  
所以需要 子应用 在自己入口文件配置 如下配置修改该值,  
不然子应用运行时读到的是主应用的静态资源地址

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

## URL处理配置
publicPath 对分包直接生效  
img/font 需要 file-loader/url-loader(Webpack5 asset/resource)  
CSS内url() 需要 css-loader  
CSS 文件 需要 MiniCssExtractPlugin

Webpack4 需要如下配置
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
Webpack5 资源模块 内置了 file-loader / url-loader 能力，不需要额外插件。
```js
{
    test: /\.(png|jpe?g|gif|svg)$/i,
    type: 'asset',
    parser: {
        dataUrlCondition: { maxSize: 8 * 1024 } // <8KB base64
    },
    generator: {
        filename: 'img/[name].[hash:8][ext]',
        publicPath: 'auto', // 支持 Runtime 动态 publicPath
    },
}
```

> rules匹配 从上到下 匹配到就结束, use loader顺序 从下到上  
> css-loader 会把 CSS 内的 url('./logo.png') 转换成 require('./logo.png')  
> 转换后，Webpack 会把 ./logo.png 当作一个模块去解析, 再次遍历规则

## 注意：动态上下文打包 问题

```js
import(`./assets/${value}.png`)
```
会触发 context module，也就是 动态上下文打包  
assets 目录下所有 .png 都会被打包进 bundle  
且会生成 JS wrapper 资源引用模块包

```lua
-- 打包后输出目录的资源文件夹
123.a.png
123.a.png.js   <-- wrapper chunk
```

请改成下述写法以 避免生成 JS wrapper
```js
const imgUrl = new URL(`./assets/${value}.png`, import.meta.url).href;
<img src={imgUrl} />
```

## 注意: publicPath 默认为 'auto'

❌ 1.不要将 publicPath 设置为 `''`  
✅ 2.配置CDN时,url末尾 必须有 `'/'`

publicPath 就是非常单纯的拼上其内容

```js
output: {
    filename: 'js/[name].[contenthash].js',
    publicPath: '/',
}
// 产物 <script src="/js/main.1a2b3c.js">
output: {
    filename: 'js/[name].[contenthash].js',
    publicPath: '',
}
// 产物 <script src="js/main.1a2b3c.js">
output: {
    filename: 'js/[name].[contenthash].js',
    publicPath: 'https://cdn.xxx.com',
}
// 产物 <script src="https://cdn.xxx.comjs/main.1a2b3c.js">
```

打包后  
✅ `/img/main.1a2b3c.js` 为 拼接根路径 的绝对路由  
❌ `img/main.1a2b3c.js` 为 拼接当前路径 的相对路由  
❌ `cdn.xxx.comjs/main.1a2b3c.js` 则直接格式出错

这时候会发现 页面空白

