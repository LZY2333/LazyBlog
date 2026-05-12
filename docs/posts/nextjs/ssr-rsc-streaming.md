---
title: SSR RSC Streaming Flight
date: 2026-02-07 22:22:26
categories: 技术栈
tags:
    - NextJS
    - React
---

## SSR(待整理)

1.UI生成必须在数据获取之后
2.组件的 JavaScript 必须先加载到客户端，才能开始水合
3.所有组件必须先水合，然后才能跟其中任意一个组件交互

> Suspense，先渲染 Fallback UI, 解决问题1
## RSC

核心能力 边下边渲染，边下边水合，局部水合即局部可用

__Pages 设计目标 最快可看见内容, RSC 设计目标 最快可交互__

## Streaming(待整理)

Streaming 是 Suspense 的技术支撑。将页面的 HTML 拆分成多个 chunks，然后逐步将这些块从服务端发送到客户端。

Streaming 可以有效的阻止耗时长的数据请求阻塞整个页面加载的情况。它还可以减少加载第一个字节所需时间（TTFB）和首次内容绘制（FCP），有助于缩短可交互时间（TTI），尤其在速度慢的设备上。

使用方法: `loading.jsx`(页面级别) `<Suspense>`(组件级别)

> 响应头 Transfer-Encoding 值为 chunked，表示数据将以一系列分块的形式进行发送。
> 分块传输编码（Chunked transfer encoding）是超文本传输协议（HTTP）中的一种数据传输机制，允许 HTTP由网页服务器发送给客户端应用（ 通常是网页浏览器）的数据可以分成多个部分。分块传输编码只在 HTTP 协议1.1版本（HTTP/1.1）中提供。

## Flight

__Flight 是 React 提出的 RSC组件 的实现方案__, 核心是 fiber传输 + 序列化规范

水合过程 看似与 正常CSR执行 一样 直接传客户端bundle + props就行, 但flight思考的更多

传输的 不是组件源码, 也不是JSON格式, 而是

__按Flight模型 序列化过的 fiber对象(的描述), 且 fiber对象自带组件的props数据__

__混合编码,二进制传输: 部分二进制 + 部分Tagged Serialization（带标签序列化）__

> 1.fiber对象效率更高 2.组件源码是ServerComponent不能直接传  
> Flight 模型 的序列化长这样 `$F12:["$","div"]`  
> Nextjs生成 SSR + RSC 的过程中,Fiber本来就已经存在了,Flight 就是顺手从Fiber导出来的  
> 序列化: 把内存结构 → 可传输字节流, Flight部分可读

## Pages Router 一无所有

如果你的项目使用的是 Pages Router + getServerSideProps = 经典SSR架构Nextjs

Pages Router本质是 __一次性的SSR用完就丢, 后面就是普通bundle的CSR__

RSC Flight Streaming ServerAction 均没有,

Props 就是 明文JSON, 必须可序列化默认只是`stringfy`, 复杂属性无法传输, `SuperJSON` 包可解决

Props 与 SSR的html 在一起, 但却是给 CSR的bundle用的

作用: 1.减少请求 2.HTML与Props版本一致,bundle会缓存不能与bundle打包在一起
```html
<!-- Props -->
<script id="__NEXT_DATA__" type="application/json">
{
  "props": {
    "pageProps": {
      "user": { "id":1,"name":"Tom" }
    }
  }
}
</script>
```

> 每个nextjs页面(每个url)首屏都是ssr，而不是只有进网站第一个页面是ssr  
> 地址栏访问 刷新 走SSR, Link router.push 走CSR

