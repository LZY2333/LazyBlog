// OverviewGeneratorPlugin V3
// 用于 Rspress，在 dev 和 build 阶段为 docs/ 下一级目录生成 overview 页面（index.md）和 _meta.json 文件
// 排除 drafts 和 public 文件夹，仅处理一级目录

import fs from 'fs/promises'; // 引入文件系统模块，异步方式读写文件
import path from 'path'; // 引入 path 模块，用于路径处理
import matter from 'gray-matter'; // 引入 gray-matter，用于解析 Markdown 的 frontmatter
import type { Plugin } from '@rspack/core'; // 使用 Rspack 插件类型定义

interface PluginOptions {
    docsPath: string; // 文档根目录路径
}

interface MetaItem {
    type: 'file' | 'dir'; // 类型为文件或目录
    name: string; // 不包含扩展名的名称
    label?: string;
}

export class OverviewGeneratorPlugin {
    name = 'overview-generator-plugin'; // 插件名称
    docsPath: string; // 文档路径

    constructor(options: PluginOptions) {
        this.docsPath = options.docsPath; // 设置文档路径
    }

    apply(compiler: any) {
        // 绑定 initialize 钩子，在 dev 或 build 启动时执行一次
        compiler.hooks.initialize.tap(this.name, () => {
            // 启动时触发生成逻辑
            generateOverview(this.docsPath)
                .then(() => { })
                .catch((err) => {
                    console.error('[overview-generator] 初始化失败', err); // 错误日志
                });
        });
    }
}

// 主函数：为 docsPath 下的每个一级子目录生成 index.md 和 _meta.json
async function generateOverview(docsPath: string) {
    const entries = await fs.readdir(docsPath, { withFileTypes: true }); // 读取 docs 下所有项
    for (const entry of entries) {
        if (!entry.isDirectory()) continue; // 跳过非目录
        if (['drafts', 'public'].includes(entry.name)) continue; // 跳过 drafts 和 public

        const folderPath = path.join(docsPath, entry.name); // 构建子目录完整路径
        await ensureIndexMd(folderPath); // 生成或补全 index.md
        await generateMetaJson(folderPath); // 生成 _meta.json
    }
}

// 确保目录下存在 index.md，并具有 overview 和 title 属性
async function ensureIndexMd(folderPath: string) {
    const indexPath = path.join(folderPath, 'index.md'); // 拼接 index.md 路径
    try {
        const content = await fs.readFile(indexPath, 'utf-8'); // 尝试读取 index.md
        const parsed = matter(content); // 解析 frontmatter
        const data = parsed.data || {}; // 获取已有 frontmatter

        if (data.overview && data.title) return; // 若已有所需字段则跳过

        const newData = {
            ...data,
            overview: true, // 添加 overview
            title: 'Overview', // 添加 title
        };
        const newContent = matter.stringify(parsed.content.trimEnd(), newData); // 重新拼接内容
        await fs.writeFile(indexPath, newContent.trimEnd(), 'utf-8'); // 写入 index.md
    } catch {
        const content = matter.stringify('', {
            overview: true, // 新建文件时添加 overview
            title: 'Overview', // 添加 title
        });
        await fs.writeFile(indexPath, content, 'utf-8'); // 写入新 index.md
    }
}

// 生成 _meta.json 文件，包含 index 及其余子文件/文件夹
async function generateMetaJson(folderPath: string) {
    const entries = await fs.readdir(folderPath, { withFileTypes: true }); // 读取当前目录项
    const meta: MetaItem[] = [
        {
            type: 'file', // index 为文件类型
            name: 'index', // 名为 index
            label: 'Overview'
        },
    ];

    for (const entry of entries) {
        const ext = path.extname(entry.name); // 获取扩展名
        const baseName = path.parse(entry.name).name; // 获取不带扩展名的名称

        if (entry.name.startsWith('_') || baseName === 'index') continue; // 跳过 index 和 _meta

        if (entry.isFile() && (ext === '.md' || ext === '.mdx')) {
            meta.push({ type: 'file', name: baseName }); // 添加 Markdown 文件项
        } else if (entry.isDirectory()) {
            meta.push({ type: 'dir', name: entry.name }); // 添加目录项
        }
    }

    const metaPath = path.join(folderPath, '_meta.json'); // 拼接 meta 路径
    await fs.writeFile(metaPath, JSON.stringify(meta, null, 2), 'utf-8'); // 写入 _meta.json
    // console.log(`[overview-generator] 生成: ${path.relative(process.cwd(), metaPath)}`); // 打印日志
}