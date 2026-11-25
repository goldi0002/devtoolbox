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
        title: 'Password Generator — Free Strong Random Password Maker',
        description: 'Generate strong, random passwords with custom length, symbols, and strength rating using Web Crypto. Free, 100% private in your browser.',
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
    },
    guide: {
        "steps": [
            {
                "name": "Set the length",
                "text": "Choose a length between 4 and 64 characters. Longer is stronger."
            },
            {
                "name": "Choose character types",
                "text": "Turn uppercase, lowercase, numbers and symbols on or off to match the site's password rules."
            },
            {
                "name": "Exclude look-alike characters",
                "text": "Optionally remove ambiguous characters such as 0, O, l and 1 so the password is easier to read aloud or type."
            },
            {
                "name": "Generate and copy",
                "text": "Check the strength rating, copy the password, or create a batch of up to 50 at once."
            }
        ],
        "faqs": [
            {
                "question": "How long should a password be?",
                "answer": "At least 16 characters for important accounts. Length adds more strength than complexity: each extra random character multiplies the number of possible passwords."
            },
            {
                "question": "Are the generated passwords truly random?",
                "answer": "They are created with crypto.getRandomValues, the browser's cryptographically secure random source, rather than the predictable Math.random."
            },
            {
                "question": "Are my passwords stored or sent anywhere?",
                "answer": "No. Passwords are generated in your browser and are never transmitted. Nothing is saved, so a password is gone once you leave or regenerate."
            },
            {
                "question": "Should I exclude ambiguous characters?",
                "answer": "Only if you will read or type the password by hand. Excluding them slightly reduces the character pool, so add a character or two of length to compensate."
            }
        ],
        "example": {
            "title": "A 20-character password using all four character types. Yours will differ.",
            "input": "Length: 20\nUppercase, lowercase, numbers, symbols",
            "output": "vR7#qLm2@Zx9!eTk4$Wp",
            "inputLabel": "Settings",
            "outputLabel": "Result"
        }
    },
}