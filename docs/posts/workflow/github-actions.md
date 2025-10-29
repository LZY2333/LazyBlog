---
title: GitHub Actions 与 CI/CD 自动部署实战
date: 2025-05-19 09:21:35
---

# 一、什么是 CI/CD

## 1. CI：持续集成（Continuous Integration）

持续集成指开发者频繁地（如每天多次）将代码合并到主分支，并自动触发：

拉取代码 安装依赖 测试 构建

**目的**：快速发现问题，保证主分支处于“可部署状态”。

## 2. CD：持续交付 / 持续部署（Continuous Delivery / Deployment）

- **持续交付**：构建成功后自动部署到测试环境，由质量团队手动部署到生产环境。

- **持续部署**：构建成功后，自动化完成测试，自动部署到生产环境。


# 二、GitHub Actions：GitHub 的 CI/CD 自动化引擎

## 1. GitHub Actions 是什么？

GitHub Actions 是 GitHub 提供的原生 CI/CD 工具，支持在如下事件触发自动执行脚本：

- `push`  
- `pull_request`  
- `schedule`（定时任务）  
- `workflow_dispatch`（手动触发）

**核心组成**：

- `.github/workflows/*.yml`：工作流定义文件  
- Job：定义每个阶段  
- Step：Job 内的每一步命令  

## 2. 与 Git 和 GitHub 的关系

- **Git 是版本控制工具**，本身不包含自动部署能力  
- **GitHub 是托管平台**，GitHub Actions 是其增值功能  
- 使用 Gitea/GitLab 等自托管方案时需额外部署 CI 工具（如 Jenkins、Drone）  

## 3. GitHub Actions 的优势

- 无需额外服务器，使用 GitHub 就能自动部署  
- 开源生态丰富，社区共享 Actions 丰富  
- 免费额度充足，适合中小团队和个人项目  
- 可接入自托管 Runner，控制执行环境  

---

# 三、主流 Git 托管平台对比与适用场景

| 平台名        | 官网                  | 私有部署支持    | CI/CD 工具          | 优势特点                              | 推荐场景              |
| ------------- | --------------------- | --------------- | ------------------- | ------------------------------------- | --------------------- |
| GitHub        | https://github.com    | 否              | GitHub Actions      | 全球主流，生态丰富，适合开源项目      | 开源 / 全球协作项目   |
| GitLab        | https://gitlab.com    | 是（GitLab CE） | GitLab CI/CD        | 企业级功能强大，适合私有部署          | 企业 / 自建 DevOps    |
| Gitee（码云） | https://gitee.com     | 否（企业版有）  | Gitee Go / Jenkins  | 国内访问快，适合政务项目              | 国内团队 / 政府采购类 |
| Bitbucket     | https://bitbucket.org | 否              | Bitbucket Pipelines | Atlassian 生态集成（Jira/Trello）     | 企业项目              |
| Gitea         | https://gitea.com     | 是              | Drone CI / Webhook  | 开源、轻量，自部署简单，CI 可自由搭配 | 小团队 / 内网项目     |

---

# 四、实际案例：Gitee + Jenkins + DevOps 实现自动部署流程

## 1. 架构组件职责分工

| 组件       | 职责              | 说明                               |
| ---------- | ----------------- | ---------------------------------- |
| Gitee      | 源码托管          | 提交/管理代码，触发 Webhook        |
| DevOps平台 | Web UI + 流程编排 | 设置触发条件、流水线流程、权限控制 |
| Jenkins    | CI/CD 引擎        | 拉取代码、构建、测试、部署         |

## 2. 自动部署流程（示例：Node 项目构建部署）

开发者提交代码(Gitee)  
DevOps 平台监听代码变更（Webhook）  
DevOps 触发 Jenkins Job  
Jenkins 执行 拉取代码 安装依赖 测试 构建 部署

## 3. 常用工具部署说明

### Gitee

- 使用 SaaS 版或私有部署企业版  
- 配置 Webhook，连接 DevOps 或 Jenkins  

### DevOps 平台

- 使用 Gitee 内置 DevOps 或自建平台（如蓝鲸）  
- 配置流水线、触发条件和阶段流程  

### Jenkins

- 使用 `.war` 文件或 Docker 安装  
- 安装插件（如 Git、Pipeline、SSH）  
- 定义 Jenkinsfile 实现流水线任务  

## 4. 可选替代方案

| 目标需求        | 推荐组合                |
| --------------- | ----------------------- |
| 开源协作项目    | GitHub + GitHub Actions |
| 企业私有部署    | GitLab CE + GitLab CI   |
| 小团队轻量部署  | Gitea + Drone CI        |
| 流程复杂 + 内网 | GitLab + Jenkins        |
| 云原生架构      | Git + Tekton / Argo CD  |
