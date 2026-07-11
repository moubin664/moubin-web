const sections = document.querySelectorAll('[data-section]');
const navButtons = document.querySelectorAll('nav.mainnav button');
const mainNav = document.getElementById('mainNav');
const navToggle = document.getElementById('navToggle');

function goTo(target){
  sections.forEach(s => s.classList.toggle('active', s.id === target));
  navButtons.forEach(b => b.classList.toggle('active', b.dataset.target === target));
  window.scrollTo({top:0, behavior:'smooth'});
  mainNav.classList.remove('open');
}

document.querySelectorAll('[data-target]').forEach(el => {
  el.addEventListener('click', () => goTo(el.dataset.target));
});

navToggle.addEventListener('click', () => mainNav.classList.toggle('open'));

window.addEventListener('scroll', () => {
  document.getElementById('siteHeader').classList.toggle('scrolled', window.scrollY > 10);
});

function initBrainAnimation(){
  const nodesContainer = document.getElementById('nodesContainer');
  const connectionsContainer = document.getElementById('connectionsContainer');
  if(!nodesContainer || !connectionsContainer) return;

  const centerX = 50;
  const centerY = 50;
  const nodes = [];
  const nodeCount = 12;

  for(let i=0; i<nodeCount; i++){
    const angle = (i / nodeCount) * Math.PI * 2;
    const radius = 25 + Math.random() * 20;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    nodes.push({ x, y });

    const node = document.createElement('div');
    node.className = 'brain-node';
    node.style.left = x + '%';
    node.style.top = y + '%';
    node.style.animationDelay = (i * 0.15) + 's';
    nodesContainer.appendChild(node);
  }

  for(let i=0; i<nodes.length; i++){
    const startNode = nodes[i];
    const connectionsPerNode = 2;
    for(let j=0; j<connectionsPerNode; j++){
      const endIndex = (i + 1 + j) % nodes.length;
      const endNode = nodes[endIndex];

      const dx = endNode.x - startNode.x;
      const dy = endNode.y - startNode.y;
      const length = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);

      const line = document.createElement('div');
      line.className = 'brain-connection';
      line.style.left = startNode.x + '%';
      line.style.top = startNode.y + '%';
      line.style.width = length + '%';
      line.style.transform = `rotate(${angle}deg)`;
      line.style.animationDelay = ((i * 0.1) + j * 0.05 + 0.8) + 's';
      connectionsContainer.appendChild(line);
    }
  }

  let activeLineIndex = 0;
  const allLines = connectionsContainer.querySelectorAll('.brain-connection');
  setInterval(() => {
    if(allLines.length === 0) return;
    allLines.forEach((line, idx) => {
      line.style.opacity = idx === activeLineIndex ? '0.8' : '0.2';
    });
    activeLineIndex = (activeLineIndex + 1) % allLines.length;
  }, 600);
}

initBrainAnimation();

function initSwimTabs(){
  const categories = document.querySelectorAll('.swim-category');
  const contents = document.querySelectorAll('.swim-tab-content');
  const placeholder = document.getElementById('swimPlaceholder');

  categories.forEach(cat => {
    cat.addEventListener('click', () => {
      const tabKey = cat.dataset.swimTab;
      categories.forEach(c => c.classList.remove('active'));
      cat.classList.add('active');
      contents.forEach(c => c.classList.remove('active'));
      placeholder.style.display = 'none';

      const targetContent = document.querySelector(`.swim-tab-content[data-swim-panel="${tabKey}"]`);
      if(targetContent){
        targetContent.classList.add('active');
      }
    });
  });
}

initSwimTabs();

function initReadingTabs(){
  const categories = document.querySelectorAll('.reading-category');
  const contents = document.querySelectorAll('.reading-tab-content');
  const placeholder = document.getElementById('readingPlaceholder');

  categories.forEach(cat => {
    cat.addEventListener('click', () => {
      const tabKey = cat.dataset.readingTab;
      categories.forEach(c => c.classList.remove('active'));
      cat.classList.add('active');
      contents.forEach(c => c.classList.remove('active'));
      placeholder.style.display = 'none';

      const targetContent = document.querySelector(`.reading-tab-content[data-reading-panel="${tabKey}"]`);
      if(targetContent){
        targetContent.classList.add('active');
      }
    });
  });
}

initReadingTabs();

async function loadList(key){
  try{
    const res = await window.storage.get(key, true);
    return res ? JSON.parse(res.value) : [];
  }catch(e){
    return [];
  }
}

async function saveList(key, list){
  try{
    const res = await window.storage.set(key, JSON.stringify(list), true);
    return !!res;
  }catch(e){
    console.error('storage error', e);
    return false;
  }
}

