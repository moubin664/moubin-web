const sections = document.querySelectorAll('[data-section]');
const navButtons = document.querySelectorAll('nav.mainnav button');
const mainNav = document.getElementById('mainNav');
const navToggle = document.getElementById('navToggle');

function setMainNavOpen(open){
  mainNav.classList.toggle('open', open);
  navToggle.setAttribute('aria-expanded', String(open));
}

function goTo(target){
  sections.forEach(s => s.classList.toggle('active', s.id === target));
  navButtons.forEach(b => b.classList.toggle('active', b.dataset.target === target));
  document.body.classList.toggle('other-side-open', target === 'other-side');
  window.scrollTo({top:0, behavior:'smooth'});
  setMainNavOpen(false);
  requestAnimationFrame(updateScrollableCategoryHints);
}

document.querySelectorAll('[data-target]').forEach(el => {
  el.addEventListener('click', () => goTo(el.dataset.target));
});

navToggle.addEventListener('click', () => {
  setMainNavOpen(!mainNav.classList.contains('open'));
});

document.addEventListener('click', event => {
  if(mainNav.classList.contains('open') && !event.target.closest('#siteHeader')){
    setMainNavOpen(false);
  }
});

document.addEventListener('keydown', event => {
  if(event.key === 'Escape') setMainNavOpen(false);
});

window.addEventListener('scroll', () => {
  document.getElementById('siteHeader').classList.toggle('scrolled', window.scrollY > 10);
});

function updateScrollableCategoryHints(){
  document.querySelectorAll('.reading-sidebar, .notes-sidebar, .swim-sidebar').forEach(sidebar => {
    const hasMoreRight = sidebar.scrollLeft + sidebar.clientWidth < sidebar.scrollWidth - 2;
    sidebar.classList.toggle('has-more-right', hasMoreRight);
  });
}

function initScrollableCategoryHints(){
  document.querySelectorAll('.reading-sidebar, .notes-sidebar, .swim-sidebar').forEach(sidebar => {
    sidebar.addEventListener('scroll', updateScrollableCategoryHints, { passive: true });
  });
  window.addEventListener('resize', updateScrollableCategoryHints);
  requestAnimationFrame(updateScrollableCategoryHints);
}

initScrollableCategoryHints();

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
      categories.forEach(c => {
        const active = c === cat;
        c.classList.toggle('active', active);
        c.setAttribute('aria-pressed', String(active));
      });
      contents.forEach(c => c.classList.remove('active'));
      placeholder.style.display = 'none';
      cat.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });

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
      categories.forEach(c => {
        const active = c === cat;
        c.classList.toggle('active', active);
        c.setAttribute('aria-pressed', String(active));
      });
      contents.forEach(c => c.classList.remove('active'));
      placeholder.style.display = 'none';
      cat.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });

      const targetContent = document.querySelector(`.reading-tab-content[data-reading-panel="${tabKey}"]`);
      if(targetContent){
        targetContent.classList.add('active');
      }
    });
  });
}

initReadingTabs();

function initNotesTabs(){
  document.querySelectorAll('.notes-category').forEach(cat => {
    cat.addEventListener('click', () => {
      const layout = cat.closest('.notes-layout');
      const tabKey = cat.dataset.notesTab;
      layout.querySelectorAll('.notes-category').forEach(c => {
        const active = c === cat;
        c.classList.toggle('active', active);
        c.setAttribute('aria-pressed', String(active));
      });
      layout.querySelectorAll('.notes-tab-content').forEach(c => c.classList.remove('active'));
      const placeholder = layout.querySelector('[data-notes-placeholder]');
      if(placeholder) placeholder.style.display = 'none';
      cat.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      const targetContent = layout.querySelector(`.notes-tab-content[data-notes-panel="${tabKey}"]`);
      if(targetContent) targetContent.classList.add('active');
    });
  });
}

initNotesTabs();

async function loadList(key){
  try{
    if(!window.storage){
      return JSON.parse(localStorage.getItem(key) || '[]');
    }
    const res = await window.storage.get(key, true);
    return res ? JSON.parse(res.value) : [];
  }catch(e){
    return [];
  }
}

async function saveList(key, list){
  try{
    if(!window.storage){
      localStorage.setItem(key, JSON.stringify(list));
      return true;
    }
    const res = await window.storage.set(key, JSON.stringify(list), true);
    return !!res;
  }catch(e){
    console.error('storage error', e);
    return false;
  }
}

function fmtTime(ts){
  const d = new Date(ts);
  const pad = n => String(n).padStart(2,'0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const CONTENT_KEYS = { reading: 'content-reading', swim: 'content-swim', misc: 'content-life' };
let contentCache = { reading:{}, swim:{}, misc:{} };

async function loadContent(moduleKey){
  try{
    if(!window.storage){
      const data = JSON.parse(localStorage.getItem(CONTENT_KEYS[moduleKey]) || '{}');
      if(moduleKey === 'misc' && data.main && !data.other) data.other = data.main;
      return data;
    }
    const res = await window.storage.get(CONTENT_KEYS[moduleKey], true);
    const data = res ? JSON.parse(res.value) : {};
    if(moduleKey === 'misc' && data.main && !data.other) data.other = data.main;
    return data;
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
    let ok = true;
    if(window.storage){
      ok = !!(await window.storage.set(CONTENT_KEYS[mod], JSON.stringify(data), true));
    }else{
      localStorage.setItem(CONTENT_KEYS[mod], JSON.stringify(data));
    }
    contentCache[mod] = data;
    btn.textContent = ok ? '已保存' : '保存失败';
    updateWriteStatus(mod, key);
    setTimeout(() => { btn.textContent = original; btn.disabled = false; }, 1400);
  });
});

initContentAreas();
