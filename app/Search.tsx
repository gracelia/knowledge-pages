"use client";

import { useEffect, useState } from "react";
import { topics } from "./data";

export function Search() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); setOpen(true); }
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  const results = topics.filter((topic) => `${topic.title}${topic.description}${topic.eyebrow}`.toLowerCase().includes(query.toLowerCase()));
  return <>
    <button className="search-trigger" onClick={() => setOpen(true)} aria-label="搜索题库"><span>⌕</span><span className="search-label">搜索题目</span><kbd>⌘ K</kbd></button>
    {open && <div className="search-backdrop" onClick={() => setOpen(false)}>
      <div className="search-dialog" role="dialog" aria-modal="true" aria-label="搜索知识库" onClick={(e) => e.stopPropagation()}>
        <div className="search-input-wrap"><span>⌕</span><input autoFocus placeholder="搜索概念、项目或题型…" value={query} onChange={(e) => setQuery(e.target.value)} /><button onClick={() => setOpen(false)}>ESC</button></div>
        <div className="search-results">
          <p>{query ? `找到 ${results.length} 个结果` : "推荐内容"}</p>
          {results.map((topic) => <a key={topic.slug} href={`/knowledge/${topic.slug}`}><span className={`result-mark ${topic.category}`}>●</span><span><b>{topic.title}</b><small>{topic.eyebrow} · {topic.description}</small></span><i>↗</i></a>)}
        </div>
      </div>
    </div>}
  </>;
}
