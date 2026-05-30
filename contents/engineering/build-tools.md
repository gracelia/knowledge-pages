---
title: 前端工程化
tags: [工程化, webpack, vite, npm]
related: [javascript--core, framework--react]
---

# 前端工程化

工程化是将前端开发流程系统化、自动化的实践，提升团队协作效率和代码质量。

## 包管理

```bash
# npm 基本操作
npm install react          # 安装依赖
npm install -D vite        # 安装开发依赖
npm run dev                # 运行脚本

# package.json 关键字段
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

## 构建工具

### Vite（推荐）
现代前端构建工具，开发时基于 ESM，构建时使用 Rollup。

```js
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': '/src' }
  }
});
```

### Webpack
老牌构建工具，生态丰富，配置灵活但复杂。

## 模块系统

```js
// ESM（现代标准）
import { useState } from 'react';
import utils from './utils.js';
export const add = (a, b) => a + b;
export default MyComponent;

// 动态导入（代码分割）
const module = await import('./heavy-module.js');
```

## 代码质量

### ESLint
```json
// .eslintrc.json
{
  "extends": ["eslint:recommended", "plugin:react/recommended"],
  "rules": {
    "no-unused-vars": "warn",
    "no-console": "warn"
  }
}
```

### Prettier
```json
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

## Git 工作流

```bash
# 功能分支工作流
git checkout -b feature/my-feature
git add .
git commit -m "feat: add new feature"
git push origin feature/my-feature
# 创建 Pull Request → Code Review → Merge
```

### Commit 规范（Conventional Commits）
```
feat: 新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式
refactor: 重构
test: 测试
chore: 构建/工具
```

## CI/CD

GitHub Actions 示例：
```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run lint
      - run: npm test
      - run: npm run build
```
