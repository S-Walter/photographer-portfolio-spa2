# AGENTS.md — photographer-portfolio

Premium corporate/event photographer SPA.  
GSAP scroll narrative + Tailwind CSS. Image-based (no Three.js).

## Dev commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build |

## Architecture

```
index.html          — single HTML, all sections (hero, gallery, about, services, milestones, contact)
src/
  main.js           — entrypoint: wires scroll-animations + micro-interactions + modal + border-glow
  scroll-animations.js — ScrollTrigger: hero lens crossfade, bg blur, shutter blink, gallery stagger,
                         section fades, stat counters, about slideshow, service card entrance, nav indicator
  micro-interactions.js — magnet hover, ambient orbs (hue rotation), nav highlight (observer + indicator)
  style.css         — Tailwind directives + custom: glassmorphism, kinetic border, bokeh blur, orbs,
                      border-glow ring, service cards, pills, about slideshow, nav indicator
public/images/      — Unsplash: camera-hero.jpg, camera-lens.jpg, gallery-01 through gallery-08
```

## Design Principles (for reuse)

### Visual hierarchy & mood
- **Dark background (rgba(10,10,10,0.85))** lets blurred camera backdrop subtly show through
- **Glassmorphism** (`backdrop-blur-xl`, `rgba(255,255,255,0.035)`, `border 1px rgba(255,255,255,0.06)`) for cards
- **Warm accent** palette: golden-amber (`rgba(255,200,100,0.6)`) to coral (`rgba(255,120,80,0.3)`) — used in border glow and nav indicator
- **Camera as persistent backdrop**: hero image blurs and darkens progressively as user scrolls, creating a living background that evolves with the page
- **No borders on nav**: seamless blend with page; subtle `bg-black/30 backdrop-blur-md` keeps it readable when fixed
- **Pill tags** (`border 1px rgba(255,255,255,0.06)`, `bg rgba(255,255,255,0.04)`, `text-[11px] font-mono tracking-wider`) — reusable `.pill` class for service tags and stat labels

### Scroll narrative (GSAP ScrollTrigger)
- **Hero camera story**: clean product shot → lens crossfade → text fade → bokeh mask — all in first 100vh scrub
- **Shutter blink**: black overlay (`opacity:1` 40ms) on every `.section-panel` entry — mechanical camera feel
- **Gallery stagger**: items fade+slide up sequentially (`0.06s` each)
- **Stat counters**: `data-target` attribute, GSAP `snap: { textContent: 1 }`
- **About slideshow**: one image at a time, random direction transition (left/right/up/down) every 4s
- **Service cards**: stagger entrance on scroll, GSAP icon hover (lift + scale)

### Micro-interactions (details that define quality)
- **Magnet hover**: nav links + buttons subtly follow cursor within 30px radius (GSAP translate)
- **Ambient orbs**: 3 fixed circles, `blur(100px)`, hue oscillates via `requestAnimationFrame` + GSAP float
- **Nav indicator**: warm-gradient underline bar slides between links via GSAP `power3.out`
- **Border glow ring**: `mask-composite: exclude` technique — radial gradient clipped to 2px border ring follows cursor proximity (edge-based, 280px radius)
- **Gallery modal**: GSAP scale+fade open/close, body scroll lock, close on Escape/bg click

### Layout patterns
- **Section structure**: `.section-panel` (`min-h-screen`, `padding: 6rem 1.5rem`, `flex center`) — uniform rhythm
- **Numbered labels**: `01 / Gallery`, `02 / About`, etc. — `font-mono text-[10px] tracking-[0.4em] uppercase`
- **Light headings**: `text-4xl/5xl font-light text-white` — thin weight for elegance
- **Kinetic button**: `conic-gradient` border with `@property --angle` animation, hover scale
- **Service cards grid**: `repeat(auto-fill, minmax(260px, 1fr))` — responsive without media queries

## Concrete UI techniques (copy-paste ready)

### Border glow ring (cursor-following)
```css
.border-glow-ring {
  position: absolute; inset: 0; border-radius: inherit; padding: 2px;
  background: radial-gradient(500px circle at var(--mx,50%) var(--my,50%),
    rgba(255,200,100,0.6) 0%, rgba(255,120,80,0.3) 30%, transparent 60%);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor; mask-composite: exclude;
  pointer-events: none; z-index: 10; opacity: 0;
}
.border-glow-outside .border-glow-ring { inset: -2px; }
```
JS: append ring to `.border-glow` elements. Track mouse globally, compute distance-to-edge (`Math.max(rect.left - mx, 0, mx - rect.right)`) for proximity activation. Only set `position:relative` if computed position is `static`.

### Glass card
```css
.glass {
  backdrop-filter: blur(24px);
  background: rgba(255,255,255,0.035);
  border: 1px solid rgba(255,255,255,0.06);
}
```