function escapeHtml(str){
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function fmtDate(dateStr){
  const d = new Date(dateStr + 'T00:00:00');
  if(isNaN(d)) return dateStr;
  const weekdays = ['周日','周一','周二','周三','周四','周五','周六'];
  return `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日 ${weekdays[d.getDay()]}`;
}

function fmtTime(ts){
  const d = new Date(ts);
  const pad = n => String(n).padStart(2,'0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const DIARY_KEY = 'diary-entries';
const diaryList = document.getElementById('diaryList');
const diaryForm = document.getElementById('diaryForm');

function renderDiary(entries){
  if(!entries.length){
    diaryList.innerHTML = `
      <div class="empty-state" style="margin-left:-26px;">
        <h4>还没有日记</h4>
        <p>写下第一篇，开启这段纵向的时间线。</p>
      </div>`;
    return;
  }
  const sorted = [...entries].sort((a,b) => (b.date+b.created).localeCompare(a.date+a.created));
  diaryList.innerHTML = sorted.map(e => `
    <div class="diary-entry">
      <div class="d-date">${fmtDate(e.date)}</div>
      <h4>${escapeHtml(e.title)}</h4>
      <div class="d-content">${escapeHtml(e.content)}</div>
    </div>
  `).join('');
}

async function initDiary(){
  const entries = await loadList(DIARY_KEY);
  renderDiary(entries);
}

const DIARY_PASSWORD = 'jiangchen';
const dPasswordError = document.getElementById('dPasswordError');
const dPasswordInput = document.getElementById('dPassword');

diaryForm.addEventListener('submit', async (ev) => {
  ev.preventDefault();
  const date = document.getElementById('dDate').value;
  const title = document.getElementById('dTitle').value.trim();
  const content = document.getElementById('dContent').value.trim();
  const password = dPasswordInput.value;
  if(!date || !title || !content) return;

  if(password !== DIARY_PASSWORD){
    dPasswordError.classList.add('show');
    dPasswordInput.value = '';
    dPasswordInput.focus();
    return;
  }
  dPasswordError.classList.remove('show');

  const submitBtn = diaryForm.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = '发布中…';

  const entries = await loadList(DIARY_KEY);
  entries.push({
    id: Date.now().toString(36) + Math.random().toString(36).slice(2,7),
    date, title, content,
    created: Date.now().toString()
  });
  const ok = await saveList(DIARY_KEY, entries);
  submitBtn.disabled = false;
  submitBtn.textContent = '发布日记';

  if(ok){
    diaryForm.reset();
    document.getElementById('dDate').valueAsDate = new Date();
    renderDiary(entries);
  }else{
    alert('保存失败，请稍后重试');
  }
});

const MSG_KEY = 'guestbook-messages';
const msgList = document.getElementById('msgList');
const msgForm = document.getElementById('msgForm');

function renderMessages(list){
  if(!list.length){
    msgList.innerHTML = `
      <div class="empty-state">
        <h4>还没有留言</h4>
        <p>成为第一个留下涟漪的人吧。</p>
      </div>`;
    return;
  }
  const sorted = [...list].sort((a,b) => b.ts - a.ts);
  msgList.innerHTML = sorted.map(m => `
    <div class="msg-card">
      <div class="m-top">
        <span class="m-name">${escapeHtml(m.name || '匿名')}</span>
        <span class="m-time">${fmtTime(m.ts)}</span>
      </div>
      <div class="m-text">${escapeHtml(m.text)}</div>
    </div>
  `).join('');
}

async function initMessages(){
  const list = await loadList(MSG_KEY);
  renderMessages(list);
}

msgForm.addEventListener('submit', async (ev) => {
  ev.preventDefault();
  const name = document.getElementById('mName').value.trim();
  const text = document.getElementById('mText').value.trim();
  if(!text) return;

  const submitBtn = msgForm.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = '发送中…';

  const list = await loadList(MSG_KEY);
  list.push({
    id: Date.now().toString(36) + Math.random().toString(36).slice(2,7),
    name, text, ts: Date.now()
  });
  const ok = await saveList(MSG_KEY, list);
  submitBtn.disabled = false;
  submitBtn.textContent = '留下这句话';

  if(ok){
    msgForm.reset();
    renderMessages(list);
  }else{
    alert('留言发送失败，请稍后重试');
  }
});

const CONTENT_KEYS = { reading: 'content-reading', swim: 'content-swim', life: 'content-life' };
let contentCache = { reading:{}, swim:{}, life:{} };

async function loadContent(moduleKey){
  try{
    const res = await window.storage.get(CONTENT_KEYS[moduleKey], true);
    return res ? JSON.parse(res.value) : {};
  }catch(e){
    return {};
  }
}

function updateWriteStatus(mod, key){
  const entry = contentCache[mod][key];
  const statusEl = document.querySelector(`.write-status[data-status-for="${mod}:${key}"]`);
  if(!statusEl) return;
  statusEl.textContent = (entry && entry.text) ? `最近保存于 ${fmtTime(entry.updated)}` : '尚未保存内容';
}

async function initContentAreas(){
  for(const mod of Object.keys(CONTENT_KEYS)){
    contentCache[mod] = await loadContent(mod);
    document.querySelectorAll(`.write-box[data-module="${mod}"]`).forEach(box => {
      const key = box.dataset.key;
      const entry = contentCache[mod][key];
      if(entry && entry.text) box.value = entry.text;
      updateWriteStatus(mod, key);
    });
  }
}

document.querySelectorAll('.btn-save').forEach(btn => {
  btn.addEventListener('click', async () => {
    const [mod, key] = btn.dataset.save.split(':');
    const box = document.querySelector(`.write-box[data-module="${mod}"][data-key="${key}"]`);
    const text = box.value;
    const original = btn.textContent;
    btn.disabled = true;
    btn.textContent = '保存中…';
    const data = await loadContent(mod);
    data[key] = { text, updated: Date.now() };
    const ok = await window.storage.set(CONTENT_KEYS[mod], JSON.stringify(data), true);
    contentCache[mod] = data;
    btn.textContent = ok ? '已保存' : '保存失败';
    updateWriteStatus(mod, key);
    setTimeout(() => { btn.textContent = original; btn.disabled = false; }, 1400);
  });
});

document.getElementById('dDate').valueAsDate = new Date();

initDiary();
initMessages();
initContentAreas();