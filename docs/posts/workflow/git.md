---
title: Git的使用
date: 2021-11-20 09:43:01
categories: 经验帖
tags: 
    - Git
---
A — B — C —— D —— E  当前指向B，git reset能指向D吗，git reset能快捷直接指向最后一个吗，也就是不需要知道E的hash。
git fetch 只拉当前代码和其他分支信息, 并不修改工作区代码, git merge origin/feature 才修改工作区代码?

## 本地相关----------------------------

add / commit / status / diff

## 远程仓库相关------------------------------

## git clone

`git clone xxx.git` 只有默认分支main，需要`fetch`才有其他分支

## git fetch

`git fetch` 把远程(origin) 所有被配置为可fetch的分支 所有commit 下载到本地的「远程跟踪分支」里
```sh
git branch -r
# origin/main
# origin/dev
# origin/feature/a
# origin/feature/b
```

常见指令
```sh
# 只 fetch dev 分支
git fetch origin dev
```

## git push 远程仓库唯一修改入口

`git push origin --delete feature` 删除远程分支

## git pull

`git pull`          = `git fetch` + `git merge origin/<当前分支>`

`git pull --rebase` = `git fetch` + `git rebase origin/<当前分支>`

本地开发的 feature分支 和 origin/feature分支 是两个分支

每次pull, 本质上都是一次 merge, 才修改了工作区代码

## 分支相关------------------------------

## git merge / git rebase

`git merge` 保留历史, 但产生分叉, 产生merge commit, 适合公共分支

```sh
git merge dev                # 将 dev 分支合并到当前分支（最常见）
git merge --no-ff dev        # 强制生成一次 merge commit（团队规范常用）
git merge --ff-only dev      # 只允许快进合并，防止意外产生 merge commit
git merge origin/dev         # 直接合并远程分支（不切本地分支）
git merge --abort            # 合并冲突时，放弃本次 merge
git merge --squash dev       # 将 dev 的提交压缩成一次提交再合并
```

> --no-ff 快进合并 fast-forward: 当main分支在拉出dev分支后没有新commit
> 此时 main中 merge dev, 不会产生merge commit, 且 main 分支中看不到 dev分支
> --squash 杂乱的个人开发分支合并主分支时使用, 产生类似rebase一样的线性效果

`git rebase` 整理历史，线性提交，适合个人分支
```sh
git rebase main              # 将当前分支变基到 main（最常见）
git rebase origin/main       # 直接基于远程 main 变基
git rebase -i main           # 交互式 rebase（改提交顺序 / 合并 / 修改 commit）
git rebase --continue        # 解决冲突后继续 rebase
git rebase --abort           # 放弃本次 rebase
git rebase --skip            # 跳过当前冲突提交
```

> 使用merge: commit已经提交到远程仓库
> 使用rebase: commit未提交到远程仓库


## git switch

`git switch dev` 切换分支
本地有 dev:                     切换到dev
本地没有 dev, 但有 origin/dev:   创建本地分支dev 并映射远程分支origin/dev
本地没有 dev, 也没有 origin/dev: 报错

```sh
# remote: origin/dev
# local:  不存在origin/dev
git switch dev
# fatal: invalid reference: dev
git fetch
# remote: origin/dev
# local: origin/dev
git switch dev
# OK
```
下面三个写法完全等价
```sh
git switch dev
git switch -c dev origin/dev
git checkout -b dev origin/dev
```

常见指令
```sh
git switch main              # 切换本地分支
git switch -                 # 切回上一个分支
git switch dev               # 从 origin/dev 自动创建并切换
git switch -c dev            # 基于当前分支创建 dev
git switch -c dev origin/dev # 从远程分支创建 dev
git switch -d origin/dev     # detached 查看远程分支
git switch -f main           # 强制切换（丢修改）
git switch --orphan gh-pages # 无历史分支
```

> switch / checkout 只操作本地引用，不做网络请求
> --orphan 常见用途：gh-pages / 独立发布分支
> --detached 常见用途: 查看远程分支代码 / 临时debug。禁止提交业务代码

## git branch

git branch 与 switch 功能分隔

本地已经有dev 也有 origin/dev 建立映射
```sh
# 在任意分支
git branch --set-upstream-to=origin/dev dev
# 在 dev 分支
git branch -u origin/dev
```

## 重置相关------------------------------

## git reset 回退,head指针修改

git reset 修改当前分支head指针,

`git reset --hard HEAD^`   回滚到上个版本
`git reset --hard HEAD^~2` 回滚到前两个版本
`git reset --hard xxx`     (版本号或版本号前几位),回滚到指定版本号,会自动匹配
`git reset --hard xxx filename`回滚某个文件到指定版本号(需要进入该文件所在目录)

