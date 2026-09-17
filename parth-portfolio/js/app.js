/**
 * Parth Agrawal — Spatial Executive OS & Interaction Controller
 * Triple Switchboard Engine: Speed-Run Radar, Muddy Waters Quest Game, Live ROI Simulator,
 * Interactive Dossier, Spatial Web Audio API, and Magnetic Cursor.
 */

// ==========================================
// 1. Web Audio API Spatial Synthesizer
// ==========================================
class SpatialAudioEngine {
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

  playHaptic(freq = 680, duration = 0.035) {
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.4, this.ctx.currentTime + duration);
      gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {}
  }

  playChord(notes = [523.25, 659.25, 783.99, 1046.50]) {
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      notes.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.06);
        gain.gain.setValueAtTime(0.035, now + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.22);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.06);
        osc.stop(now + i * 0.06 + 0.22);
      });
    } catch (e) {}
  }

  toggle() {
    this.enabled = !this.enabled;
    localStorage.setItem('sfx_enabled', this.enabled);
    this.updateBtnState();
    if (this.enabled) {
      this.playChord([440, 554.37, 659.25]);
      showToast('Spatial Audio: ON 🔔');
    } else {
      showToast('Spatial Audio: Muted 🔕');
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
        btn.classList.add('bg-amber-100', 'border-amber-700', 'text-amber-900');
      } else {
        label.textContent = 'SFX: OFF';
        icon.setAttribute('data-lucide', 'volume-x');
        btn.classList.remove('bg-amber-100', 'border-amber-700', 'text-amber-900');
      }
      if (window.lucide) lucide.createIcons();
    }
  }
}

const audio = new SpatialAudioEngine();

