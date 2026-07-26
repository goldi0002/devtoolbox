import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useClipboard } from './useClipboard'

describe('useClipboard', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('starts in a non-copied state', () => {
    const { result } = renderHook(() => useClipboard())
    expect(result.current.copied).toBe(false)
  })

  it('writes text to the clipboard and flips copied to true', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { clipboard: { writeText } })

    const { result } = renderHook(() => useClipboard())
    await act(async () => {
      await result.current.copy('hello')
    })

    expect(writeText).toHaveBeenCalledWith('hello')
    expect(result.current.copied).toBe(true)
  })

  it('resets copied to false after the timeout elapses', async () => {
    vi.stubGlobal('navigator', { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } })

    const { result } = renderHook(() => useClipboard(1000))
    await act(async () => {
      await result.current.copy('hello')
    })
    expect(result.current.copied).toBe(true)

    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(result.current.copied).toBe(false)
  })

  it('stays not-copied when the clipboard write fails', async () => {
    vi.stubGlobal('navigator', {
      clipboard: { writeText: vi.fn().mockRejectedValue(new Error('denied')) },
    })

    const { result } = renderHook(() => useClipboard())
    await act(async () => {
      await result.current.copy('hello')
    })

    expect(result.current.copied).toBe(false)
  })
})
