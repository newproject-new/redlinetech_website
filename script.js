/**
 * REDLINE TECH — script.js
 * Handles: navigation, cursor, scroll animations, counter, form
 * Separation of concerns: each feature in its own init function
 */

/* ── 1. NAVIGATION ── */
function initNav() {
  const nav = document.getElementById('nav');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');

  // Sticky nav background on scroll
  const handleScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // Mobile menu toggle
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
    document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
  });

  // Close mobile menu on link click
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = nav.offsetHeight + 20;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
}

/* ── 2. CUSTOM CURSOR ── */
function initCursor() {
  const cursor = document.getElementById('cursor');
  const follower = document.getElementById('cursorFollower');
  if (!cursor || !follower) return;

  // Only on non-touch devices
  if (window.matchMedia('(pointer: coarse)').matches) return;

  let mouseX = 0, mouseY = 0;
  let followerX = 0, followerY = 0;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = mouseX + 'px';
    cursor.style.top = mouseY + 'px';
  });

  // Smooth follower animation
  const animateFollower = () => {
    followerX += (mouseX - followerX) * 0.12;
    followerY += (mouseY - followerY) * 0.12;
    follower.style.left = followerX + 'px';
    follower.style.top = followerY + 'px';
    requestAnimationFrame(animateFollower);
  };
  animateFollower();
}

/* ── 3. SCROLL-TRIGGERED ANIMATIONS ── */
function initScrollAnimations() {
  // Add fade-in class to elements we want to animate
  const targets = [
    '.service-card',
    '.why-item',
    '.process-step',
    '.result-card',
    '.testimonial-card',
    '.problem-item',
    '.contact-info-item',
  ];

  targets.forEach((selector, selectorIndex) => {
    document.querySelectorAll(selector).forEach((el, i) => {
      el.classList.add('fade-in');
      if (i > 0) el.classList.add(`delay-${Math.min(i * 100, 400)}`);
    });
  });

  // IntersectionObserver for fade-ins
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
}

/* ── 4. ANIMATED COUNTERS ── */
function initCounters() {
  const counters = document.querySelectorAll('.stat-num[data-target]');

  const animateCounter = (el) => {
    const target = parseInt(el.dataset.target, 10);
    const duration = 1800;
    const start = performance.now();

    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target);
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = target;
    };
    requestAnimationFrame(tick);
  };

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
}

/* ── 5. CONTACT FORM ── */
function initContactForm() {
  const form = document.getElementById('contactForm');
  const successMsg = document.getElementById('formSuccess');
  if (!form) return;

  // Real-time validation feedback
  const inputs = form.querySelectorAll('input[required], textarea[required]');
  inputs.forEach(input => {
    input.addEventListener('blur', () => {
      validateField(input);
    });
    input.addEventListener('input', () => {
      if (input.classList.contains('error')) validateField(input);
    });
  });

  function validateField(field) {
    const isValid = field.checkValidity() && field.value.trim() !== '';
    field.style.borderColor = isValid ? 'rgba(229,0,0,0.5)' : 'var(--red)';
    if (isValid) field.style.borderColor = '';
    return isValid;
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const firstName = form.firstName.value.trim();
    const lastName = form.lastName.value.trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();

    // Basic validation
    if (!firstName || !lastName || !email || !message) {
      showFormError('Please fill in all required fields.');
      return;
    }
    if (!validateEmail(email)) {
      showFormError('Please enter a valid email address.');
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const btnText = submitBtn.querySelector('span');
    submitBtn.disabled = true;
    btnText.textContent = 'Sending...';

    // Simulate async submission (replace with real API call)
    setTimeout(() => {
      form.style.display = 'none';
      successMsg.style.display = 'block';
      // Scroll to success message
      successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 1500);
  });

  function showFormError(msg) {
    let errorEl = form.querySelector('.form-error-msg');
    if (!errorEl) {
      errorEl = document.createElement('p');
      errorEl.className = 'form-error-msg';
      errorEl.style.cssText = 'color: var(--red); font-size: 13px; text-align: center; margin-top: -8px;';
      form.querySelector('button[type="submit"]').before(errorEl);
    }
    errorEl.textContent = msg;
    setTimeout(() => { if (errorEl) errorEl.textContent = ''; }, 4000);
  }
}

/* ── 6. ACTIVE NAV HIGHLIGHTING ── */
function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + entry.target.id) {
            link.classList.add('active');
          }
        });
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(s => observer.observe(s));
}

/* ── 7. PARALLAX HERO ACCENT ── */
function initParallax() {
  const grid = document.querySelector('.hero-bg-grid');
  if (!grid) return;
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    grid.style.transform = `translateY(${scrolled * 0.3}px)`;
  }, { passive: true });
}

/* ── 8. SERVICE CARD HOVER GLOW ── */
function initServiceGlow() {
  document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(229,0,0,0.05), var(--black-soft) 60%)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.background = '';
    });
  });
}

/* ── INIT ALL ── */
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initCursor();
  initScrollAnimations();
  initCounters();
  initContactForm();
  initActiveNav();
  initParallax();
  initServiceGlow();

  console.log('%c🔴 REDLINE TECH', 'color: #E50000; font-size: 22px; font-weight: bold; font-family: sans-serif;');
  console.log('%cWe build revenue machines. hello@redlinetech.io', 'color: #999; font-size: 13px;');
});

/* ── 9. PORTFOLIO FILTER ── */
function initPortfolioFilter() {
  const tabs = document.querySelectorAll('.pf-tab');
  const cards = document.querySelectorAll('.portfolio-card');
  if (!tabs.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filter = tab.dataset.filter;
      cards.forEach(card => {
        const cat = card.dataset.category;
        const show = filter === 'all' || cat === filter;
        card.style.display = show ? 'flex' : 'none';
        card.style.flexDirection = show ? 'column' : '';
        // Trigger reflow for animation
        if (show) {
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px)';
          setTimeout(() => {
            card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 20);
        }
      });
    });
  });
}

// Re-run init to include new function
document.addEventListener('DOMContentLoaded', () => {
  initPortfolioFilter();
});
