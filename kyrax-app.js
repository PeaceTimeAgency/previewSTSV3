/* ═══════════════════════════════════════════════════════
   KYRAX ONBOARDING — app.js
   Handles: cursor, canvas, boot, navigation, drag-rank,
   asset toggles, input tracking, auto-save, and
   Formspree email delivery on submit.
═══════════════════════════════════════════════════════ */

/* ─────────────────────────────────────────────────────
   FORMSPREE CONFIG
   Replace YOUR_FORM_ID with your Formspree endpoint ID.
   Sign up free at https://formspree.io → New Form → copy ID.
   Example: if your endpoint is https://formspree.io/f/xpwzabcd
   set FORMSPREE_ID = 'xpwzabcd'
───────────────────────────────────────────────────── */
const FORMSPREE_ID = 'xvzbbqlj';
const FORMSPREE_URL = 'https://formspree.io/f/xvzbbqlj';
const FORMSPREE_URL = `https://formspree.io/f/${xvzbbqlj}`;

/* ─────────────────────────────────────────────────────
   INPUT TRACKER
   Collects all answers in real-time as the user types.
   Stored in `formData` object, auto-saved to sessionStorage.
───────────────────────────────────────────────────── */
const formData = {
  // Page 1
  q1_elevator_pitch: '',
  q2_brand_personality: [],    // [{value, detail}]
  q3_colors: '',
  q3_imagery: [],             // [{value, detail}]
  q4_peace_factor: '',
  // Page 2
  q5_primary_goals: [],       // [{value, detail}]
  q6_content_sections: [],   // [{name, rank, included}]
  q7_target_audience: '',
  // Page 3
  q8_assets: {},             // { 'Logo / Channel Art': 'YES'|'NO', ... }
  q9_domain: '',
  q9_integrations: [],        // [{value, detail}]
  q10_success_metrics: '',
  // Meta
  submitted_at: '',
  ref_code: '',
};

/* ─────────────────────────────────────────────────────
   TOGGLE DETAIL PANEL
   Called via onclick on opt-card labels inside
   opt-expand-wrap containers.
───────────────────────────────────────────────────── */
function toggleDetail(labelEl) {
  // Don't fire when clicking the textarea directly
  if (event && event.target.matches('textarea, input[type="text"]')) return;

  const wrap = labelEl.closest('.opt-expand-wrap');
  if (!wrap) return;

  const cb      = labelEl.querySelector('input[type="checkbox"]');
  const panel   = wrap.querySelector('.opt-detail-panel');
  const icon    = labelEl.querySelector('.opt-expand-icon');
  const wasOpen = wrap.classList.contains('expanded');

  // Toggle checkbox
  if (cb) cb.checked = !cb.checked;

  // Toggle expand state
  if (cb && cb.checked) {
    wrap.classList.add('expanded');
    // Focus the textarea after transition
    setTimeout(() => {
      const ta = panel?.querySelector('textarea');
      if (ta) ta.focus();
    }, 360);
  } else {
    wrap.classList.remove('expanded', 'has-detail');
  }

  saveToSession();
}

/* Allow clicking + icon or textarea without toggling checkbox off */
document.addEventListener('click', e => {
  if (e.target.matches('.opt-expand-icon')) {
    e.preventDefault();
    e.stopPropagation();
    const label = e.target.closest('label.opt-card');
    if (label) toggleDetail(label);
  }
});

function saveToSession() {
  sessionStorage.setItem('kyrax_form', JSON.stringify(formData));
}

function restoreFromSession() {
  try {
    const saved = sessionStorage.getItem('kyrax_form');
    if (!saved) return;
    const parsed = JSON.parse(saved);
    Object.assign(formData, parsed);
    applyRestoredValues();
  } catch(e) {}
}

function applyRestoredValues() {
  // Q1
  const q1 = document.getElementById('q1');
  if (q1 && formData.q1_elevator_pitch) q1.value = formData.q1_elevator_pitch;

  // Q2 checkboxes
  formData.q2_brand_personality.forEach(val => {
    document.querySelectorAll('.bp').forEach(cb => {
      if (cb.value === val) cb.checked = true;
    });
  });
  const bpOtherTxt = document.getElementById('bpOtherTxt');
  if (bpOtherTxt && formData.q2_brand_other) bpOtherTxt.value = formData.q2_brand_other;

  // Q3
  const q3c = document.getElementById('q3colors');
  if (q3c && formData.q3_colors) q3c.value = formData.q3_colors;
  if (formData.q3_imagery) {
    document.querySelectorAll('input[name="img"]').forEach(r => {
      if (r.value === formData.q3_imagery) r.checked = true;
    });
  }

  // Q4
  const q4 = document.getElementById('q4');
  if (q4 && formData.q4_peace_factor) q4.value = formData.q4_peace_factor;

  // Q5
  if (formData.q5_primary_goal) {
    document.querySelectorAll('input[name="goal"]').forEach(r => {
      if (r.value === formData.q5_primary_goal) r.checked = true;
    });
  }

  // Q7
  const q7 = document.getElementById('q7');
  if (q7 && formData.q7_target_audience) q7.value = formData.q7_target_audience;

  // Q9
  const q9d = document.getElementById('q9domain');
  if (q9d && formData.q9_domain) q9d.value = formData.q9_domain;
  formData.q9_integrations.forEach(val => {
    document.querySelectorAll('.intg').forEach(cb => {
      if (cb.value === val) cb.checked = true;
    });
  });
  const intgOtherTxt = document.getElementById('intgOtherTxt');
  if (intgOtherTxt && formData.q9_integrations_other) intgOtherTxt.value = formData.q9_integrations_other;

  // Q10
  const q10 = document.getElementById('q10');
  if (q10 && formData.q10_success_metrics) q10.value = formData.q10_success_metrics;
}

