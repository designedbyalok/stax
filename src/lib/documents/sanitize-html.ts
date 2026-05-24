/**
 * Simple server-side HTML sanitizer for DOCX preview content.
 * Strips dangerous tags and event handler attributes.
 * Phase 2 will upgrade to DOMPurify for a more robust solution.
 */

const DANGEROUS_TAGS = [
  "script",
  "style",
  "iframe",
  "form",
  "input",
  "embed",
  "object",
];

const SAFE_TAGS = new Set([
  "p",
  "br",
  "strong",
  "em",
  "b",
  "i",
  "u",
  "ul",
  "ol",
  "li",
  "table",
  "thead",
  "tbody",
  "tr",
  "td",
  "th",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "div",
  "span",
  "a",
  "blockquote",
  "sub",
  "sup",
  "img",
]);

/**
 * Strip dangerous HTML tags (script, style, iframe, etc.) including their content.
 */
function stripDangerousTags(html: string): string {
  let result = html;
  for (const tag of DANGEROUS_TAGS) {
    // Remove opening + content + closing
    const regex = new RegExp(
      `<${tag}[^>]*>[\\s\\S]*?<\\/${tag}>`,
      "gi"
    );
    result = result.replace(regex, "");
    // Remove self-closing variants
    result = result.replace(new RegExp(`<${tag}[^>]*/?>`, "gi"), "");
  }
  return result;
}

/**
 * Remove all event handler attributes (on*) from HTML tags.
 */
function stripEventHandlers(html: string): string {
  return html.replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "");
}

/**
 * Remove javascript: and data: URLs from href/src attributes.
 */
function stripDangerousUrls(html: string): string {
  return html.replace(
    /(href|src)\s*=\s*(?:"(?:javascript|data):[^"]*"|'(?:javascript|data):[^']*')/gi,
    '$1=""'
  );
}

/**
 * Add target="_blank" and rel="noopener noreferrer" to all anchor tags.
 */
function securifyLinks(html: string): string {
  return html.replace(/<a\s([^>]*?)>/gi, (_match, attrs: string) => {
    // Remove existing target and rel attributes
    let cleaned = attrs
      .replace(/\s*target\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
      .replace(/\s*rel\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
      .trim();

    if (cleaned) {
      cleaned = ` ${cleaned}`;
    }

    return `<a${cleaned} target="_blank" rel="noopener noreferrer">`;
  });
}

/**
 * Sanitize an HTML string by stripping dangerous tags, event handlers,
 * and dangerous URLs. Adds security attributes to links.
 */
export function sanitizeHtml(html: string): string {
  let result = html;

  // 1. Strip dangerous tags and their content
  result = stripDangerousTags(result);

  // 2. Remove event handler attributes
  result = stripEventHandlers(result);

  // 3. Remove javascript:/data: URLs
  result = stripDangerousUrls(result);

  // 4. Secure all anchor tags
  result = securifyLinks(result);

  return result;
}
