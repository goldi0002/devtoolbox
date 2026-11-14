import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useMemo } from "react";
import { T as ToolLayout } from "./ToolLayout-CZQXENmQ.js";
import { S as SectionPanel } from "./SectionPanel-gL68ldjv.js";
import { S as StatCard } from "./StatCard-CMT_Clsz.js";
import { T as TipsCard } from "./TipsCard-BoiC-r2p.js";
import { C as CopyButton } from "./CopyButton-BRH0SK_m.js";
import { Info, Trash2, Eye, Coins } from "lucide-react";
import "../main.mjs";
import "vite-react-ssg";
import "react-router-dom";
import "lz-string";
const SAMPLE_PROMPTS = [
  {
    name: "Code Review Request",
    text: `You are an expert software engineer. Review the following TypeScript react hook for performance bottlenecks, potential infinite re-renders, and proper dependency arrays. Suggest refactorings:

\`\`\`tsx
import { useEffect, useState } from 'react';

export function useDataFetcher(url: string) {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(d => setData(d));
  }, [url]);
  
  return data;
}
\`\`\`
`
  },
  {
    name: "JSON Generator API",
    text: `{
  "system_instruction": "Generate a structured response following the user's JSON schema.",
  "temperature": 0.2,
  "max_output_tokens": 4096,
  "response_mime_type": "application/json",
  "messages": [
    {
      "role": "user",
      "content": "Generate a list of 5 premium visual themes for a dashboard with 'name', 'hexPrimary', 'hexSecondary', and 'atmosphere'."
    }
  ]
}`
  },
  {
    name: "System Role Persona",
    text: `You are a helpful, respectful, and honest assistant. Always answer as helpfully as possible, while being safe. Your answers should not include any harmful, unethical, racist, sexist, toxic, dangerous, or illegal content. Please ensure that your responses are socially unbiased and positive in nature.

If a question does not make any sense, or is not factually coherent, explain why instead of answering something not correct. If you don't know the answer to a question, please don't share false information.`
  },
  {
    name: "Few-Shot Learning Examples",
    text: `Translate the following developer slang into plain English.

Input: "LGTM! Let's push to prod on Friday."
Output: "The code changes look satisfactory. We are choosing to deploy this immediately before the weekend."

Input: "We have a spaghetti code situation with a lot of technical debt in the legacy auth module."
Output: "The authentication codebase is complex, disorganized, and difficult to maintain due to hasty early implementations."

Input: "Can you take a look at this stack trace? It's blowing up on the null pointer."
Output:`
  }
];
const MODEL_SPECS = [
  {
    id: "gpt-4o",
    name: "GPT-4o & GPT-4o mini",
    encoding: "o200k_base",
    inputCostPerM: 2.5,
    outputCostPerM: 10,
    description: "Optimized OpenAI model encoding for multilingual efficiency.",
    vowelMergeFactor: 0.94,
    charPerToken: 4.4
  },
  {
    id: "gpt-4-claude",
    name: "GPT-4, Claude 3.5 & Claude 3",
    encoding: "cl100k_base",
    inputCostPerM: 3,
    outputCostPerM: 15,
    description: "Standard OpenAI cl100k_base and Anthropic tokenization style.",
    vowelMergeFactor: 1,
    charPerToken: 4
  },
  {
    id: "gemini-llama3",
    name: "Gemini 1.5, Llama 3 & Gemma",
    encoding: "tiktoken/vocab256k",
    inputCostPerM: 1.25,
    outputCostPerM: 5,
    description: "Expanded vocabulary tokenizers utilized by Google and Meta models.",
    vowelMergeFactor: 0.88,
    charPerToken: 4.6
  },
  {
    id: "llama2",
    name: "Llama 2 & Legacy Models",
    encoding: "sentencepiece/vocab32k",
    inputCostPerM: 0.15,
    outputCostPerM: 0.6,
    description: "Classic BPE tokenization with smaller vocabulary mappings.",
    vowelMergeFactor: 1.05,
    charPerToken: 3.8
  }
];
const TOKEN_COLORS = [
  "bg-sky-500/15 text-sky-300 border-sky-500/25",
  "bg-purple-500/15 text-purple-300 border-purple-500/25",
  "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
  "bg-amber-500/15 text-amber-300 border-amber-500/25",
  "bg-pink-500/15 text-pink-300 border-pink-500/25",
  "bg-indigo-500/15 text-indigo-300 border-indigo-500/25",
  "bg-teal-500/15 text-teal-300 border-teal-500/25",
  "bg-rose-500/15 text-rose-300 border-rose-500/25"
];
function AiTokenCounter() {
  const [inputText, setInputText] = useState("");
  const [selectedModelId, setSelectedModelId] = useState("gpt-4o");
  const activeModel = useMemo(() => {
    return MODEL_SPECS.find((m) => m.id === selectedModelId) || MODEL_SPECS[0];
  }, [selectedModelId]);
  const tokenAnalysis = useMemo(() => {
    if (!inputText) {
      return {
        tokensList: [],
        tokensCount: 0,
        charCount: 0,
        wordCount: 0,
        avgCharsPerToken: 0
      };
    }
    const charCount = inputText.length;
    const wordCount = inputText.trim() === "" ? 0 : inputText.trim().split(/\s+/).length;
    const targetCharPerToken = activeModel.charPerToken;
    const threshold = Math.round(targetCharPerToken * 2.2);
    const visualTokens = [];
    const regexPattern = /'s|'t|'re|'ve|'m|'ll|'d| ?[\p{L}]+| ?[\p{N}]+|[^\s\p{L}\p{N}]+|\s+/gu;
    const segments = Array.from(inputText.matchAll(regexPattern)).map((m) => m[0]);
    for (const segment of segments) {
      if (/^\s+$/.test(segment)) {
        let i = 0;
        while (i < segment.length) {
          visualTokens.push(segment.substring(i, i + 4));
          i += 4;
        }
      } else if (/^[^\s\p{L}\p{N}]+$/u.test(segment)) {
        let i = 0;
        while (i < segment.length) {
          visualTokens.push(segment.substring(i, i + 2));
          i += 2;
        }
      } else {
        const len = segment.length;
        if (len <= threshold) {
          visualTokens.push(segment);
        } else {
          const pieces = Math.max(1, Math.ceil(len / targetCharPerToken));
          const baseSize = Math.floor(len / pieces);
          let extra = len % pieces;
          let startIndex = 0;
          for (let p = 0; p < pieces; p++) {
            const currentSize = baseSize + (extra > 0 ? 1 : 0);
            visualTokens.push(segment.substring(startIndex, startIndex + currentSize));
            startIndex += currentSize;
            extra--;
          }
        }
      }
    }
    const finalCount = visualTokens.length;
    const avgCharsPerToken = finalCount > 0 ? Number((charCount / finalCount).toFixed(1)) : 0;
    return {
      tokensList: visualTokens,
      tokensCount: finalCount,
      charCount,
      wordCount,
      avgCharsPerToken
    };
  }, [inputText, activeModel]);
  const pricingStats = useMemo(() => {
    const tCount = tokenAnalysis.tokensCount;
    const inputCost = tCount / 1e6 * activeModel.inputCostPerM;
    const outputCost = tCount / 1e6 * activeModel.outputCostPerM;
    return {
      inputCostFormatted: inputCost < 1e-5 && tCount > 0 ? "< $0.0001" : `$${inputCost.toFixed(5)}`,
      outputCostFormatted: outputCost < 1e-5 && tCount > 0 ? "< $0.0001" : `$${outputCost.toFixed(5)}`
    };
  }, [tokenAnalysis.tokensCount, activeModel]);
  return /* @__PURE__ */ jsx(
    ToolLayout,
    {
      title: "AI Token Counter & Visualizer",
      description: "Estimate token sizes, inspect character segments, and calculate pricing across GPT-4o, Claude, Gemini, and Llama encoders.",
      tag: "ai",
      children: /* @__PURE__ */ jsxs("div", { className: "space-y-6 animate-fade-in", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-12 gap-4 items-center", children: [
          /* @__PURE__ */ jsxs("div", { className: "md:col-span-4 space-y-1.5", children: [
            /* @__PURE__ */ jsx("label", { className: "text-xs font-mono text-dim tracking-wide uppercase", children: "Select Encoder Model" }),
            /* @__PURE__ */ jsx(
              "select",
              {
                value: selectedModelId,
                onChange: (e) => setSelectedModelId(e.target.value),
                className: "select-base text-xs font-sans h-9",
                children: MODEL_SPECS.map((m) => /* @__PURE__ */ jsxs("option", { value: m.id, children: [
                  m.name,
                  " (",
                  m.encoding,
                  ")"
                ] }, m.id))
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "md:col-span-8 bg-surface/30 border border-border/60 rounded-lg p-3 flex gap-2.5 items-start mt-1 md:mt-0", children: [
            /* @__PURE__ */ jsx(Info, { className: "w-4 h-4 text-accent shrink-0 mt-0.5" }),
            /* @__PURE__ */ jsxs("div", { className: "text-[11px] font-sans text-dim leading-relaxed", children: [
              /* @__PURE__ */ jsx("span", { className: "font-semibold text-bright", children: activeModel.name }),
              ": ",
              activeModel.description,
              " Estimations are processed purely client-side without sending text to external LLM servers."
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3", children: [
          /* @__PURE__ */ jsx(
            StatCard,
            {
              label: "Est. Tokens",
              value: tokenAnalysis.tokensCount.toLocaleString(),
              subValue: `${activeModel.encoding}`
            }
          ),
          /* @__PURE__ */ jsx(
            StatCard,
            {
              label: "Characters",
              value: tokenAnalysis.charCount.toLocaleString(),
              subValue: "Including spaces"
            }
          ),
          /* @__PURE__ */ jsx(
            StatCard,
            {
              label: "Words",
              value: tokenAnalysis.wordCount.toLocaleString(),
              subValue: "White-space split"
            }
          ),
          /* @__PURE__ */ jsx(
            StatCard,
            {
              label: "Avg. Chars / Token",
              value: tokenAnalysis.avgCharsPerToken,
              subValue: "Higher is more efficient"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-12 gap-6", children: [
          /* @__PURE__ */ jsx("div", { className: "lg:col-span-7 flex flex-col space-y-4", children: /* @__PURE__ */ jsx(
            SectionPanel,
            {
              title: "Prompt / Text Input",
              action: /* @__PURE__ */ jsxs("div", { className: "flex gap-1.5", children: [
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => setInputText(""),
                    className: "p-1.5 text-muted hover:text-bright rounded bg-surface/40 hover:bg-surface border border-border/60 transition-colors",
                    title: "Clear input",
                    children: /* @__PURE__ */ jsx(Trash2, { className: "w-3.5 h-3.5" })
                  }
                ),
                inputText && /* @__PURE__ */ jsx(
                  CopyButton,
                  {
                    text: inputText,
                    title: "Copy text",
                    className: "p-1.5 text-muted hover:text-bright rounded bg-surface/40 hover:bg-surface border border-border/60 transition-colors"
                  }
                )
              ] }),
              children: /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
                /* @__PURE__ */ jsx(
                  "textarea",
                  {
                    value: inputText,
                    onChange: (e) => setInputText(e.target.value),
                    placeholder: "Paste your prompt, markdown, code blocks, or JSON payload here to analyze...",
                    className: "w-full h-80 bg-[#0c0c0e] text-xs font-mono text-bright p-4 rounded-lg border border-border/80 focus:border-accent focus:ring-1 focus:ring-accent outline-none resize-none leading-relaxed"
                  }
                ),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("div", { className: "text-[10px] font-mono text-dim tracking-wider uppercase mb-1.5", children: "Load Template Presets" }),
                  /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-1.5", children: SAMPLE_PROMPTS.map((preset, idx) => /* @__PURE__ */ jsx(
                    "button",
                    {
                      type: "button",
                      onClick: () => setInputText(preset.text),
                      className: "bg-surface border border-border hover:border-subtle hover:bg-muted/15 text-[10px] font-sans px-2.5 py-1 rounded text-dim hover:text-bright transition-all",
                      children: preset.name
                    },
                    idx
                  )) })
                ] })
              ] })
            }
          ) }),
          /* @__PURE__ */ jsx("div", { className: "lg:col-span-5 flex flex-col space-y-4", children: /* @__PURE__ */ jsx(SectionPanel, { title: "Visual Token Highlighter", children: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsx("div", { className: "w-full h-80 overflow-y-auto bg-[#0c0c0e] border border-border/80 rounded-lg p-4 font-mono text-xs select-text leading-relaxed whitespace-pre-wrap break-all", children: tokenAnalysis.tokensList.length > 0 ? tokenAnalysis.tokensList.map((token, index) => {
              const colorClass = TOKEN_COLORS[index % TOKEN_COLORS.length];
              return /* @__PURE__ */ jsx(
                "span",
                {
                  className: `${colorClass} px-0.5 py-0.5 rounded-sm border-[0.5px] transition-colors inline-block`,
                  title: `Token #${index + 1} (${token.length} chars)`,
                  children: token === "\n" ? "↵\n" : token
                },
                index
              );
            }) : /* @__PURE__ */ jsxs("div", { className: "h-full flex flex-col items-center justify-center text-center py-16 text-xs text-muted font-mono gap-1.5", children: [
              /* @__PURE__ */ jsx(Eye, { className: "w-5 h-5 text-muted/60" }),
              "Visual highlights will appear here"
            ] }) }),
            /* @__PURE__ */ jsxs("div", { className: "card bg-surface/30 border border-border/80 space-y-2.5", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 border-b border-border/30 pb-2", children: [
                /* @__PURE__ */ jsx(Coins, { className: "w-4 h-4 text-accent" }),
                /* @__PURE__ */ jsx("h4", { className: "text-xs font-semibold font-mono text-dim tracking-wide uppercase", children: "Estimated API Costs" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4 text-xs font-sans", children: [
                /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
                  /* @__PURE__ */ jsx("div", { className: "text-[10px] font-mono text-muted uppercase", children: "Input Cost" }),
                  /* @__PURE__ */ jsx("div", { className: "text-sm font-bold text-bright", children: pricingStats.inputCostFormatted }),
                  /* @__PURE__ */ jsxs("div", { className: "text-[9px] text-dim", children: [
                    "$",
                    activeModel.inputCostPerM,
                    " per 1M tokens"
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
                  /* @__PURE__ */ jsx("div", { className: "text-[10px] font-mono text-muted uppercase", children: "Output Cost" }),
                  /* @__PURE__ */ jsx("div", { className: "text-sm font-bold text-bright", children: pricingStats.outputCostFormatted }),
                  /* @__PURE__ */ jsxs("div", { className: "text-[9px] text-dim", children: [
                    "$",
                    activeModel.outputCostPerM,
                    " per 1M tokens"
                  ] })
                ] })
              ] })
            ] })
          ] }) }) })
        ] }),
        tokenAnalysis.tokensList.length > 0 && /* @__PURE__ */ jsx(SectionPanel, { title: "Individual Token Breakdown", children: /* @__PURE__ */ jsx("div", { className: "overflow-x-auto border border-border/60 rounded-lg max-h-72 overflow-y-auto no-scrollbar", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-left border-collapse", children: [
          /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-border bg-surface/60 text-[10px] font-mono uppercase text-dim tracking-wider", children: [
            /* @__PURE__ */ jsx("th", { className: "py-2.5 px-4 font-semibold", children: "Index" }),
            /* @__PURE__ */ jsx("th", { className: "py-2.5 px-4 font-semibold", children: "Visual Segment" }),
            /* @__PURE__ */ jsx("th", { className: "py-2.5 px-4 font-semibold", children: "Character Length" })
          ] }) }),
          /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/40 font-mono text-xs", children: tokenAnalysis.tokensList.map((token, index) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-muted/5", children: [
            /* @__PURE__ */ jsxs("td", { className: "py-2 px-4 text-muted", children: [
              "#",
              index + 1
            ] }),
            /* @__PURE__ */ jsx("td", { className: "py-2 px-4", children: /* @__PURE__ */ jsx("span", { className: "bg-surface border border-border text-bright px-1.5 py-0.5 rounded", children: token === "\n" ? "\\n (newline)" : token === " " ? "␣ (space)" : token }) }),
            /* @__PURE__ */ jsxs("td", { className: "py-2 px-4 text-dim", children: [
              token.length,
              " chars"
            ] })
          ] }, index)) })
        ] }) }) }),
        /* @__PURE__ */ jsx(
          TipsCard,
          {
            title: "Tokens Explained",
            items: [
              'What is a token? Language models process text in units called tokens. A token can be as short as one character or as long as one word (e.g., "a", "apple", "ing").',
              "Shorter word fragments: Common prefixes, suffixes, and small syllables are often grouped as single tokens, whereas rare words are split into multiple fragments.",
              'Encoder mappings: GPT-4o uses the modern "o200k_base" vocabulary encoding which represents emojis, numbers, and multiple foreign languages with up to 30% fewer tokens than "cl100k_base".',
              "Cost estimation: Costs are calculated using current live pricing per Million tokens. These estimations are helpful for budget engineering in production applications."
            ]
          }
        )
      ] })
    }
  );
}
export {
  AiTokenCounter as default
};
