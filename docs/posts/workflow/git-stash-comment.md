---
title: Git Stash 注释工作流：本地保存、导出与跨电脑恢复
date: 2021-11-20 09:43:01
categories: 经验帖
tags:
    - Git
---

在阅读或接手新项目时，经常需要在代码中添加**大量理解性注释**。
但这些注释通常 **不能提交到仓库**，否则会污染代码历史。

一个非常实用的做法是：

> 使用 `git stash` 临时保存注释 → 导出为 patch → 换电脑或需要时再恢复。

## 完整操作流程

```bash
# 将当前所有修改（例如你写的阅读注释）保存到 stash 中
# -m 用来添加说明，方便后续识别
git stash push -m "reading-notes"

# 此时代码仓库是干净状态，可以正常开发或提交代码
git status

# 如果想在当前电脑恢复注释，可以重新应用 stash
git stash apply stash@{0}

# 如果不再需要 stash，可以删除该 stash（避免列表越来越多）
git stash drop stash@{0}

# ================================
# stash 导出及恢复流程
# ================================

# 将指定 stash 导出为 patch 文件（用于备份或跨电脑使用）
git stash show -p stash@{0} > reading-notes.patch

# 将之前导出的 patch 文件复制到仓库目录
# 然后执行下面命令恢复所有注释修改
git apply reading-notes.patch

# 查看恢复后的修改内容
git status

# 如果需要重新保存为 stash（继续使用 stash 工作流）
git stash push -m "reading-notes-restored"
```

## 优点

注释 随时脱离，随时恢复

不污染 Git提交历史, 不污染 远程仓库

patch 文件可以长期保存, 可以跨电脑使用
