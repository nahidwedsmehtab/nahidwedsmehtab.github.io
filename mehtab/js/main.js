/* =========================================================
   Mehtab & Nahid · groom's side — interactions
   ========================================================= */
(() => {
  'use strict';

  /* ---------- Settings ---------- */
  const CONFIG = {
    music: 'assets/audio/song.mp3',             // groom's side song: Inn Lamhon Ke Daaman Mein
    gateSound: true,
    gateSoundFile: '../assets/audio/gate-chimes.mp3',
  };

  /* ---------- The functions ----------
     Fill in the blanks when the details are known. An empty value ('') shows
     "To be announced" on the card.
       time:  24-hour India time, e.g. '18:00' for 6 PM
       maps:  a Google Maps link to the venue (shows the Directions button)
     `only: 'baraat'` = shown only on the Baraat link (…/mehtab/?baraat)        */
  const EVENTS = [
    {
      key: 'baraat', name: 'Baraat', icon: 'i-baraat', only: 'baraat',
      date: '2027-01-02', time: '19:00', hours: 4,
      tag: 'The groom sets out to bring home his bride',
      venue: 'Community Centre', address: 'Ramesh Park, Laxmi Nagar, New Delhi – 110092',
      maps: 'https://www.google.com/maps/dir/?api=1&destination=28.6348538,77.2704275',
    },
    {
      key: 'reception', name: 'Reception', icon: 'i-reception',
      date: '2027-01-06', time: '13:00', hours: 4,
      tag: 'An afternoon of food, duas & celebration',
      venue: "Mukhtar Khan's House",
      address: 'Gram Natauli, Post Nandauli, Thana Baldirai, District Sultanpur, Uttar Pradesh',
      maps: 'https://maps.app.goo.gl/EEscTqpPdmVrjuP67',
    },
  ];

  /* ---------- Environment ---------- */
  const params = new URLSearchParams(location.search);
  const SHOW_BARAAT = params.has('baraat');
  const guest = (params.get('to') || '').replace(/[<>]/g, '').trim().slice(0, 60);
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  const shown = EVENTS.filter((e) => !e.only || (e.only === 'baraat' && SHOW_BARAAT));
  if (SHOW_BARAAT) document.title = 'Mehtab & Nahid · Baraat & Wedding Invitation';

  if (guest) {
    $('#guestGreeting').textContent = `Dear ${guest}`;
    $('#guestSub').hidden = false;
  }

  /* ---------- Dates ---------- */
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const ord = (d) => d + (d % 10 === 1 && d !== 11 ? 'st' : d % 10 === 2 && d !== 12 ? 'nd' : d % 10 === 3 && d !== 13 ? 'rd' : 'th');
  function ymd(ev) {
    const [y, m, d] = ev.date.split('-').map(Number);
    return { y, m, d, wd: DAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()] };
  }
  const longDate = (ev) => { const p = ymd(ev); return `${p.wd}, ${ord(p.d)} ${MONTHS[p.m - 1]} ${p.y}`; };
  function fmtTime(t) {
    const [h, m] = t.split(':').map(Number);
    return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
  }
  const startOf = (ev) => new Date(`${ev.date}T${ev.time || '00:00'}:00+05:30`);
  function endOf(ev) {
    if (ev.time) return new Date(startOf(ev).getTime() + ev.hours * 36e5);
    return new Date(startOf(ev).getTime() + 26 * 36e5); // whole day (+2h past midnight)
  }
  const upcoming = () => shown.find((e) => endOf(e) > new Date());

  /* =========================================================
     BUILD: date row + function cards
     ========================================================= */
  const dateRow = $('#dateRow');
  shown.forEach((ev) => {
    const p = ymd(ev);
    const el = document.createElement('div');
    el.className = 'date';
    el.innerHTML = `<svg aria-hidden="true"><use href="#${ev.icon}"/></svg>` +
      `<span class="date__d">${p.d}</span><span class="date__m">${MONTHS[p.m - 1].slice(0, 3)} ${p.y}</span>` +
      `<span class="date__n">${esc(ev.name)}</span>`;
    const d = el.querySelector('.date__d');
    for (let i = 0; i < 3; i++) {
      const s = document.createElement('i');
      s.className = 'sparkle';
      s.style.cssText = `left:${[-30, 100, 85][i]}%;top:${[-15, -5, 70][i]}%;--t:${2.2 + i * .5}s;--dl:${-i * .8}s`;
      d.appendChild(s);
    }
    dateRow.appendChild(el);
  });

  const TBA = '<span class="val tba">To be announced soon</span>';
  const list = $('#eventList');
  shown.forEach((ev) => {
    const card = document.createElement('article');
    card.className = 'ev';
    card.id = 'ev-' + ev.key;
    card.dataset.stop = '8';
    card.dataset.reveal = 'up';
    const time = ev.time ? `<span class="val val--time">${fmtTime(ev.time)}</span>` : TBA;
    const venue = ev.venue ? `<span class="val">${esc(ev.venue)}${ev.address ? '<br>' + esc(ev.address) : ''}</span>` : TBA;
    card.innerHTML = `
      <div class="ev__medal"><svg aria-hidden="true"><use href="#${ev.icon}"/></svg></div>
      <p class="ev__date">${longDate(ev)}</p>
      <h3 class="ev__title script">${esc(ev.name)}</h3>
      <p class="ev__tag">${esc(ev.tag)}</p>
      <div class="ev__rows">
        <div class="ev__row"><svg aria-hidden="true"><use href="#i-clock"/></svg><div><span class="lbl">Time</span>${time}</div></div>
        <div class="ev__row"><svg aria-hidden="true"><use href="#i-pin"/></svg><div><span class="lbl">Venue</span>${venue}</div></div>
      </div>
      <div class="ev__btns">
        <button class="btn btn--gold" type="button" data-cal="${ev.key}"><svg aria-hidden="true"><use href="#i-cal"/></svg>Add to Calendar</button>
        ${ev.maps ? `<a class="btn btn--ghost" href="${esc(ev.maps)}" target="_blank" rel="noopener"><svg aria-hidden="true"><use href="#i-pin"/></svg>Directions</a>` : ''}
      </div>`;
    list.appendChild(card);
  });

  /* =========================================================
     OPENING — unroll the scroll
     ========================================================= */
  const opener = $('#opener');
  const openBtn = $('#openBtn');
  let opened = false;

  function openScroll() {
    if (opened) return;
    opened = true;
    opener.classList.add('is-opening');
    playGateSound();
    if (navigator.vibrate) { try { navigator.vibrate([12, 60, 18]); } catch (e) { /* ignore */ } }
    startMusic();
    const t1 = reduceMotion ? 0 : 450, t2 = reduceMotion ? 50 : 2050;
    setTimeout(() => opener.classList.add('is-unrolling'), t1);
    setTimeout(() => {
      opener.classList.add('is-done');
      document.body.classList.remove('is-locked');
      window.scrollTo(0, 0);
      startReveal();
      startPetals();
      startTour();
    }, t2);
    setTimeout(() => opener.remove(), t2 + 1100);
  }
  const gateAudio = CONFIG.gateSound && CONFIG.gateSoundFile ? new Audio(CONFIG.gateSoundFile) : null;
  if (gateAudio) gateAudio.preload = 'auto';
  function playGateSound() {
    if (!gateAudio) return;
    try { gateAudio.currentTime = 0; gateAudio.volume = 1; gateAudio.play().catch(() => {}); } catch (e) { /* optional */ }
  }
  openBtn.addEventListener('click', openScroll);
  opener.addEventListener('click', (e) => { if (!openBtn.contains(e.target)) openScroll(); });
  document.addEventListener('keydown', (e) => { if (!opened && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); openScroll(); } });

  /* =========================================================
     VERSE words + SCROLL REVEAL
     ========================================================= */
  const verse = $('#verseText');
  if (verse) {
    const words = verse.textContent.trim().split(/\s+/);
    verse.innerHTML = words.map((w, i) => `<span class="w" style="--i:${i}">${w}</span>`).join(' ');
  }
  function startReveal() {
    const items = [...$$('[data-reveal]'), verse].filter(Boolean);
    $$('.hero__inner [data-reveal]').forEach((el, i) => el.style.setProperty('--d', 200 + i * 140));
    if (!('IntersectionObserver' in window)) { items.forEach((el) => el.classList.add('is-in')); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: .12 });
    items.forEach((el) => io.observe(el));
  }

  /* =========================================================
     PETALS
     ========================================================= */
  function startPetals() {
    if (reduceMotion) return;
    const box = $('#petals');
    const colors = ['#2d44a0', '#5a74cc', '#c9d3f0', '#d9b56c', '#1f2f7a'];
    const n = innerWidth < 600 ? 12 : 18;
    for (let i = 0; i < n; i++) {
      const p = document.createElement('i');
      p.className = 'petal';
      p.style.cssText = `left:${Math.random() * 100}%;--s:${8 + Math.random() * 8}px;--c:${colors[i % colors.length]};` +
        `--dur:${11 + Math.random() * 9}s;--delay:${-Math.random() * 14}s;--sway:${(Math.random() - .5) * 120}px`;
      box.appendChild(p);
    }
  }

  /* =========================================================
     COUNTDOWN — to the next function on this link
     ========================================================= */
  const units = [['d', 'Days'], ['h', 'Hours'], ['m', 'Minutes'], ['s', 'Seconds']];
  const archBox = $('#arches');
  const nums = {};
  units.forEach(([k, label]) => {
    const el = document.createElement('div');
    el.className = 'arch';
    el.innerHTML = `<span class="arch__n">--</span><span class="arch__l">${label}</span>`;
    archBox.appendChild(el);
    nums[k] = el.querySelector('.arch__n');
  });
  const pad = (n) => String(n).padStart(2, '0');
  function setNum(k, v) {
    const el = nums[k];
    if (el.textContent === v) return;
    el.textContent = v;
    el.classList.remove('tick'); void el.offsetWidth; el.classList.add('tick');
  }
  const cdName = $('#cdName'), cdMsg = $('#cdMsg');
  function tick() {
    const now = new Date();
    const ev = upcoming();
    if (!ev) {
      ['d', 'h', 'm', 's'].forEach((k) => setNum(k, k === 'd' ? '0' : '00'));
      cdName.textContent = 'next time';
      cdMsg.textContent = 'Alhamdulillah — thank you for your duas & love.';
      return;
    }
    cdName.textContent = ev.name;
    let diff = Math.max(0, startOf(ev) - now);
    const d = Math.floor(diff / 864e5); diff -= d * 864e5;
    const h = Math.floor(diff / 36e5); diff -= h * 36e5;
    const m = Math.floor(diff / 6e4); diff -= m * 6e4;
    const s = Math.floor(diff / 1e3);
    setNum('d', String(d)); setNum('h', pad(h)); setNum('m', pad(m)); setNum('s', pad(s));
    cdMsg.textContent = now >= startOf(ev)
      ? `Today is the ${ev.name} — Alhamdulillah!`
      : `${longDate(ev)}${ev.time ? ' · ' + fmtTime(ev.time) : ''} · InshaAllah`;
  }
  tick();
  setInterval(tick, 1000);

  /* =========================================================
     CALENDAR — Apple devices get a calendar file, others Google Calendar
     ========================================================= */
  const utc = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
  const dayStamp = (d) => d.toISOString().slice(0, 10).replace(/-/g, '');
  function calInfo(ev) {
    const where = ev.venue ? `${ev.venue}${ev.address ? ', ' + ev.address : ''}` : 'Venue to be announced';
    const details = `${ev.tag}.` + (ev.time ? '' : '\nTime to be announced.') + (ev.maps ? `\n\nMaps: ${ev.maps}` : '');
    let start, end;
    if (ev.time) { start = utc(startOf(ev)); end = utc(endOf(ev)); }
    else {
      const [y, m, d] = ev.date.split('-').map(Number);
      start = dayStamp(new Date(Date.UTC(y, m - 1, d)));
      end = dayStamp(new Date(Date.UTC(y, m - 1, d + 1)));
    }
    return { title: `${ev.name} · Mehtab & Nahid`, where, details, start, end, allDay: !ev.time };
  }
  function googleUrl(ev) {
    const c = calInfo(ev);
    const q = new URLSearchParams({ action: 'TEMPLATE', text: c.title, dates: `${c.start}/${c.end}`, details: c.details, location: c.where });
    return 'https://calendar.google.com/calendar/render?' + q.toString();
  }
  const icsEsc = (s) => s.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
  function downloadIcs(ev) {
    const c = calInfo(ev);
    const dt = c.allDay ? [`DTSTART;VALUE=DATE:${c.start}`, `DTEND;VALUE=DATE:${c.end}`] : [`DTSTART:${c.start}`, `DTEND:${c.end}`];
    const lines = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Khan Family//Mehtab & Nahid//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
      'BEGIN:VEVENT', `UID:${ev.key}-mehtab-nahid@invite`, `DTSTAMP:${utc(new Date())}`, ...dt,
      `SUMMARY:${icsEsc(c.title)}`, `LOCATION:${icsEsc(c.where)}`, `DESCRIPTION:${icsEsc(c.details)}`,
      'BEGIN:VALARM', 'TRIGGER:-P1D', 'ACTION:DISPLAY', `DESCRIPTION:${icsEsc(c.title)} tomorrow`, 'END:VALARM',
      'END:VEVENT', 'END:VCALENDAR',
    ];
    const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${ev.name}-Mehtab-Nahid.ics`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    toast('Calendar file downloaded');
  }
  const isApple = /iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent);
  function addToCalendar(ev) {
    if (!ev) return;
    if (isApple) downloadIcs(ev);
    else window.open(googleUrl(ev), '_blank', 'noopener');
  }
  $$('[data-cal]').forEach((el) => el.addEventListener('click', () => addToCalendar(EVENTS.find((e) => e.key === el.dataset.cal))));

  /* =========================================================
     SHARE + DOCK
     ========================================================= */
  const shareUrl = location.origin + location.pathname + (SHOW_BARAAT ? '?baraat' : '');
  async function shareInvite() {
    const data = { title: 'Mehtab & Nahid · Wedding Invitation', text: 'You are invited to the wedding celebrations of Mehtab Khan & Nahid.', url: shareUrl };
    try {
      if (navigator.share) { await navigator.share(data); return; }
      await navigator.clipboard.writeText(shareUrl);
      toast('Link copied');
    } catch (err) {
      if (err && err.name === 'AbortError') return;
      toast(shareUrl);
    }
  }
  $$('[data-share]').forEach((b) => b.addEventListener('click', shareInvite));

  const dock = $('#dock');
  $('#dockCal').addEventListener('click', () => addToCalendar(upcoming() || shown[shown.length - 1]));
  const dockDir = $('#dockDir');
  const withMap = shown.find((e) => e.maps && endOf(e) > new Date());
  if (withMap) { dockDir.href = withMap.maps; dockDir.hidden = false; }
  function updateDock() {
    if (!opened) return;
    const y = scrollY;
    const nearEnd = y + innerHeight > document.documentElement.scrollHeight - 260;
    const on = y > innerHeight * 0.55 && !nearEnd;
    dock.classList.toggle('is-on', on);
    document.body.classList.toggle('dock-on', on);
  }
  addEventListener('scroll', updateDock, { passive: true });

  /* family names: keep each line on one line on any phone */
  const familyNames = $('#familyNames');
  function fitNames() {
    familyNames.style.fontSize = '';
    const avail = familyNames.clientWidth;
    const widest = Math.max(...$$('.ln', familyNames).map((l) => l.scrollWidth));
    if (widest > avail) {
      const fs = parseFloat(getComputedStyle(familyNames).fontSize);
      familyNames.style.fontSize = Math.floor(fs * (avail / widest) * 10) / 10 + 'px';
    }
  }
  fitNames();
  addEventListener('resize', fitNames);
  if (document.fonts) document.fonts.ready.then(fitNames);

  /* =========================================================
     MUSIC — starts from the tap on the seal
     ========================================================= */
  let audio = null, pausedByHide = false;
  if (CONFIG.music) {
    audio = new Audio(CONFIG.music);
    audio.loop = true; audio.preload = 'auto';
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && !audio.paused) { pausedByHide = true; audio.pause(); }
      else if (!document.hidden && pausedByHide) { pausedByHide = false; playMusic(false); }
    });
  }
  function playMusic(fadeIn) {
    if (!audio) return;
    if (fadeIn) audio.volume = 0.05;
    audio.play().then(() => {
      if (!fadeIn) { audio.volume = 0.65; return; }
      const start = performance.now();
      const step = (now) => {
        const k = Math.min(1, (now - start) / 2500);
        audio.volume = 0.05 + 0.6 * k;
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }).catch(() => {});
  }
  function startMusic() { playMusic(true); }

  /* =========================================================
     AUTO-SCROLL TOUR — glides through the invite for guests who don't scroll.
     Each stop is an element with data-stop="seconds" (data-stop="end" = last).
     Stops for good once the guest scrolls; a tap pauses it for RESUME_AFTER.
     ========================================================= */
  const HERO_HOLD = 9000;      // names at the top
  const RESUME_AFTER = 12000;
  let tourStops = [];
  let tourState = 'idle'; // idle | hold | glide | dwell | paused | hidden | done | off
  let tourIdx = 0, tourTimer = 0, tourRaf = 0, resumeTimer = 0;
  const root = document.documentElement;

  function viewH() {
    const docked = getComputedStyle(dock).display !== 'none';
    return innerHeight - (docked ? dock.offsetHeight + 24 : 0);
  }
  function stopY(s) {
    const max = root.scrollHeight - innerHeight;
    if (s.last) return Math.max(0, max);
    const r = s.el.getBoundingClientRect();
    const vh = viewH();
    const top = r.top + scrollY;
    const y = r.height <= vh - 40 ? top - (vh - r.height) / 2 : top - 40;
    return Math.max(0, Math.min(max, Math.round(y)));
  }
  function stopTimers() {
    clearTimeout(tourTimer); clearTimeout(resumeTimer); cancelAnimationFrame(tourRaf);
    root.style.scrollBehavior = '';
  }
  function glide(y, done) {
    const from = scrollY, dist = y - from;
    if (Math.abs(dist) < 2) { done(); return; }
    const dur = reduceMotion ? 0 : Math.min(2600, Math.max(1400, Math.abs(dist) * 2.4));
    root.style.scrollBehavior = 'auto';
    const t0 = performance.now();
    const step = (now) => {
      const k = dur ? Math.min(1, (now - t0) / dur) : 1;
      const e = k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      window.scrollTo(0, from + dist * e);
      if (k < 1) tourRaf = requestAnimationFrame(step);
      else { root.style.scrollBehavior = ''; done(); }
    };
    tourRaf = requestAnimationFrame(step);
  }
  function tourNext() {
    if (tourState === 'off' || tourState === 'done') return;
    if (document.hidden) { tourState = 'hidden'; return; }
    const s = tourStops[tourIdx];
    if (!s) { tourState = 'done'; return; }
    tourState = 'glide';
    glide(stopY(s), () => {
      if (s.last) { tourState = 'done'; return; }
      tourState = 'dwell';
      tourTimer = setTimeout(() => { tourIdx++; tourNext(); }, s.ms);
    });
  }
  function startTour() {
    if (tourState !== 'idle') return;
    tourStops = $$('[data-stop]').map((el) => ({ el, last: el.dataset.stop === 'end', ms: (parseFloat(el.dataset.stop) || 0) * 1000 }));
    tourState = 'hold';
    tourTimer = setTimeout(tourNext, HERO_HOLD);
  }
  function tourResume() {
    if (tourState !== 'paused' && tourState !== 'hidden') return;
    if (document.hidden) { tourState = 'hidden'; return; }
    tourIdx = tourStops.findIndex((s) => stopY(s) > scrollY + 20);
    if (tourIdx < 0) { tourState = 'done'; return; }
    tourNext();
  }
  function tourPause() {
    if (!['hold', 'glide', 'dwell', 'paused'].includes(tourState)) return;
    stopTimers();
    tourState = 'paused';
    resumeTimer = setTimeout(tourResume, RESUME_AFTER);
  }
  function tourOff() {
    if (tourState === 'idle' || tourState === 'done') return;
    stopTimers();
    tourState = 'off';
  }
  let touchY = 0;
  addEventListener('touchstart', (e) => { touchY = e.touches[0].clientY; tourPause(); }, { passive: true });
  addEventListener('touchmove', (e) => { if (Math.abs(e.touches[0].clientY - touchY) > 12) tourOff(); }, { passive: true });
  addEventListener('wheel', tourOff, { passive: true });
  addEventListener('pointerdown', (e) => { if (e.pointerType !== 'touch') tourPause(); });
  addEventListener('keydown', (e) => {
    if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(e.key)) tourOff(); else tourPause();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (['hold', 'glide', 'dwell', 'paused'].includes(tourState)) { stopTimers(); tourState = 'hidden'; }
    } else if (tourState === 'hidden') {
      resumeTimer = setTimeout(tourResume, 3000);
    }
  });

  /* ---------- toast ---------- */
  const toastEl = $('#toast');
  let toastT = 0;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('is-on');
    clearTimeout(toastT);
    toastT = setTimeout(() => toastEl.classList.remove('is-on'), 2400);
  }
})();