// ==========================================
// 2. Custom Toast System & Clipboard
// ==========================================
function showToast(message, duration = 3000) {
  let toast = document.getElementById('app-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'app-toast';
    toast.className = 'toast-box';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<span class="text-amber-700 font-mono">⚡</span> <span>${message}</span>`;
  toast.classList.add('show');
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
}

function copyText(text, label = 'Copied') {
  navigator.clipboard.writeText(text).then(() => {
    audio.playChord([523.25, 659.25, 783.99]);
    showToast(`${label} copied to clipboard! 📋`);
  }).catch(() => {
    showToast('Failed to copy', 2000);
  });
}

// ==========================================
// 3. Live IST Time Clock
// ==========================================
function initClock() {
  const clockEl = document.getElementById('live-ist-clock');
  if (!clockEl) return;
  function update() {
    const now = new Date();
    const options = { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
    clockEl.textContent = `${new Intl.DateTimeFormat('en-GB', options).format(now)} IST`;
  }
  update();
  setInterval(update, 1000);
}

// ==========================================
// 4. Spring Physics Magnetic Cursor
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
    cursorX += (mouseX - cursorX) * 0.18;
    cursorY += (mouseY - cursorY) * 0.18;
    cursor.style.transform = `translate(${cursorX}px, ${cursorY}px)`;
    requestAnimationFrame(render);
  }
  render();

  // Dynamic context morphing
  const hoverTargets = document.querySelectorAll('a, button, input, textarea, select, .interactive-card, [data-cursor]');
  hoverTargets.forEach((el) => {
    el.addEventListener('mouseenter', () => {
      const mode = el.getAttribute('data-cursor');
      if (mode === 'play') {
        cursor.classList.add('cursor-text-play');
        cursor.textContent = 'PLAY';
      } else if (mode === 'calc') {
        cursor.classList.add('cursor-text-calc');
        cursor.textContent = 'CALC';
      } else if (mode === 'view') {
        cursor.classList.add('cursor-text-view');
        cursor.textContent = 'VIEW';
      } else {
        cursor.classList.add('cursor-hover');
        cursor.textContent = '';
      }
      audio.playHaptic(850, 0.012);
    });

    el.addEventListener('mouseleave', () => {
      cursor.className = 'custom-cursor';
      cursor.textContent = '';
    });
  });

  // Magnetic Button Attractor
  const magneticEls = document.querySelectorAll('.magnetic-btn');
  magneticEls.forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.22}px, ${y * 0.22}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0px, 0px)';
    });
  });
}

// ==========================================
// 5. The Triple Switchboard (Mode Switcher)
// ==========================================
function initSwitchboard() {
  const switchBtns = document.querySelectorAll('.switchboard-tab-btn');
  const panels = {
    speedrun: document.getElementById('switchboard-panel-speedrun'),
    quest: document.getElementById('switchboard-panel-quest'),
    calculator: document.getElementById('switchboard-panel-calculator'),
    dossier: document.getElementById('switchboard-panel-dossier')
  };

  switchBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetMode = btn.getAttribute('data-mode');
      
      switchBtns.forEach(b => {
        b.classList.remove('active');
      });
      btn.classList.add('active');

      Object.keys(panels).forEach((k) => {
        if (panels[k]) {
          if (k === targetMode) {
            panels[k].classList.remove('hidden');
            panels[k].classList.add('animate-fade-in');
          } else {
            panels[k].classList.add('hidden');
            panels[k].classList.remove('animate-fade-in');
          }
        }
      });

      audio.playChord([440, 554.37, 659.25]);
      
      if (targetMode === 'speedrun') {
        renderRadarChart();
      }
    });
  });
}

// ==========================================
// 6. Mode 1: Competency Radar Canvas
// ==========================================
function renderRadarChart() {
  const canvas = document.getElementById('competency-radar-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const rect = canvas.parentElement.getBoundingClientRect();
  const width = canvas.width = rect.width;
  const height = canvas.height = rect.height;

  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(centerX, centerY) * 0.72;

  const skills = [
    { label: 'OPV Governance', value: 0.95 },
    { label: '0-to-1 High Agency', value: 0.98 },
    { label: 'Cost-to-Serve ROI', value: 0.92 },
    { label: 'Python & SQL Chops', value: 0.88 },
    { label: 'Cross-Border Audit', value: 0.94 },
    { label: 'Ambiguity Resolution', value: 0.99 }
  ];

  ctx.clearRect(0, 0, width, height);

  const sides = skills.length;
  const angleStep = (Math.PI * 2) / sides;

  // Draw concentric polygon grid
  for (let level = 1; level <= 4; level++) {
    const r = (radius / 4) * level;
    ctx.beginPath();
    for (let i = 0; i < sides; i++) {
      const angle = i * angleStep - Math.PI / 2;
      const x = centerX + r * Math.cos(angle);
      const y = centerY + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = 'rgba(24, 21, 18, 0.08)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Draw radial spokes
  for (let i = 0; i < sides; i++) {
    const angle = i * angleStep - Math.PI / 2;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(x, y);
    ctx.strokeStyle = 'rgba(24, 21, 18, 0.12)';
    ctx.stroke();

    // Text labels
    const labelX = centerX + (radius + 20) * Math.cos(angle);
    const labelY = centerY + (radius + 20) * Math.sin(angle);
    ctx.font = '11px "JetBrains Mono", monospace';
    ctx.fillStyle = '#181512';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(skills[i].label, labelX, labelY);
  }

  // Draw Skill Data Polygon
  ctx.beginPath();
  skills.forEach((s, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const r = radius * s.value;
    const x = centerX + r * Math.cos(angle);
    const y = centerY + r * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.fillStyle = 'rgba(194, 65, 12, 0.22)';
  ctx.fill();
  ctx.strokeStyle = '#C2410C';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Draw points
  skills.forEach((s, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const r = radius * s.value;
    const x = centerX + r * Math.cos(angle);
    const y = centerY + r * Math.sin(angle);
    ctx.beginPath();
    ctx.arc(x, y, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = '#181512';
    ctx.fill();
    ctx.strokeStyle = '#FAF6F0';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  });
}

// ==========================================
// 7. Mode 2: Muddy Waters Quest (Crisis Simulator)
// ==========================================
const questScenarios = [
  {
    id: 'opv_crisis',
    title: '🚨 Crisis A: Enterprise SaaS OPV Go-Live Blocked (Syncron Scenario)',
    context: '24 hours prior to global multi-tenant go-live across 5 clients, QA flags an undocumented API contract mismatch causing latency timeouts. The engineering lead wants to delay the entire release by 3 weeks, risking SLA penalties.',
    choices: [
      {
        text: 'Option 1: Postpone the entire release cycle by 3 weeks.',
        result: '❌ Failure: Breaches client SLAs, burns stakeholder trust, and inflates cost-to-serve.',
        score: '20% Efficiency',
        status: 'error'
      },
      {
        text: 'Option 2 (Parth\'s Approach): Implement a feature-flag bypass for legacy tenants, run targeted readiness gates on compliant microservices, and decouple non-critical payloads without breaking backward compatibility.',
        result: '✅ Resolved: Saved release deadline, 0 client downtime, protected SaaS margins, and resolved tech debt in the subsequent sprint.',
        score: '98% Executive ROI',
        status: 'success'
      }
    ]
  },
  {
    id: 'supply_crisis',
    title: '📦 Crisis B: Last-Mile Stockout & OpEx Spike (7-Eleven Scenario)',
    context: 'Multi-hub distribution in Pune is experiencing 28% delivery delays and rising fuel overheads across high-density convenience outlets due to ad-hoc transshipment routes.',
    choices: [
      {
        text: 'Option 1: Add more logistics vans and buffer stock to every store.',
        result: '❌ Failure: Increases working capital lockup by 40% and expands inventory spoilage.',
        score: '35% Efficiency',
        status: 'error'
      },
      {
        text: 'Option 2 (Parth\'s Approach): Formulate a Linear Programming (LP) transshipment optimization matrix in Tora, balancing cross-dock node constraints to cut redundant routes.',
        result: '✅ Resolved: 30% reduction in logistics OpEx, zero inventory stockouts, and streamlined replenishment schedules.',
        score: '100% Quantitative Impact',
        status: 'success'
      }
    ]
  },
  {
    id: 'audit_crisis',
    title: '📑 Crisis C: 80-Stakeholder Cross-Border Multi-Currency Discrepancy (RedHat Scenario)',
    context: 'Fixed-asset reconciliations across the SAANZ region show unlinked hardware entries and currency variance discrepancies between Accounts and IT.',
    choices: [
      {
        text: 'Option 1: Send broadcast warning emails and hope local teams update spreadsheets.',
        result: '❌ Failure: Fragmented data hygiene, missed audit deadlines, and executive compliance escalation.',
        score: '15% Compliance',
        status: 'error'
      },
      {
        text: 'Option 2 (Parth\'s Approach): Act as the central cross-departmental liaison, build an automated Oracle & Firebase reconciliation pipeline, and establish standardized verification checkpoints.',
        result: '✅ Resolved: Reconciled 100% of fixed assets across 80+ global stakeholders with zero audit discrepancies.',
        score: '96% Audit Governance',
        status: 'success'
      }
    ]
  }
];

function initQuestGame() {
  const container = document.getElementById('quest-scenario-deck');
  if (!container) return;

  function renderScenario(idx = 0) {
    const s = questScenarios[idx];
    container.innerHTML = `
      <div class="space-y-6 animate-fade-in">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <span class="pill-tag pill-terracotta text-xs font-mono font-bold">Interactive Scenario ${idx + 1} of ${questScenarios.length}</span>
          <div class="flex gap-2">
            ${questScenarios.map((_, i) => `
              <button onclick="window.switchQuestScenario(${i})" class="px-2.5 py-1 rounded-full text-xs font-mono font-bold transition-all ${i === idx ? 'bg-amber-900 text-white' : 'bg-stone-200 text-stone-700 hover:bg-stone-300'}">
                Scenario ${i + 1}
              </button>
            `).join('')}
          </div>
        </div>

        <div class="p-5 rounded-2xl bg-white border border-stone-900/10 shadow-sm">
          <h3 class="font-serif text-xl font-bold text-stone-950 mb-2">${s.title}</h3>
          <p class="text-xs sm:text-sm text-stone-700 leading-relaxed">${s.context}</p>
        </div>

        <div class="space-y-3">
          <span class="text-xs font-mono font-semibold uppercase text-stone-500 block">Choose an Operational Action:</span>
          ${s.choices.map((c, cIdx) => `
            <button onclick="window.resolveQuestChoice(${idx}, ${cIdx})" class="w-full text-left p-4 rounded-xl border border-stone-900/15 bg-white hover:border-amber-800 hover:bg-amber-50/40 transition-all group flex items-start gap-3.5 shadow-sm">
              <span class="w-6 h-6 rounded-full bg-stone-900 text-white font-mono text-xs flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-amber-800">${String.fromCharCode(65 + cIdx)}</span>
              <span class="text-xs sm:text-sm font-medium text-stone-800 group-hover:text-stone-950">${c.text}</span>
            </button>
          `).join('')}
        </div>

        <div id="quest-outcome-box" class="hidden"></div>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
  }

  window.switchQuestScenario = (idx) => {
    audio.playHaptic(750, 0.02);
    renderScenario(idx);
  };

  window.resolveQuestChoice = (scenIdx, choiceIdx) => {
    const s = questScenarios[scenIdx];
    const choice = s.choices[choiceIdx];
    const outcomeBox = document.getElementById('quest-outcome-box');
    if (!outcomeBox) return;

    if (choice.status === 'success') {
      audio.playChord([523.25, 659.25, 783.99, 1046.50]);
    } else {
      audio.playHaptic(320, 0.06);
    }

    outcomeBox.classList.remove('hidden');
    outcomeBox.innerHTML = `
      <div class="p-5 rounded-2xl border ${choice.status === 'success' ? 'bg-emerald-50/80 border-emerald-700/40 text-emerald-950' : 'bg-red-50/80 border-red-700/40 text-red-950'} space-y-2 animate-fade-in shadow-md">
        <div class="flex items-center justify-between font-bold text-sm">
          <span>${choice.status === 'success' ? '🎯 Operational Excellence Unlocked' : '⚠️ Sub-optimal Outcome'}</span>
          <span class="font-mono text-xs px-2.5 py-0.5 rounded-full ${choice.status === 'success' ? 'bg-emerald-700 text-white' : 'bg-red-700 text-white'}">${choice.score}</span>
        </div>
        <p class="text-xs sm:text-sm leading-relaxed">${choice.result}</p>
      </div>
    `;
  };

  renderScenario(0);
}

