import React, { useMemo } from 'react';
import { Bot, User } from 'lucide-react';
import { Message } from '@/contexts/ChatContext';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';

  // Preprocess content to ensure proper LaTeX formatting
  const processedContent = useMemo(() => {
    let content = message.content;
    
    console.log('Original content:', content);
    
    // Convert backticks containing mathematical expressions to $ $ for inline math
    // This regex looks for content in backticks that contains math-like patterns
    content = content.replace(/`([^`]+)`/g, (match, inner) => {
      // Check if it looks like math (contains =, +, -, *, /, (, ), ←, letters, numbers, or is short)
      const isMath = /[=+\-*/()←→≤≥∈∑∫^_]/.test(inner) || /^[a-zA-Z][a-zA-Z0-9]*(\([^)]*\))?$/.test(inner) || /^[a-zA-Z0-9*′]+$/.test(inner);
      return isMath ? `$${inner}$` : match;
    });
    
    // Convert \( \) to $ $ for inline math
    content = content.replace(/\\\(([^)]+)\\\)/g, ' $$$1$$ ');
    
    // Convert \[ \] to $$ $$ for display math
    content = content.replace(/\\\[([^\]]+)\\\]/gs, '\n\n$$$$\n$1\n$$$$\n\n');
    
    console.log('Processed content:', content);
    
    return content;
  }, [message.content]);

  // Basic "streaming" visualization could be done here if needed, 
  // but ReactMarkdown handles updates to 'content' prop efficiently.

  return (
    <div className={cn("flex gap-3 animate-fade-in", isUser && "flex-row-reverse")}>
      {!isUser && (
        <div
          className={cn(
            "flex-shrink-0 h-8 w-8 rounded-lg flex items-center justify-center mt-0.5",
             "bg-primary/10 text-primary"
          )}
        >
          <img src="/logo.png" alt="Orion" className="h-4 w-4" />
        </div>
      )}

      <div className={cn("flex flex-col gap-1", isUser ? "items-end max-w-[85%]" : "max-w-[92%]")}>
        <div
          className={cn(
            "prose dark:prose-invert prose-sm max-w-none break-words",
            isUser
              ? "px-4 py-3 rounded-2xl shadow-sm bg-primary text-primary-foreground rounded-tr-sm chat-message-user"
              : "chat-message-assistant"
          )}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={{
              // Headings
              h1: ({ children, ...props }) => <h1 className="text-xl font-bold mt-4 mb-2" {...props}>{children}</h1>,
              h2: ({ children, ...props }) => <h2 className="text-lg font-bold mt-3 mb-2" {...props}>{children}</h2>,
              h3: ({ children, ...props }) => <h3 className="text-base font-bold mt-3 mb-1" {...props}>{children}</h3>,
              h4: ({ children, ...props }) => <h4 className="text-sm font-bold mt-2 mb-1" {...props}>{children}</h4>,
              // Paragraphs and lists
              p: ({ children, ...props }) => <p className="mb-1 last:mb-0 leading-relaxed" {...props}>{children}</p>,
              ul: ({ children, ...props }) => <ul className="my-2 ml-4 list-disc" {...props}>{children}</ul>,
              ol: ({ children, ...props }) => <ol className="my-2 ml-4 list-decimal" {...props}>{children}</ol>,
              li: ({ children, ...props }) => <li className="mb-1" {...props}>{children}</li>,
              // Strong/bold text - medium emphasis (not as bold as headings)
              strong: ({ children, ...props }) => <strong className="font-semibold" {...props}>{children}</strong>,
              // Table styling
              table: ({ children, ...props }) => (
                <div className="my-4 overflow-x-auto rounded-lg border border-border">
                  <table className="w-full border-collapse text-sm" {...props}>{children}</table>
                </div>
              ),
              thead: ({ children, ...props }) => (
                <thead className="bg-muted/50" {...props}>{children}</thead>
              ),
              tbody: ({ children, ...props }) => (
                <tbody className="divide-y divide-border" {...props}>{children}</tbody>
              ),
              tr: ({ children, ...props }) => (
                <tr className="hover:bg-muted/30 transition-colors" {...props}>{children}</tr>
              ),
              th: ({ children, ...props }) => (
                <th className="px-4 py-3 text-left font-semibold text-foreground border-b border-border" {...props}>{children}</th>
              ),
              td: ({ children, ...props }) => (
                <td className="px-4 py-3 text-foreground" {...props}>{children}</td>
              ),
              code: ({ node, inline, className, children, ...props }: any) => {
                const match = /language-(\w+)/.exec(className || '');
                return !inline && match ? (
                  <code className={`block bg-black/10 dark:bg-white/10 rounded p-2 text-xs font-mono overflow-x-auto my-2 ${className}`} {...props}>{children}</code>
                ) : inline ? (
                  <code className="bg-black/10 dark:bg-white/10 rounded px-1 py-0.5 text-xs font-mono" {...props}>{children}</code>
                ) : (
                  <code className="block bg-black/10 dark:bg-white/10 rounded p-2 text-xs font-mono overflow-x-auto my-2" {...props}>{children}</code>
                );
              }
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>

        {message.sources && message.sources.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1">
            <span className="text-xs text-muted-foreground">Sources:</span>
            {message.sources.map((page, index) => (
              <Badge
                key={index}
                variant="outline"
                className="text-[10px] px-1.5 py-0 h-5 font-normal cursor-pointer hover:bg-accent border-primary/20 bg-primary/5 text-primary"
              >
                Page {page}
              </Badge>
            ))}
          </div>
        )}

        <span className="text-[10px] text-muted-foreground px-1 opacity-70">
          {format(new Date(message.timestamp), 'h:mm a')}
        </span>
      </div>
    </div>
  );
};
