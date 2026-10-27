import type { ContentType, PlatformType } from '@/types';

export type AIGenerationMode = 'LIVE_GEMINI' | 'LOCAL_FALLBACK';

export interface ContentGenerationInput {
  topic: string;
  contentType: ContentType;
  tone?: string;
  targetAudience?: string;
  keywords?: string[];
  language?: string;
}

export interface GeneratedVariant {
  platform: PlatformType;
  caption: string;
  hashtags: string[];
  mediaSuggestion: string;
  callToAction?: string;
}

export interface GeneratedContentResult {
  title: string;
  brief: string;
  contentType: ContentType;
  language: string;
  variants: GeneratedVariant[];
  suggestedVisualPrompt: string;
  modelUsed: string;
  mode: AIGenerationMode;
  durationMs?: number;
}

export interface AIProvider {
  readonly providerName: string;
  generateContent(input: ContentGenerationInput): Promise<GeneratedContentResult>;
}
