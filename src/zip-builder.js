import JSZip from 'jszip';
import { saveAs } from 'file-saver';

/**
 * Pack an array of page objects into a ZIP archive and trigger download.
 *
 * @param {Array<{ pageNum: number, blob: Blob }>} pages
 * @param {string} baseName - Base filename for the ZIP (without extension)
 */
export async function downloadAsZip(pages, baseName = 'converted') {
  const zip = new JSZip();

  for (const { pageNum, blob } of pages) {
    const paddedNum = String(pageNum).padStart(3, '0');
    zip.file(`page-${paddedNum}.jpg`, blob);
  }

  const zipBlob = await zip.generateAsync(
    { type: 'blob', compression: 'STORE' },
    (metadata) => {
      // optional: could hook progress here if needed
    }
  );

  saveAs(zipBlob, `${baseName}.zip`);
}
