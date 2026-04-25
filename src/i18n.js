export const DEFAULT_LOCALE = 'zh';

export const supportedLocales = ['zh', 'en', 'ja', 'de', 'fr'];

const localeMeta = {
  zh: { htmlLang: 'zh-CN', intlLocale: 'zh-CN', label: '中文' },
  en: { htmlLang: 'en', intlLocale: 'en-US', label: 'English' },
  ja: { htmlLang: 'ja-JP', intlLocale: 'ja-JP', label: '日本語' },
  de: { htmlLang: 'de', intlLocale: 'de-DE', label: 'Deutsch' },
  fr: { htmlLang: 'fr', intlLocale: 'fr-FR', label: 'Français' },
};

let currentLocale = DEFAULT_LOCALE;

const messages = {
  zh: {
    document: { title: 'PDF 转 JPG | 本地浏览器转换' },
    toolbar: {
      theme: '外观',
      language: '语言',
      themeModes: { system: '跟随系统', light: '浅色', dark: '深色' },
    },
    header: { meta: '浏览器内处理 · 无需上传 · 结果留在本地' },
    hero: {
      eyebrow: '本地 PDF 工具',
      title: '在浏览器里，把 PDF 变成清晰 JPG。',
      subtitle: '支持逐页导出 ZIP 或拼接长图，全程本地处理，不上传，不排队。',
      pointPrivacyLabel: '隐私',
      pointPrivacyValue: '文件不离开设备',
      pointModesLabel: '输出',
      pointModesValue: '支持 ZIP 与长图',
      pointSpeedLabel: '流程',
      pointSpeedValue: '拖放后立即转换',
    },
    upload: {
      kicker: '步骤 1',
      title: '选择你的 PDF 文件',
      subtitle: '把文件拖到下方区域，或直接从设备中选择。',
      ariaLabel: '上传 PDF 文件',
      dropLabel: '将 PDF 拖放到这里',
      or: '或',
      browse: '选择文件',
      supportHint: '支持拖放，仅处理 PDF 文件。',
    },
    file: { change: '重新选择文件' },
    options: {
      kicker: '步骤 2',
      title: '选择导出方式与图像质量',
      resolution: '清晰度',
      quality: 'JPEG 质量',
      stitchTitle: '拼接为单张图片',
      stitchSubtitle: '将所有页面垂直拼接输出为一个 JPG 文件',
      gap: '页间距',
      ticks: { dpi72: '72 dpi', dpi144: '144 dpi', dpi216: '216 dpi' },
    },
    actions: { convert: '转换为 JPG' },
    progress: {
      processing: '处理中',
      idle: '等待开始转换。',
      readingFile: '正在读取文件...',
      renderingPage: '正在渲染第 {page} 页...',
      stitching: '正在拼接图片...',
      packingResults: '正在整理结果...',
    },
    results: {
      multiSummary: '已生成 JPG 文件',
      stitchedSummary: '共 {pages} 页，已合成为 1 张长图',
      downloadZip: '下载 ZIP',
      downloadJpg: '下载 JPG',
      packingZip: '正在打包 ZIP...',
      convertAnother: '继续转换',
      stitchAlt: '拼接结果预览',
      thumbAlt: '第 {page} 页缩略图',
    },
    footer: { note: '所有处理均在你的浏览器中完成，文件不会离开当前设备。' },
    errors: {
      onlyPdf: '仅支持 PDF 文件。',
      conversionFailed: '转换失败：{message}',
    },
    format: {
      bytes: '{value} B',
      kilobytes: '{value} KB',
      megabytes: '{value} MB',
      scale: '{value}×',
      quality: '{value}%',
      gap: '{value} px',
      counterUnknown: '0 / ?',
      counter: '{current} / {total}',
    },
  },
  en: {
    document: { title: 'PDF to JPG | Local Browser Converter' },
    toolbar: {
      theme: 'Theme',
      language: 'Language',
      themeModes: { system: 'Follow system', light: 'Light', dark: 'Dark' },
    },
    header: { meta: 'Browser-only · No upload · Everything stays local' },
    hero: {
      eyebrow: 'Local PDF Utility',
      title: 'Turn PDFs into sharp JPGs right in your browser.',
      subtitle: 'Export page-by-page ZIPs or stitch every page into one long image, with no uploads and no waiting.',
      pointPrivacyLabel: 'Privacy',
      pointPrivacyValue: 'Files never leave your device',
      pointModesLabel: 'Output',
      pointModesValue: 'ZIP or stitched JPG',
      pointSpeedLabel: 'Flow',
      pointSpeedValue: 'Drag, tweak, convert',
    },
    upload: {
      kicker: 'Step 1',
      title: 'Pick your PDF file',
      subtitle: 'Drop it into the area below or choose it directly from your device.',
      ariaLabel: 'Upload PDF file',
      dropLabel: 'Drop your PDF here',
      or: 'or',
      browse: 'browse files',
      supportHint: 'Drag and drop supported. PDF files only.',
    },
    file: { change: 'change file' },
    options: {
      kicker: 'Step 2',
      title: 'Choose export mode and image quality',
      resolution: 'Resolution',
      quality: 'JPEG quality',
      stitchTitle: 'Merge pages into one image',
      stitchSubtitle: 'Stack every page vertically and export a single JPG file.',
      gap: 'Page gap',
      ticks: { dpi72: '72 dpi', dpi144: '144 dpi', dpi216: '216 dpi' },
    },
    actions: { convert: 'Convert to JPG' },
    progress: {
      processing: 'Processing',
      idle: 'Waiting to start.',
      readingFile: 'Reading file...',
      renderingPage: 'Rendering page {page}...',
      stitching: 'Stitching pages...',
      packingResults: 'Packing results...',
    },
    results: {
      multiSummary: 'JPG files ready',
      stitchedSummary: '1 long JPG generated from {pages} pages',
      downloadZip: 'Download ZIP',
      downloadJpg: 'Download JPG',
      packingZip: 'Packing ZIP...',
      convertAnother: 'Convert another',
      stitchAlt: 'Stitched output preview',
      thumbAlt: 'Thumbnail for page {page}',
    },
    footer: { note: 'Everything is processed locally in your browser. Your files never leave this device.' },
    errors: {
      onlyPdf: 'Only PDF files are supported.',
      conversionFailed: 'Conversion failed: {message}',
    },
    format: {
      bytes: '{value} B',
      kilobytes: '{value} KB',
      megabytes: '{value} MB',
      scale: '{value}×',
      quality: '{value}%',
      gap: '{value} px',
      counterUnknown: '0 / ?',
      counter: '{current} / {total}',
    },
  },
  ja: {
    document: { title: 'PDF から JPG | ローカル変換ツール' },
    toolbar: {
      theme: '表示',
      language: '言語',
      themeModes: { system: 'システムに合わせる', light: 'ライト', dark: 'ダーク' },
    },
    header: { meta: 'ブラウザー内処理 · アップロード不要 · 端末内で完結' },
    hero: {
      eyebrow: 'ローカル PDF ツール',
      title: 'ブラウザー上で、PDF を鮮明な JPG に。',
      subtitle: 'ページごとの ZIP 書き出しにも、縦長 1 枚画像への結合にも対応。すべて端末内で処理します。',
      pointPrivacyLabel: 'プライバシー',
      pointPrivacyValue: 'ファイルは端末外に出ません',
      pointModesLabel: '出力',
      pointModesValue: 'ZIP と長尺 JPG',
      pointSpeedLabel: '操作',
      pointSpeedValue: 'ドラッグしてすぐ変換',
    },
    upload: {
      kicker: 'ステップ 1',
      title: 'PDF ファイルを選択',
      subtitle: '下のエリアにドラッグするか、端末から直接選択してください。',
      ariaLabel: 'PDF ファイルをアップロード',
      dropLabel: 'ここに PDF をドロップ',
      or: 'または',
      browse: 'ファイルを選択',
      supportHint: 'ドラッグ＆ドロップ対応。PDF のみ処理します。',
    },
    file: { change: 'ファイルを変更' },
    options: {
      kicker: 'ステップ 2',
      title: '出力方法と画質を選択',
      resolution: '解像度',
      quality: 'JPEG 品質',
      stitchTitle: '1 枚の画像に結合',
      stitchSubtitle: 'すべてのページを縦に連結して 1 つの JPG として出力します。',
      gap: 'ページ間隔',
      ticks: { dpi72: '72 dpi', dpi144: '144 dpi', dpi216: '216 dpi' },
    },
    actions: { convert: 'JPG に変換' },
    progress: {
      processing: '処理中',
      idle: '変換待ちです。',
      readingFile: 'ファイルを読み込み中...',
      renderingPage: '{page} ページ目をレンダリング中...',
      stitching: '画像を結合中...',
      packingResults: '結果をまとめています...',
    },
    results: {
      multiSummary: 'JPG ファイルを生成しました',
      stitchedSummary: '{pages} ページから 1 枚の長尺 JPG を作成しました',
      downloadZip: 'ZIP をダウンロード',
      downloadJpg: 'JPG をダウンロード',
      packingZip: 'ZIP を作成中...',
      convertAnother: '別のファイルを変換',
      stitchAlt: '結合画像のプレビュー',
      thumbAlt: '{page} ページ目のサムネイル',
    },
    footer: { note: 'すべての処理はブラウザー内で行われます。ファイルが端末外へ送信されることはありません。' },
    errors: {
      onlyPdf: 'PDF ファイルのみ対応しています。',
      conversionFailed: '変換に失敗しました: {message}',
    },
    format: {
      bytes: '{value} B',
      kilobytes: '{value} KB',
      megabytes: '{value} MB',
      scale: '{value}×',
      quality: '{value}%',
      gap: '{value} px',
      counterUnknown: '0 / ?',
      counter: '{current} / {total}',
    },
  },
  de: {
    document: { title: 'PDF zu JPG | Lokaler Browser-Konverter' },
    toolbar: {
      theme: 'Design',
      language: 'Sprache',
      themeModes: { system: 'System folgen', light: 'Hell', dark: 'Dunkel' },
    },
    header: { meta: 'Nur im Browser · Kein Upload · Alles bleibt lokal' },
    hero: {
      eyebrow: 'Lokales PDF-Werkzeug',
      title: 'Wandle PDFs direkt im Browser in klare JPGs um.',
      subtitle: 'Exportiere jede Seite als ZIP oder verbinde alle Seiten zu einem langen Bild. Alles bleibt auf deinem Gerät.',
      pointPrivacyLabel: 'Datenschutz',
      pointPrivacyValue: 'Dateien bleiben auf dem Gerät',
      pointModesLabel: 'Ausgabe',
      pointModesValue: 'ZIP oder langes JPG',
      pointSpeedLabel: 'Ablauf',
      pointSpeedValue: 'Ziehen, anpassen, konvertieren',
    },
    upload: {
      kicker: 'Schritt 1',
      title: 'PDF-Datei auswählen',
      subtitle: 'Ziehe die Datei in den Bereich unten oder wähle sie direkt von deinem Gerät aus.',
      ariaLabel: 'PDF-Datei hochladen',
      dropLabel: 'PDF hier ablegen',
      or: 'oder',
      browse: 'Datei wählen',
      supportHint: 'Drag-and-drop unterstützt. Nur PDF-Dateien.',
    },
    file: { change: 'Datei wechseln' },
    options: {
      kicker: 'Schritt 2',
      title: 'Exportmodus und Bildqualität festlegen',
      resolution: 'Auflösung',
      quality: 'JPEG-Qualität',
      stitchTitle: 'Zu einem Bild zusammenführen',
      stitchSubtitle: 'Alle Seiten vertikal stapeln und als eine JPG-Datei exportieren.',
      gap: 'Seitenabstand',
      ticks: { dpi72: '72 dpi', dpi144: '144 dpi', dpi216: '216 dpi' },
    },
    actions: { convert: 'In JPG umwandeln' },
    progress: {
      processing: 'Verarbeitung',
      idle: 'Wartet auf den Start.',
      readingFile: 'Datei wird gelesen...',
      renderingPage: 'Seite {page} wird gerendert...',
      stitching: 'Seiten werden zusammengeführt...',
      packingResults: 'Ergebnisse werden gepackt...',
    },
    results: {
      multiSummary: 'JPG-Dateien sind bereit',
      stitchedSummary: '1 langes JPG aus {pages} Seiten erstellt',
      downloadZip: 'ZIP herunterladen',
      downloadJpg: 'JPG herunterladen',
      packingZip: 'ZIP wird gepackt...',
      convertAnother: 'Weitere Datei konvertieren',
      stitchAlt: 'Vorschau des zusammengefügten Bildes',
      thumbAlt: 'Vorschaubild für Seite {page}',
    },
    footer: { note: 'Die gesamte Verarbeitung findet lokal in deinem Browser statt. Deine Dateien verlassen dieses Gerät nicht.' },
    errors: {
      onlyPdf: 'Es werden nur PDF-Dateien unterstützt.',
      conversionFailed: 'Konvertierung fehlgeschlagen: {message}',
    },
    format: {
      bytes: '{value} B',
      kilobytes: '{value} KB',
      megabytes: '{value} MB',
      scale: '{value}×',
      quality: '{value}%',
      gap: '{value} px',
      counterUnknown: '0 / ?',
      counter: '{current} / {total}',
    },
  },
  fr: {
    document: { title: 'PDF vers JPG | Convertisseur local' },
    toolbar: {
      theme: 'Apparence',
      language: 'Langue',
      themeModes: { system: 'Suivre le système', light: 'Clair', dark: 'Sombre' },
    },
    header: { meta: 'Dans le navigateur · Aucun envoi · Tout reste local' },
    hero: {
      eyebrow: 'Outil PDF local',
      title: 'Transformez vos PDF en JPG nets, directement dans le navigateur.',
      subtitle: 'Exportez chaque page dans un ZIP ou fusionnez tout en une longue image, sans téléversement et sans attente.',
      pointPrivacyLabel: 'Confidentialité',
      pointPrivacyValue: 'Les fichiers restent sur l’appareil',
      pointModesLabel: 'Sortie',
      pointModesValue: 'ZIP ou JPG fusionné',
      pointSpeedLabel: 'Flux',
      pointSpeedValue: 'Glisser, ajuster, convertir',
    },
    upload: {
      kicker: 'Étape 1',
      title: 'Choisissez votre fichier PDF',
      subtitle: 'Déposez-le dans la zone ci-dessous ou sélectionnez-le directement depuis votre appareil.',
      ariaLabel: 'Téléverser un fichier PDF',
      dropLabel: 'Déposez votre PDF ici',
      or: 'ou',
      browse: 'choisir un fichier',
      supportHint: 'Glisser-déposer pris en charge. Fichiers PDF uniquement.',
    },
    file: { change: 'changer de fichier' },
    options: {
      kicker: 'Étape 2',
      title: 'Choisissez le mode d’export et la qualité',
      resolution: 'Résolution',
      quality: 'Qualité JPEG',
      stitchTitle: 'Fusionner en une seule image',
      stitchSubtitle: 'Empilez toutes les pages verticalement et exportez un seul fichier JPG.',
      gap: 'Espacement',
      ticks: { dpi72: '72 dpi', dpi144: '144 dpi', dpi216: '216 dpi' },
    },
    actions: { convert: 'Convertir en JPG' },
    progress: {
      processing: 'Traitement',
      idle: 'En attente de démarrage.',
      readingFile: 'Lecture du fichier...',
      renderingPage: 'Rendu de la page {page}...',
      stitching: 'Fusion des pages...',
      packingResults: 'Préparation des résultats...',
    },
    results: {
      multiSummary: 'Fichiers JPG prêts',
      stitchedSummary: '1 long JPG généré à partir de {pages} pages',
      downloadZip: 'Télécharger le ZIP',
      downloadJpg: 'Télécharger le JPG',
      packingZip: 'Création du ZIP...',
      convertAnother: 'Convertir un autre fichier',
      stitchAlt: 'Aperçu du résultat fusionné',
      thumbAlt: 'Miniature de la page {page}',
    },
    footer: { note: 'Tout est traité localement dans votre navigateur. Vos fichiers ne quittent jamais cet appareil.' },
    errors: {
      onlyPdf: 'Seuls les fichiers PDF sont pris en charge.',
      conversionFailed: 'Échec de la conversion : {message}',
    },
    format: {
      bytes: '{value} B',
      kilobytes: '{value} KB',
      megabytes: '{value} MB',
      scale: '{value}×',
      quality: '{value}%',
      gap: '{value} px',
      counterUnknown: '0 / ?',
      counter: '{current} / {total}',
    },
  },
};

