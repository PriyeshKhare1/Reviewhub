export default function RichTextContent({ content }) {
  if (!content) return null;

  const isHTML = /<[a-z][\s\S]*>/i.test(content);

  if (!isHTML) {
    return (
      <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
        {content}
      </p>
    );
  }

  return (
    <>
      <style>{`
        .rich-text-content h1 {
          font-size: 1.875rem;
          font-weight: 700;
          margin-bottom: 0.75rem;
          color: #1e293b;
        }
        .dark .rich-text-content h1 {
          color: #f1f5f9;
        }
        .rich-text-content h2 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #1e293b;
        }
        .dark .rich-text-content h2 {
          color: #f1f5f9;
        }
        .rich-text-content h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #1e293b;
        }
        .dark .rich-text-content h3 {
          color: #f1f5f9;
        }
        .rich-text-content p {
          margin-bottom: 0.75rem;
          line-height: 1.75;
          color: #475569;
        }
        .dark .rich-text-content p {
          color: #cbd5e1;
        }
        .rich-text-content strong {
          font-weight: 600;
          color: #1e293b;
        }
        .dark .rich-text-content strong {
          color: #f1f5f9;
        }
        .rich-text-content em {
          font-style: italic;
        }
        .rich-text-content u {
          text-decoration: underline;
        }
        .rich-text-content s {
          text-decoration: line-through;
        }
        .rich-text-content blockquote {
          border-left: 4px solid #3b82f6;
          padding-left: 1rem;
          margin: 1rem 0;
          color: #64748b;
          font-style: italic;
          background: #f1f5f9;
          padding: 1rem;
          border-radius: 0 8px 8px 0;
        }
        .dark .rich-text-content blockquote {
          background: #1e293b;
          color: #94a3b8;
        }
        .rich-text-content pre {
          background: #1e293b;
          color: #e2e8f0;
          border-radius: 8px;
          padding: 1rem;
          overflow-x: auto;
          margin: 1rem 0;
          font-family: 'Fira Code', 'Monaco', monospace;
          font-size: 0.875rem;
        }
        .rich-text-content code {
          background: #f1f5f9;
          padding: 0.125rem 0.375rem;
          border-radius: 4px;
          font-size: 0.875rem;
          color: #e11d48;
        }
        .dark .rich-text-content code {
          background: #1e293b;
          color: #f472b6;
        }
        .rich-text-content ul,
        .rich-text-content ol {
          padding-left: 1.5rem;
          margin: 0.75rem 0;
        }
        .rich-text-content li {
          margin-bottom: 0.25rem;
          color: #475569;
        }
        .dark .rich-text-content li {
          color: #cbd5e1;
        }
        .rich-text-content ul {
          list-style-type: disc;
        }
        .rich-text-content ol {
          list-style-type: decimal;
        }
        .rich-text-content a {
          color: #3b82f6;
          text-decoration: underline;
        }
        .rich-text-content a:hover {
          color: #2563eb;
        }
      `}</style>
      <div
        className="rich-text-content prose prose-slate dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </>
  );
}