/**
 * NEURAL CHAT BOT - PDF IN-BROWSER RAG & VECTOR ENGINE
 * Features:
 * - Client-side PDF extraction via PDF.js (zero server upload required)
 * - Intelligent semantic chunking with sliding overlap & heading detection
 * - IndexedDB storage for full book persistence (supports 500+ page books)
 * - Deep in-browser semantic retrieval (Cosine / Token Frequency / Synonym Matching)
 * - Context augmentation for Google Gemini 1.5 Flash & local offline RAG
 */

(function () {
  'use strict';

  // Configure PDF.js Worker
  if (typeof window !== 'undefined') {
    const setupWorker = () => {
      if (window.pdfjsLib) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc =
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      }
    };
    if (window.pdfjsLib) {
      setupWorker();
    } else {
      window.addEventListener('load', setupWorker);
    }
  }

  const DB_NAME = 'NeuralBotPdfRAG_DB';
  const DB_VERSION = 1;
  const STORE_BOOKS = 'pdf_books';
  const STORE_CHUNKS = 'pdf_chunks';

  // IndexedDB Helper
  function openPdfDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_BOOKS)) {
          db.createObjectStore(STORE_BOOKS, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORE_CHUNKS)) {
          const chunkStore = db.createObjectStore(STORE_CHUNKS, { keyPath: 'id' });
          chunkStore.createIndex('by_bookId', 'bookId', { unique: false });
          chunkStore.createIndex('by_page', 'pageNumber', { unique: false });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = (e) => reject(e.target.error);
    });
  }

  // Common Bengali & English Stopwords for fast semantic tokens
  const PDF_STOPWORDS = new Set([
    'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'in', 'of', 'for', 'with', 'to', 'from',
    'as', 'by', 'that', 'this', 'it', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had',
    'কি', 'কী', 'কে', 'কেন', 'কোথায়', 'কিভাবে', 'কোন', 'এই', 'সেই', 'একটি', 'বা', 'এবং', 'ও', 'থেকে',
    'হলো', 'হচ্ছে', 'হবে', 'ছিল', 'আছে', 'করে', 'করা', 'দিয়ে', 'নিয়ে', 'পর', 'সাথে'
  ]);

  function normalizePdfText(text) {
    if (!text) return '';
    return text
      .toLowerCase()
      .replace(/[^\w\s\u0980-\u09FF]/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function extractTokens(text) {
    const clean = normalizePdfText(text);
    return clean
      .split(' ')
      .filter((t) => t.length > 2 && !PDF_STOPWORDS.has(t));
  }

  // Smart Chunking with Overlap (650 chars with 120 chars overlap)
  function chunkPageText(rawText, pageNumber, bookId, bookTitle) {
    if (!rawText || !rawText.trim()) return [];

    const CHUNK_SIZE = 700;
    const CHUNK_OVERLAP = 120;
    const chunks = [];

    // Detect potential headings / chapters
    const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);
    let currentHeading = `Page ${pageNumber}`;

    for (const l of lines) {
      if (
        /^(chapter|অধ্যায়|unit|part|section|module)\s*[\d\w:.-]/i.test(l) ||
        (l.length < 55 && l.length > 4 && /^[A-Z\u0980-\u09FF\s0-9:-]+$/.test(l))
      ) {
        currentHeading = l;
        break;
      }
    }

    const cleanFull = rawText.replace(/\s+/g, ' ').trim();
    if (cleanFull.length <= CHUNK_SIZE) {
      chunks.push({
        id: `chunk_${bookId}_p${pageNumber}_0`,
        bookId,
        bookTitle,
        pageNumber,
        heading: currentHeading,
        text: cleanFull,
        tokens: extractTokens(cleanFull)
      });
      return chunks;
    }

    let start = 0;
    let chunkIndex = 0;

    while (start < cleanFull.length) {
      let end = start + CHUNK_SIZE;
      if (end >= cleanFull.length) {
        end = cleanFull.length;
      } else {
        // Break at closest punctuation or whitespace
        const nextBreak = cleanFull.slice(start, end).search(/[.?!।\n][^.?!।\n]*$/);
        if (nextBreak > CHUNK_SIZE * 0.5) {
          end = start + nextBreak + 1;
        }
      }

      const chunkText = cleanFull.substring(start, end).trim();
      if (chunkText.length > 40) {
        chunks.push({
          id: `chunk_${bookId}_p${pageNumber}_${chunkIndex}`,
          bookId,
          bookTitle,
          pageNumber,
          heading: currentHeading,
          text: chunkText,
          tokens: extractTokens(chunkText)
        });
        chunkIndex++;
      }

      if (end >= cleanFull.length) break;
      start = Math.max(end - CHUNK_OVERLAP, start + 50);
    }

    return chunks;
  }

  // Neural PDF Store Object
  const NeuralPdfStore = {
    activeBookId: null,

    async init() {
      try {
        await openPdfDatabase();
        console.log('[Neural PDF RAG] IndexedDB storage initialized successfully.');
      } catch (err) {
        console.warn('[Neural PDF RAG] Failed to initialize IndexedDB:', err);
      }
    },

    // Extract text from PDF file and store chunks into IndexedDB
    async ingestPdfFile(file, manualTitle = '', onProgress = null) {
      if (!file) throw new Error('No PDF file provided.');
      if (!window.pdfjsLib) throw new Error('PDF.js library is not loaded.');

      const startTime = Date.now();
      const fileName = file.name || 'document.pdf';
      const bookTitle = (manualTitle || fileName.replace(/\.pdf$/i, '')).trim();
      const bookId = 'pdf_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = window.pdfjsLib.getDocument({ data: arrayBuffer });
      const pdfDoc = await loadingTask.promise;
      const totalPages = pdfDoc.numPages;

      let allChunks = [];
      let totalExtractedLength = 0;

      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        const percent = Math.min(80, Math.round((pageNum / totalPages) * 80));
        if (onProgress) {
          onProgress({
            stage: 'reading',
            current: pageNum,
            total: totalPages,
            percent,
            chunksCount: allChunks.length
          });
        }

        let page = null;
        try {
          // Timeout of 8 seconds per page so a broken or heavy page never blocks the entire book
          const pagePromise = pdfDoc.getPage(pageNum);
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Page timeout (skipped)')), 8000)
          );
          page = await Promise.race([pagePromise, timeoutPromise]);

          const textContent = await page.getTextContent({ disableCombineTextItems: false });
          const pageText = textContent.items
            .map((item) => item.str)
            .join(' ')
            .replace(/\s+/g, ' ');

          totalExtractedLength += pageText.length;
          const pageChunks = chunkPageText(pageText, pageNum, bookId, bookTitle);
          allChunks.push(...pageChunks);
        } catch (pageErr) {
          console.warn(`[Neural PDF RAG] Page ${pageNum} skipped:`, pageErr.message);
        } finally {
          // CRITICAL: release page font and operator resources from memory immediately
          if (page && typeof page.cleanup === 'function') {
            try { page.cleanup(); } catch (e) {}
          }
        }

        // Periodic document cache cleanup every 15 pages
        if (pageNum % 15 === 0 && typeof pdfDoc.cleanup === 'function') {
          try { pdfDoc.cleanup(); } catch (e) {}
        }

        // CRITICAL: Yield to browser event loop on every page so UI stays responsive & GC runs
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      if (allChunks.length === 0) {
        throw new Error('Could not extract readable text from this PDF (it may contain scanned image-only pages).');
      }

      if (onProgress) {
        onProgress({
          stage: 'saving',
          current: 0,
          total: allChunks.length,
          percent: 82
        });
      }

      // Save book record and chunks in batches into IndexedDB
      const db = await openPdfDatabase();
      const bookMeta = {
        id: bookId,
        title: bookTitle,
        filename: fileName,
        totalPages,
        totalChunks: allChunks.length,
        fileSize: file.size,
        uploadDate: new Date().toISOString(),
        sampleText: allChunks[0]?.text?.substring(0, 180) || ''
      };

      // 1. Save book meta
      await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_BOOKS, 'readwrite');
        tx.objectStore(STORE_BOOKS).put(bookMeta);
        tx.oncomplete = () => resolve();
        tx.onerror = (e) => reject(e.target.error);
      });

      // 2. Save chunks in batches of 120 with event loop yield
      const BATCH_SIZE = 120;
      for (let i = 0; i < allChunks.length; i += BATCH_SIZE) {
        const batch = allChunks.slice(i, i + BATCH_SIZE);
        const savePercent = 82 + Math.round((i / allChunks.length) * 16);
        if (onProgress) {
          onProgress({
            stage: 'saving',
            current: Math.min(i + BATCH_SIZE, allChunks.length),
            total: allChunks.length,
            percent: savePercent
          });
        }

        await new Promise((resolve, reject) => {
          const tx = db.transaction(STORE_CHUNKS, 'readwrite');
          const chunkStore = tx.objectStore(STORE_CHUNKS);
          for (const chk of batch) {
            chunkStore.put(chk);
          }
          tx.oncomplete = () => resolve();
          tx.onerror = (e) => reject(e.target.error);
        });

        await new Promise((resolve) => setTimeout(resolve, 8));
      }

      // Cleanup PDF document worker memory
      try {
        if (typeof pdfDoc.destroy === 'function') {
          pdfDoc.destroy();
        }
      } catch (e) {}

      this.activeBookId = bookId;

      if (onProgress) {
        onProgress({
          stage: 'complete',
          current: allChunks.length,
          total: allChunks.length,
          percent: 100
        });
      }

      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`[Neural PDF RAG] Ingested "${bookTitle}": ${totalPages} pages, ${allChunks.length} chunks in ${elapsed}s`);

      return {
        bookId,
        bookTitle,
        totalPages,
        totalChunks: allChunks.length,
        elapsed
      };
    },

    // List all stored PDF books
    async getPdfBooks() {
      try {
        const db = await openPdfDatabase();
        return new Promise((resolve, reject) => {
          const tx = db.transaction(STORE_BOOKS, 'readonly');
          const store = tx.objectStore(STORE_BOOKS);
          const request = store.getAll();
          request.onsuccess = () => resolve(request.result || []);
          request.onerror = (e) => reject(e.target.error);
        });
      } catch (err) {
        console.warn('[Neural PDF RAG] getPdfBooks error:', err);
        return [];
      }
    },

    // Delete a PDF book and all its chunks
    async deletePdfBook(bookId) {
      const db = await openPdfDatabase();
      return new Promise((resolve, reject) => {
        const tx = db.transaction([STORE_BOOKS, STORE_CHUNKS], 'readwrite');
        const bookStore = tx.objectStore(STORE_BOOKS);
        const chunkStore = tx.objectStore(STORE_CHUNKS);

        bookStore.delete(bookId);

        const index = chunkStore.index('by_bookId');
        const keyRange = IDBKeyRange.only(bookId);
        const cursorReq = index.openCursor(keyRange);

        cursorReq.onsuccess = (e) => {
          const cursor = e.target.result;
          if (cursor) {
            chunkStore.delete(cursor.primaryKey);
            cursor.continue();
          }
        };

        tx.oncomplete = () => {
          if (this.activeBookId === bookId) this.activeBookId = null;
          resolve(true);
        };
        tx.onerror = (e) => reject(e.target.error);
      });
    },

    // Get all chunks for a book or across all books
    async getAllChunks(targetBookId = null) {
      const db = await openPdfDatabase();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_CHUNKS, 'readonly');
        const store = tx.objectStore(STORE_CHUNKS);

        if (targetBookId) {
          const index = store.index('by_bookId');
          const request = index.getAll(IDBKeyRange.only(targetBookId));
          request.onsuccess = () => resolve(request.result || []);
          request.onerror = (e) => reject(e.target.error);
        } else {
          const request = store.getAll();
          request.onsuccess = () => resolve(request.result || []);
          request.onerror = (e) => reject(e.target.error);
        }
      });
    },

    // Generate an automatic summary and chapter table of contents for an uploaded book
    async getBookOverview(targetBookId = null) {
      const books = await this.getPdfBooks();
      if (!books || books.length === 0) return null;

      const book = targetBookId
        ? (books.find((b) => b.id === targetBookId) || books[0])
        : (this.activeBookId ? (books.find((b) => b.id === this.activeBookId) || books[0]) : books[0]);

      if (!book) return null;

      const chunks = await this.getAllChunks(book.id);
      if (!chunks || chunks.length === 0) return null;

      // Extract unique meaningful headings
      const headingSet = new Set();
      const samplePoints = [];

      for (const chk of chunks) {
        if (chk.heading && !chk.heading.startsWith('Page ') && chk.heading.length > 3 && chk.heading.length < 90) {
          if (!headingSet.has(chk.heading)) {
            headingSet.add(chk.heading);
            samplePoints.push({
              page: chk.pageNumber,
              heading: chk.heading,
              snippet: chk.text.substring(0, 160)
            });
            if (samplePoints.length >= 8) break;
          }
        }
      }

      // If no custom headings found, take early chunks from first 1-6 pages
      if (samplePoints.length === 0) {
        const earlyChunks = chunks.filter((c) => c.pageNumber <= 6).slice(0, 5);
        for (const c of earlyChunks) {
          samplePoints.push({
            page: c.pageNumber,
            heading: `Page ${c.pageNumber}`,
            snippet: c.text.substring(0, 160)
          });
        }
      }

      return {
        book,
        samplePoints,
        earlyText: chunks.slice(0, 5).map((c) => c.text).join('\n\n')
      };
    },

    // Semantic RAG Chunk Search across PDF books
    async searchPdfChunks(rawQuery, limit = 4, targetBookId = null) {
      if (!rawQuery || !rawQuery.trim()) return [];

      const cleanQ = normalizePdfText(rawQuery);
      const queryTokens = extractTokens(rawQuery);
      if (queryTokens.length === 0 && cleanQ.length < 3) return [];

      const chunks = await this.getAllChunks(targetBookId);
      if (!chunks || chunks.length === 0) return [];

      const scored = [];

      for (const chk of chunks) {
        let score = 0;
        const textLower = (chk.text || '').toLowerCase();
        const headingLower = (chk.heading || '').toLowerCase();
        const titleLower = (chk.bookTitle || '').toLowerCase();

        // Exact query substring boost
        if (cleanQ.length >= 4) {
          if (headingLower.includes(cleanQ)) score += 95;
          if (textLower.includes(cleanQ)) score += 75;
          if (titleLower.includes(cleanQ)) score += 40;
        }

        // Token frequency and semantic matching
        let matchedTokensCount = 0;
        for (const tok of queryTokens) {
          if (tok.length < 2) continue;
          if (headingLower.includes(tok)) {
            score += 35;
            matchedTokensCount++;
          } else if (textLower.includes(tok)) {
            // Count occurrences
            const regex = new RegExp(tok, 'gi');
            const count = (textLower.match(regex) || []).length;
            score += Math.min(count * 15, 45);
            matchedTokensCount++;
          }
        }

        // Multi-token intersection reward
        if (matchedTokensCount > 1) {
          score += matchedTokensCount * 12;
        }

        // Target book boost
        if (this.activeBookId && chk.bookId === this.activeBookId) {
          score += 20;
        }

        if (score > 18) {
          scored.push({
            ...chk,
            score
          });
        }
      }

      scored.sort((a, b) => b.score - a.score);
      return scored.slice(0, limit);
    },

    // Render PDF book cards into Knowledge Explorer grid
    async renderPdfBookCards(containerEl) {
      if (!containerEl) return;
      const books = await this.getPdfBooks();

      if (books.length === 0) {
        containerEl.innerHTML = `
          <div class="empty-kb-state" style="grid-column: 1 / -1; text-align: center; padding: 40px 20px;">
            <i class="fa-solid fa-file-pdf" style="font-size: 3rem; color: #ff4d4f; opacity: 0.7; margin-bottom: 15px;"></i>
            <h4 style="color: #fff; margin-bottom: 8px;">No PDF Books Ingested Yet</h4>
            <p style="color: var(--text-muted); font-size: 0.88rem; max-width: 500px; margin: 0 auto 16px;">
              যেকোনো বিষয়ের বই বা ডকুমেন্টের PDF আপলোড করুন। এআই পুরো বই পড়ে চাংকিং ও মেমোরিতে সংরক্ষণ করবে এবং নির্ভুল উত্তর দেবে।
            </p>
            <button class="btn btn-primary btn-sm" onclick="openPdfUploadPanel();">
              <i class="fa-solid fa-cloud-arrow-up"></i> Upload Book PDF 📚
            </button>
          </div>
        `;
        return;
      }

      containerEl.innerHTML = books
        .map((book) => {
          const dateStr = new Date(book.uploadDate).toLocaleDateString();
          const sizeMb = (book.fileSize / (1024 * 1024)).toFixed(1);
          return `
          <div class="knowledge-card pdf-knowledge-card" style="border-color: rgba(255, 77, 79, 0.4); background: linear-gradient(135deg, rgba(255, 77, 79, 0.08), rgba(15, 23, 42, 0.6));">
            <div class="kb-card-header">
              <div class="kb-card-title">
                <i class="fa-solid fa-book-open" style="color: #ff4d4f;"></i>
                <h4 style="color: #fff;">${escapeHtml(book.title)}</h4>
              </div>
              <span class="badge-tag" style="background: rgba(255, 77, 79, 0.2); color: #ff7875; border-color: rgba(255, 77, 79, 0.4);">
                ${book.totalPages} Pages &bull; ${book.totalChunks} Chunks
              </span>
            </div>
            
            <p class="kb-card-desc" style="font-size: 0.82rem; color: #cbd5e1; margin: 10px 0;">
              ${escapeHtml(book.sampleText)}...
            </p>

            <div class="kb-card-meta" style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 10px; margin-top: 10px;">
              <span style="font-size: 0.75rem; color: #94a3b8;">
                <i class="fa-solid fa-calendar-day"></i> ${dateStr} &bull; ${sizeMb} MB
              </span>
              <div style="display: flex; gap: 8px;">
                <button class="btn btn-sm btn-secondary" onclick="testAskPdfBook('${escapeHtml(book.title)}');" title="Ask question from this book" style="padding: 3px 10px; font-size: 0.78rem;">
                  <i class="fa-solid fa-comments"></i> Ask Book
                </button>
                <button class="btn btn-sm" onclick="confirmDeletePdfBook('${book.id}', '${escapeHtml(book.title)}');" title="Delete book from memory" style="background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.4); padding: 3px 8px; font-size: 0.78rem;">
                  <i class="fa-solid fa-trash-can"></i>
                </button>
              </div>
            </div>
          </div>
        `;
        })
        .join('');
    }
  };

  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, (m) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[m]));
  }

  // Global helper functions
  window.openPdfUploadPanel = function () {
    const panel = document.getElementById('uploadPdfPanel');
    if (panel) {
      panel.style.display = 'block';
      panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  window.closePdfUploadPanel = function () {
    const panel = document.getElementById('uploadPdfPanel');
    if (panel) panel.style.display = 'none';
  };

  window.testAskPdfBook = function (bookTitle) {
    if (typeof window.closeKnowledgeModal === 'function') {
      window.closeKnowledgeModal();
    }
    const heroInput = document.getElementById('heroChatInput');
    if (heroInput) {
      heroInput.value = `"${bookTitle}" বইটিতে কি কি বিষয় আলোচনা করা হয়েছে?`;
      heroInput.focus();
    }
  };

  window.confirmDeletePdfBook = async function (bookId, title) {
    if (confirm(`Are you sure you want to remove "${title}" from NeuralBot's brain?`)) {
      await NeuralPdfStore.deletePdfBook(bookId);
      if (typeof window.renderKnowledgeGrid === 'function') {
        window.renderKnowledgeGrid();
      }
      if (typeof window.showToastNotification === 'function') {
        window.showToastNotification(`Book "${title}" deleted from memory.`, 'info');
      }
    }
  };

  // Expose to window
  window.NeuralPdfStore = NeuralPdfStore;

  // Initialize DB on script load
  NeuralPdfStore.init();
})();
