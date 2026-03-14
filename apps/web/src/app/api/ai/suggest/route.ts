import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';
import { buildArchitecturePrompt } from '@/lib/ai-prompt-builder';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function stripModelArtifacts(text: string): string {
  return text.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
}

function extractFirstBalancedJsonObject(text: string): string | null {
  const start = text.indexOf('{');
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < text.length; i++) {
    const ch = text[i];

    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (ch === '\\') {
        escaped = true;
        continue;
      }
      if (ch === '"') {
        inString = false;
      }
      continue;
    }

    if (ch === '"') {
      inString = true;
      continue;
    }

    if (ch === '{') depth++;
    if (ch === '}') depth--;

    if (depth === 0) {
      return text.slice(start, i + 1);
    }
  }

  return null;
}

function extractJsonCandidate(text: string): string {
  let t = stripModelArtifacts(text);

  // Prefer fenced JSON if present
  const codeBlockMatch = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (codeBlockMatch) {
    t = codeBlockMatch[1].trim();
  }

  // If there's extra prose around the JSON, try to grab the first balanced object
  const balanced = extractFirstBalancedJsonObject(t);
  if (balanced) return balanced;

  // Fallback: best-effort substring from first '{' to last '}'
  const first = t.indexOf('{');
  const last = t.lastIndexOf('}');
  if (first !== -1 && last > first) {
    return t.slice(first, last + 1);
  }

  return t;
}

// ---------------------------------------------------------------------------
// Lightweight shape check — runs after JSON.parse so missing fields surface
// as clear error messages instead of blowing up downstream.
// ---------------------------------------------------------------------------

function validateParsed(parsed: any): string | null {
  if (!Array.isArray(parsed?.nodes)) return 'Missing or invalid "nodes" array';
  if (!Array.isArray(parsed?.edges)) return 'Missing or invalid "edges" array';
  if (typeof parsed?.explanation !== 'string') return 'Missing "explanation" string';
  if (!parsed?.scalingStrategy) return 'Missing "scalingStrategy" object';
  return null;
}

// ---------------------------------------------------------------------------
// JSON Schema
//
// strict: false is required because node.data uses additionalProperties: true
// to accommodate type-specific fields (cache.hitRate, queue.partitions, etc.)
// that differ per node type. OpenAI rejects strict: true whenever
// additionalProperties: true appears anywhere in the schema tree, and silently
// falls back to unstructured text output — which caused the original
// "unexpected end of JSON input" error.
// ---------------------------------------------------------------------------