### Kinetic gradient border button
```css
.btn-kinetic::before {
  content: ''; position: absolute; inset: 0; border-radius: 9999px; padding: 1px;
  background: conic-gradient(from var(--angle,0deg), rgba(255,255,255,0.9),
    rgba(255,255,255,0.3), transparent, rgba(255,255,255,0.3), rgba(255,255,255,0.9));
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor; mask-composite: exclude;
  animation: spin-gradient 3s linear infinite;
}
@keyframes spin-gradient { to { --angle: 360deg; } }
```

### Shutter overlay
```css
.shutter-overlay { position: fixed; inset: 0; background: black; opacity: 0; z-index: 50; }
```

### Nav indicator
```css
.nav-indicator {
  position: absolute; bottom: -6px; height: 2px; border-radius: 2px;
  background: linear-gradient(90deg, rgba(255,200,100,0.7), rgba(255,120,80,0.5));
  pointer-events: none; opacity: 0;
}
```

## Mistakes & lessons learned (for future projects)

### Critical bugs that happened

1. **JS overwrote CSS `position: fixed`** — `initBorderGlow()` set `el.style.position = 'relative'` on ALL `.border-glow` elements including the nav, breaking its fixed positioning. Nav scrolled with page instead of staying fixed.  
   → **Fix**: Check `getComputedStyle(el).position === 'static'` before setting inline position.

2. **Orbs were rectangles** — orbit divs had no `border-radius: 50%`. The `rounded-full` Tailwind class was in the CSS `@apply` but was never actually applied to the HTML elements.  
   → **Fix**: Explicitly add `rounded-full` class to HTML and define `.orb { border-radius: 50%; }` in CSS.

3. **GSAP pin artifact** — using `pin: true` on hero with `200vh` + ScrollTrigger created visible spacer rectangles.  
   → **Fix**: Remove pinning entirely, use `scrub: 1` with `100vh` only.

4. **Gallery permanent blur** — shutter trigger skipped gallery section due to class name mismatch, leaving images permanently blurred.  
   → **Fix**: Ensure `shutter` query targets all `.section-panel` consistently.

5. **Marquee visual jump** — continuous horizontal scroll with `repeat: -1` caused visible reset jumps.  
   → **Fix**: Switch to `onComplete` + manual reset with duplicated images for seamless loop.  
   → **Later replaced** with sequential slideshow (single image at a time, random directional scroll).

6. **Template literals in raw HTML** — used `${'<svg>...'}` syntax in HTML thinking it would evaluate. Browser treats it as literal text, SVGs broke.  
   → **Fix**: Inline SVG markup directly (no JS template syntax in `.html` files).

7. **Proximity to center vs edge** — border glow used distance-to-element-center for activation. Large elements (gallery grid 800px+) never triggered because cursor was far from center.  
   → **Fix**: Use `Math.max(rect.left - mx, 0, mx - rect.right)` for true edge-distance.

8. **Overflow hidden clips outside glow** — `overflow: hidden` on the same element as `border-glow-outside` clips the ring `inset: -2px`.  
   → **Fix**: Use wrapper pattern — outer div carries `border-glow-outside` (no overflow), inner div has `overflow-hidden` and content.

### Design decisions worth noting

- **No Three.js**: Image-based (Unsplash) instead of 3D model. Smaller bundle (118KB JS vs MBs), faster load, more realistic product photography. Enough for a portfolio SPA.
- **No framework**: Vanilla HTML + Vite ESM imports. Keeps bundle minimal, no virtual DOM overhead for a static page.
- **Pills over colored backgrounds**: Service tags use transparent border + subtle bg instead of solid colors — works with any dark background without clashing.
- **Outside glow vs inside**: For elements with images, outside glow (`inset: -2px`) is visible against bright content. For text-heavy elements, inside glow (`inset: 0`) is usually sufficient.
- **Margin-based nav highlighting**: `rootMargin: '-40% 0px -40% 0px'` ensures only the dominant section (center 20% of viewport) triggers the nav update.

## Key files (current state)

- `index.html` — 282 lines, 5 sections: hero, gallery, about (with slideshow), services (6 glass cards), contact, milestones (stat counters + quote), gallery modal, footer
- `src/style.css` — ~200 lines, Tailwind + custom components
- `src/main.js` — 100 lines: imports, gallery modal, service card hover, border glow proximity
- `src/scroll-animations.js` — 135 lines: all ScrollTrigger logic
- `src/micro-interactions.js` — 85 lines: orbs, magnet hover, nav indicator

## Gotchas

- On Node.js 24 + Windows, Vite/esbuild may throw `EFTYPE` — install `@esbuild/win32-x64` to fix
- Camera and gallery images are from Unsplash (free license, attribution appreciated)
- No test runner, linter, or CI configured yet
- Gallery modal uses `pointer-events: none` on parent to hide — `.is-open` toggles `pointer-events: auto`
- Service card hover radial gradient uses `::after`, border glow ring injected as child div (no pseudo-element conflict)
