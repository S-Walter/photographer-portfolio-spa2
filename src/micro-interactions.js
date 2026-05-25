import gsap from 'gsap';

export function initMicroInteractions() {
  // ambient orbs with hue rotation
  const orbs = document.querySelectorAll('.orb');
  let hue = 0;
  function animateOrbs() {
    hue = (hue + 0.15) % 360;
    orbs.forEach((orb, i) => {
      const offset = i * 60;
      const h = (hue + offset) % 360;
      orb.style.background = `hsla(${h}, 60%, 40%, 0.25)`;
    });
    requestAnimationFrame(animateOrbs);
  }
  animateOrbs();

  // floating motion for orbs
  gsap.to('.orb', {
    y: 'random(-30, 30)',
    x: 'random(-20, 20)',
    duration: 'random(4, 8)',
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut',
  });

  // nav link magnet effect
  document.querySelectorAll('.nav-link, .btn-kinetic').forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const dist = Math.sqrt(x * x + y * y);
      if (dist < 30) {
        const strength = (30 - dist) / 30 * 6;
        el.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
      } else {
        el.style.transform = '';
      }
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
    });
  });

  // section nav highlight with animated indicator
  const navLinks = document.querySelectorAll('.nav-link');
  const panels = document.querySelectorAll('.section-panel');
  const indicator = document.querySelector('.nav-indicator');
  let activeId = null;

  function moveIndicator(id) {
    if (!indicator) return;
    const link = Array.from(navLinks).find(
      (l) => l.getAttribute('href')?.replace('#', '') === id
    );
    if (!link) { gsap.to(indicator, { opacity: 0, duration: 0.3 }); return; }

    const parentRect = link.parentElement.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();

    gsap.to(indicator, {
      x: linkRect.left - parentRect.left,
      width: linkRect.width,
      opacity: 1,
      duration: 0.35,
      ease: 'power3.out',
    });
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        if (id === activeId) return;
        activeId = id;
        navLinks.forEach((link) => {
          const href = link.getAttribute('href')?.replace('#', '');
          gsap.to(link, {
            color: href === id ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.4)',
            duration: 0.3,
            ease: 'power2.out',
          });
        });
        moveIndicator(id);
      }
    });
  }, { rootMargin: '-40% 0px -40% 0px' });
  panels.forEach((p) => observer.observe(p));
}
