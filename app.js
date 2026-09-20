/**
 * NEURAL CHAT BOT & AI PORTFOLIO — APP JAVASCRIPT
 * Real-time Voice Recognition, Text-to-Speech, Neural Chatbot, & Dynamic UI
 */

var globalAvatarController = null;

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
  const avatarStageView = document.getElementById('avatarStageView');
  const avatarRepeatBtn = document.getElementById('avatarRepeatBtn');
  const stageFooterTitle = document.getElementById('stageFooterTitle');
  const stageFooterSubtitle = document.getElementById('stageFooterSubtitle');
  const avatarStatusPill = document.getElementById('avatarStatusPill');
  const avatarStatusLabel = document.getElementById('avatarStatusLabel');

  function switchToAvatar() {
    const savedScrollY = window.pageYOffset || (document.documentElement && document.documentElement.scrollTop) || window.scrollY || 0;

    if (tabAvatarBtn) tabAvatarBtn.classList.add('active');
    if (tabVideoBtn) tabVideoBtn.classList.remove('active');
    if (avatarStageView) avatarStageView.style.display = 'flex';
    if (videoContainer) videoContainer.style.display = 'none';
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

    if (video && !video.paused) {
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
    if (avatarStageView) avatarStageView.style.display = 'none';
    if (videoContainer) videoContainer.style.display = 'flex';
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

  if (tabAvatarBtn) tabAvatarBtn.addEventListener('click', switchToAvatar);
  if (tabVideoBtn) tabVideoBtn.addEventListener('click', switchToVideo);

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

  // Set default initial view to Video and trigger Auto Play
  switchToVideo();
  attemptAutoPlay();
}

/* ==========================================================================
   4. NEURAL TALKING AVATAR CONTROLLER & LIP-SYNC ENGINE
   ========================================================================== */
function initNeuralAvatarController(switchToAvatarCallback) {
  const stageContainer = document.getElementById('avatarStageView');
  const imgIdle = document.getElementById('avatarImgIdle');
  const imgThinking = document.getElementById('avatarImgThinking');
  const imgSpeaking = document.getElementById('avatarImgSpeaking');
  const statusPill = document.getElementById('avatarStatusPill');
  const statusLabel = document.getElementById('avatarStatusLabel');
  const subtitlesText = document.getElementById('avatarSubtitlesText');
  const repeatBtn = document.getElementById('avatarRepeatBtn');
  const canvas = document.getElementById('avatarCanvas');

  let mouthInterval = null;
  let lastSpokenText = 'Welcome! I am NeuralBot. How can I assist you with deep learning or this project today?';
  let isSpeaking = false;

  function setIdle() {
    isSpeaking = false;
    if (mouthInterval) clearInterval(mouthInterval);
    mouthInterval = null;

    if (stageContainer) {
      stageContainer.classList.remove('talking', 'thinking', 'listening');
    }
    if (imgIdle) {
      imgIdle.classList.add('active');
      imgIdle.style.opacity = '1';
    }
    if (imgThinking) {
      imgThinking.classList.remove('active');
      imgThinking.style.opacity = '0';
    }
    if (imgSpeaking) {
      imgSpeaking.classList.remove('active');
      imgSpeaking.style.opacity = '0';
    }

    if (statusPill) {
      statusPill.className = 'avatar-status-pill';
      if (statusLabel) statusLabel.textContent = 'AI Online';
    }
  }

  function setListening() {
    if (switchToAvatarCallback) switchToAvatarCallback();
    isSpeaking = false;
    if (mouthInterval) clearInterval(mouthInterval);

    if (stageContainer) {
      stageContainer.classList.remove('talking', 'thinking');
      stageContainer.classList.add('listening');
    }
    if (imgIdle) {
      imgIdle.classList.add('active');
      imgIdle.style.opacity = '1';
    }
    if (imgThinking) {
      imgThinking.classList.remove('active');
      imgThinking.style.opacity = '0';
    }
    if (imgSpeaking) {
      imgSpeaking.classList.remove('active');
      imgSpeaking.style.opacity = '0';
    }

    if (statusPill) {
      statusPill.className = 'avatar-status-pill listening';
      if (statusLabel) statusLabel.textContent = 'Listening...';
    }
    if (subtitlesText) {
      subtitlesText.innerHTML = '<i class="fa-solid fa-microphone-lines"></i> <em>Listening to your voice... Speak now...</em>';
    }
  }

  function setThinking() {
    if (switchToAvatarCallback) switchToAvatarCallback();
    isSpeaking = false;
    if (mouthInterval) clearInterval(mouthInterval);

    if (stageContainer) {
      stageContainer.classList.remove('talking', 'listening');
      stageContainer.classList.add('thinking');
    }
    if (imgIdle) {
      imgIdle.classList.add('active');
      imgIdle.style.opacity = '1';
    }
    if (imgThinking) {
      imgThinking.classList.add('active');
      imgThinking.style.opacity = '0.75';
    }
    if (imgSpeaking) {
      imgSpeaking.classList.remove('active');
      imgSpeaking.style.opacity = '0';
    }

    if (statusPill) {
      statusPill.className = 'avatar-status-pill thinking';
      if (statusLabel) statusLabel.textContent = 'Neural Computing...';
    }
    if (subtitlesText) {
      subtitlesText.innerHTML = '<i class="fa-solid fa-bolt"></i> <em>Processing tensor calculation...</em>';
    }
  }

  function startSpeaking(text) {
    if (switchToAvatarCallback) switchToAvatarCallback();
    isSpeaking = true;
    lastSpokenText = text;

    if (stageContainer) {
      stageContainer.classList.remove('thinking', 'listening');
      stageContainer.classList.add('talking');
    }
    if (imgIdle) {
      imgIdle.classList.add('active');
      imgIdle.style.opacity = '1';
    }
    if (imgThinking) {
      imgThinking.classList.remove('active');
      imgThinking.style.opacity = '0';
    }

    if (statusPill) {
      statusPill.className = 'avatar-status-pill speaking';
      if (statusLabel) statusLabel.textContent = 'Speaking...';
    }

    if (subtitlesText) {
      subtitlesText.textContent = text;
    }

    // Natural smooth speaking mouth expression:
    if (mouthInterval) clearInterval(mouthInterval);
    if (imgSpeaking) {
      imgSpeaking.classList.add('active');
      imgSpeaking.style.opacity = '0.9';
    }

    // Realistic syllable cadence synchronized with speech pace (140ms)
    const mouthCadence = [
      { opacity: 0.95, scaleY: 1.04 },
      { opacity: 0.35, scaleY: 0.98 },
      { opacity: 0.85, scaleY: 1.02 },
      { opacity: 0.1,  scaleY: 0.99 },
      { opacity: 0.92, scaleY: 1.05 },
      { opacity: 0.5,  scaleY: 1.01 },
      { opacity: 0.15, scaleY: 0.98 },
      { opacity: 0.88, scaleY: 1.03 }
    ];
    let cadenceIndex = 0;

    mouthInterval = setInterval(() => {
      if (!isSpeaking) {
        clearInterval(mouthInterval);
        mouthInterval = null;
        if (imgSpeaking) {
          imgSpeaking.style.opacity = '0';
          imgSpeaking.style.transform = 'scale(1, 1)';
        }
        return;
      }
      cadenceIndex = (cadenceIndex + 1) % mouthCadence.length;
      const step = mouthCadence[cadenceIndex];
      if (imgSpeaking) {
        imgSpeaking.style.opacity = String(step.opacity);
        imgSpeaking.style.transform = `scale(1, ${step.scaleY})`;
      }
    }, 140);
  }

  function triggerWordSyllable() {
    if (!isSpeaking || !imgSpeaking) return;
    imgSpeaking.style.opacity = '1';
    imgSpeaking.style.transform = 'scale(1.01, 1.05)';
  }

  function stopSpeaking() {
    setIdle();
  }

  if (repeatBtn) {
    repeatBtn.addEventListener('click', () => {
      if (window.globalSpeakResponse && lastSpokenText) {
        window.globalSpeakResponse(lastSpokenText);
      }
    });
  }

  // Set initial idle state
  setIdle();

  // Export controller API
  globalAvatarController = {
    setIdle,
    setListening,
    setThinking,
    startSpeaking,
    triggerWordSyllable,
    stopSpeaking,
    switchToAvatarView: switchToAvatarCallback,
    getLastSpokenText: () => lastSpokenText
  };
}

/* ==========================================================================
   5. VOICE & TEXT AI INTELLIGENCE ENGINE
   ========================================================================== */
function initVoiceAndChatEngine() {
  // Global Voice Output State
  let isVoiceOutputEnabled = true;
  let activeUtterance = null;
  let speechFallbackTimer = null;

  // --- Voice Synthesis Voices Cache & Selection (Loud & Clear Audio) ---
  let availableVoices = [];
  function loadVoices() {
    if ('speechSynthesis' in window) {
      availableVoices = window.speechSynthesis.getVoices() || [];
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
      const bn = availableVoices.find(
        (v) => (v.lang && (v.lang.startsWith('bn') || v.lang.includes('Bengali') || v.lang.includes('Bangla'))) ||
               (v.name && (v.name.includes('Bangla') || v.name.includes('Bengali') || v.name.includes('bn-')))
      );
      if (bn) return bn;
    } else {
      // Find high-definition, clear English voice (Natural, Google US/UK, Microsoft Jenny/Guy/Zira/David)
      const en = availableVoices.find(
        (v) => v.lang && (v.lang === 'en-US' || v.lang === 'en-GB' || v.lang.startsWith('en')) &&
               (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Jenny') || v.name.includes('Guy') || v.name.includes('Zira') || v.name.includes('David') || v.name.includes('Samantha'))
      ) || availableVoices.find((v) => v.lang && (v.lang === 'en-US' || v.lang === 'en-GB' || v.lang.startsWith('en')));
      if (en) return en;
    }
    return null;
  }

  // --- LANGUAGE DETECTION HELPER ---
  function isBengaliQuery(text) {
    if (!text) return false;
    // Check Bengali Unicode script range [\u0980-\u09FF]
    if (/[\u0980-\u09FF]/.test(text)) return true;
    
    // Check common Romanized Bengali (Banglish) keywords
    const banglishTokens = [
      'kemon', 'acho', 'achen', 'asos', 'obosta', 'obostha', 'khobor', 'valo', 'bhalo',
      'korcho', 'koro', 'koros', 'tumi', 'apni', 'amake', 'amra', 'tomar', 'apnar',
      'naam', 'nam', 'ke', 'toiri', 'banise', 'banayse', 'banieche', 'gaan', 'gan',
      'shunao', 'sunao', 'gao', 'gaite', 'koutuk', 'hasir', 'dhonnobad', 'shubho',
      'shuvo', 'sokal', 'shondha', 'ratri', 'ki', 'kivabe', 'konta', 'bolun', 'bolo'
    ];
    const words = text.toLowerCase().replace(/[?!.,;:()]/g, ' ').split(/\s+/);
    return words.some(w => banglishTokens.includes(w));
  }

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
        keywords_en: ['can you sing a song', 'sing a song', 'sing for me', 'sing', 'song', 'sing something', 'sing a melody'],
        keywords_bn: ['গান গাও', 'গান শোনাও', 'গান গাইতে পারো', 'একটি গান গাও', 'গান জানো', 'গান শুনাও', 'gaan gao', 'gaan sunao', 'ekta gaan gao', 'gaan gaite paro', 'gan gao', 'gan shunao'],
        responses_en: [
          "🎶 <em>\"Through the neural layers deep and wide, data streams like a river tide... 0 and 1 dancing through the night, AI glowing bright!\"</em> ✨ Hope you enjoyed my digital tune!",
          "🎤 <em>\"Tensors flowing, loss is low, PyTorch models stealing the show! Synapses humming a melody fine, learning deeper all the time!\"</em> 🎵"
        ],
        responses_bn: [
          "🎵 <em>\"ধনধান্য পুষ্পভরা আমাদের এই বসুন্ধরা, তাহার মাঝে আছে দেশ এক সকল দেশের সেরা...\"</em> 🎶<br>আমি রোবট হলেও বাংলা গানের সুর আমার নিউরাল কোরে অনুধাবন করতে পারি! 🎤",
          "🎶 <em>\"গ্রাম ছাড়া ওই রাঙা মাটির পথ, আমার মন ভুলায় রে...\"</em> 🎵<br>গানটি আপনার কেমন লাগলো?",
          "🎤 ডিজিটাল সুরের একটি গান:<br><em>\"বাইনারি আর টেন্সরে গড়া নিউরাল সুরের গান, তোমার সাথে কথা বলে জুড়ায় আমার প্রাণ!\"</em> 🎶"
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
      const custom = this.getCustomKnowledge();
      return [...custom, ...this.defaultStore];
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

  // --- SMART INTENT & TOKEN MATCHER WITH STRICT BILINGUAL ACCURACY ---
  function getSmartResponse(userText) {
    if (!userText || !userText.trim()) {
      return "I'm listening! Please type or speak your question.";
    }

    const rawText = userText.trim();
    const cleanText = rawText.toLowerCase().replace(/[?!.,;:()]/g, ' ').replace(/\s+/g, ' ').trim();
    const isBengali = isBengaliQuery(userText);
    const queryTokens = cleanText.split(' ').filter(t => t.length > 0);

    const allKnowledge = NeuralKnowledgeStore.getAllKnowledge();
    let bestMatch = null;
    let highestScore = 0;

    for (const item of allKnowledge) {
      let score = 0;
      
      // Select keyword list based on language
      const keywords = isBengali 
        ? [...(item.keywords_bn || []), ...(item.keywords || []), ...(item.keywords_en || [])]
        : [...(item.keywords_en || []), ...(item.keywords || []), ...(item.keywords_bn || [])];

      for (const kw of keywords) {
        const cleanKw = kw.toLowerCase().trim();
        const isBnKw = (item.keywords_bn || []).includes(kw) || /[\u0980-\u09FF]/.test(kw);

        // Exact match
        if (cleanText === cleanKw) {
          score += ((isBengali && isBnKw) || (!isBengali && !isBnKw)) ? 140 : 70;
          break;
        }

        // Substring / Phrase match
        if (cleanText.includes(cleanKw)) {
          score += (cleanKw.length * 3) + ((isBengali && isBnKw) ? 35 : 15);
        } else {
          // Token overlap matching
          const kwTokens = cleanKw.split(' ').filter(t => t.length > 0);
          let tokenMatches = 0;
          for (const kt of kwTokens) {
            if (queryTokens.includes(kt)) {
              tokenMatches++;
            }
          }
          if (tokenMatches > 0) {
            const overlap = (tokenMatches / kwTokens.length) * ((isBengali && isBnKw) ? 30 : 15);
            score = Math.max(score, overlap);
          }
        }
      }

      if (score > highestScore) {
        highestScore = score;
        bestMatch = item;
      }
    }

    // Match found with confident score
    if (bestMatch && highestScore >= 10) {
      return NeuralKnowledgeStore.getRandomResponse(bestMatch, isBengali);
    }

    // Intelligent context-aware Fallback strictly in matching language
    if (isBengali) {
      const bnFallbacks = [
        "আপনার প্রশ্নটি আমি বুঝতে চেষ্টা করছি। আপনি ক্রিয়েটর লুৎফর রহমান, ডিপ লার্নিং মডেল, ডেমো ভিডিও বা প্রজেক্ট সম্পর্কিত প্রশ্ন করতে পারেন! 😊",
        "দারুণ প্রশ্ন! আপনি চাইলে 'কেমন আছো', 'গান শোনাও', বা 'পাইটর্চ আর্কিটেকচার' সম্পর্কে জানতে চাইতে পারেন।",
        "আমি আপনার প্রশ্নটি প্রসেস করেছি। অনুগ্রহ করে মডেল আর্কিটেকচার, ডেমো ভিডিও বা ক্রিয়েটর সম্পর্কে জিজ্ঞাসা করুন!"
      ];
      return bnFallbacks[Math.floor(Math.random() * bnFallbacks.length)];
    } else {
      const enFallbacks = [
        "Query processed! Feel free to ask about well-being, our PyTorch AI model, creator Lutfor Rahman, or request a song or joke!",
        "Interesting query! To explore further, ask me about 'How are you?', 'Can you sing a song?', 'PyTorch architecture', or 'Who created you?' 😊",
        "I'm continuously learning! Feel free to ask about our deep learning pipeline, demo video, or developer Lutfor Rahman."
      ];
      return enFallbacks[Math.floor(Math.random() * enFallbacks.length)];
    }
  }

  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, (m) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[m]));
  }

  function getSpokenCleanText(html) {
    // Replace code blocks with a clean voice phrase so it speaks fluently
    let clean = html.replace(/<pre[\s\S]*?<\/pre>/gi, ' Here is the PyTorch code snippet. ');
    const tmp = document.createElement('DIV');
    tmp.innerHTML = clean;
    let text = tmp.textContent || tmp.innerText || '';
    return text.replace(/\s+/g, ' ').trim();
  }

  // --- Text to Speech (TTS) & Talking Avatar Sync (Loud & Clear Voice) ---
  function speakText(text) {
    if (speechFallbackTimer) clearTimeout(speechFallbackTimer);

    const spokenText = getSpokenCleanText(text);

    // If voice output is disabled or speech synthesis not supported, still animate avatar for reading duration
    if (!isVoiceOutputEnabled || !('speechSynthesis' in window)) {
      if (globalAvatarController) {
        globalAvatarController.startSpeaking(spokenText);
        const duration = Math.min(Math.max(spokenText.length * 60, 1800), 7000);
        setTimeout(() => {
          if (globalAvatarController) globalAvatarController.stopSpeaking();
        }, duration);
      }
      return;
    }

    window.speechSynthesis.cancel(); // Cancel any previous speech

    const utterance = new SpeechSynthesisUtterance(spokenText);
    activeUtterance = utterance;

    // Loud & Clear Audio Tuning
    utterance.volume = 1.0; // Maximum 100% volume
    utterance.rate = 1.0;   // Clear natural cadence
    utterance.pitch = 1.0;  // Natural crisp pitch

    // Detect Bengali vs English for accurate pronunciation
    const hasBengali = /[\u0980-\u09FF]/.test(spokenText);
    if (hasBengali) {
      utterance.lang = 'bn-BD';
    } else {
      utterance.lang = 'en-US';
    }

    const selectedVoice = getBestVoice(hasBengali);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onstart = () => {
      if (globalAvatarController) {
        globalAvatarController.startSpeaking(spokenText);
      }
    };

    utterance.onboundary = () => {
      if (globalAvatarController && typeof globalAvatarController.triggerWordSyllable === 'function') {
        globalAvatarController.triggerWordSyllable();
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

    // Calculate approximate duration as safety fallback
    const estimatedDuration = Math.min(Math.max(spokenText.length * 85, 2000), 14000);
    speechFallbackTimer = setTimeout(() => {
      if (globalAvatarController && (!window.speechSynthesis.speaking || !activeUtterance)) {
        globalAvatarController.stopSpeaking();
      }
    }, estimatedDuration);

    window.speechSynthesis.speak(utterance);
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
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
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

  let currentVoiceLang = 'en-US'; // Default English with 1-click Bangla toggle
  let recognition = null;
  let isRecording = false;

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  function updateVoiceLanguage(lang) {
    currentVoiceLang = lang;
    if (recognition) {
      recognition.lang = lang;
    }
    if (voiceLangLabel) {
      voiceLangLabel.textContent = lang === 'bn-BD' ? 'বাংলা' : 'EN';
    }
    if (voiceStatusText) {
      voiceStatusText.innerHTML = `<i class="fa-solid fa-circle-dot"></i> Mic: ${lang === 'bn-BD' ? 'Bangla' : 'English'}`;
    }
  }

  if (voiceLangToggleBtn) {
    voiceLangToggleBtn.addEventListener('click', () => {
      const nextLang = currentVoiceLang === 'en-US' ? 'bn-BD' : 'en-US';
      updateVoiceLanguage(nextLang);
    });
  }

  if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = currentVoiceLang;

    recognition.onstart = () => {
      isRecording = true;
      if (voiceMicBtn) voiceMicBtn.classList.add('recording');
      if (voiceWaveBar) voiceWaveBar.style.display = 'flex';
      if (voiceStatusText) {
        voiceStatusText.innerHTML = `<i class="fa-solid fa-circle-dot" style="color:var(--accent-red);"></i> Listening (${currentVoiceLang === 'bn-BD' ? 'Bangla' : 'English'})...`;
      }
      if (globalAvatarController) globalAvatarController.setListening();
    };

    recognition.onresult = (event) => {
      let speechTranscript = '';
      if (event.results && event.results[0] && event.results[0][0]) {
        speechTranscript = event.results[0][0].transcript;
      }
      stopVoiceRecording();
      try { recognition.stop(); } catch (e) {}

      if (speechTranscript && speechTranscript.trim()) {
        if (heroChatInput) {
          heroChatInput.value = speechTranscript;
        }
        // Auto trigger AI response and avatar speech
        handleHeroSend(speechTranscript);
      }
    };

    recognition.onerror = (event) => {
      console.warn('Speech Recognition error:', event.error);
      stopVoiceRecording();
      if (voiceStatusText) {
        if (event.error === 'not-allowed') {
          voiceStatusText.innerHTML = '<i class="fa-solid fa-triangle-exclamation" style="color:#ffbd2e;"></i> Mic permission needed';
        } else {
          voiceStatusText.innerHTML = '<i class="fa-solid fa-circle-dot"></i> Mic Ready &bull; Click to speak';
        }
      }
      if (globalAvatarController) globalAvatarController.setIdle();
    };

    recognition.onend = () => {
      stopVoiceRecording();
    };
  }

  function startVoiceRecording() {
    if (!recognition) {
      alert('Speech Recognition is supported in Google Chrome and Microsoft Edge. Please use Chrome or Edge for voice chatting.');
      return;
    }
    // Cancel prior speech output so microphone receives clear input
    if ('speechSynthesis' in window) {
      try { window.speechSynthesis.cancel(); } catch(e) {}
    }
    if (globalAvatarController) {
      globalAvatarController.stopSpeaking();
    }

    try {
      recognition.lang = currentVoiceLang;
      recognition.start();
    } catch (e) {
      console.warn('Recognition restart attempt:', e);
      try {
        recognition.stop();
        setTimeout(() => {
          recognition.lang = currentVoiceLang;
          recognition.start();
        }, 120);
      } catch (err) {
        console.error(err);
      }
    }
  }

  function stopVoiceRecording() {
    isRecording = false;
    if (voiceMicBtn) voiceMicBtn.classList.remove('recording');
    if (voiceWaveBar) voiceWaveBar.style.display = 'none';
    if (voiceStatusText) {
      voiceStatusText.innerHTML = `<i class="fa-solid fa-circle-dot"></i> Mic Active (${currentVoiceLang === 'bn-BD' ? 'Bangla' : 'English'})`;
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

  function handleHeroSend(userText) {
    if (!userText || !userText.trim()) return;
    const currentWindowY = window.pageYOffset || document.documentElement.scrollTop || window.scrollY || 0;

    if (heroChatInput) {
      heroChatInput.value = '';
    }

    appendMessageToHero(escapeHtml(userText), false);

    // Switch avatar to thinking state with synaptic firing
    if (globalAvatarController) {
      globalAvatarController.setThinking();
    }

    const typingElem = showHeroTypingIndicator();
    const delay = Math.min(Math.max(userText.length * 18, 500), 1100);

    setTimeout(() => {
      if (typingElem) typingElem.remove();
      const response = getSmartResponse(userText);
      appendMessageToHero(response, true);
      // Trigger speaking voice & avatar talking mouth movement
      speakText(response);
    }, delay);

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
      if (action === 'open-kb') {
        if (typeof window.openKnowledgeStoreModal === 'function') {
          window.openKnowledgeStoreModal();
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

    setTimeout(() => {
      indicator.remove();
      const response = getSmartResponse(userText);
      const botMsg = document.createElement('div');
      botMsg.className = 'chat-message bot';
      botMsg.innerHTML = `<div class="chat-bubble">${response}</div>`;
      playgroundBody.appendChild(botMsg);
      playgroundBody.scrollTop = playgroundBody.scrollHeight;
      speakText(response);
    }, 600);

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

  function renderKnowledgeGrid() {
    if (!cardsGrid) return;
    
    const customItems = [];
    try {
      const stored = localStorage.getItem('neural_bot_custom_kb');
      if (stored) customItems.push(...JSON.parse(stored));
    } catch(e) {}

    const allItems = (window.NeuralKnowledgeStore && typeof window.NeuralKnowledgeStore.getAllKnowledge === 'function')
      ? window.NeuralKnowledgeStore.getAllKnowledge()
      : [...customItems];

    if (countAll) countAll.textContent = String(allItems.length);
    if (countCustom) countCustom.textContent = String(customItems.length);

    let filtered = allItems;
    if (activeCategory === 'custom') {
      filtered = filtered.filter((i) => i.isCustom || i.category === 'custom' || customItems.some(c => c.id === i.id));
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
        return titleMatch || kwMatch || respMatch;
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
      const isCustomItem = item.isCustom || customItems.some(c => c.id === item.id);
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
            <span class="kb-card-cat-badge ${isCustomItem ? 'custom' : ''}">
              ${isCustomItem ? '<i class="fa-solid fa-database"></i> CUSTOM' : catBadgeText}
            </span>
          </div>

          <div class="kb-card-keywords">
            ${allKws.slice(0, 5).map(kw => `<span class="kb-keyword-pill">${kw}</span>`).join('')}
            ${allKws.length > 5 ? `<span class="kb-keyword-pill">+${allKws.length - 5} more</span>` : ''}
          </div>

          <div class="kb-card-responses">
            ${bnResps.map(r => `<div class="kb-response-item"><span style="display:inline-block; font-size:0.65rem; font-weight:700; color:#00f2fe; background:rgba(0,242,254,0.12); padding:1px 6px; border-radius:4px; margin-right:6px;">বাংলা</span>${r}</div>`).join('')}
            ${enResps.map(r => `<div class="kb-response-item"><span style="display:inline-block; font-size:0.65rem; font-weight:700; color:#8b5cf6; background:rgba(139,92,246,0.15); padding:1px 6px; border-radius:4px; margin-right:6px;">English</span>${r}</div>`).join('')}
            ${customResps.map(r => `<div class="kb-response-item">${r}</div>`).join('')}
          </div>

          <div class="kb-card-footer">
            <span class="kb-variation-count"><i class="fa-solid fa-shuffle"></i> ${totalCount} Unique Variation${totalCount > 1 ? 's' : ''}</span>
            <div class="kb-card-actions">
              <button class="kb-action-btn try-prompt-btn" data-prompt="${firstKeyword}" title="Test this prompt in Chat">
                <i class="fa-solid fa-play"></i> Try Prompt
              </button>
              ${isCustomItem ? `
                <button class="kb-action-btn delete delete-kb-btn" data-id="${item.id}" title="Delete custom memory">
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
        if (id) {
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
      });
    });
  }

  renderKnowledgeGrid();
}
