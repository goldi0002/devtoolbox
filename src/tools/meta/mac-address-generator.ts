import { lazy } from "react";
import type { ToolMeta } from "../tool-meta";

export const MAC_ADDRESS_GENERATOR_META: ToolMeta = {
    slug: 'mac-address-generator',
    name: 'MAC Address Generator',
    description: 'Generate random MAC addresses with different formats.',
    category: 'generate-tools',
    tag: 'generate',
    toolComponent: lazy(() => import('../../components/tools/generate-tools/MacAddressGenerator')),
    keywords: [
        'mac address generator',
        'random mac address',
        'mac generator',
        'hardware address generator'
    ],
    about: {
        summary: 'Generate valid unicast MAC addresses in various formatting styles.',
        useCases: ['Testing network applications', 'Mocking hardware addresses'],
        features: ['Multiple formats (colon, hyphen, dot)', 'Uppercase/Lowercase options', 'Generate multiple at once']
    },
    isNew: true,
    status: 'stable',
}
