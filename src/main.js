import { convertPdfToJpegs, stitchPdfToJpeg } from './pdf-converter.js';
import { downloadAsZip } from './zip-builder.js';
import { saveAs } from 'file-saver';

// ─── State ────────────────────────────────────────────────────────────────────
let currentFile = null;
let convertedPages = [];
let stitchedResult = null;

// ─── DOM refs ─────────────────────────────────────────────────────────────────
const sectionUpload   = document.getElementById('section-upload');
const sectionOptions  = document.getElementById('section-options');
const sectionProgress = document.getElementById('section-progress');
const sectionResults  = document.getElementById('section-results');

const dropZone        = document.getElementById('drop-zone');
const fileInput       = document.getElementById('file-input');
const btnBrowse       = document.getElementById('btn-browse');

const infoName        = document.getElementById('info-name');
const infoSize        = document.getElementById('info-size');
const btnResetFile    = document.getElementById('btn-reset-file');

const optScale        = document.getElementById('opt-scale');
const optQuality      = document.getElementById('opt-quality');
const scaleDisplay    = document.getElementById('scale-value-display');
const qualityDisplay  = document.getElementById('quality-value-display');
const btnConvert      = document.getElementById('btn-convert');

const progressCounter  = document.getElementById('progress-counter');
const progressFill     = document.getElementById('progress-fill');
const progressPageInfo = document.getElementById('progress-page-info');

const optStitch       = document.getElementById('opt-stitch');
const optGap          = document.getElementById('opt-gap');
const gapDisplay      = document.getElementById('gap-value-display');
const gapRow          = document.getElementById('gap-row');

const resultsCount    = document.getElementById('results-count');
const resultsUnit     = document.getElementById('results-unit');
const btnDownload     = document.getElementById('btn-download');
const btnDownloadText = document.getElementById('btn-download-text');
const btnReset        = document.getElementById('btn-reset');
const thumbnailGrid   = document.getElementById('thumbnail-grid');
const stitchPreview   = document.getElementById('stitch-preview');
const stitchImg       = document.getElementById('stitch-img');

// ─── Section switching ────────────────────────────────────────────────────────
function showSection(section) {
  [sectionUpload, sectionOptions, sectionProgress, sectionResults].forEach((s) => {
    s.classList.remove('active');
  });
  section.classList.add('active');
}

// ─── File utilities ───────────────────────────────────────────────────────────
function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

function acceptFile(file) {
  if (!file || file.type !== 'application/pdf') {
    showError('Only PDF files are supported.');
    return;
  }
  currentFile = file;
  infoName.textContent = file.name;
  infoSize.textContent = formatSize(file.size);
  showSection(sectionOptions);
}

function showError(msg) {
  const label = dropZone.querySelector('.drop-zone__label');
  const original = label.textContent;
  label.textContent = msg;
  dropZone.classList.add('drop-zone--error');
  setTimeout(() => {
    label.textContent = original;
    dropZone.classList.remove('drop-zone--error');
  }, 2500);
}

// ─── Drop zone ────────────────────────────────────────────────────────────────
dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('drop-zone--over');
});

['dragleave', 'dragend'].forEach((evt) => {
  dropZone.addEventListener(evt, () => dropZone.classList.remove('drop-zone--over'));
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('drop-zone--over');
  const file = e.dataTransfer.files[0];
  acceptFile(file);
});

dropZone.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') fileInput.click();
});

btnBrowse.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', () => {
  const file = fileInput.files[0];
  if (file) acceptFile(file);
  fileInput.value = '';
});

btnResetFile.addEventListener('click', resetToUpload);

// ─── Options sliders ─────────────────────────────────────────────────────────
optScale.addEventListener('input', () => {
  scaleDisplay.textContent = optScale.value + 'x';
});

optQuality.addEventListener('input', () => {
  qualityDisplay.textContent = optQuality.value + '%';
});

optGap.addEventListener('input', () => {
  gapDisplay.textContent = optGap.value + ' px';
});

function updateGapRowVisibility() {
  gapRow.style.display = optStitch.checked ? '' : 'none';
}
optStitch.addEventListener('change', updateGapRowVisibility);
updateGapRowVisibility();

