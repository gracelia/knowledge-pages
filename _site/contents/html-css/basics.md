---
title: HTML & CSS 基础
tags: [html, css, 基础]
related: [javascript--core, engineering--build-tools]
---

# HTML & CSS 基础

HTML 和 CSS 是前端工程师的基石。HTML 定义内容结构，CSS 控制视觉呈现。

## HTML 核心概念

### 语义化标签
使用语义化标签让代码更具可读性，也有利于 SEO 和无障碍访问：

```html
<header>, <nav>, <main>, <article>, <section>, <aside>, <footer>
```

### 文档结构
```html
<!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>页面标题</title>
</head>
<body>
  <header>...</header>
  <main>...</main>
  <footer>...</footer>
</body>
</html>
```

## CSS 核心概念

### 盒模型
每个元素都是一个盒子：`content + padding + border + margin`。

推荐全局设置：
```css
* { box-sizing: border-box; }
```

### 布局方式

| 方式 | 适用场景 |
|------|---------|
| Flexbox | 一维布局（行或列） |
| Grid | 二维布局（行和列） |
| Position | 绝对定位、固定导航 |

### CSS 变量
```css
:root {
  --primary: #2B3BA8;
  --spacing: 1rem;
}
.btn { background: var(--primary); padding: var(--spacing); }
```

### 响应式设计
```css
/* 移动优先 */
.container { width: 100%; }

@media (min-width: 768px) {
  .container { max-width: 1200px; margin: 0 auto; }
}
```

## 必须掌握的技能

- Flexbox 和 Grid 布局
- CSS 自定义属性（变量）
- 媒体查询与响应式设计
- CSS 动画与过渡
- BEM 命名规范
