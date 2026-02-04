import React from 'react';
import { FileText, MessageSquare, Sparkles, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface WelcomeScreenProps {
  onCreateAssistant: () => void;
  canCreate: boolean;
}

const features = [
  {
    icon: Upload,
    title: 'Large Document Support',
    description: 'Upload PDFs up to 3,000 pages for comprehensive document analysis',
  },
  {
    icon: MessageSquare,
    title: 'Natural Conversations',
    description: 'Ask questions in plain English and get accurate, contextual answers',
  },
  {
    icon: Sparkles,
    title: 'AI-Powered Analysis',
    description: 'Leverage Artificial Intelligence for document understanding',
  },
  {
    icon: FileText,
    title: 'Source Citations',
    description: 'Every answer includes references to the exact pages in your document',
  },
];

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onCreateAssistant, canCreate }) => {
  return (
    <div className="flex-1 flex items-center justify-center p-6 -mt-16">
      <div className="max-w-2xl w-full text-center animate-fade-in">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Welcome to Origo 
          </h1>
          <p className="text-lg text-muted-foreground">
            Transform your documents into intelligent, conversational assistants!
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {features.map((feature, index) => (
            <Card key={index} className="bg-muted/50">
              <CardContent className="p-5 text-left">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-medium text-foreground mb-1">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card> 
          ))}
        </div>

        <Button 
          size="lg" 
          onClick={onCreateAssistant}
          disabled={!canCreate}
          className="px-8"
        >
          <Upload className="mr-2 h-5 w-5" />
          Create an Assistant
        </Button>

        {!canCreate && (
          <p className="text-sm text-muted-foreground mt-4">
            You've reached the maximum of 5 assistants. Delete one to create a new one.
          </p>
        )}
      </div>
    </div>
  );
};
