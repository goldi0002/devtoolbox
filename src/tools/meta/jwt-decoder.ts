import { lazy } from "react";
import type { ToolMeta } from "../tool-meta";
export const JWT_DECODER_META: ToolMeta = {
    slug: 'jwt',
    name: 'JWT Decoder',
    description: 'Decode and inspect JSON Web Tokens — header, payload, expiry and more.',
    category: 'auth-tools',
    tag: 'auth',
    keywords: ['jwt', 'token', 'decode', 'auth', 'bearer', 'json web token', 'claims'],
    toolComponent: lazy(() => import('../../components/tools/auth-tools/JwtDecoder')),
    about: {
        summary:
            'JWT Decoder splits any JSON Web Token into its three parts — header, payload, and signature — and displays them in a readable format. Instantly inspect claims, check expiry times, and understand token structure without needing a secret key or writing any code.',
        useCases: [
            'Debugging authentication issues in your API or frontend app',
            'Checking whether a token has expired without writing code',
            'Inspecting claims returned by OAuth providers like Google or Auth0',
            'Verifying what roles, scopes, or permissions a token contains',
            'Understanding JWT structure while learning about authentication',
        ],
        features: [
            'Decodes header, payload, and signature into separate readable sections',
            'Shows expiry (exp) and issued-at (iat) as human-readable dates',
            'Highlights expired tokens automatically',
            'Displays all claims in a clean formatted layout',
            'Works with HS256, RS256, and all common JWT algorithms',
        ],
        tip: 'Your token never leaves your browser — all decoding happens locally using JavaScript. It\'s safe to paste real tokens here during debugging.',
    },
    addedAt: '2026-03-14',
    complexity: 'simple',
    featured: false,
    isNew: true,
    status: 'stable',
    seo: {
        title: 'JWT Decoder — Decode and inspect JSON Web Tokens online',
        description: 'Decode and inspect JSON Web Tokens (JWTs) online. Instantly view header, payload, claims, and expiry information in a readable format. Free, runs entirely in your browser.',
        extraKeywords: [
            'jwt decoder',
            'json web token decoder',
            'decode jwt online',
            'inspect jwt claims',
            'check jwt expiry',
            'jwt token viewer',
            'jwt inspector',
        ],
    },
    guide: {
        "steps": [
            {
                "name": "Paste your token",
                "text": "Paste the full JWT, including both dots. It is decoded immediately in your browser."
            },
            {
                "name": "Read the header and payload",
                "text": "The header shows the signing algorithm and token type. The payload lists every claim as formatted JSON."
            },
            {
                "name": "Check the expiry",
                "text": "The exp claim is checked against the current time, so you can see how long the token has left or how long ago it expired."
            },
            {
                "name": "Verify an HMAC signature",
                "text": "For HS256, HS384 or HS512 tokens, enter the shared secret to confirm that the signature matches."
            }
        ],
        "faqs": [
            {
                "question": "Is it safe to paste a real JWT here?",
                "answer": "The token is decoded with JavaScript in your browser and is never uploaded. You can confirm this in the Network tab of your DevTools. A production token is still a credential, so treat it carefully wherever you paste it."
            },
            {
                "question": "Can a JWT be decoded without the secret?",
                "answer": "Yes. The header and payload are only Base64URL-encoded, not encrypted, so anyone holding the token can read them. The secret is needed only to verify or create the signature."
            },
            {
                "question": "What do exp, iat and nbf mean?",
                "answer": "They are Unix timestamps in seconds: exp is when the token expires, iat is when it was issued, and nbf is the earliest time it may be used."
            },
            {
                "question": "Which signatures can this tool verify?",
                "answer": "It verifies HMAC signatures (HS256, HS384 and HS512) using a secret you provide. Tokens signed with RS256 or ES256 are decoded, but their signatures are not verified."
            }
        ],
        "example": {
            "title": "Decode the header and payload of an HS256 token.",
            "input": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
            "output": "Header\n{\n  \"alg\": \"HS256\",\n  \"typ\": \"JWT\"\n}\n\nPayload\n{\n  \"sub\": \"1234567890\",\n  \"name\": \"John Doe\",\n  \"iat\": 1516239022\n}",
            "inputLabel": "Encoded token",
            "outputLabel": "Decoded"
        }
    },
}