// ⚠️ No React imports — safe for vite.config.ts (Node context)
// Mirrors registry.ts but without toolComponent

const toolMeta = [
    { slug: 'json-formatter',                category: 'json-tools'     },
    { slug: 'json-model',                    category: 'json-tools'     },
    { slug: 'json-to-zod',                   category: 'json-tools'     },
    { slug: 'json-to-sql',                   category: 'data-tools'     },
    { slug: 'age-calculator',                category: 'data-tools'     },
    { slug: 'wcag-contrast-checker',         category: 'web-tools'      },
    { slug: 'semver-calculator',             category: 'data-tools'     },
    { slug: 'yaml-json-converter',           category: 'data-tools'     },
    { slug: 'curl-converter',                category: 'web-tools'      },
    { slug: 'sql-formatter',                 category: 'data-tools'     },
    { slug: 'graphql-formatter',             category: 'web-tools'      },
    { slug: 'hmac-generator',                category: 'crypto-tools'   },
    { slug: 'cidr-calculator',               category: 'data-tools'     },
    { slug: 'string-escaper',                category: 'encode-tools'   },
    { slug: 'base-converter',                category: 'data-tools'     },
    { slug: 'css-unit-converter',            category: 'web-tools'      },
    { slug: 'json-to-csv',                   category: 'data-tools'     },
    { slug: 'bcrypt-generator',              category: 'crypto-tools'   },
    { slug: 'keycode-inspector',             category: 'web-tools'      },
    { slug: 'dockerfile-generator',          category: 'generate-tools' },
    { slug: 'base64',                        category: 'encode-tools'   },
    { slug: 'url-encoder',                   category: 'encode-tools'   },
    { slug: 'html-entity',                   category: 'encode-tools'   },
    { slug: 'text-diff',                     category: 'text-tools'     },
    { slug: 'uuid',                          category: 'generate-tools' },
    { slug: 'jwt',                           category: 'auth-tools'     },
    { slug: 'html-formatter',                category: 'web-tools'      },
    { slug: 'password-generator',            category: 'generate-tools' },
    { slug: 'lorem-ipsum-generator',         category: 'generate-tools' },
    { slug: 'regex',                         category: 'text-tools'     },
    { slug: 'case-converter',                category: 'text-tools'     },
    { slug: 'slug-generator',                category: 'text-tools'     },
    { slug: 'markdown-preview',              category: 'web-tools'      },
    { slug: 'sha256',                        category: 'crypto-tools'   },
    { slug: 'word-counter',                  category: 'analyze-tools'  },
    { slug: 'timestamp-converter',           category: 'data-tools'     },
    { slug: 'cron-parser',                   category: 'data-tools'     },
    { slug: 'query-string-parser',            category: 'web-tools'      },
    { slug: 'color-converter',               category: 'web-tools'      },
    { slug: 'http-status-lookup',            category: 'web-tools'      },
    { slug: 'mime-type-lookup',              category: 'web-tools'      },
    { slug: 'user-agent-parser',             category: 'web-tools'      },
    { slug: 'ascii-table',                   category: 'data-tools'     },
    { slug: 'hash-comparator',               category: 'encode-tools'   },
    { slug: 'http-header-parser',            category: 'web-tools'      },
    { slug: 'basic-auth-header',             category: 'auth-tools'     },
    { slug: 'unix-permissions-calculator',   category: 'data-tools'     },
    { slug: 'local-ai-text-assistant',       category: 'analyze-tools'  },
    { slug: 'csv-to-markdown',               category: 'text-tools'     },
    { slug: 'hex-converter',                 category: 'encode-tools'   },
    { slug: 'mac-address-generator',         category: 'generate-tools' },
    { slug: 'rsa-key-generator',             category: 'crypto-tools'   },
    { slug: 'svg-placeholder-generator',     category: 'generate-tools' },
    { slug: 'url-parser',                    category: 'web-tools'      },
    { slug: 'xml-formatter',                 category: 'web-tools'      },
    { slug: 'line-sorter',                   category: 'text-tools'     },
    { slug: 'number-to-words',               category: 'data-tools'     },
    { slug: 'docker-run-to-compose',         category: 'generate-tools' },
    { slug: 'svg-to-jsx',                    category: 'web-tools'      },
    { slug: 'qr-code-generator',             category: 'generate-tools' },
    { slug: 'qr-code-scanner',               category: 'analyze-tools'  },
    { slug: 'gitignore-generator',           category: 'generate-tools' },
    { slug: 'text-repeater',                 category: 'text-tools'     },
    { slug: 'ai-token-counter',              category: 'generate-tools' },
    { slug: 'jwt-encoder',                   category: 'auth-tools'     },
    { slug: 'cron-generator',                category: 'data-tools'     },
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