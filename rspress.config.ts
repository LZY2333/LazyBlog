import * as path from 'node:path';
import { defineConfig } from 'rspress/config';
import { FrontMatterCountPlugin } from './src/plugins/FrontMatterCountPlugin'
import { OverviewGeneratePlugin } from './src/plugins/OverviewGeneratePlugin'

const docsPath = path.join(__dirname, 'docs')

export default defineConfig({
    root: docsPath,
    title: '懒前端',
    icon: '/rspress-icon.png',
    route: {
        // ** 代表任意级别的子目录，* 代表任意文件。
        // 'drafts':   drafts 目录下的文件，不匹配子目录(如: drafts/1/1.md)。同 'component/*' 'component/'
        // '/drafts/': 匹配根目录下的 component 目录，通常用作绝对路径匹配。
    },
    search: {
        codeBlocks: true,
    },
    themeConfig: {
        outlineTitle: '目录',
        prevPageText: '上一篇',
        nextPageText: '下一篇',
        lastUpdated: true,
    },

    builderConfig: {
        tools: {
            rspack: async (config) => {
                config.plugins?.unshift(new FrontMatterCountPlugin());
                config.plugins?.unshift(new OverviewGeneratePlugin());
                return config;
            },
        },
        html: {
            tags: [
                {
                    tag: 'script',
                    // 通过 window.RSPRESS_THEME 变量来指定默认的主题模式，可选值为 'dark' 和 'light'
                    children: "window.RSPRESS_THEME = 'dark';",
                },
            ],
        },
    },
    logo: {
        light: '/rspress-light-logo.png',
        dark: '/rspress-dark-logo.png',
    },
});

// 自动生成frontmatter，如文章字数统计
// 自动生成_meta.json