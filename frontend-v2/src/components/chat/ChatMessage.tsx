import React, { useMemo } from 'react';
import { Bot, User } from 'lucide-react';
import { Message } from '@/contexts/ChatContext';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';

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

      <div className={cn("flex flex-col max-w-[85%] gap-1", isUser && "items-end")}>
        <div
          className={cn(
            "px-4 py-3 rounded-2xl shadow-sm prose dark:prose-invert prose-sm max-w-none break-words",
            isUser
              ? "bg-primary text-primary-foreground rounded-tr-sm chat-message-user"
              : "bg-muted/50 rounded-tl-sm chat-message-assistant"
          )}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              // Custom styled components if needed, or rely on prose
              p: ({ children, ...props }) => <p className="mb-1 last:mb-0 leading-relaxed" {...props}>{children}</p>,
              ul: ({ children, ...props }) => <ul className="my-2 ml-4 list-disc" {...props}>{children}</ul>,
              ol: ({ children, ...props }) => <ol className="my-2 ml-4 list-decimal" {...props}>{children}</ol>,
              li: ({ children, ...props }) => <li className="mb-1" {...props}>{children}</li>,
              code: ({ node, inline, className, children, ...props }: any) => {
                return inline ? (
                  <code className="bg-black/10 dark:bg-white/10 rounded px-1 py-0.5 text-xs font-mono" {...props}>{children}</code>
                ) : (
                  <code className="block bg-black/10 dark:bg-white/10 rounded p-2 text-xs font-mono overflow-x-auto my-2" {...props}>{children}</code>
                )
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
