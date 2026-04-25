import { saveAs } from 'file-saver';

import { convertPdfToJpegs, stitchPdfToJpeg } from './pdf-converter.js';
import {
  DEFAULT_LOCALE,
  applyTranslations,
  getHtmlLang,
  getIntlLocale,
  getLocaleLabel,
  setLocale,
  supportedLocales,
  t,
} from './i18n.js';
import {
  DEFAULT_THEME_MODE,
  applyThemeMode,
  createSystemThemeListener,
  loadPreferences,
  saveLocalePreference,
  saveThemeModePreference,
  themeModes,
} from './preferences.js';
import { downloadAsZip } from './zip-builder.js';

let activeLocale = DEFAULT_LOCALE;
let currentThemeMode = DEFAULT_THEME_MODE;
let currentFile = null;
let convertedPages = [];
let stitchedResult = null;
let detachSystemThemeListener = null;
let errorResetTimer = null;

const uiState = {
  progressMode: 'idle',
  progressCurrent: 0,
  progressTotal: 0,
  progressPageDisplay: 0,
  resultMode: 'none',
  zipPacking: false,
};

const sectionUpload = document.getElementById('section-upload');
const sectionOptions = document.getElementById('section-options');
const sectionProgress = document.getElementById('section-progress');
const sectionResults = document.getElementById('section-results');

const dropZone = document.getElementById('drop-zone');
const dropZoneLabel = document.getElementById('drop-zone-label');
const fileInput = document.getElementById('file-input');
const btnBrowse = document.getElementById('btn-browse');
const statusLive = document.getElementById('status-live');

const infoName = document.getElementById('info-name');
const infoSize = document.getElementById('info-size');
const btnResetFile = document.getElementById('btn-reset-file');

const optScale = document.getElementById('opt-scale');
const optQuality = document.getElementById('opt-quality');
const scaleDisplay = document.getElementById('scale-value-display');
const qualityDisplay = document.getElementById('quality-value-display');
const btnConvert = document.getElementById('btn-convert');

const progressCounter = document.getElementById('progress-counter');
const progressFill = document.getElementById('progress-fill');
const progressPageInfo = document.getElementById('progress-page-info');

const optStitch = document.getElementById('opt-stitch');
const optGap = document.getElementById('opt-gap');
const gapDisplay = document.getElementById('gap-value-display');
const gapRow = document.getElementById('gap-row');

const resultsCount = document.getElementById('results-count');
const resultsUnit = document.getElementById('results-unit');
const btnDownload = document.getElementById('btn-download');
const btnDownloadText = document.getElementById('btn-download-text');
const btnReset = document.getElementById('btn-reset');
const thumbnailGrid = document.getElementById('thumbnail-grid');
const stitchPreview = document.getElementById('stitch-preview');
const stitchImg = document.getElementById('stitch-img');

const themeModeSelect = document.getElementById('theme-mode-select');
const localeSelect = document.getElementById('locale-select');

function showSection(section) {
  [sectionUpload, sectionOptions, sectionProgress, sectionResults].forEach((candidate) => {
    candidate.classList.remove('active');
  });

  section.classList.add('active');
}

function formatNumber(value, options = {}) {
  return new Intl.NumberFormat(getIntlLocale(activeLocale), options).format(value);
}

function formatSize(bytes) {
  if (bytes < 1024) {
    return t('format.bytes', { value: formatNumber(bytes) });
  }

  if (bytes < 1024 * 1024) {
    return t('format.kilobytes', {
      value: formatNumber(bytes / 1024, { maximumFractionDigits: 1 }),
    });
  }

  return t('format.megabytes', {
    value: formatNumber(bytes / (1024 * 1024), { maximumFractionDigits: 2 }),
  });
}

function renderScaleValue() {
  const value = Number.parseFloat(optScale.value);
  scaleDisplay.textContent = t('format.scale', {
    value: formatNumber(value, { maximumFractionDigits: Number.isInteger(value) ? 0 : 1 }),
  });
}

function renderQualityValue() {
  qualityDisplay.textContent = t('format.quality', {
    value: formatNumber(Number.parseInt(optQuality.value, 10)),
  });
}

function renderGapValue() {
  gapDisplay.textContent = t('format.gap', {
    value: formatNumber(Number.parseInt(optGap.value, 10)),
  });
}

function updateGapRowVisibility() {
  gapRow.style.display = optStitch.checked ? '' : 'none';
}

function renderProgressState() {
  if (uiState.progressTotal > 0) {
    progressCounter.textContent = t('format.counter', {
      current: formatNumber(uiState.progressCurrent),
      total: formatNumber(uiState.progressTotal),
    });
  } else {
    progressCounter.textContent = t('format.counterUnknown');
  }

  switch (uiState.progressMode) {
    case 'reading':
      progressPageInfo.textContent = t('progress.readingFile');
      break;
    case 'rendering':
      progressPageInfo.textContent = t('progress.renderingPage', {
        page: formatNumber(uiState.progressPageDisplay || 1),
      });
      break;
    case 'stitching':
      progressPageInfo.textContent = t('progress.stitching');
      break;
    case 'packing':
      progressPageInfo.textContent = t('progress.packingResults');
      break;
    default:
      progressPageInfo.textContent = t('progress.idle');
      break;
  }
}

