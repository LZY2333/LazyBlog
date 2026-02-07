---
title: 回溯算法
date: 2025-07-30 09:05:01
categories: 技术栈
tags: 
    - 算法题
---

## 回溯算法

本质上就是遍历穷举和剪枝，  
但是它将求解分为多层多个阶段，发现路走不通时返回上一阶段，  
撤销当前循环的数据，继续向下遍历下一个解。  

所有回溯算法的问题都可以抽象为树，回溯算法的关键是终止条件  

本质是穷举，很多问题只能暴力搜索，甚至暴力搜索都写不出来，这时候要回溯算法来暴力搜索  

组合问题：N个数里面按一定规则找出k个数的集合  
切割问题：一个字符串按一定规则有几种切割方式  
子集问题：一个N个数的集合里有多少符合条件的子集  
排列问题：N个数按一定规则全排列，有几种排列方式  
棋盘问题：N皇后，解数独等等  

1. 思考暴力穷举是怎么解的  
2. 每一轮从哪开始(参数)，在哪结束(结束条件)  
3. 每一轮如何遍历(循环)  
4. 条件剪枝 重复项剪枝， 组合 切割 子集 排列 棋盘  

排列问题  
每层都是从0开始搜索而不是startIndex  
需要used数组记录path里都放了哪些元素，针对树枝去重发  

```js
function backTracking(参数) {
    if (终止条件) {
        存放结果;
        return;
    }

    for (选择：本层集合中元素（树中节点孩子的数量就是集合的大小）) {
        处理节点;
        backTracking(路径，选择列表); // 递归
        回溯，撤销处理结果
    }
}
```

## 一些总结

1. 终止条件取决于算法，是否存放结果取决于 题目要求

2. 打印遍历是回溯，只求总数是动态规划

3. 可以抽象为树形结构理解，就可以用回溯

4. 递归过程是树的纵向遍历，内部的for循环是树的横向遍历

5. 时间复杂度: O(n * 2^n), 即每层进行一次 2^n级别的遍历

> sort((a, b) => a - b) 才是从小到大排序，不然超过一位的数会出错

## N皇后问题

