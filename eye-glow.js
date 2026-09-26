import { register } from './vendor/glow-card/index.js';
register();

const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const fine=matchMedia('(hover: hover) and (pointer: fine)');

document.querySelectorAll('.studio-mark').forEach(eye=>{
  if(eye.classList.contains('eye-glow-ready'))return;
  const layer=name=>{const el=document.createElement('span');el.className=name;el.setAttribute('aria-hidden','true');return el;};
  eye.prepend(layer('eye-aura'));
  eye.querySelector('.eye-iris').append(layer('eye-sweep'));
  const sparks=layer('eye-sparks');for(let i=0;i<3;i++)sparks.append(layer('eye-spark'));
  eye.append(layer('eye-bloom'),layer('eye-corona'),sparks,layer('eye-touch-wave'));
  const cards=['background','border'].map(variant=>{const card=document.createElement('glow-card');card.setAttribute('variant',variant);card.setAttribute('aria-hidden','true');eye.append(card);return card;});
  eye.classList.add('eye-glow-ready');
  let visible=false,awake=false,frame=0,last=0,time=0,pointer=null,pulseTimer=0;
  let x=.42,y=.3,power=.45;
  const clamp=(n,min,max)=>Math.min(max,Math.max(min,n));
  const paint=()=>{
    cards.forEach(card=>card.updateGlow(x,y,.55+power*.45));
    eye.style.setProperty('--eye-glow-power',power.toFixed(3));
    eye.style.setProperty('--eye-light-x',(x*100).toFixed(2)+'%');
    eye.style.setProperty('--eye-light-y',(y*100).toFixed(2)+'%');
  };
  const tick=stamp=>{
    if(!awake)return;
    if(!last)last=stamp;
    if(stamp-last>=32){
      const dt=Math.min((stamp-last)/1000,.08);time+=dt;last=stamp;
      const r=eye.getBoundingClientRect();
      let tx=.5+Math.cos(time*.3)*.22,ty=.4+Math.sin(time*.37)*.24,target=.42;
      if(pointer){tx=clamp((pointer.x-r.left)/r.width,0,1);ty=clamp((pointer.y-r.top)/r.height,0,1);const distance=Math.hypot((pointer.x-r.left)/r.width-.5,(pointer.y-r.top)/r.height-.5);target=clamp(1-distance*.7,.35,1);}
      const blend=1-Math.exp(-dt*7);x+=(tx-x)*blend;y+=(ty-y)*blend;power+=(target-power)*blend;paint();
    }
    frame=requestAnimationFrame(tick);
  };
  const sync=()=>{
    const next=visible&&!document.hidden&&!reduced.matches&&!document.querySelector('dialog[open]')&&!document.body.classList.contains('eye-motion-paused');
    eye.classList.toggle('glow-sleep',!next);
    eye.dataset.glowAwake=String(next);
    if(next===awake)return;
    awake=next;cancelAnimationFrame(frame);frame=0;last=0;
    if(awake)frame=requestAnimationFrame(tick);else{pointer=null;x=.42;y=.3;power=.45;paint();}
  };
  const resize=new ResizeObserver(()=>{eye.style.setProperty('--eye-glow-size',Math.round(eye.getBoundingClientRect().width*.65)+'px');});resize.observe(eye);
  new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();},{threshold:.02}).observe(eye);
  document.addEventListener('pointermove',e=>{if(awake&&fine.matches&&e.pointerType!=='touch')pointer={x:e.clientX,y:e.clientY};},{passive:true});
  document.documentElement.addEventListener('pointerleave',()=>pointer=null);
  window.addEventListener('blur',()=>pointer=null);
  eye.addEventListener('pointerdown',()=>{if(!awake)return;clearTimeout(pulseTimer);eye.classList.add('eye-touched');pulseTimer=setTimeout(()=>eye.classList.remove('eye-touched'),1150);},{passive:true});
  document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',sync);
  fine.addEventListener('change',()=>pointer=null);
  document.querySelectorAll('dialog').forEach(dialog=>new MutationObserver(sync).observe(dialog,{attributes:true,attributeFilter:['open']}));
  new MutationObserver(sync).observe(document.body,{attributes:true,attributeFilter:['class']});
  paint();sync();
});
