import fs from 'fs/promises'; // 引入文件系统模块，用于异步读写文件
import path from 'path'; // 引入路径模块，用于处理文件路径
import { pathToFileURL } from 'url'; // 将文件路径转换为 file:// URL
import matter from 'gray-matter'; // 引入 gray-matter 用于解析 Markdown frontmatter
import { constants } from 'fs'; // 引入 fs 常量，用于访问文件系统
import type { Compiler } from '@rspack/core';

interface MetaItem {
    type: 'file' | 'dir';
    name: string;
    label: string;
}

export class OverviewGeneratePlugin {
    private readonly name = 'generate-overview-pages-plugin';
    private readonly postsDir: string;
    private isFirstRun = true;

    constructor(postsDir = 'posts') {
        this.postsDir = postsDir;
    }

    apply(compiler: Compiler) {
        compiler.hooks.initialize.tap(this.name, async () => {
            await this.generateOverviewPages();
        });
    }

    private async generateOverviewPages() {
        console.log('正在生成 Overview 页面...');

        // 获取 Rspress 配置
        const configPath = path.resolve(process.cwd(), 'rspress.config.ts');
        const configModule = await import(pathToFileURL(configPath).href);
        const siteConfig = configModule.default || {};
        const rootDir = siteConfig.root || path.resolve(process.cwd(), 'docs');
        const postsPath = path.join(rootDir, this.postsDir);

        // 读取并过滤子目录
        const entries = await fs.readdir(postsPath, { withFileTypes: true });
        const subDirs = entries
            .filter(entry => entry.isDirectory())
            .map(entry => entry.name);

        // 为每一个子文件夹，在根目录创建Overview
        await Promise.all(
            subDirs.map(dirName => this.processSubDir(postsPath, dirName))
        );

        // 更新根目录的 _meta.json
        await this.updateMetaJson(postsPath, subDirs);

        // 为每一个子文件夹，更新其下的 _meta.json
        await Promise.all(
            subDirs.map(dirName => this.updateSubDirMetaJson(postsPath, dirName))
        );
    }

    private async processSubDir(postsPath: string, dirName: string) {
        const overviewPath = path.join(postsPath, `${dirName}.md`);

        try {
            await fs.access(overviewPath, constants.F_OK);
            const rawContent = await fs.readFile(overviewPath, 'utf-8');
            const parsedContent = matter(rawContent);

            if (parsedContent.data.overview === true) return;

            parsedContent.data.overview = true;
            const updatedContent = matter.stringify(parsedContent.content, parsedContent.data);
            await fs.writeFile(overviewPath, updatedContent.trimEnd(), 'utf-8');
        } catch {
            // 文件不存在，创建新的概览页
            const newContent = matter.stringify('', { overview: true });
            await fs.writeFile(overviewPath, newContent.trimEnd(), 'utf-8');
        }
    }

    private async updateMetaJson(postsPath: string, subDirs: string[]) {
        const metaJsonPath = path.join(postsPath, '_meta.json');
        let metaItems: MetaItem[] = [];

        // 读取 _meta.json
        metaItems = await fs.readFile(metaJsonPath, 'utf-8')
            .then(rawMeta => JSON.parse(rawMeta))
            .catch(() => []);

        // 确保 Overview 始终在第一位
        if (!metaItems.length || metaItems[0]?.name !== 'index') {
            metaItems.unshift({
                type: 'file',
                name: 'index',
                label: 'Overview'
            });
        }

        const existingNames = new Set(metaItems.map(item => item.name));

        // 添加新的目录项
        const newItems = subDirs
            .filter(dirName => !existingNames.has(dirName))
            .map(dirName => ({
                type: 'dir' as const,
                name: dirName,
                label: dirName.charAt(0).toUpperCase() + dirName.slice(1)
            }));

        metaItems.push(...newItems);

        // 过滤掉不存在的目录
        metaItems = metaItems.filter(item =>
            item.label === 'Overview' || subDirs.includes(item.name)
        );

        // 确保目录存在并写入文件
        await fs.mkdir(path.dirname(metaJsonPath), { recursive: true });
        await fs.writeFile(metaJsonPath, JSON.stringify(metaItems, null, 4), 'utf-8');
    }

    private async updateSubDirMetaJson(postsPath: string, dirName: string) {
        const subDirPath = path.join(postsPath, dirName);
        const metaJsonPath = path.join(subDirPath, '_meta.json');
        let metaItems: string[] = [];

        // 读取现有的 _meta.json
        metaItems = await fs.readFile(metaJsonPath, 'utf-8')
            .then(rawMeta => JSON.parse(rawMeta))
            .catch(() => []);

        // 读取子目录中的所有文件
        const files = await fs.readdir(subDirPath);
        const markdownFiles = files.filter(file => file.endsWith('.md'));

        // 处理每个 Markdown 文件
        for (const file of markdownFiles) {
            const filePath = path.join(subDirPath, file);
            const content = await fs.readFile(filePath, 'utf-8');
            const parsedContent = matter(content);
            const fileName = path.basename(file, '.md');

            if (parsedContent.data.hide === true) {
                // 如果文件被标记为隐藏，从 metaItems 中移除
                metaItems = metaItems.filter(item => item !== fileName);
            } else if (!metaItems.includes(fileName)) {
                metaItems.unshift(fileName);
            }
        }

        // 确保目录存在并写入更新后的 _meta.json
        await fs.mkdir(path.dirname(metaJsonPath), { recursive: true });
        await fs.writeFile(metaJsonPath, JSON.stringify(metaItems, null, 4), 'utf-8');
    }
}
