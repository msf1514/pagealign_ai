import { SLOTS } from "./slots.js";

export function injectSlots(html, json) {
  let result = html;

  SLOTS.forEach((slot) => {
    if (json[slot]) {
      // Replaces the text content between any opening and closing tag that has data-slot
      const regex = new RegExp(
        `(<[^>]+data-slot="${slot}"[^>]*>)([^<]*?)(<)`,
        "g"
      );
      result = result.replace(regex, `$1${json[slot]}$3`);
    }
  });

  return result;
}