---
title: 性能优化
tags: [性能, 优化, web vitals]
related: [engineering--build-tools, javascript--browser-dom]
---

# 性能优化

## Core Web Vitals

Google 定义的核心性能指标：

| 指标 | 含义 | 目标值 |
|------|------|--------|
| LCP | 最大内容绘制（加载速度） | < 2.5s |
| FID/INP | 首次输入延迟（交互响应） | < 100ms |
| CLS | 累积布局偏移（视觉稳定性） | < 0.1 |

## 加载性能

### 代码分割
```js
// React 路由级别懒加载
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
```

### 图片优化
```html
<!-- 现代格式 + 懒加载 -->
<img src="photo.webp" loading="lazy" alt="描述" width="800" height="600">

<!-- 响应式图片 -->
<picture>
  <source media="(min-width: 768px)" srcset="large.webp">
  <img src="small.webp" alt="描述">
</picture>
```

### 资源预加载
```html
<link rel="preload" href="critical.css" as="style">
<link rel="prefetch" href="next-page.js">
<link rel="preconnect" href="https://api.example.com">
```

## 运行时性能

### 防抖与节流
```js
// 防抖：最后一次触发后执行（搜索输入）
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// 节流：固定间隔执行（滚动事件）
function throttle(fn, interval) {
  let last = 0;
  return (...args) => {
    const now = Date.now();
    if (now - last >= interval) { last = now; fn(...args); }
  };
}
```

### 虚拟列表
大量数据渲染时，只渲染可视区域内的元素。推荐库：`react-virtual`、`@tanstack/virtual`。

## 缓存策略

```
Cache-Control: max-age=31536000, immutable  # 静态资源（带 hash）
Cache-Control: no-cache                      # HTML 文件
```

## 性能分析工具

- **Chrome DevTools** → Performance 面板
- **Lighthouse** → 综合评分与建议
- **WebPageTest** → 真实网络环境测试
- **Bundle Analyzer** → 分析打包体积
