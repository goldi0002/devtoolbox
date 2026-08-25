import React, { useState, useMemo } from 'react'
import TextInputField from '../../ui/TextInputField'
import DataTable from '../../ui/DataTable'
import ErrorBanner from '../../ui/ErrorBanner'
import SectionPanel from '../../ui/SectionPanel'

export default function UrlParser() {
  const [url, setUrl] = useState('https://example.com:8080/path/to/resource?query=123&sort=asc#fragment')

  const parsed = useMemo(() => {
    if (!url.trim()) return null
    try {
      const u = new URL(url.trim())
      const searchParams = Array.from(u.searchParams.entries()).map(([key, value]) => ({ key, value }))
      
      return {
        href: u.href,
        protocol: u.protocol,
        hostname: u.hostname,
        port: u.port || (u.protocol === 'https:' ? '443' : u.protocol === 'http:' ? '80' : ''),
        host: u.host,
        pathname: u.pathname,
        search: u.search,
        hash: u.hash,
        origin: u.origin,
        username: u.username,
        password: u.password,
        searchParams
      }
    } catch (e) {
      return { error: 'Invalid URL format' }
    }
  }, [url])

  return (
    <div className="space-y-6">
      <SectionPanel title="Input URL">
        <TextInputField
          label="URL to Parse"
          value={url}
          onChange={setUrl}
          placeholder="https://..."
        />
      </SectionPanel>

      {parsed && 'error' in parsed && url.trim() && (
        <ErrorBanner message={parsed.error as string} />
      )}

      {parsed && !('error' in parsed) && (
        <div className="space-y-6">
          <SectionPanel title="URL Components">
            <DataTable
              gridClass="grid-cols-[150px_1fr_40px]"
              columns={[
                { label: 'Property' },
                { label: 'Value' },
                { label: '' }
              ]}
              rows={[
                { property: 'Protocol', value: parsed.protocol },
                { property: 'Hostname', value: parsed.hostname },
                { property: 'Port', value: parsed.port },
                { property: 'Pathname', value: parsed.pathname },
                { property: 'Search (Query)', value: parsed.search },
                { property: 'Hash (Fragment)', value: parsed.hash },
                { property: 'Origin', value: parsed.origin },
                { property: 'Username', value: parsed.username },
                { property: 'Password', value: parsed.password },
              ].filter(row => row.value)}
              rowKey={(row) => row.property}
              renderRow={(row) => (
                <>
                  <span className="font-medium text-subtle truncate">{row.property}</span>
                  <span className="font-mono text-main break-all">{row.value}</span>
                </>
              )}
              copyText={(row) => row.value}
              align="center"
            />
          </SectionPanel>

          {parsed.searchParams.length > 0 && (
            <SectionPanel title="Query Parameters">
              <DataTable
                gridClass="grid-cols-[150px_1fr_40px]"
                columns={[
                  { label: 'Key' },
                  { label: 'Value' },
                  { label: '' }
                ]}
                rows={parsed.searchParams}
                rowKey={(row) => row.key}
                renderRow={(row) => (
                  <>
                    <span className="font-medium text-subtle truncate">{row.key}</span>
                    <span className="font-mono text-main break-all">{row.value}</span>
                  </>
                )}
                copyText={(row) => row.value}
                align="center"
              />
            </SectionPanel>
          )}
        </div>
      )}
    </div>
  )
}
