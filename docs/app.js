// CapShorts — Minimalist High-End SaaS Client Logic

document.addEventListener('DOMContentLoaded', () => {
  // 1. Interactive Studio Preset Switcher with Distinct Kinetic Animations
  const tabButtons = document.querySelectorAll('.studio-tab-btn');
  const captionDisplay = document.getElementById('liveCaptionDisplay');

  const presetData = {
    mrbeast: {
      html: 'UNLOCK <span style="color: #facc15;">MILLIONS</span> OF VIEWS',
      styleClass: 'preset-mrbeast'
    },
    hormozi: {
      html: 'STOP PAYING <span class="word-jump" style="color: #ffffff; background: #0284c7; padding: 2px 6px; border-radius: 4px;">$30/MO</span> FOR APPS',
      styleClass: 'preset-hormozi'
    },
    vox: {
      html: 'The future of video editing is <span class="highlighter-marker">local-first.</span>',
      styleClass: 'preset-vox'
    },
    neon: {
      html: 'NVENC GPU // <span style="color: #ffffff;">16X ACCELERATED</span>',
      styleClass: 'preset-neon'
    }
  };

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const presetKey = btn.getAttribute('data-preset');
      const data = presetData[presetKey];

      if (data && captionDisplay) {
        captionDisplay.className = data.styleClass;
        captionDisplay.innerHTML = data.html;
      }
    });
  });

  // 2. FAQ Accordion Logic
  const faqRows = document.querySelectorAll('.faq-row-item');
  faqRows.forEach(row => {
    const trigger = row.querySelector('.faq-trigger-btn');
    if (!trigger) return;

    trigger.addEventListener('click', () => {
      const isOpen = row.classList.contains('open');
      // Close other rows for clean single-view
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
