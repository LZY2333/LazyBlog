---
title: react个人最佳实践弹窗
date: 2024-08-01 10:46:13
categories: 经验帖
tags: 
    - 最佳实践
---

## 业务组件代码范式

作为一个四年react业务仔，在日常开发中不断积累经验，不断反思，

逐渐总结出一套自己的最佳实践，并实现为 业务代码范式Demo。

业务代码范式并不是实现通用化的React组件，而是区分 Modal/Form/Table 等功能场景，

不断总结优化该类场景下的业务功能的共性功能，形成 **不同场景的业务代码范式**

形成这样的代码范式以后:

针对该类场景可直接复用生成可运行的基础组件，再根据具体业务填充修改。

由于已经处理了许多业务细节(如分页，缓存)，能专注于当前业务特点开发，

**优点**: 极大降低心智负担，提升开发速度，减少bug的出现概率

## 弹窗代码范式Demo

> 本文源码地址: https://github.com/LZY2333/LazyBestPratice

```ts
// ModalDemo 弹窗封装页面
import { Form, Input, Modal } from 'antd';
import React, { useImperativeHandle, useRef, useState } from 'react';

export interface ModalDemoForm {
    name: string;
}

export interface ModalDemoRefType {
    show: () => Promise<ModalDemoForm | false>;
}
interface ModalDemoPropsType {}

const ModalDemo = React.forwardRef<ModalDemoRefType, ModalDemoPropsType>((_props, ref) => {
    const [visible, setVisible] = useState(false);
    const [form] = Form.useForm();
    const promiseRef = useRef<{ resolve: (value: ModalDemoForm | false) => void }>();

    useImperativeHandle(ref, () => ({
        show: () => {
            setVisible(true);
            return new Promise((resolve) => {
                promiseRef.current = { resolve };
            });
        },
    }));

    const handleConfirm = async () => {
        try {
            const formResult = await form.validateFields();
            promiseRef.current?.resolve(formResult);
            setVisible(false);
        } catch (error) {
            console.log('error', error);
        }
    };
    const handleCancel = () => {
        promiseRef.current?.resolve(false);
        setVisible(false);
    };

    return (
        <Modal
            title='ModalDemo'
            open={visible}
            onOk={handleConfirm}
            onCancel={handleCancel}
        >
            <Form form={form}>
                <Form.Item label='name' name='name' required>
                    <Input maxLength={8} autoComplete='off' />
                </Form.Item>
            </Form>
        </Modal>
    );
});

export default ModalDemo;
```

## 弹窗Demo使用

这样封装的弹窗，使用仅需三步

```ts
// ModalDemoTestPage.tsx 弹窗使用示例页面
import { Button } from 'antd';
import React, { useRef } from 'react';
import ModalDemo, { ModalDemoRefType } from './ModalDemo';

const ModalDemoTestPage: React.FC = () => {
    // 第一步
    const demoModalRef = useRef<ModalDemoRefType>(null);

    const longCheck = async () => {
        // 第三步
        const result = await demoModalRef.current!.show();
        if (!result) {
            return;
        }
        console.log('result as ModalDemoForm', result);
    };
    return (
        <div>
            <h1>ModalDemoTestPage </h1>
            <Button onClick={longCheck}>Click Here!</Button>
            {/* 第二步 */}
            <ModalDemo ref={demoModalRef} />
        </div>
    );
};

export default ModalDemoTestPage;
```
源码就是这么简单，下面是一些涉及的api介绍，业务思考，以及各类场景的注意事项。

## 核心实现

### Promise

弹窗开启后，返回一个Promise，调用者可借此挂起后续流程，等待弹窗的结果返回

该pending状态的Promise，将由用户点击按钮等操作触发状态改变，返回数据继续外部后续流程

将 Promise 和 Resolve 分离使用，

借由Promise实现每一次弹窗调用的发布订阅，实现将用户操作 转换为 异步函数。

另外建议，在弹窗开启前，

可对传入的弹窗需要的数据进行处理，调用后端请求接口发起数据校验等

如果校验出数据不合格，可直接调用tip提示，

再直接`return Promise.resolve(false)`以提前结束该次调用的生命周期。

### 主流程函数

该方式是我习惯的代码构建方式之一

__将流程拆分为子逻辑，再由主函数进行统一调用__

该简单的操作能极大提升流程逻辑的可复用性，可维护性，可读性。

注意子逻辑尽量使用纯函数，避免相互调用，只由主函数调用。

另一方面，Promise的加入使得该方式能更灵活的拆分及组合异步函数，

也让我能将用户DOM操作也视为异步函数来使用，调用弹窗和发起请求用法完全一致。