// ==========================================
// 8. Mode 3: Live ROI & Cost-to-Serve Simulator
// ==========================================
function initROICalculator() {
  const teamSlider = document.getElementById('calc-team-size');
  const sprintSlider = document.getElementById('calc-sprint-weeks');
  const spendSlider = document.getElementById('calc-infra-spend');

  const teamVal = document.getElementById('calc-team-val');
  const sprintVal = document.getElementById('calc-sprint-val');
  const spendVal = document.getElementById('calc-spend-val');

  const hoursSavedEl = document.getElementById('calc-hours-saved');
  const opexCutEl = document.getElementById('calc-opex-cut');
  const velocityGainEl = document.getElementById('calc-velocity-gain');

  if (!teamSlider || !sprintSlider || !spendSlider) return;

  function recalculate() {
    const team = parseInt(teamSlider.value);
    const sprintWeeks = parseInt(sprintSlider.value);
    const spend = parseInt(spendSlider.value);

    teamVal.textContent = `${team} Engineers`;
    sprintVal.textContent = `${sprintWeeks} Weeks`;
    spendVal.textContent = `$${(spend / 1000).toFixed(0)}k / Year`;

    // Mathematical formula based on Parth's TPM efficiency models
    const hoursSavedPerSprint = Math.round(team * 4.2 * (sprintWeeks / 2));
    const annualOpExSavings = Math.round(spend * 0.22 + team * 3500);
    const velocityBoost = Math.min(38, Math.round(14 + (team * 0.4)));

    hoursSavedEl.textContent = `${hoursSavedPerSprint} hrs / sprint`;
    opexCutEl.textContent = `$${(annualOpExSavings / 1000).toFixed(1)}k / yr`;
    velocityGainEl.textContent = `+${velocityBoost}%`;
  }

  [teamSlider, sprintSlider, spendSlider].forEach((s) => {
    s.addEventListener('input', () => {
      audio.playHaptic(500 + parseInt(s.value) * 5, 0.008);
      recalculate();
    });
  });

  recalculate();
}

