'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type MarkdownViewerProps = {
  markdown: string;
  className?: string;
};

const markdownComponents = {
  p: ({ children }: any) => {
    const hasPre = React.Children.toArray(children).some((child: any) => child?.type === 'pre');

    if (hasPre) {
      return <div className="my-2 leading-relaxed text-slate-800">{children}</div>;
    }

    return <p className="my-2 leading-relaxed text-slate-800">{children}</p>;
  },

  // 헤딩 1
  h1: ({ children }: any) => (
    <h1 className="mt-4 mb-2 text-xl font-bold text-slate-900">{children}</h1>
  ),

  // 헤딩 2
  h2: ({ children }: any) => (
    <h2 className="mt-3 mb-1 text-lg font-semibold text-slate-900">{children}</h2>
  ),

  strong: ({ children }: any) => (
    <strong className="font-semibold text-slate-900">{children}</strong>
  ),

  em: ({ children }: any) => <em className="italic text-slate-700">{children}</em>,

  // 코드: 인라인 / 블록
  code: ({ inline, children, ...props }: any) => {
    if (inline) {
      return (
        <code
          className="rounded bg-slate-100 px-1 py-0.5 text-[12px] font-mono text-slate-500"
          {...props}
        >
          {children}
        </code>
      );
    }

    return (
      <code className="font-mono text-[12px]" {...props}>
        {children}
      </code>
    );
  },
  pre: ({ children, ...props }: any) => (
    <pre
      className="mt-2 overflow-x-auto rounded-lg bg-slate-900 p-3 text-[12px] text-slate-50"
      {...props}
    >
      {children}
    </pre>
  ),
  blockquote: ({ children }: any) => (
    <blockquote className="mt-2 border-l-4 border-slate-300 pl-3 text-[13px] italic text-slate-600">
      {children}
    </blockquote>
  ),
  a: ({ href, children }: any) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="text-sky-600 underline underline-offset-2 hover:text-sky-700"
    >
      {children}
    </a>
  ),
  ul: ({ children, ...props }: any) => (
    <ul className="mt-2 space-y-1 pl-5 text-[13px] text-slate-800" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }: any) => (
    <ol className="mt-2 list-decimal space-y-1 pl-5 text-[13px] text-slate-800" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, checked, ...props }: any) => {
    const isTask = typeof checked === 'boolean';

    if (isTask) {
      return (
        <li
          style={{ listStyleType: 'none' }}
          className="flex items-start gap-2 text-[13px] text-slate-800"
          {...props}
        >
          {children}
        </li>
      );
    }

    return (
      <li className="list-disc leading-relaxed" {...props}>
        {children}
      </li>
    );
  },
};

export function MarkdownViewer({ markdown, className }: MarkdownViewerProps) {
  if (!markdown?.trim()) {
    return <p className="text-xs text-slate-400">내용이 없습니다.</p>;
  }

  return (
    <div className={className ?? 'prose prose-sm max-w-none text-sm text-slate-800'}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
