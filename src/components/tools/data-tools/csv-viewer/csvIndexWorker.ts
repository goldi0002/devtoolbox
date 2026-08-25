// High-Performance Web Worker for Background CSV/TXT Byte Indexing
// Runs on a separate CPU thread to keep the main UI at 60 FPS and achieve 100-300+ MB/s indexing

export interface IndexWorkerMessage {
  type: 'progress' | 'complete' | 'error'
  pct?: number
  rowCount?: number
  processedBytes?: number
  pageOffsets?: number[]
  elapsedMs?: number
  bytesPerSec?: number
  error?: string
}

export const createCsvIndexWorker = () => {
  const workerCode = `
    self.onmessage = async function(e) {
      const { file, rowsPerPage, firstRowHeader, chunkSize = 8 * 1024 * 1024 } = e.data
      if (!file) return

      const startTime = performance.now()
      const totalBytes = file.size
      let processedBytes = 0
      let rowCount = 0
      let inQuotes = false
      let isFirstLine = true
      let hasNonWhitespace = false
      const pageOffsets = [0]
      let lastProgressTime = performance.now()

      try {
        while (processedBytes < totalBytes) {
          const nextEnd = Math.min(totalBytes, processedBytes + chunkSize)
          const slice = file.slice(processedBytes, nextEnd)
          const buffer = await slice.arrayBuffer()
          const bytes = new Uint8Array(buffer)
          const len = bytes.length

          // Fast-path: Check if quotes exist in this entire block
          const hasQuotesInBlock = bytes.indexOf(34) !== -1 // 34 is '"'

          if (!hasQuotesInBlock && !inQuotes) {
            // Blazing-fast path: No quotes in this chunk, directly find newlines
            let pos = 0
            while (pos < len) {
              const nextNewline = bytes.indexOf(10, pos) // 10 is '\\n'
              if (nextNewline === -1) {
                // Check if remaining tail has content
                for (let j = pos; j < len; j++) {
                  if (bytes[j] > 32) {
                    hasNonWhitespace = true
                    break
                  }
                }
                break
              }

              // Found a newline at nextNewline
              const currentLineStartOffset = processedBytes + nextNewline + 1
              if (isFirstLine) {
                isFirstLine = false
                if (firstRowHeader) {
                  pageOffsets[0] = currentLineStartOffset
                } else {
                  rowCount++
                }
              } else {
                rowCount++
                if (rowCount % rowsPerPage === 0) {
                  pageOffsets.push(currentLineStartOffset)
                }
              }
              hasNonWhitespace = false
              pos = nextNewline + 1
            }
          } else {
            // RFC 4180 path: Quote-aware state machine
            for (let i = 0; i < len; i++) {
              const byte = bytes[i]
              if (byte === 10) { // '\\n'
                if (!inQuotes) {
                  const currentLineStartOffset = processedBytes + i + 1
                  if (isFirstLine) {
                    isFirstLine = false
                    if (firstRowHeader) {
                      pageOffsets[0] = currentLineStartOffset
                    } else if (hasNonWhitespace) {
                      rowCount++
                    }
                  } else if (hasNonWhitespace) {
                    rowCount++
                    if (rowCount % rowsPerPage === 0) {
                      pageOffsets.push(currentLineStartOffset)
                    }
                  }
                  hasNonWhitespace = false
                }
              } else if (byte === 34) { // '"'
                inQuotes = !inQuotes
                hasNonWhitespace = true
              } else if (byte > 32) {
                hasNonWhitespace = true
              }
            }
          }

          processedBytes += len

          // Throttled progress report to main thread (every 150ms)
          const now = performance.now()
          if (now - lastProgressTime > 150) {
            lastProgressTime = now
            const elapsed = now - startTime
            const pct = Math.min(99, Math.round((processedBytes / totalBytes) * 100))
            const bps = elapsed > 0 ? (processedBytes / (elapsed / 1000)) : 0

            self.postMessage({
              type: 'progress',
              pct,
              rowCount,
              processedBytes,
              pageOffsets: pageOffsets.slice(),
              elapsedMs: elapsed,
              bytesPerSec: bps
            })
          }
        }

        // Final line trailing check
        if (hasNonWhitespace) {
          if (isFirstLine) {
            if (!firstRowHeader) rowCount++
          } else {
            rowCount++
          }
        }

        const totalElapsed = performance.now() - startTime
        const finalBps = totalElapsed > 0 ? (totalBytes / (totalElapsed / 1000)) : 0

        self.postMessage({
          type: 'complete',
          pct: 100,
          rowCount,
          processedBytes: totalBytes,
          pageOffsets,
          elapsedMs: totalElapsed,
          bytesPerSec: finalBps
        })
      } catch (err) {
        self.postMessage({
          type: 'error',
          error: String(err)
        })
      }
    }
  `

  const blob = new Blob([workerCode], { type: 'application/javascript' })
  const workerUrl = URL.createObjectURL(blob)
  const worker = new Worker(workerUrl)

  const terminate = () => {
    worker.terminate()
    URL.revokeObjectURL(workerUrl)
  }

  return { worker, terminate }
}
