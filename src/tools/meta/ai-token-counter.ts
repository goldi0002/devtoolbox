import { lazy } from 'react'
import type { ToolMeta } from '../tool-meta'

export const AI_TOKEN_COUNTER_META: ToolMeta = {
  slug: 'ai-token-counter',
  name: 'AI Token Counter & Visualizer',
  description: 'Estimate token sizes, inspect character segments, and calculate pricing across GPT-4o, Claude, Gemini, and Llama encoders.',
  category: 'generate-tools',
  tag: 'ai',
  keywords: [
    'ai token counter',
    'token calculator',
    'tiktoken online',
    'gpt token count',
    'claude token estimator',
    'gemini token counter',
    'tokenizer visualizer',
    'bpe encoder online'
  ],
  toolComponent: lazy(() => import('../../components/tools/generate-tools/AiTokenCounter')),
  about: {
    summary: 'The AI Token Counter & Visualizer is a fully client-side utility designed to help prompt engineers and developers estimate API payload size, inspect visual subword segmentation patterns, and calculate API expenses before calling live LLM models.',
    useCases: [
      'Estimating total tokens for system instructions and long conversation histories',
      'Visualizing how rare programming syntaxes, emojis, or spaces are chunked into tokens',
      'Calculating estimated costs of API calls using current input and output pricing specs',
      'Inspecting and debugging token-by-character ratios for budget optimization'
    ],
    features: [
      'Visual Segment Highlighting using alternating custom pastel backgrounds',
      'Multi-Model support including OpenAI o200k_base, cl100k_base, Gemini, and Llama encoders',
      'Live expense calculations based on current million-token input and output values',
      'Detailed tabular list breaking down each individual subword segment and its exact length',
      'Ready-to-use template prompts covering code reviews, APIs, personas, and few-shot examples'
    ],
    tip: 'Click on any template button to instantly load test prompts and compare tokenization counts across different encoders!'
  },
  addedAt: '2026-08-22',
  complexity: 'medium',
  featured: true,
  isNew: true,
  status: 'stable',
  seo: {
    title: 'AI Token Counter & Visualizer — Count GPT, Claude, Gemini & Llama Tokens',
    description: 'Calculate prompt token sizes in your browser. Inspect visual token-by-token highlights and estimate live API expenses for major LLM provider encodings.',
    extraKeywords: [
      'o200k base calculator',
      'cl100k base online',
      'visual tokenizer debugger',
      'llm budget counter'
    ]
  }
}
