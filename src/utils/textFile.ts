/** Largest file a text field accepts by drag and drop (2 MB). */
export const MAX_TEXT_FILE_BYTES = 2 * 1024 * 1024

export type TextFileResult = { ok: true; text: string } | { ok: false; error: string }

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/** Returns a warning when the file is too large to load, otherwise an empty string. */
export function fileSizeError(name: string, size: number, maxBytes = MAX_TEXT_FILE_BYTES): string {
  if (size <= maxBytes) return ''
  return `"${name}" is ${formatSize(size)}, which is over the ${formatSize(maxBytes)} limit for dropped files.`
}

/**
 * Decodes file bytes as UTF-8 text. Rejects content that contains NUL bytes or
 * is not valid UTF-8, which is how binary files (images, archives, PDFs) show up.
 */
export function decodeTextBytes(bytes: Uint8Array, name: string): TextFileResult {
  const notText: TextFileResult = {
    ok: false,
    error: `"${name}" does not look like a text file. Drop a UTF-8 text file instead.`,
  }
  if (bytes.includes(0)) return notText
  try {
    const text = new TextDecoder('utf-8', { fatal: true }).decode(bytes)
    // Strip a leading byte order mark so it does not end up in the field.
    return { ok: true, text: text.charCodeAt(0) === 0xfeff ? text.slice(1) : text }
  } catch {
    return notText
  }
}

/** Reads a dropped file in the browser. Nothing leaves the device. */
export async function readTextFile(file: File, maxBytes = MAX_TEXT_FILE_BYTES): Promise<TextFileResult> {
  const sizeError = fileSizeError(file.name, file.size, maxBytes)
  if (sizeError) return { ok: false, error: sizeError }
  try {
    return decodeTextBytes(new Uint8Array(await file.arrayBuffer()), file.name)
  } catch {
    return { ok: false, error: `Could not read "${file.name}".` }
  }
}
