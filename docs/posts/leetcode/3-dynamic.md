---
title: 动态规划
date: 2025-11-02 23:15:09
categories: 技术栈
tags:
    - 算法题
---

解决的问题: __重叠子问题__ __无后效性的问题__

解题的本质: __递归__(思想) + __记忆化搜索__(工具) + __递推__(实现)

解题的思路: 通过 状态定义(保留求解所需的最小信息) 消除后效性, 转变成小问题, 得到递推

如何无后效性: __状态定义增加维度__ __状态定义更细致准确__

贪心每次选最优解，与上一个状态无关

1. 确定dp数组含义
2. 确定递推公式
3. 确定dp初始值
4. 确定遍历顺序
5. 举例推导dp数组

路径问题 背包问题 打家劫舍 股票问题 子序列问题

[leetcode](https://leetcode.cn/problems/maximum-subarray/solutions/9058/dong-tai-gui-hua-fen-zhi-fa-python-dai-ma-java-dai)

__无后效性__: 后续求解问题新增加的

将问题定义成一个个 无后效性的子问题，

在通过找第一个子问题与第二个子问题的递进联系得到递推公式

## 基础问题

### 509. 斐波那契数

[leetcode](https://leetcode.cn/problems/fibonacci-number/)

```js
var fib = function(n) {
    const dp = [0,1]
    for(let i = 2; i <= n; i++) {
        dp[i] = dp[i-1] + dp[i-2]
    }
    return dp[n]
};
```

### 70. 爬楼梯

[leetcode](https://leetcode.cn/problems/climbing-stairs/)

```js
var climbStairs = function(n) {
    const dp = new Array(n).fill(0)
    dp[0] = 1
    dp[1] = 1
    for(let i = 2; i <= n; i++) {
        dp[i] = dp[i-1] + dp[i-2]
    }
    return dp[n]
};
```

### 746. 使用最小花费爬楼梯

[leetcode](https://leetcode.cn/problems/min-cost-climbing-stairs/)

```js
var minCostClimbingStairs = function(cost) {
    // 从大往小思考，主要是为了方便把递归翻译成递推
    // 动态规划有「选或不选」和「枚举选哪个」两种基本思考方式
    // 0 和 1 无需花费
    // 思考递归的过程是怎么写的，就是递推公式
    const n = cost.length;
    const f = Array(n + 1).fill(0);
    for (let i = 2; i <= n; i++) {
        f[i] = Math.min(f[i - 1] + cost[i - 1], f[i - 2] + cost[i - 2]);
    }
    return f[n];
};
// 优化空间复杂度，因为dp[i]就是由前两位推出来的，那么也不用dp数组了
var minCostClimbingStairs = function(cost) {
    let before = after = 0
    for(let i = 2; i <= cost.length; i++) {
        const now =  Math.min(after + cost[i-1], before + cost[i-2])
        before = after
        after = now
    }
    return after
};
```

### 62. 不同路径

[leetcode](https://leetcode.cn/problems/unique-paths/)

```js
var uniquePaths = function (m, n) {
    // dp[i][j] 到达 i j 有多少种走法，抛弃0 0，从 1 1 开始
    // dp[i][j] = dp[i-1][j] + dp[i][j-1],要走到ij,必须走到i-1 或 j-1。
    // 从[1,1] 走到 [m,n] 需要初始化第一行及第一列为1
    const dp = new Array(m + 1).fill(0).map(() => new Array(n + 1).fill(1))
    for (let i = 2; i <= m; i++) {
        for (let j = 2; j <= n; j++) {
            dp[i][j] = dp[i - 1][j] + dp[i][j - 1]
        }
    }

    return dp[m][n]
};

var uniquePaths = function (m, n) {
    const dp = new Array(n + 1).fill(1);
    for (let i = 2; i <= m; i++) {
        for (let j = 2; j <= n; j++) {
            dp[j] = dp[j] + dp[j - 1];
        }
    }
    return dp[n];
};
```

### 63. 不同路径 II

[leetcode](https://leetcode.cn/problems/unique-paths-ii/)

```js
var uniquePathsWithObstacles = function (obstacleGrid) {
    const m = obstacleGrid.length;
    const n = obstacleGrid[0].length;
    const dp = Array(m).fill(0).map(() => Array(n).fill(0));

    // 初始化第一行及第一列为1，如果障碍物恰巧在这，则行列后续均为0
    for (let i = 0; i < m && !obstacleGrid[i][0]; i++) dp[i][0] = 1;
    for (let j = 0; j < n && !obstacleGrid[0][j]; j++) dp[0][j] = 1;

    for (let i = 1; i < m; i++) {
        for (let j = 1; j < n; j++) {
            if (obstacleGrid[i][j]) continue;
            dp[i][j] = dp[i - 1][j] + dp[i][j - 1];
        }
    }

    return dp[m - 1][n - 1];
};
// 2
console.log(uniquePathsWithObstacles([[0,0,0],[0,1,0],[0,0,0]]));
```

一维解法

```js
var uniquePathsWithObstacles = function (obstacleGrid) {
    const m = obstacleGrid.length;
    const n = obstacleGrid[0].length;
    const dp = Array(n).fill(0);
    dp[0] = 1;
    // 要从 i=0 j=0开始完成初始化, 一样能做到石头开始全为0
    for (let i = 0; i < m; i++) {
        // 如果石头在j0列，则j0列后续会一直是0
        if (obstacleGrid[i][0]) dp[0] = 0;
        for (let j = 1; j < n; j++) {
            // 这里不能continue，因为一维这里会有数，要清0
            if (obstacleGrid[i][j]) dp[j] = 0;
            else dp[j] = dp[j] + dp[j - 1];
        }
    }
    return dp[n - 1];
};
// 2
console.log(uniquePathsWithObstacles([[0, 0, 0], [0, 1, 0], [0, 0, 0]]));
```

### 343. 整数拆分

[leetcode](https://leetcode.cn/problems/integer-break/)

```js
// 递归问题: f(n) = max(1 * f(n - 1), 2 * f(n - 2), ..., (n - 1) * f(1))。
var integerBreak = function (n) {
    // dp[i] 拆分 i 能得到的最大乘积，i 从 0 到 n
    // dp[i] = 遍历到j时，j是必拆。此时存在两种情况
    //  j * (i - j): 剩余的数不拆
    //j * dp[i - j]: 剩余的数也拆(j*剩余数拆的最大值)
    //        dp[i]: 得是 j 遍历的循环中的最大值，所以 是三者取最大
    // dp[0]无意义 dp[1]无意义 均无法拆分 dp[2] = 1，其他得赋值0
    let dp = new Array(n + 1).fill(0)
    dp[2] = 1
    for (let i = 3; i <= n; i++) {
        // 对于每个i，遍历其 先拆出j能得的最大值，遍历完j后得到当前i能拆出的最大乘积
        // 至少拆出两个数，两个数遍历到拆一半的时候肯定是最大的，
        // 进一步假设是拆出三个数，那应该遍历到1/3就行，到1/2肯定够
        // 所以j <= i / 2
        // 这里是j<= i/2, 不是<, 不是n/2
        for (let j = 1; j <= i / 2; j++) {
            dp[i] = Math.max(j * (i - j), j * dp[i - j], dp[i])
        }
    }
    return dp[n]
};
// 问题来了，什么时候要一重循环，什么时候要二重循环？
// 那就是内部得多遍历一层，内部可能两种情况，三种情况，k种情况
// 这k种情况也依赖上一次的选择，总体有点像动态规划里再动态规划
```

```js
function integerBreak(n) {
    if (n === 2) return 1;
    if (n === 3) return 2;

    let result = 1;
    while (n > 4) {
        result *= 3;
        n -= 3;
    }
    result *= n;
    return result;
}
```

数学解法,连续实数问题: 连续版用微积分可得, 等份时极大点在 e ≈ 2.718

即贪心解法: 尽量切出3, 余5切出`3*2`, 余4切出`2*2`(相当于余4不切)

## 背包问题

1.是排序问题还是组合问题？(外层循环是物品i还是容量j？)

组合问题不考虑顺序，固定顺序，外层循环为 遍历物品i  
排序问题考虑顺序， 外层循环为 遍历容量j

2.是完全背包问题，还是01背包问题?(内层循环是正序还是倒序？)

完全背包物品i数量无限，01背包物品仅存在两种状态

01背包 不重复计算当前 物品i， 内层容量j从后往前循环  
完全背包 重复计算当前 物品i， 内层容量j从前往后循环

01背包、完全背包、多重背包、分组背包和混合背包

注意很多 dp[i]的定义 dp[i] i既是value又是weight

### 416. 分割等和子集(01背包)

给出一个总数，一些物品，问能否凑成这个总数  
[leetcode](https://leetcode.cn/problems/partition-equal-subset-sum/)

698.划分为k个相等的子集  
473.火柴拼正方形

一维解法

```js
// 本质是 集合里能否出现总和为 sum / 2 的子集
var canPartition = function(nums) {
    // 本质是能否把sum/2的背包装满
    const sum = nums.reduce((pre, cur) => pre + cur, 0)
    if(sum % 2 === 1) return false
    const capacity = sum / 2
    // dp[i]: 当前容量能否被放满
    const dp = Array(capacity+1).fill(false)
    // 减的剩下0空间了，自然为true
    dp[0] = true
    for(let i = 0; i < nums.length; i++) {
        // 到当前j 的时候，前面的j还要用，所以倒序
        for(let j = capacity; j >= nums[i] ; j-- ) {
            // 不放 || 放
            dp[j] = dp[j] || dp[j-nums[i]]
        }
        // console.log(i,nums[i],dp);
    }

    return dp[capacity]
};
// true
console.log(canPartition([1,5,11,5]));
```

二维解法

```js
var canPartition = function (nums) {
    const sum = nums.reduce((pre, cur) => pre + cur, 0);
    if (sum % 2 !== 0) return false;
    const capacity = sum / 2;
    const m = nums.length;
    const n = capacity;

    // dp[i][j]: 前 i 个数是否能装满容量 j
    const dp = Array(m + 1).fill(0).map(() => Array(n + 1).fill(false));
    // 无物品且容量0可达
    dp[0][0] = true; 
    for (let i = 1; i <= m; i++) {
        const w = nums[i - 1];
        for (let j = 0; j <= capacity; j++) {
            if (w > j) dp[i][j] = dp[i - 1][j];
            else dp[i][j] = dp[i - 1][j] || dp[i - 1][j - w];
        }
    }

    return dp[m][n];
};
// true
console.log(canPartition([1,5,11,5]));
```

### 1049. 最后一块石头的重量 II(01背包)

给出一个总数，一些物品，问能否凑成这个总数  
[leetcode](https://leetcode.cn/problems/last-stone-weight-ii/)

一维解法

```js
var lastStoneWeightII = function (stones) {
    const sum = stones.reduce((pre, cur) => pre + cur, 0);
    const capacity = Math.floor(sum / 2);
    const m = stones.length;
    const n = capacity;
    const dp = Array(n + 1).fill(0);

    for (let i = 0; i < m; i++) {
        for (let j = capacity; j >= stones[i]; j--) {
            dp[j] = Math.max(dp[j], stones[i] + dp[j - stones[i]]);
        }
    }

    return Math.abs(dp[n] * 2 - sum);
};
```

二维解法

```js
var lastStoneWeightII = function (stones) {
    // 这题本质是找到尽可能接近 sum/2 的组，也即 背包的 value/容量 最大 为 sum/2。
    // dp[j]: 前j项最大价值为dp[j]
    // 总容量j 减去当前j的容量，剩余的容量的价值， 加上当前j的价值；与上一次ap[j]比出最大值
    const sum = stones.reduce((pre, cur) => pre + cur, 0);
    const capacity = Math.floor(sum / 2);
    const m = stones.length;
    const n = capacity;
    // 无物品 dp[0][*] = 0; 无容量 dp[*][0] = 0
    const dp = Array(m + 1).fill(0).map(() => Array(n + 1).fill(0));
    // 因为会有 i-1,所以上面多造了一行0
    for (let i = 1; i <= m; i++) {
        const w = stones[i - 1];
        for (let j = 0; j <= capacity; j++) {
            // 如果 物品i的重量w > 容量j, 说明放不下, 直接继承(一维写法可直接跳过，自动就继承了)
            if (w > j) dp[i][j] = dp[i - 1][j];
            // 不放: dp[i-1][j]; 放: w + dp[i-1][j-w](意为 i放进去 + 放满剩下的重量)
            else dp[i][j] = Math.max(dp[i - 1][j], w + dp[i - 1][j - w]);
        }
        // console.log(i,w,dp[i]);
    }
    return Math.abs(dp[m][n] * 2 - sum);
};
// 1 2 [ 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2 ]
// 2 7 [ 0, 0, 2, 2, 2, 2, 2, 7, 7, 9, 9, 9 ]
// 3 4 [ 0, 0, 2, 2, 4, 4, 6, 7, 7, 9, 9, 11 ]
// 4 1 [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11 ]
// 5 8 [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11 ]
// 6 1 [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11 ]
// 1
console.log(lastStoneWeightII([2, 7, 4, 1, 8, 1]));
```

### 494. 目标和(01背包,组合)

给出一个总数，一些物品，问能否凑成这个总数  
[leetcode](https://leetcode.cn/problems/target-sum/)

一维解法

```js
var findTargetSumWays = function (nums, target) {
    // 本质是 将数组分成两个集合，其中一个集合比另一个集合多 target
    // 转换成数学就是, 要装满下面的 大集合capacity 有多少种方法
    // 小集合 = sum - capacity ;  capacity - 小集合 = target;
    // 大集合capacity = (sum + target) / 2
    const sum = nums.reduce((pre, cur) => pre + cur, 0);
    if (Math.abs(target) > sum) return 0
    if ((target + sum) % 2 === 1) return 0;
    
    const capacity = (sum + target) / 2;
    const dp = Array(capacity + 1).fill(0);
    dp[0] = 1;
    for (let i = 0; i < nums.length; i++) {
        for (let j = capacity; j >= nums[i]; j--) {
            // 不加入 + 加入
            dp[j] = dp[j] + dp[j - nums[i]];
        }
        // console.log(i, nums[i], dp);
    }
    return dp[capacity];
};
// 0 1 [ 1, 1, 0, 0, 0 ]
// 1 1 [ 1, 2, 1, 0, 0 ]
// 2 1 [ 1, 3, 3, 1, 0 ]
// 3 1 [ 1, 4, 6, 4, 1 ]
// 4 1 [ 1, 5, 10, 10, 5 ]
// console.log(findTargetSumWays([1, 1, 1, 1, 1], 3));
```

### 474. 一和零

[leetcode](https://leetcode.cn/problems/ones-and-zeroes/)

```js
var findMaxForm = function (strings, m, n) {
    // 【两个维度的容量】 的计算过程需要记录
    // dp[m][n] 满足m n的最大子集长度，初始为0
    const dp = Array(m + 1).fill(0).map(() => Array(n + 1).fill(0));

    for (const str of strings) {
        let zero = (one = 0);
        for (let c of str) {
            if (c === '0') zero++;
            else one++;
        }
        // 倒序: 这题本质是以前的一维滚动数组，要复上一轮str数据，每轮刷整个二维数组
        for (let i = m; i >= zero; i--) {
            for (let j = n; j >= one; j--) {
                // 不放 放
                dp[i][j] = Math.max( dp[i][j], dp[i - zero][j - one] + 1 );
            }
        }
    }
    return dp[m][n]
};
```

### 为什么滚动数组需要倒叙遍历？

因为滚动数组复用需要i-1轮遍历的结果，

假设从后往前做遍历，我们在做第i轮循环的时候，先计算 容量j 较大的数据，此数据会依赖 i-1 轮的遍历结果

前面还依旧保留者 i-1次遍历的dp数据，以供第i轮使用。

假设从前往后做遍历，可以预见 容量j 较小的dp数据会先被覆盖成为 第i轮的数据，使得 容量j较大的数据无法复用 i-1轮的结果，

或者说这样遍历，导致每轮i种，每个容量j 都基于了新的当前i去计算(视为有无数个i物品，也即完全背包问题)

以01背包的思路 甚至可以认为，这样从前往后遍历，已经不仅仅有i层，而是 i*j 层。因为每个 j-1 其实都已经被覆盖为了第j层的数据

## 完全背包

完全背包和01背包问题唯一不同的地方就是，每种物品有无限件。

01背包:当前物品放或不放，完全背包:当前物品放无数个

所以 我们每次基于前面已经考虑过当前i物品存在情况的`dp[i]`进行推导，

而非上一列未考虑当前i物品存在的`dp[i-1]`

所以 01背包和完全背包 在一维dp算法上有区别, 遍历顺序

01背包 从大到小遍历(复用i-1的数据)，完全背包 从小到大遍历(复用物品i已存在的数据)

### 518. 零钱兑换 II

[leetcode](https://leetcode.cn/problems/coin-change-ii/)

```js
var change = function (amount, coins) {
    const dp = Array(amount + 1).fill(0);
    dp[0] = 1;
    for (let i = 0; i < coins.length; i++) {
        for (let j = coins[i]; j <= amount; j++) {
            dp[j] += dp[j - coins[i]];
        }
    }
    return dp[amount]
};
```

这题是求 【多少种摆法】而不是求【能装满背包的最大价值】  
因此 外层内层循环 不能互换(纯完全背包求价值，可以互换)  
同时 因为是求凑成总和的组合数，所以这题要的是 组合，必须 外物体内容量

### 完全背包的排列和组合

组合: __外层遍历物体，内层遍历容量__ 物品顺序固定，不存在重复

```js
for (int i = 0; i < coins.size(); i++) { // 先固定“使用哪些物品”
    for (int j = coins[i]; j <= amount; j++) { // 再考虑“凑成 j 的方式”
        dp[j] += dp[j - coins[i]];
    }
}

//  5 [1,2,5]
0 1 [ 1, 1, 1, 1, 1, 1 ]
1 2 [ 1, 1, 2, 2, 3, 3 ]
2 5 [ 1, 1, 2, 2, 3, 4 ]
```

排列: __外层遍历容量，内层遍历物体__ 对每个容量，末尾放入物体

```js
var change = function (amount, coins) {
    const dp = Array(amount + 1).fill(0)
    dp[0] = 1
    for (let j = 1; j <= amount; j++) { // 遍历容量
        for (let i = 0; i < coins.length; i++) { // 遍历物品
            dp[j] += dp[j - coins[i]];
        }
    }
    return dp[amount]
};

//  5 [1,2,5]
//  0  1  2  3  4  5
0 [ 1, 0, 0, 0, 0, 0 ]
1 [ 1, 1, 0, 0, 0, 0 ]
2 [ 1, 1, 2, 0, 0, 0 ]
3 [ 1, 1, 2, 3, 0, 0 ]
4 [ 1, 1, 2, 3, 5, 0 ]
5 [ 1, 1, 2, 3, 5, 9 ]
```

针对每一个容量，放入 1 2 5，  
例如: dp[4] 时,  
i = 1(末尾放入1,剩下3), dp[4] = dp[4] + dp[3] = 0 + 3 = 3  
i = 2(末尾放入2,剩下2), dp[4] = dp[4] + dp[2] = 3 + 2 = 5  
i = 5(末尾放入5), 跳过  
dp[4] 共计有 3 + 2 种排列方式

抽象理解:  
dp[j] = dp[j] + dp[j - coins[i]] 代表 末尾放入当前i，剩余容量再找dp  
一轮内层物体i遍历完之后，dp[j] 就是这些摆法之和  
每轮算好dp数组一个数，  
所有数在当前容量末尾的情况都遍历到了，排列

> 外物体内容量的 dp打印 总是 数据修改均匀分布  
> 外容量内物体的 dp打印 总是 数据在左下三角，右上全是0  
> 因为横纵坐标都是 容量 每轮确定一个容量的结果

### 377. 组合总和 Ⅳ

[leetcode](https://leetcode.cn/problems/combination-sum-iv/)

```js
var combinationSum4 = function(nums, target) {
    // 很简单容量为4，nums种找元素装满target，但强调顺序
    // dp[i] 装满dp[i] 有几种方法
    const dp = Array(target + 1).fill(0)
    // 初始化容量为0 有1种摆法(j-nums[i]=0物体恰好适配容量，应+1)
    dp[0] = 1
    for(let j = 1; j <= target; j++) {
        // 区分顺序，针对每个容量，遍历item
        for(let i = 0; i < nums.length; i++) {
            if(j < nums[i]) continue;
            dp[j] += dp[j - nums[i]]
        }
        // console.log(j,dp);
    }

    return dp[target]
};
// 1 [ 1, 1, 0, 0, 0 ]
// 2 [ 1, 1, 2, 0, 0 ]
// 3 [ 1, 1, 2, 4, 0 ]
// 4 [ 1, 1, 2, 4, 7 ]
// 7
console.log(combinationSum4([1,2,3],4));
```

### 70. 爬楼梯(每次任意级台阶)

[leetcode](https://leetcode.cn/problems/climbing-stairs/)

题目修改为每次可走任意级台阶m

```js
var climbStairs = function(n, m) {
    const dp = Array(n+1).fill(0)
    dp[0] = 1
    for(let j = 1; j <= n; j++) {
        for(let i = 1; i <= m && i <= j; i++ ) {
            dp[j] += dp[j-i]
        }
    }
    return dp[n]
}
```

容量为n 元素为1-m, 到n共有多少种排列  
dp[j]: 装满容量j共有 dp[j] 种排列  
`&& i <= j` 代替了 `if(j < nums[i])` 因为这里i与物体大小一一对应，可以这样写

### 322. 零钱兑换

[leetcode](https://leetcode.cn/problems/coin-change/)

```js
var coinChange = function (coins, amount) {
    // 背包容量amount，元素coins，最少元素满足amount
    // 这题内外循环都行
    const dp = Array(amount + 1).fill(Infinity);
    // `j-coins[i]=0`剩余容量0，要补的钱数也0
    dp[0] = 0;
    for (let i = 0; i < coins.length; i++) {
        for (let j = coins[i]; j <= amount; j++) {
            dp[j] = Math.min(dp[j], dp[j - coins[i]] + 1);
        }
        // console.log(i,coins[i],dp)
    }
    return dp[amount] === Infinity ? -1 : dp[amount];
};
// 0 1 [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11 ]
// 1 2 [ 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5,  6  ]
// 2 5 [ 0, 1, 1, 2, 2, 1, 2, 2, 3, 3, 2,  3  ]
// 3
// console.log(coinChange([1,2,5], 11));
```

### 279. 完全平方数

[leetcode](https://leetcode.cn/problems/perfect-squares/)

```js
var numSquares = function(n) {
    // 前一选择影响后一步的选择容量等于价值
    // 是组合，外层遍历 物品i
    // 是完全背包，内层正序遍历 容量j
    // dp[i]: 和为i的最少完全平方数的数量
    // dp[i] = Math.min(dp[i], dp[j - Math.pow(i,2)])
    const dp = Array(n + 1).fill(Infinity);
    dp[0] = 0;
    for (let i = 1; i * i <= n; i++) {
        for (let j = i * i; j <= n; j++) {
            // 不选 选
            dp[j] = Math.min(dp[j], dp[j - i * i] + 1);
        }
    }
    return dp[n]
};
```

### 139. 单词拆分

[leetcode](https://leetcode.cn/problems/word-break/)

```js
// 针对每个容量，用物体一个个匹配 【排序】 【完全背包】
var wordBreak = function (s, wordDict) {
    const dp = Array(s.length + 1).fill(false);
    // 裁剪剩下的 s = '' 必然true
    dp[0] = true;
    // 
    for (let j = 1; j <= s.length; j++) {
        for (let i = 0; i < wordDict.length; i++) {
            const l = wordDict[i].length;
            if (j < l) continue;
            // 前面有匹配上 || 当前匹配上
            dp[j] = dp[j] || (wordDict[i] === s.slice(j - l, j) && dp[j - l]);
            // console.log(j, wordDict[i], s.slice(j - l, j), dp);
        }
    }
    return dp[s.length];
};
// console.log(wordBreak('leetcode', ['leet', 'code']));
```

## 多重背包

多重背包 就是 完全背包但数量有限，__其按数量摊开可视为01背包__

解法为在01背包的基础上 再加一层循环，针对 每个物品i的数量进行循环

```js
function testMultiPack() {
    const bagSize = 10;
    const weightArr = [1, 3, 4], valueArr = [15, 20, 30], amountArr = [2, 3, 2];
    const goodsNum = weightArr.length;
    const dp = new Array(bagSize + 1).fill(0);
    // 遍历物品
    for (let i = 0; i < goodsNum; i++) {
        // 遍历物品个数，j=0放第一个，j=amountArr[i]-1放最后一个
        for (let j = 0; j < amountArr[i]; j++) {
            // 遍历背包容量
            for (let k = bagSize; k >= weightArr[i]; k--) {
                dp[k] = Math.max(dp[k], dp[k - weightArr[i]] + valueArr[i]);
            }
            console.log(i,j,valueArr[i],dp);
        }
    }
}
testMultiPack();

0 0 15 [ 0, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15 ]
0 1 15 [ 0, 15, 30, 30, 30, 30, 30, 30, 30, 30, 30 ]
1 0 20 [ 0, 15, 30, 30, 35, 50, 50, 50, 50, 50, 50 ]
1 1 20 [ 0, 15, 30, 30, 35, 50, 50, 55, 70, 70, 70 ]
1 2 20 [ 0, 15, 30, 30, 35, 50, 50, 55, 70, 70, 75 ]
2 0 30 [ 0, 15, 30, 30, 35, 50, 60, 60, 70, 80, 80 ]
2 1 30 [ 0, 15, 30, 30, 35, 50, 60, 60, 70, 80, 90 ]
```

### 代码随想录递推公式总结篇

[leetcode](<https://programmercarl.com/%E8%83%8C%E5%8C%85%E6%80%BB%E7%BB%93%E7%AF%87.html#%E8%83%8C%E5%8C%85%E9%80%92%E6%8E%A8%E5%85%AC%E5%BC%8F>>

### 198.打家劫舍

[leetcode](https://leetcode.cn/problems/house-robber/descrtihuption/)

```js
var rob = function(nums) {
    // dp[i] 前i项 偷与不偷 能获取的钱的大值
    // dp[0] 只有1个房屋自然 = nums[0], dp[1] 自然是max两个房屋
    const dp = [nums[0], Math.max(nums[0], nums[1])];
    for (let i = 2; i < nums.length; i++) {
        dp[i] = Math.max(dp[i - 2] + nums[i], dp[i - 1]);
    }
    return dp[nums.length - 1];
};
// [ 2, 7, 11, 11, 12 ]
rob([ 2, 7,  9,  3,  1 ])
```

通用解法

```js
var rob = function (nums) {
    const l = nums.length;
    // dp[i][0]: 不偷i前i项最多能拿的钱, dp[i][1]: 偷i前i项最多能拿的钱
    const dp = Array(l + 1).fill(0).map(() => Array(2).fill(0));
    // 表示逐渐增加的房子: 不偷 偷
    for (let i = 1; i <= l; i++) {
        dp[i][0] = Math.max(dp[i - 1][0], dp[i - 1][1]);
        dp[i][1] = nums[i - 1] + dp[i - 1][0];
    }
    return Math.max(dp[l][0], dp[l][1]);
};
// console.log(rob([2,7,9,3,1])); // 12
```

### 213.打家劫舍II

[leetcode](https://leetcode.cn/problems/house-robber-ii/)

类似循环的题目都可以 首/尾 各做一次再手动比较一次的做法

```js
var rob = function (nums) {
    // 多了一层选首不能选尾，选尾不能选首，也即多一个max
    if (nums.length === 1) return nums[0]
    const front = robRange(nums, 0, nums.length - 2)
    const end = robRange(nums, 1, nums.length - 1)
    return Math.max(front, end)
};

// s -> startIndex  e -> endIndex
const robRange = (nums, s, e) => {
    if (s === e) return nums[s]
    // 这里必须nums.length创建array，因为dp得和nums的i对应上
    const dp = Array(nums.length).fill(0)
    dp[s] = nums[s]
    dp[s + 1] = Math.max(nums[s], nums[s + 1])
    for (let i = s + 2; i <= e; i++) {
        dp[i] = Math.max(dp[i - 1], dp[i - 2] + nums[i])
    }
    // console.log(dp);
    return dp[e]
}
rob([ 2, 3, 2 ])
[ 2, 3, 0 ]
[ 0, 3, 3 ]
```

### 337. 打家劫舍 III

[leetcode](https://leetcode.cn/problems/house-robber-iii/)

```js
const rob = root => {
    // 后序遍历函数
    const postOrder = node => {
        // 递归出口
        if (!node) return [0, 0];
        // 遍历左子树
        const left = postOrder(node.left);
        // 遍历右子树
        const right = postOrder(node.right);
        // 不偷当前节点，左右子节点都可以偷或不偷，取最大值
        const DoNot = Math.max(left[0], left[1]) + Math.max(right[0], right[1]);
        // 偷当前节点，左右子节点只能不偷
        const Do = node.val + left[0] + right[0];
        // [不偷，偷]
        return [DoNot, Do];
    };
    const res = postOrder(root);
    // 返回最大值
    return Math.max(...res);
};
```

## 买卖股票

为什么 股票问题 __必须显式设定两种或以上状态__, 而 背包问题 不需要?

背包问题 不需要记录前一次状态, i选择效果 只依赖于 剩余容量, 只需记录容量唯一维度

买卖股票本质上是一个有后效性的问题, i选择效果 依赖于 i-1的状态

我们通过设定 多个维度的状态记录器, 将其变为无后效性问题

假设简单设定 `dp[i]表示前i天最大利润`, 则无法模拟买入卖出的互斥关系

可简化: 由于 买卖股票 只依赖于i-1, 只需要够记录上一层状态 变量, 而不使用dp数组

> 198.打家劫舍 同理！

### 121.买卖股票的最佳时机

[leetcode](https://leetcode.cn/problems/best-time-to-buy-and-sell-stock/)

```js
var maxProfit = function (prices) {
    const l = prices.length;
    // 只能买卖一次，假设昨天是卖出的状态，那今天再买入就只有-prices[i],
    const dp = Array(l).fill(0).map(() => Array(2).fill(0));
    dp[0] = [-prices[0], 0];
    for (let i = 1; i < prices.length; i++) {
        // 持有: 昨天持有 昨天不持有
        dp[i][0] = Math.max(dp[i - 1][0], -prices[i]);
        // 不持有: 昨天不持有 昨天持有
        dp[i][1] = Math.max(dp[i - 1][1], dp[i - 1][0] + prices[i]);
    }
    return dp[l - 1][1];
};
// [[0, -7], [0, -1], [4, -1], [4, -1], [5, -1], [5, -1]]
console.log(maxProfit([7, 1, 5, 3, 6, 4]));
```

只能买卖一次，今天买入 的代价恒为 `-prices[i]`, 不由 `dp[i-1][0]`转移而来

```js
var maxProfit = function (prices) {
    let toDo = -prices[0]
    let noDo = 0
    for(let i = 1; i < prices.length; i++) {
        noDo = Math.max(noDo, toDo + prices[i])
        toDo = Math.max(toDo, -prices[i])
    }
    return noDo
};
```

动态规划 解决的问题都是 __重叠子问题__ __无后效性的问题__

解题本质是 __递归思想__ + __记忆化搜索工具__ + __递推实现__

通过 状态定义(保留求解所需的最小信息) 消除后效性, 转变成小问题, 得到递推

区分于贪心, 贪心没有状态推导, 而是从局部直接选最优的

```js
var maxProfit = function(prices) {
    let lowerPrice = prices[0];// 重点是维护这个最小值（贪心的思想） 
    let profit = 0;
    for(let i = 0; i < prices.length; i++){
        lowerPrice = Math.min(lowerPrice, prices[i]);// 贪心地选择左面的最小价格
        profit = Math.max(profit, prices[i] - lowerPrice);// 遍历一趟就可以获得最大利润
    }
    return profit;
};
```

### 122. 买卖股票的最佳时机 II

[leetcode](https://leetcode.cn/problems/best-time-to-buy-and-sell-stock-ii/)

```js
// dp[i] 前i天能获取的最大利润
var maxProfit = function(prices) {
    const l = prices.length;
    const dp = Array(l).fill(0).map(() => [0,0]);
    dp[0][0] = -prices[0]
    for(let i = 1; i < l; i++) {
        // 持有: 前一天持有 前一天不持有
        dp[i][0] = Math.max(dp[i-1][0], dp[i-1][1] - prices[i])
        // 不持有: 前一天不持有 前一天持有
        dp[i][1] = Math.max(dp[i-1][1], dp[i-1][0] + prices[i])
    }
    return dp[l-1][1]
};
```

```js
var maxProfit = function (prices) {
    let toDo = -prices[0]
    let noDo = 0
    for(let i = 1; i < prices.length; i++) {
        // const preNoDo = noDo
        // const preToDo = toDo
        noDo = Math.max(noDo, toDo + prices[i])
        toDo = Math.max(toDo, noDo - prices[i])
    }
    return noDo
};

console.log(maxProfit([7, 1, 5, 3, 6, 4]))
```

noDo 已经更新, 却还能直接用于计算 toDo, 因为这题当天能卖能买, 巧合成功

309（含冷冻期）或 714（含手续费）等情形中, 就不能这样写

### 123. 买卖股票的最佳时机 III

[leetcode](https://leetcode.cn/problems/best-time-to-buy-and-sell-stock-iii/)

```js
var maxProfit = function(prices) {
    const l = prices.length;
    const dp = Array(l).fill(0).map(() => [0,0,0,0]);
    // 第一次持有
    dp[0][0] = -prices[0]; 
    // 第二次持有(第一次当天买当天卖,再第二次持有)
    dp[0][2] = -prices[0];  

    for (let i = 1; i < l; i++) {
        // 第一次持有
        dp[i][0] = Math.max(dp[i-1][0], -prices[i]);
        // 第一次不持有
        dp[i][1] = Math.max(dp[i-1][1], dp[i-1][0] + prices[i]);
        // 第二次持有（依赖第一次不持有）
        dp[i][2] = Math.max(dp[i-1][2], dp[i-1][1] - prices[i]);
        // 第二次不持有（依赖第二次买入）
        dp[i][3] = Math.max(dp[i-1][3], dp[i-1][2] + prices[i]);
    }

    return dp[l-1][3];
};
// maxProfit([2,1,4,5,2,9,7])
```

第一次卖出和第二次卖出，不需要特意切换，前期 第一次 第二次 就是在同线执行。

只需要一次买卖的情况，`dp[l-1][4]` 和 `dp[l-1][2]` 是相等的。

但如果是需要两次买卖的情况，一定是 `dp[l-1][4]` 大

```js
const maxProfit = prices => {
    const len = prices.length;
    const dp = new Array(5).fill(0);
    dp[1] = -prices[0];
    dp[3] = -prices[0];
    for (let i = 1; i < len; i++) {
        dp[1] = Math.max(dp[1], dp[0] - prices[i]);
        dp[2] = Math.max(dp[2], dp[1] + prices[i]);
        dp[3] = Math.max(dp[3], dp[2] - prices[i]);
        dp[4] = Math.max(dp[4], dp[3] + prices[i]);
    }
    return dp[4];
};
```

### 188. 买卖股票的最佳时机 IV

[leetcode](https://leetcode.cn/problems/best-time-to-buy-and-sell-stock-iv/)

```js
var maxProfit = function (k, prices) {
    // 题目要求 可以做k次买卖，同一时间只能做一笔
    // 但模拟中其实是同时在做，但如果有多笔，后续会计入前面的收益
    // 其实在每轮i中，后几次的买卖都会立刻在当轮计入前面的收益
    const l = prices.length;
    const status = 2 * k + 1;
    const arr = Array(status).fill(0);
    // 初始化所有买入
    for (let k = 1; k < status; k += 2) arr[k] = -prices[0];
    for (let i = 1; i < l; i++) {
        // 遍历推导状态: 奇数是买入 偶数是卖出
        // 从1开始, 0是用来便于推导的, 不参与状态
        for (let j = 1; j < status; j++) {
            const noOrDo = j % 2 === 1
                ? arr[j - 1] - prices[i] : arr[j - 1] + prices[i];
            arr[j] = Math.max(arr[j], noOrDo);
        }
    }
    return arr[status - 1];
};
maxProfit([3, 2, 6, 5, 0, 3])

```

### 309. 买卖股票的最佳时机含冷冻期

[leetcode](https://leetcode.cn/problems/best-time-to-buy-and-sell-stock-with-cooldown/)

```js
// 每天的状态有 可买入 
var maxProfit = function (prices) {
    const l = prices.length
    const dp = new Array(l).fill(0).map(() => new Array(4).fill(0))
    dp[0][0] = -prices[0] // 持有
    // 0持有 = 前一天是， 持有 或 当天买入(保持不持有) 或 当天买入(冷静期)
    // 1保持不持有(可随时买入) = 前一天是， 保持不持有 或 冷静期
    // 2当天卖出(触发冷静期) = 前一天是， 持有
    // 3冷静期(无法买入) = 前一天是， 当天卖出
    // 23用于精确跟踪 `卖出` 和 `冷静期`
    // 合并13, 无法区分是否可买入(冷静期)
    // 合并23, 无法暂停一天, 3依赖前一天2的数据, 以此实现暂停一天
    for (let i = 1; i < l; i++) {
        dp[i][0] = Math.max(dp[i - 1][0], Math.max(dp[i - 1][1], dp[i - 1][3]) - prices[i])
        dp[i][1] = Math.max(dp[i - 1][1], dp[i - 1][3])
        dp[i][2] = dp[i - 1][0] + prices[i]
        dp[i][3] = dp[i - 1][2]
    }
    return Math.max(dp[l - 1][1], dp[l - 1][2], dp[l - 1][3])
};
```

### 714. 买卖股票的最佳时机含手续费

[leetcode](https://leetcode.cn/problems/best-time-to-buy-and-sell-stock-with-transaction-fee/)

```js
var maxProfit = function (prices, fee) {
    let hold = -prices[0] - fee
    let not = 0
    for (let i = 1; i < prices.length; i++) {
        hold = Math.max(hold, not - prices[i] - fee)
        not = Math.max(not, hold + prices[i])
    }
    return not
};
```

```js
var maxProfit = function (prices, fee) {
    const l = prices.length
    const dp = new Array(l).fill(0).map(() => new Array(2).fill(0))

    dp[0][0] = 0
    dp[0][1] = -prices[0] - fee
    for (let i = 1; i < l; i++) {
        dp[i][0] = Math.max(dp[i - 1][0], dp[i - 1][1] + prices[i])
        dp[i][1] = Math.max(dp[i - 1][1], dp[i - 1][0] - prices[i] - fee)
    }

    return dp[l - 1][0]
};
```

## 子序列问题

### 300. 最长递增子序列

[leetcode](https://leetcode.cn/problems/longest-increasing-subsequence/submissions/476442040/)

```js
const lengthOfLIS = (nums) => {
    // dp[i] 以dp[i]结尾 的最长严格递增子序列长度
    // dp[i] = 前i-1中 满足尾数小于当前数 num[j] < num[i] 中的最大值+1
    // 初始化1,且i从1开始,因为dp[0]肯定是1,且后续数很小的话也会是1
    let dp = Array(nums.length).fill(1);
    let result = 1;
    for (let i = 1; i < nums.length; i++) {
        for (let j = 0; j < i; j++) {
            if (nums[i] > nums[j]) {
                dp[i] = Math.max(dp[i], dp[j] + 1);
            }
        }
        result = Math.max(result, dp[i]);
    }
    return result;
};
// [ 1, 2, 3, 4, 5, 3, 6, 4, 5 ]
lengthOfLIS([1, 3, 6, 7, 9, 4, 10, 5, 6])
```

### 674. 最长连续递增序列

[leetcode](https://leetcode.cn/problems/longest-continuous-increasing-subsequence/)

```js
1var findLengthOfLCIS = function (nums) {
    // 要求连续，那就是以i-1为基础计算i
    let pre = 1, max = 0
    for (let i = 1; i < nums.length; i++) {
        const cur = nums[i - 1] < nums[i] ? pre + 1 : 1
        max = Math.max(max, cur)
        pre = cur
    }
    return max
};
```

### 718. 最长重复子数组

[leetcode](https://leetcode.cn/problems/maximum-length-of-repeated-subarray/)

```js
const findLength = (nums1, nums2) => {
    const [m, n] = [nums1.length, nums2.length];
    const dp = new Array(m + 1).fill(0).map(x => new Array(n + 1).fill(0));
    let res = 0;
    // 用二维数组记录所有比较情况
    // dp[i][j] 表示 nums1 前 i 个元素和 nums2 前 j 个元素的公共的、长度最长的子数组的长度
    // 递推公式需要用到i-1，所以要初始化0位置，并从1位置开始
    for (let i = 1; i <= m; i++) {
        // 每放入一个nums1[i],遍历nums2[j],找有没有跟自己相等的,有就是当前dp+1
        for (let j = 1; j <= n; j++) {
            if (nums1[i - 1] === nums2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
            }
            res = dp[i][j] > res ? dp[i][j] : res;
        }
    }
    return res;
};

const findLength2 = (nums1, nums2) => {
    const [m, n] = [nums1.length, nums2.length];
    const dp = new Array(m + 1).fill(0)
    let res = 0;
    // 由于每次都只需要用到i-1层，可使用滚动数组
    // 由于是组合问题，需要内层倒序
    for (let i = 1; i <= m; i++) {
        for (let j = n; j > 0; j--) {
            dp[j] = nums1[i - 1] === nums2[j - 1] ? dp[j - 1] + 1 : 0
            res = Math.max(res, dp[j])
        }
        console.log(dp)
    }
    return res;
};

findLength2([1, 2, 3, 2, 1], [3, 2, 1, 4, 7])

       3, 2, 1, 4, 7
  [ 0, 0, 0, 1, 0, 0 ]
1 [ 0, 0, 0, 1, 0, 0 ]
2 [ 0, 0, 1, 0, 0, 0 ]
3 [ 0, 1, 0, 0, 0, 0 ]
2 [ 0, 0, 2, 0, 0, 0 ]
1 [ 0, 0, 0, 3, 0, 0 ]
```

### 1143. 最长公共子序列

[leetcode](https://leetcode.cn/problems/longest-common-subsequence/)

```js
const longestCommonSubsequence = (text1, text2) => {
    // dp[i][j] text1中的前i 和 text2中的前j 的公共子序列最长长度
    let dp = Array.from(Array(text1.length+1), () => Array(text2.length+1).fill(0));

    for(let i = 1; i <= text1.length; i++) {
        for(let j = 1; j <= text2.length; j++) {
            if(text1[i-1] === text2[j-1]) {
                dp[i][j] = dp[i-1][j-1] +1;;
            } else {
                // 如果不相等，那就通过i延伸，或者通过j延伸
                dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1])
            }
        }
    }
    return dp[text1.length][text2.length];
};
longestCommonSubsequence("abcde","ace")
[
       a  c  e
  [ 0, 0, 0, 0 ],
a [ 0, 1, 1, 1 ],
b [ 0, 1, 1, 1 ],
c [ 0, 1, 2, 2 ],
d [ 0, 1, 2, 2 ],
e [ 0, 1, 2, 3 ]
]
```

### 1035.不相交的线

[leetcode](https://leetcode.cn/problems/uncrossed-lines/)

```js
var maxUncrossedLines = function (nums1, nums2) {
    // 找相同元素连线，而线不相交
    // 也即，在两个数组间，找相同顺序的子序列,也即最长公共子序列
    const dp = new Array(nums1.length + 1).fill(0).map(() => new Array(nums2.length + 1).fill(0))
    for(let i = 1; i <= nums1.length; i++) {
        for(let j = 1; j <= nums2.length; j++) {
            // 考虑顺序，也即排列，每次的计算都基于当前轮的计算，最新j的排列
        if(nums1[i-1] === nums2[j-1]) {
            dp[i][j] = dp[i-1][j-1] + 1
        } else {
            // 如果不相等，就考虑采用i更多，还是采用j更多,双重动态规划
            dp[i][j] = Math.max(dp[i-1][j],dp[i][j-1])
        }
        }
    }
    return dp[nums1.length][nums2.length]
};
```

### 53. 最大子序和

[leetcode](https://leetcode.cn/problems/maximum-subarray/)

```JS
var maxSubArray = function (nums) {
    // 连续：基于上一个计算，并且是排列
    let pre = max = Number.NEGATIVE_INFINITY
    // 如果pre + nums[i] 还没nums[i]大，那nums[i]就是新的头
    for (const item of nums) {
        pre = Math.max(item, pre + item)
        max = Math.max(max, pre)
    }
    return max
};
```

```js
// 标准动态规划
const maxSubArray = nums => {
    const len = nums.length;
    let dp = new Array(len).fill(0);
    dp[0] = nums[0];
    let max = dp[0];
    for (let i = 1; i < len; i++) {
        dp[i] = Math.max(dp[i - 1] + nums[i], nums[i]);
        max = Math.max(max, dp[i]);
    }
    return max;
};
```

### 392.判断子序列

[leetcode](https://leetcode.cn/problems/is-subsequence/)

```js
const isSubsequence = (s, t) => {
    // 1143.最长公共子序列的递推公式基本一样，区别是本题如果删元素一定是字符串t
    // dp[i][j] = dp[i-1][j-1] + 1
    // dp[i][j] = dp[i][j-1]
    const dp = new Array(s.length + 1).fill(0).map(() => new Array(t.length + 1).fill(0))
    for (let i = 1; i <= s.length; i++) {
        // 针对每个i遍历j，找有没有相等的，有相等的就在上一轮的基础+1
        // 如果存在i遍历j，都没找到，则都是0.则后续也全为0
        for (let j = 1; j <= t.length; j++) {
            if (s[i - 1] === t[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + 1
            } else {
                dp[i][j] = dp[i][j - 1]
            }
        }
    }
    return dp[s.length][t.length] === s.length
};
// 每次都不是 只需要上一层，或者说左上角的数据，所以不可以用滚动数组优化
// dp[i-1] 和 dp[i] 都要用到
isSubsequence("abc", "ahbgdc")

[
    [0, 0, 0, 0, 0, 0, 0],
    a[0, 1, 1, 1, 1, 1, 1],
    b[0, 0, 0, 2, 2, 2, 2],
    c[0, 0, 0, 0, 0, 0, 3]
]
```

```js
// 其实只要按顺序能在t中找到所有s就行，遍历s，在t中按顺序找
var isSubsequence = function(s, t) {
    let i = j = 0
    for(; j < t.length; j++) s[i] === t[j] && i++
    return i === s.length
};
```

### 115.不同的子序列

```js
var numDistinct = function (s, t) {

    // dp[i][j] i中出现了j多少次
    // s[i-1] === t[j-1]
    // dp[i][j] = dp[i - 1][j - 1] + dp[i - 1][j] 代表继承数量 + 前面匹配上的次数
    // dp[i][j] = dp[i - 1][j]  代表 新进的j和i不匹配，数量不加减
    // 不能用滚动数组化简，因为需要用到当前层前面的j
    const dp = new Array(s.length + 1).fill(0).map(() => new Array(t.length + 1).fill(0))

    // s中找 t长度为0，初始化为1
    for (let i = 0; i <= s.length; i++) {
        dp[i][0] = 1;
    }
    for (let i = 1; i <= s.length; i++) {
        for (let j = 1; j <= t.length; j++) {
            if (s[i - 1] === t[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + dp[i - 1][j]
            } else {
                dp[i][j] = dp[i - 1][j]
            }
        }
    }
    console.log(dp)
    return dp[s.length][t.length]
};

numDistinct("rabbbit","rabbit")
[
          r, a, b, b, i, t 
     [ 1, 0, 0, 0, 0, 0, 0 ],
    r[ 1, 1, 0, 0, 0, 0, 0 ],
    a[ 1, 1, 1, 0, 0, 0, 0 ],
    b[ 1, 1, 1, 1, 0, 0, 0 ],
    b[ 1, 1, 1, 2, 1, 0, 0 ],
    b[ 1, 1, 1, 3, 3, 0, 0 ],
    i[ 1, 1, 1, 3, 3, 3, 0 ],
    t[ 1, 1, 1, 3, 3, 3, 3 ]
]
```

### 583. 两个字符串的删除操作

### 72. 编辑距离

### 647. 回文子串

### 516.最长回文子序列
