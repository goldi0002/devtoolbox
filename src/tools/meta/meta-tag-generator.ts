import { lazy } from 'react'
import type { ToolMeta } from '../tool-meta'

export const META_TAG_GENERATOR_META: ToolMeta = {
  slug: 'meta-tag-generator',
  name: 'Open Graph & Meta Tag Generator',
  description: 'Generate title, description, Open Graph and Twitter Card meta tags, with search, X and LinkedIn/Slack previews.',
  category: 'web-tools',
  tag: 'web',
  icon: 'Globe',
  keywords: [
    'meta tag generator',
    'open graph generator',
    'og tags',
    'twitter card generator',
    'html meta tags',
    'social preview',
    'seo meta tags',
    'og:image',
  ],
  toolComponent: lazy(() => import('../../components/tools/web-tools/MetaTagGenerator')),
  about: {
    summary: 'The Open Graph & Meta Tag Generator builds the <head> tags that control how a page looks in search results and when shared on social networks. Fill in the title, description, URL and image, and it outputs escaped <title>, description, canonical, Open Graph and Twitter Card tags. Mock previews show the search result, X-style and LinkedIn/Slack-style cards, and warnings flag titles and descriptions that are too long. Everything runs in your browser.',
    useCases: [
      'Adding Open Graph tags to a landing page before launch.',
      'Checking how a blog post title and summary will be cut off in search results.',
      'Producing a Twitter Card with a large image for a product announcement.',
      'Making sure quotes and ampersands in a title do not break the HTML.',
    ],
    features: [
      'Outputs <title>, meta description, canonical link, theme-color, Open Graph and Twitter Card tags.',
      'Escapes &, <, >, quotes and apostrophes in every value.',
      'Omits any tag whose field is empty.',
      'Warns when the title or description is outside the recommended length.',
      'Previews for a search result, an X-style card and a LinkedIn/Slack-style card.',
      'Copy the generated tags with one click.',
    ],
    tip: 'Keep titles under 60 characters and descriptions under 160 so search engines show them in full. Use an absolute https:// URL for the image, since social crawlers cannot resolve relative paths.',
  },
  addedAt: '2026-11-17',
  complexity: 'moderate',
  isNew: true,
  status: 'stable',
  seo: {
    title: 'Open Graph & Meta Tag Generator — Social previews and HTML meta tags',
    description: 'Generate title, description, Open Graph and Twitter Card meta tags with escaping, length warnings and search, X and LinkedIn previews. Private, runs in your browser.',
    extraKeywords: [
      'open graph meta tag generator',
      'twitter card meta tag generator',
      'og:title og:description og:image generator',
      'html head meta tags',
      'social media preview tool',
    ],
  },
  guide: {
    steps: [
      {
        name: 'Enter the page details',
        text: 'Fill in the page title, description, page URL, image URL and site name. Leave any field empty to leave its tag out of the output.',
      },
      {
        name: 'Check the length warnings',
        text: 'The title should stay within 60 characters and the description within 160. A warning appears under the field when a value is outside that range.',
      },
      {
        name: 'Pick a Twitter Card type and theme color',
        text: 'Summary shows a small square image. Summary with large image shows a wide banner. Theme color accepts a 3- or 6-digit hex value such as #1e3a8a; other values are left out.',
      },
      {
        name: 'Review the previews',
        text: 'The search result, X-style card and LinkedIn/Slack-style card use the values you entered. The image preview loads the image URL you typed.',
      },
      {
        name: 'Copy the tags into your page head',
        text: 'Copy the generated tags and paste them inside the <head> element of the page.',
      },
    ],
    faqs: [
      {
        question: 'Which tags does the generator output?',
        answer: 'A <title>, a meta description, a canonical link, a theme-color meta tag, Open Graph tags (og:title, og:description, og:type, og:url, og:image, og:site_name) and Twitter Card tags (twitter:card, twitter:title, twitter:description, twitter:image).',
      },
      {
        question: 'Why are quotes and ampersands escaped?',
        answer: 'Inside an attribute, a raw double quote ends the value early and a raw < can break the markup. The generator writes &amp;, &lt;, &gt;, &quot; and &#39; so the title or description is read exactly as typed.',
      },
      {
        question: 'Are the previews exact copies of each platform?',
        answer: 'No. They are generic mock-ups with the same layout idea. Each platform crops, styles and caches its cards differently, so check the final result with the platform’s own debugger after publishing.',
      },
      {
        question: 'Is anything I type sent to a server?',
        answer: 'No. The tags are built in your browser. The only network request is the one your browser makes to load the image URL in the preview.',
      },
    ],
    example: {
      title: 'Build tags for a blog post with a long title and an apostrophe.',
      input: '{"title":"Ada Lovelace: Notes on the Analytical Engine","description":"The first published algorithm, with Ada Lovelace\'s notes on how the Analytical Engine could compute Bernoulli numbers.","url":"https://example.com/blog/analytical-engine","imageUrl":"https://example.com/images/analytical-engine.png","siteName":"Example Blog","twitterCard":"summary_large_image","themeColor":"#1e3a8a","canonical":"https://example.com/blog/analytical-engine"}',
      output: '<title>Ada Lovelace: Notes on the Analytical Engine</title>\n<meta name="description" content="The first published algorithm, with Ada Lovelace&#39;s notes on how the Analytical Engine could compute Bernoulli numbers.">\n<link rel="canonical" href="https://example.com/blog/analytical-engine">\n<meta name="theme-color" content="#1e3a8a">\n<meta property="og:title" content="Ada Lovelace: Notes on the Analytical Engine">\n<meta property="og:description" content="The first published algorithm, with Ada Lovelace&#39;s notes on how the Analytical Engine could compute Bernoulli numbers.">\n<meta property="og:type" content="website">\n<meta property="og:url" content="https://example.com/blog/analytical-engine">\n<meta property="og:image" content="https://example.com/images/analytical-engine.png">\n<meta property="og:site_name" content="Example Blog">\n<meta name="twitter:card" content="summary_large_image">\n<meta name="twitter:title" content="Ada Lovelace: Notes on the Analytical Engine">\n<meta name="twitter:description" content="The first published algorithm, with Ada Lovelace&#39;s notes on how the Analytical Engine could compute Bernoulli numbers.">\n<meta name="twitter:image" content="https://example.com/images/analytical-engine.png">',
      inputLabel: 'Page details (JSON)',
      outputLabel: 'Generated tags',
    },
  },
}
