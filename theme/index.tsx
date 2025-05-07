import React from 'react'
import Theme from 'rspress/theme'
import CustomNav from './Nav'
import CustomHomeFooter from './HomeFooter'
import style from './index.module.less'

const HomeLayout = () => {
    // JSX 中的 style={{ backgroundImage: 'url(...)' }}		最终是浏览器请求，支持 public 路径
    // 纯 CSS / LESS 中的 url('/xxx.jpg')	会被 Rspack 当作模块路径，尝试解析为本地依赖
    return (
        <div
            className={style.banner}
            style={{
                background: `url(/banner.jpg) center center / cover no-repeat`,
            }}
        >
            <Theme.HomeLayout />
        </div>
    )
}

export default {
    ...Theme,
    HomeLayout,
}

//  如何修改home layout组件增加背景？如何引入图片?如何支持css-module，ts不报错？

export { CustomNav as Nav, CustomHomeFooter as HomeFooter }

export * from 'rspress/theme'
