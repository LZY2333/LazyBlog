---
title: 总结
date: 2025-08-19 11:17:30
categories: 知识点
tags: Chrome
---

## 浏览器

### 进程

**浏览器进程**
界面显示 用户交互 子进程管理 提供储存功能

**渲染进程**
将 HTML CSS JS 转换为用户交互的页面
排版引擎 Blink JS 引擎 V8 运行其中
非同源网站,每个 Tab 一个渲染进程
安全考虑,渲染进程运行在沙箱模式下

**GPU 进程**
初衷是为了实现 3D CSS 效果
随后 UI 界面都采用 GPU 来绘制

**网络进程**
负责网络资源的加载
之前只是作为 浏览器进程 的一个模块
后来独立出来，提升隔离性和稳定性

**插件进程**
插件易崩溃,通过插件进程来隔离,保证不对浏览器和页面造成影响
[浏览器渲染进程的多线程机制](https://blog.csdn.net/fredricen/article/details/105217588)

### 线程

指 **渲染进程** 内的线程划分，并不是 OS 级的进程

**主线程**
JS CSS DOM 事件回调 等绝大多数前端逻辑

**网络线程**
处理资源请求 完成后通过 事件回调 交给 **主线程**

**定时器线程**
setTimeout / setInterval 到点后推入 宏任务队列 等待主线程执行

**合成线程**
合成图层 交给 **GPU 进程** 绘制

**光栅化线程**
将矢量内容转换为位图(SVG、Canvas)

**Web Worker 线程**
由开发者手动创建（new Worker）
适合做密集型计算，避免阻塞 UI
独立于主线程，不能操作 DOM，只能通过消息通信与主线程交互

## 从地址栏输入 URL 到首屏渲染

用户发出 URL 请求 到 页面开始解析的过程,叫做 **导航**

1. 判断地址栏 输入的是 **URL 规则** 数据 还是 **搜索内容：**
2. beforeunloaded

3. 浏览器进程 通过 进程通讯(IPC) 把 URL 请求 发送至网络进程,网络进程开启真正的 HTTP 请求
4. 构建请求行信息
5. 查找本地是否有对应网站缓存
6. DNS 寻址,本地有 IP 缓存的话也会直接返回
7. 等待 TCP 队列,同一域名最多 6 个 TCP 连接

8. TCP 连接,通过 IP 和端口号,三次握手
9. 发送 HTTP 请求,请求行,请求头
10. 返回相应行,响应头,响应体
11. TCP 断开连接
12. 重定向

13. 数据处理 Content-Type
14. 准备渲染进程
15. 提交文档

## 浏览器渲染流程(已拆分)

## HTTP 缓存 协商缓存 强缓存 弱缓存 CDN

304 协商缓存 还是要和服务器通信一次

强制浏览器使用本地缓存（cache-control/expires）

## cookie sessionStorage localStorage

```js
document.cookie =
    'username=xxx; expires=Thu, 15 Dec 2023 16:00:00 UTC; path=/';
sessionStorage.setItem('key', 'value'); // getItem removeItem clear()
localStorage.setItem('key', 'value'); // getItem removeItem clear()
```

储存容量
cookie：4KB； LocalStorage 和 SessionStorage：5MB 到 10MB； indexedDB：无上限

生命周期
cookie：持久保存，可以设置过期时间。
LocalStorage：持久保存，除非被显式清除。
indexedDB：持久保存，除非被显式清除。
SessionStorage：关闭浏览器标签或窗口后清除。

安全性
cookie 最不安全，可以设置路径、域名和安全标志来限制访问。

cookie
session storage
local storage
indexedDB:用于客户端存储大量的结构化数据（文件/二进制大型对象（blobs））。该 API 使用索引实现对数据的高性能搜索。
cache storage：用于对 Cache 对象的存储。

sessionStorage 不能在多个窗口或标签页之间共享数据，
但是当通过 window.open 或链接打开新同源页面时(不能是新窗口)，新页面会复制前一页的 sessionStorage

## 同源

同源与跨域 是浏览器安全策略的 **数据隔离规则**

只有同源的情况下才能进行

**共享同一份 持久化储存**
Cookie、localStorage、IndexedDB、SW/Cache

**但各自独立 运行时上下文**
sessionStorage、JS 内存(全局变量、React 状态)

**Tab 通信**
BroadcastChannel、SharedWorker、postMessage、storage 事件(localstorage 写入触发)

> 我们公司 angular 项目用的是 storage 事件，React 项目用的是 postMessage
> localStorage 数据共享的, 同源页面的 getItem 始终能拿到最新值。
> window.addEventListener('storage', e => console.log(e.key, e.newValue));

## 跨域

规则要素是 协议(http/https/file) 主机名(域名/IP) 端口号(80/3000)

跨域解决方案
**JSONP**: 用 script 标签 src 属性来发送请求, 因为跨域只对 ajax 有限制，老浏览器支持

**nginx**: 在同源服务器内设置反向代理，后端无跨域限制

**CORS**: 后端配置允许跨域

对于 **CORS 简单请求**, 浏览器会自动添加 Origin 头部
只需要服务端设置响应头 Access-Control-Allow-Origin
get post head 且 请求头中只有 Accept Accept-Language Content-Language Content-Type

对于 **CORS 非简单请求**, 浏览器会先发送一个预检请求 OPTIONS

```js
app.get('/api/sayHello', (req, res) => {
    // 允许有所的地址跨域
    res.setHeader('Access-Control-Allow-Origin', '*');
    // 允许所有的请求方法 GET, POST, PUT, DELETE
    res.setHeader('Access-Control-Allow-Methods', '*');
    // 允许的非简单请求的头部字段，如（Content-Type、X-Requested-With、Accept、Origin、Access-Control-Request-Method、Access-Control-Request-Headers）
    res.setHeader('Access-Control-Allow-Headers', '*');
    // 允许携带cookie
    res.setHeader('Access-Control-Allow-Credentials', '*');
    // 设置预检请求（OPTIONS 方法）的结果缓存时间。
    res.setHeader('Access-Control-Max-Age', '*');
    res.send({ name: 'hello word' });
});

app.listen(3000, () => {
    console.log('service running at 3000 ...');
});
```

> 发送 cookie，需要服务器端设置 Access-Control-Allow-Credentials , 需要 AJAX 请求设置 withCredentials

```js
location /api {
    proxy_pass http://api.example.com; # 目标服务器地址
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
```

### 微任务 宏任务 事件循环

## HTTP 协议

### 什么是 DNS 寻址

### HTTP 请求的过程

IP 负责把数据包送达目的主机。
UDP 负责把数据包送达具体应用。
TCP 保证了数据完整地传输，它的连接可分为三个阶段：建立连接、传输数据和断开连接。

### IP UDP TCP

互联网实际上就是一套理念和协议组成的体系架构

IP(Internet Protocol) 网际协议

> IP 其实就是计算机地址 访问网站就是访问另一台计算机
> 数据包交给网络层,包上 IP 头,交给底层,通过物理网络传输给目标主机的网络层

UDP(User Datagram Protocol) 用户数据包协议

> 端口号,传输层识别端口号将此电脑的数据包分发给对应的程序
> 数据包(上层) +UDP 头(传输层) +IP 头(网络层) 再底层传输到目标主机,再解析
> UDP 有数据校验,但对于错误的数据包直接丢弃没有重发机制,且发送方无法得知数据是否送达,优点是传输快

TCP(Transmission Control Protocol) 传输控制协议

> 面向连接的 可靠的 基于字节流的传输层通信协议
> 优点:数据包丢失时,提供重传机制;有数据包排序机制,保证把乱序的数据包组合成完整文件

**TCP 连接**

TCP 连接生命周期包括 建立连接 传输数据 断开连接

首先,建立连接 三次握手 指客户端和服务器共需要发送三个数据包确认连接的建立

其次,数据传输 接收端需要再接收到每个数据包后返回确认数据包给发送端,
接收到数据包后会根据 TCP 头中的序号为其排序,组合成完整的数据

最后,断开连接 四次挥手

**HTTP** 和 **TCP 的关系**
HTTP 协议和 TCP 协议都是 TCP/IP 协议簇的子集。

HTTP 协议属于应用层，TCP 协议属于传输层，HTTP 协议位于 TCP 协议的上层。

数据包(上层) +HTTP 头(应用层) +TCP 头(传输层) +IP 头()

TCP 在传输层发生丢包时,会要求重传,最后会在保证排好序数据完整的状态下,把数据传给 HTTP 层

先通过三次握手建立 tcp 链接，链接建立好之后，发送 http 请求行和 http 请求头给服务器，然后服务器返回响应行，响应头和响应体，最终完成后通过四次挥手断开 tcp 链接

websocket 其实就是 http 的改造版本,增加了服务器向客户端主动发消息的功能

TCP 是底层通讯协议，定义的是数据传输和连接方式的规范
HTTP 是应用层协议，定义的是传输数据的内容的规范
HTTP 协议中的数据是利用 TCP 协议传输的，所以支持 HTTP 也就一定支持 TCP

HTTP 支持的是 www 服务
而 TCP/IP 是协议
它是 Internet 国际互联网络的基础。TCP/IP 是网络中使用的基本的通信协议。
TCP/IP 实际上是一组协议，它包括上百个各种功能的协议，如：远程登录、文件传输和电子邮件等，而 TCP 协议和 IP 协议是保证数据完整传输的两个基本的重要协议。通常说 TCP/IP 是 Internet 协议族，而不单单是 TCP 和 IP

**总结**
IP 负责送达目标主机 UDP 负责送达具体应用
使用 TCP 的话则保证了数据的完整传输

### HTTP 协议字段及常见值

常见请求头字段

常见响应头字段

### HTTP 1.0 2.0

### HTTPS 为什么更安全

### HTTP tcp/ip 请求的特点

### 为什么需要三次握手，两次不行吗？

为了确定传输是可靠的，要确认客户端和服务器的发送和接收能力。

第一次握手,你在吗我能发送西给你,
第二次握手,确认了服务端的发送能力和接收能力，
所以第三次握手才可以确认客户端的接收能力。不然容易出现丢包的现象。

### 五层因特网协议栈

### URI 和 URL

UDP 协议有什么优点？
协商缓存如何判断命不命中？
HTTP 103 是什么意思？
如何处理跨域？

HTTP1.1 和 HTTP2 做了什么？队头阻塞有没有了解过，在 HTTP2 中有这个问题吗？
有了解过 HTTP3 吗？为什么使用 UDP？

域名解析之后如何找到目标主机？
HTTP3 的协议一定是 TCP
HTTP1.1 和 HTTP2 的区别
HTTPS 如何保证安全性

## 其他

## CSS 树

元素的渲染规则，如包含块，控制框，BFC，IFC
优化

## JS 引擎

在 V8 引擎中,会把 JavaScript 热点代码编译成机器码,
它是电脑 CPU 直接读取运行的机器码，运行速度最快，但是非常晦涩难懂，同时也比较难编写；
机器码就是计算机可以直接执行，并且执行速度最快的代码；

### 如何理解 HTML 语义化

增加代码可读性
利于 SEO,让搜索引擎更容易读懂
无 CSS 的情况下,页面也能有良好的内容结构.

### script 标签中 defer 和 async 的区别

script：阻碍 HTML 解析,只有下载好并执行完脚本才会继续解析 HTML。

async script：解析 HTML 过程中进行脚本的异步下载,下载成功立马执行,有可能会阻断 HTML 的解析。
defer script：完全不会阻碍 HTML 的解析,解析完成之后再按照顺序执行脚本。
