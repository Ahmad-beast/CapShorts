// CapShorts — Minimalist High-End SaaS Client Logic

document.addEventListener('DOMContentLoaded', () => {
  // 1. Preset Data & Kinetic Animation Engine
  const tabButtons = document.querySelectorAll('.studio-tab-btn');
  const captionDisplay = document.getElementById('liveCaptionDisplay');
  const btnTogglePlay = document.getElementById('btnTogglePlay');
  const btnReplay = document.getElementById('btnReplay');
  const playLabel = document.getElementById('playLabel');

  const presetConfigs = {
    mrbeast: {
      className: 'preset-mrbeast',
      phrases: [
        'UNLOCK <span style="color: #facc15;">MILLIONS</span> OF VIEWS',
        'THIS VIDEO <span style="color: #ef4444;">EXPLODED</span> TO 10M',
        'STOP <span style="color: #facc15;">WASTING</span> YOUR TIME'
      ]
    },
    hormozi: {
      className: 'preset-hormozi',
      phrases: [
        'STOP PAYING <span class="word-jump" style="color: #ffffff; background: #0284c7; padding: 2px 6px; border-radius: 4px;">$30/MO</span> FOR APPS',
        'GET <span class="word-jump" style="color: #ffffff; background: #0284c7; padding: 2px 6px; border-radius: 4px;">10X</span> RETENTION INSTANTLY',
        'RUN IT <span class="word-jump" style="color: #ffffff; background: #0284c7; padding: 2px 6px; border-radius: 4px;">LOCALLY</span> ON YOUR PC'
      ]
    },
    vox: {
      className: 'preset-vox',
      phrases: [
        'The future of video is <span class="highlighter-marker">local-first.</span>',
        'Zero cloud queues, <span class="highlighter-marker">instant AI.</span>',
        'Studio-grade exports <span class="highlighter-marker">without limits.</span>'
      ]
    },
    neon: {
      className: 'preset-neon',
      phrases: [
        'NVENC GPU // <span style="color: #ffffff;">16X ACCELERATED</span>',
        'HARDWARE ENCODER // <span style="color: #ffffff;">ACTIVE</span>',
        'WHISPER TURBO // <span style="color: #ffffff;">0.00ms SYNC</span>'
      ]
    }
  };

  let currentPreset = 'mrbeast';
  let phraseIndex = 0;
  let isPlaying = true;
  let loopInterval = null;

  function applyActivePhrase(animate = true) {
    if (!captionDisplay) return;
    const config = presetConfigs[currentPreset];
    const phrase = config.phrases[phraseIndex % config.phrases.length];

    captionDisplay.className = config.className;
    captionDisplay.innerHTML = phrase;

    if (animate) {
      captionDisplay.style.opacity = '0';
      captionDisplay.style.transform = 'translateY(6px)';
      requestAnimationFrame(() => {
        captionDisplay.style.transition = 'opacity 220ms ease, transform 220ms ease';
        captionDisplay.style.opacity = '1';
        captionDisplay.style.transform = 'translateY(0)';
      });
    }
  }

  function startAutoLoop() {
    if (loopInterval) clearInterval(loopInterval);
    loopInterval = setInterval(() => {
      if (!isPlaying) return;
      phraseIndex++;
      applyActivePhrase(true);
    }, 2800);
  }

  // Handle Preset Switching
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const presetKey = btn.getAttribute('data-preset');
      if (presetConfigs[presetKey]) {
        currentPreset = presetKey;
        phraseIndex = 0;
        applyActivePhrase(true);
      }
    });
  });

  // Micro Play/Pause Toggle
  if (btnTogglePlay) {
    btnTogglePlay.addEventListener('click', () => {
      isPlaying = !isPlaying;
      if (playLabel) {
        playLabel.textContent = isPlaying ? 'Auto-Loop: Playing' : 'Auto-Loop: Paused';
      }
      btnTogglePlay.style.borderColor = isPlaying ? '#27272a' : 'var(--accent)';
    });
  }

  // Micro Replay Button
  if (btnReplay) {
    btnReplay.addEventListener('click', () => {
      applyActivePhrase(true);
    });
  }

  // Initialize loop
  applyActivePhrase(false);
  startAutoLoop();

  // 2. FAQ Accordion Logic
  const faqRows = document.querySelectorAll('.faq-row-item');
  faqRows.forEach(row => {
    const trigger = row.querySelector('.faq-trigger-btn');
    if (!trigger) return;

    trigger.addEventListener('click', () => {
      const isOpen = row.classList.contains('open');
      faqRows.forEach(r => r.classList.remove('open'));
      if (!isOpen) {
        row.classList.add('open');
      }
    });
  });

  // 3. OS Auto-Detection for Downloads
  const userAgent = window.navigator.userAgent.toLowerCase();
  const winCard = document.getElementById('dl-card-win');
  const macCard = document.getElementById('dl-card-mac');

  if (userAgent.indexOf('mac') !== -1 && macCard) {
    macCard.classList.add('featured');
    if (winCard) winCard.classList.remove('featured');
  } else if (winCard) {
    winCard.classList.add('featured');
  }

  // 4. Copy Git Clone Command
  const copyBtn = document.getElementById('btnCopyGit');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText('git clone https://github.com/thealiraza2/CapShorts.git').then(() => {
        const original = copyBtn.textContent;
        copyBtn.textContent = 'COPIED!';
        setTimeout(() => {
          copyBtn.textContent = original;
        }, 2000);
      });
    });
  }

  // 5. Smooth Anchor Scrolling with 76px Navbar Offset
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || !targetId.startsWith('#')) return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        const headerOffset = 76;
        const elementPosition = targetEl.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
});