[leetcode](https://leetcode.cn/problems/n-queens/)

最经典的八皇后问题 有92个解

```js
var solveNQueens = function (n) {
    const map = new Array(n).fill(-1); // key表示row，value表示column
    const result = [];
    const solveRow = (row) => {
        // row是从0开始的,row === n棋盘已经是n+1行
        if (row === n) {
            printMap();
            return;
        }

        for (let column = 0; column < n; column++) {
            if (!check(row, column)) continue;
            map[row] = column;
            // 这里不能写++row, ++row就是实参+1了，应该写row + 1传给下一层，形参+1
            solveRow(row + 1);
            // 形参+1，不需要 回溯撤销 的过程，因为这种一维数组的map模式会自动覆盖
        }
    };

    const check = (row, column) => {
        let left = (right = column);
        // row 是从0开始的,row - 1是上一行,所以是--left
        for (let i = row - 1; i >= 0; i--) {
            if (
                map[i] === --left ||
                map[i] === ++right ||
                map[i] === column
            )
                return false;
        }
        return true;
    };
    // 打印成棋盘的格式
    const printMap = () => {
        const board = [];
        map.forEach(item => {
            let row = new Array(n).fill('.');
            row[item] = 'Q';
            board.push(row.join(''));
        })
        result.push(board);
    };

    // 别忘了调用，且要从0开始，不是n
    solveRow(0);
    return result;
};

console.log(solveNQueens(4));
```

## 77. 组合

<https://leetcode.cn/problems/combinations/description/>

给定两个整数 n 和 k，返回范围 [1, n] 中所有可能的 k 个数的组合。

```js
// 1. 思考暴力穷举是怎么解的
// 2. 每一轮从哪开始(参数)，新增参数为当前的进度，在哪结束(结束条件)
// 3. 每一轮如何遍历
var combine = function (n, k) {
    const path = [];
    const result = [];
    const backTracking = (start) => {
        if (path.length === k) {
            result.push([...path]);
            return;
        }
        // 剪枝,后续数量不够K的没必要遍历
        for (
            let i = start;
            i <= n - (k - path.length) + 1;
            i++
        ) {
            path.push(i);
            backTracking(i + 1);
            path.pop();
        }
    };

    // 别忘了调用
    backTracking(1);
    return result;
};
// [[1, 2], [1, 3], [1, 4], [2, 3], [2, 4], [3, 4]]
console.log(combine(4,2));
```

剪枝优化

```js
// 遍历对象为 [1,2,3,4]， k 为 2
// 1. "i <= n"    : 需要 =号, 因为是从1到4, n为4
// 2. "(k - path.length)": 代表还需要这么多个元素
// 3. "n - (k - path.length) + 1": 最多能从这个下标开始拿
for (let i = startIndex; i <= n - (k - path.length) + 1; ++i) {
    ...
}
```

暴力穷举是怎么解的

```js
// 假设 combine(4, 2),那result 就是 12 13 14 23 24 34
// k就是k重循环，先放i，再放j
let result = []
let path = []
for (let i = 1; i <= n; i++) {
    path = [].push(i)
    for (let j = i + 1; j <= n; j++) {
        path.push(j)
        result.push(path)
        path.pop()
    }
    path.pop()
}
```

## 216. 组合总和 III

<https://leetcode.cn/problems/combination-sum-iii/description/>

找出所有相加之和为 n 的 k 个数的组合，且满足下列条件：  
只使用数字1到9  
每个数字 最多使用一次

```js
var combinationSum3 = function (k, n) {
    const path = [];
    let sum = 0;
    const result = [];

    const backtracking = (start) => {
        if (path.length === k) {
            if (sum === n) result.push(path.slice());
            return;
        }

        for (
            let i = start;
            i <= 9 - (k - path.length) + 1 && sum + i <= n;
            i++
        ) {
            path.push(i);
            sum += i;
            backtracking(i + 1);
            sum -= i;
            path.pop();
        }
    };

    backtracking(1);
    return result;
};

console.log(combinationSum3(3, 9));
```

## 17. 电话号码的字母组合

<https://leetcode.cn/problems/letter-combinations-of-a-phone-number/description/>

给定一个仅包含数字 2-9 的字符串，返回所有它能表示的字母组合。答案可以按 任意顺序 返回。

```js
var letterCombinations = function (digits) {
    if (!digits) return []
    const map = ["", "", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz"]
    const result = [], path = []
    function backTracking(index) {
        if (index === digits.length) {
            result.push(path.join(''))
            return
        }
        for (const chart of map[digits[index]]) {
            path.push(chart)
            backTracking(index + 1)
            path.pop()
        }
    }
    backTracking(0)
    return result
};
console.log(letterCombinations('23'));
[ 'ad', 'ae', 'af', 'bd', 'be', 'bf', 'cd', 'ce', 'cf' ]
```

## 39. 组合总和

<https://leetcode.cn/problems/combination-sum/description/>

给你一个 无重复元素 的整数数组 candidates 和一个目标整数 target ，找出 candidates 中可以使数字和为目标数 target 的 所有 不同组合 ，并以列表形式返回。你可以按 任意顺序 返回这些组合。

candidates 中的 同一个 数字可以 无限制重复被选取 。如果至少一个数字的被选数量不同，则两种组合是不同的。

```js
var combinationSum = function (candidates, target) {
    const result = [];
    const path = [];
    let sum = 0;

    const backtracking = (start) => {
        // 不限制数量，到达目标结束，或者循环完了也会结束
        if (sum === target) {
            result.push(path.slice());
            return;
        }

        for (
            let i = start;
            i < candidates.length &&
            sum + candidates[i] <= target;
            i++
        ) {
            path.push(candidates[i]);
            sum += candidates[i];
            backtracking(i);
            sum -= candidates[i];
            path.pop();
        }
    };

    // sort((a, b) => a - b) 才是从小到大排序，不然超过一位的数会出错
    // 这里排序进行剪枝
    candidates.sort((a, b) => a - b);
    backtracking(0);
    return result;
};
console.log(combinationSum([2, 3, 5], 8));
// [ [ 2, 2, 2, 2 ], [ 2, 3, 3 ], [ 3, 5 ] ]
```

`backtracking(i);` i不+1，代表当前值可重复使用，且不使用用过的值

如果写成了每一层都从0开始遍历(可使用用过的值)，会导致重复(或者说解成了排列题)。

另外，假设这里求的是数量而不是打印遍历，则同 518. 零钱兑换 II，使用动态规划

```js
// 前面的选择影响后面的选择，无限次选取，完全背包问题
var combinationSum = function (candidates, target) {
    // dp[i] 代表能组成 i 的组合candidates全部组合数
    const dp = new Array(target + 1).fill(0)
    // 要组成总和0, 有1种方式
    dp[0] = 1
    // 针对每一个item遍历容量j
    for (let i = 0; i < candidates.length; i++) {
        // 可无限次选取i，完全背包问题，顺序遍历
        for (let j = candidates[i]; j <= target; j++) {
            // 如果 candidates[j] 放入后，剩余空间有可填充的dp，那就放入
            dp[j] = dp[j] + dp[j - candidates[i]]
        }
    }
    return dp[target]
};

console.log(combinationSum([2,3,6,7], 7))
// 输出2,两种:[[2,2,3],[7]]
2 [ 1, 0, 1, 0, 1, 0, 1, 0 ]
3 [ 1, 0, 1, 1, 1, 1, 2, 1 ]
6 [ 1, 0, 1, 1, 1, 1, 3, 1 ]
7 [ 1, 0, 1, 1, 1, 1, 3, 2 ]
```

## 40. 组合总和 II

<https://leetcode.cn/problems/combination-sum-ii/description/>

每个只能使用一次 candidates会出现重复

```js
var combinationSum2 = function (candidates, target) {
    const result = [];
    const path = [];
    let sum = 0;
    const backtracking = (start) => {
        if (sum === target) {
            result.push([...path]);
            return;
        }

        // 外面已经排过序了，所以 >target 可以直接去掉
        for (
            let i = start;
            i < candidates.length &&
            candidates[i] + sum <= target;
            i++
        ) {
            // 同一层的数据要去重
            if (
                i > start &&
                candidates[i] === candidates[i - 1]
            )
                continue;
            path.push(candidates[i]);
            sum += candidates[i];
            backtracking(i + 1);
            sum -= candidates[i];
            path.pop();
        }
    };

    // 不能有重复的，但数字会重复，所以必须排序
    candidates.sort((a, b) => a - b);
    backtracking(0);
    return result;
};
```

## 131. 分割回文串

<https://leetcode.cn/problems/palindrome-partitioning/description/>

给你一个字符串 s，请你将 s 分割成一些 子串，使每个子串都是 回文串 。返回 s 所有可能的分割方案。

```js
var partition = function (s) {
    const path = [], result = [];

    const backTracking = (start) => {
        if (start === s.length) {
            result.push([...path]);
            return;
        }
        for (let end = start; end < s.length; end++) {
            if (!isOK(start, end)) continue;
            path.push(s.slice(start, end + 1));
            backTracking(end + 1);
            path.pop();
        }
    };

    const isOK = (start, end) => {
        for (let i = start, j = end; i < j; i++, j--)
            if (s[i] !== s[j]) return false;
        return true;
    };

    backTracking(0);
    return result;
};
// [ [ 'a', 'a', 'b' ], [ 'aa', 'b' ] ]
console.log(partition("aab"))
```

递归用来找下一个回文切割位，

模拟切割线，其实就是index是上一层已经确定了的分割线，i是这一层试图寻找的新分割线

## 93. 复原 IP 地址

<https://leetcode.cn/problems/restore-ip-addresses/description/>

```js
var restoreIpAddresses = function (s) {
    const result = [], path = [];
    const backTracking = (start) => {
        // 长度为4就结束
        if (path.length === 4) {
            // 长度为4且字符串全部切割完成，就记录答案
            if (start === s.length)
                result.push(path.join('.'));
            return;
        }

        for (let i = start; i < s.length; i++) {
            const str = s.slice(start, i + 1);
            if (!isOK(str)) break;
            path.push(str);
            backTracking(i + 1);
            path.pop();
        }
    };
    const isOK = (str) => (str[0] !== '0' && str <= 255) || str === '0';
    backTracking(0);
    return result;
};
// ['1.0.10.23', '1.0.102.3', '10.1.0.23', '10.10.2.3', '101.0.2.3']
console.log(restoreIpAddresses("101023"))
```

## 78. 子集

<https://leetcode.cn/problems/subsets/description/>

```js
var subsets = function(nums) {
    const path = [], result = [];
    const backTracking = (start) => {
        result.push([...path])
        for(let i = start; i < nums.length; i++ ) {
            path.push(nums[i])
            backTracking(i+1)
            path.pop()
        }
    }
    backTracking(0)
    return result
};
// [[], [1], [1, 2], [1, 2, 3], [1, 3], [2], [2, 3], [3]]
console.log(subsets([1,2,3]));
```

组合问题、子集问题、分割问题都抽象为一棵树的话，

那么组合问题和分割问题都是收集树的叶子节点，而子集问题是找树的所有节点！

要求不重复，则每次要从 start 开始，不能从 0 开始

## 90. 子集 II

<https://leetcode.cn/problems/subsets-ii/description/>

同样是存在重复元素，与前面的字符串不同，字符串存在顺序，子集不存在顺序，是纯组合

__nums中含重复项__ 要做同层的剪枝

__子集而非子序列__ 可以通过sort简化同层的剪枝

```js
var subsetsWithDup = function (nums) {
    const path = [], result = [];
    nums.sort((a, b) => a - b);

    const backTracking = (start) => {
        result.push([...path]);
        for (let i = start; i < nums.length; i++) {
            if (i !== start && nums[i - 1] === nums[i]) continue;
            path.push(nums[i]);
            backTracking(i + 1);
            path.pop();
        }
    };
    
    backTracking(0);
    return result;
};
// [ [], [ 1 ], [ 1, 2 ], [ 1, 2, 2 ], [ 2 ], [ 2, 2 ] ]
console.log(subsetsWithDup([1, 2, 2]));
```

这题关键是如何 同层去重，假设此题要的是序列，要保持原顺序，不能sort

```js
var subsetsWithDup = function (nums) {
    const result = [], path = []
    function backTracking(index) {
        const map = {}
        result.push(Array.from(path))
        // 那就需要通过记录 usedMap，进行同层去重，而不sort，sort会导致乱序
        for (let i = index; i < nums.length; i++) {
            if (map[nums[i]]) continue
            map[nums[i]] = true
            path.push(nums[i])
            backTracking(i + 1)
            path.pop()
        }
    }
    backTracking(0)
    return result
};
console.log(subsetsWithDup([2, 1, 2]));
[[], [2], [2, 1], [2, 1, 2], [2, 2], [1], [1, 2]]
```

## 491.递增子序列

<https://leetcode.cn/problems/non-decreasing-subsequences/>

__nums中含重复项__ 要做同层的剪枝

__子序列__ 不可以通过sort简化同层的剪枝

```js
var findSubsequences = function (nums) {
    const result = [], path = []

    function backTracking(index) {
        // 只要出现了递增就记录
        if (path.length > 1) result.push(Array.from(path))

        const used = {}
        for (let i = index; i < nums.length; i++) {
            // 同层重复项 或 当前项非递增 ，进行剪枝
            if (used[nums[i]] || path.length > 0 && nums[i] < path[path.length - 1]) continue;
            used[nums[i]] = true

            path.push(nums[i])
            backTracking(i + 1)
            path.pop()
        }
    }
    backTracking(0)
    return result
};
// [[4, 6], [4, 6, 7], [4, 6, 7, 7], [4, 7], [4, 7, 7], [6, 7], [6, 7, 7], [7, 7]]
console.log(findSubsequences([4, 6, 7, 7]));
```

## 46. 全排列

<https://leetcode.cn/problems/permutations/description/>

__全排列__ 每层循环从0开始，也因此要做同枝的剪枝，同枝递归结束时要及时撤回状态

```js
var permute = function(nums) {
    const path = [], result = [], used = {};
    const backTracking = () => {
        if(path.length === nums.length) {
            result.push([...path])
        }
        for (const cur of nums) {
            if(used[cur]) continue;
            path.push(cur)
            used[cur] = true
            backTracking()
            used[cur] = false
            path.pop()
        }
    }
    backTracking()
    return result
};
// [[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]]
console.log(permute([1, 2, 3]));
```

## 47. 全排列 II

<https://leetcode.cn/problems/permutations-ii/description/>

__全排列__ 每层循环从0开始，也因此要做同枝的剪枝，同枝递归结束时要及时撤回状态

__nums中含重复项__ 要做同层的剪枝

```js
var permuteUnique = function(nums) {
    const path = [], result = [], used = {};
    nums.sort((a, b) => a - b);

    const backTracking = () => {
        if(path.length === nums.length) {
            result.push([...path])
        }
        for (let i = 0;i < nums.length;i++) {
            // 深度优先遍历，
            // 遍历到 当前数 时，同层前一个数的递归一定是结束了，此时它的标记一定是false
            // 所以借 used[i - 1] === false 判断 上一个数同层
            // 同层 且 当前数 与 上一个数 相等(同层重复)，则跳过
            if (i > 0 && nums[i] === nums[i - 1] && used[i - 1] === false) continue;
            // 如果当前数 用过(同枝重复)，或称 正在当前递归(path)中，跳过
            if(used[i]) continue;
            used[i] = true
            path.push(nums[i])
            backTracking()
            used[i] = false
            path.pop()
        }
    }
    
    backTracking()
    return result
};
// [ [ 1, 1, 3 ], [ 1, 3, 1 ], [ 3, 1, 1 ] ]
console.log(permuteUnique([1,1,3]))
```

另外提一句，used[i - 1] === true 代表 上一个数同枝

如果判断改为 `used[i - 1] === true`，则整个`if`代表，当前子枝与前一位

## 332. 重新安排行程

<https://leetcode.cn/problems/reconstruct-itinerary/description/>

```js

```

## 51. N 皇后

<https://leetcode.cn/problems/n-queens/description/>

```js
var solveNQueens = function (n) {
    const result = [], path = []
    backTracking(0)
    return result

    function backTracking(row) {
        if (path.length === n) {
            result.push(draw(path, n))
            return
        }
        for (let col = 0; col < n; col++) {
            if (!isOK(col)) continue
            path.push(col)
            backTracking(row + 1)
            path.pop()
        }
    }
    function isOK(col) {
        // row = path.length - 1 代表上一行
        for (let row = path.length - 1, leftUp = col - 1, rightUp = col + 1; row >= 0; row--, leftUp--, rightUp++) {
            // 检测左上:如果leftUp(上一行的col)没超出棋盘，且存在重合，则不符合规则
            if (leftUp >= 0 && path[row] === leftUp) return false
            if (rightUp < n && path[row] === rightUp) return false
            if (path[row] === col) return false
        }
        return true
    }
    function draw(chessboard, n) {
        const emptyStr = '.'.repeat(n)
        // 匹配了两个组，item个. 和 1个. , 没有被使用到的组 $2所匹配到的内容会被删除
        return chessboard.map(item => emptyStr.replace(new RegExp(`(.{${item}})(.)`), `$1Q`))
    }
};
console.log(solveNQueens(4));
[
    ['.Q..', '...Q', 'Q...', '..Q.'],
    ['..Q.', 'Q...', '...Q', '.Q..']
]
```

## 37. 解数独

<https://leetcode.cn/problems/sudoku-solver/description/>

```js

```
