---
title: CORS 跨域
date: 2025-12-01 15:30:30
tags:
    - http
---

限制网页加载跨域资源  
同源判定: 同全部域名 + 同协议 + 同端口

静态资源服务器地址 由Webpack配置  
数据服务器地址     由Axios配置  
如果是CDN, 两者都需要服务器配置CORS

## 跨区请求流程
```text
前端发起跨域请求
     │
     ├─> 是否为简单请求？
     │       ├─ 是 → 直接发送实际请求
     │       └─ 否 → 发 OPTIONS 预检请求
     │
预检请求响应
     │
     ├─> Access-Control-Allow-Origin 是否匹配？
     │       ├─ 否 → 请求失败
     │       └─ 是 → 继续
     │
     ├─> Access-Control-Allow-Credentials 是否 true？（带凭证）
     │       ├─ 否 → 不携带 cookie
     │       └─ 是 → 继续
     │
浏览器检查 cookie SameSite
     │
     ├─> 允许发送？  
     │       ├─ 否 → cookie 不发送
     │       └─ 是 → cookie 发送
     │
发送实际请求（带 cookie 或凭证）
     │
服务器响应 Access-Control-Allow-Origin & Access-Control-Allow-Credentials
     │
浏览器决定是否允许前端 JS 访问响应
```
> 非同源简单请求: 会发出 实际请求, 会有服务器响应，但浏览器会阻止JS访问响应  
> 非同源非简单请求: 会发出 预检请求, 服务器响应 CORS preflight failed, 无实际请求

## 涉及配置
### `Access-Control-Allow-Origin: *`
信任源

### `Access-Control-Allow-Credentials: true`
是否可携带凭证  
主要场景是要求携带cookie, 其他凭证(HTTP Auth、客户端证书)也适用  
> `Allow-Credentials: true` 不能与`Allow-Origin:*`连用,必须指定Origin  
> 允许携带cookie后，还必须满足SameSite，才能带上cookie

### `Access-Control-Max-Age: 3600`
预检请求(OPTIONS)的缓存时间 单位秒

### `Access-Control-Allow-Methods:GET,POST`
请求方法是否允许

### `Access-Control-Allow-Headers:Content-Type`
请求头是否允许

### 前端axios配置 withCredentials
`credentials` 或 `withCredentials`
```js
// fetch
fetch('https://api.example.com/data', {
    method: 'GET', // 默认就是get,不写也行
    credentials: 'include', // 关键，携带 cookie
})
.then(res => res.json())
.then(console.log);
// axios
axios.get('https://api.example.com/data', {
    withCredentials: true
})
.then(res => console.log(res.data));
```

## 预检请求
跨域请求分为两类 简单请求 预检请求

### 简单请求
请求方法: `GET` `HEAD` `POST`  
请求头: 不能含任何自定义请求头, 且`Content-Type`:  
`text/plain`, `multipart/form-data`,  
`application/x-www-form-urlencoded`  
`body`: 内属性不影响

> 第三方库可能会修改请求头, 导致看上去简单请求, 实际上不简单  
> `axios.post('xxx', {a:1})`会修改`Content-Type: application/json`

### 非简单请求
`POST` + `application/json`  
携带自定义请求头

### 预检请求(OPTIONS)
```http
OPTIONS /api/data HTTP/1.1
Host: api.example.com
Origin: https://app.example.com
Access-Control-Request-Method: POST
Access-Control-Request-Headers: a, Content-Type # 改动的头部
```
服务器检查 Origin Method Headers，如果通过:

服务器响应预检请求,带上各种跨域配置
```http
HTTP/1.1 204 No Content # 代表: 请求成功,但没有响应体
Access-Control-Allow-Origin: https://app.example.com
Access-Control-Allow-Credentials: true   # 如果需要携带 cookie
Access-Control-Allow-Methods: POST, GET, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Max-Age: 3600             # 可选，缓存预检结果
```
> 预检请求 不会带 cookie！！！

### 实际请求
`Allow-Origin` `Allow-Credentials` 这两个响应头必须携带
```http
HTTP/1.1 200 OK
Access-Control-Allow-Origin: https://app.example.com
Access-Control-Allow-Credentials: true
Content-Type: application/json
```

## Cookie携带控制
简单请求/预检请求(allow) + SameSite + 前端credentials include

1.服务器允许: 简单请求 或 预检请求里携带  
`Access-Control-Allow-Credentials: true`

2.cookie允许: 需要在登录时 cookie配置了  
`Set-Cookie: sessionId=xxxx; HttpOnly; Secure; SameSite=None`

3.前端配置: 前端设置了  
`credentials:'include'` 或 Axios `withCredentials:true`

## Credentials: true不能与*一起用
```http
Access-Control-Allow-Origin: *
Access-Control-Allow-Credentials: true
```
`Credentials: true` 意味着可以携带cookie  
`Origin: *` 意味着信任任何源  
任何网站可以向服务器请求并携带用户cookie

意味着允许任何网站发起 CSRF(跨站请求伪造)攻击

如果想允许多个origin,  
返回响应头前 代码判断 当前origin 是否白名单内, 在白名单内再将其配进响应头

> `Allow-Origin: https://*.example.com` 也不行, 浏览器不支持通配符