如果用`git push`会报错,因为我们本地库HEAD指向的版本比远程库的要旧
`git push --force` 远程提交全丢失，与你本地完全同步。别人的之后的提交也全丢。
`git push --force-with-lease` 远程没人动过 → 推送成功
`git reset` 建议只修改本地 未提交过的commit head,这样`git push`就不报错

```sh
--soft 后悔commit:只修改head指针，不清空暂存区，不清空工作区
--mixed 后悔commit+add(默认):修改head指针，清空暂存区，不清空工作区
--hard 后悔commit+add+编码:修改head指针，清空暂存区，清空工作区
--merge 和--hard类似，只不过如果在执行reset命令之前你有改动一些文件并且未提交，merge会保留你的这些修改，hard则不会。【注：如果你的这些修改add过或commit过，merge和hard都将删除你的提交】
--keep 和--hard类似，执行reset之前改动文件如果是a分支修改了的，会提示你修改了相同的文件，不能合并。如果不是a分支修改的文件，会移除缓存区。git status还是可以看到保持了这些修改。
```

## git revert 回退,新建commit

新建一个回退了指定commit的修改的新commit.

比如产生了3个版本,想丢弃版本2的修改,并保留版本3的修改,

使用此方法,会生成版本4,此版本4由版本1和3的修改组成.

[git reset 和 git revert](https://juejin.cn/post/6844903614767448072)

## git log / git reflog

`git log`    打印当前分支可达的提交历史, reset、rebase后的引用一律看不到
`git log feature`       看其他分支的提交历史
`git log main..feature` 看feature分支比main多了哪些提交
`--all`      所有分支可达提交
`--oneline`  只包含版本号和记录描述
`--graph`    命令行模拟图表展示(好看一点点)
`-x`         查看最新的x个版本信息
`-x filename`查看某个文件filename最新的x个版本信息（需要进入该文件所在目录）
`git log --all --oneline --graph --decorate` 分支关系图

可以自定义git log的展示内容,以后用 `git lg` 就行(最推荐)
```sh
git config --global alias.lg "log --color --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%ci) %C(bold blue)<%an>%Creset' --abbrev-commit --"
git mylog
# 效果(带颜色):* 16c8eff - init (2021-11-03 21:01:24 +0800) <Your Name>
# ci换成cr则提交日期，按多久以前的方式显示 例如：1 day ago
# 删除别名配置: git config --global --unset alias.lg
```

`git reflog` 打印指针的移动历史
```txt
HEAD@{0}: reset: moving to B
HEAD@{1}: commit: D
HEAD@{2}: commit: C
```
> git reflog 只存在本地，默认保存90天。
> git gc     垃圾回收, 物理彻底删除没有引用的 commit blob tree










## git checkout 切换版本

`git checkout <commit号>` 本地跳到指定版本

`git switch main` 回到原来的分支

这样就可以自由查看某一个版本的代码了，这种方法正是我要找的。

新语法: switch 代替 checkout, master 代替main



## git switch 拉取远程新分支

```bash
# 更新远程分支列表
git fetch
# 查看所有分支名
git branch -a
# 输出分支
*   main # 当前本地分支
    feature/old # 本地分支
    remotes/origin/main # 远程分支
    remotes/origin/feature/login # 远程新分支（你要的）
# 新建并自动切换到本地分支xxx,并和远程分支建立映射关系
git switch -c feature/login origin/feature/login
```

`git branch` 查看本地分支
`git branch -r` 查看所有远程分支
`git branch -a` 查看所有远程和本地分支
`git branch -vv` 查看本地分支和远程分支的映射关系

`git branch -D xxx` 删除本地分支
`git push origin --delete xxx` 删除远程分支

`git switch -c xxx origin/xxx` (新)新建并自动切换到本地分支xxx,并和远程分支建立映射关系
`git checkout -b xxx origin/xxx` (旧)新建并自动切换到本地分支xxx,并和远程分支建立映射关系

`origin`为git地址的标志
`origin = https://github.com/xxx/xxx.git`

## git 冲突

```txt
<<<<<< HEAD
本地当前分支的代码
=======
来自另外一个分支 / 远程分支的代码
>>>>>>> origin/main
```

## git reset --hard 丢弃本地所有修改

## git commit -m ‘提交信息’ 写错了

`git commit --amend -m "新的修改提交信息"`

注意，仅仅只能针对最后一次提交

[git fetch VS pull](https://juejin.cn/post/6844903921794859021)

## 碰到一个问题写一个
