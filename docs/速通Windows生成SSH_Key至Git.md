---
title: 速通Windows生成SSH_Key至Git
---

很常见的知识点了，但是每次用都得查一次。记录一下，供自己以后速查。

## 0. 检查是否已有 SSH Key

```sh
ls ~/.ssh
```

如果有的话会输出 `id_rsa` `id_rsa.pub`两个文件名

## 1.生成 SSH Key

```sh
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
```

一路回车就行

## 2.复制公钥内容

```sh
cat ~/.ssh/id_rsa.pub
```

输出即为公钥内容, 当然也能在 `C:\Users\当前用户名\.ssh` 内找到该文件邮件记事本打开找到该段内容

## 3.添加 SSH Key 到 Git 平台

右上角 头像 → Settings → 左侧 SSH and GPG keys

Title 随便填, Key 粘贴刚才复制的 id_rsa.pub 内容

## 4. 测试是否成功连接

```sh
ssh -T git@github.com
```

首次连接会提示是否信任主机，输入 yes 即可。

看见 `Hi` 开头的一句话时，代表已经成功可以拉取代码了