/* Helper: collect all selected options + their detail text from a group */
function collectExpandGroup(selector) {
  const results = [];
  document.querySelectorAll(selector).forEach(cb => {
    if (cb.checked) {
      const wrap  = cb.closest('.opt-expand-wrap');
      const detail = wrap?.querySelector('.opt-detail-input')?.value?.trim() || '';
      results.push({ value: cb.value, detail });
    }
  });
  return results;
}

function bindTrackers() {
  // Q1
  document.getElementById('q1')?.addEventListener('input', e => {
    formData.q1_elevator_pitch = e.target.value;
    saveToSession();
  });

  // Q2 brand personality — multi-select + detail per option
  document.addEventListener('change', e => {
    if (e.target.matches('.bp')) {
      formData.q2_brand_personality = collectExpandGroup('.bp');
      saveToSession();
    }
  });
  document.addEventListener('input', e => {
    if (e.target.matches('.opt-detail-input[data-for="Calm & Reassuring"], .opt-detail-input[data-for="Minimalist & Modern"], .opt-detail-input[data-for="High-Energy & Bold"], .opt-detail-input[data-for="Wise & Experienced"], .opt-detail-input[data-for="Other"]')) {
      formData.q2_brand_personality = collectExpandGroup('.bp');
      saveToSession();
    }
  });

  // Q3 colors
  document.getElementById('q3colors')?.addEventListener('input', e => {
    formData.q3_colors = e.target.value;
    saveToSession();
  });

  // Q3 imagery — multi-select + detail
  document.addEventListener('change', e => {
    if (e.target.matches('.img-pref')) {
      formData.q3_imagery = collectExpandGroup('.img-pref');
      saveToSession();
    }
  });
  document.addEventListener('input', e => {
    if (e.target.closest && e.target.closest('.opt-expand-wrap') &&
        e.target.matches('.opt-detail-input') &&
        e.target.closest('.q') === document.getElementById('q3')?.closest('.q')) {
      formData.q3_imagery = collectExpandGroup('.img-pref');
      saveToSession();
    }
  });

  // Q4
  document.getElementById('q4')?.addEventListener('input', e => {
    formData.q4_peace_factor = e.target.value;
    saveToSession();
  });

  // Q5 goals — multi-select + detail
  document.addEventListener('change', e => {
    if (e.target.matches('.goal-chk')) {
      formData.q5_primary_goals = collectExpandGroup('.goal-chk');
      saveToSession();
    }
  });
  document.addEventListener('input', e => {
    if (e.target.matches('.opt-detail-input[data-for="Book a consultation"], .opt-detail-input[data-for="Newsletter / Waitlist"], .opt-detail-input[data-for="Download"], .opt-detail-input[data-for="Contact Form"], .opt-detail-input[data-for="Discord"], .opt-detail-input[data-for="Other Goal"]')) {
      formData.q5_primary_goals = collectExpandGroup('.goal-chk');
      saveToSession();
    }
  });

  // Q7
  document.getElementById('q7')?.addEventListener('input', e => {
    formData.q7_target_audience = e.target.value;
    saveToSession();
  });

  // Q9 domain
  document.getElementById('q9domain')?.addEventListener('input', e => {
    formData.q9_domain = e.target.value;
    saveToSession();
  });

  // Q9 integrations — multi-select + detail per platform
  document.addEventListener('change', e => {
    if (e.target.matches('.intg')) {
      formData.q9_integrations = collectExpandGroup('.intg');
      saveToSession();
    }
  });
  document.addEventListener('input', e => {
    const detail = e.target.closest('.opt-detail-panel');
    if (detail && detail.closest('.q')?.querySelector('.intg')) {
      formData.q9_integrations = collectExpandGroup('.intg');
      saveToSession();
    }
  });

  // Q10
  document.getElementById('q10')?.addEventListener('input', e => {
    formData.q10_success_metrics = e.target.value;
    saveToSession();
  });

  // Generic: mark has-detail on expand wraps when textarea is filled
  document.addEventListener('input', e => {
    if (e.target.matches('.opt-detail-input')) {
      const wrap = e.target.closest('.opt-expand-wrap');
      if (wrap) wrap.classList.toggle('has-detail', e.target.value.trim().length > 0);
    }
  });
}

