---
title: HTTP 缓存
date: 2024-05-07 11:23:11
categories: 经验帖
tags:
    - http
---

## 最佳实践

__index.html 协商缓存__  
`Cache-Control: no-cache` + ETag

__不可变静态资源 强缓存__  
`max-age=315360000,public,immutable` + 内容哈希

## http缓存
### 涉及响应头字段
__Cache-Control__  
`max-age=315360000`  强缓存时间  
`immutable`         永不协商缓存,针对 刷新页面 页面崩溃恢复页面  
`public/private`    允许缓存(CDN+浏览器) / 允许缓存(仅浏览器,默认)  
`no-store/no-cache` 永不缓存 / 必须协商缓存  
`s-maxage=600`      CDN缓存时间

> 强缓存一般设置`max-age=315360000,public,immutable`  
> 协商缓存一般设置`no-cache` + `ETag: {hash}`  
> 不缓存一般设置`no-store`  
> max-age=0 约等于 no-cache

__Expires__  
绝对过期时间, 依赖客户端时间, 使用场景: 兼容旧浏览器  
`Expires: Wed, 01 Jan 2026 00:00:00 GMT`

__Last-Modified__  
资源最后修改时间, 使用场景: 协商缓存, 不方便生成hash的内容  
`Last-Modified: Tue, 10 Dec 2025 08:00:00 GMT`

__Etag__  
资源唯一标识, 使用场景: 协商缓存, 精度更高  
`ETag: "abc123"`

> 涉及协商缓存请求, 请求头会增加 `If-None-Match: "abc123"`  
> 大型项目中通常 ETag + Last-Modified, 但只依赖 ETag

__Vary__  
配置缓存命中 依赖哪些请求头  
`Vary: Accept-Encoding, Accept-Language`

| 使用场景 | 示例                |
|----------|---------------------|
| Gzip     | Accept-Encoding     |
| 国际化   | Accept-Language     |
| 移动端   | User-Agent          |
| 登录态   | Authorization（慎用） |

> 降低命中率 缓存爆炸

### 缓存命中流程

1. 【检查缓存】
Cache-Control:max-age 及 Expires, 命中返回 200  
Cache-Control:no-cache 或 max-age过期

2. 【发起协商缓存请求】
请求头`If-None-Match:{ETag}`或`If-Modified-Since`  
服务器对比 ETag / Last-Modified, 未变化返回 304

3. 【CDN缓存】
`s-maxage` `stale-while-revalidate`

4. 【源站服务器】

> 所有请求都可以设置任意响应头，但缓存是否生效由浏览器控制  
> GET请求 才能缓存生效, cache key = method + URL  
> POST请求 不会缓存, 因为 语义不合适 CacheKey不合适  
> Cache-Control:no-cache 代表协商缓存,必须向服务器验证,而不是不缓存  
> Cache-Control:no-store 代表不缓存, 用于 登录 权限类数据  
> s-maxage 只影响 CDN，不影响浏览器

### 强缓存
不发送请求，直接本地读取文件，状态码200  
`Cache-Control: max-age=315360000,public,immutable`

> Expires(http1.0字段) 优先级低于 Cache-Control(http1.1)  
> 缓存优先级：Cache-Control > Expires > ETag > Last-Modified

### 协商缓存
```http
// 第一次请求, 服务器配置响应头示例
Cache-Control: no-cache
ETag: "resource-hash"
Last-Modified: Tue, 10 Dec 2025 08:00:00 GMT
```

```http
// 第二次请求, 协商缓存请求 浏览器自动添加头
GET /config
If-None-Match: "v3"
If-Modified-Since: Tue, 10 Dec 2025 08:00:00 GMT
```
第二次请求后端校验, 未修改返回304, 修改则返回200+新内容

### nginx配置
```nginx
location /static/ {
    etag on;
    last_modified on;
    add_header Cache-Control "no-cache";
}
```
静态资源 直接配置nginx, nginx会自动校验这两项, 且优先校验Etag

etag 和 last_modified 均默认开启，不用显式配置

> 老版本nginx gzip会影响ETag, 新版本已无此问题

## CDN缓存

