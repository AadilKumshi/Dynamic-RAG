import React from 'react';
import { Assistant } from '@/services/assistant.service';
import { Bot, Sparkles } from 'lucide-react';

interface GeminiWelcomeProps {
    assistant: Assistant;
    onSuggestionClick: (suggestion: string) => void;
}

export const GeminiWelcome: React.FC<GeminiWelcomeProps> = ({ assistant, onSuggestionClick }) => {
    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 animate-fade-in">
            <div className="max-w-2xl w-full space-y-8 text-center">
                <div className="space-y-2">
                    <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 mb-4">
                        <img src="/logo.png" alt="Orion" className="h-8 w-8" />
                    </div>
                    <h1 className="text-4xl font-semibold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                        Hello, {assistant.name} here
                    </h1>
                    <p className="text-xl text-muted-foreground font-light">
                        How can I help you regarding <span className="font-medium text-foreground">{assistant.file_name}</span> today?
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-8 w-full max-w-lg mx-auto">
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
                </div>
            </div>
        </div>
    );
};
