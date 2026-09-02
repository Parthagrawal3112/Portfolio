/**
 * Parth Agrawal - Interactive Experience Engine
 * Handles audio synthesis, dual-mode switcher, skills filtering,
 * cursor dynamics, 3D tilt, and instant contact dispatch.
 */

// ==========================================
// 1. Web Audio API Haptic Sound System
// ==========================================
class SoundFX {
  constructor() {
    this.ctx = null;
    this.enabled = localStorage.getItem('sfx_enabled') === 'true';
    this.initUI();
  }

  initContext() {
    if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playClick(freq = 800, duration = 0.04) {
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.4, this.ctx.currentTime + duration);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.debug('Audio error', e);
    }
  }

  playToggle(isHigh = true) {
    if (!this.enabled) return;
    const freq = isHigh ? 1100 : 650;
    this.playClick(freq, 0.06);
  }

  playSuccess() {
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.08);
        gain.gain.setValueAtTime(0.06, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.2);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.2);
      });
    } catch (e) {}
  }

  toggle() {
    this.enabled = !this.enabled;
    localStorage.setItem('sfx_enabled', this.enabled);
    this.updateBtnState();
    if (this.enabled) {
      this.playSuccess();
      showToast('Sound Effects: ON 🔊');
    } else {
      showToast('Sound Effects: OFF 🔇');
    }
  }

  initUI() {
    const btn = document.getElementById('sfx-toggle-btn');
    if (btn) {
      btn.addEventListener('click', () => this.toggle());
      this.updateBtnState();
    }
  }

  updateBtnState() {
    const btn = document.getElementById('sfx-toggle-btn');
    const label = document.getElementById('sfx-label');
    const icon = document.getElementById('sfx-icon');
    if (btn && label && icon) {
      if (this.enabled) {
        label.textContent = 'SFX: ON';
        icon.setAttribute('data-lucide', 'volume-2');
        btn.classList.add('border-emerald-500/50', 'text-emerald-400');
      } else {
        label.textContent = 'SFX: OFF';
        icon.setAttribute('data-lucide', 'volume-x');
        btn.classList.remove('border-emerald-500/50', 'text-emerald-400');
      }
      if (window.lucide) lucide.createIcons();
    }
  }
}

const sfx = new SoundFX();

