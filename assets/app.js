/* ===================================================================
 * Vibe Coding 互动课件 · 交互逻辑
 * 纯原生 JS，无构建、无依赖，双击 index.html 即可使用
 * =================================================================== */
(function () {
  'use strict';

  const CH = COURSE.chapters;
  const META = COURSE.meta;
  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));
  const STORE_PROGRESS = 'vibe-course-progress-v1';
  const STORE_THEME = 'vibe-course-theme-v1';

  let currentId = 'c0';
  let progress = new Set();
  let CODE_STORE = [];
  let QUIZ_STORE = [];
  const QUIZ_STATE = {};           // 跨章节保留答题状态
  let searchFocus = 0;
  let searchHits = [];

  /* ---------------- 工具 ---------------- */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /* 轻量行内 Markdown：**加粗**、`代码`、[链接](url) */
  function inline(s) {
    let t = esc(s);
    const codes = [];
    t = t.replace(/`([^`]+)`/g, (_, c) => { codes.push(c); return '\u0001' + (codes.length - 1) + '\u0001'; });
    t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    t = t.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    t = t.replace(/\u0001(\d+)\u0001/g, (_, i) => '<code>' + codes[+i] + '</code>');
    return t.replace(/\n/g, '<br>');
  }

  const KEYWORDS = new Set((
    'const let var function return async await if else for while of in new class import from require export ' +
    'default true false null undefined try catch throw typeof this break continue switch case delete void ' +
    'git npm npx uvx node cd mkdir printf echo curl sudo ls cat head add commit push pull status diff log ' +
    'restore switch branch tag stash reflog merge clone init config python3 '
  ).split(' '));

  function hlMarkdown(code) {
    return code.split('\n').map(line => {
      if (/^#{1,6}\s/.test(line)) return '<span class="tk-hd">' + esc(line) + '</span>';
      if (/^---\s*$/.test(line)) return '<span class="tk-punc">' + esc(line) + '</span>';
      if (/^\s*[-*]\s|^\s*\d+\.\s/.test(line)) return '<span class="tk-str">' + esc(line) + '</span>';
      return esc(line)
        .replace(/`([^`]+)`/g, '<span class="tk-fn">`$1`</span>')
        .replace(/\*\*([^*]+)\*\*/g, '<span class="tk-hd">**$1**</span>');
    }).join('\n');
  }

  /* 手写扫描式语法高亮（先分词再转义，避免破坏 HTML 实体） */
  function highlight(code, lang) {
    const l = (lang || 'text').toLowerCase();
    if (l === 'markdown' || l === 'md') return hlMarkdown(code);
    const isSlash = /^(js|javascript|jsx|ts|typescript|json|jsonc)$/.test(l);
    const isHash = /^(bash|sh|shell|zsh|gitignore|python|py|yaml|yml|text|txt|ini)$/.test(l);
    let out = '', i = 0;
    const push = (cls, s) => { out += '<span class="tk-' + cls + '">' + esc(s) + '</span>'; };
    while (i < code.length) {
      const c = code[i], rest = code.slice(i);
      if ((isSlash && c === '/' && code[i + 1] === '/') || (isHash && c === '#')) {
        let j = code.indexOf('\n', i); if (j < 0) j = code.length;
        push('cm', code.slice(i, j)); i = j; continue;
      }
      if (c === '"' || c === "'" || c === '`') {
        let j = i + 1;
        while (j < code.length) {
          if (code[j] === '\\') { j += 2; continue; }
          if (code[j] === c) { j++; break; }
          if (code[j] === '\n' && c !== '`') break;
          j++;
        }
        push('str', code.slice(i, j)); i = j; continue;
      }
      if (/[0-9]/.test(c) && !/[A-Za-z_$]/.test(code[i - 1] || '')) {
        const m = /^\d+(?:\.\d+)?/.exec(rest);
        if (m) { push('num', m[0]); i += m[0].length; continue; }
      }
      if (/[A-Za-z_$]/.test(c)) {
        const m = /^[A-Za-z_$][\w$-]*/.exec(rest), w = m[0];
        if (KEYWORDS.has(w)) push('kw', w);
        else if (/^\s*\(/.test(rest.slice(w.length))) push('fn', w);
        else out += esc(w);
        i += w.length; continue;
      }
      if (/[{}()\[\]:;,=><+\-*/|&!?]/.test(c)) { push('punc', c); i++; continue; }
      out += esc(c); i++;
    }
    return out;
  }

  function toast(msg) {
    const el = $('#toast');
    el.textContent = msg; el.classList.add('show');
    clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove('show'), 1900);
  }

  /* ---------------- 进度 / 主题 ---------------- */
  function loadProgress() {
    try { progress = new Set(JSON.parse(localStorage.getItem(STORE_PROGRESS) || '[]')); } catch (e) { progress = new Set(); }
  }
  function saveProgress() {
    try { localStorage.setItem(STORE_PROGRESS, JSON.stringify(Array.from(progress))); } catch (e) {}
  }
  function updateProgressUI() {
    const n = progress.size, total = CH.length, pct = Math.round(n / total * 100);
    $('#progressText').textContent = n + ' / ' + total;
    $('#progressFill').style.width = pct + '%';
    $('#globalBarFill').style.width = pct + '%';
    $$('.nav-item').forEach(btn => {
      const done = progress.has(btn.dataset.id);
      btn.classList.toggle('done', done);
      const chk = btn.querySelector('.nav-check');
      if (chk) chk.textContent = done ? '✓' : '';
    });
  }
  function applyTheme(t) {
    document.documentElement.dataset.theme = t;
    $('#themeBtn').textContent = t === 'dark' ? '☀️' : '🌙';
    try { localStorage.setItem(STORE_THEME, t); } catch (e) {}
  }

  /* ---------------- 侧栏目录 ---------------- */
  function buildNav() {
    const byId = Object.fromEntries(CH.map(c => [c.id, c]));
    let html = '';
    COURSE.groups.forEach(g => {
      html += '<div class="nav-group"><div class="nav-group-label">' + esc(g.name) + '</div>';
      g.ids.forEach(id => {
        const c = byId[id]; if (!c) return;
        html += '<button class="nav-item" data-id="' + c.id + '">' +
          '<span class="nav-no">' + c.no + '</span>' +
          '<span>' + esc(c.title) + '</span>' +
          '<span class="nav-check"></span></button>';
      });
      html += '</div>';
    });
    $('#nav').innerHTML = html;
    $$('.nav-item').forEach(btn => btn.addEventListener('click', () => {
      go(btn.dataset.id); closeSidebar();
    }));
  }

  /* ---------------- 内容块渲染 ---------------- */
  function renderBlock(b, idx) {
    switch (b.t) {
      case 'p': return '<p class="block-p">' + inline(b.x) + '</p>';
      case 'h': return '<h2 class="block-h">' + inline(b.x) + '</h2>';
      case 'sub': return '<h3 class="block-sub">' + inline(b.x) + '</h3>';
      case 'list': return '<ul class="block-list">' + b.x.map(li => '<li>' + inline(li) + '</li>').join('') + '</ul>';
      case 'ol': return '<ol class="block-ol">' + b.x.map(li => '<li>' + inline(li) + '</li>').join('') + '</ol>';
      case 'steps': return '<div class="block-steps">' + b.x.map((s, i) =>
        '<div class="step"><div class="step-no">' + (i + 1) + '</div><div class="step-body">' +
        '<div class="step-h">' + inline(s.h) + '</div><div class="step-x">' + inline(s.x) + '</div></div></div>').join('') + '</div>';
      case 'table': return '<div class="table-wrap"><table><thead><tr>' +
        b.h.map(h => '<th>' + inline(h) + '</th>').join('') + '</tr></thead><tbody>' +
        b.r.map(row => '<tr>' + row.map(cell => '<td>' + inline(cell) + '</td>').join('') + '</tr>').join('') +
        '</tbody></table></div>';
      case 'code': {
        const n = CODE_STORE.length; CODE_STORE.push(b.x);
        return '<div class="code-block"><div class="code-head">' +
          '<span class="code-lang">' + esc(b.l || 'text') + '</span>' +
          '<span class="code-cap">' + esc(b.h || '') + '</span>' +
          '<button class="copy-btn" data-copy="' + n + '">复制</button></div>' +
          '<pre><code>' + highlight(b.x, b.l) + '</code></pre></div>';
      }
      case 'note': {
        const icon = { key: '🔑', tip: '💡', warn: '⚠️', info: 'ℹ️' }[b.k] || '💡';
        return '<div class="note note-' + esc(b.k) + '">' +
          '<div class="note-title">' + icon + ' ' + inline(b.h) + '</div>' +
          '<div class="note-body">' + inline(b.x) + '</div></div>';
      }
      case 'cards': return '<div class="card-grid">' + b.x.map(c =>
        '<div class="info-card"><div class="info-card-h"><span class="info-card-i">' + esc(c.i) + '</span>' + inline(c.h) + '</div>' +
        '<div class="info-card-x">' + inline(c.x) + '</div></div>').join('') + '</div>';
      case 'svg': return '<figure class="figure">' + (SVG[b.k] || '') +
        (b.cap ? '<figcaption class="figure-cap">' + esc(b.cap) + '</figcaption>' : '') + '</figure>';
      case 'quiz': {
        const qn = QUIZ_STORE.length; QUIZ_STORE.push(b);
        const key = currentId + '-' + idx;
        const st = QUIZ_STATE[key] || {};
        return '<div class="quiz" data-quiz="' + qn + '" data-key="' + key + '"' + (st.checked ? ' data-locked="1"' : '') + '>' +
          '<div class="quiz-q"><span class="quiz-badge">自测</span><span>' + inline(b.q) + '</span></div>' +
          '<div class="quiz-options">' + b.o.map((o, i) =>
            '<button class="quiz-opt' + (st.checked ? (i === b.a ? ' correct' : (i === st.picked ? ' wrong' : '')) : (st.picked === i ? ' selected' : '')) + '" data-opt="' + i + '">' +
            '<span class="opt-letter">' + 'ABCD'[i] + '</span><span>' + inline(o) + '</span></button>').join('') + '</div>' +
          '<div class="quiz-foot"><button class="quiz-submit"' + (st.picked == null || st.checked ? ' disabled' : '') + '>检查答案</button>' +
          '<span class="quiz-feedback ' + (st.checked ? (st.picked === b.a ? 'ok' : 'no') : '') + '">' +
          (st.checked ? (st.picked === b.a ? '✓ 答对了' : '✕ 再想想') : '') + '</span></div>' +
          '<div class="quiz-explain' + (st.checked ? ' show' : '') + '"><strong>解析：</strong>' + inline(b.e) + '</div></div>';
      }
      case 'task': return '<div class="task-box"><div class="task-h">✏️ ' + inline(b.h) + '</div><ul>' +
        b.x.map(li => '<li>' + inline(li) + '</li>').join('') + '</ul></div>';
      case 'sum': return '<div class="sum-box"><div class="sum-h">📌 本章要点</div><ul>' +
        b.x.map(li => '<li>' + inline(li) + '</li>').join('') + '</ul></div>';
      case 'play': return '<div class="play-box"><div class="play-icon">🧪</div>' +
        '<div class="play-txt"><div class="play-h">' + inline(b.h) + '</div><div class="play-x">' + inline(b.x) + '</div></div>' +
        '<button class="play-open" data-play="1">打开 Playground →</button></div>';
      case 'quote': return '<blockquote class="block-quote">' + inline(b.x) +
        '<cite>' + esc(b.cite || '') + '</cite></blockquote>';
      case 'hr': return '<hr class="block-hr">';
      default: return '';
    }
  }

  function heroHTML() {
    return '<section class="hero">' +
      '<div class="hero-tag">免费 · 开源课件 · 由简到繁</div>' +
      '<h1>' + esc(META.title) + '</h1>' +
      '<p>' + esc(META.tagline) + '</p>' +
      '<div class="hero-chips">' +
      ['<span class="hero-chip">📚 ' + esc(META.duration) + '</span>',
       '<span class="hero-chip">👥 ' + esc(META.audience) + '</span>',
       '<span class="hero-chip">🧩 MCP · Skills · Harness · Git</span>',
       '<span class="hero-chip">📦 含可运行示例工程</span>'].join('') + '</div>' +
      '<button class="hero-cta" data-goto="c1">从第 1 章开始 →</button></section>';
  }

  function renderPager(idx) {
    const prev = CH[idx - 1], next = CH[idx + 1], cur = CH[idx];
    const done = progress.has(cur.id);
    $('#pager').innerHTML = '<div class="pager-inner">' +
      (prev ? '<button class="pager-btn" data-goto="' + prev.id + '"><small>← 上一章</small><span>' + esc(prev.no + ' ' + prev.title) + '</span></button>'
            : '<button class="pager-btn disabled"><small>已是第一章</small><span>课程地图</span></button>') +
      (next ? '<button class="pager-btn next" data-goto="' + next.id + '"><small>下一章 →</small><span>' + esc(next.no + ' ' + next.title) + '</span></button>'
            : '<button class="pager-btn next disabled"><small>已到最后一章</small><span>完结 🎉</span></button>') +
      '</div><div class="pager-done"><button class="done-btn ' + (done ? 'is-done' : '') + '" id="doneBtn">' +
      (done ? '✓ 本章已完成（点击取消）' : '○ 标记本章为已完成') + '</button>' +
      '<div class="pager-hint">进度自动保存在本机浏览器 · 共 ' + CH.length + ' 章</div></div>';
  }

  function renderChapter(id, skipScroll) {
    const idx = CH.findIndex(c => c.id === id);
    if (idx < 0) return;
    const c = CH[idx];
    currentId = id;
    CODE_STORE = []; QUIZ_STORE = [];

    let html = (id === 'c0' ? heroHTML() : '') +
      '<header class="chapter-head"><div class="chapter-eyebrow">CHAPTER ' + c.no + ' · ' + esc(c.group) + '</div>' +
      '<h1>' + esc(c.title) + '</h1>' +
      '<p class="chapter-sub">' + esc(c.sub) + '</p>' +
      '<div class="chapter-meta"><span class="chip">⏱ 约 ' + c.minutes + ' 分钟</span>' +
      '<span class="chip">📊 ' + esc(c.level || '入门') + '</span>' +
      '<span class="chip">📖 ' + c.blocks.length + ' 个内容块</span></div>' +
      '<div class="chapter-no-bg">' + c.no + '</div></header>';

    if (c.goals && c.goals.length) {
      html += '<div class="goals"><div class="goals-title">本章你会学到</div><ul>' +
        c.goals.map(g => '<li>' + inline(g) + '</li>').join('') + '</ul></div>';
    }
    html += c.blocks.map(renderBlock).join('');
    $('#content').innerHTML = html;

    renderPager(idx);
    $('#crumb').textContent = '第 ' + c.no + ' 章 · ' + c.title;
    document.title = c.no + ' ' + c.title + ' · Vibe Coding 课件';
    $$('.nav-item').forEach(btn => btn.classList.toggle('active', btn.dataset.id === id));
    updateProgressUI();

    const newHash = '#' + id;
    if (location.hash !== newHash) {
      try { history.pushState(null, '', newHash); } catch (e) { location.hash = newHash; }
    }
    if (!skipScroll) window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function go(id) { renderChapter(id); }

  /* ---------------- 搜索 ---------------- */
  function plainText(c) {
    const parts = [c.title, c.sub, c.group].concat(c.goals || []);
    c.blocks.forEach(b => {
      ['x', 'q', 'cap', 'cite', 'e'].forEach(k => { if (typeof b[k] === 'string') parts.push(b[k]); });
      if (typeof b.h === 'string') parts.push(b.h);
      if (Array.isArray(b.h)) b.h.forEach(v => parts.push(v));
      if (Array.isArray(b.x)) b.x.forEach(v => {
        if (typeof v === 'string') parts.push(v);
        else if (v && typeof v === 'object') { parts.push(v.h, v.x); }
      });
      if (b.r) b.r.forEach(row => row.forEach(cell => parts.push(cell)));
      if (b.o) b.o.forEach(o => parts.push(o));
    });
    return parts.filter(Boolean).join(' ').replace(/[*`#\[\]()]/g, ' ');
  }
  const SEARCH_INDEX = CH.map(c => ({ c, text: plainText(c).toLowerCase() }));

  function markHit(text, q) {
    const i = text.toLowerCase().indexOf(q);
    if (i < 0) return esc(text.slice(0, 90));
    const from = Math.max(0, i - 34), to = Math.min(text.length, i + q.length + 52);
    return (from ? '…' : '') + esc(text.slice(from, i)) + '<mark>' + esc(text.slice(i, i + q.length)) +
      '</mark>' + esc(text.slice(i + q.length, to)) + (to < text.length ? '…' : '');
  }
  function runSearch(q) {
    q = q.trim().toLowerCase();
    const box = $('#searchResults');
    if (!q) {
      searchHits = [];
      box.innerHTML = '<div class="search-empty">试试：MCP · Skill · Harness · reflog · 渐进式披露 · 小项目</div>';
      return;
    }
    searchHits = SEARCH_INDEX.filter(e => e.text.includes(q)).slice(0, 12);
    if (!searchHits.length) { box.innerHTML = '<div class="search-empty">没找到「' + esc(q) + '」，换个关键词试试</div>'; return; }
    searchFocus = 0;
    box.innerHTML = searchHits.map((hit, i) =>
      '<button class="search-item' + (i === 0 ? ' focus' : '') + '" data-hit="' + i + '">' +
      '<div class="search-item-top"><em>' + hit.c.no + '</em>' + esc(hit.c.title) + '</div>' +
      '<div class="search-item-snip">' + markHit(plainText(hit.c), q) + '</div></button>').join('');
  }
  function openSearch() {
    $('#searchOverlay').hidden = false;
    $('#searchInput').value = '';
    runSearch('');
    setTimeout(() => $('#searchInput').focus(), 30);
  }
  function closeOverlays() {
    $('#searchOverlay').hidden = true;
    $('#playOverlay').hidden = true;
  }
  function jumpToHit(i) {
    if (!searchHits[i]) return;
    closeOverlays(); go(searchHits[i].c.id);
  }

  /* ---------------- Playground ---------------- */
  const PLAY_HTML = `<!DOCTYPE html>
<html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>今日三件事</title><style>
*{box-sizing:border-box}body{margin:0;min-height:100vh;padding:40px 18px;background:#f7f6f3;color:#22212a;
font-family:-apple-system,"PingFang SC","Microsoft YaHei",sans-serif;display:flex;justify-content:center}
.card{width:100%;max-width:460px}h1{font-size:25px;margin:0 0 4px}.sub{color:#8a8794;font-size:13px;margin:0 0 24px}
.row{display:flex;gap:9px;margin-bottom:20px}input{flex:1;padding:12px 14px;font-size:14px;font-family:inherit;
border:1px solid #e3e1dd;border-radius:11px;background:#fff;outline:none}input:focus{border-color:#6c5ce7}
button{padding:0 18px;font-size:14px;font-family:inherit;border:0;border-radius:11px;background:#6c5ce7;color:#fff;cursor:pointer}
ul{list-style:none;padding:0;margin:0}li{display:flex;align-items:center;gap:11px;padding:13px 15px;margin-bottom:9px;
background:#fff;border:1px solid #eceae6;border-radius:11px;font-size:14px}li.done{opacity:.5}li.done span{text-decoration:line-through}
li input{width:17px;height:17px;flex:none;accent-color:#6c5ce7}li span{flex:1}
.del{background:none;color:#b8b5c0;font-size:19px;padding:0 4px}
.foot{margin-top:20px;display:flex;justify-content:space-between;align-items:center}
.count{color:#8a8794;font-size:12px}.clear{background:none;color:#8a8794;font-size:12px;padding:5px}
.empty{text-align:center;color:#a9a6b1;font-size:13px;padding:28px 0}
</style></head><body><div class="card">
<h1>今日三件事</h1><p class="sub">只写最重要的三件，做完就收工。</p>
<div class="row"><input id="inp" placeholder="想做的一件事…" maxlength="60"><button id="add">添加</button></div>
<ul id="list"></ul><div class="foot"><span class="count" id="count"></span><button class="clear" id="clear">清空全部</button></div>
</div><script>
const K='today-three-v1';let items=[];
function load(){try{return JSON.parse(localStorage.getItem(K))||[]}catch(e){return []}}
function save(){try{localStorage.setItem(K,JSON.stringify(items))}catch(e){}}
items=load();const q=s=>document.querySelector(s);
function render(){const ul=q('#list');ul.innerHTML='';if(!items.length)ul.innerHTML='<div class="empty">还没有安排，先加一件吧 ✏️</div>';
items.forEach((it,i)=>{const li=document.createElement('li');li.className=it.done?'done':'';
const cb=document.createElement('input');cb.type='checkbox';cb.checked=it.done;cb.onchange=()=>{items[i].done=cb.checked;save();render()};
const sp=document.createElement('span');sp.textContent=it.text;
const del=document.createElement('button');del.className='del';del.textContent='×';
del.onclick=()=>{items.splice(i,1);save();render()};li.append(cb,sp,del);ul.append(li)});
q('#count').textContent=items.filter(x=>x.done).length+' / '+items.length+' 已完成'}
function add(){const v=q('#inp').value.trim();if(!v)return;if(items.length>=3){alert('说好只做三件事的 🙂');return}
items.push({text:v,done:false});q('#inp').value='';save();render()}
q('#add').onclick=add;q('#inp').onkeydown=e=>{if(e.key==='Enter')add()};
q('#clear').onclick=()=>{if(confirm('清空全部？')){items=[];save();render()}};render();
<\/script></body></html>`;

  function openPlay() {
    $('#playOverlay').hidden = false;
    $('#playCode').value = PLAY_HTML;
    runPlay();
  }
  function runPlay() {
    const frame = $('#playFrame');
    frame.srcdoc = $('#playCode').value;
  }

  /* ---------------- 事件绑定 ---------------- */
  function closeSidebar() {
    $('#sidebar').classList.remove('open');
    $('#backdrop').classList.remove('show');
  }

  function bind() {
    $('#menuBtn').addEventListener('click', () => {
      const open = $('#sidebar').classList.toggle('open');
      $('#backdrop').classList.toggle('show', open);
    });
    $('#backdrop').addEventListener('click', closeSidebar);

    $('#themeBtn').addEventListener('click', () => {
      applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
    });
    $('#searchBtn').addEventListener('click', openSearch);
    $('#sideSearch').addEventListener('click', openSearch);
    $('#searchInput').addEventListener('input', e => runSearch(e.target.value));
    $('#searchInput').addEventListener('keydown', e => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (!searchHits.length) return;
        searchFocus = (searchFocus + (e.key === 'ArrowDown' ? 1 : -1) + searchHits.length) % searchHits.length;
        $$('.search-item').forEach((el, i) => el.classList.toggle('focus', i === searchFocus));
        $$('.search-item')[searchFocus].scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'Enter') { e.preventDefault(); jumpToHit(searchFocus); }
    });
    $('#searchResults').addEventListener('click', e => {
      const item = e.target.closest('[data-hit]');
      if (item) jumpToHit(+item.dataset.hit);
    });

    $$('[data-close]').forEach(el => el.addEventListener('click', closeOverlays));
    $('#resetPlay').addEventListener('click', () => { $('#playCode').value = PLAY_HTML; runPlay(); toast('已恢复初始代码'); });
    $('#runPlay').addEventListener('click', () => { runPlay(); toast('已运行'); });

    /* 内容区统一事件委托 */
    $('#content').addEventListener('click', e => {
      const goto = e.target.closest('[data-goto]');
      if (goto) { go(goto.dataset.goto); return; }
      const copy = e.target.closest('[data-copy]');
      if (copy) {
        const text = CODE_STORE[+copy.dataset.copy] || '';
        const done = () => { copy.textContent = '已复制 ✓'; copy.classList.add('copied'); setTimeout(() => { copy.textContent = '复制'; copy.classList.remove('copied'); }, 1600); };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
        } else fallbackCopy(text, done);
        return;
      }
      if (e.target.closest('[data-play]')) { openPlay(); return; }
      const opt = e.target.closest('.quiz-opt');
      if (opt) {
        const quiz = opt.closest('.quiz');
        if (quiz.dataset.locked === '1') return;
        quiz.querySelectorAll('.quiz-opt').forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        const key = quiz.dataset.key;
        QUIZ_STATE[key] = { picked: +opt.dataset.opt, checked: false };
        quiz.querySelector('.quiz-submit').disabled = false;
        quiz.querySelector('.quiz-feedback').textContent = '';
        return;
      }
      const submit = e.target.closest('.quiz-submit');
      if (submit) {
        const quiz = submit.closest('.quiz');
        const b = QUIZ_STORE[+quiz.dataset.quiz];
        const key = quiz.dataset.key;
        const st = QUIZ_STATE[key] || {};
        if (st.picked == null) return;
        const right = st.picked === b.a;
        quiz.querySelectorAll('.quiz-opt').forEach((o, i) => {
          o.classList.remove('selected');
          if (i === b.a) o.classList.add('correct');
          else if (i === st.picked) o.classList.add('wrong');
        });
        quiz.querySelector('.quiz-feedback').textContent = right ? '✓ 答对了' : '✕ 再想想，看解析';
        quiz.querySelector('.quiz-feedback').className = 'quiz-feedback ' + (right ? 'ok' : 'no');
        quiz.querySelector('.quiz-explain').classList.add('show');
        submit.disabled = true; quiz.dataset.locked = '1';
        QUIZ_STATE[key] = { picked: st.picked, checked: true };
      }
    });

    $('#pager').addEventListener('click', e => {
      const goto = e.target.closest('[data-goto]');
      if (goto) { go(goto.dataset.goto); return; }
      if (e.target.closest('#doneBtn')) {
        if (progress.has(currentId)) progress.delete(currentId);
        else { progress.add(currentId); toast('✓ 已标记完成，继续下一章吧'); }
        saveProgress(); renderPager(CH.findIndex(c => c.id === currentId)); updateProgressUI();
      }
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') { closeOverlays(); closeSidebar(); return; }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openSearch(); return; }
      if (!$('#searchOverlay').hidden || !$('#playOverlay').hidden) return;
      const tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || e.target.isContentEditable) return;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        const idx = CH.findIndex(c => c.id === currentId);
        const next = idx + (e.key === 'ArrowRight' ? 1 : -1);
        if (next >= 0 && next < CH.length) { e.preventDefault(); go(CH[next].id); }
      }
    });

    function onHistory() {
      const id = location.hash.replace('#', '');
      if (id && id !== currentId && CH.some(c => c.id === id)) renderChapter(id);
    }
    window.addEventListener('popstate', onHistory);
    window.addEventListener('hashchange', onHistory);
  }

  function fallbackCopy(text, done) {
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); done(); } catch (e) { toast('复制失败，请手动选择'); }
    document.body.removeChild(ta);
  }

  /* ---------------- 启动 ---------------- */
  function init() {
    loadProgress();
    let theme = 'light';
    try { theme = localStorage.getItem(STORE_THEME) || 'light'; } catch (e) {}
    applyTheme(theme);
    buildNav();
    bind();
    const fromHash = location.hash.replace('#', '');
    renderChapter(CH.some(c => c.id === fromHash) ? fromHash : 'c0', true);
  }
  init();
})();
