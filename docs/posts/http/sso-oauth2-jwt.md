---
title: 
date: 2025-12-02 16:24:43
tags:
    - http
---

## 传统登录 Session + Cookie

1. 用户登录，建立session表格，Cookie带上SessionID给客户端
❌服务器消耗大  
❌需要共享 Session  
❌cookie不适合跨域项目

2. 用户登录，不建立session表格，把用户数据放在客户端
❌容易被篡改

如何做到，身份信息储存在客户端 + 能验证客户端返回给我的信息

## 无状态登录 JWT
JSON Web Token

1. 用户info + 密钥 => 加密算出 Access Token
2. 用户info + Access Token => 传给客户端, 发起请求时会带上
3. 用户info + 密钥 => 加密算出 token 对比 Access Token 进行校验

Access Token(即签名) 无法伪造，因为没有 密钥 无法算出签名

| 名称                   | 作用                              | 存储位置                                | 生命周期         |
|------------------------|-----------------------------------|-----------------------------------------|------------------|
| SSO Cookie / SSO Token | 跨系统单点登录，识别用户是否已登录 | Cookie（HttpOnly, Secure, SameSite=None） | 长期（如 7 天）    |
| JWT AccessToken        | 调用微服务 API / 前后端分离系统   | 前端内存或 Authorization Header         | 短期（如 30 分钟） |
| RefreshToken           | 续期 AccessToken，支持登出         | Cookie（HttpOnly） + 服务端存储（Redis）    | 中期（如 7 天）    |


## 单点登录

## SSO

Single Sign On 一处登录，多处共享

基于token 的 SSO 方案

用户登录后，返回一个token，包含用户所有的登录信息，保存在cookie中 每次请求都带上token  
(这个token是不是就是JWT令牌)

服务端 网关层 UAA 服务，负责token 的申请和验证，验证是否有效期内，是否伪造

通过网关后，业务服务直接从token中解析出用户信息

> Spring Security 提供了SSO  OAuth2.0直接的封装






OAuth2

