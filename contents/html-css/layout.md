---
title: CSS 布局进阶
tags: [css, layout, flexbox, grid]
related: [html-css--basics]
---

# CSS 布局进阶

## Flexbox

Flexbox 解决一维布局问题，是现代 CSS 布局的核心。

```css
.container {
  display: flex;
  justify-content: space-between; /* 主轴对齐 */
  align-items: center;            /* 交叉轴对齐 */
  gap: 1rem;
  flex-wrap: wrap;
}

.item {
  flex: 1;          /* 等分剩余空间 */
  min-width: 200px;
}
```

### 常用模式

**居中对齐：**
```css
.center { display: flex; justify-content: center; align-items: center; }
```

**粘性底部：**
```css
body { display: flex; flex-direction: column; min-height: 100vh; }
footer { margin-top: auto; }
```

## CSS Grid

Grid 解决二维布局问题，适合整体页面结构。

```css
.layout {
  display: grid;
  grid-template-columns: 260px 1fr;
  grid-template-rows: 56px 1fr;
  height: 100vh;
}

.header { grid-column: 1 / -1; }
.sidebar { grid-row: 2; }
.main { grid-row: 2; }
```

### 响应式网格
```css
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}
```

## 定位

```css
/* 固定导航 */
nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; }

/* 绝对定位（相对父元素） */
.parent { position: relative; }
.badge { position: absolute; top: -8px; right: -8px; }
```
