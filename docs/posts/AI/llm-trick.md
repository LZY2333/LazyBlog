---
title: LLM经验技巧 
date: 2025-11-14 09:55:01
hide: true
tags:
    - AI
---

大胆去做(保存好代码)  
初用AI,我感觉又回到了刚学编程的时候,不了解特性,做什么都有点怕,总想找最佳实践再去做

## 确认需求

### 0.与AI沟通确认需求,而不是全靠自己

`read whole codebase.`  
`Do web search if required.`  
`Ask me question if you are not sure about my requirements.`  
AI的使用应当是这么一个场景  
你是勇者, AI是大贤者,

### 1.让AI给出方案,而不是直接动手

`finally output a plan.`  
让AI给出方案，供评审选择，而不是直接动手

### 2.让AI输出MD文档,而不是对话到底

`think harder and write into a md file`  
及时让AI整理对话输出文档,节省上下文,评审修改文档,再进行对话  
充分发挥模型潜力, 防止较早的细节被蒸馏,

### 3.及时/clear

## Bug

### 1.让AI给出debug方案, 而不是直接改

`How to add console log to indicate the root case.`  
`Show me a clear audit trail.`  
如果让AI直接修复bug  
AI会一直改一直改，导致多文件代码被修改，undo需要检查很久  
甚至别让AI自己debug，而是给出debug方案  
影响范围小的bug 语法bug 除外，让AI直接动手就行

### 2.AI add console.log,再把log信息给AI检查

## 优化项目方案

## 优化效果

### 不要为了省钱一次性提问多个问题

回答的质量会显著降低

## 节省token

### 不同模型干不同活

## 场景细节Prompt举例

很多考虑不到的一些细节要求,或者没想到AI能做,但有奇效。

新功能创建阶段 可以要求模块内聚，抽离组件，考虑边界问题，安全问题
