import { lazy } from "react";
import type { ToolMeta } from "../tool-meta";
export const PASSWORD_GENERATOR_META: ToolMeta = {
    slug: 'password-generator',
    name: 'Password Generator',
    description: 'Generate strong, random passwords with customizable length and character sets.',
    category: 'generate-tools',
    tag: 'generate',
    keywords: ['password', 'generate', 'random', 'secure', 'generator'],
    toolComponent: lazy(() => import('../../components/tools/generate-tools/PasswordGenerator')),
    about: {
        summary:
            'Password Generator creates cryptographically secure random passwords using the browser\'s built-in Web Crypto API. Customize the length, character sets, and excluded characters to match any password policy — and use the strength meter to verify the result before using it.',
        useCases: [
            'Generating strong passwords for new accounts or services',
            'Creating passwords that meet specific character set requirements',
            'Generating API keys or shared secrets for internal tools',
            'Producing test credentials for staging environments',
            'Replacing weak or reused passwords with secure alternatives',
        ],
        features: [
            'Cryptographically secure using crypto.getRandomValues — not Math.random',
            'Customizable length from 4 to 64 characters',
            'Toggle uppercase, lowercase, numbers, and symbols independently',
            'Exclude ambiguous characters like 0, O, l, 1 to avoid confusion',
            'Strength meter — Weak to Very Strong rating',
            'History of last 10 generated passwords, each individually copyable',
        ],
        tip: 'A 16+ character password with all character types enabled has over 80 bits of entropy — effectively impossible to brute force with any current hardware.',
    },
    addedAt: '2026-03-15',
    complexity: 'moderate',
    featured: false,
    isNew: true,
    status: 'stable',
    seo: {
        title: 'Password Generator — Create strong, random passwords with customizable options',
        description: 'Generate strong, random passwords with customizable length and character sets. Free, runs entirely in your browser.',
        extraKeywords: [
            'password generator',
            'random password generator',
            'secure password generator',
            'generate password online',
            'custom password generator',
            'password generator tool',
            'password generator free',
            'password generator browser',
            'password generator no backend',
            'password generator client-side',
            'password generator crypto',
            'password generator secure',
            'password generator random',
            'password generator options',
            'password generator strength meter',
        ],
    }
}