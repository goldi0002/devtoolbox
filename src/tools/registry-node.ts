// ⚠️ No React imports — safe for vite.config.ts (Node context)
// Mirrors registry.ts but without toolComponent

const toolMeta = [
    { slug: 'json-formatter',      category: 'json-tools'     },
    { slug: 'json-model',          category: 'json-tools'     },
    { slug: 'base64',              category: 'encode-tools'   },
    { slug: 'url-encoder',         category: 'encode-tools'   },
    { slug: 'text-diff',           category: 'text-tools'     },
    { slug: 'uuid',                category: 'generate-tools' },
    { slug: 'jwt-decoder',         category: 'auth-tools'     },
    { slug: 'html-formatter',      category: 'web-tools'      },
    { slug: 'password-generator',  category: 'generate-tools' },
    { slug: 'regex',               category: 'text-tools'     },
    { slug: 'case-converter',      category: 'text-tools'     },
    { slug: 'markdown-preview',    category: 'text-tools'     },
    { slug: 'sha-256',             category: 'crypto-tools'   },
    { slug: 'word-counter',        category: 'analyze-tools'  },
    { slug: 'timestamp-converter', category: 'data-tools'     },
    { slug: 'query-string-parser',  category: 'web-tools'      },
  ] as const
  
  export function getAllAvailableTools() {
    return toolMeta
  }
  
  export function getToolCategories() {
    const seen = new Set<string>()
    return toolMeta
      .filter(t => {
        if (seen.has(t.category)) return false
        seen.add(t.category)
        return true
      })
      .map(t => ({ category: t.category }))
  }