### Ref

`React.forwardRef<ModalDemoRefType, ModalDemoPropsType>((_props, ref) => {})`

接收一个函数组件，为其挂载Ref属性，此时函数组件接收的第一个参数仍旧为props，第二个参数将为ref

本质上是给函数组件外部套了一层类组件

`useImperativeHandle(ref, () => ({show:() => {}}))`

用于向ref挂载属性,第一个参数为ref,其上挂载的函数/属性可被外部调用,且非快照模式。

第二个参数为函数，该函数的返回值会挂载在ref上，且受到`ModalDemoRefType`约束

`const demoModalRef = useRef<ModalDemoRefType>(null);`

这条没什么好说的，提一个细节，ref用于储存变量时，默认值不传递null，按自己喜好不传也行。

ref用于挂载真实DOM，或提供给子组件挂载函数时，按规范应传递`null`，

传递`null`的本质区别是，此时返回的ref会被限定为readOnly类型。

详情参见react官网，此处为这三个api的 典型使用场景。

### 两个主要特性

这三个Ref api是我能实现 __一行代码在js中任意位置随时使用弹窗__ 的基础。

而对Promise的理解，Promise 是我能实现 __一个业务流程不被弹窗回调函数拆分__ 的基础。

按这套最佳实践封装的弹窗，具有的这两个主要特性，带来了什么样的优势？

## 优势对比

最佳实践的核心目标是做到封装后的组件 更简单易用，

本质是做到了 业务的高内聚，代码的低耦合。

### 普通弹窗封装模式的缺点

使用处 流程割裂/阅读困难/逻辑重复/产生额外的变量:

需要传入`onSuccess`/`onCancel`等函数回调,整个业务流程难以在一个函数中解决

阅读代码时，阅读到弹窗调用处，又需要从jsx代码中找其回调函数，再继续阅读

有些业务逻辑可能需要在 成功/失败时均调用，需要额外抽离逻辑以实现复用

### 为什么不建议弹窗与弹窗内容分离的封装模式

有些同学在需要封装一个弹窗组件时，会仅封装`<Modal></Modal>`内的内容作为组件，

而不将`Modal`本身一同封装进去,使用者需自行包裹`Modal`，并自行控制`Modal`的开启关闭

这种封装方式，

1. 一种可能是对组件理解不够深刻，认为`<Modal></Modal>`必须出现在调用者页面

2. 另一个原因是认为弹窗开启关闭应该由外部控制

其实不然，弹窗本身 以及弹窗封装者 是最清楚弹窗生命周期的人 弹窗相关的整个业务应该高度聚合在弹窗内，由弹窗组件本身控制，

甚至很多时候，调用了弹窗组件，弹窗都不一定会开启，

例如 传入的数据校验报错，直接tip提醒而非打开弹窗，

另一方面，如果你的一个业务的数据校验没封装在该业务组件流程内，则是另一个问题组件逻辑边界不清晰。

弹窗封装应该做到 __使用者仅需关注 调用时传入的数据 及获得 成功/失败时获得的结果__

需要 TS支持 以及 对业务的彻底思考，让弹窗足够黑盒

那么，接下来是我对 弹窗封装 以及 组件封装 的一些思考。

## 封装建议

### 两种接收数据的方式

封装弹窗需要使用到的数据，有两种传入方式，主流程函数show的参数 和 组件props ,

不可否认，二者具有较高的兼容性，到底数据应使用哪种方式传入更好？

__与组件使用的位置有关 应设置为 组件props__

 __与该组件每次被调用有关 应设置为 show函数的形参__

例如:

在A业务页面使用该组件，与B业务页面使用该组件，逻辑不同，需要传参区分

这种参数不管该组件被调用多少次，只要在当前页面都无需改变，显然该使用 组件props

另一种参数，例如传入的form初始数据，每次组件被调用时可能不一样，应在show主流程函数调用时传入

### 组件边界

__组件边界的唯一判断标准是业务__

例如，报错，应属于弹窗内业务逻辑的一部分，应在弹窗内部捕获，在弹窗内编写处理逻辑。

无论是前端报错，或弹窗内后端请求的报错，可以预见的情况下，都不该抛出让使用者处理。

或者说，所谓 【报错】 不一定是真的 【错误】，可以预见的报错，都只是一个业务的正常流程分支之一。

同时，报错不一定意味着弹窗的业务流程结束，而是需根据业务判断。

注意高内聚低耦合原则，应当认真考虑哪部分代码逻辑在弹窗范围内，哪部分逻辑在弹窗范围外。

