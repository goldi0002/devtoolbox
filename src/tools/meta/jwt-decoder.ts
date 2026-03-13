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
    }
}