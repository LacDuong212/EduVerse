const escapeHtml = (str = "") =>
  str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const formatTs = (seconds) => {
  const t = Math.max(0, Math.floor(seconds));
  const m = Math.floor(t / 60);
  const s = t % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

export const exportNotesToPDF = ({ notes, lectureTitle, courseTitle }) => {
  if (!notes?.length) return;

  const notesHtml = notes
    .map(
      (n) => `
      <div class="note">
        <div class="note-header">
          <span class="timestamp">${formatTs(n.timestamp)}</span>
          ${n.tags?.length ? n.tags.map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join("") : ""}
        </div>
        <p class="content">${escapeHtml(n.content)}</p>
      </div>`
    )
    .join("");

  const exportedOn = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Notes — ${escapeHtml(lectureTitle || "Lecture")}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      color: #1a1d23;
      max-width: 720px;
      margin: 40px auto;
      padding: 0 24px;
      font-size: 14px;
      line-height: 1.6;
    }
    .header { margin-bottom: 24px; }
    .header h1 { font-size: 20px; font-weight: 700; margin-bottom: 4px; }
    .header .subtitle { font-size: 13px; color: #5a6374; }
    hr { border: none; border-top: 1px solid #e4e7ec; margin: 20px 0; }
    .note { margin-bottom: 20px; page-break-inside: avoid; }
    .note-header { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
    .timestamp {
      background: #4361ee; color: #fff;
      border-radius: 4px; padding: 2px 10px;
      font-size: 12px; font-weight: 700;
      font-family: monospace; white-space: nowrap;
    }
    .tag {
      background: #f3f4f6; border: 1px solid #e4e7ec;
      border-radius: 20px; padding: 1px 8px;
      font-size: 11px; color: #374151;
    }
    .content { white-space: pre-wrap; color: #1a1d23; padding-left: 4px; }
    .footer {
      margin-top: 36px; padding-top: 12px;
      border-top: 1px solid #e4e7ec;
      font-size: 11px; color: #9ca3af;
    }
    @media print {
      body { margin: 20px auto; }
      .note { break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${escapeHtml(lectureTitle || "Lecture Notes")}</h1>
    <p class="subtitle">${escapeHtml(courseTitle || "")} · ${notes.length} note${notes.length !== 1 ? "s" : ""}</p>
  </div>
  <hr />
  ${notesHtml}
  <div class="footer">Exported on ${exportedOn}</div>
</body>
</html>`;

  const win = window.open("", "_blank", "width=820,height=680");
  if (!win) {
    alert("Please allow popups to export notes.");
    return;
  }
  win.document.write(html);
  win.document.close();
  win.focus();
  // Brief delay so the browser finishes rendering before print dialog
  setTimeout(() => win.print(), 300);
};
