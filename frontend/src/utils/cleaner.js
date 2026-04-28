
function cleanQuillHtml(html, options = {}) {
  if (!html) return html;

  const {
    collapseWhitespace = true,
    removeEmptyTags = true,
    trim = true
  } = options;

  const textarea = document.createElement("textarea");
  textarea.innerHTML = html;
  let cleaned = textarea.value;

  cleaned = cleaned
    .replace(/\u00A0/g, " ")
    .replace(/\u200B/g, "")
    .replace(/\u200C/g, "")
    .replace(/\u200D/g, "");

  // 3. Parse into DOM so we don"t destroy tags
  const parser = new DOMParser();
  const doc = parser.parseFromString(cleaned, "text/html");

  function walk(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      let text = node.nodeValue;

      if (collapseWhitespace) {
        text = text.replace(/\s+/g, " ");
      }

      if (trim) {
        text = text.trim();
      }

      node.nodeValue = text;
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      [...node.childNodes].forEach(walk);

      if (
        removeEmptyTags &&
        node.childNodes.length === 0 &&
        !["BR", "IMG", "HR"].includes(node.tagName)
      ) {
        node.remove();
      }
    }
  }

  walk(doc.body);

  let result = doc.body.innerHTML;

  result = result.replace(/>\s+</g, "><");

  return result.trim();
}