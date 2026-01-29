import React, { useState, useRef } from 'react';
import { Upload, FileText, X, Loader2, CheckCircle2 } from 'lucide-react';
import { useAssistants } from '@/contexts/AssistantContext';
import { CreateAssistantProgress } from '@/services/assistant.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';

interface CreateAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateAssistantModal: React.FC<CreateAssistantModalProps> = ({ isOpen, onClose }) => {
  const { createAssistant, selectAssistant } = useAssistants();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [temperature, setTemperature] = useState(0.5);
  const [topK, setTopK] = useState(5);
  const [chunkSize, setChunkSize] = useState<number | string>(500);
  const [chunkOverlap, setChunkOverlap] = useState<number | string>(50);

  const [isCreating, setIsCreating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        setError('Please select a PDF file');
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      if (droppedFile.type !== 'application/pdf') {
        setError('Please select a PDF file');
        return;
      }
      setFile(droppedFile);
      setError('');
    }
  };

  const handleProgress = (data: CreateAssistantProgress) => {
    // Map status messages
    let message = data.message;
    if (message.toLowerCase().includes('uploading') || data.status === 'uploading') {
      // Keep original or custom
    } else if (data.progress && data.progress > 90) {
      message = "Applying final touches...";
    }

    setStatusMessage(message);
    if (data.progress !== undefined) {
      setProgress(data.progress);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim() || !file) return;

    setIsCreating(true);
    setError('');
    setProgress(0);
    setStatusMessage('Starting upload...');

    try {
      const assistantId = await createAssistant(
        {
          name: name.trim(),
          file,
          temperature,
          top_k: topK,
          chunk_size: typeof chunkSize === 'number' ? chunkSize : 500,
          chunk_overlap: typeof chunkOverlap === 'number' ? chunkOverlap : 0,
        },
        handleProgress
      );

      toast({
        title: 'Assistant Created!',
        description: `${name} is ready to chat`,
      });

      selectAssistant(parseInt(assistantId));
      setIsCreating(false);
      handleClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to create assistant');
      }
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    if (!isCreating) {
      setName('');
      setFile(null);
      setTemperature(0.5);
      setTopK(5);
      setChunkSize(500);
      setChunkOverlap(50);
      setProgress(0);
      setStatusMessage('');
      setError('');
      onClose();
    }
  };

  // Helper to handle number input with empty string support
  const handleNumberInput = (
    value: string,
    setter: React.Dispatch<React.SetStateAction<number | string>>,
    max?: number
  ) => {
    if (value === '') {
      setter('');
      return;
    }
    const num = parseInt(value);
    if (!isNaN(num)) {
      if (max !== undefined && num > max) {
        setter(max);
      } else {
        setter(num);
      }
    }
  };

  const isComplete = progress === 100;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="flex flex-col max-h-[90vh] p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>Creating New Assistant</DialogTitle>
          <DialogDescription>
            Hold tight, this wouldn't take a while!
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="p-6">
            {isCreating ? (
              <div className="py-12 space-y-6">
                <div className="text-center">
                  {isComplete ? (
                    <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  ) : (
                    <Loader2 className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
                  )}
                  <p className="text-sm font-medium text-foreground">{statusMessage}</p>
                </div>
                <Progress value={progress} className="h-2" />
                <p className="text-center text-xs text-muted-foreground">
                  {progress}%
                </p>
              </div>
            ) : (
              <div className="space-y-6 pb-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="name">Assistant Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Research Paper Assistant"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-background/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label>PDF Document</Label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    {file ? (
                      <div className="flex items-center justify-center gap-2 text-primary">
                        <FileText className="h-5 w-5" />
                        <span className="text-sm font-medium truncate max-w-[200px]">{file.name}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setFile(null);
                          }}
                          className="p-1 hover:bg-primary/10 rounded-full ml-1"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Drop a PDF here or click to browse
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Supports documents up to 2000 pages
                        </p>
                      </>
                    )}
                  </div>
                </div>

                <Accordion type="single" collapsible className="w-full border rounded-lg px-3">
                  <AccordionItem value="advanced" className="border-0">
                    <AccordionTrigger className="text-sm py-3 hover:no-underline">Advanced Settings</AccordionTrigger>
                    <AccordionContent className="space-y-6 pt-2 pb-4">
                      {/* Creativity Level */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <Label>Creativity Level</Label>
                          <span className="text-sm tabular-nums text-muted-foreground bg-muted px-2 py-0.5 rounded text-xs">{temperature.toFixed(1)}</span>
                        </div>
                        <Slider
                          value={[temperature]}
                          onValueChange={([v]) => setTemperature(v)}
                          min={0}
                          max={1}
                          step={0.1}
                          className="py-1"
                        />
                        <p className="text-[0.8rem] text-muted-foreground">
                          Controls Creativity. Lower = More Focused
                        </p>
                      </div>

                      {/* Number of Chunks */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <Label>Number of Chunks to Retrieve</Label>
                          <span className="text-sm tabular-nums text-muted-foreground bg-muted px-2 py-0.5 rounded text-xs">{topK}</span>
                        </div>
                        <Slider
                          value={[topK]}
                          onValueChange={([v]) => setTopK(v)}
                          min={1}
                          max={10}
                          step={1}
                          className="py-1"
                        />
                        <p className="text-[0.8rem] text-muted-foreground">
                          Controls the Depth of Retrieval
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="chunkSize">Chunk Size</Label>
                          <Input
                            id="chunkSize"
                            type="number"
                            value={chunkSize}
                            onChange={(e) => handleNumberInput(e.target.value, setChunkSize, 1024)}
                            placeholder="500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="chunkOverlap">Chunk Overlap</Label>
                          <Input
                            id="chunkOverlap"
                            type="number"
                            value={chunkOverlap}
                            onChange={(e) => handleNumberInput(e.target.value, setChunkOverlap, 150)}
                            placeholder="50"
                          />
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            )}
          </div>
        </ScrollArea>

        {!isCreating && (
          <div className="flex gap-3 px-6 py-4 border-t mt-auto">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!name.trim() || !file}
              className="flex-1"
            >
              Create Assistant
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
