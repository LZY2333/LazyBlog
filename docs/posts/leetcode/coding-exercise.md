---
title: 面试手写题
date: 2026-01-11 23:58:09
categories: 技术栈
tags: 
    - 算法
---

很有意思的题目，当场没写出来，时间差一点

## 合并含相同项的数组

```js
const arr = [['a0', 'a1'], ['a1', 'a2'], ['a3']];
// 将含有相同元素的数组合在一起，且去除重复项，输出新arr2
// [ [ 'a0', 'a1', 'a2' ], [ 'a3' ] ]
const mergeArr = (arr) => {
    const map = {}; // 用来记录每个元素属于哪个数组
    const result = []; // 用来保存合并后的结果
    for (const innerArr of arr) {
        // 是否有 已存在的arr 含当前arr的重复元素
        let existArr = null;
        for (const item of innerArr) {
            if (map[item]) {
                existArr = map[item];
                break;
            }
        }
        if (existArr) {
            for (const item of innerArr) {
                if (map[item]) continue;
                existArr.push(item);
                map[item] = existArr;
            }
        } else {
            result.push(innerArr);
            for (const item of innerArr) {
                map[item] = innerArr;
            }
        }
    }
    return result;
};
console.log(mergeArr(arr)); 
```

## 对象数据构造Html标签树含缩进

```js
const root = { a: 1, b: { c: 2, d: { e: 3, }, }, };
// 生成HTML标签Tree
const generateTree = (value) => {
    return getTag('root', deepTravelData(value, 0), 0);
};
const deepTravelData = (value, deep) => {
    if (!isObject(value)) return getText(value, deep + 1);
    const tagArr = [];
    for (const key in value) {
        if (!Object.hasOwn(value, key)) continue;
        tagArr.push(
            getTag(
                key,
                deepTravelData(value[key], deep + 1),
                deep + 1
            )
        );
    }
    return tagArr.join('\n');
};
const getTag = (tagName, content, deep) => {
    const space = ' '.repeat(deep * 4);
    return `${space}<${tagName}>\n${content}\n${space}<${tagName}/>`;
};
const getText = (text, deep) =>
    `${' '.repeat(deep * 4)}${text}`;
const isObject = (value) =>
    typeof value === 'object' && value !== null;
console.log(generateTree(root));
```