// ==========================================
// 2. Custom Toast System
// ==========================================
function showToast(message, duration = 3000) {
  let toast = document.getElementById('app-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'app-toast';
    toast.className = 'toast-box';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<span class="text-emerald-400">⚡</span> <span>${message}</span>`;
  toast.classList.add('show');
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
}

// Copy to clipboard helper
function copyText(text, label = 'Copied') {
  navigator.clipboard.writeText(text).then(() => {
    sfx.playSuccess();
    showToast(`${label} copied to clipboard! 📋`);
  }).catch(() => {
    showToast('Failed to copy', 2000);
  });
}

// ==========================================
// 3. Custom Fluid Cursor
// ==========================================
function initCursor() {
  const cursor = document.getElementById('custom-cursor');
  const dot = document.getElementById('custom-cursor-dot');
  if (!cursor || !dot) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let cursorX = mouseX;
  let cursorY = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
  });

  function render() {
    cursorX += (mouseX - cursorX) * 0.2;
    cursorY += (mouseY - cursorY) * 0.2;
    cursor.style.transform = `translate(${cursorX}px, ${cursorY}px)`;
    requestAnimationFrame(render);
  }
  render();

  const hoverTargets = document.querySelectorAll('a, button, input, textarea, select, .glass-card, .interactive-target');
  hoverTargets.forEach((el) => {
    el.addEventListener('mouseenter', () => {
      cursor.classList.add('cursor-hover');
      sfx.playClick(900, 0.02);
    });
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('cursor-hover');
    });
  });
}

// ==========================================
// 4. Dual-Degree Engine Interactive Switcher
// ==========================================
function initDualEngine() {
  const container = document.getElementById('dual-engine-box');
  const btnEng = document.getElementById('btn-lens-eng');
  const btnBiz = document.getElementById('btn-lens-biz');
  const panelEng = document.getElementById('panel-lens-eng');
  const panelBiz = document.getElementById('panel-lens-biz');

  if (!container || !btnEng || !btnBiz || !panelEng || !panelBiz) return;

  function setMode(mode) {
    if (mode === 'eng') {
      container.setAttribute('data-mode', 'engineering');
      btnEng.classList.add('active');
      btnBiz.classList.remove('active');
      panelEng.classList.remove('hidden');
      panelBiz.classList.add('hidden');
      sfx.playToggle(false);
    } else {
      container.setAttribute('data-mode', 'business');
      btnBiz.classList.add('active');
      btnEng.classList.remove('active');
      panelBiz.classList.remove('hidden');
      panelEng.classList.add('hidden');
      sfx.playToggle(true);
    }
  }

  btnEng.addEventListener('click', () => setMode('eng'));
  btnBiz.addEventListener('click', () => setMode('biz'));
}

// ==========================================
// 5. Filterable Skills Matrix
// ==========================================
function initSkillsFilter() {
  const filterBtns = document.querySelectorAll('.skill-filter-btn');
  const skillCards = document.querySelectorAll('.skill-card');

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const category = btn.getAttribute('data-filter');
      filterBtns.forEach(b => {
        b.classList.remove('bg-amber-500', 'text-black', 'font-bold');
        b.classList.add('bg-white/5', 'text-slate-300');
      });
      btn.classList.add('bg-amber-500', 'text-black', 'font-bold');
      btn.classList.remove('bg-white/5', 'text-slate-300');

      skillCards.forEach((card) => {
        const itemCat = card.getAttribute('data-category');
        if (category === 'all' || itemCat.includes(category)) {
          card.style.display = 'flex';
          card.style.opacity = '1';
        } else {
          card.style.display = 'none';
          card.style.opacity = '0';
        }
      });
      sfx.playClick(850, 0.02);
    });
  });
}

// ==========================================
// 6. 3D Card Tilt Interaction
// ==========================================
function init3DTilt() {
  const tiltCard = document.getElementById('hero-photo-card');
  if (!tiltCard) return;

  tiltCard.addEventListener('mousemove', (e) => {
    const rect = tiltCard.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const rotateX = -(y / rect.height) * 12;
    const rotateY = (x / rect.width) * 12;
    tiltCard.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
  });

  tiltCard.addEventListener('mouseleave', () => {
    tiltCard.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
  });
}

// ==========================================
// 7. Scroll Tracking & Spy
// ==========================================
function initScrollSpy() {
  const progressBar = document.getElementById('scroll-progress');
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    if (progressBar) progressBar.style.width = scrolled + '%';

    let current = '';
    sections.forEach((section) => {
      const sectionTop = section.offsetTop - 150;
      if (winScroll >= sectionTop) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });
}

// ==========================================
// 8. Contact Form Dispatch
// ==========================================
function initContactForm() {
  const form = document.getElementById('contact-form');
  const statusBox = document.getElementById('contact-status');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;

    const nameVal = form.querySelector('[name="name"]').value.trim();
    const emailVal = form.querySelector('[name="email"]').value.trim();
    const companyVal = (form.querySelector('[name="company"]').value || 'Independent').trim();
    const topicVal = form.querySelector('[name="topic"]').value;
    const messageVal = form.querySelector('[name="message"]').value.trim();

    submitBtn.innerHTML = `<span>Opening Direct Mail...</span> <span class="animate-spin">⏳</span>`;
    submitBtn.disabled = true;

    const subject = `[Opportunity / Inquiry] ${topicVal} - from ${nameVal} (${companyVal})`;
    const emailBody = `Hi Parth,\n\nI came across your portfolio website and would like to connect:\n\n• Name: ${nameVal}\n• Email: ${emailVal}\n• Company/Org: ${companyVal}\n• Opportunity Type: ${topicVal}\n\n• Details:\n${messageVal}\n\nLooking forward to speaking with you!\nBest,\n${nameVal}`;

    const mailtoUrl = `mailto:agrawalparth3112@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
    const waText = encodeURIComponent(`Hi Parth, this is ${nameVal} from ${companyVal}. I saw your portfolio regarding "${topicVal}". Message: ${messageVal}`);
    const whatsappUrl = `https://wa.me/918306408819?text=${waText}`;

    // Open mail client
    window.open(mailtoUrl, '_blank');
    sfx.playSuccess();

    if (statusBox) {
      statusBox.classList.remove('hidden');
      statusBox.innerHTML = `
        <div class="p-4 rounded-xl bg-slate-900 border border-emerald-500/40 text-slate-200 text-xs sm:text-sm space-y-2 shadow-xl">
          <div class="flex items-center gap-2 text-emerald-400 font-bold">
            <i data-lucide="check-circle" class="w-4 h-4"></i>
            <span>Email Client Triggered for: agrawalparth3112@gmail.com</span>
          </div>
          <p class="text-xs text-slate-400">All fields were pre-filled. You can also send via WhatsApp directly:</p>
          <div class="pt-2 flex gap-2">
            <a href="${whatsappUrl}" target="_blank" class="px-3 py-1 rounded bg-emerald-500 text-black font-bold text-xs inline-flex items-center gap-1">
              <span>Send via WhatsApp (+91 8306408819)</span>
            </a>
          </div>
        </div>
      `;
      if (window.lucide) lucide.createIcons();
    }

    submitBtn.innerHTML = `<span>Ready to Send! ✓</span>`;

    setTimeout(() => {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }, 5000);
  });
}

// ==========================================
// 9. Mobile Menu Toggle
// ==========================================
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobile-menu-toggle');
  const menu = document.getElementById('mobile-menu-drawer');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  if (!toggleBtn || !menu) return;

  toggleBtn.addEventListener('click', () => {
    menu.classList.toggle('open');
    sfx.playClick(900, 0.02);
  });

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
    });
  });
}

// Global initialization
document.addEventListener('DOMContentLoaded', () => {
  initCursor();
  initDualEngine();
  initSkillsFilter();
  init3DTilt();
  initScrollSpy();
  initContactForm();
  initMobileMenu();

  if (window.lucide) {
    lucide.createIcons();
  }
});
