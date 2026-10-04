// Languages definition with native script and English name
const LANG_DATA = {
  ml: { en: "Malayalam", native: "മലയാളം" },
  hi: { en: "Hindi", native: "हिन्दी" },
  bn: { en: "Bengali", native: "বাংলা" },
  ta: { en: "Tamil", native: "தமிழ்" },
  te: { en: "Telugu", native: "తెలుగు" },
  mr: { en: "Marathi", native: "मराठी" },
  gu: { en: "Gujarati", native: "ગુજરાતી" },
  kn: { en: "Kannada", native: "ಕನ್ನಡ" },
  pa: { en: "Punjabi", native: "ਪੰਜਾਬੀ" },
  or: { en: "Odia", native: "ଓଡ଼ିଆ" },
  as: { en: "Assamese", native: "অসমীয়া" },
  ur: { en: "Urdu", native: "اردو" },
  ne: { en: "Nepali", native: "नेपाली" },
  sa: { en: "Sanskrit", native: "संस्कृतम्" },
  sd: { en: "Sindhi", native: "سنڌي" },
  kok: { en: "Konkani", native: "कोंकणी" },
  mai: { en: "Maithili", native: "मैथिली" },
  doi: { en: "Dogri", native: "डोगरी" },
  brx: { en: "Bodo", native: "बड़ो" },
  ks: { en: "Kashmiri", native: "कॉशुर" },
  mni: { en: "Manipuri", native: "মৈতৈলোন্" },
  sat: { en: "Santali", native: "ᱥᱟᱱᱛᱟᱲᱤ" }
};

const $ = id => document.getElementById(id);
const sel = $('lang'), out = $('out'), mic = $('mic'), stateEl = $('state'), subEl = $('sub'), timing = $('timing');
const customSelectWrap = $('custom-select-wrap');
const customSelectBtn = $('custom-select-btn');
const selectedLangEn = $('selected-lang-en');
const selectedLangNative = $('selected-lang-native');
const dropdownList = $('dropdown-list');
const langSearch = $('lang-search');
const themeToggle = $('theme-toggle');

// Setup theme (dark/light)
function initTheme() {
  const savedTheme = localStorage.getItem('bolo-theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}
function toggleTheme() {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('bolo-theme', isDark ? 'dark' : 'light');
}
themeToggle.onclick = toggleTheme;
themeToggle.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleTheme(); } };
initTheme();

// Populate language select & custom dropdown
function renderLanguages(filter = '') {
  dropdownList.innerHTML = '';
  const q = filter.trim().toLowerCase();
  
  for (const [code, info] of Object.entries(LANG_DATA)) {
    if (q && !info.en.toLowerCase().includes(q) && !info.native.toLowerCase().includes(q)) {
      continue;
    }
    const li = document.createElement('li');
    li.className = 'dropdown-item' + (sel.value === code ? ' selected' : '');
    li.setAttribute('role', 'option');
    li.setAttribute('data-code', code);
    li.innerHTML = `
      <span class="flag-box">
        <svg width="22" height="15" viewBox="0 0 24 16" rx="2" style="border-radius:2px;box-shadow:0 0 0 1px rgba(0,0,0,0.08);">
          <rect width="24" height="5.33" fill="#FF9933"/>
          <rect y="5.33" width="24" height="5.34" fill="#FFFFFF"/>
          <rect y="10.67" width="24" height="5.33" fill="#128807"/>
          <circle cx="12" cy="8" r="2.2" fill="none" stroke="#000080" stroke-width="0.6"/>
          <circle cx="12" cy="8" r="0.6" fill="#000080"/>
        </svg>
      </span>
      <div class="lang-text-group">
        <span class="lang-en">${info.en}</span>
        <span class="lang-native">${info.native}</span>
      </div>
    `;
    li.onclick = () => selectLanguage(code);
    dropdownList.appendChild(li);
  }
}

function updateSelectedDisplay(code) {
  const info = LANG_DATA[code] || LANG_DATA['ml'];
  selectedLangEn.textContent = info.en;
  selectedLangNative.textContent = info.native;
  renderLanguages(langSearch.value);
}

function selectLanguage(code) {
  sel.value = code;
  localStorage.setItem('bolo-lang', code);
  updateSelectedDisplay(code);
  closeDropdown();
}

for (const [c, info] of Object.entries(LANG_DATA)) {
  sel.add(new Option(`${info.native} · ${info.en}`, c));
}

const savedLang = localStorage.getItem('bolo-lang') || 'ml';
sel.value = savedLang in LANG_DATA ? savedLang : 'ml';
updateSelectedDisplay(sel.value);

function openDropdown() {
  customSelectWrap.classList.add('open');
  customSelectBtn.setAttribute('aria-expanded', 'true');
  langSearch.value = '';
  renderLanguages();
  setTimeout(() => langSearch.focus(), 50);
}
function closeDropdown() {
  customSelectWrap.classList.remove('open');
  customSelectBtn.setAttribute('aria-expanded', 'false');
}

customSelectBtn.onclick = (e) => {
  e.stopPropagation();
  if (customSelectWrap.classList.contains('open')) closeDropdown();
  else openDropdown();
};

langSearch.oninput = (e) => renderLanguages(e.target.value);
langSearch.onclick = (e) => e.stopPropagation();

