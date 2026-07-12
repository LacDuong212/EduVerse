import DOMPurify from "dompurify";

// Làm sạch HTML sinh từ rich-text (Quill) trước khi render qua dangerouslySetInnerHTML.
// Chặn stored XSS: loại bỏ <script>, thuộc tính sự kiện (onerror, onclick...), javascript: URL.
export const sanitizeHtml = (dirty) => DOMPurify.sanitize(String(dirty ?? ""));
