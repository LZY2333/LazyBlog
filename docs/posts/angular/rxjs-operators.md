---
title: 常见操作符
date: 2021-02-19 22:10:12
categories: 技术栈
tags: 
    - RxJS
---

## take

`take(x)` 取结果的前 X 个元素

```js
var source = Rx.Observable.interval(1000);
var example = source.take(3);

example.subscribe({
    next: (value) => { console.log(value); },
    error: (err) => { console.log('Error: ' + err); },
    complete: () => { console.log('complete'); }
});
// 0
// 1
// 2
// complete
```
> 最后会调用一个 complete, 有点意外.
```js
source : -----0-----1-----2-----3--..
                take(3)
example: -----0-----1-----2|
```

## first

`first()` 等于 `take(1)`

## takeUntil

`Observable1.takeUntil(Observable2)` observable2 发送值时, observable1 会被调用complete.

```js
var source = Rx.Observable.interval(1000);
var click = Rx.Observable.fromEvent(document.body, 'click');
var example = source.takeUntil(click);     
   
example.subscribe({
    next: (value) => { console.log(value); },
    error: (err) => { console.log('Error: ' + err); },
    complete: () => { console.log('complete'); }
});
// 0
// 1
// 2
// 3
// complete (點擊body了

source : -----0-----1-----2------3--
click  : ----------------------c----
                takeUntil(click)
example: -----0-----1-----2----|
```

## concatAll

`Observable1.concatAll()` 将 将高阶 Observable,转换 为 一阶 Observable.

依次等待并同步输出每一个 Observable 值的输出值.

> `mergeAll()` 并行所有Observable, 并同步输出任意 Observable 值的输出值.  
> 带ALL的都是高阶Observable 操作符

```js
var click = Rx.Observable.fromEvent(document.body, 'click');
var source = click.map(e => Rx.Observable.of(1,2,3));

var example = source.concatAll();
example.subscribe({
    next: (value) => { console.log(value); },
    error: (err) => { console.log('Error: ' + err); },
    complete: () => { console.log('complete'); }
});

click  : ------c------------c--------
        map(e => Rx.Observable.of(1,2,3))
source : ------o------------o--------
                \            \
                 (123)|       (123)|
                   concatAll()
example: ------(123)--------(123)------------
```


```js
var obs1 = Rx.Observable.interval(1000).take(5);
var obs2 = Rx.Observable.interval(500).take(2);
var obs3 = Rx.Observable.interval(2000).take(1);

var source = Rx.Observable.of(obs1, obs2, obs3);

var example = source.concatAll();

example.subscribe({
    next: (value) => { console.log(value); },
    error: (err) => { console.log('Error: ' + err); },
    complete: () => { console.log('complete'); }
});
// 0
// 1
// 2
// 3
// 4
// 0
// 1
// 0
// complete
source : (o1                 o2      o3)|
           \                  \       \
            --0--1--2--3--4|   -0-1|   ----0|
                concatAll()        
example: --0--1--2--3--4-0-1----0|
```

## 用上述四个函数完成简易拖拉

需求:

1. 画面上有个 dom元素 (#drag)
2. 鼠标在 #drag 上 按下左键(mousedown), 开始 监听鼠标移动(mousemove) 的位置
3. 鼠标 左键放开(mouseup), 结束监听鼠标移动
4. 鼠标移动被监听时, 同时需要 修改原件位置属性 造成拖拽效果.

```js
const dragDOM = document.getElementById('drag');
const body = document.body;

const mouseDown = Rx.Observable.fromEvent(dragDOM, 'mousedown');
const mouseUp = Rx.Observable.fromEvent(body, 'mouseup');
const mouseMove = Rx.Observable.fromEvent(body, 'mousemove');

mouseDown
  .map(event => mouseMove.takeUntil(mouseUp))
  .concatAll()
  .map(event => ({ x: event.clientX, y: event.clientY }))
  .subscribe(pos => {
   dragDOM.style.left = pos.x + 'px';
    dragDOM.style.top = pos.y + 'px';
  })
```

## skip

`skip(x)` 跳过前 x 个元素 ,与`take(x)` 正好相反, 但原本元素的等待时间仍然存在.

```js
var source = Rx.Observable.interval(1000);
var example = source.skip(3);

example.subscribe({
    next: (value) => { console.log(value); },
    error: (err) => { console.log('Error: ' + err); },
    complete: () => { console.log('complete'); }
});
// 3
// 4
// 5...
source : ----0----1----2----3----4----5--....
                    skip(3)
example: -------------------3----4----5--...
```

## takeLast

`takeLast(x)` 取后 X 个元素, 但需要等待整个 Observable 完成(complete),再同步输出.

```js
var source = Rx.Observable.interval(1000).take(6);
var example = source.takeLast(2);

example.subscribe({
    next: (value) => { console.log(value); },
    error: (err) => { console.log('Error: ' + err); },
    complete: () => { console.log('complete'); }
});
// 4
// 5
// complete
source : ----0----1----2----3----4----5|
                takeLast(2)
example: ------------------------------(45)|
```

## last

`last()` 取最后一个元素,与`takeLast(1)`效果一致,需要等待整个 Observable 完成.再同步输出.

## concat

`concat(Observable1,Observable2,....)` , 与 concatAll 一样,必须等待前一个 observable 完成才会继续下一个.

```js
var source = Rx.Observable.interval(1000).take(3);
var source2 = Rx.Observable.of(3)
var source3 = Rx.Observable.of(4,5,6)
var example = source.concat(source2, source3);

example.subscribe({
    next: (value) => { console.log(value); },
    error: (err) => { console.log('Error: ' + err); },
    complete: () => { console.log('complete'); }
});
// 0
// 1
// 2
// 3
// 4
// 5
// 6
// complete
source : ----0----1----2|
source2: (3)|
source3: (456)|
            concat()
example: ----0----1----2(3456)|
```

## startWith

`startWith(x)` observable 一开始就同步发送一个值 x,常用于保存 函数的起始状态.

```js
source : ----0----1----2----3--...
                startWith(0)
example: (0)----0----1----2----3--...
```

## merge

`merge(Observable1,Observable2,....)` 并行所有Observable,内部所有输入都会立刻被输出,  
与 `concat`一样是合并 Observable ,但是一个并行一个串行.