/* Snapshot Q6 rank + Q8 assets at submit time */
function snapshotRankAndAssets() {
  // Q6 section ranking
  formData.q6_content_sections = [...document.querySelectorAll('#rankList .rank-card')].map((card, i) => ({
    rank: i + 1,
    name: card.dataset.section,
    included: card.querySelector('.rtgl-btn.on-yes') !== null,
  }));

  // Q8 asset inventory
  formData.q8_assets = {};
  document.querySelectorAll('.asset-row').forEach(row => {
    const name = row.querySelector('.asset-name').textContent.trim();
    const yes = row.querySelector('.atgl-btn.on-yes');
    const no  = row.querySelector('.atgl-btn.on-no');
    formData.q8_assets[name] = yes ? 'YES' : no ? 'NO' : 'NOT ANSWERED';
  });
}

/* ─────────────────────────────────────────────────────
   BUILD EMAIL BODY
   Formats all answers into a clean readable email.
───────────────────────────────────────────────────── */
/* Format an array of {value, detail} selections into readable text */
function formatSelections(arr) {
  if (!arr || !arr.length) return '  Not answered';
  return arr.map(item => {
    const detail = item.detail ? `\n     → ${item.detail}` : '';
    return `  • ${item.value}${detail}`;
  }).join('\n');
}

function buildEmailBody() {
  const d = formData;

  const sections = (d.q6_content_sections || [])
    .map(s => `  ${s.rank}. ${s.name} [${s.included ? 'INCLUDED' : 'EXCLUDED'}]`)
    .join('\n') || '  Not answered';

  const assets = Object.entries(d.q8_assets || {})
    .map(([k, v]) => `  ${k}: ${v}`)
    .join('\n') || '  Not answered';

  return `
KYRAX ONBOARDING BRIEF — PEACE TIME AGENCY
===========================================
Ref: ${d.ref_code}
Submitted: ${d.submitted_at}


PAGE 01 — BRAND IDENTITY & VISION
──────────────────────────────────

Q1. THE ELEVATOR PITCH
${d.q1_elevator_pitch || 'Not answered'}

Q2. BRAND PERSONALITY
${formatSelections(d.q2_brand_personality)}

Q3. VISUAL PREFERENCES
Colors: ${d.q3_colors || 'Not answered'}

Imagery selections:
${formatSelections(d.q3_imagery)}

Q4. THE "PEACE" FACTOR
${d.q4_peace_factor || 'Not answered'}


PAGE 02 — LANDING PAGE STRUCTURE
──────────────────────────────────

Q5. PRIMARY GOALS
${formatSelections(d.q5_primary_goals)}

Q6. KEY CONTENT SECTIONS (ranked by priority)
${sections}

Q7. TARGET AUDIENCE
${d.q7_target_audience || 'Not answered'}


PAGE 03 — TECHNICAL LOGISTICS
──────────────────────────────────

Q8. INVENTORY OF ASSETS
${assets}

Q9. DOMAIN
${d.q9_domain || 'Not provided'}

Q9. INTEGRATIONS
${formatSelections(d.q9_integrations)}

Q10. SUCCESS METRICS
${d.q10_success_metrics || 'Not answered'}


===========================================
KYRAX ONBOARDING SYSTEM // SATCORP
===========================================
`.trim();
}

/* ─────────────────────────────────────────────────────
   FORMSPREE SUBMISSION
───────────────────────────────────────────────────── */
async function sendToFormspree(ref) {
  const d = formData;
  const payload = {
    _subject: `[KYRAX] New Onboarding Brief — Peace Time Agency // ${ref}`,
    ref_code: ref,
    submitted_at: d.submitted_at,

    // Page 1
    q1_elevator_pitch: d.q1_elevator_pitch,
    q2_brand_personality: (d.q2_brand_personality || []).map(i => i.detail ? `${i.value} (${i.detail})` : i.value).join(' | '),
    q3_colors: d.q3_colors,
    q3_imagery: (d.q3_imagery || []).map(i => i.detail ? `${i.value} (${i.detail})` : i.value).join(' | '),
    q4_peace_factor: d.q4_peace_factor,

    // Page 2
    q5_primary_goals: (d.q5_primary_goals || []).map(i => i.detail ? `${i.value} (${i.detail})` : i.value).join(' | '),
    q6_sections_ranked: (d.q6_content_sections || [])
      .map(s => `${s.rank}. ${s.name} [${s.included ? 'IN' : 'OUT'}]`).join(' | '),
    q7_target_audience: d.q7_target_audience,

    // Page 3
    q8_assets: Object.entries(d.q8_assets || {}).map(([k,v]) => `${k}: ${v}`).join(' | '),
    q9_domain: d.q9_domain,
    q9_integrations: (d.q9_integrations || []).map(i => i.detail ? `${i.value}: ${i.detail}` : i.value).join(' | '),
    q10_success_metrics: d.q10_success_metrics,

    // Full readable body
    _full_brief: buildEmailBody(),
  };

  try {
    const res = await fetch(FORMSPREE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) console.warn('Formspree responded with:', res.status);
  } catch (err) {
    console.warn('Formspree submission failed (offline or unconfigured):', err.message);
  }
}

/* ─────────────────────────────────────────────────────
   CURSOR
───────────────────────────────────────────────────── */
const cur  = document.getElementById('cursor');
const curR = document.getElementById('cursor-ring');
let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cur.style.left = mx + 'px';
  cur.style.top  = my + 'px';
});