// ─── Convert ─────────────────────────────────────────────────────────────────
btnConvert.addEventListener('click', async () => {
  if (!currentFile) return;

  // Clear previous results
  convertedPages.forEach((p) => URL.revokeObjectURL(p.objectURL));
  convertedPages = [];
  if (stitchedResult) { URL.revokeObjectURL(stitchedResult.objectURL); stitchedResult = null; }
  thumbnailGrid.innerHTML = '';
  stitchPreview.hidden = true;
  stitchImg.src = '';

  showSection(sectionProgress);
  progressFill.style.width = '0%';
  progressCounter.textContent = '0 / ?';
  progressPageInfo.textContent = 'Reading file...';

  const arrayBuffer = await currentFile.arrayBuffer();
  const scale   = parseFloat(optScale.value);
  const quality = parseInt(optQuality.value, 10) / 100;
  const stitch  = optStitch.checked;
  const gap     = parseInt(optGap.value, 10);

  if (stitch) {
    // ── Stitch mode: all pages → one tall JPEG ────────────────────────────
    try {
      stitchedResult = await stitchPdfToJpeg(arrayBuffer, {
        scale,
        quality,
        gap,
        onProgress({ current, total }) {
          const pct = Math.round((current / total) * 100);
          progressFill.style.width = pct + '%';
          progressCounter.textContent = current + ' / ' + total;
          progressPageInfo.textContent =
            current < total ? 'Rendering page ' + (current + 1) + '...' : 'Stitching...';
        },
      });
    } catch (err) {
      console.error(err);
      showSection(sectionUpload);
      alert('Conversion failed: ' + err.message);
      return;
    }

    resultsCount.textContent = '1';
    resultsUnit.textContent  = '张图片（共 ' + stitchedResult.totalPages + ' 页）';
    btnDownloadText.textContent = 'Download JPG';

    stitchImg.src = stitchedResult.objectURL;
    stitchPreview.hidden = false;
    thumbnailGrid.style.display = 'none';
  } else {
    // ── Multi-file mode: one JPEG per page → ZIP ──────────────────────────
    try {
      convertedPages = await convertPdfToJpegs(arrayBuffer, {
        scale,
        quality,
        onProgress({ current, total }) {
          const pct = Math.round((current / total) * 100);
          progressFill.style.width = pct + '%';
          progressCounter.textContent = current + ' / ' + total;
          progressPageInfo.textContent =
            current < total ? 'Rendering page ' + (current + 1) + '...' : 'Packing results...';
        },
      });
    } catch (err) {
      console.error(err);
      showSection(sectionUpload);
      alert('Conversion failed: ' + err.message);
      return;
    }

    resultsCount.textContent = convertedPages.length;
    resultsUnit.textContent  = 'pages converted';
    btnDownloadText.textContent = 'Download ZIP';

    thumbnailGrid.style.display = '';
    stitchPreview.hidden = true;
    thumbnailGrid.innerHTML = '';

    for (const { pageNum, objectURL } of convertedPages) {
      const item = document.createElement('div');
      item.className = 'thumb-item';
      const img = document.createElement('img');
      img.src = objectURL;
      img.alt = 'Page ' + pageNum;
      img.loading = 'lazy';
      const label = document.createElement('span');
      label.className = 'thumb-label';
      label.textContent = String(pageNum).padStart(3, '0');
      item.appendChild(img);
      item.appendChild(label);
      thumbnailGrid.appendChild(item);
    }
  }

  showSection(sectionResults);
});

// ─── Download ─────────────────────────────────────────────────────────────────
btnDownload.addEventListener('click', async () => {
  const baseName = (currentFile ? currentFile.name : 'converted').replace(/\.pdf$/i, '');

  if (optStitch.checked && stitchedResult) {
    saveAs(stitchedResult.blob, baseName + '.jpg');
    return;
  }

  if (!convertedPages.length) return;
  btnDownload.disabled = true;
  btnDownloadText.textContent = 'Packing ZIP...';
  await downloadAsZip(convertedPages, baseName);
  btnDownload.disabled = false;
  btnDownloadText.textContent = 'Download ZIP';
});

// ─── Reset ────────────────────────────────────────────────────────────────────
btnReset.addEventListener('click', resetToUpload);

function resetToUpload() {
  convertedPages.forEach((p) => URL.revokeObjectURL(p.objectURL));
  convertedPages = [];
  if (stitchedResult) { URL.revokeObjectURL(stitchedResult.objectURL); stitchedResult = null; }
  currentFile = null;
  thumbnailGrid.innerHTML = '';
  thumbnailGrid.style.display = '';
  stitchPreview.hidden = true;
  stitchImg.src = '';
  showSection(sectionUpload);
}