// ==========================================
// 9. Contact Form Dispatch
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
    const emailBody = `Hi Parth,\n\nI reviewed your portfolio and would like to connect:\n\n• Name: ${nameVal}\n• Email: ${emailVal}\n• Company/Org: ${companyVal}\n• Opportunity: ${topicVal}\n\n• Details:\n${messageVal}\n\nLooking forward to speaking with you!\nBest,\n${nameVal}`;

    const mailtoUrl = `mailto:agrawalparth3112@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
    const waText = encodeURIComponent(`Hi Parth, this is ${nameVal} from ${companyVal}. Saw your spatial portfolio regarding "${topicVal}". Message: ${messageVal}`);
    const whatsappUrl = `https://wa.me/918306408819?text=${waText}`;

    window.open(mailtoUrl, '_blank');
    audio.playChord([523.25, 659.25, 783.99, 1046.50]);

    if (statusBox) {
      statusBox.classList.remove('hidden');
      statusBox.innerHTML = `
        <div class="p-5 rounded-2xl bg-white border border-emerald-700/40 text-stone-900 text-xs sm:text-sm space-y-3 shadow-lg">
          <div class="flex items-center gap-2.5 text-emerald-800 font-bold">
            <i data-lucide="check-circle" class="w-4 h-4"></i>
            <span>Email Client Triggered for: agrawalparth3112@gmail.com</span>
          </div>
          <p class="text-xs text-stone-600">All fields pre-formatted. You can also chat with Parth via WhatsApp directly:</p>
          <div class="pt-1 flex flex-wrap gap-2">
            <a href="${whatsappUrl}" target="_blank" class="px-4 py-2 rounded-full bg-emerald-800 text-white font-bold text-xs inline-flex items-center gap-1.5 hover:bg-emerald-900 transition-colors shadow-sm">
              <i data-lucide="message-circle" class="w-3.5 h-3.5"></i>
              <span>Open WhatsApp (+91 8306408819)</span>
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

// Global Document Initializer
document.addEventListener('DOMContentLoaded', () => {
  initClock();
  initCursor();
  initSwitchboard();
  renderRadarChart();
  initQuestGame();
  initROICalculator();
  initContactForm();

  if (window.lucide) {
    lucide.createIcons();
  }
});
