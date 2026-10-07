import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Capture a single DOM element as a PNG data URL with html2canvas.
async function captureElement(el, backgroundColor = '#f4f2ec') {
  const canvas = await html2canvas(el, {
    scale: 2,
    backgroundColor,
    useCORS: true,
    logging: false,
  });
  return canvas;
}

// Export the currently visible page (the #export-root element) to a single-page PDF.
export async function exportElementToPdf(elementId, fileName) {
  const el = document.getElementById(elementId);
  if (!el) return;
  const canvas = await captureElement(el);
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  let heightLeft = imgHeight;
  let position = 0;
  pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;
  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }
  pdf.save(fileName);
}

// Export ALL pages of the dashboard into a single multi-page PDF.
// We use the setter to switch the active page, wait for ECharts to render,
// capture each page to a canvas, then assemble the canvases into one PDF
// where each canvas becomes one (or more) A4 pages.
//
// @param {Array<{key:string, title:string}>} pages - the page list to iterate
// @param {function(string): Promise<void>} setActivePage - state setter that
//   switches the visible page. Should be wrapped in a Promise-returning async
//   function or be a setState that triggers a re-render.
// @param {string} fileName - output file name
// @param {string} elementId - the DOM id of the export root
export async function exportAllPagesToPdf(pages, setActivePage, fileName, elementId = 'export-root') {
  const el = document.getElementById(elementId);
  if (!el) return;

  const pdf = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Save the currently visible page so we can restore it at the end.
  let firstPage = true;

  for (const p of pages) {
    // Switch the active page and wait for the charts to render.
    await setActivePage(p.key);
    // Give React + ECharts a couple of frames to paint.
    await new Promise((r) => setTimeout(r, 350));

    const canvas = await captureElement(el);
    const imgData = canvas.toDataURL('image/png');
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // For multi-page-per-section content, paginate within the section.
    let heightLeft = imgHeight;
    let position = 0;
    if (!firstPage) pdf.addPage();
    firstPage = false;
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
  }

  pdf.save(fileName);
}

// Legacy Excel export (no longer used in the dashboard — kept for backward
// compatibility with any external code that still imports it).
export async function exportToExcel(rows, sheetName, fileName) {
  const XLSX = await import('xlsx');
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, fileName);
}
