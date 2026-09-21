/**
 * NEURAL CHAT BOT & AI PORTFOLIO — APP JAVASCRIPT
 * Real-time Voice Recognition, Text-to-Speech, Neural Chatbot, & Dynamic UI
 */

var globalAvatarController = null;

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
  const stageYtBackAvatarBtn = document.getElementById('stageYtBackAvatarBtn');
  const stageYtIframe = document.getElementById('stageYtIframe');
  const stageYtCurrentTitle = document.getElementById('stageYtCurrentTitle');

  function loadStageYoutubeVideo(vidId, title) {
    if (!stageYtIframe) return;
    const cleanId = vidId.replace(/[^a-zA-Z0-9_-]/g, '');
    stageYtIframe.src = `https://www.youtube-nocookie.com/embed/${cleanId}?autoplay=1&enablejsapi=1`;
    if (stageYtCurrentTitle && title) {
      stageYtCurrentTitle.textContent = title;
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

  function switchToYoutube(vidId = null, title = null) {
    const savedScrollY = window.pageYOffset || (document.documentElement && document.documentElement.scrollTop) || window.scrollY || 0;

    if (tabYoutubeBtn) tabYoutubeBtn.classList.add('active');
    if (tabAvatarBtn) tabAvatarBtn.classList.remove('active');
    if (tabVideoBtn) tabVideoBtn.classList.remove('active');

    if (avatarStageView) avatarStageView.style.display = 'none';
    if (videoContainer) {
      videoContainer.style.display = 'none';
      if (video && !video.paused) video.pause();
    }
    if (stageYoutubeView) stageYoutubeView.style.display = 'flex';

    if (avatarRepeatBtn) avatarRepeatBtn.style.display = 'none';
    if (replayBtn) replayBtn.style.display = 'none';

    if (stageFooterTitle) {
      stageFooterTitle.innerHTML = '<i class="fa-brands fa-youtube gradient-red-text"></i> YouTube Cinema & Player Stage';
    }
    if (stageFooterSubtitle) {
      stageFooterSubtitle.textContent = 'Live Multi-Channel YouTube Stream & Search Active';
    }

    if (avatarStatusPill) {
      avatarStatusPill.className = 'avatar-status-pill';
      if (avatarStatusLabel) avatarStatusLabel.textContent = 'YouTube Active';
    }

    if (vidId) {
      loadStageYoutubeVideo(vidId, title);
    }

    if (Math.abs((window.pageYOffset || 0) - savedScrollY) > 1) {
      window.scrollTo(0, savedScrollY);
    }
  }

  window.switchToYoutubeStage = switchToYoutube;
  window.switchToAvatarStage = switchToAvatar;
  window.switchToVideoStage = switchToVideo;

  if (tabAvatarBtn) tabAvatarBtn.addEventListener('click', switchToAvatar);
  if (tabVideoBtn) tabVideoBtn.addEventListener('click', switchToVideo);
  if (tabYoutubeBtn) tabYoutubeBtn.addEventListener('click', () => switchToYoutube());
  if (stageYtBackAvatarBtn) stageYtBackAvatarBtn.addEventListener('click', switchToAvatar);

  function handleStageYtSubmit() {
    if (!stageYtInput) return;
    const q = stageYtInput.value.trim();
    if (!q) return;

    // Check if direct YouTube link
    const ytMatch = q.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
    if (ytMatch && ytMatch[1]) {
      loadStageYoutubeVideo(ytMatch[1], 'Custom YouTube Stream');
      stageYtInput.value = '';
      return;
    }

    // Keyword song catalog matching
    const qLower = q.toLowerCase();
    let selectedId = '2Vv-BfVoq4g';
    let searchTitle = q;

    if (qLower.includes('kesariya') || qLower.includes('brahmastra')) {
      selectedId = 'BddP6PYo2gs';
      searchTitle = 'Kesariya — Arijit Singh';
    } else if (qLower.includes('pasoori')) {
      selectedId = '5Eqb_-j3FDA';
      searchTitle = 'Pasoori — Ali Sethi x Shae Gill';
    } else if (qLower.includes('despacito')) {
      selectedId = 'kJQP7kiw5Fk';
      searchTitle = 'Despacito — Luis Fonsi';
    } else if (qLower.includes('raataan') || qLower.includes('shershaah')) {
      selectedId = 'gvyUuxdRdR4';
      searchTitle = 'Raataan Lambiyan — Shershaah';
    } else if (qLower.includes('lofi') || qLower.includes('lo-fi') || qLower.includes('chill')) {
      selectedId = 'jfKfPfyJRdk';
      searchTitle = 'Lo-Fi Chill Beats Live';
    } else if (qLower.includes('tum hi ho') || qLower.includes('arijit')) {
      selectedId = '2Vv-BfVoq4g';
      searchTitle = 'Tum Hi Ho — Arijit Singh';
    }

    loadStageYoutubeVideo(selectedId, searchTitle);
    stageYtInput.value = '';
  }

  if (stageYtPlayBtn) stageYtPlayBtn.addEventListener('click', handleStageYtSubmit);
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
      const title = chip.getAttribute('data-yt-title');
      if (vidId) {
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
   4. NEURAL TALKING AVATAR CONTROLLER & LIP-SYNC ENGINE
   ========================================================================== */
function initNeuralAvatarController(switchToAvatarCallback) {
  const stageContainer = document.getElementById('avatarStageView');
  const imgIdle = document.getElementById('avatarImgIdle');
  const imgThinking = document.getElementById('avatarImgThinking');
  const imgSpeaking = document.getElementById('avatarImgSpeaking');
  const imgEyes = document.getElementById('avatarImgEyes');
  const statusPill = document.getElementById('avatarStatusPill');
  const statusLabel = document.getElementById('avatarStatusLabel');
  const subtitlesText = document.getElementById('avatarSubtitlesText');
  const repeatBtn = document.getElementById('avatarRepeatBtn');

  let mouthInterval = null;
  let blinkTimeout = null;
  let isBlinking = false;
  let lastSpokenText = 'Welcome! I am NeuralBot. How can I assist you with deep learning or this project today?';
  let isSpeaking = false;

  // --- Natural Eye Blinking Engine ---
  function triggerBlink(forceDouble = false) {
    if (!imgEyes || isBlinking) return;
    isBlinking = true;

    // Smooth eyelid drop
    imgEyes.style.opacity = '1';

    setTimeout(() => {
      if (imgEyes) imgEyes.style.opacity = '0';

      const shouldDouble = forceDouble || (Math.random() < 0.20);
      if (shouldDouble) {
        // Natural quick double blink
        setTimeout(() => {
          if (imgEyes) imgEyes.style.opacity = '0.9';
          setTimeout(() => {
            if (imgEyes) imgEyes.style.opacity = '0';
            isBlinking = false;
          }, 70);
        }, 110);
      } else {
        isBlinking = false;
      }
    }, 85);
  }

  function scheduleNextBlink() {
    if (blinkTimeout) clearTimeout(blinkTimeout);
    // Speaking blinks are more lively (2.0s - 4.2s), idle blinks are calm (3.5s - 6.2s)
    const baseMin = isSpeaking ? 2000 : 3500;
    const baseRange = isSpeaking ? 2200 : 2700;
    const nextDelay = baseMin + Math.random() * baseRange;

    blinkTimeout = setTimeout(() => {
      triggerBlink();
      scheduleNextBlink();
    }, nextDelay);
  }

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

    scheduleNextBlink();
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

    triggerBlink();
    scheduleNextBlink();
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

    // Contemplative blink on thinking state transition
    triggerBlink(true);
    scheduleNextBlink();
  }

  function generateSpeechPattern(text) {
    if (!text || typeof text !== 'string') {
      return [0.95, 0.45, 0.90, 0.15, 0.85, 0.50, 0.20, 0.80, 0.0];
    }
    const clean = text.replace(/<[^>]*>/g, '').trim();
    const words = clean.split(/\s+/);
    const pattern = [];
    const vowels = new Set([
      'a', 'e', 'i', 'o', 'u', 'y', 'A', 'E', 'I', 'O', 'U', 'Y',
      'অ', 'আ', 'ই', 'ঈ', 'উ', 'ঊ', 'ঋ', 'এ', 'ঐ', 'ও', 'ঔ',
      'া', 'ি', 'ী', 'ু', 'ূ', 'ৃ', 'ে', 'ৈ', 'ো', 'ৌ', 'ং', 'ঃ', 'ঁ'
    ]);

    for (let wIdx = 0; wIdx < words.length; wIdx++) {
      const word = words[wIdx];
      if (!word) continue;

      for (let i = 0; i < word.length; i++) {
        const char = word[i];
        if (vowels.has(char)) {
          pattern.push(1.0);
          pattern.push(0.70);
        } else if (/[.,!?;:।\-–]/.test(char)) {
          pattern.push(0.0);
          pattern.push(0.0);
        } else if (i % 2 === 0) {
          pattern.push(0.60);
        } else {
          pattern.push(0.15);
        }
      }
      // Natural word-boundary brief pause
      pattern.push(0.10);
      pattern.push(0.0);
    }
    return pattern.length > 0 ? pattern : [0.95, 0.45, 0.90, 0.15, 0.85, 0.50, 0.20, 0.80, 0.0];
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

    // Dynamic natural phoneme & syllable cadence synchronized with speech
    if (mouthInterval) clearInterval(mouthInterval);
    if (imgSpeaking) {
      imgSpeaking.classList.add('active');
      imgSpeaking.style.opacity = '1';
    }

    const cadencePattern = generateSpeechPattern(text);
    let cadenceIndex = 0;

    mouthInterval = setInterval(() => {
      if (!isSpeaking) {
        clearInterval(mouthInterval);
        mouthInterval = null;
        if (imgSpeaking) {
          imgSpeaking.style.opacity = '0';
        }
        return;
      }
      cadenceIndex = (cadenceIndex + 1) % cadencePattern.length;
      const opacityVal = cadencePattern[cadenceIndex];
      if (imgSpeaking) {
        imgSpeaking.style.opacity = String(opacityVal);
      }
    }, 115);

    // Initial natural conversational blink when speech begins
    setTimeout(() => {
      if (isSpeaking) triggerBlink();
    }, 450);

    scheduleNextBlink();
  }

  function triggerWordSyllable() {
    if (!isSpeaking || !imgSpeaking) return;
    imgSpeaking.style.opacity = '1';
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
        id: 'kb_github_all',
        category: 'github',
        title: 'GitHub Repositories & Projects (সকল গিটহাব প্রজেক্ট)',
        keywords_en: ['github projects', 'github repositories', 'all projects', 'show all repos', 'github portfolio', 'rokeyaag repos', 'what projects do you have', 'project list', 'github data', 'github repos', 'show projects', 'list of projects'],
        keywords_bn: ['সব প্রজেক্ট দেখাও', 'প্রজেক্টগুলো কি কি', 'তোমার প্রজেক্ট কি', 'কি কি প্রজেক্ট বানিয়েছ', 'গিটহাব রিপোজিটরি', 'গিটহাব ডাটা', 'প্রজেক্ট লিস্ট', 'সবগুলো প্রজেক্ট', 'গিটহাবে কি কি আছে', 'github e ki ache', 'sobgulo project', 'project list dekhao', 'github project', 'project gulo ki'],
        responses_en: [
          "Lutfor Rahman (<strong>rokeyaag</strong>) has built <strong>20 active projects</strong> on GitHub across AI, SaaS, Python Desktop, and Security:<br><br>• <strong>EduGenius AI</strong> — Smart AI learning assistant (<a href=\"https://edugenius-ai-omega.vercel.app\" target=\"_blank\" style=\"color:#00f2fe;\">Live Demo</a>)<br>• <strong>Neural Chatbot</strong> — Deep Learning NLP Voice & Avatar AI<br>• <strong>Lutfor Portfolio</strong> — AI Engineer portfolio (<a href=\"https://lutfor-portfolio.vercel.app\" target=\"_blank\" style=\"color:#00f2fe;\">Live Demo</a>)<br>• <strong>IMX Daily Expense App</strong> — Financial analytics (<a href=\"https://imx-daily-expense-app.vercel.app\" target=\"_blank\" style=\"color:#00f2fe;\">Live Demo</a>)<br>• <strong>Grand Aurelia</strong> — Luxury digital web app (<a href=\"https://grand-aurelia-five.vercel.app\" target=\"_blank\" style=\"color:#00f2fe;\">Live Demo</a>)<br>• <strong>School Management AI</strong> — Academic ERP system (<a href=\"https://school-management-ai-system.vercel.app\" target=\"_blank\" style=\"color:#00f2fe;\">Live Demo</a>)<br>• <strong>Banking Desktop</strong> — Python financial software (<a href=\"https://rokeyaag.github.io/banking-desktop/\" target=\"_blank\" style=\"color:#00f2fe;\">Live Demo</a>)<br>• <strong>SecureLock</strong> — Cryptographic vault & file security<br>• <strong>AdCraft AI & AI Solutions</strong> — Marketing & automation systems<br>• <strong>E-Commerce Suite</strong> — IMX E-Shop, REST API, & Frontend<br><br>Explore all repositories at: <a href=\"https://github.com/rokeyaag\" target=\"_blank\" style=\"color:#00f2fe; text-decoration:underline;\">github.com/rokeyaag</a>"
        ],
        responses_bn: [
          "এআই ইঞ্জিনিয়ার লুৎফর রহমানের (rokeyaag) গিটহাবে রয়েছে <strong>২০টি চমৎকার প্রজেক্ট ও রিপোজিটরি</strong>:<br><br>১. <strong>EduGenius AI:</strong> স্মার্ট এডুকেশনাল এআই অ্যাসিস্ট্যান্ট (<a href=\"https://edugenius-ai-omega.vercel.app\" target=\"_blank\" style=\"color:#00f2fe;\">লাইভ ডেমো</a>)<br>২. <strong>Neural Chatbot:</strong> রিয়েল-টাইম লিপ-সিঙ্ক ও ভয়েস চ্যাটবট<br>৩. <strong>Lutfor Portfolio:</strong> এআই ডেভেলপার পোর্টফোলিও (<a href=\"https://lutfor-portfolio.vercel.app\" target=\"_blank\" style=\"color:#00f2fe;\">লাইভ ডেমো</a>)<br>৪. <strong>IMX Daily Expense App:</strong> আয়-ব্যয় ট্র্যাকিং সিস্টেম (<a href=\"https://imx-daily-expense-app.vercel.app\" target=\"_blank\" style=\"color:#00f2fe;\">লাইভ ডেমো</a>)<br>৫. <strong>Grand Aurelia:</strong> লাক্সারি ডিজিটাল ওয়েব প্ল্যাটফর্ম (<a href=\"https://grand-aurelia-five.vercel.app\" target=\"_blank\" style=\"color:#00f2fe;\">লাইভ ডেমো</a>)<br>৬. <strong>School Management AI:</strong> স্কুল ও একাডেমি ইআরপি (<a href=\"https://school-management-ai-system.vercel.app\" target=\"_blank\" style=\"color:#00f2fe;\">লাইভ ডেমো</a>)<br>৭. <strong>Banking Desktop:</strong> পাইথন ব্যাংকিং ডেস্কটপ সফটওয়্যার (<a href=\"https://rokeyaag.github.io/banking-desktop/\" target=\"_blank\" style=\"color:#00f2fe;\">লাইভ ডেমো</a>)<br>৮. <strong>SecureLock:</strong> ফাইল এনক্রিপশন ও সাইবার সিকিউরিটি ভল্ট<br>৯. <strong>AdCraft AI &amp; AI Solutions:</strong> এডভার্টাইজমেন্ট ও বিজনেস অটোমেশন<br>১০. <strong>E-Commerce System:</strong> ফুল-স্ট্যাক ইশপ ও রেস্ট এপিআই<br><br>সবগুলো প্রজেক্টের কোড দেখতে ভিজিট করুন: <a href=\"https://github.com/rokeyaag\" target=\"_blank\" style=\"color:#00f2fe; text-decoration:underline;\">github.com/rokeyaag</a>"
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
      const github = this.getGitHubKnowledge();
      return [...learned, ...custom, ...github, ...this.defaultStore];
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

  // Auto-sync GitHub repositories on launch
  setTimeout(() => {
    NeuralKnowledgeStore.syncFromGitHub().then(() => {
      if (typeof window.refreshKnowledgeStoreUI === 'function') {
        window.refreshKnowledgeStoreUI();
      }
    });
  }, 1000);

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

    const cleanText = rawText.toLowerCase().replace(/[?!.,;:()]/g, ' ').replace(/\s+/g, ' ').trim();
    const queryTokens = cleanText.split(' ').filter(t => t.length > 0);

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

    // Check if user gives a command to Open/Switch to YouTube / Play on YouTube / Go to YouTube
    const isYoutubeCommand = /(?:(?:go\s*to|open|show|switch\s*to|launch|start|play)\s*(?:on\s*)?youtube|youtube\s*(?:player|cinema|interface|video|open|chalao|dekhaw|dekhao|kholo|jao|chalu|play|stream)?)|(?:ইউটিউব|ইউটিউবে\s*(?:যাও|চলো|চলাও|চালাও|খোলো|দেখাও|প্লে|ওপেন)|গান\s*(?:চালাও|দেখাও|শোনাও|শুনবো))/i.test(cleanText);

    if (isYoutubeCommand) {
      let songId = '2Vv-BfVoq4g';
      let songTitle = 'Tum Hi Ho — Arijit Singh';

      if (cleanText.includes('kesariya') || cleanText.includes('brahmastra')) {
        songId = 'BddP6PYo2gs';
        songTitle = 'Kesariya — Arijit Singh';
      } else if (cleanText.includes('pasoori')) {
        songId = '5Eqb_-j3FDA';
        songTitle = 'Pasoori — Ali Sethi x Shae Gill';
      } else if (cleanText.includes('despacito')) {
        songId = 'kJQP7kiw5Fk';
        songTitle = 'Despacito — Luis Fonsi';
      } else if (cleanText.includes('raataan') || cleanText.includes('shershaah')) {
        songId = 'gvyUuxdRdR4';
        songTitle = 'Raataan Lambiyan — Shershaah';
      } else if (cleanText.includes('lofi') || cleanText.includes('lo-fi') || cleanText.includes('chill')) {
        songId = 'jfKfPfyJRdk';
        songTitle = 'Lo-Fi Chill Beats Live';
      }

      // Automatically trigger stage transition to YouTube!
      if (typeof window.switchToYoutubeStage === 'function') {
        window.switchToYoutubeStage(songId, songTitle);
      }

      return isBengali
        ? `🎬 <strong>অবশ্যই! আপনার কমান্ড অনুযায়ী অবতার পরিবর্তন করে YouTube ইন্টারফেস ওপেন করা হয়েছে!</strong><br>উপরের স্টেজে সরাসরি YouTube প্লেয়ার ও সার্চ বার চালু হয়েছে। আপনি সেখান থেকে যেকোনো গান বা ভিডিও সার্চ করে উপভোগ করতে পারেন! 🎵✨`
        : `🎬 <strong>Sure! Switched the stage from avatar to YouTube Player interface!</strong><br>You can now search, browse, and stream any video or music directly on the stage player above! 🎵✨`;
    }

    const allKnowledge = NeuralKnowledgeStore.getAllKnowledge();
    let bestMatch = null;
    let highestScore = 0;

    // Check for general project/portfolio intent boost
    const isProjectQuery = /project|github|repo|গিটহাব|প্রজেক্ট|রিপো|রিপোজিটরি|কাজ|portfolio|পোর্টফোলিও/i.test(cleanText);

    for (const item of allKnowledge) {
      let score = 0;
      
      // Select keyword list based on language
      const keywords = isBengali 
        ? [...(item.keywords_bn || []), ...(item.keywords || []), ...(item.keywords_en || [])]
        : [...(item.keywords_en || []), ...(item.keywords || []), ...(item.keywords_bn || [])];

      // Match item title directly
      const cleanTitle = (item.title || '').toLowerCase().replace(/[?!.,;:()]/g, ' ').trim();
      if (cleanText.includes(cleanTitle) || cleanTitle.includes(cleanText)) {
        score += 80;
      }

      for (const kw of keywords) {
        const cleanKw = kw.toLowerCase().trim();
        const isBnKw = (item.keywords_bn || []).includes(kw) || /[\u0980-\u09FF]/.test(kw);

        // Exact match
        if (cleanText === cleanKw) {
          score += ((isBengali && isBnKw) || (!isBengali && !isBnKw)) ? 150 : 80;
          break;
        }

        // Substring / Phrase match
        if (cleanText.includes(cleanKw)) {
          score += (cleanKw.length * 3.5) + ((isBengali && isBnKw) ? 40 : 20);
        } else if (cleanKw.includes(cleanText) && cleanText.length >= 3) {
          score += (cleanText.length * 2.5) + 15;
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
            const overlap = (tokenMatches / kwTokens.length) * ((isBengali && isBnKw) ? 35 : 20);
            score = Math.max(score, overlap);
          }
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

    // Match found with confident score
    if (bestMatch && highestScore >= 8) {
      return NeuralKnowledgeStore.getRandomResponse(bestMatch, isBengali);
    }

    // Intelligent context-aware Fallback strictly in matching language
    if (isBengali) {
      const bnFallbacks = [
        "আপনার প্রশ্নটি আমি বুঝতে পারছি। আপনি কেমন আছেন, ক্রিয়েটর লুৎফর রহমান, এআই মডেল বা প্রজেক্ট সম্পর্কিত প্রশ্ন করতে পারেন! 😊",
        "দারুণ বিষয়! আপনি চাইলে 'কেমন আছো', 'গান শোনাও', বা 'পাইটর্চ আর্কিটেকচার' সম্পর্কে জানতে চাইতে পারেন।",
        "আমি আপনার কথাটি শুনেছি। ক্রিয়েটর, ডেমো ভিডিও বা যে কোনো প্রশ্ন আমাকে করতে পারেন!"
      ];
      return bnFallbacks[Math.floor(Math.random() * bnFallbacks.length)];
    } else {
      const enFallbacks = [
        "I'm listening! Feel free to ask about well-being, our PyTorch AI model, creator Lutfor Rahman, or request a song or joke!",
        "Feel free to ask me questions like 'How are you?', 'Who created you?', or 'Tell me about your AI architecture' 😊",
        "I am ready to assist! Ask me about deep learning, projects, or developer Lutfor Rahman."
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
      const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=bn&q=${encodeURIComponent(chunk)}`;
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

    // Immediately trigger avatar mouth motion synchronized with the response text
    if (globalAvatarController) {
      globalAvatarController.startSpeaking(spokenText);
    }

    // If voice output is toggled OFF, keep mouth speaking for the estimated text duration
    if (!isVoiceOutputEnabled) {
      const duration = Math.min(Math.max(spokenText.length * 65, 1800), 7000);
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

          let didStart = false;

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
            console.warn('Native Bengali TTS failed, falling back to Audio Stream:', e);
            activeUtterance = null;
            // Immediate seamless fallback to high-definition Bengali Audio Stream!
            playBengaliAudioStream(spokenText);
          };

          // Timeout check: if native speech synthesis doesn't start in 400ms, fallback to audio stream
          const startCheckTimer = setTimeout(() => {
            if (!didStart) {
              try { window.speechSynthesis.cancel(); } catch(e) {}
              activeUtterance = null;
              playBengaliAudioStream(spokenText);
            }
          }, 400);

          utterance.onstart = () => {
            clearTimeout(startCheckTimer);
            didStart = true;
            if (globalAvatarController) {
              globalAvatarController.startSpeaking(spokenText);
            }
          };

          window.speechSynthesis.speak(utterance);
          return;
        } catch (err) {
          console.warn('SpeechSynthesis invocation error:', err);
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

    // Clear previous chat history & welcome message so ONLY the active message and reply are shown
    if (heroChatBody) {
      heroChatBody.innerHTML = '';
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

  const countGithub = document.getElementById('kbCountGithub');
  const countQa = document.getElementById('kbCountQa');
  const syncGithubBtn = document.getElementById('syncGithubKbBtn');

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

    const githubItems = [];
    try {
      const storedGh = localStorage.getItem('neural_bot_github_kb');
      if (storedGh) githubItems.push(...JSON.parse(storedGh));
    } catch(e) {}

    const learnedQAItems = (window.NeuralDialogueMemory && typeof window.NeuralDialogueMemory.getLearnedQA === 'function')
      ? window.NeuralDialogueMemory.getLearnedQA()
      : [];

    const allItems = (window.NeuralKnowledgeStore && typeof window.NeuralKnowledgeStore.getAllKnowledge === 'function')
      ? window.NeuralKnowledgeStore.getAllKnowledge()
      : [...learnedQAItems, ...customItems, ...githubItems];

    const githubCount = allItems.filter(i => i.category === 'github' || i.isGitHub).length;
    const customCount = allItems.filter(i => i.isCustom || i.category === 'custom').length;
    const qaCount = allItems.filter(i => i.isLearnedQA || i.category === 'qa_memory').length;

    if (countAll) countAll.textContent = String(allItems.length);
    if (countCustom) countCustom.textContent = String(customCount);
    if (countGithub) countGithub.textContent = String(githubCount);
    if (countQa) countQa.textContent = String(qaCount);

    let filtered = allItems;
    if (activeCategory === 'custom') {
      filtered = filtered.filter((i) => i.isCustom || i.category === 'custom' || customItems.some(c => c.id === i.id));
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
      const isCustomItem = item.isCustom || customItems.some(c => c.id === item.id);
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
            <span class="kb-card-cat-badge ${isQaItem ? 'qa' : (isCustomItem ? 'custom' : (isGhItem ? 'github' : ''))}">
              ${isQaItem ? '<i class="fa-solid fa-brain"></i> LEARNED Q&amp;A' : (isCustomItem ? '<i class="fa-solid fa-database"></i> CUSTOM' : (isGhItem ? '<i class="fa-brands fa-github"></i> GITHUB' : catBadgeText))}
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
              ${(isCustomItem || isQaItem) ? `
                <button class="kb-action-btn delete delete-kb-btn" data-id="${item.id}" data-type="${isQaItem ? 'qa' : 'custom'}" title="Delete memory">
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
  const authModal = document.getElementById('userAuthModal');
  const authBackdrop = document.getElementById('userAuthModalBackdrop');
  const authCloseBtn = document.getElementById('userAuthCloseBtn');
  const authSaveBtn = document.getElementById('userAuthSaveBtn');
  const authLogoutBtn = document.getElementById('userAuthLogoutBtn');
  const inputName = document.getElementById('userAuthInputName');
  const inputCity = document.getElementById('userAuthInputCity');
  const headerName = document.getElementById('userAuthHeaderName');
  const statusTag = document.getElementById('userAuthStatusTag');
  const displayName = document.getElementById('userAuthDisplayName');
  const displayInfo = document.getElementById('userAuthDisplayInfo');

  function openAuthModal() {
    if (!authModal) return;
    authModal.classList.add('active');
    syncModalState();
    if (inputName) {
      setTimeout(() => inputName.focus(), 100);
    }
  }

  function closeAuthModal() {
    if (!authModal) return;
    authModal.classList.remove('active');
  }

  window.openUserAuthModal = openAuthModal;
  window.closeUserAuthModal = closeAuthModal;

  function syncModalState() {
    const loggedIn = window.NeuralDialogueMemory ? window.NeuralDialogueMemory.getLoggedInUser() : null;
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
      if (inputName) inputName.value = loggedIn.name;
      if (inputCity) inputCity.value = loggedIn.city || '';
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
      if (inputName) inputName.value = '';
      if (inputCity) inputCity.value = '';
      if (authLogoutBtn) authLogoutBtn.style.display = 'none';
      if (authSaveBtn) authSaveBtn.innerHTML = '<i class="fa-solid fa-arrow-right-to-bracket"></i> Save & Login';
    }
  }

  window.syncUserAuthUI = syncModalState;
  window.openUserAuthModal = openAuthModal;
  window.closeUserAuthModal = closeAuthModal;

  if (authBtn) authBtn.addEventListener('click', openAuthModal);
  if (authCloseBtn) authCloseBtn.addEventListener('click', closeAuthModal);
  if (authBackdrop) authBackdrop.addEventListener('click', closeAuthModal);

  if (authSaveBtn) {
    authSaveBtn.addEventListener('click', () => {
      const nameVal = inputName ? inputName.value.trim() : '';
      const cityVal = inputCity ? inputCity.value.trim() : '';
      if (!nameVal) {
        alert('দয়া করে আপনার নাম বা ইউজারনেম লিখুন (Please enter your name)');
        if (inputName) inputName.focus();
        return;
      }
      if (window.NeuralDialogueMemory) {
        window.NeuralDialogueMemory.setLoggedInUser(nameVal, cityVal);
      }
      syncModalState();
      closeAuthModal();

      // Greeting voice feedback
      if (window.globalSpeakResponse) {
        const greetText = `স্বাগতম ${nameVal}! আপনার প্রোফাইল কানেক্ট হয়েছে।`;
        window.globalSpeakResponse(greetText);
      }
    });
  }

  if (authLogoutBtn) {
    authLogoutBtn.addEventListener('click', () => {
      if (window.NeuralDialogueMemory) {
        window.NeuralDialogueMemory.logoutUser();
      }
      syncModalState();
      closeAuthModal();
    });
  }

  // Initial Sync
  syncModalState();
}