(function animRing() {
  rx += (mx - rx) * 0.12;
  ry += (my - ry) * 0.12;
  curR.style.left = rx + 'px';
  curR.style.top  = ry + 'px';
  requestAnimationFrame(animRing);
})();

/* ─────────────────────────────────────────────────────
   CANVAS PARTICLE BG
───────────────────────────────────────────────────── */
const canvas = document.getElementById('bgCanvas');
const ctx    = canvas.getContext('2d');
let W, H, particles = [];

function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
resize();
window.addEventListener('resize', resize);

class Particle {
  constructor() { this.reset(true); }
  reset(init = false) {
    this.x     = Math.random() * W;
    this.y     = init ? Math.random() * H : H + 10;
    this.vx    = (Math.random() - .5) * .3;
    this.vy    = -Math.random() * .6 - .1;
    this.size  = Math.random() * 1.2 + .3;
    this.alpha = Math.random() * .5 + .1;
    this.life  = Math.random() * 400 + 200;
    this.maxLife = this.life;
    this.color = Math.random() > .6 ? '#00e5ff' : Math.random() > .5 ? '#00ffb3' : '#8badc8';
  }
  update() {
    this.x += this.vx; this.y += this.vy; this.life--;
    if (this.life < 0 || this.y < -10) this.reset();
  }
  draw() {
    ctx.save();
    ctx.globalAlpha = (this.life / this.maxLife) * this.alpha;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

for (let i = 0; i < 120; i++) particles.push(new Particle());

function drawGrid() {
  ctx.clearRect(0, 0, W, H);
  ctx.strokeStyle = 'rgba(22,32,48,0.6)';
  ctx.lineWidth = 1;
  const gs = 60;
  for (let x = 0; x < W; x += gs) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
  for (let y = 0; y < H; y += gs) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
}

function animCanvas() {
  drawGrid();
  particles.forEach(p => { p.update(); p.draw(); });
  requestAnimationFrame(animCanvas);
}
animCanvas();

/* ─────────────────────────────────────────────────────
   BOOT SEQUENCE
───────────────────────────────────────────────────── */
const bootLines = [
  { text: 'KYRAX OS v4.1.2 — KERNEL LOADED',           cls: 'ok'   },
  { text: 'SECURE CHANNEL ESTABLISHED',                  cls: 'ok'   },
  { text: 'CLIENT PROFILE: PEACE TIME AGENCY',           cls: 'ok'   },
  { text: 'DOCUMENT CLASS: CONFIDENTIAL ONBOARDING',     cls: 'warn' },
  { text: 'LOADING INTAKE MODULES…',                     cls: ''     },
  { text: 'ENCRYPTION: AES-256 ACTIVE',                  cls: 'ok'   },
];

const bootSeq   = document.getElementById('bootSeq');
const bootBar   = document.getElementById('bootBar');
const bootLabel = document.getElementById('bootBarLabel');

function runBoot() {
  let i = 0;
  function nextLine() {
    if (i >= bootLines.length) {
      bootBar.style.width = '100%';
      bootLabel.textContent = 'SESSION READY — LOADING INTERFACE';
      setTimeout(launchApp, 800);
      return;
    }
    const div = document.createElement('div');
    div.className = 'boot-line ' + bootLines[i].cls;
    div.style.animationDelay = '0s';
    div.textContent = '> ' + bootLines[i].text;
    bootSeq.appendChild(div);
    bootBar.style.width = ((i + 1) / bootLines.length * 85) + '%';
    i++;
    setTimeout(nextLine, 300 + Math.random() * 200);
  }
  setTimeout(nextLine, 400);
}

/* ─────────────────────────────────────────────────────
   PAGE NAVIGATION
───────────────────────────────────────────────────── */
let currentPage = 1;

function goTo(page) {
  if (page < 1 || page > 3) return;
  document.getElementById('page' + currentPage)?.classList.remove('active');
  document.getElementById('page' + page)?.classList.add('active');
  currentPage = page;
  document.getElementById('contentArea').scrollTop = 0;

  [1,2,3].forEach(i => {
    const ss = document.getElementById('ss' + i);
    const si = document.getElementById('si' + i);
    ss.classList.remove('active','done');
    si.textContent = i < page ? '' : i;
    if (i < page)  { ss.classList.add('done'); si.textContent = ''; }
    if (i === page) ss.classList.add('active');
  });

  const pct = { 1: 33, 2: 66, 3: 100 };
  document.getElementById('npFill').style.width    = pct[page] + '%';
  document.getElementById('npCurrent').textContent = page;

  document.getElementById('btnBack').style.display   = page > 1 ? 'flex' : 'none';
  document.getElementById('btnNext').style.display   = page < 3 ? 'flex' : 'none';
  document.getElementById('btnSubmit').style.display = page === 3 ? 'flex' : 'none';
}

/* ─────────────────────────────────────────────────────
   RANK DRAG & DROP
───────────────────────────────────────────────────── */
let dragSrc = null;

document.querySelectorAll('.rank-card').forEach(card => {
  card.addEventListener('dragstart', e => {
    dragSrc = card; card.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
  });
  card.addEventListener('dragend', () => {
    card.classList.remove('dragging');
    document.querySelectorAll('.rank-card').forEach(c => c.classList.remove('over'));
    reorderNums();
    saveToSession();
  });
  card.addEventListener('dragover', e => {
    e.preventDefault();
    if (card !== dragSrc) {
      document.querySelectorAll('.rank-card').forEach(c => c.classList.remove('over'));
      card.classList.add('over');
    }
  });
  card.addEventListener('drop', e => {
    e.preventDefault();
    if (dragSrc && dragSrc !== card) {
      const list  = card.parentNode;
      const items = [...list.querySelectorAll('.rank-card')];
      const si    = items.indexOf(dragSrc);
      const ti    = items.indexOf(card);
      list.insertBefore(dragSrc, si < ti ? card.nextSibling : card);
    }
  });
});

function reorderNums() {
  document.querySelectorAll('#rankList .rank-card').forEach((c, i) => {
    c.querySelector('.rank-pos').textContent = i + 1;
  });
}

function toggleRank(btn, val) {
  const wrap = btn.closest('.rank-toggle');
  wrap.querySelectorAll('.rtgl-btn').forEach(b => b.classList.remove('on-yes','on-no'));
  btn.classList.add(val === 'yes' ? 'on-yes' : 'on-no');
  saveToSession();
}

/* ─────────────────────────────────────────────────────
   ASSET TOGGLES
───────────────────────────────────────────────────── */
function setAsset(btn, val) {
  const wrap = btn.closest('.asset-toggle');
  wrap.querySelectorAll('.atgl-btn').forEach(b => b.classList.remove('on-yes','on-no'));
  btn.classList.add(val === 'yes' ? 'on-yes' : 'on-no');
  btn.closest('.asset-row').style.transition = 'border-color .3s';
  saveToSession();
}

/* ─────────────────────────────────────────────────────
   SUBMIT
───────────────────────────────────────────────────── */
function submitForm() {
  const ref = 'REF // KYRAX-' + Math.floor(100000 + Math.random() * 900000) + '-PTA';
  formData.ref_code     = ref;
  formData.submitted_at = new Date().toISOString();

  snapshotRankAndAssets();
  saveToSession();
  sendToFormspree(ref);

  triggerTransmission(() => {
    document.getElementById('refCode').textContent = ref;
    [1,2,3].forEach(i => document.getElementById('page' + i)?.classList.remove('active'));
    document.getElementById('success').classList.add('active');
    [1,2,3].forEach(i => {
      const ss = document.getElementById('ss' + i);
      const si = document.getElementById('si' + i);
      ss.classList.remove('active');
      ss.classList.add('done');
      si.textContent = '';
    });
    document.getElementById('bottomNav').style.display = 'none';
    document.getElementById('npFill').style.width = '100%';
    document.getElementById('contentArea').scrollTop = 0;
    typewriterEl(document.querySelector('.success-eyebrow'), 'TRANSMISSION CONFIRMED', 40);
    startSuccessParticles();
  });
}

function startSuccessParticles() {} // placeholder — canvas already running

/* ─────────────────────────────────────────────────────
   SATCORP ANIMATION LAYER
───────────────────────────────────────────────────── */

/* 1. RADAR SWEEP */
function initRadar() {
  const c = document.createElement('canvas');
  c.id = 'radarCanvas';
  c.style.cssText = 'position:absolute;bottom:20px;right:16px;width:80px;height:80px;opacity:0.35;pointer-events:none;z-index:2;';
  document.querySelector('.sidebar').appendChild(c);
  const r = c.getContext('2d');
  c.width = 80; c.height = 80;
  const cx = 40, cy = 40, radius = 34;
  let angle = 0;

  function drawRadar() {
    r.clearRect(0, 0, 80, 80);
    r.strokeStyle = 'rgba(0,229,255,0.12)';
    r.lineWidth = 1;
    [34,22,11].forEach(rad => { r.beginPath(); r.arc(cx,cy,rad,0,Math.PI*2); r.stroke(); });
    r.strokeStyle = 'rgba(0,229,255,0.08)';
    r.beginPath(); r.moveTo(cx-radius,cy); r.lineTo(cx+radius,cy); r.stroke();
    r.beginPath(); r.moveTo(cx,cy-radius); r.lineTo(cx,cy+radius); r.stroke();

    for (let i = 0; i < 60; i++) {
      const a     = angle - (i * Math.PI / 180);
      const alpha = (1 - i/60) * 0.3;
      r.beginPath(); r.moveTo(cx,cy);
      r.arc(cx,cy,radius,a,a+0.03); r.closePath();
      r.fillStyle = `rgba(0,229,255,${alpha})`; r.fill();
    }

    r.strokeStyle = 'rgba(0,229,255,0.8)';
    r.lineWidth = 1;
    r.beginPath(); r.moveTo(cx,cy);
    r.lineTo(cx + Math.cos(angle)*radius, cy + Math.sin(angle)*radius); r.stroke();

    const blips = [{a:0.8,d:18},{a:2.4,d:26},{a:4.1,d:14}];
    blips.forEach(b => {
      const bx   = cx + Math.cos(b.a)*b.d;
      const by   = cy + Math.sin(b.a)*b.d;
      const diff = ((angle - b.a) % (Math.PI*2) + Math.PI*2) % (Math.PI*2);
      const fade = diff < Math.PI ? Math.max(0, 1 - diff/Math.PI) : 0;
      if (fade > 0) {
        r.beginPath(); r.arc(bx,by,2,0,Math.PI*2);
        r.fillStyle = `rgba(0,255,179,${fade*0.9})`; r.fill();
        r.beginPath(); r.arc(bx,by,4+fade*2,0,Math.PI*2);
        r.strokeStyle = `rgba(0,255,179,${fade*0.3})`; r.lineWidth=1; r.stroke();
      }
    });

    angle += 0.025;
    if (angle > Math.PI*2) angle -= Math.PI*2;
    requestAnimationFrame(drawRadar);
  }
  drawRadar();
}

/* 2. HUD CORNER BRACKETS */
function initHUDCorners() {
  const defs = [
    { top:'0',    left:'0',  borderTop:'1px solid rgba(0,229,255,0.3)', borderLeft:'1px solid rgba(0,229,255,0.3)' },
    { top:'0',    right:'0', borderTop:'1px solid rgba(0,229,255,0.3)', borderRight:'1px solid rgba(0,229,255,0.3)' },
    { bottom:'0', left:'0',  borderBottom:'1px solid rgba(0,229,255,0.3)', borderLeft:'1px solid rgba(0,229,255,0.3)' },
    { bottom:'0', right:'0', borderBottom:'1px solid rgba(0,229,255,0.3)', borderRight:'1px solid rgba(0,229,255,0.3)' },
  ];
  const app = document.getElementById('app');
  defs.forEach((s, i) => {
    const el = document.createElement('div');
    Object.assign(el.style, { position:'fixed', zIndex:'200', pointerEvents:'none', width:'4px', height:'4px', opacity:'0', ...s });
    app.appendChild(el);
    setTimeout(() => {
      el.style.transition = `width .5s ease ${0.8+i*.1}s, height .5s ease ${0.8+i*.1}s, opacity .4s ease ${0.8+i*.1}s`;
      el.style.width='24px'; el.style.height='24px'; el.style.opacity='1';
    }, 50);
  });
}

/* 3. DATA STREAM LINES */
function initDataStreams() {
  const sc = document.createElement('canvas');
  sc.id = 'streamCanvas';
  sc.style.cssText = 'position:fixed;inset:0;z-index:2;pointer-events:none;opacity:0.18;';
  document.body.insertBefore(sc, document.body.firstChild);
  const sx = sc.getContext('2d');
  function resizeStream() { sc.width = window.innerWidth; sc.height = window.innerHeight; }
  resizeStream();
  window.addEventListener('resize', resizeStream);

  const streams = Array.from({length:8}, () => ({
    x: Math.random()*window.innerWidth, y: Math.random()*window.innerHeight,
    speed: Math.random()*1.5+0.5, length: Math.random()*120+40,
    opacity: Math.random()*0.6+0.2, width: Math.random()>.7?2:1,
    color: Math.random()>.5?'#00e5ff':'#00ffb3', horizontal: Math.random()>.6,
  }));

  function drawStreams() {
    sx.clearRect(0,0,sc.width,sc.height);
    streams.forEach(s => {
      const grad = s.horizontal
        ? sx.createLinearGradient(s.x,s.y,s.x+s.length,s.y)
        : sx.createLinearGradient(s.x,s.y,s.x,s.y+s.length);
      grad.addColorStop(0,'transparent');
      grad.addColorStop(0.5,s.color);
      grad.addColorStop(1,'transparent');
      sx.strokeStyle=grad; sx.lineWidth=s.width;
      sx.beginPath();
      if(s.horizontal){sx.moveTo(s.x,s.y);sx.lineTo(s.x+s.length,s.y);}
      else{sx.moveTo(s.x,s.y);sx.lineTo(s.x,s.y+s.length);}
      sx.stroke();
      if(s.horizontal){s.x+=s.speed;if(s.x>sc.width+100)s.x=-s.length;}
      else{s.y+=s.speed;if(s.y>sc.height+100)s.y=-s.length;}
    });
    requestAnimationFrame(drawStreams);
  }
  drawStreams();
}

/* 4. TARGET LOCK RETICLES */
function initReticles() {
  let brackets = [];
  function clearBrackets() { brackets.forEach(b=>b.remove()); brackets=[]; }
  function showBrackets(el) {
    clearBrackets();
    const rect=el.getBoundingClientRect(), pad=6, size=12;
    [
      {top:rect.top-pad,     left:rect.left-pad,         bt:'1px solid',bl:'1px solid'},
      {top:rect.top-pad,     left:rect.right+pad-size,   bt:'1px solid',br:'1px solid'},
      {top:rect.bottom+pad-size, left:rect.left-pad,      bb:'1px solid',bl:'1px solid'},
      {top:rect.bottom+pad-size, left:rect.right+pad-size,bb:'1px solid',br:'1px solid'},
    ].forEach((p,i) => {
      const b=document.createElement('div');
      b.style.cssText=`position:fixed;z-index:500;pointer-events:none;width:${size}px;height:${size}px;
        border-top:${p.bt||'none'};border-bottom:${p.bb||'none'};
        border-left:${p.bl||'none'};border-right:${p.br||'none'};
        border-color:rgba(0,229,255,0.7);top:${p.top}px;left:${p.left}px;
        opacity:0;transform:scale(1.3);
        transition:opacity .15s ease ${i*.04}s,transform .2s ease ${i*.04}s;`;
      document.body.appendChild(b); brackets.push(b);
      requestAnimationFrame(()=>{b.style.opacity='1';b.style.transform='scale(1)';});
    });
  }
  document.addEventListener('focusin',  e => { if(e.target.matches('input,textarea,select')) showBrackets(e.target); });
  document.addEventListener('focusout', () => {
    brackets.forEach(b=>{b.style.opacity='0';b.style.transform='scale(1.3)';});
    setTimeout(clearBrackets,200);
  });
  window.addEventListener('scroll',()=>{
    if(document.activeElement?.matches('input,textarea,select')) showBrackets(document.activeElement);
  },true);
}

/* 5. TYPEWRITER */
function typewriterEl(el, text, speed=50) {
  el.textContent='';
  let i=0;
  el.style.borderRight='1px solid currentColor';
  function type() {
    if(i<text.length){el.textContent+=text[i++];setTimeout(type,speed+Math.random()*20);}
    else{el.style.borderRight='none';}
  }
  type();
}

/* 6. GLITCH TRANSITION */
function glitchTransition(cb) {
  const overlay=document.createElement('div');
  overlay.style.cssText='position:fixed;inset:0;z-index:150;pointer-events:none;background:var(--black);opacity:0;';
  document.body.appendChild(overlay);
  let frame=0;
  const frames=[
    {op:.9,tx:-3,ty:1},{op:.0,tx:0,ty:0},{op:.7,tx:4,ty:-2},
    {op:.0,tx:0,ty:0},{op:.95,tx:-2,ty:2},{op:.0,tx:0,ty:0},{op:.0,tx:0,ty:0},
  ];
  function doFrame() {
    if(frame>=frames.length){overlay.remove();if(cb)cb();return;}
    const f=frames[frame++];
    overlay.style.opacity=f.op; overlay.style.transform=`translate(${f.tx}px,${f.ty}px)`;
    setTimeout(doFrame,45);
  }
  doFrame();
}

/* 7. TRANSMISSION BURST */
function triggerTransmission(cb) {
  const burst=document.createElement('div');
  burst.style.cssText='position:fixed;inset:0;z-index:500;pointer-events:none;display:flex;align-items:center;justify-content:center;background:rgba(3,5,10,0.97);opacity:0;transition:opacity .3s;';
  burst.innerHTML=`
    <div style="text-align:center;">
      <canvas id="burstCanvas" width="300" height="300" style="display:block;margin:0 auto 24px;"></canvas>
      <div id="burstTxt" style="font-family:'Share Tech Mono',monospace;font-size:11px;color:var(--cyan);letter-spacing:.2em;text-transform:uppercase;opacity:0;animation:burstTxt .4s ease .6s forwards;"></div>
    </div>`;
  const style=document.createElement('style');
  style.textContent='@keyframes burstTxt{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}';
  document.head.appendChild(style);
  document.body.appendChild(burst);
  requestAnimationFrame(()=>burst.style.opacity='1');
  setTimeout(()=>typewriterEl(document.getElementById('burstTxt'),'TRANSMITTING TO KYRAX…',45),600);

  const bc=document.getElementById('burstCanvas');
  const bx=bc.getContext('2d');
  const bcx=150,bcy=150;
  let bFrame=0,totalFrames=90;

  function drawBurst() {
    bx.clearRect(0,0,300,300);
    const progress=bFrame/totalFrames;
    for(let ri=0;ri<4;ri++){
      const rad=(progress*130+ri*28)%140;
      const alpha=Math.max(0,.7-rad/140);
      bx.beginPath();bx.arc(bcx,bcy,rad,0,Math.PI*2);
      bx.strokeStyle=`rgba(0,229,255,${alpha})`;bx.lineWidth=ri===0?1.5:1;bx.stroke();
    }
    for(let i=0;i<12;i++){
      const a=(i/12)*Math.PI*2+progress*Math.PI*4;
      const r1=50+Math.sin(progress*Math.PI*6+i)*8, r2=r1+14;
      bx.beginPath();bx.moveTo(bcx+Math.cos(a)*r1,bcy+Math.sin(a)*r1);
      bx.lineTo(bcx+Math.cos(a)*r2,bcy+Math.sin(a)*r2);
      bx.strokeStyle=`rgba(0,255,179,${.5+Math.sin(progress*Math.PI*3+i)*.3})`;bx.lineWidth=1;bx.stroke();
    }
    const cs=16+Math.sin(progress*Math.PI*8)*4;
    bx.strokeStyle='rgba(0,229,255,0.9)';bx.lineWidth=1.5;
    bx.beginPath();bx.moveTo(bcx-cs,bcy);bx.lineTo(bcx+cs,bcy);bx.stroke();
    bx.beginPath();bx.moveTo(bcx,bcy-cs);bx.lineTo(bcx,bcy+cs);bx.stroke();
    [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(([sx,sy])=>{
      const br=24,bl=8;
      bx.strokeStyle=`rgba(0,229,255,${.6+Math.sin(progress*Math.PI*4)*.3})`;bx.lineWidth=1.5;
      bx.beginPath();bx.moveTo(bcx+sx*br,bcy+sy*(br-bl));bx.lineTo(bcx+sx*br,bcy+sy*br);bx.lineTo(bcx+sx*(br-bl),bcy+sy*br);bx.stroke();
    });
    for(let i=0;i<6;i++){
      const a=(i/6)*Math.PI*2+progress*Math.PI*2, d=progress*120;
      bx.beginPath();bx.arc(bcx+Math.cos(a)*d,bcy+Math.sin(a)*d,2,0,Math.PI*2);
      bx.fillStyle=`rgba(0,255,179,${Math.max(0,.8-d/120)})`;bx.fill();
    }
    bFrame++;
    if(bFrame<totalFrames){requestAnimationFrame(drawBurst);}
    else{
      burst.style.background='rgba(0,229,255,0.08)';
      setTimeout(()=>{burst.style.opacity='0';burst.style.transition='opacity .5s';
        setTimeout(()=>{burst.remove();style.remove();if(cb)cb();},500);},400);
    }
  }
  drawBurst();
}

/* 8. SCANLINES */
function initScanlines() {
  document.addEventListener('mousemove',e=>{
    const card=e.target.closest('.opt-card,.rank-card,.asset-row');
    if(!card)return;
    const rect=card.getBoundingClientRect();
    card.style.setProperty('--scan-y',((e.clientY-rect.top)/rect.height*100).toFixed(1)+'%');
  });
  const s=document.createElement('style');
  s.textContent='.opt-card,.rank-card,.asset-row{--scan-y:50%}.opt-card:hover::after,.rank-card:hover::after,.asset-row:hover::after{content:"";position:absolute;left:0;right:0;top:var(--scan-y);height:1px;background:linear-gradient(90deg,transparent,rgba(0,229,255,0.15),transparent);pointer-events:none;}';
  document.head.appendChild(s);
}

/* 9. LIVE HUD CLOCK */
function initHUDStats() {
  const el=document.createElement('div');
  el.style.cssText="font-family:'Share Tech Mono',monospace;font-size:9px;color:rgba(139,173,200,0.4);letter-spacing:.1em;display:flex;gap:16px;align-items:center;";
  el.id='hudStats';
  document.querySelector('.hdr-left').appendChild(el);
  function update(){
    const n=new Date();
    el.textContent=n.toISOString().slice(0,10).replace(/-/g,'.')+' // '+n.toTimeString().slice(0,8)+' UTC';
  }
  update(); setInterval(update,1000);
}

/* 10. STAGGERED QUESTION REVEAL */
function animateQuestionsIn(pageEl) {
  pageEl.querySelectorAll('.q').forEach((q,i)=>{
    q.style.opacity='0'; q.style.transform='translateY(12px)';
    q.style.transition=`opacity .4s ease ${i*.08}s,transform .4s ease ${i*.08}s`;
    requestAnimationFrame(()=>requestAnimationFrame(()=>{q.style.opacity='1';q.style.transform='none';}));
  });
}

/* 11. HEADER FLICKER */
function initHdrFlicker() {
  const hdr=document.querySelector('.hdr-logo');
  let flicks=0;
  function flick(){
    if(flicks++>6)return;
    hdr.style.opacity=Math.random()>.5?'0.4':'1';
    setTimeout(flick,60+Math.random()*80);
  }
  setTimeout(flick,200);
}

/* ─────────────────────────────────────────────────────
   ENHANCED NAVIGATION with glitch
───────────────────────────────────────────────────── */
function goToAnimated(page) {
  if(page===currentPage)return;
  glitchTransition(()=>{
    goTo(page);
    const pageEl=document.getElementById('page'+page);
    if(pageEl)animateQuestionsIn(pageEl);
  });
}

document.getElementById('btnBack').onclick   = () => goToAnimated(currentPage-1);
document.getElementById('btnNext').onclick   = () => goToAnimated(currentPage+1);

/* ─────────────────────────────────────────────────────
   LAUNCH APP
───────────────────────────────────────────────────── */
function launchApp() {
  const boot=document.getElementById('boot');
  boot.style.transition='opacity .6s ease';
  boot.style.opacity='0';
  setTimeout(()=>{
    boot.style.display='none';
    document.getElementById('app').classList.add('visible');
    setTimeout(()=>{
      initRadar();
      initHUDCorners();
      initDataStreams();
      initReticles();
      initScanlines();
      initHUDStats();
      initHdrFlicker();
      animateQuestionsIn(document.getElementById('page1'));
      bindTrackers();
      restoreFromSession();
      setTimeout(()=>{
        const tag=document.querySelector('#page1 .ph-tag');
        if(tag)typewriterEl(tag,'PAGE 01 OF 03',55);
      },200);
    },100);
  },600);
}

/* Boot */
runBoot();
