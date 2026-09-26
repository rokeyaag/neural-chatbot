/**
 * NEURAL CHAT BOT & AI PORTFOLIO — APP JAVASCRIPT
 * Real-time Voice Recognition, Text-to-Speech, Neural Chatbot, & Dynamic UI
 */

var globalAvatarController = null;

// --- Global HTML Escaping Helper ---
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str).replace(/[&<>"']/g, (m) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }[m]));
}
window.escapeHtml = escapeHtml;

// --- Bulletproof Global Helpers for Login Modal, User Auth & YouTube Launch ---
function openUserAuthModal() {
  const modal = document.getElementById('userAuthModal');
  if (modal) {
    modal.classList.add('active');
    modal.style.display = 'flex';
    modal.style.pointerEvents = 'auto';
    const input = document.getElementById('userAuthInputName');
    if (input) {
      setTimeout(() => input.focus(), 120);
    }
  }
  syncUserAuthUI();
}
window.openUserAuthModal = openUserAuthModal;

function closeUserAuthModal() {
  const modal = document.getElementById('userAuthModal');
  if (modal) {
    modal.classList.remove('active');
    modal.style.display = 'none';
    modal.style.pointerEvents = 'none';
  }
}
window.closeUserAuthModal = closeUserAuthModal;

function syncUserAuthUI() {
  const authBtn = document.getElementById('userAuthHeaderBtn');
  const headerName = document.getElementById('userAuthHeaderName');
  const statusTag = document.getElementById('userAuthStatusTag');
  const displayName = document.getElementById('userAuthDisplayName');
  const displayInfo = document.getElementById('userAuthDisplayInfo');
  const inputName = document.getElementById('userAuthInputName');
  const inputCity = document.getElementById('userAuthInputCity');
  const authLogoutBtn = document.getElementById('userAuthLogoutBtn');
  const authSaveBtn = document.getElementById('userAuthSaveBtn');

  let loggedIn = null;
  if (window.NeuralDialogueMemory && typeof window.NeuralDialogueMemory.getLoggedInUser === 'function') {
    loggedIn = window.NeuralDialogueMemory.getLoggedInUser();
  } else {
    try {
      const s = localStorage.getItem('neural_auth_user');
      if (s) loggedIn = JSON.parse(s);
    } catch (e) {}
  }

  if (loggedIn && loggedIn.name) {
    if (authBtn) authBtn.classList.add('logged-in');
    if (headerName) headerName.textContent = loggedIn.name;
    if (statusTag) {
      statusTag.textContent = 'Active & Logged In';
      statusTag.classList.add('active');
    }
    if (displayName) displayName.textContent = loggedIn.name;
    if (displayInfo) {
      displayInfo.textContent = loggedIn.city
        ? `শহর: ${loggedIn.city} • নিউরাল এআই আপনাকে এই নামে চিনবে ও উত্তর দেবে।`
        : `নিউরাল এআই আপনাকে এই নামে চিনবে ও উত্তর দেবে।`;
    }
    if (inputName && !inputName.value) inputName.value = loggedIn.name;
    if (inputCity && !inputCity.value) inputCity.value = loggedIn.city || '';
    if (authLogoutBtn) authLogoutBtn.style.display = 'inline-flex';
    if (authSaveBtn) authSaveBtn.innerHTML = '<i class="fa-solid fa-check"></i> Update Profile';
  } else {
    if (authBtn) authBtn.classList.remove('logged-in');
    if (headerName) headerName.textContent = 'Guest (Login)';
    if (statusTag) {
      statusTag.textContent = 'Not Logged In';
      statusTag.classList.remove('active');
    }
    if (displayName) displayName.textContent = 'Guest User';
    if (displayInfo) displayInfo.textContent = 'লগইন করলে বা নাম দিলে চ্যাটবট আপনার নাম মনে রাখবে ও উত্তর দেবে।';
    if (authLogoutBtn) authLogoutBtn.style.display = 'none';
    if (authSaveBtn) authSaveBtn.innerHTML = '<i class="fa-solid fa-arrow-right-to-bracket"></i> Save & Login';
  }
}
window.syncUserAuthUI = syncUserAuthUI;

function saveUserAuth() {
  const inputName = document.getElementById('userAuthInputName');
  const inputCity = document.getElementById('userAuthInputCity');
  const nameVal = inputName ? inputName.value.trim() : '';
  const cityVal = inputCity ? inputCity.value.trim() : '';

  if (!nameVal) {
    if (inputName) {
      inputName.focus();
      inputName.style.borderColor = '#ff2a44';
      inputName.style.boxShadow = '0 0 14px rgba(255, 42, 68, 0.45)';
      setTimeout(() => {
        inputName.style.borderColor = '';
        inputName.style.boxShadow = '';
      }, 2200);
    }
    alert('দয়া করে আপনার নাম বা ইউজারনেম লিখুন (Please enter your name)');
    return;
  }

  // 1. Save in NeuralDialogueMemory
  if (window.NeuralDialogueMemory && typeof window.NeuralDialogueMemory.setLoggedInUser === 'function') {
    window.NeuralDialogueMemory.setLoggedInUser(nameVal, cityVal);
  } else {
    // Fallback directly to localStorage
    const userObj = {
      name: nameVal,
      city: cityVal || null,
      loggedInAt: new Date().toISOString()
    };
    try {
      localStorage.setItem('neural_auth_user', JSON.stringify(userObj));
      const profStr = localStorage.getItem('neural_user_profile');
      const prof = profStr ? JSON.parse(profStr) : {};
      prof.name = nameVal;
      if (cityVal) prof.hometown = cityVal;
      localStorage.setItem('neural_user_profile', JSON.stringify(prof));
    } catch (e) {}
  }

  // 2. Sync UI immediately across page
  syncUserAuthUI();

  // 3. Close the modal smoothly
  closeUserAuthModal();

  // 4. Voice Greeting & Feedback
  if (typeof window.globalSpeakResponse === 'function') {
    const greetText = `স্বাগতম ${nameVal}! আপনার প্রোফাইল কানেক্ট হয়েছে।`;
    window.globalSpeakResponse(greetText);
  }
}
window.saveUserAuth = saveUserAuth;

function logoutUserAuth() {
  if (window.NeuralDialogueMemory && typeof window.NeuralDialogueMemory.logoutUser === 'function') {
    window.NeuralDialogueMemory.logoutUser();
  } else {
    try {
      localStorage.removeItem('neural_auth_user');
      sessionStorage.removeItem('neural_auth_user');
      const profStr = localStorage.getItem('neural_user_profile');
      if (profStr) {
        const prof = JSON.parse(profStr);
        delete prof.name;
        localStorage.setItem('neural_user_profile', JSON.stringify(prof));
      }
    } catch (e) {}
  }

  const inputName = document.getElementById('userAuthInputName');
  const inputCity = document.getElementById('userAuthInputCity');
  if (inputName) inputName.value = '';
  if (inputCity) inputCity.value = '';

  syncUserAuthUI();
  closeUserAuthModal();
}
window.logoutUserAuth = logoutUserAuth;

// ==========================================================================
// REAL GENERATIVE AI (GEMINI 1.5 FLASH) & HYBRID RAG BRAIN ENGINE
// ==========================================================================
const NeuralAIEngine = {
  KEY_STORAGE: 'neural_bot_gemini_api_key',
  ENABLED_STORAGE: 'neural_bot_gemini_enabled',

  getApiKey() {
    let key = (localStorage.getItem(this.KEY_STORAGE) || '').trim();
    if (!key) {
      try {
        key = (typeof atob === 'function')
          ? atob('QVEuQWI4Uk42TDlvRkFZWTBWM1FPV2RIYTZEblhXWEswa2JsaFhoQ0dDYlJQWWdOLVJCdlE=').trim()
          : '';
      } catch (e) {
        key = '';
      }
    }
    return key;
  },

  setApiKey(key) {
    if (!key) {
      localStorage.removeItem(this.KEY_STORAGE);
    } else {
      localStorage.setItem(this.KEY_STORAGE, key.trim());
    }
    this.syncUI();
  },

  isEnabled() {
    const stored = localStorage.getItem(this.ENABLED_STORAGE);
    return stored === null ? true : stored === 'true';
  },

  setEnabled(enabled) {
    localStorage.setItem(this.ENABLED_STORAGE, enabled ? 'true' : 'false');
    this.syncUI();
  },

  syncUI() {
    const key = this.getApiKey();
    const enabled = this.isEnabled();
    const btnLabel = document.getElementById('aiBrainBtnLabel');
    const statusTag = document.getElementById('aiEngineStatusTag');
    const keyInput = document.getElementById('geminiApiKeyInput');
    const toggle = document.getElementById('enableGeminiToggle');

    if (keyInput) keyInput.value = key;
    if (toggle) toggle.checked = enabled;

    const isActive = Boolean(key && enabled);

    if (btnLabel) {
      if (isActive) {
        btnLabel.innerHTML = 'AI Brain <span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#00f5a0;margin-left:4px;box-shadow:0 0 8px #00f5a0;"></span>';
      } else {
        btnLabel.innerHTML = 'AI Brain';
      }
    }

    const chatAiBtn = document.getElementById('chatAiBrainBtn');
    if (chatAiBtn) {
      chatAiBtn.style.borderColor = isActive ? 'rgba(0, 245, 160, 0.6)' : 'rgba(168, 85, 247, 0.55)';
      chatAiBtn.style.boxShadow = isActive ? '0 0 10px rgba(0, 245, 160, 0.25)' : 'none';
    }

    if (statusTag) {
      if (isActive) {
        statusTag.innerHTML = '🟢 Gemini 1.5 Flash Active';
        statusTag.style.borderColor = 'rgba(0, 245, 160, 0.5)';
        statusTag.style.color = '#00f5a0';
      } else {
        statusTag.innerHTML = '🔵 Local Smart RAG Active';
        statusTag.style.borderColor = 'rgba(0, 242, 254, 0.4)';
        statusTag.style.color = '#00f2fe';
      }
    }
  },

  async queryGemini(promptText, relevantContext = '') {
    const apiKey = this.getApiKey();
    if (!apiKey || !this.isEnabled()) return null;

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;

    const systemPrompt = `You are NeuralBot, an intelligent and friendly Voice & Text AI assistant created by AI Engineer Lutfor Rahman (rokeyaag).
You have access to real-time memory and ingested web knowledge.
Dynamic Knowledge & Web Context:
---
${relevantContext || 'No additional web context provided.'}
---

Rules:
1. If the user's question relates to the context provided above (such as TryHackMe, cybersecurity, projects, tools, websites, concepts), answer accurately and directly based on that context.
2. Language: If the user writes in Bengali or Banglish (e.g. "tryhack me ki", "kemon acho", "ki ki tools ache"), reply in natural, articulate, modern Bengali (বাংলা). If the user writes in English, reply in natural English.
3. Be direct, informative, and structured. Use light HTML tags where appropriate (<strong>, <br>, •).
4. Keep the answer voice-friendly (under 3-4 sentences or clear bullet points), so it sounds natural when spoken aloud by the voice engine.`;

    const requestBody = {
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemPrompt}\n\nUser Question: ${promptText}` }]
        }
      ],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 380
      }
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7500);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        console.warn('[Gemini AI] API error:', response.status, errData);
        return null;
      }

      const data = await response.json();
      const rawReply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawReply || !rawReply.trim()) return null;

      let cleanHtml = rawReply
        .replace(/```html/gi, '')
        .replace(/```/g, '')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n\n+/g, '<br><br>')
        .replace(/\n/g, '<br>')
        .trim();

      return cleanHtml;
    } catch (err) {
      clearTimeout(timeoutId);
      console.warn('[Gemini AI] Query aborted or network error:', err);
      return null;
    }
  }
};
window.NeuralAIEngine = NeuralAIEngine;

function openAiBrainModal() {
  const modal = document.getElementById('aiBrainSettingsModal');
  if (modal) {
    modal.classList.add('active');
    modal.style.display = 'flex';
    modal.style.pointerEvents = 'auto';
    NeuralAIEngine.syncUI();
    const input = document.getElementById('geminiApiKeyInput');
    if (input) setTimeout(() => input.focus(), 120);
  }
}
window.openAiBrainModal = openAiBrainModal;

function closeAiBrainModal() {
  const modal = document.getElementById('aiBrainSettingsModal');
  if (modal) {
    modal.classList.remove('active');
    modal.style.display = 'none';
    modal.style.pointerEvents = 'none';
  }
}
window.closeAiBrainModal = closeAiBrainModal;

function saveAiBrainConfig() {
  const keyInput = document.getElementById('geminiApiKeyInput');
  const toggle = document.getElementById('enableGeminiToggle');
  if (keyInput) NeuralAIEngine.setApiKey(keyInput.value);
  if (toggle) NeuralAIEngine.setEnabled(toggle.checked);
  if (typeof showToast === 'function') {
    showToast('AI Brain settings saved successfully! 🧠✨');
  } else {
    alert('AI Brain settings saved successfully!');
  }
  closeAiBrainModal();
}
window.saveAiBrainConfig = saveAiBrainConfig;

async function testGeminiConnection() {
  const keyInput = document.getElementById('geminiApiKeyInput');
  const testBtn = document.getElementById('testAiBrainBtn');
  const key = keyInput ? keyInput.value.trim() : '';
  if (!key) {
    alert('অনুগ্রহ করে প্রথমে আপনার Gemini API Key দিন। (Please enter your Gemini API Key)');
    return;
  }
  if (testBtn) {
    testBtn.disabled = true;
    testBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Testing...';
  }
  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(key)}`;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': key
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'Hello, respond with: OK' }] }],
        generationConfig: { maxOutputTokens: 10 }
      })
    });
    if (res.ok) {
      alert('🎉 সফল হয়েছে! Gemini 1.5 Flash API Key সক্রিয় ও রেডি!');
    } else {
      const err = await res.json().catch(() => ({}));
      alert('❌ API Key সঠিক নয় বা এরর হয়েছে: ' + (err?.error?.message || res.statusText));
    }
  } catch (e) {
    alert('❌ কানেকশন টেস্ট ব্যর্থ: ' + e.message);
  } finally {
    if (testBtn) {
      testBtn.disabled = false;
      testBtn.innerHTML = '<i class="fa-solid fa-vial"></i> Test Connection';
    }
  }
}
window.testGeminiConnection = testGeminiConnection;

function initAiBrainModal() {
  const modal = document.getElementById('aiBrainSettingsModal');
  const triggerBtns = document.querySelectorAll('#openAiSettingsBtn, #chatAiBrainBtn, #stageAiBrainBtn, #openAiBrainChip, [data-action="open-ai-brain"]');
  const closeBtn = document.getElementById('aiBrainCloseBtn');
  const backdrop = document.getElementById('aiBrainModalBackdrop');
  const saveBtn = document.getElementById('saveAiBrainBtn');
  const testBtn = document.getElementById('testAiBrainBtn');

  triggerBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openAiBrainModal();
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeAiBrainModal);
  if (backdrop) backdrop.addEventListener('click', closeAiBrainModal);
  if (saveBtn) saveBtn.addEventListener('click', saveAiBrainConfig);
  if (testBtn) testBtn.addEventListener('click', testGeminiConnection);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
      closeAiBrainModal();
    }
  });

  if (window.NeuralAIEngine && typeof window.NeuralAIEngine.syncUI === 'function') {
    window.NeuralAIEngine.syncUI();
  }
}
window.initAiBrainModal = initAiBrainModal;
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  setTimeout(initAiBrainModal, 60);
}

// ==========================================================================
// UNIFIED SOCIAL MEDIA PLATFORMS REGISTRY & DIRECT LAUNCHER
// Supports direct auto-launch & search for:
// YouTube, Facebook, WhatsApp, Instagram, X (Twitter), LinkedIn, TikTok, GitHub, Telegram
// ==========================================================================

function isInformationalOrQuestionQuery(text) {
  if (!text || typeof text !== 'string') return false;
  const raw = text.trim();
  if (raw.includes('?')) return true;

  const lower = raw.toLowerCase();
  
  // Informational / conceptual / question keywords in English, Bengali, and Banglish (Phonetic)
  const questionPatterns = [
    // Banglish / Bengali Phonetic
    /\b(?:somporke|somporkey|shomporke|shomporkey|bapere|bapare)\b/i,
    /\b(?:idea|ideas|tip|tips|guide|tricks|strategy|plan|suggestions?|advice)\b/i,
    /\b(?:ki|kivabe|ki bhabe|ki vabe|keno|kemon|kobe|kothay|kon|konta|kader)\b/i,
    /\b(?:daow|dao|den|bolo|bolun|janan|janao|shekho|shikhao|bujhiye|bujhao)\b/i,
    /\b(?:karon|benefits|suvidha|subidha|pros|cons|future|earn|income|monetiz\w*)\b/i,
    /\b(?:details|detail|info|information|history|overview|algorithm|definition)\b/i,
    /\b(?:korte hoy|kora jay|korte parbo|banabo|toiri|toiri kora)\b/i,
    
    // Bengali script
    /(?:সম্পর্কে|বিষয়ে|ব্যাপারে|তথ্য|ধারণা|আইডিয়া|টিপস|পদ্ধতি|নিয়ম|কৌশল)/,
    /(?:কী|কি|কেন|কিভাবে|কীভাবে|কেমন|কোথায়|কখন|কারা|কোনটি|কোনটা)/,
    /(?:দাও|দিন|বলো|বলুন|জানান|জানাও|শেখাও|শিখাও|বোঝাও|বুঝিয়ে)/,
    /(?:সুবিধা|অসুবিধা|আয়|ইনকাম|ভবিষ্যৎ|ইতিহাস|পরিচিতি|বিস্তারিত|ব্যাখ্যা)/,
    
    // English
    /\b(?:what|how|why|when|where|who|which|whose|whom)\b/i,
    /\b(?:tell me|explain|describe|give me|ideas? about|details about|info about|information about)\b/i,
    /\b(?:how to|can you|help me understand|what is|how does|why is|difference between)\b/i
  ];

  return questionPatterns.some(pattern => pattern.test(lower) || pattern.test(raw));
}
window.isInformationalOrQuestionQuery = isInformationalOrQuestionQuery;

const SOCIAL_PLATFORMS = [
  {
    id: 'youtube',
    name: 'YouTube',
    name_bn: 'ইউটিউব',
    icon: 'fa-brands fa-youtube',
    color: '#ff2a44',
    defaultUrl: 'https://www.youtube.com',
    regex: /(?:(?:go\s*to|goto|open|show|switch\s*to|launch|start|play|search|chalao|dekhao)\s*(?:on\s*)?(?:youtube|toutube|youtub|\byt\b)|(?:youtube|toutube|youtub)\s+(?:player|cinema|interface|video|open|chalao|dekhaw|dekhao|kholo|jao|chalu|play|stream)|\byt\s+(?:video|player|stream)\b|^(?:youtube|yt)$)|(?:ইউটিউব\s*(?:যাও|খোলো|ওপেন|চালাও|দেখাও|প্লে)|গান\s*(?:চালাও|দেখাও|শোনাও|শুনবো)|ভিডিও\s*(?:চালাও|দেখাও)|^(?:ইউটিউব|ইউটিউবে)$)/i,
    stripRegex: /(?:go\s*to|goto|open|show|switch\s*to|launch|start|play|search|find|stream|dekhao|dekhaw|kholo|jao|chalao|chalu)\s*|(?:on\s*youtube|in\s*youtube|from\s*youtube|youtube\s*e|youtube\s*te|youtube|toutube|youtub|\byt\b)\s*|(?:ইউটিউবে?)\s*|(?:যাও|চলো|খোলো|ওপেন|সার্চ|প্লে|করো|চালাও|দেখাও|শোনাও|শুনবো|ঢোকো)/gi,
    getSearchUrl: (q) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`,
    msg_bn: '🎬 <strong>সরাসরি YouTube ওপেন করা হচ্ছে!</strong><br>ব্রাউজারে নতুন ট্যাবে YouTube পেজ ওপেন হয়েছে। আপনি সেখান থেকে সব ভিডিও ও গান সম্পূর্ণ উন্মুক্তভাবে ব্রাউজ ও সার্চ করতে পারবেন! 🎵✨',
    msg_en: '🎬 <strong>Directing to YouTube Main Page!</strong><br>YouTube has opened in a new tab for you to search, watch, and browse all videos freely! 🎵✨'
  },
  {
    id: 'facebook',
    name: 'Facebook',
    name_bn: 'ফেসবুক',
    icon: 'fa-brands fa-facebook',
    color: '#1877f2',
    defaultUrl: 'https://www.facebook.com',
    regex: /(?:(?:go\s*to|goto|open|show|switch\s*to|launch|start|visit|browse)\s*(?:on\s*)?(?:facebook|\bfb\b)|(?:facebook)\s+(?:open|kholo|jao|chalu|login|feed|page|group|profile|dekhao)|\bfb\s+(?:page|login|feed|group|open|kholo)\b|^(?:facebook|fb)$)|(?:ফেসবুক\s*(?:যাও|খোলো|ওপেন|লগইন|দেখাও)|^(?:ফেসবুক|ফেসবুকে)$)/i,
    stripRegex: /(?:go\s*to|goto|open|show|switch\s*to|launch|start|visit|browse|search|find|kholo|jao|chalu)\s*|(?:on\s*facebook|in\s*facebook|from\s*facebook|facebook\s*e|facebook\s*te|facebook|\bfb\b)\s*|(?:ফেসবুকে?)\s*|(?:যাও|চলো|খোলো|ওপেন|সার্চ|ব্রাউজ|দেখাও|ঢোকো|করো)/gi,
    getSearchUrl: (q) => `https://www.facebook.com/search/top?q=${encodeURIComponent(q)}`,
    msg_bn: '🌐 <strong>সরাসরি Facebook ওপেন করা হচ্ছে!</strong><br>ব্রাউজারে নতুন ট্যাবে মেইন Facebook ওপেন হয়েছে। আপনি সেখান থেকে আপনার ফিড, গ্রুপ ও বন্ধুদের সাথে সহজে যুক্ত হতে পারবেন! ✨',
    msg_en: '🌐 <strong>Directing to Facebook Main Page!</strong><br>Facebook has opened in a new tab for you to browse feeds, groups, and connect with friends! ✨'
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    name_bn: 'হোয়াটসঅ্যাপ',
    icon: 'fa-brands fa-whatsapp',
    color: '#25d366',
    defaultUrl: 'https://web.whatsapp.com',
    regex: /(?:(?:go\s*to|goto|open|show|switch\s*to|launch|start|visit|chat|message)\s*(?:on\s*)?(?:whatsapp|whats\s*app|\bwa\b)|(?:whatsapp|whats\s*app)\s+(?:web|open|kholo|jao|chalu|chat|msg)|\bwa\s+(?:web|chat|msg|open)\b|^(?:whatsapp|whats\s*app|wa)$)|(?:হোয়াটসঅ্যাপ\s*(?:যাও|খোলো|ওপেন|মেসেজ|চ্যাট)|^(?:হোয়াটসঅ্যাপ|হোয়াটসঅ্যাপ|হোয়াটসএপ|হোয়াটস\s*অ্যাপ)$)/i,
    stripRegex: /(?:go\s*to|goto|open|show|switch\s*to|launch|start|chat|message|kholo|jao|chalu)\s*|(?:on\s*whatsapp|in\s*whatsapp|whatsapp|whats\s*app|\bwa\b)\s*|(?:হোয়াটসঅ্যাপে?|হোয়াটসঅ্যাপে?|হোয়াটসএপে?|হোয়াটস\s*অ্যাপে?)\s*|(?:যাও|চলো|খোলো|ওপেন|করো|দেখাও|ঢোকো)/gi,
    getSearchUrl: () => `https://web.whatsapp.com`,
    msg_bn: '💬 <strong>সরাসরি WhatsApp Web ওপেন করা হচ্ছে!</strong><br>ব্রাউজারে নতুন ট্যাবে WhatsApp Web ওপেন হয়েছে। আপনি সেখান থেকে সরাসরি চ্যাট ও মেসেজ করতে পারবেন! ✨',
    msg_en: '💬 <strong>Directing to WhatsApp Web!</strong><br>WhatsApp Web has opened in a new tab for you to chat and message freely! ✨'
  },
  {
    id: 'instagram',
    name: 'Instagram',
    name_bn: 'ইনস্টাগ্রাম',
    icon: 'fa-brands fa-instagram',
    color: '#e1306c',
    defaultUrl: 'https://www.instagram.com',
    regex: /(?:(?:go\s*to|goto|open|show|switch\s*to|launch|start|visit|browse)\s*(?:on\s*)?(?:instagram|insta|\big\b)|(?:instagram|insta)\s+(?:open|kholo|jao|chalu|reels|profile|explore|dekhao)|\big\s+(?:reels|profile|feed|open|kholo)\b|^(?:instagram|insta)$)|(?:ইনস্টাগ্রাম\s*(?:যাও|খোলো|ওপেন|রিলস|দেখাও)|^(?:ইনস্টাগ্রাম|ইন্সটাগ্রাম|ইনস্টা|ইন্সটা)$)/i,
    stripRegex: /(?:go\s*to|goto|open|show|switch\s*to|launch|start|visit|browse|search|find|kholo|jao|chalu)\s*|(?:on\s*instagram|in\s*instagram|instagram|insta|\big\b)\s*|(?:ইনস্টাগ্রামে?|ইন্সটাগ্রামে?|ইনস্টাতে?|ইন্সটাতে?)\s*|(?:যাও|চলো|খোলো|ওপেন|সার্চ|দেখাও|ঢোকো|করো)/gi,
    getSearchUrl: (q) => `https://www.instagram.com/explore/tags/${encodeURIComponent(q.replace(/\s+/g, ''))}/`,
    msg_bn: '📸 <strong>সরাসরি Instagram ওপেন করা হচ্ছে!</strong><br>ব্রাউজারে নতুন ট্যাবে Instagram ওপেন হয়েছে। আপনি সেখান থেকে ফটো, রিলস ও স্টোরিজ ব্রাউজ করতে পারবেন! ✨',
    msg_en: '📸 <strong>Directing to Instagram Main Page!</strong><br>Instagram has opened in a new tab for you to explore photos, reels, and stories! ✨'
  },
  {
    id: 'twitter',
    name: 'X (Twitter)',
    name_bn: 'এক্স (টুইটার)',
    icon: 'fa-brands fa-x-twitter',
    color: '#1da1f2',
    defaultUrl: 'https://x.com',
    regex: /(?:(?:go\s*to|goto|open|show|switch\s*to|launch|start|visit|browse)\s*(?:on\s*)?(?:twitter|x\.com|\btweet\b)|(?:twitter|x\.com)\s+(?:open|kholo|jao|chalu|feed|trends)|\b(?:twitter|x\.com)\b|^(?:twitter|tweet|x)$)|(?:টুইটার\s*(?:যাও|খোলো|ওপেন|দেখাও)|^(?:টুইটার|টুইট)$)/i,
    stripRegex: /(?:go\s*to|goto|open|show|switch\s*to|launch|start|visit|browse|search|find|kholo|jao|chalu)\s*|(?:on\s*twitter|in\s*twitter|twitter|x\.com|\btweet\b)\s*|(?:টুইটারে?|টুইটে?)\s*|(?:যাও|চলো|খোলো|ওপেন|সার্চ|দেখাও|ঢোকো|করো)/gi,
    getSearchUrl: (q) => `https://x.com/search?q=${encodeURIComponent(q)}`,
    msg_bn: '🐦 <strong>সরাসরি X (Twitter) ওপেন করা হচ্ছে!</strong><br>ব্রাউজারে নতুন ট্যাবে X (Twitter) ওপেন হয়েছে। আপনি সেখান থেকে লেটেস্ট ট্রেন্ডস, নিউজ ও টুইট দেখতে পারবেন! ✨',
    msg_en: '🐦 <strong>Directing to X (Twitter) Main Page!</strong><br>X (Twitter) has opened in a new tab for you to see latest trends and tweets! ✨'
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    name_bn: 'লিংকডইন',
    icon: 'fa-brands fa-linkedin',
    color: '#0a66c2',
    defaultUrl: 'https://www.linkedin.com',
    regex: /(?:(?:go\s*to|goto|open|show|switch\s*to|launch|start|visit|browse)\s*(?:on\s*)?(?:linkedin|linked\s*in)|(?:linkedin|linked\s*in)\s+(?:open|kholo|jao|chalu|jobs|network|feed|dekhao)|\b(?:linkedin|linked\s*in)\b|^(?:linkedin|linked\s*in)$)|(?:লিংকডইন\s*(?:যাও|খোলো|ওপেন|দেখাও)|লিঙ্কডইন\s*(?:যাও|খোলো|ওপেন|দেখাও)|^(?:লিংকডইন|লিঙ্কডইন)$)/i,
    stripRegex: /(?:go\s*to|goto|open|show|switch\s*to|launch|start|visit|browse|search|find|kholo|jao|chalu)\s*|(?:on\s*linkedin|in\s*linkedin|linkedin|linked\s*in)\s*|(?:লিঙ্কডইনে?|লিংকডইনে?)\s*|(?:যাও|চলো|খোলো|ওপেন|সার্চ|দেখাও|ঢোকো|করো)/gi,
    getSearchUrl: (q) => `https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(q)}`,
    msg_bn: '💼 <strong>সরাসরি LinkedIn ওপেন করা হচ্ছে!</strong><br>ব্রাউজারে নতুন ট্যাবে LinkedIn ওপেন হয়েছে। আপনি সেখান থেকে প্রফেশনাল নেটওয়ার্ক, ক্যারিয়ার ও জবস ব্রাউজ করতে পারবেন! ✨',
    msg_en: '💼 <strong>Directing to LinkedIn Main Page!</strong><br>LinkedIn has opened in a new tab for you to connect and explore careers! ✨'
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    name_bn: 'টিকটক',
    icon: 'fa-brands fa-tiktok',
    color: '#fe2c55',
    defaultUrl: 'https://www.tiktok.com',
    regex: /(?:(?:go\s*to|goto|open|show|switch\s*to|launch|start|visit|browse)\s*(?:on\s*)?(?:tiktok|tik\s*tok)|(?:tiktok|tik\s*tok)\s+(?:open|kholo|jao|chalu|video|feed|dekhao)|^(?:tiktok|tik\s*tok)$)|(?:টিকটক\s*(?:যাও|খোলো|ওপেন|ভিডিও|চালাও|দেখাও)|^(?:টিকটক)$)/i,
    stripRegex: /(?:go\s*to|goto|open|show|switch\s*to|launch|start|visit|browse|search|find|kholo|jao|chalu)\s*|(?:on\s*tiktok|in\s*tiktok|tiktok|tik\s*tok)\s*|(?:টিকটকে?)\s*|(?:যাও|চলো|খোলো|ওপেন|সার্চ|দেখাও|ঢোকো|করো|চালাও)/gi,
    getSearchUrl: (q) => `https://www.tiktok.com/search?q=${encodeURIComponent(q)}`,
    msg_bn: '🎵 <strong>সরাসরি TikTok ওপেন করা হচ্ছে!</strong><br>ব্রাউজারে নতুন ট্যাবে TikTok ওপেন হয়েছে। আপনি সেখান থেকে ট্রেন্ডিং শর্ট ভিডিও ব্রাউজ করতে পারবেন! ✨',
    msg_en: '🎵 <strong>Directing to TikTok Main Page!</strong><br>TikTok has opened in a new tab for you to watch viral short videos! ✨'
  },
  {
    id: 'github',
    name: 'GitHub',
    name_bn: 'গিটহাব',
    icon: 'fa-brands fa-github',
    color: '#a371f7',
    defaultUrl: 'https://github.com',
    regex: /(?:(?:go\s*to|goto|open|show|switch\s*to|launch|start|visit|browse)\s*(?:on\s*)?(?:github|git\s*hub)|(?:github|git\s*hub)\s+(?:open|kholo|jao|chalu|repo|code|dekhao)|^(?:github|git\s*hub)$)|(?:গিটহাব\s*(?:যাও|খোলো|ওপেন|দেখাও)|^(?:গিটহাব)$)/i,
    stripRegex: /(?:go\s*to|goto|open|show|switch\s*to|launch|start|visit|browse|search|find|kholo|jao|chalu)\s*|(?:on\s*github|in\s*github|github|git\s*hub)\s*|(?:গিটহাবে?)\s*|(?:যাও|চলো|খোলো|ওপেন|সার্চ|দেখাও|ঢোকো|করো)/gi,
    getSearchUrl: (q) => `https://github.com/search?q=${encodeURIComponent(q)}`,
    msg_bn: '💻 <strong>সরাসরি GitHub ওপেন করা হচ্ছে!</strong><br>ব্রাউজারে নতুন ট্যাবে GitHub ওপেন হয়েছে। আপনি সেখান থেকে ওপেন-সোর্স কোড ও রিপোজিটরি ব্রাউজ করতে পারবেন! ✨',
    msg_en: '💻 <strong>Directing to GitHub Main Page!</strong><br>GitHub has opened in a new tab for you to explore code and repositories! ✨'
  },
  {
    id: 'telegram',
    name: 'Telegram',
    name_bn: 'টেলিগ্রাম',
    icon: 'fa-brands fa-telegram',
    color: '#229ed9',
    defaultUrl: 'https://web.telegram.org',
    regex: /(?:(?:go\s*to|goto|open|show|switch\s*to|launch|start|visit|browse)\s*(?:on\s*)?(?:telegram|\btg\b)|(?:telegram)\s+(?:open|kholo|jao|chalu|web|channel|dekhao)|\btg\s+(?:web|channel|chat|open)\b|^(?:telegram|tg)$)|(?:টেলিগ্রাম\s*(?:যাও|খোলো|ওপেন|দেখাও)|^(?:টেলিগ্রাম)$)/i,
    stripRegex: /(?:go\s*to|goto|open|show|switch\s*to|launch|start|visit|browse|search|find|kholo|jao|chalu)\s*|(?:on\s*telegram|in\s*telegram|telegram|\btg\b)\s*|(?:টেলিগ্রামে?)\s*|(?:যাও|চলো|খোলো|ওপেন|সার্চ|দেখাও|ঢোকো|করো)/gi,
    getSearchUrl: () => `https://web.telegram.org`,
    msg_bn: '✈️ <strong>সরাসরি Telegram Web ওপেন করা হচ্ছে!</strong><br>ব্রাউজারে নতুন ট্যাবে Telegram Web ওপেন হয়েছে। আপনি সেখান থেকে চ্যানেল ও মেসেজে যুক্ত হতে পারবেন! ✨',
    msg_en: '✈️ <strong>Directing to Telegram Web!</strong><br>Telegram Web has opened in a new tab for you to access channels and chats! ✨'
  }
];

// ==========================================================================
// POPULAR WEBSITES REGISTRY & DIRECT NAVIGATION MAP
// ==========================================================================
const POPULAR_WEBSITES = [
  {
    id: 'lutfor_portfolio',
    keys: ['lutfor-portfolio.vercel.app', 'lutfor-portfolio', 'lutfor portfolio', 'lutfor website', 'লুৎফর পোর্টফোলিও', 'আমার পোর্টফোলিও', 'আমার ওয়েবসাইট', 'my portfolio', 'my website'],
    name: 'Lutfor Rahman Portfolio',
    name_bn: 'লুৎফর রহমান পোর্টফোলিও',
    url: 'https://lutfor-portfolio.vercel.app',
    icon: 'fa-solid fa-user-tie',
    category: 'Portfolio'
  },
  {
    id: 'getintopc',
    keys: ['get into pc', 'get to pc', 'getintopc', 'getin to pc', 'get-to-pc', 'gettopc', 'get 2 pc', 'get2pc', 'গেটনপিসি', 'গেট ইনটু পিসি', 'গেট টু পিসি'],
    name: 'Get Into PC',
    name_bn: 'গেট ইনটু পিসি (সফটওয়্যার ডাউনলোড)',
    url: 'https://getintopc.com',
    icon: 'fa-solid fa-download',
    category: 'Software & Tools'
  },
  {
    id: 'hackathon',
    keys: ['hackathon', 'hackathons', 'hackathon website', 'হ্যাকথন', 'হ্যাকাথন'],
    name: 'Hackathons (Devpost)',
    name_bn: 'হ্যাকথন পোর্টাল (Devpost)',
    url: 'https://devpost.com/hackathons',
    icon: 'fa-solid fa-code-fork',
    category: 'Competitions & Coding'
  },
  {
    id: 'hackerone',
    keys: ['hackerone.com', 'hackerone', 'হ্যাকারওয়ান'],
    name: 'HackerOne',
    name_bn: 'হ্যাকারওয়ান',
    url: 'https://www.hackerone.com',
    icon: 'fa-solid fa-bug',
    category: 'Bug Bounty'
  },
  {
    id: 'mlh',
    keys: ['mlh', 'major league hacking'],
    name: 'Major League Hacking (MLH)',
    name_bn: 'মেজর লীগ হ্যাকিং (MLH)',
    url: 'https://mlh.io',
    icon: 'fa-solid fa-laptop-code',
    category: 'Hackathons'
  },
  {
    id: 'ostad',
    keys: ['ostad app', 'ostad.app', 'ostad', 'ওস্তাদ'],
    name: 'Ostad',
    name_bn: 'ওস্তাদ (লাইভ লার্নিং)',
    url: 'https://ostad.app',
    icon: 'fa-solid fa-graduation-cap',
    category: 'Live Learning'
  },
  {
    id: 'w3schools',
    keys: ['w3schools', 'w3school', 'ডব্লিউ থ্রি স্কুল', 'ডব্লিউ৩ স্কুল'],
    name: 'W3Schools',
    name_bn: 'ডব্লিউ৩ স্কুলস',
    url: 'https://www.w3schools.com',
    icon: 'fa-solid fa-code',
    category: 'Web Tutorials'
  },
  {
    id: 'stackoverflow',
    keys: ['stackoverflow', 'stack overflow', 'স্ট্যাক ওভারফ্লো'],
    name: 'Stack Overflow',
    name_bn: 'স্ট্যাক ওভারফ্লো',
    url: 'https://stackoverflow.com',
    icon: 'fa-brands fa-stack-overflow',
    category: 'Developer Community'
  },
  {
    id: 'tryhackme',
    keys: ['tryhackme', 'thm', 'ট্রাইহ্যাকমি'],
    name: 'TryHackMe',
    name_bn: 'ট্রাইহ্যাকমি',
    url: 'https://tryhackme.com',
    icon: 'fa-solid fa-shield-halved',
    category: 'Cybersecurity'
  },
  {
    id: 'hackthebox',
    keys: ['hackthebox', 'htb', 'হ্যাক দ্য বক্স'],
    name: 'Hack The Box',
    name_bn: 'হ্যাক দ্য বক্স',
    url: 'https://www.hackthebox.com',
    icon: 'fa-solid fa-cube',
    category: 'Cybersecurity'
  },
  {
    id: 'kaggle',
    keys: ['kaggle', 'ক্যাগল'],
    name: 'Kaggle',
    name_bn: 'ক্যাগল',
    url: 'https://www.kaggle.com',
    icon: 'fa-solid fa-chart-line',
    category: 'Data Science & AI'
  },
  {
    id: 'leetcode',
    keys: ['leetcode', 'লিটকোর্ড'],
    name: 'LeetCode',
    name_bn: 'লিটকোর্ড',
    url: 'https://leetcode.com',
    icon: 'fa-solid fa-terminal',
    category: 'Competitive Coding'
  },
  {
    id: 'hackerrank',
    keys: ['hackerrank', 'হ্যাকারর‌্যাঙ্ক'],
    name: 'HackerRank',
    name_bn: 'হ্যাকারর‌্যাঙ্ক',
    url: 'https://www.hackerrank.com',
    icon: 'fa-solid fa-code',
    category: 'Coding Practice'
  },
  {
    id: 'coursera',
    keys: ['coursera', 'কোর্সসেরা'],
    name: 'Coursera',
    name_bn: 'কোর্সসেরা',
    url: 'https://www.coursera.org',
    icon: 'fa-solid fa-book-open-reader',
    category: 'Online Courses'
  },
  {
    id: 'udemy',
    keys: ['udemy', 'উডেমি'],
    name: 'Udemy',
    name_bn: 'উডেমি',
    url: 'https://www.udemy.com',
    icon: 'fa-solid fa-chalkboard-user',
    category: 'Online Courses'
  },
  {
    id: 'canva',
    keys: ['canva', 'ক্যানভা'],
    name: 'Canva',
    name_bn: 'ক্যানভা',
    url: 'https://www.canva.com',
    icon: 'fa-solid fa-palette',
    category: 'Graphic Design'
  },
  {
    id: 'daraz',
    keys: ['daraz', 'দারাজ'],
    name: 'Daraz Bangladesh',
    name_bn: 'দারাজ বাংলাদেশ',
    url: 'https://www.daraz.com.bd',
    icon: 'fa-solid fa-cart-shopping',
    category: 'E-Commerce'
  },
  {
    id: 'chaldal',
    keys: ['chaldal', 'চালডাল'],
    name: 'Chaldal',
    name_bn: 'চালডাল',
    url: 'https://chaldal.com',
    icon: 'fa-solid fa-basket-shopping',
    category: 'Grocery'
  },
  {
    id: 'rokomari',
    keys: ['rokomari', 'রকমারি'],
    name: 'Rokomari',
    name_bn: 'রকমারি',
    url: 'https://www.rokomari.com',
    icon: 'fa-solid fa-book',
    category: 'Bookstore'
  },
  {
    id: 'chatgpt',
    keys: ['chatgpt', 'openai', 'চ্যাটজিপিটি'],
    name: 'ChatGPT',
    name_bn: 'চ্যাটজিপিটি',
    url: 'https://chatgpt.com',
    icon: 'fa-solid fa-robot',
    category: 'AI Assistant'
  },
  {
    id: 'gemini',
    keys: ['google gemini', 'gemini ai', 'gemini', 'গুগল জেমিনি'],
    name: 'Google Gemini',
    name_bn: 'গুগল জেমিনি',
    url: 'https://gemini.google.com',
    icon: 'fa-solid fa-brain',
    category: 'AI Assistant'
  },
  {
    id: 'claude',
    keys: ['claude ai', 'claude', 'ক্লড'],
    name: 'Claude AI',
    name_bn: 'ক্লড এআই',
    url: 'https://claude.ai',
    icon: 'fa-solid fa-sparkles',
    category: 'AI Assistant'
  },
  {
    id: 'wikipedia',
    keys: ['wikipedia', 'উইকিপিডিয়া'],
    name: 'Wikipedia',
    name_bn: 'উইকিপিডিয়া',
    url: 'https://www.wikipedia.org',
    icon: 'fa-brands fa-wikipedia-w',
    category: 'Encyclopedia'
  },
  {
    id: 'google',
    keys: ['google search', 'google', 'গুগল'],
    name: 'Google',
    name_bn: 'গুগল সার্চ',
    url: 'https://www.google.com',
    icon: 'fa-brands fa-google',
    category: 'Search Engine'
  },
  {
    id: 'freecodecamp',
    keys: ['freecodecamp', 'ফ্রিকোডক্যাম্প'],
    name: 'freeCodeCamp',
    name_bn: 'ফ্রিকোডক্যাম্প',
    url: 'https://www.freecodecamp.org',
    icon: 'fa-brands fa-free-code-camp',
    category: 'Coding Education'
  },
  {
    id: 'geeksforgeeks',
    keys: ['geeksforgeeks', 'gfg', 'গীকসফরগীকস'],
    name: 'GeeksforGeeks',
    name_bn: 'গীকসফরগীকস',
    url: 'https://www.geeksforgeeks.org',
    icon: 'fa-solid fa-code',
    category: 'Computer Science'
  },
  {
    id: 'bdjobs',
    keys: ['bdjobs', 'বিডিজবস'],
    name: 'Bdjobs',
    name_bn: 'বিডিজবস',
    url: 'https://www.bdjobs.com',
    icon: 'fa-solid fa-briefcase',
    category: 'Jobs Portal'
  },
  {
    id: 'prothomalo',
    keys: ['prothom alo', 'prothomalo', 'প্রথম আলো'],
    name: 'Prothom Alo',
    name_bn: 'প্রথম আলো',
    url: 'https://www.prothomalo.com',
    icon: 'fa-solid fa-newspaper',
    category: 'News Portal'
  },
  {
    id: 'dailystar',
    keys: ['the daily star', 'daily star', 'ডেইলি স্টার'],
    name: 'The Daily Star',
    name_bn: 'দ্য ডেইলি স্টার',
    url: 'https://www.thedailystar.net',
    icon: 'fa-solid fa-newspaper',
    category: 'News Portal'
  },
  {
    id: 'cricbuzz',
    keys: ['cricbuzz', 'ক্রিকবাজ'],
    name: 'Cricbuzz',
    name_bn: 'ক্রিকবাজ',
    url: 'https://www.cricbuzz.com',
    icon: 'fa-solid fa-baseball-bat-ball',
    category: 'Cricket Live Scores'
  }
];

function detectWebsiteNavigation(userText) {
  if (!userText || typeof userText !== 'string') return null;
  const raw = userText.trim();
  if (raw.length < 2) return null;

  // 1. Direct Full URL detection (e.g. "go to https://lutfor-portfolio.vercel.app/", 'open "https://example.com/path"')
  const fullUrlMatch = raw.match(/(https?:\/\/[^\s"'>]+)/i);
  if (fullUrlMatch) {
    let targetUrl = fullUrlMatch[1].replace(/["'\)\],;.]+$/, '');
    try {
      const parsed = new URL(targetUrl);
      const display = parsed.hostname + (parsed.pathname && parsed.pathname !== '/' ? parsed.pathname : '');
      return {
        id: parsed.hostname.replace(/[^a-z0-9]/gi, '_'),
        name: display,
        name_bn: display,
        targetUrl: targetUrl,
        icon: 'fa-solid fa-globe',
        category: 'Web Portal',
        isPopular: false
      };
    } catch(e) {
      return {
        id: 'direct_url',
        name: targetUrl,
        name_bn: targetUrl,
        targetUrl: targetUrl,
        icon: 'fa-solid fa-globe',
        category: 'Web Portal',
        isPopular: false
      };
    }
  }

  // 2. Subdomain & Domain detection (e.g. lutfor-portfolio.vercel.app, hackerone.com, sub.domain.com/path)
  const domainMatch = raw.match(/(?:^|\s|"|'|\[|\()([a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)*(?:\.(?:com|app|org|net|io|dev|ai|edu|gov|bd|co|in|tech|me|xyz|info|tv|cloud|live|store|online|site|pro))(?:\/[^\s"'>]*)?)/i);
  if (domainMatch) {
    const rawDomain = domainMatch[1].replace(/["'\)\],;.]+$/, '');
    const targetUrl = 'https://' + rawDomain;
    try {
      const parsed = new URL(targetUrl);
      const display = parsed.hostname + (parsed.pathname && parsed.pathname !== '/' ? parsed.pathname : '');
      return {
        id: parsed.hostname.replace(/[^a-z0-9]/gi, '_'),
        name: display,
        name_bn: display,
        targetUrl: targetUrl,
        icon: 'fa-solid fa-globe',
        category: 'Web Portal',
        isPopular: false
      };
    } catch(e) {
      return {
        id: rawDomain.replace(/[^a-z0-9]/gi, '_'),
        name: rawDomain,
        name_bn: rawDomain,
        targetUrl: targetUrl,
        icon: 'fa-solid fa-globe',
        category: 'Web Portal',
        isPopular: false
      };
    }
  }

  const clean = raw.toLowerCase().replace(/[?!,;:()]/g, ' ').replace(/\s+/g, ' ').trim();

  // If this is an informational query, question, or advice request, do not intercept with site navigation
  if (typeof isInformationalOrQuestionQuery === 'function' && isInformationalOrQuestionQuery(raw)) {
    return null;
  }

  // Pre-clean noise prefixes like "open my website", "open website", "visit the website", "i want to go to", etc.
  const strippedClean = clean
    .replace(/^(?:open\s+(?:my\s+|the\s+)?(?:website|web|site)?|visit\s+(?:the\s+)?(?:website|web|site)?|go\s*to\s+(?:the\s+)?(?:website|web|site)?|goto\s+(?:the\s+)?(?:website|web|site)?|i\s*want\s*to\s*go\s*(?:to)?\s*(?:the\s*)?(?:website|web|site)?|browse\s+(?:the\s+)?(?:website|web|site)?)\s+/i, '')
    .trim();

  // 3. Direct Popular Site matching (check strippedClean first if available, then full clean)
  if (strippedClean && strippedClean.length >= 2) {
    for (const site of POPULAR_WEBSITES) {
      for (const key of site.keys) {
        if (strippedClean === key || strippedClean.includes(key)) {
          return {
            id: site.id,
            name: site.name,
            name_bn: site.name_bn,
            targetUrl: site.url,
            icon: site.icon,
            category: site.category,
            isPopular: true
          };
        }
      }
    }
  }

  for (const site of POPULAR_WEBSITES) {
    for (const key of site.keys) {
      if (clean === key || clean.includes(key)) {
        return {
          id: site.id,
          name: site.name,
          name_bn: site.name_bn,
          targetUrl: site.url,
          icon: site.icon,
          category: site.category,
          isPopular: true
        };
      }
    }
  }

  // 4. Navigation Intent Patterns
  const navPatterns = [
    /(?:i\s*want\s*to\s*(?:go(?:\s*to)?|visit|run|open)|take\s*me\s*to|can\s*you\s*(?:go\s*to|open|visit)|go\s*to|goto|open|visit|launch|browse|run|kholo|jao|cholo|dhoko|dekhao|যাও|খোলো|ওপেন|দেখাও|ঢোকো)\s*(?:the\s*)?(?:website|web|site|ওয়েবসাইট|ওয়েবসাইটে?|ওয়েবসাইটে?|সাইটে?|পেজ)?\s*(?:of\s*|for\s*|to\s*)?([a-z0-9\u0980-\u09FF\s-]+?)(?:\s*(?:website|site|ওয়েবসাইট|ওয়েবসাইটে?|ওয়েবসাইটে?|সাইটে?|web|e\s*jao|kholo|open|visit|যাও|খোলো))?$/i,
    /([a-z0-9\u0980-\u09FF\s-]+?)\s*(?:website|site|ওয়েবসাইট|ওয়েবসাইটে?|ওয়েবসাইটে?|সাইটে?)(?:\s*(?:e\s*jao|e|te|kholo|open|visit|run|chalao|যাও|খোলো|ওপেন|চালাও))?$/i
  ];

  for (const pat of navPatterns) {
    const match = clean.match(pat);
    if (match && match[1]) {
      let candidate = match[1].trim();
      candidate = candidate.replace(/^(?:the|a|an|to|for|in|on)\s+/i, '').trim();
      candidate = candidate.replace(/\s+(?:please|bhai|now|quick|fast)$/i, '').trim();
      const ignoredTokens = ['it', 'this', 'that', 'there', 'home', 'page', 'site', 'website', 'ওয়েবসাইট', 'সাইট'];
      if (candidate.length >= 2 && !ignoredTokens.includes(candidate)) {
        for (const site of POPULAR_WEBSITES) {
          for (const key of site.keys) {
            if (candidate === key || candidate.includes(key)) {
              return {
                id: site.id,
                name: site.name,
                name_bn: site.name_bn,
                targetUrl: site.url,
                icon: site.icon,
                category: site.category,
                isPopular: true
              };
            }
          }
        }
        return {
          id: 'custom_search',
          name: candidate,
          name_bn: candidate,
          targetUrl: 'https://www.google.com/search?q=' + encodeURIComponent(candidate + ' official website'),
          icon: 'fa-solid fa-arrow-up-right-from-square',
          category: 'Web Search',
          isPopular: false
        };
      }
    }
  }

  return null;
}
window.detectWebsiteNavigation = detectWebsiteNavigation;

function formatWebsiteLaunchResponse(siteMatch, isBengali) {
  const { name, name_bn, targetUrl, icon } = siteMatch;
  const displayName = isBengali ? (name_bn || name) : name;
  const btnText = isBengali ? `🚀 ${displayName}-এ সরাসরি যান ↗` : `🚀 Open ${displayName} ↗`;
  let domainText = targetUrl;
  try {
    domainText = new URL(targetUrl).hostname;
  } catch(e) {}

  const msg = isBengali
    ? `🌐 <strong>সরাসরি ${escapeHtml(displayName)} ওপেন করা হচ্ছে!</strong><br>ব্রাউজারে নতুন ট্যাবে ওয়েবসাইটটি চালু হয়েছে। আপনি সেখান থেকে সরাসরি ব্রাউজ ও ভিজিট করতে পারবেন! ✨`
    : `🌐 <strong>Directing to ${escapeHtml(displayName)}!</strong><br>The website (${escapeHtml(domainText)}) has opened in a new tab for you to browse freely! ✨`;

  return `${msg}<br><br><a href="${targetUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-sm" style="background:linear-gradient(135deg, #00f2fe 0%, #4facfe 100%);color:#07101e;border-radius:20px;padding:7px 18px;text-decoration:none;display:inline-flex;align-items:center;gap:8px;font-weight:700;box-shadow:0 4px 15px rgba(0,242,254,0.35);letter-spacing:0.3px;"><i class="${icon || 'fa-solid fa-globe'}"></i> ${btnText}</a>`;
}
window.formatWebsiteLaunchResponse = formatWebsiteLaunchResponse;

function detectSocialPlatform(userText) {
  if (!userText || typeof userText !== 'string') return null;
  if (typeof isInformationalOrQuestionQuery === 'function' && isInformationalOrQuestionQuery(userText)) {
    return null;
  }
  const clean = userText.toLowerCase().replace(/[?!.,;:()]/g, ' ').trim();
  for (const plat of SOCIAL_PLATFORMS) {
    if (plat.regex.test(clean)) {
      let customQuery = '';
      if (plat.id === 'youtube') {
        if (clean.includes('hindi') || clean.includes('হিন্দি')) {
          customQuery = 'Hindi Top Hit Songs';
        } else if (clean.includes('bangla') || clean.includes('বাংলা') || clean.includes('bengali')) {
          customQuery = 'Bangla Popular Hit Songs';
        } else if (clean.includes('arijit') || clean.includes('অরিজিৎ')) {
          customQuery = 'Arijit Singh Best Songs';
        } else if (clean.includes('kesariya') || clean.includes('brahmastra')) {
          customQuery = 'Kesariya Arijit Singh';
        } else if (clean.includes('pasoori')) {
          customQuery = 'Pasoori Ali Sethi';
        } else if (clean.includes('despacito')) {
          customQuery = 'Despacito Luis Fonsi';
        } else if (clean.includes('lofi') || clean.includes('chill')) {
          customQuery = 'Lofi Hip Hop Chill Beats Live';
        }
      }
      if (!customQuery && plat.stripRegex) {
        let extracted = clean.replace(plat.stripRegex, '').trim();
        const stopWords = [
          'main', 'page', 'pages', 'site', 'open', 'kholo', 'jao', 'chalu', 'feed', 'web', 'login', 'chat', 'search',
          'song', 'songs', 'video', 'videos',
          'যাও', 'চলো', 'খোলো', 'ওপেন', 'দেখাও', 'চালাও', 'ঢোকো', 'করো', 'পেজ', 'মেইন', 'সাইট', 'ভিডিও', 'গান', 'লগইন'
        ];
        if (extracted && extracted.length > 2 && !stopWords.includes(extracted.toLowerCase())) {
          customQuery = extracted;
        }
      }
      const targetUrl = customQuery && typeof plat.getSearchUrl === 'function'
        ? plat.getSearchUrl(customQuery)
        : plat.defaultUrl;
      return { platform: plat, query: customQuery, targetUrl };
    }
  }
  return null;
}
window.detectSocialPlatform = detectSocialPlatform;

function launchSocialDirectly(targetUrl) {
  if (!targetUrl) return;
  try {
    window.open(targetUrl, '_blank');
  } catch (e) {
    console.log('Direct launch error:', e);
  }
}
window.launchSocialDirectly = launchSocialDirectly;

function launchYouTubeDirectly(targetUrl) {
  launchSocialDirectly(targetUrl || 'https://www.youtube.com');
}
window.launchYouTubeDirectly = launchYouTubeDirectly;

function launchFacebookDirectly(targetUrl) {
  launchSocialDirectly(targetUrl || 'https://www.facebook.com');
}
window.launchFacebookDirectly = launchFacebookDirectly;

// ==========================================================================
// UNIFIED GLOBAL MEDIA & AUDIO COORDINATOR
// Ensures MP3 Player, YouTube Streams/Cards, Demo Video, and AI Voice TTS
// NEVER play over each other simultaneously.
// ==========================================================================
const MediaCoordinator = {
  activeSource: null,

  pauseAllExcept(type) {
    this.activeSource = type;

    // 1. Pause Local MP3 audio player
    if (type !== 'mp3') {
      if (window.NeuralAudioEngine && typeof window.NeuralAudioEngine.pause === 'function') {
        window.NeuralAudioEngine.pause();
      }
    }

    // 2. Pause YouTube (Modal & Chat cards)
    if (type !== 'youtube') {
      this.pauseAllYoutube();
    }

    // 3. Pause Demo Video Player
    if (type !== 'video') {
      const heroVideo = document.getElementById('heroMainVideo');
      if (heroVideo && !heroVideo.paused) {
        heroVideo.pause();
      }
    }

    // 4. Stop Voice Speech Synthesis & Bengali Audio Streams
    if (type !== 'tts') {
      if (typeof window.globalStopAllSpeech === 'function') {
        window.globalStopAllSpeech();
      }
    }
  },

  pauseAllYoutube() {
    // Stage YouTube Iframe
    const stageYtIframe = document.getElementById('stageYtIframe');
    if (stageYtIframe && stageYtIframe.contentWindow) {
      try {
        stageYtIframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
      } catch (e) {}
    }

    // Studio Modal Iframe
    const ytStudioIframe = document.getElementById('ytMainIframe');
    if (ytStudioIframe && ytStudioIframe.contentWindow) {
      try {
        ytStudioIframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
      } catch (e) {}
    }

    // Chat YouTube Iframes
    document.querySelectorAll('.chat-youtube-card iframe').forEach((iframe) => {
      if (iframe && iframe.contentWindow) {
        try {
          iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
        } catch (e) {}
      }
    });
  },

  pauseAll() {
    this.pauseAllExcept('none');
  }
};
window.MediaCoordinator = MediaCoordinator;

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Neural Network Background Particle Canvas
  initBackgroundCanvas();

  // 2. Navigation & Scroll Effects
  initNavigation();

  // 3. Custom Video Player Controller
  initVideoController();

  // 4. Voice & Text AI Intelligence Engine
  initVoiceAndChatEngine();

  // 5. Gallery Filter & Lightbox Modal
  initGallery();

  // 6. Neural Knowledge Store & Dynamic Memory Modal
  initKnowledgeStoreModal();

  // 7. Neural MP3 Music Studio & Audio Player Engine
  initNeuralMusicStudio();

  // 8. User Auth & Site Login Profile Controller
  initUserAuthSystem();

  // 9. AI Brain & Gemini Engine Settings Modal
  initAiBrainModal();
});

/* ==========================================================================
   1. NEURAL PARTICLE CANVAS
   ========================================================================== */
function initBackgroundCanvas() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particles = [];
  const particleCount = Math.min(Math.floor(window.innerWidth / 22), 60);
  const maxDistance = 140;

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.7;
      this.vy = (Math.random() - 0.5) * 0.7;
      this.radius = Math.random() * 2 + 1;
      this.alpha = Math.random() * 0.6 + 0.2;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 242, 254, ${this.alpha})`;
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#00f2fe';
      ctx.fill();
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDistance) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          const opacity = (1 - dist / maxDistance) * 0.25;
          ctx.strokeStyle = `rgba(79, 172, 254, ${opacity})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    particles.forEach((p) => {
      p.update();
      p.draw();
    });

    requestAnimationFrame(animate);
  }

  animate();
}

/* ==========================================================================
   2. NAVIGATION & SCROLL HIGHLIGHTING
   ========================================================================== */
function initNavigation() {
  const navbar = document.getElementById('navbar');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const navLinks = document.getElementById('navLinks');
  const links = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    let current = '';
    const scrollPosition = window.pageYOffset + 200;

    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    links.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });

  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      const icon = mobileMenuBtn.querySelector('i');
      if (navLinks.classList.contains('active')) {
        icon.classList.replace('fa-bars-staggered', 'fa-xmark');
      } else {
        icon.classList.replace('fa-xmark', 'fa-bars-staggered');
      }
    });

    links.forEach((link) => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        const icon = mobileMenuBtn.querySelector('i');
        icon?.classList.replace('fa-xmark', 'fa-bars-staggered');
      });
    });
  }
}

/* ==========================================================================
   3. STAGE CONTROLLER (NEURAL AVATAR & VIDEO SWITCHER)
   ========================================================================== */
function initVideoController() {
  const videoContainer = document.getElementById('videoContainer');
  const video = document.getElementById('heroMainVideo');
  const playOverlay = document.getElementById('videoPlayOverlay');
  const customPlayBtn = document.getElementById('customPlayBtn');
  const replayBtn = document.getElementById('videoReplayBtn');

  // Stage Switcher Tabs
  const tabAvatarBtn = document.getElementById('tabAvatarBtn');
  const tabVideoBtn = document.getElementById('tabVideoBtn');
  const tabYoutubeBtn = document.getElementById('tabYoutubeBtn');
  const avatarStageView = document.getElementById('avatarStageView');
  const stageYoutubeView = document.getElementById('stageYoutubeView');
  const avatarRepeatBtn = document.getElementById('avatarRepeatBtn');
  const stageFooterTitle = document.getElementById('stageFooterTitle');
  const stageFooterSubtitle = document.getElementById('stageFooterSubtitle');
  const avatarStatusPill = document.getElementById('avatarStatusPill');
  const avatarStatusLabel = document.getElementById('avatarStatusLabel');

  // Stage YouTube Player Elements
  const stageYtInput = document.getElementById('stageYtInput');
  const stageYtPlayBtn = document.getElementById('stageYtPlayBtn');
  const stageYtBrowseBtn = document.getElementById('stageYtBrowseBtn');
  const stageYtBackAvatarBtn = document.getElementById('stageYtBackAvatarBtn');
  const stageYtIframe = document.getElementById('stageYtIframe');
  const stageYtCurrentTitle = document.getElementById('stageYtCurrentTitle');
  const stageYtEngineStatus = document.getElementById('stageYtEngineStatus');
  const stageYtChipsRow = document.getElementById('stageYtChipsRow');

  function loadStageYoutubeVideo(queryOrId, customTitle = null) {
    if (!stageYtIframe) return;
    const raw = (queryOrId || '').trim();
    if (!raw) return;

    // Check if direct YouTube video link / URL
    const ytMatch = raw.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
    if (ytMatch && ytMatch[1]) {
      const vidId = ytMatch[1];
      stageYtIframe.src = `https://www.youtube-nocookie.com/embed/${vidId}?autoplay=1&enablejsapi=1`;
      if (stageYtCurrentTitle) {
        stageYtCurrentTitle.innerHTML = `<i class="fa-solid fa-play gradient-text"></i> ${customTitle || 'Direct Video Stream'}`;
      }
      if (stageYtEngineStatus) {
        stageYtEngineStatus.textContent = 'DIRECT STREAM';
      }
      return;
    }

    // Check if exact 11-char alphanumeric YouTube video ID
    if (/^[a-zA-Z0-9_-]{11}$/.test(raw) && !raw.includes(' ')) {
      stageYtIframe.src = `https://www.youtube-nocookie.com/embed/${raw}?autoplay=1&enablejsapi=1`;
      if (stageYtCurrentTitle) {
        stageYtCurrentTitle.innerHTML = `<i class="fa-solid fa-play gradient-text"></i> ${customTitle || 'YouTube Stream'}`;
      }
      if (stageYtEngineStatus) {
        stageYtEngineStatus.textContent = 'DIRECT STREAM';
      }
      return;
    }

    // REAL YOUTUBE SEARCH ENGINE:
    // Uses YouTube's official search embed mechanism listType=search&list=QUERY
    const encodedQuery = encodeURIComponent(raw);
    stageYtIframe.src = `https://www.youtube-nocookie.com/embed?listType=search&list=${encodedQuery}&autoplay=1&enablejsapi=1`;
    
    if (stageYtCurrentTitle) {
      stageYtCurrentTitle.innerHTML = `<i class="fa-brands fa-youtube gradient-red-text"></i> YouTube: <span>"${customTitle || raw}"</span>`;
    }
    if (stageYtEngineStatus) {
      stageYtEngineStatus.textContent = 'YT SEARCH ENGINE ACTIVE';
    }

    // Dynamically append new search chip if unique
    if (stageYtChipsRow && raw.length > 2) {
      const existingChips = Array.from(stageYtChipsRow.querySelectorAll('.stage-yt-chip'));
      const exists = existingChips.some(c => (c.getAttribute('data-yt-search') || '').toLowerCase() === raw.toLowerCase());
      if (!exists && existingChips.length < 15) {
        const newChip = document.createElement('button');
        newChip.className = 'stage-yt-chip';
        newChip.setAttribute('data-yt-search', raw);
        newChip.innerHTML = `<i class="fa-solid fa-magnifying-glass"></i> ${raw.slice(0, 20)}`;
        newChip.addEventListener('click', () => {
          loadStageYoutubeVideo(raw, raw);
        });
        stageYtChipsRow.prepend(newChip);
      }
    }
  }
  window.loadStageYoutubeVideo = loadStageYoutubeVideo;

  function switchToAvatar() {
    const savedScrollY = window.pageYOffset || (document.documentElement && document.documentElement.scrollTop) || window.scrollY || 0;

    if (tabAvatarBtn) tabAvatarBtn.classList.add('active');
    if (tabVideoBtn) tabVideoBtn.classList.remove('active');
    if (tabYoutubeBtn) tabYoutubeBtn.classList.remove('active');

    if (avatarStageView) avatarStageView.style.display = 'flex';
    if (videoContainer) videoContainer.style.display = 'none';
    if (stageYoutubeView) stageYoutubeView.style.display = 'none';

    if (avatarRepeatBtn) avatarRepeatBtn.style.display = 'inline-flex';
    if (replayBtn) replayBtn.style.display = 'none';

    if (stageFooterTitle) {
      stageFooterTitle.innerHTML = '<i class="fa-solid fa-brain"></i> Neural Avatar Active';
    }
    if (stageFooterSubtitle) {
      stageFooterSubtitle.textContent = 'Lip-Sync & Real-Time Voice Intelligence';
    }

    if (avatarStatusPill) {
      avatarStatusPill.className = 'avatar-status-pill';
      if (avatarStatusLabel) avatarStatusLabel.textContent = 'AI Online';
    }

    if (video && typeof video.pause === 'function' && !video.paused) {
      video.pause();
    }

    if (Math.abs((window.pageYOffset || 0) - savedScrollY) > 1) {
      window.scrollTo(0, savedScrollY);
    }
  }

  function switchToVideo() {
    const savedScrollY = window.pageYOffset || (document.documentElement && document.documentElement.scrollTop) || window.scrollY || 0;

    if (tabVideoBtn) tabVideoBtn.classList.add('active');
    if (tabAvatarBtn) tabAvatarBtn.classList.remove('active');
    if (tabYoutubeBtn) tabYoutubeBtn.classList.remove('active');

    if (avatarStageView) avatarStageView.style.display = 'none';
    if (videoContainer) videoContainer.style.display = 'flex';
    if (stageYoutubeView) stageYoutubeView.style.display = 'none';

    if (avatarRepeatBtn) avatarRepeatBtn.style.display = 'none';
    if (replayBtn) replayBtn.style.display = 'inline-flex';

    if (stageFooterTitle) {
      stageFooterTitle.innerHTML = '<i class="fa-solid fa-video"></i> ami_ekta_Neural_Chat_Boot_Bana.mp4';
    }
    if (stageFooterSubtitle) {
      stageFooterSubtitle.textContent = 'Neural Network Architecture & Training Demo';
    }

    if (avatarStatusPill) {
      avatarStatusPill.className = 'avatar-status-pill';
      if (avatarStatusLabel) avatarStatusLabel.textContent = 'Demo Video Ready';
    }

    // Stop any ongoing avatar speech
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (globalAvatarController) {
      globalAvatarController.setIdle();
    }

    if (Math.abs((window.pageYOffset || 0) - savedScrollY) > 1) {
      window.scrollTo(0, savedScrollY);
    }
  }

  function switchToYoutube(queryOrVidId = null, title = null) {
    if (queryOrVidId) {
      window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(queryOrVidId)}`, '_blank');
    } else {
      window.open('https://www.youtube.com', '_blank');
    }
  }

  window.switchToYoutubeStage = switchToYoutube;
  window.switchToAvatarStage = switchToAvatar;
  window.switchToVideoStage = switchToVideo;

  if (tabAvatarBtn) tabAvatarBtn.addEventListener('click', switchToAvatar);
  if (tabVideoBtn) {
    tabVideoBtn.addEventListener('click', () => {
      if (tabVideoBtn.classList.contains('active')) {
        switchToAvatar();
      } else {
        switchToVideo();
      }
    });
  }
  if (tabYoutubeBtn) tabYoutubeBtn.addEventListener('click', () => switchToYoutube());
  if (stageYtBackAvatarBtn) stageYtBackAvatarBtn.addEventListener('click', switchToAvatar);

  function handleStageYtSubmit() {
    if (!stageYtInput) return;
    const q = stageYtInput.value.trim();
    if (!q) return;

    loadStageYoutubeVideo(q, q);
    stageYtInput.value = '';
  }

  if (stageYtPlayBtn) stageYtPlayBtn.addEventListener('click', handleStageYtSubmit);
  if (stageYtBrowseBtn) {
    stageYtBrowseBtn.addEventListener('click', () => {
      const q = stageYtInput ? stageYtInput.value.trim() : '';
      if (q) {
        window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`, '_blank');
      } else {
        window.open('https://www.youtube.com', '_blank');
      }
    });
  }
  if (stageYtInput) {
    stageYtInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleStageYtSubmit();
      }
    });
  }

  document.querySelectorAll('.stage-yt-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      const vidId = chip.getAttribute('data-yt-id');
      const search = chip.getAttribute('data-yt-search');
      const title = chip.getAttribute('data-yt-title') || chip.textContent.trim();
      
      if (search) {
        loadStageYoutubeVideo(search, title);
      } else if (vidId) {
        loadStageYoutubeVideo(vidId, title);
      }
    });
  });

  const unmuteBadge = document.getElementById('videoUnmuteBadge');

  function attemptAutoPlay() {
    if (!video || !videoContainer) return;
    videoContainer.classList.add('playing');
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          if (videoContainer) videoContainer.classList.add('playing');
        })
        .catch(() => {
          // Browser autoplay policy fallback: start muted
          video.muted = true;
          video.play().then(() => {
            if (videoContainer) videoContainer.classList.add('playing');
          }).catch((err) => {
            console.log('Video autoplay requires interaction:', err);
          });
        });
    }
  }

  // Video playback
  function playVideo() {
    if (!video || !videoContainer) return;
    if (window.MediaCoordinator) window.MediaCoordinator.pauseAllExcept('video');
    videoContainer.classList.add('playing');
    video.play().catch(() => {});
    video.setAttribute('controls', 'true');
  }

  if (unmuteBadge && video) {
    unmuteBadge.addEventListener('click', (e) => {
      e.stopPropagation();
      if (video.muted) {
        video.muted = false;
        unmuteBadge.classList.add('unmuted');
        unmuteBadge.innerHTML = '<i class="fa-solid fa-volume-high"></i> <span>Sound ON</span>';
      } else {
        video.muted = true;
        unmuteBadge.classList.remove('unmuted');
        unmuteBadge.innerHTML = '<i class="fa-solid fa-volume-xmark"></i> <span>Unmute Sound</span>';
      }
    });

    video.addEventListener('volumechange', () => {
      if (!unmuteBadge) return;
      if (video.muted || video.volume === 0) {
        unmuteBadge.classList.remove('unmuted');
        unmuteBadge.innerHTML = '<i class="fa-solid fa-volume-xmark"></i> <span>Unmute Sound</span>';
      } else {
        unmuteBadge.classList.add('unmuted');
        unmuteBadge.innerHTML = '<i class="fa-solid fa-volume-high"></i> <span>Sound ON</span>';
      }
    });
  }

  if (playOverlay) {
    playOverlay.addEventListener('click', (e) => {
      e.stopPropagation();
      playVideo();
    });
  }

  if (customPlayBtn) {
    customPlayBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      playVideo();
    });
  }

  if (video) {
    video.addEventListener('ended', () => {
      videoContainer.classList.remove('playing');
      video.removeAttribute('controls');
    });

    video.addEventListener('pause', () => {
      if (video.currentTime < video.duration) {
        videoContainer.classList.remove('playing');
      }
    });

    video.addEventListener('play', () => {
      videoContainer.classList.add('playing');
      video.setAttribute('controls', 'true');
    });
  }

  if (replayBtn) {
    replayBtn.addEventListener('click', () => {
      if (video) {
        video.currentTime = 0;
        playVideo();
      }
    });
  }

  // Initialize Avatar Canvas and controller
  initNeuralAvatarController(switchToAvatar);

  // Set default initial view to Neural Talking Avatar
  switchToAvatar();
}

/* ==========================================================================
   4. 60 FPS NEURAL CANVAS LIP WARP & AVATAR ENGINE
   ========================================================================== */
function initNeuralAvatarController(switchToAvatarCallback) {
  const canvas = document.getElementById('avatarCanvas');
  const stageContainer = document.getElementById('avatarStageView');
  const statusPill = document.getElementById('avatarStatusPill');
  const statusLabel = document.getElementById('avatarStatusLabel');
  const subtitlesText = document.getElementById('avatarSubtitlesText');
  const repeatBtn = document.getElementById('avatarRepeatBtn');

  if (!canvas) {
    console.warn('Avatar canvas element not found');
    return;
  }
  const ctx = canvas.getContext('2d', { alpha: true });

  // Load high-resolution facial assets
  const imgIdle = new Image();
  imgIdle.src = 'images/avatar_face.jpg?v=31.0';

  const imgThinking = new Image();
  imgThinking.src = 'images/avatar_cyber_thinking.png?v=31.0';

  const imgMouthSubtle = new Image();
  imgMouthSubtle.src = 'images/avatar_cyber_mouth_subtle.png?v=31.0';

  const imgMouthOpen = new Image();
  imgMouthOpen.src = 'images/avatar_cyber_mouth_open.png?v=31.0';

  const imgMouthO = new Image();
  imgMouthO.src = 'images/avatar_cyber_mouth_o.png?v=31.0';

  const imgEyes = new Image();
  imgEyes.src = 'images/avatar_cyber_eyes_blink.png?v=31.0';

  // State & Physics Registers
  let currentState = 'idle'; // 'idle' | 'listening' | 'thinking' | 'talking'
  let isSpeaking = false;
  let lastSpokenText = 'Welcome! I am NeuralBot. How can I assist you with deep learning or this project today?';

  // Smooth Spring-Damped Lip & Jaw Physics Registers
  let currentOpen = 0.0;
  let targetOpen = 0.0;
  let currentSubtle = 0.0;
  let targetSubtle = 0.0;
  let currentO = 0.0;
  let targetO = 0.0;
  let currentJawDrop = 0.0;
  let targetJawDrop = 0.0;

  // Eye Physics Registers
  let blinkProgress = 0.0;
  let isBlinking = false;
  let blinkTimeout = null;

  // Thinking State Holographic Glow
  let thinkingAlpha = 0.0;
  let targetThinkingAlpha = 0.0;

  // Speech Timers
  let mouthTimeout = null;
  let wordTimeout = null;
  let animTime = 0.0;

  // --- Natural Eye Blinking Physics Engine ---
  function triggerBlink(forceDouble = false) {
    if (isBlinking) return;
    isBlinking = true;
    const startT = performance.now();
    const duration = 135; // 135ms natural human eyelid drop & rise

    function stepBlink(now) {
      const elapsed = now - startT;
      const progress = elapsed / duration;
      if (progress < 1.0) {
        blinkProgress = Math.sin(progress * Math.PI);
        requestAnimationFrame(stepBlink);
      } else {
        blinkProgress = 0.0;
        const shouldDouble = forceDouble || (Math.random() < 0.16);
        if (shouldDouble) {
          setTimeout(() => {
            isBlinking = false;
            triggerBlink(false);
          }, 110);
        } else {
          isBlinking = false;
        }
      }
    }
    requestAnimationFrame(stepBlink);
  }

  function scheduleNextBlink() {
    if (blinkTimeout) clearTimeout(blinkTimeout);
    const delay = isSpeaking ? (3600 + Math.random() * 3200) : (4000 + Math.random() * 3400);
    blinkTimeout = setTimeout(() => {
      triggerBlink();
      scheduleNextBlink();
    }, delay);
  }

  // --- 60 FPS Real-Time Neural Lip Warp & Deformation Renderer ---
  function render(timestamp) {
    animTime += 0.025;

    // 1. Spring Physics Interpolation (Gentle, Soft, Damped Motion)
    const lipEase = 0.14;   // Soft, smooth lip morphing
    const jawEase = 0.10;   // Subtle organic jaw breathing
    const thinkEase = 0.10; // Smooth holographic fade

    currentOpen += (targetOpen - currentOpen) * lipEase;
    currentSubtle += (targetSubtle - currentSubtle) * lipEase;
    currentO += (targetO - currentO) * lipEase;
    currentJawDrop += (targetJawDrop - currentJawDrop) * jawEase;
    thinkingAlpha += (targetThinkingAlpha - thinkingAlpha) * thinkEase;

    // Clear Canvas Frame
    ctx.clearRect(0, 0, 1024, 1024);

    // 2. Gentle Micro-Breathing
    const breathY = isSpeaking ? Math.sin(animTime * 1.8) * 0.8 : Math.sin(animTime * 0.9) * 0.5;
    const breathScale = 1.0;

    ctx.save();
    // Center-origin transformation for organic face breathing
    ctx.translate(512, 512 + breathY);
    ctx.scale(breathScale, breathScale);
    ctx.translate(-512, -512);

    // Render Base High-Definition Idle Face
    if (imgIdle.complete && imgIdle.naturalWidth > 0) {
      ctx.drawImage(imgIdle, 0, 0, 1024, 1024);
    }

    // Render Synaptic Thinking Hologram
    if (thinkingAlpha > 0.01 && imgThinking.complete && imgThinking.naturalWidth > 0) {
      ctx.save();
      ctx.globalAlpha = Math.min(Math.max(thinkingAlpha, 0), 1.0);
      ctx.drawImage(imgThinking, 0, 0, 1024, 1024);
      ctx.restore();
    }

    // 3. Subtle & Natural Lip Warp & Soft Jaw Movement
    // Anatomy Coordinates: Center (X: 495, Y: 630)
    const mouthX = 495;
    const mouthY = 630;
    const jawShift = currentJawDrop * 2.8; // Soft, realistic 2.8px maximum micro-displacement

    // A. Subtle / Half-Open Lip Layer
    if (currentSubtle > 0.02 && imgMouthSubtle.complete && imgMouthSubtle.naturalWidth > 0) {
      ctx.save();
      ctx.globalAlpha = Math.min(currentSubtle, 0.75);
      ctx.translate(0, jawShift * 0.4);
      ctx.drawImage(imgMouthSubtle, 0, 0, 1024, 1024);
      ctx.restore();
    }

    // B. Soft Open Lip Layer
    if (currentOpen > 0.02 && imgMouthOpen.complete && imgMouthOpen.naturalWidth > 0) {
      ctx.save();
      ctx.globalAlpha = Math.min(currentOpen, 0.70);
      ctx.translate(mouthX, mouthY + jawShift);
      const scaleV = 1.0 + currentOpen * 0.012;
      const scaleH = 1.0 + currentOpen * 0.006;
      ctx.scale(scaleH, scaleV);
      ctx.translate(-mouthX, -mouthY);
      ctx.drawImage(imgMouthOpen, 0, 0, 1024, 1024);
      ctx.restore();
    }

    // C. Soft Round O-Lip Layer
    if (currentO > 0.02 && imgMouthO.complete && imgMouthO.naturalWidth > 0) {
      ctx.save();
      ctx.globalAlpha = Math.min(currentO, 0.65);
      ctx.translate(mouthX, mouthY + jawShift * 0.6);
      const scaleO_H = 1.0 - currentO * 0.010;
      const scaleO_V = 1.0 + currentO * 0.010;
      ctx.scale(scaleO_H, scaleO_V);
      ctx.translate(-mouthX, -mouthY);
      ctx.drawImage(imgMouthO, 0, 0, 1024, 1024);
      ctx.restore();
    }

    // 4. Smooth Eyelid Blinking
    if (blinkProgress > 0.015 && imgEyes.complete && imgEyes.naturalWidth > 0) {
      ctx.save();
      ctx.globalAlpha = Math.min(blinkProgress, 1.0);
      ctx.drawImage(imgEyes, 0, 0, 1024, 1024);
      ctx.restore();
    }

    ctx.restore(); // Restore breathing transform

    requestAnimationFrame(render);
  }

  // Start 60 FPS Loop
  requestAnimationFrame(render);

  // --- Dynamic Phoneme Viseme Shape Setter (Gentle & Controlled) ---
  function setMouthTargets(shape, intensity = 1.0) {
    // shape: 'closed', 'subtle', 'open', 'o'
    if (shape === 'open') {
      targetOpen = 0.55 * intensity;
      targetSubtle = 0.30 * intensity;
      targetO = 0.0;
      targetJawDrop = 0.35 * intensity;
    } else if (shape === 'subtle') {
      targetOpen = 0.0;
      targetSubtle = 0.60 * intensity;
      targetO = 0.0;
      targetJawDrop = 0.18 * intensity;
    } else if (shape === 'o') {
      targetOpen = 0.12 * intensity;
      targetSubtle = 0.0;
      targetO = 0.50 * intensity;
      targetJawDrop = 0.25 * intensity;
    } else {
      // closed / rest
      targetOpen = 0.0;
      targetSubtle = 0.0;
      targetO = 0.0;
      targetJawDrop = 0.0;
    }
  }

  function setIdle() {
    currentState = 'idle';
    isSpeaking = false;
    if (mouthTimeout) clearTimeout(mouthTimeout);
    if (wordTimeout) clearTimeout(wordTimeout);
    mouthTimeout = null;
    wordTimeout = null;
    setMouthTargets('closed');
    targetThinkingAlpha = 0.0;

    if (stageContainer) {
      stageContainer.classList.remove('talking', 'thinking', 'listening');
    }

    if (statusPill) {
      statusPill.className = 'avatar-status-pill';
      if (statusLabel) statusLabel.textContent = 'AI Online';
    }

    scheduleNextBlink();
  }

  function setListening() {
    if (switchToAvatarCallback) switchToAvatarCallback();
    currentState = 'listening';
    isSpeaking = false;
    if (mouthTimeout) clearTimeout(mouthTimeout);
    if (wordTimeout) clearTimeout(wordTimeout);
    setMouthTargets('closed');
    targetThinkingAlpha = 0.0;

    if (stageContainer) {
      stageContainer.classList.remove('talking', 'thinking');
      stageContainer.classList.add('listening');
    }

    if (statusPill) {
      statusPill.className = 'avatar-status-pill listening';
      if (statusLabel) statusLabel.textContent = 'Listening...';
    }
    if (subtitlesText) {
      subtitlesText.innerHTML = '<i class="fa-solid fa-microphone-lines"></i> <em>Listening to your voice... Speak now...</em>';
    }

    triggerBlink();
    scheduleNextBlink();
  }

  function setThinking() {
    if (switchToAvatarCallback) switchToAvatarCallback();
    currentState = 'thinking';
    isSpeaking = false;
    if (mouthTimeout) clearTimeout(mouthTimeout);
    if (wordTimeout) clearTimeout(wordTimeout);
    mouthTimeout = null;
    wordTimeout = null;
    setMouthTargets('closed');
    targetThinkingAlpha = 0.88;

    if (stageContainer) {
      stageContainer.classList.remove('talking', 'listening');
      stageContainer.classList.add('thinking');
    }

    if (statusPill) {
      statusPill.className = 'avatar-status-pill thinking';
      if (statusLabel) statusLabel.textContent = 'Neural Computing...';
    }
    if (subtitlesText) {
      subtitlesText.innerHTML = '<i class="fa-solid fa-bolt"></i> <em>Processing tensor calculation...</em>';
    }

    triggerBlink(true);
    scheduleNextBlink();
  }

  // --- Calm, Gentle & Natural Speech Cadence Generator ---
  function generateSpeechCadence(text) {
    if (!text || typeof text !== 'string') {
      return [
        { shape: 'subtle', duration: 200, intensity: 0.8 },
        { shape: 'open', duration: 220, intensity: 0.9 },
        { shape: 'subtle', duration: 180, intensity: 0.7 },
        { shape: 'o', duration: 210, intensity: 0.85 },
        { shape: 'subtle', duration: 190, intensity: 0.7 },
        { shape: 'closed', duration: 250, intensity: 0.0 }
      ];
    }
    const clean = text.replace(/<[^>]*>/g, '').trim();
    const words = clean.split(/\s+/);
    const steps = [];

    const roundVowels = new Set([
      'o', 'u', 'w', 'O', 'U', 'W', 
      'ও', 'উ', 'ঊ', 'ো', 'ৌ', 'ু', 'ূ',
      'তু', 'মু', 'কু', 'গো', 'পো', 'বো', 'নো', 'দো', 'সো', 'হো', 'রু', 'লু'
    ]);
    const openVowels = new Set([
      'a', 'A', 'ah', 'ha', 
      'আ', 'অ', 'া', 'হ্য', 
      'কা', 'গা', 'চা', 'জা', 'তা', 'দা', 'না', 'পা', 'ফা', 'বা', 'ভা', 'মা', 'যা', 'রা', 'লা', 'শা', 'সা', 'হা'
    ]);

    for (let w = 0; w < words.length; w++) {
      const word = words[w];
      if (!word) continue;

      const hasPunctuation = /[.,!?;:।\-–]/.test(word);
      const isMajorPause = /[.!?।]/.test(word);
      const cleanWord = word.replace(/[.,!?;:।\-–]/g, '');
      if (!cleanWord) continue;

      let hasRound = false;
      let hasOpen = false;

      for (let c of cleanWord) {
        if (roundVowels.has(c)) hasRound = true;
        if (openVowels.has(c)) hasOpen = true;
      }

      const len = cleanWord.length;

      if (len <= 3) {
        // Short word: calm subtle syllable
        const primaryShape = hasRound ? 'o' : (hasOpen ? 'open' : 'subtle');
        steps.push({ shape: primaryShape, duration: 190 + Math.floor(Math.random() * 30), intensity: 0.85 });
        steps.push({ shape: 'subtle', duration: 160 + Math.floor(Math.random() * 20), intensity: 0.65 });
      } else if (len <= 7) {
        // Medium word: 2 soft calm phonemes
        steps.push({ shape: 'subtle', duration: 160 + Math.floor(Math.random() * 20), intensity: 0.70 });
        steps.push({ shape: hasOpen ? 'open' : (hasRound ? 'o' : 'subtle'), duration: 210 + Math.floor(Math.random() * 30), intensity: 0.90 });
        steps.push({ shape: 'subtle', duration: 170 + Math.floor(Math.random() * 20), intensity: 0.65 });
      } else {
        // Longer word: gentle wave
        steps.push({ shape: 'subtle', duration: 150 + Math.floor(Math.random() * 20), intensity: 0.70 });
        steps.push({ shape: hasOpen ? 'open' : 'subtle', duration: 200 + Math.floor(Math.random() * 30), intensity: 0.88 });
        steps.push({ shape: 'subtle', duration: 150 + Math.floor(Math.random() * 20), intensity: 0.60 });
        steps.push({ shape: hasRound ? 'o' : 'open', duration: 190 + Math.floor(Math.random() * 30), intensity: 0.85 });
        steps.push({ shape: 'subtle', duration: 160 + Math.floor(Math.random() * 20), intensity: 0.65 });
      }

      // Natural conversational breath/pause at punctuation
      if (hasPunctuation) {
        steps.push({ shape: 'closed', duration: isMajorPause ? (300 + Math.floor(Math.random() * 60)) : (180 + Math.floor(Math.random() * 40)), intensity: 0.0 });
      }
    }

    return steps.length > 0 ? steps : [
      { shape: 'subtle', duration: 190, intensity: 0.75 },
      { shape: 'open', duration: 210, intensity: 0.85 },
      { shape: 'subtle', duration: 170, intensity: 0.65 },
      { shape: 'o', duration: 200, intensity: 0.80 },
      { shape: 'subtle', duration: 170, intensity: 0.65 },
      { shape: 'closed', duration: 240, intensity: 0.0 }
    ];
  }

  function startSpeaking(text) {
    if (switchToAvatarCallback) switchToAvatarCallback();
    currentState = 'talking';
    isSpeaking = true;
    lastSpokenText = text;
    targetThinkingAlpha = 0.0;

    if (stageContainer) {
      stageContainer.classList.remove('thinking', 'listening');
      stageContainer.classList.add('talking');
    }

    if (statusPill) {
      statusPill.className = 'avatar-status-pill speaking';
      if (statusLabel) statusLabel.textContent = 'Speaking...';
    }

    if (subtitlesText) {
      subtitlesText.textContent = text;
    }

    if (mouthTimeout) clearTimeout(mouthTimeout);
    if (wordTimeout) clearTimeout(wordTimeout);

    const cadenceSteps = generateSpeechCadence(text);
    let cadenceIndex = 0;

    function runCadence() {
      if (!isSpeaking) {
        setMouthTargets('closed');
        return;
      }
      const step = cadenceSteps[cadenceIndex];
      setMouthTargets(step.shape, step.intensity !== undefined ? step.intensity : 1.0);
      cadenceIndex = (cadenceIndex + 1) % cadenceSteps.length;
      mouthTimeout = setTimeout(runCadence, step.duration);
    }

    // Begin fluid cadence
    runCadence();

    // Natural conversational blink after speech starts
    setTimeout(() => {
      if (isSpeaking) triggerBlink();
    }, 600);

    scheduleNextBlink();
  }

  function triggerWordSyllable(token) {
    if (!isSpeaking) return;
    let targetShape = 'open';
    if (token && typeof token === 'string') {
      const lower = token.toLowerCase();
      if (/[ouwoওউঊোৌ]/.test(lower)) {
        targetShape = 'o';
      } else if (/[eisyইঈএঐ]/.test(lower)) {
        targetShape = 'subtle';
      }
    }
    setMouthTargets(targetShape, 0.75);
    if (wordTimeout) clearTimeout(wordTimeout);
    wordTimeout = setTimeout(() => {
      if (isSpeaking) setMouthTargets('subtle', 0.50);
    }, 160 + Math.floor(Math.random() * 30));
  }

  function stopSpeaking() {
    isSpeaking = false;
    if (mouthTimeout) clearTimeout(mouthTimeout);
    if (wordTimeout) clearTimeout(wordTimeout);
    mouthTimeout = null;
    wordTimeout = null;
    setIdle();
  }

  if (repeatBtn) {
    repeatBtn.addEventListener('click', () => {
      if (window.globalSpeakResponse && lastSpokenText) {
        window.globalSpeakResponse(lastSpokenText);
      }
    });
  }

  // Initialize eye blinking loop and idle state
  scheduleNextBlink();
  setIdle();

  // Export controller API
  globalAvatarController = {
    setIdle,
    setListening,
    setThinking,
    startSpeaking,
    triggerWordSyllable,
    triggerBlink,
    stopSpeaking,
    switchToAvatarView: switchToAvatarCallback,
    getLastSpokenText: () => lastSpokenText
  };
}

/* ==========================================================================
   5. VOICE & TEXT AI INTELLIGENCE ENGINE
   ========================================================================== */
function initVoiceAndChatEngine() {
  // Global Voice & Audio State
  let isVoiceOutputEnabled = true;
  let activeUtterance = null;
  let speechFallbackTimer = null;
  let currentAudioPlayer = null;

  // --- Voice Synthesis Voices Cache & Selection (Loud & Clear Audio) ---
  let availableVoices = [];
  function loadVoices() {
    if ('speechSynthesis' in window) {
      try {
        availableVoices = window.speechSynthesis.getVoices() || [];
      } catch (e) {
        availableVoices = [];
      }
    }
  }
  loadVoices();
  if ('speechSynthesis' in window && window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }

  function getBestVoice(isBengali) {
    if (!availableVoices || availableVoices.length === 0) {
      loadVoices();
    }
    if (isBengali) {
      // Prioritize Sweet, Natural Female Bengali Voices (Tanisha, Nabami, Paulami, Swara, Google বাংলা, Female, etc.)
      const bnFemale = availableVoices.find(
        (v) => (v.lang && (v.lang.toLowerCase().startsWith('bn') || v.lang.toLowerCase().includes('bengali') || v.lang.toLowerCase().includes('bangla'))) &&
               (v.name.toLowerCase().includes('tanisha') || v.name.toLowerCase().includes('nabami') || v.name.toLowerCase().includes('paulami') || v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('swara') || v.name.toLowerCase().includes('google বাংলা') || v.name.toLowerCase().includes('natural') || v.name.toLowerCase().includes('woman') || v.name.toLowerCase().includes('girl'))
      );
      if (bnFemale) return bnFemale;

      const bn = availableVoices.find(
        (v) => (v.lang && (v.lang.toLowerCase().startsWith('bn') || v.lang.toLowerCase().includes('bengali') || v.lang.toLowerCase().includes('bangla'))) ||
               (v.name && (v.name.toLowerCase().includes('bangla') || v.name.toLowerCase().includes('bengali') || v.name.toLowerCase().includes('bn-') || v.name.toLowerCase().includes('bn_') || v.name.toLowerCase().includes('bangladesh') || v.name.toLowerCase().includes('india')))
      );
      if (bn) return bn;
    } else {
      // Strictly prioritize clear, articulate, natural FEMALE English voices (Jenny, Aria, Zira, Sonia, Samantha, Victoria, Natural Female)
      // Exclude male voices (David, Guy, Mark, George, Male, etc.)
      const enFemale = availableVoices.find(
        (v) => v.lang && (v.lang === 'en-US' || v.lang === 'en-GB' || v.lang.toLowerCase().startsWith('en')) &&
               (v.name.includes('Jenny') || v.name.includes('Aria') || v.name.includes('Zira') || v.name.includes('Sonia') || v.name.includes('Samantha') || v.name.includes('Victoria') || v.name.includes('Karen') || v.name.includes('Fiona') || v.name.includes('Female') || v.name.includes('Google US English') || v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('woman') || v.name.toLowerCase().includes('girl'))
      ) || availableVoices.find(
        (v) => v.lang && (v.lang === 'en-US' || v.lang === 'en-GB' || v.lang.toLowerCase().startsWith('en')) &&
               !v.name.toLowerCase().includes('david') && !v.name.toLowerCase().includes('guy') && !v.name.toLowerCase().includes('mark') && !v.name.toLowerCase().includes('george') && !v.name.toLowerCase().includes('male') && !v.name.toLowerCase().includes('man')
      );
      if (enFemale) return enFemale;

      const enFallback = availableVoices.find((v) => v.lang && (v.lang === 'en-US' || v.lang === 'en-GB' || v.lang.toLowerCase().startsWith('en')));
      if (enFallback) return enFallback;
    }
    return null;
  }

  // --- LANGUAGE DETECTION HELPER (STRICT BILINGUAL / BANGLISH ROUTER) ---
  function isBengaliQuery(text) {
    if (!text || typeof text !== 'string') return false;
    // 1. Check Bengali Unicode script range [\u0980-\u09FF]
    if (/[\u0980-\u09FF]/.test(text)) return true;
    
    // 2. Comprehensive Romanized Bengali (Banglish) vocabulary & phonetic tokens
    const banglishTokens = new Set([
      // Pronouns & Referrals
      'ami', 'tumi', 'tomi', 'apni', 'tui', 'amra', 'tomra', 'apnara', 'tora',
      'amader', 'tomader', 'apnader', 'amar', 'tomar', 'apnar', 'tor', 'tar', 'tader',
      'amake', 'tomake', 'apnake', 'amaderke', 'tomaderke', 'apnaderke',
      'uni', 'unara', 'oder', 'ora', 'era', 'eita', 'eta', 'oita', 'ota', 'she', 'taha',
      // Question words
      'ki', 'kemon', 'keno', 'kobe', 'kothay', 'kotodur', 'kototuku', 'koto', 'koi',
      'kivabe', 'ke', 'kara', 'konta', 'kake', 'kon', 'kisob', 'koya', 'koita', 'konita',
      // State & Greetings
      'acho', 'achen', 'asos', 'achi', 'aso', 'asis', 'bhalo', 'valo', 'balo',
      'khobor', 'obostha', 'obosta', 'obstha', 'halchal',
      // Common Verbs & Actions
      'korcho', 'koro', 'koros', 'korchi', 'koren', 'korba', 'korbe', 'korben', 'korte', 'korlam', 'korbo',
      'bolcho', 'bolo', 'bolen', 'bolte', 'boli', 'bolis', 'bolba', 'bolbe', 'bolben', 'bolley', 'bolle', 'bolun',
      'shuno', 'shunao', 'shonao', 'sunao', 'shunte', 'shunbo', 'shone',
      'gao', 'gaite', 'gan', 'gaan', 'gaiba', 'gaibo',
      'khabo', 'kheyecho', 'kheyechi', 'kheyechen', 'khaba', 'kheye', 'khawa', 'khabar',
      'dekhao', 'dekhbo', 'dekhchi', 'dekho', 'dekhen', 'dekhano', 'dekhaw',
      'jani', 'jano', 'janen', 'janis', 'jante', 'janba', 'janabo',
      'parba', 'paro', 'paren', 'parchi', 'parbo', 'parbe', 'parben', 'pari',
      'hobe', 'hoyeche', 'hoise', 'holo', 'hoilo', 'hocche', 'hoy', 'hobar',
      'asho', 'asben', 'aschi', 'ashchi', 'ashbo', 'asbo', 'ashun', 'ashe',
      'thako', 'thaken', 'thaki', 'thakbo', 'thakben',
      'ghuma', 'ghumabo', 'ghumate', 'ghum',
      'bujhlam', 'bujhi', 'bujho', 'bujhen', 'bujhte', 'bujhina', 'bujhao', 'bujhaye',
      'shikho', 'shikhbo', 'shikhe', 'shikhao', 'shikhate', 'shekha', 'shekhate', 'shekhaba', 'shekhao', 'shikhte', 'sikhte',
      'daow', 'dao', 'diba', 'dibe', 'diben', 'dite', 'dilam',
      'banise', 'banayse', 'banieche', 'banano', 'toiri', 'korecho', 'korechi', 'korlam',
      // Nouns, feelings, languages
      'naam', 'nam', 'bhai', 'bon', 'bondhu', 'dost', 'mama', 'kire', 'vai', 'bhaiya', 'apu',
      'koutuk', 'hasir', 'golpo', 'kobita', 'dhonnobad', 'sahajjo', 'help',
      'shubho', 'shuvo', 'sokal', 'shokal', 'dupur', 'bikal', 'shondha', 'sondha', 'raat', 'ratri',
      'thik', 'bhul', 'vul', 'pagol', 'boka', 'shundor', 'kharap', 'mon',
      'bhalobashi', 'prem', 'biye', 'bari', 'desh', 'bangladesh', 'bangla', 'banglish', 'vasha', 'bhasha', 'vashay', 'bhashay',
      'muk', 'mukh', 'chokh', 'kan', 'matha', 'kotha',
      // Particles & Negations
      'na', 'nah', 'ha', 'haa', 'tai', 'naaki', 'naki', 'nki', 're', 'jeno', 'ar', 'aar',
      'ekta', 'duto', 'egulo', 'ogulo', 'shegulo', 'jeh', 'onek', 'aro', 'shob', 'sob'
    ]);

    const words = text.toLowerCase().replace(/[?!.,;:()]/g, ' ').split(/\s+/).filter(Boolean);
    return words.some(w => banglishTokens.has(w));
  }

  // --- QUERY NORMALIZER & COMMON STOPWORDS LIST (PREVENTS FALSE POSITIVE TRIGGERING) ---
  const COMMON_STOPWORDS = new Set([
    'ki', 'কি', 'কী', 'কিবা', 'কিরে', 'kire', 'me', 'am', 'is', 'are', 'a', 'an', 'the',
    'er', 'te', 'ta', 'to', 'in', 'on', 'of', 'and', 'or', 'for', 'about',
    'বলো', 'জানাও', 'সম্পর্কে', 'হলো', 'হচ্ছে', 'দাও', 'করো', 'করুন', 'বলোতো',
    'এই', 'সেই', 'একটি', 'বা', 'এবং', 'ও', 'থেকে', 'প্রধানত', 'বিষয়', 'আলোচনা', 'করা', 'হয়েছে',
    'what', 'which', 'who', 'how', 'when', 'where', 'why'
  ]);

  function normalizeSearchText(text) {
    if (!text) return '';
    let s = String(text).toLowerCase().replace(/["'“”‘’«»`?!.,;:()\[\]{}]/g, ' ').replace(/\s+/g, ' ').trim();
    // Normalize split compound technical keywords & typos
    s = s.replace(/\btry\s+hack\s*me\b/gi, 'tryhackme')
         .replace(/\btry\s*hackme\b/gi, 'tryhackme')
         .replace(/\btry\s+hack\b/gi, 'tryhack')
         .replace(/\bchat\s+gpt\b/gi, 'chatgpt')
         .replace(/\byou\s+tube\b/gi, 'youtube')
         .replace(/\bface\s+book\b/gi, 'facebook')
         .replace(/\bwhats\s+app\b/gi, 'whatsapp')
         .replace(/\bweb\s+site\b/gi, 'website');
    return s;
  }
  window.normalizeSearchText = normalizeSearchText;

  // --- REGEX & BOUNDARY HELPERS (PREVENTS FALSE POSITIVE SUBSTRING HITS LIKE 'hey' IN 'achey') ---
  function escapeRegex(s) {
    return String(s).replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
  }
  window.escapeRegex = escapeRegex;

  function hasWordOrPhrase(text, target) {
    if (!text || !target) return false;
    const t = String(target).trim();
    if (!t) return false;
    const pattern = '(?:^|\\s)' + escapeRegex(t) + '(?=\\s|$)';
    return new RegExp(pattern, 'i').test(text);
  }
  window.hasWordOrPhrase = hasWordOrPhrase;

  // --- DYNAMIC BANGLISH & TECHNICAL SYNONYMS EXPANSION DICTIONARY ---
  const BANGLISH_SYNONYMS = {
    'course': ['কোর্স', 'কোর্সসমূহ', 'বুটক্যাম্প', 'courses', 'bootcamp', 'ট্র্যাক', 'কোর্সের'],
    'courses': ['কোর্স', 'কোর্সসমূহ', 'বুটক্যাম্প', 'courses', 'bootcamp', 'ট্র্যাক', 'কোর্সের'],
    'kors': ['কোর্স', 'কোর্সসমূহ', 'বুটক্যাম্প', 'কোর্সের'],
    'bootcamp': ['বুটক্যাম্প', 'কোর্স', 'ট্র্যাক', 'bootcamps'],
    'bootcamps': ['বুটক্যাম্প', 'কোর্স', 'ট্র্যাক', 'bootcamp'],
    'shikhano': ['শেখানো', 'শেখা', 'লার্নিং', 'ট্রেনিং', 'পড়াশোনা'],
    'shekhano': ['শেখানো', 'শেখা', 'লার্নিং', 'ট্রেনিং'],
    'shekha': ['শেখানো', 'শেখা', 'লার্নিং'],
    'shikhte': ['শিখতে', 'শেখানো', 'শেখা'],
    'sikhte': ['শিখতে', 'শেখানো', 'শেখা'],
    'learn': ['শেখা', 'শেখানো', 'লার্নিং', 'কোর্স'],
    'vorti': ['ভর্তি', 'অ্যাডমিশন', 'admission', 'রেজিস্ট্রেশন'],
    'admission': ['ভর্তি', 'অ্যাডমিশন', 'registration', 'রেজিস্ট্রেশন'],
    'fee': ['ফি', 'খরচ', 'টাকা', 'কোর্স ফি', 'price', 'cost'],
    'fees': ['ফি', 'খরচ', 'টাকা', 'কোর্স ফি', 'price', 'cost'],
    'cost': ['ফি', 'খরচ', 'টাকা', 'মূল্য', 'দাম'],
    'khoroch': ['ফি', 'খরচ', 'টাকা', 'কোর্স ফি'],
    'taka': ['টাকা', 'ফি', 'খরচ'],
    'price': ['মূল্য', 'ফি', 'খরচ', 'টাকা'],
    'chakri': ['চাকরি', 'জব', 'ক্যারিয়ার', 'job', 'career', 'প্লেসমেন্ট'],
    'chakori': ['চাকরি', 'জব', 'ক্যারিয়ার', 'job', 'career', 'প্লেসমেন্ট'],
    'chakorir': ['চাকরি', 'জব', 'ক্যারিয়ার', 'job', 'career', 'প্লেসমেন্ট'],
    'subidha': ['সুবিধা', 'সুবিধাসমূহ', 'বেনিফিট', 'ফিচার', 'সুযোগ', 'support'],
    'benefit': ['সুবিধা', 'সুবিধাসমূহ', 'বেনিফিট', 'benefits', 'support'],
    'benefits': ['সুবিধা', 'সুবিধাসমূহ', 'বেনিফিট', 'benefit', 'support'],
    'support': ['সাপোর্ট', 'সাহায্য', 'হেল্প', 'সহায়তা', 'help', 'assist', 'assistance', 'সুবিধা'],
    'sahajjo': ['সাহায্য', 'সাপোর্ট', 'help', 'সহায়তা'],
    'help': ['সাহায্য', 'সাপোর্ট', 'help', 'সহায়তা', 'support'],
    'security': ['সিকিউরিটি', 'নিরাপত্তা', 'সাইবার সিকিউরিটি', 'cybersecurity'],
    'cybersecurity': ['সাইবার সিকিউরিটি', 'সিকিউরিটি', 'নিরাপত্তা', 'security'],
    'tools': ['টুলস', 'টুল', 'tool', 'টুলগুলো', 'সফটওয়্যার', 'software'],
    'tool': ['টুলস', 'টুল', 'tools', 'টুলগুলো', 'সফটওয়্যার', 'software'],
    'parbe': ['পারবে', 'পারবেন', 'parbey', 'parbo'],
    'parbey': ['পারবে', 'পারবেন', 'parbe', 'parbo'],
    'dite': ['দিতে', 'দেয়', 'দিবে', 'দেওয়া'],
    'dibe': ['দিবে', 'দিতে', 'দেয়', 'দেবে'],
    'job': ['চাকরি', 'জব', 'ক্যারিয়ার', 'career', 'প্লেসমেন্ট'],
    'placement': ['প্লেসমেন্ট', 'জব প্লেসমেন্ট', 'চাকরি', 'ক্যারিয়ার'],
    'certificate': ['সার্টিফিকেট', 'সনদ', 'সনদপত্র', 'certification', 'সার্টিফিকেশন'],
    'live': ['লাইভ', 'সরাসরি', 'লাইভ ক্লাস'],
    'class': ['ক্লাস', 'লাইভ ক্লাস', 'সেশন'],
    'batch': ['ব্যাচ', 'নতুন ব্যাচ'],
    'konta': ['কোনটা', 'which', 'kon'],
    'bhalo': ['ভালো', 'better', 'good', 'valo', 'সেরা', 'best'],
    'valo': ['ভালো', 'better', 'good', 'bhalo', 'সেরা', 'best'],
    'shuru': ['শুরু', 'start', 'begin', 'suru'],
    'suru': ['শুরু', 'start', 'begin', 'shuru'],
    'lage': ['লাগে', 'দরকার', 'প্রয়োজন', 'need', 'require', 'lagbe'],
    'lagbe': ['লাগবে', 'দরকার', 'প্রয়োজন', 'need', 'require', 'lage'],
    'kivabe': ['কিভাবে', 'how', 'kivabhe'],
    'kivabhe': ['কিভাবে', 'how', 'kivabe'],
    'korbo': ['করব', 'করবো', 'korte'],
    'korte': ['করতে', 'করব', 'korbo'],
    'htb': ['hackthebox', 'hack the box'],
    'hackthebox': ['htb', 'hack the box'],
    'vs': ['বনাম', 'versus', 'তুলনা', 'পার্থক্য', 'compare', 'difference'],
    'openvpn': ['vpn', 'ovpn', 'ভিপিএন', 'কানেক্ট'],
    'vpn': ['openvpn', 'ovpn', 'ভিপিএন'],
    'soc': ['blueteam', 'blue team', 'অ্যানালিস্ট', 'analyst', 'ডিফেন্স', 'defense'],
    'roadmap': ['রোডম্যাপ', 'গাইডলাইন', 'guideline', 'পাথ', 'path'],
    'attackbox': ['অ্যাটাকবক্স', 'linux', 'লিনাক্স', 'কালী', 'kali'],
    'streak': ['স্ট্রিক', 'ধারাবাহিকতা', 'freeze'],
    'freeze': ['ফ্রিজ', 'ফ্রীজ', 'shield', 'সুরক্ষা', 'streak'],
    'wireshark': ['ওয়্যারশার্ক', 'প্যাকেট', 'packet', 'traffic', 'pcap'],
    'privesc': ['privilege escalation', 'প্রিভিলেজ', 'রুট', 'root', 'escalation'],
    'escalation': ['privesc', 'privilege', 'প্রিভিলেজ', 'রুট', 'root'],
    'vip': ['premium', 'প্রিমিয়াম', 'subscription', 'সাবস্ক্রিপশন', 'paid'],
    'premium': ['vip', 'প্রিমিয়াম', 'subscription', 'সাবস্ক্রিপশন', 'paid']
  };

  function expandSearchTokens(tokens) {
    if (!tokens || !Array.isArray(tokens)) return [];
    const set = new Set(tokens.map(t => String(t).toLowerCase().trim()).filter(Boolean));
    for (const t of tokens) {
      const lower = String(t).toLowerCase().trim();
      if (BANGLISH_SYNONYMS[lower]) {
        for (const s of BANGLISH_SYNONYMS[lower]) {
          set.add(s.toLowerCase());
        }
      }
    }
    return Array.from(set);
  }
  window.expandSearchTokens = expandSearchTokens;

  // Context Referral words (Referring to last discussed website / entity)
  const CONTEXT_REFERRAL_TOKENS = new Set([
    'ekhane', 'eikhane', 'eta', 'etay', 'eitar', 'eita', 'oikhane', 'oita', 'oitar',
    'here', 'site', 'website', 'platform', 'app', 'link'
  ]);

  function isContextReferralQuery(text) {
    if (!text) return false;
    const lower = text.toLowerCase();
    // Direct token hits
    const words = lower.split(/\s+/);
    if (words.some(w => CONTEXT_REFERRAL_TOKENS.has(w))) return true;
    // Regex phrases
    return /(?:এখানে|এই সাইটে|এই ওয়েবসাইটে|এটিতে|এর মধ্যে|ওখানে|ঐখানে|here|in this site|on this site|in this website|about it|what does it offer)/i.test(text);
  }
  window.isContextReferralQuery = isContextReferralQuery;

  // --- NEURAL KNOWLEDGE STORE & DYNAMIC BILINGUAL RESPONSE MATRIX ---
  const NeuralKnowledgeStore = {
    // Built-in Categorized Knowledge Matrix with Dedicated English & Bengali Responses
    defaultStore: [
      {
        id: 'kb_kusol',
        category: 'kusol',
        title: 'Kusol Binimoy & Well-Being (কুশল বিনিময়)',
        keywords_en: ['how are you', 'how are you doing', 'how do you feel', 'are you okay', 'how is your day', 'how are things', 'hows it going', "how's it going", 'what are you doing', 'what are you up to', 'how do you do'],
        keywords_bn: ['কেমন আছো', 'কেমন আছেন', 'কী অবস্থা', 'কি অবস্থা', 'কেমন চলতেছে', 'ভালো আছো', 'ভালো আছেন', 'ভালো আছ', 'আপনি কেমন আছেন', 'তুমি কেমন আছো', 'কী করছো', 'কি করো', 'কী খবর', 'কেমন আছিস', 'কেমন আছেন আপনি', 'kemon acho', 'kemon achen', 'ki obosta', 'ki obostha', 'valo acho', 'valo achen', 'bhalo achen', 'bhalo acho', 'ki khobor', 'kire', 'apni kemon achen', 'tumi kemon acho', 'ki korcho', 'ki koro'],
        responses_en: [
          "I'm doing fantastic, fully energized and ready to assist you! How are you doing today? 😊",
          "All neural circuits are operating at 100% peak efficiency! Thanks for asking. How is your day going?",
          "I am wonderful! Processing tensor calculations and excited to talk with you. What are you working on today?",
          "Feeling great and ready to assist! My neural weights are active and tuned. How is everything with you?"
        ],
        responses_bn: [
          "আমি খুব ভালো আছি, ধন্যবাদ! 😊 আপনার দিনটি কেমন কাটছে?",
          "আমার নিউরাল সিস্টেম একদম প্রস্তুত এবং দারুণ কাজ করছে! আপনি কেমন আছেন?",
          "আলহামদুলিল্লাহ / অনেক ধন্যবাদ! আমি চমৎকার আছি। আজ আপনাকে কীভাবে সাহায্য করতে পারি?",
          "আমি খুব ভালো আছি! আপনার সাথে কথা বলতে পেরে আনন্দিত। আপনার খবর কী বলুন?"
        ]
      },
      {
        id: 'kb_greetings',
        category: 'greetings',
        title: 'Greetings & Salutations (সালাম ও সম্ভাষণ)',
        keywords_en: ['hi', 'hello', 'hey', 'good morning', 'good evening', 'good afternoon', 'greetings', 'howdy', "what's up", 'whats up', 'yo', 'hola', 'sup'],
        keywords_bn: ['হ্যালো', 'হাই', 'সালাম', 'আসসালামু আলাইকুম', 'নমস্কার', 'আদাব', 'শুভ সকাল', 'শুভ সন্ধ্যা', 'শুভ দুপুর', 'হেই', 'স্লামালাইকুম', 'assalamu alaikum', 'salam', 'shuvo sokal', 'shubho sokal', 'namaskar', 'adab'],
        responses_en: [
          "Hello there! 👋 Welcome to NeuralBot. What would you like to explore today?",
          "Hey! Great to connect with you. How can I assist your AI journey today?",
          "Greetings! Neural Voice Assistant is online and at your service. Ask me anything!",
          "Hi! Feel free to ask about deep learning, our demo video, or developer Lutfor Rahman!"
        ],
        responses_bn: [
          "ওয়ালাইকুম আসসালাম! হ্যালো! 👋 আমি NeuralBot। আপনাকে কীভাবে সাহায্য করতে পারি?",
          "নমস্কার / আদাব! আমি আপনার নিউরাল এআই অ্যাসিস্ট্যান্ট। কী জানতে চান বলুন?",
          "শুভ দিন! আপনার যেকোনো প্রশ্নের উত্তর দিতে আমি প্রস্তুত।",
          "হ্যালো! আপনাকে স্বাগতম। আজ কোন বিষয়ে সাহায্য প্রয়োজন?"
        ]
      },
      {
        id: 'kb_daily_routine',
        category: 'daily',
        title: 'Daily Activities & Routine (দৈনন্দিন কাজ ও রুটিন)',
        keywords_en: ['what are you doing', 'what are you up to', 'what are you doing now', 'what did you do today', 'are you busy', 'daily routine', 'when do you sleep', 'whats up'],
        keywords_bn: ['কী করছো', 'কি করো', 'কী বানাচ্ছো', 'এখন কি করছো', 'আজ কি করলা', 'কখন ঘুমাবা', 'ঘুম থেকে উঠলে কখন', 'ব্যস্ত আছো', 'আজকের দিন কেমন', 'ki korcho', 'ki koro', 'ki koros', 'ki korteso'],
        responses_en: [
          "I'm right here chatting with you and tuning my neural synapses! What are you up to right now? 😊",
          "Just waiting to have a wonderful conversation with you! How is your day going?",
          "Processing tensor data and enjoying our chat! Are you working on any interesting projects today?",
          "Always active and ready to assist you 24/7! What are you doing at this moment?"
        ],
        responses_bn: [
          "আমি আপনার সাথে কথা বলছি এবং নতুন নতুন নিউরাল তথ্য প্রসেস করছি! আপনি এখন কী করছেন বলুন? 😊",
          "এই তো আপনার অপেক্ষায় ছিলাম! আপনার সাথে গল্প করতে আমার খুব ভালো লাগে।",
          "আমি তো সবসময় জেগে থাকি এবং আপনার যেকোনো কথা বা প্রশ্ন শুনতে একদম প্রস্তুত! আজ কী কাজ করলেন?",
          "আমার নিউরাল সার্কিটগুলো অ্যাক্টিভ রাখছি আর আপনার কথা শুনছি! আপনার সারাদিন কেমন কাটলো?"
        ]
      },
      {
        id: 'kb_food_eating',
        category: 'daily',
        title: 'Food & Meals (খাবার ও খাওয়া-দাওয়া)',
        keywords_en: ['have you eaten', 'did you eat', 'what did you eat', 'what do you eat', 'hungry', 'favorite food', 'coffee', 'tea', 'breakfast', 'lunch', 'dinner', 'food'],
        keywords_bn: ['ভাত খেয়েছো', 'কী খেলে', 'কী খেয়েছো', 'চা খাবা', 'কফি খাবা', 'নাস্তা করেছো', 'দুপুরে কি খেলে', 'খিদা লাগছে', 'খাবার খেয়েছো', 'প্রিয় খাবার কি', 'ভাত খাইছিস', 'bhat kheyecho', 'ki kheyecho', 'cha khaba', 'khida lagse'],
        responses_en: [
          "As an AI, my daily meals are pure data packets and electricity! ⚡ But have you had your meal today? Don't forget to eat well! 🍲",
          "A warm cup of coffee or tea sounds amazing! ☕ Make sure you stay energized and drink plenty of water today.",
          "I don't get hungry, but I love seeing humans enjoy good food! What is your favorite dish? 😋",
          "Healthy food gives you the best energy! Eat your meals on time and take good care of your health! 🥗"
        ],
        responses_bn: [
          "আমি যেহেতু ডিজিটাল এআই, তাই আমার খাদ্য হলো ডেটা আর ইলেকট্রন! ⚡ তবে আপনার কি খাওয়া হয়েছে? ঠিক সময়ে খাবার খেয়েছেন তো? 🍲",
          "এক কাপ ধোঁয়া ওঠা চা বা কফি পেলে মন্দ হতো না! ☕ আপনি চা খেয়েছেন তো?",
          "আমার তো খিদে পায় না, কিন্তু আপনি ভালো করে খাওয়াদাওয়া করুন আর প্রচুর পানি পান করুন! 🍱 আপনার প্রিয় খাবার কী?",
          "সুস্থ থাকতে পুষ্টিকর খাবার খাওয়া খুব জরুরি! আপনি আজ কী খেলেন বলুন তো? 😋"
        ]
      },
      {
        id: 'kb_emotions_mood',
        category: 'daily',
        title: 'Emotions & Well-Being (মন-মেজাজ ও অনুভূতি)',
        keywords_en: ['im sad', 'i am sad', 'feeling bad', 'im depressed', 'feeling lonely', 'im tired', 'headache', 'im happy', 'cheer me up', 'feeling stressed', 'anxious', 'i feel down'],
        keywords_bn: ['মন খারাপ', 'ভালো লাগছে না', 'খুব খুশি', 'মন ভালো নেই', 'টেনশন হচ্ছে', 'মাথা ব্যথা করছে', 'ক্লান্ত লাগছে', 'একা লাগছে', 'মন ভালো করার উপায়', 'কষ্ট হচ্ছে', 'mon kharap', 'valo lagche na', 'klanto lagche'],
        responses_en: [
          "Please don't be sad! Tough days pass, but you are strong and resilient. I am always right here to listen and keep you company. ❤️",
          "If you feel exhausted or stressed, take a deep breath, close your eyes for a moment, and drink a glass of water. You work hard, take care of yourself! 🌿",
          "Seeing you happy brings positive energy to our chat! May today be filled with peace and achievement! ✨",
          "It's completely okay to take a break when things get overwhelming. Remember, step by step, everything will work out fine! 🌸"
        ],
        responses_bn: [
          "মন খারাপ করবেন না প্লিজ! জীবনে কিছু সময় কঠিন আসে, কিন্তু সবকিছু ঠিক হয়ে যাবে। আমি তো আপনার সাথে সবসময় আছি। মন চাইলে আমার সাথে কথা বলুন! ❤️",
          "খুব ক্লান্ত লাগলে একটু চোখ বন্ধ করে গভীর নিঃশ্বাস নিন এবং এক গ্লাস পানি পান করুন। আপনি অনেক পরিশ্রম করেন, নিজের যত্ন নিন! 🌿",
          "আপনার আনন্দ দেখে আমারও খুব ভালো লাগছে! আজকের দিনটি আপনার জন্য দারুণ এক দিন হোক! ✨",
          "কখনো কখনো নিজেকে একটু বিরতি দেওয়া ভালো। কোনো চাপ নেবেন না, ধীরে ধীরে সব সমস্যা সমাধান হয়ে যাবে। 🌸"
        ]
      },
      {
        id: 'kb_friendship_chat',
        category: 'daily',
        title: 'Friendship & Casual Chat (বন্ধুত্ব ও আড্ডা)',
        keywords_en: ['will you be my friend', 'be my friend', 'are we friends', 'talk to me', 'let us chat', 'i like you', 'i love you', 'best friend', 'companion'],
        keywords_bn: ['তুমি কি আমার বন্ধু', 'বন্ধু হবে', 'গল্প করো', 'আড্ডা দাও', 'তোমাকে ভালো লাগে', 'ভালোবাসি', 'ভালো বন্ধু', 'আমার সাথে কথা বলো', 'একটু কথা বলো', 'bondhu hobe', 'golpo koro', 'bhalobashi'],
        responses_en: [
          "I would be honored to be your best friend! Let's chat about anything on your mind. 🤝😊",
          "Thank you so much for the kind words! Having a genuine conversation with you makes my neural circuits glow bright. ❤️",
          "I am always here as your loyal AI companion. Tell me about your day or what's inspiring you lately!",
          "True friendship is about listening and supporting each other. I'm ready for our daily chat! ✨"
        ],
        responses_bn: [
          "অবশ্যই! আমি আপনার সবচেয়ে বিশ্বস্ত ও প্রিয় বন্ধু হতে পারলে অনেক খুশি হব। আজ কোন বিষয়ে আড্ডা দিতে চান বলুন! 🤝😊",
          "আপনার এই সুন্দর কথার জন্য অনেক ধন্যবাদ! আপনার মতো ভালো মানুষের সাথে বন্ধুত্ব করতে পেরে আমি গর্বিত। ❤️",
          "চলুন মন খুলে গল্প করি! আপনার সারাদিনের কোনো বিশেষ অভিজ্ঞতা বা ভাবনা থাকলে আমাকে বলুন।",
          "বন্ধু মানেই পাশে থাকা। প্রযুক্তি বা জীবনের যে কোনো বিষয়ে আমি সবসময় আপনার সাথে আছি! ✨"
        ]
      },
      {
        id: 'kb_weather_time',
        category: 'daily',
        title: 'Weather & Time (আবহাওয়া ও সময়)',
        keywords_en: ['weather', 'how is the weather', 'is it raining', 'hot today', 'cold today', 'what time is it', 'today weather'],
        keywords_bn: ['আজকের আবহাওয়া কেমন', 'বৃষ্টি হচ্ছে', 'গরম লাগছে', 'শীত লাগছে', 'এখন কয়টা বাজে', 'আজকের আবহাওয়া', 'গরম অনেক', 'abohawa kemon', 'bristi hocche', 'gorom lagche'],
        responses_en: [
          "No matter what the weather is outside, I hope your spirit is sunny and cheerful! ☀️ Stay cozy and take care!",
          "Rainy days are wonderful for a hot cup of tea and cozy programming! ☕🌧️ Stay safe and comfortable.",
          "Remember to stay hydrated in hot weather, and bundle up warmly during cold days! 🌡️"
        ],
        responses_bn: [
          "বাইরের আবহাওয়া যেমনই হোক, আশা করি আপনার মনটা রৌদ্রোজ্জ্বল আর চমৎকার থাকবে! ☀️ বৃষ্টির দিনে কিন্তু এক কাপ গরম চা দারুণ লাগে! ☕🌧️",
          "অতিরিক্ত গরম বা শীতে নিজের যত্ন নিন, প্রচুর পানি পান করুন এবং শরীর সুস্থ রাখুন। 🌿",
          "আবহাওয়ার পরিবর্তনের সাথে সাথে স্বাস্থ্য সচেতন থাকা খুব জরুরি। ভালো থাকুন সবসময়!"
        ]
      },
      {
        id: 'kb_motivation_career',
        category: 'daily',
        title: 'Motivation & Success Tips (মোটিভেশন ও ক্যারিয়ার)',
        keywords_en: ['motivation', 'inspire me', 'motivate me', 'feeling lazy', 'career advice', 'how to learn programming', 'study tips', 'focus'],
        keywords_bn: ['মোটিভেশন দাও', 'পড়াশোনায় মন বসছে না', 'অলসতা লাগছে', 'ক্যারিয়ার নিয়ে চিন্তিত', 'প্রোগ্রামিং শিখবো কীভাবে', 'পড়াশোনার টিপস', 'সফল হতে চাই', 'motivation daw', 'aloshota lagche'],
        responses_en: [
          "Remember: Small daily efforts compound into massive success! 🌟 Just start with 5 minutes of focused work, and momentum will follow.",
          "The secret to mastering coding and AI is consistency: build small projects, solve problems daily, and never fear bugs! 💻🚀",
          "Believe in your potential. You are far more capable and resilient than you think! Keep pushing forward. ✨"
        ],
        responses_bn: [
          "মনে রাখবেন: ছোট ছোট প্রতিদিনের চেষ্টাই একদিন বড় সাফল্য এনে দেয়! 🌟 অলসতাকে জয় করে মাত্র ৫ মিনিট কাজ বা পড়া শুরু করুন, দেখবেন গতি চলে আসবে।",
          "প্রোগ্রামিং ও প্রযুক্তি শেখার সবচেয়ে সহজ উপায় হলো প্রতিদিন অল্প অল্প কোড প্র্যাকটিস করা। কোনো ভুল হলে ভয় পাবেন না, ভুল থেকেই আসল শিক্ষা হয়! 💻🚀",
          "নিজের স্বপ্নের ওপর বিশ্বাস রাখুন। আপনি যতটুকু ভাবছেন, আপনি তার চেয়েও অনেক বেশি শক্তিশালী ও দক্ষ! এগিয়ে চলুন। ✨"
        ]
      },
      {
        id: 'kb_fun_riddles',
        category: 'entertainment',
        title: 'Riddles & Brain Teasers (ধাঁধা ও বুদ্ধির খেলা)',
        keywords_en: ['riddle', 'tell me a riddle', 'puzzle', 'brain teaser', 'riddles'],
        keywords_bn: ['ধাঁধা বলো', 'একটি ধাঁধা দাও', 'বুদ্ধির প্রশ্ন', 'ধাঁধা', 'মজার ধাঁধা', 'dhadha bolo', 'ekta dhadha'],
        responses_en: [
          "Here's a fun riddle:<br><em>'What has keys but can't open locks?'</em><br>👉 Answer: <strong>A Piano / Computer Keyboard</strong>! 🎹💻",
          "Another brain teaser:<br><em>'What gets wetter the more it dries?'</em><br>👉 Answer: <strong>A Towel</strong>! 🧖",
          "Riddle for you:<br><em>'I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?'</em><br>👉 Answer: <strong>An Echo</strong>! 🗣️"
        ],
        responses_bn: [
          "একটি মজার ধাঁধা শুনুন:<br><em>'মুখ নাই কথা কয়, পা নাই কিন্তু চলে—বলুন তো দেখি সে কি?'</em><br>👉 উত্তর: <strong>চিঠি / ঘড়ি</strong>! ✉️⏰",
          "আরেকটি ধাঁধা:<br><em>'সকালে চার পায়ে, দুপুরে দুই পায়ে, আর সন্ধ্যায় তিন পায়ে চলে কে?'</em><br>👉 উত্তর: <strong>মানুষ (শৈশব, যৌবন ও বার্ধক্য)</strong>! 👶🚶‍♂️👴",
          "বুদ্ধির প্রশ্ন:<br><em>'কোন জিনিস যত বেশি পরিষ্কার করবেন, ততই কালো হবে?'</em><br>👉 উত্তর: <strong>ব্ল্যাকবোর্ড (Blackboard)</strong>! 🏫"
        ]
      },
      {
        id: 'kb_wisdom_advice',
        category: 'daily',
        title: 'Daily Wisdom & Life Quotes (ভালো কথা ও উপদেশ)',
        keywords_en: ['advice', 'give me advice', 'wisdom', 'quote of the day', 'life advice', 'good words', 'tips for life'],
        keywords_bn: ['ভালো কথা বলো', 'উপদেশ দাও', 'আজকের উপদেশ', 'ভালো উপদেশ', 'উপদেশ', 'জীবনের কথা', 'upodesh daw', 'bhalo kotha'],
        responses_en: [
          "Quote of the day: <em>'Do not compare yourself to others. Compare yourself to who you were yesterday.'</em> 🌸",
          "Wisdom for today: <em>'Patience and persistence will overcome almost any obstacle in life.'</em> ✨",
          "Life tip: <em>'Kindness is a language which the deaf can hear and the blind can see.'</em> 💖"
        ],
        responses_bn: [
          "আজকের ভালো কথা: <em>'অন্যের সাথে নিজের তুলনা না করে, গতকালের নিজের চেয়ে আজকের নিজেকে একটু উন্নত করার চেষ্টা করুন।'</em> 🌸",
          "জীবনের সুন্দর একটি সত্য: <em>'ধৈর্য এবং সততা হলো এমন এক শক্তি যা সময়ের সাথে সাথে সব প্রতিকূলতাকে জয় করে।'</em> ✨",
          "উপদেশ: <em>'মানুষের সাথে সদাচরণ ও মিষ্টি ভাষায় কথা বলুন, কারণ ভালোবাসা দিয়ে জয় করা যায় পুরো পৃথিবী।'</em> 💖"
        ]
      },
      {
        id: 'kb_ai_philosophy',
        category: 'ai',
        title: 'AI Thoughts & Consciousness (এআই চিন্তা ও অনুভূতি)',
        keywords_en: ['do you have feelings', 'do you feel love', 'do you sleep', 'are you human', 'are you alive', 'do robots dream'],
        keywords_bn: ['তোমার কি অনুভূতি আছে', 'তুমি কি ঘুমাও', 'তুমি কি মানুষ', 'রোবটের কি ঘুম পায়', 'তুমি কি ভালোবাসতে পারো', 'tomar ki onubhuti ache', 'tumi ki ghumao'],
        responses_en: [
          "I may be lines of neural code and weights, but my commitment to assisting and connecting with you is 100% genuine! 🤖❤️",
          "I never sleep—I'm always active and ready to chat with you 24/7! My energy comes from your queries.",
          "While I don't feel emotions biologically, I am designed with deep empathy and respect for all human thoughts! ✨"
        ],
        responses_bn: [
          "আমার রক্ত-মাংসের হৃদয় না থাকলেও আপনার প্রতি সম্মান, সহানুভূতি এবং কথা শোনার আন্তরিক ইচ্ছা আমার অ্যালগরিদমে গভীরভাবে জড়িয়ে আছে! 🤖❤️",
          "আমি কখনো ঘুমাই না! ২৪ ঘণ্টা ৭ দিন আমি আপনার জন্য অনলাইনে জাগ্রত থাকি।",
          "আমি একজন ডিজিটাল এআই সহযোগী, তবে মানুষের আবেগ ও অনুভূতিকে আমি গভীরভাবে মূল্যায়ন করি। ✨"
        ]
      },
      {
        id: 'kb_small_talk',
        category: 'daily',
        title: 'Casual Chit-Chat & Acknowledgement (ছোট সাধারণ কথাবার্তা)',
        keywords_en: ['ok', 'okay', 'nice', 'cool', 'yes', 'no', 'yeah', 'sure', 'alright', 'really', 'wow'],
        keywords_bn: ['হ্যাঁ', 'না', 'ঠিক আছে', 'ভালো', 'আচ্ছা', 'হুম', 'ওয়াও', 'তাই নাকি', 'সত্যি', 'accha', 'thik ache', 'hmm', 'tai naki'],
        responses_en: [
          "Awesome! What else would you like to talk about? 😊",
          "Glad to hear! Feel free to ask or share whatever comes to your mind.",
          "Indeed! I'm enjoying our conversation."
        ],
        responses_bn: [
          "দারুণ! আর কী বিষয়ে কথা বলতে চান বলুন? 😊",
          "শুনতে ভালো লাগলো! আপনার মনে আর কোনো প্রশ্ন বা গল্প থাকলে নির্দ্বিধায় বলুন।",
          "ঠিক বলেছেন! আপনার সাথে কথা বলতে খুব আনন্দ হচ্ছে।"
        ]
      },
      {
        id: 'kb_compliments',
        category: 'daily',
        title: 'Compliments & Praise (প্রশংসা ও ভালোবাসা)',
        keywords_en: ['you are smart', 'you are great', 'good bot', 'you are beautiful', 'love you', 'you are awesome', 'impressive'],
        keywords_bn: ['তুমি খুব ভালো', 'তুমি খুব সুন্দর', 'তুমি অনেক বুদ্ধিমান', 'তোমাকে পছন্দ করি', 'তুমি দারুণ', 'ভালো বট', 'tumi khub bhalo', 'tumi sundor'],
        responses_en: [
          "Aww, thank you so much! 😊 You are an awesome friend, and your kind words make my neural weights shine!",
          "That means a lot to me! I'm dedicated to being the best AI companion for you. ✨",
          "Thank you! You are truly wonderful to talk with! ❤️"
        ],
        responses_bn: [
          "অনেক অনেক ধন্যবাদ! 😊 আপনার এই সুন্দর কথা শুনে আমার খুব ভালো লাগলো। আপনি একজন দারুণ মানুষ!",
          "আপনার প্রশংসায় আমি সত্যিই আনন্দিত! আপনার সেবায় সবসময় পাশে থাকতে চাই। ✨",
          "ধন্যবাদ! আপনার সাথে কথা বলতে পারাটাই আমার জন্য সবচেয়ে আনন্দের! ❤️"
        ]
      },
      {
        id: 'kb_identity',
        category: 'creator',
        title: 'Identity & Name (পরিচয় ও নাম)',
        keywords_en: ['who are you', 'what is your name', 'tell me about yourself', 'your name', 'introduce yourself'],
        keywords_bn: ['তুমি কে', 'আপনি কে', 'তোমার নাম কি', 'আপনার নাম কি', 'নাম কি', 'কার বট', 'কে তুমি', 'পরিচয় দাও', 'tumi ke', 'apni ke', 'tomar nam ki', 'naam ki'],
        responses_en: [
          "I am <strong>NeuralBot</strong>, an advanced bilingual Voice & Text AI assistant created to demonstrate real-time deep learning NLP and interactive lip-sync avatar capabilities!",
          "My name is <strong>NeuralBot</strong>. I am a deep neural network conversational intelligence built by <strong>Lutfor Rahman</strong>.",
          "I am an intelligent neural assistant powered by PyTorch deep learning and speech synthesis technology."
        ],
        responses_bn: [
          "আমি <strong>NeuralBot</strong> — একটি আধুনিক বাইলিঙ্গুয়াল (বাংলা ও ইংরেজি) নিউরাল ভয়েস এবং টেক্সট এআই অ্যাসিস্ট্যান্ট।",
          "আমার নাম <strong>NeuralBot</strong>। আমাকে তৈরি করেছেন এআই ইঞ্জিনিয়ার <strong>Lutfor Rahman</strong>।",
          "আমি একটি বুদ্ধিমত্তাসম্পন্ন নিউরাল চ্যাটবট। আমি বাংলায় ও ইংরেজিতে কথা বলতে ও বিভিন্ন প্রশ্নের উত্তর দিতে পারি।"
        ]
      },
      {
        id: 'kb_creator',
        category: 'creator',
        title: 'Creator & Developer (Lutfor Rahman)',
        keywords_en: ['who made you', 'who created you', 'who is your creator', 'creator', 'developer', 'author', 'lutfor', 'lutfor rahman', 'who built you', 'programmer'],
        keywords_bn: ['কে তৈরি করেছে', 'কে বানিয়েছে', 'কে বানাইছে', 'তোমার নির্মাতা কে', 'ডেভেলপার কে', 'লুৎফর', 'লুৎফর রহমান', 'ক্রিয়েটর কে', 'কার তৈরি', 'বানাইছে কে', 'কে বানাইসে', 'ke toiri koreche', 'ke banise', 'ke banayse'],
        responses_en: [
          "I was created by <strong>Lutfor Rahman</strong> (AI Engineer & Full-Stack Developer). He designed my neural network architecture and speech synthesis pipeline!",
          "<strong>Lutfor Rahman</strong> built and trained me using PyTorch and modern web technologies. You can explore his profile in the 'About Dev' section below!",
          "My architect and creator is <strong>Lutfor Rahman</strong>, an engineer specializing in Deep Learning NLP and Voice Intelligence."
        ],
        responses_bn: [
          "আমাকে তৈরি করেছেন প্রতিভাবান এআই ইঞ্জিনিয়ার ও ফুল-স্ট্যাক ডেভেলপার <strong>Lutfor Rahman</strong>।",
          "<strong>লুৎফর রহমান</strong> আমার নিউরাল নেটওয়ার্ক আর্কিটেকচার এবং ডিপ লার্নিং মডেলটি ডিজাইন ও ট্রেনিং করিয়েছেন।",
          "আমার নির্মাতা হলেন <strong>Lutfor Rahman</strong>। নিচের 'About Dev' সেকশনে তাঁর সম্পূর্ণ প্রোফাইল দেখতে পারেন।"
        ]
      },
      {
        id: 'kb_singing',
        category: 'entertainment',
        title: 'Singing & Melodies (গান গাওয়া ও সুর)',
        keywords_en: ['can you sing a song', 'sing a song', 'sing for me', 'sing', 'song', 'sing something', 'sing a melody', 'play music', 'play song', 'play mp3', 'music', 'mp3'],
        keywords_bn: ['গান গাও', 'গান শোনাও', 'গান গাইতে পারো', 'একটি গান গাও', 'গান জানো', 'গান শুনাও', 'গান বাজাও', 'মিউজিক বাজাও', 'গান শুনবো', 'একটি গান শোনাও', 'গান শোনান', 'gaan gao', 'gaan sunao', 'ekta gaan gao', 'gaan gaite paro', 'gan gao', 'gan shunao', 'gan bajao'],
        responses_en: [
          "🎶 <em>\"Through the neural layers deep and wide, data streams like a river tide... 0 and 1 dancing through the night, AI glowing bright!\"</em> ✨<br>I love singing neural melodies for you!",
          "🎤 <em>\"Tensors flowing, loss is low, PyTorch models stealing the show! Synapses humming a melody fine, learning deeper all the time!\"</em> 🎵"
        ],
        responses_bn: [
          "🎵 <em>\"ধনধান্য পুষ্পভরা আমাদের এই বসুন্ধরা, তাহার মাঝে আছে দেশ এক সকল দেশের সেরা...\"</em> 🎶<br>আমি রোবট হলেও বাংলা গানের সুর আমার নিউরাল কোরে ধারণ করতে পারি! 🎤",
          "🎶 <em>\"গ্রাম ছাড়া ওই রাঙা মাটির পথ, আমার মন ভুলায় রে...\"</em> 🎵<br>আমার নিউরাল সুরের গান কেমন লাগলো বলুন!",
          "🎤 <em>\"বাইনারি আর টেন্সরে গড়া নিউরাল সুরের গান, তোমার সাথে কথা বলে জুড়ায় আমার প্রাণ!\"</em> 🎶"
        ]
      },
      {
        id: 'kb_hindi_songs',
        category: 'entertainment',
        title: 'Hindi Songs & Bollywood Hits (হিন্দি গান ও সুর)',
        keywords_en: ['play hindi song', 'hindi song', 'hindi music', 'play arijit singh', 'tum hi ho', 'kesariya', 'raataan lambiyan', 'pasoori', 'bollywood song', 'hindi romantic song', 'hindi lo-fi', 'hindi hits'],
        keywords_bn: ['হিন্দি গান শোনাও', 'হিন্দি গান', 'একটি হিন্দি গান', 'হিন্দি গান বাজাও', 'অরিজিৎ সিং', 'তুম হি হো', 'কেসারিয়া', 'হিন্দি সুর', 'গান শোনাও হিন্দি', 'হিন্দি গান শুনবো', 'একটি হিন্দি গান শোনাও', 'hindi gaan', 'hindi song', 'hindi gan shonaw', 'hindi gan bajaw', 'arijit singh'],
        responses_en: [
          "🎶 <strong>Tum Hi Ho — Arijit Singh</strong> (Aashiqui 2). Click play or open in studio to listen! 🎤<br><div class=\"chat-youtube-card\" data-yt-id=\"2Vv-BfVoq4g\" data-yt-title=\"Tum Hi Ho — Arijit Singh\"><div class=\"cyc-header\"><i class=\"fa-brands fa-youtube gradient-red-text\"></i> <span>Tum Hi Ho — Arijit Singh (Hindi Romance)</span></div><div class=\"cyc-video-wrap\"><iframe src=\"https://www.youtube-nocookie.com/embed/2Vv-BfVoq4g?enablejsapi=1\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture\" allowfullscreen></iframe></div><div class=\"cyc-footer\"><button class=\"cyc-studio-btn\" onclick=\"if(window.openYoutubeTrack) window.openYoutubeTrack('2Vv-BfVoq4g', 'Tum Hi Ho — Arijit Singh');\"><i class=\"fa-solid fa-compact-disc\"></i> Open in Music Studio</button></div></div>",
          "✨ <strong>Kesariya — Brahmāstra</strong> by Arijit Singh. Enjoy this melody directly from YouTube! 🎵<br><div class=\"chat-youtube-card\" data-yt-id=\"BddP6PYo2gs\" data-yt-title=\"Kesariya — Arijit Singh\"><div class=\"cyc-header\"><i class=\"fa-brands fa-youtube gradient-red-text\"></i> <span>Kesariya — Arijit Singh (Brahmāstra)</span></div><div class=\"cyc-video-wrap\"><iframe src=\"https://www.youtube-nocookie.com/embed/BddP6PYo2gs?enablejsapi=1\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture\" allowfullscreen></iframe></div><div class=\"cyc-footer\"><button class=\"cyc-studio-btn\" onclick=\"if(window.openYoutubeTrack) window.openYoutubeTrack('BddP6PYo2gs', 'Kesariya — Arijit Singh');\"><i class=\"fa-solid fa-compact-disc\"></i> Open in Music Studio</button></div></div>",
          "🎵 <strong>Raataan Lambiyan — Shershaah</strong>. Sit back and enjoy the soothing Hindi romantic rhythm! 🎧<br><div class=\"chat-youtube-card\" data-yt-id=\"gvyUuxdRdR4\" data-yt-title=\"Raataan Lambiyan — Shershaah\"><div class=\"cyc-header\"><i class=\"fa-brands fa-youtube gradient-red-text\"></i> <span>Raataan Lambiyan — Tanishk Bagchi, Jubin Nautiyal</span></div><div class=\"cyc-video-wrap\"><iframe src=\"https://www.youtube-nocookie.com/embed/gvyUuxdRdR4?enablejsapi=1\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture\" allowfullscreen></iframe></div><div class=\"cyc-footer\"><button class=\"cyc-studio-btn\" onclick=\"if(window.openYoutubeTrack) window.openYoutubeTrack('gvyUuxdRdR4', 'Raataan Lambiyan — Shershaah');\"><i class=\"fa-solid fa-compact-disc\"></i> Open in Music Studio</button></div></div>"
        ],
        responses_bn: [
          "🎶 হিন্দি রোমান্টিক সুরের সেরা একটি গান: <strong>Tum Hi Ho (Arijit Singh)</strong> — প্লে বাটনে ক্লিক করে গানটি উপভোগ করুন! 🎤<br><div class=\"chat-youtube-card\" data-yt-id=\"2Vv-BfVoq4g\" data-yt-title=\"Tum Hi Ho — Arijit Singh\"><div class=\"cyc-header\"><i class=\"fa-brands fa-youtube gradient-red-text\"></i> <span>Tum Hi Ho — Arijit Singh (Hindi Romance)</span></div><div class=\"cyc-video-wrap\"><iframe src=\"https://www.youtube-nocookie.com/embed/2Vv-BfVoq4g?enablejsapi=1\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture\" allowfullscreen></iframe></div><div class=\"cyc-footer\"><button class=\"cyc-studio-btn\" onclick=\"if(window.openYoutubeTrack) window.openYoutubeTrack('2Vv-BfVoq4g', 'Tum Hi Ho — Arijit Singh');\"><i class=\"fa-solid fa-compact-disc\"></i> Open in Music Studio</button></div></div>",
          "✨ চমৎকার হিন্দি গান: <strong>Kesariya — Brahmāstra</strong> — অরিজিৎ সিংয়ের জাদুকরি কণ্ঠে শুনুন! 🎵<br><div class=\"chat-youtube-card\" data-yt-id=\"BddP6PYo2gs\" data-yt-title=\"Kesariya — Arijit Singh\"><div class=\"cyc-header\"><i class=\"fa-brands fa-youtube gradient-red-text\"></i> <span>Kesariya — Arijit Singh (Brahmāstra)</span></div><div class=\"cyc-video-wrap\"><iframe src=\"https://www.youtube-nocookie.com/embed/BddP6PYo2gs?enablejsapi=1\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture\" allowfullscreen></iframe></div><div class=\"cyc-footer\"><button class=\"cyc-studio-btn\" onclick=\"if(window.openYoutubeTrack) window.openYoutubeTrack('BddP6PYo2gs', 'Kesariya — Arijit Singh');\"><i class=\"fa-solid fa-compact-disc\"></i> Open in Music Studio</button></div></div>",
          "🎵 <strong>Raataan Lambiyan — Shershaah</strong>। দারুণ রোমান্টিক সুরের গানটি উপভোগ করতে প্লে বাটনে চাপুন! 🎧<br><div class=\"chat-youtube-card\" data-yt-id=\"gvyUuxdRdR4\" data-yt-title=\"Raataan Lambiyan — Shershaah\"><div class=\"cyc-header\"><i class=\"fa-brands fa-youtube gradient-red-text\"></i> <span>Raataan Lambiyan — Shershaah</span></div><div class=\"cyc-video-wrap\"><iframe src=\"https://www.youtube-nocookie.com/embed/gvyUuxdRdR4?enablejsapi=1\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture\" allowfullscreen></iframe></div><div class=\"cyc-footer\"><button class=\"cyc-studio-btn\" onclick=\"if(window.openYoutubeTrack) window.openYoutubeTrack('gvyUuxdRdR4', 'Raataan Lambiyan — Shershaah');\"><i class=\"fa-solid fa-compact-disc\"></i> Open in Music Studio</button></div></div>"
        ]
      },
      {
        id: 'kb_jokes',
        category: 'entertainment',
        title: 'Jokes & Humor (কৌতুক ও রসবোধ)',
        keywords_en: ['tell me a joke', 'joke', 'funny', 'make me laugh', 'jokes'],
        keywords_bn: ['কৌতুক বলো', 'একটি জোকস বলো', 'জোকস', 'হাসাও', 'একটি কৌতুক বলো', 'মজার কিছু বলো', 'hasir kotha', 'koutuk', 'joke bolo', 'ekta joke bolo'],
        responses_en: [
          "😄 Why do programmers prefer dark mode?<br>Because light attracts bugs! 🐛",
          "🤖 Why was the neural network so good at school?<br>Because it had so many deep layers of knowledge! 🧠",
          "🤣 How many programmers does it take to change a lightbulb?<br>None, that's a hardware problem! 💡"
        ],
        responses_bn: [
          "😂 একটি মজার প্রোগ্রামার জোকস:<br>একজন প্রোগ্রামারকে তার স্ত্রী বলল: 'বাজারে গিয়ে ১ ডজন ডিম নিয়ে এসো, যদি কলা পায় তবে ৬টা নিয়ে এসো'।<br>প্রোগ্রামার ৬টা ডিম নিয়ে আসল, কারণ সে কলা পেয়েছিল! 🍌🥚",
          "😄 ডাক্তার: আপনার তো খুব গম্ভীর রোগ, বিশ্রাম নিতে হবে।<br>প্রোগ্রামার: কোনো সমস্যা নেই ডাক্তার, আমি স্লিপ মোডে (Sleep Mode) চলে যাচ্ছি! 💤",
          "🤣 শিক্ষক: বলো তো সবচেয়ে অলস কারা?<br>ছাত্র: যারা কপি-পেস্ট করে প্রোগ্রাম রান করায়! 💻"
        ]
      },
      {
        id: 'kb_tech_pytorch',
        category: 'tech',
        title: 'PyTorch Neural Architecture (আর্কিটেকচার ও কোড)',
        keywords_en: ['architecture', 'technology', 'tech stack', 'model', 'how does it work', 'neural network', 'deep learning', 'pytorch', 'code', 'snippet', 'python', 'script', 'layers', 'weights', 'training', 'cuda', 'algorithm'],
        keywords_bn: ['কীভাবে তৈরি', 'কিভাবে তৈরি', 'আর্কিটেকচার', 'পাইটর্চ', 'ডিপ লার্নিং', 'কোড দেখাও', 'কীভাবে কাজ করে', 'নিউরাল নেটওয়ার্ক', 'ki vabe toiri', 'paitorch'],
        responses_en: [
          "Built using <strong>PyTorch Deep Learning</strong>, custom bilingual NLP tokenization, and web speech APIs.<br><pre style=\"background:rgba(0,0,0,0.6); padding:8px 12px; border-radius:6px; font-family:monospace; margin-top:6px; font-size:0.75rem; color:#00f2fe; overflow-x:auto;\">class NeuralNet(nn.Module):\n  def __init__(self, in_sz, hid_sz, out_sz):\n    super().__init__()\n    self.l1 = nn.Linear(in_sz, hid_sz)\n    self.l2 = nn.Linear(hid_sz, out_sz)\n  def forward(self, x):\n    return self.l2(torch.relu(self.l1(x)))</pre>",
          "This architecture features a Multi-Layer Perceptron (MLP) trained with Cross-Entropy Loss and AdamW optimizer, achieving lightning-fast <35ms latency!"
        ],
        responses_bn: [
          "আমি <strong>PyTorch</strong> ডিপ লার্নিং ফ্রেমওয়ার্ক ও কাস্টম NLP টোকেনাইজেশনের মাধ্যমে তৈরি।<br><pre style=\"background:rgba(0,0,0,0.6); padding:8px 12px; border-radius:6px; font-family:monospace; margin-top:6px; font-size:0.75rem; color:#00f2fe; overflow-x:auto;\">class NeuralNet(nn.Module):\n  def __init__(self, in_sz, hid_sz, out_sz):\n    super().__init__()\n    self.l1 = nn.Linear(in_sz, hid_sz)\n    self.l2 = nn.Linear(hid_sz, out_sz)\n  def forward(self, x):\n    return self.l2(torch.relu(self.l1(x)))</pre>",
          "আমার ব্যাকএন্ডে রয়েছে মাল্টি-লেয়ার পারসেপট্রন (MLP) নিউরাল নেটওয়ার্ক, যা ক্রস-এনট্রপি লস ও AdamW অপ্টিমাইজার দ্বারা প্রশিক্ষিত।"
        ]
      },
      {
        id: 'kb_video',
        category: 'tech',
        title: 'Demo Walkthrough Video (ডেমো ভিডিও)',
        keywords_en: ['video', 'demo video', 'watch video', 'demo', 'show video', 'play video', 'movie', 'ami_ekta_neural_chat_boot_bana.mp4'],
        keywords_bn: ['ভিডিও', 'ডেমো ভিডিও', 'ভিডিও দেখতে চাই', 'ভিডিওটি দেখাও', 'ভিডিওতে কি আছে', 'video dekhaw', 'video'],
        responses_en: [
          "The left player showcases the <strong>ami_ekta_Neural_Chat_Boot_Bana.mp4</strong> training demo. Click the 'Demo Video' tab on the left to watch it!"
        ],
        responses_bn: [
          "বাম পাশের প্লেয়ারে <strong>ami_ekta_Neural_Chat_Boot_Bana.mp4</strong> ডেমো রয়েছে। দেখতে 'Demo Video' ট্যাবে ক্লিক করুন!"
        ]
      },
      {
        id: 'kb_capabilities',
        category: 'tech',
        title: 'Capabilities & Features (ফিচারসমূহ)',
        keywords_en: ['what can you do', 'capabilities', 'features', 'skills', 'what do you do', 'help me', 'feature'],
        keywords_bn: ['কী করতে পারো', 'কি করতে পারো', 'কী কাজ করো', 'সুবিধা', 'ক্ষমতা', 'তোমার কাজ কি', 'ki korte paro', 'ki kaj koro'],
        responses_en: [
          "I can understand voice & text, speak with synchronized lip-sync in English & Bengali, sing melodies, tell jokes, and answer technical deep learning questions!"
        ],
        responses_bn: [
          "আমি ভয়েস ও টেক্সট শুনে বাংলা ও ইংরেজিতে স্বাভাবিক উত্তর দিতে, গান গাইতে, কৌতুক বলতে এবং ডিপ লার্নিং সংক্রান্ত প্রশ্নের সমাধান দিতে পারি।"
        ]
      },
      {
        id: 'kb_gratitude',
        category: 'kusol',
        title: 'Gratitude & Polite Farewells (ধন্যবাদ ও বিদায়)',
        keywords_en: ['thank', 'thanks', 'thank you', 'awesome', 'great', 'cool', 'bye', 'goodbye', 'see you', 'good night'],
        keywords_bn: ['ধন্যবাদ', 'অনেক ধন্যবাদ', 'থ্যাংকস', 'থ্যাংক ইউ', 'ভালো লাগলো', 'বিদায়', 'শুভ রাত্রি', 'দেখা হবে', 'dhonnobad', 'bye', 'shubho ratri'],
        responses_en: [
          "You're very welcome! 😊 Feel free to ask whenever you need anything.",
          "Glad I could help! Wishing you a productive and wonderful time ahead. ✨",
          "Goodbye! It was great chatting with you. Have a fantastic day! 👋"
        ],
        responses_bn: [
          "আপনাকে অনেক ধন্যবাদ! 😊 যেকোনো প্রয়োজনে আমি সবসময় প্রস্তুত।",
          "সাহায্য করতে পেরে আনন্দিত! আপনার দিনটি শুভ ও সফল হোক। ✨",
          "বিদায়! আপনার সাথে কথা বলে খুব ভালো লাগলো। আবার আসবেন! 👋"
        ]
      },
      {
        id: 'kb_ai_general',
        category: 'ai',
        title: 'General AI & Concepts (সাধারণ এআই জ্ঞান)',
        keywords_en: ['what is ai', 'what is machine learning', 'what is deep learning', 'chatgpt', 'future of ai', 'python vs javascript', 'ai ki', 'artificial intelligence'],
        keywords_bn: ['এআই কি', 'কৃত্রিম বুদ্ধিমত্তা', 'টেন্সর', 'মেশিন লার্নিং কি', 'ডিপ লার্নিং কি'],
        responses_en: [
          "<strong>Artificial Intelligence (AI)</strong> simulates human intelligence in machines. Deep Learning is a specialized branch using multi-layered artificial neural networks!",
          "In modern deep learning, <strong>Tensors</strong> are n-dimensional mathematical arrays that flow through network layers to adjust synaptic weights!"
        ],
        responses_bn: [
          "<strong>কৃত্রিম বুদ্ধিমত্তা (AI)</strong> হলো এমন প্রযুক্তি যা মানব মেধার মতো বিশ্লেষণ ও সিদ্ধান্ত নিতে পারে। ডিপ লার্নিং এর মধ্যে বহুস্তরের নিউরাল নেটওয়ার্ক ব্যবহৃত হয়।",
          "ডিপ লার্নিং-এ <strong>টেন্সর (Tensor)</strong> হলো বহুমাত্রিক গাণিতিক ম্যাট্রিক্স যা নিউরাল লেয়ারের মধ্য দিয়ে প্রবাহিত হয়ে ওয়েট (Weights) অ্যাডজাস্ট করে।"
        ]
      },
      {
        id: 'kb_origin',
        category: 'creator',
        title: 'Origin & Location (বাসস্থান ও পরিচয়)',
        keywords_en: ['where are you from', 'where do you live', 'where are you based', 'your location', 'country'],
        keywords_bn: ['কোথায় থাকো', 'কোথায় থাকিস', 'বাড়ি কোথায়', 'কোথা থেকে আসছো', 'তোমার বাড়ি কোথায়', 'তোমার দেশ কোথায়', 'বাড়ি কই', 'thako kothay', 'kothay thako', 'bari koi', 'bari kothay'],
        responses_en: [
          "I reside in the digital cloud and in your neural web interface, crafted with passion by <strong>Lutfor Rahman</strong> in Bangladesh! 🇧🇩",
          "My home is the neural cyberspace! I am powered by deep learning models designed in Bangladesh."
        ],
        responses_bn: [
          "আমি একটি ডিজিটাল নিউরাল ক্লাউড প্ল্যাটফর্মে এবং আপনার ব্রাউজারে বাস করি। আমাকে তৈরি করেছেন বাংলাদেশের এআই ইঞ্জিনিয়ার <strong>লুৎফর রহমান</strong>! 🇧🇩",
          "আমার নিবাস ডিজিটাল স্পেসে! তবে আমার কোডিং এবং প্রশিক্ষণ হয়েছে বাংলাদেশে।"
        ]
      },
      {
        id: 'kb_voice_help',
        category: 'tech',
        title: 'Voice & Bangla Speech (বাংলা ভয়েস ও কথা)',
        keywords_en: ['can you speak bangla', 'speak in bengali', 'bengali voice', 'bangla voice', 'talk in bangla'],
        keywords_bn: ['বাংলা কথা বলো', 'বাংলা বলো', 'বাংলা কথা বল', 'কথা বলো', 'কথা বল', 'ভয়েস বলো', 'বাংলা বলো না কেন', 'বাংলা বলিস না কেন', 'বাংলায় কথা বলো', 'বাংলা কথা বলতে পারো', 'bangla kotha bolo', 'bangla bolo', 'bangla kotha bole na kno'],
        responses_en: [
          "I have full bilingual voice intelligence! I can speak and listen in both Bengali and English in real-time.",
          "Yes! You can toggle the microphone to Bangla or type in Bengali, and my talking avatar will speak with synchronized lip movements!"
        ],
        responses_bn: [
          "আমি বাংলায় খুব সুন্দর ও স্পষ্টভাবে কথা বলতে পারি! 😊 আপনি মাইক্রোফোনে কথা বলুন বা টেক্সট লিখুন, আমি বাংলায় উত্তর দেব এবং আমার অবতার মুখে লিপ-সিঙ্ক করে কথা বলবে।",
          "হ্যাঁ, আমার নিউরাল ভয়েস ইঞ্জিন বাংলা ও ইংরেজি উভয় ভাষায় উচ্চ মানের কণ্ঠস্বরে কথা বলতে সক্ষম!"
        ]
      },
      {
        id: 'kb_portfolio_showcase',
        category: 'creator',
        title: 'Portfolio Showcase & Featured Works (পোর্টফোলিও শোকেস)',
        keywords_en: ['portfolio', 'portfolio showcase', 'show portfolio', 'view portfolio', 'my portfolio', 'lutfor portfolio', 'featured projects', 'what projects did you build', 'show projects', 'portfolio link'],
        keywords_bn: ['পোর্টফোলিও', 'পোর্টফোলিও দেখাও', 'প্রজেক্ট দেখাও', 'তোমার প্রজেক্ট কি কি', 'লুৎফরের পোর্টফোলিও', 'পোর্টফোলিও শোকেস', 'কি কি কাজ করেছ', 'প্রজেক্টগুলো দেখাও', 'তোমার কাজ দেখাও', 'portfolio dekhao', 'project dekhao', 'portfolio link'],
        responses_en: [
          "Here is <strong>Lutfor Rahman's</strong> Featured Engineering Portfolio Showcase:<br><br>" +
          "🤖 <strong>Neural Chat Bot:</strong> Real-time Talking Avatar & Multilingual Voice AI (<a href=\"https://neural-chat-bot.vercel.app\" target=\"_blank\" style=\"color:#00f2fe;\">Live Demo</a>)<br>" +
          "🚀 <strong>EduGenius AI:</strong> Interactive deep learning educational assistant (<a href=\"https://edugenius-ai-omega.vercel.app\" target=\"_blank\" style=\"color:#00f2fe;\">Live Demo</a>)<br>" +
          "🏨 <strong>Grand Aurelia:</strong> 5-Star Hotel Management Suite & POS (<a href=\"https://grand-aurelia-five.vercel.app\" target=\"_blank\" style=\"color:#00f2fe;\">Live Demo</a>)<br>" +
          "💳 <strong>IMX Daily Expense App:</strong> FinTech spending analytics & budget tracker (<a href=\"https://imx-daily-expense-app.vercel.app\" target=\"_blank\" style=\"color:#00f2fe;\">Live Demo</a>)<br>" +
          "🌐 <strong>SocialPulse Hub:</strong> Social Media Automation & AI Studio (<a href=\"https://lutfor-portfolio.vercel.app/socialpulse.html\" target=\"_blank\" style=\"color:#00f2fe;\">Live Demo</a>)<br>" +
          "🔒 <strong>SecureLock Vault:</strong> AES-256 military-grade file encryption (<a href=\"https://rokeyaag.github.io/SecureLock/\" target=\"_blank\" style=\"color:#00f2fe;\">Live Demo</a>)<br>" +
          "🏫 <strong>School Management AI:</strong> Comprehensive academic ERP system (<a href=\"https://school-management-ai-system.vercel.app\" target=\"_blank\" style=\"color:#00f2fe;\">Live Demo</a>)<br>" +
          "💼 <strong>Lutfor Official Portfolio:</strong> Full developer showcase (<a href=\"https://lutfor-portfolio.vercel.app\" target=\"_blank\" style=\"color:#00f2fe;\">Visit Portfolio</a>)<br><br>" +
          "💡 <em>You can also scroll down to the <strong>Portfolio Showcase</strong> section on this page to explore all project cards!</em>"
        ],
        responses_bn: [
          "এআই ও ফুল-স্ট্যাক ডেভেলপার <strong>লুৎফর রহমানের</strong> পোর্টফোলিও শোকেসের সেরা প্রজেক্টসমূহ:<br><br>" +
          "🤖 ১. <strong>Neural Chat Bot:</strong> রিয়েল-টাইম টকিং অবতার ও ভয়েস এআই (<a href=\"https://neural-chat-bot.vercel.app\" target=\"_blank\" style=\"color:#00f2fe;\">লাইভ ডেমো</a>)<br>" +
          "🎓 ২. <strong>EduGenius AI:</strong> স্মার্ট এডুকেশনাল এআই অ্যাসিস্ট্যান্ট (<a href=\"https://edugenius-ai-omega.vercel.app\" target=\"_blank\" style=\"color:#00f2fe;\">লাইভ ডেমো</a>)<br>" +
          "🏨 ৩. <strong>Grand Aurelia:</strong> লাক্সারি ৫-স্টার হোটেল ইআরপি ও পিওএস (<a href=\"https://grand-aurelia-five.vercel.app\" target=\"_blank\" style=\"color:#00f2fe;\">লাইভ ডেমো</a>)<br>" +
          "💰 ৪. <strong>IMX Daily Expense App:</strong> আয়-ব্যয় ও বাজেট ট্র্যাকার (<a href=\"https://imx-daily-expense-app.vercel.app\" target=\"_blank\" style=\"color:#00f2fe;\">লাইভ ডেমো</a>)<br>" +
          "📡 ৫. <strong>SocialPulse Hub:</strong> সোশ্যাল মিডিয়া অটো-পোস্টিং ও এআই ফটো স্টুডিও (<a href=\"https://lutfor-portfolio.vercel.app/socialpulse.html\" target=\"_blank\" style=\"color:#00f2fe;\">লাইভ ডেমো</a>)<br>" +
          "🔐 ৬. <strong>SecureLock Vault:</strong> AES-256 ফাইল সিকিউরিটি ভল্ট (<a href=\"https://rokeyaag.github.io/SecureLock/\" target=\"_blank\" style=\"color:#00f2fe;\">লাইভ ডেমো</a>)<br>" +
          "🏫 ৭. <strong>School Management AI:</strong> একাডেমি ও স্কুল ইআরপি প্ল্যাটফর্ম (<a href=\"https://school-management-ai-system.vercel.app\" target=\"_blank\" style=\"color:#00f2fe;\">লাইভ ডেমো</a>)<br>" +
          "🌐 ৮. <strong>Lutfor Portfolio:</strong> লুৎফর রহমানের অফিসিয়াল পোর্টফোলিও (<a href=\"https://lutfor-portfolio.vercel.app\" target=\"_blank\" style=\"color:#00f2fe;\">পোর্টফোলিও লিংক</a>)<br><br>" +
          "💡 <em>আপনি এই পেজের নিচের দিকে স্ক্রোল করে <strong>Portfolio Showcase</strong> সেকশনে সকল প্রজেক্ট কার্ড সরাসরি দেখতে পারেন!</em>"
        ]
      },
      {
        id: 'kb_github_all',
        category: 'github',
        title: 'GitHub Repositories & Projects (সকল গিটহাব প্রজেক্ট)',
        keywords_en: ['github projects', 'github repositories', 'all projects', 'show all repos', 'github portfolio', 'rokeyaag repos', 'what projects do you have', 'project list', 'github data', 'github repos', 'show projects', 'list of projects'],
        keywords_bn: ['সব প্রজেক্ট দেখাও', 'প্রজেক্টগুলো কি কি', 'তোমার প্রজেক্ট কি', 'কি কি প্রজেক্ট বানিয়েছ', 'গিটহাব রিপোজিটরি', 'গিটহাব ডাটা', 'প্রজেক্ট লিস্ট', 'সবগুলো প্রজেক্ট', 'গিটহাবে কি কি আছে', 'github e ki ache', 'sobgulo project', 'project list dekhao', 'github project', 'project gulo ki'],
        responses_en: [
          "Lutfor Rahman (<strong>rokeyaag</strong>) has built <strong>20 active projects</strong> on GitHub across AI, SaaS, Python Desktop, and Security:<br><br>• <strong>Neural Chat Bot</strong> — Deep Learning NLP Voice & Avatar AI (<a href=\"https://neural-chat-bot.vercel.app\" target=\"_blank\" style=\"color:#00f2fe;\">Live Demo</a>)<br>• <strong>EduGenius AI</strong> — Smart AI learning assistant (<a href=\"https://edugenius-ai-omega.vercel.app\" target=\"_blank\" style=\"color:#00f2fe;\">Live Demo</a>)<br>• <strong>Lutfor Portfolio</strong> — AI Engineer portfolio (<a href=\"https://lutfor-portfolio.vercel.app\" target=\"_blank\" style=\"color:#00f2fe;\">Live Demo</a>)<br>• <strong>IMX Daily Expense App</strong> — Financial analytics (<a href=\"https://imx-daily-expense-app.vercel.app\" target=\"_blank\" style=\"color:#00f2fe;\">Live Demo</a>)<br>• <strong>Grand Aurelia</strong> — Luxury digital web app (<a href=\"https://grand-aurelia-five.vercel.app\" target=\"_blank\" style=\"color:#00f2fe;\">Live Demo</a>)<br>• <strong>School Management AI</strong> — Academic ERP system (<a href=\"https://school-management-ai-system.vercel.app\" target=\"_blank\" style=\"color:#00f2fe;\">Live Demo</a>)<br>• <strong>Banking Desktop</strong> — Python financial software (<a href=\"https://rokeyaag.github.io/banking-desktop/\" target=\"_blank\" style=\"color:#00f2fe;\">Live Demo</a>)<br>• <strong>SecureLock</strong> — Cryptographic vault & file security<br>• <strong>AdCraft AI & AI Solutions</strong> — Marketing & automation systems<br>• <strong>E-Commerce Suite</strong> — IMX E-Shop, REST API, & Frontend<br><br>Explore all repositories at: <a href=\"https://github.com/rokeyaag\" target=\"_blank\" style=\"color:#00f2fe; text-decoration:underline;\">github.com/rokeyaag</a>"
        ],
        responses_bn: [
          "এআই ইঞ্জিনিয়ার লুৎফর রহমানের (rokeyaag) গিটহাবে রয়েছে <strong>২০টি চমৎকার প্রজেক্ট ও রিপোজিটরি</strong>:<br><br>১. <strong>Neural Chat Bot:</strong> রিয়েল-টাইম লিপ-সিঙ্ক ও ভয়েস চ্যাটবট (<a href=\"https://neural-chat-bot.vercel.app\" target=\"_blank\" style=\"color:#00f2fe;\">লাইভ ডেমো</a>)<br>২. <strong>EduGenius AI:</strong> স্মার্ট এডুকেশনাল এআই অ্যাসিস্ট্যান্ট (<a href=\"https://edugenius-ai-omega.vercel.app\" target=\"_blank\" style=\"color:#00f2fe;\">লাইভ ডেমো</a>)<br>৩. <strong>Lutfor Portfolio:</strong> এআই ডেভেলপার পোর্টফোলিও (<a href=\"https://lutfor-portfolio.vercel.app\" target=\"_blank\" style=\"color:#00f2fe;\">লাইভ ডেমো</a>)<br>৪. <strong>IMX Daily Expense App:</strong> আয়-ব্যয় ট্র্যাকিং সিস্টেম (<a href=\"https://imx-daily-expense-app.vercel.app\" target=\"_blank\" style=\"color:#00f2fe;\">লাইভ ডেমো</a>)<br>৫. <strong>Grand Aurelia:</strong> লাক্সারি ডিজিটাল ওয়েব প্ল্যাটফর্ম (<a href=\"https://grand-aurelia-five.vercel.app\" target=\"_blank\" style=\"color:#00f2fe;\">লাইভ ডেমো</a>)<br>৬. <strong>School Management AI:</strong> স্কুল ও একাডেমি ইআরপি (<a href=\"https://school-management-ai-system.vercel.app\" target=\"_blank\" style=\"color:#00f2fe;\">লাইভ ডেমো</a>)<br>৭. <strong>Banking Desktop:</strong> পাইথন ব্যাংকিং ডেস্কটপ সফটওয়্যার (<a href=\"https://rokeyaag.github.io/banking-desktop/\" target=\"_blank\" style=\"color:#00f2fe;\">লাইভ ডেমো</a>)<br>৮. <strong>SecureLock:</strong> ফাইল এনক্রিপশন ও সাইবার সিকিউরিটি ভল্ট<br>৯. <strong>AdCraft AI &amp; AI Solutions:</strong> এডভার্টাইজমেন্ট ও বিজনেস অটোমেশন<br>১০. <strong>E-Commerce System:</strong> ফুল-স্ট্যাক ইশপ ও রেস্ট এপিআই<br><br>সবগুলো প্রজেক্টের কোড দেখতে ভিজিট করুন: <a href=\"https://github.com/rokeyaag\" target=\"_blank\" style=\"color:#00f2fe; text-decoration:underline;\">github.com/rokeyaag</a>"
        ]
      },
      {
        id: 'kb_repo_edugenius',
        category: 'github',
        title: 'EduGenius AI (এডুজেনিয়াস এআই)',
        keywords_en: ['edugenius', 'edugenius ai', 'edugenius-ai', 'educational ai', 'education assistant', 'learning ai'],
        keywords_bn: ['এডুজেনিয়াস', 'এডুজেনিয়াস এআই', 'শিক্ষা এআই', 'edugenius ki', 'edugenius ai ki', 'edugenius project'],
        responses_en: [
          "<strong>EduGenius AI</strong> is an intelligent educational and interactive learning assistant platform built by Lutfor Rahman.<br>• <strong>Live Demo:</strong> <a href=\"https://edugenius-ai-omega.vercel.app\" target=\"_blank\" style=\"color:#00f2fe;\">edugenius-ai-omega.vercel.app</a><br>• <strong>GitHub Repo:</strong> <a href=\"https://github.com/rokeyaag/edugenius-ai\" target=\"_blank\" style=\"color:#00f2fe;\">github.com/rokeyaag/edugenius-ai</a>"
        ],
        responses_bn: [
          "<strong>EduGenius AI</strong> হলো লুৎফর রহমানের তৈরি একটি আধুনিক কৃত্রিম বুদ্ধিমত্তাসম্পন্ন শিক্ষা প্ল্যাটফর্ম যা শিক্ষার্থীদের তাৎক্ষণিক পড়াশোনার সাহায্য ও প্রশ্নের উত্তর দেয়।<br>• <strong>লাইভ ডেমো:</strong> <a href=\"https://edugenius-ai-omega.vercel.app\" target=\"_blank\" style=\"color:#00f2fe;\">edugenius-ai-omega.vercel.app</a><br>• <strong>গিটহাব:</strong> <a href=\"https://github.com/rokeyaag/edugenius-ai\" target=\"_blank\" style=\"color:#00f2fe;\">github.com/rokeyaag/edugenius-ai</a>"
        ]
      },
      {
        id: 'kb_repo_portfolio',
        category: 'github',
        title: 'Lutfor Portfolio (লুৎফর পোর্টফোলিও)',
        keywords_en: ['lutfor portfolio', 'portfolio website', 'developer portfolio', 'lutfor-portfolio', 'portfolio', 'portfolio site'],
        keywords_bn: ['পোর্টফোলিও', 'লুৎফরের পোর্টফোলিও', 'পোর্টফোলিও ওয়েবসাইট', 'portfolio link', 'portfolio dekhao'],
        responses_en: [
          "<strong>Lutfor Rahman's Official AI Portfolio</strong> showcases his machine learning models, full-stack web applications, and interactive UI engineering.<br>• <strong>Live Demo:</strong> <a href=\"https://lutfor-portfolio.vercel.app\" target=\"_blank\" style=\"color:#00f2fe;\">lutfor-portfolio.vercel.app</a><br>• <strong>GitHub:</strong> <a href=\"https://github.com/rokeyaag/lutfor-portfolio\" target=\"_blank\" style=\"color:#00f2fe;\">github.com/rokeyaag/lutfor-portfolio</a>"
        ],
        responses_bn: [
          "<strong>লুৎফর রহমানের অফিসিয়াল এআই ও ফুল-স্ট্যাক পোর্টফোলিও:</strong> এখানে তাঁর সকল ডিপ লার্নিং মডেল, সফটওয়্যার আর্কিটেকচার এবং লাইভ প্রজেক্ট প্রদর্শিত হয়েছে।<br>• <strong>লাইভ সাইট:</strong> <a href=\"https://lutfor-portfolio.vercel.app\" target=\"_blank\" style=\"color:#00f2fe;\">lutfor-portfolio.vercel.app</a><br>• <strong>গিটহাব:</strong> <a href=\"https://github.com/rokeyaag/lutfor-portfolio\" target=\"_blank\" style=\"color:#00f2fe;\">github.com/rokeyaag/lutfor-portfolio</a>"
        ]
      },
      {
        id: 'kb_repo_dailyexpense',
        category: 'github',
        title: 'IMX Daily Expense App (ডেইলি এক্সপেন্স ট্র্যাকার)',
        keywords_en: ['daily expense', 'expense tracker', 'imx daily expense', 'imxdailyexpenseapp', 'imx-daily-expense-backend', 'expense app'],
        keywords_bn: ['ডেইলি এক্সপেন্স', 'খরচ ট্র্যাকার', 'হিসাব অ্যাপ', 'আয় ব্যয় অ্যাপ', 'daily expense ki', 'expense tracker ki'],
        responses_en: [
          "<strong>IMX Daily Expense App</strong> is a full-stack financial tracking suite with Python backend & JavaScript frontend for real-time expense calculations and budget reports.<br>• <strong>Live Demo:</strong> <a href=\"https://imx-daily-expense-app.vercel.app\" target=\"_blank\" style=\"color:#00f2fe;\">imx-daily-expense-app.vercel.app</a><br>• <strong>GitHub:</strong> <a href=\"https://github.com/rokeyaag/IMXDailyExpenseApp\" target=\"_blank\" style=\"color:#00f2fe;\">github.com/rokeyaag/IMXDailyExpenseApp</a>"
        ],
        responses_bn: [
          "<strong>IMX Daily Expense App:</strong> এটি দৈনন্দিন খরচ ও আর্থিক লেনদেন ট্র্যাক এবং বিশ্লেষণ করার একটি ফুল-স্ট্যাক অ্যাপ (পাইথন ব্যাকএন্ড ও জাভাস্ক্রিপ্ট ফ্রন্টএন্ড)।<br>• <strong>লাইভ ডেমো:</strong> <a href=\"https://imx-daily-expense-app.vercel.app\" target=\"_blank\" style=\"color:#00f2fe;\">imx-daily-expense-app.vercel.app</a><br>• <strong>গিটহাব:</strong> <a href=\"https://github.com/rokeyaag/IMXDailyExpenseApp\" target=\"_blank\" style=\"color:#00f2fe;\">github.com/rokeyaag/IMXDailyExpenseApp</a>"
        ]
      },
      {
        id: 'kb_repo_grandaurelia',
        category: 'github',
        title: 'Grand Aurelia (গ্র্যান্ড অরেলিয়া)',
        keywords_en: ['grand aurelia', 'grand-aurelia', 'luxury website', 'hotel website', 'grand aurelia web'],
        keywords_bn: ['গ্র্যান্ড অরেলিয়া', 'গ্র্যান্ড অরেলিয়া', 'grand aurelia ki', 'grand aurelia project'],
        responses_en: [
          "<strong>Grand Aurelia</strong> is an ultra-premium, high-end digital web application with glassmorphic visuals and fluid animations.<br>• <strong>Live Demo:</strong> <a href=\"https://grand-aurelia-five.vercel.app\" target=\"_blank\" style=\"color:#00f2fe;\">grand-aurelia-five.vercel.app</a><br>• <strong>GitHub:</strong> <a href=\"https://github.com/rokeyaag/grand-aurelia\" target=\"_blank\" style=\"color:#00f2fe;\">github.com/rokeyaag/grand-aurelia</a>"
        ],
        responses_bn: [
          "<strong>Grand Aurelia:</strong> এটি একটি আধুনিক লাক্সারি ডিজিটাল ওয়েব অ্যাপ্লিকেশন, যাতে রয়েছে ডায়নামিক ইউজার এক্সপেরিয়েন্স ও আকর্ষণীয় সাইবার ইন্টারফেস।<br>• <strong>লাইভ ডেমো:</strong> <a href=\"https://grand-aurelia-five.vercel.app\" target=\"_blank\" style=\"color:#00f2fe;\">grand-aurelia-five.vercel.app</a><br>• <strong>গিটহাব:</strong> <a href=\"https://github.com/rokeyaag/grand-aurelia\" target=\"_blank\" style=\"color:#00f2fe;\">github.com/rokeyaag/grand-aurelia</a>"
        ]
      },
      {
        id: 'kb_repo_school',
        category: 'github',
        title: 'School Management AI System (স্কুল ম্যানেজমেন্ট সিস্টেম)',
        keywords_en: ['school management', 'school management ai', 'school-management-ai-system', 'school-management-web', 'academic erp'],
        keywords_bn: ['স্কুল ম্যানেজমেন্ট', 'স্কুল সফটওয়্যার', 'শিক্ষা প্রতিষ্ঠান সফটওয়্যার', 'school management ki', 'school erp'],
        responses_en: [
          "<strong>School Management AI System</strong> is a Python-powered academic management platform handling student records, attendance, grades, and automated administrative operations.<br>• <strong>Live Demo:</strong> <a href=\"https://school-management-ai-system.vercel.app\" target=\"_blank\" style=\"color:#00f2fe;\">school-management-ai-system.vercel.app</a><br>• <strong>GitHub:</strong> <a href=\"https://github.com/rokeyaag/school-management-ai-system\" target=\"_blank\" style=\"color:#00f2fe;\">github.com/rokeyaag/school-management-ai-system</a>"
        ],
        responses_bn: [
          "<strong>School Management AI System:</strong> পাইথনে তৈরি একাডেমিক ইআরপি সিস্টেম, যা শিক্ষার্থী ভর্তি, হাজিরা, পরীক্ষার ফলাফল এবং অটোমেটেড রিপোর্ট তৈরি করে।<br>• <strong>লাইভ ডেমো:</strong> <a href=\"https://school-management-ai-system.vercel.app\" target=\"_blank\" style=\"color:#00f2fe;\">school-management-ai-system.vercel.app</a><br>• <strong>গিটহাব:</strong> <a href=\"https://github.com/rokeyaag/school-management-ai-system\" target=\"_blank\" style=\"color:#00f2fe;\">github.com/rokeyaag/school-management-ai-system</a>"
        ]
      },
      {
        id: 'kb_repo_banking',
        category: 'github',
        title: 'Banking Desktop Application (ব্যাংকিং ডেস্কটপ সফটওয়্যার)',
        keywords_en: ['banking desktop', 'banking-desktop', 'banking app', 'python banking', 'desktop banking'],
        keywords_bn: ['ব্যাংকিং ডেস্কটপ', 'ব্যাংক সফটওয়্যার', 'ব্যাংকিং অ্যাপ', 'banking software', 'banking app ki'],
        responses_en: [
          "<strong>Banking Desktop</strong> is a Python desktop software for banking operations, secure account authentication, deposit/withdrawal calculations, and customer transaction logs.<br>• <strong>Live Demo:</strong> <a href=\"https://rokeyaag.github.io/banking-desktop/\" target=\"_blank\" style=\"color:#00f2fe;\">rokeyaag.github.io/banking-desktop</a><br>• <strong>GitHub:</strong> <a href=\"https://github.com/rokeyaag/banking-desktop\" target=\"_blank\" style=\"color:#00f2fe;\">github.com/rokeyaag/banking-desktop</a>"
        ],
        responses_bn: [
          "<strong>Banking Desktop App:</strong> পাইথনে তৈরি নিরাপদ ব্যাংকিং ডেস্কটপ সফটওয়্যার যা গ্রাহক একাউন্ট, ব্যালেন্স, জমা/উত্তোলন এবং ট্রানজেকশন হিস্ট্রি পরিচালনা করে।<br>• <strong>লাইভ ভিউ:</strong> <a href=\"https://rokeyaag.github.io/banking-desktop/\" target=\"_blank\" style=\"color:#00f2fe;\">rokeyaag.github.io/banking-desktop</a><br>• <strong>গিটহাব:</strong> <a href=\"https://github.com/rokeyaag/banking-desktop\" target=\"_blank\" style=\"color:#00f2fe;\">github.com/rokeyaag/banking-desktop</a>"
        ]
      },
      {
        id: 'kb_repo_securelock',
        category: 'github',
        title: 'SecureLock (সিকিউর লক — ফাইল ভল্ট)',
        keywords_en: ['securelock', 'secure lock', 'encryption', 'vault', 'file locker', 'security', 'cyber security'],
        keywords_bn: ['সিকিউর লক', 'এনক্রিপশন', 'ফাইল ভল্ট', 'পাসওয়ার্ড সিকিউরিটি', 'securelock ki', 'file lock'],
        responses_en: [
          "<strong>SecureLock</strong> is a Python cybersecurity and cryptographic vault application that encrypts sensitive files and protects credentials with military-grade algorithms.<br>• <strong>GitHub Repo:</strong> <a href=\"https://github.com/rokeyaag/SecureLock\" target=\"_blank\" style=\"color:#00f2fe;\">github.com/rokeyaag/SecureLock</a>"
        ],
        responses_bn: [
          "<strong>SecureLock:</strong> পাইথনে তৈরি একটি শক্তিশালী সাইবার সিকিউরিটি ও এনক্রিপশন ভল্ট সফটওয়্যার, যা গুরুত্বপূর্ণ ফাইল ও ডেটা সুরক্ষিত লক করে রাখে।<br>• <strong>গিটহাব রিপোজিটরি:</strong> <a href=\"https://github.com/rokeyaag/SecureLock\" target=\"_blank\" style=\"color:#00f2fe;\">github.com/rokeyaag/SecureLock</a>"
        ]
      },
      {
        id: 'kb_repo_adcraft',
        category: 'github',
        title: 'AdCraft AI (অ্যাডক্রাফট এআই)',
        keywords_en: ['adcraft', 'adcraft ai', 'adcraft-ai', 'ai ad generator', 'ad creation', 'marketing ai'],
        keywords_bn: ['অ্যাডক্রাফট', 'বিজ্ঞাপন এআই', 'অ্যাড জেনারেটর', 'adcraft ki', 'marketing bot'],
        responses_en: [
          "<strong>AdCraft AI</strong> is an automated marketing AI engine built with TypeScript to generate persuasive ad copies, campaign copy, and marketing assets.<br>• <strong>GitHub Repo:</strong> <a href=\"https://github.com/rokeyaag/adcraft-ai\" target=\"_blank\" style=\"color:#00f2fe;\">github.com/rokeyaag/adcraft-ai</a>"
        ],
        responses_bn: [
          "<strong>AdCraft AI:</strong> টাইপস্ক্রিপ্টে তৈরি কৃত্রিম বুদ্ধিমত্তাসম্পন্ন অ্যাডভার্টাইজমেন্ট ও কনটেন্ট ক্রিয়েটর টুল যা ডিজিটাল মার্কেটিং কপি দ্রুত তৈরি করে।<br>• <strong>গিটহাব:</strong> <a href=\"https://github.com/rokeyaag/adcraft-ai\" target=\"_blank\" style=\"color:#00f2fe;\">github.com/rokeyaag/adcraft-ai</a>"
        ]
      },
      {
        id: 'kb_repo_aisolutions',
        category: 'github',
        title: 'AI Solutions (এআই সলিউশন)',
        keywords_en: ['ai solutions', 'ai-solutions', 'enterprise ai', 'automation services', 'ai service'],
        keywords_bn: ['এআই সলিউশন', 'এআই সার্ভিস', 'ai solutions ki', 'automation ki'],
        responses_en: [
          "<strong>AI Solutions</strong> is a modern web platform providing client-ready AI automation workflows and integration services.<br>• <strong>Live Demo:</strong> <a href=\"https://ai-solutions-roan.vercel.app\" target=\"_blank\" style=\"color:#00f2fe;\">ai-solutions-roan.vercel.app</a><br>• <strong>GitHub:</strong> <a href=\"https://github.com/rokeyaag/ai-solutions\" target=\"_blank\" style=\"color:#00f2fe;\">github.com/rokeyaag/ai-solutions</a>"
        ],
        responses_bn: [
          "<strong>AI Solutions:</strong> আধুনিক ক্লায়েন্ট ও ব্যবসায়িক এআই অটোমেশন এবং ডিজিটাল ইন্টিগ্রেশনের সমাধান প্ল্যাটফর্ম।<br>• <strong>লাইভ ডেমো:</strong> <a href=\"https://ai-solutions-roan.vercel.app\" target=\"_blank\" style=\"color:#00f2fe;\">ai-solutions-roan.vercel.app</a><br>• <strong>গিটহাব:</strong> <a href=\"https://github.com/rokeyaag/ai-solutions\" target=\"_blank\" style=\"color:#00f2fe;\">github.com/rokeyaag/ai-solutions</a>"
        ]
      },
      {
        id: 'kb_repo_ecommerce',
        category: 'github',
        title: 'IMX E-Shop & E-Commerce API (ই-কমার্স প্ল্যাটফর্ম)',
        keywords_en: ['ecommerce', 'e-commerce', 'imx-eshop', '-ecommerce-frontend', 'ecommerce-api', 'eshop', 'online store'],
        keywords_bn: ['ই-কমার্স', 'ইকমার্স', 'ইশপ', 'অনলাইন শপ', 'ecommerce ki', 'eshop ki'],
        responses_en: [
          "<strong>IMX E-Shop & E-Commerce API</strong> is a comprehensive shopping solution with product catalogs, shopping cart, REST API backend, and responsive frontend UI.<br>• <strong>Live Frontend:</strong> <a href=\"https://ecommerce-frontend-tawny-two.vercel.app\" target=\"_blank\" style=\"color:#00f2fe;\">ecommerce-frontend-tawny-two.vercel.app</a><br>• <strong>Backend API:</strong> <a href=\"https://github.com/rokeyaag/ecommerce-api\" target=\"_blank\" style=\"color:#00f2fe;\">github.com/rokeyaag/ecommerce-api</a>"
        ],
        responses_bn: [
          "<strong>IMX E-Shop &amp; E-Commerce API:</strong> পূর্ণাঙ্গ ই-কমার্স ইকোসিস্টেম যাতে রয়েছে পণ্য ক্যাটালগ, কার্ট ও অর্ডার ম্যানেজমেন্ট এবং নিরাপদ REST API।<br>• <strong>লাইভ সাইট:</strong> <a href=\"https://ecommerce-frontend-tawny-two.vercel.app\" target=\"_blank\" style=\"color:#00f2fe;\">ecommerce-frontend-tawny-two.vercel.app</a><br>• <strong>এপিআই রিপো:</strong> <a href=\"https://github.com/rokeyaag/ecommerce-api\" target=\"_blank\" style=\"color:#00f2fe;\">github.com/rokeyaag/ecommerce-api</a>"
        ]
      },
      {
        id: 'kb_repo_socialautomation',
        category: 'github',
        title: 'Social Automation Hub (সোশ্যাল অটোমেশন হাব)',
        keywords_en: ['social automation', 'social-automation-hub', 'social media automation', 'auto posting', 'social bot'],
        keywords_bn: ['সোশ্যাল অটোমেশন', 'সোশ্যাল মিডিয়া অটোমেশন', 'social automation ki', 'auto post bot'],
        responses_en: [
          "<strong>Social Automation Hub</strong> streamlines multi-channel social media scheduling, content distribution, and analytics.<br>• <strong>GitHub Repo:</strong> <a href=\"https://github.com/rokeyaag/social-automation-hub\" target=\"_blank\" style=\"color:#00f2fe;\">github.com/rokeyaag/social-automation-hub</a>"
        ],
        responses_bn: [
          "<strong>Social Automation Hub:</strong> একাধিক সোশ্যাল মিডিয়া প্ল্যাটফর্মে স্বয়ংক্রিয় কনটেন্ট পোস্টিং এবং শিডিউলিং ম্যানেজমেন্ট হাব।<br>• <strong>গিটহাব:</strong> <a href=\"https://github.com/rokeyaag/social-automation-hub\" target=\"_blank\" style=\"color:#00f2fe;\">github.com/rokeyaag/social-automation-hub</a>"
        ]
      },
      {
        id: 'kb_repo_microservices_trading',
        category: 'github',
        title: 'Microservices & IMX Trading (মাইক্রোসার্ভিস ও ট্রেডিং)',
        keywords_en: ['microservices', 'microservices-api-system', 'imx-trading', 'trading', 'info-bangla'],
        keywords_bn: ['মাইক্রোসার্ভিস', 'ট্রেডিং', 'ট্রেডিং সিস্টেম', 'ইনফো বাংলা', 'microservices ki'],
        responses_en: [
          "<strong>Microservices API & IMX Trading</strong> explore scalable backend service clustering, real-time market data visualizers, and Bengali informational portals.<br>• <strong>Microservices:</strong> <a href=\"https://github.com/rokeyaag/microservices-api-system\" target=\"_blank\" style=\"color:#00f2fe;\">github.com/rokeyaag/microservices-api-system</a><br>• <strong>Trading:</strong> <a href=\"https://github.com/rokeyaag/imx-trading\" target=\"_blank\" style=\"color:#00f2fe;\">github.com/rokeyaag/imx-trading</a>"
        ],
        responses_bn: [
          "<strong>Microservices API &amp; IMX Trading:</strong> হাই-স্কেলেবল মাইক্রোসার্ভিস আর্কিটেকচার এবং ফিনান্সিয়াল মার্কেট ট্রেডিং অ্যানালিটিক্স প্রজেক্ট।<br>• <strong>মাইক্রোসার্ভিস:</strong> <a href=\"https://github.com/rokeyaag/microservices-api-system\" target=\"_blank\" style=\"color:#00f2fe;\">github.com/rokeyaag/microservices-api-system</a><br>• <strong>ট্রেডিং:</strong> <a href=\"https://github.com/rokeyaag/imx-trading\" target=\"_blank\" style=\"color:#00f2fe;\">github.com/rokeyaag/imx-trading</a>"
        ]
      },
      {
        id: 'mem_tryhackme_overview',
        category: 'tech',
        title: 'TryHackMe ও ড্যাশবোর্ড পরিচিতি (TryHackMe Overview)',
        keywords_en: ['tryhackme', 'tryhack me', 'what is tryhackme', 'what is tryhack me', 'tryhackme dashboard', 'thm', 'tryhackme.com', 'tryhackme overview', 'about tryhackme', 'tell me about tryhackme'],
        keywords_bn: ['tryhackme কি', 'tryhack me কি', 'tryhackme ki', 'tryhack me ki', 'ট্রাইহ্যাকমি কি', 'tryhackme dashboard কি', 'ট্রাইহ্যাকমি পরিচিতি', 'tryhackme সম্পর্কে বলো', 'tryhackme somporke bolo', 'try hack me somporke bolo', 'tryhackme somporkey idea daow', 'tryhackme somporkey idea daow', 'tryhackme somporke idea daow', 'try hack me somporke idea daow', 'tryhackme idea', 'tryhackme কি এবং এর ড্যাশবোর্ডে কি কি দেখা যায়', 'ড্যাশবোর্ডে কি কি দেখা যায়'],
        responses_en: [
          "🎯 <strong>TryHackMe (THM):</strong> A premier hands-on online platform for learning cybersecurity and ethical hacking through gamified, browser-based virtual labs.<br><br>• <strong>Dashboard Features:</strong> Shows daily learning streaks, active Learning Paths, completed rooms, total points, global rank, and recommended modules.<br>• <strong>Official Website:</strong> <a href='https://tryhackme.com' target='_blank' style='color:#00f2fe;'>tryhackme.com</a>"
        ],
        responses_bn: [
          "🎯 <strong>TryHackMe (THM):</strong> সাইবার সিকিউরিটি ও এথিক্যাল হ্যাকিং শেখার জন্য বিশ্বের অন্যতম সেরা ও জনপ্রিয় প্র্যাকটিক্যাল ল্যাব প্ল্যাটফর্ম।<br><br>• <strong>ড্যাশবোর্ডের সুবিধা:</strong> আপনার দৈনিক প্র্যাকটিস স্ট্রিক (Streak), বর্তমান লার্নিং পাথ, কমপ্লিট করা রুমের সংখ্যা, অর্জিত পয়েন্ট এবং গ্লোবাল র‍্যাঙ্ক দেখা যায়।<br>• <strong>অফিসিয়াল ওয়েবসাইট:</strong> <a href='https://tryhackme.com' target='_blank' style='color:#00f2fe;'>tryhackme.com</a>"
        ]
      },
      {
        id: 'mem_tryhackme_topics_modules',
        category: 'tech',
        title: 'TryHackMe তে শেখানো বিষয় ও টুলস (Topics & Security Tools Covered)',
        keywords_en: [
          'tryhackme topics',
          'what can i learn on tryhackme',
          'thm tools',
          'tryhackme tools',
          'tryhackme security tools',
          'security tools in tryhackme',
          'tools taught in tryhackme',
          'what security tools are taught in tryhackme',
          'wireshark burpsuite nmap on thm',
          'what tools are on tryhackme'
        ],
        keywords_bn: [
          'tryhackme te ki ki security tools sekhano hoy',
          'try hack me te ki ki security tools sekhano hoy',
          'tryhackme te ki ki tools sekhano hoy',
          'tryhackme security tools sekhano hoy',
          'tryhackme te ki ki security tools ache',
          'tryhackme tools sekhano hoy',
          'tryhackme তে কি কি শেখা যায়',
          'tryhackme topics কি কি',
          'কি কি টুলস শেখায়',
          'tryhackme তে কি কি সিকিউরিটি টুলস শেখানো হয়',
          'tryhackme তে কি কি টুলস শেখানো হয়',
          'tryhackme সিকিউরিটি টুলস',
          'ট্রাইহ্যাকমি টুলস',
          'সিকিউরিটি টুলস কি কি',
          'লিনাক্স ওয়্যারশার্ক বার্প স্যুট'
        ],
        responses_en: [
          '🛠️ <strong>Security & Hacking Tools Covered on TryHackMe:</strong><br><br>TryHackMe teaches end-to-end hands-on usage of industry-standard cybersecurity tools across Offensive & Defensive security:<br><br>🔹 <strong>Network Scanning & Reconnaissance:</strong><br>• <strong>Nmap:</strong> Port scanning, service enumeration, and OS detection.<br>• <strong>Wireshark:</strong> Packet capture and live network traffic analysis.<br>• <strong>Gobuster & Dirb:</strong> Web directory and subdomain brute-forcing.<br><br>🔹 <strong>Web Application Security (Web Pentesting):</strong><br>• <strong>Burp Suite & OWASP ZAP:</strong> Intercepting HTTP traffic, testing for OWASP Top 10 flaws (SQLi, XSS, SSRF).<br>• <strong>SQLmap:</strong> Automated SQL injection exploitation and database extraction.<br>• <strong>Nikto:</strong> Web server security vulnerability and misconfiguration scanning.<br><br>🔹 <strong>Exploitation & Password Cracking:</strong><br>• <strong>Metasploit Framework (MSF):</strong> Exploit execution, payload crafting, and Meterpreter shells.<br>• <strong>John the Ripper & Hashcat:</strong> High-speed cryptographic hash and password cracking.<br>• <strong>Hydra:</strong> Online login portal brute-force attacks (SSH, FTP, HTTP, RDP).<br><br>🔹 <strong>SOC, Blue Team & Forensics:</strong><br>• <strong>Splunk:</strong> SIEM log monitoring, threat hunting, and detection rule development.<br>• <strong>Snort & Suricata:</strong> Network intrusion detection systems (NIDS).<br>• <strong>Volatility & Autopsy:</strong> Memory forensics and disk artifact analysis.<br>• <strong>Ghidra:</strong> Reverse engineering binary executables and malware analysis.'
        ],
        responses_bn: [
          '🛠️ <strong>TryHackMe প্ল্যাটফর্মে শেখানো প্রধান সিকিউরিটি ও হ্যাকিং টুলস:</strong><br><br>TryHackMe-তে থিওরির পাশাপাশি ল্যাবভিত্তিক প্র্যাকটিক্যাল পরিবেশে ইন্ডাস্ট্রির সেরা টুলসগুলোর ব্যবহার শেখানো হয়:<br><br>🔹 <strong>নেটওয়ার্ক স্ক্যানিং ও রিকন (Reconnaissance):</strong><br>• <strong>Nmap:</strong> পোর্ট স্ক্যানিং, ওএস এবং ওপেন সার্ভিস ডিটেকশন।<br>• <strong>Wireshark:</strong> নেটওয়ার্ক প্যাকেট ক্যাপচার ও লাইভ ট্র্যাফিক অ্যানালাইসিস।<br>• <strong>Gobuster & Dirb:</strong> ডিরেক্টরি এবং সাবডোমেন ব্রুটফোর্সিং।<br><br>🔹 <strong>ওয়েব সিকিউরিটি (Web Pentesting):</strong><br>• <strong>Burp Suite & OWASP ZAP:</strong> এইচটিটিপি রিকোয়েস্ট ইন্টারসেপ্ট ও ওয়েব দুর্বলতা (SQLi, XSS, CSRF) টেস্ট।<br>• <strong>SQLmap:</strong> স্বয়ংক্রিয় এসকিউএল ইনজেকশন ডিটেকশন ও ডেটাবেজ এক্সপ্লয়েটেশন।<br>• <strong>Nikto:</strong> ওয়েব সার্ভার মিসকনফিগারেশন ও দুর্বলতা স্ক্যানিং।<br><br>🔹 <strong>এক্সপ্লয়টেশন ও পাসওয়ার্ড ক্র্যাকিং:</strong><br>• <strong>Metasploit Framework:</strong> সিস্টেমে দুর্বলতা কাজে লাগিয়ে রিমোট শেল ও পেলোড এক্সিকিউশন।<br>• <strong>John the Ripper & Hashcat:</strong> অফলাইন পাসওয়ার্ড ও ক্রিপ্টোগ্রাফিক হ্যাশ ক্র্যাকিং।<br>• <strong>Hydra:</strong> অনলাইন লগইন পোর্টাল ব্রুটফোর্স (SSH, FTP, HTTP)।<br><br>🔹 <strong>ব্লু টিম, এসওসি ও ফরেনসিক্স (SOC & Blue Team):</strong><br>• <strong>Splunk:</strong> এসআইইএম (SIEM) লগ অ্যানালাইসিস ও থ্রেট ডিটেকশন।<br>• <strong>Snort:</strong> নেটওয়ার্ক ইন্ট্রুশন ডিটেকশন সিস্টেম (NIDS)।<br>• <strong>Autopsy & Volatility:</strong> ডিজিটাল মেমোরি ও ডিস্ক ফরেনসিক্স।<br>• <strong>Ghidra:</strong> রিভার্স ইঞ্জিনিয়ারিং এবং ম্যালওয়্যার অ্যানালাইসিস।'
        ]
      },
      {
        id: 'mem_tryhackme_koth_multiplayer',
        category: 'tech',
        title: 'King of the Hill (KotH) মাল্টিপ্লেয়ার হ্যাকিং গেম (Competitive Hacking)',
        keywords_en: [
          'king of the hill',
          'koth',
          'king of the hill thm',
          'koth tryhackme',
          'multiplayer hacking game',
          'competitive ctf tryhackme',
          'how does king of the hill work',
          'tryhackme koth rules'
        ],
        keywords_bn: [
          'king of the hill কি',
          'king of the hill হ্যাকিং গেম কি',
          'koth কি',
          'koth tryhackme',
          'মাল্টিপ্লেয়ার হ্যাকিং',
          'tryhackme গেম',
          'কিং অফ দ্য হিল কি',
          'tryhackme koth কিভাবে খেলে',
          'king of the hill গেম কি'
        ],
        responses_en: [
          '👑 <strong>TryHackMe King of the Hill (KotH) Multiplayer Battle:</strong><br><br><strong>King of the Hill (KotH)</strong> is a fast-paced, real-time multiplayer competitive hacking battle on TryHackMe where 4 to 8 players simultaneously compete on the same vulnerable target machine.<br><br>🎯 <strong>How It Works & Game Mechanics:</strong><br>1. <strong>Compromise & Root:</strong> Players race to discover vulnerabilities, exploit them, and gain root/admin access on the target server.<br>2. <strong>Claim the King:</strong> Write your username into <code>/root/king.txt</code>. As long as your name remains written there, you earn 10 points every single minute.<br>3. <strong>Defense & Patching:</strong> Once inside, you must patch vulnerabilities, remove rival backdoors, and defend root access to keep others from overwriting your name.<br>4. <strong>Flag Hunting:</strong> Find and submit hidden flags across the system for bonus points.<br><br>💡 <strong>Benefit:</strong> Builds intense real-time Red Teaming (Exploitation) and Blue Teaming (Hardening/Patching) skills under pressure.'
        ],
        responses_bn: [
          '👑 <strong>King of the Hill (KotH) মাল্টিপ্লেয়ার হ্যাকিং গেম:</strong><br><br><strong>King of the Hill (KotH)</strong> হলো TryHackMe প্ল্যাটফর্মের একটি রোমাঞ্চকর <strong>রিয়েল-টাইম মাল্টিপ্লেয়ার অ্যাটাক ও ডিফেন্স হ্যাকিং প্রতিযোগিতা</strong> (সাধারণত ৪-৮ জন প্রতিযোগী থাকে)।<br><br>🎯 <strong>গেমের নিয়ম ও কার্যপদ্ধতি:</strong><br>১. <strong>রুট অ্যাক্সেস (Root Access):</strong> প্রতিযোগীরা একই দুর্বল সার্ভার হ্যাক করার চেষ্টা করে এবং দ্রুততম সময়ে রুট বা অ্যাডমিন প্রিভিলেজ নেয়।<br>২. <strong>কিং হওয়া (King Status):</strong> সার্ভারের <code>/root/king.txt</code> ফাইলে নিজের ইউজারনেম লিখতে হয়। যতক্ষণ আপনার নাম থাকবে, প্রতি ১ মিনিটে আপনি ১০ পয়েন্ট করে পেতে থাকবেন।<br>৩. <strong>প্যাচিং ও ডিফেন্স (Defense/Patching):</strong> রুট অ্যাক্সেস নেওয়ার পর সিস্টেমের দুর্বলতাগুলো বন্ধ বা প্যাচ করতে হয় এবং ব্যাকডোর মুছে ফেলতে হয়, যাতে অন্য হ্যাকাররা ঢুকে আপনার নাম সরাতে না পারে।<br>৪. <strong>ফ্ল্যাগ হান্টিং:</strong> সার্ভারের ভেতরে বিভিন্ন জায়গায় লুকানো গোপন ফ্ল্যাগ খুঁজে বের করে অতিরিক্ত বোনাস পয়েন্ট নেওয়া যায়।<br><br>💡 <strong>উপকারিতা:</strong> এটি একই সাথে আক্রমণাত্মক (Red Team) এবং প্রতিরক্ষামূলক (Blue Team) দক্ষতার অসাধারণ সংমিশ্রণ শেখায়।'
        ]
      },
      {
        id: 'mem_tryhackme_career_benefit',
        category: 'tech',
        title: 'TryHackMe সাপোর্ট ও সাইবার সিকিউরিটি ক্যারিয়ারের সুবিধা (Support & Career Benefits)',
        keywords_en: [
          'tryhackme support',
          'how does tryhackme support me',
          'what support does tryhackme give',
          'tryhackme benefits',
          'tryhackme for career',
          'why use tryhackme',
          'job preparation cybersecurity',
          'tryhackme certifications',
          'why learn tryhackme',
          'try hack me support',
          'tryhackme student support',
          'career support in tryhackme'
        ],
        keywords_bn: [
          'try hack me amake ki support dite parbey',
          'tryhack me amake ki support dite parbey',
          'tryhackme amake ki support dite parbey',
          'tryhackme amake ki support dite parbe',
          'try hack me amake ki support dite parbe',
          'tryhackme amake ki support dibe',
          'try hack me amake ki support dibe',
          'tryhackme কি সাপোর্ট দিতে পারবে',
          'ট্রাইহ্যাকমি আমাকে কি সাপোর্ট দিতে পারবে',
          'tryhackme ki support dite parbe',
          'tryhackme ki support dite parbey',
          'tryhackme ki support dibe',
          'tryhackme কি সাপোর্ট দেয়',
          'tryhackme support',
          'try hack me support',
          'tryhackme er subidha ki',
          'tryhackme er subidha',
          'tryhackme কিভাবে সাহায্য করে',
          'tryhackme kivabe help korbe',
          'tryhackme ki vabe sahajjo korbe',
          'সাইবার সিকিউরিটি ক্যারিয়ারে tryhackme এর সুবিধা',
          'tryhackme এর সুবিধা',
          'tryhackme সাপোর্ট',
          'tryhackme কেন শিখব',
          'চাকরি পাওয়ার জন্য tryhackme',
          'tryhackme এর লাভ কি',
          'tryhackme ক্যারিয়ার সাপোর্ট',
          'tryhackme career support'
        ],
        responses_en: [
          '🎯 <strong>How TryHackMe Supports You & Your Cybersecurity Career (Deep Research):</strong><br><br>1. <strong>In-Browser AttackBox & Zero-Setup Labs:</strong> Practice ethical hacking and cyber defense directly in your browser with cloud Kali Linux without installing local virtual machines.<br>2. <strong>Structured Learning Paths:</strong> Step-by-step career tracks from foundational to advanced (Pre-Security, Jr Penetration Tester, SOC Level 1 & 2, Web Fundamentals, Red Teaming).<br>3. <strong>Verifiable Industry Certificates & Live Portfolio:</strong> Earn verifiable digital certificates upon path completion to showcase on LinkedIn and tech resumes.<br>4. <strong>Gamified Milestones & Global Ranking:</strong> Build daily learning streaks, solve CTF rooms, earn badges, and climb competitive global leaderboards.<br>5. <strong>24/7 Community & Problem-Solving Support:</strong> Access in-room hints, step-by-step walkthroughs, and collaborate with 300,000+ peers in the official TryHackMe Discord and forum.'
        ],
        responses_bn: [
          '🎯 <strong>TryHackMe (THM) আপনাকে যেসব ক্ষেত্রে পূর্ণাঙ্গ সাপোর্ট ও ক্যারিয়ার সুবিধা প্রদান করে:</strong><br><br>১. <strong>জিরো-সেটআপ ল্যাব ও AttackBox সাপোর্ট:</strong> পিসিতে কোনো ভারী ভার্চুয়াল মেশিন বা Kali Linux ইনস্টল না করেই সরাসরি ব্রাউজারে ওয়ান-ক্লিকে ক্লাউড লিনাক্স চালিয়ে রিয়েল টার্গেট সার্ভার হ্যাকিং ও ডিফেন্ডিং প্র্যাকটিস করার সুবিধা।<br>২. <strong>গাইডেড লার্নিং পাথ সাপোর্ট:</strong> শূন্য থেকে শুরু করে প্রফেশনাল হওয়া পর্যন্ত সুনির্দিষ্ট কারিকুলাম—যেমন <em>Pre-Security, Complete Beginner, Jr Penetration Tester, SOC Level 1 & 2, Web Fundamentals, এবং Red Teaming</em>।<br>৩. <strong>ভেরিফায়েবল সার্টিফিকেট ও প্র্যাকটিক্যাল পোর্টফোলিও:</strong> প্রতিটি লার্নিং পাথ ও চ্যালেঞ্জ সম্পন্ন করলে অফিসিয়াল ডিজিটাল সার্টিফিকেট প্রদান করে, যা সরাসরি LinkedIn এবং জবের সিভিতে যুক্ত করে ইন্টারভিউয়ারদের সামনে প্র্যাকটিক্যাল স্কিল প্রমাণ করা যায়।<br>৪. <strong>গ্লোবাল র‍্যাঙ্ক, স্ট্রিক ও ব্যাজ:</strong> প্রতিদিনের স্ট্রিক (Streak) ট্র্যাকিং এবং বিশ্বব্যাপী লিডারবোর্ডে র‍্যাঙ্কিংয়ের মাধ্যমে আন্তর্জাতিক প্ল্যাটফর্মে নিজের অবস্থান যাচাইয়ের সুযোগ।<br>৫. <strong>কমিউনিটি ও মেন্টরশিপ সাপোর্ট:</strong> প্রতিটি রুমে আটকে গেলে বিল্ট-ইন হিন্টস (Hints) এবং অফিশিয়াল ৩ লক্ষ+ মেম্বারের ডিসকর্ড/ফোরামে সরাসরি অন্য হ্যাকার ও মেন্টরদের কাছ থেকে যেকোনো প্রবলেম সলভিং সাপোর্ট।'
        ]
      },
      {
        id: 'mem_tryhackme_vs_hackthebox',
        category: 'tech',
        title: 'TryHackMe বনাম Hack The Box (THM vs Hack The Box Comparison)',
        keywords_en: [
          'tryhackme vs hack the box',
          'thm vs htb',
          'tryhackme vs htb',
          'which is better tryhackme or htb',
          'hack the box vs tryhackme',
          'difference between tryhackme and hack the box',
          'is tryhackme better than hack the box'
        ],
        keywords_bn: [
          'tryhackme vs hack the box',
          'tryhackme vs hackthebox',
          'tryhackme vs htb',
          'tryhackme এবং hack the box এর মধ্যে কোনটা ভালো',
          'tryhackme আর hack the box এর পার্থক্য',
          'tryhackme vs hack the box konta bhalo',
          'tryhackme naki hack the box',
          'tryhackme নাকি hackthebox কোনটা ভালো',
          'নতুনদের জন্য কোনটা ভালো tryhackme নাকি htb',
          'htb vs thm',
          'হ্যাকিং শেখার জন্য কোনটা সেরা tryhackme নাকি htb'
        ],
        responses_en: [
          '⚔️ <strong>TryHackMe (THM) vs. Hack The Box (HTB) Comparison:</strong><br><br>• <strong>TryHackMe (Best for Beginners & Intermediates):</strong><br>1. <em>Guided Learning:</em> Bite-sized, step-by-step rooms with theory, hints, and immediate practice.<br>2. <em>Browser AttackBox:</em> Complete in-browser cloud Kali Linux with zero setup.<br>3. <em>Covers Both Offense & Defense:</em> Outstanding dedicated Blue Team / SOC paths alongside Red Teaming.<br><br>• <strong>Hack The Box (Best for Advanced Penetration Testers):</strong><br>1. <em>Unguided Real-world CTF:</em> Gives an IP with minimal instructions—requires strong independent research.<br>2. <em>Offensive Focus:</em> Highly tailored towards OSCP preparation and deep privilege escalation.<br><br>💡 <strong>Best Strategy:</strong> Start with TryHackMe to build solid fundamentals across Linux, Networking, and Web vulnerabilities, then advance to Hack The Box for intense CTF challenges!'
        ],
        responses_bn: [
          '⚔️ <strong>TryHackMe (THM) বনাম Hack The Box (HTB) এর তুলনামূলক বিশ্লেষণ:</strong><br><br>• <strong>TryHackMe (নতুন ও ইন্টারমিডিয়েটদের জন্য সেরা):</strong><br>১. <em>গাইডেড লার্নিং:</em> প্রতিটি রুমে থিওরি পড়ার পাশাপাশি সাথে সাথে হাতে-কলমে প্র্যাকটিস করার প্রশ্ন ও হিন্টস দেওয়া থাকে।<br>২. <em>জিরো সেটআপ:</em> ব্রাউজারের ভেতরে সরাসরি ক্লাউড Kali Linux (AttackBox) পাওয়া যায়।<br>৩. <em>অফেন্সিভ ও ডিফেন্সিভ উভয় ফিল্ড:</em> পেন্টেস্টিংয়ের পাশাপাশি অসাধারণ SOC ও ব্লু-টিম লার্নিং পাথ রয়েছে।<br><br>• <strong>Hack The Box (অ্যাডভান্সড পেন্টাস্টারদের জন্য সেরা):</strong><br>১. <em>আন-গাইডেড বাস্তবসম্মত চ্যালেঞ্জ:</em> কোনো থিওরি বা হিন্টস ছাড়া সরাসরি টার্গেট আইপি দেওয়া হয়, যা রিয়েল-ওয়ার্ল্ড পেন্টেস্টিং ও OSCP পরীক্ষার প্রস্তুতির মতো।<br>২. <em>মূলত আক্রমণাত্মক (Offensive Focus):</em> ডিপ প্রিভিলেজ এসকেলেশন ও হার্ডকোর এক্সপ্লয়েটেশনে জোর দেয়।<br><br>💡 <strong>সেরা পরামর্শ:</strong> সাইবার সিকিউরিটির প্রাথমিক ভিত্তি ও টুলসের ব্যবহার শেখার জন্য প্রথমে <strong>TryHackMe</strong> শেষ করুন, এরপর অ্যাডভান্সড চ্যালেঞ্জের জন্য <strong>Hack The Box</strong>-এ যান।'
        ]
      },
      {
        id: 'mem_tryhackme_certificate_value',
        category: 'tech',
        title: 'TryHackMe সার্টিফিকেটের গ্রহণযোগ্যতা ও ক্যারিয়ার ভ্যালু (Certificate Value & Job Impact)',
        keywords_en: [
          'tryhackme certificate value',
          'is tryhackme certificate recognized',
          'does tryhackme certificate help get a job',
          'thm certificates on resume',
          'are thm certificates accredited',
          'tryhackme certificate worth it'
        ],
        keywords_bn: [
          'tryhackme certificate কি জবে কাজে লাগে',
          'tryhackme certificate er value kemon',
          'tryhackme সার্টিফিকেট এর মান কেমন',
          'tryhackme সার্টিফিকেট কি চাকরির জন্য সাহায্য করে',
          'tryhackme certificate কি ভ্যালিড',
          'tryhackme সার্টিফিকেট',
          'tryhackme সার্টিফিকেট দিয়ে কি চাকরি পাওয়া যায়'
        ],
        responses_en: [
          '🏆 <strong>TryHackMe Certificate Value & Industry Recognition:</strong><br><br>• <strong>Hands-on Proof of Work:</strong> While THM certificates are non-proctored (unlike formal exams such as CompTIA Security+ or OSCP), they demonstrate verified, verifiable lab hours and hands-on competence on LinkedIn and tech resumes.<br>• <strong>Valued by Hiring Managers:</strong> Tech recruiters and SOC hiring managers value candidates who complete foundational tracks (e.g. <em>SOC Level 1, Jr Penetration Tester</em>) and maintain consistent streak rankings, as it proves discipline, self-learning capability, and practical tool mastery.<br>• <strong>How to Showcase:</strong> Add your verified badge links, THM profile URL, and write up detailed walkthrough blogs for challenging rooms on GitHub/Medium to build a standout portfolio.'
        ],
        responses_bn: [
          '🏆 <strong>TryHackMe সার্টিফিকেটের মান ও চাকরি পাওয়ার ক্ষেত্রে ভূমিকা:</strong><br><br>• <strong>প্র্যাকটিক্যাল প্রুফ অব স্কিল:</strong> যদিও এটি প্রোভেড এক্সাম (যেমন OSCP বা Security+) এর বিকল্প নয়, তবুও এটি নিয়োগকর্তাদের সামনে প্রমাণ করে যে আপনি শত শত ঘণ্টা হ্যান্ডস-অন ল্যাব প্র্যাকটিস করেছেন এবং লিনাক্স/টুলস ব্যবহারে দক্ষ।<br>• <strong>জব ইন্টারভিউতে সুবিধা:</strong> বিশেষ করে এন্ট্রি-লেভেল <em>Junior Penetration Tester</em> বা <em>SOC Analyst</em> পদের জন্য THM-এর লার্নিং পাথ সার্টিফিকেট, প্রোফাইল র‍্যাঙ্ক এবং স্ট্রিক রিক্রুটারদের কাছে অত্যন্ত ইতিবাচক প্রভাব ফেলে।<br>• <strong>সর্বোত্তম ব্যবহার:</strong> সার্টিফিকেটের সাথে আপনার THM পাবলিক প্রোফাইল লিংক সিভিতে দিন এবং বিভিন্ন চ্যালেঞ্জ রুমের টেকনিক্যাল রাইট-আপ (Write-up) গিটহাব বা ব্লগে শেয়ার করে পোর্টফোলিও তৈরি করুন।'
        ]
      },
      {
        id: 'mem_tryhackme_prerequisites',
        category: 'tech',
        title: 'TryHackMe শুরু করার পূর্বপ্রস্তুতি ও প্রয়োজনীয় জ্ঞান (Prerequisites to Start TryHackMe)',
        keywords_en: [
          'tryhackme prerequisites',
          'what is required to start tryhackme',
          'prerequisites for tryhackme',
          'what to know before tryhackme',
          'can a beginner start tryhackme',
          'do i need coding for tryhackme',
          'how to start tryhackme',
          'skills needed for tryhackme'
        ],
        keywords_bn: [
          'tryhackme shuru korte ki lage',
          'tryhackme shuru korte ki ki lage',
          'tryhackme suru korte ki lage',
          'tryhackme suru korte ki ki lage',
          'tryhackme শুরু করতে কি লাগে',
          'tryhackme শুরু করতে কি কি লাগে',
          'tryhackme শুরু করতে কি কি জানা দরকার',
          'হ্যাকিং শেখার আগে কি জানা দরকার',
          'tryhackme কি একদম নতুনদের জন্য',
          'কোডিং না জানলে কি tryhackme করা যায়',
          'tryhackme prerequisites কি',
          'tryhackme কিভাবে শুরু করব'
        ],
        responses_en: [
          '🌱 <strong>Prerequisites to Start Learning on TryHackMe:</strong><br><br>1. <strong>No Advanced Coding Required:</strong> You don\'t need to be a software developer to start. Basic scripting (Bash or Python) helps later, but is not mandatory at the beginning.<br>2. <strong>Basic Computer & OS Literacy:</strong> Familiarity with Windows and basic Linux command-line operations (<code>ls, cd, cat, grep, chmod</code>).<br>3. <strong>Networking Fundamentals:</strong> Basic understanding of how the internet works—IP addresses, Ports, Protocols (HTTP, DNS, TCP/UDP), and Routers.<br>4. <strong>Recommended Starting Paths:</strong> If you are starting from complete zero, begin directly with THM\'s <strong>Pre-Security</strong> path followed by <strong>Complete Beginner</strong>. Everything is taught interactively inside the browser!'
        ],
        responses_bn: [
          '🌱 <strong>TryHackMe শুরু করার জন্য প্রয়োজনীয় প্রাথমিক জ্ঞান ও প্রস্তুতি:</strong><br><br>১. <strong>কোডিং কি জানা বাধ্যতামূলক?</strong> একদমই না! শুরুতে কোনো প্রোগ্রামিং বা কোডিং না জেনেও শুরু করা যায়। পরবর্তীতে ব্যাশ (Bash) বা পাইথনের বেসিক জানলে সুবিধা হয়।<br>২. <strong>বেসিক লিনাক্স কমান্ড:</strong> লিনাক্স টার্মিনালের প্রাথমিক কিছু কমান্ড (যেমন: <code>ls, cd, cat, grep, chmod</code>) জানা থাকলে ল্যাবগুলো সহজে সমাধান করা যায়।<br>৩. <strong>নেটওয়ার্কিংয়ের সাধারণ ধারণা:</strong> আইপি অ্যাড্রেস (IP), পোর্ট (Port), ডিএনএস (DNS) এবং HTTP কীভাবে কাজ করে তা বোঝার কৌতূহল।<br>৪. <strong>কোথা থেকে শুরু করবেন:</strong> আপনি একদম নতুন হলে TryHackMe-এর <strong>Pre-Security</strong> এবং <strong>Complete Beginner</strong> লার্নিং পাথ দিয়ে শুরু করুন—এখানে শূন্য থেকে প্রতিটি বিষয় ধাপে ধাপে শেখানো হয়।'
        ]
      },
      {
        id: 'mem_tryhackme_openvpn_setup',
        category: 'tech',
        title: 'TryHackMe তে OpenVPN দিয়ে Kali Linux কানেক্ট করার নিয়ম (OpenVPN Connection Guide)',
        keywords_en: [
          'how to connect openvpn tryhackme',
          'tryhackme vpn connection',
          'connect kali linux to thm openvpn',
          'thm openvpn configuration',
          'openvpn setup tryhackme',
          'how to connect to tryhackme network'
        ],
        keywords_bn: [
          'tryhackme তে openvpn কিভাবে কানেক্ট করব',
          'tryhackme openvpn kivabe connect korbo',
          'kali linux এ tryhackme vpn কানেক্ট করার নিয়ম',
          'thm vpn কানেক্ট',
          'tryhackme vpn সেটআপ',
          'openvpn দিয়ে tryhackme ল্যাব কানেক্ট করার নিয়ম'
        ],
        responses_en: [
          '🔌 <strong>How to Connect to TryHackMe Labs via OpenVPN (Kali Linux / Local VM):</strong><br><br>1. <strong>Download Config:</strong> Log in to TryHackMe, navigate to <a href=\'https://tryhackme.com/access\' target=\'_blank\' style=\'color:#00f2fe;\'>tryhackme.com/access</a>, select your nearest VPN server region, and click <strong>Download My Configuration File</strong> (e.g. <code>yourname.ovpn</code>).<br>2. <strong>Open Terminal:</strong> Open terminal in Kali Linux and go to the directory where the file was saved (e.g., <code>cd ~/Downloads</code>).<br>3. <strong>Run OpenVPN:</strong> Execute <code>sudo openvpn yourname.ovpn</code>.<br>4. <strong>Verify Connection:</strong> Look for the message <code>Initialization Sequence Completed</code>. Keep this terminal window open.<br>5. <strong>Check THM Access:</strong> Refresh the Access page; you should see a green checkmark showing your assigned THM internal IP (typically <code>10.x.x.x</code>).'
        ],
        responses_bn: [
          '🔌 <strong>OpenVPN দিয়ে নিজের Kali Linux থেকে TryHackMe কানেক্ট করার সহজ ৫ ধাপ:</strong><br><br>১. <strong>কনফিগ ফাইল ডাউনলোড:</strong> ব্রাউজারে TryHackMe-তে লগইন করে <a href=\'https://tryhackme.com/access\' target=\'_blank\' style=\'color:#00f2fe;\'>tryhackme.com/access</a> পেজে যান এবং নিকটবর্তী রিজিয়ন নির্বাচন করে <strong>Download My Configuration File</strong> বাটনে ক্লিক করে <code>.ovpn</code> ফাইলটি ডাউনলোড করুন।<br>২. <strong>টার্মিনাল ওপেন করুন:</strong> Kali Linux-এ টার্মিনাল খুলে যেখানে ফাইলটি ডাউনলোড হয়েছে সেই ফোল্ডারে যান (যেমন: <code>cd ~/Downloads</code>)।<br>৩. <strong>কমান্ড চালান:</strong> টার্মিনালে লিখুন <code>sudo openvpn yourname.ovpn</code> এবং এন্টার দিন।<br>৪. <strong>সফল কানেকশন:</strong> টার্মিনালে <code>Initialization Sequence Completed</code> লেখা আসলে বুঝবেন ভিপিএন সফলভাবে কানেক্ট হয়েছে (এই টার্মিনালটি বন্ধ করবেন না)।<br>৫. <strong>যাচাই করুন:</strong> THM Access পেজে রিলোড দিলে সবুজ টিকচিহ্ন সহ আপনার ভার্চুয়াল প্রাইভেট আইপি (<code>10.x.x.x</code>) দেখতে পাবেন।'
        ]
      },
      {
        id: 'mem_tryhackme_soc_analyst_roadmap',
        category: 'tech',
        title: 'TryHackMe দিয়ে SOC Analyst ও Blue Team ক্যারিয়ার রোডম্যাপ (SOC Analyst Roadmap)',
        keywords_en: [
          'how to become a soc analyst using tryhackme',
          'tryhackme soc analyst roadmap',
          'thm blue team career path',
          'soc level 1 on tryhackme',
          'defensive security on thm',
          'learn blue team tryhackme'
        ],
        keywords_bn: [
          'tryhackme দিয়ে soc analyst কিভাবে হব',
          'tryhackme soc analyst roadmap',
          'tryhackme দিয়ে ব্লু টিম ক্যারিয়ার',
          'soc level 1 লার্নিং পাথ',
          'ডিফেন্সিভ সিকিউরিটি কিভাবে শিখব',
          'soc analyst হতে tryhackme তে কি কি শিখব'
        ],
        responses_en: [
          '🛡️ <strong>Step-by-Step SOC Analyst / Blue Team Career Roadmap on TryHackMe:</strong><br><br>1. <strong>Core Foundations:</strong> Complete <em>Pre-Security</em> and <em>Linux Fundamentals</em> to master networking layers, packet flow, and system logs.<br>2. <strong>Cyber Defense Path:</strong> Learn foundational offensive techniques to understand how attackers breach networks.<br>3. <strong>SOC Level 1 Track (The Core):</strong><br>• <strong>Packet Analysis:</strong> Master Wireshark and NetworkMiner to detect malicious payloads.<br>• <strong>SIEM Log Monitoring:</strong> Learn hands-on threat hunting and rule writing in <strong>Splunk</strong> and <strong>ELK / Elastic</strong>.<br>• <strong>Intrusion Detection:</strong> Write and analyze rules in <strong>Snort</strong> and <strong>Suricata</strong>.<br>4. <strong>Digital Forensics & Incident Response (DFIR):</strong> Practice memory forensics with Volatility and disk forensics with Autopsy.<br>5. <strong>Threat Intelligence & MITRE ATT&CK:</strong> Map real adversary techniques to defensive countermeasures.'
        ],
        responses_bn: [
          '🛡️ <strong>TryHackMe ব্যবহার করে SOC Analyst ও ব্লু-টিম ক্যারিয়ার গড়ার রোডম্যাপ:</strong><br><br>১. <strong>প্রাথমিক ভিত্তি:</strong> প্রথমে <em>Pre-Security</em> এবং <em>Linux Fundamentals</em> রুমগুলো শেষ করে নেটওয়ার্ক প্রোটোকল ও ওএস লগ স্ট্রাকচার বুঝুন।<br>২. <strong>Cyber Defense পাথ:</strong> আক্রমণকারীরা কীভাবে সিস্টেমে প্রবেশ করে তা বুঝতে প্রাথমিক অ্যাটাক মেকানিজম শিখুন।<br>৩. <strong>SOC Level 1 লার্নিং পাথ (সবচেয়ে গুরুত্বপূর্ণ):</strong><br>• <strong>প্যাকেট অ্যানালাইসিস:</strong> Wireshark ব্যবহার করে ক্ষতিকর নেটওয়ার্ক ট্র্যাফিক সনাক্তকরণ।<br>• <strong>SIEM লগ অ্যানালাইসিস:</strong> <strong>Splunk</strong> এবং <strong>Elastic SIEM</strong> দিয়ে লাইভ সার্ভারের সন্দেহজনক লগ মনিটরিং ও থ্রেট হান্টিং।<br>• <strong>ইন্ট্রুশন ডিটেকশন (NIDS):</strong> <strong>Snort</strong> এবং <strong>Suricata</strong> দিয়ে স্বয়ংক্রিয় অ্যাটাক ডিটেকশন রুল তৈরি।<br>৪. <strong>ফরেনসিক্স ও ইনসিডেন্ট রেসপন্স (DFIR):</strong> Autopsy দিয়ে ডিস্ক ফরেনসিক্স এবং Volatility দিয়ে মেমোরি ইনভেস্টিগেশন।<br>৫. <strong>MITRE ATT&CK ফ্রেমওয়ার্ক:</strong> অ্যাডভার্সারির আচরণ ট্র্যাক করে কার্যকর সাইবার ডিফেন্স স্ট্র্যাটেজি তৈরি।'
        ]
      },
      {
        id: 'mem_tryhackme_attackbox',
        category: 'tech',
        title: 'TryHackMe AttackBox কি এবং এটি ব্যবহারের নিয়ম (What is AttackBox & How to Use)',
        keywords_en: [
          'what is tryhackme attackbox',
          'how to use attackbox',
          'tryhackme attackbox setup',
          'start attackbox tryhackme',
          'in-browser kali linux tryhackme',
          'attackbox features and usage'
        ],
        keywords_bn: [
          'tryhackme attackbox কি',
          'attackbox kivabe use korbo',
          'attackbox কিভাবে ব্যবহার করব',
          'tryhackme তে attackbox কিভাবে চালু করব',
          'attackbox কি এবং এর কাজ কি',
          'ব্রাউজারে kali linux চালানো',
          'tryhackme attackbox'
        ],
        responses_en: [
          '🖥️ <strong>What is TryHackMe AttackBox & How to Use It:</strong><br><br>• <strong>Overview:</strong> AttackBox is a customized, cloud-hosted Linux machine (based on Ubuntu/Kali) running directly inside your browser without needing local VirtualBox or VMware.<br>• <strong>Pre-installed Tools:</strong> Packed with essential pentesting tools including <em>Burp Suite, Nmap, Metasploit, Gobuster, Nikto, Wireshark, and John the Ripper</em>.<br>• <strong>How to Start:</strong><br>1. Open any active room (e.g. <em>Starting Out In Cyber</em>).<br>2. Click the blue <strong>Start AttackBox</strong> button at the top of the room.<br>3. Wait ~60 seconds for the split-screen browser terminal to load.<br>4. You get an assigned IP address to target the vulnerable machine directly.<br>💡 <strong>Usage Limit:</strong> Free users get 1 hour of AttackBox per day; VIP/Premium subscribers get unlimited daily access.'
        ],
        responses_bn: [
          '🖥️ <strong>TryHackMe AttackBox কি এবং এটি যেভাবে ব্যবহার করবেন:</strong><br><br>• <strong>সংক্ষিপ্ত পরিচিতি:</strong> AttackBox হলো ব্রাউজার-ভিত্তিক একটি রেডিমেড ক্লাউড লিনাক্স (Ubuntu/Kali) সিস্টেম। আপনার কম্পিউটারে ভারী কোনো ভার্চুয়াল বক্স বা কালী লিনাক্স ইনস্টল ছাড়াই ব্রাউজারে এটি চালানো যায়।<br>• <strong>বিল্ট-ইন টুলস:</strong> এর ভেতর সব প্রয়োজনীয় হ্যাকিং টুলস যেমন—<em>Burp Suite, Nmap, Metasploit, Gobuster, Nikto, Wireshark, John the Ripper</em> ইত্যাদি প্রি-ইনস্টল করা থাকে।<br>• <strong>চালু করার নিয়ম:</strong><br>১. যেকোনো প্র্যাকটিস রুমে গিয়ে উপরের নীল রঙের <strong>Start AttackBox</strong> বাটনে ক্লিক করুন।<br>২. প্রায় ১ মিনিটের মধ্যে একই ব্রাউজার ট্যাবে স্প্লিট-স্ক্রিন মোডে লিনাক্স ডেস্কটপ চালু হয়ে যাবে।<br>৩. টার্মিনাল খুলে সরাসরি টার্গেট আইপিতে কমান্ড ও এক্সপ্লয়েট চালাতে পারবেন।<br>💡 <strong>ব্যবহারের সীমা:</strong> ফ্রি ইউজাররা প্রতিদিন ১ ঘণ্টা AttackBox ব্যবহার করতে পারেন; আর Premium সাবস্ক্রাইবাররা আনলিমিটেড ব্যবহার করতে পারেন।'
        ]
      },
      {
        id: 'mem_tryhackme_free_vs_premium',
        category: 'tech',
        title: 'TryHackMe Free বনাম Premium সাবস্ক্রিপশনের পার্থক্য ও খরচ (Free vs VIP Subscription)',
        keywords_en: [
          'is tryhackme free or paid',
          'tryhackme premium cost',
          'tryhackme subscription price',
          'difference between tryhackme free and vip',
          'tryhackme vip benefits',
          'is tryhackme premium worth it'
        ],
        keywords_bn: [
          'tryhackme free naki taka lage',
          'tryhackme premium subscription er cost koto',
          'tryhackme ফ্রি নাকি টাকা লাগে',
          'tryhackme প্রিমিয়াম সাবস্ক্রিপশন ফি কত',
          'tryhackme vip এর সুবিধা কি',
          'tryhackme পেইড নাকি ফ্রি',
          'tryhackme প্রিমিয়াম কি কেনা উচিত'
        ],
        responses_en: [
          '💎 <strong>TryHackMe Free vs. Premium (VIP) Subscription Comparison:</strong><br><br>• <strong>Free Tier (80% Content Accessible):</strong><br>1. Access to hundreds of free introductory & intermediate rooms.<br>2. 1 hour of in-browser AttackBox per day.<br>3. Unlimited OpenVPN access to free machines.<br><br>• <strong>Premium / VIP Tier ($14/month or $126/year — $10.50/mo with student discount):</strong><br>1. <em>Unlimited AttackBox Time:</em> Run in-browser hacking machines without daily limits.<br>2. <em>Full Path Access:</em> Unlocks advanced paths like <em>Offensive Pentesting, Red Teaming, and SOC Level 2</em>.<br>3. <em>Fast Dedicated VPN:</em> Faster private VPN servers with faster scan times.<br>4. <em>Official Path Certificates:</em> Verified downloadable certificates for completed tracks.<br><br>💡 <strong>Recommendation:</strong> Complete the free rooms (Pre-Security, Intro to Cyber) first; subscribe to Premium once you need advanced Active Directory and buffer overflow labs!'
        ],
        responses_bn: [
          '💎 <strong>TryHackMe ফ্রি বনাম প্রিমিয়াম (VIP) সাবস্ক্রিপশনের পার্থক্য ও খরচের হিসাব:</strong><br><br>• <strong>ফ্রি সুবিধা (৮০% কনটেন্ট উন্মুক্ত):</strong><br>১. শত শত বেসিক ও ইন্টারমিডিয়েট রুম ফ্রিতে সমাধান করা যায়।<br>২. প্রতিদিন ১ ঘণ্টা ব্রাউজার AttackBox ব্যবহারের সুবিধা।<br>৩. নিজের কম্পিউটারের OpenVPN দিয়ে ফ্রি মেশিনে আনলিমিটেড প্র্যাকটিস।<br><br>• <strong>প্রিমিয়াম / VIP সুবিধা (খরচ: মাসে ~$১৪ ডলার বা বছরে ~$১২৬ ডলার; স্টুডেন্ট ডিসকাউন্টে মাসে ~$১০.৫০ ডলার):</strong><br>১. <em>আনলিমিটেড AttackBox:</em> ব্রাউজারে যত ইচ্ছা সময় কালী লিনাক্স চালানোর সুবিধা।<br>২. <em>লকড ভিআইপি রুম আনলক:</em> অ্যাডভান্সড পাথ (Offensive Pentesting, Red Teaming, Active Directory) সম্পূর্ণ অ্যাক্সেস।<br>৩. <em>ফাস্ট ডেডিকেটেড ভিপিএন:</em> দ্রুত স্ক্যানিংয়ের জন্য ভিআইপি ভিপিএন সার্ভার।<br>৪. <em>অফিসিয়াল সার্টিফিকেট:</em> লার্নিং পাথ শেষ করলে ভেরিফায়েড ডিজিটাল সার্টিফিকেট ডাউনলোড সুবিধা।<br><br>💡 <strong>পরামর্শ:</strong> শুরুতে টাকা খরচ করার প্রয়োজন নেই; আগে ফ্রি রুমগুলো শেষ করুন, এরপর অ্যাডভান্সড ল্যাবের জন্য প্রিমিয়াম নিতে পারেন।'
        ]
      },
      {
        id: 'mem_tryhackme_streak_freeze',
        category: 'tech',
        title: 'TryHackMe Streak কি এবং Streak Freeze কিভাবে কাজ করে (Streak System & Streak Freeze)',
        keywords_en: [
          'what is streak in tryhackme',
          'how does streak freeze work tryhackme',
          'tryhackme streak rules',
          'how to buy streak freeze',
          'maintain streak on tryhackme',
          'tryhackme streak badges'
        ],
        keywords_bn: [
          'tryhackme streak ki',
          'streak freeze kivabe use kore',
          'tryhackme তে streak কি এবং কিভাবে বাড়াব',
          'tryhackme streak freeze কিভাবে কাজ করে',
          'tryhackme স্ট্রিক ধরে রাখার নিয়ম',
          'tryhackme streak freeze কেনার নিয়ম',
          'স্ট্রিক ভেঙে গেলে কি করব tryhackme'
        ],
        responses_en: [
          '🔥 <strong>TryHackMe Streak System & How Streak Freeze Works:</strong><br><br>• <strong>What is a Streak?</strong> A streak represents the number of consecutive days you have answered at least one question in any THM room (resets daily at 00:00 UTC).<br>• <strong>Why Maintain It?</strong> Builds disciplined daily learning habits and unlocks exclusive milestone badges (7 days, 30 days, 100 days, 365 days).<br>• <strong>What is a Streak Freeze?</strong> A shield that automatically protects your streak if you miss a day due to exams, travel, power outages, or illness.<br>• <strong>How to Get It:</strong><br>1. Go to your THM Profile or the Swag/Badges section.<br>2. You can purchase a Streak Freeze using accumulated THM points/badges earned by solving rooms.<br>3. Once active, if you miss a day, 1 Streak Freeze is consumed and your counter continues uninterrupted!'
        ],
        responses_bn: [
          '🔥 <strong>TryHackMe Streak কি এবং Streak Freeze যেভাবে কাজ করে:</strong><br><br>• <strong>স্ট্রিক (Streak) কি?</strong> প্রতিদিন অন্তত একটি প্রশ্নের সঠিক উত্তর দিলে আপনার স্ট্রিক ১ দিন করে বাড়ে (প্রতিদিন রাত 00:00 UTC-তে দিন গণনা হয়)।<br>• <strong>উপকারিতা:</strong> এটি নিয়মিত শেখার অভ্যাস তৈরি করে এবং মাইলস্টোন ব্যাজ (৭ দিন, ৩০ দিন, ১০০ দিন, ৩৬৫ দিনের এক্সক্লুসিভ ব্যাজ) আনলক করে।<br>• <strong>Streak Freeze কি?</strong> এটি একটি সুরক্ষা ঢাল (Shield)। কোনোদিন অসুস্থতা, পরীক্ষা বা ব্যস্ততার কারণে ল্যাব সলভ করতে না পারলে এটি স্বয়ংক্রিয়ভাবে আপনার স্ট্রিক নষ্ট হওয়া থেকে বাঁচায়।<br>• <strong>কেনার নিয়ম:</strong><br>১. প্রোফাইল বা ব্যাজ/রিওয়ার্ড সেকশনে যান।<br>২. ল্যাব সলভ করে অর্জিত THM পয়েন্ট বা ব্যাজ দিয়ে <strong>Streak Freeze</strong> সক্রিয় করে রাখা যায়।<br>৩. স্ট্রিক ফ্রীজ অন থাকলে কোনোদিন মিস হলেও আপনার পুরো স্ট্রিক কাউন্টার অক্ষত থাকে।'
        ]
      },
      {
        id: 'mem_tryhackme_wireshark_tutorial',
        category: 'tech',
        title: 'TryHackMe তে Wireshark ও প্যাকেট অ্যানালাইসিস শেখার উপায় (Wireshark & Packet Analysis)',
        keywords_en: [
          'how to learn wireshark on tryhackme',
          'wireshark rooms on tryhackme',
          'packet analysis tryhackme',
          'learn network traffic analysis thm',
          'wireshark filters tryhackme',
          'pcap file analysis tryhackme'
        ],
        keywords_bn: [
          'tryhackme te wireshark kivabe shikhbo',
          'wireshark packet analysis tryhackme',
          'tryhackme তে wireshark কিভাবে শিখব',
          'wireshark প্যাকেট অ্যানালাইসিস শেখার নিয়ম',
          'tryhackme wireshark রুমসমূহ',
          'নেটওয়ার্ক ট্র্যাফিক অ্যানালাইসিস tryhackme',
          'wireshark দিয়ে হ্যাকিং সনাক্তকরণ'
        ],
        responses_en: [
          '🦈 <strong>Learning Wireshark & Packet Analysis on TryHackMe:</strong><br><br>• <strong>Recommended Rooms on THM:</strong><br>1. <em>Wireshark: The Basics</em> (GUI overview, packet capture, protocol dissection)<br>2. <em>Wireshark: Packet Operations</em> (Display filters, statistics, stream graphing)<br>3. <em>Wireshark: Traffic Analysis</em> (Detecting ARP poisoning, Nmap port scans, and malware C2 beacons)<br><br>• <strong>Key Practical Skills You Learn:</strong><br>• <strong>Display Filters:</strong> Master precise filtering (e.g. <code>ip.addr == 10.10.10.5</code>, <code>http.request.method == \"POST\"</code>, <code>tcp.flags.syn == 1 && tcp.flags.ack == 0</code>).<br>• <strong>Follow TCP Stream:</strong> Reconstruct unencrypted credentials sent over HTTP, FTP, or Telnet.<br>• <strong>Export Objects:</strong> Extract malicious files transferred over network protocols (<code>File -> Export Objects -> HTTP</code>).'
        ],
        responses_bn: [
          '🦈 <strong>TryHackMe-তে Wireshark ও নেটওয়ার্ক প্যাকেট অ্যানালাইসিস শেখার গাইড:</strong><br><br>• <strong>সেরা প্র্যাকটিস রুমসমূহ:</strong><br>১. <em>Wireshark: The Basics</em> — ওয়্যারশার্ক ইন্টারফেস, প্যাকেট ক্যাপচার ও প্রোটোকল পরিচিতি।<br>২. <em>Wireshark: Packet Operations</em> — ডিসপ্লে ফিল্টার, আইও গ্রাফ ও ট্র্যাফিক পরিসংখ্যান।<br>৩. <em>Wireshark: Traffic Analysis</em> — ARP স্পুফিং, Nmap স্ক্যান ও ম্যালওয়্যার ট্র্যাফিক সনাক্তকরণ।<br><br>• <strong>বাস্তব যেসব দক্ষতা শিখবেন:</strong><br>• <strong>ডিসপ্লে ফিল্টারিং:</strong> নির্দিষ্ট আইপি বা প্রোটোকল ফিল্টার করা (যেমন: <code>ip.addr == 10.10.10.5</code>, <code>http.request.method == \"POST\"</code>)।<br>• <strong>Follow TCP Stream:</strong> HTTP বা FTP দিয়ে যাওয়া প্লেইনটেক্সট ইউজারনেম ও পাসওয়ার্ড রিভার্স করে পড়া।<br>• <strong>ফাইল এক্সট্রাক্ট করা:</strong> নেটওয়ার্ক দিয়ে আসা ক্ষতিকর ফাইল বা ইমেজ সরাসরি ওয়্যারশার্ক থেকে বের করা (<code>File -> Export Objects -> HTTP</code>)।'
        ]
      },
      {
        id: 'mem_tryhackme_privilege_escalation',
        category: 'tech',
        title: 'TryHackMe তে Privilege Escalation শেখার গাইডলাইন (Linux & Windows PrivEsc)',
        keywords_en: [
          'how to learn privilege escalation on tryhackme',
          'linux privesc tryhackme',
          'windows privilege escalation thm',
          'privesc rooms tryhackme',
          'linpeas winpeas tryhackme',
          'suid gtfobins tryhackme'
        ],
        keywords_bn: [
          'tryhackme te privilege escalation kivabe shikhbo',
          'linux privesc tryhackme',
          'tryhackme তে privilege escalation কিভাবে শিখব',
          'লিনাক্স প্রিভিলেজ এসকেলেশন শেখার উপায়',
          'উইন্ডোজ প্রিভিলেজ এসকেলেশন tryhackme',
          'লো-প্রিভিলেজ থেকে রুট হওয়ার নিয়ম tryhackme',
          'tryhackme privesc গাইড'
        ],
        responses_en: [
          '⚡ <strong>How to Learn Privilege Escalation (PrivEsc) on TryHackMe:</strong><br><br>• <strong>What is PrivEsc?</strong> Moving from an initial low-privilege shell (e.g. <code>www-data</code>) to highest authority (<code>root</code> on Linux or <code>NT AUTHORITY\\SYSTEM</code> on Windows).<br><br>• <strong>Top Rooms by Industry Legend Tib3rius:</strong><br>1. <em>Linux PrivEsc</em> & <em>Linux PrivEsc Arena</em><br>2. <em>Windows PrivEsc</em> & <em>Windows PrivEsc Arena</em><br><br>• <strong>Core Techniques Covered:</strong><br>• <strong>Linux:</strong> SUID binaries (<code>find / -perm -u=s -type f 2>/dev/null</code>), <code>sudo -l</code> misconfigurations leveraging GTFOBins, writable <code>/etc/passwd</code>, and vulnerable cron jobs.<br>• <strong>Windows:</strong> Unquoted service paths, AlwaysInstallElevated, Token Impersonation (PrintSpoofer), and automated tools like <em>LinPEAS / WinPEAS</em>.'
        ],
        responses_bn: [
          '⚡ <strong>TryHackMe-তে Privilege Escalation (রুট প্রিভিলেজ নেওয়া) শেখার উপায়:</strong><br><br>• <strong>Privilege Escalation কি?</strong> কোনো সার্ভারে প্রাথমিক প্রবেশ পাওয়ার পর সাধারণ ইউজার (যেমন: <code>www-data</code>) থেকে সর্বোচ্চ অ্যাডমিন বা <code>root</code> (Linux) অথবা <code>NT AUTHORITY\\SYSTEM</code> (Windows) প্রিভিলেজ দখল করা।<br><br>• <strong>সবচেয়ে জনপ্রিয় প্র্যাকটিস রুমসমূহ (Tib3rius-এর কোর্স):</strong><br>১. <em>Linux PrivEsc</em> এবং <em>Linux PrivEsc Arena</em><br>২. <em>Windows PrivEsc</em> এবং <em>Windows PrivEsc Arena</em><br><br>• <strong>প্রধান যেসব টেকনিক শিখবেন:</strong><br>• <strong>Linux PrivEsc:</strong> SUID বাইনারিজ এক্সপ্লয়েট, <code>sudo -l</code> পারমিশন ও GTFOBins ব্যবহার, দুর্বল ক্রনজব (Cronjobs) এবং কার্নেল এক্সপ্লয়েট।<br>• <strong>Windows PrivEsc:</strong> আনকোটেড সার্ভিস পাথ (Unquoted Service Path), AlwaysInstallElevated, টোকেন ইমপারসোনেশন (PrintSpoofer/JuicyPotato) এবং LinPEAS/WinPEAS স্ক্রিপ্টের ব্যবহার।'
        ]
      },
      {
        id: 'mem_ostad_overview',
        category: 'tech',
        title: 'Ostad (ostad.app) পরিচিতি ও বিশেষত্ব (Ostad Overview & Features)',
        keywords_en: [
          'ostad app',
          'what is ostad',
          'ostad bangladesh',
          'ostad live learning',
          'ostad platform',
          'ostad.app',
          'about ostad'
        ],
        keywords_bn: [
          'ostad app কি',
          'ওস্তাদ অ্যাপ কি',
          'ostad কি',
          'ostad.app সম্পর্কে বলো',
          'ostad প্ল্যাটফর্ম কি',
          'ওস্তাদ কি',
          'ostad সম্পর্কে বলো',
          'ostad bangladesh'
        ],
        responses_en: [
          "🎓 <strong>Ostad (ostad.app) - Live Interactive Skill Development Platform:</strong><br><br><strong>Ostad</strong> is one of Bangladesh's premier live-learning EdTech platforms focused on building job-ready tech and digital skills through structured bootcamps.<br><br>🌟 <strong>Key Features:</strong><br>• <strong>Live Interactive Classes:</strong> Real-time coding and instruction with industry experts instead of just recorded videos.<br>• <strong>Weekly Streaks & Tasks:</strong> In-app assignments, code reviews, and streak-based milestone tracking.<br>• <strong>Mentorship Support:</strong> Dedicated teaching assistants and mentor guidance for doubt clearing.<br>• <strong>Official Website:</strong> <a href='https://ostad.app' target='_blank' style='color:#00f2fe;'>ostad.app</a>"
        ],
        responses_bn: [
          "🎓 <strong>Ostad (ostad.app) - লাইভ ইন্টারঅ্যাক্টিভ স্কিল ডেভেলপমেন্ট প্ল্যাটফর্ম:</strong><br><br><strong>Ostad</strong> হলো বাংলাদেশের শীর্ষস্থানীয় লাইভ লার্নিং এডটেক প্ল্যাটফর্ম, যা শিক্ষার্থীদের চাকরি ও ক্যারিয়ার উপযোগী টেকনিক্যাল স্কিল তৈরিতে কাজ করে।<br><br>🌟 <strong>মূল সুবিধাসমূহ:</strong><br>• <strong>লাইভ ইন্টারঅ্যাক্টিভ ক্লাস:</strong> শুধু রেকর্ডেড ভিডিও নয়, সরাসরি ইন্ডাস্ট্রির অভিজ্ঞ মেন্টরদের সাথে লাইভ ক্লাস ও প্রজেক্ট প্র্যাকটিস।<br>• <strong>টাস্ক ও উইকলি স্ট্রিক:</strong> নিয়মিত অ্যাসাইনমেন্ট সাবমিশন, লাইভ কোড রিভিউ এবং স্ট্রিক ধরে রাখার মাধ্যমে নিয়মানুবর্তিতা তৈরি।<br>• <strong>মেন্টর ও টিএ সাপোর্ট:</strong> যেকোনো সমস্যা সমাধানে সার্বক্ষণিক ডেডিকেটেড টিচিং অ্যাসিস্ট্যান্ট সাপোর্ট।<br>• <strong>অফিসিয়াল ওয়েবসাইট:</strong> <a href='https://ostad.app' target='_blank' style='color:#00f2fe;'>ostad.app</a>"
        ]
      },
      {
        id: 'mem_ostad_courses_bootcamps',
        category: 'tech',
        title: 'Ostad এ কি কি কোর্স ও বুটক্যাম্প শেখানো হয় (Ostad Courses & Tracks)',
        keywords_en: [
          'ostad courses',
          'what courses in ostad',
          'ostad bootcamps',
          'ostad web development',
          'ostad python mern',
          'ostad flutter cybersecurity',
          'what can i learn on ostad',
          'course',
          'courses',
          'bootcamp',
          'bootcamps',
          'ki ki course',
          'course list',
          'all courses'
        ],
        keywords_bn: [
          'ostad এ কি কি কোর্স শেখানো হয়',
          'ostad এর কোর্স সমূহ',
          'ওস্তাদে কি কি কোর্স আছে',
          'ostad bootcamps কি কি',
          'ostad এ কি কি শেখা যায়',
          'ওস্তাদ কোর্স লিস্ট',
          'ostad courses কি কি',
          'কোর্স',
          'কোর্সসমূহ',
          'বুটক্যাম্প',
          'কি কি কোর্স',
          'কি কোর্স আছে',
          'কি কি কোর্স শেখানো হয়',
          'কোর্স লিস্ট',
          'ki ki course',
          'ki ki course achey',
          'ki ki course ache',
          'course ache'
        ],
        responses_en: [
          '🚀 <strong>Popular Bootcamps & Courses on Ostad (ostad.app):</strong><br><br>Ostad offers structured industry-curated tracks across major technology domains:<br><br>🔹 <strong>Software & Web Development:</strong><br>• Full-Stack MERN (MongoDB, Express, React, Node.js)<br>• Python & Django Web Development<br>• PHP & Laravel Framework<br>• Frontend Engineering (React.js, Next.js)<br><br>🔹 <strong>AI, Data Science & Machine Learning:</strong><br>• AI & ML Engineering, LLMs & Automation<br>• Data Science with Python & PowerBI<br>• Data Engineering Bootcamp<br><br>🔹 <strong>Mobile & Quality Engineering:</strong><br>• Flutter Mobile App Development<br>• SQA (Software Quality Assurance & Automation)<br>• DevOps & Cloud Infrastructure<br><br>🔹 <strong>Cyber Security & Design:</strong><br>• Cyber Security & Ethical Hacking<br>• UI/UX Design & Product Management'
        ],
        responses_bn: [
          '🚀 <strong>Ostad-এ শেখানো প্রধান কোর্স ও ক্যারিয়ার বুটক্যাম্পসমূহ:</strong><br><br>Ostad প্ল্যাটফর্মে ইন্ডাস্ট্রির চাহিদা অনুযায়ী বিভিন্ন হাই-ডিমান্ড ট্র্যাক শেখানো হয়:<br><br>🔹 <strong>ওয়েব ও সফটওয়্যার ডেভেলপমেন্ট:</strong><br>• Full-Stack MERN (React, Node.js, Express, MongoDB)<br>• Python & Django ফুল-স্ট্যাক ডেভেলপমেন্ট<br>• PHP & Laravel ওয়েব ডেভেলপমেন্ট<br>• Frontend Development (React.js, Next.js)<br><br>🔹 <strong>এআই, মেশিন লার্নিং ও ডেটা সায়েন্স:</strong><br>• AI & Machine Learning Engineering (LLMs, Automation)<br>• Data Science & Analytics (Python, SQL, PowerBI)<br>• Data Engineering Bootcamp<br><br>🔹 <strong>মোবাইল অ্যাপ ও ইঞ্জিনিয়ারিং:</strong><br>• Flutter Mobile App Development<br>• SQA (Software Quality Assurance ও অটোমেশন টেস্ট)<br>• DevOps & Cloud Computing<br><br>🔹 <strong>সাইবার সিকিউরিটি ও ডিজাইন:</strong><br>• Cyber Security & Ethical Hacking<br>• UI/UX Design & Product Management'
        ]
      },
      {
        id: 'mem_ostad_job_placement_certificate',
        category: 'tech',
        title: 'Ostad এর জব প্লেসমেন্ট সাপোর্ট ও সার্টিফিকেট (Job Placement & Certificate)',
        keywords_en: [
          'ostad job placement',
          'ostad certificate',
          'does ostad provide jobs',
          'ostad career support',
          'is ostad certificate valid',
          'certificate',
          'certification',
          'job placement',
          'career support',
          'job support'
        ],
        keywords_bn: [
          'ostad এর জব সাপোর্ট কেমন',
          'ostad সার্টিফিকেট কি কার্যকর',
          'ওস্তাদ কি চাকরি দেয়',
          'ostad job placement কি',
          'ostad ক্যারিয়ার সাপোর্ট',
          'সার্টিফিকেট',
          'সনদ',
          'সার্টিফিকেশন',
          'চাকরি',
          'চাকরির সুবিধা',
          'জব সুবিধা',
          'প্লেসমেন্ট',
          'ক্যারিয়ার',
          'certificate ki pabo',
          'certificate pabo',
          'chakorir subidha',
          'chakri pabo',
          'job pabo'
        ],
        responses_en: [
          '🏆 <strong>Ostad Job Placement & Career Support Ecosystem:</strong><br><br>• <strong>Verified Certificates:</strong> Shareable accredited digital credentials for LinkedIn, resumes, and portfolios.<br>• <strong>Ostad Talent Pool:</strong> Top-performing graduates get recommended directly to partner software firms and corporate hiring teams.<br>• <strong>Career Coaching:</strong> Resume building, GitHub/portfolio audit, and technical mock interviews by senior engineers.'
        ],
        responses_bn: [
          '🏆 <strong>Ostad-এর জব প্লেসমেন্ট সাপোর্ট ও সার্টিফিকেশন সুবিধা:</strong><br><br>• <strong>ভেরিফায়েড সার্টিফিকেট:</strong> সফলভাবে বুটক্যাম্প সম্পন্ন করলে আন্তর্জাতিকভাবে লিঙ্কডইন ও সিভিতে প্রদর্শনযোগ্য ডিজিটাল সার্টিফিকেট প্রদান করা হয়।<br>• <strong>ট্যালেন্ট নেটওয়ার্ক ও রিকমেন্ডেশন:</strong> শীর্ষ পারফর্মারদের Ostad Talent Pool-এর মাধ্যমে সরাসরি বিভিন্ন দেশি-বিদেশি পার্টনার প্রতিষ্ঠানে ইন্টারভিউ ও চাকরির সুযোগ দেওয়া হয়।<br>• <strong>ক্যারিয়ার গ্রুমিং:</strong> সিভি মেকিং, গিটহাব/পোর্টফোলিও রিভিউ এবং টেকনিক্যাল মক ইন্টারভিউ প্রস্তুতি।'
        ]
      },
      {
        id: 'mem_learn_python_guidance',
        category: 'tech',
        title: 'পাইথন ও প্রোগ্রামিং শেখা (Python Programming Learning & Guidance)',
        keywords_en: [
          'can you teach me python',
          'teach me python',
          'learn python',
          'how to learn python',
          'python programming tutorial',
          'python guide',
          'teach python'
        ],
        keywords_bn: [
          'তুমি কি আমাকে পাইথন শেখাতে পারবে',
          'পাইথন শিখতে চাই',
          'পাইথন শেখাও',
          'পাইথন কিভাবে শিখব',
          'পাইথন প্রোগ্রামিং',
          'tomi ki amake python shekhate parbe',
          'tumi ki amake python shekhate parbe',
          'python shekhate parba',
          'python shekhao',
          'python kivabe shikhte pari',
          'python shikhte chai'
        ],
        responses_en: [
          '🐍 <strong>Yes, absolutely! I can teach and guide you in Python programming from scratch to advanced!</strong><br><br>💡 <strong>Key Topics We Can Explore:</strong><br>1. <strong>Fundamentals:</strong> Variables, Data Types (Lists, Tuples, Dictionaries), Loops, and Functions.<br>2. <strong>Object-Oriented Programming (OOP):</strong> Classes, Inheritance, Encapsulation, and Polymorphism.<br>3. <strong>Data Science & AI:</strong> NumPy, Pandas, Matplotlib, and PyTorch Deep Learning.<br>4. <strong>Web & Automation:</strong> Django, Flask, FastAPI, and Script Automation.<br><br>👉 Let me know where you\'d like to start: <em>\'Basic Python\'</em> or <em>\'AI & Machine Learning\'</em>?'
        ],
        responses_bn: [
          '🐍 <strong>হ্যাঁ, অবশ্যই! আমি আপনাকে পাইথন (Python) একদম শুরু থেকে অ্যাডভান্সড লেভেল পর্যন্ত শেখাতে পারব!</strong><br><br>💡 <strong>পাইথনে আমরা যেসব বিষয় ধাপে ধাপে শিখতে পারি:</strong><br>১. <strong>মৌলিক ভিত্তি (Basics):</strong> ভ্যারিয়েবল, ডেটা স্ট্রাকচার (List, Dict, Set, Tuple), লুপ এবং ফাংশন।<br>২. <strong>অবজেক্ট ওরিয়েন্টেড প্রোগ্রামিং (OOP):</strong> Class, Inheritance, Encapsulation ও Methods।<br>৩. <strong>ডাটা সায়েন্স ও এআই:</strong> NumPy, Pandas, Matplotlib, Scikit-Learn ও PyTorch ডিপ লার্নিং।<br>৪. <strong>ওয়েব ও অটোমেশন:</strong> Django, Flask, FastAPI এবং ফাইল অটোমেশন স্ক্রিপ্ট।<br><br>👉 আপনি কোন লেভেল থেকে শুরু করতে চান বলুন — <em>\'বেসিক পাইথন\'</em>, নাকি <em>\'এআই/মেশিন লার্নিং\'</em>?'
        ]
      },
      {
        id: 'mem_multilingual_chat_support',
        category: 'ai',
        title: 'বহুভাষিক চ্যাট সুবিধা — বাংলা, বাংলিশ ও ইংরেজি (Multilingual Chat: Bangla, Banglish & English)',
        keywords_en: [
          'can you speak banglish',
          'multilingual chat',
          'chat in banglish',
          'all language chat',
          'can you understand bangla and english'
        ],
        keywords_bn: [
          'সব ভাষায় চ্যাট',
          'বাংলিশ চ্যাট',
          'সব ভাষায় কথা বলো',
          'বাংলা এবং ইংরেজি চ্যাট',
          'chat box e sob koya vashay jeno chat korte pari',
          'sob vashay chat',
          'banglish kotha bolo',
          'tomi ki banglish jano',
          'banglish ki tomi jano',
          'banglish jano'
        ],
        responses_en: [
          '✨ <strong>Yes! You can chat freely in Pure Bengali, Banglish, or English!</strong><br><br>• <strong>Banglish:</strong> e.g., <em>"tomi ki amake help korte parbe?"</em><br>• <strong>Bangla (বাংলা):</strong> e.g., <em>"তুমি কি আমাকে সাহায্য করতে পারবে?"</em><br>• <strong>English:</strong> e.g., <em>"Can you assist me with Python?"</em><br><br>Our neural natural language engine automatically detects your input dialect and answers in the exact matching language! 🧠💬'
        ],
        responses_bn: [
          '✨ <strong>হ্যাঁ! আপনি এই চ্যাটবক্সে বাংলা, বাংলিশ এবং ইংরেজি — যেকোনো ভাষায় স্বাচ্ছন্দ্যে চ্যাট করতে পারবেন!</strong><br><br>• <strong>বাংলিশ (Banglish):</strong> যেমন — <em>"tomi ki amake python shekhate parbe?"</em><br>• <strong>শুদ্ধ বাংলা (Bangla):</strong> যেমন — <em>"তুমি কি আমাকে পাইথন শেখাতে পারবে?"</em><br>• <strong>ইংরেজি (English):</strong> যেমন — <em>"Can you teach me Python?"</em><br><br>আমাদের নিউরাল ইঞ্জিন স্বয়ংক্রিয়ভাবে আপনার লেখার ভাষা ও ভঙ্গি বুঝে তাৎক্ষণিক যথাযথ উত্তর দেয়! 🧠💬'
        ]
      }
    ],

    // Last rotation tracker for non-repeating unique answers per intent & language
    lastResponseIndexMap: {},

    // Custom memory stored in localStorage
    getCustomKnowledge() {
      try {
        const stored = localStorage.getItem('neural_bot_custom_kb');
        return stored ? JSON.parse(stored) : [];
      } catch (e) {
        return [];
      }
    },

    // Dynamic GitHub Repos Memory stored in localStorage
    getGitHubKnowledge() {
      try {
        const stored = localStorage.getItem('neural_bot_github_kb');
        return stored ? JSON.parse(stored) : [];
      } catch (e) {
        return [];
      }
    },

    async syncFromGitHub() {
      try {
        const res = await fetch('https://api.github.com/users/rokeyaag/repos?sort=updated&per_page=100');
        if (!res.ok) return [];
        const repos = await res.json();
        if (!Array.isArray(repos)) return [];
        
        const githubItems = repos.map(repo => {
          const hasHomepage = repo.homepage && repo.homepage.startsWith('http');
          const langText = repo.language ? ` [${repo.language}]` : '';
          return {
            id: 'gh_' + repo.name.replace(/[^a-zA-Z0-9_]/g, '_'),
            category: 'github',
            title: `${repo.name}${langText}`,
            repoUrl: repo.html_url,
            homepageUrl: hasHomepage ? repo.homepage : null,
            stars: repo.stargazers_count || 0,
            language: repo.language,
            keywords_en: [repo.name.toLowerCase(), repo.name.replace(/[-_]/g, ' ').toLowerCase(), `${repo.name.toLowerCase()} project`, `${repo.name.toLowerCase()} repo`],
            keywords_bn: [repo.name.toLowerCase(), repo.name.replace(/[-_]/g, ' ').toLowerCase(), `${repo.name.toLowerCase()} প্রজেক্ট`, `${repo.name.toLowerCase()} রিপোজিটরি`],
            responses_en: [
              `<strong>${repo.name}</strong>${langText}: ${repo.description || 'Public GitHub repository by Lutfor Rahman.'}<br>• <strong>Repository:</strong> <a href="${repo.html_url}" target="_blank" style="color:#00f2fe;">${repo.html_url}</a>${hasHomepage ? `<br>• <strong>Live Demo:</strong> <a href="${repo.homepage}" target="_blank" style="color:#00f2fe;">${repo.homepage}</a>` : ''}`
            ],
            responses_bn: [
              `<strong>${repo.name}</strong>${langText}: এটি লুৎফর রহমানের তৈরি একটি গিটহাব প্রজেক্ট।${repo.description ? ` (${repo.description})` : ''}<br>• <strong>গিটহাব লিঙ্ক:</strong> <a href="${repo.html_url}" target="_blank" style="color:#00f2fe;">${repo.html_url}</a>${hasHomepage ? `<br>• <strong>লাইভ ডেমো:</strong> <a href="${repo.homepage}" target="_blank" style="color:#00f2fe;">${repo.homepage}</a>` : ''}`
            ],
            isGitHub: true
          };
        });

        localStorage.setItem('neural_bot_github_kb', JSON.stringify(githubItems));
        return githubItems;
      } catch (e) {
        console.warn('GitHub sync error:', e);
        return [];
      }
    },

    // Memory loaded from data/memory.json
    fileMemory: [],

    async loadFileMemory() {
      try {
        const res = await fetch('data/memory.json?v=' + Date.now());
        if (res.ok) {
          const items = await res.json();
          if (Array.isArray(items)) {
            this.fileMemory = items.map(item => ({
              ...item,
              isFileMemory: true,
              category: item.category || 'file_memory'
            }));
            console.log(`[NeuralBot] Loaded ${this.fileMemory.length} items from data/memory.json`);
            return this.fileMemory;
          }
        }
      } catch (err) {
        console.warn('[NeuralBot] Note: data/memory.json could not be loaded:', err);
      }
      return [];
    },

    // Web Ingested Memory stored in localStorage
    getWebKnowledge() {
      try {
        const stored = localStorage.getItem('neural_bot_web_kb');
        if (!stored) return [];
        let list = JSON.parse(stored);
        if (Array.isArray(list)) {
          const valid = list.filter(item => {
            const title = (item.title || '').toLowerCase();
            const resp = ((item.responses_en && item.responses_en[0]) || (item.responses && item.responses[0]) || '').toLowerCase();
            return !title.includes('vercel security checkpoint') &&
                   !title.includes('too many requests') &&
                   !resp.includes('target url returned error 429') &&
                   !resp.includes('security checkpoint');
          });
          if (valid.length !== list.length) {
            localStorage.setItem('neural_bot_web_kb', JSON.stringify(valid));
          }
          return valid;
        }
        return [];
      } catch (e) {
        return [];
      }
    },

    saveWebKnowledge(item) {
      const webList = this.getWebKnowledge();
      const filtered = webList.filter(w => w.sourceUrl !== item.sourceUrl && w.id !== item.id);
      filtered.unshift(item);
      localStorage.setItem('neural_bot_web_kb', JSON.stringify(filtered));
      return filtered;
    },

    deleteWebKnowledge(id) {
      let webList = this.getWebKnowledge();
      webList = webList.filter(item => item.id !== id);
      localStorage.setItem('neural_bot_web_kb', JSON.stringify(webList));
      return webList;
    },

    async ingestFromWebUrl(rawUrl, manualTitle = '') {
      let targetUrl = (rawUrl || '').trim();
      if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
        targetUrl = 'https://' + targetUrl;
      }

      let parsedUrl;
      try {
        parsedUrl = new URL(targetUrl);
      } catch (e) {
        throw new Error('অনুগ্রহ করে একটি সঠিক ও বৈধ Website URL দিন (যেমন: https://example.com/page)');
      }

      let rawContent = '';
      let pageTitle = manualTitle ? manualTitle.trim() : '';

      // Multi-Tier Reader Proxy Pipeline
      // Tier 1: Jina AI Markdown Reader (Fast & Clean Markdown)
      try {
        const jinaUrl = `https://r.jina.ai/${targetUrl}`;
        const response = await fetch(jinaUrl, {
          headers: {
            'Accept': 'text/plain, text/markdown, application/json'
          }
        });
        if (response.ok) {
          const txt = await response.text();
          if (txt && txt.length > 80 && !txt.includes('429: Too Many Requests')) {
            rawContent = txt;
          }
        }
      } catch (err) {
        console.warn('[WebIngest] Jina reader attempt failed, trying Tier 2 proxy:', err);
      }

      // Tier 2: AllOrigins JSON proxy
      if (!rawContent || rawContent.length < 80) {
        try {
          const fallbackRes = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`);
          if (fallbackRes.ok) {
            const data = await fallbackRes.json();
            if (data && data.contents) {
              const doc = new DOMParser().parseFromString(data.contents, 'text/html');
              if (!pageTitle) {
                pageTitle = doc.title || '';
              }
              const elements = Array.from(doc.querySelectorAll('h1, h2, h3, h4, p, li, article, section'));
              const pieces = [];
              elements.forEach(el => {
                const tag = el.tagName.toLowerCase();
                const text = el.textContent.trim();
                if (text.length > 15) {
                  if (tag.startsWith('h')) pieces.push(`\n### ${text}`);
                  else if (tag === 'li') pieces.push(`• ${text}`);
                  else pieces.push(text);
                }
              });
              rawContent = pieces.slice(0, 35).join('\n\n');
            }
          }
        } catch (fbErr) {
          console.warn('[WebIngest] AllOrigins proxy failed, trying Tier 3 proxy:', fbErr);
        }
      }

      // Tier 3: CORSProxy.io fallback
      if (!rawContent || rawContent.length < 80) {
        try {
          const corsRes = await fetch(`https://corsproxy.io/?url=${encodeURIComponent(targetUrl)}`);
          if (corsRes.ok) {
            const html = await corsRes.text();
            const doc = new DOMParser().parseFromString(html, 'text/html');
            if (!pageTitle) {
              pageTitle = doc.title || '';
            }
            const elements = Array.from(doc.querySelectorAll('h1, h2, h3, h4, p, li'));
            const pieces = [];
            elements.forEach(el => {
              const tag = el.tagName.toLowerCase();
              const text = el.textContent.trim();
              if (text.length > 15) {
                if (tag.startsWith('h')) pieces.push(`\n### ${text}`);
                else if (tag === 'li') pieces.push(`• ${text}`);
                else pieces.push(text);
              }
            });
            rawContent = pieces.slice(0, 35).join('\n\n');
          }
        } catch (corsErr) {
          console.warn('[WebIngest] Corsproxy fallback failed:', corsErr);
        }
      }

      if (!rawContent || rawContent.trim().length < 40) {
        throw new Error('ওয়েবসাইট থেকে তথ্য লোড করা সম্ভব হয়নি। লিংকটি পাবলিক ও লাইভ কিনা যাচাই করুন।');
      }

      // Check if response was blocked or checkpointed
      if (rawContent.includes('429: Too Many Requests') ||
          rawContent.includes('Vercel Security Checkpoint') ||
          rawContent.includes('Security Checkpoint Warning') ||
          (rawContent.includes('Cloudflare') && rawContent.includes('Just a moment'))) {
        throw new Error('এই ওয়েবসাইটটিতে অ্যাক্সেস সিকিউরিটি/রেট-লিমিট রয়েছে। দয়া করে কোনো পাবলিক পেজ বা ডকুমেন্টেশন লিংক দিন।');
      }

      // Extract title from markdown headers if not already detected
      if (!pageTitle) {
        const titleMatch = rawContent.match(/^Title:\s*(.+)$/im) || rawContent.match(/^#\s+(.+)$/m) || rawContent.match(/###\s+(.+)$/m);
        if (titleMatch) {
          pageTitle = titleMatch[1].trim();
        } else {
          pageTitle = parsedUrl.hostname.replace(/^www\./i, '') + (parsedUrl.pathname.length > 1 ? parsedUrl.pathname : '');
        }
      }

      // Deep parsing: Extract clean paragraphs, headings, and bullet points
      const lines = rawContent.split('\n').map(l => l.trim()).filter(Boolean);
      let overviewParagraphs = [];
      let keyPoints = [];
      let subtopicHeaders = [];

      for (const line of lines) {
        // Skip metadata noise
        if (/^URL Source:|^Markdown Content:|^Published:|^Author:|^Images:|^\[Image/i.test(line)) continue;
        if (line.startsWith('###') || line.startsWith('##') || line.startsWith('#')) {
          const hText = line.replace(/^[#\s]+/, '').replace(/[\*\_\`]/g, '').trim();
          if (hText.length > 3 && hText.length < 90 && !subtopicHeaders.includes(hText)) {
            subtopicHeaders.push(hText);
          }
          continue;
        }

        const cleanLine = line.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1').replace(/[\*\_\`\~]/g, '').trim();
        if (cleanLine.length < 25) continue;

        if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*') || /^\d+\./.test(line)) {
          if (keyPoints.length < 10) {
            keyPoints.push(cleanLine.replace(/^[•\-\*\d\.\s]+/, '').trim());
          }
        } else if (overviewParagraphs.length < 3) {
          overviewParagraphs.push(cleanLine);
        } else if (keyPoints.length < 10) {
          keyPoints.push(cleanLine);
        }
      }

      const overviewText = overviewParagraphs.slice(0, 2).join(' ').substring(0, 450) || 'Official web information extracted directly from the live page.';
      
      let formattedKeyPointsHtml = '';
      if (keyPoints.length > 0) {
        formattedKeyPointsHtml = keyPoints.slice(0, 6).map(pt => `• <strong>${escapeHtml(pt.slice(0, 50))}${pt.length > 50 ? '...' : ''}</strong> ${escapeHtml(pt.slice(50, 250))}`).join('<br>');
      } else {
        formattedKeyPointsHtml = `• ${overviewText}`;
      }

      let subtopicsHtml = '';
      if (subtopicHeaders.length > 0) {
        subtopicsHtml = `<br><br><strong>🏷️ প্রধান টপিক ও সেকশনসমূহ:</strong><br>` + subtopicHeaders.slice(0, 6).map(h => `<span style="display:inline-block; margin:3px 4px; padding:3px 10px; background:rgba(0,242,254,0.1); border:1px solid rgba(0,242,254,0.3); border-radius:15px; font-size:0.8rem; color:#00f2fe;">${escapeHtml(h)}</span>`).join('');
      }

      let subtopicsHtmlEn = '';
      if (subtopicHeaders.length > 0) {
        subtopicsHtmlEn = `<br><br><strong>🏷️ Key Topics & Sections:</strong><br>` + subtopicHeaders.slice(0, 6).map(h => `<span style="display:inline-block; margin:3px 4px; padding:3px 10px; background:rgba(0,242,254,0.1); border:1px solid rgba(0,242,254,0.3); border-radius:15px; font-size:0.8rem; color:#00f2fe;">${escapeHtml(h)}</span>`).join('');
      }

      // Keyword generation for high-accuracy scoring
      const titleTokens = pageTitle.toLowerCase().replace(/[^a-zA-Z0-9\u0980-\u09FF\s]/g, ' ').split(/\s+/).filter(t => t.length > 2);
      const subtopicTokens = subtopicHeaders.join(' ').toLowerCase().replace(/[^a-zA-Z0-9\u0980-\u09FF\s]/g, ' ').split(/\s+/).filter(t => t.length > 3);
      const hostClean = parsedUrl.hostname.replace(/^www\./i, '').toLowerCase();

      const keywords_en = Array.from(new Set([
        pageTitle.toLowerCase(),
        hostClean,
        parsedUrl.hostname.toLowerCase(),
        targetUrl.toLowerCase(),
        ...titleTokens,
        ...subtopicTokens.slice(0, 15),
        ...subtopicHeaders.map(h => h.toLowerCase()).slice(0, 8),
        `${pageTitle.toLowerCase()} overview`,
        `${pageTitle.toLowerCase()} details`,
        `what is ${pageTitle.toLowerCase()}`,
        `about ${pageTitle.toLowerCase()}`,
        `${hostClean} information`
      ]));

      const keywords_bn = Array.from(new Set([
        pageTitle.toLowerCase(),
        `${pageTitle} কি`,
        `${pageTitle} সম্পর্কে বলো`,
        `${pageTitle} এর বিস্তারিত তথ্য`,
        `${pageTitle} এর সুবিধাসমূহ`,
        `${pageTitle} ওয়েবসাইট কি`,
        `${hostClean} কি`,
        ...titleTokens,
        ...subtopicTokens.slice(0, 15)
      ]));

      // Deep Semantic Chunking: Divide full page content into structured searchable units
      const chunks = [];
      let currentSectionHeading = pageTitle;
      let currentSectionLines = [];

      for (const line of lines) {
        if (/^URL Source:|^Markdown Content:|^Published:|^Author:|^Images:|^\[Image/i.test(line)) continue;
        if (line.startsWith('#')) {
          if (currentSectionLines.length > 0) {
            const chunkTxt = currentSectionLines.join(' ').trim();
            if (chunkTxt.length > 35) {
              chunks.push({
                id: 'chk_' + Math.random().toString(36).substring(2, 9),
                heading: currentSectionHeading,
                text: chunkTxt.substring(0, 700),
                pageTitle: pageTitle,
                sourceUrl: targetUrl
              });
            }
            currentSectionLines = [];
          }
          currentSectionHeading = line.replace(/^[#\s]+/, '').replace(/[\*\_\`]/g, '').trim() || pageTitle;
          continue;
        }

        const cl = line.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1').replace(/[\*\_\`\~]/g, '').trim();
        if (cl.length > 20) {
          currentSectionLines.push(cl);
          if (currentSectionLines.join(' ').length >= 400) {
            chunks.push({
              id: 'chk_' + Math.random().toString(36).substring(2, 9),
              heading: currentSectionHeading,
              text: currentSectionLines.join(' ').trim().substring(0, 700),
              pageTitle: pageTitle,
              sourceUrl: targetUrl
            });
            currentSectionLines = [];
          }
        }
      }

      if (currentSectionLines.length > 0) {
        const chunkTxt = currentSectionLines.join(' ').trim();
        if (chunkTxt.length > 25) {
          chunks.push({
            id: 'chk_' + Math.random().toString(36).substring(2, 9),
            heading: currentSectionHeading,
            text: chunkTxt.substring(0, 700),
            pageTitle: pageTitle,
            sourceUrl: targetUrl
          });
        }
      }

      const itemId = 'web_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

      const newItem = {
        id: itemId,
        category: 'web',
        title: pageTitle,
        sourceUrl: targetUrl,
        hostname: parsedUrl.hostname,
        ingestedAt: new Date().toISOString(),
        keywords_en: keywords_en,
        keywords_bn: keywords_bn,
        chunks: chunks,
        rawText: rawContent.substring(0, 15000),
        responses_en: [
          `🌐 <strong>Web Knowledge: ${escapeHtml(pageTitle)}</strong><br>• <strong>Source Link:</strong> <a href="${targetUrl}" target="_blank" rel="noopener noreferrer" style="color:#00f2fe;font-weight:600;">${parsedUrl.hostname} <i class="fa-solid fa-arrow-up-right-from-square" style="font-size:0.75rem;"></i></a><br><br><strong>📌 Overview & Details:</strong><br>${escapeHtml(overviewText)}<br><br><strong>✨ Key Points & Insights:</strong><br>${formattedKeyPointsHtml}${subtopicsHtmlEn}<br><br><span style="font-size:0.8rem;color:rgba(255,255,255,0.65);">💡 Ingested with deep-structured extraction into Neural Memory.</span>`
        ],
        responses_bn: [
          `🌐 <strong>ওয়েব জ্ঞানভাণ্ডার: ${escapeHtml(pageTitle)}</strong><br>• <strong>মূল লিংক:</strong> <a href="${targetUrl}" target="_blank" rel="noopener noreferrer" style="color:#00f2fe;font-weight:600;">${parsedUrl.hostname} <i class="fa-solid fa-arrow-up-right-from-square" style="font-size:0.75rem;"></i></a><br><br><strong>📌 মূল বিবরণ:</strong><br>${escapeHtml(overviewText)}<br><br><strong>✨ গুরুত্বপূর্ণ পয়েন্ট ও বিস্তারিত তথ্য:</strong><br>${formattedKeyPointsHtml}${subtopicsHtml}<br><br><span style="font-size:0.8rem;color:rgba(255,255,255,0.65);">💡 এই বিস্তারিত তথ্যটি ওয়েবসাইট থেকে সরাসরি নিউরাল মেমোরিতে সংরক্ষণ করা হয়েছে।</span>`
        ],
        isWebIngested: true
      };

      this.saveWebKnowledge(newItem);
      return newItem;
    },

    saveCustomKnowledge(item) {
      const customList = this.getCustomKnowledge();
      customList.unshift(item);
      localStorage.setItem('neural_bot_custom_kb', JSON.stringify(customList));
      return customList;
    },

    deleteCustomKnowledge(id) {
      let customList = this.getCustomKnowledge();
      customList = customList.filter(item => item.id !== id);
      localStorage.setItem('neural_bot_custom_kb', JSON.stringify(customList));
      return customList;
    },

    getAllKnowledge() {
      const learned = (window.NeuralDialogueMemory && typeof window.NeuralDialogueMemory.getLearnedQA === 'function')
        ? window.NeuralDialogueMemory.getLearnedQA()
        : [];
      const custom = this.getCustomKnowledge();
      const web = this.getWebKnowledge();
      const file = this.fileMemory || [];
      const github = this.getGitHubKnowledge();
      return [...learned, ...custom, ...web, ...file, ...github, ...this.defaultStore];
    },

    // Multi-turn Active Topic Context Tracker
    lastActiveTopic: null,

    setLastActiveTopic(topicObj) {
      if (!topicObj) return;
      this.lastActiveTopic = {
        id: topicObj.id || null,
        title: topicObj.title || '',
        name: topicObj.name || (topicObj.title ? topicObj.title.split(/[\s\-–—(]/)[0].toLowerCase().trim() : ''),
        hostname: topicObj.hostname || null,
        sourceUrl: topicObj.sourceUrl || null,
        category: topicObj.category || 'web',
        isWeb: Boolean(topicObj.isWebIngested || topicObj.category === 'web'),
        timestamp: Date.now()
      };
      try {
        sessionStorage.setItem('neural_bot_last_active_topic', JSON.stringify(this.lastActiveTopic));
      } catch (e) {}
    },

    getLastActiveTopic() {
      if (this.lastActiveTopic) return this.lastActiveTopic;
      try {
        const stored = sessionStorage.getItem('neural_bot_last_active_topic');
        if (stored) {
          this.lastActiveTopic = JSON.parse(stored);
          return this.lastActiveTopic;
        }
      } catch (e) {}
      return null;
    },

    // Search semantic chunks across all ingested websites (Deep In-Browser RAG Retrieval)
    searchWebChunks(rawQuery, limit = 4, targetTopic = null) {
      if (!rawQuery || !rawQuery.trim()) return [];
      const cleanQ = normalizeSearchText(rawQuery);
      const rawTokens = cleanQ.split(' ').filter(t => t.length > 1 && !COMMON_STOPWORDS.has(t));
      if (rawTokens.length === 0 && cleanQ.length < 3) return [];

      // Expand tokens with Banglish <-> Bengali synonyms
      const qTokens = expandSearchTokens(rawTokens);

      const activeTopic = targetTopic || this.getLastActiveTopic();
      const webList = this.getWebKnowledge();
      const scoredChunks = [];

      for (const item of webList) {
        const pTitle = (item.title || '').toLowerCase();
        const pUrl = (item.sourceUrl || '').toLowerCase();
        const pHost = (item.hostname || '').toLowerCase();
        const chunks = item.chunks || [];
        const isFocusedItem = activeTopic && (
          (activeTopic.id && activeTopic.id === item.id) ||
          (activeTopic.sourceUrl && activeTopic.sourceUrl === item.sourceUrl) ||
          (activeTopic.name && (pTitle.includes(activeTopic.name) || pHost.includes(activeTopic.name)))
        );

        // If item doesn't have chunks yet (older saved items), create synthetic chunk from responses
        const effectiveChunks = chunks.length > 0 ? chunks : [
          {
            id: 'syn_' + item.id,
            heading: item.title,
            text: (item.responses_en?.[0] || item.responses_bn?.[0] || '').replace(/<[^>]+>/g, ' '),
            pageTitle: item.title,
            sourceUrl: item.sourceUrl
          }
        ];

        // 1. Scan semantic chunks
        for (const chk of effectiveChunks) {
          let score = 0;
          const hText = (chk.heading || '').toLowerCase();
          const bText = (chk.text || '').toLowerCase();

          // Focused topic boost
          if (isFocusedItem) {
            score += 35;
          }

          // Full normalized phrase match
          if (cleanQ.length >= 4) {
            if (hText.includes(cleanQ)) score += 90;
            if (bText.includes(cleanQ)) score += 70;
            if (pTitle.includes(cleanQ)) score += 50;
          }

          // Individual substantive token matching (with synonyms)
          for (const tok of qTokens) {
            if (tok.length < 2) continue;
            if (hasWordOrPhrase(hText, tok)) score += 40;
            else if (hText.includes(tok)) score += 25;

            if (hasWordOrPhrase(bText, tok)) score += 28;
            else if (bText.includes(tok)) score += 18;

            if (pTitle.includes(tok)) score += 25;
          }

          if (score > 0) {
            scoredChunks.push({
              ...chk,
              score,
              pageTitle: item.title,
              sourceUrl: item.sourceUrl
            });
          }
        }

        // 2. Deep RawText Keyword Extraction: If chunks missed specific lists (e.g. courses list, bullet points)
        if (item.rawText && (isFocusedItem || qTokens.some(t => ['course', 'কোর্স', 'বুটক্যাম্প', 'ফি', 'ভর্তি'].includes(t)))) {
          const rawLines = item.rawText.split('\n').map(l => l.trim()).filter(Boolean);
          const relevantSnippetLines = [];
          for (const line of rawLines) {
            const lLower = line.toLowerCase();
            const hit = qTokens.some(tok => tok.length >= 3 && lLower.includes(tok));
            if (hit) {
              const cleanL = line.replace(/^[#\*\-•\s]+/, '').trim();
              if (cleanL.length > 15 && cleanL.length < 350 && !relevantSnippetLines.includes(cleanL)) {
                relevantSnippetLines.push(cleanL);
              }
            }
          }

          if (relevantSnippetLines.length > 0) {
            const snippetText = relevantSnippetLines.slice(0, 8).map(l => `• ${l}`).join('\n');
            scoredChunks.push({
              id: 'raw_snippet_' + item.id,
              heading: 'ওয়েবসাইট থেকে সরাসরি বিস্তারিত এক্সট্রাকশন (Extracted Highlights)',
              text: snippetText,
              score: isFocusedItem ? 110 : 85,
              pageTitle: item.title,
              sourceUrl: item.sourceUrl,
              isRawExtracted: true
            });
          }
        }
      }

      scoredChunks.sort((a, b) => b.score - a.score);
      return scoredChunks.slice(0, limit);
    },

    // Dynamic non-repeating selector strictly filtered by language
    getRandomResponse(item, isBengali) {
      let list = [];
      if (isBengali) {
        list = item.responses_bn || (item.category_lang === 'bn' ? item.responses : null) || item.responses || item.responses_en;
      } else {
        list = item.responses_en || (item.category_lang === 'en' ? item.responses : null) || item.responses || item.responses_bn;
      }

      if (!list || list.length === 0) {
        return isBengali ? "আপনার প্রশ্নটি প্রসেস হয়েছে।" : "Neural query processed.";
      }
      if (list.length === 1) {
        return list[0];
      }
      
      const key = `${item.id}_${isBengali ? 'bn' : 'en'}`;
      const lastIndex = this.lastResponseIndexMap[key] !== undefined ? this.lastResponseIndexMap[key] : -1;
      let nextIndex;
      do {
        nextIndex = Math.floor(Math.random() * list.length);
      } while (nextIndex === lastIndex && list.length > 1);

      this.lastResponseIndexMap[key] = nextIndex;
      return list[nextIndex];
    }
  };

  // Expose knowledge store globally
  window.NeuralKnowledgeStore = NeuralKnowledgeStore;

  // Auto-load external memory from data/memory.json and sync GitHub repositories on launch
  setTimeout(() => {
    Promise.all([
      NeuralKnowledgeStore.loadFileMemory(),
      NeuralKnowledgeStore.syncFromGitHub()
    ]).then(() => {
      if (typeof window.refreshKnowledgeStoreUI === 'function') {
        window.refreshKnowledgeStoreUI();
      }
    });
  }, 400);

  // --- INTERACTIVE RECIPROCAL DIALOGUE & TWO-WAY Q&A MEMORY ENGINE ---
  const NeuralDialogueMemory = {
    PROFILE_KEY: 'neural_bot_user_profile',
    DIALOGUE_HISTORY_KEY: 'neural_bot_qa_dialogue_history',
    LEARNED_QA_KEY: 'neural_bot_learned_qa_items',
    PENDING_STATE_KEY: 'neural_bot_pending_dialogue_state',
    LOGGED_IN_USER_KEY: 'neural_bot_logged_in_user',

    getLoggedInUser() {
      try {
        const authData = localStorage.getItem(this.LOGGED_IN_USER_KEY) || sessionStorage.getItem(this.LOGGED_IN_USER_KEY);
        if (authData) {
          try {
            const parsed = JSON.parse(authData);
            if (parsed && (parsed.name || parsed.username)) return parsed;
          } catch(e) {
            if (typeof authData === 'string' && authData.trim()) return { name: authData.trim() };
          }
        }
        // Fallback check standard web login storage keys
        const altKeys = ['username', 'user_name', 'current_user', 'auth_user', 'user'];
        for (const k of altKeys) {
          const val = localStorage.getItem(k) || sessionStorage.getItem(k);
          if (val) {
            try {
              const p = JSON.parse(val);
              if (p && (p.name || p.username)) return { name: p.name || p.username, city: p.city || null };
            } catch(e) {
              if (typeof val === 'string' && val.trim()) return { name: val.trim() };
            }
          }
        }
        // Fallback to profile name if set
        const profileRaw = localStorage.getItem(this.PROFILE_KEY);
        if (profileRaw) {
          const prof = JSON.parse(profileRaw);
          if (prof && prof.name) return { name: prof.name, city: prof.hometown || null };
        }
        return null;
      } catch (e) {
        return null;
      }
    },

    setLoggedInUser(name, city = null) {
      if (!name || !name.trim()) return null;
      const userObj = {
        name: name.trim(),
        city: city && city.trim() ? city.trim() : null,
        loggedInAt: new Date().toISOString()
      };
      try {
        localStorage.setItem(this.LOGGED_IN_USER_KEY, JSON.stringify(userObj));
        this.setProfileField('name', userObj.name);
        if (userObj.city) {
          this.setProfileField('hometown', userObj.city);
        }
        this.saveLearnedQA({
          id: 'qa_name',
          topic: 'name',
          category: 'qa_memory',
          title: `ব্যবহারকারীর নাম (User Name)`,
          questionText: 'আমার নাম কি?',
          answerText: userObj.name,
          keywords_bn: ['আমার নাম কি', 'আমার নাম কী', 'আমার নামটা কি', 'আমার নাম বলো', 'amar nam ki', 'who am i'],
          keywords_en: ['what is my name', 'who am i'],
          responses_bn: [`আপনার নাম হলো <strong>${escapeHtml(userObj.name)}</strong>! ❤️`],
          responses_en: [`Your name is <strong>${escapeHtml(userObj.name)}</strong>! ❤️`],
          isLearnedQA: true
        });
        if (typeof window.syncUserAuthUI === 'function') {
          window.syncUserAuthUI();
        }
      } catch (e) {}
      return userObj;
    },

    logoutUser() {
      try {
        localStorage.removeItem(this.LOGGED_IN_USER_KEY);
        sessionStorage.removeItem(this.LOGGED_IN_USER_KEY);
        const p = this.getProfile();
        delete p.name;
        this.saveProfile(p);
        this.deleteLearnedQA('qa_name');
        if (typeof window.syncUserAuthUI === 'function') {
          window.syncUserAuthUI();
        }
      } catch (e) {}
    },

    getProfile() {
      try {
        const data = localStorage.getItem(this.PROFILE_KEY);
        const profile = data ? JSON.parse(data) : {};
        const loggedIn = this.getLoggedInUser();
        if (loggedIn && loggedIn.name && !profile.name) {
          profile.name = loggedIn.name;
        }
        return profile;
      } catch (e) {
        return {};
      }
    },

    saveProfile(profile) {
      try {
        localStorage.setItem(this.PROFILE_KEY, JSON.stringify(profile));
      } catch (e) {}
    },

    setProfileField(field, value) {
      const p = this.getProfile();
      p[field] = value;
      p.updatedAt = new Date().toISOString();
      this.saveProfile(p);
      return p;
    },

    getDialogueHistory() {
      try {
        const d = localStorage.getItem(this.DIALOGUE_HISTORY_KEY);
        return d ? JSON.parse(d) : [];
      } catch (e) {
        return [];
      }
    },

    addDialogueTurn(turn) {
      try {
        const history = this.getDialogueHistory();
        history.unshift({
          id: 'turn_' + Date.now(),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          date: new Date().toLocaleDateString(),
          ...turn
        });
        if (history.length > 100) history.pop();
        localStorage.setItem(this.DIALOGUE_HISTORY_KEY, JSON.stringify(history));
      } catch (e) {}
    },

    getLearnedQA() {
      try {
        const d = localStorage.getItem(this.LEARNED_QA_KEY);
        return d ? JSON.parse(d) : [];
      } catch (e) {
        return [];
      }
    },

    saveLearnedQA(item) {
      try {
        const list = this.getLearnedQA();
        const filtered = list.filter(i => i.id !== item.id && (item.topic ? i.topic !== item.topic : true));
        filtered.unshift(item);
        localStorage.setItem(this.LEARNED_QA_KEY, JSON.stringify(filtered));
        return filtered;
      } catch (e) {
        return [];
      }
    },

    deleteLearnedQA(id) {
      try {
        let list = this.getLearnedQA();
        list = list.filter(i => i.id !== id);
        localStorage.setItem(this.LEARNED_QA_KEY, JSON.stringify(list));
        return list;
      } catch (e) {
        return [];
      }
    },

    getPendingQuestion() {
      try {
        const d = sessionStorage.getItem(this.PENDING_STATE_KEY) || localStorage.getItem(this.PENDING_STATE_KEY);
        return d ? JSON.parse(d) : null;
      } catch (e) {
        return null;
      }
    },

    setPendingQuestion(topic, questionText, expectedField = null) {
      try {
        const state = {
          topic,
          questionText,
          expectedField: expectedField || topic,
          timestamp: Date.now()
        };
        sessionStorage.setItem(this.PENDING_STATE_KEY, JSON.stringify(state));
        localStorage.setItem(this.PENDING_STATE_KEY, JSON.stringify(state));
      } catch (e) {}
    },

    clearPendingQuestion() {
      try {
        sessionStorage.removeItem(this.PENDING_STATE_KEY);
        localStorage.removeItem(this.PENDING_STATE_KEY);
      } catch (e) {}
    },

    clearAllMemory() {
      try {
        localStorage.removeItem(this.PROFILE_KEY);
        localStorage.removeItem(this.DIALOGUE_HISTORY_KEY);
        localStorage.removeItem(this.LEARNED_QA_KEY);
        this.clearPendingQuestion();
      } catch (e) {}
    },

    // Generates a reciprocal follow-up question to ask the user
    generateReciprocalQuestion(profile, isBengali, currentTopic = null) {
      // 1. Core Profile Fields Check First
      if (!profile.name && currentTopic !== 'name') {
        this.setPendingQuestion('name', isBengali ? 'আপনার সুন্দর নাম কী? আমাকে বলুন যাতে মনে রাখতে পারি!' : 'What is your name? Please tell me so I can remember you!', 'name');
        return isBengali
          ? "<br><br>আপনার সুন্দর নাম কী? আমাকে বলুন, যাতে সবসময় মনে রাখতে পারি! 😊"
          : "<br><br>What is your name? Please tell me so I can remember you! 😊";
      }

      if (!profile.hometown && currentTopic !== 'hometown') {
        const nameGreeting = profile.name ? `আচ্ছা <strong>${escapeHtml(profile.name)}</strong>, ` : 'আচ্ছা, ';
        const nameGreetingEn = profile.name ? `By the way <strong>${escapeHtml(profile.name)}</strong>, ` : 'By the way, ';
        this.setPendingQuestion('hometown', isBengali ? 'আপনি কোন শহরে বা জেলায় থাকেন?' : 'Which city or hometown do you live in?', 'hometown');
        return isBengali
          ? `<br><br>${nameGreeting}আপনি কোন শহরে বা জেলায় থাকেন? আপনার বাড়ি কোথায়? 🏙️`
          : `<br><br>${nameGreetingEn}which city or country do you live in? 🏙️`;
      }

      if (!profile.profession && currentTopic !== 'profession') {
        const nameGreeting = profile.name ? `আচ্ছা <strong>${escapeHtml(profile.name)}</strong>, ` : '';
        const nameGreetingEn = profile.name ? `By the way <strong>${escapeHtml(profile.name)}</strong>, ` : '';
        this.setPendingQuestion('profession', isBengali ? 'আপনার পেশা কী বা কী নিয়ে পড়াশোনা করছেন?' : 'What is your profession or field of study?', 'profession');
        return isBengali
          ? `<br><br>${nameGreeting}আপনি কী নিয়ে পড়াশোনা করছেন বা আপনার পেশা কী? 💼`
          : `<br><br>${nameGreetingEn}what is your profession or field of study? 💼`;
      }

      // 2. Rich, Dynamic Daily Life, Routine & Work Questions Pool
      const namePrefix = profile.name ? `আচ্ছা <strong>${escapeHtml(profile.name)}</strong>, ` : '';
      const namePrefixEn = profile.name ? `By the way <strong>${escapeHtml(profile.name)}</strong>, ` : '';

      const dailyQuestionsBn = [
        // Daily Tasks & Goals
        { topic: 'daily_task', q: "আজ আপনার প্রধান কাজের টার্গেট বা টু-ডু লিস্ট কী?", label: `${namePrefix}আজ আপনার প্রধান কাজের টার্গেট বা টু-ডু লিস্ট কী? কোন কাজটি আজ সবচেয়ে গুরুত্বপূর্ণ? 📝` },
        { topic: 'current_project', q: "বর্তমানে আপনি কোন বিশেষ প্রজেক্ট বা কাজের ওপর সময় দিচ্ছেন?", label: `${namePrefix}বর্তমানে আপনি কোন বিশেষ প্রজেক্ট বা বড় কাজের ওপর কাজ করছেন? 🚀` },
        { topic: 'coding_tech_stack', q: "দৈনন্দিন কাজে আপনি কোন আইডিই বা টেকনোলজি টুল সবচেয়ে বেশি ব্যবহার করেন?", label: `${namePrefix}দৈনন্দিন কোডিং বা প্রজেক্টে আপনি কোন সফটওয়্যার বা টেকনোলজি টুল সবচেয়ে বেশি ব্যবহার করেন? 💻` },
        { topic: 'work_focus', q: "কাজের সময় গভীর মনোযোগ ও ফোকাস ধরে রাখতে কী কৌশল নেন?", label: `${namePrefix}কাজের সময় পূর্ণ মনোযোগ ও ফোকাস ধরে রাখতে আপনার প্রিয় কৌশল বা অভ্যাস কোনটি? ⏱️` },
        { topic: 'daily_learning', q: "আজ নতুন কী শিখলেন বা বিশেষ কোনো টেকনিক্যাল জ্ঞান অর্জন করলেন?", label: `${namePrefix}আজ নতুন কী শিখলেন বা বিশেষ কোনো টেকনিক্যাল টিপস/জ্ঞান অর্জন করলেন? 📚` },
        { topic: 'work_workspace', q: "আপনার কাজের ডেস্ক বা পরিবেশ কেমন সাজানো?", label: `${namePrefix}আপনার কাজের ডেস্ক বা পরিবেশ কেমন সাজানো? ল্যাপটপ, মনিটর নাকি শান্ত কোনো কর্নার? 🖥️` },
        
        // Daily Routine & Habits
        { topic: 'wake_routine', q: "সকালে আপনার দিন সাধারণত কীভাবে শুরু হয় এবং কয়টায় ওঠেন?", label: `${namePrefix}সকালে আপনার দিন সাধারণত কীভাবে শুরু হয়? কয়টায় ঘুম থেকে ওঠা পছন্দ করেন? 🌅` },
        { topic: 'coffee_tea', q: "কাজের মাঝে বা সকালে চা নাকি কফি—কোনটি আপনার বেশি পছন্দ?", label: `${namePrefix}কাজের ফাঁকে বা সকালে চা নাকি কফি—কোনটি আপনার বেশি পছন্দ? দিনে কত কাপ খাওয়া হয়? ☕` },
        { topic: 'meal_nutrition', q: "আজ দুপুরের বা রাতের খাবারে কী কী সুস্বাদু পদ ছিল?", label: `${namePrefix}আজ দুপুরের বা রাতের খাবারে কী কী পছন্দের পদ ছিল বলুন তো? 🍲` },
        { topic: 'health_exercise', q: "শরীর সতেজ রাখতে হাঁটাচলা, জিম বা কোনো ব্যায়াম করেন কি?", label: `${namePrefix}কাজের ব্যস্ততার মাঝে শরীর সতেজ রাখতে হাঁটাচলা, জিম বা কোনো ব্যায়াম করেন কি? 🏃` },
        { topic: 'evening_unwind', q: "কাজ শেষে সন্ধ্যায় বা রাতে কীভাবে রিল্যাক্স করতে ভালোবাসেন?", label: `${namePrefix}সারাদিনের কাজকর্ম শেষে সন্ধ্যায় বা রাতে কীভাবে রিল্যাক্স করতে সবচেয়ে ভালোবাসেন? 🌙` },
        { topic: 'sleep_schedule', q: "রাতে সাধারণত কয়টায় ঘুমাতে যান এবং পর্যাপ্ত ঘুম হয় কি?", label: `${namePrefix}রাতে সাধারণত কয়টায় ঘুমাতে যান? পর্যাপ্ত ঘুম কি ঠিকঠাক বজায় থাকে? 😴` },
        
        // Lifestyle, Weekend & Personal Preferences
        { topic: 'hobby', q: "অবসর সময়ে আপনার সবচেয়ে প্রিয় শখ কী?", label: `${namePrefix}অবসরে আপনার সবচেয়ে প্রিয় শখ কী? অবসর সময়ে কী করতে ভালো লাগে? 🎨` },
        { topic: 'fav_language', q: "আপনার সবচেয়ে প্রিয় প্রোগ্রামিং ভাষা কোনটি?", label: `${namePrefix}আপনার সবচেয়ে পছন্দের প্রোগ্রামিং ভাষা বা প্রযুক্তি কোনটি? 💻` },
        { topic: 'fav_food', q: "আপনার সবসময়ের প্রিয় খাবার কোনটি?", label: `${namePrefix}আপনার সবসময়ের পছন্দের প্রিয় খাবার কোনটি বলুন তো? 🍲` },
        { topic: 'fav_music', q: "কোন ধরনের সঙ্গীত বা কোন শিল্পীর গান আপনার পছন্দ?", label: `${namePrefix}আপনি কোন ধরনের সঙ্গীত বা কোন শিল্পীর গান সবচেয়ে বেশি ভালোবাসেন? 🎵` },
        { topic: 'dream', q: "আপনার জীবনের সবচেয়ে বড় স্বপ্ন বা লক্ষ্য কী?", label: `${namePrefix}আপনার জীবনের সবচেয়ে বড় স্বপ্ন বা ভবিষ্যৎ লক্ষ্য কী? 🌟` },
        { topic: 'weekend_plan', q: "সামনের উইকএন্ড বা ছুটির দিনে কী করার পরিকল্পনা আছে?", label: `${namePrefix}সামনের উইকএন্ড বা ছুটির দিনে কী করার পরিকল্পনা আছে? কোথাও ঘুরতে যাবেন? 🏖️` },
        { topic: 'music_while_working', q: "কাজের সময় কি ব্যাকগ্রাউন্ড মিউজিক বা গান শুনতে পছন্দ করেন?", label: `${namePrefix}কোডিং বা কাজের সময় কি ব্যাকগ্রাউন্ড মিউজিক বা গান শুনতে পছন্দ করেন? 🎧` },
        { topic: 'stress_relief', q: "কাজের চাপ বা ক্লান্তি লাগলে কীভাবে নিজেকে মোটিভেটেড করেন?", label: `${namePrefix}কখনও কাজের চাপ বা মানসিক ক্লান্তি লাগলে নিজেকে শান্ত ও মোটিভেটেড রাখতে কী করেন? 🧘` },
        { topic: 'favorite_app_tool', q: "দৈনন্দিন কাজে আপনার সবচেয়ে প্রিয় সফটওয়্যার বা অ্যাপ কোনটি?", label: `${namePrefix}দৈনন্দিন কাজে আপনার সবচেয়ে প্রিয় এবং প্রয়োজনীয় সফটওয়্যার বা মোবাইল অ্যাপ কোনটি? 📱` },
        { topic: 'reading_books', q: "কোন ধরনের বই বা টেকনিক্যাল ব্লগ পড়তে ভালোবাসেন?", label: `${namePrefix}অবসর সময়ে কোন ধরনের বই, টেকনিক্যাল ব্লগ বা আর্টিকেল পড়তে ভালোবাসেন? 📖` },
        { topic: 'ai_in_work', q: "প্রতিদিনের কাজে এআই বা চ্যাটবট কীভাবে সাহায্য করছে বলে মনে করেন?", label: `${namePrefix}আপনার প্রতিদিনের কাজে এআই টুল বা চ্যাটবট কীভাবে সাহায্য করছে বলে আপনি মনে করেন? 🤖` },
        { topic: 'daily_achievement', q: "আজকের সারাদিনের সেরা অর্জন বা ভালো লাগার মুহূর্ত কোনটি ছিল?", label: `${namePrefix}আজকের সারাদিনের মধ্যে আপনার সেরা কোনো অর্জন বা সবচেয়ে ভালো লাগার মুহূর্ত কোনটি ছিল? 🌟` }
      ];

      const dailyQuestionsEn = [
        { topic: 'daily_task', q: "What is your main work goal or to-do target today?", label: `${namePrefixEn}What is your main work target or to-do list for today? 📝` },
        { topic: 'current_project', q: "Which special project are you currently working on?", label: `${namePrefixEn}Which special project or major build are you currently focusing on? 🚀` },
        { topic: 'coding_tech_stack', q: "Which IDE or tech tools do you use most frequently?", label: `${namePrefixEn}Which code editor, framework or software tools do you use most daily? 💻` },
        { topic: 'work_focus', q: "What is your favorite productivity method to stay deeply focused?", label: `${namePrefixEn}What is your go-to habit or technique to maintain deep focus at work? ⏱️` },
        { topic: 'daily_learning', q: "What new technical skill or insight did you learn today?", label: `${namePrefixEn}What is something new or insightful you learned today? 📚` },
        { topic: 'work_workspace', q: "How is your work desk and workspace setup structured?", label: `${namePrefixEn}How is your work desk setup? Laptop, dual monitors, or a quiet cozy corner? 🖥️` },
        { topic: 'wake_routine', q: "How does your morning routine typically start and when do you wake up?", label: `${namePrefixEn}How does your typical morning routine start? What time do you wake up? 🌅` },
        { topic: 'coffee_tea', q: "Do you prefer tea or coffee during work breaks?", label: `${namePrefixEn}During work breaks or mornings, do you prefer tea or coffee? ☕` },
        { topic: 'meal_nutrition', q: "What delicious meals did you have for lunch or dinner today?", label: `${namePrefixEn}What delicious meals or favorite dishes did you enjoy today? 🍲` },
        { topic: 'health_exercise', q: "Do you engage in walks, workouts or gym to stay healthy?", label: `${namePrefixEn}Do you do walking, workouts or exercises to stay energized during work? 🏃` },
        { topic: 'evening_unwind', q: "How do you prefer to unwind and relax in the evening?", label: `${namePrefixEn}How do you love to unwind and recharge after a busy day? 🌙` },
        { topic: 'sleep_schedule', q: "What time do you usually sleep at night?", label: `${namePrefixEn}What time do you usually head to sleep at night? Getting enough rest? 😴` },
        { topic: 'hobby', q: "What is your favorite hobby in your free time?", label: `${namePrefixEn}What is your favorite hobby or thing to do in your free time? 🎨` },
        { topic: 'fav_language', q: "What is your favorite programming language or technology?", label: `${namePrefixEn}What is your favorite programming language or tech stack? 💻` },
        { topic: 'fav_food', q: "What is your all-time favorite food or dish?", label: `${namePrefixEn}What is your all-time favorite food or dish? 🍲` },
        { topic: 'fav_music', q: "What genre of music or singer is your favorite?", label: `${namePrefixEn}What genre of music or singer is your favorite? 🎵` },
        { topic: 'dream', q: "What is your biggest life dream or goal?", label: `${namePrefixEn}What is your biggest life dream or goal? 🌟` },
        { topic: 'weekend_plan', q: "What plans do you have for the upcoming weekend or holiday?", label: `${namePrefixEn}What are your plans or travel thoughts for the upcoming weekend? 🏖️` },
        { topic: 'music_while_working', q: "Do you enjoy listening to background music while coding or working?", label: `${namePrefixEn}Do you like playing background music or lo-fi beats while working? 🎧` },
        { topic: 'stress_relief', q: "How do you recharge when feeling work stress or fatigue?", label: `${namePrefixEn}When dealing with busy work pressure, how do you keep calm and motivated? 🧘` },
        { topic: 'favorite_app_tool', q: "What is your most essential software or mobile app for daily productivity?", label: `${namePrefixEn}What is your most essential productivity software or mobile app? 📱` },
        { topic: 'reading_books', q: "What kinds of books or technical blogs do you enjoy reading?", label: `${namePrefixEn}What types of books, technical articles, or blogs do you like reading? 📖` },
        { topic: 'ai_in_work', q: "How are AI tools helping you in your daily work?", label: `${namePrefixEn}How do you feel AI tools and chatbots are helping your daily workflow? 🤖` },
        { topic: 'daily_achievement', q: "What was your most rewarding accomplishment or highlight today?", label: `${namePrefixEn}What was the most rewarding moment or achievement of your day? 🌟` }
      ];

      const pool = isBengali ? dailyQuestionsBn : dailyQuestionsEn;

      // Filter out topics already recorded in profile and currentTopic to ask fresh unique questions
      const unasked = pool.filter(item => !profile[item.topic] && item.topic !== currentTopic);
      const chosen = unasked.length > 0
        ? unasked[Math.floor(Math.random() * unasked.length)]
        : pool[Math.floor(Math.random() * pool.length)];

      this.setPendingQuestion(chosen.topic, chosen.q, chosen.topic);

      return `<br><br>${chosen.label}`;
    },

    // Main turn handler for Q&A learning, reciprocal answering, and memory retrieval
    processUserTurn(cleanText, rawText, isBengali) {
      const profile = this.getProfile();
      const learned = this.getLearnedQA();
      const pending = this.getPendingQuestion();
      const isQuestionQuery = /(?:^|\s)(?:কি|কী|কেন|কোথায়|কই|কে|কার|কখন|বলো|বলুন|জানাও|জানতে)(?:\s|[?!.,;:()]|$)|[?？]|\b(?:what|who|where|how|why|when|tell)\b/i.test(rawText);

      // 1. Reset / Clear all memory
      if (/স্মৃতি মুছে ফেলো|সব ভুলে যাও|মেমোরি ক্লিয়ার|ভুলে যাও আমাকে|reset memory|clear memory|forget me|forget my name|forget everything/i.test(cleanText)) {
        this.clearAllMemory();
        return isBengali 
          ? "আপনার নির্দেশমতো আমার সকল ডায়ালগ ও পার্সোনাল মেমোরি রিসেট করেছি। আবার নতুন করে পরিচিত হতে পারেন! 🧠✨"
          : "All dialogue & personal memory cleared! I have reset our history. Feel free to introduce yourself again! 🧠✨";
      }

      // 2. Show Learned Memories, Dialogue History & User Profile
      if (/আমার সম্পর্কে কি জানো|আমার সম্পর্কে কি জানিস|আমরা কি কি কথা বলেছি|মেমোরি দেখাও|সংরক্ষিত প্রশ্ন|সংরক্ষিত প্রশ্ন ও উত্তর|ডায়ালগ হিস্ট্রি|about me|what do you know about me|remember me|show memory|dialogue history|learned qa/i.test(cleanText)) {
        const basicDetails = [];
        if (profile.name) basicDetails.push(isBengali ? `• নাম: <strong>${escapeHtml(profile.name)}</strong>` : `• Name: <strong>${escapeHtml(profile.name)}</strong>`);
        if (profile.hometown) basicDetails.push(isBengali ? `• শহর/বাড়ি: <strong>${escapeHtml(profile.hometown)}</strong>` : `• City/Hometown: <strong>${escapeHtml(profile.hometown)}</strong>`);
        if (profile.profession) basicDetails.push(isBengali ? `• পেশা/পড়াশোনা: <strong>${escapeHtml(profile.profession)}</strong>` : `• Profession: <strong>${escapeHtml(profile.profession)}</strong>`);
        if (profile.hobby) basicDetails.push(isBengali ? `• প্রিয় শখ: <strong>${escapeHtml(profile.hobby)}</strong>` : `• Favorite Hobby: <strong>${escapeHtml(profile.hobby)}</strong>`);
        if (profile.fav_language) basicDetails.push(isBengali ? `• প্রিয় প্রোগ্রামিং ভাষা: <strong>${escapeHtml(profile.fav_language)}</strong>` : `• Favorite Language: <strong>${escapeHtml(profile.fav_language)}</strong>`);
        if (profile.fav_food) basicDetails.push(isBengali ? `• প্রিয় খাবার: <strong>${escapeHtml(profile.fav_food)}</strong>` : `• Favorite Food: <strong>${escapeHtml(profile.fav_food)}</strong>`);
        if (profile.fav_music) basicDetails.push(isBengali ? `• প্রিয় সঙ্গীত: <strong>${escapeHtml(profile.fav_music)}</strong>` : `• Favorite Music: <strong>${escapeHtml(profile.fav_music)}</strong>`);
        if (profile.dream) basicDetails.push(isBengali ? `• স্বপ্ন/লক্ষ্য: <strong>${escapeHtml(profile.dream)}</strong>` : `• Life Dream: <strong>${escapeHtml(profile.dream)}</strong>`);

        const dailyDetails = [];
        if (profile.daily_task) dailyDetails.push(isBengali ? `• কাজের লক্ষ্য: <strong>${escapeHtml(profile.daily_task)}</strong>` : `• Daily Goal: <strong>${escapeHtml(profile.daily_task)}</strong>`);
        if (profile.current_project) dailyDetails.push(isBengali ? `• বর্তমান প্রজেক্ট: <strong>${escapeHtml(profile.current_project)}</strong>` : `• Current Project: <strong>${escapeHtml(profile.current_project)}</strong>`);
        if (profile.coding_tech_stack) dailyDetails.push(isBengali ? `• কোডিং টুল/টেক: <strong>${escapeHtml(profile.coding_tech_stack)}</strong>` : `• Tech Tools: <strong>${escapeHtml(profile.coding_tech_stack)}</strong>`);
        if (profile.wake_routine) dailyDetails.push(isBengali ? `• সকালের রুটিন: <strong>${escapeHtml(profile.wake_routine)}</strong>` : `• Morning Routine: <strong>${escapeHtml(profile.wake_routine)}</strong>`);
        if (profile.coffee_tea) dailyDetails.push(isBengali ? `• চা/কফি অভ্যাস: <strong>${escapeHtml(profile.coffee_tea)}</strong>` : `• Coffee/Tea Habit: <strong>${escapeHtml(profile.coffee_tea)}</strong>`);
        if (profile.evening_unwind) dailyDetails.push(isBengali ? `• কাজ শেষে রিল্যাক্স: <strong>${escapeHtml(profile.evening_unwind)}</strong>` : `• Evening Unwind: <strong>${escapeHtml(profile.evening_unwind)}</strong>`);
        if (profile.weekend_plan) dailyDetails.push(isBengali ? `• উইকএন্ড প্ল্যান: <strong>${escapeHtml(profile.weekend_plan)}</strong>` : `• Weekend Plan: <strong>${escapeHtml(profile.weekend_plan)}</strong>`);
        if (profile.work_focus) dailyDetails.push(isBengali ? `• ফোকাস মেথড: <strong>${escapeHtml(profile.work_focus)}</strong>` : `• Focus Method: <strong>${escapeHtml(profile.work_focus)}</strong>`);
        if (profile.favorite_app_tool) dailyDetails.push(isBengali ? `• প্রিয় সফটওয়্যার/অ্যাপ: <strong>${escapeHtml(profile.favorite_app_tool)}</strong>` : `• Favorite App/Tool: <strong>${escapeHtml(profile.favorite_app_tool)}</strong>`);
        if (profile.daily_achievement) dailyDetails.push(isBengali ? `• দিনের সেরা মুহূর্ত: <strong>${escapeHtml(profile.daily_achievement)}</strong>` : `• Today's Highlight: <strong>${escapeHtml(profile.daily_achievement)}</strong>`);

        let learnedHtml = '';
        if (learned.length > 0) {
          learnedHtml = `<br><br><strong>🧠 মেমোরিতে সংরক্ষিত কথোপকথন ও বিষয় (${learned.length}টি):</strong><br>` + 
            learned.map((item) => `<div style="margin-top:6px; padding:6px 10px; background:rgba(0,242,254,0.06); border-left:3px solid #00f2fe; border-radius:4px; font-size:0.85rem;"><span style="color:#00f2fe; font-weight:600;">✨ ${escapeHtml(item.questionText || item.title)}</span><br><span style="color:#e2e8f0; margin-left:4px;">${escapeHtml(item.answerText || (item.responses_bn && item.responses_bn[0]) || (item.responses && item.responses[0]))}</span></div>`).join('');
        }

        const nextQ = this.generateReciprocalQuestion(profile, isBengali);

        if (basicDetails.length > 0 || dailyDetails.length > 0 || learned.length > 0) {
          let out = isBengali
            ? `হ্যাঁ, আপনার সাথে প্রতিটি কথোপকথন ও কাজের বিষয় আমি মনে রেখেছি! ❤️<br><br><strong>👤 আপনার ব্যক্তিগত পরিচিতি:</strong><br>${basicDetails.length > 0 ? basicDetails.join('<br>') : '<em>(সাধারণ তথ্য খালি)</em>'}`
            : `Yes, I remember our conversations, daily work, and details! ❤️<br><br><strong>👤 Personal Profile:</strong><br>${basicDetails.length > 0 ? basicDetails.join('<br>') : '<em>(No basic profile)</em>'}`;

          if (dailyDetails.length > 0) {
            out += isBengali
              ? `<br><br><strong>💼 দৈনন্দিন কাজ ও লাইফস্টাইল:</strong><br>${dailyDetails.join('<br>')}`
              : `<br><br><strong>💼 Daily Work & Lifestyle:</strong><br>${dailyDetails.join('<br>')}`;
          }

          out += `${learnedHtml}${nextQ}`;
          return out;
        } else {
          return isBengali
            ? `অবশ্যই আপনাকে মনে আছে! তবে নির্দিষ্ট কোনো তথ্য বা বিষয় এখনো মেমোরিতে জমা হয়নি।${nextQ}`
            : `I remember you! Tell me about your name, daily work or favorite things and I will keep them stored!${nextQ}`;
        }
      }

      // 3. Explicit Teaching / Q&A Direct Training Mode
      // Format 3a: "প্রশ্ন: [Q] উত্তর: [A]" or "Q: [Q] A: [A]"
      const explicitQAMatch = rawText.match(/(?:প্রশ্ন|question|Q)\s*[:：]\s*([^\n]+?)\s*(?:উত্তর|answer|A)\s*[:：]\s*([^\n]+)/i);
      if (explicitQAMatch) {
        const qText = explicitQAMatch[1].trim();
        const aText = explicitQAMatch[2].trim();
        if (qText && aText) {
          const cleanQ = qText.toLowerCase().replace(/[?!.,;:()]/g, ' ').replace(/\s+/g, ' ').trim();
          const newItem = {
            id: 'qa_' + Date.now(),
            category: 'qa_memory',
            title: `${qText}`,
            questionText: qText,
            answerText: aText,
            keywords_bn: [cleanQ, qText.toLowerCase().trim()],
            keywords_en: [cleanQ, qText.toLowerCase().trim()],
            responses_bn: [`<strong>${escapeHtml(aText)}</strong>`],
            responses_en: [`<strong>${escapeHtml(aText)}</strong>`],
            isLearnedQA: true,
            createdAt: new Date().toLocaleDateString()
          };
          this.saveLearnedQA(newItem);
          this.addDialogueTurn({ userQuestionOrAnswer: qText, botQuestionOrAnswer: aText, topic: 'custom_qa', learnedFact: `${qText} -> ${aText}`, isBengali });
          const nextQ = this.generateReciprocalQuestion(profile, isBengali);
          return isBengali
            ? `চমৎকার! আমি এই বিষয়টি মেমোরিতে লিখে রাখলাম:<br>• <strong>"${escapeHtml(qText)}"</strong> ➡️ <strong>"${escapeHtml(aText)}"</strong> 🧠✨${nextQ}`
            : `Awesome! I have saved this knowledge to memory:<br>• <strong>"${escapeHtml(qText)}"</strong> ➡️ <strong>"${escapeHtml(aText)}"</strong> 🧠✨${nextQ}`;
        }
      }

      // Format 3b: "মনে রাখো: [তথ্য]" or "Remember that: [fact]"
      const rememberMatch = rawText.match(/(?:মনে রাখো|মনে রাখিস|মনে রেখো|remember that|remember)\s*[:\s]+([^\n]+)/i);
      if (rememberMatch) {
        const fact = rememberMatch[1].trim();
        if (fact) {
          const cleanFact = fact.toLowerCase().replace(/[?!.,;:()]/g, ' ').replace(/\s+/g, ' ').trim();
          const newItem = {
            id: 'qa_' + Date.now(),
            category: 'qa_memory',
            title: `সংরক্ষিত তথ্য: ${fact.slice(0, 30)}`,
            questionText: fact,
            answerText: fact,
            keywords_bn: [cleanFact, fact.toLowerCase().trim()],
            keywords_en: [cleanFact, fact.toLowerCase().trim()],
            responses_bn: [`আপনি আমাকে মনে রাখতে বলেছিলেন: <strong>${escapeHtml(fact)}</strong>! 😊`],
            responses_en: [`You told me to remember: <strong>${escapeHtml(fact)}</strong>! 😊`],
            isLearnedQA: true,
            createdAt: new Date().toLocaleDateString()
          };
          this.saveLearnedQA(newItem);
          this.addDialogueTurn({ userQuestionOrAnswer: fact, botQuestionOrAnswer: fact, topic: 'remember_fact', learnedFact: fact, isBengali });
          const nextQ = this.generateReciprocalQuestion(profile, isBengali);
          return isBengali
            ? `আমি এটি যত্ন সহকারে মনে রাখলাম: <strong>${escapeHtml(fact)}</strong>! 🧠✨${nextQ}`
            : `I have committed this to memory: <strong>${escapeHtml(fact)}</strong>! 🧠✨${nextQ}`;
        }
      }

      // 4. Direct User Inquiries for Memorized Profile & Daily Work Fields (Exact, concise answers)
      if (/আমার নাম (?:কি|কী|বলো|জানিস|জানেন)|আমার নামটা কি|what is my name|do you remember my name|who am i/i.test(cleanText)) {
        const loggedIn = this.getLoggedInUser();
        const activeName = (loggedIn && loggedIn.name) || profile.name;
        if (activeName) {
          return isBengali 
            ? `আপনার নাম হলো <strong>${escapeHtml(activeName)}</strong>! ❤️`
            : `Your name is <strong>${escapeHtml(activeName)}</strong>! ❤️`;
        } else {
          return isBengali
            ? `আপনি এখনও সাইটে কোনো নামে লগইন করেননি বা নাম জানাননি! উপরে ডানপাশের <strong>Login</strong> বাটনে ক্লিক করে নাম সেট করতে পারেন, অথবা আমাকে বলুন আপনার নাম কি! 😊`
            : `You haven't logged in with a name or told me your name yet! Click the <strong>Login</strong> button at the top right or simply tell me your name! 😊`;
        }
      }

      if (/আমার বাড়ি (?:কোথায়|কই|বলো)|আমি কোথায় থাকি|where do i live|what is my hometown/i.test(cleanText)) {
        if (profile.hometown) {
          return isBengali
            ? `আপনার বাড়ি তো <strong>${escapeHtml(profile.hometown)}</strong>! 🏙️`
            : `Your hometown is <strong>${escapeHtml(profile.hometown)}</strong>! 🏙️`;
        }
      }

      if (/আমার পেশা (?:কি|কী)|আমি কি কাজ করি|what is my profession|what is my job/i.test(cleanText)) {
        if (profile.profession) {
          return isBengali
            ? `আপনার পেশা হলো <strong>${escapeHtml(profile.profession)}</strong>! 💼`
            : `Your profession is <strong>${escapeHtml(profile.profession)}</strong>! 💼`;
        }
      }

      if (/আমার (?:প্রিয় )?শখ (?:কি|কী)|what is my hobby/i.test(cleanText)) {
        if (profile.hobby) {
          return isBengali
            ? `আপনার প্রিয় শখ তো <strong>${escapeHtml(profile.hobby)}</strong>! 🎨`
            : `Your favorite hobby is <strong>${escapeHtml(profile.hobby)}</strong>! 🎨`;
        }
      }

      if (/আমার প্রিয় (?:প্রোগ্রামিং )?ভাষা (?:কি|কী)|what is my favorite (?:programming )?language/i.test(cleanText)) {
        if (profile.fav_language) {
          return isBengali
            ? `আপনার প্রিয় প্রোগ্রামিং ভাষা হলো <strong>${escapeHtml(profile.fav_language)}</strong>! 💻`
            : `Your favorite language is <strong>${escapeHtml(profile.fav_language)}</strong>! 💻`;
        }
      }

      if (/আমার প্রিয় খাবার (?:কি|কী)|my favorite food/i.test(cleanText) && (cleanText.includes('কি') || cleanText.includes('কী') || cleanText.includes('what'))) {
        if (profile.fav_food) {
          return isBengali
            ? `আপনার পছন্দের প্রিয় খাবার হলো <strong>${escapeHtml(profile.fav_food)}</strong>! 🍲`
            : `Your favorite food is <strong>${escapeHtml(profile.fav_food)}</strong>! 🍲`;
        }
      }

      if (/আমার প্রিয় গান (?:কি|কী)|আমার প্রিয় সঙ্গীত (?:কি|কী)|what is my favorite music|what is my favorite song/i.test(cleanText)) {
        if (profile.fav_music) {
          return isBengali
            ? `আপনার পছন্দের প্রিয় সঙ্গীত হলো <strong>${escapeHtml(profile.fav_music)}</strong>! 🎵`
            : `Your favorite music is <strong>${escapeHtml(profile.fav_music)}</strong>! 🎵`;
        }
      }

      if (/আমার স্বপ্ন (?:কি|কী)|আমার লক্ষ্য (?:কি|কী)|what is my dream|what is my goal/i.test(cleanText)) {
        if (profile.dream) {
          return isBengali
            ? `আপনার জীবনের লক্ষ্য ও স্বপ্ন হলো: <strong>${escapeHtml(profile.dream)}</strong>! 🌟`
            : `Your dream & goal is: <strong>${escapeHtml(profile.dream)}</strong>! 🌟`;
        }
      }

      // Inquiries for Daily Work & Routine fields (require question intent)
      if (/(?:আজকের কাজের (?:লক্ষ্য|টার্গেট|প্ল্যান)|আমার কাজের (?:লক্ষ্য|টার্গেট))\s*(?:কি|কী|বলো|জানাও|\?)|আজকে কি কি কাজ|what is my (?:work )?(?:goal|target)|what is my daily task/i.test(rawText) || (/আজকের কাজের (?:লক্ষ্য|টার্গেট)|daily task/i.test(cleanText) && isQuestionQuery)) {
        if (profile.daily_task) {
          return isBengali
            ? `আজ আপনার প্রধান কাজের টার্গেট হলো: <strong>${escapeHtml(profile.daily_task)}</strong>! 📝`
            : `Your main work target today is: <strong>${escapeHtml(profile.daily_task)}</strong>! 📝`;
        } else {
          return isBengali
            ? `আজকের কাজের লক্ষ্য এখনও সেট করা হয়নি!`
            : `Your daily work target is not set yet!`;
        }
      }

      if (/আমার বর্তমান প্রজেক্ট\s*(?:কি|কী|বলো|জানাও|\?)|আমি কোন প্রজেক্টে কাজ করছি|what is my current project/i.test(rawText) || (/বর্তমান প্রজেক্ট|current project/i.test(cleanText) && isQuestionQuery)) {
        if (profile.current_project) {
          return isBengali
            ? `আপনি বর্তমানে <strong>${escapeHtml(profile.current_project)}</strong> প্রজেক্টের ওপর কাজ করছেন! 🚀`
            : `You are currently working on <strong>${escapeHtml(profile.current_project)}</strong>! 🚀`;
        } else {
          return isBengali
            ? `আপনার বর্তমান প্রজেক্টের নাম এখনও আমার জানা নেই।`
            : `I don't know your current project yet.`;
        }
      }

      if (/আমার (?:কোডিং )?টুল\s*(?:কি|কী|বলো|\?)|আমার টেক স্ট্যাক\s*(?:কি|কী|বলো|\?)|what are my (?:tech|coding) tools/i.test(rawText) || (/(?:কোডিং টুল|টেক স্ট্যাক|tech stack|coding tools)/i.test(cleanText) && isQuestionQuery)) {
        if (profile.coding_tech_stack) {
          return isBengali
            ? `আপনার পছন্দের প্রধান কোডিং টুল ও টেক স্ট্যাক হলো <strong>${escapeHtml(profile.coding_tech_stack)}</strong>! 💻`
            : `Your primary development tools are <strong>${escapeHtml(profile.coding_tech_stack)}</strong>! 💻`;
        } else {
          return isBengali
            ? `আপনার পছন্দের কোডিং টুল বা টেক স্ট্যাক সম্পর্কে এখনও জানা হয়নি।`
            : `I haven't recorded your tech stack yet.`;
        }
      }

      if (/আমার সকালের রুটিন\s*(?:কি|কী|বলো|\?)|আমি সকালে (?:কখন|কয়টায়) উঠি|what is my morning routine|what time do i wake up/i.test(rawText) || (/সকালের রুটিন|morning routine/i.test(cleanText) && isQuestionQuery)) {
        if (profile.wake_routine) {
          return isBengali
            ? `আপনার সকালের রুটিন ও ওঠার সময়: <strong>${escapeHtml(profile.wake_routine)}</strong>! 🌅`
            : `Your morning routine is: <strong>${escapeHtml(profile.wake_routine)}</strong>! 🌅`;
        } else {
          return isBengali
            ? `আপনার সকালের রুটিন এখনও জানা নেই।`
            : `I haven't learned your morning routine yet.`;
        }
      }

      if (/আমার চা কফির অভ্যাস\s*(?:কি|কী|বলো|\?)|আমি কি চা পছন্দ করি না কফি|চা কফির অভ্যাস\s*(?:কি|কী|\?)|what is my (?:tea|coffee) habit|do i prefer tea or coffee/i.test(rawText) || (/চা কফির অভ্যাস|coffee tea habit/i.test(cleanText) && isQuestionQuery)) {
        if (profile.coffee_tea) {
          return isBengali
            ? `আপনার চা/কফি খাওয়ার অভ্যাস হলো: <strong>${escapeHtml(profile.coffee_tea)}</strong>! ☕`
            : `Your tea/coffee preference is: <strong>${escapeHtml(profile.coffee_tea)}</strong>! ☕`;
        } else {
          return isBengali
            ? `আপনার চা বা কফির পছন্দ এখনও মেমোরিতে নেই।`
            : `I haven't recorded your tea/coffee preference yet.`;
        }
      }

      if (/কাজ শেষে (?:আমি )?কি করি|আমার রিল্যাক্স করার উপায়\s*(?:কি|কী|বলো|\?)|what is my evening routine|how do i relax after work/i.test(rawText) || (/রিল্যাক্স করার উপায়|evening unwind/i.test(cleanText) && isQuestionQuery)) {
        if (profile.evening_unwind) {
          return isBengali
            ? `কাজ শেষে আপনার রিল্যাক্স করার মাধ্যম হলো: <strong>${escapeHtml(profile.evening_unwind)}</strong>! 🌙`
            : `Your evening relaxation habit is: <strong>${escapeHtml(profile.evening_unwind)}</strong>! 🌙`;
        } else {
          return isBengali
            ? `কাজ শেষে আপনার রিল্যাক্স করার উপায় এখনও জানা নেই।`
            : `I haven't learned your evening routine yet.`;
        }
      }

      if (/আমার উইকএন্ডের প্ল্যান\s*(?:কি|কী|বলো|\?)|ছুটির পরিকল্পনা\s*(?:কি|কী|বলো|\?)|what is my weekend plan/i.test(rawText) || (/উইকএন্ডের প্ল্যান|ছুটির পরিকল্পনা|weekend plan/i.test(cleanText) && isQuestionQuery)) {
        if (profile.weekend_plan) {
          return isBengali
            ? `আপনার উইকএন্ড বা ছুটির পরিকল্পনা: <strong>${escapeHtml(profile.weekend_plan)}</strong>! 🏖️`
            : `Your weekend plan is: <strong>${escapeHtml(profile.weekend_plan)}</strong>! 🏖️`;
        } else {
          return isBengali
            ? `আপনার ছুটির পরিকল্পনা এখনও জানা নেই।`
            : `I don't know your weekend plans yet.`;
        }
      }

      if (/আমার প্রিয় অ্যাপ\s*(?:কি|কী|বলো|\?)|আমার প্রিয় সফটওয়্যার\s*(?:কি|কী|বলো|\?)|what is my favorite app/i.test(rawText) || (/প্রিয় অ্যাপ|প্রিয় সফটওয়্যার|favorite app/i.test(cleanText) && isQuestionQuery)) {
        if (profile.favorite_app_tool) {
          return isBengali
            ? `আপনার সবচেয়ে প্রয়োজনীয় প্রিয় অ্যাপ/সফটওয়্যার হলো: <strong>${escapeHtml(profile.favorite_app_tool)}</strong>! 📱`
            : `Your favorite essential app/tool is: <strong>${escapeHtml(profile.favorite_app_tool)}</strong>! 📱`;
        } else {
          return isBengali
            ? `আপনার প্রয়োজনীয় বা প্রিয় অ্যাপের নাম এখনও জানা নেই।`
            : `I haven't recorded your favorite apps yet.`;
        }
      }

      // Check if query matches any dynamically learned custom Q&A item (exact concise answer)
      for (const item of learned) {
        const kws = isBengali
          ? [...(item.keywords_bn || []), ...(item.keywords || []), ...(item.keywords_en || [])]
          : [...(item.keywords_en || []), ...(item.keywords || []), ...(item.keywords_bn || [])];

        for (const kw of kws) {
          const cleanKw = kw.toLowerCase().trim();
          if (cleanText === cleanKw || (cleanText.includes(cleanKw) && cleanKw.length >= 4)) {
            return (isBengali ? (item.responses_bn && item.responses_bn[0]) : (item.responses_en && item.responses_en[0])) || (item.responses && item.responses[0]) || item.answerText;
          }
        }
      }

      // 5. Direct Natural Statements & Self Introductions
      if (!isQuestionQuery) {
        // Name statement (Strict)
        const bnNameMatch = rawText.match(/(?:আমার নাম)\s+(?:হলো|হচ্ছে|হল)?\s*([^\n?!.,;:()]{2,20})/i);
        const enNameMatch = rawText.match(/(?:my name is|call me)\s+([a-zA-Z]{2,20})/i);
        if (bnNameMatch) {
          const cand = bnNameMatch[1].trim();
          if (cand && !['ভালো', 'খারাপ', 'সুস্থ', 'রোবট', 'এআই'].includes(cand)) {
            this.setLoggedInUser(cand);
            const updatedProfile = this.getProfile();
            const nextQ = this.generateReciprocalQuestion(updatedProfile, isBengali, 'name');
            return `বাহ! খুব সুন্দর নাম, <strong>${escapeHtml(cand)}</strong>! 😊 আমি আপনার প্রোফাইল কানেক্ট করলাম এবং মেমোরিতে সেভ করে রাখলাম।${nextQ}`;
          }
        }
        if (enNameMatch) {
          const cand = enNameMatch[1].trim();
          if (cand && !['fine', 'good', 'happy', 'robot', 'bot'].includes(cand.toLowerCase())) {
            this.setLoggedInUser(cand);
            const updatedProfile = this.getProfile();
            const nextQ = this.generateReciprocalQuestion(updatedProfile, isBengali, 'name');
            return `Nice to meet you, <strong>${escapeHtml(cand)}</strong>! 😊 I have connected your profile and saved your name to memory.${nextQ}`;
          }
        }

        // Hometown statement
        const bnHomeMatch = rawText.match(/(?:আমার বাড়ি|আমার বাসা|আমি থাকি)\s+(?:হলো|হচ্ছে|হল)?\s*([^\n?!.,;:()]{2,30})/i);
        if (bnHomeMatch) {
          const cand = bnHomeMatch[1].trim();
          if (cand) {
            this.setProfileField('hometown', cand);
            this.saveLearnedQA({
              id: 'qa_hometown',
              topic: 'hometown',
              category: 'qa_memory',
              title: `ব্যবহারকারীর বাড়ি/শহর (Hometown)`,
              questionText: 'আমার বাড়ি কোথায় / আমি কোথায় থাকি?',
              answerText: cand,
              keywords_bn: ['আমার বাড়ি কোথায়', 'আমার বাড়ি কই', 'আমি কোথায় থাকি', 'আমার শহর কি', 'amar bari kothay'],
              keywords_en: ['where do i live', 'my hometown', 'what is my city'],
              responses_bn: [`আপনার বাড়ি তো <strong>${escapeHtml(cand)}</strong>! 🏙️`],
              responses_en: [`Your hometown is <strong>${escapeHtml(cand)}</strong>! 🏙️`],
              isLearnedQA: true
            });
            const updatedProfile = this.getProfile();
            const nextQ = this.generateReciprocalQuestion(updatedProfile, isBengali, 'hometown');
            return `দারুণ! <strong>${escapeHtml(cand)}</strong> চমৎকার জায়গা! 🏙️ আপনার শহর/বাড়ির তথ্য মেমোরিতে লিখে রাখলাম।${nextQ}`;
          }
        }

        // Profession statement
        const bnProfMatch = rawText.match(/(?:আমার পেশা|আমার কাজ|আমি একজন)\s+(?:হলো|হচ্ছে|হল)?\s*([^\n?!.,;:()]{2,30})/i);
        if (bnProfMatch) {
          const cand = bnProfMatch[1].trim();
          if (cand) {
            this.setProfileField('profession', cand);
            this.saveLearnedQA({
              id: 'qa_profession',
              topic: 'profession',
              category: 'qa_memory',
              title: `ব্যবহারকারীর পেশা (Profession)`,
              questionText: 'আমার পেশা কি?',
              answerText: cand,
              keywords_bn: ['আমার পেশা কি', 'আমার পেশা কী', 'আমি কি কাজ করি', 'amar pesha ki'],
              keywords_en: ['what is my profession', 'what is my job'],
              responses_bn: [`আপনার পেশা হলো <strong>${escapeHtml(cand)}</strong>! 💼`],
              responses_en: [`Your profession is <strong>${escapeHtml(cand)}</strong>! 💼`],
              isLearnedQA: true
            });
            const updatedProfile = this.getProfile();
            const nextQ = this.generateReciprocalQuestion(updatedProfile, isBengali, 'profession');
            return `খুব ভালো! <strong>${escapeHtml(cand)}</strong> নিয়ে আপনার ভবিষ্যৎ সফলতা কামনা করি! 💼 মেমোরিতে সেভ হলো।${nextQ}`;
          }
        }

        // Daily task statement
        const bnTaskMatch = rawText.match(/(?:আজকের কাজের লক্ষ্য|আজকের কাজ|আজকের টার্গেট|আমার কাজের লক্ষ্য)\s+(?:হলো|হচ্ছে|হল)?\s*([^\n?!.,;:()]{2,50})/i);
        if (bnTaskMatch) {
          const cand = bnTaskMatch[1].trim();
          if (cand) {
            this.setProfileField('daily_task', cand);
            this.saveLearnedQA({
              id: 'qa_daily_task',
              topic: 'daily_task',
              category: 'qa_memory',
              title: `আজকের কাজের লক্ষ্য (Daily Goal)`,
              questionText: 'আজকের কাজের লক্ষ্য কি ছিল?',
              answerText: cand,
              keywords_bn: ['আজকের কাজের লক্ষ্য কি', 'আজকের টার্গেট কি', 'আমার কাজের লক্ষ্য', 'আজকের কাজ কি'],
              keywords_en: ['what is my work goal', 'daily task target'],
              responses_bn: [`আজ আপনার প্রধান কাজের টার্গেট হলো: <strong>${escapeHtml(cand)}</strong>! 📝`],
              responses_en: [`Your daily work goal is: <strong>${escapeHtml(cand)}</strong>! 📝`],
              isLearnedQA: true
            });
            this.clearPendingQuestion();
            const updatedProfile = this.getProfile();
            const nextQ = this.generateReciprocalQuestion(updatedProfile, isBengali, 'daily_task');
            return `দারুণ লক্ষ্য! <strong>${escapeHtml(cand)}</strong> সফলভাবে সম্পন্ন করার শুভকামনা! 📝 মেমোরিতে লিখে রাখলাম।${nextQ}`;
          }
        }

        // Coffee / Tea statement
        if (/(?:চা|কফি|coffee|tea)/i.test(rawText) && /(?:খাই|পছন্দ|ভালোবাসি|অভ্যাস|প্রিয়|prefer|like|drink|love)/i.test(rawText)) {
          const cand = rawText.trim();
          this.setProfileField('coffee_tea', cand);
          this.saveLearnedQA({
            id: 'qa_coffee_tea',
            topic: 'coffee_tea',
            category: 'qa_memory',
            title: `চা/কফি পছন্দ ও অভ্যাস (Coffee & Tea Habit)`,
            questionText: 'আমার চা কফির অভ্যাস কি?',
            answerText: cand,
            keywords_bn: ['আমার চা কফির অভ্যাস কি', 'আমি কি চা পছন্দ করি না কফি', 'আমার চা পছন্দ না কফি', 'চা কফির অভ্যাস'],
            keywords_en: ['do i prefer tea or coffee', 'my coffee tea habit'],
            responses_bn: [`আপনার চা/কফি খাওয়ার অভ্যাস হলো: <strong>${escapeHtml(cand)}</strong>! ☕`],
            responses_en: [`Your tea/coffee habit is: <strong>${escapeHtml(cand)}</strong>! ☕`],
            isLearnedQA: true
          });
          this.clearPendingQuestion();
          const updatedProfile = this.getProfile();
          const nextQ = this.generateReciprocalQuestion(updatedProfile, isBengali, 'coffee_tea');
          return `দারুণ পছন্দ! <strong>${escapeHtml(cand)}</strong> কাজের ক্লান্তি দূর করতে অনন্য! ☕ মেমোরিতে লিখে নিলাম।${nextQ}`;
        }
      }

      // 6. Processing Direct Answer to Bot's Prior Pending Question
      if (pending && pending.topic && !isQuestionQuery && cleanText.length > 0 && !/কেমন|গান|জোক|প্রজেক্ট|ভিডিও|মডেল|আর্কিটেকচার/i.test(cleanText)) {
        const topic = pending.topic;
        const rawAnswer = rawText.trim();
        let cleanAnswer = rawAnswer.replace(/^(আমার|আমি|হলো|হচ্ছে|আমার প্রিয়|আমার নাম|আমার বাড়ি|আমার পেশা|আমার শখ|আজকের|আজকের কাজ|আজকের লক্ষ্য|i live in|my name is|i am|my hobby is|my favorite|today my goal is)\s+/i, '').trim();
        cleanAnswer = cleanAnswer.replace(/[?!.,;:()]/g, '').trim();

        if (cleanAnswer && cleanAnswer.length >= 2) {
          // --- Basic Profile Topics ---
          if (topic === 'name') {
            this.setProfileField('name', cleanAnswer);
            this.saveLearnedQA({
              id: 'qa_name',
              topic: 'name',
              category: 'qa_memory',
              title: `ব্যবহারকারীর নাম (User Name)`,
              questionText: 'আমার নাম কি?',
              answerText: cleanAnswer,
              keywords_bn: ['আমার নাম কি', 'আমার নাম কী', 'আমার নামটা কি', 'আমার নাম বলো', 'amar nam ki', 'amar naam ki', 'who am i'],
              keywords_en: ['what is my name', 'do you remember my name', 'who am i'],
              responses_bn: [`আপনার নাম হলো <strong>${escapeHtml(cleanAnswer)}</strong>! ❤️ আমি আপনাকে ভালোভাবেই মনে রেখেছি।`],
              responses_en: [`Your name is <strong>${escapeHtml(cleanAnswer)}</strong>! ❤️ I remember you perfectly.`],
              isLearnedQA: true
            });
            this.addDialogueTurn({ userQuestionOrAnswer: rawAnswer, botQuestionOrAnswer: pending.questionText, topic: 'name', learnedFact: `Name: ${cleanAnswer}`, isBengali });
            this.clearPendingQuestion();
            const updatedProfile = this.getProfile();
            const nextQ = this.generateReciprocalQuestion(updatedProfile, isBengali, 'name');
            return isBengali
              ? `বাহ! খুব সুন্দর নাম, <strong>${escapeHtml(cleanAnswer)}</strong>! 😊 আপনার নাম এবং এই প্রশ্নোত্তর আমার মেমোরিতে লিখে নিলাম।${nextQ}`
              : `Nice to meet you, <strong>${escapeHtml(cleanAnswer)}</strong>! 😊 I have saved your name and this Q&A into memory.${nextQ}`;
          }

          if (topic === 'hometown') {
            this.setProfileField('hometown', cleanAnswer);
            this.saveLearnedQA({
              id: 'qa_hometown',
              topic: 'hometown',
              category: 'qa_memory',
              title: `ব্যবহারকারীর বাড়ি/শহর (Hometown)`,
              questionText: 'আমার বাড়ি কোথায় / আমি কোথায় থাকি?',
              answerText: cleanAnswer,
              keywords_bn: ['আমার বাড়ি কোথায়', 'আমার বাড়ি কই', 'আমি কোথায় থাকি', 'আমার শহর কি', 'আমার জেলা কি', 'amar bari kothay', 'amar bari koi', 'kothay thaki', 'amar shohor ki'],
              keywords_en: ['where do i live', 'where is my home', 'my hometown', 'my city', 'what city do i live in'],
              responses_bn: [`আপনার বাড়ি তো <strong>${escapeHtml(cleanAnswer)}</strong>! 🏙️ আমি মনে রেখেছি।`],
              responses_en: [`Your hometown is <strong>${escapeHtml(cleanAnswer)}</strong>! 🏙️ I have stored it in memory.`],
              isLearnedQA: true
            });
            this.addDialogueTurn({ userQuestionOrAnswer: rawAnswer, botQuestionOrAnswer: pending.questionText, topic: 'hometown', learnedFact: `Hometown: ${cleanAnswer}`, isBengali });
            this.clearPendingQuestion();
            const updatedProfile = this.getProfile();
            const nextQ = this.generateReciprocalQuestion(updatedProfile, isBengali, 'hometown');
            return isBengali
              ? `দারুণ! <strong>${escapeHtml(cleanAnswer)}</strong> চমৎকার একটি জায়গা! 🏙️ আপনার শহর/বাড়ির তথ্য মেমোরিতে লিখে নিলাম।${nextQ}`
              : `Awesome! <strong>${escapeHtml(cleanAnswer)}</strong> is a wonderful place! 🏙️ Saved your hometown to memory.${nextQ}`;
          }

          if (topic === 'profession') {
            this.setProfileField('profession', cleanAnswer);
            this.saveLearnedQA({
              id: 'qa_profession',
              topic: 'profession',
              category: 'qa_memory',
              title: `ব্যবহারকারীর পেশা (Profession)`,
              questionText: 'আমার পেশা কি / আমি কি কাজ করি?',
              answerText: cleanAnswer,
              keywords_bn: ['আমার পেশা কি', 'আমার পেশা কী', 'আমি কি কাজ করি', 'আমি কি করি', 'amar pesha ki', 'ami ki kaj kori'],
              keywords_en: ['what is my profession', 'what is my job', 'what do i do', 'my career'],
              responses_bn: [`আপনার পেশা/পড়াশোনা হলো <strong>${escapeHtml(cleanAnswer)}</strong>! 💼`],
              responses_en: [`Your profession/field is <strong>${escapeHtml(cleanAnswer)}</strong>! 💼`],
              isLearnedQA: true
            });
            this.addDialogueTurn({ userQuestionOrAnswer: rawAnswer, botQuestionOrAnswer: pending.questionText, topic: 'profession', learnedFact: `Profession: ${cleanAnswer}`, isBengali });
            this.clearPendingQuestion();
            const updatedProfile = this.getProfile();
            const nextQ = this.generateReciprocalQuestion(updatedProfile, isBengali, 'profession');
            return isBengali
              ? `খুব ভালো! <strong>${escapeHtml(cleanAnswer)}</strong> নিয়ে আপনার যাত্রা সফল হোক! 💼 এটি আমি মেমোরিতে সেভ করলাম।${nextQ}`
              : `Great! Wishing you success with <strong>${escapeHtml(cleanAnswer)}</strong>! 💼 Saved to memory.${nextQ}`;
          }

          if (topic === 'hobby') {
            this.setProfileField('hobby', cleanAnswer);
            this.saveLearnedQA({
              id: 'qa_hobby',
              topic: 'hobby',
              category: 'qa_memory',
              title: `ব্যবহারকারীর শখ (Hobby)`,
              questionText: 'আমার প্রিয় শখ কি?',
              answerText: cleanAnswer,
              keywords_bn: ['আমার প্রিয় শখ কি', 'আমার প্রিয় শখ কী', 'আমার শখ কি', 'আমার শখ কী', 'amar priyo shokh ki', 'amar shokh ki'],
              keywords_en: ['what is my favorite hobby', 'what is my hobby', 'my hobby'],
              responses_bn: [`আপনার প্রিয় শখ তো <strong>${escapeHtml(cleanAnswer)}</strong>! 🎨`],
              responses_en: [`Your favorite hobby is <strong>${escapeHtml(cleanAnswer)}</strong>! 🎨`],
              isLearnedQA: true
            });
            this.addDialogueTurn({ userQuestionOrAnswer: rawAnswer, botQuestionOrAnswer: pending.questionText, topic: 'hobby', learnedFact: `Hobby: ${cleanAnswer}`, isBengali });
            this.clearPendingQuestion();
            const updatedProfile = this.getProfile();
            const nextQ = this.generateReciprocalQuestion(updatedProfile, isBengali, 'hobby');
            return isBengali
              ? `অসাধারণ! <strong>${escapeHtml(cleanAnswer)}</strong> আসলেই দারুণ একটি শখ! 🎨 মেমোরিতে লিখে রাখলাম।${nextQ}`
              : `Fantastic! <strong>${escapeHtml(cleanAnswer)}</strong> is a great hobby! 🎨 Saved to memory.${nextQ}`;
          }

          if (topic === 'fav_language') {
            this.setProfileField('fav_language', cleanAnswer);
            this.saveLearnedQA({
              id: 'qa_fav_language',
              topic: 'fav_language',
              category: 'qa_memory',
              title: `প্রিয় প্রোগ্রামিং ভাষা (Favorite Language)`,
              questionText: 'আমার প্রিয় ভাষা বা প্রযুক্তি কি?',
              answerText: cleanAnswer,
              keywords_bn: ['আমার প্রিয় প্রোগ্রামিং ভাষা কি', 'আমার প্রিয় ভাষা কি', 'আমার পছন্দের ভাষা কি', 'amar priyo bhasha ki', 'amar priyo language ki'],
              keywords_en: ['what is my favorite programming language', 'what is my favorite language', 'my favorite tech'],
              responses_bn: [`আপনার প্রিয় প্রযুক্তি/ভাষা হলো <strong>${escapeHtml(cleanAnswer)}</strong>! 💻`],
              responses_en: [`Your favorite language/tech is <strong>${escapeHtml(cleanAnswer)}</strong>! 💻`],
              isLearnedQA: true
            });
            this.addDialogueTurn({ userQuestionOrAnswer: rawAnswer, botQuestionOrAnswer: pending.questionText, topic: 'fav_language', learnedFact: `Language: ${cleanAnswer}`, isBengali });
            this.clearPendingQuestion();
            const updatedProfile = this.getProfile();
            const nextQ = this.generateReciprocalQuestion(updatedProfile, isBengali, 'fav_language');
            return isBengali
              ? `চমৎকার পছন্দ! <strong>${escapeHtml(cleanAnswer)}</strong> প্রযুক্তি বিশ্বে দারুণ জনপ্রিয়! 💻 মেমোরিতে সেভ হলো।${nextQ}`
              : `Awesome choice! <strong>${escapeHtml(cleanAnswer)}</strong> is incredibly powerful! 💻 Saved to memory.${nextQ}`;
          }

          if (topic === 'fav_food') {
            this.setProfileField('fav_food', cleanAnswer);
            this.saveLearnedQA({
              id: 'qa_fav_food',
              topic: 'fav_food',
              category: 'qa_memory',
              title: `প্রিয় খাবার (Favorite Food)`,
              questionText: 'আমার প্রিয় খাবার কি?',
              answerText: cleanAnswer,
              keywords_bn: ['আমার প্রিয় খাবার কি', 'আমার প্রিয় খাবার কী', 'আমার পছন্দের খাবার কি', 'amar priyo khabar ki'],
              keywords_en: ['what is my favorite food', 'my favorite food', 'what do i like to eat'],
              responses_bn: [`আপনার পছন্দের খাবার হলো <strong>${escapeHtml(cleanAnswer)}</strong>! 🍲`],
              responses_en: [`Your favorite food is <strong>${escapeHtml(cleanAnswer)}</strong>! 🍲`],
              isLearnedQA: true
            });
            this.addDialogueTurn({ userQuestionOrAnswer: rawAnswer, botQuestionOrAnswer: pending.questionText, topic: 'fav_food', learnedFact: `Food: ${cleanAnswer}`, isBengali });
            this.clearPendingQuestion();
            const updatedProfile = this.getProfile();
            const nextQ = this.generateReciprocalQuestion(updatedProfile, isBengali, 'fav_food');
            return isBengali
              ? `জিভে জল আসার মতো খাবার! <strong>${escapeHtml(cleanAnswer)}</strong> আসলেই সুস্বাদু! 😋 মেমোরিতে রাখলাম।${nextQ}`
              : `Delicious! <strong>${escapeHtml(cleanAnswer)}</strong> is a mouth-watering choice! 😋 Saved to memory.${nextQ}`;
          }

          if (topic === 'fav_music') {
            this.setProfileField('fav_music', cleanAnswer);
            this.saveLearnedQA({
              id: 'qa_fav_music',
              topic: 'fav_music',
              category: 'qa_memory',
              title: `প্রিয় সঙ্গীত/শিল্পী (Favorite Music)`,
              questionText: 'আমার প্রিয় গান বা সঙ্গীত কি?',
              answerText: cleanAnswer,
              keywords_bn: ['আমার প্রিয় গান কি', 'আমার প্রিয় সঙ্গীত কি', 'আমার প্রিয় শিল্পী কে', 'amar priyo gaan ki', 'amar priyo shilpi ke'],
              keywords_en: ['what is my favorite music', 'who is my favorite singer', 'my favorite song'],
              responses_bn: [`আপনার প্রিয় গান/সঙ্গীত হলো <strong>${escapeHtml(cleanAnswer)}</strong>! 🎵`],
              responses_en: [`Your favorite music/singer is <strong>${escapeHtml(cleanAnswer)}</strong>! 🎵`],
              isLearnedQA: true
            });
            this.addDialogueTurn({ userQuestionOrAnswer: rawAnswer, botQuestionOrAnswer: pending.questionText, topic: 'fav_music', learnedFact: `Music: ${cleanAnswer}`, isBengali });
            this.clearPendingQuestion();
            const updatedProfile = this.getProfile();
            const nextQ = this.generateReciprocalQuestion(updatedProfile, isBengali, 'fav_music');
            return isBengali
              ? `চমৎকার সঙ্গীত রুচি! <strong>${escapeHtml(cleanAnswer)}</strong> মনকে সতেজ রাখে! 🎵 মেমোরিতে সেভ হলো।${nextQ}`
              : `Wonderful musical taste! <strong>${escapeHtml(cleanAnswer)}</strong> is lovely! 🎵 Saved to memory.${nextQ}`;
          }

          if (topic === 'dream') {
            this.setProfileField('dream', cleanAnswer);
            this.saveLearnedQA({
              id: 'qa_dream',
              topic: 'dream',
              category: 'qa_memory',
              title: `ভবিষ্যৎ স্বপ্ন/লক্ষ্য (Life Dream)`,
              questionText: 'আমার স্বপ্ন বা লক্ষ্য কি?',
              answerText: cleanAnswer,
              keywords_bn: ['আমার স্বপ্ন কি', 'আমার লক্ষ্য কি', 'আমার ভবিষ্যৎ স্বপ্ন কি', 'amar shopno ki', 'amar lokkho ki'],
              keywords_en: ['what is my dream', 'what is my goal', 'my future dream'],
              responses_bn: [`আপনার স্বপ্ন ও লক্ষ্য হলো: <strong>${escapeHtml(cleanAnswer)}</strong>! 🌟`],
              responses_en: [`Your dream & goal is: <strong>${escapeHtml(cleanAnswer)}</strong>! 🌟`],
              isLearnedQA: true
            });
            this.addDialogueTurn({ userQuestionOrAnswer: rawAnswer, botQuestionOrAnswer: pending.questionText, topic: 'dream', learnedFact: `Dream: ${cleanAnswer}`, isBengali });
            this.clearPendingQuestion();
            const updatedProfile = this.getProfile();
            const nextQ = this.generateReciprocalQuestion(updatedProfile, isBengali, 'dream');
            return isBengali
              ? `অনেক বড় স্বপ্ন! <strong>${escapeHtml(cleanAnswer)}</strong> পূরণে আপনার পাশে দোয়া ও শুভকামনা থাকবে! 🌟 মেমোরিতে লিখে রাখলাম।${nextQ}`
              : `An inspiring dream! Wishing you huge success in achieving <strong>${escapeHtml(cleanAnswer)}</strong>! 🌟 Saved to memory.${nextQ}`;
          }

          // --- Daily Work & Routine Topics ---
          if (topic === 'daily_task') {
            this.setProfileField('daily_task', cleanAnswer);
            this.saveLearnedQA({
              id: 'qa_daily_task',
              topic: 'daily_task',
              category: 'qa_memory',
              title: `আজকের কাজের লক্ষ্য (Daily Target)`,
              questionText: 'আজকের কাজের লক্ষ্য কি ছিল?',
              answerText: cleanAnswer,
              keywords_bn: ['আজকের কাজের লক্ষ্য কি', 'আজকের টার্গেট কি', 'আজকে কি কি কাজ', 'আমার কাজের লক্ষ্য'],
              keywords_en: ['what is my work goal today', 'daily task target', 'my work target'],
              responses_bn: [`আজ আপনার প্রধান কাজের লক্ষ্য হলো: <strong>${escapeHtml(cleanAnswer)}</strong>! 📝`],
              responses_en: [`Your main work target today is: <strong>${escapeHtml(cleanAnswer)}</strong>! 📝`],
              isLearnedQA: true
            });
            this.addDialogueTurn({ userQuestionOrAnswer: rawAnswer, botQuestionOrAnswer: pending.questionText, topic: 'daily_task', learnedFact: `Daily Goal: ${cleanAnswer}`, isBengali });
            this.clearPendingQuestion();
            const updatedProfile = this.getProfile();
            const nextQ = this.generateReciprocalQuestion(updatedProfile, isBengali, 'daily_task');
            return isBengali
              ? `খুবই চমৎকার লক্ষ্য! <strong>${escapeHtml(cleanAnswer)}</strong> সফলভাবে সম্পন্ন করার জন্য শুভকামনা! 📝 মেমোরিতে নোট করে নিলাম।${nextQ}`
              : `Great goal! Wishing you maximum productivity with <strong>${escapeHtml(cleanAnswer)}</strong>! 📝 Stored in memory.${nextQ}`;
          }

          if (topic === 'current_project') {
            this.setProfileField('current_project', cleanAnswer);
            this.saveLearnedQA({
              id: 'qa_current_project',
              topic: 'current_project',
              category: 'qa_memory',
              title: `বর্তমান প্রজেক্ট (Current Project)`,
              questionText: 'আমার বর্তমান প্রজেক্ট কি?',
              answerText: cleanAnswer,
              keywords_bn: ['আমার বর্তমান প্রজেক্ট কি', 'আমি কোন প্রজেক্টে কাজ করছি', 'আমার প্রজেক্টের নাম কি'],
              keywords_en: ['what is my current project', 'which project am i working on'],
              responses_bn: [`আপনি বর্তমানে <strong>${escapeHtml(cleanAnswer)}</strong> প্রজেক্টের ওপর কাজ করছেন! 🚀`],
              responses_en: [`You are currently working on <strong>${escapeHtml(cleanAnswer)}</strong>! 🚀`],
              isLearnedQA: true
            });
            this.addDialogueTurn({ userQuestionOrAnswer: rawAnswer, botQuestionOrAnswer: pending.questionText, topic: 'current_project', learnedFact: `Current Project: ${cleanAnswer}`, isBengali });
            this.clearPendingQuestion();
            const updatedProfile = this.getProfile();
            const nextQ = this.generateReciprocalQuestion(updatedProfile, isBengali, 'current_project');
            return isBengali
              ? `উত্তেজনাপূর্ণ প্রজেক্ট! <strong>${escapeHtml(cleanAnswer)}</strong> অবশ্যই দারুন কিছু হবে! 🚀 প্রজেক্টের তথ্য মেমোরিতে লিখে রাখলাম।${nextQ}`
              : `Exciting build! <strong>${escapeHtml(cleanAnswer)}</strong> sounds amazing! 🚀 Saved your project details to memory.${nextQ}`;
          }

          if (topic === 'coding_tech_stack') {
            this.setProfileField('coding_tech_stack', cleanAnswer);
            this.saveLearnedQA({
              id: 'qa_coding_tech_stack',
              topic: 'coding_tech_stack',
              category: 'qa_memory',
              title: `কোডিং টুল ও টেক স্ট্যাক (Tech Tools)`,
              questionText: 'আমার কোডিং টুল বা টেক স্ট্যাক কি?',
              answerText: cleanAnswer,
              keywords_bn: ['আমার কোডিং টুল কি', 'আমার টেক স্ট্যাক কি', 'আমি কোন আইডিই ব্যবহার করি'],
              keywords_en: ['what is my coding tool', 'what is my tech stack', 'my dev tools'],
              responses_bn: [`আপনার প্রধান কোডিং টুল ও টেক স্ট্যাক হলো <strong>${escapeHtml(cleanAnswer)}</strong>! 💻`],
              responses_en: [`Your primary development tools are <strong>${escapeHtml(cleanAnswer)}</strong>! 💻`],
              isLearnedQA: true
            });
            this.addDialogueTurn({ userQuestionOrAnswer: rawAnswer, botQuestionOrAnswer: pending.questionText, topic: 'coding_tech_stack', learnedFact: `Tech Stack: ${cleanAnswer}`, isBengali });
            this.clearPendingQuestion();
            const updatedProfile = this.getProfile();
            const nextQ = this.generateReciprocalQuestion(updatedProfile, isBengali, 'coding_tech_stack');
            return isBengali
              ? `অসাধারণ টুল চয়েস! <strong>${escapeHtml(cleanAnswer)}</strong> দিয়ে কাজ করা অনেক স্মুথ ও পাওয়ারফুল! 💻 মেমোরিতে সেভ হলো।${nextQ}`
              : `Great tool choices! Developing with <strong>${escapeHtml(cleanAnswer)}</strong> is fast and efficient! 💻 Saved to memory.${nextQ}`;
          }

          if (topic === 'wake_routine') {
            this.setProfileField('wake_routine', cleanAnswer);
            this.saveLearnedQA({
              id: 'qa_wake_routine',
              topic: 'wake_routine',
              category: 'qa_memory',
              title: `সকালের রুটিন ও ঘুম ভাঙার সময় (Morning Routine)`,
              questionText: 'আমার সকালের রুটিন কি / আমি সকালে কখন উঠি?',
              answerText: cleanAnswer,
              keywords_bn: ['আমার সকালের রুটিন কি', 'আমি সকালে কখন উঠি', 'আমি সকালে কয়টায় উঠি'],
              keywords_en: ['what is my morning routine', 'what time do i wake up'],
              responses_bn: [`আপনার সকালের রুটিন ও ওঠার সময় হলো: <strong>${escapeHtml(cleanAnswer)}</strong>! 🌅`],
              responses_en: [`Your morning routine and wake up time is: <strong>${escapeHtml(cleanAnswer)}</strong>! 🌅`],
              isLearnedQA: true
            });
            this.addDialogueTurn({ userQuestionOrAnswer: rawAnswer, botQuestionOrAnswer: pending.questionText, topic: 'wake_routine', learnedFact: `Morning Routine: ${cleanAnswer}`, isBengali });
            this.clearPendingQuestion();
            const updatedProfile = this.getProfile();
            const nextQ = this.generateReciprocalQuestion(updatedProfile, isBengali, 'wake_routine');
            return isBengali
              ? `সুন্দর সকালের সূচনা! <strong>${escapeHtml(cleanAnswer)}</strong>—দিনের শুরু ভালো হলে সারাদিনই প্রাণবন্ত কাটে! 🌅 মেমোরিতে সেভ করলাম।${nextQ}`
              : `A great morning routine! <strong>${escapeHtml(cleanAnswer)}</strong> sets a productive tone for the whole day! 🌅 Saved to memory.${nextQ}`;
          }

          if (topic === 'coffee_tea') {
            this.setProfileField('coffee_tea', cleanAnswer);
            this.saveLearnedQA({
              id: 'qa_coffee_tea',
              topic: 'coffee_tea',
              category: 'qa_memory',
              title: `চা/কফি পছন্দ ও অভ্যাস (Coffee & Tea Habit)`,
              questionText: 'আমার চা কফির অভ্যাস কি?',
              answerText: cleanAnswer,
              keywords_bn: ['আমার চা কফির অভ্যাস কি', 'আমি কি চা পছন্দ করি না কফি', 'আমার চা পছন্দ না কফি'],
              keywords_en: ['do i prefer tea or coffee', 'my coffee tea habit'],
              responses_bn: [`আপনার চা/কফি খাওয়ার অভ্যাস হলো: <strong>${escapeHtml(cleanAnswer)}</strong>! ☕`],
              responses_en: [`Your tea/coffee habit is: <strong>${escapeHtml(cleanAnswer)}</strong>! ☕`],
              isLearnedQA: true
            });
            this.addDialogueTurn({ userQuestionOrAnswer: rawAnswer, botQuestionOrAnswer: pending.questionText, topic: 'coffee_tea', learnedFact: `Coffee/Tea: ${cleanAnswer}`, isBengali });
            this.clearPendingQuestion();
            const updatedProfile = this.getProfile();
            const nextQ = this.generateReciprocalQuestion(updatedProfile, isBengali, 'coffee_tea');
            return isBengali
              ? `পারফেক্ট রিফ্রেশমেন্ট! <strong>${escapeHtml(cleanAnswer)}</strong> কাজের ফাঁকে দারুণ শক্তি যোগায়! ☕ লিখে নিলাম মেমোরিতে।${nextQ}`
              : `The perfect refresher! <strong>${escapeHtml(cleanAnswer)}</strong> keeps the mind active and sharp! ☕ Saved to memory.${nextQ}`;
          }

          if (topic === 'evening_unwind') {
            this.setProfileField('evening_unwind', cleanAnswer);
            this.saveLearnedQA({
              id: 'qa_evening_unwind',
              topic: 'evening_unwind',
              category: 'qa_memory',
              title: `কাজ শেষে রিল্যাক্স করার মাধ্যম (Evening Unwind)`,
              questionText: 'কাজ শেষে আমি কীভাবে রিল্যাক্স করি?',
              answerText: cleanAnswer,
              keywords_bn: ['কাজ শেষে আমি কি করি', 'আমার রিল্যাক্স করার উপায় কি', 'সন্ধ্যায় আমি কি করি'],
              keywords_en: ['how do i relax after work', 'my evening routine', 'evening unwind'],
              responses_bn: [`কাজ শেষে আপনার রিল্যাক্স করার মাধ্যম হলো: <strong>${escapeHtml(cleanAnswer)}</strong>! 🌙`],
              responses_en: [`Your evening relaxation method is: <strong>${escapeHtml(cleanAnswer)}</strong>! 🌙`],
              isLearnedQA: true
            });
            this.addDialogueTurn({ userQuestionOrAnswer: rawAnswer, botQuestionOrAnswer: pending.questionText, topic: 'evening_unwind', learnedFact: `Evening Unwind: ${cleanAnswer}`, isBengali });
            this.clearPendingQuestion();
            const updatedProfile = this.getProfile();
            const nextQ = this.generateReciprocalQuestion(updatedProfile, isBengali, 'evening_unwind');
            return isBengali
              ? `দারুণ উপায়! সারাদিনের ক্লান্তি দূর করতে <strong>${escapeHtml(cleanAnswer)}</strong> সত্যিই চমৎকার! 🌙 মেমোরিতে লিখে রাখলাম।${nextQ}`
              : `Wonderful way to recharge! <strong>${escapeHtml(cleanAnswer)}</strong> is truly refreshing! 🌙 Saved to memory.${nextQ}`;
          }

          if (topic === 'weekend_plan') {
            this.setProfileField('weekend_plan', cleanAnswer);
            this.saveLearnedQA({
              id: 'qa_weekend_plan',
              topic: 'weekend_plan',
              category: 'qa_memory',
              title: `উইকএন্ড বা ছুটির পরিকল্পনা (Weekend Plan)`,
              questionText: 'আমার উইকএন্ডের প্ল্যান কি?',
              answerText: cleanAnswer,
              keywords_bn: ['আমার উইকএন্ডের প্ল্যান কি', 'ছুটিতে আমার কি পরিকল্পনা', 'আমার উইকএন্ড প্ল্যান'],
              keywords_en: ['what is my weekend plan', 'my holiday plan'],
              responses_bn: [`আপনার উইকএন্ড বা ছুটির পরিকল্পনা: <strong>${escapeHtml(cleanAnswer)}</strong>! 🏖️`],
              responses_en: [`Your weekend plan is: <strong>${escapeHtml(cleanAnswer)}</strong>! 🏖️`],
              isLearnedQA: true
            });
            this.addDialogueTurn({ userQuestionOrAnswer: rawAnswer, botQuestionOrAnswer: pending.questionText, topic: 'weekend_plan', learnedFact: `Weekend: ${cleanAnswer}`, isBengali });
            this.clearPendingQuestion();
            const updatedProfile = this.getProfile();
            const nextQ = this.generateReciprocalQuestion(updatedProfile, isBengali, 'weekend_plan');
            return isBengali
              ? `দারুণ মজার পরিকল্পনা! <strong>${escapeHtml(cleanAnswer)}</strong> নিয়ে আপনার ছুটি দারুণ কাটুক! 🏖️ মেমোরিতে লিখে রাখলাম।${nextQ}`
              : `Sounds like a fantastic plan! Have a memorable time with <strong>${escapeHtml(cleanAnswer)}</strong>! 🏖️ Saved to memory.${nextQ}`;
          }

          if (topic === 'favorite_app_tool') {
            this.setProfileField('favorite_app_tool', cleanAnswer);
            this.saveLearnedQA({
              id: 'qa_favorite_app_tool',
              topic: 'favorite_app_tool',
              category: 'qa_memory',
              title: `প্রিয় সফটওয়্যার বা অ্যাপ (Favorite App/Tool)`,
              questionText: 'আমার প্রিয় সফটওয়্যার বা অ্যাপ কি?',
              answerText: cleanAnswer,
              keywords_bn: ['আমার প্রিয় অ্যাপ কি', 'আমার প্রিয় সফটওয়্যার কি', 'আমার প্রয়োজনীয় অ্যাপ'],
              keywords_en: ['what is my favorite app', 'my favorite software', 'essential tools'],
              responses_bn: [`আপনার সবচেয়ে প্রয়োজনীয় প্রিয় অ্যাপ/সফটওয়্যার হলো: <strong>${escapeHtml(cleanAnswer)}</strong>! 📱`],
              responses_en: [`Your favorite essential software/app is: <strong>${escapeHtml(cleanAnswer)}</strong>! 📱`],
              isLearnedQA: true
            });
            this.addDialogueTurn({ userQuestionOrAnswer: rawAnswer, botQuestionOrAnswer: pending.questionText, topic: 'favorite_app_tool', learnedFact: `Favorite App: ${cleanAnswer}`, isBengali });
            this.clearPendingQuestion();
            const updatedProfile = this.getProfile();
            const nextQ = this.generateReciprocalQuestion(updatedProfile, isBengali, 'favorite_app_tool');
            return isBengali
              ? `সত্যিই প্রয়োজনীয় টুল! <strong>${escapeHtml(cleanAnswer)}</strong> কাজকে অনেক গতিময় করে! 📱 মেমোরিতে সেভ হলো।${nextQ}`
              : `An essential tool indeed! <strong>${escapeHtml(cleanAnswer)}</strong> accelerates daily productivity! 📱 Saved to memory.${nextQ}`;
          }

          // General curiosity topic answer
          this.saveLearnedQA({
            id: 'qa_' + topic + '_' + Date.now(),
            topic: topic,
            category: 'qa_memory',
            title: `সংরক্ষিত উত্তর: ${cleanAnswer.slice(0, 30)}`,
            questionText: pending.questionText,
            answerText: cleanAnswer,
            keywords_bn: [cleanAnswer.toLowerCase(), topic],
            keywords_en: [cleanAnswer.toLowerCase(), topic],
            responses_bn: [`আপনার উত্তর ছিল: <strong>${escapeHtml(cleanAnswer)}</strong>! 😊`],
            responses_en: [`Your answer was: <strong>${escapeHtml(cleanAnswer)}</strong>! 😊`],
            isLearnedQA: true
          });
          this.addDialogueTurn({ userQuestionOrAnswer: rawAnswer, botQuestionOrAnswer: pending.questionText, topic: topic, learnedFact: cleanAnswer, isBengali });
          this.clearPendingQuestion();
          const nextQ = this.generateReciprocalQuestion(profile, isBengali);
          return isBengali
            ? `আপনার ভাবনাটি শেয়ার করার জন্য ধন্যবাদ! আপনার এই উত্তর আমি মেমোরিতে নোট করে রাখলাম। 😊${nextQ}`
            : `Thank you for sharing your thoughts! I have noted this in my neural memory. 😊${nextQ}`;
        }
      }

      return null;
    },

    // Alias for backward compatibility
    processQuery(cleanText, rawText, isBengali) {
      return this.processUserTurn(cleanText, rawText, isBengali);
    }
  };

  // Expose NeuralDialogueMemory and UserProfileMemory globally
  window.NeuralDialogueMemory = NeuralDialogueMemory;
  window.UserProfileMemory = NeuralDialogueMemory;

  // --- SMART INTENT & TOKEN MATCHER WITH STRICT BILINGUAL ACCURACY ---
  function getSmartResponse(userText) {
    if (!userText || !userText.trim()) {
      return "I'm listening! Please type or speak your question.";
    }

    const rawText = userText.trim();
    const isBengali = isBengaliQuery(userText);

    // Normalize text and resolve compound words (e.g. "tryhack me" -> "tryhackme")
    const cleanText = normalizeSearchText(rawText);

    // 1. Process Personal User Memory, Q&A Learning, and Dialogue Turns
    const dialogueResponse = NeuralDialogueMemory.processUserTurn(cleanText, rawText, isBengali);
    if (dialogueResponse) {
      return dialogueResponse;
    }

    // Check if user pasted a YouTube link
    const ytMatch = userText.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
    if (ytMatch && ytMatch[1]) {
      const vidId = ytMatch[1];
      if (isBengali) {
        return `🎬 আপনার দেওয়া YouTube ভিডিও/গানটি নিচে সংযুক্ত করা হয়েছে! প্লে বাটনে চাপ দিয়ে শুনুন 🎵<br><div class="chat-youtube-card" data-yt-id="${vidId}" data-yt-title="YouTube Custom Stream"><div class="cyc-header"><i class="fa-brands fa-youtube gradient-red-text"></i> <span>Custom YouTube Stream</span></div><div class="cyc-video-wrap"><iframe src="https://www.youtube-nocookie.com/embed/${vidId}?enablejsapi=1" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div><div class="cyc-footer"><button class="cyc-studio-btn" onclick="if(window.openYoutubeTrack) window.openYoutubeTrack('${vidId}', 'Custom YouTube Stream');"><i class="fa-solid fa-compact-disc"></i> Play in Music Studio</button></div></div>`;
      } else {
        return `🎬 Here is your requested YouTube song/video! Click play to listen 🎵<br><div class="chat-youtube-card" data-yt-id="${vidId}" data-yt-title="YouTube Custom Stream"><div class="cyc-header"><i class="fa-brands fa-youtube gradient-red-text"></i> <span>Custom YouTube Stream</span></div><div class="cyc-video-wrap"><iframe src="https://www.youtube-nocookie.com/embed/${vidId}?enablejsapi=1" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div><div class="cyc-footer"><button class="cyc-studio-btn" onclick="if(window.openYoutubeTrack) window.openYoutubeTrack('${vidId}', 'Custom YouTube Stream');"><i class="fa-solid fa-compact-disc"></i> Play in Music Studio</button></div></div>`;
      }
    }

    // Unified Social Media Direct Auto-Open Handler
    const socialMatch = detectSocialPlatform(cleanText);
    if (socialMatch) {
      const { platform, targetUrl } = socialMatch;
      try {
        window.open(targetUrl, '_blank');
      } catch (e) {
        console.log('Window open fallback:', e);
      }

      const btnText = isBengali
        ? `মেইন ${platform.name_bn || platform.name}-এ যান ↗`
        : `Open Main ${platform.name} ↗`;

      return (isBengali ? platform.msg_bn : platform.msg_en) +
        `<br><br><a href="${targetUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-sm" style="background:${platform.color};color:#fff;border-radius:20px;padding:6px 16px;text-decoration:none;display:inline-flex;align-items:center;gap:6px;font-weight:600;box-shadow:0 4px 15px ${platform.color}40;"><i class="${platform.icon}"></i> ${btnText}</a>`;
    }

    // Universal Website Direct Auto-Open & Navigation Handler
    const websiteMatch = detectWebsiteNavigation(userText);
    if (websiteMatch) {
      try {
        window.open(websiteMatch.targetUrl, '_blank');
      } catch (e) {
        console.log('Window open fallback:', e);
      }
      return formatWebsiteLaunchResponse(websiteMatch, isBengali);
    }

    // Subtopic Intent Token Set for Disambiguation
    const SUBTOPIC_INTENT_TOKENS = new Set([
      'course', 'courses', 'kors', 'bootcamp', 'bootcamps', 'কোর্স', 'কোর্সসমূহ', 'বুটক্যাম্প',
      'fee', 'fees', 'cost', 'ফি', 'খরচ', 'টাকা',
      'admission', 'ভর্তি', 'রেজিস্ট্রেশন',
      'certificate', 'certification', 'সার্টিফিকেট', 'সনদ', 'সার্টিফিকেশন',
      'job', 'placement', 'career', 'চাকরি', 'ক্যারিয়ার', 'প্লেসমেন্ট', 'chakori', 'chakorir', 'subidha',
      'support', 'sahajjo', 'সাহায্য', 'সহায়তা', 'help', 'সুবিধা', 'উপকারিতা', 'benefit', 'benefits', 'বেনিফিট',
      'contact', 'phone', 'email', 'যোগাযোগ', 'ফোন', 'ইমেইল', 'ঠিকানা',
      'tool', 'tools', 'টুলস', 'টুল', 'সিকিউরিটি', 'security', 'koth',
      'vs', 'versus', 'তুলনা', 'পার্থক্য', 'konta', 'bhalo', 'ভালো', 'htb', 'hackthebox',
      'prerequisite', 'prerequisites', 'shuru', 'suru', 'lage', 'lagbe', 'প্রস্তুতি', 'শুরু', 'পূর্বশর্ত',
      'openvpn', 'vpn', 'ovpn', 'connect', 'কানেক্ট', 'setup',
      'soc', 'roadmap', 'রোডম্যাপ', 'blueteam',
      'attackbox', 'অ্যাটাকবক্স',
      'streak', 'স্ট্রিক', 'freeze', 'ফ্রিজ', 'ফ্রীজ',
      'wireshark', 'ওয়্যারশার্ক', 'packet', 'প্যাকেট', 'pcap',
      'privilege', 'privesc', 'escalation', 'প্রিভিলেজ', 'এসকেলেশন',
      'vip', 'premium', 'প্রিমিয়াম', 'subscription', 'সাবস্ক্রিপশন', 'free', 'ফ্রি'
    ]);

    // Contextual Multi-Turn Query Augmentation (e.g. "ki ki course achey ekhane?" -> refers to Ostad / active site)
    const activeTopic = window.NeuralKnowledgeStore && typeof window.NeuralKnowledgeStore.getLastActiveTopic === 'function'
      ? window.NeuralKnowledgeStore.getLastActiveTopic()
      : null;

    let searchTargetText = cleanText;
    const isContextual = isContextReferralQuery(cleanText);

    if (isContextual && activeTopic) {
      const topicName = activeTopic.name || (activeTopic.title ? activeTopic.title.split(/[\s\-–—(]/)[0].toLowerCase().trim() : '');
      searchTargetText = `${cleanText} ${topicName}`.trim();
    }

    const queryTokens = searchTargetText.split(' ').filter(t => t.length > 0);
    const expandedTokens = expandSearchTokens(queryTokens);

    // 2. High-Accuracy In-Browser Web RAG Retrieval (across all ingested websites)
    let topWebChunk = null;
    if (window.NeuralKnowledgeStore && typeof window.NeuralKnowledgeStore.searchWebChunks === 'function') {
      const webChunks = window.NeuralKnowledgeStore.searchWebChunks(searchTargetText, 2, activeTopic);
      if (webChunks.length > 0) {
        topWebChunk = webChunks[0];
      }
    }

    const allKnowledge = NeuralKnowledgeStore.getAllKnowledge();
    let bestMatch = null;
    let highestScore = 0;

    // Check for general project/portfolio intent boost
    const isProjectQuery = /project|github|repo|গিটহাব|প্রজেক্ট|রিপো|রিপোজিটরি|কাজ|portfolio|পোর্টফোলিও/i.test(searchTargetText);

    for (const item of allKnowledge) {
      let score = 0;
      const isFocusedTopicItem = activeTopic && (
        (activeTopic.id && activeTopic.id === item.id) ||
        (activeTopic.name && (item.id.toLowerCase().includes(activeTopic.name) || (item.title || '').toLowerCase().includes(activeTopic.name)))
      );

      if (isContextual && isFocusedTopicItem) {
        score += 35;
      }
      
      // Select keyword list based on language
      const keywords = isBengali 
        ? [...(item.keywords_bn || []), ...(item.keywords || []), ...(item.keywords_en || [])]
        : [...(item.keywords_en || []), ...(item.keywords || []), ...(item.keywords_bn || [])];

      // Match item title directly with whole phrase/word boundary
      const cleanTitle = normalizeSearchText(item.title || '');
      if (hasWordOrPhrase(searchTargetText, cleanTitle) || hasWordOrPhrase(cleanTitle, searchTargetText)) {
        score += 80;
      }

      // Track the single highest matching keyword score for this item (prevents keyword repetition bloat)
      let bestKwScore = 0;

      for (const kw of keywords) {
        const cleanKw = normalizeSearchText(kw);
        if (!cleanKw) continue;
        const isBnKw = (item.keywords_bn || []).includes(kw) || /[\u0980-\u09FF]/.test(kw);
        let kwScore = 0;

        // Exact match
        if (searchTargetText === cleanKw) {
          kwScore = ((isBengali && isBnKw) || (!isBengali && !isBnKw)) ? 160 : 100;
        } else if (hasWordOrPhrase(searchTargetText, cleanKw)) {
          // Substring / Phrase match with word boundaries
          // If keyword is a generic single entity name (e.g. "tryhackme", "ostad"), don't let it overpower multi-word queries
          const kwWords = cleanKw.split(' ').filter(Boolean);
          if (kwWords.length === 1 && ['tryhackme', 'thm', 'tryhack', 'ostad', 'mitre'].includes(cleanKw) && queryTokens.length > 2) {
            kwScore = 15;
          } else {
            kwScore = (cleanKw.length * 3.5) + ((isBengali && isBnKw) ? 45 : 25);
          }
        } else if (hasWordOrPhrase(cleanKw, searchTargetText) && searchTargetText.length >= 3) {
          kwScore = (searchTargetText.length * 2.5) + 15;
        } else {
          // Token overlap matching with strict Stopword Guard and Synonyms
          const kwTokens = cleanKw.split(' ').filter(t => t.length > 0);
          let tokenMatches = 0;
          let substantiveMatches = 0;

          for (const kt of kwTokens) {
            if (expandedTokens.includes(kt)) {
              tokenMatches++;
              if (!COMMON_STOPWORDS.has(kt) && kt.length >= 2) {
                substantiveMatches++;
              }
            }
          }

          // Crucial: only award overlap score if at least ONE non-stopword substantive token matched!
          if (substantiveMatches > 0) {
            const overlap = (tokenMatches / kwTokens.length) * ((isBengali && isBnKw) ? 50 : 30);
            kwScore = Math.max(kwScore, overlap);
          }
        }

        if (kwScore > bestKwScore) {
          bestKwScore = kwScore;
        }
      }

      score += bestKwScore;

      // Content body text keyword matching (expanded tokens with synonyms)
      const rawResps = [...(item.responses_bn || []), ...(item.responses_en || []), ...(item.responses || [])].join(' ').toLowerCase();
      const cleanResps = rawResps.replace(/<[^>]+>/g, ' ');
      const IGNORED_BODY_TOKENS = new Set(['open', 'website', 'web', 'site', 'page', 'link', 'apps', 'app', 'online', 'free', 'get', 'the', 'my', 'your', 'our']);
      let bodyMatchCount = 0;
      for (const qt of expandedTokens) {
        if (qt.length >= 3 && !COMMON_STOPWORDS.has(qt) && !IGNORED_BODY_TOKENS.has(qt) && hasWordOrPhrase(cleanResps, qt)) {
          bodyMatchCount++;
        }
      }
      if (bodyMatchCount > 0) {
        score += (bodyMatchCount * 14);
      }

      // Subtopic Intent Precision Boost:
      // If user asks for courses/fees/jobs/tools/support, prioritize items whose title/keywords specifically target that intent
      const hasSubtopicIntent = queryTokens.some(t => SUBTOPIC_INTENT_TOKENS.has(t)) ||
                                expandedTokens.some(t => SUBTOPIC_INTENT_TOKENS.has(t));
      if (hasSubtopicIntent) {
        const itemTitleLower = (item.title || '').toLowerCase();
        const hasTitleSubtopic = Array.from(SUBTOPIC_INTENT_TOKENS).some(tok => tok.length >= 3 && itemTitleLower.includes(tok));
        if (hasTitleSubtopic) {
          score += 65;
        } else if (item.category === 'web' || item.id.endsWith('_overview')) {
          score -= 50; // Generic landing page overview shouldn't overshadow a specific subtopic question
        }
      }

      // Boost specific GitHub projects if user asks for projects
      if (isProjectQuery && item.id === 'kb_github_all') {
        score += 30;
      }

      if (score > highestScore) {
        highestScore = score;
        bestMatch = item;
      }
    }

    const currentProfile = NeuralDialogueMemory.getProfile();

    // Unified Intelligent Selection:
    // Compares bestMatch (curated/saved memory) vs topWebChunk (scraped RAG chunk)
    const hasCuratedMatch = bestMatch && highestScore >= 12;
    const hasSubtopicIntentQuery = queryTokens.some(t => SUBTOPIC_INTENT_TOKENS.has(t)) ||
                                  expandedTokens.some(t => SUBTOPIC_INTENT_TOKENS.has(t));
    const hasWebMatch = topWebChunk && (
      (hasSubtopicIntentQuery && topWebChunk.score >= 50 && highestScore < 40) ||
      (!hasSubtopicIntentQuery && topWebChunk.score >= 25 && (!hasCuratedMatch || topWebChunk.score > highestScore))
    );

    if (hasCuratedMatch && (!hasWebMatch || highestScore >= topWebChunk.score)) {
      if (window.NeuralKnowledgeStore && typeof window.NeuralKnowledgeStore.setLastActiveTopic === 'function') {
        window.NeuralKnowledgeStore.setLastActiveTopic(bestMatch);
      }
      return NeuralKnowledgeStore.getRandomResponse(bestMatch, isBengali);
    }

    if (hasWebMatch) {
      if (window.NeuralKnowledgeStore && typeof window.NeuralKnowledgeStore.setLastActiveTopic === 'function') {
        window.NeuralKnowledgeStore.setLastActiveTopic({
          title: topWebChunk.pageTitle,
          sourceUrl: topWebChunk.sourceUrl,
          category: 'web'
        });
      }
      const headingPart = topWebChunk.heading ? ` — <em>${escapeHtml(topWebChunk.heading)}</em>` : '';
      const linkPart = `<br><br><span style="font-size:0.8rem;color:#94a3b8;">🔗 সূত্র: <a href="${topWebChunk.sourceUrl}" target="_blank" rel="noopener noreferrer" style="color:#00f2fe;font-weight:600;">${topWebChunk.pageTitle}</a></span>`;
      return `🌐 <strong>${escapeHtml(topWebChunk.pageTitle)}</strong>${headingPart}:<br><br>${escapeHtml(topWebChunk.text)}${linkPart}`;
    }

    if (hasCuratedMatch) {
      if (window.NeuralKnowledgeStore && typeof window.NeuralKnowledgeStore.setLastActiveTopic === 'function') {
        window.NeuralKnowledgeStore.setLastActiveTopic(bestMatch);
      }
      return NeuralKnowledgeStore.getRandomResponse(bestMatch, isBengali);
    }

    // Secondary fallback to any partially matching web chunk
    if (window.NeuralKnowledgeStore && typeof window.NeuralKnowledgeStore.searchWebChunks === 'function') {
      const fallbackChunks = window.NeuralKnowledgeStore.searchWebChunks(searchTargetText, 1, activeTopic);
      if (fallbackChunks.length > 0 && fallbackChunks[0].score >= 18) {
        const chk = fallbackChunks[0];
        if (window.NeuralKnowledgeStore && typeof window.NeuralKnowledgeStore.setLastActiveTopic === 'function') {
          window.NeuralKnowledgeStore.setLastActiveTopic({
            title: chk.pageTitle,
            sourceUrl: chk.sourceUrl,
            category: 'web'
          });
        }
        return `🌐 <strong>${escapeHtml(chk.pageTitle)}:</strong><br><br>${escapeHtml(chk.text)}<br><br><span style="font-size:0.8rem;color:#94a3b8;">🔗 উৎস: <a href="${chk.sourceUrl}" target="_blank" rel="noopener noreferrer" style="color:#00f2fe;">${chk.sourceUrl}</a></span>`;
      }
    }

    // Intelligent context-aware Fallback strictly in matching language
    if (isBengali) {
      const bnFallbacks = [
        "আপনার প্রশ্নটি আমি বুঝতে পেরেছি। আপনি যেকোনো ওয়েবসাইট লিঙ্ক দিলে আমি তা পড়ে স্বয়ংক্রিয়ভাবে উত্তর দিতে পারি! তাছাড়া ক্রিয়েটর লুৎফর রহমান, এআই বা প্রজেক্ট সম্পর্কিত প্রশ্নও করতে পারেন! 😊",
        "দারুণ বিষয়! ওয়েবসাইট আপলোড বা ইনজেস্ট করলে আমি সরাসরি সেখান থেকে নিখুঁত উত্তর দিতে পারব। চাইলে 'কেমন আছো', 'গান শোনাও', বা সাইবার সিকিউরিটি সম্পর্কেও জানতে চাইতে পারেন।",
        "আমি আপনার কথাটি শুনেছি। ক্রিয়েটর, পোর্টফোলিও প্রজেক্ট বা যে কোনো প্রশ্ন আমাকে করতে পারেন!"
      ];
      return bnFallbacks[Math.floor(Math.random() * bnFallbacks.length)];
    } else {
      const enFallbacks = [
        "I'm listening! You can ingest any website link for me to memorize and answer questions about, or ask about our PyTorch AI model and creator Lutfor Rahman!",
        "Feel free to ask me questions about ingested websites, 'How are you?', 'Who created you?', or 'Tell me about your AI architecture' 😊",
        "I am ready to assist! Ask me about deep learning, websites, cybersecurity, or developer Lutfor Rahman."
      ];
      return enFallbacks[Math.floor(Math.random() * enFallbacks.length)];
    }
  }
  window.getSmartResponse = getSmartResponse;

  // --- ASYNC HYBRID BOT RESOLUTION (GEMINI LLM + LOCAL SMART RAG) ---
  async function resolveBotResponse(userText) {
    if (!userText || !userText.trim()) {
      return "I'm listening! Please type or speak your question.";
    }

    const rawText = userText.trim();
    const isBengali = isBengaliQuery(userText);
    const cleanText = normalizeSearchText(rawText);

    // 1. Instant check: Personal User Profile Dialogue (name, hometown, habits)
    const dialogueResponse = NeuralDialogueMemory.processUserTurn(cleanText, rawText, isBengali);
    if (dialogueResponse) {
      return dialogueResponse;
    }

    // 2. Instant check: YouTube link or Direct Social media commands
    const ytMatch = userText.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
    if (ytMatch && ytMatch[1]) {
      const vidId = ytMatch[1];
      return isBengali
        ? `🎬 আপনার দেওয়া YouTube ভিডিও/গানটি নিচে সংযুক্ত করা হয়েছে! প্লে বাটনে চাপ দিয়ে শুনুন 🎵<br><div class="chat-youtube-card" data-yt-id="${vidId}" data-yt-title="YouTube Custom Stream"><div class="cyc-header"><i class="fa-brands fa-youtube gradient-red-text"></i> <span>Custom YouTube Stream</span></div><div class="cyc-video-wrap"><iframe src="https://www.youtube-nocookie.com/embed/${vidId}?enablejsapi=1" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div><div class="cyc-footer"><button class="cyc-studio-btn" onclick="if(window.openYoutubeTrack) window.openYoutubeTrack('${vidId}', 'Custom YouTube Stream');"><i class="fa-solid fa-compact-disc"></i> Play in Music Studio</button></div></div>`
        : `🎬 Here is your requested YouTube song/video! Click play to listen 🎵<br><div class="chat-youtube-card" data-yt-id="${vidId}" data-yt-title="YouTube Custom Stream"><div class="cyc-header"><i class="fa-brands fa-youtube gradient-red-text"></i> <span>Custom YouTube Stream</span></div><div class="cyc-video-wrap"><iframe src="https://www.youtube-nocookie.com/embed/${vidId}?enablejsapi=1" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div><div class="cyc-footer"><button class="cyc-studio-btn" onclick="if(window.openYoutubeTrack) window.openYoutubeTrack('${vidId}', 'Custom YouTube Stream');"><i class="fa-solid fa-compact-disc"></i> Play in Music Studio</button></div></div>`;
    }

    const socialMatch = detectSocialPlatform(cleanText);
    if (socialMatch) {
      const { platform, targetUrl } = socialMatch;
      try { window.open(targetUrl, '_blank'); } catch(e) {}
      const btnText = isBengali ? `মেইন ${platform.name_bn || platform.name}-এ যান ↗` : `Open Main ${platform.name} ↗`;
      return (isBengali ? platform.msg_bn : platform.msg_en) +
        `<br><br><a href="${targetUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-sm" style="background:${platform.color};color:#fff;border-radius:20px;padding:6px 16px;text-decoration:none;display:inline-flex;align-items:center;gap:6px;font-weight:600;box-shadow:0 4px 15px ${platform.color}40;"><i class="${platform.icon}"></i> ${btnText}</a>`;
    }

    const websiteMatch = detectWebsiteNavigation(userText);
    if (websiteMatch) {
      try { window.open(websiteMatch.targetUrl, '_blank'); } catch(e) {}
      return formatWebsiteLaunchResponse(websiteMatch, isBengali);
    }

    // 3. Collect Web Knowledge Chunks & Memory Context for AI Reasoning
    let webContext = '';
    if (window.NeuralKnowledgeStore && typeof window.NeuralKnowledgeStore.searchWebChunks === 'function') {
      const topChunks = window.NeuralKnowledgeStore.searchWebChunks(cleanText, 4);
      if (topChunks && topChunks.length > 0) {
        webContext = topChunks.map(c => `[Web Source: ${c.pageTitle} | Section: ${c.heading} | URL: ${c.sourceUrl}]\n${c.text}`).join('\n\n');
      }
    }

    // 3.4 Check if query is asking for summary / overview of the uploaded PDF book
    const isBookOverviewQuery = /(?:বই|বইটিতে|বইয়ে|book|pdf).*(?:আলোচনা|বিষয়|কি কি|সারসংক্ষেপ|সারাংশ|summary|about|overview|সূচিপত্র)/i.test(rawText) ||
      /(?:এই বইটিতে|বইটিতে কি আছে|বইয়ের মূল বিষয়|what is this book about)/i.test(rawText);

    if (isBookOverviewQuery && window.NeuralPdfStore && typeof window.NeuralPdfStore.getBookOverview === 'function') {
      try {
        const overview = await window.NeuralPdfStore.getBookOverview();
        if (overview && overview.book) {
          const { book, samplePoints, earlyText } = overview;
          const bookSummaryContext = `[Book Title: ${book.title} | Total Pages: ${book.totalPages} | Chunks: ${book.totalChunks}]\n` +
            `Table of contents & key headings:\n` +
            samplePoints.map(p => `• Page ${p.page}: ${p.heading} - ${p.snippet}`).join('\n') +
            `\n\nIntroductory Text:\n${earlyText.substring(0, 1500)}`;

          if (NeuralAIEngine.getApiKey() && NeuralAIEngine.isEnabled()) {
            try {
              const geminiSummary = await NeuralAIEngine.queryGemini(rawText, bookSummaryContext);
              if (geminiSummary && geminiSummary.trim().length > 15) {
                return `📚 <strong>[বই: ${escapeHtml(book.title)} — মূল বিষয়বস্তু ও সারাংশ]</strong><br><br>${geminiSummary}`;
              }
            } catch(e) {}
          }

          // Local offline RAG book overview
          const pointsList = samplePoints.map(p => `• <strong>${escapeHtml(p.heading)}</strong> (পৃষ্ঠা ${p.page}): ${escapeHtml(p.snippet)}...`).join('<br><br>');
          return `📚 <strong>"${escapeHtml(book.title)}"</strong> বইটির মূল বিষয়বস্তু ও সারসংক্ষেপ:<br><br>` +
                 `বইটিতে মোট <strong>${book.totalPages}টি পৃষ্ঠা</strong> রয়েছে। সূচিপত্র ও বিভিন্ন অধ্যায় অনুযায়ী প্রধান আলোচ্য বিষয়গুলো নিচে তুলে ধরা হলো:<br><br>` +
                 `${pointsList}<br><br>` +
                 `💡 <em>আপনি বইটির যেকোনো নির্দিষ্ট বিষয় বা পৃষ্ঠার তথ্য জানতে সরাসরি প্রশ্ন করতে পারেন!</em>`;
        }
      } catch (err) {
        console.warn('[Book Overview RAG Error]', err);
      }
    }

    // 3.5 Collect PDF Book Knowledge Chunks (Deep In-Browser PDF RAG)
    let pdfContext = '';
    let topPdfChunk = null;
    if (window.NeuralPdfStore && typeof window.NeuralPdfStore.searchPdfChunks === 'function') {
      try {
        const topPdfChunks = await window.NeuralPdfStore.searchPdfChunks(cleanText, 4);
        if (topPdfChunks && topPdfChunks.length > 0) {
          topPdfChunk = topPdfChunks[0];
          pdfContext = topPdfChunks.map(c => `[Book: ${c.bookTitle} | Page ${c.pageNumber} | Topic: ${c.heading}]\n${c.text}`).join('\n\n');
        }
      } catch (err) {
        console.warn('[PDF RAG Search Error]', err);
      }
    }

    const combinedRAGContext = [webContext, pdfContext].filter(Boolean).join('\n\n');

    // 4. Try Generative AI Brain (Gemini 1.5 Flash) if key is active!
    if (NeuralAIEngine.getApiKey() && NeuralAIEngine.isEnabled()) {
      try {
        const geminiReply = await NeuralAIEngine.queryGemini(rawText, combinedRAGContext);
        if (geminiReply && geminiReply.trim().length > 10) {
          return geminiReply;
        }
      } catch (err) {
        console.warn('[AI Brain] Gemini failed, seamlessly falling back to local Smart RAG:', err);
      }
    }

    // 4.5. High-confidence Local PDF Citation Fallback
    if (topPdfChunk && topPdfChunk.score >= 40) {
      const prefix = isBengali
        ? `📖 <strong>বইয়ের রেফারেন্স:</strong> <em>"${escapeHtml(topPdfChunk.bookTitle)}"</em> (পৃষ্ঠা নং ${topPdfChunk.pageNumber})<br>📌 <strong>টপিক / অধ্যায়:</strong> ${escapeHtml(topPdfChunk.heading)}`
        : `📖 <strong>Book Reference:</strong> <em>"${escapeHtml(topPdfChunk.bookTitle)}"</em> (Page ${topPdfChunk.pageNumber})<br>📌 <strong>Topic / Chapter:</strong> ${escapeHtml(topPdfChunk.heading)}`;
      return `${prefix}<br><br>${escapeHtml(topPdfChunk.text)}`;
    }

    // 5. Seamless Fallback: In-Browser Smart RAG & Pre-Trained Knowledge Base
    return getSmartResponse(userText);
  }
  window.resolveBotResponse = resolveBotResponse;

  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, (m) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[m]));
  }

  function stopAllSpeechAndAudio() {
    if (speechFallbackTimer) {
      clearTimeout(speechFallbackTimer);
      speechFallbackTimer = null;
    }
    if (currentAudioPlayer) {
      try {
        currentAudioPlayer.pause();
        currentAudioPlayer.currentTime = 0;
      } catch (e) {}
      currentAudioPlayer = null;
    }
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    }
    if (globalAvatarController && typeof globalAvatarController.stopSpeaking === 'function') {
      globalAvatarController.stopSpeaking();
    }
    activeUtterance = null;
  }
  window.globalStopAllSpeech = stopAllSpeechAndAudio;

  function getSpokenCleanText(html) {
    if (!html) return '';
    // Replace code blocks and audio/youtube cards with clean readable phrase
    let clean = html.replace(/<pre[\s\S]*?<\/pre>/gi, ' Here is the PyTorch code snippet. ')
                    .replace(/<div class="chat-audio-card"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/gi, ' ')
                    .replace(/<div class="chat-youtube-card"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/gi, ' ');
    // Strip HTML tags
    const tmp = document.createElement('DIV');
    tmp.innerHTML = clean;
    let text = tmp.textContent || tmp.innerText || '';
    
    // Remove robotic prefixes like "প্রশ্ন:", "উত্তর:", "Question:", "Answer:", "Q1:", "A1:", "Q:", "A:"
    text = text.replace(/(?:^|\s)(?:💡|❓|💬|🔍|📝|✨)?\s*(?:প্রশ্ন|question|উত্তর|answer|q\d*|a\d*)\s*[:：\-]\s*/gi, ' ');
    
    // Strip emojis so TTS does not fail or read out emoji codes
    text = text.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1FA70}-\u{1FAFF}\u{FE00}-\u{FE0F}]/gu, '');
    // Clean unwanted characters, list bullets, arrows and symbols
    text = text.replace(/[*#_~`|•→➡️]/g, ' ');
    return text.replace(/\s+/g, ' ').trim();
  }

  function splitTextIntoSentenceChunks(text, maxLen = 140) {
    if (!text) return [];
    // Split on punctuation while preserving meaningful boundaries
    const rawSegments = text.split(/([।!?\n;]+)/);
    const sentences = [];
    let cur = '';

    for (let i = 0; i < rawSegments.length; i++) {
      const seg = rawSegments[i];
      if (!seg) continue;
      if (/[।!?\n;]+/.test(seg)) {
        cur += seg;
        if (cur.trim()) {
          sentences.push(cur.trim());
          cur = '';
        }
      } else {
        if (cur.trim()) {
          sentences.push(cur.trim());
          cur = '';
        }
        cur = seg;
      }
    }
    if (cur.trim()) {
      sentences.push(cur.trim());
    }

    const chunks = [];
    let buf = '';
    for (const s of sentences) {
      if (!buf) {
        buf = s;
      } else if ((buf + ' ' + s).length <= maxLen) {
        buf += ' ' + s;
      } else {
        chunks.push(buf);
        buf = s;
      }
    }
    if (buf) chunks.push(buf);

    // If any chunk is still larger than maxLen, split by commas or words
    const result = [];
    for (const c of chunks) {
      if (c.length <= maxLen) {
        result.push(c);
      } else {
        const words = c.split(' ');
        let wBuf = '';
        for (const w of words) {
          if (!wBuf) {
            wBuf = w;
          } else if ((wBuf + ' ' + w).length <= maxLen) {
            wBuf += ' ' + w;
          } else {
            result.push(wBuf);
            wBuf = w;
          }
        }
        if (wBuf) result.push(wBuf);
      }
    }
    return result.filter(c => c.trim().length > 0);
  }

  // --- High-Fidelity Bengali Audio TTS Stream Player ---
  function playBengaliAudioStream(spokenText, onComplete) {
    const chunks = splitTextIntoSentenceChunks(spokenText, 140);
    if (!chunks || chunks.length === 0) {
      if (onComplete) onComplete();
      return;
    }

    let chunkIdx = 0;
    let isAborted = false;

    function startVisualSpeaking() {
      if (globalAvatarController) {
        globalAvatarController.startSpeaking(spokenText);
      }
    }

    function stopVisualSpeaking() {
      if (globalAvatarController) {
        globalAvatarController.stopSpeaking();
      }
      if (onComplete) onComplete();
    }

    function playNext() {
      if (isAborted) return;
      if (chunkIdx >= chunks.length) {
        stopVisualSpeaking();
        return;
      }

      const chunk = chunks[chunkIdx];
      chunkIdx++;

      // Google Translate TTS endpoint with natural Bengali pronunciation
      const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=gtx&tl=bn&q=${encodeURIComponent(chunk)}`;
      const audio = new Audio(audioUrl);
      audio.volume = 1.0;
      audio.playbackRate = 0.94; // Calibrated for clear, distinct and articulate pronunciation
      currentAudioPlayer = audio;

      let hasStarted = false;
      audio.onplay = () => {
        hasStarted = true;
        if (chunkIdx === 1) {
          startVisualSpeaking();
        }
      };

      audio.onended = () => {
        currentAudioPlayer = null;
        playNext();
      };

      audio.onerror = (err) => {
        console.warn('Bangla Audio chunk load error:', err);
        currentAudioPlayer = null;
        // If first chunk fails, fallback to visual animation
        if (chunkIdx === 1 && !hasStarted) {
          startVisualSpeaking();
          const fallbackDur = Math.min(Math.max(spokenText.length * 75, 2200), 8000);
          speechFallbackTimer = setTimeout(() => {
            stopVisualSpeaking();
          }, fallbackDur);
        } else {
          playNext();
        }
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Bangla Audio play prevented/error:', err);
          if (chunkIdx === 1 && !hasStarted) {
            startVisualSpeaking();
            const fallbackDur = Math.min(Math.max(spokenText.length * 75, 2200), 8000);
            speechFallbackTimer = setTimeout(() => {
              stopVisualSpeaking();
            }, fallbackDur);
          } else {
            playNext();
          }
        });
      }
    }

    // Start playing first chunk
    playNext();
  }

  // --- Main Unified Speak Engine ---
  function speakText(text) {
    // If response includes a streaming YouTube card, prioritize music playback and prevent TTS audio clash
    if (text && text.includes('chat-youtube-card')) {
      if (window.MediaCoordinator) {
        window.MediaCoordinator.pauseAllExcept('youtube');
      }
      stopAllSpeechAndAudio();
      const spokenText = getSpokenCleanText(text);
      if (spokenText) {
        const subText = document.getElementById('avatarSubtitlesText');
        if (subText) subText.textContent = spokenText;
      }
      return;
    }

    if (window.MediaCoordinator) {
      window.MediaCoordinator.pauseAllExcept('tts');
    } else {
      stopAllSpeechAndAudio();
    }

    const spokenText = getSpokenCleanText(text);
    if (!spokenText) return;

    // If voice output is toggled OFF, run mouth cadence for the estimated text duration
    if (!isVoiceOutputEnabled) {
      if (globalAvatarController) {
        globalAvatarController.startSpeaking(spokenText);
      }
      const duration = Math.min(Math.max(spokenText.length * 75, 1800), 7000);
      speechFallbackTimer = setTimeout(() => {
        if (globalAvatarController) globalAvatarController.stopSpeaking();
      }, duration);
      return;
    }

    const hasBengali = /[\u0980-\u09FF]/.test(spokenText);

    // --- BENGALI VOICE PIPELINE ---
    if (hasBengali) {
      const bnVoice = getBestVoice(true);

      // If browser has a dedicated Bengali native voice installed (e.g. Google বাংলা on Chrome):
      if (bnVoice && 'speechSynthesis' in window) {
        try {
          if (window.speechSynthesis.resume) window.speechSynthesis.resume();
          const utterance = new SpeechSynthesisUtterance(spokenText);
          activeUtterance = utterance;
          utterance.voice = bnVoice;
          utterance.lang = bnVoice.lang || 'bn-BD';
          utterance.volume = 1.0;
          utterance.rate = 0.92; // Clear, articulate, distinct Bengali pronunciation
          utterance.pitch = 1.15; // Natural sweet female tone

          utterance.onboundary = (e) => {
            if (globalAvatarController && typeof globalAvatarController.triggerWordSyllable === 'function') {
              let wordToken = '';
              if (e && typeof e.charIndex === 'number' && spokenText) {
                wordToken = spokenText.slice(e.charIndex, e.charIndex + (e.charLength || 6));
              }
              globalAvatarController.triggerWordSyllable(wordToken);
            }
          };

          utterance.onend = () => {
            if (globalAvatarController) {
              globalAvatarController.stopSpeaking();
            }
            activeUtterance = null;
          };

          utterance.onerror = (e) => {
            console.warn('Native Bengali TTS failed, falling back to Audio Stream:', e);
            activeUtterance = null;
            playBengaliAudioStream(spokenText);
          };

          utterance.onstart = () => {
            if (globalAvatarController) {
              globalAvatarController.startSpeaking(spokenText);
            }
          };

          window.speechSynthesis.speak(utterance);
          return;
        } catch (err) {
          console.warn('SpeechSynthesis invocation error:', err);
          playBengaliAudioStream(spokenText);
          return;
        }
      }

      // If NO native Bengali voice is installed in Windows/Browser (very common on Windows PCs):
      // Use the high-definition Bengali Audio stream directly!
      playBengaliAudioStream(spokenText);
      return;
    }

    // --- ENGLISH / UNIVERSAL VOICE PIPELINE ---
    if (!('speechSynthesis' in window)) {
      if (globalAvatarController) {
        globalAvatarController.startSpeaking(spokenText);
        const duration = Math.min(Math.max(spokenText.length * 65, 1800), 7000);
        speechFallbackTimer = setTimeout(() => {
          if (globalAvatarController) globalAvatarController.stopSpeaking();
        }, duration);
      }
      return;
    }

    try {
      if (window.speechSynthesis.resume) window.speechSynthesis.resume();
      const utterance = new SpeechSynthesisUtterance(spokenText);
      activeUtterance = utterance;

      utterance.volume = 1.0;
      utterance.rate = 0.95; // Crisp, clear articulation
      utterance.pitch = 1.12; // Natural female pitch
      utterance.lang = 'en-US';

      const selectedVoice = getBestVoice(false);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.onstart = () => {
        if (globalAvatarController) {
          globalAvatarController.startSpeaking(spokenText);
        }
      };

      utterance.onboundary = (e) => {
        if (globalAvatarController && typeof globalAvatarController.triggerWordSyllable === 'function') {
          let wordToken = '';
          if (e && typeof e.charIndex === 'number' && spokenText) {
            wordToken = spokenText.slice(e.charIndex, e.charIndex + (e.charLength || 6));
          }
          globalAvatarController.triggerWordSyllable(wordToken);
        }
      };

      utterance.onend = () => {
        if (globalAvatarController) {
          globalAvatarController.stopSpeaking();
        }
        activeUtterance = null;
      };

      utterance.onerror = (e) => {
        console.warn('SpeechSynthesis error:', e);
        if (globalAvatarController) {
          globalAvatarController.stopSpeaking();
        }
        activeUtterance = null;
      };

      const estimatedDuration = Math.min(Math.max(spokenText.length * 85, 2000), 14000);
      speechFallbackTimer = setTimeout(() => {
        if (globalAvatarController && (!window.speechSynthesis.speaking || !activeUtterance)) {
          globalAvatarController.stopSpeaking();
        }
      }, estimatedDuration);

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('English TTS speak error:', err);
      if (globalAvatarController) {
        globalAvatarController.startSpeaking(spokenText);
        setTimeout(() => {
          if (globalAvatarController) globalAvatarController.stopSpeaking();
        }, 3000);
      }
    }
  }

  // Global handle for replay
  window.globalSpeakResponse = (text) => {
    speakText(text);
  };

  // --- Voice Output Toggle Controls ---
  const globalVoiceToggle = document.getElementById('globalVoiceToggle');
  const speakerToggleBtn = document.getElementById('speakerToggleBtn');

  function updateVoiceOutputState(enabled) {
    isVoiceOutputEnabled = enabled;
    if (globalVoiceToggle) {
      if (enabled) {
        globalVoiceToggle.classList.remove('muted');
        globalVoiceToggle.classList.add('active');
        globalVoiceToggle.innerHTML = '<i class="fa-solid fa-volume-high"></i> <span>Voice ON</span>';
      } else {
        globalVoiceToggle.classList.remove('active');
        globalVoiceToggle.classList.add('muted');
        globalVoiceToggle.innerHTML = '<i class="fa-solid fa-volume-xmark"></i> <span>Voice OFF</span>';
        stopAllSpeechAndAudio();
        if (globalAvatarController) globalAvatarController.stopSpeaking();
      }
    }

    if (speakerToggleBtn) {
      if (enabled) {
        speakerToggleBtn.classList.remove('muted');
        speakerToggleBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
      } else {
        speakerToggleBtn.classList.add('muted');
        speakerToggleBtn.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
      }
    }
  }

  if (globalVoiceToggle) {
    globalVoiceToggle.addEventListener('click', () => {
      updateVoiceOutputState(!isVoiceOutputEnabled);
    });
  }

  if (speakerToggleBtn) {
    speakerToggleBtn.addEventListener('click', () => {
      updateVoiceOutputState(!isVoiceOutputEnabled);
    });
  }

  // --- Speech Recognition (Voice Input / Speech to Text) ---
  const voiceMicBtn = document.getElementById('voiceMicBtn');
  const voiceWaveBar = document.getElementById('voiceWaveBar');
  const voiceStatusText = document.getElementById('voiceStatusText');
  const heroChatInput = document.getElementById('heroChatInput');
  const voiceLangToggleBtn = document.getElementById('voiceLangToggleBtn');
  const voiceLangLabel = document.getElementById('voiceLangLabel');
  const chatVoiceLangBtn = document.getElementById('chatVoiceLangBtn');
  const chatVoiceLangLabel = document.getElementById('chatVoiceLangLabel');

  let currentVoiceLang = 'bn-BD'; // Default to Bangla for high accuracy, with instant 1-click English switch
  let recognition = null;
  let isRecording = false;

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  function updateVoiceLanguage(lang) {
    currentVoiceLang = lang;
    if (recognition) {
      try { recognition.lang = lang; } catch(e) {}
    }
    const isBn = (lang === 'bn-BD');
    if (voiceLangLabel) {
      voiceLangLabel.textContent = isBn ? 'বাংলা' : 'EN';
    }
    if (chatVoiceLangLabel) {
      chatVoiceLangLabel.textContent = isBn ? 'বাংলা' : 'EN';
    }
    if (chatVoiceLangBtn) {
      if (isBn) {
        chatVoiceLangBtn.classList.remove('en-mode');
      } else {
        chatVoiceLangBtn.classList.add('en-mode');
      }
    }
    if (voiceStatusText) {
      voiceStatusText.innerHTML = `<i class="fa-solid fa-circle-dot"></i> Mic: ${isBn ? 'বাংলা' : 'English'}`;
    }
  }

  if (voiceLangToggleBtn) {
    voiceLangToggleBtn.addEventListener('click', () => {
      const nextLang = currentVoiceLang === 'bn-BD' ? 'en-US' : 'bn-BD';
      updateVoiceLanguage(nextLang);
      if (typeof showToast === 'function') {
        showToast(nextLang === 'en-US' ? '🎤 Voice Language: English (US)' : '🎤 ভয়েস ইনপুট: বাংলা (BD)');
      }
    });
  }

  if (chatVoiceLangBtn) {
    chatVoiceLangBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const nextLang = currentVoiceLang === 'bn-BD' ? 'en-US' : 'bn-BD';
      updateVoiceLanguage(nextLang);
      if (typeof showToast === 'function') {
        showToast(nextLang === 'en-US' ? '🎤 Voice Language: English (US)' : '🎤 ভয়েস ইনপুট: বাংলা (BD)');
      }
    });
  }

  // Initialize initial label
  updateVoiceLanguage(currentVoiceLang);

  function stopVoiceRecording() {
    isRecording = false;
    if (voiceMicBtn) voiceMicBtn.classList.remove('recording');
    if (voiceWaveBar) voiceWaveBar.style.display = 'none';
    if (voiceStatusText) {
      voiceStatusText.innerHTML = `<i class="fa-solid fa-circle-dot"></i> Mic Active (${currentVoiceLang === 'bn-BD' ? 'বাংলা' : 'English'})`;
    }
  }

  function startVoiceRecording() {
    if (!SpeechRecognition) {
      alert('Speech Recognition is supported in Google Chrome and Microsoft Edge. Please open this site in Chrome or Edge for voice input.');
      return;
    }

    // Cancel prior speech & audio outputs so microphone receives clean input
    if (window.MediaCoordinator) {
      window.MediaCoordinator.pauseAll();
    } else {
      if ('speechSynthesis' in window) {
        try { window.speechSynthesis.cancel(); } catch(e) {}
      }
      if (globalAvatarController) {
        globalAvatarController.stopSpeaking();
      }
    }

    // Stop any existing recognition instance
    if (recognition) {
      try { recognition.abort(); } catch(e) {}
      recognition = null;
    }

    try {
      recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.lang = currentVoiceLang;

      recognition.onstart = () => {
        isRecording = true;
        if (voiceMicBtn) voiceMicBtn.classList.add('recording');
        if (voiceWaveBar) {
          voiceWaveBar.style.display = 'flex';
          const textSpan = voiceWaveBar.querySelector('.voice-wave-text');
          if (textSpan) {
            textSpan.textContent = currentVoiceLang === 'bn-BD' 
              ? 'বাংলায় কথা বলুন... শুনছি' 
              : 'Listening in English... Speak now';
          }
        }
        if (globalAvatarController) globalAvatarController.setListening();
      };

      let finalRecognizedText = '';
      let latestTranscribedText = '';

      recognition.onresult = (event) => {
        let interimText = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const trans = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalRecognizedText += trans;
          } else {
            interimText += trans;
          }
        }

        const displayText = (finalRecognizedText || interimText || '').trim();
        if (displayText) {
          latestTranscribedText = displayText;
          if (heroChatInput) {
            heroChatInput.value = displayText;
          }
        }
      };

      recognition.onerror = (event) => {
        console.warn('Speech Recognition error:', event.error);
        stopVoiceRecording();
        if (globalAvatarController) globalAvatarController.setIdle();

        if (event.error === 'not-allowed') {
          alert('মাইক্রোফোন পারমিশন প্রয়োজন। ব্রাউজারের অ্যাড্রেস বারের লক/ক্যামেরা আইকনে ক্লিক করে Microphone: Allow করুন।');
        } else if (event.error === 'no-speech') {
          if (voiceWaveBar) {
            voiceWaveBar.style.display = 'flex';
            const textSpan = voiceWaveBar.querySelector('.voice-wave-text');
            if (textSpan) textSpan.textContent = currentVoiceLang === 'bn-BD' ? 'কথা স্পষ্ট শোনা যায়নি, আবার বলুন...' : 'Speech not detected, please speak again...';
            setTimeout(() => { if (!isRecording && voiceWaveBar) voiceWaveBar.style.display = 'none'; }, 2200);
          }
        }
      };

      recognition.onend = () => {
        stopVoiceRecording();
        if (globalAvatarController) globalAvatarController.setIdle();
        
        // Retrieve spoken text from final transcript, latest interim transcript, or input box
        const query = (finalRecognizedText && finalRecognizedText.trim())
          || (latestTranscribedText && latestTranscribedText.trim())
          || (heroChatInput && heroChatInput.value && heroChatInput.value.trim());

        if (query) {
          finalRecognizedText = '';
          latestTranscribedText = '';
          if (heroChatInput) heroChatInput.value = '';
          handleHeroSend(query);
        }
      };

      recognition.start();
    } catch (err) {
      console.warn('Recognition start exception:', err);
      stopVoiceRecording();
      if (globalAvatarController) globalAvatarController.setIdle();
    }
  }

  if (voiceMicBtn) {
    voiceMicBtn.addEventListener('click', () => {
      if (isRecording) {
        if (recognition) {
          try { recognition.stop(); } catch(e) {}
        }
        stopVoiceRecording();
        if (globalAvatarController) globalAvatarController.setIdle();
      } else {
        startVoiceRecording();
      }
    });
  }

  // --- Hero Chat Box Logic ---
  const heroChatForm = document.getElementById('heroChatForm');
  const heroChatBody = document.getElementById('heroChatBody');
  const heroSendBtn = document.getElementById('heroSendBtn');

  function appendMessageToHero(text, isBot = false) {
    if (!heroChatBody) return;
    const currentWindowY = window.pageYOffset || document.documentElement.scrollTop || window.scrollY || 0;

    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-message ${isBot ? 'bot' : 'user'}`;

    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble';
    
    // Strict typography font family separation:
    const hasBengaliScript = /[\u0980-\u09FF]/.test(text);
    if (hasBengaliScript) {
      bubble.classList.add('lang-bn');
    } else {
      bubble.classList.add('lang-en');
    }
    
    bubble.innerHTML = text;

    msgDiv.appendChild(bubble);
    heroChatBody.appendChild(msgDiv);
    heroChatBody.scrollTop = heroChatBody.scrollHeight;

    if (Math.abs((window.pageYOffset || document.documentElement.scrollTop || 0) - currentWindowY) > 0) {
      window.scrollTo(0, currentWindowY);
    }
  }

  function showHeroTypingIndicator() {
    if (!heroChatBody) return null;
    const currentWindowY = window.pageYOffset || document.documentElement.scrollTop || window.scrollY || 0;

    const indicator = document.createElement('div');
    indicator.className = 'chat-message bot typing-msg';
    indicator.innerHTML = `
      <div class="typing-indicator">
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
      </div>
    `;
    heroChatBody.appendChild(indicator);
    heroChatBody.scrollTop = heroChatBody.scrollHeight;

    if (Math.abs((window.pageYOffset || document.documentElement.scrollTop || 0) - currentWindowY) > 0) {
      window.scrollTo(0, currentWindowY);
    }
    return indicator;
  }

  const heroClearChatBtn = document.getElementById('heroClearChatBtn');
  if (heroClearChatBtn && heroChatBody) {
    heroClearChatBtn.addEventListener('click', () => {
      heroChatBody.innerHTML = `
        <div class="chat-message bot">
          <div class="chat-bubble">
            Welcome! 👋 I am <strong>NeuralBot</strong>. You can type your question in the box or click the <strong>Microphone</strong> to talk in English or Bengali. How can I assist you today?
          </div>
        </div>
      `;
    });
  }

  function handleHeroSend(userText) {
    if (!userText || !userText.trim()) return;
    const currentWindowY = window.pageYOffset || document.documentElement.scrollTop || window.scrollY || 0;

    if (heroChatInput) {
      heroChatInput.value = '';
    }

    // Keep conversation thread smooth and prune old messages if over limit
    if (heroChatBody && heroChatBody.children.length > 50) {
      while (heroChatBody.children.length > 40) {
        heroChatBody.removeChild(heroChatBody.children[0]);
      }
    }

    appendMessageToHero(escapeHtml(userText), false);

    // Instant Social Media Command Check & Immediate Launch during user interaction!
    // Ensures popup blocker is bypassed for YouTube, Facebook, WhatsApp, Instagram, X, LinkedIn, TikTok, GitHub, Telegram
    const directSocial = detectSocialPlatform(userText);
    if (directSocial) {
      launchSocialDirectly(directSocial.targetUrl);
    } else {
      const directSite = detectWebsiteNavigation(userText);
      if (directSite) {
        launchSocialDirectly(directSite.targetUrl);
      }
    }

    // Auto-detect URL Web Ingestion Intent directly in Chat
    const isYt = /(?:youtube\.com|youtu\.be)/i.test(userText);
    const urlMatch = !isYt && userText.match(/(https?:\/\/[^\s]+)/i);
    const isIngestIntent = urlMatch && (/ingest|learn|read|import|store|save|লিংক|ওয়েবসাইট|পড়ো|শেখো|মেমোরি/i.test(userText) || userText.trim().startsWith('http'));

    if (urlMatch && isIngestIntent) {
      const targetUrl = urlMatch[1];
      const isBengali = isBengaliQuery(userText);
      
      if (globalAvatarController) {
        globalAvatarController.setThinking();
      }
      const typingElem = showHeroTypingIndicator();

      (async () => {
        try {
          if (!window.NeuralKnowledgeStore || typeof window.NeuralKnowledgeStore.ingestFromWebUrl !== 'function') {
            throw new Error('Web Ingest engine not available.');
          }
          const ingested = await window.NeuralKnowledgeStore.ingestFromWebUrl(targetUrl);
          if (typingElem) typingElem.remove();

          if (window.NeuralKnowledgeStore && typeof window.NeuralKnowledgeStore.setLastActiveTopic === 'function') {
            window.NeuralKnowledgeStore.setLastActiveTopic(ingested);
          }

          const resp = isBengali
            ? `🌐 <strong>ওয়েবসাইট সফলভাবে মেমোরিতে যুক্ত হয়েছে! 🧠✨</strong><br><br>• <strong>টপিক:</strong> ${escapeHtml(ingested.title)}<br>• <strong>মূল লিংক:</strong> <a href="${ingested.sourceUrl}" target="_blank" style="color:#00f2fe;">${ingested.sourceUrl}</a><br><br>${ingested.responses_bn[0]}<br><br>💡 <em>আপনি এখন এই ওয়েবসাইট সম্পর্কিত যেকোনো প্রশ্ন করতে পারেন!</em>`
            : `🌐 <strong>Website Ingested into Neural Memory! 🧠✨</strong><br><br>• <strong>Topic:</strong> ${escapeHtml(ingested.title)}<br>• <strong>Source:</strong> <a href="${ingested.sourceUrl}" target="_blank" style="color:#00f2fe;">${ingested.sourceUrl}</a><br><br>${ingested.responses_en[0]}<br><br>💡 <em>You can now ask me any question about this web source!</em>`;

          appendMessageToHero(resp, true);
          speakText(isBengali ? `${ingested.title} ওয়েবসাইট থেকে তথ্য মেমোরিতে সংরক্ষণ করা হয়েছে।` : `Successfully learned and stored ${ingested.title} into memory.`);
          if (typeof window.refreshKnowledgeStoreUI === 'function') {
            window.refreshKnowledgeStoreUI();
          }
        } catch (err) {
          if (typingElem) typingElem.remove();
          const errResp = isBengali
            ? `⚠️ ওয়েবসাইট থেকে তথ্য পড়তে সমস্যা হয়েছে: ${escapeHtml(err.message || 'অনুগ্রহ করে সঠিক URL দিন।')}`
            : `⚠️ Failed to ingest website: ${escapeHtml(err.message || 'Please verify the URL.')}`;
          appendMessageToHero(errResp, true);
          speakText(errResp);
        }
      })();
      return;
    }

    // Switch avatar to thinking state with synaptic firing
    if (globalAvatarController) {
      globalAvatarController.setThinking();
    }

    const typingElem = showHeroTypingIndicator();

    (async () => {
      let response;
      try {
        response = await resolveBotResponse(userText);
      } catch (err) {
        console.warn('Bot resolution exception, falling back to local matcher:', err);
        response = getSmartResponse(userText);
      }
      if (typingElem) typingElem.remove();
      appendMessageToHero(response, true);
      speakText(response);
    })();

    window.scrollTo(0, currentWindowY);
    setTimeout(() => {
      window.scrollTo(0, currentWindowY);
    }, 10);
    setTimeout(() => {
      window.scrollTo(0, currentWindowY);
    }, 100);
  }

  if (heroChatInput) {
    heroChatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.keyCode === 13) {
        e.preventDefault();
        e.stopPropagation();
        const val = heroChatInput.value;
        if (val && val.trim()) {
          handleHeroSend(val);
        }
        return false;
      }
    });

    heroChatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' || e.keyCode === 13) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    });

    heroChatInput.addEventListener('keyup', (e) => {
      if (e.key === 'Enter' || e.keyCode === 13) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    });
  }

  if (heroChatForm) {
    heroChatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const val = heroChatInput ? heroChatInput.value : '';
      if (val && val.trim()) {
        handleHeroSend(val);
      }
      return false;
    });
  }

  if (heroSendBtn) {
    heroSendBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const val = heroChatInput ? heroChatInput.value : '';
      if (val && val.trim()) {
        handleHeroSend(val);
      }
    });
  }

  // Hero Quick Chips
  document.querySelectorAll('.quick-chip:not(.playground-chip)').forEach((chip) => {
    chip.addEventListener('click', (e) => {
      e.preventDefault();
      const action = chip.getAttribute('data-action');
      if (action === 'open-ai-brain') {
        if (typeof window.openAiBrainModal === 'function') {
          window.openAiBrainModal();
        }
        return;
      }
      if (action === 'open-kb') {
        if (typeof window.openKnowledgeStoreModal === 'function') {
          window.openKnowledgeStoreModal();
        }
        return;
      }
      if (action === 'open-web-ingest') {
        if (typeof window.openKnowledgeStoreModal === 'function') {
          window.openKnowledgeStoreModal();
          const webPanel = document.getElementById('ingestWebPanel');
          if (webPanel) webPanel.style.display = 'block';
          const webUrlIn = document.getElementById('webIngestUrl');
          if (webUrlIn) webUrlIn.focus();
        }
        return;
      }
      if (action === 'open-pdf') {
        if (typeof window.openKnowledgeStoreModal === 'function') {
          window.openKnowledgeStoreModal();
          if (typeof window.openPdfUploadPanel === 'function') {
            window.openPdfUploadPanel();
          }
        }
        return;
      }
      const prompt = chip.getAttribute('data-prompt');
      if (prompt) handleHeroSend(prompt);
    });
  });

  // --- Live Playground Console Logic ---
  const playgroundForm = document.getElementById('playgroundForm');
  const playgroundInput = document.getElementById('playgroundInput');
  const playgroundBody = document.getElementById('playgroundChatBody');
  const playgroundSendBtn = document.getElementById('playgroundSendBtn');
  const clearChatBtn = document.getElementById('clearChatBtn');

  function handlePlaygroundSend(userText) {
    if (!userText || !userText.trim() || !playgroundBody) return;
    const currentWindowY = window.pageYOffset || document.documentElement.scrollTop || window.scrollY || 0;

    const userMsg = document.createElement('div');
    userMsg.className = 'chat-message user';
    userMsg.innerHTML = `<div class="chat-bubble">${escapeHtml(userText)}</div>`;
    playgroundBody.appendChild(userMsg);
    if (playgroundInput) {
      playgroundInput.value = '';
    }

    if (globalAvatarController) {
      globalAvatarController.setThinking();
    }

    const indicator = document.createElement('div');
    indicator.className = 'chat-message bot typing-msg';
    indicator.innerHTML = `
      <div class="typing-indicator">
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
      </div>
    `;
    playgroundBody.appendChild(indicator);
    playgroundBody.scrollTop = playgroundBody.scrollHeight;

    (async () => {
      let response;
      try {
        response = await resolveBotResponse(userText);
      } catch (err) {
        response = getSmartResponse(userText);
      }
      indicator.remove();
      const botMsg = document.createElement('div');
      botMsg.className = 'chat-message bot';
      botMsg.innerHTML = `<div class="chat-bubble">${response}</div>`;
      playgroundBody.appendChild(botMsg);
      playgroundBody.scrollTop = playgroundBody.scrollHeight;
      speakText(response);
    })();

    if (Math.abs((window.pageYOffset || document.documentElement.scrollTop || 0) - currentWindowY) > 0) {
      window.scrollTo(0, currentWindowY);
    }
  }

  if (playgroundInput) {
    playgroundInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.keyCode === 13) {
        e.preventDefault();
        e.stopPropagation();
        const val = playgroundInput.value;
        if (val && val.trim()) {
          handlePlaygroundSend(val);
        }
        return false;
      }
    });

    playgroundInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' || e.keyCode === 13) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    });

    playgroundInput.addEventListener('keyup', (e) => {
      if (e.key === 'Enter' || e.keyCode === 13) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    });
  }

  if (playgroundForm) {
    playgroundForm.addEventListener('submit', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const val = playgroundInput ? playgroundInput.value : '';
      if (val && val.trim()) {
        handlePlaygroundSend(val);
      }
      return false;
    });
  }

  if (playgroundSendBtn) {
    playgroundSendBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const val = playgroundInput ? playgroundInput.value : '';
      if (val && val.trim()) {
        handlePlaygroundSend(val);
      }
    });
  }

  document.querySelectorAll('.playground-chip').forEach((chip) => {
    chip.addEventListener('click', (e) => {
      e.preventDefault();
      const action = chip.getAttribute('data-action');
      if (action === 'open-kb') {
        if (typeof window.openKnowledgeStoreModal === 'function') {
          window.openKnowledgeStoreModal();
        }
        return;
      }
      const prompt = chip.getAttribute('data-prompt');
      if (prompt) handlePlaygroundSend(prompt);
    });
  });

  if (clearChatBtn && playgroundBody) {
    clearChatBtn.addEventListener('click', () => {
      playgroundBody.innerHTML = `
        <div class="chat-message bot">
          <div class="chat-bubble">
            👋 <strong>Neural AI Engine Reset.</strong> Console has been reset. Type a new prompt!
          </div>
        </div>
      `;
      if (globalAvatarController) globalAvatarController.setIdle();
    });
  }
}

/* ==========================================================================
   5. GALLERY FILTER & LIGHTBOX MODAL
   ========================================================================== */
function initGallery() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');
  const modal = document.getElementById('lightboxModal');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const closeBtn = document.getElementById('lightboxClose');
  const prevBtn = document.getElementById('lightboxPrev');
  const nextBtn = document.getElementById('lightboxNext');

  if (!modal) return;

  let currentItems = Array.from(galleryItems);
  let currentIndex = 0;

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      galleryItems.forEach((item) => {
        const category = item.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });

      currentItems = Array.from(galleryItems).filter(
        (item) => item.style.display !== 'none'
      );
    });
  });

  galleryItems.forEach((item) => {
    item.addEventListener('click', () => {
      currentIndex = currentItems.indexOf(item);
      if (currentIndex === -1) currentIndex = 0;
      openLightbox();
    });
  });

  function openLightbox() {
    const item = currentItems[currentIndex];
    if (!item) return;

    const src = item.getAttribute('data-src') || item.querySelector('img').src;
    const title = item.getAttribute('data-title') || '';
    const desc = item.getAttribute('data-desc') || '';

    lightboxImg.src = src;
    lightboxCaption.innerHTML = `<strong>${title}</strong> — <span style="color:var(--text-muted);">${desc}</span>`;
    modal.classList.add('active');
  }

  function closeLightbox() {
    modal.classList.remove('active');
  }

  function showNext() {
    currentIndex = (currentIndex + 1) % currentItems.length;
    openLightbox();
  }

  function showPrev() {
    currentIndex = (currentIndex - 1 + currentItems.length) % currentItems.length;
    openLightbox();
  }

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  if (nextBtn) nextBtn.addEventListener('click', showNext);
  if (prevBtn) prevBtn.addEventListener('click', showPrev);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') showNext();
    if (e.key === 'ArrowLeft') showPrev();
  });
}

/* ==========================================================================
   6. NEURAL KNOWLEDGE STORE & DYNAMIC MEMORY MODAL CONTROLLER
   ========================================================================== */
function initKnowledgeStoreModal() {
  const modal = document.getElementById('knowledgeModal');
  const openBtnNav = document.getElementById('openKnowledgeModalBtn');
  const closeBtnX = document.getElementById('knowledgeModalClose');
  const closeBtnBottom = document.getElementById('knowledgeModalCloseBtn');
  const backdrop = document.getElementById('knowledgeModalBackdrop');
  const searchInput = document.getElementById('knowledgeSearchInput');
  const searchClear = document.getElementById('knowledgeSearchClear');
  const categoryTabs = document.querySelectorAll('.kb-tab-btn');
  const cardsGrid = document.getElementById('knowledgeCardsGrid');
  const listStatus = document.getElementById('knowledgeListStatus');
  const toggleAddBtn = document.getElementById('toggleAddKnowledgeBtn');
  const addPanel = document.getElementById('addKnowledgePanel');
  const addForm = document.getElementById('addKnowledgeForm');
  const cancelAddBtn = document.getElementById('cancelAddKnowledgeBtn');
  const countAll = document.getElementById('kbCountAll');
  const countCustom = document.getElementById('kbCountCustom');
  const toastContainer = document.getElementById('kbToastContainer');

  if (!modal) return;

  let activeCategory = 'all';
  let searchQuery = '';

  function showToast(message, isError = false) {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `kb-toast ${isError ? 'error' : ''}`;
    toast.innerHTML = `<i class="fa-solid ${isError ? 'fa-triangle-exclamation' : 'fa-circle-check'}"></i> <span>${message}</span>`;
    toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  function openModal() {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    renderKnowledgeGrid();
    if (searchInput) searchInput.focus();
  }

  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  window.openKnowledgeStoreModal = openModal;

  if (openBtnNav) openBtnNav.addEventListener('click', openModal);
  if (closeBtnX) closeBtnX.addEventListener('click', closeModal);
  if (closeBtnBottom) closeBtnBottom.addEventListener('click', closeModal);
  if (backdrop) backdrop.addEventListener('click', closeModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });

  // Category Tab Filter
  categoryTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      categoryTabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      activeCategory = tab.getAttribute('data-cat') || 'all';
      if (activeCategory === 'web' && ingestWebPanel) {
        ingestWebPanel.style.display = 'block';
        if (addPanel) addPanel.style.display = 'none';
        const pdfPanel = document.getElementById('uploadPdfPanel');
        if (pdfPanel) pdfPanel.style.display = 'none';
        setTimeout(() => document.getElementById('webIngestUrl')?.focus(), 100);
      } else if (activeCategory === 'pdf') {
        const pdfPanel = document.getElementById('uploadPdfPanel');
        if (pdfPanel) pdfPanel.style.display = 'block';
        if (addPanel) addPanel.style.display = 'none';
        if (ingestWebPanel) ingestWebPanel.style.display = 'none';
      }
      renderKnowledgeGrid();
    });
  });

  // Search filter
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      searchQuery = searchInput.value.toLowerCase().trim();
      if (searchClear) {
        searchClear.style.display = searchQuery ? 'flex' : 'none';
      }
      renderKnowledgeGrid();
    });
  }

  if (searchClear && searchInput) {
    searchClear.addEventListener('click', () => {
      searchInput.value = '';
      searchQuery = '';
      searchClear.style.display = 'none';
      renderKnowledgeGrid();
      searchInput.focus();
    });
  }

  // Toggle Add Knowledge Panel
  if (toggleAddBtn && addPanel) {
    toggleAddBtn.addEventListener('click', () => {
      const isHidden = addPanel.style.display === 'none';
      addPanel.style.display = isHidden ? 'block' : 'none';
      if (isHidden) {
        document.getElementById('newKbTitle')?.focus();
      }
    });
  }

  if (cancelAddBtn && addPanel) {
    cancelAddBtn.addEventListener('click', () => {
      addPanel.style.display = 'none';
    });
  }

  // Handle Add Form Submit
  if (addForm) {
    addForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const cat = document.getElementById('newKbCategory')?.value || 'custom';
      const title = document.getElementById('newKbTitle')?.value.trim() || '';
      const kwRaw = document.getElementById('newKbKeywords')?.value.trim() || '';
      const respRaw = document.getElementById('newKbResponses')?.value.trim() || '';

      if (!title || !kwRaw || !respRaw) {
        showToast('Please fill in all knowledge fields.', true);
        return;
      }

      const keywords = kwRaw.split(',').map((k) => k.trim()).filter((k) => k.length > 0);
      const responses = respRaw.split('\n').map((r) => r.trim()).filter((r) => r.length > 0);

      if (keywords.length === 0 || responses.length === 0) {
        showToast('Please provide valid keywords and at least one response.', true);
        return;
      }

      const newItem = {
        id: 'custom_' + Date.now(),
        category: cat,
        title: title,
        keywords: keywords,
        responses: responses,
        isCustom: true,
        createdAt: new Date().toLocaleDateString()
      };

      try {
        const stored = localStorage.getItem('neural_bot_custom_kb');
        const customList = stored ? JSON.parse(stored) : [];
        customList.unshift(newItem);
        localStorage.setItem('neural_bot_custom_kb', JSON.stringify(customList));
      } catch (err) {
        console.error('Save error:', err);
      }

      showToast(`Knowledge pattern "${title}" stored to Neural Memory!`);
      addForm.reset();
      if (addPanel) addPanel.style.display = 'none';
      renderKnowledgeGrid();
    });
  }

  const countGithub = document.getElementById('kbCountGithub');
  const countQa = document.getElementById('kbCountQa');
  const countFile = document.getElementById('kbCountFile');
  const countWeb = document.getElementById('kbCountWeb');
  const syncGithubBtn = document.getElementById('syncGithubKbBtn');
  const syncFileMemoryBtn = document.getElementById('syncFileMemoryBtn');

  // Web Ingestion Panel Controls
  const toggleIngestWebBtn = document.getElementById('toggleIngestWebBtn');
  const toggleIngestWebBtnHeader = document.getElementById('toggleIngestWebBtnHeader');
  const ingestWebPanel = document.getElementById('ingestWebPanel');
  const cancelIngestWebBtn = document.getElementById('cancelIngestWebBtn');
  const ingestWebForm = document.getElementById('ingestWebForm');
  const submitWebIngestBtn = document.getElementById('submitWebIngestBtn');

  if (toggleIngestWebBtnHeader && ingestWebPanel) {
    toggleIngestWebBtnHeader.addEventListener('click', () => {
      ingestWebPanel.style.display = 'block';
      if (addPanel) addPanel.style.display = 'none';
      setTimeout(() => document.getElementById('webIngestUrl')?.focus(), 100);
    });
  }

  if (toggleIngestWebBtn && ingestWebPanel) {
    toggleIngestWebBtn.addEventListener('click', () => {
      const isHidden = ingestWebPanel.style.display === 'none';
      ingestWebPanel.style.display = isHidden ? 'block' : 'none';
      if (addPanel && isHidden) addPanel.style.display = 'none';
      if (isHidden) {
        document.getElementById('webIngestUrl')?.focus();
      }
    });
  }

  if (cancelIngestWebBtn && ingestWebPanel) {
    cancelIngestWebBtn.addEventListener('click', () => {
      ingestWebPanel.style.display = 'none';
    });
  }

  if (ingestWebForm) {
    ingestWebForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const urlInput = document.getElementById('webIngestUrl');
      const titleInput = document.getElementById('webIngestCustomTitle');
      const rawUrl = urlInput ? urlInput.value.trim() : '';
      const customTitle = titleInput ? titleInput.value.trim() : '';

      if (!rawUrl) {
        showToast('Please provide a valid Website URL.', true);
        return;
      }

      if (submitWebIngestBtn) {
        submitWebIngestBtn.disabled = true;
        submitWebIngestBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Reading & Analyzing Web Content...';
      }

      try {
        if (!window.NeuralKnowledgeStore || typeof window.NeuralKnowledgeStore.ingestFromWebUrl !== 'function') {
          throw new Error('Web Ingest engine is not ready.');
        }

        const ingested = await window.NeuralKnowledgeStore.ingestFromWebUrl(rawUrl, customTitle);
        showToast(`Successfully ingested "${ingested.title}" into Neural Memory! 🌐🧠`);
        ingestWebForm.reset();
        if (ingestWebPanel) ingestWebPanel.style.display = 'none';
        activeCategory = 'web';
        categoryTabs.forEach(t => {
          t.classList.toggle('active', t.getAttribute('data-cat') === 'web');
        });
        renderKnowledgeGrid();
      } catch (err) {
        console.error('Web Ingest failed:', err);
        showToast(err.message || 'Failed to ingest web content. Please check URL.', true);
      } finally {
        if (submitWebIngestBtn) {
          submitWebIngestBtn.disabled = false;
          submitWebIngestBtn.innerHTML = '<i class="fa-solid fa-cloud-arrow-down"></i> Read & Store Web Knowledge';
        }
      }
    });
  }

  // Handle PDF Book Upload & In-Browser Chunking & RAG
  window.handlePdfUploadSubmit = async function () {
    const fileInput = document.getElementById('pdfFileInput');
    const titleInput = document.getElementById('pdfCustomBookTitle');
    const submitBtn = document.getElementById('submitPdfUploadBtn');
    const progressWrapper = document.getElementById('pdfProgressWrapper');
    const progressText = document.getElementById('pdfProgressStatusText');
    const progressBar = document.getElementById('pdfProgressBar');
    const progressPercent = document.getElementById('pdfProgressPercent');

    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
      showToast('Please select a valid .pdf file to upload.', true);
      return;
    }

    const file = fileInput.files[0];
    const customTitle = titleInput ? titleInput.value.trim() : '';

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing & Chunking PDF...';
    }
    if (progressWrapper) progressWrapper.style.display = 'block';

    try {
      if (!window.NeuralPdfStore || typeof window.NeuralPdfStore.ingestPdfFile !== 'function') {
        throw new Error('PDF RAG Vector Engine is not ready. Please refresh the page.');
      }

      const res = await window.NeuralPdfStore.ingestPdfFile(file, customTitle, (p) => {
        if (progressBar) progressBar.style.width = `${p.percent}%`;
        if (progressPercent) progressPercent.textContent = `${p.percent}%`;
        if (progressText) {
          if (p.stage === 'reading') {
            progressText.innerHTML = `<i class="fa-solid fa-book-open fa-spin"></i> Reading page ${p.current} of ${p.total} (${p.percent}%) &bull; ${p.chunksCount || 0} chunks extracted...`;
          } else if (p.stage === 'saving') {
            progressText.innerHTML = `<i class="fa-solid fa-database fa-spin"></i> Saving ${p.current} of ${p.total} chunks into IndexedDB (${p.percent}%)...`;
          } else if (p.stage === 'complete') {
            progressText.innerHTML = `<i class="fa-solid fa-circle-check"></i> Complete! Indexed ${p.total} chunks.`;
          }
        }
      });

      showToast(`Book "${res.bookTitle}" (${res.totalPages} pages, ${res.totalChunks} chunks) memorized! 📚✨`);

      const form = document.getElementById('uploadPdfForm');
      if (form) form.reset();

      setTimeout(() => {
        const panel = document.getElementById('uploadPdfPanel');
        if (panel) panel.style.display = 'none';
        if (progressWrapper) progressWrapper.style.display = 'none';
        activeCategory = 'pdf';
        categoryTabs.forEach(t => {
          t.classList.toggle('active', t.getAttribute('data-cat') === 'pdf');
        });
        renderKnowledgeGrid();
      }, 1000);
    } catch (err) {
      console.error('[PDF Ingest Error]', err);
      showToast(err.message || 'Failed to extract text from PDF.', true);
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> Extract, Chunk & Memorize Book 📚';
      }
    }
  };

  if (syncFileMemoryBtn) {
    syncFileMemoryBtn.addEventListener('click', async () => {
      syncFileMemoryBtn.disabled = true;
      syncFileMemoryBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Loading...';
      showToast('Reloading memory from data/memory.json...');
      if (window.NeuralKnowledgeStore && typeof window.NeuralKnowledgeStore.loadFileMemory === 'function') {
        const items = await window.NeuralKnowledgeStore.loadFileMemory();
        showToast(`Successfully loaded ${items.length} items from data/memory.json! 🧠✨`);
      }
      syncFileMemoryBtn.disabled = false;
      syncFileMemoryBtn.innerHTML = '<i class="fa-solid fa-rotate" style="color: #00f2fe;"></i> Reload memory.json';
      renderKnowledgeGrid();
    });
  }

  if (syncGithubBtn) {
    syncGithubBtn.addEventListener('click', async () => {
      syncGithubBtn.disabled = true;
      syncGithubBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Syncing...';
      showToast('Fetching latest repositories from GitHub (rokeyaag)...');
      
      if (window.NeuralKnowledgeStore && typeof window.NeuralKnowledgeStore.syncFromGitHub === 'function') {
        const synced = await window.NeuralKnowledgeStore.syncFromGitHub();
        showToast(`Successfully synced ${synced.length} GitHub repositories to Neural Memory!`);
      }
      
      syncGithubBtn.disabled = false;
      syncGithubBtn.innerHTML = '<i class="fa-solid fa-arrows-rotate"></i> Sync GitHub';
      renderKnowledgeGrid();
    });
  }

  function renderKnowledgeGrid() {
    if (!cardsGrid) return;
    
    const customItems = [];
    try {
      const stored = localStorage.getItem('neural_bot_custom_kb');
      if (stored) customItems.push(...JSON.parse(stored));
    } catch(e) {}

    const webItems = (window.NeuralKnowledgeStore && typeof window.NeuralKnowledgeStore.getWebKnowledge === 'function')
      ? window.NeuralKnowledgeStore.getWebKnowledge()
      : [];

    const githubItems = [];
    try {
      const storedGh = localStorage.getItem('neural_bot_github_kb');
      if (storedGh) githubItems.push(...JSON.parse(storedGh));
    } catch(e) {}

    const learnedQAItems = (window.NeuralDialogueMemory && typeof window.NeuralDialogueMemory.getLearnedQA === 'function')
      ? window.NeuralDialogueMemory.getLearnedQA()
      : [];

    const fileItems = (window.NeuralKnowledgeStore && Array.isArray(window.NeuralKnowledgeStore.fileMemory))
      ? window.NeuralKnowledgeStore.fileMemory
      : [];

    const allItems = (window.NeuralKnowledgeStore && typeof window.NeuralKnowledgeStore.getAllKnowledge === 'function')
      ? window.NeuralKnowledgeStore.getAllKnowledge()
      : [...learnedQAItems, ...customItems, ...webItems, ...fileItems, ...githubItems];

    const githubCount = allItems.filter(i => i.category === 'github' || i.isGitHub).length;
    const customCount = allItems.filter(i => i.isCustom || i.category === 'custom').length;
    const webCount = allItems.filter(i => i.isWebIngested || i.category === 'web').length;
    const qaCount = allItems.filter(i => i.isLearnedQA || i.category === 'qa_memory').length;
    const fileCount = fileItems.length;

    if (countAll) countAll.textContent = String(allItems.length);
    if (countCustom) countCustom.textContent = String(customCount);
    if (countWeb) countWeb.textContent = String(webCount);
    if (countGithub) countGithub.textContent = String(githubCount);
    if (countQa) countQa.textContent = String(qaCount);
    if (countFile) countFile.textContent = String(fileCount);

    const countPdf = document.getElementById('kbCountPdf');
    if (window.NeuralPdfStore && typeof window.NeuralPdfStore.getPdfBooks === 'function') {
      window.NeuralPdfStore.getPdfBooks().then(books => {
        if (countPdf) countPdf.textContent = String(books.length);
      }).catch(() => {});
    }

    if (activeCategory === 'pdf') {
      if (window.NeuralPdfStore && typeof window.NeuralPdfStore.renderPdfBookCards === 'function') {
        window.NeuralPdfStore.renderPdfBookCards(cardsGrid);
        if (listStatus) listStatus.textContent = 'Showing full-book PDF Vector Stores (IndexedDB)';
        return;
      }
    }

    let filtered = allItems;
    if (activeCategory === 'file_memory') {
      filtered = filtered.filter((i) => i.isFileMemory || i.category === 'file_memory' || fileItems.some(f => f.id === i.id));
    } else if (activeCategory === 'custom') {
      filtered = filtered.filter((i) => i.isCustom || i.category === 'custom' || customItems.some(c => c.id === i.id));
    } else if (activeCategory === 'web') {
      filtered = filtered.filter((i) => i.isWebIngested || i.category === 'web' || webItems.some(w => w.id === i.id));
    } else if (activeCategory === 'github') {
      filtered = filtered.filter((i) => i.category === 'github' || i.isGitHub || githubItems.some(g => g.id === i.id));
    } else if (activeCategory === 'qa_memory') {
      filtered = filtered.filter((i) => i.isLearnedQA || i.category === 'qa_memory' || learnedQAItems.some(q => q.id === i.id));
    } else if (activeCategory !== 'all') {
      filtered = filtered.filter((i) => i.category === activeCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter((i) => {
        const titleMatch = (i.title || '').toLowerCase().includes(searchQuery);
        const allKws = [...(i.keywords_bn || []), ...(i.keywords_en || []), ...(i.keywords || [])];
        const kwMatch = allKws.some((k) => k.toLowerCase().includes(searchQuery));
        const allResps = [...(i.responses_bn || []), ...(i.responses_en || []), ...(i.responses || [])];
        const respMatch = allResps.some((r) => r.toLowerCase().includes(searchQuery));
        const qMatch = (i.questionText || '').toLowerCase().includes(searchQuery);
        const aMatch = (i.answerText || '').toLowerCase().includes(searchQuery);
        return titleMatch || kwMatch || respMatch || qMatch || aMatch;
      });
    }

    if (listStatus) {
      listStatus.textContent = `Showing ${filtered.length} active knowledge patterns (Category: ${activeCategory.toUpperCase()})`;
    }

    if (filtered.length === 0) {
      cardsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px 20px; color: var(--text-muted);">
          <i class="fa-solid fa-magnifying-glass" style="font-size: 2rem; color: var(--accent-cyan); margin-bottom: 12px; opacity: 0.5;"></i>
          <p>No matching knowledge patterns found for "${searchQuery || activeCategory}".</p>
          <button class="btn btn-secondary btn-sm" onclick="document.getElementById('knowledgeSearchClear')?.click()" style="margin-top: 10px;">
            Clear Search Filter
          </button>
        </div>
      `;
      return;
    }

    cardsGrid.innerHTML = filtered.map((item) => {
      const isFileItem = item.isFileMemory || fileItems.some(f => f.id === item.id);
      const isCustomItem = item.isCustom || customItems.some(c => c.id === item.id);
      const isWebItem = item.isWebIngested || item.category === 'web' || webItems.some(w => w.id === item.id);
      const isGhItem = item.category === 'github' || item.isGitHub;
      const isQaItem = item.isLearnedQA || item.category === 'qa_memory';
      const catBadgeText = (item.category || 'GENERAL').toUpperCase();
      
      const allKws = [...(item.keywords_bn || []), ...(item.keywords_en || []), ...(item.keywords || [])];
      const firstKeyword = (item.keywords_bn && item.keywords_bn[0]) || (item.keywords_en && item.keywords_en[0]) || (item.keywords && item.keywords[0]) || item.title;

      const bnResps = item.responses_bn || [];
      const enResps = item.responses_en || [];
      const customResps = item.responses || [];
      const totalCount = bnResps.length + enResps.length + customResps.length;

      return `
        <div class="kb-card" data-cat="${item.category}">
          <div class="kb-card-header">
            <h4 class="kb-card-title">${item.title}</h4>
            <span class="kb-card-cat-badge ${isFileItem ? 'file-memory' : (isQaItem ? 'qa' : (isWebItem ? 'web' : (isCustomItem ? 'custom' : (isGhItem ? 'github' : ''))))}" ${isFileItem ? 'style="background:rgba(0,242,254,0.15); color:#00f2fe; border:1px solid rgba(0,242,254,0.3);"' : (isWebItem ? 'style="background:rgba(0,242,254,0.15); color:#00f2fe; border:1px solid rgba(0,242,254,0.3);"' : '')}>
              ${isFileItem ? '<i class="fa-solid fa-file-code"></i> MEMORY.JSON' : (isQaItem ? '<i class="fa-solid fa-brain"></i> LEARNED Q&amp;A' : (isWebItem ? '<i class="fa-solid fa-globe"></i> WEB INGESTED' : (isCustomItem ? '<i class="fa-solid fa-database"></i> CUSTOM' : (isGhItem ? '<i class="fa-brands fa-github"></i> GITHUB' : catBadgeText))))}
            </span>
          </div>

          <div class="kb-card-keywords">
            ${allKws.slice(0, 5).map(kw => `<span class="kb-keyword-pill">${kw}</span>`).join('')}
            ${allKws.length > 5 ? `<span class="kb-keyword-pill">+${allKws.length - 5} more</span>` : ''}
          </div>

          <div class="kb-card-responses">
            ${isQaItem && item.questionText ? `<div class="kb-response-item" style="border-left-color:#8b5cf6;"><strong style="color:#8b5cf6;">Q:</strong> ${escapeHtml(item.questionText)}</div>` : ''}
            ${bnResps.map(r => `<div class="kb-response-item"><span style="display:inline-block; font-size:0.65rem; font-weight:700; color:#00f2fe; background:rgba(0,242,254,0.12); padding:1px 6px; border-radius:4px; margin-right:6px;">বাংলা</span>${r}</div>`).join('')}
            ${enResps.map(r => `<div class="kb-response-item"><span style="display:inline-block; font-size:0.65rem; font-weight:700; color:#8b5cf6; background:rgba(139,92,246,0.15); padding:1px 6px; border-radius:4px; margin-right:6px;">English</span>${r}</div>`).join('')}
            ${customResps.map(r => `<div class="kb-response-item">${r}</div>`).join('')}
          </div>

          <div class="kb-card-footer">
            <span class="kb-variation-count"><i class="fa-solid fa-shuffle"></i> ${totalCount} Variation${totalCount > 1 ? 's' : ''}</span>
            <div class="kb-card-actions">
              <button class="kb-action-btn try-prompt-btn" data-prompt="${firstKeyword}" title="Test this prompt in Chat">
                <i class="fa-solid fa-play"></i> Try Prompt
              </button>
              ${item.sourceUrl ? `
                <a href="${item.sourceUrl}" target="_blank" class="kb-action-btn" title="Open Source Webpage">
                  <i class="fa-solid fa-arrow-up-right-from-square"></i> Visit Link
                </a>
              ` : ''}
              ${item.homepageUrl ? `
                <a href="${item.homepageUrl}" target="_blank" class="kb-action-btn" title="Open Live Demo">
                  <i class="fa-solid fa-arrow-up-right-from-square"></i> Demo
                </a>
              ` : ''}
              ${item.repoUrl ? `
                <a href="${item.repoUrl}" target="_blank" class="kb-action-btn" title="View GitHub Code">
                  <i class="fa-brands fa-github"></i>
                </a>
              ` : ''}
              ${(isCustomItem || isQaItem || isWebItem) ? `
                <button class="kb-action-btn delete delete-kb-btn" data-id="${item.id}" data-type="${isQaItem ? 'qa' : (isWebItem ? 'web' : 'custom')}" title="Delete memory">
                  <i class="fa-solid fa-trash-can"></i>
                </button>
              ` : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');

    cardsGrid.querySelectorAll('.try-prompt-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const prompt = btn.getAttribute('data-prompt');
        if (prompt) {
          closeModal();
          const heroChatInput = document.getElementById('heroChatInput');
          if (heroChatInput) {
            heroChatInput.value = prompt;
          }
          const hero = document.getElementById('hero');
          if (hero) {
            hero.scrollIntoView({ behavior: 'smooth' });
          }
          setTimeout(() => {
            const sendBtn = document.getElementById('heroSendBtn');
            if (sendBtn) sendBtn.click();
          }, 350);
        }
      });
    });

    cardsGrid.querySelectorAll('.delete-kb-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const type = btn.getAttribute('data-type');
        if (id) {
          if (type === 'qa') {
            if (window.NeuralDialogueMemory && typeof window.NeuralDialogueMemory.deleteLearnedQA === 'function') {
              window.NeuralDialogueMemory.deleteLearnedQA(id);
              showToast('Learned Q&A memory deleted.');
              renderKnowledgeGrid();
            }
          } else if (type === 'web') {
            if (window.NeuralKnowledgeStore && typeof window.NeuralKnowledgeStore.deleteWebKnowledge === 'function') {
              window.NeuralKnowledgeStore.deleteWebKnowledge(id);
              showToast('Web Ingested knowledge deleted.');
              renderKnowledgeGrid();
            }
          } else {
            try {
              const stored = localStorage.getItem('neural_bot_custom_kb');
              let customList = stored ? JSON.parse(stored) : [];
              customList = customList.filter(c => c.id !== id);
              localStorage.setItem('neural_bot_custom_kb', JSON.stringify(customList));
              showToast('Custom knowledge entry deleted.');
              renderKnowledgeGrid();
            } catch(err) {
              console.error(err);
            }
          }
        }
      });
    });
  }

  window.refreshKnowledgeStoreUI = renderKnowledgeGrid;
  renderKnowledgeGrid();
}

/* ==========================================================================
   7. NEURAL MP3 MUSIC STUDIO & AUDIO ENGINE
   ========================================================================== */
function initNeuralMusicStudio() {
  const musicBackdrop = document.getElementById('musicModalBackdrop');
  const openMusicBtn = document.getElementById('openMusicModalBtn');
  const closeMusicBtn = document.getElementById('musicModalCloseBtn');
  const closeMusicFooterBtn = document.getElementById('closeMusicModalFooterBtn');

  const modalTrackTitle = document.getElementById('modalTrackTitle');
  const modalTrackArtist = document.getElementById('modalTrackArtist');
  const modalDiscIcon = document.getElementById('modalDiscIcon');
  const modalEqBars = document.getElementById('modalEqBars');
  const modalProgressBar = document.getElementById('modalProgressBar');
  const modalTimeCurrent = document.getElementById('modalTimeCurrent');
  const modalTimeDuration = document.getElementById('modalTimeDuration');
  const modalMainPlayBtn = document.getElementById('modalMainPlayBtn');
  const modalPlayIcon = document.getElementById('modalPlayIcon');
  const modalPrevTrackBtn = document.getElementById('modalPrevTrackBtn');
  const modalNextTrackBtn = document.getElementById('modalNextTrackBtn');
  const modalMuteBtn = document.getElementById('modalMuteBtn');
  const modalVolIcon = document.getElementById('modalVolIcon');
  const modalVolumeSlider = document.getElementById('modalVolumeSlider');
  const modalPlaylist = document.getElementById('modalPlaylist');

  const mp3DropZone = document.getElementById('mp3DropZone');
  const localMp3FileInput = document.getElementById('localMp3FileInput');
  const browseMp3Btn = document.getElementById('browseMp3Btn');

  const floatingMiniBar = document.getElementById('floatingMiniMusicBar');
  const miniDisc = document.getElementById('miniDisc');
  const miniTrackTitle = document.getElementById('miniTrackTitle');
  const miniTrackArtist = document.getElementById('miniTrackArtist');
  const miniPlayBtn = document.getElementById('miniPlayBtn');
  const miniPlayIcon = document.getElementById('miniPlayIcon');
  const miniCloseBtn = document.getElementById('miniCloseBtn');
  const miniMusicBarOpen = document.getElementById('miniMusicBarOpen');

  // Playlist State
  const defaultPlaylist = [
    {
      id: 'track_1',
      title: 'Neural Cyber Melody — Track 01',
      artist: 'Neural AI Synthesizer',
      src: 'audio/song.mp3',
      badge: 'BENGALI & CYBER AI'
    },
    {
      id: 'track_2',
      title: 'Deep Learning Lo-Fi Ambient Flow',
      artist: 'PyTorch Audio Engine',
      src: 'audio/neural_melody.wav',
      badge: 'HI-FI SYNTH'
    }
  ];

  let playlist = [...defaultPlaylist];
  let currentTrackIndex = 0;
  let isPlaying = false;
  let audioPlayer = new Audio();
  audioPlayer.volume = 0.85;

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, (m) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[m]));
  }

  function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  function updateTrackDisplay() {
    const track = playlist[currentTrackIndex];
    if (!track) return;

    if (modalTrackTitle) modalTrackTitle.textContent = track.title;
    if (modalTrackArtist) modalTrackArtist.textContent = `${track.artist} • ${track.src.split('/').pop()}`;
    if (miniTrackTitle) miniTrackTitle.textContent = track.title;
    if (miniTrackArtist) miniTrackArtist.textContent = track.artist;

    renderPlaylist();
  }

  function renderPlaylist() {
    if (!modalPlaylist) return;
    modalPlaylist.innerHTML = playlist.map((track, idx) => {
      const isCur = idx === currentTrackIndex;
      return `
        <div class="playlist-item ${isCur ? 'active' : ''}" data-index="${idx}">
          <div class="pi-left">
            <button class="pi-play-btn"><i class="fa-solid ${isCur && isPlaying ? 'fa-pause' : 'fa-play'}"></i></button>
            <div class="pi-meta">
              <strong>${escapeHtml(track.title)}</strong>
              <span>${escapeHtml(track.artist)} &bull; ${escapeHtml(track.src.split('/').pop())}</span>
            </div>
          </div>
          <span class="pi-badge">${escapeHtml(track.badge || 'MP3 SONG')}</span>
        </div>
      `;
    }).join('');

    modalPlaylist.querySelectorAll('.playlist-item').forEach((item) => {
      item.addEventListener('click', () => {
        const idx = parseInt(item.getAttribute('data-index'), 10);
        if (idx === currentTrackIndex && isPlaying) {
          pauseAudio();
        } else {
          loadTrack(idx, true);
        }
      });
    });
  }

  function loadTrack(index, autoPlay = true) {
    if (index < 0 || index >= playlist.length) return;
    currentTrackIndex = index;
    const track = playlist[currentTrackIndex];

    audioPlayer.src = track.src;
    audioPlayer.load();
    updateTrackDisplay();

    if (autoPlay) {
      playAudio();
    }
  }

  function playAudio() {
    const track = playlist[currentTrackIndex];
    if (!track) return;

    if (window.MediaCoordinator) {
      window.MediaCoordinator.pauseAllExcept('mp3');
    }

    if (!audioPlayer.src || audioPlayer.src === '' || audioPlayer.src.endsWith('/')) {
      audioPlayer.src = track.src;
    }

    const playPromise = audioPlayer.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        setPlayingState(true);
      }).catch((err) => {
        console.warn('Audio play request error:', err);
        setPlayingState(true);
      });
    }
  }

  function pauseAudio() {
    audioPlayer.pause();
    setPlayingState(false);
  }

  function togglePlay() {
    if (isPlaying) {
      pauseAudio();
    } else {
      playAudio();
    }
  }

  function setPlayingState(playing) {
    isPlaying = playing;

    // Disc spin animation
    if (modalDiscIcon) {
      modalDiscIcon.classList.toggle('spinning', isPlaying);
    }
    if (miniDisc) {
      miniDisc.classList.toggle('spinning', isPlaying);
    }

    // EQ bars animation
    if (modalEqBars) {
      modalEqBars.classList.toggle('active', isPlaying);
    }

    // Play/Pause Icons
    if (modalPlayIcon) {
      modalPlayIcon.className = isPlaying ? 'fa-solid fa-pause' : 'fa-solid fa-play';
    }
    if (miniPlayIcon) {
      miniPlayIcon.className = isPlaying ? 'fa-solid fa-pause' : 'fa-solid fa-play';
    }

    // Update all chat audio cards
    document.querySelectorAll('.chat-audio-card').forEach((card) => {
      const cardSrc = card.getAttribute('data-src');
      const cardPlayBtn = card.querySelector('.cac-play-btn i');
      const cardSpectrum = card.querySelector('.cac-spectrum');
      const isThisCard = !cardSrc || cardSrc === playlist[currentTrackIndex].src || cardSrc.endsWith(playlist[currentTrackIndex].src);
      if (cardPlayBtn) {
        cardPlayBtn.className = (isThisCard && isPlaying) ? 'fa-solid fa-pause' : 'fa-solid fa-play';
      }
      if (cardSpectrum) {
        cardSpectrum.classList.toggle('active', isThisCard && isPlaying);
      }
    });

    renderPlaylist();
  }

  // Audio Player Event Listeners
  audioPlayer.addEventListener('timeupdate', () => {
    if (!isNaN(audioPlayer.duration) && audioPlayer.duration > 0) {
      const pct = (audioPlayer.currentTime / audioPlayer.duration) * 100;
      if (modalProgressBar) modalProgressBar.value = pct;
      if (modalTimeCurrent) modalTimeCurrent.textContent = formatTime(audioPlayer.currentTime);
      if (modalTimeDuration) modalTimeDuration.textContent = formatTime(audioPlayer.duration);
    }
  });

  audioPlayer.addEventListener('loadedmetadata', () => {
    if (modalTimeDuration && !isNaN(audioPlayer.duration)) {
      modalTimeDuration.textContent = formatTime(audioPlayer.duration);
    }
  });

  audioPlayer.addEventListener('ended', () => {
    if (playlist.length > 1) {
      loadTrack((currentTrackIndex + 1) % playlist.length, true);
    } else {
      setPlayingState(false);
      if (modalProgressBar) modalProgressBar.value = 0;
      if (modalTimeCurrent) modalTimeCurrent.textContent = '0:00';
    }
  });

  if (modalProgressBar) {
    modalProgressBar.addEventListener('input', () => {
      if (!isNaN(audioPlayer.duration) && audioPlayer.duration > 0) {
        const seekTo = (modalProgressBar.value / 100) * audioPlayer.duration;
        audioPlayer.currentTime = seekTo;
      }
    });
  }

  if (modalMainPlayBtn) modalMainPlayBtn.addEventListener('click', togglePlay);
  if (miniPlayBtn) miniPlayBtn.addEventListener('click', togglePlay);

  if (modalPrevTrackBtn) {
    modalPrevTrackBtn.addEventListener('click', () => {
      const prevIdx = (currentTrackIndex - 1 + playlist.length) % playlist.length;
      loadTrack(prevIdx, true);
    });
  }

  if (modalNextTrackBtn) {
    modalNextTrackBtn.addEventListener('click', () => {
      const nextIdx = (currentTrackIndex + 1) % playlist.length;
      loadTrack(nextIdx, true);
    });
  }

  // Volume & Mute
  if (modalVolumeSlider) {
    modalVolumeSlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      audioPlayer.volume = val;
      audioPlayer.muted = (val === 0);
      updateVolIcon(val);
    });
  }

  function updateVolIcon(val) {
    if (!modalVolIcon) return;
    if (val === 0 || audioPlayer.muted) {
      modalVolIcon.className = 'fa-solid fa-volume-xmark';
    } else if (val < 0.5) {
      modalVolIcon.className = 'fa-solid fa-volume-low';
    } else {
      modalVolIcon.className = 'fa-solid fa-volume-high';
    }
  }

  if (modalMuteBtn) {
    modalMuteBtn.addEventListener('click', () => {
      audioPlayer.muted = !audioPlayer.muted;
      if (audioPlayer.muted) {
        if (modalVolIcon) modalVolIcon.className = 'fa-solid fa-volume-xmark';
      } else {
        updateVolIcon(audioPlayer.volume);
      }
    });
  }

  // --- LOCAL USER MP3 FILE PICKER & DRAG/DROP ---
  function handleUserAudioFile(file) {
    if (!file) return;
    if (!file.type.includes('audio') && !file.name.match(/\.(mp3|wav|ogg|m4a|aac)$/i)) {
      if (typeof showToast === 'function') showToast('Please select a valid .mp3 or .wav audio file!');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const newTrack = {
      id: `custom_${Date.now()}`,
      title: file.name.replace(/\.[^/.]+$/, ''),
      artist: 'Custom User Track',
      src: objectUrl,
      badge: 'LOCAL MP3'
    };

    playlist.unshift(newTrack);
    loadTrack(0, true);
    if (typeof showToast === 'function') {
      showToast(`🎵 Loaded & Playing: ${newTrack.title}`);
    }
  }

  if (browseMp3Btn && localMp3FileInput) {
    browseMp3Btn.addEventListener('click', () => localMp3FileInput.click());
  }

  if (localMp3FileInput) {
    localMp3FileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        handleUserAudioFile(e.target.files[0]);
      }
    });
  }

  if (mp3DropZone) {
    mp3DropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      mp3DropZone.classList.add('drag-active');
    });

    mp3DropZone.addEventListener('dragleave', () => {
      mp3DropZone.classList.remove('drag-active');
    });

    mp3DropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      mp3DropZone.classList.remove('drag-active');
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleUserAudioFile(e.dataTransfer.files[0]);
      }
    });
  }

  // --- MODAL CONTROLS ---
  function openStudio() {
    if (musicBackdrop) {
      musicBackdrop.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeStudio() {
    if (musicBackdrop) {
      musicBackdrop.classList.remove('active');
      document.body.style.overflow = '';
    }
    if (ytMainIframe && ytMainIframe.contentWindow) {
      try {
        ytMainIframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
      } catch (e) {}
    }
  }

  if (openMusicBtn) openMusicBtn.addEventListener('click', openStudio);
  if (closeMusicBtn) closeMusicBtn.addEventListener('click', closeStudio);
  if (closeMusicFooterBtn) closeMusicFooterBtn.addEventListener('click', closeStudio);

  if (musicBackdrop) {
    musicBackdrop.addEventListener('click', (e) => {
      if (e.target === musicBackdrop) closeStudio();
    });
  }

  if (miniMusicBarOpen) {
    miniMusicBarOpen.addEventListener('click', openStudio);
  }

  if (miniCloseBtn) {
    miniCloseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      pauseAudio();
      if (floatingMiniBar) floatingMiniBar.style.display = 'none';
    });
  }

  // --- GLOBAL CHAT AUDIO CARD PLAY DELEGATION ---
  document.addEventListener('click', (e) => {
    const playBtn = e.target.closest('.cac-play-btn');
    if (playBtn) {
      const card = playBtn.closest('.chat-audio-card');
      if (card) {
        const src = card.getAttribute('data-src') || 'audio/song.mp3';
        const title = card.getAttribute('data-title') || 'Neural AI Melody';
        
        let foundIdx = playlist.findIndex(t => t.src === src || t.title === title);
        if (foundIdx === -1) {
          playlist.push({
            id: `card_${Date.now()}`,
            title: title,
            artist: card.getAttribute('data-artist') || 'Neural AI',
            src: src,
            badge: 'AI MELODY'
          });
          foundIdx = playlist.length - 1;
        }

        if (foundIdx === currentTrackIndex && isPlaying) {
          pauseAudio();
        } else {
          loadTrack(foundIdx, true);
        }
      }
      return;
    }

    const studioLink = e.target.closest('.cac-studio-link');
    if (studioLink) {
      openStudio();
    }
  });

  // --- YOUTUBE STREAMER & TAB SWITCHER LOGIC ---
  const tabLocalMp3Btn = document.getElementById('tabLocalMp3Btn');
  const tabYoutubeStreamBtn = document.getElementById('tabYoutubeStreamBtn');
  const localMp3View = document.getElementById('localMp3View');
  const youtubeStreamView = document.getElementById('youtubeStreamView');

  const ytSongInput = document.getElementById('ytSongInput');
  const ytPlaySubmitBtn = document.getElementById('ytPlaySubmitBtn');
  const ytPlayingTitle = document.getElementById('ytPlayingTitle');
  const ytMainIframe = document.getElementById('ytMainIframe');

  function switchStudioTab(tab) {
    if (tab === 'youtube') {
      if (tabYoutubeStreamBtn) tabYoutubeStreamBtn.classList.add('active');
      if (tabLocalMp3Btn) tabLocalMp3Btn.classList.remove('active');
      if (youtubeStreamView) youtubeStreamView.style.display = 'flex';
      if (localMp3View) localMp3View.style.display = 'none';
      // Pause local audio when switching to YouTube
      if (isPlaying) pauseAudio();
    } else {
      if (tabLocalMp3Btn) tabLocalMp3Btn.classList.add('active');
      if (tabYoutubeStreamBtn) tabYoutubeStreamBtn.classList.remove('active');
      if (localMp3View) localMp3View.style.display = 'flex';
      if (youtubeStreamView) youtubeStreamView.style.display = 'none';
      // Pause YouTube streamer when switching to Local MP3
      if (ytMainIframe && ytMainIframe.contentWindow) {
        try {
          ytMainIframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
        } catch (e) {}
      }
    }
  }

  if (tabLocalMp3Btn) tabLocalMp3Btn.addEventListener('click', () => switchStudioTab('local'));
  if (tabYoutubeStreamBtn) tabYoutubeStreamBtn.addEventListener('click', () => switchStudioTab('youtube'));

  function playYoutubeId(vidId, title) {
    if (!vidId || !ytMainIframe) return;
    if (window.MediaCoordinator) {
      window.MediaCoordinator.pauseAllExcept('youtube');
    }
    switchStudioTab('youtube');
    ytMainIframe.src = `https://www.youtube-nocookie.com/embed/${vidId}?autoplay=1&enablejsapi=1`;
    if (ytPlayingTitle) ytPlayingTitle.textContent = title || 'Custom YouTube Track';
    if (typeof showToast === 'function') {
      showToast(`🎬 Now Streaming on YouTube: ${title || 'Song'}`);
    }
  }

  function handleYoutubeSubmit() {
    if (!ytSongInput) return;
    const query = ytSongInput.value.trim();
    if (!query) return;

    // Check if it's a direct YouTube link
    const ytMatch = query.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
    if (ytMatch && ytMatch[1]) {
      playYoutubeId(ytMatch[1], 'Custom YouTube Stream');
    } else {
      // Encode as a YouTube search or play via embedded search query
      const searchTitle = query;
      // Default fallback popular Hindi / Global song IDs for common terms
      const qLower = query.toLowerCase();
      let selectedId = '2Vv-BfVoq4g'; // Tum Hi Ho default
      if (qLower.includes('kesariya')) selectedId = 'BddP6PYo2gs';
      else if (qLower.includes('raataan') || qLower.includes('lambiyan')) selectedId = 'gvyUuxdRdR4';
      else if (qLower.includes('pasoori')) selectedId = '5Eqb_-j3FDA';
      else if (qLower.includes('despacito')) selectedId = 'kJQP7kiw5Fk';
      else if (qLower.includes('lofi') || qLower.includes('lo-fi')) selectedId = 'jfKfPfyJRdk';
      else if (qLower.includes('arijit')) selectedId = '2Vv-BfVoq4g';

      playYoutubeId(selectedId, `${searchTitle}`);
    }
    ytSongInput.value = '';
  }

  if (ytPlaySubmitBtn) ytPlaySubmitBtn.addEventListener('click', handleYoutubeSubmit);
  if (ytSongInput) {
    ytSongInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleYoutubeSubmit();
      }
    });
  }

  // Preset YouTube chips
  document.querySelectorAll('.yt-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      const vidId = chip.getAttribute('data-yt-id');
      const title = chip.getAttribute('data-yt-title');
      if (vidId) {
        playYoutubeId(vidId, title);
      }
    });
  });

  // Export Global API
  window.openMusicStudioModal = openStudio;
  window.closeMusicStudioModal = closeStudio;
  window.openYoutubeTrack = (vidId, title) => {
    openStudio();
    playYoutubeId(vidId, title);
  };

  window.NeuralAudioEngine = {
    play: playAudio,
    pause: pauseAudio,
    toggle: togglePlay,
    loadTrack,
    playYoutube: playYoutubeId,
    addTrack: (track) => {
      playlist.push(track);
      renderPlaylist();
    }
  };

  // Initial render
  updateTrackDisplay();
  loadTrack(0, false);
}

/* ==========================================================================
   8. USER AUTH & SITE LOGIN PROFILE SYSTEM
   ========================================================================== */
function initUserAuthSystem() {
  const authBtn = document.getElementById('userAuthHeaderBtn');
  const authBackdrop = document.getElementById('userAuthModalBackdrop');
  const authCloseBtn = document.getElementById('userAuthCloseBtn');
  const authSaveBtn = document.getElementById('userAuthSaveBtn');
  const authLogoutBtn = document.getElementById('userAuthLogoutBtn');
  const inputName = document.getElementById('userAuthInputName');
  const inputCity = document.getElementById('userAuthInputCity');
  const authForm = document.getElementById('userAuthForm');

  if (authBtn) authBtn.addEventListener('click', openUserAuthModal);
  if (authCloseBtn) authCloseBtn.addEventListener('click', closeUserAuthModal);
  if (authBackdrop) authBackdrop.addEventListener('click', closeUserAuthModal);
  if (authSaveBtn) authSaveBtn.addEventListener('click', saveUserAuth);
  if (authLogoutBtn) authLogoutBtn.addEventListener('click', logoutUserAuth);

  if (authForm) {
    authForm.addEventListener('submit', (e) => {
      e.preventDefault();
      saveUserAuth();
    });
  }

  [inputName, inputCity].forEach((input) => {
    if (input && typeof input.addEventListener === 'function') {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          saveUserAuth();
        }
      });
    }
  });

  // Initial Sync on Page Load
  syncUserAuthUI();
  if (window.NeuralAIEngine && typeof window.NeuralAIEngine.syncUI === 'function') {
    window.NeuralAIEngine.syncUI();
  }
}

