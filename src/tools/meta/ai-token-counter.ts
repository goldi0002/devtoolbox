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
  guide: {
    "steps": [
      {
        "name": "Paste your text",
        "text": "Paste a prompt, Markdown, code or JSON into the Prompt / Text Input box. The counts update as you type."
      },
      {
        "name": "Pick an encoder",
        "text": "Choose a model family under Select Encoder Model. Each option uses its own approximation and its own built-in price."
      },
      {
        "name": "Read the counts",
        "text": "Check Est. Tokens, Characters, Words and Avg. Chars / Token in the stat cards."
      },
      {
        "name": "Review the segments and cost",
        "text": "Use the Visual Token Highlighter and Individual Token Breakdown to see each segment, and Estimated API Costs for input and output."
      }
    ],
    "faqs": [
      {
        "question": "Are these the exact token counts?",
        "answer": "No. The tool estimates tokens with a heuristic that splits text into words, numbers, punctuation and whitespace, then approximates long words with a per-model characters-per-token value. Real tokenizers can count differently, so confirm with your provider before budgeting."
      },
      {
        "question": "Where do the prices come from?",
        "answer": "The input and output prices per million tokens are fixed in the tool for each model family. They can go out of date, so check your provider's current pricing."
      },
      {
        "question": "Is my text sent anywhere?",
        "answer": "No. The counts, highlights and cost are calculated in your browser and nothing is uploaded."
      },
      {
        "question": "What do the colours in the highlighter mean?",
        "answer": "Each estimated token is shown in one of eight background colours that cycle from one token to the next, so neighbouring segments are easy to tell apart."
      }
    ],
    "example": {
      "title": "Count a short sentence with the GPT-4o encoder (the default).",
      "input": "Hello world",
      "output": "Est. Tokens: 2\nCharacters: 11\nWords: 2\nAvg. Chars / Token: 5.5\nEstimated input cost: < $0.0001",
      "inputLabel": "Prompt",
      "outputLabel": "Stat cards and cost"
    }
  },
  addedAt: '2026-08-22',
  complexity: 'moderate',
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
