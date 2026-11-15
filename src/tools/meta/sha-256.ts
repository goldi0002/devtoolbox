import { lazy } from "react";
import type { ToolMeta } from "../tool-meta";
export const SHA_256_META: ToolMeta = {
    slug: 'sha256',
    name: 'SHA-256 Hash Generator',
    description: 'Generate a SHA-256 hash from any input string instantly in your browser.',
    category: 'crypto-tools',
    tag: 'crypto',
    keywords: ['sha256', 'hash', 'crypto', 'checksum', 'digest'],
    toolComponent: lazy(() => import('../../components/tools/crypto-tools/SHA256')),
    about: {
        summary:
            'SHA-256 Hash Generator creates a unique, fixed-length 256-bit (32-byte) hash from any input string using the SHA-256 algorithm. It\'s widely used for data integrity checks, password hashing, and cryptographic applications. This tool generates the hash instantly in your browser without sending your data anywhere.',
        useCases: [
            'Generating a hash of a password or secret before storing it',
            'Creating a checksum to verify file integrity',
            'Hashing API keys or tokens for secure storage',
            'Testing how different inputs produce different hashes',
            'Learning about cryptographic hashing with live examples',
        ],
        features: [
            'Generates SHA-256 hashes using the Web Crypto API',
            'Instantly produces a 64-character hexadecimal hash string',
            'Works entirely in the browser — no data is transmitted',
            'Copy the generated hash with one click',
        ],
        tip: 'SHA-256 is a one-way hashing algorithm — you can\'t reverse it back to the original input. It\'s designed for security and integrity, not encryption.',
    },
    addedAt: '2026-03-16',
    complexity: 'moderate',
    featured: false,
    isNew: true,
    status: 'stable',
    seo: {
        title: 'SHA-256 Hash Generator — Create SHA-256 hashes instantly in your browser',
        description: 'Generate a SHA-256 hash from any input string instantly in your browser. Free, runs entirely in your browser.',
        extraKeywords: [
            'sha256 hash generator',
            'generate sha256 hash online',
            'sha256 checksum generator',
            'sha256 digest generator',
            'crypto hash generator',
            'hashing tool sha256',
            'sha256 hash converter',
            'sha256 hash utility',
            'sha256 hash online',
            'sha256 hash free',
            'sha256 hash browser',
            'sha256 hash no backend',
            'sha256 hash client-side',
            'sha256 hash secure',
        ],
    },
    guide: {
        "steps": [
            {
                "name": "Enter text or drop a file",
                "text": "Type or paste text, or drag and drop a file to hash its contents."
            },
            {
                "name": "Read the hash",
                "text": "The SHA-256 digest appears as a 64-character hexadecimal string."
            },
            {
                "name": "Verify against a known hash",
                "text": "Paste an expected checksum into the verify field to see whether it matches."
            },
            {
                "name": "Copy the result",
                "text": "Copy the hash for use in a checksum file, a script or documentation."
            }
        ],
        "faqs": [
            {
                "question": "Can a SHA-256 hash be reversed?",
                "answer": "No. SHA-256 is a one-way function. The only way to find an input is to guess candidates and hash each one, which is why short or common inputs can still be found with lookup tables."
            },
            {
                "question": "Is SHA-256 suitable for storing passwords?",
                "answer": "Not on its own. It is designed to be fast, which helps attackers guess billions of passwords per second. Use a slow, salted algorithm such as bcrypt, scrypt or Argon2 for passwords."
            },
            {
                "question": "How do I verify a downloaded file?",
                "answer": "Drop the file into the tool and paste the checksum published by the vendor into the verify field. If they match, the file is intact."
            },
            {
                "question": "Why does a tiny change produce a completely different hash?",
                "answer": "This is the avalanche effect. Changing one bit of input flips about half of the output bits, so similar inputs never produce similar hashes."
            }
        ],
        "example": {
            "title": "Hash a short string.",
            "input": "hello",
            "output": "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824",
            "inputLabel": "Text",
            "outputLabel": "SHA-256"
        }
    },
}