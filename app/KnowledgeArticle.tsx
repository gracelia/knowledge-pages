import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { headingId } from "./markdown";

export function KnowledgeArticle({ markdown }: { markdown: string }) {
  return <div className="markdown-content">
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h2: ({ children }) => <h2 id={headingId(String(children))}>{children}</h2>,
        h3: ({ children }) => <h3 id={headingId(String(children))}>{children}</h3>,
      }}
    >
      {markdown}
    </ReactMarkdown>
  </div>;
}
