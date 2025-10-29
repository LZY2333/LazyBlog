---
title: 大模型到AI项目
date: 2025-07-15 15:49:25
tags:
    - AI
---

OpenAI 聊天补全 为例

[chat/completions](https://302ai.apifox.cn/api-147522039)

## 大模型

大模型 本质 就是: __条件概率分布建模器__

> 它预测下一个 Token 的概览，依据就是上下文中已出现的 Token

大模型 训练 就是: 通过大量文本学习到的语言中 token 之间出现的规律和概率关系

> 大模型并不理解文本，而是基于训练得到的概率，生成最有可能的下一个 Token

大模型一次问答的处理流程: 文本 分词(Tokenization) 为 Token, Token 补全(Completion)

> 处理聊天的大模型就是 针对语言结构和语义分布 的 条件概率分布建模器

## 分词

将文本转换为 Token

[openAI tokenizer](https://platform.openai.com/tokenizer)

单词与 Token 不一一对应，上下文 语种 也影响 Token 的产生

高效 与大模型对话本质是 __减少 Token__, 使用更少的 Token 表达清晰同样的意思

一个有效且通用的方法是 __格式化提示__, 例如代码就是高度格式化的

> 很多 AI 项目本质上并不修改底层大模型，也不重新训练,  
> 而是在大模型之外 建立中间层，通过对用户输入进行封装与处理,  
> 实现更精准的输出、更低的使用门槛与更强的领域适配性。  
> 如提示词工程、模板化输入、上下文补全、默认系统提示词等。

## 常见 AI 项目

输入处理

- __Prompt 模板封装__：标准化提示词模板（如“你是…请帮我…”）
- __系统提示设定__：设定风格/身份（System Prompt）
- __上下文增强__：包括 few-shot 示例、历史对话拼接、知识库插入（RAG）
- __结构化输入解析__：将表单、结构化数据转为自然语言 prompt
- __意图识别与任务路由__：识别用户意图并分流至不同流程或模型

调用处理

- __动态 Prompt 调整__：根据模型反馈动态优化提示词
- __多模型选择/路由__：根据任务选择不同模型调用（如快 vs 准）
- __轻量模型适配__：使用 LoRA、Adapter 等做模型微调

输出处理

- __输出格式化__：输出转为 JSON、图表、Markdown 等结构化格式
- __输出纠错与重写__：对输出进行语法/事实校验与修正
- __多轮评估与裁决__：多个生成结果中选最优
- __后处理调用链__：将模型结果接入工具链（如代码运行、接口调用）
- __界面封装与交互优化__：将交互转为 UI 控件，降低用户门槛

三种处理对应三类应用

- __RAG（检索增强生成）__：引入知识库/外部文档增强上下文
- __Agent / 智能流程控制__：多步任务规划、工具调用、上下文记忆等智能体功能
- __多模态集成__：融合文本、图像、语音、表格等模型进行联动（如文图问答、多模态代理）

| 层级 | 中文名称     | 英文名称            | 说明                                 | 典型项目                            |
| ---- | ------------ | ------------------- | ------------------------------------ | ----------------------------------- |
| L1   | 提示词工程层 | Prompt Layer        | 基于 Prompt 模板引导模型输出，无训练 | Notion AI、Copy.ai、WriteSonic      |
| L2   | 上下文增强层 | Context-Aware Layer | 引入知识库、文档、历史做上下文补全   | ChatPDF、Perplexity、ChatLaw        |
| L3   | 工具增强     | Tool-Augmented      | 模型调用工具或规划多步骤任务         | AutoGPT、LangChain、OpenDevin       |
| L4   | 模型微调     | Adaptation Layer    | 对模型进行 LoRA、Adapter 等微调      | Alpaca-LoRA、MiniGPT-4              |
| L5   | 基座模型层   | Foundation Layer    | 完整训练大模型，构建核心生态         | GPT-4、Claude、通义千问、LLaMA、GLM |

## 大模型常见参数

以下参数可调整 大模型对 Token 补全的概率分布

### role 系统角色

### temperature 温度

0 ～ 2，调整概率分布的差异，数值越大，概率分布越平缓，增加多样性

```js
Temperature = 0.2时：
"饭" (0.8)
"菜" (0.1)
"水果" (0.05)
...

Temperature = 1.5时：
"饭" (0.3)
"菜" (0.25)
"水果" (0.23)
```

### topP 核采样

设定累积概率阈值，从高到低概率依次选择的 token，直到总和达到设定值

```js
Top_p = 0.75时：
选择："饭"(0.3) + "菜"(0.2) + "水果"(0.15) + "零食"(0.1) = 0.75
其他选项被排除
```

### frequencyPenalty 概率惩罚

-2 ～ 2，降低已出现 token 的再次出现概率，迫使模型选择新的 __表达方式__

```js
如果"喜欢"已经出现过：
原始概率："喜欢"(0.3) → 惩罚后：(0.1)
我喜欢吃饭，我也爱吃烧烤
```

### presencePenalty 存在惩罚

-2 ～ 2，降低已出现 __主题__ 的相关 token 概率

```js
我喜欢吃饭， -> 我也喜欢吃烧烤
0.7：我喜欢吃饭，周末常去夜市撸串 （引入周末和夜市场景）
1：我喜欢吃饭，假期约上朋友去大排档，美食总能让生活充满乐趣（引入新场景、人物、情感）
-1：我喜欢吃饭吃面吃烧烤（奖励,一直出现食物主题）
```

## 一个例子

用“前端代码补全”举例：

输入：`const Button = ({`

参数：

```js
// 参数配置
Top_p = 0.3 // 只用最常见属性
Temperature = 0.2 // 遵循最常见模式
Frequency_penalty = 0.1 // 允许必要的重复
Presence_penalty = 0 // 保持一致的编码风格
```

输出：

```js
const Button = ({ onClick, children, className }) => {
    return (
        <button className={className} onClick={onClick}>
            {children}
        </button>
    )
}
```

### Top_p = 0.3

只用概率阈值之和前 30% 的属性

```js
// 1. 属性列表的选择范围
const Button = ({
  onClick,    // ✓ 最常见的事件处理属性
  children,   // ✓ 最基础的内容属性
  className   // ✓ 最常用的样式属性
  // style    // ✗ 被过滤，因为不在最常用的30%里
  // disabled // ✗ 被过滤
  // custom属性 // ✗ 被过滤
})

// 2. 组件结构选择
return (
  <button>    // ✓ 最基础的按钮元素
  // <div>    // ✗ 被过滤
  // <span>   // ✗ 被过滤
)
```

### Temperature = 0.2

低温 强化高概率选项，遵循最常见模式

```js
// 1. 属性的书写顺序
const Button = {
    onClick, // 遵循常见顺序：事件处理在前
    children, // 内容次之
    className, // 样式属性最后
}

// 2. JSX结构的组织方式
return (
    <button // 标准的属性换行格式
        className={className}
        onClick={onClick}>
        {children}
    </button>
)
// 不会生成紧凑格式：<button className={className} onClick={onClick}>{children}</button>
```

### Frequency_penalty = 0.1

允许必要重复

```js
// 变量名重复
onClick = { onClick }
className = { className } // ✓ 允许直接传递同名属性
// className={`btn ${className}`} // 可能的替代写法
```

### Presence_penalty = 0

保持一致的编码风格

```javascript
// 1. 代码风格的一致性
const Button = ({  // 保持基础的函数组件风格
  // 不会突然改用 function Button()
  // 不会突然使用 class 组件

// 2. 属性处理方式
  return (
    <button
      className={className}  // 直接传递属性
      onClick={onClick}      // 直接传递事件
      // 不会突然改用不同模式：
      // {...props}
      // style={{...styles}}
    >
      {children}
    </button>
  );
}
```

### 如果调整参数

```js
Top_p = 0.9 // 允许更多属性选择
Temperature = 1.2 // 更创新的结构
Frequency_penalty = 0.8 // 强制使用不同写法(表达方式)
Presence_penalty = 0.5 // 允许混合风格(表达内容)
```

可能生成：

```js
// 可能生成：
const Button = ({
    onClick,
    style,
    theme = 'default', // 更多属性选项
    ...props
}) => {
    const buttonStyles = useStyles(theme) // 更复杂的处理逻辑

    return (
        <motion.button // 使用不同的组件库
            {...props}
            style={{ ...buttonStyles, ...style }}
            whileHover={{ scale: 1.05 }}
            onClick={(e) => {
                // 更复杂的事件处理
                e.preventDefault()
                onClick?.(e)
            }}
        />
    )
}
```
