/**
 * Converts relative URLs in HTML to absolute URLs based on a base URL.
 * Handles href, src, srcset, and @import URLs.
 */
export function convertRelativeUrlsToAbsolute(html, baseUrl) {
  try {
    const baseUri = new URL(baseUrl);
    const baseOrigin = baseUri.origin;

    let result = html;

    // Convert relative href attributes (but preserve protocol-relative and absolute URLs)
    result = result.replace(
      /href="(?!(?:https?:|\/\/|#|mailto:|tel:|javascript:))/g,
      `href="${baseOrigin}/`
    );

    // Convert relative src attributes
    result = result.replace(
      /src="(?!(?:https?:|\/\/|data:|javascript:))/g,
      `src="${baseOrigin}/`
    );

    // Convert relative srcset attributes
    result = result.replace(
      /srcset="(?!(?:https?:|\/\/|data:))/g,
      `srcset="${baseOrigin}/`
    );

    // Convert relative URLs in style attributes
    result = result.replace(
      /url\(["'](?!(?:https?:|\/\/|data:))/g,
      `url("${baseOrigin}/`
    );

    // Convert @import URLs in style tags
    result = result.replace(
      /@import\s+url\(["'](?!(?:https?:|\/\/|data:))/g,
      `@import url("${baseOrigin}/`
    );

    // Handle style tag content for background-image and similar
    result = result.replace(
      /background(?:-image)?:\s*url\(["'](?!(?:https?:|\/\/|data:))/g,
      `background-image: url("${baseOrigin}/`
    );

    return result;
  } catch (err) {
    console.warn("Error converting relative URLs:", err.message);
    return html; // Return original HTML if URL parsing fails
  }
}

/**
 * Extracts the base URL from a full URL (removes path components, keeping only protocol + domain)
 */
export function getBaseUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.origin;
  } catch {
    return url;
  }
}
