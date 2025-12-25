/**
 * 替换中文标点为英文标点的脚本
 */
import fs from 'fs/promises';
import path from 'path';
import { pathToFileURL } from 'url';

/**
 * 主函数：查找并处理所有目标类型文件
 */
async function replaceChinesePunctuation() {
    console.log('【replaceChinesePunctuation】开始处理中文标点替换...');

    // 获取 Rspress 配置
    const configPath = path.resolve(process.cwd(), 'rspress.config.ts');
    const configContent = await fs.readFile(configPath, 'utf-8');

    // 从配置内容中提取 root 路径
    const rootMatch = configContent.match(/root:\s*['"]([^'"]+)['"]/);
    const rootDir = rootMatch ? path.resolve(process.cwd(), rootMatch[1]) : path.resolve(process.cwd(), 'docs');

    // 收集所有目标文件
    const targetFiles = await collectTargetFiles(rootDir, ['.md', '.mdx']);
    console.log(`【replaceChinesePunctuation】找到 ${targetFiles.length} 个文件待处理`);

    let processedCount = 0;

    // 遍历每个文件路径并执行替换
    for (const filePath of targetFiles) {
        const raw = await fs.readFile(filePath, 'utf-8');
        const replaced = replaceContent(raw);

        if (raw !== replaced) {
            await fs.writeFile(filePath, replaced, 'utf-8');
            console.log(`【replaceChinesePunctuation】已修复: ${filePath}`);
            processedCount++;
        }
    }

    console.log(`【replaceChinesePunctuation】处理完成，共修复 ${processedCount} 个文件。`);
}

/**
 * 递归收集所有符合扩展名的文件路径
 */
async function collectTargetFiles(dir: string, extList: string[]): Promise<string[]> {
    const files: string[] = [];

    // 读取当前目录的所有条目
    const entries = await fs.readdir(dir, { withFileTypes: true });

    // 遍历每个条目
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        // 如果是目录则递归收集
        if (entry.isDirectory()) {
            const subFiles = await collectTargetFiles(fullPath, extList);
            files.push(...subFiles);
        }
        // 如果是目标扩展名的文件则加入结果
        else if (extList.includes(path.extname(fullPath))) {
            files.push(fullPath);
        }
    }

    return files;
}

/**
 * 替换中文标点并规范空格的函数
 */
function replaceContent(content: string): string {
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

// 执行脚本
replaceChinesePunctuation().catch(error => {
    console.error('【replaceChinesePunctuation】执行失败：', error);
    process.exit(1);
});
