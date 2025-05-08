---
title: GitHub远程仓库连接配置
---

**无废话，GitHub远程仓库连接配置全流程及bug速通**

本文包含: 连接github远程仓库可能所需的

**SSH Key配置** **443端口配置** **hosts配置** **git本地用户信息配置** **npm镜像源配置** 全流程

## 0. 检查是否已有 SSH Key

`ls ~/.ssh` 已存在则会看见输出内存在 `id_rsa` `id_rsa.pub`

## 1.生成 SSH Key

`ssh-keygen -t rsa -b 4096 -C "your_email@example.com"` 一路按回车

## 2.复制公钥内容

`cat ~/.ssh/id_rsa.pub` 复制输出，即为公钥内容

也可在 `C:\Users\当前用户名\.ssh` 找到`id_rsa.pub`文件，记事本打开复制所有内容

## 3.添加 SSH Key 到 Git 平台

右上角 头像 → Settings → 左侧 SSH and GPG keys

Title 随便填, Key 粘贴刚才复制的 `id_rsa.pub` 内容

## 4. 测试是否成功连接

`ssh -T git@github.com` 看见 `Hi` 开头， 圆满成功！

首次连接会提示是否信任主机，输入 yes 即可。



## 下面是可能碰见的问题

## `git pull`报错(连接github 22端口报错),修改端口

`ssh: connect to host github.com port 22: Connection refused`

原因: 你的计算机无法通过 SSH 协议（默认端口 22）连接到 github.com，这可能是 WIFI VPN 运营商 等在搞事情。

解决: GitHub 提供了备用端口 443 ，修改 SSH 服务配置，改为请求 443端口.

首先，找到 `C:\Users\你的用户名\.ssh` 创建 `config.txt`, 记事本打开

最后，复制粘贴以下内容，保存后，修改文件后缀删除`.txt`，使文件名变为 `config`，解决！

```ssh
Host github.com
  HostName ssh.github.com
  Port 443
  User git
```

## `git pull`报错(连接github 443端口也报错),修改hosts

现象: 当你通过上一节方案依旧无法连接github，且产生了以下报错

`ssh: connect to host ssh.github.com port 443: Connection refused`

说明问题并不是22端口被封禁，那么可能遇到了 **DNS 污染/劫持**，常见于VPN用户

`ssh -vT git@github.com` 为证明该场景请测试该语句，如果获得以下类似输出，即为此场景

```bash
OpenSSH_for_Windows_9.5p1, LibreSSL 3.8.2
debug1: Reading configuration data C:\\Users\\11143/.ssh/config
debug1: C:\\Users\\11143/.ssh/config line 1: Applying options for github.com
debug1: Connecting to ssh.github.com [::1] port 443.
debug1: connect to address ::1 port 443: Connection refused
debug1: Connecting to ssh.github.com [127.0.0.1] port 443.
debug1: connect to address 127.0.0.1 port 443: Connection refused
ssh: connect to host ssh.github.com port 443: Connection refused
```

`ping github.com` 或ping一下，如果获得以下类似输出，即为此场景

```bash
正在 Ping github.com [::1] 具有 32 字节的数据:
来自 ::1 的回复: 时间<1ms
来自 ::1 的回复: 时间<1ms
来自 ::1 的回复: 时间<1ms
来自 ::1 的回复: 时间<1ms
```

**解决方案**: **修改hosts**

- `C:\Windows\System32\drivers\etc` 路径，找到host文件 打开

- `140.82.113.4 github.com` 复制粘贴保存

- `ipconfig /flushdns` 清除DNS缓存

- `ping github.com` 再次ping，显示正常收到数据包，到这步已解决DNS问题！

- `ssh -T git@github.com` 最后检查SSH链接

- 如果报错 `443: Connection refused` 代表443端口被禁用，则删除上一节的配置文件

- 如果报错 `22: Connection refused` 代表22端口被禁用，则使用上一节的配置文件

解决！

## `git commit`报错

如果你看到类似以下报错, 按照提示运行那两行config代码就行, 双引号内内容改成自己的

```bash
*** Please tell me who you are.

Run

  git config --global user.email "you@example.com"
  git config --global user.name "Your Name"

to set your account's default identity.
Omit --global to set the identity only in this repository.

fatal: unable to auto-detect email address
```

## `npm install` 下载时速度慢

使用nrm设置taobao镜像源

`npm install -g nrm`

`nrm use taobao`

## 后续遇见其他问题待更新

经常装机/重装系统，拉取github项目出问题有印象却总不记得具体指令。

这次记录下来，以后一文速通。
