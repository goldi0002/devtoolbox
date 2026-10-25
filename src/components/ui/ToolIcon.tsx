import React, { memo } from 'react'
import type { ToolCategory } from '../../tools/tool-meta'
import { resolveToolIcon, CATEGORY_STYLE_MAP } from '../../lib/icons'

export interface ToolIconProps {
  /** Optional icon name key (e.g. 'Braces', 'KeyRound') */
  name?: string
  /** Tool slug for automatic lookup */
  slug?: string
  /** Tool category for fallback */
  category?: ToolCategory | string
  /** Pixel size (default: 16) */
  size?: number
  /** Additional CSS class for the SVG element */
  className?: string
  /** Render inside a standardized, theme-aware badge container */
  withBadge?: boolean
  /** Size variant when rendered inside a badge */
  badgeSize?: 'sm' | 'md' | 'lg'
  /** Accessible title/label for screen readers */
  ariaLabel?: string
  /** Whether icon is purely decorative (default: true) */
  ariaHidden?: boolean
}

/**
 * Centralized, high-performance icon component for all tool cards and listings.
 * Ensures consistent rendering, tree-shaking, and standardized visual hierarchy.
 */
export const ToolIcon = memo(function ToolIcon({
  name,
  slug,
  category,
  size = 16,
  className = '',
  withBadge = false,
  badgeSize = 'md',
  ariaLabel,
  ariaHidden = true,
}: ToolIconProps) {
  const IconComponent = resolveToolIcon(name, slug, category)
  const catKey = (category && category in CATEGORY_STYLE_MAP ? category : 'default') as ToolCategory | 'default'
  const style = CATEGORY_STYLE_MAP[catKey]

  const iconElement = (
    <IconComponent
      size={size}
      strokeWidth={1.85}
      className={`shrink-0 ${className}`}
      aria-hidden={ariaHidden}
      aria-label={ariaLabel}
    />
  )

  if (!withBadge) {
    return iconElement
  }

  const badgeDimensions = {
    sm: 'w-7 h-7 rounded-md p-1',
    md: 'w-8 h-8 rounded-lg p-1.5',
    lg: 'w-10 h-10 rounded-xl p-2',
  }[badgeSize]

  return (
    <div
      className={`inline-flex items-center justify-center shrink-0 border transition-all duration-200 ${badgeDimensions} ${style.bg} ${style.border} ${style.text} group-hover:scale-105 group-hover:shadow-xs`}
      aria-hidden={ariaHidden}
    >
      {iconElement}
    </div>
  )
})

export default ToolIcon
