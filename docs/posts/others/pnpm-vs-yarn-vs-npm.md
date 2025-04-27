# pnpm vs yarn vs npm：包管理工具三强对比

在rspress开发静态博客时，我一开始选择了 npm 后面选择了pnpm

我发现写插件时，基于npm的rspress 和 基于pnpm安装的rspress 表现不同

rspress中内置了 react 和  gray-matter 以及 @rspack/core

npm 不会报错， pnpm却会报错


为什么不需要在 dependencies 中添加？
因为：

rspress 内置依赖：
rspress 会自动在其内置的依赖中加载 react、gray-matter、@rspack/core，你不需要在 dependencies 中再次声明。这样可以避免依赖的冗余和版本冲突。

devDependencies 是开发所需：
在开发环境中，devDependencies 会被安装，保证开发时能使用这些包，而生产环境不会包含这些包。

# Rspress 插件开发中 npm 和 pnpm 表现不同的原因与解决办法

在使用 Rspress 开发静态博客时，如果一开始选择了 npm，后来切换到了 pnpm，会发现插件开发时表现不同：

- 基于 npm 安装的 Rspress，插件开发引用 react、gray-matter、@rspack/core 时不会报错。
- 基于 pnpm 安装的 Rspress，插件开发时却会报错，提示找不到模块或者模块未安装。

## 为什么会这样？

这是因为 npm 和 pnpm 的包安装机制本质不同：

| 特性 | npm / yarn | pnpm |
|:----|:-----------|:-----|
| 目录结构 | 扁平化安装到 node_modules 顶层 | 严格隔离，使用硬链接 |
| 找模块方式 | 宽松，只要找到就行 | 严格，必须明确依赖或被 hoist |

在 npm 项目中，即使插件本身没有声明依赖，也可能因为扁平化的 node_modules 结构而“误打误撞”找到需要的模块。而在 pnpm 中，node_modules 是严格隔离的映射结构，如果插件没有明确声明依赖，就无法访问这些模块，从而导致报错。

## 具体到 Rspress 插件开发

Rspress 项目自身依赖了 react、gray-matter、@rspack/core，但插件本身并未直接声明这些依赖。

- 在 npm 环境下，插件可以通过扁平化 node_modules 结构访问到这些依赖，因此不会报错。
- 在 pnpm 环境下，插件必须自己声明依赖，否则无法访问到这些模块，因此会报错。

## 解决方案

### 方案 1：在插件中添加 peerDependencies

在插件的 `package.json` 中添加 peerDependencies，声明需要由宿主项目提供的依赖，例如：

