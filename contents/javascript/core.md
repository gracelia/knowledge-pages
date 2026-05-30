---
title: JavaScript 核心
tags: [javascript, es6, 异步]
related: [html-css--basics, framework--react]
---

# JavaScript 核心

JavaScript 是前端的编程语言，掌握其核心概念是一切的基础。

## 数据类型

**原始类型：** `string`, `number`, `boolean`, `null`, `undefined`, `symbol`, `bigint`

**引用类型：** `object`, `array`, `function`

```js
// 类型判断
typeof 'hello'     // 'string'
typeof null        // 'object'（历史遗留 bug）
Array.isArray([])  // true
```

## ES6+ 核心特性

### 解构赋值
```js
const { name, age = 18 } = user;
const [first, ...rest] = array;
```

### 展开运算符
```js
const merged = { ...defaults, ...overrides };
const copy = [...original, newItem];
```

### 模板字符串
```js
const msg = `Hello, ${name}! You have ${count} messages.`;
```

### 箭头函数
```js
const double = x => x * 2;
const add = (a, b) => a + b;
```

## 异步编程

### Promise
```js
fetch('/api/data')
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));
```

### async/await（推荐）
```js
async function loadData() {
  try {
    const res = await fetch('/api/data');
    const data = await res.json();
    return data;
  } catch (err) {
    console.error(err);
  }
}
```

### 并发请求
```js
const [users, posts] = await Promise.all([
  fetch('/api/users').then(r => r.json()),
  fetch('/api/posts').then(r => r.json()),
]);
```

## 原型与 Class

```js
class Animal {
  constructor(name) { this.name = name; }
  speak() { return `${this.name} makes a sound.`; }
}

class Dog extends Animal {
  speak() { return `${this.name} barks.`; }
}
```

## 必须掌握的技能

- 闭包与作用域
- 事件循环（Event Loop）
- 原型链
- 模块系统（ESM）
- 错误处理
