---
title: Git 分支原理
date: 2026-02-26
categories: 经验帖
tags:
  - Git
---

## 一、commit 是什么

Git 存储的核心单位是 **commit 对象**，每个 commit 包含：

- 一个唯一的 hash（如 `b8a0b15`）
- 指向父 commit 的指针
- 本次快照的文件树

```
commit b8a0b15
parent abe2f2a
tree   3f4c8d1
author ...
```

> **关键**：commit 一旦写入就永不改变，删除分支不会删除 commit。

---

## 二、分支的本质

分支只是一个**指向某个 commit 的指针**，本质是 `.git/refs/heads/` 下的一个文本文件：

```bash
$ cat .git/refs/heads/master
b8a0b1520a...   # 只是一行 hash
```

```
A ← B ← C
         ↑
       master   ← 只是一个指针
```

创建分支极其廉价，仅新建一个文件。

---

## 三、HEAD 指针

`HEAD` 是"你当前在哪"的指针，通常指向当前分支：

```bash
$ cat .git/HEAD
ref: refs/heads/master
```

```
A ← B ← C
         ↑
       master
         ↑
        HEAD
```

切换分支时，HEAD 跟着移动：

```bash
git checkout feature
```

```
A ← B ← C ← D ← E
         ↑         ↑
       master    feature
                   ↑
                  HEAD
```

---

## 四、Git 历史是 DAG，不是树

普通 commit 只有一个父节点，看起来像一条线。
但 **merge commit 有两个父节点**，所以 git 历史是**有向无环图（DAG）**。

```
# merge 之前
A ← B ← C          ← master
         ↖
          D ← E    ← feature

# merge 之后
A ← B ← C ← M     ← master
              ↙
         D ← E
```

M 同时记录了 C 和 E 作为父节点，两条线的历史都完整保留。

**三种 commit 形态：**

| 类型 | 父节点数 | 场景 |
|------|---------|------|
| root commit | 0 | 仓库第一个 commit |
| 普通 commit | 1 | 日常开发 |
| merge commit | 2+ | 分支合并 |

---

## 五、标准分支操作

```bash
# 查看所有分支（本地 + 远端）
git branch -a

# 创建并切换分支
git checkout -b feature/xxx
# 或（新语法）
git switch -c feature/xxx

# 推送到远端
git push origin feature/xxx

# 合并分支（在 master 上执行）
git merge feature/xxx

# 删除本地分支
git branch -d feature/xxx

# 删除远端分支
git push origin --delete feature/xxx
```

---

## 六、删除分支不丢数据

```
删除前：
A ← B ← C ← M    ← master
              ↙
         D ← E    ← feature/xxx（指针）

删除 feature/xxx 指针后：
A ← B ← C ← M    ← master
              ↙
         D ← E    ← commit 对象仍然存在
```

从 master 顺着 M 的父节点链，仍能追溯到 D、E 的完整历史。

> **分支是标签，commit 是数据。删标签不删数据。**

---

## 七、三种合并策略

**Fast-forward（无 merge commit）**

条件：目标分支是源分支的直接祖先。

```bash
git merge feature          # 默认
git merge --ff-only feature  # 强制要求 ff
```

```
前：A ← B ← C ← D ← E
             ↑         ↑
           master    feature

后：A ← B ← C ← D ← E
                       ↑
                 master（直接移动指针）
```

**Merge commit（保留分叉历史）**

```bash
git merge --no-ff feature
```

```
A ← B ← C ← M
              ↙
         D ← E
```

**Rebase（变基，线性历史）**

```bash
git rebase master
```

```
前：A ← B ← C        ← master
         ↖
          D ← E      ← feature

后：A ← B ← C ← D' ← E'   ← feature（重新应用在 C 之后）
             ↑
           master
```

D'、E' 是内容相同但 hash 不同的新 commit。

> **Rebase 会改写历史，已推送的分支不要 rebase。**

---

## 八、常用查看命令

```bash
# 图形化查看分支历史
git log --oneline --graph --all

# 查看某次 merge commit 的两个父节点
git show M --format="%P"

# 比较两个分支差异
git diff master..feature

# 找到分支分叉点
git merge-base master feature
```

示例输出：

```
* b8a0b15 fix: 修复底部导航重复跳转
* abe2f2a fix: 代码逻辑优化
| * 3f4c8d1 feat: 新功能
|/
* 07f3775 chore: 初始化
```
