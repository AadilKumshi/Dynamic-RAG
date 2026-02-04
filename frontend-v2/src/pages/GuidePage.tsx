import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Book, Sliders, Thermometer, LayoutGrid, Layers } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const GuidePage: React.FC = () => {
  return (
    <MainLayout>
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-background to-muted/20">
        <div className="max-w-4xl mx-auto px-6 py-12 md:py-16 space-y-12">
          {/* Header */}
          <div className="space-y-4 text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              How to Use Your Assistant
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-5xl mx-auto">
              When creating a new assistant, you'll encounter several advanced parameters. These settings control how your assistant
            processes documents and generates responses. This guide will help you understand what each parameter does and how to
            choose the right values for your needs.
            </p>
          </div>

          {/* Introduction
          <p className="text-muted-foreground leading-relaxed text-center max-w-1xl mx-auto">
            When creating a new assistant, you'll encounter several advanced parameters. These settings control how your assistant
            processes documents and generates responses. This guide will help you understand what each parameter does and how to
            choose the right values for your needs.
          </p> */}

          {/* Chunk Size */}
          <Card className="border-none shadow-lg bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 rounded-xl bg-blue-500/10">
                    <LayoutGrid className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  Chunk Size
                </CardTitle>
                <Badge variant="secondary" className="text-xs font-mono">100-2000</Badge>
              </div>
              <CardDescription className="text-base mt-2">Controls how large each piece of your document is when split for processing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3">What is it?</h4>
                <p className="text-muted-foreground leading-relaxed">
                  When you upload a document, it's split into smaller "chunks" of text. Chunk Size determines how many characters
                  each chunk contains. Think of it like cutting a long article into smaller paragraphs.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">How to choose:</h4>
                <div className="space-y-3">
                  <div className="bg-blue-500/5 dark:bg-blue-500/10 p-4 rounded-xl border border-blue-500/20">
                    <p className="font-semibold mb-2">Small Chunks (100-500)</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                       Best for precise, specific answers<br/>
                       Good for technical documents with specific facts<br/>
                       Although may miss broader context
                    </p>
                  </div>
                  
                  <div className="bg-green-500/5 dark:bg-green-500/10 p-4 rounded-xl border border-green-500/20">
                    <p className="font-semibold mb-2">Medium Chunks (500-1000)</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                       Balanced approach for most use cases<br/>
                       Good context with precise answers<br/>
                       Works well for articles, reports, and general documents
                    </p>
                  </div>
                  
                  <div className="bg-purple-500/5 dark:bg-purple-500/10 p-4 rounded-xl border border-purple-500/20">
                    <p className="font-semibold mb-2">Large Chunks (1000-2000)</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                       Provides more surrounding context<br/>
                       Better for understanding relationships and themes<br/>
                       Although may include irrelevant information
                    </p>
                  </div>
                </div>
              </div>

              {/* <div className="bg-amber-50 dark:bg-amber-950/30 p-3 rounded-lg">
                <p className="text-xs font-medium mb-1">💡 Pro Tip:</p>
                <p className="text-xs text-muted-foreground">
                  If you're working with highly technical documents with specific terms, use smaller chunks (300-500).
                  For narrative content like books or articles, use larger chunks (800-1200).
                </p>
              </div> */}
            </CardContent>
          </Card>

          {/* Top K Chunks */}
          <Card className="border-none shadow-lg bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 rounded-xl bg-green-500/10">
                    <Sliders className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  Retrieval Depth
                </CardTitle>
                <Badge variant="secondary" className="text-xs font-mono">1-10</Badge>
              </div>
              <CardDescription className="text-base mt-2">Determines how many relevant chunks to retrieve when answering your question</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3">What is it?</h4>
                <p className="text-muted-foreground leading-relaxed">
                  When you ask a question, the assistant searches through all chunks and picks the most relevant ones. 
                  Top K determines how many of these relevant chunks to consider. Think of it as how many paragraphs 
                  from your document the assistant reads before answering.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">How to choose:</h4>
                <div className="space-y-3">
                  <div className="bg-blue-500/5 dark:bg-blue-500/10 p-4 rounded-xl border border-blue-500/20">
                    <p className="font-semibold mb-2">Low Values (1-3)</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                       Fast and focused answers<br/>
                       Good for simple, factual questions<br/>
                       Might miss relevant information from other parts
                    </p>
                  </div>
                  
                  <div className="bg-green-500/5 dark:bg-green-500/10 p-4 rounded-xl border border-green-500/20">
                    <p className="font-semibold mb-2">Medium Values (4-6)</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                       Balanced information gathering<br/>
                       Good for most questions<br/>
                       Considers multiple perspectives from document
                    </p>
                  </div>
                  
                  <div className="bg-purple-500/5 dark:bg-purple-500/10 p-4 rounded-xl border border-purple-500/20">
                    <p className="font-semibold mb-2">High Values (7-10)</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                       Comprehensive answers with lots of context<br/>
                       Great for complex questions requiring multiple sources<br/>
                       May include some less relevant information<br/>
                       Slightly slower response time
                    </p>
                  </div>
                </div>
              </div>

              {/* <div className="bg-amber-50 dark:bg-amber-950/30 p-3 rounded-lg">
                <p className="text-xs font-medium mb-1">💡 Pro Tip:</p>
                <p className="text-xs text-muted-foreground">
                  If your questions need information from multiple sections of your document, increase this value.
                  For quick lookups of specific facts, keep it low (2-3).
                </p>
              </div> */}
            </CardContent>
          </Card>

          {/* Creativity Level */}
          <Card className="border-none shadow-lg bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 rounded-xl bg-orange-500/10">
                    <Thermometer className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  Temperature
                </CardTitle>
                <Badge variant="secondary" className="text-xs font-mono">0.0-2.0</Badge>
              </div>
              <CardDescription className="text-base mt-2">Controls how creative or focused the assistant's responses are</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3">What is it?</h4>
                <p className="text-muted-foreground leading-relaxed">
                  Temperature controls the "creativity" of the assistant. Lower values make the assistant more focused and deterministic,
                  always choosing the most likely words. Higher values make it more creative and varied, sometimes taking unexpected 
                  paths in its responses.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">How to choose:</h4>
                <div className="space-y-3">
                  <div className="bg-blue-500/5 dark:bg-blue-500/10 p-4 rounded-xl border border-blue-500/20">
                    <p className="font-semibold mb-2">Low Temperature (0.0-0.5)</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                       Consistent, factual, and predictable<br/>
                       Good for technical documents and precise information<br/>
                       Minimal variation between answers<br/>
                       Use for: Legal docs, scientific papers, technical manuals
                    </p>
                  </div>
                  
                  <div className="bg-green-500/5 dark:bg-green-500/10 p-4 rounded-xl border border-green-500/20">
                    <p className="font-semibold mb-2">Medium Temperature (0.5-1.0)</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Balanced between accuracy and naturalness<br/>
                      Good for most general documents<br/>
                      Responses feel natural and conversational<br/>
                      Use for: Articles, reports, general Q&A
                    </p>
                  </div>
                  
                  <div className="bg-purple-500/5 dark:bg-purple-500/10 p-4 rounded-xl border border-purple-500/20">
                    <p className="font-semibold mb-2">High Temperature (1.0-2.0)</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                       Creative and varied responses<br/>
                       Good for brainstorming and exploration<br/>
                       May occasionally drift from source material<br/>
                       Use for: Creative writing, idea generation
                    </p>
                  </div>
                </div>
              </div>

              {/* <div className="bg-amber-50 dark:bg-amber-950/30 p-3 rounded-lg">
                <p className="text-xs font-medium mb-1">💡 Pro Tip:</p>
                <p className="text-xs text-muted-foreground">
                  When accuracy is critical (like legal or medical documents), use 0.3 or lower.
                  For casual reading materials, 0.7-0.9 provides natural-sounding responses.
                </p>
              </div> */}
            </CardContent>
          </Card>

          {/* Chunk Overlap */}
          <Card className="border-none shadow-lg bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 rounded-xl bg-indigo-500/10">
                    <Layers className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  Chunk Overlap
                </CardTitle>
                <Badge variant="secondary" className="text-xs font-mono">0-500</Badge>
              </div>
              <CardDescription className="text-base mt-2">Number of characters that overlap between consecutive chunks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3">What is it?</h4>
                <p className="text-muted-foreground leading-relaxed">
                  Imagine cutting a document into chunks. Chunk Overlap means that consecutive chunks share some text - 
                  the end of one chunk overlaps with the beginning of the next. This ensures important context isn't 
                  lost at chunk boundaries.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-xl font-mono text-xs space-y-3 border border-slate-200 dark:border-slate-800">
                <div>
                  <p className="text-muted-foreground mb-1">Example without overlap:</p>
                  <p className="text-blue-600 dark:text-blue-400">Chunk 1: "The quick brown fox"</p>
                  <p className="text-green-600 dark:text-green-400">Chunk 2: "jumps over the lazy"</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Example with overlap (10 chars):</p>
                  <p className="text-blue-600 dark:text-blue-400">Chunk 1: "The quick brown fox"</p>
                  <p className="text-green-600 dark:text-green-400">Chunk 2: "<span className="bg-yellow-200 dark:bg-yellow-900">brown fox </span>jumps over the"</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">How to choose:</h4>
                <div className="space-y-3">
                  <div className="bg-blue-500/5 dark:bg-blue-500/10 p-4 rounded-xl border border-blue-500/20">
                    <p className="font-semibold mb-2">No Overlap (0)</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                       Faster processing and less storage<br/>
                       May lose context at boundaries<br/>
                       Use for: Very large documents where storage matters
                    </p>
                  </div>
                  
                  <div className="bg-green-500/5 dark:bg-green-500/10 p-4 rounded-xl border border-green-500/20">
                    <p className="font-semibold mb-2">Small Overlap (50-150)</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                       Ensures context continuity<br/>
                       Minimal storage overhead<br/>
                       Good for most documents<br/>
                       A good rule: 10-20% of chunk size
                    </p>
                  </div>
                  
                  <div className="bg-purple-500/5 dark:bg-purple-500/10 p-4 rounded-xl border border-purple-500/20">
                    <p className="font-semibold mb-2">Large Overlap (200-500)</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                       Maximum context preservation<br/>
                       Great for complex, interconnected content<br/>
                       Uses more storage and processing<br/>
                       Use for: Legal documents, academic papers
                    </p>
                  </div>
                </div>
              </div>

              {/* <div className="bg-amber-50 dark:bg-amber-950/30 p-3 rounded-lg">
                <p className="text-xs font-medium mb-1">💡 Pro Tip:</p>
                <p className="text-xs text-muted-foreground">
                  A good starting point is to set overlap to about 10-15% of your chunk size. 
                  So if chunk size is 1000, try overlap of 100-150.
                </p>
              </div> */}
            </CardContent>
          </Card>

          {/* Quick Reference */}
          <Card className="border-none shadow-xl bg-gradient-to-br from-primary/5 to-primary/10">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl">Quick Reference: Recommended Settings</CardTitle>
              <CardDescription className="text-base mt-2">Copy these preset configurations for common use cases</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 p-5 rounded-xl border border-blue-200 dark:border-blue-800/30 shadow-sm">
                    <h4 className="font-semibold text-base mb-3 flex items-center gap-2">
                       📑 General Documents
                    </h4>
                    <div className="space-y-1 text-sm">
                      <p><strong>Chunk Size:</strong> 800</p>
                      <p><strong>Top K:</strong> 5</p>
                      <p><strong>Temperature:</strong> 0.7</p>
                      <p><strong>Overlap:</strong> 100</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Perfect for articles, blogs, and general content</p>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 p-5 rounded-xl border border-green-200 dark:border-green-800/30 shadow-sm">
                    <h4 className="font-semibold text-base mb-3 flex items-center gap-2">
                       🔬 Technical
                    </h4>
                    <div className="space-y-1 text-sm">
                      <p><strong>Chunk Size:</strong> 600</p>
                      <p><strong>Top K:</strong> 4</p>
                      <p><strong>Temperature:</strong> 0.3</p>
                      <p><strong>Overlap:</strong> 80</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">For precise, factual information retrieval</p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 p-5 rounded-xl border border-purple-200 dark:border-purple-800/30 shadow-sm">
                    <h4 className="font-semibold text-base mb-3 flex items-center gap-2">
                       📄 Legal Documents
                    </h4>
                    <div className="space-y-1 text-sm">
                      <p><strong>Chunk Size:</strong> 1000</p>
                      <p><strong>Top K:</strong> 6</p>
                      <p><strong>Temperature:</strong> 0.2</p>
                      <p><strong>Overlap:</strong> 200</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Maximum accuracy and context preservation</p>
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 p-5 rounded-xl border border-orange-200 dark:border-orange-800/30 shadow-sm">
                    <h4 className="font-semibold text-base mb-3 flex items-center gap-2">
                       🎭 Creative Content
                    </h4>
                    <div className="space-y-1 text-sm">
                      <p><strong>Chunk Size:</strong> 1200</p>
                      <p><strong>Top K:</strong> 7</p>
                      <p><strong>Temperature:</strong> 0.9</p>
                      <p><strong>Overlap:</strong> 150</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">For books, stories, and brainstorming</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer Note */}
          <Card className="bg-gradient-to-r from-muted/30 to-muted/50 border-none shadow-sm">
            <CardContent className="py-6">
              <p className="text-muted-foreground text-center leading-relaxed">
                 Remember: You can always create a new assistant with different settings to compare results. 
                Experimentation is key to finding what works best for your specific documents!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default GuidePage;
