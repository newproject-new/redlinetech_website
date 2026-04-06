/**
 * REDLINE TECH v2 — script.js
 * Clean modular architecture, zero dependencies
 */

'use strict';

/* ─── 1. CUSTOM CURSOR ─────────────────────── */
const initCursor = () => {
  const dot  = document.getElementById('curDot');
  const ring = document.getElementById('curRing');
  if (!dot || !ring) return;
  if (window.matchMedia('(pointer: coarse)').matches) return;

  let mx = 0, my = 0, rx = 0, ry = 0, raf;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  const lerp = (a, b, t) => a + (b - a) * t;
  const tick = () => {
    rx = lerp(rx, mx, 0.1);
    ry = lerp(ry, my, 0.1);
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);

  // Hover state
  const interactives = 'a, button, [role="tab"], .service-row, .work-card, .tq-card';
  document.addEventListener('mouseover', e => {
    if (e.target.closest(interactives)) document.body.classList.add('cursor-hover');
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(interactives)) document.body.classList.remove('cursor-hover');
  });
};

/* ─── 2. HEADER SCROLL ─────────────────────── */
const initHeader = () => {
  const header = document.getElementById('siteHeader');
  if (!header) return;

  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 20);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Active nav link highlight
  const navItems = document.querySelectorAll('.nav-item');
  const sections = document.querySelectorAll('section[id]');

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navItems.forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id);
      });
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(s => io.observe(s));
};

/* ─── 3. MOBILE MENU ───────────────────────── */
const initMobileMenu = () => {
  const burger = document.getElementById('burger');
  const drawer = document.getElementById('mobileDrawer');
  if (!burger || !drawer) return;

  let open = false;
  const toggle = () => {
    open = !open;
    burger.classList.toggle('open', open);
    drawer.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
    drawer.setAttribute('aria-hidden', !open);
    document.body.style.overflow = open ? 'hidden' : '';
  };

  burger.addEventListener('click', toggle);
  drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { if (open) toggle(); }));

  // Close on outside click
  document.addEventListener('click', e => {
    if (open && !burger.contains(e.target) && !drawer.contains(e.target)) toggle();
  });
};

/* ─── 4. SMOOTH SCROLL ─────────────────────── */
const initSmoothScroll = () => {
  const nav = document.getElementById('siteHeader');
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = (nav?.offsetHeight || 72) + 16;
      window.scrollTo({ top: target.getBoundingClientRect().top + scrollY - offset, behavior: 'smooth' });
    });
  });
};

/* ─── 5. SCROLL REVEAL ─────────────────────── */
const initScrollReveal = () => {
  // Add .sr-hidden to candidates
  const targets = [
    '.pi-row', '.service-row', '.process-card',
    '.work-card', '.diff-item', '.tq-card',
    '.rm-item', '.as-item', '.wfm-m', '.wc-visual',
    '.work-featured', '.problem-resolution',
  ];
  targets.forEach(sel => {
    document.querySelectorAll(sel).forEach((el, i) => {
      el.classList.add('sr-hidden');
      el.style.transitionDelay = `${Math.min(i * 0.06, 0.36)}s`;
    });
  });

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.remove('sr-hidden');
      entry.target.classList.add('sr-visible');
      io.unobserve(entry.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.sr-hidden').forEach(el => io.observe(el));
};

/* ─── 6. COUNTER ANIMATION ─────────────────── */
const initCounters = () => {
  const els = document.querySelectorAll('[data-count]');
  const easeOutCubic = t => 1 - Math.pow(1 - t, 3);

  const animate = el => {
    const target = parseInt(el.dataset.count, 10);
    const duration = 1600;
    const start = performance.now();
    const run = now => {
      const p = Math.min((now - start) / duration, 1);
      el.textContent = Math.floor(easeOutCubic(p) * target);
      if (p < 1) requestAnimationFrame(run);
      else el.textContent = target;
    };
    requestAnimationFrame(run);
  };

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      animate(entry.target);
      io.unobserve(entry.target);
    });
  }, { threshold: 0.6 });

  els.forEach(el => io.observe(el));
};

/* ─── 7. PORTFOLIO FILTER ──────────────────── */
const initPortfolioFilter = () => {
  const tabs  = document.querySelectorAll('.wf-btn');
  const cards = document.querySelectorAll('.work-card[data-category]');
  const featured = document.querySelector('.work-featured[data-category]');
  if (!tabs.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      const filter = tab.dataset.filter;

      // Featured
      if (featured) {
        const fCat = featured.dataset.category;
        const showFeatured = filter === 'all' || fCat === filter;
        featured.style.display = showFeatured ? '' : 'none';
      }

      // Grid cards
      cards.forEach((card, i) => {
        const show = filter === 'all' || card.dataset.category === filter;
        if (show) {
          card.style.display = '';
          card.style.opacity = '0';
          card.style.transform = 'translateY(16px)';
          requestAnimationFrame(() => {
            card.style.transition = `opacity 0.4s ease ${i * 0.04}s, transform 0.4s ease ${i * 0.04}s`;
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          });
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
};

/* ─── 8. CONTACT FORM ──────────────────────── */
const initContactForm = () => {
  const form    = document.getElementById('contactForm');
  const success = document.getElementById('cfSuccess');
  if (!form) return;

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));

    if (!data.firstName?.trim() || !data.lastName?.trim() || !data.message?.trim()) {
      showError('Please complete all required fields.'); return;
    }
    if (!emailRe.test(data.email)) {
      showError('Please enter a valid email address.'); return;
    }

    const btn = form.querySelector('.cf-submit');
    const span = btn.querySelector('span');
    btn.disabled = true;
    span.textContent = 'Sending…';

    // Simulate async submit — replace with real endpoint
    setTimeout(() => {
      form.style.display = 'none';
      if (success) { success.classList.add('visible'); success.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    }, 1200);
  });

  function showError(msg) {
    let err = form.querySelector('.cf-error');
    if (!err) {
      err = Object.assign(document.createElement('p'), {
        className: 'cf-error',
        style: 'color:var(--red);font-size:12px;text-align:center;font-family:var(--font-mono);letter-spacing:0.04em;'
      });
      form.querySelector('.cf-submit').insertAdjacentElement('beforebegin', err);
    }
    err.textContent = msg;
    setTimeout(() => { err.textContent = ''; }, 4000);
  }
};

/* ─── 9. SERVICE ROW HOVER EFFECT ─────────── */
const initServiceRows = () => {
  document.querySelectorAll('.service-row').forEach(row => {
    row.addEventListener('mouseenter', () => {
      document.querySelectorAll('.service-row').forEach(r => {
        if (r !== row) r.style.opacity = '0.5';
      });
    });
    row.addEventListener('mouseleave', () => {
      document.querySelectorAll('.service-row').forEach(r => r.style.opacity = '');
    });
  });
};

/* ─── BOOT ──────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initCursor();
  initHeader();
  initMobileMenu();
  initSmoothScroll();
  initScrollReveal();
  initCounters();
  initPortfolioFilter();
  initContactForm();
  initServiceRows();

  // Dev signature
  console.log('%cRedline Tech', 'color:#C41230;font-size:18px;font-weight:700;font-family:sans-serif;');
  console.log('%chello@redlinetech.io', 'color:#666;font-size:11px;');
});
