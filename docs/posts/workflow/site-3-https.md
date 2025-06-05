---
title: 静态博客搭建(3)HTTPS
date: 2025-06-04 11:51:05
---

## 0. 前置条件

拥有域名 且已经配置到公网IP

服务器开启了SSH的登陆模式

服务器 已安装Nginx 并运行

## 1. 阿里云配置

### 获取阿里云 AccessKey

进入阿里云控制台 => 右上角头像 => 权限与安全 => AccessKey

[点击直接访问:阿里云/RAM 访问控制/用户](https://ram.console.aliyun.com/users)

创建用户 名称随意，勾选 使用永久 AccessKey 访问，确定

管理用户 添加权限 `AliyunDNSFullAccess` 允许该用户完全访问 DNS 域名解析服务

保存好 AccessKey ID / AccessKey Secret, 关闭页面后无法再次拿到，只能删了重来

### 开启 HTTPS(443) 端口

阿里云云服务器ECS => 左侧 安全组 => 表格操作列 管理规则

快速添加规则 => Web HTTPS 流量访问 => 确定

很贴心，直接

## 2. 服务器 安装证书

安装
```sh
# 安装
curl https://get.acme.sh | sh
# 配置环境变量
export PATH="~/.acme.sh":$PATH
# 验证
acme.sh --version
```

申请 SSL 证书
```sh
export Ali_Key="你的子账号AccessKeyId"
export Ali_Secret="你的子账号AccessKeySecret"
# 指定使用 Let's Encrypt
acme.sh --set-default-ca --server letsencrypt
# 生成一张单一证书，同时包含两个域名
acme.sh --issue --dns dns_ali -d www.luoziyu.com -d luoziyu.com
```

安装证书
```sh
# 创建一个用于存放 SSL 证书和密钥的目录（如果目录已存在不会报错）
mkdir -p /etc/nginx/ssl

# 安装从 acme.sh 申请到的证书，并设置更新证书后自动重载 Nginx 配置
acme.sh --install-cert -d www.luoziyu.com \                 # 指定要安装证书的主域名（必须是当初 --issue 时使用的主域名）
  --key-file       /etc/nginx/ssl/www.luoziyu.com.key \     # 指定生成的私钥保存路径（供 Nginx 使用）
  --fullchain-file /etc/nginx/ssl/www.luoziyu.com.pem \     # 指定完整证书链保存路径（包括证书和中间证书）
  --reloadcmd     "nginx -s reload"                         # 当证书自动更新时执行此命令，用于重载 Nginx 应用新证书
```

自动续期
```sh
# acme.sh 默认已设置 cron 任务，无需手动配置。
# 这里是测试续期是否正常
acme.sh --renew -d www.luoziyu.com --force
```

## 3. nginx配置修改

可以直接对比我的nginx配置，作用都写在注释里
```nginx
# ===============================
# 将裸域名 luoziyu.com 重定向到 https://www.luoziyu.com
# ===============================
server {
    listen 80;
    server_name luoziyu.com;

    # 将 HTTP 的裸域名永久重定向到带 www 的 HTTPS 域名，提升 SEO & 规范化域名
    return 301 https://www.luoziyu.com$request_uri;
}

# ===============================
# 主站配置，服务于 HTTP 请求的 www 域名
# 强制跳转到 HTTPS
# ===============================
server {
    listen 80;
    server_name www.luoziyu.com;

    # 为 HTTP 的 www 域名配置 301 跳转到 HTTPS，增强安全性，强制 HTTPS 访问
    return 301 https://www.luoziyu.com$request_uri;
}

# ===============================
# 主站配置，HTTPS 访问 www.luoziyu.com
# ===============================
server {
    listen 443 ssl;
    server_name www.luoziyu.com;

    # 添加 SSL 证书路径，由 acme.sh 申请并部署的证书
    ssl_certificate     /etc/nginx/ssl/www.luoziyu.com.pem;   # 证书链（包括中间证书）
    ssl_certificate_key /etc/nginx/ssl/www.luoziyu.com.key;   # 私钥文件

    # 添加推荐的 TLS 配置，提高安全等级
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # 设置站点根目录指向你的前端构建目录
    root /var/www/LazyBlog;
    index index.html;

    location / {
        # 支持 SPA 路由（单页应用），尝试静态资源回退到 index.html
        try_files $uri $uri/ /index.html;

        # 启用 Gzip 压缩，提升前端加载性能
        gzip on;
        gzip_types text/plain application/javascript application/json text/css;
    }

    location ~* \.html$ {
        # 禁止 HTML 缓存，适用于频繁更新的前端内容，避免客户端缓存旧版本
        add_header Cache-Control "no-store, no-cache, must-revalidate" always;
    }

    # 自定义 404 页面逻辑，返回静态的 404.html 页面
    error_page 404 /404.html;
    location = /404.html {
        root /var/www/LazyBlog;
    }
}
```

检查和重启nginx
```sh
nginx -t

nginx -s reload
```

最后验证, 访问[luoziyu.com](https://www.luoziyu.com/), 成功！

## 4. 一些解释

### Let's Encrypt 和 acme.sh

这篇需要两个关键点

__免费证书__: Let's Encrypt 是全球使用量最大的免费证书颁发机构

由 ISRG 创建, 全球约 40%+ HTTPS 网站正在使用, 可以放心申请, 长期使用

__持续申请__: acme.sh 免费、轻量、强大的证书管理工具

可使用 DNS 或 Web 验证方式 申请证书, 并集成到 Nginx 实现 自动续期

### AccessKeyId / AccessKeySecret

阿里云专门用于调用其开放 API 接口的凭证，属于阿里云账号管理体系

SSH Key 用于 登录服务器、远程操作, 与之不同

### export Ali_Key="..."

export 操作是设置环境变量，后续供 acme.sh 调用

用于调用 阿里云 DNS API，自动添加 TXT 记录，完成 Let's Encrypt 的 DNS 验证流程。

### TLS 和 SSL

TLS 是 SSL 的后继协议，SSL 已完全废弃。

很多厂商仍使用 【SSL证书】 这个词，利于营销理解，底层还是用的 TLS 协议。