```json
{
  "peerDependencies": {
    "react": "*",
    "gray-matter": "*",
    "@rspack/core": "*"
  }
}

这样做的好处是：

插件本身不安装这些依赖。

宿主项目（使用插件的项目）需要安装这些依赖。

适合发布到 npm 并供多个项目复用的插件。

在插件开发时，只需要确保宿主项目（即 Rspress 项目）安装了这些包即可。

方案 2：在本地开发时手动安装 devDependencies
如果插件仅在本地使用，不打算发布，可以简单粗暴地在插件目录安装需要的依赖作为开发依赖：


```bash
pnpm add react gray-matter @rspack/core -D
```

这样可以快速解决开发时报错的问题，但严格来说不够规范。

适合内部项目开发或者短期开发使用。

小结
pnpm 的模块隔离机制更严格，插件开发时必须显式声明依赖关系。

可以通过添加 peerDependencies 的方式来规范地声明需要的外部依赖。

如果只是本地开发测试，可以临时在插件项目中添加 devDependencies。















随着前端生态的发展，包管理工具从早期的 npm 一统天下，逐渐演变出 Yarn 和 pnpm 等更高效的替代品。本文从**本质区别**、**优劣对比**、**使用方式差异**三个方面全面分析这三款主流工具，帮助你选择最适合项目的依赖管理方案。

---

## 1. 本质区别

| 特性 | npm | yarn | pnpm |
|------|-----|------|------|
| 存储结构 | 多层嵌套 | 多层嵌套（改善依赖冲突） | 内容寻址，全局 store + 硬链接 |
| 安装机制 | 顺序安装 | 并行安装 | 并行 + 去重 + 链接 |
| 锁文件名 | `package-lock.json` | `yarn.lock` | `pnpm-lock.yaml` |
| 工作区支持 | v7+ 支持（原生） | 原生支持 | 原生支持（更强） |
| 依赖提升（hoist） | 默认自动提升 | 可配置 | 默认隔离，支持配置提升 |

### 🧠 关键词解释

- **内容寻址**：pnpm 把依赖下载到全局 store 中，通过内容 hash 唯一标识，同一版本只下载一次。
- **硬链接**：pnpm 在项目中并不会真正复制依赖，而是创建指向 store 的链接，节省磁盘空间。

---

## 2. 优劣分析

| 对比项 | npm | yarn | pnpm |
|--------|-----|------|------|
| 安装速度 | 较慢 | 较快 | 非常快（缓存复用 + 去重） |
| 磁盘空间 | 占用较多 | 中等 | 最小（单版本仅存一份） |
| 依赖一致性 | 锁文件保障一致 | 锁文件保障一致 | 锁文件 + 严格隔离更稳定 |
| 使用体验 | 社区广泛 | UI 更友好，Monorepo 友好 | 命令简单，默认最佳实践 |
| 学习曲线 | 最低 | 低 | 略高（store、link 概念） |

### ✅ 推荐场景

- **npm**：适合入门、小项目、无需 Monorepo。
- **Yarn**：适合注重构建稳定性、大型项目（Yarn 1 或 Yarn Berry）。
- **pnpm**：适合现代大型项目、Monorepo 架构、对依赖管理要求高的团队。

---

## 3. 使用方式区别

### 📦 安装依赖命令

| 操作 | npm | yarn | pnpm |
|------|-----|------|------|
| 安装所有依赖 | `npm install` | `yarn install` | `pnpm install` |
| 添加依赖 | `npm install react` | `yarn add react` | `pnpm add react` |
| 添加 dev 依赖 | `npm install -D typescript` | `yarn add -D typescript` | `pnpm add -D typescript` |
| 删除依赖 | `npm uninstall lodash` | `yarn remove lodash` | `pnpm remove lodash` |
| 全局安装 | `npm install -g vite` | `yarn global add vite` | `pnpm add -g vite` |

### ⚙️ 项目结构差异（node_modules）

- **npm / yarn**：
  - `node_modules/` 下多层嵌套
  - 不同包可能各自引入多个 `react` 副本

- **pnpm**：
  - 所有包统一存放在 `.pnpm-store`，通过硬链接引用
  - 默认不会自动提升依赖（更隔离、更可控）

### 📁 示例结构（pnpm）

```text
my-project/
├── node_modules/
│   ├── react → .pnpm/react@18.2.0/node_modules/react
│   ├── rspress/
│   │   └── node_modules/
│   │       └── react → .pnpm/react@18.2.0/node_modules/react
└── pnpm-lock.yaml
```

> ✅ 同一个 `react@18.2.0` 实际只下载一次，多个地方共用。

---

## 📌 总结

| 选择建议 | 使用场景 |
|----------|----------|
| **npm** | 初学者、小项目、快速原型开发 |
| **yarn** | 稳定构建、已有 Yarn 生态或 v1 项目 |
| **pnpm** | 大型项目、Monorepo、极致性能需求 |

👉 **结论**：pnpm 在速度、空间、依赖一致性方面全面领先，越来越多现代框架（如 Vite、Rspack、Rspress）也都推荐使用 pnpm。

---

🧭 最后建议：如果你追求构建性能、依赖准确性和团队协作一致性，**pnpm 是当前最优解**。
