import * as cheerio from "cheerio";

const TEXT_TAGS = [
  "h1", "h2", "h3", "h4", "h5", "h6",
  "p", "a", "button", "span", "li",
  "blockquote", "figcaption", "label",
  "td", "th", "dt", "dd",
];

const SKIP_ANCESTORS = "script, style, svg, noscript, code, pre, head";

// Inline formatting tags whose presence does NOT make a parent "non-leaf"
const INLINE_FORMAT = new Set([
  "b", "strong", "em", "i", "u", "mark", "small", "sub", "sup", "br", "wbr",
]);

/**
 * Parse arbitrary HTML and extract text-bearing elements.
 * Each element is tagged with a `data-pa-id` attribute for later injection.
 *
 * Returns:
 *   taggedHtml  – the HTML string with `data-pa-id` attributes added
 *   elements    – array of { id, tag, text } for the Gemini prompt
 */
export function analyzePage(html) {
  const $ = cheerio.load(html);
  const elements = [];
  let counter = 0;
  const processed = new Set();

  $(TEXT_TAGS.join(",")).each((_i, el) => {
    const $el = $(el);

    // Skip elements inside non-content ancestors
    if ($el.closest(SKIP_ANCESTORS).length > 0) return;

    const text = $el.text().trim();
    if (!text || text.length < 2 || text.length > 500) return;

    // Avoid duplicate coverage: skip container elements whose text is entirely
    // composed of child text-tag elements (the children will be processed
    // individually). Allow parents that are headings / CTAs or that only wrap
    // inline formatting tags (b, strong, em …).
    const tag = el.tagName.toLowerCase();
    const childTextEls = $el
      .find(TEXT_TAGS.join(","))
      .filter((_j, c) => !processed.has(c));

    if (childTextEls.length > 0) {
      const allInline = $el
        .children()
        .toArray()
        .every((c) => INLINE_FORMAT.has(c.tagName?.toLowerCase()));

      const isImportant = ["h1", "h2", "h3", "h4", "h5", "h6", "a", "button"].includes(tag);
      if (!allInline && !isImportant) return;
    }

    const id = `pa-${counter++}`;
    $el.attr("data-pa-id", id);
    processed.add(el);

    elements.push({
      id,
      tag,
      text: text.substring(0, 200),
    });
  });

  // Cap to stay within Gemini token limits
  const capped = elements.slice(0, 150);

  return {
    taggedHtml: $.html(),
    elements: capped,
  };
}
