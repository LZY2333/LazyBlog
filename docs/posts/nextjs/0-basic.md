---
title: NextJS基础
date: 2026-02-07 13:16:52
categories: 技术栈
tags:
    - NextJS
    - React
---

## 路由

### 动态路由 及 动态路由参数
```tsx
export default function Page({ params, searchParams }: PageProps) {
  console.log(params);
  // 1.目录: app/[lang]/post/[id]/page.tsx
  // 1.路由: /en/post/88
  // 1.params: { lang: "en", id: "88" }
  
  // 2.目录: app/docs/[...slug]/page.tsx
  // 2.路由: /docs/a/b/c
  // 2.params: { slug: ["a", "b", "c"] }

  // 3.目录: app/docs/[[...slug]]/page.tsx
  // 3.路由: /docs
  // 3.params: { slug: undefined }
  // 3.路由: /docs/a/b
  // 3.params: { slug: ["a", "b"] }

  // 4.目录: app/[lang]/[...rest]/page.tsx
  // 4.路由: /zh/news/2026/02
  // 4.params: { lang: "zh", rest: ["news", "2026", "02"] }
}
```

### searchParams 查询参数
```tsx
export default function Page({ params, searchParams }: PageProps) {
  console.log(searchParams);
  // 1.路由: /search?q=hello&page=2
  // 1.params: { q: "hello", page: "2" }

  // 1.路由: /list?tag=js&tag=react
  // 1.params: { tag: ["js","react"] }
}
```
注意: 全是字符串类型, 且 内部会自动调用decodeURIComponent

### 传参跳转最佳实践
函数传参跳转
```tsx
import { useRouter } from "next/navigation";
const router = useRouter();
function goSearch() {
    const params = new URLSearchParams({
        q: "hello world",
        page: "1"
    });
    // 增加参数示例
    params.set('tag', "前端")
    // /search?q=hello+world&page=1&tag=%E5%89%8D%E7%AB%AF
    router.push(`/search?${params}`);
}
```
Link 组件跳转
```tsx
<Link
    href={{
        pathname: "/search",
        query: {
            q: "hello world",
            page: 1
        }
    }}
>
    搜索
</Link>
// 但还是更推荐下面的写法
<Link href={`/search?${params}`}>
```

### 使用 url 代替 useState
使用 动态路由参数 params, 查询参数 searchParams 代替useState  
优势: __页面刷新后退保持状态__、 __有利于 SEO__、 __让组件保持服务端组件提升性能__  
NextJS 给页面级组件提供的参数:  
page.tsx 有两个参数 params 和 searchParams  
layout.tsx 有两个参数 params 和 children  
template.tsx 有两个参数 params 和 children

```tsx
type PageProps = {
    params: { [key: string]: string };
    searchParams: { [key: string]: string | string[] | undefined };
};
export default function Page({ params, searchParams }: PageProps) { }
export default function Layout({ params, children }) { }
export default function Template({ params, children }) { }
```

## Streaming

## Cache

## Action
