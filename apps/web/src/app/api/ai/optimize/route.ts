import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';
import { buildBottleneckAnalysisPrompt } from '@/lib/ai-bottleneck-prompt';
import {
  stripModelArtifacts,
  extractJsonCandidate,
} from '@/lib/ai-json-helpers';

// ---------------------------------------------------------------------------
// Route handler — POST /api/ai/optimize
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'OPENAI_API_KEY not configured' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { architecture, bottlenecks, globalMetrics, componentMetrics, nodeLabels } = body;

    if (!architecture || !bottlenecks || !globalMetrics) {
      return NextResponse.json(
        { error: 'architecture, bottlenecks, and globalMetrics are required' },
        { status: 400 }
      );
    }

    // Build a compact architecture JSON (strip requestResponseTemplates to save tokens)
    const compactNodes = architecture.nodes.map((n: any) => {
      const { requestResponseTemplate, ...rest } = n.data || {};
      return { ...n, data: rest };
    });
    const compactArch = JSON.stringify(
      { nodes: compactNodes, edges: architecture.edges },
      null,
      2
    );

    // Build per-component metrics (pick only the fields we need)
    const compactMetrics: Record<string, any> = {};
    if (componentMetrics) {
      for (const [nodeId, m] of Object.entries(componentMetrics) as [string, any][]) {
        compactMetrics[nodeId] = {
          nodeId: m.nodeId,
          requestsPerSecond: m.requestsPerSecond ?? 0,
          cpuUtilization: m.cpuUtilization ?? 0,
          latencyP50Ms: m.latencyP50Ms ?? 0,
          latencyP95Ms: m.latencyP95Ms ?? 0,
          latencyP99Ms: m.latencyP99Ms ?? 0,
          errorRate: m.errorRate ?? 0,
          queueDepth: m.queueDepth ?? 0,
          activeRequests: m.activeRequests ?? 0,
        };
      }
    }

    const prompt = buildBottleneckAnalysisPrompt({
      architectureJson: compactArch,
      bottlenecks,
      globalMetrics,
      componentMetrics: compactMetrics,
      nodeLabels: nodeLabels || {},
    });

    const openai = new OpenAI({ apiKey });
    const model = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';
    const maxCompletionTokens = (() => {
      const v = Number(process.env.OPENAI_MAX_COMPLETION_TOKENS);
      return Number.isFinite(v) && v > 0 ? Math.floor(v) : 8192;
    })();

    const result = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'developer',
          content:
            'You are a system architecture optimization expert. Analyze bottlenecks and return ONLY valid JSON. Do not wrap output in markdown code fences.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_completion_tokens: maxCompletionTokens,
    });

    const finishReason = result.choices[0]?.finish_reason;
    const text = result.choices[0]?.message?.content || '';

    const refusal = result.choices[0]?.message?.refusal;
    if (refusal) {
      return NextResponse.json(
        { error: `Model refused the request: ${refusal}` },
        { status: 422 }
      );
    }

    if (!text) {
      return NextResponse.json(
        { error: 'Model returned empty response', finishReason },
        { status: 502 }
      );
    }

    if (finishReason === 'length') {
      return NextResponse.json(
        { error: 'Model response was truncated (token limit). Try with a simpler architecture.', finishReason },
        { status: 502 }
      );
    }

    let parsed: any;
    try {
      parsed = JSON.parse(extractJsonCandidate(text));
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to parse JSON';
      return NextResponse.json(
        {
          error: `Invalid JSON from model: ${msg}`,
          finishReason,
          rawPreview: stripModelArtifacts(text).slice(0, 1500),
        },
        { status: 502 }
      );
    }

    // Validate shape
    if (!Array.isArray(parsed?.insights)) {
      return NextResponse.json(
        { error: 'Model response missing "insights" array', rawPreview: text.slice(0, 500) },
        { status: 502 }
      );
    }

    // Re-attach requestResponseTemplates to the optimized architecture nodes
    const originalTemplates: Record<string, any> = {};
    for (const node of architecture.nodes) {
      if (node.data?.requestResponseTemplate) {
        originalTemplates[node.id] = node.data.requestResponseTemplate;
      }
    }

    const optimizedNodes = (parsed.optimizedArchitecture?.nodes || []).map((n: any) => {
      if (originalTemplates[n.id] && !n.data?.requestResponseTemplate) {
        return { ...n, data: { ...n.data, requestResponseTemplate: originalTemplates[n.id] } };
      }
      return n;
    });

    const optimizedArchitecture = {
      id: `optimized_${Date.now()}`,
      name: `Optimized: ${architecture.name || 'Architecture'}`,
      nodes: optimizedNodes,
      edges: parsed.optimizedArchitecture?.edges || architecture.edges,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: (architecture.version || 1) + 1,
    };

    return NextResponse.json({
      insights: parsed.insights || [],
      summary: parsed.summary || '',
      optimizedArchitecture,
      changes: parsed.changes || [],
    });
  } catch (error) {
    console.error('AI optimize error:', error);

    if (error instanceof OpenAI.APIError) {
      return NextResponse.json(
        { error: `OpenAI API error ${error.status}: ${error.message}` },
        { status: error.status ?? 500 }
      );
    }

    const errorMessage =
      error instanceof Error ? error.message : 'Failed to analyze bottlenecks';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
