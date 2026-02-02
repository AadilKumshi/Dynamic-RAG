import React from 'react';
import { Assistant } from '@/services/assistant.service';
import { Bot, Sparkles, Book } from 'lucide-react';

interface GeminiWelcomeProps {
    assistant: Assistant;
    onSuggestionClick: (suggestion: string) => void;
}

export const GeminiWelcome: React.FC<GeminiWelcomeProps> = ({ assistant, onSuggestionClick }) => {
    return (
        <div className="w-full max-w-3xl mx-auto text-center animate-fade-in">
            <div className="space-y-2">
                <div className="inline-flex items-center justify-center h-24 w-17 border border-border/50 mb-4 overflow-hidden">
                    {assistant.image_base64 ? (
                        <img 
                            src={`data:image/png;base64,${assistant.image_base64}`} 
                            alt={assistant.name}
                            className="h-full w-full object-contain"
                        />
                    ) : (
                        <Book className="h-8 w-8 text-foreground" />
                    )}
                </div>
                <h1 className="text-4xl font-semibold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent pb-1">
                    Where should we start today?
                </h1>
                {/* <p className="text-xl text-muted-foreground font-light">
                    How can I assist you today?
                </p> */}
            </div>

            {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-8 w-full max-w-lg mx-auto">
                {[
                    "Summarize this document",
                    "What are the key findings?",
                    "Explain the main concepts",
                    "List the references"
                ].map((suggestion, i) => (
                    <div
                        key={i}
                        className="p-4 rounded-xl border border-bg-muted bg-muted/20 hover:bg-muted/50 cursor-pointer transition-colors text-left"
                        onClick={() => onSuggestionClick(suggestion)}
                    >
                        <p className="text-sm font-medium">{suggestion}</p>
                    </div>
                ))}
            </div> */}
        </div>
    );
};