function renderResultsState() {
  if (uiState.resultMode === 'stitch' && stitchedResult) {
    resultsCount.textContent = formatNumber(1);
    resultsUnit.textContent = t('results.stitchedSummary', {
      pages: formatNumber(stitchedResult.totalPages),
    });
    return;
  }

  if (uiState.resultMode === 'multi' && convertedPages.length) {
    resultsCount.textContent = formatNumber(convertedPages.length);
    resultsUnit.textContent = t('results.multiSummary');
    return;
  }

  resultsCount.textContent = formatNumber(0);
  resultsUnit.textContent = t('results.multiSummary');
}

function renderDownloadButton() {
  if (uiState.zipPacking) {
    btnDownloadText.textContent = t('results.packingZip');
    return;
  }

  btnDownloadText.textContent = optStitch.checked && stitchedResult
    ? t('results.downloadJpg')
    : t('results.downloadZip');
}

function renderThumbnailAltText() {
  const images = thumbnailGrid.querySelectorAll('img[data-page-num]');

  images.forEach((image) => {
    const pageNumber = image.dataset.pageNum || '1';
    image.alt = t('results.thumbAlt', {
      page: formatNumber(Number.parseInt(pageNumber, 10)),
    });
  });
}

function populateThemeModeOptions() {
  themeModeSelect.innerHTML = '';

  themeModes.forEach((mode) => {
    const option = document.createElement('option');
    option.value = mode;
    option.textContent = t(`toolbar.themeModes.${mode}`);
    themeModeSelect.appendChild(option);
  });

  themeModeSelect.value = currentThemeMode;
}

function populateLocaleOptions() {
  localeSelect.innerHTML = '';

  supportedLocales.forEach((locale) => {
    const option = document.createElement('option');
    option.value = locale;
    option.textContent = getLocaleLabel(locale);
    localeSelect.appendChild(option);
  });

  localeSelect.value = activeLocale;
}

function applyCurrentTheme() {
  applyThemeMode(currentThemeMode);

  if (detachSystemThemeListener) {
    detachSystemThemeListener();
    detachSystemThemeListener = null;
  }

  if (currentThemeMode === 'system') {
    detachSystemThemeListener = createSystemThemeListener(() => {
      applyThemeMode('system');
    });
  }
}

function refreshLocalizedUi() {
  document.documentElement.lang = getHtmlLang(activeLocale);
  document.title = t('document.title');
  applyTranslations(document);
  populateThemeModeOptions();
  populateLocaleOptions();
  renderScaleValue();
  renderQualityValue();
  renderGapValue();
  renderProgressState();
  renderResultsState();
  renderDownloadButton();
  renderThumbnailAltText();

  if (currentFile) {
    infoSize.textContent = formatSize(currentFile.size);
  }
}

function setActiveLocaleState(locale) {
  activeLocale = setLocale(locale);
  refreshLocalizedUi();
}

function showError(message) {
  if (errorResetTimer) {
    window.clearTimeout(errorResetTimer);
  }

  dropZoneLabel.textContent = message;
  statusLive.textContent = message;
  dropZone.classList.add('drop-zone--error');

  errorResetTimer = window.setTimeout(() => {
    dropZoneLabel.textContent = t('upload.dropLabel');
    statusLive.textContent = '';
    dropZone.classList.remove('drop-zone--error');
  }, 2500);
}

function acceptFile(file) {
  if (!file || file.type !== 'application/pdf') {
    showError(t('errors.onlyPdf'));
    return;
  }

  currentFile = file;
  infoName.textContent = file.name;
  infoSize.textContent = formatSize(file.size);
  showSection(sectionOptions);
}

function resetOutputs() {
  convertedPages.forEach((page) => URL.revokeObjectURL(page.objectURL));
  convertedPages = [];

  if (stitchedResult) {
    URL.revokeObjectURL(stitchedResult.objectURL);
    stitchedResult = null;
  }

  thumbnailGrid.innerHTML = '';
  thumbnailGrid.style.display = '';
  stitchPreview.hidden = true;
  stitchImg.src = '';
  uiState.resultMode = 'none';
  uiState.zipPacking = false;
  renderResultsState();
  renderDownloadButton();
}

function resetToUpload() {
  resetOutputs();
  currentFile = null;
  showSection(sectionUpload);
}

dropZone.addEventListener('dragover', (event) => {
  event.preventDefault();
  dropZone.classList.add('drop-zone--over');
});

['dragleave', 'dragend'].forEach((eventName) => {
  dropZone.addEventListener(eventName, () => {
    dropZone.classList.remove('drop-zone--over');
  });
});

dropZone.addEventListener('drop', (event) => {
  event.preventDefault();
  dropZone.classList.remove('drop-zone--over');
  acceptFile(event.dataTransfer.files[0]);
});

dropZone.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    fileInput.click();
  }
});

