const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ── Mobile nav ──
const burger = document.getElementById('burger');
const navLinks = document.getElementById('nav-links');
burger.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  burger.setAttribute('aria-expanded', open);
});
navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    burger.setAttribute('aria-expanded', false);
  });
});

// ── Active nav + scrolled shadow ──
const nav = document.querySelector('nav');
const sections = document.querySelectorAll('section[id]');
const navAs = document.querySelectorAll('.nav-links a');
const onScroll = () => {
  let current = '';
  sections.forEach(s => {
    if (s.getBoundingClientRect().top <= 100) current = s.id;
  });
  navAs.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${current}`));
  nav.classList.toggle('scrolled', window.scrollY > 60);
};
window.addEventListener('scroll', onScroll, { passive: true });

// ── Hero entry stagger ──
const heroEls = document.querySelectorAll(
  '.hero-strip .eyebrow, .hero-strip .hero-headline, .hero-strip .hero-tag, .hero-strip .pills, .hero-strip .cta-link'
);
if (!reducedMotion) {
  heroEls.forEach((el, i) => setTimeout(() => el.classList.add('hero-in'), 60 + i * 70));
} else {
  heroEls.forEach(el => el.classList.add('hero-in'));
}

// ── Stagger children setup ──
const STAGGER_SEL = '.body-text, blockquote, .what-col, .exp-item, .cs-card, .tools-grid > div, .body-dark';
document.querySelectorAll('.reveal').forEach(section => {
  section.querySelectorAll(STAGGER_SEL).forEach(el => el.classList.add('stagger-child'));
});

// ── Scroll reveal + stagger ──
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.classList.add('visible');
        const children = entry.target.querySelectorAll('.stagger-child');
        children.forEach((el, j) => {
          if (!reducedMotion) {
            setTimeout(() => el.classList.add('stagger-in'), j * 65);
          } else {
            el.classList.add('stagger-in');
          }
        });
      }, i * 60);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.06, rootMargin: '0px 0px -20px 0px' });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ── Count-up animation ──
function parseStatText(text) {
  const m = text.trim().match(/^([^0-9]*)(\d+(?:\.\d+)?)([^0-9]*)$/);
  if (!m) return null;
  return { prefix: m[1], num: parseFloat(m[2]), suffix: m[3] };
}

function animateCount(el, duration = 900) {
  const parsed = parseStatText(el.textContent);
  if (!parsed || reducedMotion) return;
  const { prefix, num, suffix } = parsed;
  const start = performance.now();
  const tick = (now) => {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = prefix + Math.round(eased * num) + suffix;
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

const countEls = document.querySelectorAll('.sb-n, .sb-metric, .cs-metric');
const countObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCount(entry.target);
      countObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });
countEls.forEach(el => countObserver.observe(el));
