import sanitizeHtmlLib from "sanitize-html";

/**
 * Sanitize HTML content for safe rendering.
 * Removes dangerous tags, scripts, event handlers, etc.
 * Adds target="_blank" and rel="noopener noreferrer" to links.
 */
export function sanitizeHtml(html: string): string {
  if (!html) return "";

  return sanitizeHtmlLib(html, {
    allowedTags: sanitizeHtmlLib.defaults.allowedTags.concat(["img"]),
    allowedAttributes: {
      ...sanitizeHtmlLib.defaults.allowedAttributes,
      "*": ["style", "class"],
      a: ["href", "name", "target", "rel"],
      img: ["src", "srcset", "alt", "title", "width", "height", "loading"],
    },
    transformTags: {
      a: sanitizeHtmlLib.simpleTransform("a", { target: "_blank", rel: "noopener noreferrer" }),
    },
  });
}
