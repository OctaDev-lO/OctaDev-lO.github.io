/* ===== FRAME SEQUENCE CONFIG ===== */
const FRAME_COUNT = 191;
const FRAME_DIR = './images/watermelon/';

/* Build frame file list (note: frame 005 is missing) */
function getFramePath(index) {
  let frameNum = index + 1; // 1-based
  if (frameNum >= 5) frameNum += 1; // skip 005
  return `${FRAME_DIR}ezgif-frame-${String(frameNum).padStart(3, '0')}.png`;
}

/* ===== PRELOAD IMAGES ===== */
const frames = [];
let loadedCount = 0;

function preloadFrames() {
  const progressBar = document.getElementById('load-progress');
  const loader = document.getElementById('loader');

  for (let i = 0; i < FRAME_COUNT; i++) {
    const img = new Image();
    img.src = getFramePath(i);
    img.onload = img.onerror = () => {
      loadedCount++;
      const pct = (loadedCount / FRAME_COUNT) * 100;
      if (progressBar) progressBar.style.width = pct + '%';
      if (loadedCount === FRAME_COUNT && loader) {
        setTimeout(() => {
          loader.style.opacity = '0';
          setTimeout(() => { loader.style.display = 'none'; }, 500);
        }, 300);
      }
    };
    frames.push(img);
  }
}

/* ===== CANVAS RENDERING ===== */
const canvas = document.getElementById('hero-canvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function drawFrame(index) {
  const img = frames[Math.min(index, frames.length - 1)];
  if (!img || !img.complete) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Cover-fit the image
  const cW = canvas.width, cH = canvas.height;
  const iW = img.naturalWidth, iH = img.naturalHeight;
  const scale = Math.max(cW / iW, cH / iH);
  const w = iW * scale, h = iH * scale;
  const x = (cW - w) / 2, y = (cH - h) / 2;

  ctx.drawImage(img, x, y, w, h);
}

/* ===== SCROLL HANDLER ===== */
function onScroll() {
  const hero = document.querySelector('.hero');
  const heroRect = hero.getBoundingClientRect();
  const heroHeight = hero.offsetHeight - window.innerHeight;

  // Calculate scroll progress through hero (0 to 1)
  const scrolled = Math.max(0, -heroRect.top);
  const progress = Math.min(1, scrolled / heroHeight);

  // Map progress to frame index
  const frameIndex = Math.floor(progress * (FRAME_COUNT - 1));
  drawFrame(frameIndex);

  // Title visibility (show in first 15%)
  const title = document.querySelector('.hero__title');
  const subtitle = document.querySelector('.hero__subtitle');
  const scrollHint = document.querySelector('.hero__scroll-hint');
  if (progress < 0.15) {
    title?.classList.add('visible');
    subtitle?.classList.add('visible');
    if (scrollHint) scrollHint.style.opacity = '1';
  } else {
    title?.classList.remove('visible');
    subtitle?.classList.remove('visible');
    if (scrollHint) scrollHint.style.opacity = '0';
  }

  // Story captions at different scroll stages
  const c1 = document.getElementById('caption-1');
  const c2 = document.getElementById('caption-2');
  const c3 = document.getElementById('caption-3');

  c1?.classList.toggle('visible', progress > 0.2 && progress < 0.45);
  c2?.classList.toggle('visible', progress > 0.5 && progress < 0.75);
  c3?.classList.toggle('visible', progress > 0.8);

  // Nav scroll state
  const nav = document.querySelector('.nav');
  nav?.classList.toggle('scrolled', window.scrollY > 80);
}

/* ===== INTERSECTION OBSERVER (reveal animations) ===== */
function initRevealObserver() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
    observer.observe(el);
  });
}

/* ===== SMOOTH NAV LINKS ===== */
function initNavLinks() {
  document.querySelectorAll('.nav__links a').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
      // Close mobile menu
      document.querySelector('.nav__links')?.classList.remove('open');
      document.querySelector('.nav__hamburger')?.classList.remove('open');
    });
  });

  // Active link on scroll
  const sections = document.querySelectorAll('.section, .hero');
  const links = document.querySelectorAll('.nav__links a');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(sec => {
      const top = sec.offsetTop - 200;
      if (window.scrollY >= top) current = sec.getAttribute('id');
    });
    links.forEach(l => {
      l.classList.remove('active');
      if (l.getAttribute('href') === '#' + current) l.classList.add('active');
    });
  });
}

/* ===== HAMBURGER ===== */
function initHamburger() {
  const btn = document.querySelector('.nav__hamburger');
  const menu = document.querySelector('.nav__links');
  btn?.addEventListener('click', () => {
    btn.classList.toggle('open');
    menu.classList.toggle('open');
  });
}

/* ===== INIT ===== */
window.addEventListener('DOMContentLoaded', () => {
  resizeCanvas();
  preloadFrames();
  drawFrame(0);
  initRevealObserver();
  initNavLinks();
  initHamburger();

  // Show hero title immediately
  setTimeout(() => {
    document.querySelector('.hero__title')?.classList.add('visible');
    document.querySelector('.hero__subtitle')?.classList.add('visible');
  }, 600);
});

window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', () => {
  resizeCanvas();
  onScroll();
});
