import * as cheerio from "cheerio";

/**
 * Inject AI-generated text into HTML elements identified by `data-pa-id`.
 *
 * @param {string} taggedHtml – HTML with `data-pa-id` attributes (from analyzePage)
 * @param {Record<string, string>} replacements – { pa-id: newText }
 * @returns {string} final HTML with replacements applied and temp IDs removed
 */
export function injectDynamic(taggedHtml, replacements) {
  const $ = cheerio.load(taggedHtml);

  for (const [paId, newText] of Object.entries(replacements)) {
    if (!newText) continue;

    const $el = $(`[data-pa-id="${paId}"]`);
    if ($el.length === 0) continue;

    // For elements with no child elements, replace text directly.
    // For elements with child elements, also replace text (the AI was shown the
    // full text and chose a replacement that covers the whole element).
    $el.text(newText);
  }

  // Clean up temporary IDs so they don't leak into the output
  $("[data-pa-id]").removeAttr("data-pa-id");

  return $.html();
}
