"use client";

import { useState } from "react";
import { Search } from "./Search";

export function SiteHeader() {
  const [menu, setMenu] = useState(false);
  return <header className="site-header">
    <a className="brand" href="/"><span className="brand-mark">Q</span><span><b>QUARRY</b><small>面试知识库</small></span></a>
    <nav className={menu ? "nav-open" : ""}><a href="/#map">业务认知</a><a href="/#map">技术能力</a><a href="/knowledge/system-design">题库</a><a href="#about">关于</a></nav>
    <div className="header-actions"><Search /><button className="menu-button" onClick={() => setMenu(!menu)} aria-label="打开菜单">☰</button></div>
  </header>;
}
