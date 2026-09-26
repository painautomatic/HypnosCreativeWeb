'use strict';

(() => {
  const eye = document.querySelector('.studio-mark');
  if (!eye) return;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const brief = document.querySelector('#brief-dialog');
  let visible = false;
  let awake = false;
  let frame = 0;
  let pointer = null;

  function center() {
    eye.style.setProperty('--gaze-x', '0px');
    eye.style.setProperty('--gaze-y', '0px');
    eye.style.setProperty('--pupil-scale', '1');
  }

  function look() {
    frame = 0;
    if (!awake || !pointer || !finePointer.matches) return;
    const rect = eye.getBoundingClientRect();
    const dx = pointer.x - rect.left - rect.width / 2;
    const dy = pointer.y - rect.top - rect.height / 2;
    const distance = Math.hypot(dx, dy);
    const reach = Math.min(distance * .14, rect.width * .07) / (distance || 1);
    eye.style.setProperty('--gaze-x', `${(dx * reach).toFixed(2)}px`);
    eye.style.setProperty('--gaze-y', `${(dy * reach).toFixed(2)}px`);
    eye.style.setProperty('--pupil-scale', distance < rect.width * .42 ? '.88' : '1');
  }

  function scheduleLook() {
    if (awake && pointer && !frame) frame = requestAnimationFrame(look);
  }

  function sync() {
    awake = visible && !document.hidden && !reducedMotion.matches && !brief?.open && !document.body.classList.contains('eye-motion-paused');
    eye.classList.toggle('eye-awake', awake);
    if (!awake || !finePointer.matches) {
      cancelAnimationFrame(frame);
      frame = 0;
      pointer = null;
      center();
    } else scheduleLook();
  }

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    sync();
  }, { threshold: 0 }).observe(eye);

  document.addEventListener('pointermove', event => {
    if (!awake || !finePointer.matches || event.pointerType === 'touch') return;
    pointer = { x: event.clientX, y: event.clientY };
    scheduleLook();
  }, { passive: true });

  function release() {
    pointer = null;
    center();
  }
  document.documentElement.addEventListener('pointerleave', release);
  window.addEventListener('blur', release);
  document.addEventListener('keydown', event => { if (event.key === 'Tab') release(); });
  window.addEventListener('scroll', scheduleLook, { passive: true });
  window.addEventListener('resize', scheduleLook, { passive: true });
  document.addEventListener('visibilitychange', sync);
  reducedMotion.addEventListener('change', sync);
  finePointer.addEventListener('change', sync);
  if (brief) new MutationObserver(sync).observe(brief, { attributes: true, attributeFilter: ['open'] });
  new MutationObserver(sync).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  sync();
})();
