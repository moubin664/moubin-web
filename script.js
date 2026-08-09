const welcomeScreen = document.getElementById('welcomeScreen');
const siteContent = document.getElementById('siteContent');
const enterSite = document.getElementById('enterSite');

if(welcomeScreen && siteContent && enterSite){
  enterSite.addEventListener('click', () => {
    siteContent.removeAttribute('inert');
    siteContent.setAttribute('aria-hidden', 'false');
    document.body.classList.remove('welcome-pending');
    document.body.classList.add('welcome-entered');
    welcomeScreen.classList.add('is-leaving');
    window.setTimeout(() => { welcomeScreen.hidden = true; }, 520);
  }, { once: true });
}

const sections = document.querySelectorAll('[data-section]');
const navButtons = document.querySelectorAll('nav.mainnav button');
const mainNav = document.getElementById('mainNav');
const navToggle = document.getElementById('navToggle');

function setMainNavOpen(open){
  mainNav.classList.toggle('open', open);
  navToggle.setAttribute('aria-expanded', String(open));
  navToggle.setAttribute('aria-label', open ? '关闭菜单' : '打开菜单');
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
  window.addEventListener('resize', () => {
    updateScrollableCategoryHints();
    if(window.innerWidth > 768 && mainNav.classList.contains('open')){
      setMainNavOpen(false);
    }
  });
  requestAnimationFrame(updateScrollableCategoryHints);
}

initScrollableCategoryHints();

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
  const readingSection = document.getElementById('reading');
  if(!readingSection) return;

  const categories = readingSection.querySelectorAll('[data-reading-tab]');
  const contents = readingSection.querySelectorAll('[data-reading-panel]');
  const placeholder = readingSection.querySelector('#readingPlaceholder');

  categories.forEach(cat => {
    cat.addEventListener('click', () => {
      const tabKey = cat.dataset.readingTab;
      categories.forEach(c => {
        const active = c === cat;
        c.classList.toggle('active', active);
        c.setAttribute('aria-pressed', String(active));
      });
      contents.forEach(c => c.classList.remove('active'));
      if(placeholder) placeholder.style.display = 'none';
      cat.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });

      const targetContent = readingSection.querySelector(`[data-reading-panel="${tabKey}"]`);
      if(targetContent){
        targetContent.classList.add('active');
      }
    });
  });
}

initReadingTabs();

function initAIReadingTabs(){
  const aiSection = document.getElementById('ai');
  if(!aiSection) return;

  const categories = aiSection.querySelectorAll('[data-ai-tab]');
  const contents = aiSection.querySelectorAll('[data-ai-panel]');
  const placeholder = aiSection.querySelector('[data-ai-placeholder]');

  categories.forEach(cat => {
    cat.addEventListener('click', () => {
      const tabKey = cat.dataset.aiTab;
      categories.forEach(c => {
        const active = c === cat;
        c.classList.toggle('active', active);
        c.setAttribute('aria-pressed', String(active));
      });
      contents.forEach(c => c.classList.remove('active'));
      if(placeholder) placeholder.style.display = 'none';
      cat.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });

      const targetContent = aiSection.querySelector(`[data-ai-panel="${tabKey}"]`);
      if(targetContent) targetContent.classList.add('active');
    });
  });
}

initAIReadingTabs();

function initMaoArticleReader(){
  const reader = document.querySelector('[data-mao-reader]');
  if(!reader) return;

  const directory = reader.querySelector('[data-mao-directory]');
  const directoryList = reader.querySelector('[data-mao-directory-list]');
  const articleReader = reader.querySelector('[data-mao-article-reader]');
  if(!directory || !directoryList || !articleReader) return;

  const allArticles = Array.from(articleReader.querySelectorAll('.mao-article'));
  allArticles.forEach(article => {
    article.hidden = true;
  });
  const articles = allArticles.filter(article => {
    const heading = article.querySelector('h3');
    return heading && heading.textContent.trim();
  });
  let returnTarget = null;

  directoryList.replaceChildren();
  articles.forEach((article, index) => {
    const articleKey = `article-${index + 1}`;
    const articleId = `maoArticle${index + 1}`;
    const heading = article.querySelector('h3');

    article.id = articleId;
    article.dataset.maoArticle = articleKey;

    let toolbar = article.querySelector('.mao-article-toolbar');
    if(!toolbar){
      toolbar = document.createElement('div');
      toolbar.className = 'mao-article-toolbar';
      const backButton = document.createElement('button');
      backButton.type = 'button';
      backButton.dataset.maoBack = '';
      backButton.textContent = '← 返回文章目录';
      toolbar.appendChild(backButton);
      article.prepend(toolbar);
    }

    const directoryButton = document.createElement('button');
    directoryButton.type = 'button';
    directoryButton.dataset.maoOpen = articleKey;
    directoryButton.setAttribute('aria-controls', articleId);

    const number = document.createElement('span');
    number.textContent = String(index + 1).padStart(2, '0');
    const title = document.createElement('strong');
    title.textContent = heading.textContent.trim();
    const action = document.createElement('span');
    action.textContent = '进入阅读';
    action.setAttribute('aria-hidden', 'true');

    directoryButton.append(number, title, action);
    directoryList.appendChild(directoryButton);
  });

  function openArticle(button){
    const key = button.dataset.maoOpen;
    const target = articles.find(article => article.dataset.maoArticle === key);
    if(!target) return;

    returnTarget = button;
    directory.hidden = true;
    articleReader.hidden = false;
    articles.forEach(article => {
      article.hidden = article !== target;
    });
    reader.scrollTo({ top: 0, behavior: 'auto' });
    target.querySelector('[data-mao-back]')?.focus({ preventScroll: true });
  }

  function showDirectory(){
    articles.forEach(article => {
      article.hidden = true;
    });
    articleReader.hidden = true;
    directory.hidden = false;
    reader.scrollTo({ top: 0, behavior: 'auto' });
    returnTarget?.focus({ preventScroll: true });
  }

  directoryList.querySelectorAll('[data-mao-open]').forEach(button => {
    button.addEventListener('click', () => openArticle(button));
  });
  reader.querySelectorAll('[data-mao-back]').forEach(button => {
    button.addEventListener('click', showDirectory);
  });
}

initMaoArticleReader();

function initArticleTabs(){
  const articleLayout = document.querySelector('#articles .notes-layout');
  if(!articleLayout) return;

  articleLayout.querySelectorAll('.notes-category').forEach(cat => {
    cat.addEventListener('click', () => {
      const tabKey = cat.dataset.notesTab;
      articleLayout.querySelectorAll('.notes-category').forEach(c => {
        const active = c === cat;
        c.classList.toggle('active', active);
        c.setAttribute('aria-pressed', String(active));
      });
      articleLayout.querySelectorAll('.notes-tab-content').forEach(c => c.classList.remove('active'));
      const placeholder = articleLayout.querySelector('[data-notes-placeholder]');
      if(placeholder) placeholder.style.display = 'none';
      cat.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      const targetContent = articleLayout.querySelector(`.notes-tab-content[data-notes-panel="${tabKey}"]`);
      if(targetContent) targetContent.classList.add('active');
    });
  });
}

initArticleTabs();
