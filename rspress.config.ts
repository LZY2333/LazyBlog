import * as path from 'node:path';
import { defineConfig } from 'rspress/config';
import { FrontMatterCountPlugin } from './src/plugins/FrontMatterCountPlugin'

const docsPath = path.join(__dirname, 'docs')

export default defineConfig({
    root: docsPath,
    title: '懒前端',
    icon: '/rspress-icon.png',
    outDir: 'LazyBlog',
    search: {
        codeBlocks: true,
    },
    themeConfig: {
        outlineTitle: '目录',
        prevPageText: '上一篇',
        nextPageText: '下一篇',
        lastUpdated: true,
        footer: {
            message: '<a href="https://beian.miit.gov.cn/">粤ICP备2021167772号</a>',
        },
    },

    builderConfig: {
        tools: {
            rspack: async (config) => {
                config.plugins?.unshift(new FrontMatterCountPlugin());
                return config;
            },
        },
        html: {
            tags: [
                {
                    tag: 'script',
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

