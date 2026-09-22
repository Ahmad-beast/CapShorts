// CapShorts Interactive Playground & Logic

document.addEventListener('DOMContentLoaded', () => {
  // 1. Interactive Preset Switcher in Hero Mockup
  const chips = document.querySelectorAll('.mock-preset-chip');
  const captionText = document.getElementById('mockCaptionText');

  const presetData = {
    mrbeast: {
      text: "UNLOCK MILLIONS OF VIEWS",
      styleClass: "style-mrbeast"
    },
    hormozi: {
      text: "STOP WASTING HOURS EDITING",
      styleClass: "style-hormozi"
    },
    glitch: {
      text: "VIRAL AI KEYWORD DETECTED",
      styleClass: "style-glitch"
    },
    karaoke: {
      text: "AUTOMATED KARAOKE SWEEP",
      styleClass: "style-karaoke"
    }
  };

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      const presetKey = chip.getAttribute('data-preset');
      const data = presetData[presetKey];

      if (data && captionText) {
        captionText.className = 'mock-caption-text ' + data.styleClass;
        captionText.textContent = data.text;
      }
    });
  });

  // 2. FAQ Accordion
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      faqItems.forEach(i => i.classList.remove('open'));
      if (!isOpen) {
        item.classList.add('open');
      }
    });
  });

  // 3. Smooth Anchor Scrolling
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || !targetId.startsWith('#')) return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
});