用户发送请求 => DNS寻址 => 到达 业务权威DNS => 返回CDN域名(CNAME)

DNS系统解析CNAME => 到达 CDN权威DNS => 返回最近IP CDN节点

CDN节点 命中缓存直接返回, 未命中则去源站拉取 缓存 并返回

> GET / POST 都会走CDN, 但 GET才会被缓存

## 如果做到回滚
前期做好 静态资源hash 及 保留版本产物

覆盖 入口文件就行

## webpack如何配置hash
```js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    mode: 'production',
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'js/[name].[contenthash:8].js',
        chunkFilename: 'js/[name].[contenthash:8].js',
        publicPath: 'https://cdn.example.com/',
        clean: false
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader'
                ]
            },
            {
                test: /\.(png|jpg|svg)$/i,
                type: 'asset/resource',
                generator: {
                    filename: 'img/[name].[contenthash:8][ext]'
                }
            }
        ]
    },
    optimization: {
        moduleIds: 'deterministic',
        chunkIds: 'deterministic'
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './public/index.html'
        }),
        new MiniCssExtractPlugin({
            filename: 'css/[name].[contenthash:8].css'
        })
    ]
};

```

## gzip配置

`gzip` 和 `brotli` 是HTTP传输能力

写在`http{}`下, 可同时开启, 优先返回 `br`

浏览器通过 `Accept-Encoding: gzip, deflate, br, zstd` 声明支持能力

nginx配置三步开启:  
`gzip on` (必须手动开启)  
`gzip_types` (哪些`Content-Type`可以被gzip压缩)  
`gzip_vary on` (请求头会自动带上 `Vary: Accept-Encoding`)

> `Vary: Accept-Encoding` 缓存命中维度增加, 确保正确命中缓存  
> A调用缓存了gzip压缩内容, 另B浏览器命中了gzip缓存却不支持, 出现乱码

```nginx
# =========================
# Nginx 主配置文件
# =========================

user nginx;                         # 默认：nginx（不同发行版可能不同）
worker_processes auto;              # 显式设置：根据 CPU 核数自动调整（推荐）

error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;        # 默认：1024
}

http {

    # =========================
    # 基础 MIME 配置
    # =========================
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # =========================
    # 日志格式（默认）
    # =========================
    log_format  main
        '$remote_addr - $remote_user [$time_local] "$request" '
        '$status $body_bytes_sent "$http_referer" '
        '"$http_user_agent" "$http_x_forwarded_for"';

    access_log  /var/log/nginx/access.log  main;

    # =========================
    # 基础网络优化
    # =========================
    sendfile        on;              # 默认：off（显式开启，提升静态文件发送性能）
    tcp_nopush      on;              # 默认：off（配合 sendfile 使用）
    tcp_nodelay     on;              # 默认：on
    keepalive_timeout  65;           # 默认：75s

    # =========================
    # gzip 压缩（核心）
    # =========================
    gzip on;                         # ❗默认：off（必须手动开启）
    gzip_vary on;                    # ❗默认：off（重要，代理/缓存正确性）
    gzip_comp_level 6;               # 默认：1（5 是性能/压缩率折中）
    gzip_min_length 256;             # 默认：20（显式设置更合理）
    gzip_buffers 16 8k;              # 默认值存在但不固定，显式写清
    gzip_http_version 1.1;           # 默认：1.1
    gzip_proxied any;                # ❗重要：代理请求压缩
    gzip_disable "MSIE [1-6]\.";     # ❗安全：禁用旧 IE

    gzip_types                       # 默认: text/html
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/x-javascript
        application/xml
        application/xml+rss
        application/rss+xml
        font/woff
        font/woff2
        application/vnd.ms-fontobject
        image/svg+xml;

    # =========================
    # brotli（可选，如果模块支持）
    # =========================
    # brotli on;                      # 默认：off
    # brotli_comp_level 6;            # 默认：6
    # brotli_static on;               # 使用预压缩的 .br 文件
    # brotli_types
    #     text/plain
    #     text/css
    #     text/xml
    #     application/javascript
    #     application/json
    #     image/svg+xml;

    include /etc/nginx/conf.d/*.conf;
}
```
