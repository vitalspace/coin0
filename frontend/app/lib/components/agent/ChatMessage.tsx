'use client';

import { User, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import React, { ReactNode } from 'react';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  action?: string | null;
  airdropAddress?: string | null;
}

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Custom link renderer for relative and external links
const LinkRenderer = ({ href, children }: { href?: string; children: React.ReactNode }) => {
  if (!href) return <>{children}</>;
  
  // Handle internal app links (relative paths)
  if (href.startsWith('/')) {
    return (
      <a href={href} className="text-[#6fc7ba] hover:text-[#5db8a8] transition-colors underline underline-offset-2">
        {children}
      </a>
    );
  }
  
  // External links
  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="text-[#6fc7ba] hover:text-[#5db8a8] transition-colors underline underline-offset-2"
    >
      {children}
    </a>
  );
};

// Inline code renderer
const CodeInlineRenderer = ({ children }: { children: React.ReactNode }) => (
  <code className="rounded bg-[#1a1a1a] px-1.5 py-0.5 font-mono text-[13px] text-gray-300 border border-white/10">
    {children}
  </code>
);

// Code block renderer
const CodeBlockRenderer = ({ className, children }: { className?: string; children: React.ReactNode }) => {
  const language = className?.replace('language-', '') || 'text';
  return (
    <pre className="my-3 overflow-x-auto rounded-lg border border-white/10 bg-[#1a1a1a] p-3">
      <code className={`font-mono text-[13px] text-gray-300 ${language ? `language-${language}` : ''}`}>
        {children}
      </code>
    </pre>
  );
};

// List renderers
const ListRenderer = ({ ordered, children }: { ordered?: boolean; children: React.ReactNode }) => (
  ordered ? (
    <ol className="my-3 list-decimal pl-6 space-y-1">{children}</ol>
  ) : (
    <ul className="my-3 list-disc pl-6 space-y-1">{children}</ul>
  )
);

const ListItemRenderer = ({ children }: { children: React.ReactNode }) => (
  <li className="my-1 leading-relaxed">{children}</li>
);

// Heading renderers
const HeadingRenderer = ({ level, children }: { level: number; children: React.ReactNode }) => {
  const baseClasses = "my-4 font-bold text-white";
  switch (level) {
    case 1:
      return <h1 className={`${baseClasses} text-2xl border-b border-white/10 pb-2`}>{children}</h1>;
    case 2:
      return <h2 className={`${baseClasses} text-xl border-b border-white/10 pb-1`}>{children}</h2>;
    case 3:
      return <h3 className={`${baseClasses} text-lg`}>{children}</h3>;
    case 4:
      return <h4 className={`${baseClasses} text-base`}>{children}</h4>;
    case 5:
      return <h5 className={`${baseClasses} text-sm`}>{children}</h5>;
    default:
      return <h6 className={`${baseClasses} text-xs`}>{children}</h6>;
  }
};

// Paragraph renderer
const ParagraphRenderer = ({ children }: { children: React.ReactNode }) => (
  <div className="my-2 leading-relaxed">{children}</div>
);

// Blockquote renderer
const QuoteRenderer = ({ children }: { children: React.ReactNode }) => (
  <blockquote className="my-3 border-l-4 border-[#6fc7ba]/30 pl-4 py-1 text-gray-300 italic">
    {children}
  </blockquote>
);

// Horizontal rule renderer
const HrRenderer = () => <hr className="my-4 border-white/10" />;

// Table renderers
const TableRenderer = ({ children }: { children: React.ReactNode }) => (
  <div className="my-4 overflow-x-auto rounded-lg border border-white/10">
    <table className="w-full border-collapse text-sm">
      {children}
    </table>
  </div>
);

const TableHeaderRenderer = ({ children }: { children: React.ReactNode }) => (
  <thead className="bg-[#1a1a1a]">
    {children}
  </thead>
);

const TableRowRenderer = ({ children }: { children: React.ReactNode }) => (
  <tr className="border-b border-white/10 hover:bg-white/[0.02]">
    {children}
  </tr>
);

