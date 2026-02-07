---
title: JS手写合集
date: 2023-03-4 20:48:50
categories: 经验帖
tags:
    - JS基础
summary: 实现，类的继承，LRU淘汰算法，Ajax，节流函数，数组去重
---

## 浅比较

```js
/**
 * 浅比较(如果是对象，只比较第一层属性，与深比较/深拷贝相比性能更好，平常够用)
 * @param obj1 任意基本类型或引用类型
 * @param obj2 任意基本类型或引用类型
 * @returns 是否同一对象
 */
function shallowEqual(obj1: any, obj2: any): boolean {
    // 同基本类型，或同引用地址，返回true
    if (obj1 === obj2) return true;

    // 非对象类型 或 为null 返回 false
    if (typeof obj1 !== 'object' || obj1 === null || typeof obj2 !== 'object' || obj2 == null) return false

    const keys1 = Object.keys(obj1)
    const keys2 = Object.keys(obj2)
    if (keys1.length !== keys2.length) return false

    // 如果obj2中没有obj1中的某个属性，或该属性值不相等返回false
    for (let key of keys1) {
        if (!obj2.hasOwnProperty(key) || obj1[key] !== obj2[key]) {
            return false
        }
    }

    return true
}

const obj11 = { a: 1 }
const obj12 = { a: 1 }
console.log(shallowEqual(obj11, obj12)); // true
```

## 手写深拷贝

__浅拷贝__，如果复制的对象是基本数据类型，拷贝的就是值，如果是引用类型，拷贝的就是内存地址，一个对象改变会影响另一个对象

### JSON.parse(JSON.stringify()) 基本能用版

1. `JSON.parse(JSON.stringify())`，写法简单，但无法拷贝函数，循环引用，或特殊引用类型.

### forIn遍历，递归自身，丐版

```js
function clone(target) {
    if (typeof target !== 'object') return target;

    let cloneTarget = {};
    for (const key in target) {
        cloneTarget[key] = clone(target[key]);
    }
    return cloneTarget
};
```

### cloneTarget=[]兼容数组，map解决循环引用，够用了版

```js
/**
 * 深拷贝
 * @param {Object} target 要拷贝的对象
 * @param {WeakMap} map 用于存储循环引用对象的地址
 */
function deepClone(target, map = new WeakMap()) {
    if (typeof target !== 'object') return target

    if (map.get(target)) {
        return map.get(target)
    }

    const cloneTarget = Array.isArray(target) ? [] : {}
    map.set(target, cloneTarget)

    for (const key in target) {
        if (Object.hasOwnProperty.call(target, key)) {
            cloneTarget[key] = deepClone(target[key], map);
        }
    }
    return cloneTarget
}
```

### WeakMap弱引用 与 {}强引用

Map 和 WeakMap 的区别

WeakMap是ES6中新增的一种集合类型，叫做弱映射。它和Map是兄弟关系，与Map的区别在于这个弱字，API还是Map那套API。

Map的键可以是任意类型，WeakMap只接受对象作为键，不接受其它类型的值作为键

Map的键实际上是跟内存地址绑定的，只要内存地址不一样，就视为两个键；WeakMap的键是弱引用，如果创建了一个弱引用对象，不会被垃圾回收关注，如果不再需要，WeakMap 中的键名对象和所对应的键值对会自动消失，不再手动删除引用。

Map可以被遍历，WeakMap不能被遍历

### forIn循环效率低，while循环效率高，性能优化版

### 函数类型及特殊引用类型得专门判断

`Map`， `Set` 等类型得专门判断

## 手写防抖节流

防抖和节流都是防止某一事件频繁触发

### 防抖(debounce)

施法前摇，在读条期间再次触发会打断施法，重新读条，直到正常读条结束，触发函数。

```js
function debounce(fn, wait) {
    let timer;
    return function () {
        clearTimeout(timer);
        timer = setTimeout(() => {
            fn.apply(this, arguments);
        }, wait);
    };
}
```

场景: 浏览器窗口resize,文本编辑器自动保存,输入框智能提示  
防抖重在清零 `clearTimeout(timer)`

### 节流

节流是加锁 限流防止频繁触发 单位时间内只发生一次

```js
function throttle(fn, wait) {
    let lastTime = 0;
    return function () {
        const now = Date.now();  // 获取当前时间戳
        if (now - lastTime >= wait) {  // 判断当前时间与上次执行时间的差距是否大于等于 wait
            fn.apply(this, arguments);  // 执行函数
            lastTime = now;  // 更新最后执行时间
        }
    };
}
```

### 防抖首次触发

```js
function debounce(fn, wait, immediate = false) {
    let timer;
    return function (...args) {
        if(immediate) {
            fn.apply(this, args);
            immediate = false;
            return;
        }
        clearTimeout(timer);
        timer = setTimeout(() => {
            fn.apply(this, args);
        }, wait);
    };
}
```

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
const getText = (text, deep) => `${' '.repeat(deep * 4)}${text}`;
const isObject = (value) => typeof value === 'object' && value !== null;
console.log(generateTree(root));
```

## LRU算法

```js
class LRUCache {
    constructor(max) {
        this.max = max;
        this.store = new Map();
    }

    put(key, value) {
        // 如果已存在，先删除（为了更新顺序）
        if (this.store.has(key)) {
            this.store.delete(key);
        }
        this.store.set(key, value);

        // 超出容量，删除最久未使用的（Map 的第一个）
        if (this.store.size > this.max) {
            const oldestKey = this.store.keys().next();
            this.store.delete(oldestKey);
        }
    }

    get(key) {
        if (!this.store.has(key)) return -1;
        const value = this.store.get(key);
        // 访问即更新使用顺序
        this.store.delete(key);
        this.store.set(key, value);
        return value;
    }
}

const cache = new LRUCache(2); // 容量为 2

cache.put(1, 1); // 缓存是 {1=1}
cache.put(2, 2); // 缓存是 {1=1, 2=2}

console.log(cache.get(1));    // 返回 1，缓存是 {2=2, 1=1}
cache.put(3, 3); // 删除键 2（因为最久未使用），缓存是 {1=1, 3=3}
console.log(cache.get(2));    // 返回 -1（未找到）
cache.put(4, 4); // 删除键 1，缓存是 {3=3, 4=4}
console.log(cache.get(1));    // 返回 -1（未找到）
console.log(cache.get(3));    // 返回 3
console.log(cache.get(4));    // 返回 4
```

## 待实现
### 类的继承


### 数组全排列

```js
var arr = [["1","2"],["3","4","5"]];
// 预期结果
// [["1","3"],["1","4"],["1","5"],["2","3"],["2","4"],["2","5"]]

const combile = (arr) => {
    for(let i = 0; i < arr.length; i++) {
        
    }
}
```

### 手写扁平数组转tree

```js
var obj = [
    { id:3, parent:2 },
    { id:1, parent:null },
    { id:2, parent:1 }
]

// o = {
//   id: 1,
//   parent: null,
//   children: [{
//     id: 2,
//     parent: 1,
//     children: [{
//       id: 3,
//       parent: 2
//     }]
//   }]
// };
```

实现一个 EventBus，支持订阅、取消订阅、发布事件，以及一次性订阅（once）
