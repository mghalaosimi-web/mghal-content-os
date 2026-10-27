import { GeminiAdapter } from './adapters/gemini.adapter';
import type { AIProvider } from './types';

let currentProvider: AIProvider = new GeminiAdapter();

export function getAIProvider(): AIProvider {
  return currentProvider;
}

export function setAIProvider(provider: AIProvider): void {
  currentProvider = provider;
}

export * from './types';
export * from './schema';
export * from './adapters/gemini.adapter';