const TableCellRenderer = ({ header, children }: { header?: boolean; children: React.ReactNode }) => (
  header ? (
    <th className="text-left px-3 py-2 font-semibold text-white border-r border-white/10 last:border-r-0">
      {children}
    </th>
  ) : (
    <td className="px-3 py-2 border-r border-white/10 last:border-r-0">
      {children}
    </td>
  )
);

// Image renderer
const ImageRenderer = ({ src, alt }: { src?: string; alt?: string }) => (
  src ? (
    <img 
      src={src} 
      alt={alt || ''} 
      className="my-3 rounded-lg border border-white/10 max-w-full"
    />
  ) : null
);

export default function ChatMessage({ role, content, timestamp, action, airdropAddress }: ChatMessageProps) {
  const isUser = role === 'user';

  return (
    <div className={`flex gap-4 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
        isUser ? 'bg-white/10' : 'bg-[#6fc7ba]/10'
      }`}>
        {isUser ? (
          <User className="h-5 w-5 text-gray-300" />
        ) : (
          <Bot className="h-5 w-5 text-[#6fc7ba]" />
        )}
      </div>

      <div className={`max-w-[80%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div className={`rounded-2xl border px-4 py-3 ${
          isUser
            ? 'border-white/10 bg-white/[0.05] text-white'
            : 'border-white/10 bg-white/[0.02] text-gray-200'
        }`}>
          <div className="text-sm leading-relaxed">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                // Block elements
                h1: ({ children }) => <HeadingRenderer level={1}>{children}</HeadingRenderer>,
                h2: ({ children }) => <HeadingRenderer level={2}>{children}</HeadingRenderer>,
                h3: ({ children }) => <HeadingRenderer level={3}>{children}</HeadingRenderer>,
                h4: ({ children }) => <HeadingRenderer level={4}>{children}</HeadingRenderer>,
                h5: ({ children }) => <HeadingRenderer level={5}>{children}</HeadingRenderer>,
                h6: ({ children }) => <HeadingRenderer level={6}>{children}</HeadingRenderer>,
                p: ({ children }) => <ParagraphRenderer>{children}</ParagraphRenderer>,
                ul: ({ children }) => <ListRenderer ordered={false}>{children}</ListRenderer>,
                ol: ({ children }) => <ListRenderer ordered={true}>{children}</ListRenderer>,
                li: ({ children }) => <ListItemRenderer>{children}</ListItemRenderer>,
                blockquote: ({ children }) => <QuoteRenderer>{children}</QuoteRenderer>,
                hr: HrRenderer,
                
                // Inline elements
                a: ({ href, children }) => <LinkRenderer href={href}>{children}</LinkRenderer>,
                strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
                em: ({ children }) => <em className="italic">{children}</em>,
                code: ({ inline, children }) => {
                  if (inline) {
                    return <CodeInlineRenderer>{children}</CodeInlineRenderer>;
                  }
                  return <CodeBlockRenderer>{children}</CodeBlockRenderer>;
                },
                
                // Table elements
                table: ({ children }) => <TableRenderer>{children}</TableRenderer>,
                thead: ({ children }) => <TableHeaderRenderer>{children}</TableHeaderRenderer>,
                tbody: ({ children }) => <tbody>{children}</tbody>,
                tr: ({ children }) => <TableRowRenderer>{children}</TableRowRenderer>,
                th: ({ children }) => <TableCellRenderer header>{children}</TableCellRenderer>,
                td: ({ children }) => <TableCellRenderer>{children}</TableCellRenderer>,
                
                // Images
                img: ({ src, alt }) => <ImageRenderer src={src as string} alt={alt} />,
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
          {airdropAddress && (
            <a href={`/airdrop/${airdropAddress}`} className="mt-2 inline-block text-xs text-[#6fc7ba] hover:underline">
              View Airdrop →
            </a>
          )}
        </div>
        <span className="text-[10px] text-gray-500">{formatTime(timestamp)}</span>
      </div>
    </div>
  );
}
