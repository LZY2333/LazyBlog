---
title: 贪心算法
date: 2025-10-14 10:07:05
categories: 技术栈
tags: 
    - 算法题
---

贪心的本质是 局部最优，到 全局最优

贪心 没有固定的套路

如何验证可不可以用贪心算法: 举反例，如果想不到反例，那么就试一试贪心吧

## 一些总结

假设某道题需要 找到一堆 单增 或 单减，数据中 相反的那个，则用栈。

贪心要 找对贪心的方向，有时候从前向后，有时候从后向前

每一个数 需要和前一个数进行比较 并且含某种规律 用栈

打算循环里套循环跳过数的时候,想想能不能去掉内层循环

## 455. 分发饼干

[leetcode](https://leetcode-cn.com/problems/assign-cookies/)

```js
var findContentChildren = function(g, s) {
    let gp = 0,sp = 0
    g.sort((a,b) => a - b)
    s.sort((a,b) => a - b)
    while(gp < g.length && sp < s.length) {
        if(g[gp] <= s[sp]) gp ++;
        sp ++
    }
    return gp
};
```

## 376. 摆动序列

[leetcode](https://leetcode.cn/problems/wiggle-subsequence/description/)

```js
var wiggleMaxLength = function(nums) {
    let up = 1,down = 1
    for(let i = 1;i < nums.length; i++) {
        if(nums[i] > nums[i-1]) { 
            // 注意这里是 up = down+1, 假设一直是上升，则实际up不会增加
            up = down + 1
        } else if(nums[i] < nums[i-1]) {
            down = up + 1
        } // 等于,就两边都不加
    }
    return nums.length ? Math.max(up,down) : 0
};
```

题目是可以删除任意位置的数，换句话说，只要计算满足最小摆动序列的数个数就行

只记录峰顶，上升和下降过程中间的值，就是可以不计入的值

## 53. 最大子序和

[leetcode](https://leetcode.cn/problems/maximum-subarray/description/)

```js
var maxSubArray = function(nums) {
    let result = Number.NEGATIVE_INFINITY;
    let sum = 0;
    for(let i = 0; i < nums.length; i++) {
        sum += nums[i]
        if(sum > result) result = sum
        if(sum < 0) sum = 0
    }
    return result
};
// 6
console.log(maxSubArray([-2,1,-3,4,-1,2,1,-5,4]));
```

当一个区间和为负，则立刻放弃该区间，也即为该区间的右边界

除了贪心 还可以动态规划

## 122. 买卖股票的最佳时机 II

[leetcode](https://leetcode.cn/problems/best-time-to-buy-and-sell-stock-ii/)

```js
var maxProfit = function(prices) {
    let result = 0
    for(let i = 1; i < prices.length; i++) {
        result += Math.max(prices[i] - prices[i - 1], 0)
    }
    return result
};
```

除了贪心 还可以动态规划

## 55. 跳跃游戏

[leetcode](https://leetcode-cn.com/problems/jump-game/)

```js
var canJump = function(nums) {
    let end = nums.length - 1
    for(let i = end; i >= 0; i--) {
        if(nums[i] >= end - i) end = i
    }
    return end === 0
};
```

贪心要 找对贪心的方向，这里正向反向的思路都行

从后往前: 能够到end，就一定能够到 末尾位

从前往后: 遍历每一位的最大cover位,`cover = Math.max(cover, i + nums[i])`

如果当前位已经被cover了则被忽略，如果未被前面任意数cover，则可能无法到末位，很合理

## 45. 跳跃游戏II

[leetcode](https://leetcode.cn/problems/jump-game-ii/description/)

i从前往后，记录 当前最远下标 curDistance

[i, curDistance] 内寻找 下一步远下标  nextDistance

遍历完时模拟跳跃，nextDistance 赋值给 curDistance, result步数+1

> for循环中i < nums.length - 1无等号, 因为:  
> 假设 末位i(nums.length - 1) 恰好等于 curDistance, 会多执行一次 result++  
> 为什么说这次是多执行的，因为当前 nextDistance能cover的范围是已经计算过 result++的  
> 在i为0的第一轮 curDistance, nextDistance 均为 0, 已经 result++, nextDistance 赋值

## 860. 柠檬水找零

"不带零钱你卖什么柃檬水？"

[leetcode](https://leetcode-cn.com/problems/lemonade-change/)

在柠檬水摊上，每一杯柠檬水的售价为 5 美元。

顾客排队购买你的产品，（按账单 bills 支付的顺序）一次购买一杯。

每位顾客只买一杯柠檬水，然后向你付 5 美元、10 美元或 20 美元。

你必须给每个顾客正确找零，也就是说净交易是每位顾客向你支付 5 美元。

注意，一开始你手头没有任何零钱。

给你一个整数数组 bills ，其中 bills[i] 是第 i 位顾客付的账。

如果你能给每位顾客正确找零，返回 true ，否则返回 false 。

__98.18%__ 击败  
__86.49%__ 击败

```js
var lemonadeChange = function(bills) {
    let fc = 0,tc = 0,i = 0
    for(; i < bills.length; i++) {
        const count = bills[i] / 5 - 1
        if(count === 0) { // + 5*1
            fc++
        } else if(count === 1) { // + 10*1, - 5*1
            tc++
            fc--
            if(fc < 0) return false
        } else if(count === 3) { // + 20*1(不记录), - 10*1 - 5*1 或 - 5*3
            if(tc) {
                tc --
                fc --
            } else {
                fc = fc - 3
            }
            if(fc < 0) return false
        }
    }
    return true
};
```

## 用最少数量的箭引爆气球(leetcode 452)

其实就是区间覆盖,给几个区间,每个区间存在重复与不充分,找出最多的重复区间

[leetcode](https://leetcode-cn.com/problems/minimum-number-of-arrows-to-burst-balloons/)

```js
var findMinArrowShots = function(points) {
    if (!points.length ) {
        return 0;
    }
    // 首先，按右边界从小到大排列，保证每 后一个气球 右边界 必在 当前气球 右边界 的右边
    // 同时设置 箭位置为 1球右边(贪婪，射中1的同时又尽量能射中后面的球,射中后面的球的条件需要箭位置尽可能大)
    // 这样 2球右边 > 1球右 = 箭位置，那么只需要判断 2球左边 < 箭位置 就代表必然同时射中2球
    // 如果 不能射中 2球，即 2球左 > 1球右,例如:[1,2] [3,4]
    // 则需 箭+1,并设置 新箭位置 为 2球右(如:4)
    // 如果 能射中 2球,则继续判断下一个球是否也能射中，直到找到不能射中的，加新箭
    // 这里的精妙之处就在于,每次都拿出新的一支箭,并设置其位置为当前球右边界时，
    // 假设这支箭最多能射穿n个气球,那么这支箭的位置,"必然在这n个气球中最靠左的右边界位置"
    // 而完成这一精妙操作关键一步是开头的 按右边界从小到大排列，同时 从左向右遍历
    // 每一次 增加新箭，都是在气球右边界上，而由于是 右边界从小到大排序，所以碰到是第一个气球必然就是
    // "必然在这n个气球中最靠左的右边界位置"
    points.sort((a, b) => a[1] - b[1]);
    console.log(points)
    let pos = points[0][1] // 当前区间的 右边,位射箭位置
    let ans = 1;
    for (let balloon of points) {
        if (balloon[0] > pos) { // 如果当前 区间的 左边 比 射箭位置 大
            pos = balloon[1]; // 
            ans++; // 则需要多射一支箭
        }
    }
    return ans;
};
```

### 我的解法

```js
var findMinArrowShots = function(points) {
    points = points.sort((l,r) => l[0] - r[0] || l[1] - r[1]) // 左端点相等要按右端点最小的来
    let count = 0,i = 0;
    while(i < points.length) {
        count ++
        // 每一个区间,找其下j个区间,
        // 当这下j个区间 左节点 <= 当前区间 右节点(等于也算重合)
        // 表示有重合区域,可一箭(1count)同时射穿,所以while循环跳过
        let j = 1,right = points[i][1] // right边界最初为当前区间right,后续为了穿过重复区间
        while(points[i+j] && points[i+j][0] <= right) { // right会不断缩小
            right = points[i+j][1] < right ? points[i+j][1] : right
            j ++
        }
        i += j
    }
    return count
};
```

## 移掉K位数字(leetcode 402)

[leetcode](https://www.algomooc.com/algocamp2)

这样从递增里找减少的，从递减里找增加的，就用栈！！！！

无注释版

```js
var removeKDigits = function(num, k) {
    const stack = [];
    for (const now of num) {
        while(stack.length > 0 && stack[stack.length-1] > now && k) {
            stack.pop();
            k -= 1;
        }
        stack.push(now);
    }
    while (k-- > 0) { stack.pop() }
    while(stack[0] === '0') { stack.shift() }
    return stack.join('') || '0'
};
```

注释版

```js
var removeKDigits = function(num, k) {
    const stack = []; // 维护一个单调递减栈(越栈底的数越小)
    for (const now of num) { // 从左往右一个个遍历数
        // 如果 栈不为空 栈顶元素大于当前元素 还需要删数
        while (stack.length > 0 && stack[stack.length - 1] > now && k) {
            stack.pop(); // 删了
            k -= 1;
        }
        stack.push(now); // 把当前数放进去
    }
    // 如果轮完还有k没删够，就删后面的大数字
    while (k-- > 0) { stack.pop() }
    // 删掉前面的0
    while(stack[0] === '0') { stack.shift() }
    // 拼接并防止空字符串
    return stack.join('') || '0'
};
```
