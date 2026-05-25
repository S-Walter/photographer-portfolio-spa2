import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initScrollAnimations() {
  const shutter = document.querySelector('.shutter-overlay');
  const camBg = document.querySelector('.cam-bg-img');
  const camVeil = document.querySelector('.cam-bg-veil');

  /* =============================================
     ABOUT SLIDESHOW — sequential directional scroll
     ============================================= */
  const slides = gsap.utils.toArray('.about-slide');
  if (slides.length > 1) {
    let current = 0;
    const dirs = ['left', 'right', 'up', 'down'];
    const interval = 4000;

    function transition() {
      const next = (current + 1) % slides.length;
      const dir = dirs[Math.floor(Math.random() * dirs.length)];

      let exitVal, enterStart;
      if (dir === 'left') {
        exitVal = { x: '-100%' };
        enterStart = { x: '100%' };
      } else if (dir === 'right') {
        exitVal = { x: '100%' };
        enterStart = { x: '-100%' };
      } else if (dir === 'up') {
        exitVal = { y: '-100%' };
        enterStart = { y: '100%' };
      } else {
        exitVal = { y: '100%' };
        enterStart = { y: '-100%' };
      }

      gsap.set(slides[next], { x: 0, y: 0, opacity: 0, ...enterStart });

      const tl = gsap.timeline();
      tl.to(slides[current], { ...exitVal, opacity: 0, duration: 0.6, ease: 'power3.inOut' }, 0);
      tl.to(slides[next], { x: 0, y: 0, opacity: 1, duration: 0.6, ease: 'power3.inOut' }, 0);
      tl.call(() => { current = next; });
    }

    setInterval(transition, interval);
  }

  /* =============================================
     SERVICE TAGS — scroll-triggered stagger
     ============================================= */
  gsap.set('.service-tag', { opacity: 0, y: 12, scale: 0.95 });
  ScrollTrigger.create({
    trigger: '.service-tag',
    start: 'top bottom-=40',
    onEnter: () => {
      gsap.to('.service-tag', {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.5,
        stagger: 0.06,
        ease: 'power3.out',
      });
    },
    once: true,
  });

  /* =============================================
     CAMERA BACKGROUND — blurs across entire page
     ============================================= */
  const bgTl = gsap.timeline({
    scrollTrigger: {
      trigger: 'body',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1,
    },
  });

  bgTl.to(camBg, {
    scale: 1.4,
    filter: 'blur(18px) brightness(0.35) saturate(0.6)',
    duration: 1,
    ease: 'none',
  }, 0);

  bgTl.to(camVeil, {
    opacity: 0.7,
    duration: 1,
    ease: 'none',
  }, 0);

  /* =============================================
     HERO — lens crossfade on first scroll
     ============================================= */
  const heroTl = gsap.timeline({
    scrollTrigger: {
      trigger: '#hero',
      start: 'top top',
      end: 'bottom top',
      scrub: 1,
    },
  });

  const lensLayer = document.querySelector('.hero-lens-layer img');
  const heroText = document.querySelector('.hero-text');
  const heroScroll = document.querySelector('.hero-scroll');
  const heroMask = document.querySelector('.hero-mask');

  heroTl.to(lensLayer, { opacity: 1, scale: 1.3, duration: 0.35, ease: 'power2.inOut' }, 0.15);
  heroTl.to(lensLayer, { scale: 1.8, duration: 0.3, ease: 'power1.in' }, 0.5);
  heroTl.to(heroText, { opacity: 0, y: -15, duration: 0.25, ease: 'power2.out' }, 0);
  heroTl.to(heroScroll, { opacity: 0, duration: 0.15 }, 0);
  heroTl.to(heroMask, { opacity: 0.5, duration: 0.2, ease: 'power1.out' }, 0.15);
  heroTl.to(heroMask, { opacity: 0, duration: 0.2, ease: 'power1.in' }, 0.45);

  /* =============================================
     SERVICE CARDS — scroll-triggered stagger
     ============================================= */
  gsap.set('.service-card', { opacity: 0, y: 30 });
  ScrollTrigger.create({
    trigger: '.services-grid',
    start: 'top bottom-=60',
    onEnter: () => {
      gsap.to('.service-card', {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.07,
        ease: 'power3.out',
      });
    },
    once: true,
  });

  /* =============================================
     SHUTTER — fires when content sections enter
     ============================================= */
  document.querySelectorAll('.section-panel').forEach((section) => {
    ScrollTrigger.create({
      trigger: section,
      start: 'top center+=15%',
      onEnter: () => {
        gsap.to(shutter, {
          opacity: 1,
          duration: 0.04,
          onComplete: () => {
            gsap.to(shutter, { opacity: 0, duration: 0.15 });
          },
        });
        gsap.to(section.querySelectorAll('.bokeh-blur'), {
          filter: 'blur(0px) brightness(1)',
          duration: 0.6,
          ease: 'power2.out',
          stagger: 0.05,
        });
      },
    });
  });

  /* =============================================
     GALLERY — stagger reveal
     ============================================= */
  document.querySelectorAll('.gallery-item').forEach((item, i) => {
    gsap.set(item, { opacity: 0, y: 40 });
    ScrollTrigger.create({
      trigger: item,
      start: 'top bottom-=60',
      onEnter: () => {
        gsap.to(item, { opacity: 1, y: 0, duration: 0.7, delay: i * 0.06, ease: 'power3.out' });
      },
      once: true,
    });
  });

  /* =============================================
     SECTIONS — fade in on scroll
     ============================================= */
  document.querySelectorAll('.fade-section').forEach((el) => {
    gsap.set(el, { opacity: 0, y: 30 });
    ScrollTrigger.create({
      trigger: el,
      start: 'top bottom-=80',
      onEnter: () => {
        gsap.to(el, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' });
      },
      once: true,
    });
  });

  /* =============================================
     STAT COUNTERS
     ============================================= */
  document.querySelectorAll('.stat-number').forEach((el) => {
    const val = parseInt(el.dataset.target, 10);
    ScrollTrigger.create({
      trigger: el,
      start: 'top bottom-=40',
      onEnter: () => {
        gsap.fromTo(el, { textContent: 0 }, {
          textContent: val,
          duration: 2,
          ease: 'power2.out',
          snap: { textContent: 1 },
        });
      },
      once: true,
    });
  });
}