const ARCHITECTURE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['nodes', 'edges', 'explanation', 'scalingStrategy', 'warnings'],
  properties: {
    nodes: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['id', 'type', 'position', 'data'],
        properties: {
          id: { type: 'string' },
          type: { type: 'string' },
          position: {
            type: 'object',
            additionalProperties: false,
            required: ['x', 'y'],
            properties: {
              x: { type: 'number' },
              y: { type: 'number' },
            },
          },
          data: {
            // additionalProperties: true is intentional — node data carries
            // type-specific fields that vary per node type.
            type: 'object',
            additionalProperties: true,
            required: [
              'label',
              'nodeType',
              'maxRPS',
              'baseLatencyMs',
              'latencyStdDevMs',
              'failureRate',
              'maxConcurrentRequests',
              'healthStatus',
            ],
            properties: {
              label: { type: 'string' },
              nodeType: { type: 'string' },
              maxRPS: { type: 'number' },
              baseLatencyMs: { type: 'number' },
              latencyStdDevMs: { type: 'number' },
              failureRate: { type: 'number' },
              maxConcurrentRequests: { type: 'number' },
              healthStatus: { type: 'string', enum: ['healthy', 'degraded', 'critical'] },
              requestResponseTemplate: {
                type: 'object',
                additionalProperties: false,
                required: ['requestTemplate', 'responseTemplate'],
                properties: {
                  requestTemplate: {
                    type: 'object',
                    additionalProperties: false,
                    required: ['description', 'sample', 'fields'],
                    properties: {
                      description: { type: 'string' },
                      sample: { type: 'object', additionalProperties: true },
                      fields: {
                        type: 'array',
                        items: {
                          type: 'object',
                          additionalProperties: false,
                          required: ['name', 'type', 'description'],
                          properties: {
                            name: { type: 'string' },
                            type: { type: 'string' },
                            description: { type: 'string' },
                          },
                        },
                      },
                    },
                  },
                  responseTemplate: {
                    type: 'object',
                    additionalProperties: false,
                    required: ['description', 'sample', 'fields'],
                    properties: {
                      description: { type: 'string' },
                      sample: { type: 'object', additionalProperties: true },
                      fields: {
                        type: 'array',
                        items: {
                          type: 'object',
                          additionalProperties: false,
                          required: ['name', 'type', 'description'],
                          properties: {
                            name: { type: 'string' },
                            type: { type: 'string' },
                            description: { type: 'string' },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    edges: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['id', 'source', 'target', 'data'],
        properties: {
          id: { type: 'string' },
          source: { type: 'string' },
          target: { type: 'string' },
          data: {
            type: 'object',
            // edge.data fields are fully known so additionalProperties: false is safe here
            additionalProperties: false,
            required: ['protocol', 'bandwidthMbps', 'latencyOverheadMs', 'encrypted'],
            properties: {
              protocol: { type: 'string' },
              bandwidthMbps: { type: 'number' },
              latencyOverheadMs: { type: 'number' },
              encrypted: { type: 'boolean' },
            },
          },
        },
      },
    },
    explanation: { type: 'string' },
    scalingStrategy: {
      type: 'object',
      additionalProperties: false,
      required: ['recommendations', 'estimatedCapacity'],
      properties: {
        recommendations: { type: 'array', items: { type: 'string' } },
        estimatedCapacity: { type: 'string' },
      },
    },
    warnings: { type: 'array', items: { type: 'string' } },
  },
} as const;

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'OPENAI_API_KEY not configured' }, { status: 500 });
  }

  try {
    const { description, constraints } = await request.json();

    if (!description || typeof description !== 'string') {
      return NextResponse.json({ error: 'description is required' }, { status: 400 });
    }

    const openai = new OpenAI({ apiKey });
    const traffic = getTrafficProfile(description);

    const trafficContext = `
TRAFFIC PROFILE

Tier: ${traffic.tier}
Estimated Users: ${traffic.users}
Estimated Peak RPS: ${traffic.rps}

Design the architecture appropriate for this traffic scale.

Scaling expectations:

TINY (≤100 users)
- monolith allowed
- single DB
- minimal infra
- no queues needed

SMALL (≤1k users)
- basic load balancer
- stateless services
- caching layer optional

LARGE (≤1M users)
- microservices
- distributed cache
- message queues
- sharded database
- async processing

PLANETARY (≤1B users)
- global CDN
- multi-region active-active
- distributed event streaming
- partitioned databases
- aggressive caching
- async pipelines
`;

    const prompt =
      buildArchitecturePrompt(description, constraints) +
      '\n\n' +
      trafficContext;
    const model = process.env.OPENAI_MODEL ?? 'gpt-5.4';
    const maxCompletionTokens = (() => {
      const v = Number(process.env.OPENAI_MAX_COMPLETION_TOKENS);
      return Number.isFinite(v) && v > 0 ? Math.floor(v) : 8192;
    })();

    const result = await openai.chat.completions.create({
      // Default to GPT-5.4; override via OPENAI_MODEL if desired.
      model,
      messages: [
        {
          role: 'developer',
          content:
            'You are a system architecture expert. Return ONLY valid JSON that conforms to the provided JSON Schema. Do not wrap output in markdown code fences.',
        },
        {
          role: 'developer',
          content: `System traffic tier: ${traffic.tier}. Design architecture suitable for ${traffic.users} users and ${traffic.rps} peak RPS.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'architecture_suggestion',
          // FIX 2: strict: true rejects any schema containing additionalProperties: true.
          // With strict: true OpenAI silently fell back to unstructured text output,
          // producing truncated / invalid JSON → "unexpected end of JSON input".
          strict: false,
          schema: ARCHITECTURE_SCHEMA,
        },
      },
      // FIX 3: 4096 tokens is too low. A design with 10+ nodes and full
      // requestResponseTemplate blocks easily exceeds this, cutting the response
      // mid-object and causing "unexpected end of JSON input".
      max_completion_tokens: maxCompletionTokens,
    });

    const finishReason = result.choices[0]?.finish_reason;
    const text = result.choices[0]?.message?.content || '';

    // FIX 4: Check for a structured-output refusal before attempting to parse.
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
        {
          error:
            'Model response was truncated (token limit) and produced invalid JSON. Try a shorter description/constraints.',
          finishReason,
        },
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

    type TrafficTier =
      | 'tiny'
      | 'small'
      | 'large'
      | 'planetary';

    function getTrafficProfile(description: string) {
      const text = description.toLowerCase();

      if (text.includes('billion') || text.includes('1b') || text.includes('1 billion')) {
        return {
          tier: 'planetary',
          users: 1_000_000_000,
          rps: 10_000_000,
          description: 'Planet scale system supporting up to 1 billion users',
        };
      }

      if (text.includes('million') || text.includes('1m')) {
        return {
          tier: 'large',
          users: 1_000_000,
          rps: 50_000,
          description: 'Large scale system supporting up to 1 million users',
        };
      }

      if (text.includes('thousand') || text.includes('1k')) {
        return {
          tier: 'small',
          users: 1_000,
          rps: 2_000,
          description: 'Small production system supporting up to 1000 users',
        };
      }

      return {
        tier: 'tiny',
        users: 100,
        rps: 100,
        description: 'Prototype system supporting up to 100 users',
      };
    }

    const validationError = validateParsed(parsed);
    if (validationError) {
      return NextResponse.json(
        {
          error: `Model JSON is missing required fields: ${validationError}`,
          finishReason,
          rawPreview: stripModelArtifacts(text).slice(0, 1500),
        },
        { status: 502 }
      );
    }

    const architecture = {
      id: `ai_${Date.now()}`,
      name: `AI: ${description.slice(0, 50)}`,
      description,
      nodes: parsed.nodes,
      edges: parsed.edges,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
    };

    return NextResponse.json({
      architecture,
      explanation: parsed.explanation ?? '',
      scalingStrategy: parsed.scalingStrategy ?? { recommendations: [], estimatedCapacity: 'Unknown' },
      warnings: parsed.warnings ?? [],
    });
  } catch (error) {
    console.error('AI suggestion error:', error);

    // FIX 5: Surface OpenAI API errors (wrong model name, quota exceeded, etc.)
    // with their original HTTP status code instead of always returning 500.
    if (error instanceof OpenAI.APIError) {
      return NextResponse.json(
        { error: `OpenAI API error ${error.status}: ${error.message}` },
        { status: error.status ?? 500 }
      );
    }

    const errorMessage =
      error instanceof Error ? error.message : 'Failed to generate architecture suggestion';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

