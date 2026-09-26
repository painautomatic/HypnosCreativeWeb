'use strict';

(() => {
  const eye = document.querySelector('#studyo .studio-mark');
  if (!eye) return;
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const wide = matchMedia('(min-width: 601px)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const selector = 'h1, h2, h3, p, summary, .eyebrow, .text-link, .studio-facts span, .step-label';
  const scene = document.createElement('div');
  scene.className = 'eye-focus-scene';
  scene.setAttribute('aria-hidden', 'true');
  scene.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" focusable="false">
    <defs>
      <filter id="eye-focus-feather" x="-50%" y="-50%" width="200%" height="200%" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="18"/></filter>
      <mask id="eye-focus-openings" maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse" x="0" y="0" width="100%" height="100%" style="mask-type:luminance">
        <rect width="100%" height="100%" fill="white"/>
        <circle class="eye-focus-opening" fill="black" filter="url(#eye-focus-feather)"/>
        <rect class="eye-focus-reading" rx="20" fill="black" filter="url(#eye-focus-feather)"/>
      </mask>
      <linearGradient id="eye-focus-ray-light" gradientUnits="userSpaceOnUse"><stop stop-color="#c5f63b" stop-opacity="0"/><stop offset=".45" stop-color="#c5f63b" stop-opacity=".55"/><stop offset="1" stop-color="#e9ffb8"/></linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="#010400" fill-opacity=".88" mask="url(#eye-focus-openings)"/>
    <path class="eye-focus-ray"/>
    <circle class="eye-focus-ring" r="11"/>
  </svg>`;
  document.body.append(scene);
  const opening = scene.querySelector('.eye-focus-opening');
  const reading = scene.querySelector('.eye-focus-reading');
  const ray = scene.querySelector('.eye-focus-ray');
  const gradient = scene.querySelector('linearGradient');
  const ring = scene.querySelector('.eye-focus-ring');
  let visible = false, candidate = null, active = null, suppressed = null;
  let pointer = null, dwell = 0, leave = 0, frame = 0, scrolling = false, scrollTimer = 0;
  let motion = null, lastFrame = 0, fadingUntil = 0;

  const permitted = () => visible && fine.matches && wide.matches && !reduced.matches && !document.hidden &&
    !scrolling && !document.querySelector('dialog[open]') &&
    !document.body.classList.contains('eye-motion-paused');
  const attrs = (el, values) => Object.entries(values).forEach(([key, value]) => el.setAttribute(key, value.toFixed(2)));

  function paint(stamp) {
    frame = 0;
    if (!pointer || !permitted()) return;
    if (!active && stamp >= fadingUntil) { motion = null; lastFrame = 0; return; }
    const e = eye.getBoundingClientRect();
    const t = active?.getBoundingClientRect();
    if (t && (!t.width || t.bottom <= 0 || t.top >= innerHeight)) { clear(); return; }
    const clamp = (value, reach) => Math.max(-reach, Math.min(reach, value));
    // The opening gently leans toward the pointer while keeping the full text lit.
    // Between targets, preserve the last drawn geometry and glide to the next one.
    const goal = {
      px: pointer.x, py: pointer.y,
      cx: t ? t.left + t.width / 2 + clamp((pointer.x - t.left - t.width / 2) * .1, 10) : pointer.x,
      cy: t ? t.top + t.height / 2 + clamp((pointer.y - t.top - t.height / 2) * .12, 7) : pointer.y,
      width: t ? t.width + 64 : 180,
      height: t ? t.height + 56 : 110
    };
    if (!motion) motion = { ...goal, cx: pointer.x, cy: pointer.y, width: 160, height: 100 };
    const dt = lastFrame ? Math.min((stamp - lastFrame) / 1000, .05) : 1 / 60;
    lastFrame = stamp;
    let remaining = 0;
    Object.keys(goal).forEach(key => {
      const blend = 1 - Math.exp(-dt * (key === 'px' || key === 'py' ? 13 : 8));
      motion[key] += (goal[key] - motion[key]) * blend;
      remaining = Math.max(remaining, Math.abs(goal[key] - motion[key]));
    });
    const x = e.left + e.width / 2, y = e.top + e.height / 2;
    attrs(opening, { cx: x, cy: y, r: e.width * .48 });
    attrs(reading, { x: motion.cx - motion.width / 2, y: motion.cy - motion.height / 2, width: motion.width, height: motion.height });
    // Ring and ray share the same eased endpoint, instead of snapping to mouse events.
    const dx = motion.px - x, dy = motion.py - y, length = Math.hypot(dx, dy) || 1;
    const start = e.width * .4;
    const end = Math.max(start, length - 18);
    const x1 = x + dx / length * start, y1 = y + dy / length * start;
    const x2 = x + dx / length * end, y2 = y + dy / length * end;
    ray.setAttribute('d', `M${x1},${y1} Q${(x1+x2)/2},${(y1+y2)/2-18} ${x2},${y2}`);
    attrs(gradient, { x1, y1, x2, y2 });
    attrs(ring, { cx: motion.px, cy: motion.py });
    if (remaining > .1 || (!active && stamp < fadingUntil)) frame = requestAnimationFrame(paint);
    else lastFrame = 0;
  }

  function schedule() {
    if ((active || fadingUntil > performance.now()) && !frame) frame = requestAnimationFrame(paint);
  }

  function clear(follow = false) {
    clearTimeout(dwell); clearTimeout(leave);
    dwell = 0; leave = 0;
    active?.classList.remove('eye-focus-target');
    active = null; candidate = null;
    scene.classList.remove('is-active');
    eye.classList.remove('eye-reading');
    cancelAnimationFrame(frame); frame = 0; lastFrame = 0;
    fadingUntil = follow && motion && pointer && permitted() ? performance.now() + 850 : 0;
    if (fadingUntil) schedule();
    else motion = null;
  }

  function choose(next) {
    if (!permitted()) { clear(); return; }
    if (next !== suppressed) suppressed = null;
    if (next === suppressed) next = null;
    if (next === candidate) return;
    candidate = next;
    clearTimeout(dwell); clearTimeout(leave);
    if (!next) {
      // Keep the lighting continuous across small gaps, then let it follow the exit.
      leave = setTimeout(() => clear(true), 280);
      return;
    }
    const delay = active || fadingUntil > performance.now() ? 55 : 180;
    dwell = setTimeout(() => {
      if (candidate !== next || !permitted()) return;
      active?.classList.remove('eye-focus-target');
      active = next;
      active.classList.add('eye-focus-target');
      fadingUntil = 0;
      schedule();
      scene.classList.add('is-active');
      eye.classList.add('eye-reading');
    }, delay);
  }

  document.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch' || event.buttons) { clear(); return; }
    pointer = { x: event.clientX, y: event.clientY };
    const target = event.target instanceof Element ? event.target.closest(selector) : null;
    const valid = target?.closest('main') && !target.closest('form, .studio-mark, [contenteditable]');
    choose(valid ? target : null);
    schedule();
  }, { passive: true });

  function release() { pointer = null; suppressed = null; clear(); }
  // Scroll returns to normal lighting until the next deliberate pointer movement.
  window.addEventListener('scroll', () => {
    scrolling = true; release(); clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => { scrolling = false; }, 180);
  }, { passive: true });
  window.addEventListener('resize', release, { passive: true });
  document.addEventListener('pointerdown', event => {
    const control = event.target instanceof Element && event.target.closest('a, button, summary, input, textarea, select, [contenteditable]');
    if (event.pointerType === 'touch' || control || event.detail > 1) { suppressed = candidate; clear(); }
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', release);
  window.addEventListener('blur', release);
  document.addEventListener('visibilitychange', release);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' || event.key === 'Tab') { suppressed = candidate; clear(); }
  });
  fine.addEventListener('change', release);
  wide.addEventListener('change', release);
  reduced.addEventListener('change', release);
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting && entry.intersectionRatio >= .35;
    if (!visible) release();
  }, { threshold: [0, .35] }).observe(eye);
  const sync = () => { if (!permitted()) release(); };
  document.querySelectorAll('dialog').forEach(dialog => new MutationObserver(sync).observe(dialog, { attributes: true, attributeFilter: ['open'] }));
  new MutationObserver(sync).observe(document.body, { attributes: true, attributeFilter: ['class'] });
})();
