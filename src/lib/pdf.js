export function downloadReportAsPDF({ title = "DeedSense Report", html }) {
  const win = window.open("", "_blank", "noopener,noreferrer");
  if (!win) {
    alert("Popup blocked. Please allow popups to download the PDF.");
    return;
  }

  win.document.open();
  win.document.write(`
    <html>
      <head>
        <title>${escapeHtml(title)}</title>
        <meta charset="utf-8" />
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; color: #0b1220; }
          h1 { font-size: 18px; margin: 0 0 10px; }
          .muted { color: #475569; font-size: 12px; }
          .card { border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; margin: 12px 0; }
          .pill { display:inline-block; padding: 4px 10px; border: 1px solid #e2e8f0; border-radius: 999px; font-size: 12px; margin-right: 8px;}
          pre { white-space: pre-wrap; word-break: break-word; background: #f8fafc; padding: 12px; border-radius: 10px; border: 1px solid #e2e8f0; }
          @media print { button { display:none; } }
        </style>
      </head>
      <body>
        <button onclick="window.print()" style="padding:10px 14px;border-radius:10px;border:1px solid #cbd5e1;background:#0f172a;color:#fff;cursor:pointer;">
          Print / Save as PDF
        </button>
        ${html}
      </body>
    </html>
  `);
  win.document.close();
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (m) => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[m]));
}
