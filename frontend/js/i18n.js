/* ===================================================================
   Markdown Converter — Internationalization (i18n)
   English (default) · Indonesian (id) · Japanese (ja) · Arabic (ar) · Chinese (zh)
   =================================================================== */

window.I18N = {
  langs: ['en', 'id', 'ja', 'ar', 'zh'],
  labels: { en: 'English', id: 'Bahasa Indonesia', ja: '日本語', ar: 'العربية', zh: '中文' },
  flags: { en: '🇬🇧', id: '🇮🇩', ja: '🇯🇵', ar: '🇸🇦', zh: '🇨🇳' },

  strings: {
    // ---- Advanced Options ----
    'advanced.title': {
      en: 'Advanced Options (OCR & LLM)',
      id: 'Opsi Lanjutan (OCR & LLM)',
      ja: '詳細設定 (OCR & LLM)',
      ar: 'خيارات متقدمة (OCR و LLM)',
      zh: '高级选项 (OCR & LLM)'
    },
    'advanced.description': {
      en: 'Provide an LLM API Key to enable <strong>OCR for Images</strong>. This is NOT required for standard documents (PDF, DOCX). Supports OpenAI-compatible APIs (DeepSeek, Kimi, local, etc.). Keys are stored locally.',
      id: 'Masukkan LLM API Key untuk mengaktifkan <strong>OCR pada Gambar</strong>. Ini TIDAK diperlukan untuk dokumen standar (PDF, DOCX). Mendukung API yang kompatibel dengan OpenAI (DeepSeek, Kimi, lokal, dll). Kunci disimpan secara lokal.',
      ja: '<strong>画像OCR</strong>を有効にするには、LLM APIキーを入力してください。標準ドキュメント（PDF、DOCX）には不要です。OpenAI互換API（DeepSeek、Kimi、ローカルなど）をサポート。キーはローカルに保存されます。',
      ar: 'قدم مفتاح API LLM لتمكين <strong>التعرف الضوئي على الحروف (OCR) للصور</strong>. هذا غير مطلوب للمستندات القياسية (PDF، DOCX). يدعم واجهات برمجة التطبيقات المتوافقة مع OpenAI (DeepSeek، Kimi، محلي، إلخ). يتم تخزين المفاتيح محليًا.',
      zh: '提供 LLM API 密钥以启用<strong>图片 OCR</strong>。标准文档（PDF、DOCX）不需要此密钥。支持兼容 OpenAI 的 API（DeepSeek、Kimi、本地等）。密钥仅保存在本地。',
    },
    'advanced.apiKey': {
      en: 'LLM API Key',
      id: 'LLM API Key',
      ja: 'LLM API キー',
      ar: 'مفتاح API لـ LLM',
      zh: 'LLM API 密钥'
    },
    'advanced.baseUrl': {
      en: 'Base URL (Optional)',
      id: 'Base URL (Opsional)',
      ja: 'ベースURL (任意)',
      ar: 'عنوان URL الأساسي (اختياري)',
      zh: '基础 URL (可选)'
    },
    'advanced.modelName': {
      en: 'Model Name',
      id: 'Nama Model',
      ja: 'モデル名',
      ar: 'اسم النموذج',
      zh: '模型名称'
    },

    // ---- Header ----
    'header.title': {
      en: '🚀 Markdown <span class="logo-desc">Converter</span>',
      id: '🚀 Markdown <span class="logo-desc">Converter</span>',
      ja: '🚀 Markdown <span class="logo-desc">Converter</span>',
      ar: '🚀 <span class="logo-desc">محول </span>Markdown',
      zh: '🚀 Markdown <span class="logo-desc">转换器</span>',
    },
    'header.subtitle': {
      en: 'Convert any document to clean Markdown',
      id: 'Konversi dokumen apa pun ke Markdown',
      ja: 'あらゆるドキュメントをMarkdownに変換',
      ar: 'حوّل أي مستند إلى Markdown نظيف',
      zh: '将任何文档转换为干净的 Markdown',
    },
    'hero.title': {
      en: 'Transform Documents to Markdown. <span class="gradient-text">Instantly.</span>',
      id: 'Ubah Dokumen ke Markdown. <span class="gradient-text">Seketika.</span>',
      ja: 'ドキュメントをMarkdownに。 <span class="gradient-text">一瞬で。</span>',
      ar: 'حول مستنداتك إلى ماركداون. <span class="gradient-text">في ثوانٍ.</span>',
      zh: '瞬间将文档转换为 Markdown。 <span class="gradient-text">即刻体验。</span>',
    },
    'hero.subtitle': {
      en: 'A free, fast, and privacy-first online converter. Upload PDF, DOCX, PPTX, XLSX, EPUB, or images and download clean Markdown files in seconds.',
      id: 'Konverter online gratis, cepat, dan mengutamakan privasi. Unggah PDF, DOCX, PPTX, XLSX, EPUB, atau gambar dan unduh file Markdown bersih dalam hitungan detik.',
      ja: '無料・高速・プライバシー優先のオンラインコンバーター。PDF、DOCX、PPTX、XLSX、EPUB、または画像をアップロードして、数秒でクリーンなMarkdownファイルをダウンロード。',
      ar: 'محول مجاني، سريع، ويحمي خصوصيتك. ارفع ملفات PDF أو DOCX أو PPTX أو XLSX أو EPUB أو الصور وحمل ملفات Markdown نظيفة في ثوانٍ.',
      zh: '一款免费、快速且隐私优先的在线转换器。上传 PDF、DOCX、PPTX、XLSX、EPUB 或图片，并在几秒钟内下载干净的 Markdown 文件。',
    },

    // ---- Input Tabs ----
    'tab.file': {
      en: '📁 File',
      id: '📁 File',
      ja: '📁 ファイル',
      ar: '📁 ملف',
      zh: '📁 文件',
    },
    'tab.url': {
      en: '🔗 URL',
      id: '🔗 URL',
      ja: '🔗 URL',
      ar: '🔗 رابط',
      zh: '🔗 链接',
    },

    // ---- Drop Zone ----
    'dropzone.text': {
      en: 'Drop files here or <strong>click to browse</strong>',
      id: 'Seret file di sini atau <strong>klik untuk menelusuri</strong>',
      ja: 'ファイルをドロップ または <strong>クリックして参照</strong>',
      ar: 'أسقط الملفات هنا أو <strong>انقر للتصفح</strong>',
      zh: '将文件拖到此处或<strong>点击浏览</strong>',
    },
    'dropzone.hint': {
      en: 'Supported: PDF, DOCX, PPTX, XLSX, HTML, CSV, EPUB, images, audio, ZIP &amp; more<br>Max: 50MB per file · 10 files per batch',
      id: 'Didukung: PDF, DOCX, PPTX, XLSX, HTML, CSV, EPUB, gambar, audio, ZIP &amp; lainnya<br>Maks: 50MB per file · 10 file per batch',
      ja: '対応形式: PDF、DOCX、PPTX、XLSX、HTML、CSV、EPUB、画像、音声、ZIP 他<br>上限: 1ファイル50MB · 10ファイル/バッチ',
      ar: 'المدعومة: PDF، DOCX، PPTX، XLSX، HTML، CSV، EPUB، صور، صوت، ZIP والمزيد<br>الحد: 50MB لكل ملف · 10 ملفات لكل دفعة',
      zh: '支持格式: PDF、DOCX、PPTX、XLSX、HTML、CSV、EPUB、图片、音频、ZIP 等<br>限制: 每个文件 50MB · 每批 10 个文件',
    },

    // ---- File List ----
    'file.status.pending': {
      en: 'Pending',
      id: 'Menunggu',
      ja: '待機中',
      ar: 'قيد الانتظار',
      zh: '等待中',
    },
    'file.status.converting': {
      en: '⏳',
      id: '⏳',
      ja: '⏳',
      ar: '⏳',
      zh: '⏳',
    },
    'file.status.done': {
      en: '✅ Done',
      id: '✅ Selesai',
      ja: '✅ 完了',
      ar: '✅ تم',
      zh: '✅ 完成',
    },
    'file.status.error': {
      en: '❌ Error',
      id: '❌ Gagal',
      ja: '❌ エラー',
      ar: '❌ خطأ',
      zh: '❌ 错误',
    },
    'file.count': {
      en: '{count} / {max} files',
      id: '{count} / {max} file',
      ja: '{count} / {max} ファイル',
      ar: '{count} / {max} ملف',
      zh: '{count} / {max} 个文件',
    },

    // ---- Buttons ----
    'btn.convert': {
      en: 'Convert',
      id: 'Konversi',
      ja: '変換',
      ar: 'تحويل',
      zh: '转换',
    },
    'btn.convertAll': {
      en: '🔄 Convert All',
      id: '🔄 Konversi Semua',
      ja: '🔄 すべて変換',
      ar: '🔄 تحويل الكل',
      zh: '🔄 全部转换',
    },
    'btn.converting': {
      en: '⏳ Converting…',
      id: '⏳ Mengonversi…',
      ja: '⏳ 変換中…',
      ar: '⏳ جارٍ التحويل…',
      zh: '⏳ 正在转换…',
    },

    // ---- Toolbar ----
    'toolbar.copy': {
      en: '📋 Copy',
      id: '📋 Salin',
      ja: '📋 コピー',
      ar: '📋 نسخ',
      zh: '📋 复制',
    },
    'toolbar.download': {
      en: '💾 Download',
      id: '💾 Unduh',
      ja: '💾 ダウンロード',
      ar: '💾 تنزيل',
      zh: '💾 下载',
    },
    'toolbar.downloadAll': {
      en: '📦 Download All',
      id: '📦 Unduh Semua',
      ja: '📦 すべてダウンロード',
      ar: '📦 تنزيل الكل',
      zh: '📦 全部下载',
    },
    'toolbar.clear': {
      en: '🗑️ Clear',
      id: '🗑️ Hapus',
      ja: '🗑️ クリア',
      ar: '🗑️ مسح',
      zh: '🗑️ 清除',
    },
    'toolbar.history': {
      en: '🕐 History',
      id: '🕐 Riwayat',
      ja: '🕐 履歴',
      ar: '🕐 السجل',
      zh: '🕐 历史',
    },
    'toolbar.wordWrap': {
      en: 'Word Wrap',
      id: 'Bungkus Kata',
      ja: '折り返し',
      ar: 'التفاف النص',
      zh: '自动换行',
    },

    // ---- Editor Labels ----
    'editor.markdown': {
      en: 'Markdown',
      id: 'Markdown',
      ja: 'Markdown',
      ar: 'ماركداون',
      zh: 'Markdown',
    },
    'editor.preview': {
      en: 'Preview',
      id: 'Pratinjau',
      ja: 'プレビュー',
      ar: 'معاينة',
      zh: '预览',
    },

    // ---- History Panel ----
    'history.title': {
      en: 'Recent Conversions',
      id: 'Konversi Terbaru',
      ja: '最近の変換',
      ar: 'التحويلات الأخيرة',
      zh: '最近转换',
    },
    'history.clearAll': {
      en: 'Clear All',
      id: 'Hapus Semua',
      ja: 'すべて削除',
      ar: 'مسح الكل',
      zh: '清除全部',
    },
    'history.empty': {
      en: 'No conversions yet',
      id: 'Belum ada konversi',
      ja: '変換履歴がありません',
      ar: 'لا توجد تحويلات بعد',
      zh: '暂无转换记录',
    },

    // ---- URL Panel ----
    'url.placeholder': {
      en: 'https://example.com/article',
      id: 'https://contoh.com/artikel',
      ja: 'https://example.com/article',
      ar: 'https://example.com/article',
      zh: 'https://example.com/article',
    },
    'url.fetching': {
      en: '🔄 Fetching and converting…',
      id: '🔄 Mengambil dan mengonversi…',
      ja: '🔄 取得・変換中…',
      ar: '🔄 جارٍ الجلب والتحويل…',
      zh: '🔄 正在获取和转换…',
    },
    'url.success': {
      en: '✅ Converted successfully!',
      id: '✅ Berhasil dikonversi!',
      ja: '✅ 変換が完了しました！',
      ar: '✅ تم التحويل بنجاح!',
      zh: '✅ 转换成功！',
    },
    'url.timeout': {
      en: '❌ Request timed out',
      id: '❌ Permintaan timeout',
      ja: '❌ リクエストがタイムアウトしました',
      ar: '❌ انتهت مهلة الطلب',
      zh: '❌ 请求超时',
    },

    // ---- Toasts ----
    'toast.copied': {
      en: 'Copied to clipboard!',
      id: 'Disalin ke clipboard!',
      ja: 'クリップボードにコピーしました！',
      ar: 'تم النسخ إلى الحافظة!',
      zh: '已复制到剪贴板！',
    },
    'toast.copyFail': {
      en: 'Failed to copy',
      id: 'Gagal menyalin',
      ja: 'コピーに失敗しました',
      ar: 'فشل النسخ',
      zh: '复制失败',
    },
    'toast.nothingToCopy': {
      en: 'Nothing to copy',
      id: 'Tidak ada yang disalin',
      ja: 'コピーする内容がありません',
      ar: 'لا يوجد شيء للنسخ',
      zh: '没有可复制的内容',
    },
    'toast.nothingToDownload': {
      en: 'Nothing to download',
      id: 'Tidak ada yang diunduh',
      ja: 'ダウンロードする内容がありません',
      ar: 'لا يوجد شيء للتنزيل',
      zh: '没有可下载的内容',
    },
    'toast.downloaded': {
      en: 'Downloaded {name}',
      id: '{name} terunduh',
      ja: '{name} をダウンロードしました',
      ar: 'تم تنزيل {name}',
      zh: '已下载 {name}',
    },
    'toast.downloadedZip': {
      en: 'Downloaded {count} files as ZIP',
      id: '{count} file terunduh sebagai ZIP',
      ja: '{count} ファイルをZIPでダウンロードしました',
      ar: 'تم تنزيل {count} ملفات كـ ZIP',
      zh: '已下载 {count} 个文件为 ZIP',
    },
    'toast.downloadZipFail': {
      en: 'Failed to download ZIP',
      id: 'Gagal mengunduh ZIP',
      ja: 'ZIPのダウンロードに失敗しました',
      ar: 'فشل تنزيل ZIP',
      zh: '下载 ZIP 失败',
    },
    'toast.cleared': {
      en: 'Cleared all results',
      id: 'Semua hasil dihapus',
      ja: 'すべての結果をクリアしました',
      ar: 'تم مسح جميع النتائج',
      zh: '已清除所有结果',
    },
    'toast.historyCleared': {
      en: 'History cleared',
      id: 'Riwayat dihapus',
      ja: '履歴を削除しました',
      ar: 'تم مسح السجل',
      zh: '历史已清除',
    },
    'toast.invalidResponse': {
      en: 'Invalid server response',
      id: 'Respons server tidak valid',
      ja: 'サーバーの応答が無効です',
      ar: 'استجابة الخادم غير صالحة',
      zh: '服务器响应无效',
    },
    'toast.serverError': {
      en: 'Server error ({status})',
      id: 'Error server ({status})',
      ja: 'サーバーエラー ({status})',
      ar: 'خطأ في الخادم ({status})',
      zh: '服务器错误 ({status})',
    },
    'toast.networkError': {
      en: 'Network error — please try again',
      id: 'Error jaringan — silakan coba lagi',
      ja: 'ネットワークエラー — 再試行してください',
      ar: 'خطأ في الشبكة — حاول مرة أخرى',
      zh: '网络错误 — 请重试',
    },
    'toast.enterUrl': {
      en: 'Please enter a URL',
      id: 'Silakan masukkan URL',
      ja: 'URLを入力してください',
      ar: 'الرجاء إدخال رابط',
      zh: '请输入 URL',
    },
    'toast.maxFiles': {
      en: 'Maximum {max} files per batch',
      id: 'Maksimum {max} file per batch',
      ja: '最大 {max} ファイルまで',
      ar: 'الحد الأقصى {max} ملفات لكل دفعة',
      zh: '每批最多 {max} 个文件',
    },
    'toast.fileTooLarge': {
      en: '{name} is too large (max 50MB)',
      id: '{name} terlalu besar (maks 50MB)',
      ja: '{name} が大きすぎます (最大50MB)',
      ar: '{name} كبير جدًا (الحد 50MB)',
      zh: '{name} 太大（最大 50MB）',
    },
    'toast.fileEmpty': {
      en: '{name} is empty',
      id: '{name} kosong',
      ja: '{name} が空です',
      ar: '{name} فارغ',
      zh: '{name} 为空',
    },
    'toast.themeSwitch': {
      en: 'Switched to {theme} theme',
      id: 'Beralih ke tema {theme}',
      ja: '{theme} テーマに切り替えました',
      ar: 'تم التبديل إلى السمة {theme}',
      zh: '已切换到 {theme} 主题',
    },
    'toast.shortcutHint': {
      en: 'Keyboard shortcut detected!',
      id: 'Pintasan keyboard terdeteksi!',
      ja: 'キーボードショートカットを検出しました！',
      ar: 'تم اكتشاف اختصار لوحة المفاتيح!',
      zh: '已检测到键盘快捷键！',
    },

    // ---- Loading / Progress ----
    'loading.title': {
      en: 'Converting…',
      id: 'Mengonversi…',
      ja: '変換中…',
      ar: 'جارٍ التحويل…',
      zh: '正在转换…',
    },
    'loading.uploading': {
      en: 'Uploading files…',
      id: 'Mengunggah file…',
      ja: 'ファイルをアップロード中…',
      ar: 'جارٍ رفع الملفات…',
      zh: '正在上传文件…',
    },
    'loading.processing': {
      en: 'Processing results…',
      id: 'Memproses hasil…',
      ja: '結果を処理中…',
      ar: 'جارٍ معالجة النتائج…',
      zh: '正在处理结果…',
    },
    'loading.noResults': {
      en: 'No valid results to download',
      id: 'Tidak ada hasil valid untuk diunduh',
      ja: '有効な結果がありません',
      ar: 'لا توجد نتائج صالحة للتنزيل',
      zh: '没有有效的结果可下载',
    },
  },

  // ---- Public API ----
  get current() {
    return localStorage.getItem('markitdown-lang') || 'en';
  },

  t(key, vars) {
    const entry = this.strings[key];
    let text = entry ? (entry[this.current] || entry.en || key) : key;
    if (vars) {
      Object.keys(vars).forEach(k => { text = text.replace('{' + k + '}', vars[k]); });
    }
    return text;
  },

  set lang(code) {
    localStorage.setItem('markitdown-lang', code);
    this.apply();
  },

  apply() {
    // Update all [data-i18n] elements
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const varsStr = el.getAttribute('data-i18n-vars');
      let vars = null;
      try { vars = varsStr ? JSON.parse(varsStr) : null; } catch (_) {}

      if (el.tagName === 'INPUT' && el.type === 'text') {
        el.placeholder = this.t(key, vars);
      } else if (el.tagName === 'INPUT' && el.type === 'url') {
        el.placeholder = this.t(key, vars);
      } else {
        el.innerHTML = this.t(key, vars);
      }
    });

    // Update language selector
    const sel = document.getElementById('langSelector');
    if (sel) sel.value = this.current;

    // Trigger custom event for dynamic content
    document.dispatchEvent(new CustomEvent('i18n-updated', { detail: { lang: this.current } }));
  },
};
