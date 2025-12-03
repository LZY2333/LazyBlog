---
title: 网络安全
date: 2025-11-28 13:27:45
tags:
    - http
---

## ----网络安全----
## XSS

反射型XSS

存储型XSS

DOM-based XSS


| 项目                 | 自查项                                         |
|----------------------|------------------------------------------------|
| DOM 渲染方式         | 禁止直接使用 innerHTML dangerouslySetInnerHTML |
| 用户输入             | 输入输出均做 Escape 处理或白名单过滤           |
| URL / Query 参数渲染 | 禁止未经处理直接插 DOM                         |
| 富文本内容           | 使用 DOMPurify / xss 库进行白名单过滤          |


## CSRF
跨站请求伪造

本质: 利用 cookie 自动携带的特性 伪装用户身份  
`SameSite=Strict`可以直接解决

### CSRF配置
大部分公司 后端响应头配置  
`Set-Cookie: session=xxx; HttpOnly; Secure; SameSite=None`  
`HttpOnly;`: 禁止 JS 读取 Cookie  
`Secure;`:   仅HTTPS传输  
`SameSite;`: 跨站请求时是否携带 Cookie  
`SameSite=Strict`必须同时设置`Secure;`

### CSRF防御
CSRF Token  
HttpOnly  
Access-Control-Allow-Origin: https://app.example.com 精确白名单  
关键请求二次验证 且存在过期时间 防止批量自动化攻击


> 默认 SameSite=Lax, 只有get请求会带cookie  
> SameSite=None, 必须配Secure, 否则浏览器不会保持该cookie,  
> 浏览器对 Cookie 的携带规则只看目标域名，不看请求来源网站

## CORS
__浏览器Origin安全策略:CORS(跨域资源共享)__  
决定JS能否访问接口: 同全部域名 + 同协议 + 同端口

__浏览器Cookie安全策略:SameSite__  
决定是否携带cookie: 同顶级域名 + 同协议

### CORS配置
`Access-Control-Allow-Origin: *`  
`Access-Control-Allow-Credentials: true`  
`Access-Control-Max-Age: 3600`  
`Access-Control-Allow-Methods:GET,POST`  
`Access-Control-Allow-Headers:Content-Type`

### CORS防御


