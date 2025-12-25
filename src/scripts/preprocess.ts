import fs from 'fs/promises';
import path from 'path';



async function preprocess() {
    console.log('----------编译前文章检查开始执行----------');
    const postsPath = await getPostsPath();
    const entries = await fs.readdir(postsPath, { withFileTypes: true });
    console.log('entries', entries);
}

const getPostsPath = async () => {
    // 获取 Rspress 配置, 读取文章路径
    const configPath = path.resolve(process.cwd(), 'rspress.config.ts');
    const configContent = await fs.readFile(configPath, 'utf-8');
    const rootMatch = configContent.match(/root:\s*['"]([^'"]+)['"]/);
    const rootDir = path.resolve(process.cwd(), rootMatch?.[1]? rootMatch[1] : 'docs');
    const postsPath = path.join(rootDir, 'posts');
    return postsPath
}