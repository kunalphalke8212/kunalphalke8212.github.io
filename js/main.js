/* Kunal.dev: vanilla JS, no dependencies. */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // "Desktop" = a real mouse and a wide screen. Canvas + cursor trail only run here.
  var isDesktop = matchMedia('(hover: hover) and (pointer: fine) and (min-width: 768px)').matches;

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  function cssVar(name) { return getComputedStyle(root).getPropertyValue(name).trim(); }

  /* ---------- Boot screen: click / key skips; CSS removes it on its own after ~1.4s ---------- */
  var boot = $('#boot');
  if (boot) {
    var endBoot = function () {
      boot.classList.add('is-done');
      window.removeEventListener('keydown', endBoot);
    };
    boot.addEventListener('click', endBoot);
    boot.addEventListener('animationend', function (e) { if (e.target === boot) endBoot(); });
    window.addEventListener('keydown', endBoot);
  }

  /* ---------- Theme toggle ---------- */
  var themeBtn = $('#theme-toggle');
  var themeListeners = [];
  function syncThemeButton() {
    var dark = root.getAttribute('data-theme') !== 'light';
    themeBtn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
    $('meta[name="theme-color"]').setAttribute('content', dark ? '#07050f' : '#f7f5fc');
  }
  if (themeBtn) {
    syncThemeButton();
    themeBtn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
      syncThemeButton();
      themeListeners.forEach(function (fn) { fn(); });
    });
  }

  /* ---------- Mobile nav ---------- */
  var navToggle = $('#nav-toggle');
  var navLinks = $('#nav-links');
  function setNav(open) {
    navLinks.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () { setNav(!navLinks.classList.contains('is-open')); });
    navLinks.addEventListener('click', function (e) { if (e.target.closest('a')) setNav(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navLinks.classList.contains('is-open')) { setNav(false); navToggle.focus(); }
    });
  }

  /* ---------- Active nav link on scroll ---------- */
  if ('IntersectionObserver' in window) {
    var linkFor = {};
    $$('.nav__links a').forEach(function (a) { linkFor[a.getAttribute('href').slice(1)] = a; });
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = linkFor[entry.target.id];
        if (!link || !entry.isIntersecting) return;
        $$('.nav__links a.is-active').forEach(function (a) { a.classList.remove('is-active'); });
        link.classList.add('is-active');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('main section[id]').forEach(function (s) { navObserver.observe(s); });
  }

  /* ---------- Typing animation ---------- */
  var typed = $('#typed');
  if (typed) {
    var roles = JSON.parse(typed.getAttribute('data-roles'));
    if (reduceMotion) {
      typed.textContent = roles.join(' · ');
    } else {
      var roleIdx = 0, charIdx = roles[0].length, deleting = true;
      var tick = function () {
        var delay;
        if (deleting) {
          charIdx--;
          delay = 35;
          if (charIdx <= 0) { deleting = false; roleIdx = (roleIdx + 1) % roles.length; delay = 350; }
        } else {
          charIdx++;
          delay = 65;
          if (charIdx >= roles[roleIdx].length) { deleting = true; delay = 1800; }
        }
        typed.textContent = roles[roleIdx].slice(0, Math.max(0, charIdx));
        setTimeout(tick, document.hidden ? 1000 : delay);
      };
      // first role is already rendered in HTML; hold it, then start cycling
      setTimeout(tick, 2200);
    }
  }

  /* ---------- Scroll reveal ---------- */
  var reveals = $$('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) {
      // small stagger for siblings in the same grid
      var sibIndex = Array.prototype.indexOf.call(el.parentNode.children, el);
      el.style.transitionDelay = Math.min(sibIndex, 4) * 70 + 'ms';
      revealObserver.observe(el);
    });
  }

  /* ---------- Timeline nodes light up on scroll ---------- */
  var tlItems = $$('.timeline__item');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    tlItems.forEach(function (el) { el.classList.add('is-lit'); });
  } else {
    var tlObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('is-lit'); tlObserver.unobserve(entry.target); }
      });
    }, { rootMargin: '0px 0px -35% 0px' });
    tlItems.forEach(function (el) { tlObserver.observe(el); });
  }

  /* ---------- Hero particle network (desktop, motion allowed) ---------- */
  var canvas = $('#hero-canvas');
  if (canvas && isDesktop && !reduceMotion) {
    var ctx = canvas.getContext('2d');
    var hero = $('#hero');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0, points = [], rafId = 0, running = false, inView = true;
    var mouse = { x: -9999, y: -9999 };
    var LINK = 130, colorA = '', colorB = '';

    var readColors = function () {
      colorA = cssVar('--primary-rgb');
      colorB = cssVar('--secondary-rgb');
    };

    var resize = function () {
      var rect = hero.getBoundingClientRect();
      W = rect.width; H = rect.height;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var count = Math.min(90, Math.round((W * H) / 16000));
      points = [];
      for (var i = 0; i < count; i++) {
        points.push({
          x: Math.random() * W, y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
          r: Math.random() * 1.6 + 0.6, alt: Math.random() < 0.3
        });
      }
    };

    var frame = function () {
      ctx.clearRect(0, 0, W, H);
      var i, j, p, q, dx, dy, d2, a, n = points.length, link2 = LINK * LINK;
      for (i = 0; i < n; i++) {
        p = points[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
      }
      ctx.lineWidth = 1;
      for (i = 0; i < n; i++) {
        p = points[i];
        for (j = i + 1; j < n; j++) {
          q = points[j];
          dx = p.x - q.x; dy = p.y - q.y; d2 = dx * dx + dy * dy;
          if (d2 < link2) {
            a = (1 - d2 / link2) * 0.35;
            ctx.strokeStyle = 'rgba(' + colorA + ',' + a.toFixed(3) + ')';
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
          }
        }
        dx = p.x - mouse.x; dy = p.y - mouse.y; d2 = dx * dx + dy * dy;
        if (d2 < link2 * 1.6) {
          a = (1 - d2 / (link2 * 1.6)) * 0.6;
          ctx.strokeStyle = 'rgba(' + colorB + ',' + a.toFixed(3) + ')';
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
        }
        ctx.fillStyle = 'rgba(' + (p.alt ? colorB : colorA) + ',0.9)';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      }
      rafId = requestAnimationFrame(frame);
    };

    var start = function () { if (!running && inView && !document.hidden) { running = true; rafId = requestAnimationFrame(frame); } };
    var stop = function () { running = false; cancelAnimationFrame(rafId); };

    readColors();
    resize();
    themeListeners.push(readColors);

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 150);
    });
    hero.addEventListener('mousemove', function (e) {
      var r = hero.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    });
    hero.addEventListener('mouseleave', function () { mouse.x = mouse.y = -9999; });

    // pause when the tab is hidden or the hero is scrolled out of view
    document.addEventListener('visibilitychange', function () { document.hidden ? stop() : start(); });
    new IntersectionObserver(function (entries) {
      inView = entries[0].isIntersecting;
      inView ? start() : stop();
    }).observe(hero);

    start();
  }

  /* ---------- Cursor glow trail (desktop, motion allowed) ---------- */
  var trail = $('#cursor-trail');
  if (trail && isDesktop && !reduceMotion) {
    var DOTS = 10, dots = [], target = { x: -100, y: -100 }, trailRaf = 0;
    for (var t = 0; t < DOTS; t++) {
      var s = document.createElement('span');
      var size = 14 - t;
      s.style.width = s.style.height = size + 'px';
      s.style.setProperty('--o', (0.45 * (1 - t / DOTS)).toFixed(2));
      s.style.filter = 'blur(' + (1 + t * 0.3) + 'px)';
      trail.appendChild(s);
      dots.push({ el: s, x: -100, y: -100, half: size / 2 });
    }
    trail.classList.add('is-on');

    var animateTrail = function () {
      var x = target.x, y = target.y, settled = true;
      dots.forEach(function (d, i) {
        d.x += (x - d.x) * (i === 0 ? 0.5 : 0.35);
        d.y += (y - d.y) * (i === 0 ? 0.5 : 0.35);
        if (Math.abs(x - d.x) > 0.3 || Math.abs(y - d.y) > 0.3) settled = false;
        d.el.style.transform = 'translate3d(' + (d.x - d.half) + 'px,' + (d.y - d.half) + 'px,0)';
        x = d.x; y = d.y;
      });
      trailRaf = settled ? 0 : requestAnimationFrame(animateTrail); // idle when the mouse stops
    };

    window.addEventListener('mousemove', function (e) {
      target.x = e.clientX; target.y = e.clientY;
      trail.classList.add('is-active');
      if (!trailRaf) trailRaf = requestAnimationFrame(animateTrail);
    }, { passive: true });
    document.addEventListener('mouseleave', function () { trail.classList.remove('is-active'); });
  }

  /* ---------- Gallery lightbox ---------- */
  var lightbox = $('#lightbox');
  if (lightbox && typeof lightbox.showModal === 'function') {
    var lbImg = $('#lightbox-img');
    var lbCap = $('#lightbox-caption');
    var current = 0, opener = null;

    var items = function () { return $$('.gallery__item'); }; // re-query: missing photos get removed

    var show = function (i) {
      var list = items();
      if (!list.length) return;
      current = (i + list.length) % list.length;
      var img = $('img', list[current]);
      var cap = $('figcaption', list[current]);
      lbImg.src = img.currentSrc || img.src;
      lbImg.alt = img.alt;
      lbCap.textContent = cap ? cap.textContent : '';
      lightbox.classList.toggle('is-single', list.length < 2);
    };

    $('.gallery') && $('.gallery').addEventListener('click', function (e) {
      var btn = e.target.closest('.gallery__btn');
      if (!btn) return;
      opener = btn;
      show(items().indexOf(btn.closest('.gallery__item')));
      lightbox.showModal();
    });

    lightbox.addEventListener('click', function (e) {
      var action = e.target.closest('[data-lb]');
      if (action) {
        var a = action.getAttribute('data-lb');
        if (a === 'close') lightbox.close();
        else show(current + (a === 'next' ? 1 : -1));
        return;
      }
      if (!e.target.closest('.lightbox__img')) lightbox.close(); // click on backdrop / empty space
    });

    lightbox.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') show(current + 1);
      else if (e.key === 'ArrowLeft') show(current - 1);
    });

    lightbox.addEventListener('close', function () {
      lbImg.removeAttribute('src');
      if (opener) opener.focus();
    });
  }

  /* ---------- Footer year ---------- */
  var year = $('#year');
  if (year) year.textContent = new Date().getFullYear();
})();
