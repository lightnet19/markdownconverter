/* ===================================================================
   Markdown Converter — Frontend Application Logic
   =================================================================== */

(function () {
  'use strict';

  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
  const MAX_FILES = 10;
  const MAX_HISTORY = 20;

  const state = {
    files: [],
    results: [],
    activeResultIdx: 0,
    isConverting: false,
  };

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const dropZone = $('#dropZone');
  const fileInput = $('#fileInput');
  const fileList = $('#fileList');
  const convertBtn = $('#convertBtn');
  const urlInput = $('#urlInput');
  const urlConvertBtn = $('#urlConvertBtn');
  const urlStatus = $('#urlStatus');
  const loadingOverlay = $('#loadingOverlay');
  const loadingText = $('#loadingText');
  const progressContainer = $('#progressContainer');
  const progressFill = $('#progressFill');
  const progressText = $('#progressText');
  const resultsSection = $('#resultsSection');
  const resultTabs = $('#resultTabs');
  const editorTextarea = $('#editorTextarea');
  const editorPreview = $('#editorPreview');
  const copyBtn = $('#copyBtn');
  const downloadBtn = $('#downloadBtn');
  const wordWrapToggle = $('#wordWrapToggle');
  const clearBtn = $('#clearBtn');
  const themeToggle = $('#themeToggle');
  const historyBtn = $('#historyBtn');
  const historyPanel = $('#historyPanel');
  const historyList = $('#historyList');
  const historyClearBtn = $('#historyClearBtn');
  const downloadAllBtn = $('#downloadAllBtn');
  const toastContainer = $('#toastContainer');
  const editorStats = $('#editorStats');

  // ---- Advanced Options / LLM Settings ----
  const advancedOptionsBtn = $('#advancedOptionsBtn');
  const advancedOptionsContent = $('#advancedOptionsContent');
  const llmApiKey = $('#llmApiKey');
  const llmBaseUrl = $('#llmBaseUrl');
  const llmModel = $('#llmModel');

  advancedOptionsBtn.addEventListener('click', function() {
    const isExpanded = advancedOptionsBtn.getAttribute('aria-expanded') === 'true';
    advancedOptionsBtn.setAttribute('aria-expanded', !isExpanded);
    advancedOptionsContent.hidden = isExpanded;
  });

  function initLlmSettings() {
    llmApiKey.value = localStorage.getItem('markitdown-llm-key') || '';
    llmBaseUrl.value = localStorage.getItem('markitdown-llm-base') || '';
    llmModel.value = localStorage.getItem('markitdown-llm-model') || 'gpt-4o';

    const saveSettings = () => {
      localStorage.setItem('markitdown-llm-key', llmApiKey.value.trim());
      localStorage.setItem('markitdown-llm-base', llmBaseUrl.value.trim());
      localStorage.setItem('markitdown-llm-model', llmModel.value.trim() || 'gpt-4o');
    };

    llmApiKey.addEventListener('input', saveSettings);
    llmBaseUrl.addEventListener('input', saveSettings);
    llmModel.addEventListener('input', saveSettings);
  }
  initLlmSettings();

  // ---- OCR Status Check ----
  async function checkOcrStatus() {
    try {
      var resp = await fetch('/api/health');
      var data = await resp.json();
      if (data.ocr && data.ocr.enabled) {
        var badge = $('#ocrBadge');
        badge.hidden = false;
        badge.title = 'OCR enabled: ' + (data.ocr.model || 'unknown model');
      }
    } catch (_) { /* silently ignore */ }
  }
  checkOcrStatus();

  // Sync <html lang> with i18n selection for multilingual SEO
  function syncHtmlLang(langCode) {
    var langMap = { en: 'en', id: 'id', ja: 'ja', ar: 'ar', zh: 'zh-CN' };
    document.documentElement.lang = langMap[langCode] || 'en';
  }

  // ---- i18n: Apply initial translations & listen for language change ----
  var langSelector = $('#langSelector');
  langSelector.value = I18N.current;
  syncHtmlLang(I18N.current);
  langSelector.addEventListener('change', function () {
    I18N.lang = langSelector.value;
    syncHtmlLang(langSelector.value);
  });
  I18N.apply();

  // ---- Theme Toggle (with localStorage) ----
  function initTheme() {
    var saved = localStorage.getItem('markitdown-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
    themeToggle.textContent = saved === 'dark' ? '🌙' : '☀️';
  }
  initTheme();

  themeToggle.addEventListener('click', function () {
    var current = document.documentElement.getAttribute('data-theme');
    var next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('markitdown-theme', next);
    themeToggle.textContent = next === 'dark' ? '🌙' : '☀️';
    showToast(I18N.t('toast.themeSwitch', { theme: next }), 'info');
  });

  // ---- Conversion History (localStorage) ----
  function getHistory() {
    try { return JSON.parse(localStorage.getItem('markitdown-history') || '[]'); }
    catch (_) { return []; }
  }

  function saveToHistory(entry) {
    var history = getHistory();
    entry.timestamp = Date.now();
    history.unshift(entry);
    if (history.length > MAX_HISTORY) history = history.slice(0, MAX_HISTORY);
    localStorage.setItem('markitdown-history', JSON.stringify(history));
  }

  function renderHistory() {
    var history = getHistory();
    if (history.length === 0) {
      historyList.innerHTML = '<div class="history-item" style="cursor:default;color:var(--text-secondary)">' + I18N.t('history.empty') + '</div>';
      return;
    }
    historyList.innerHTML = history.map(function (item, i) {
      var date = new Date(item.timestamp);
      var timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      var icon = item.error ? '❌' : '✅';
      var name = item.filename || 'result ' + (i + 1);
      return '<div class="history-item" data-index="' + i + '">' +
        '<span class="history-item-icon">' + icon + '</span>' +
        '<span class="history-item-name">' + escapeHtml(name) + '</span>' +
        '<span class="history-item-time">' + timeStr + '</span>' +
        '</div>';
    }).join('');

    historyList.querySelectorAll('.history-item').forEach(function (el) {
      el.addEventListener('click', function () {
        var idx = parseInt(el.dataset.index);
        var history = getHistory();
        var entry = history[idx];
        if (!entry) return;
        state.results = [entry];
        state.activeResultIdx = 0;
        renderResults();
        historyPanel.hidden = true;
        if (entry.markdown) {
          editorTextarea.value = entry.markdown;
          renderPreview(entry.markdown);
        }
      });
    });
  }

  historyBtn.addEventListener('click', function () {
    historyPanel.hidden = !historyPanel.hidden;
    if (!historyPanel.hidden) renderHistory();
  });

  historyClearBtn.addEventListener('click', function () {
    localStorage.removeItem('markitdown-history');
    renderHistory();
    showToast(I18N.t('toast.historyCleared'), 'info');
  });

  // ---- Tab switching ----
  $$('.input-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      $$('.input-tab').forEach((t) => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      $$('.input-panel').forEach((p) => p.classList.remove('active'));
      document.getElementById('panel-' + tab.dataset.tab).classList.add('active');
    });
  });

  // ---- Drag & Drop ----
  dropZone.addEventListener('click', () => fileInput.click());

  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
  });
  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-over');
  });
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    if (e.dataTransfer.files.length) handleFiles(Array.from(e.dataTransfer.files));
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files.length) handleFiles(Array.from(fileInput.files));
    fileInput.value = '';
  });

  // ---- Handle files with validation ----
  function handleFiles(fileArray) {
    const errors = [];
    const valid = [];

    if (fileArray.length > MAX_FILES) {
      showToast(I18N.t('toast.maxFiles', { max: MAX_FILES }), 'error');
      return;
    }

    for (const f of fileArray) {
      if (f.size > MAX_FILE_SIZE) {
        errors.push(I18N.t('toast.fileTooLarge', { name: f.name }));
      } else if (f.size === 0) {
        errors.push(I18N.t('toast.fileEmpty', { name: f.name }));
      } else {
        valid.push(f);
      }
    }

    if (errors.length) {
      showToast(errors.join('\n'), 'error');
    }
    if (!valid.length) return;

    state.files = valid;
    state.results = [];
    state.activeResultIdx = 0;
    renderFileList();
    convertBtn.hidden = false;
    resultsSection.classList.remove('visible', 'show');
  }

  function getFileIcon(name) {
    var ext = name.split('.').pop().toLowerCase();
    var icons = {
      pdf: '📕', docx: '📘', doc: '📘', pptx: '📙', ppt: '📙',
      xlsx: '📗', xls: '📗', csv: '📊', html: '🌐', htm: '🌐',
      json: '📋', xml: '📋', md: '📝', txt: '📄', epub: '📖',
      zip: '📦', rar: '📦', gz: '📦',
      jpg: '🖼️', jpeg: '🖼️', png: '🖼️', gif: '🖼️', svg: '🖼️',
      wav: '🎵', mp3: '🎵', ogg: '🎵',
      msg: '✉️', rss: '📡',
    };
    return icons[ext] || '📄';
  }

  function renderFileList() {
    fileList.hidden = false;
    fileList.innerHTML = state.files.map(function (f, i) {
      var size = f.size > 1024 * 1024
        ? (f.size / (1024 * 1024)).toFixed(1) + ' MB'
        : (f.size / 1024).toFixed(0) + ' KB';
      var ext = f.name.split('.').pop().toUpperCase() || '?';
      return (
        '<div class="file-item" data-index="' + i + '">' +
          '<span class="file-icon">' + getFileIcon(f.name) + '</span>' +
          '<span class="file-name">' + escapeHtml(f.name) + '</span>' +
          '<span class="file-size">' + size + '</span>' +
          '<span class="file-ext">' + ext + '</span>' +
          '<span class="file-status pending">' + I18N.t('file.status.pending') + '</span>' +
          '<button class="file-remove" title="Remove file">✕</button>' +
        '</div>'
      );
    }).join('');

    // Associate file objects and attach remove handlers
    fileList.querySelectorAll('.file-item').forEach(function (fileItem, i) {
      fileItem._file = state.files[i];
      var btn = fileItem.querySelector('.file-remove');
      if (btn) {
        btn.addEventListener('click', function (e) {
          e.stopPropagation();
          if (fileItem.classList.contains('removing')) return;
          fileItem.classList.add('removing');
          
          fileItem.addEventListener('animationend', function () {
            var fileRef = fileItem._file;
            var currentIdx = state.files.indexOf(fileRef);
            if (currentIdx !== -1) {
              state.files.splice(currentIdx, 1);
            }
            fileItem.remove();
            
            if (state.files.length === 0) {
              state.results = [];
              state.activeResultIdx = 0;
              fileList.hidden = true;
              convertBtn.hidden = true;
              resultsSection.classList.remove('visible', 'show');
            } else {
              // Update indices of remaining DOM elements
              fileList.querySelectorAll('.file-item').forEach(function (item, idx) {
                item.dataset.index = idx;
              });
            }
          }, { once: true });
        });
      }
    });
  }

  // ---- Convert All with XMLHttpRequest (progress) ----
  convertBtn.addEventListener('click', function () {
    if (state.isConverting) return;
    state.isConverting = true;
    convertBtn.disabled = true;
    convertBtn.textContent = I18N.t('btn.converting');
    loadingOverlay.hidden = false;
    loadingText.textContent = I18N.t('loading.uploading');
    progressContainer.hidden = false;
    progressFill.style.width = '0%';
    progressText.textContent = I18N.t('file.count', { count: 0, max: state.files.length });

    showTopLoader();

    var formData = new FormData();
    state.files.forEach(function (f) { formData.append('files', f); });

    // Update status to "Converting..."
    state.files.forEach(function (_, i) {
      var item = fileList.querySelector('[data-index="' + i + '"]');
      if (item) {
        item.querySelector('.file-status').className = 'file-status converting';
        item.querySelector('.file-status').textContent = I18N.t('file.status.converting');
      }
    });

    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/convert/file');

    var key = llmApiKey.value.trim();
    if (key) {
      xhr.setRequestHeader('X-LLM-API-Key', key);
      var base = llmBaseUrl.value.trim();
      if (base) xhr.setRequestHeader('X-LLM-Base-URL', base);
      var model = llmModel.value.trim();
      if (model) xhr.setRequestHeader('X-LLM-Model', model);
    }

    xhr.upload.onprogress = function (e) {
      if (e.lengthComputable) {
        var pct = Math.round((e.loaded / e.total) * 100);
        progressFill.style.width = pct + '%';
      }
    };

    xhr.onload = function () {
      progressFill.style.width = '100%';
      progressText.textContent = I18N.t('file.count', { count: state.files.length, max: state.files.length });
      loadingText.textContent = I18N.t('loading.processing');

      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          var results = JSON.parse(xhr.responseText);
          state.results = results;
          renderResults();
        } catch (err) {
          showToast(I18N.t('toast.invalidResponse'), 'error');
        }
      } else {
        try {
          var err = JSON.parse(xhr.responseText);
          showToast(err.detail || I18N.t('toast.serverError', { status: xhr.status }), 'error');
        } catch (_) {
          showToast(I18N.t('toast.serverError', { status: xhr.status }), 'error');
        }
      }

      state.isConverting = false;
      convertBtn.disabled = false;
      convertBtn.textContent = I18N.t('btn.convertAll');
      loadingOverlay.hidden = true;
      progressContainer.hidden = true;
      hideTopLoader();
    };

    xhr.onerror = function () {
      showToast(I18N.t('toast.networkError'), 'error');
      state.isConverting = false;
      convertBtn.disabled = false;
      convertBtn.textContent = I18N.t('btn.convertAll');
      loadingOverlay.hidden = true;
      progressContainer.hidden = true;
      hideTopLoader();
    };

    xhr.send(formData);
  });

  // ---- URL Convert with progress indicator ----
  urlConvertBtn.addEventListener('click', async function () {
    var url = urlInput.value.trim();
    if (!url) { showToast(I18N.t('toast.enterUrl'), 'error'); return; }

    urlConvertBtn.disabled = true;
    urlConvertBtn.textContent = I18N.t('btn.converting');
    urlStatus.hidden = false;
    urlStatus.innerHTML = '<div class="url-progress"><span class="spinner-small"></span> ' + I18N.t('url.fetching') + '</div>';

    showTopLoader();

    try {
      var controller = new AbortController();
      var timeoutId = setTimeout(function () { controller.abort(); }, 60000);

      var headers = { 'Content-Type': 'application/json' };
      var key = llmApiKey.value.trim();
      if (key) {
        headers['X-LLM-API-Key'] = key;
        var base = llmBaseUrl.value.trim();
        if (base) headers['X-LLM-Base-URL'] = base;
        var model = llmModel.value.trim();
        if (model) headers['X-LLM-Model'] = model;
      }

      var resp = await fetch('/api/convert/url', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ url: url }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      var result = await resp.json();

      if (!resp.ok || result.error) {
        throw new Error(result.error || result.detail || 'Conversion failed');
      }

      state.results = [result];
      state.activeResultIdx = 0;
      renderResults();
      urlStatus.innerHTML = I18N.t('url.success');
      setTimeout(function () { urlStatus.hidden = true; }, 3000);
    } catch (err) {
      if (err.name === 'AbortError') {
        showToast(I18N.t('url.timeout'), 'error');
        urlStatus.innerHTML = I18N.t('url.timeout');
      } else {
        showToast(err.message, 'error');
        urlStatus.innerHTML = '❌ ' + err.message;
      }
    } finally {
      urlConvertBtn.disabled = false;
      urlConvertBtn.textContent = I18N.t('btn.convert');
      hideTopLoader();
    }
  });

  // ---- Save results to history ----
  function saveResultsToHistory() {
    state.results.forEach(function (r) {
      if (r.filename && r.markdown) {
        saveToHistory({
          filename: r.filename,
          markdown: r.markdown,
          title: r.title || null,
          error: r.error || null,
        });
      }
    });
  }

  // ---- Render results ----
  function renderResults() {
    resultsSection.classList.add('show');
    // Force reflow/layout so transition is recognized by browser
    resultsSection.offsetHeight;
    resultsSection.classList.add('visible');
    renderResultTabs();
    showResult(0);
    updateFileStatuses();
    saveResultsToHistory();
    // Show "Download All" button only when 2+ results
    downloadAllBtn.hidden = state.results.length < 2;
  }

  function renderResultTabs() {
    resultTabs.innerHTML = state.results.map(function (r, i) {
      var ok = !r.error;
      return (
        '<button class="result-tab ' + (i === 0 ? 'active' : '') + '" data-index="' + i + '">' +
          '<span class="tab-check">' + (ok ? '✅' : '❌') + '</span> ' +
          escapeHtml(r.filename || 'result ' + (i + 1)) +
        '</button>'
      );
    }).join('');

    resultTabs.querySelectorAll('.result-tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        var idx = parseInt(tab.dataset.index);
        showResult(idx);
        resultTabs.querySelectorAll('.result-tab').forEach(function (t) { t.classList.remove('active'); });
        tab.classList.add('active');
      });
    });
  }

  function showResult(idx) {
    state.activeResultIdx = idx;
    var r = state.results[idx];
    if (!r) return;

    if (r.error) {
      editorTextarea.value = '';
      editorPreview.innerHTML = '<div class="error-message"><p>⚠️ ' + escapeHtml(r.error) + '</p></div>';
    } else {
      editorTextarea.value = r.markdown || '';
      renderPreview(r.markdown || '');
    }
    updateEditorStats();
  }

  function updateFileStatuses() {
    var items = fileList.querySelectorAll('.file-item');
    state.results.forEach(function (r, i) {
      var item = items[i];
      if (!item) return;
      var statusEl = item.querySelector('.file-status');
      if (r.error) {
        statusEl.className = 'file-status error';
        statusEl.textContent = I18N.t('file.status.error');
      } else {
        statusEl.className = 'file-status done';
        statusEl.textContent = I18N.t('file.status.done');
      }
    });
  }

  // ---- Live Preview ----
  editorTextarea.addEventListener('input', function () {
    renderPreview(editorTextarea.value);
    updateEditorStats();
  });

  function renderPreview(md) {
    try {
      editorPreview.innerHTML = marked.parse(md, { breaks: true });
    } catch (e) {
      editorPreview.innerHTML = '<p style="color: var(--error)">Preview error</p>';
    }
  }

  // ---- Editor Stats ----
  function updateEditorStats() {
    if (!editorStats) return;
    var text = editorTextarea.value || '';
    var chars = text.length;
    var words = text.trim() ? text.trim().split(/\s+/).length : 0;
    var lines = text ? text.split('\n').length : 0;
    editorStats.textContent =
      'Chars: ' + chars.toLocaleString() +
      ' · Words: ' + words.toLocaleString() +
      ' · Lines: ' + lines.toLocaleString();
  }

  // ---- Word Wrap ----
  wordWrapToggle.addEventListener('change', function () {
    editorTextarea.classList.toggle('word-wrap', wordWrapToggle.checked);
  });
  if (wordWrapToggle.checked) {
    editorTextarea.classList.add('word-wrap');
  }

  // ---- Download All as ZIP ----
  downloadAllBtn.addEventListener('click', async function () {
    var payload = {
      files: state.results
        .filter(function (r) { return !r.error && r.markdown; })
        .map(function (r) { return { filename: r.filename || 'result.md', markdown: r.markdown }; }),
    };
    if (payload.files.length === 0) {
      showToast(I18N.t('loading.noResults'), 'error');
      return;
    }
    try {
      var resp = await fetch('/api/convert/download-zip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!resp.ok) throw new Error('Server error');
      var blob = await resp.blob();
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'converted_files.zip';
      a.click();
      URL.revokeObjectURL(a.href);
      showToast(I18N.t('toast.downloadedZip', { count: payload.files.length }), 'success');
    } catch (_) {
      showToast(I18N.t('toast.downloadZipFail'), 'error');
    }
  });

  // ---- Clear Results ----
  clearBtn.addEventListener('click', function () {
    state.files = [];
    state.results = [];
    state.activeResultIdx = 0;
    state.isConverting = false;
    fileList.hidden = true;
    fileList.innerHTML = '';
    convertBtn.hidden = true;
    convertBtn.disabled = false;
    convertBtn.textContent = I18N.t('btn.convertAll');
    resultsSection.classList.remove('visible', 'show');
    editorTextarea.value = '';
    editorPreview.innerHTML = '';
    updateEditorStats();
    urlInput.value = '';
    urlStatus.hidden = true;
    progressContainer.hidden = true;
    loadingOverlay.hidden = true;
    downloadAllBtn.hidden = true;
    historyPanel.hidden = true;
    showToast(I18N.t('toast.cleared'), 'info');
  });

  // ---- Copy ----
  copyBtn.addEventListener('click', async function () {
    var text = editorTextarea.value;
    if (!text) { showToast(I18N.t('toast.nothingToCopy'), 'info'); return; }
    try {
      await navigator.clipboard.writeText(text);
      showToast(I18N.t('toast.copied'), 'success');
    } catch (_) {
      showToast(I18N.t('toast.copyFail'), 'error');
    }
  });

  // ---- Download ----
  downloadBtn.addEventListener('click', function () {
    var text = editorTextarea.value;
    if (!text) { showToast(I18N.t('toast.nothingToDownload'), 'info'); return; }
    var r = state.results[state.activeResultIdx];
    var name = r ? (r.filename || 'converted') : 'converted';
    var baseName = name.replace(/\.[^.]+$/, '') + '.md';

    var blob = new Blob([text], { type: 'text/markdown' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = baseName;
    a.click();
    URL.revokeObjectURL(a.href);
    showToast(I18N.t('toast.downloaded', { name: baseName }), 'success');
  });

  // ---- Top Loader Helpers ----
  function showTopLoader() {
    var topLoader = $('#topLoader');
    if (!topLoader) return;
    topLoader.classList.remove('done');
    topLoader.classList.add('active');
  }

  function hideTopLoader() {
    var topLoader = $('#topLoader');
    if (!topLoader) return;
    topLoader.classList.remove('active');
    topLoader.classList.add('done');
  }

  // ---- Toast ----
  function showToast(msg, type) {
    type = type || 'info';
    var el = document.createElement('div');
    el.className = 'toast ' + type;
    el.textContent = msg;
    toastContainer.appendChild(el);
    setTimeout(function () { el.remove(); }, 3000);
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ---- Keyboard Shortcuts ----
  function initKeyboardShortcuts() {
    var isMac = navigator.platform.toUpperCase().includes('MAC');
    var modName = isMac ? '⌘' : 'Ctrl';

    // Update tooltips dynamically
    if (copyBtn) copyBtn.title = I18N.t('toolbar.copy') + ' (' + modName + '+Shift+C)';
    if (downloadBtn) downloadBtn.title = I18N.t('toolbar.download') + ' (' + modName + '+Shift+D)';

    // Listen for language update to re-apply tooltips
    document.addEventListener('i18n-updated', function () {
      if (copyBtn) copyBtn.title = I18N.t('toolbar.copy') + ' (' + modName + '+Shift+C)';
      if (downloadBtn) downloadBtn.title = I18N.t('toolbar.download') + ' (' + modName + '+Shift+D)';
    });

    var shortcutToastShown = localStorage.getItem('markitdown-shortcut-toast-shown') === 'true';

    document.addEventListener('keydown', function (e) {
      var isMac = navigator.platform.toUpperCase().includes('MAC');
      var modKey = isMac ? e.metaKey : e.ctrlKey;

      var triggered = false;

      // Ctrl/Cmd + Enter -> Convert
      if (modKey && e.key === 'Enter') {
        e.preventDefault();
        var activeTab = document.querySelector('.input-tab.active');
        if (activeTab && activeTab.dataset.tab === 'url') {
          if (!urlConvertBtn.disabled) {
            triggered = true;
            urlConvertBtn.click();
          }
        } else {
          if (!convertBtn.hidden && !convertBtn.disabled) {
            triggered = true;
            convertBtn.click();
          }
        }
      }

      // Ctrl/Cmd + Shift + C -> Copy
      if (modKey && e.shiftKey && (e.key === 'c' || e.key === 'C')) {
        e.preventDefault();
        if (editorTextarea.value) {
          triggered = true;
          copyBtn.click();
        }
      }

      // Ctrl/Cmd + Shift + D -> Download
      if (modKey && e.shiftKey && (e.key === 'd' || e.key === 'D')) {
        e.preventDefault();
        if (editorTextarea.value) {
          triggered = true;
          downloadBtn.click();
        }
      }

      // Escape -> Close History Panel
      if (e.key === 'Escape' && !historyPanel.hidden) {
        historyPanel.hidden = true;
      }

      if (triggered && !shortcutToastShown) {
        showToast(I18N.t('toast.shortcutHint'), 'info');
        shortcutToastShown = true;
        localStorage.setItem('markitdown-shortcut-toast-shown', 'true');
      }
    });
  }
  initKeyboardShortcuts();
  updateEditorStats();

})();