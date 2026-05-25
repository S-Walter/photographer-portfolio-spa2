import gsap from 'gsap';
import { initScrollAnimations } from './scroll-animations.js';
import { initMicroInteractions } from './micro-interactions.js';

initScrollAnimations();
initMicroInteractions();

/* =============================================
   GALLERY MODAL
   ============================================= */
const modal = document.getElementById('gallery-modal');
const modalBg = modal?.querySelector('.gallery-modal-bg');
const modalContent = modal?.querySelector('.gallery-modal-content');
const modalImg = modal?.querySelector('img');
const modalAlt = modal?.querySelector('.gallery-modal-alt');
const modalMeta = modal?.querySelector('.gallery-modal-meta');
const modalClose = modal?.querySelector('.gallery-modal-close');

if (modal) {
  const galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
  let currentIndex = 0;

  function getItemData(idx) {
    const item = galleryItems[idx];
    if (!item) return null;
    const img = item.querySelector('img');
    const meta = item.querySelector('.meta');
    return {
      src: img?.src || '',
      alt: img?.getAttribute('alt') || '',
      meta: meta ? meta.textContent.trim().replace(/\s+/g, '  \u2014  ') : '',
    };
  }

  function openModal(idx) {
    currentIndex = idx;
    const data = getItemData(idx);
    if (!data) return;
    modalImg.src = data.src;
    modalImg.alt = data.alt;
    modalAlt.textContent = data.alt;
    modalMeta.textContent = data.meta;
    document.body.style.overflow = 'hidden';

    gsap.set(modal, { visibility: 'visible' });
    gsap.set(modalBg, { opacity: 0 });
    gsap.set(modalContent, { opacity: 0, y: 20, scale: 0.95 });

    const tl = gsap.timeline();
    tl.to(modal, { opacity: 1, duration: 0.2, ease: 'power2.out' }, 0);
    tl.to(modalBg, { opacity: 1, duration: 0.25, ease: 'power2.out' }, 0);
    tl.to(modalContent, { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: 'power3.out' }, 0.05);
  }

  function navigateModal(dir) {
    const next = (currentIndex + dir + galleryItems.length) % galleryItems.length;
    if (next === currentIndex) return;
    currentIndex = next;
    const data = getItemData(next);
    if (!data) return;

    const exitX = dir > 0 ? -80 : 80;
    const enterX = dir > 0 ? 80 : -80;

    gsap.to(modalImg, {
      x: exitX, opacity: 0, duration: 0.2, ease: 'power2.in',
      onComplete: () => {
        modalImg.src = data.src;
        modalImg.alt = data.alt;
        modalAlt.textContent = data.alt;
        modalMeta.textContent = data.meta;
        gsap.set(modalImg, { x: enterX, opacity: 0 });
        gsap.to(modalImg, { x: 0, opacity: 1, duration: 0.25, ease: 'power2.out' });
      },
    });
  }

  function closeModal() {
    document.body.style.overflow = '';
    gsap.killTweensOf(modalImg);
    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set(modal, { visibility: 'hidden' });
        gsap.set(modalImg, { x: 0, opacity: 1 });
        modalImg.src = '';
      },
    });
    tl.to(modalContent, { opacity: 0, y: 10, scale: 0.97, duration: 0.18, ease: 'power2.in' }, 0);
    tl.to(modalBg, { opacity: 0, duration: 0.18, ease: 'power2.in' }, 0);
  }

  galleryItems.forEach((item, i) => {
    item.addEventListener('click', () => openModal(i));
  });

  modalBg.addEventListener('click', closeModal);
  modalClose.addEventListener('click', closeModal);
  modal.querySelector('.gallery-modal-prev')?.addEventListener('click', (e) => { e.stopPropagation(); navigateModal(-1); });
  modal.querySelector('.gallery-modal-next')?.addEventListener('click', (e) => { e.stopPropagation(); navigateModal(1); });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
    if (e.key === 'ArrowLeft') navigateModal(-1);
    if (e.key === 'ArrowRight') navigateModal(1);
  });

  // Swipe support
  let touchStartX = 0;
  let touchStartY = 0;
  modal.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  }, { passive: true });
  modal.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].screenX - touchStartX;
    const dy = e.changedTouches[0].screenY - touchStartY;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      navigateModal(dx > 0 ? -1 : 1);
    }
  }, { passive: true });
}

/* =============================================
   SERVICE CARD — GSAP icon hover animation
   ============================================= */
document.querySelectorAll('.service-card').forEach((card) => {
  const icon = card.querySelector('.service-icon');
  if (!icon) return;
  card.addEventListener('mouseenter', () => {
    gsap.to(icon, { y: -3, scale: 1.1, duration: 0.3, ease: 'power2.out' });
  });
  card.addEventListener('mouseleave', () => {
    gsap.to(icon, { y: 0, scale: 1, duration: 0.3, ease: 'power2.out' });
  });
});

/* =============================================
   BORDER GLOW — proximity-based cursor glow
   ============================================= */
function initBorderGlow() {
  const els = document.querySelectorAll('.border-glow');
  if (!els.length) return;
  const proximity = 280;
  const glowStates = [];

  els.forEach((el) => {
    const ring = document.createElement('div');
    ring.className = 'border-glow-ring';
    if (getComputedStyle(el).position === 'static') {
      el.style.position = 'relative';
    }
    el.appendChild(ring);
    glowStates.push({ el, ring, opacity: 0 });
  });

  let frame;

  document.addEventListener('mousemove', (e) => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      const mx = e.clientX;
      const my = e.clientY;

      glowStates.forEach((s) => {
        const rect = s.el.getBoundingClientRect();
        const dx = Math.max(rect.left - mx, 0, mx - rect.right);
        const dy = Math.max(rect.top - my, 0, my - rect.bottom);
        const dist = Math.sqrt(dx * dx + dy * dy);

        const x = ((mx - rect.left) / rect.width) * 100;
        const y = ((my - rect.top) / rect.height) * 100;
        s.ring.style.setProperty('--mx', x + '%');
        s.ring.style.setProperty('--my', y + '%');

        const target = dist < proximity ? 1 : 0;
        if (target !== s.opacity) {
          s.opacity = target;
          gsap.to(s.ring, { opacity: target, duration: 0.3, ease: 'power2.out' });
        }
      });
    });
  });
}

initBorderGlow();
