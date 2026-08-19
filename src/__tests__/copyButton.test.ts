import { describe, it, expect } from 'vitest'
import CopyButton from '../components/CopyButton'

describe('CopyButton Component', () => {
  it('is exported as a function component', () => {
    expect(typeof CopyButton).toBe('function')
  })
})
