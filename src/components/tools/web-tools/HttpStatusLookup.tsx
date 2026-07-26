import { useMemo, useState } from 'react'
import ToolLayout from '../../ToolLayout'
import DataTable from '../../ui/DataTable'
import QuickAnswerCard from '../../ui/QuickAnswerCard'
import TextInputField from '../../ui/TextInputField'
import { matchesQuery } from '../../../utils/text'

type StatusRow = {
  code: number
  label: string
  category: string
  meaning: string
}

const STATUSES: StatusRow[] = [
  { code: 100, label: 'Continue', category: 'Informational', meaning: 'The server received the initial request headers and expects the client to continue.' },
  { code: 101, label: 'Switching Protocols', category: 'Informational', meaning: 'The server is switching protocols as requested by the client.' },
  { code: 200, label: 'OK', category: 'Success', meaning: 'The request succeeded and the server returned the expected response.' },
  { code: 201, label: 'Created', category: 'Success', meaning: 'A new resource was created successfully.' },
  { code: 202, label: 'Accepted', category: 'Success', meaning: 'The request was accepted for processing but has not completed yet.' },
  { code: 204, label: 'No Content', category: 'Success', meaning: 'The request succeeded but there is no response body to return.' },
  { code: 301, label: 'Moved Permanently', category: 'Redirection', meaning: 'The resource now lives at a different permanent URL.' },
  { code: 302, label: 'Found', category: 'Redirection', meaning: 'The resource is temporarily available at a different URL.' },
  { code: 304, label: 'Not Modified', category: 'Redirection', meaning: 'Cached content is still fresh, so the client can reuse it.' },
  { code: 307, label: 'Temporary Redirect', category: 'Redirection', meaning: 'Repeat the request at another URL using the same method.' },
  { code: 308, label: 'Permanent Redirect', category: 'Redirection', meaning: 'Repeat the request at a new permanent URL using the same method.' },
  { code: 400, label: 'Bad Request', category: 'Client Error', meaning: 'The request was malformed or invalid.' },
  { code: 401, label: 'Unauthorized', category: 'Client Error', meaning: 'Authentication is required or the supplied credentials are invalid.' },
  { code: 403, label: 'Forbidden', category: 'Client Error', meaning: 'The client is authenticated but is not allowed to access the resource.' },
  { code: 404, label: 'Not Found', category: 'Client Error', meaning: 'The requested resource could not be found.' },
  { code: 405, label: 'Method Not Allowed', category: 'Client Error', meaning: 'The endpoint exists but does not allow that HTTP method.' },
  { code: 409, label: 'Conflict', category: 'Client Error', meaning: 'The request conflicts with the current state of the resource.' },
  { code: 410, label: 'Gone', category: 'Client Error', meaning: 'The resource used to exist but has been permanently removed.' },
  { code: 422, label: 'Unprocessable Content', category: 'Client Error', meaning: 'The payload is syntactically valid but semantically invalid.' },
  { code: 429, label: 'Too Many Requests', category: 'Client Error', meaning: 'The client exceeded a rate limit and should retry later.' },
  { code: 500, label: 'Internal Server Error', category: 'Server Error', meaning: 'The server hit an unexpected condition while processing the request.' },
  { code: 501, label: 'Not Implemented', category: 'Server Error', meaning: 'The server does not support the requested functionality.' },
  { code: 502, label: 'Bad Gateway', category: 'Server Error', meaning: 'An upstream server returned an invalid response.' },
  { code: 503, label: 'Service Unavailable', category: 'Server Error', meaning: 'The server is temporarily unable to handle the request.' },
  { code: 504, label: 'Gateway Timeout', category: 'Server Error', meaning: 'An upstream service took too long to respond.' },
]

export default function HttpStatusLookup() {
  const [query, setQuery] = useState('')

  const matches = useMemo(
    () => STATUSES.filter(status => matchesQuery(query, [status.code, status.label, status.category, status.meaning])),
    [query]
  )

  const exactMatch = useMemo(
    () => STATUSES.find(status => String(status.code) === query.trim()),
    [query]
  )

  return (
    <ToolLayout
      title="HTTP Status Lookup"
      description="Search common HTTP response codes and keep their meanings handy while debugging"
      tag="http"
    >
      <div className="space-y-5">
        <div className="flex flex-wrap gap-2 items-center">
          {[200, 404, 429, 500].map(code => (
            <button key={code} onClick={() => setQuery(String(code))} className="btn-ghost">
              {code}
            </button>
          ))}
          <button onClick={() => setQuery('')} className="btn-primary ml-auto">Show all</button>
        </div>

        <TextInputField
          label="Search by code or status text"
          value={query}
          onChange={setQuery}
          placeholder="e.g. 404, unauthorized, rate limit"
        />

        {exactMatch && (
          <QuickAnswerCard
            headline={`${exactMatch.code} · ${exactMatch.label}`}
            subline={exactMatch.category}
            copyText={`${exactMatch.code} ${exactMatch.label}`}
          />
        )}

        <DataTable
          gridClass="grid-cols-[90px_150px_1fr_auto]"
          columns={[
            { label: 'Code' },
            { label: 'Category' },
            { label: 'Meaning' },
            { label: 'Copy', align: 'right' },
          ]}
          rows={matches}
          rowKey={status => String(status.code)}
          copyText={status => `${status.code} ${status.label}`}
          emptyMessage="No matching HTTP status codes found."
          renderRow={status => (
            <>
              <div>
                <div className="text-sm font-mono text-bright">{status.code}</div>
                <div className="text-xs font-sans text-dim">{status.label}</div>
              </div>
              <div className="text-xs font-mono text-subtle pt-0.5">{status.category}</div>
              <div className="text-sm font-sans text-dim leading-relaxed">{status.meaning}</div>
            </>
          )}
        />
      </div>
    </ToolLayout>
  )
}
