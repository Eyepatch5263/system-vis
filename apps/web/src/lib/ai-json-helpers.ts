/**
 * Shared JSON extraction helpers used by both /api/ai/suggest and /api/ai/optimize routes.
 */

export function stripModelArtifacts(text: string): string {
  return text.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
}

export function extractFirstBalancedJsonObject(text: string): string | null {
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

export function extractJsonCandidate(text: string): string {
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

export function validateArchitectureParsed(parsed: any): string | null {
  if (!Array.isArray(parsed?.nodes)) return 'Missing or invalid "nodes" array';
  if (!Array.isArray(parsed?.edges)) return 'Missing or invalid "edges" array';
  if (typeof parsed?.explanation !== 'string') return 'Missing "explanation" string';
  if (!parsed?.scalingStrategy) return 'Missing "scalingStrategy" object';
  return null;
}
