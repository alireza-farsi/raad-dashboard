import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * html2canvas 1.4.1 sub-pixel crash guard.
 *
 * When a linear-gradient's painting area computes to a fractional sub-pixel
 * size (e.g. 0.53px — happens with RTL sub-pixel layout), html2canvas does:
 *     canvas.width = 0.53          → browser truncates to 0
 *     if (0.53 > 0) createPattern(canvas)  → InvalidStateError (0×0 canvas)
 * and the whole export dies. We patch the canvas setters for the capture
 * window so any size in (0, 1) is clamped up to 1px. Everything else passes
 * through untouched, and the patch is removed right after the capture.
 */
function installSubpixelCanvasGuard() {
  const proto = HTMLCanvasElement.prototype;
  const descs = ['width', 'height'].map((prop) => ({
    prop,
    desc: Object.getOwnPropertyDescriptor(proto, prop),
  }));
  for (const { prop, desc } of descs) {
    Object.defineProperty(proto, prop, {
      configurable: true,
      get() {
        return desc.get.call(this);
      },
      set(v) {
        // sub-pixel sizes (0 < v < 1) truncate to 0 and break createPattern —
        // clamp them to a 1px minimum instead.
        desc.set.call(this, Number.isFinite(v) && v > 0 && v < 1 ? 1 : v);
      },
    });
  }
  return () => {
    for (const { prop, desc } of descs) {
      Object.defineProperty(proto, prop, desc);
    }
  };
}

// Capture a single DOM element as a canvas with html2canvas.
// The sub-pixel guard is active only for the duration of the capture.
// scale 1.5 ≈ 216 dpi on A4 — crisp enough for print while keeping the
// output file size reasonable (scale 2 + PNG produced a ~130 MB PDF).
const CAPTURE_SCALE = 1.5;

async function captureElement(el, backgroundColor = '#f4f2ec') {
  const restoreGuard = installSubpixelCanvasGuard();
  try {
    return await html2canvas(el, {
      scale: CAPTURE_SCALE,
      backgroundColor,
      useCORS: true,
      logging: false,
    });
  } finally {
    restoreGuard();
  }
}

// Encode a captured canvas as a compressed JPEG data URL. UI screenshots
// (gradients, charts, text) compress dramatically better as JPEG than PNG.
function canvasToImage(canvas) {
  return canvas.toDataURL('image/jpeg', 0.92);
}

// Export the currently visible page (the #export-root element) to a single-page PDF.
export async function exportElementToPdf(elementId, fileName) {
  const el = document.getElementById(elementId);
  if (!el) return;
  const canvas = await captureElement(el);
  const imgData = canvasToImage(canvas);
  const pdf = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  let heightLeft = imgHeight;
  let position = 0;
  pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;
  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
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

    try {
      const canvas = await captureElement(el);
      const imgData = canvasToImage(canvas);
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // For multi-page-per-section content, paginate within the section.
      let heightLeft = imgHeight;
      let position = 0;
      if (!firstPage) pdf.addPage();
      firstPage = false;
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
    } catch (err) {
      // One failed page must not kill the whole report — log it, keep a
      // placeholder page and continue with the remaining pages.
      console.error(`PDF export: failed to capture page "${p.key}"`, err);
      if (!firstPage) pdf.addPage();
      firstPage = false;
      // Note: jsPDF's default font has no Persian glyphs, so the placeholder
      // uses the page key (latin) — not the Persian title.
      pdf.setFontSize(12);
      pdf.text(`[ ${p.key} ]`, pageWidth / 2, pageHeight / 2, { align: 'center' });
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
