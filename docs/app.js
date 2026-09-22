/**
 * CapShorts — Official Landing Page JavaScript
 * Premium Fluidity & Organic Intelligence Motion Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Scroll Reveal Observer with signature cubic-bezier timing
  const revealElements = document.querySelectorAll('.reveal-item, .draw-line');
  
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        // Unobserve once revealed for clean performance
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // 2. Core Capabilities Accordion Interactivity
  const accordionItems = document.querySelectorAll('.accordion-item');
  
  accordionItems.forEach(item => {
    const trigger = item.querySelector('.accordion-trigger');
    if (!trigger) return;

    trigger.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      
      // Close all other accordion items for clean single-view accordion
      accordionItems.forEach(other => {
        if (other !== item) {
          other.classList.remove('active');
        }
      });

      // Toggle current item
      if (isActive) {
        item.classList.remove('active');
      } else {
        item.classList.add('active');
      }
    });
  });

  // 3. Interactive Subtitle Style Simulator
  const presetTabs = document.querySelectorAll('.preset-tab-btn');
  const captionDisplay = document.getElementById('simulatorCaptionDisplay');
  const styleBadge = document.getElementById('simulatorStyleBadge');

  const presetData = {
    hormozi: {
      class: 'style-hormozi',
      badge: 'PRESET // HORMOZI BOLD',
      words: [
        { text: 'STOP', kw: true },
        { text: 'PAYING', kw: false },
        { text: '$30/MONTH', kw: true },
        { text: 'FOR', kw: false },
        { text: 'CAPTION', kw: false },
        { text: 'APPS', kw: true }
      ]
    },
    mrbeast: {
      class: 'style-mrbeast',
      badge: 'PRESET // MRBEAST YELLOW POP',
      words: [
        { text: 'WE', kw: false },
        { text: 'RENDERED', kw: false },
        { text: 'THIS', kw: false },
        { text: 'SHORT', kw: false },
        { text: 'IN', kw: false },
        { text: '3 SECONDS!', kw: true }
      ]
    },
    vox: {
      class: 'style-vox',
      badge: 'PRESET // VOX EDITORIAL',
      words: [
        { text: 'The', kw: false },
        { text: 'future', kw: false },
        { text: 'of', kw: false },
        { text: 'video', kw: true },
        { text: 'is', kw: false },
        { text: 'local-first.', kw: true }
      ]
    },
    neon: {
      class: 'style-neon',
      badge: 'PRESET // NEON CYBERPUNK',
      words: [
        { text: 'ACCELERATED', kw: true },
        { text: 'NVENC', kw: false },
        { text: 'GPU', kw: true },
        { text: 'PIPELINE', kw: false }
      ]
    }
  };

  let animationTimer = null;

  function renderPresetPreview(presetKey) {
    const config = presetData[presetKey] || presetData.hormozi;
    if (!captionDisplay) return;

    // Reset classes
    captionDisplay.className = `mockup-caption-area ${config.class}`;
    if (styleBadge) styleBadge.textContent = config.badge;

    // Build word elements
    captionDisplay.innerHTML = '';
    config.words.forEach((w, idx) => {
      const span = document.createElement('span');
      span.textContent = w.text + ' ';
      if (w.kw) span.className = 'kw';
      span.style.opacity = '0';
      span.style.transform = 'translateY(12px) scale(0.95)';
      span.style.transition = 'all 280ms cubic-bezier(0.22, 1, 0.36, 1)';
      span.style.display = 'inline-block';
      captionDisplay.appendChild(span);
    });

    // Animate words word-by-word like speech sync
    if (animationTimer) clearInterval(animationTimer);

    const spans = captionDisplay.querySelectorAll('span');
    let currentWord = 0;

    function stepWords() {
      if (currentWord < spans.length) {
        spans[currentWord].style.opacity = '1';
        spans[currentWord].style.transform = 'translateY(0) scale(1)';
        currentWord++;
      } else {
        // Pause and loop
        setTimeout(() => {
          spans.forEach(s => {
            s.style.opacity = '0';
            s.style.transform = 'translateY(12px) scale(0.95)';
          });
          currentWord = 0;
        }, 1400);
      }
    }

    stepWords();
    animationTimer = setInterval(stepWords, 360);
  }

  // Handle Tab Switch
  presetTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      presetTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const presetKey = tab.dataset.preset;
      renderPresetPreview(presetKey);
    });
  });

  // Start with default preview
  renderPresetPreview('hormozi');

  // 4. OS Auto-Detection for Downloads
  const userAgent = window.navigator.userAgent.toLowerCase();
  const winCard = document.getElementById('card-win');
  const macCard = document.getElementById('card-mac');

  if (userAgent.indexOf('mac') !== -1 && macCard) {
    macCard.classList.add('featured');
    const badge = macCard.querySelector('.mono-badge');
    if (badge) badge.textContent = 'DETECTED OS (APPLE SILICON & INTEL)';
    if (winCard) winCard.classList.remove('featured');
  } else if (winCard) {
    winCard.classList.add('featured');
    const badge = winCard.querySelector('.mono-badge');
    if (badge) badge.textContent = 'RECOMMENDED FOR WINDOWS (64-BIT)';
  }

  // 5. Toast Notification System
  const toast = document.getElementById('toast');
  window.showToast = function(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  };

  // 6. Copy command to clipboard
  const copyBtns = document.querySelectorAll('[data-copy]');
  copyBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const textToCopy = btn.getAttribute('data-copy');
      if (textToCopy) {
        navigator.clipboard.writeText(textToCopy).then(() => {
          showToast('Copied to clipboard: ' + textToCopy);
        }).catch(() => {
          showToast('Failed to copy');
        });
      }
    });
  });

  // 7. Smooth Scroll with Header Offset
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || !targetId) return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        const headerOffset = 90;
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
