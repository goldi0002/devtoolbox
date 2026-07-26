import { useState, useMemo } from 'react'
import ToolLayout from '../../ToolLayout'
import CodeInput from '../../CodeInput'
import OutputPanel from '../../ui/OutputPanel'
import QuickAnswerCard from '../../ui/QuickAnswerCard'
import CopyButton from '../../CopyButton'

type TargetLanguage = 'js-fetch' | 'node-axios' | 'python' | 'go' | 'rust' | 'php'

interface ParsedCurl {
  url: string
  method: string
  headers: Record<string, string>
  body?: string
  auth?: { username: string; password?: string }
}

function parseCurl(cmd: string): ParsedCurl {
  let cleaned = cmd.trim()
  if (cleaned.startsWith('curl')) {
    cleaned = cleaned.slice(4).trim()
  }

  // Remove line continuations \
  cleaned = cleaned.replace(/\\\r?\n/g, ' ')

  const methodMatch = cleaned.match(/(?:-X|--request)\s+['"]?([A-Z]+)['"]?/i)
  let method = methodMatch ? methodMatch[1].toUpperCase() : 'GET'

  // Extract headers
  const headers: Record<string, string> = {}
  const headerRegex = /(?:-H|--header)\s+(['"])(.*?)\1|(?:-H|--header)\s+([^\s'"]+)/g
  let match: RegExpExecArray | null
  while ((match = headerRegex.exec(cleaned)) !== null) {
    const headerStr = match[2] || match[3]
    if (headerStr) {
      const colonIdx = headerStr.indexOf(':')
      if (colonIdx !== -1) {
        const key = headerStr.slice(0, colonIdx).trim()
        const val = headerStr.slice(colonIdx + 1).trim()
        headers[key] = val
      }
    }
  }

  // Extract User Agent if explicit
  const uaMatch = cleaned.match(/(?:-A|--user-agent)\s+(['"])(.*?)\1/i)
  if (uaMatch) {
    headers['User-Agent'] = uaMatch[2]
  }

  // Extract Basic Auth
  let auth: { username: string; password?: string } | undefined
  const authMatch = cleaned.match(/(?:-u|--user)\s+(['"]?)(.*?)\1(?:\s|$)/i)
  if (authMatch) {
    const userPass = authMatch[2]
    const [u, p] = userPass.split(':')
    auth = { username: u, password: p || '' }
  }

  // Extract Body
  let body: string | undefined
  const bodyRegex = /(?:-d|--data|--data-raw|--data-binary)\s+(['"])([\s\S]*?)\1|(?:-d|--data|--data-raw|--data-binary)\s+([^\s'"]+)/i
  const bodyMatch = bodyRegex.exec(cleaned)
  if (bodyMatch) {
    body = bodyMatch[2] !== undefined ? bodyMatch[2] : bodyMatch[3]
    if (method === 'GET') method = 'POST'
  }

  // Extract URL
  let url = 'https://api.example.com/data'
  const urlRegex = /(https?:\/\/[^\s'"]+)|(?:['"])(https?:\/\/[^'"]+)(?:['"])/i
  const urlMatch = urlRegex.exec(cleaned)
  if (urlMatch) {
    url = urlMatch[1] || urlMatch[2]
  } else {
    // try to find first non-flag string argument
    const tokenRegex = /(?:\s|^)(https?:\/\/[^\s'"]+|['"]https?:\/\/[^'"]+['"])/i
    const tokenMatch = tokenRegex.exec(cleaned)
    if (tokenMatch) {
      url = tokenMatch[1].replace(/['"]/g, '')
    }
  }

  return { url, method, headers, body, auth }
}

function generateJsFetch(parsed: ParsedCurl): string {
  const options: Record<string, unknown> = {
    method: parsed.method,
  }

  const headers = { ...parsed.headers }
  if (parsed.auth) {
    const token = btoa(`${parsed.auth.username}:${parsed.auth.password || ''}`)
    headers['Authorization'] = `Basic ${token}`
  }

  if (Object.keys(headers).length > 0) {
    options.headers = headers
  }

  if (parsed.body) {
    try {
      // If it's valid JSON, format it nicely or use JSON.stringify
      JSON.parse(parsed.body)
      options.body = `JSON.stringify(${parsed.body})`
    } catch {
      options.body = JSON.stringify(parsed.body)
    }
  }

  let code = `fetch("${parsed.url}", {\n`
  code += `  method: "${parsed.method}",\n`

  if (Object.keys(headers).length > 0) {
    code += `  headers: {\n`
    for (const [k, v] of Object.entries(headers)) {
      code += `    "${k}": "${v.replace(/"/g, '\\"')}",\n`
    }
    code += `  },\n`
  }

  if (parsed.body) {
    if (options.body && typeof options.body === 'string' && options.body.startsWith('JSON.stringify(')) {
      code += `  body: JSON.stringify(${parsed.body.trim()}),\n`
    } else {
      code += `  body: ${JSON.stringify(parsed.body)},\n`
    }
  }

  code += `})\n`
  code += `  .then(response => response.json())\n`
  code += `  .then(data => console.log(data))\n`
  code += `  .catch(error => console.error('Error:', error));`

  return code
}

function generateNodeAxios(parsed: ParsedCurl): string {
  let code = `import axios from 'axios';\n\n`
  code += `const config = {\n`
  code += `  method: '${parsed.method.toLowerCase()}',\n`
  code += `  url: '${parsed.url}',\n`

  const headers = { ...parsed.headers }
  if (parsed.auth) {
    code += `  auth: {\n    username: '${parsed.auth.username}',\n    password: '${parsed.auth.password || ''}'\n  },\n`
  }

  if (Object.keys(headers).length > 0) {
    code += `  headers: {\n`
    for (const [k, v] of Object.entries(headers)) {
      code += `    '${k}': '${v.replace(/'/g, "\\'")}',\n`
    }
    code += `  },\n`
  }

  if (parsed.body) {
    try {
      const parsedJson = JSON.parse(parsed.body)
      code += `  data: ${JSON.stringify(parsedJson, null, 4).replace(/\n/g, '\n  ')}\n`
    } catch {
      code += `  data: '${parsed.body.replace(/'/g, "\\'")}'\n`
    }
  }

  code += `};\n\n`
  code += `axios(config)\n`
  code += `  .then(response => console.log(response.data))\n`
  code += `  .catch(error => console.error(error));`

  return code
}

function generatePython(parsed: ParsedCurl): string {
  let code = `import requests\n\n`
  code += `url = "${parsed.url}"\n`

  if (Object.keys(parsed.headers).length > 0) {
    code += `headers = {\n`
    for (const [k, v] of Object.entries(parsed.headers)) {
      code += `    "${k}": "${v.replace(/"/g, '\\"')}",\n`
    }
    code += `}\n`
  }

  let dataStr = ''
  let isJson = false
  if (parsed.body) {
    try {
      JSON.parse(parsed.body)
      isJson = true
      dataStr = `json=${parsed.body.trim()}`
    } catch {
      dataStr = `data="""${parsed.body}"""`
    }
  }

  let authStr = ''
  if (parsed.auth) {
    authStr = `auth=("${parsed.auth.username}", "${parsed.auth.password || ''}")`
  }

  const args: string[] = ['url']
  if (Object.keys(parsed.headers).length > 0) args.push('headers=headers')
  if (dataStr) args.push(dataStr)
  if (authStr) args.push(authStr)

  code += `\nresponse = requests.${parsed.method.toLowerCase()}(${args.join(', ')})\n`
  code += `print(response.status_code)\n`
  code += `print(response.${isJson ? 'json()' : 'text'})`

  return code
}

function generateGo(parsed: ParsedCurl): string {
  let code = `package main\n\nimport (\n\t"fmt"\n\t"io"\n\t"net/http"\n`
  if (parsed.body) code += `\t"strings"\n`
  code += `)\n\nfunc main() {\n`

  if (parsed.body) {
    code += `\tbody := strings.NewReader(\`${parsed.body}\`)\n`
    code += `\treq, err := http.NewRequest("${parsed.method}", "${parsed.url}", body)\n`
  } else {
    code += `\treq, err := http.NewRequest("${parsed.method}", "${parsed.url}", nil)\n`
  }

  code += `\tif err != nil {\n\t\tpanic(err)\n\t}\n`

  for (const [k, v] of Object.entries(parsed.headers)) {
    code += `\treq.Header.Set("${k}", "${v}")\n`
  }

  if (parsed.auth) {
    code += `\treq.SetBasicAuth("${parsed.auth.username}", "${parsed.auth.password || ''}")\n`
  }

  code += `\tclient := &http.Client{}\n`
  code += `\tresp, err := client.Do(req)\n`
  code += `\tif err != nil {\n\t\tpanic(err)\n\t}\n`
  code += `\tdefer resp.Body.Close()\n\n`
  code += `\trespBody, _ := io.ReadAll(resp.Body)\n`
  code += `\tfmt.Println(string(respBody))\n}`

  return code
}

function generateRust(parsed: ParsedCurl): string {
  let code = `use reqwest::header::HeaderMap;\n\n#[tokio::main]\nasync fn main() -> Result<(), Box<dyn std::error::Error>> {\n`
  code += `    let client = reqwest::Client::new();\n`
  code += `    let mut headers = HeaderMap::new();\n`

  for (const [k, v] of Object.entries(parsed.headers)) {
    code += `    headers.insert("${k.toLowerCase()}", "${v}".parse()?);\n`
  }

  code += `\n    let res = client.${parsed.method.toLowerCase()}("${parsed.url}")\n`
  code += `        .headers(headers)\n`

  if (parsed.auth) {
    code += `        .basic_auth("${parsed.auth.username}", Some("${parsed.auth.password || ''}"))\n`
  }

  if (parsed.body) {
    code += `        .body(r#"${parsed.body}"#)\n`
  }

  code += `        .send()\n        .await?;\n\n`
  code += `    let body = res.text().await?;\n`
  code += `    println!("{}", body);\n`
  code += `    Ok(())\n}`

  return code
}

function generatePhp(parsed: ParsedCurl): string {
  let code = `<?php\n\n$curl = curl_init();\n\n`
  code += `curl_setopt_array($curl, [\n`
  code += `  CURLOPT_URL => '${parsed.url}',\n`
  code += `  CURLOPT_RETURNTRANSFER => true,\n`
  code += `  CURLOPT_CUSTOMREQUEST => '${parsed.method}',\n`

  if (parsed.body) {
    code += `  CURLOPT_POSTFIELDS => '${parsed.body.replace(/'/g, "\\'")}',\n`
  }

  if (Object.keys(parsed.headers).length > 0) {
    code += `  CURLOPT_HTTPHEADER => [\n`
    for (const [k, v] of Object.entries(parsed.headers)) {
      code += `    '${k}: ${v.replace(/'/g, "\\'")}',\n`
    }
    code += `  ],\n`
  }

  if (parsed.auth) {
    code += `  CURLOPT_USERPWD => '${parsed.auth.username}:${parsed.auth.password || ''}',\n`
  }

  code += `]);\n\n`
  code += `$response = curl_exec($curl);\n`
  code += `curl_close($curl);\n`
  code += `echo $response;\n`

  return code
}

const SAMPLE_CURLS = [
  {
    name: 'GET with Headers',
    curl: `curl -X GET "https://api.github.com/users/octocat" -H "User-Agent: Toolbox4Devs" -H "Accept: application/vnd.github.v3+json"`,
  },
  {
    name: 'POST JSON Payload',
    curl: `curl -X POST "https://api.example.com/v1/users" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer secret_token_123" \\
  -d '{"name": "Alice Developer", "role": "Engineer", "active": true}'`,
  },
  {
    name: 'Basic Auth Request',
    curl: `curl -u "admin:secretPass123" "https://api.example.com/v1/admin/stats" -H "X-Client: WebApp"`,
  },
]

export default function CurlConverter() {
  const [curlInput, setCurlInput] = useState<string>(SAMPLE_CURLS[1].curl)
  const [targetLang, setTargetLang] = useState<TargetLanguage>('js-fetch')

  const parsed = useMemo(() => {
    try {
      return parseCurl(curlInput)
    } catch {
      return null
    }
  }, [curlInput])

  const generatedCode = useMemo(() => {
    if (!parsed) return '// Failed to parse cURL command'
    switch (targetLang) {
      case 'js-fetch':
        return generateJsFetch(parsed)
      case 'node-axios':
        return generateNodeAxios(parsed)
      case 'python':
        return generatePython(parsed)
      case 'go':
        return generateGo(parsed)
      case 'rust':
        return generateRust(parsed)
      case 'php':
        return generatePhp(parsed)
      default:
        return generateJsFetch(parsed)
    }
  }, [parsed, targetLang])

  return (
    <ToolLayout
      title="cURL to Code Converter"
      description="Convert cURL command line requests into clean JavaScript, Python, Go, Rust, Node.js Axios, or PHP code snippets instantly."
      tag="web"
    >
      <div className="space-y-6">
        {/* Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono text-subtle">Load sample cURL:</span>
          {SAMPLE_CURLS.map(sample => (
            <button
              key={sample.name}
              type="button"
              onClick={() => setCurlInput(sample.curl)}
              className="px-2.5 py-1 text-xs font-mono rounded bg-surface hover:bg-surface/80 border border-border text-dim hover:text-bright transition-colors"
            >
              {sample.name}
            </button>
          ))}
        </div>

        {/* Input */}
        <div>
          <CodeInput
            value={curlInput}
            onChange={setCurlInput}
            placeholder="Paste your curl command here (e.g. curl -X POST https://api.com -H 'Content-Type: application/json' -d '{...}')"
            language="shell"
            label="cURL Command Input"
            rows={5}
          />
        </div>

        {/* Target Language Selection Tabs */}
        <div>
          <label className="block text-xs font-mono text-subtle mb-2">Target Code Language:</label>
          <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-surface border border-border rounded-xl">
            {[
              { id: 'js-fetch', label: 'JavaScript (Fetch)' },
              { id: 'node-axios', label: 'Node.js (Axios)' },
              { id: 'python', label: 'Python (Requests)' },
              { id: 'go', label: 'Go (net/http)' },
              { id: 'rust', label: 'Rust (reqwest)' },
              { id: 'php', label: 'PHP (cURL)' },
            ].map(lang => (
              <button
                key={lang.id}
                type="button"
                onClick={() => setTargetLang(lang.id as TargetLanguage)}
                className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-all ${
                  targetLang === lang.id
                    ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                    : 'text-dim hover:text-bright hover:bg-muted/40'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        {/* Output */}
        <div className="relative">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-subtle">Generated Code Output</span>
            <CopyButton text={generatedCode} />
          </div>
          <OutputPanel
            value={generatedCode}
            language={
              targetLang === 'python'
                ? 'python'
                : targetLang === 'go'
                ? 'go'
                : targetLang === 'rust'
                ? 'rust'
                : targetLang === 'php'
                ? 'php'
                : 'javascript'
            }
          />
        </div>

        {/* Quick Insights Card */}
        {parsed && (
          <QuickAnswerCard
            title="Parsed cURL Details"
            items={[
              { label: 'HTTP Method', value: parsed.method },
              { label: 'Target URL', value: parsed.url },
              { label: 'Headers Count', value: Object.keys(parsed.headers).length.toString() },
              { label: 'Has Body', value: parsed.body ? 'Yes' : 'No' },
              { label: 'Basic Auth', value: parsed.auth ? `User: ${parsed.auth.username}` : 'None' },
            ]}
          />
        )}
      </div>
    </ToolLayout>
  )
}
