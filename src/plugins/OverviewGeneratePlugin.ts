import fs from 'fs/promises'; // 引入文件系统模块，用于异步读写文件
import path from 'path'; // 引入路径模块，用于处理文件路径
import { pathToFileURL } from 'url'; // 将文件路径转换为 file:// URL
import matter from 'gray-matter'; // 引入 gray-matter 用于解析 Markdown frontmatter
import { constants } from 'fs'; // 引入 fs 常量，用于访问文件系统

interface PluginOptions {
    postsDir?: string; // posts 文件夹路径
}

export class OverviewGeneratePlugin {
    name = 'generate-overview-pages-plugin'; // 插件名称
    postsDir: string; // posts 文件夹路径

    constructor(options: PluginOptions) {
        this.postsDir = options.postsDir || 'posts'; // 设置 posts 文件夹路径
    }

    apply(compiler: any) {
        // tapPromise 后续插件会等待async函数执行完毕，tap不会
        compiler.hooks.environment.tap(this.name, async () => {
            await this.generateOverviewPages(); // 生成 Overview 页面
        });
    }

    private async generateOverviewPages() {
        console.log('正在生成 Overview 页面...');

        // 获取 rspress 配置文件路径（默认在项目根目录）
        const configPath = path.resolve(process.cwd(), 'rspress.config.ts');

        // 检查 rspress.config.ts 是否存在
        try {
            await fs.access(configPath, constants.F_OK); // 检查文件是否存在
        } catch {
            throw new Error('找不到 rspress.config.ts');
        }

        // 动态导入 rspress 配置
        const configModule = await import(pathToFileURL(configPath).href);
        const siteConfig = configModule.default || {};

        // 获取 root 参数，默认是 'docs'
        const rootDir = path.resolve(process.cwd(), siteConfig.root || 'docs');

        // 定位到 posts 目录
        const postsPath = path.join(rootDir, this.postsDir);

        try {
            await fs.access(postsPath, constants.F_OK); // 检查 posts 目录是否存在
        } catch {
            throw new Error(`找不到 posts 目录：${postsPath}`);
        }

        // 读取 posts 目录下所有一级子目录
        const entries = await fs.readdir(postsPath, { withFileTypes: true });
        const subDirs = entries.filter(entry => entry.isDirectory()).map(entry => entry.name);

        for (const dirName of subDirs) {
            const overviewPath = path.join(postsPath, `${dirName}.md`);

            try {
                await fs.access(overviewPath, constants.F_OK); // 检查 文件夹.md 文件是否存在
            } catch {
                // 如果 文件夹.md 不存在，创建一个带 frontmatter 的文件
                console.log('generate overview', overviewPath);
                const newContent = matter.stringify('', { overview: true });
                await fs.writeFile(overviewPath, newContent.trimEnd(), 'utf-8');
                continue;
            }

            const rawContent = await fs.readFile(overviewPath, 'utf-8');
            const parsedContent = matter(rawContent);

            if (parsedContent.data.overview === true) {
                continue;
            }

            parsedContent.data.overview = true;
            const updatedContent = matter.stringify(parsedContent.content, parsedContent.data);
            // 写回 文件夹.md
            console.log('generate overview', overviewPath);
            await fs.writeFile(overviewPath, updatedContent.trimEnd(), 'utf-8');
        }

        // 处理 posts 目录下的 _meta.json 文件
        const metaJsonPath = path.join(postsPath, '_meta.json');
        const metaItems = await this.generateMetaJson(postsPath, subDirs, metaJsonPath);
        // 确保目录存在
        await fs.mkdir(path.dirname(metaJsonPath), { recursive: true });
        await fs.writeFile(metaJsonPath, JSON.stringify(metaItems, null, 4), 'utf-8'); // 写入格式化 JSON
    }

    private async generateMetaJson(postsPath: string, subDirs: string[], metaJsonPath: string) {
        let metaItems: any[] = [];

        // 尝试读取现有 _meta.json 文件
        try {
            const rawMeta = await fs.readFile(metaJsonPath, 'utf-8');
            metaItems = JSON.parse(rawMeta);
        } catch {
            // 文件不存在则忽略，稍后创建
            metaItems = [];
        }

        // 确保第一项是固定的 Overview
        if (!metaItems.length || metaItems[0]?.name !== 'index') {
            metaItems.unshift({
                type: 'file',
                name: 'index',
                label: 'Overview'
            });
        }

        const existingNames = new Set(metaItems.map(item => item.name));

        // 遍历所有子目录，添加缺失的目录项
        for (const dirName of subDirs) {
            if (!existingNames.has(dirName)) {
                metaItems.push({
                    type: 'dir',
                    name: dirName,
                    label: dirName.charAt(0).toUpperCase() + dirName.slice(1)
                });
            }
        }

        // 删除已不存在的子目录
        metaItems = metaItems.filter(item => {
            if (item.label === 'Overview') return true; // 保留 Overview
            return subDirs.includes(item.name);    // 只保留实际存在的文件夹
        });

        return metaItems;
    }
}
