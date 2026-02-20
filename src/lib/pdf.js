import jsPDF from "jspdf";

function wrapText(doc, text, x, y, maxWidth, lineHeight) {
  const lines = doc.splitTextToSize(String(text || ""), maxWidth);
  lines.forEach((line) => {
    doc.text(line, x, y);
    y += lineHeight;
  });
  return y;
}

export function downloadReportPdf({ reportTitle, result, extractedText, checklistState }) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  const margin = 48;
  let y = margin;

  const addPageIfNeeded = (nextY) => {
    if (nextY > pageH - margin) {
      doc.addPage();
      return margin;
    }
    return nextY;
  };

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("DeedSense Report", margin, y);
  y += 18;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(90);
  doc.text(reportTitle || "Scan Report", margin, y);
  doc.text(new Date().toLocaleString(), pageW - margin, y, { align: "right" });
  y += 18;

  doc.setDrawColor(220);
  doc.line(margin, y, pageW - margin, y);
  y += 18;

  // Summary block
  doc.setTextColor(30);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Executive Summary", margin, y);
  y += 16;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  y = wrapText(doc, (result?.summary || "").replaceAll("**", ""), margin, y, pageW - margin * 2, 14);
  y += 10;

  // Score line
  y = addPageIfNeeded(y + 22);
  doc.setFont("helvetica", "bold");
  doc.text(`Risk Score: ${result?.risk_score ?? "—"}/100`, margin, y);
  doc.text(`Label: ${(result?.risk_label_local || result?.risk_label || "—")}`, margin + 200, y);
  doc.text(`Confidence: ${Math.round((result?.confidence || 0) * 100)}%`, margin + 360, y);
  y += 18;

  // Dimensions table
  y = addPageIfNeeded(y + 22);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Category Breakdown", margin, y);
  y += 14;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);

  const dims = result?.dimensions || {};
  const rows = Object.entries(dims).sort((a, b) => b[1] - a[1]);

  rows.forEach(([k, v]) => {
    y = addPageIfNeeded(y + 16);
    doc.text(`${k}`, margin, y);
    doc.text(`${Math.round(v)}`, pageW - margin, y, { align: "right" });
    y += 14;
  });
  y += 10;

  // Top flags
  y = addPageIfNeeded(y + 22);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Top Flags", margin, y);
  y += 14;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  (result?.top_flags || []).slice(0, 10).forEach((f, idx) => {
    y = addPageIfNeeded(y + 16);
    y = wrapText(doc, `${idx + 1}. [${f.dimension}] ${f.note}`, margin, y, pageW - margin * 2, 14);
  });
  y += 10;

  // Recommendations
  y = addPageIfNeeded(y + 22);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Recommendations", margin, y);
  y += 14;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  (result?.recommendations || []).slice(0, 8).forEach((r, idx) => {
    y = addPageIfNeeded(y + 18);
    doc.setFont("helvetica", "bold");
    doc.text(`${idx + 1}. ${r.title} (${r.priority})`, margin, y);
    y += 14;

    doc.setFont("helvetica", "normal");
    y = wrapText(doc, r.details, margin, y, pageW - margin * 2, 14);
    y += 8;
  });

  // Checklist
  y = addPageIfNeeded(y + 22);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Verification Checklist", margin, y);
  y += 14;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  const checklist = (result?.verification_checklist || []).slice(0, 12);
  checklist.forEach((c, idx) => {
    y = addPageIfNeeded(y + 16);
    const checked = checklistState?.[c.item] ? "☑" : "☐";
    y = wrapText(doc, `${checked} ${c.category}: ${c.item} — ${c.why}`, margin, y, pageW - margin * 2, 14);
  });
  y += 10;

  // Extracted text preview (limited)
  y = addPageIfNeeded(y + 22);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Extracted Text (Preview)", margin, y);
  y += 14;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const preview = String(extractedText || "").slice(0, 4000);
  y = wrapText(doc, preview, margin, y, pageW - margin * 2, 12);

  // Disclaimer
  doc.setFontSize(9);
  doc.setTextColor(110);
  doc.text(
    (result?.disclaimer_local || "DeedSense provides language-based risk signals, not legal advice. Verify via official documents and due diligence."),
    margin,
    pageH - margin
  );

  doc.save("DeedSense_Report.pdf");
}
