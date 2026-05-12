// Replicate API client for browser. Replicate's REST endpoint does not send CORS
// headers, so direct browser calls are blocked. Set REPLICATE_PROXY_URL to a
// same-origin reverse proxy (e.g. /api/replicate -> https://api.replicate.com)
// in production. If unset, we hit api.replicate.com directly (works behind a
// dev proxy or a permissive CORS extension only).

const TOKEN = process.env.REPLICATE_API_TOKEN || '';
const PROXY = process.env.REPLICATE_PROXY_URL || '';
const BASE = PROXY ? PROXY.replace(/\/$/, '') : 'https://api.replicate.com';

// Model versions can change; these slugs use the latest stable channel.
export const MODELS = {
  imageFlux: 'black-forest-labs/flux-1.1-pro',
  imageFluxRedux: 'black-forest-labs/flux-redux-dev', // image-to-image / remix
  videoKling: 'kwaivgi/kling-v2.1',
  textLlama: 'meta/meta-llama-3.1-405b-instruct',
} as const;

export class ReplicateError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.status = status;
  }
}

function requireToken(): string {
  if (!TOKEN) {
    throw new ReplicateError(
      'REPLICATE_API_TOKEN is not set. Add it to .env.local and restart the dev server.'
    );
  }
  return TOKEN;
}

async function api<T = any>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${requireToken()}`,
      'Content-Type': 'application/json',
      Prefer: 'wait=60', // request synchronous response when supported
      ...(init.headers || {}),
    },
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => res.statusText);
    throw new ReplicateError(`Replicate ${res.status}: ${txt}`, res.status);
  }
  return res.json() as Promise<T>;
}

interface Prediction {
  id: string;
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  output: any;
  error: string | null;
  urls?: { get: string; cancel: string };
}

async function waitForPrediction(p: Prediction, onTick?: (status: string) => void): Promise<Prediction> {
  let current = p;
  while (current.status === 'starting' || current.status === 'processing') {
    onTick?.(current.status);
    await new Promise(r => setTimeout(r, 2000));
    const id = current.id;
    current = await api<Prediction>(`/v1/predictions/${id}`);
  }
  if (current.status !== 'succeeded') {
    throw new ReplicateError(current.error || `Prediction ${current.status}`);
  }
  return current;
}

async function runModel(modelSlug: string, input: Record<string, any>, onTick?: (status: string) => void): Promise<any> {
  // Use the models/predictions endpoint so we don't have to pin a version hash.
  const p = await api<Prediction>(`/v1/models/${modelSlug}/predictions`, {
    method: 'POST',
    body: JSON.stringify({ input }),
  });
  if (p.status === 'succeeded') return p.output;
  if (p.status === 'failed') throw new ReplicateError(p.error || 'Prediction failed');
  const done = await waitForPrediction(p, onTick);
  return done.output;
}

async function urlOrDataToDataUrl(value: string, fallbackMime = 'image/png'): Promise<string> {
  if (value.startsWith('data:')) return value;
  const res = await fetch(value);
  const blob = await res.blob();
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}

function pickOutputUrl(output: any): string {
  if (typeof output === 'string') return output;
  if (Array.isArray(output) && output.length) return output[0];
  if (output && typeof output === 'object') {
    if (typeof output.url === 'string') return output.url;
    if (typeof output.video === 'string') return output.video;
  }
  throw new ReplicateError('Unexpected Replicate output shape');
}

function fluxAspectRatio(ratio: '1:1' | '3:4' | '16:9'): string {
  // Flux accepts a curated list; map ours.
  if (ratio === '3:4') return '3:4';
  if (ratio === '16:9') return '16:9';
  return '1:1';
}

function klingAspectRatio(ratio: '1:1' | '3:4' | '16:9'): string {
  if (ratio === '3:4') return '9:16';
  if (ratio === '16:9') return '16:9';
  return '1:1';
}

// --- Public API ---

export async function generateImage(opts: {
  prompt: string;
  aspectRatio: '1:1' | '3:4' | '16:9';
  referenceImage?: string; // data URL or https URL
  onTick?: (status: string) => void;
}): Promise<string> {
  const { prompt, aspectRatio, referenceImage, onTick } = opts;
  const model = referenceImage ? MODELS.imageFluxRedux : MODELS.imageFlux;
  const input: Record<string, any> = {
    prompt,
    aspect_ratio: fluxAspectRatio(aspectRatio),
    output_format: 'png',
    safety_tolerance: 2,
  };
  if (referenceImage) input.redux_image = referenceImage;
  const output = await runModel(model, input, onTick);
  const url = pickOutputUrl(output);
  return urlOrDataToDataUrl(url, 'image/png');
}

export async function remixImages(opts: {
  prompt: string;
  aspectRatio: '1:1' | '3:4' | '16:9';
  characterImage: string;
  sceneImage: string;
  onTick?: (status: string) => void;
}): Promise<string> {
  // Flux Redux only takes a single redux_image; for two-image conditioning we
  // pass the character as the redux reference and inject the scene description
  // into the prompt. The caller has already prepared a textual scene cue.
  const { prompt, aspectRatio, characterImage, onTick } = opts;
  const output = await runModel(
    MODELS.imageFluxRedux,
    {
      prompt,
      aspect_ratio: fluxAspectRatio(aspectRatio),
      output_format: 'png',
      redux_image: characterImage,
    },
    onTick
  );
  return urlOrDataToDataUrl(pickOutputUrl(output), 'image/png');
}

export async function generateVideo(opts: {
  prompt: string;
  aspectRatio: '1:1' | '3:4' | '16:9';
  startImage?: string;
  onTick?: (status: string) => void;
}): Promise<string> {
  const { prompt, aspectRatio, startImage, onTick } = opts;
  const input: Record<string, any> = {
    prompt,
    duration: 5,
    aspect_ratio: klingAspectRatio(aspectRatio),
    mode: 'standard',
  };
  if (startImage) input.start_image = startImage;
  const output = await runModel(MODELS.videoKling, input, onTick);
  return pickOutputUrl(output);
}

export async function generateText(opts: {
  prompt: string;
  maxTokens?: number;
  onTick?: (status: string) => void;
}): Promise<string> {
  const output = await runModel(
    MODELS.textLlama,
    {
      prompt: opts.prompt,
      max_tokens: opts.maxTokens ?? 512,
      temperature: 0.7,
      top_p: 0.95,
    },
    opts.onTick
  );
  if (typeof output === 'string') return output;
  if (Array.isArray(output)) return output.join('');
  throw new ReplicateError('Unexpected text output shape');
}

export function isConfigured(): boolean {
  return Boolean(TOKEN);
}
