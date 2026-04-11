// ─── CONFIG ───────────────────────────────────────────────
const GOOGLE_CLIENT_ID = '979310332442-0t0lk766on6n5r4qqdmsci9riuqjo04v.apps.googleusercontent.com';
const CLAUDE_MODEL = 'claude-sonnet-4-20250514';

// ─── STATE ────────────────────────────────────────────────
let currentUser = null;
let savedPrayers = [];

// ─── INIT ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initGoogleAuth();
  loadSavedFromStorage();
  showPage('home');

  // nav clicks
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => showPage(link.dataset.page));
  });

  // hero buttons
  document.getElementById('heroGenBtn').addEventListener('click', () => showPage('gen'));
  document.getElementById('heroCatBtn').addEventListener('click', () => showPage('cat'));

  // textarea
  const ta = document.getElementById('prayerTopic');
  ta.addEventListener('input', () => {
    document.getElementById('charCount').textContent = ta.value.length + ' / 300';
    if (ta.value.length > 300) ta.value = ta.value.slice(0, 300);
  });

  // generate
  document.getElementById('generateBtn').addEventListener('click', generatePrayer);
  ta.addEventListener('keydown', e => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) generatePrayer();
  });
});

// ─── NAVIGATION ───────────────────────────────────────────
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  document.getElementById('page-' + id).classList.add('active');
  const link = document.querySelector(`.nav-link[data-page="${id}"]`);
  if (link) link.classList.add('active');
  window.scrollTo(0, 0);

  if (id === 'saved') renderSaved();
}

// ─── CHIP / CATEGORY SHORTCUTS ────────────────────────────
function setTopic(text) {
  document.getElementById('prayerTopic').value = text;
  document.getElementById('charCount').textContent = text.length + ' / 300';
  showPage('gen');
  document.getElementById('prayerTopic').focus();
}

// ─── PRAYER GENERATION ────────────────────────────────────
async function generatePrayer() {
  const topic = document.getElementById('prayerTopic').value.trim();
  if (!topic) {
    document.getElementById('prayerTopic').focus();
    return;
  }

  document.getElementById('spinner').style.display = 'block';
  document.getElementById('prayerResult').style.display = 'none';
  document.getElementById('generateBtn').disabled = true;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: `Write a contemporary, heartfelt Christian prayer about: "${topic}".

Requirements:
- Personal, warm, conversational tone — not formal or archaic
- First person (I / we)
- 130–180 words
- Begin directly with "Lord," or "Heavenly Father," or "Father God,"
- End with "Amen."
- No headings, no explanation — just the prayer text itself`
        }]
      })
    });

    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    const text = data.content.map(b => b.text || '').join('').trim();

    document.getElementById('spinner').style.display = 'none';
    renderPrayer(text, topic);

  } catch (err) {
    document.getElementById('spinner').style.display = 'none';
    showToast('Something went wrong. Please try again.');
    console.error(err);
  } finally {
    document.getElementById('generateBtn').disabled = false;
  }
}

function renderPrayer(text, topic) {
  const el = document.getElementById('prayerResult');
  el.style.display = 'block';

  document.getElementById('prayerText').textContent = text;

  const saveBtn = document.getElementById('saveBtn');
  saveBtn.onclick = () => savePrayer(text, topic);

  document.getElementById('copyBtn').onclick = () => {
    navigator.clipboard.writeText(text).then(() => showToast('Copied to clipboard'));
  };

  document.getElementById('regenerateBtn').onclick = generatePrayer;

  el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ─── SAVE / STORAGE ───────────────────────────────────────
function savePrayer(text, topic) {
  if (!currentUser) {
    showToast('Sign in to save prayers');
    return;
  }

  const prayer = {
    id: Date.now(),
    text,
    topic,
    date: new Date().toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' }),
    userId: currentUser.sub
  };

  savedPrayers.unshift(prayer);
  persistSaved();
  showToast('Prayer saved');
}

function persistSaved() {
  if (!currentUser) return;
  localStorage.setItem('almighty_saved_' + currentUser.sub, JSON.stringify(savedPrayers));
}

function loadSavedFromStorage() {
  // loaded after sign-in when we know the user
}

function renderSaved() {
  const container = document.getElementById('savedContent');

  if (!currentUser) {
    container.innerHTML = `
      <div class="sign-in-gate">
        <h3>Your saved prayers</h3>
        <p>Sign in with Google to save prayers and revisit them anytime.</p>
        <button class="google-btn" onclick="signIn()">
          <svg width="16" height="16" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Sign in with Google
        </button>
      </div>`;
    return;
  }

  if (savedPrayers.length === 0) {
    container.innerHTML = `
      <div class="page-header">
        <h2>Saved prayers</h2>
        <p>Prayers you've saved will appear here.</p>
      </div>
      <div class="empty-state">
        <span style="font-size:28px;font-family:var(--serif);">✦</span>
        <p>No saved prayers yet — generate one and save it.</p>
      </div>`;
    return;
  }

  container.innerHTML = `
    <div class="page-header">
      <h2>Saved prayers</h2>
      <p>${savedPrayers.length} prayer${savedPrayers.length !== 1 ? 's' : ''} saved</p>
    </div>
    <div class="saved-list" id="savedList"></div>`;

  const list = document.getElementById('savedList');
  savedPrayers.forEach(p => {
    const card = document.createElement('div');
    card.className = 'saved-card';
    card.innerHTML = `
      <div class="saved-card-meta">
        <span class="saved-card-topic">${escHtml(p.topic)}</span>
        <span class="saved-card-date">${p.date}</span>
      </div>
      <div class="saved-card-snippet">${escHtml(p.text)}</div>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-top:12px;">
        <span class="saved-card-tag">Saved</span>
        <button class="action-btn" onclick="deletePrayer(${p.id}, this)" style="font-size:11px;">Remove</button>
      </div>`;
    list.appendChild(card);
  });
}

function deletePrayer(id, btn) {
  savedPrayers = savedPrayers.filter(p => p.id !== id);
  persistSaved();
  btn.closest('.saved-card').remove();
  if (savedPrayers.length === 0) renderSaved();
}

// ─── GOOGLE AUTH ──────────────────────────────────────────
function initGoogleAuth() {
  window.google?.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: handleCredential,
    auto_select: true
  });
}

function signIn() {
  window.google?.accounts.id.prompt();
}

function handleCredential(response) {
  const payload = parseJwt(response.credential);
  currentUser = payload;

  // load this user's saved prayers
  const stored = localStorage.getItem('almighty_saved_' + payload.sub);
  savedPrayers = stored ? JSON.parse(stored) : [];

  // update UI
  document.getElementById('navSignIn').style.display = 'none';
  const avatar = document.getElementById('navAvatar');
  avatar.style.display = 'flex';
  const initials = (payload.given_name?.[0] || '') + (payload.family_name?.[0] || '');
  avatar.textContent = initials.toUpperCase() || payload.email[0].toUpperCase();
  avatar.title = payload.name || payload.email;

  showToast('Signed in as ' + (payload.name || payload.email));

  // re-render saved if on that page
  if (document.getElementById('page-saved').classList.contains('active')) renderSaved();
}

function parseJwt(token) {
  const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
  return JSON.parse(decodeURIComponent(atob(base64).split('').map(c =>
    '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
  ).join('')));
}

// ─── TOAST ────────────────────────────────────────────────
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

// ─── UTILS ────────────────────────────────────────────────
function escHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
