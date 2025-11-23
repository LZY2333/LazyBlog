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
子数组是连续的，子序列 同序不连续的  
当连续区间和为负，则立刻放弃该区间，也即为该区间的右边界

```js
// 1维动态规划
var maxSubArray = function (nums) {
    // dp[i] 以nums[i]结尾的最大连续子数组和
    const dp = Array(nums.length + 1).fill(0);
    let result = -Infinity;
    for (let i = 1; i <= nums.length; i++) {
        dp[i] = Math.max(dp[i - 1] + nums[i - 1], nums[i - 1]);
        result = Math.max(result, dp[i]);
    }
    return result;
};
// 0维动态规划
const maxSubArray = (nums) => {
    let sum = 0, result = -Infinity;
    for (let i = 0; i < nums.length; i++) {
        sum = Math.max(sum + nums[i], nums[i]);
        result = Math.max(result, sum);
    }
    return result;
};
// 贪心 其实就是 0维
var maxSubArray = function(nums) {
    let [sum, result] = [0, -Infinity]
    for(let i = 0; i < nums.length; i++) {
        sum < 0 && (sum = 0)
        sum += nums[i]
        sum > result && (result = sum)
    }
    return result
};
```

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

```js
var jump = function(nums) {
    let result = 0;
    let curDistance = 0;
    let nextDistance = 0;

    for(let i = 0; i < nums.length - 1; i++) {
        nextDistance = Math.max(nextDistance, i + nums[i])
        if(i === curDistance) {
            curDistance = nextDistance
            result++
        }
    }
    return result
};
// 2
console.log(jump([2,3,1,1,4]));
```

i从前往后，记录 当前最远下标 curDistance

[i, curDistance] 内寻找 下一步远下标  nextDistance

遍历完时模拟跳跃，nextDistance 赋值给 curDistance, result步数+1

> for循环中i < nums.length - 1无等号, 因为:  
> 假设 末位i(nums.length - 1) 恰好等于 curDistance, 会多执行一次 result++  
> 为什么说这次是多执行的，因为当前 nextDistance能cover的范围是已经计算过 result++的  
> 在i为0的第一轮 curDistance, nextDistance 均为 0, 已经 result++, nextDistance 赋值

## 1005. K次取反后最大化的数组和

