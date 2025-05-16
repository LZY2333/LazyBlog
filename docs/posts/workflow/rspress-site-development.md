---
title: Rspress建站从0到1
date: 2025-04-16 22:18:37
---

## --本地创建项目--



## --实现自动部署--

[如果想使用GitHub Page，直接跟着官方文档就行了](https://rspress.dev/zh/guide/basic/deploy)

这是有自己服务器的版本，其实也大差不差

## ✅ 全流程步骤总览：

1. ✅ 在服务器上安装 Node.js 和 pnpm  
2. ✅ 在本地生成 SSH 密钥并配置服务器和 GitHub  
3. ✅ 在 GitHub 设置 Secrets  
4. ✅ 在 GitHub 项目中创建 `.github/workflows/deploy.yml`  
5. ✅ 提交代码触发部署

---

## 🧱 第一步：在服务器上安装 Node.js 和 pnpm

### 📍 登录服务器

```bash
ssh your_username@your_server_ip
```

### 1️⃣ 安装 Node.js（推荐使用官方脚本）

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

> `node -v` 检查是否安装成功（应输出 `v20.x.x`）

### 2️⃣ 安装 pnpm（通过 npm 安装）

```bash
sudo npm install -g pnpm
```

> `pnpm -v` 检查是否安装成功

---

## 🔐 第二步：生成 SSH 密钥并配置登录

### 1️⃣ 在本地生成 SSH 密钥（如果已有可跳过）

```bash
ssh-keygen -t rsa -b 4096 -C "github-deploy"
```

按提示一路回车，生成在 `~/.ssh/id_rsa` 和 `id_rsa.pub`

### 2️⃣ 将公钥上传到服务器

```bash
ssh-copy-id -i ~/.ssh/id_rsa.pub your_username@your_server_ip
```

确认无密码登录成功：

```bash
ssh your_username@your_server_ip
```

---

## 🛡️ 第三步：配置 GitHub Secrets

进入你的 GitHub 仓库 → Settings → Secrets and variables → Actions → **New repository secret**

添加以下 3 个 Secret：

| Secret Name      | 示例值或获取方法                              |
| ---------------- | --------------------------------------------- |
| `SERVER_HOST`    | 你的服务器 IP 地址，如 `123.123.123.123`      |
| `SERVER_USER`    | 服务器用户名，如 `ubuntu` 或 `root`           |
| `SERVER_SSH_KEY` | 本地的 `~/.ssh/id_rsa` 内容，复制进去（私钥） |

📌 将私钥粘贴时，注意格式完整，包括 `-----BEGIN RSA PRIVATE KEY-----` 到 `-----END RSA PRIVATE KEY-----`。

---

## 🧾 第四步：添加 GitHub Actions 自动部署脚本

在你的 Rspress 项目根目录中创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to Server

on:
  push:
    branches:
      - main  # 可改为你需要触发的分支

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

      - name: Build the project
        run: pnpm build

      - name: Copy dist to server
        uses: appleboy/scp-action@v0.1.3
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SERVER_SSH_KEY }}
          source: "dist/*"
          target: "/var/www"
```

---

## ✅ 第五步：提交触发部署

```bash
git add .
git commit -m "init deploy pipeline"
git push origin main
```

然后前往 GitHub 仓库 → Actions → 查看部署是否成功 ✅

---

## 📌 注意事项

- `dist` 是 Rspress 默认的构建产物目录，如果你配置了 `outDir`，请修改 `source` 路径
- `/var/www` 需要该用户有写权限。如果没有，可以将部署目录改为用户有权限的目录，比如 `/home/your_user/www`
- 如果希望部署后执行 `pm2 reload` 或其他脚本，可进一步使用 `appleboy/ssh-action`

---

你可以现在试试，遇到任何报错我可以帮你诊断。



## --提一些重要概念--

Rspress官方文档写的很详细，但一些容易疏忽的点

## 路由是自动生成的

【约定式路由】就是我们提前约定好按 文件路径映射到路由路径，自动生成路由

值得注意的是【组件路由】，其实就是写`.tsx`的react组件 和`.md`一样会被视为文章，生成路由

`foo.tsx`文件，`foo`被视为路径，内容中的`export default`导出会被视为页面内容

`export const frontmatter = {}` 可进行页面配置, 同 `.md` 中的 `Front Matter`

[约定式路由](https://rspress.dev/zh/guide/basic/conventional-route)

## 目录结构

## 为什么选择Rspress

1. 适配我的React技术栈

2. 可以学习 Rspack 和 Rsbuild

3. 文档非常友好
   
4. 全栈搜索功能性能强，UI高亮显示友好

5. 构建速度快

6. 大厂背书

借此可以慢慢完全掌控和理解项目，基于项目做一些新技术的尝试和练习

缺点: 可选扩展功能少，有问题需要自己翻源码，更新频繁