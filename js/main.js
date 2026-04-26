(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  // --- Scroll reveal ---
  const animateObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          animateObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('[data-animate]').forEach((el) => {
    if (prefersReducedMotion) {
      el.classList.add('visible');
    } else {
      animateObserver.observe(el);
    }
  });

  // --- Counter animation ---
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

  const animateCount = (el) => {
    const target = parseFloat(el.dataset.count);
    if (Number.isNaN(target)) return;
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const duration = 1300;
    const start = performance.now();

    const frame = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const value = Math.round(target * easeOutCubic(t));
      el.textContent = prefix + value + suffix;
      if (t < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  };

  const countObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          countObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );

  document.querySelectorAll('[data-count]').forEach((el) => {
    if (prefersReducedMotion) return;
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    el.textContent = prefix + '0' + suffix;
    countObserver.observe(el);
  });

  // --- Scroll-driven UI (navbar, progress bar, back-to-top) ---
  const navbar = document.getElementById('navbar');
  const scrollProgress = document.getElementById('scrollProgress');
  const backToTopEl = document.getElementById('backToTop');
  let ticking = false;

  const onScroll = () => {
    const y = window.scrollY;
    navbar.classList.toggle('scrolled', y > 12);
    if (backToTopEl) backToTopEl.classList.toggle('show', y > 500);

    if (scrollProgress) {
      const docH =
        document.documentElement.scrollHeight - window.innerHeight;
      const pct = docH > 0 ? Math.min(100, (y / docH) * 100) : 0;
      scrollProgress.style.width = pct + '%';
    }

    ticking = false;
  };

  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        requestAnimationFrame(onScroll);
        ticking = true;
      }
    },
    { passive: true }
  );
  onScroll();

  // --- Active nav link tracking ---
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach((link) => {
            link.classList.toggle(
              'active',
              link.getAttribute('href') === `#${id}`
            );
          });
        }
      });
    },
    { threshold: 0.3, rootMargin: '-80px 0px 0px 0px' }
  );
  sections.forEach((section) => sectionObserver.observe(section));

  // --- Mobile nav ---
  const navToggle = document.getElementById('navToggle');
  const navLinksContainer = document.getElementById('navLinks');

  navToggle.addEventListener('click', () => {
    const isOpen = navbar.classList.toggle('nav-open');
    document.body.style.overflow = isOpen ? 'hidden' : '';
    navToggle.setAttribute('aria-expanded', isOpen);
  });

  navLinksContainer.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') {
      navbar.classList.remove('nav-open');
      document.body.style.overflow = '';
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });

  // --- Back to top ---
  const backToTop = document.getElementById('backToTop');
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // --- Smooth scroll ---
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href.length <= 1) return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
})();