function resolveMessage(locale, key) {
  return key.split('.').reduce((value, part) => value && value[part], messages[locale]);
}

export function setLocale(locale) {
  currentLocale = supportedLocales.includes(locale) ? locale : DEFAULT_LOCALE;
  return currentLocale;
}

export function getLocaleLabel(locale) {
  return localeMeta[locale]?.label || localeMeta[DEFAULT_LOCALE].label;
}

export function getHtmlLang(locale = currentLocale) {
  return localeMeta[locale]?.htmlLang || localeMeta[DEFAULT_LOCALE].htmlLang;
}

export function getIntlLocale(locale = currentLocale) {
  return localeMeta[locale]?.intlLocale || localeMeta[DEFAULT_LOCALE].intlLocale;
}

export function t(key, params = {}, locale = currentLocale) {
  const template = resolveMessage(locale, key) ?? resolveMessage(DEFAULT_LOCALE, key) ?? key;

  return String(template).replace(/\{(\w+)\}/g, (_, token) => {
    return params[token] ?? `{${token}}`;
  });
}

export function applyTranslations(root = document) {
  const scope = root.body || root;
  const nodes = [scope, ...scope.querySelectorAll('*')];

  nodes.forEach((node) => {
    if (node.hasAttribute && node.hasAttribute('data-i18n')) {
      node.textContent = t(node.getAttribute('data-i18n'));
    }

    if (!node.getAttributeNames) {
      return;
    }

    node.getAttributeNames().forEach((attributeName) => {
      if (attributeName === 'data-i18n' || !attributeName.startsWith('data-i18n-')) {
        return;
      }

      const targetAttribute = attributeName.slice('data-i18n-'.length);
      const messageKey = node.getAttribute(attributeName);

      if (messageKey) {
        node.setAttribute(targetAttribute, t(messageKey));
      }
    });
  });
}