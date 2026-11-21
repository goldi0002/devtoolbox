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
    guide: {
      "steps": [
        {
          "name": "Choose a key size",
          "text": "Pick 1024, 2048 or 4096 under Key Size (bits)."
        },
        {
          "name": "Generate the pair",
          "text": "Click Generate Key Pair. The button shows Generating... while the keys are created."
        },
        {
          "name": "Read the PEM outputs",
          "text": "Public Key (SPKI) and Private Key (PKCS#8) appear as PEM blocks."
        },
        {
          "name": "Keep the private key safe",
          "text": "The keys are not sent anywhere, so store the private key securely yourself."
        }
      ],
      "faqs": [
        {
          "question": "Which algorithm and parameters are used?",
          "answer": "RSA keys from the Web Crypto API with the RSA-OAEP key type, a SHA-256 hash and public exponent 65537."
        },
        {
          "question": "Which formats are produced?",
          "answer": "The public key is SPKI and the private key is PKCS#8. Both are PEM text with 64-character lines."
        },
        {
          "question": "Is 1024 bits enough?",
          "answer": "No. 1024-bit RSA is too small for new keys, so use 2048 or 4096."
        },
        {
          "question": "Are the keys sent to a server?",
          "answer": "No. The keys are generated in your browser."
        }
      ],
      "example": {
        "title": "Generate a 2048-bit key pair.",
        "input": "2048",
        "output": "A -----BEGIN PUBLIC KEY----- block (SPKI) and a -----BEGIN PRIVATE KEY----- block (PKCS#8). The keys differ on every run.",
        "inputLabel": "Key Size (bits)",
        "outputLabel": "Public and private PEM keys"
      }
    },
    seo: {
        title: 'RSA Key Generator — Create 2048 & 4096-bit PEM Key Pairs Online',
        description: 'Generate RSA public and private key pairs in PEM format using the Web Crypto API. Keys are created in your browser and never sent anywhere.',
    },
}
