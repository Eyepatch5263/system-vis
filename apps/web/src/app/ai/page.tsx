'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useArchitectureStore } from '@/stores/architecture-store';
import type { AISuggestResponse } from '@system-vis/shared';

export default function AIPage() {
  const router = useRouter();
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
      setError(err instanceof Error ? err.message : 'Failed to generate architecture');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyAndSimulate = () => {
    if (!result) return;

    // Load the architecture into the store
    loadArchitecture(
      result.architecture.nodes as Parameters<typeof loadArchitecture>[0],
      result.architecture.edges as Parameters<typeof loadArchitecture>[1],
      result.architecture.name
    );

    // Navigate to simulate page
    router.push('/simulate');
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="h-full p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold">AI System Architect</h1>
            <p className="text-muted-foreground mt-1">
              Describe your application and AI will design the perfect architecture for you
            </p>
          </div>

          {!result ? (
            // Input Form
            <Card>
              <CardHeader>
                <CardTitle>Generate System Architecture</CardTitle>
                <CardDescription>
                  Describe your application requirements and AI will automatically generate the system architecture with all necessary components and connections.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description">Application Description</Label>
                  <Textarea
                    id="description"
                    placeholder="e.g., A food delivery app for 10k users with real-time tracking, order management, restaurant inventory, and payment processing"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="min-h-[120px] resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    📝 Tip: Include user scale, core features, and any specific requirements
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="constraints">Constraints (Optional)</Label>
                  <Textarea
                    id="constraints"
                    placeholder="e.g., Must use PostgreSQL, budget-friendly, low latency required, 99.9% uptime"
                    value={constraints}
                    onChange={(e) => setConstraints(e.target.value)}
                    className="min-h-[80px] resize-none"
                  />
                </div>

                <Button
                  className="w-full"
                  onClick={handleGenerate}
                  disabled={loading || !description.trim()}
                  size="lg"
                >
                  {loading ? 'Generating Architecture...' : '✨ Generate Architecture'}
                </Button>

                {error && (
                  <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 p-4 text-sm text-red-800 dark:text-red-200">
                    <div className="font-semibold mb-1">Error</div>
                    {error}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            // Results
            <>
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{result.architecture.name}</h2>
                  <p className="text-muted-foreground mt-2 max-w-2xl">{result.explanation}</p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setResult(null)}
                  className="ml-4"
                >
                  Generate New
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Architecture Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Components */}
                  <div>
                    <div className="text-sm font-semibold mb-2">Components ({result.architecture.nodes.length})</div>
                    <div className="flex flex-wrap gap-2">
                      {result.architecture.nodes.map((node) => (
                        <Badge key={node.id} variant="secondary" className="text-xs">
                          {node.data.label}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Scaling Strategy */}
                  <div>
                    <div className="text-sm font-semibold mb-2">Scaling Strategy</div>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {result.scalingStrategy.recommendations.map((rec, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-primary">→</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-2 text-sm">
                      <span className="font-semibold">Estimated Capacity:</span>{' '}
                      <span className="text-muted-foreground">{result.scalingStrategy.estimatedCapacity}</span>
                    </div>
                  </div>

                  {result.warnings.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <div className="text-sm font-semibold mb-2">Warnings</div>
                        <ScrollArea className="max-h-[200px]">
                          <div className="space-y-2">
                            {result.warnings.map((w, i) => (
                              <div
                                key={i}
                                className="text-xs text-yellow-800 dark:text-yellow-200 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded p-2"
                              >
                                ⚠️ {w}
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Button
                  className="flex-1"
                  onClick={handleApplyAndSimulate}
                  size="lg"
                >
                  🚀 Apply & Simulate on Canvas
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

