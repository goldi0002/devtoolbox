import { lazy } from "react";
import type { ToolMeta } from "../tool-meta";

export const RSA_KEY_GENERATOR_META: ToolMeta = {
    slug: 'rsa-key-generator',
    name: 'RSA Key Generator',
    description: 'Generate RSA public and private key pairs securely in your browser.',
    category: 'crypto-tools',
    tag: 'crypto',
    toolComponent: lazy(() => import('../../components/tools/crypto-tools/RsaKeyGenerator')),
    keywords: [
        'rsa key generator',
        'generate rsa keys',
        'public private key generator',
        'pem generator',
        'rsa encryption keys'
    ],
    about: {
        summary: 'Generate secure RSA key pairs using the Web Crypto API without any server communication.',
        useCases: ['Generating keys for SSH', 'Testing asymmetric encryption algorithms', 'Creating JWT signing keys'],
        features: ['Selectable key size (1024, 2048, 4096 bits)', 'Outputs SPKI and PKCS#8 PEM formats', '100% client-side Web Crypto API']
    },
    isNew: true,
    status: 'stable',
}
