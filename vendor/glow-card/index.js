var w=`
	:host {
		display: block;
		position: relative;
		border-radius: var(--glow-radius, 12px);
		--_glow-x: 0.5;
		--_glow-y: 0.5;
		--_glow-opacity: 0;
		--_glow-color: var(--glow-color, #6366f1);
		--_glow-size: var(--glow-size, 200px);
		--_glow-blur: var(--glow-blur, 40px);
		--_glow-border-width: var(--glow-border-width, 1px);
		--_glow-intensity: var(--glow-intensity, 1);
		--_glow-transition: var(--glow-transition, opacity 0.3s ease);
	}

	.glow-effect {
		z-index: 2;
	}

	:host([variant="border"]) .glow-effect,
	:host(:not([variant])) .glow-effect {
		position: absolute;
		inset: 0;
		border-radius: inherit;
		pointer-events: none;
		opacity: calc(var(--_glow-opacity) * var(--_glow-intensity));
		transition: var(--_glow-transition);
		border: var(--_glow-border-width) solid transparent;
		-webkit-mask:
			linear-gradient(#000 0 0) content-box,
			linear-gradient(#000 0 0);
		mask:
			linear-gradient(#000 0 0) content-box,
			linear-gradient(#000 0 0);
		-webkit-mask-composite: xor;
		mask-composite: exclude;
		background: radial-gradient(
			var(--_glow-size) circle at
				calc(var(--_glow-x) * 100%)
				calc(var(--_glow-y) * 100%),
			var(--_glow-color),
			transparent 70%
		);
		background-origin: border-box;
	}

	:host([variant="background"]) .glow-effect {
		position: absolute;
		inset: 0;
		border-radius: inherit;
		pointer-events: none;
		opacity: calc(var(--_glow-opacity) * var(--_glow-intensity) * 0.15);
		transition: var(--_glow-transition);
		filter: blur(var(--_glow-blur));
		background: radial-gradient(
			var(--_glow-size) circle at
				calc(var(--_glow-x) * 100%)
				calc(var(--_glow-y) * 100%),
			var(--_glow-color),
			transparent 70%
		);
	}

	:host([variant="spotlight"]) .glow-effect {
		position: absolute;
		inset: 0;
		border-radius: inherit;
		pointer-events: none;
		opacity: calc(var(--_glow-opacity) * var(--_glow-intensity));
		transition: var(--_glow-transition);
		background: radial-gradient(
			calc(var(--_glow-size) * 0.6) circle at
				calc(var(--_glow-x) * 100%)
				calc(var(--_glow-y) * 100%),
			transparent 0%,
			transparent 25%,
			rgba(0, 0, 0, 0.7) 100%
		);
	}

	:host([variant="glow-line"]) .glow-effect {
		position: absolute;
		inset: 0;
		border-radius: inherit;
		pointer-events: none;
		opacity: calc(var(--_glow-opacity) * var(--_glow-intensity));
		transition: var(--_glow-transition);
		border: var(--_glow-border-width) solid transparent;
		-webkit-mask:
			linear-gradient(#000 0 0) content-box,
			linear-gradient(#000 0 0);
		mask:
			linear-gradient(#000 0 0) content-box,
			linear-gradient(#000 0 0);
		-webkit-mask-composite: xor;
		mask-composite: exclude;
		background: conic-gradient(
			from calc(atan2(
				calc(var(--_glow-y) - 0.5),
				calc(var(--_glow-x) - 0.5)
			)),
			transparent 0%,
			var(--_glow-color) 10%,
			transparent 20%
		);
		background-origin: border-box;
	}

	:host([variant="rainbow"]) .glow-effect {
		position: absolute;
		inset: 0;
		border-radius: inherit;
		pointer-events: none;
		opacity: calc(var(--_glow-opacity) * var(--_glow-intensity));
		transition: var(--_glow-transition);
		border: var(--_glow-border-width) solid transparent;
		-webkit-mask:
			linear-gradient(#000 0 0) content-box,
			linear-gradient(#000 0 0);
		mask:
			linear-gradient(#000 0 0) content-box,
			linear-gradient(#000 0 0);
		-webkit-mask-composite: xor;
		mask-composite: exclude;
		background: conic-gradient(
			from calc(atan2(
				calc(var(--_glow-y) - 0.5),
				calc(var(--_glow-x) - 0.5)
			)) at
				calc(var(--_glow-x) * 100%)
				calc(var(--_glow-y) * 100%),
			#f06,
			#9f0,
			#0ff,
			#90f,
			#f06
		);
		background-origin: border-box;
	}

	:host([variant="pulse"]) .glow-effect {
		position: absolute;
		inset: 0;
		border-radius: inherit;
		pointer-events: none;
		opacity: calc(var(--_glow-opacity) * var(--_glow-intensity));
		transition: var(--_glow-transition);
		border: var(--_glow-border-width) solid transparent;
		-webkit-mask:
			linear-gradient(#000 0 0) content-box,
			linear-gradient(#000 0 0);
		mask:
			linear-gradient(#000 0 0) content-box,
			linear-gradient(#000 0 0);
		-webkit-mask-composite: xor;
		mask-composite: exclude;
		background: radial-gradient(
			var(--_glow-size) circle at
				calc(var(--_glow-x) * 100%)
				calc(var(--_glow-y) * 100%),
			var(--_glow-color),
			transparent 70%
		);
		background-origin: border-box;
		animation: glow-pulse 2s ease-in-out infinite;
	}

	@keyframes glow-pulse {
		0%, 100% { filter: brightness(1); }
		50% { filter: brightness(1.5); }
	}

	@media (prefers-reduced-motion: reduce) {
		:host([variant="pulse"]) .glow-effect {
			animation: none;
		}
	}

	.content {
		position: relative;
		z-index: 1;
	}
`;var u=["variant","disabled"],i=class extends HTMLElement{static tagName="glow-card";#e=null;#t=null;static get observedAttributes(){return [...u]}constructor(){super();let t=this.attachShadow({mode:"open"}),e=document.createElement("style");e.textContent=w,t.appendChild(e);let o=document.createElement("div");o.classList.add("content");let n=document.createElement("slot");o.appendChild(n),t.appendChild(o);let a=document.createElement("div");a.classList.add("glow-effect"),a.setAttribute("aria-hidden","true"),t.appendChild(a);}connectedCallback(){this.#t=new AbortController;let{signal:t}=this.#t;this.#e=this.closest("glow-card-group"),!this.#e&&(this.addEventListener("pointermove",this.#o,{signal:t}),this.addEventListener("pointerenter",this.#r,{signal:t}),this.addEventListener("pointerleave",this.#i,{signal:t}));}disconnectedCallback(){this.#t?.abort(),this.#t=null,this.#e=null;}attributeChangedCallback(t,e,o){t==="disabled"&&o!==null&&this.style.setProperty("--_glow-opacity","0");}updateGlow(t,e,o){this.style.setProperty("--_glow-x",String(t)),this.style.setProperty("--_glow-y",String(e)),this.style.setProperty("--_glow-opacity",String(o));}#o=t=>{if(this.hasAttribute("disabled"))return;let e=this.getBoundingClientRect();if(e.width===0||e.height===0)return;let o=(t.clientX-e.left)/e.width,n=(t.clientY-e.top)/e.height;this.style.setProperty("--_glow-x",String(o)),this.style.setProperty("--_glow-y",String(n));};#r=()=>{this.hasAttribute("disabled")||this.style.setProperty("--_glow-opacity","1");};#i=()=>{this.style.setProperty("--_glow-opacity","0");}};function s(r=i.tagName){customElements.get(r)||customElements.define(r,i);}var l=class extends HTMLElement{static tagName="glow-card-group";#e=null;#t=null;#o=[];#r(){this.#o=Array.from(this.querySelectorAll("*")).filter(t=>t instanceof i);}connectedCallback(){this.#e=new AbortController;let{signal:t}=this.#e;this.#r(),this.#t=new MutationObserver(()=>this.#r()),this.#t.observe(this,{childList:true,subtree:true}),this.addEventListener("pointermove",this.#i,{signal:t}),this.addEventListener("pointerleave",this.#n,{signal:t});}disconnectedCallback(){this.#e?.abort(),this.#e=null,this.#t?.disconnect(),this.#t=null,this.#o=[];}#i=t=>{for(let e of this.#o){if(e.hasAttribute("disabled"))continue;let o=e.getBoundingClientRect();if(o.width===0||o.height===0)continue;let n=(t.clientX-o.left)/o.width,a=(t.clientY-o.top)/o.height,d=n-.5,g=a-.5,p=Math.sqrt(d*d+g*g),b=Math.max(0,1-p/1.5);e.updateGlow(n,a,b);}};#n=()=>{for(let t of this.#o)t.updateGlow(.5,.5,0);}};function c(r=l.tagName){customElements.get(r)||customElements.define(r,l);}function C(){s(),c();}export{i as GlowCardElement,l as GlowCardGroupElement,C as register,s as registerGlowCard,c as registerGlowCardGroup};