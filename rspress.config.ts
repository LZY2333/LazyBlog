import * as path from 'node:path';
import { defineConfig } from 'rspress/config';

export default defineConfig({
    root: path.join(__dirname, 'docs'),
    title: 'My Site',
    icon: '/rspress-icon.png',

    route: {
        // ** 代表任意级别的子目录，* 代表任意文件。
        // 'drafts':   drafts 目录下的文件，不匹配子目录(如: drafts/1/1.md)。同 'component/*' 'component/'
        // '/drafts/': 匹配根目录下的 component 目录，通常用作绝对路径匹配。
        exclude: ['drafts/**/*']
    }
    // logo: {
    //     light: '/rspress-light-logo.png',
    //     dark: '/rspress-dark-logo.png',
    // },
    // themeConfig: {
    //     socialLinks: [
    //         {
    //             icon: 'github',
    //             mode: 'link',
    //             content: 'https://github.com/web-infra-dev/rspress',
    //         },
    //     ],
    // },
});