[leetcode](<https://leetcode.cn/problems/maximize-sum-of-array-after-k-negations/>

```js
var largestSumAfterKNegations = function (nums, k) {
    nums.sort((a, b) => a - b);
    let sum = 0;
    let min = Number.POSITIVE_INFINITY;
    for (let num of nums) {
        if (k > 0 && num < 0) {
            num = -num;
            k--;
        }
        sum += num;
        min = Math.min(min, num);
    }
    return sum - (k % 2 === 1 ? min * 2 : 0);
};
// 11
console.log(largestSumAfterKNegations([-2, 5, 0, 2, -2], 3));
```

## 134. 加油站

[leetcode](https://leetcode.cn/problems/gas-station/description/)

```js
var canCompleteCircuit = function (gas, cost) {
    let start = 0;
    let curGain = 0;
    let totalGain = 0;

    for (let i = 0; i < gas.length; i++) {
        curGain += gas[i] - cost[i];
        totalGain += gas[i] - cost[i];

        // 如果当前油量小于 0，说明无法从 start 到 i+1
        if (curGain < 0) {
            start = i + 1; // 改变起点
            curGain = 0; // 重置油量
        }
    }

    return totalGain < 0 ? -1 : start;
};

// 代码含义: 最后一个 totalGain < 0 的路段的下一个坐标即为 start

// 首先 totalGain >= 0，说明总油量能走完，必然有答案

// 假设路段(0-i)totalGain变负，代表其无法走到下一站，
// 也代表 其缺少了前面的gain，即 段内无start
// 代码执行过程: 前期连续发现 totalGain为负 的路段，
// 但由于总 totalGain >= 0，最后一段必为start

// 另外，假设路段(0-i)totalGain一直为正，从未变负，则0就是 start
// 当然，这情况也可能是多解，但题目条件保证了单解，因此只能是0

// 最后，从某点出发后，任何中途的油量都不为负
// 这题其实就是找 最小前缀和的 下一个坐标
```

## 135. 分发糖果

[leetcode](https://leetcode.cn/problems/candy/)

```js
var candy = function (ratings) {
    const l = ratings.length;
    const rank = new Array(l).fill(1);

    for (let i = 1; i < l; i++) {
        if (ratings[i] > ratings[i - 1])
            rank[i] = rank[i - 1] + 1;
    }
    for (let i = l - 2; i >= 0; i--) {
        if (ratings[i] > ratings[i + 1])
            rank[i] = Math.max(rank[i], rank[i + 1] + 1);
    }

    return rank.reduce((pre, cur) => pre + cur, 0);
};
// 两次遍历，每个item满足积累rank的 左规则或右规则时，取二者大值
// 比较左边时，必须 从左往右 遍历
// 因为最左边一个0号本身已是最终结果，rank是需要从最边开始累加的
// 比较右边时，必须 从右往左 遍历
// 此时则要比较两次rank 取大值
```

## 860. 柠檬水找零

[leetcode](https://leetcode.cn/problems/lemonade-change/description/)

```js
var lemonadeChange = function (bills) {
    let rank1 = 0;
    let rank2 = 0;
    for (let i = 0; i < bills.length; i++) {
        if (bills[i] === 5) {
            rank1 += 1;
        }
        if (bills[i] === 10) {
            if (!rank1) return false;
            rank2 += 1;
            rank1 -= 1;
        }
        if (bills[i] === 20) {
            if (rank1 && rank2) {
                rank1 -= 1;
                rank2 -= 1;
            } else if (rank1 >= 3){
                rank1 -= 3;
            } else return false
        }
    }
    return true;
};
```

## 406. 根据身高重建队列

[leetcode](https://leetcode.cn/problems/queue-reconstruction-by-height/description/)

```ts
var reconstructQueue = function (people) {
    people.sort((a, b) => b[0] - a[0] || a[1] - b[1]);
    const queue = [];
    for (let i = 0; i < people.length; i++) {
        queue.splice(people[i][1], 0, people[i]);
    }
    return queue;
};
```

__两个维度先确定一个维度__  
一个是 身高无明显提示 一个是 要求前面比自己高的人数  
一定是尽量大h的i在前，先根据h从高到低排  
__贪心: 大h小k的i先入栈__  
优先满足限定要求最小的  
排序完成后，对i来说，左侧调换序 都不影响 后续i的座序  
相较左侧，i是小h，往前插也不会影响左侧已经排好的限制k  
同h小k 必须在 同h大k 前入queue，即排序时靠左，  
如果同h小k在同h大k 的后续压入queue,则必被在 同h大k 左侧，同h大k超额

## 452. 用最少数量的箭引爆气球

其实就是区间覆盖,给几个区间,每个区间存在重复与不充分,找出最多的重复区间

[leetcode](https://leetcode.cn/problems/minimum-number-of-arrows-to-burst-balloons/description/)

```js
var findMinArrowShots = function (points) {
    points.sort((a, b) => a[1] - b[1]);
    let result = 0;
    let preEnd = -Infinity;

    for (const [start, end] of points) {
        if (preEnd < start) {
            result++;
            preEnd = end;
        }
    }
    return result;
};
```

贪心: 尽可能留下`i[end]`小的区间，给后面留位置  
思路: `i[end]` 由小到大排序，找不重叠区间数  
`preEnd < i[start]`：当前箭无法命中i，`result++`新加箭射当前`i[end]`  
每一箭 必然在这n个气球中最靠左的右边界位置

## 435. 无重叠区间

[leetcode](https://leetcode.cn/problems/non-overlapping-intervals/)

```js
var eraseOverlapIntervals = function(intervals) {
    intervals.sort((a,b) => a[1] - b[1]);
    let count = 0;
    let preEnd = -Infinity;

    for (const [start, end] of intervals) {
        if (preEnd <= start) {
            count++;
            preEnd = end;
        }
    }
    return intervals.length - count;
};
```

贪心: 尽可能留下`i[end]`小的区间，给后面留位置  
思路: `i[end]` 由小到大排序，找不重叠区间数  
与 452. 引爆气球(找不重叠区间数) 完全一致  
这里是开区间，if (preEnd <= start) 代替 if (preEnd < start) 就行

## 763. 划分字母区间

[leetcode](https://leetcode.cn/problems/partition-labels/)

```js
var partitionLabels = function (s) {
    const map = {};
    for (let i = 0; i < s.length; i++) map[s[i]] = i;
    const result = [];
    let start = 0;
    let end = 0;
    for (let i = 0; i < s.length; i++) {
        end = Math.max(end, map[s[i]]);
        if (i === end) {
            result.push(end - start + 1);
            start = end + 1;
        }
    }
    return result;
};
// [ 9, 7, 8 ]
console.log(partitionLabels('ababcbacadefegdehijhklij'));
```

## 56. 合并区间

[leetcode](https://leetcode.cn/problems/merge-intervals/description/)

```js
var merge = function(intervals) {
    intervals.sort((p, q) => p[0] - q[0]);
    const result = [];
    for (const range of intervals) {
        const l = result.length;
        if (l && result[l - 1][1] >= range[0]) {
            result[l - 1][1] = Math.max(result[l - 1][1], range[1]);
        } else {
            result.push(range);
        }
    }
    return result;
};
```

452「射最少箭」、435「保留最多不重叠区间」  
贪婪: 希望尽早结束，给后续留更多空间 => i[end]升序  
56「合并区间」  
贪婪: 希望尽早吞并，保证连续 => i[start]升序

如果这里还 i[end]升序 正序遍历, [[1,2],[4,5],[1,6]] 就会出问题  
实际上 i[end]升序 倒序遍历 确实也能做这题

另外，发现新range立即push，再在result中修改，这种写法很优秀  
而不是使用额外变量，计算到每个区间最大最终结果时(发现下一个区间时)才push  
因为计算最后一个区间时，是没有(发现下一个区间)这种时机的。

## 738. 单调递增的数字

[leetcode](https://leetcode.cn/problems/monotone-increasing-digits/)

```js
var monotoneIncreasingDigits = function(n) {
    let result = `${n}`.split('')
    const l = result.length;
    let flag = l
    for(let i = l - 1; i > 0; i--) {
        if(result[i-1] > result[i]) {
            flag = i
            result[i-1]-- 
        }
    }
    for(let i = flag; i < l; i++) result[i] = 9
    return +result.join('')
};
console.log(monotoneIncreasingDigits(53321));
// 只要发现 n[i-1] > n[i], n[i-1]退一位, i到末尾全变9
// 如果左往右遍历, 当 n[i-1] === n[i] > n[i+1] 会出错
// 332, 从前往后轮 得到错误答案 329(正确答案299)
// 53321
// 53319
// 53299
// 52999
// 49999
```
