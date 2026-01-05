import React from 'react';
import { Bot, User } from 'lucide-react';
import { Message } from '@/contexts/ChatContext';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={cn("flex gap-3 animate-fade-in", isUser && "flex-row-reverse")}>
      <div
        className={cn(
          "flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      <div className={cn("flex flex-col max-w-[75%] gap-1", isUser && "items-end")}>
        <div
          className={cn(
            "px-4 py-3 rounded-2xl",
            isUser
              ? "chat-message-user rounded-tr-sm"
              : "chat-message-assistant rounded-tl-sm"
          )}
        >
          <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
        </div>

        {message.sources && message.sources.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1">
            <span className="text-xs text-muted-foreground">Sources:</span>
            {message.sources.map((page, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="text-xs px-2 py-0.5 cursor-pointer hover:bg-accent"
              >
                Page {page}
              </Badge>
            ))}
          </div>
        )}

        <span className="text-xs text-muted-foreground">
          {format(new Date(message.timestamp), 'h:mm a')}
        </span>
      </div>
    </div>
  );
};