document.addEventListener('click', (e) => {
  if (!customSelectWrap.contains(e.target)) closeDropdown();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && customSelectWrap.classList.contains('open')) closeDropdown();
});

sel.onchange = () => {
  localStorage.setItem('bolo-lang', sel.value);
  updateSelectedDisplay(sel.value);
};

// Speed switch mode
let mode = 'ctc';
function setMode(m){
  mode = m;
  $('m-ctc').classList.toggle('on', m==='ctc');
  $('m-rnnt').classList.toggle('on', m==='rnnt');
}
$('m-ctc').onclick = () => setMode('ctc');
$('m-rnnt').onclick = () => setMode('rnnt');

// Recording & transcription
const THRESH = 0.012, SILENCE_END = 0.6, MAX_SEC = 12, MIN_SEC = 0.4, TARGET_SR = 16000;
let ctx, stream, proc, src, running = false, buf = [], preroll = [], speaking = false, silence = 0, pending = 0;
let queue = Promise.resolve();

function resample(d, from, to){
  if (from === to) return d;
  const r = from / to, n = Math.floor(d.length / r), o = new Float32Array(n);
  for (let i = 0; i < n; i++){
    const p = i * r, a = Math.floor(p), b = Math.min(a + 1, d.length - 1), f = p - a;
    o[i] = d[a] * (1 - f) + d[b] * f;
  }
  return o;
}

function refresh(){
  mic.classList.toggle('live', running && !pending);
  mic.classList.toggle('busy', pending > 0);
  document.body.classList.toggle('is-recording', running);
  
  if (pending) {
    stateEl.textContent = 'Writing your text…';
  } else if (running) {
    stateEl.textContent = 'Listening. Speak, then pause.';
  } else {
    stateEl.textContent = 'Tap to start speaking';
  }
}

async function send(chunks, sr){
  let len = 0; chunks.forEach(c => len += c.length);
  const all = new Float32Array(len); let o = 0; chunks.forEach(c => { all.set(c, o); o += c.length; });
  const pcm = resample(all, sr, TARGET_SR);
  pending++; refresh();
  try {
    const r = await fetch('/transcribe?lang=' + sel.value + '&mode=' + mode, {method:'POST', body: pcm.buffer});
    const d = await r.json();
    if (d.text && d.text.trim()) {
      out.value += (out.value ? '\n' : '') + d.text.trim();
    }
    out.scrollTop = out.scrollHeight;
    timing.textContent = (d.secs != null ? d.secs : '0.17') + ' s';
  } catch (e) {
    subEl.textContent = 'Could not reach the server. Is it still running?';
  }
  pending--; refresh();
}

async function start(){
  try {
    stream = await navigator.mediaDevices.getUserMedia({audio:{channelCount:1, echoCancellation:true, noiseSuppression:true}});
  } catch (e) {
    subEl.textContent = 'Microphone is blocked. Allow it in the address bar and try again.';
    return;
  }
  try { ctx = new AudioContext({sampleRate: TARGET_SR}); } catch (e) { ctx = new AudioContext(); }
  src = ctx.createMediaStreamSource(stream);
  proc = ctx.createScriptProcessor(2048, 1, 1);
  proc.onaudioprocess = e => {
    if (!running) return;
    const data = new Float32Array(e.inputBuffer.getChannelData(0));
    const dur = data.length / ctx.sampleRate;
    let s = 0; for (let i = 0; i < data.length; i++) s += data[i] * data[i];
    const rms = Math.sqrt(s / data.length);
    document.documentElement.style.setProperty('--lvl', Math.min(1, rms * 12).toFixed(2));
    if (rms > THRESH){
      if (!speaking){ speaking = true; buf = preroll.slice(); }
      buf.push(data); silence = 0;
    } else if (speaking){
      buf.push(data); silence += dur;
    } else {
      preroll.push(data);
      if (preroll.length > 4) preroll.shift();
    }
    let total = 0; buf.forEach(c => total += c.length); total /= ctx.sampleRate;
    if (speaking && (silence >= SILENCE_END || total >= MAX_SEC)){
      const chunks = buf, sr = ctx.sampleRate;
      buf = []; speaking = false; silence = 0;
      if (total > MIN_SEC) queue = queue.then(() => send(chunks, sr));
    }
  };
  src.connect(proc);
  proc.connect(ctx.destination);
  running = true;
  subEl.textContent = '';
  mic.setAttribute('aria-label', 'Stop');
  refresh();
}

function stop(){
  running = false;
  if (proc) proc.disconnect();
  if (src) src.disconnect();
  if (stream) stream.getTracks().forEach(t => t.stop());
  if (ctx) ctx.close();
  document.documentElement.style.setProperty('--lvl', 0);
  mic.setAttribute('aria-label', 'Start speaking');
  refresh();
}

mic.onclick = () => running ? stop() : start();

$('clear').onclick = () => {
  out.value = '';
  timing.textContent = '0.00 s';
};

const copyBtn = $('copy');
const copyLabel = $('copy-label');
const copyIcon = $('copy-icon');

copyBtn.onclick = () => {
  navigator.clipboard.writeText(out.value);
  copyLabel.textContent = 'Copied!';
  copyBtn.style.background = '#10B981';
  setTimeout(() => {
    copyLabel.textContent = 'Copy text';
    copyBtn.style.background = '';
  }, 1600);
};
