import { lazy } from "react";
import type { ToolMeta } from "../tool-meta";

export const XML_FORMATTER_META: ToolMeta = {
    slug: 'xml-formatter',
    name: 'XML Formatter',
    description: 'Format, beautify or minify XML strings natively in your browser.',
    category: 'web-tools',
    tag: 'web',
    toolComponent: lazy(() => import('../../components/tools/web-tools/XmlFormatter')),
    keywords: [
        'xml formatter',
        'beautify xml',
        'minify xml',
        'xml pretty print',
        'format xml online'
    ],
    about: {
        summary: 'Format your messy XML files into highly readable, indented structures or minify them into a single line.',
        useCases: ['Formatting API responses', 'Cleaning up SOAP envelopes', 'Minifying XML before transmission'],
        features: ['Adjustable indentation sizes', 'Minification mode', 'Syntax error catching']
    },
    guide: {
      "steps": [
        {
          "name": "Paste XML",
          "text": "Paste XML into XML Input. If the box is empty, the built-in sample is used."
        },
        {
          "name": "Choose an indent",
          "text": "Pick 2 or 4 spaces for the indent."
        },
        {
          "name": "Format or minify",
          "text": "Click Format to indent the XML, or Minify to put it on one line."
        },
        {
          "name": "Copy the output",
          "text": "Copy the result from the formatted.xml or minified.xml panel."
        }
      ],
      "faqs": [
        {
          "question": "What happens with malformed XML?",
          "answer": "It is reported, not repaired. A mismatched, unclosed or stray closing tag, an unquoted attribute or a duplicate attribute shows an error with its line and column, and no formatted output is produced. Fix that spot and click Format again."
        },
        {
          "question": "Does minify keep the text?",
          "answer": "Yes. Text and attribute values are kept, and the whitespace between elements is removed."
        },
        {
          "question": "Does it validate against a schema?",
          "answer": "No. The tool does not check the XML against a schema or DTD."
        },
        {
          "question": "Is my XML sent to a server?",
          "answer": "No. Formatting runs in your browser."
        }
      ],
      "example": {
        "title": "Indent a small XML document with two spaces.",
        "input": "<root><item id=\"1\"><name>Apple</name></item></root>",
        "output": "<root>\n  <item id=\"1\">\n    <name>Apple</name>\n  </item>\n</root>",
        "inputLabel": "XML Input",
        "outputLabel": "formatted.xml"
      }
    },
    isNew: true,
    status: 'stable',
    seo: {
        title: 'XML Formatter & Minifier — Beautify and Validate XML Online',
        description: 'Format messy XML into readable, indented markup or minify it to one line, with syntax error detection. Runs entirely in your browser.',
    },
}
