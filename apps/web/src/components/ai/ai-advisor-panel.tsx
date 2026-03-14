'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useArchitectureStore } from '@/stores/architecture-store';
import type { AISuggestResponse } from '@system-vis/shared';

export function AIAdvisorPanel() {
  const [description, setDescription] = useState('');
  const [constraints, setConstraints] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AISuggestResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { loadArchitecture } = useArchitectureStore();

  const handleGenerate = async () => {
    if (!description.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/ai/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, constraints: constraints || undefined }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Request failed');
      }

      const data: AISuggestResponse = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!result) return;
    loadArchitecture(
      result.architecture.nodes as Parameters<typeof loadArchitecture>[0],
      result.architecture.edges as Parameters<typeof loadArchitecture>[1],
      result.architecture.name
    );
  };

  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="absolute bottom-4 right-4 z-10"
          />
        }
      >
        AI Advisor
      </SheetTrigger>
      <SheetContent className="w-[420px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>AI Architecture Advisor</SheetTitle>
          <SheetDescription>
            Describe your system and let AI generate an architecture for you.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-sm">System Description</Label>
            <Input
              placeholder="e.g., Food delivery platform for 1M users with real-time tracking"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm">Constraints (optional)</Label>
            <Input
              placeholder="e.g., Must use PostgreSQL, budget-friendly"
              value={constraints}
              onChange={(e) => setConstraints(e.target.value)}
            />
          </div>

          <Button
            className="w-full"
            onClick={handleGenerate}
            disabled={loading || !description.trim()}
          >
            {loading ? 'Generating...' : 'Generate Architecture'}
          </Button>

          {error && (
            <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 p-3 text-sm text-red-800 dark:text-red-200">
              {error}
            </div>
          )}

          {result && (
            <ScrollArea className="h-[calc(100vh-350px)]">
              <div className="space-y-4">
                <Separator />

                {/* Explanation */}
                <div>
                  <div className="text-sm font-medium mb-1">Explanation</div>
                  <p className="text-sm text-muted-foreground">{result.explanation}</p>
                </div>

                {/* Architecture summary */}
                <div>
                  <div className="text-sm font-medium mb-1">Components</div>
                  <div className="flex flex-wrap gap-1">
                    {result.architecture.nodes.map((node) => (
                      <Badge key={node.id} variant="secondary" className="text-xs">
                        {node.data.label}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {result.architecture.nodes.length} nodes, {result.architecture.edges.length} connections
                  </p>
                </div>

                {/* Scaling Strategy */}
                <div>
                  <div className="text-sm font-medium mb-1">Scaling Strategy</div>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {result.scalingStrategy.recommendations.map((rec, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-primary">-</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-muted-foreground mt-1">
                    Estimated capacity: {result.scalingStrategy.estimatedCapacity}
                  </p>
                </div>

                {/* Warnings */}
                {result.warnings.length > 0 && (
                  <div>
                    <div className="text-sm font-medium mb-1">Warnings</div>
                    {result.warnings.map((w, i) => (
                      <div
                        key={i}
                        className="text-xs text-yellow-800 dark:text-yellow-200 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded p-2 mb-1"
                      >
                        {w}
                      </div>
                    ))}
                  </div>
                )}

                <Separator />

                <Button className="w-full" onClick={handleApply}>
                  Apply to Canvas
                </Button>
              </div>
            </ScrollArea>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
