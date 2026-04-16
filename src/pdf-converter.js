import * as pdfjs from 'pdfjs-dist';

// Point to the bundled worker via Vite's ?url import
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url';
pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

/**
 * Convert every page of a PDF ArrayBuffer into JPEG Blobs.
 *
 * @param {ArrayBuffer} arrayBuffer - Raw PDF bytes
 * @param {object}      opts
 * @param {number}      opts.scale      - Render scale (1 = 72 dpi, 2 = 144 dpi). Default 2.
 * @param {number}      opts.quality    - JPEG quality 0–1. Default 0.92.
 * @param {Function}    opts.onProgress - Called with { current, total } after each page.
 * @returns {Promise<Array<{ pageNum: number, blob: Blob, objectURL: string }>>}
 */
export async function convertPdfToJpegs(
  arrayBuffer,
  { scale = 2, quality = 0.92, onProgress } = {}
) {
  const loadingTask = pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) });
  const pdf = await loadingTask.promise;
  const totalPages = pdf.numPages;
  const results = [];

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(viewport.width);
    canvas.height = Math.round(viewport.height);

    const ctx = canvas.getContext('2d');
    await page.render({ canvasContext: ctx, viewport }).promise;

    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error(`Canvas toBlob failed on page ${pageNum}`))),
        'image/jpeg',
        quality
      );
    });

    const objectURL = URL.createObjectURL(blob);

    // Release page resources immediately to keep memory low
    page.cleanup();
    // Detach canvas so the browser can GC it
    canvas.width = 0;
    canvas.height = 0;

    results.push({ pageNum, blob, objectURL });
    onProgress?.({ current: pageNum, total: totalPages });
  }

  await pdf.destroy();
  return results;
}

/**
 * Render all pages and stitch them vertically into a single JPEG Blob.
 *
 * @param {ArrayBuffer} arrayBuffer
 * @param {object}      opts
 * @param {number}      opts.scale      - Render scale. Default 2.
 * @param {number}      opts.quality    - JPEG quality 0–1. Default 0.92.
 * @param {number}      opts.gap        - Pixel gap between pages. Default 0.
 * @param {Function}    opts.onProgress - Called with { current, total }.
 * @returns {Promise<{ blob: Blob, objectURL: string, totalPages: number }>}
 */
export async function stitchPdfToJpeg(
  arrayBuffer,
  { scale = 2, quality = 0.92, gap = 0, onProgress } = {}
) {
  const loadingTask = pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) });
  const pdf = await loadingTask.promise;
  const totalPages = pdf.numPages;

  const pageImages = [];
  let totalHeight = 0;
  let maxWidth = 0;

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale });
    const w = Math.round(viewport.width);
    const h = Math.round(viewport.height);

    const offscreen = new OffscreenCanvas(w, h);
    const offCtx = offscreen.getContext('2d');
    await page.render({ canvasContext: offCtx, viewport }).promise;

    const bitmap = await createImageBitmap(offscreen);
    pageImages.push({ bitmap, w, h });
    totalHeight += h;
    if (w > maxWidth) maxWidth = w;

    page.cleanup();
    onProgress?.({ current: pageNum, total: totalPages });
  }

  await pdf.destroy();

  const totalGapHeight = gap * Math.max(0, totalPages - 1);
  const stitchCanvas = document.createElement('canvas');
  stitchCanvas.width  = maxWidth;
  stitchCanvas.height = totalHeight + totalGapHeight;

  const ctx = stitchCanvas.getContext('2d');
  // Fill entire canvas with gap color (warm gray) — gap strips keep this color
  ctx.fillStyle = '#b0aaa0';
  ctx.fillRect(0, 0, stitchCanvas.width, stitchCanvas.height);

  let yOffset = 0;
  for (const { bitmap, w, h } of pageImages) {
    // White background per page row (also handles transparent PDFs)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, yOffset, stitchCanvas.width, h);
    const xOffset = Math.floor((maxWidth - w) / 2);
    ctx.drawImage(bitmap, xOffset, yOffset);
    bitmap.close();
    yOffset += h + gap;
  }

  const blob = await new Promise((resolve, reject) => {
    stitchCanvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Canvas toBlob failed during stitch'))),
      'image/jpeg',
      quality
    );
  });

  stitchCanvas.width = 0;
  stitchCanvas.height = 0;

  return { blob, objectURL: URL.createObjectURL(blob), totalPages };
}