btnBrowse.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', () => {
  const file = fileInput.files[0];

  if (file) {
    acceptFile(file);
  }

  fileInput.value = '';
});

btnResetFile.addEventListener('click', resetToUpload);
btnReset.addEventListener('click', resetToUpload);

optScale.addEventListener('input', renderScaleValue);
optQuality.addEventListener('input', renderQualityValue);
optGap.addEventListener('input', renderGapValue);

optStitch.addEventListener('change', () => {
  updateGapRowVisibility();
  renderDownloadButton();
});

themeModeSelect.addEventListener('change', () => {
  currentThemeMode = themeModeSelect.value || DEFAULT_THEME_MODE;
  saveThemeModePreference(currentThemeMode);
  applyCurrentTheme();
});

localeSelect.addEventListener('change', () => {
  const nextLocale = localeSelect.value || DEFAULT_LOCALE;
  saveLocalePreference(nextLocale);
  setActiveLocaleState(nextLocale);
});

btnConvert.addEventListener('click', async () => {
  if (!currentFile) {
    return;
  }

  resetOutputs();

  showSection(sectionProgress);
  progressFill.style.width = '0%';
  uiState.progressMode = 'reading';
  uiState.progressCurrent = 0;
  uiState.progressTotal = 0;
  uiState.progressPageDisplay = 0;
  renderProgressState();

  const arrayBuffer = await currentFile.arrayBuffer();
  const scale = Number.parseFloat(optScale.value);
  const quality = Number.parseInt(optQuality.value, 10) / 100;
  const stitch = optStitch.checked;
  const gap = Number.parseInt(optGap.value, 10);

  if (stitch) {
    try {
      stitchedResult = await stitchPdfToJpeg(arrayBuffer, {
        scale,
        quality,
        gap,
        onProgress({ current, total }) {
          const progressPercentage = Math.round((current / total) * 100);
          progressFill.style.width = `${progressPercentage}%`;
          uiState.progressCurrent = current;
          uiState.progressTotal = total;
          uiState.progressPageDisplay = current < total ? current + 1 : total;
          uiState.progressMode = current < total ? 'rendering' : 'stitching';
          renderProgressState();
        },
      });
    } catch (error) {
      console.error(error);
      showSection(sectionUpload);
      window.alert(t('errors.conversionFailed', { message: error.message }));
      return;
    }

    uiState.resultMode = 'stitch';
    stitchImg.src = stitchedResult.objectURL;
    stitchPreview.hidden = false;
    thumbnailGrid.style.display = 'none';
  } else {
    try {
      convertedPages = await convertPdfToJpegs(arrayBuffer, {
        scale,
        quality,
        onProgress({ current, total }) {
          const progressPercentage = Math.round((current / total) * 100);
          progressFill.style.width = `${progressPercentage}%`;
          uiState.progressCurrent = current;
          uiState.progressTotal = total;
          uiState.progressPageDisplay = current < total ? current + 1 : total;
          uiState.progressMode = current < total ? 'rendering' : 'packing';
          renderProgressState();
        },
      });
    } catch (error) {
      console.error(error);
      showSection(sectionUpload);
      window.alert(t('errors.conversionFailed', { message: error.message }));
      return;
    }

    uiState.resultMode = 'multi';
    thumbnailGrid.style.display = '';
    stitchPreview.hidden = true;
    thumbnailGrid.innerHTML = '';

    convertedPages.forEach(({ pageNum, objectURL }) => {
      const item = document.createElement('div');
      item.className = 'thumb-item';

      const image = document.createElement('img');
      image.src = objectURL;
      image.dataset.pageNum = String(pageNum);
      image.loading = 'lazy';
      image.alt = t('results.thumbAlt', { page: formatNumber(pageNum) });

      const label = document.createElement('span');
      label.className = 'thumb-label';
      label.textContent = String(pageNum).padStart(3, '0');

      item.appendChild(image);
      item.appendChild(label);
      thumbnailGrid.appendChild(item);
    });
  }

  uiState.progressMode = 'idle';
  renderResultsState();
  renderDownloadButton();
  showSection(sectionResults);
});

btnDownload.addEventListener('click', async () => {
  const baseName = (currentFile ? currentFile.name : 'converted').replace(/\.pdf$/i, '');

  if (optStitch.checked && stitchedResult) {
    saveAs(stitchedResult.blob, `${baseName}.jpg`);
    return;
  }

  if (!convertedPages.length) {
    return;
  }

  btnDownload.disabled = true;
  uiState.zipPacking = true;
  renderDownloadButton();

  await downloadAsZip(convertedPages, baseName);

  btnDownload.disabled = false;
  uiState.zipPacking = false;
  renderDownloadButton();
});

function init() {
  const preferences = loadPreferences(DEFAULT_LOCALE);
  currentThemeMode = preferences.themeMode;
  activeLocale = setLocale(preferences.locale);

  applyCurrentTheme();
  updateGapRowVisibility();
  renderScaleValue();
  renderQualityValue();
  renderGapValue();
  renderProgressState();
  setActiveLocaleState(activeLocale);
}

init();