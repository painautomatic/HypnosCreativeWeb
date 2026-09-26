'use strict';

(() => {
  const field = document.querySelector('.ambient-field');
  const canvas = document.querySelector('#proximity-field');
  const context = canvas?.getContext('2d', { alpha: true });
  if (!field || !context) return;

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const root = document.documentElement;
  const hero = document.querySelector('.hero');
  const universe = document.querySelector('.universe');
  const brief = document.querySelector('#brief-dialog');
  const pointer = { x: -1000, y: -1000, sx: -1000, sy: -1000, active: false, strength: 0 };
  const magnets = [...document.querySelectorAll('main .pill, .header-cta, .card-arrow, .back-top')].map(element => ({ element, rect: null }));
  const surfaces = [...document.querySelectorAll('.card-image, .service, .process-grid article')].map(element => ({ element, rect: null, tilt: element.classList.contains('card-image') }));
  const bounds = { hero: null, universe: null };
  let points = [], ripples = [], columns = 0;
  let width = 0, height = 0, pixelRatio = 1, enabled = false;
  let frame = 0, lastFrame = 0, lastInput = 0, rectsDirty = true, effectsDirty = true;

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const set = (element, key, value) => element.style.setProperty(key, value);
  const distanceToRect = (x, y, rect) => Math.hypot(Math.max(rect.left - x, 0, x - rect.right), Math.max(rect.top - y, 0, y - rect.bottom));

  function measure() {
    // Remove our small translations from measured hit areas to avoid hover drift.
    magnets.forEach(item => {
      const rect = item.element.getBoundingClientRect();
      const style = getComputedStyle(item.element).translate.split(' ').map(parseFloat);
      const dx = Number.isFinite(style[0]) ? style[0] : 0;
      const dy = Number.isFinite(style[1]) ? style[1] : 0;
      item.rect = { left: rect.left - dx, right: rect.right - dx, top: rect.top - dy, bottom: rect.bottom - dy, width: rect.width, height: rect.height };
    });
    surfaces.forEach(item => { item.rect = item.element.getBoundingClientRect(); });
    bounds.hero = hero.getBoundingClientRect();
    bounds.universe = universe.getBoundingClientRect();
    rectsDirty = false;
  }

  function resize() {
    if (!enabled) return;
    width = document.documentElement.clientWidth;
    height = innerHeight;
    // Bound the drawing cost on Retina and very large displays.
    pixelRatio = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    const spacing = Math.max(32, Math.sqrt(width * height / 1800));
    columns = Math.ceil(width / spacing) + 1;
    const rows = Math.ceil(height / spacing) + 1;
    const offsetX = (width - (columns - 1) * spacing) / 2;
    const offsetY = (height - (rows - 1) * spacing) / 2;
    points = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        const x = offsetX + col * spacing, y = offsetY + row * spacing;
        points.push({ x, y, ox: x, oy: y, vx: 0, vy: 0, heat: 0 });
      }
    }
    rectsDirty = effectsDirty = true;
    field.classList.add('is-ready');
  }

  function updateSurfaces() {
    if (rectsDirty) measure();
    const { x, y } = pointer;
    const active = pointer.active && !brief.open;
    magnets.forEach(({ element, rect }) => {
      const range = 65;
      const reach = active ? Math.max(0, 1 - distanceToRect(x, y, rect) / range) : 0;
      const dx = clamp((x - rect.left - rect.width / 2) * .16, -8, 8) * reach;
      const dy = clamp((y - rect.top - rect.height / 2) * .2, -6, 6) * reach;
      set(element, '--magnet-x', `${dx.toFixed(2)}px`);
      set(element, '--magnet-y', `${dy.toFixed(2)}px`);
    });
    surfaces.forEach(({ element, rect, tilt }) => {
      const reach = active ? Math.max(0, 1 - distanceToRect(x, y, rect) / 95) : 0;
      set(element, '--spot-strength', reach.toFixed(3));
      if (reach) {
        set(element, '--spot-x', `${(x - rect.left).toFixed(1)}px`);
        set(element, '--spot-y', `${(y - rect.top).toFixed(1)}px`);
      }
      if (tilt) {
        set(element, '--tilt-x', `${(clamp((y - rect.top) / rect.height - .5, -.5, .5) * -5 * reach).toFixed(2)}deg`);
        set(element, '--tilt-y', `${(clamp((x - rect.left) / rect.width - .5, -.5, .5) * 5 * reach).toFixed(2)}deg`);
      }
    });
    const h = bounds.hero;
    const heroActive = active && y >= h.top && y <= h.bottom;
    const hx = heroActive ? clamp((x / width - .5) * 2, -1, 1) : 0;
    const hy = heroActive ? clamp(((y - h.top) / Math.min(h.height, height) - .5) * 2, -1, 1) : 0;
    set(hero, '--depth-x', `${(hx * 6).toFixed(2)}px`);
    set(hero, '--depth-y', `${(hy * 4).toFixed(2)}px`);
    set(hero, '--orbit-angle', `${(hx * 5).toFixed(2)}deg`);
    set(hero, '--horizon-x', `${(hx * 25).toFixed(2)}px`);
    const u = bounds.universe;
    const ur = active ? Math.max(0, 1 - distanceToRect(x, y, u) / 120) : 0;
    set(universe, '--map-x', `${(clamp((x - u.left) / u.width - .5, -.5, .5) * 10 * ur).toFixed(2)}px`);
    set(universe, '--map-y', `${(clamp((y - u.top) / u.height - .5, -.5, .5) * 10 * ur).toFixed(2)}px`);
    effectsDirty = false;
  }

  function draw(time) {
    frame = 0;
    if (!enabled || document.hidden || brief.open) return;
    frame = requestAnimationFrame(draw);
    const elapsed = time - lastFrame;
    // The resting field uses a quieter frame rate; interaction stays fluid.
    if (elapsed < ((pointer.active && time - lastInput < 1200) || ripples.length ? 15 : 32)) return;
    const dt = Math.min(elapsed / 16.667 || 1, 2);
    lastFrame = time;
    if (effectsDirty || rectsDirty) updateSurfaces();
    pointer.strength += ((pointer.active ? 1 : 0) - pointer.strength) * .12 * dt;
    pointer.sx += (pointer.x - pointer.sx) * .16 * dt;
    pointer.sy += (pointer.y - pointer.sy) * .16 * dt;
    context.clearRect(0, 0, width, height);

    if (pointer.strength > .01) {
      const glow = context.createRadialGradient(pointer.sx, pointer.sy, 0, pointer.sx, pointer.sy, 260);
      glow.addColorStop(0, `rgba(158,213,50,${.075 * pointer.strength})`);
      glow.addColorStop(.5, `rgba(119,164,41,${.022 * pointer.strength})`);
      glow.addColorStop(1, 'rgba(119,164,41,0)');
      context.fillStyle = glow;
      context.fillRect(0, 0, width, height);
    }

    ripples = ripples.filter(ripple => time - ripple.time < 1500);
    const hot = [];
    context.beginPath();
    points.forEach((point, index) => {
      const dx = point.ox - pointer.sx, dy = point.oy - pointer.sy;
      const distance = Math.hypot(dx, dy);
      const proximity = Math.max(0, 1 - distance / 185) * pointer.strength;
      const force = proximity * proximity * 43;
      let tx = point.ox + dx / (distance || 1) * force;
      let ty = point.oy + dy / (distance || 1) * force;
      let rippleHeat = 0;
      ripples.forEach(ripple => {
        const age = (time - ripple.time) / 1500;
        const rx = point.ox - ripple.x, ry = point.oy - ripple.y;
        const rd = Math.hypot(rx, ry);
        const wave = Math.max(0, 1 - Math.abs(rd - age * 680) / 60) * (1 - age);
        tx += rx / (rd || 1) * wave * 18;
        ty += ry / (rd || 1) * wave * 18;
        rippleHeat = Math.max(rippleHeat, wave * .75);
      });
      // Spring back to the grid with a soft, damped overshoot.
      point.vx = (point.vx + (tx - point.x) * .055 * dt) * Math.pow(.76, dt);
      point.vy = (point.vy + (ty - point.y) * .055 * dt) * Math.pow(.76, dt);
      point.x += point.vx * dt;
      point.y += point.vy * dt;
      point.heat += (Math.max(proximity, rippleHeat) - point.heat) * .18 * dt;
      const breath = Math.sin(point.ox * .007 + point.oy * .006 + time * .00035) * .12;
      const radius = .85 + breath;
      context.moveTo(point.x + radius, point.y);
      context.arc(point.x, point.y, radius, 0, Math.PI * 2);
      if (point.heat > .025) hot.push(index);
    });
    context.fillStyle = 'rgba(167,197,112,.24)';
    context.fill();

    hot.forEach(index => {
      const point = points[index];
      context.beginPath();
      context.arc(point.x, point.y, .9 + point.heat * 1.6, 0, Math.PI * 2);
      context.fillStyle = `rgba(199,247,90,${point.heat * .82})`;
      context.fill();
      // Local lattice connections only: no expensive all-pairs particle search.
      if (point.heat > .3) [index + 1, index + columns].forEach(neighbourIndex => {
        const neighbour = points[neighbourIndex];
        if (!neighbour || neighbour.heat < .3 || (neighbourIndex === index + 1 && neighbourIndex % columns === 0)) return;
        context.beginPath();
        context.moveTo(point.x, point.y);
        context.lineTo(neighbour.x, neighbour.y);
        context.strokeStyle = `rgba(187,239,74,${Math.min(point.heat, neighbour.heat) * .13})`;
        context.lineWidth = .65;
        context.stroke();
      });
    });
  }

  function wake() {
    if (enabled && !frame && !document.hidden && !brief.open) {
      lastFrame = performance.now();
      frame = requestAnimationFrame(draw);
    }
  }

  function release() {
    pointer.active = false;
    effectsDirty = true;
    if (enabled) updateSurfaces();
  }

  function configure() {
    enabled = finePointer.matches && !reducedMotion.matches;
    cancelAnimationFrame(frame);
    frame = 0;
    root.classList.toggle('motion-enabled', enabled);
    field.dataset.mode = enabled ? 'interactive' : 'static';
    if (enabled) {
      magnets.forEach(({element}) => element.classList.add('magnetic'));
      resize();
      wake();
    } else {
      release();
      field.classList.remove('is-ready');
      context.clearRect(0, 0, canvas.width, canvas.height);
      ripples = [];
    }
  }

  window.addEventListener('pointermove', event => {
    if (!enabled || event.pointerType === 'touch' || brief.open) return;
    if (!pointer.active) { pointer.sx = event.clientX; pointer.sy = event.clientY; }
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.active = true;
    lastInput = performance.now();
    effectsDirty = true;
    wake();
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', release);
  window.addEventListener('blur', release);
  document.addEventListener('keydown', event => { if (event.key === 'Tab') release(); });
  window.addEventListener('scroll', () => { rectsDirty = effectsDirty = true; }, { passive: true });
  window.addEventListener('resize', resize, { passive: true });
  document.addEventListener('toggle', () => { rectsDirty = effectsDirty = true; }, true);
  document.fonts?.ready.then(() => { rectsDirty = effectsDirty = true; });
  window.addEventListener('pointerdown', event => {
    if (!enabled || event.button !== 0 || event.pointerType === 'touch' || brief.open) return;
    if (event.target.closest('a,button,input,textarea,select,label,summary,dialog')) return;
    ripples.push({ x: event.clientX, y: event.clientY, time: performance.now() });
    ripples = ripples.slice(-3);
    wake();
  }, { passive: true });
  document.addEventListener('visibilitychange', () => {
    release();
    if (document.hidden) { cancelAnimationFrame(frame); frame = 0; }
    else wake();
  });
  new MutationObserver(() => {
    release();
    if (brief.open) { cancelAnimationFrame(frame); frame = 0; }
    else { rectsDirty = true; wake(); }
  }).observe(brief, { attributes: true, attributeFilter: ['open'] });
  finePointer.addEventListener('change', configure);
  reducedMotion.addEventListener('change', configure);
  configure();
})();
