---
title: 静态博客搭建(2)CI/CD
date: 2025-06-04 11:51:05
---

[如果使用GitHub Page，直接跟官方文档就，简单无需服务器，完美自动部署](https://rspress.dev/zh/guide/basic/deploy)

我这里使用的是 阿里云 + GitHub

性子急，不废话直接上配置流程。一些解析话太多，放在后面(见五)，大手子们选择性阅读。

## 1. 服务器 配置 公钥

1. 阿里云 ECS > 实例 > 绑定密钥对/创建密钥对 > 名称随意，如: aliyun_ssh

此时会自动帮你下载一个 aliyun_ssh.pem 文件，此为私钥信息，请妥善保存

2. 继续在阿里云 > 密钥对管理 > 操作 > 选择刚刚创建的密钥对 > 绑定密钥对(绑定实例) > 勾选实例点确定

当实例绑定了密钥对之后密码访问的方式将失效，远程连接服务器请改用密钥方式(见四)

## 2. 仓库 配置 Action Secret  

进入你的 GitHub 仓库 → Settings → Secrets and variables → Actions → New repository secret

添加以下 3 个 Secret：

| Secret Name      | 示例值或获取方法                            |
| ---------------- | ------------------------------------------- |
| `SERVER_HOST`    | 你的服务器 IP 地址，如 `123.123.123.123`    |
| `SERVER_USER`    | 服务器用户名，如 `ubuntu` 或 `root`         |
| `SERVER_SSH_KEY` | 本地的 `~/.ssh/id_rsa` 或 `.pem` 内容(私钥) |

将私钥内容需全部复制，包括 `-----BEGIN RSA PRIVATE KEY-----` 到 `-----END RSA PRIVATE KEY-----`。

## 3. 仓库 配置 GitHub Action

在你的 Rspress 项目根目录中创建 `.github/workflows/deploy.yml`：

```yaml
name: Build and Deploy to ECS

on:
    push:
        branches:
            - main # 或你要触发部署的分支

jobs:
    build-and-deploy:
        runs-on: ubuntu-latest

        steps:
            - name: Checkout code
              uses: actions/checkout@v3

            - name: Setup Node.js
              uses: actions/setup-node@v3
              with:
                  node-version: '20'

            - name: Install pnpm
              run: npm install -g pnpm

            - name: Install dependencies
              run: pnpm install

            - name: Build Rspress project
              run: pnpm build

            - name: Deploy to ECS via SCP
              uses: appleboy/scp-action@v0.1.3
              with:
                  host: ${{ secrets.SERVER_HOST }}
                  username: ${{ secrets.SERVER_USER }}
                  key: ${{ secrets.SERVER_SSH_KEY }}
                  source: 'dist/*' # output目录,这里是dist文件夹内所有内容，不含dist本身
                  target: '/var/www/【xxx】' # 一般放在var/www/【xxx】内，和nginx配置要一致

```

## 4. 其他推荐配置(不影响功能)

__XShell修改远程连接服务器方式__

XShell > 会话右键修改 > 身份验证方法 > Public Key > 导入.pem文件确定 

__.pem 和 id_rsa，二者都是 私钥文件，都是 文本文件，完全可以互用，几乎是改个名字的区别__

__随时可以通过私钥文件生成公钥__

本地(而不是服务器) 输入如下命令通过私钥生成并保存公钥数据 > 打开aliyun_ssh.pub > 复制内容

`ssh-keygen -y -f【文件位置/aliyun_ssh.pem】 > aliyun_ssh.pub`

## 5. 步骤解析

代码提交到某个地方，立即触发自动编译，并推送编译后的代码到服务器

即自动部署，涉及两个难点:

1. 如何访问服务器 -- SSH Key + GitHub Action Secrets

2. 如何自动触发 如何进行编译 如何进行推送 -- GitHub Action

两个问题，GitHub 直接一次性解决，他真的，我哭死。

我们需要意识到，GitHub 早已不仅仅是个仓库，对于开发者来说，他几乎是个“云操作系统”.

配置完成之后，我原本每次需要，本地build，再通过XShell打开，代码还得另外push。

现在直接push解决问题，优雅！

> 阿里云创建密钥对时，自动保存了一份公钥，并下载了一份私钥
> 实例绑定密钥对，即绑定公钥，即将公钥放进了服务器的 ~/.ssh/authorized_keys
> 给 XShell 及 GitHub 配置 私钥，即可访问配置了公钥的 服务器
