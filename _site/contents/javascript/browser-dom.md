---
title: 浏览器与 DOM
tags: [javascript, dom, browser]
related: [javascript--core]
---

# 浏览器与 DOM

## DOM 操作

```js
// 查询
const el = document.querySelector('.my-class');
const els = document.querySelectorAll('li');

// 修改
el.textContent = 'Hello';
el.classList.add('active');
el.style.color = 'red';

// 创建与插入
const div = document.createElement('div');
div.innerHTML = '<p>内容</p>';
document.body.appendChild(div);
```

## 事件处理

```js
// 事件监听
button.addEventListener('click', (e) => {
  e.preventDefault();
  console.log(e.target);
});

// 事件委托（性能更好）
document.getElementById('list').addEventListener('click', (e) => {
  if (e.target.matches('li')) {
    console.log(e.target.textContent);
  }
});
```

## 事件循环

JavaScript 是单线程的，通过事件循环处理异步：

1. **调用栈**：执行同步代码
2. **微任务队列**：Promise 回调（优先级高）
3. **宏任务队列**：setTimeout、setInterval、I/O

```js
console.log('1');
setTimeout(() => console.log('2'), 0);
Promise.resolve().then(() => console.log('3'));
console.log('4');
// 输出顺序：1, 4, 3, 2
```

## 浏览器存储

| 方式 | 容量 | 生命周期 | 适用场景 |
|------|------|---------|---------|
| localStorage | ~5MB | 永久 | 用户偏好设置 |
| sessionStorage | ~5MB | 标签页关闭 | 临时表单数据 |
| Cookie | ~4KB | 可设置过期 | 认证 token |
| IndexedDB | 大 | 永久 | 离线数据 |

## 性能优化

- 减少 DOM 操作，批量更新
- 使用 `DocumentFragment` 批量插入
- 防抖（debounce）和节流（throttle）
- 使用 `requestAnimationFrame` 做动画
