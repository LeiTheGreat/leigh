(function(){
  "use strict";
  const $ = (s, r) => (r||document).querySelector(s);
  const $$ = (s, r) => Array.from((r||document).querySelectorAll(s));
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- storage helpers (safe) ---------- */
  const store = {
    get(k){ try { return localStorage.getItem(k); } catch(e){ return null; } },
    set(k,v){ try { localStorage.setItem(k,v); } catch(e){} }
  };

  /* ---------- toast ---------- */
  const toastEl = $('#toast'); let toastT;
  function toast(msg){
    toastEl.textContent = msg; toastEl.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(()=>toastEl.classList.remove('show'), 1900);
  }

  /* ---------- theme ---------- */
  const root = document.documentElement, themeBtn = $('#theme'), themeIcon = $('#themeIcon');
  function applyTheme(t){
    root.setAttribute('data-theme', t);
    themeIcon.setAttribute('href', t === 'dark' ? '#i-sun' : '#i-moon');
    themeBtn.setAttribute('aria-label', t === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
  }
  const saved = store.get('lr-theme');
  applyTheme(saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
  themeBtn.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next); store.set('lr-theme', next);
  });

  /* ---------- mobile menu ---------- */
  const burger = $('#burger'), links = $('#links'), burgerIcon = $('#burgerIcon');
  function setMenu(open){
    links.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    burgerIcon.setAttribute('href', open ? '#i-x' : '#i-menu');
  }
  burger.addEventListener('click', () => setMenu(!links.classList.contains('open')));
  $$('#links a').forEach(a => a.addEventListener('click', () => setMenu(false)));

  /* ---------- scroll: progress, sticky bar, back to top, scrollspy ---------- */
  const prog = $('#prog'), bar = $('#bar'), topBtn = $('#top');
  const navMap = new Map($$('#links a').map(a => [a.getAttribute('href').slice(1), a]));
  const sections = $$('main section[id]');
  let ticking = false;
  function onScroll(){
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    prog.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
    bar.classList.toggle('stuck', y > 8);
    topBtn.classList.toggle('show', y > 500);

    let current = '';
    for (const s of sections){ if (y >= s.offsetTop - 140) current = s.id; }
    navMap.forEach((a, id) => a.classList.toggle('on', id === current));
    ticking = false;
  }
  window.addEventListener('scroll', () => { if(!ticking){ ticking = true; requestAnimationFrame(onScroll); } }, {passive:true});
  onScroll();
  topBtn.addEventListener('click', () => window.scrollTo({top:0, behavior: reduce ? 'auto' : 'smooth'}));

  /* ---------- reveal on scroll ---------- */
  if ('IntersectionObserver' in window && !reduce){
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
    }, {rootMargin:'0px 0px -60px 0px', threshold:0.08});
    $$('.reveal').forEach(el => io.observe(el));
  } else {
    $$('.reveal').forEach(el => el.classList.add('in'));
  }

  /* ---------- typing line ---------- */
  const typed = $('#typed');
  const roles = ['Process Executive','Customer support specialist','Operations coordinator','Virtual assistant','Front-end developer in training'];
  if (reduce){
    typed.textContent = roles[0];
  } else {
    let ri = 0, ci = 0, del = false;
    (function tick(){
      const word = roles[ri];
      ci += del ? -1 : 1;
      typed.textContent = word.slice(0, ci);
      let wait = del ? 34 : 68;
      if (!del && ci === word.length){ del = true; wait = 1900; }
      else if (del && ci === 0){ del = false; ri = (ri + 1) % roles.length; wait = 360; }
      setTimeout(tick, wait);
    })();
  }

  /* ---------- Manila clock ---------- */
  const clocks = [$('#clock'), $('#clock2')].filter(Boolean);
  function tickClock(){
    const t = new Intl.DateTimeFormat('en-PH', {timeZone:'Asia/Manila', hour:'2-digit', minute:'2-digit', hour12:true}).format(new Date());
    clocks.forEach(c => c.textContent = t + ' PHT');
  }
  tickClock(); setInterval(tickClock, 15000);
  $('#yr').textContent = new Date().getFullYear();

  /* ---------- experience accordion ---------- */
  $$('.job-top').forEach(btn => {
    btn.addEventListener('click', () => {
      const job = btn.closest('.job');
      const open = job.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(open));
    });
  });

  /* ---------- skill filters ---------- */
  const fbtns = $$('.filters button');
  fbtns.forEach(b => b.addEventListener('click', () => {
    const f = b.dataset.f;
    fbtns.forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    $$('#skillGrid .card').forEach(c => {
      const show = f === 'all' || (c.dataset.c || '').split(' ').includes(f);
      c.classList.toggle('hide', !show);
    });
  }));

  /* ---------- copy buttons ---------- */
  $$('.copy-btn').forEach(b => b.addEventListener('click', async () => {
    const text = b.dataset.copy;
    try { await navigator.clipboard.writeText(text); }
    catch(e){
      const ta = document.createElement('textarea');
      ta.value = text; ta.style.position='fixed'; ta.style.opacity='0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } catch(_){}
      ta.remove();
    }
    b.textContent = 'Copied'; b.classList.add('done');
    toast('Copied to clipboard');
    setTimeout(() => { b.textContent = 'Copy'; b.classList.remove('done'); }, 1800);
  }));

  /* ---------- contact form ---------- */
  const form = $('#msg');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = $('#f-name'), email = $('#f-email'), message = $('#f-msg');
    const bad = [];
    const check = (el, ok) => { el.closest('.field').classList.toggle('bad', !ok); if(!ok) bad.push(el); };
    check(name, name.value.trim().length > 1);
    check(email, /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim()));
    check(message, message.value.trim().length > 5);
    if (bad.length){ bad[0].focus(); toast('Check the highlighted fields'); return; }
    const subject = encodeURIComponent('Portfolio enquiry from ' + name.value.trim());
    const body = encodeURIComponent(message.value.trim() + '\n\n— ' + name.value.trim() + '\n' + email.value.trim());
    window.location.href = 'mailto:leighjannah1041@gmail.com?subject=' + subject + '&body=' + body;
    toast('Opening your email app…');
  });
  $$('#msg input, #msg textarea').forEach(el => el.addEventListener('input', () => el.closest('.field').classList.remove('bad')));

  /* ---------- certificate lightbox ---------- */
  const certData = [
    {t:'Matrix Algebra for Engineers — HKUST', v:'https://www.coursera.org/account/accomplishments/verify/H26DLH2BBTXY'},
    {t:'Mechanics: Motion, Forces, Energy and Gravity — UNSW Sydney', v:'https://www.coursera.org/account/accomplishments/verify/5WDY3P5RGYDJ'},
    {t:'Differential Equations I: Basic Theory — KAIST', v:'https://www.coursera.org/account/accomplishments/verify/8AMZGA23QS8U'}
  ];
  const lb = $('#lightbox'), lbImg = $('#lbImg'), lbTitle = $('#lbTitle'), lbVerify = $('#lbVerify');
  const certBtns = $$('.cert'); let lbIndex = 0, lastFocus = null;
  function showCert(i){
    lbIndex = (i + certData.length) % certData.length;
    const src = certBtns[lbIndex].querySelector('img').src;
    lbImg.src = src; lbImg.alt = certData[lbIndex].t;
    lbTitle.textContent = certData[lbIndex].t;
    lbVerify.href = certData[lbIndex].v;
  }
  function openLb(i){ lastFocus = document.activeElement; showCert(i); lb.classList.add('on'); $('#lbNext').focus(); }
  function closeLb(){ lb.classList.remove('on'); if(lastFocus) lastFocus.focus(); }
  certBtns.forEach(b => b.addEventListener('click', () => openLb(Number(b.dataset.i))));
  $('#lbPrev').addEventListener('click', () => showCert(lbIndex - 1));
  $('#lbNext').addEventListener('click', () => showCert(lbIndex + 1));
  lb.addEventListener('click', (e) => { if (e.target === lb) closeLb(); });

  /* ---------- command palette ---------- */
  const pal = $('#palette'), palInput = $('#palInput'), palList = $('#palList');
  const commands = [
    {label:'About me', hint:'section', go:()=>jump('#about')},
    {label:'Experience', hint:'section', go:()=>jump('#work')},
    {label:'Skills', hint:'section', go:()=>jump('#skills')},
    {label:'Projects', hint:'section', go:()=>jump('#projects')},
    {label:'Education and certifications', hint:'section', go:()=>jump('#education')},
    {label:'Contact', hint:'section', go:()=>jump('#contact')},
    {label:'Hobbies', hint:'section', go:()=>jump('#hobbies')},
    {label:'Copy email address', hint:'action', go:()=>{ $('.copy-btn').click(); }},
    {label:'Open Crime Analytics dashboard', hint:'link', go:()=>window.open('https://leithegreat.github.io/Philippines-Crime-Analytics/','_blank','noopener')},
    {label:'Open photography booking site', hint:'link', go:()=>window.open('https://leithegreat.github.io/Photography/','_blank','noopener')},
    {label:'Open Steam profile', hint:'link', go:()=>window.open('https://steamcommunity.com/id/leithegreat/','_blank','noopener')},
    {label:'Toggle dark mode', hint:'action', go:()=>themeBtn.click()}
  ];
  let palItems = [], palSel = 0, palLast = null;
  function jump(hash){ const el = $(hash); if(el) el.scrollIntoView({behavior: reduce ? 'auto' : 'smooth', block:'start'}); }
  function renderPal(q){
    const needle = q.trim().toLowerCase();
    palItems = commands.filter(c => c.label.toLowerCase().includes(needle));
    palSel = 0;
    if (!palItems.length){ palList.innerHTML = '<li class="none">Nothing matches that.</li>'; return; }
    palList.innerHTML = palItems.map((c,i) =>
      '<li role="option" aria-selected="'+(i===0)+'"><button type="button" data-i="'+i+'">' +
      '<svg width="16" height="16"><use href="#i-jump"/></svg>' + c.label +
      '<span class="k">'+c.hint+'</span></button></li>').join('');
  }
  function moveSel(d){
    if(!palItems.length) return;
    palSel = (palSel + d + palItems.length) % palItems.length;
    $$('#palList li').forEach((li,i) => li.setAttribute('aria-selected', String(i === palSel)));
    const el = $$('#palList li')[palSel]; if(el) el.scrollIntoView({block:'nearest'});
  }
  function runPal(i){ const c = palItems[i]; closePal(); if(c) setTimeout(c.go, 60); }
  function openPal(){ palLast = document.activeElement; pal.classList.add('on'); palInput.value=''; renderPal(''); palInput.focus(); }
  function closePal(){ pal.classList.remove('on'); if(palLast) palLast.focus(); }
  $('#openPal').addEventListener('click', openPal);
  palInput.addEventListener('input', () => renderPal(palInput.value));
  palList.addEventListener('click', (e) => { const b = e.target.closest('button[data-i]'); if(b) runPal(Number(b.dataset.i)); });
  pal.addEventListener('click', (e) => { if (e.target === pal) closePal(); });
  palInput.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown'){ e.preventDefault(); moveSel(1); }
    else if (e.key === 'ArrowUp'){ e.preventDefault(); moveSel(-1); }
    else if (e.key === 'Enter'){ e.preventDefault(); runPal(palSel); }
  });

  /* ---------- global keys ---------- */
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k'){
      e.preventDefault(); pal.classList.contains('on') ? closePal() : openPal(); return;
    }
    if (e.key === 'Escape'){
      if (pal.classList.contains('on')) closePal();
      else if (lb.classList.contains('on')) closeLb();
      else if (links.classList.contains('open')) setMenu(false);
      return;
    }
    if (lb.classList.contains('on')){
      if (e.key === 'ArrowLeft') showCert(lbIndex - 1);
      if (e.key === 'ArrowRight') showCert(lbIndex + 1);
    }
  });
})();
