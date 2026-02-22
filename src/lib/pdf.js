import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export async function downloadReportPDF({ title = "DeedSense Report", elementId = "report-root" }) {
  const el = document.getElementById(elementId);
  if (!el) throw new Error("Report element not found");

  const canvas = await html2canvas(el, { scale: 2, backgroundColor: "#070A10" });
  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF("p", "pt", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * pageWidth) / canvas.width;

  let y = 0;
  pdf.setProperties({ title });

  if (imgHeight <= pageHeight) {
    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
  } else {
    // paginate
    let remaining = imgHeight;
    let position = 0;
    while (remaining > 0) {
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      remaining -= pageHeight;
      if (remaining > 0) pdf.addPage();
      position -= pageHeight;
    }
  }

  pdf.save(`${title.replace(/\s+/g, "_")}.pdf`);
}
