import { useId, useState } from 'react'
import type { FAQItem } from '../../hooks/useSEO'

interface FaqAccordionProps {
  items: FAQItem[]
}

/**
 * WAI-ARIA disclosure accordion for tool-page FAQs.
 * Each question is a native <button> (Enter and Space toggle it) with
 * aria-expanded / aria-controls; each answer is a labelled region.
 * Collapsed answers stay in the DOM with `hidden`, so pre-rendered HTML
 * still carries every answer for search engines.
 */
export default function FaqAccordion({ items }: FaqAccordionProps) {
  const baseId = useId()
  const [openItems, setOpenItems] = useState<ReadonlySet<number>>(() => new Set())

  const toggle = (index: number) => {
    setOpenItems((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  return (
    <div className="space-y-4 max-w-2xl">
      {items.map((faq, index) => {
        const isOpen = openItems.has(index)
        const buttonId = `${baseId}-faq-q-${index}`
        const panelId = `${baseId}-faq-a-${index}`
        return (
          <div
            key={index}
            className={`rounded-lg border border-border p-4 transition-all duration-200 ${
              isOpen ? 'bg-surface/80' : 'bg-surface/40'
            }`}
          >
            <h3 className="m-0">
              <button
                type="button"
                id={buttonId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(index)}
                className="flex w-full cursor-pointer items-center justify-between text-left font-sans text-sm font-medium text-bright"
              >
                <span>{faq.question}</span>
                <span
                  aria-hidden="true"
                  className={`ml-2 font-mono text-xs text-subtle transition-transform duration-200 ${
                    isOpen ? 'rotate-90' : ''
                  }`}
                >
                  →
                </span>
              </button>
            </h3>
            <div id={panelId} role="region" aria-labelledby={buttonId} hidden={!isOpen}>
              <p className="mt-3 text-xs font-sans text-dim leading-relaxed border-t border-border/60 pt-3">
                {faq.answer}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
