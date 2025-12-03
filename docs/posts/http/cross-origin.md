---
title: 跨域方案
date: 2025-12-02 00:05:21
tags:
    - http
---

## --------跨域方案--------
## CORS
服务端配置 响应头
```http
Access-Control-Allow-Origin: https://app.example.com
Access-Control-Allow-Credentials: true   # 如果需要携带 cookie
```


## 反向代理
### Nginx反向代理 proxy_pass
`proxy_pass`
```nginx
location /api/ {
    proxy_pass https://backend.example.com;
}
```

### Webpack/Vite 开发环境代理 proxy
`proxy`
```js
// webpack
devServer: {
    proxy: {
        '/api': {
            target: 'https://backend.example.com',
            changeOrigin: true
        }
    }
}
// vite
server: {
    proxy: {
        '/api': 'https://backend.example.com'
    }
}
```

### Node 中间层代理
```js
app.get('/api/user', async (req, res) => {
    const result = await fetch('https://backend.com/user');
    res.send(await result.json());
});
```

## JSONP
1.提前在window挂载callback函数  
2.被拉取的JS包内部需调用callback函数  
3.拉取JS包并执行，执行时内部调用callback函数传出数据
```js
function jsonp(url, callbackName = 'callback') {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');

        // 在全局创建回调函数
        window[callbackName] = function (data) {
            resolve(data);
            document.body.removeChild(script);
            delete window[callbackName];
        };

        script.src = `${url}?callback=${callbackName}`;
        script.onerror = reject;

        document.body.appendChild(script);
    });
}

// 使用示例
jsonp('https://example.com/user')
    .then(data => {
        console.log('result:', data);
    });
```

### UMD
JSONP 和 UMD 都是通过 `<script>` 加载文件并执行  
UMD  是加载后执行  往window上挂载东西  
JSONP是加载后执行调用window上提前挂载好的callback函数。

JSONP 通过callback能监听完成信号  
UMD   通过`script.onload`  
UMD   通过轮询等待变量出现  
UMD   通过UMD库自己触发事件(模拟JSONP)

```js
// 1. onload 表示（同步）代码已执行结束
const script = document.createElement('script');
script.src = 'https://cdn.com/mylib.umd.js'
script.onload = () => {
    console.log("loaded", window.MyLib)
};
document.head.appendChild(script);

// 3. UMD库自己触发事件
// 库内部
window.dispatchEvent(new CustomEvent("myapp-ready"))
// 宿主监听
window.addEventListener("myapp-ready", () => {
    console.log("app ready")
});
```

### qiankun 和 UMD
qiankun的微应用须打包为 UMD格式, 即自动执行往window上挂载对象
```js
window["myApp"] = { bootstrap, mount, unmount }
```

1. 通过 import-html-entry fetch entry HTML
2. 解析 HTML → 提取 JS/CSS 链接
3. 通过 onload, 顺序 拉取并执行 JS包, 再拉取并执行 下一个JS包
4. 最后一个 JS包 onload检查 `window["myApp"]` 属性


## window.postMessage
跨域 跨tab 通信

需要拿到对方的window, 下面三个场景可以拿到

| 场景                | 如何获取 `Window` 对象        |
|---------------------|-------------------------------|
| 父 → 子 iframe      | `iframe.contentWindow`        |
| 子 iframe → 父      | `window.parent`               |
| 当前窗口 → 弹出窗口 | `window.open(url)` 返回的对象 |

```js
// 父窗口
const newTab = window.open('https://example.com');
// 父窗口发送消息
newTab.postMessage({ foo: 'bar' }, 'https://example.com');
// 子窗口接收消息
window.addEventListener('message', (event) => {
    if (event.origin === 'https://parent.com') {
        console.log('Received', event.data);
    }
});
```


## WebSocket
