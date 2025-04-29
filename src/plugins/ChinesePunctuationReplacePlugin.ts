import { readdir, readFile, writeFile, stat } from 'fs/promises'; // 引入异步 fs 方法
import path from 'path'; // 引入路径处理模块
import { pathToFileURL } from 'url'; // 引入文件路径转 URL 方法
import type { Dirent } from 'fs'; // 引入 Dirent 类型

// 中文标点替换插件类
export class ChinesePunctuationReplacePlugin {
    name = 'chinese-punctuation-replace-plugin';

    // Rspack 插件入口方法
    apply(compiler: any) {
        // 在环境阶段异步执行替换逻辑
        compiler.hooks.environment.tap(this.name, () => {
            this.replace(); // 执行主逻辑
        });
    }

    // 主逻辑：查找并处理所有目标类型文件
    private async replace() {
        // 提示开始处理
        console.log('正在处理 替换中字符 ...');

        // 获取 rspress 文章文件路径（默认在项目根目录/docs）
        const configPath = path.resolve(process.cwd(), 'rspress.config.ts');
        const configModule = await import(pathToFileURL(configPath).href);
        const siteConfig = configModule.default || {};
        const rootDir = siteConfig.root || path.resolve(process.cwd(), 'docs');

        const targetFiles = await this.collectTargetFiles(rootDir, ['.md', '.mdx']);

        // 遍历每个文件路径并执行替换
        for (const filePath of targetFiles) {
            const raw = await readFile(filePath, 'utf-8');
            const replaced = replaceChinesePunctuation(raw);

            if (raw !== replaced) {
                await writeFile(filePath, replaced, 'utf-8');
                console.log(`[ChinesePunctuationReplacePlugin] Fixed: ${filePath}`);
            }
        }
    }

    // 递归收集所有符合扩展名的文件路径
    private async collectTargetFiles(dir: string, extList: string[]): Promise<string[]> {
        // 初始化结果数组
        const files: string[] = [];

        // 读取当前目录的所有条目
        const entries: Dirent[] = await readdir(dir, { withFileTypes: true });

        // 遍历每个条目
        for (const entry of entries) {
            // 构造完整路径
            const fullPath = path.join(dir, entry.name);

            // 如果是目录则递归收集
            if (entry.isDirectory()) {
                const subFiles = await this.collectTargetFiles(fullPath, extList);
                files.push(...subFiles);
            }
            // 如果是目标扩展名的文件则加入结果
            else if (extList.includes(path.extname(fullPath))) {
                files.push(fullPath);
            }
        }

        // 返回所有收集到的文件路径
        return files;
    }
}

// 替换中文标点并规范空格的函数
function replaceChinesePunctuation(content: string): string {
    // 替换所有中文标点为英文标点
    let replaced = content.replace(
        new RegExp(Object.keys(chineseToEnglishMap).join('|'), 'g'),
        (match) => chineseToEnglishMap[match] || match
    );

    // 处理英文标点后缺少空格的情况
    replaced = replaced.replace(/([,:])([^\s])/g, '$1 $2');

    // 英文双引号自动加空格
    replaced = replaced.replace(/(\S)"([^"]*?)"(\S)/g, (match, left, inner, right) => {
        return `${left} "${inner}" ${right}`;
    });

    // 英文单引号自动加空格
    replaced = replaced.replace(/(\S)'([^']*?)'(\S)/g, (match, left, inner, right) => {
        return `${left} '${inner}' ${right}`;
    });

    // 括号左右无空格时，添加空格
    replaced = replaced.replace(/(\S)\(([^)]*?)\)(\S)/g, (match, left, inner, right) => {
        return `${left} (${inner}) ${right}`;
    });

    // 返回最终结果
    return replaced;
}

// 中文标点到英文标点映射表
const chineseToEnglishMap: Record<string, string> = {
    '，': ',',
    '。': '.',
    '：': ':',
    '；': ';',
    '“': '"',
    '”': '"',
    '‘': "'",
    '’': "'",
    '（': '(',
    '）': ')',
    '！': '!',
    '？': '?',
};
