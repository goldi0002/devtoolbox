import { lazy } from "react";
import type { ToolMeta } from "../tool-meta";

export const HEX_CONVERTER_META: ToolMeta = {
    slug: 'hex-converter',
    name: 'Hex Converter',
    description: 'Convert text to hexadecimal and hexadecimal back to text.',
    category: 'encode-tools',
    tag: 'encode',
    toolComponent: lazy(() => import('../../components/tools/encode-tools/HexConverter')),
    keywords: [
        'hex converter',
        'text to hex',
        'hex to text',
        'hexadecimal converter',
        'string to hex'
    ],
    about: {
        summary: 'Convert regular text strings to hexadecimal representation and vice-versa.',
        useCases: ['Encoding payloads', 'Decoding hex strings from logs'],
        features: ['Text to Hex', 'Hex to Text', 'Client-side processing']
    },
    isNew: true,
    status: 'stable',
}