__外部调用者仍需使用`catch`__  目的是统一处理预防弹窗未预见的报错，`console`打印报错信息。

### 返回值

弹窗或者说主流程函数每一次调用时的返回值，建议树立标准

__返回值类型统一为 `boolean` 或 `数据类型|false`__

`false`表示告诉外部中断后续流程, `true`/数据类型 表示后续流程继续。

并且，无论返回什么值，都应当代表着该弹窗相关的业务流程完全结束。

__弹窗与外部交互应当只存在一次__，也就是弹窗每次调用的生命周期结束时的返回值。

如果你存在 在弹窗每次调用的生命周期中途 需传出数据的情况,

那应该重新考虑相关业务流程，是否存在业务逻辑划分不当，

在整个业务逻辑流程中，一部分在弹窗内处理，到中途又经外部处理，显然是不合理的，

这种情况存在两种常见解决方案

1.将该段逻辑融入弹窗，或 通过props参数由外部传入函数交予弹窗内部调用

2.拆分业务逻辑缩小弹窗职责范围。

### 只使用`Resolve`,永远不使用`Reject`

因为 resolve代表当前流程在编写者的掌控之内，reject代表掌控之外的意外

也如上一节所讲，可以预见的 报错，都只是一个正常的业务流程分支，应使用`resolve`

另外一个重要原因，随意的使用 reject或throw error 会使外部流程逻辑产生割裂

外部调用者，必须在catch中做部分逻辑的处理，是代码产生割裂，

而使用`resolve(false)`的方式，

### TS支持

作为一个方便好用的通用组件封装，应设置好以下三个TS类型约束并`export`，

这样，使用者获得充分的参数提示和约束，极大提升便利性

TS类型约束被缺省时，使用者往往依旧需要阅读源码来知晓参数内容

1.`ModalDemoRefType` 限定ref类型，或者说ref可挂载的属性，同时也是外部调用者智能补全提示的基础

  这里主要用于`show`这个主流程函数的约束和提供提示

  另一方面，可挂载装多个主流程函数。先将业务逻辑拆解，再在主流程函数中组合不同的的流程，以适应多种业务情况。

2.`ModalDemoPropsType` 弹窗组件props约束

3.`ModalDemoForm` 弹窗的返回值类型，如无供外部使用的返回值可省略，返回`boolean`类型作为流程结束标志

### 不仅仅是弹窗

看到这里，大家可能也发现了

这套最佳实践的一大创新是，将用户的界面操作纳入Promise流，从而抽象成和异步函数一样的使用方式。

这套最佳实践封装的组件 和 后端接口的Promise，二者在弹窗调用者的角度完全一致。

这是其“好用”的根本原因。

理解了这一点，

1. 该方法可应用在任何需要等待用户操作的场景，解决用户操作流程内 代码割裂的问题。

2. 该方法封装的流程，可任意组合 改变顺序，组成更大的集合。

## 基于业务做到高内聚低耦合

正如上面一长串文字，代码范式源码只有一点点，但内含的积累的思考其实很多很多。

| 类型         | 英文术语                           | 功能示例                          |
| ------------ | ---------------------------------- | --------------------------------- |
| 业务功能     | Business Functionality             | 下单、报销、客户管理              |
| 系统功能     | System Functionality               | 权限控制、国际化、菜单配置        |
| 技术功能     | Technical Functionality            | 缓存、接口、组件封装、日志系统    |
| 基础设施功能 | Infrastructure Functionality       | 数据库、消息队列、CI/CD、配置中心 |
| 非功能性需求 | Non-Functional Requirements (NFRs) | 性能优化、安全性、可扩展性        |

要封装一个好的业务组件，首先要知道业务组件，不同于 通用组件的特点

特点: **与某单一具体业务完全耦合，实现定制化功能，与其他业务完全解耦**，换句话说就是

目的: **需要做到业务层面的高内聚，低耦合**，想做到这点，

方法: **基于业务思考，深入了解业务，站在使用者角度思考。**

做到这一点并不简单，组件功能的边界在哪？暴露的组件参数不同于通用组件，如何选择？

业务组件，很多方面不必考虑通用性，通用性反而是实用/易用的阻碍，



## 总结

总结一下，涉及三块主要内容:

一种Promise的特殊使用方式

一份弹窗组件的封装代码

一些对组件封装的思考

可以改进的地方还有很多，例如，能不能做到省略弹窗使用的第二步，做到纯JS调用，调用时才创建DOM。

像这样，在写业务代码的过程中不断地审视自己，站在技术的角度思考业务的更优解。

将 个人最佳实践 一次次改进，总结，记录，业务仔也能有春天。