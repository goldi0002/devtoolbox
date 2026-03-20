// ⚠️ No React imports — safe for vite.config.ts (Node context)
// Mirrors registry.ts but without toolComponent

const toolMeta = [
    { slug: 'json-formatter',      category: 'json-tools'     },
    { slug: 'json-model',          category: 'json-tools'     },
    { slug: 'base64',              category: 'encode-tools'   },
    { slug: 'url-encoder',         category: 'encode-tools'   },
    { slug: 'html-entity',         category: 'encode-tools'   },
    { slug: 'text-diff',           category: 'text-tools'     },
    { slug: 'uuid',                category: 'generate-tools' },
    { slug: 'jwt',                 category: 'auth-tools'     },
    { slug: 'html-formatter',      category: 'web-tools'      },
    { slug: 'password-generator',  category: 'generate-tools' },
    { slug: 'lorem-ipsum-generator', category: 'generate-tools' },
    { slug: 'regex',               category: 'text-tools'     },
    { slug: 'case-converter',      category: 'text-tools'     },
    { slug: 'slug-generator',      category: 'text-tools'     },
    { slug: 'markdown-preview',    category: 'web-tools'      },
    { slug: 'sha256',              category: 'crypto-tools'   },
    { slug: 'word-counter',        category: 'analyze-tools'  },
    { slug: 'timestamp-converter', category: 'data-tools'     },
    { slug: 'query-string-parser',  category: 'web-tools'      },
    { slug: 'color-converter',     category: 'web-tools'      },
    { slug: 'http-status-lookup',  category: 'web-tools'      },
    { slug: 'mime-type-lookup',    category: 'web-tools'      },
    { slug: 'user-agent-parser',   category: 'web-tools'      },
    { slug: 'ascii-table',         category: 'data-tools'     },
    { slug: 'hash-comparator',     category: 'encode-tools'   },
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