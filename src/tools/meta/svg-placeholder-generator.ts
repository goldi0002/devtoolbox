import { lazy } from "react";
import type { ToolMeta } from "../tool-meta";

export const SVG_PLACEHOLDER_GENERATOR_META: ToolMeta = {
    slug: 'svg-placeholder-generator',
    name: 'SVG Placeholder',
    description: 'Generate fast, customizable SVG placeholder images for your projects.',
    category: 'generate-tools',
    tag: 'generate',
    toolComponent: lazy(() => import('../../components/tools/generate-tools/SvgPlaceholderGenerator')),
    keywords: [
        'svg placeholder',
        'placeholder image generator',
        'dummy image',
        'mock image',
        'svg generator'
    ],
    about: {
        summary: 'Quickly create SVG placeholder images with customizable dimensions, colors, and text.',
        useCases: ['Mocking up UI layouts', 'Placeholder avatars and thumbnails'],
        features: ['Custom width and height', 'Customizable colors', 'Live preview', 'Copyable SVG code']
    },
    isNew: true,
    status: 'stable',
}
