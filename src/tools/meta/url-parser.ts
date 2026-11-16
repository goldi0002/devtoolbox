import { lazy } from "react";
import type { ToolMeta } from "../tool-meta";

export const URL_PARSER_META: ToolMeta = {
    slug: 'url-parser',
    name: 'URL Parser',
    description: 'Parse URLs into their component parts (protocol, host, path, parameters).',
    category: 'web-tools',
    tag: 'web',
    toolComponent: lazy(() => import('../../components/tools/web-tools/UrlParser')),
    keywords: [
        'url parser',
        'parse url',
        'url component extractor',
        'query string parser',
        'uri parser'
    ],
    about: {
        summary: 'Break down any URL into its constituent components for easy inspection.',
        useCases: ['Debugging complex URLs', 'Extracting query parameters', 'Validating URL structure'],
        features: ['Extracts protocol, host, port, path', 'Parses query parameters into a table', 'Handles complex fragments and origins']
    },
    isNew: true,
    status: 'stable',
    seo: {
        title: 'URL Parser — Split a URL into Protocol, Host, Path & Query',
        description: 'Break any URL into protocol, host, port, path, query parameters and fragment. Inspect and debug links instantly in your browser.',
    },
    guide: {
      "steps": [
        {
          "name": "Paste a URL",
          "text": "Enter a full URL including the scheme, such as https://. The parts update as you type."
        },
        {
          "name": "Read the components",
          "text": "The URL Components table shows protocol, hostname, port, path, query string, fragment, origin and any username or password. Empty parts are hidden."
        },
        {
          "name": "Check the query parameters",
          "text": "Each query parameter is listed as a decoded key and value in its own table, in the order it appears."
        },
        {
          "name": "Copy a value",
          "text": "Use the copy button on any row to copy just that component or parameter value."
        }
      ],
      "faqs": [
        {
          "question": "Why does it say \"Invalid URL format\"?",
          "answer": "The browser's URL parser needs an absolute URL with a scheme. example.com/path fails, while https://example.com/path works."
        },
        {
          "question": "Why is a port shown when my URL has none?",
          "answer": "For https and http the tool shows the default port, 443 or 80, so you can see which port the URL implies."
        },
        {
          "question": "Are query values decoded?",
          "answer": "Yes. Percent-encoded characters and + in the query are decoded in the Query Parameters table, while the Search row shows the raw query string."
        },
        {
          "question": "Is the URL sent anywhere?",
          "answer": "No. It is parsed with the browser's built-in URL API on your device."
        }
      ],
      "example": {
        "title": "Split an API URL into its parts.",
        "input": "https://api.example.com/v1/users?page=2&sort=name#top",
        "output": "Protocol: https:\nHostname: api.example.com\nPort: 443\nPathname: /v1/users\nSearch: ?page=2&sort=name\nHash: #top\nQuery: page = 2, sort = name",
        "inputLabel": "URL",
        "outputLabel": "Components"
      }
    },
}
