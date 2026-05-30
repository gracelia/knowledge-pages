---
title: React 核心
tags: [react, framework, 组件化]
related: [javascript--core, engineering--build-tools]
---

# React 核心

React 是目前最流行的前端框架，基于组件化和声明式 UI。

## 组件基础

```jsx
// 函数组件（现代写法）
function Button({ label, onClick, variant = 'primary' }) {
  return (
    <button className={`btn btn-${variant}`} onClick={onClick}>
      {label}
    </button>
  );
}
```

## Hooks

### useState
```jsx
const [count, setCount] = useState(0);
const [user, setUser] = useState(null);

// 更新对象状态
setUser(prev => ({ ...prev, name: 'Alice' }));
```

### useEffect
```jsx
useEffect(() => {
  // 组件挂载后执行
  fetchData().then(setData);

  return () => {
    // 清理函数（组件卸载时执行）
    cleanup();
  };
}, [dependency]); // 依赖项变化时重新执行
```

### useCallback & useMemo
```jsx
// 缓存函数引用，避免子组件不必要的重渲染
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);

// 缓存计算结果
const sortedList = useMemo(() => {
  return list.sort((a, b) => a.name.localeCompare(b.name));
}, [list]);
```

### 自定义 Hook
```jsx
function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(url)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); });
  }, [url]);

  return { data, loading };
}
```

## 状态管理

| 方案 | 适用场景 |
|------|---------|
| useState + props | 简单组件内状态 |
| useContext | 跨层级共享（主题、用户信息） |
| Zustand / Jotai | 中小型应用全局状态 |
| Redux Toolkit | 大型复杂应用 |

## 性能优化

```jsx
// React.memo 避免不必要的重渲染
const ExpensiveComponent = React.memo(({ data }) => {
  return <div>{/* 渲染逻辑 */}</div>;
});

// 懒加载
const LazyPage = React.lazy(() => import('./pages/HeavyPage'));
```
