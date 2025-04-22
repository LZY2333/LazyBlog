// FrontMatterCountPlugin V2（输出路径统一为 Rspress 的 outputDir）
// 用于统计 Rspress 项目中所有 Markdown 和 TSX 文件的 frontmatter
// 输出 frontMatter.json、tags.json、categories.json

import fs from 'fs/promises'; // 引入文件系统模块，用于异步读写文件
import path from 'path'; // 引入路径模块，用于处理文件路径
import matter from 'gray-matter'; // 引入 gray-matter 用于解析 Markdown frontmatter
import { pathToFileURL } from 'url'; // 将文件路径转换为 file:// URL
import type { Plugin } from '@rspack/core'; // 引入插件类型定义

interface PluginOptions {
    docsPath: string; // 文档目录路径
}

export class FrontMatterCountPlugin {
    name = 'frontmatter-count-plugin'; // 插件名称
    docsPath: string; // 文档目录

    constructor(options: PluginOptions) {
        this.docsPath = options.docsPath; // 设置文档目录
    }

    apply(compiler: any) {
        compiler.hooks.thisCompilation.tap(this.name, async (compilation: any) => {
            const outputPath = compiler.options.output.path; // 使用 Rspack 的 output 路径作为 JSON 输出目录

            const frontmatters: Record<string, any> = {}; // 存储所有 frontmatter 数据
            const tagsMap: Record<string, string[]> = {}; // 存储 tags 的文章索引
            const categoriesMap: Record<string, string[]> = {}; // 存储 categories 的文章索引

            await this.walkAndParse(this.docsPath, frontmatters, tagsMap, categoriesMap); // 遍历并处理所有文件

            await Promise.all([
                this.writeJson(path.join(outputPath, 'frontMatter.json'), frontmatters), // 写入 frontmatter 数据
                this.writeJson(path.join(outputPath, 'tags.json'), tagsMap), // 写入 tag 索引
                this.writeJson(path.join(outputPath, 'categories.json'), categoriesMap), // 写入分类索引
            ]);
        });
    }

    private async walkAndParse(
        dir: string,
        frontmatters: Record<string, any>,
        tagsMap: Record<string, string[]>,
        categoriesMap: Record<string, string[]>
    ) {
        const entries = await fs.readdir(dir, { withFileTypes: true }); // 读取目录中的所有文件和子目录
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name); // 获取完整路径
            if (entry.isDirectory()) {
                await this.walkAndParse(fullPath, frontmatters, tagsMap, categoriesMap); // 递归处理子目录
            } else if (entry.name.endsWith('.md') || entry.name.endsWith('.tsx')) {
                const relativePath = path.relative(this.docsPath, fullPath); // 获取相对路径
                const key = relativePath.replace(/\\/g, '/'); // 标准化为 POSIX 路径
                const data = await this.extractFrontmatterFromFile(fullPath); // 提取 frontmatter
                if (!data) continue; // 无效 frontmatter 则跳过

                frontmatters[key] = data; // 存储 frontmatter 数据

                const tags = this.normalizeToArray(data.tags); // 提取 tag 数组
                for (const tag of tags) {
                    tagsMap[tag] = tagsMap[tag] || []; // 初始化标签数组
                    tagsMap[tag].push(key); // 添加文章到标签索引
                }

                const categories = this.normalizeToArray(data.categories); // 提取分类数组
                for (const cat of categories) {
                    categoriesMap[cat] = categoriesMap[cat] || []; // 初始化分类数组
                    categoriesMap[cat].push(key); // 添加文章到分类索引
                }
            }
        }
    }

    private async extractFrontmatterFromFile(filePath: string): Promise<any | null> {
        if (filePath.endsWith('.md')) {
            const content = await fs.readFile(filePath, 'utf-8'); // 读取 Markdown 文件内容
            return matter(content).data; // 解析并返回 frontmatter
        } else if (filePath.endsWith('.tsx')) {
            try {
                const mod = await import(pathToFileURL(filePath).href); // 动态引入 TSX 文件
                return mod.frontmatter || null; // 返回 frontmatter 属性
            } catch {
                return null; // 加载失败时返回 null
            }
        }
        return null; // 不支持的文件类型返回 null
    }

    private normalizeToArray(input: any): string[] {
        if (!input) return []; // 空输入返回空数组
        return Array.isArray(input) ? input : [input]; // 非数组统一转为数组
    }

    private async writeJson(filePath: string, data: any) {
        await fs.mkdir(path.dirname(filePath), { recursive: true }); // 确保目录存在
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8'); // 写入 JSON 文件
    }
}
