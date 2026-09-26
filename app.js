'use strict';

// Mobile navigation also closes after keyboard navigation and on larger screens.
const menuButton = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('#mobile-nav');
function closeMenu() {
  mobileNav.hidden = true;
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Menüyü aç');
}
menuButton.addEventListener('click', () => {
  const opening = mobileNav.hidden;
  mobileNav.hidden = !opening;
  menuButton.setAttribute('aria-expanded', String(opening));
  menuButton.setAttribute('aria-label', opening ? 'Menüyü kapat' : 'Menüyü aç');
});
mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !mobileNav.hidden) {
    closeMenu();
    menuButton.focus();
  }
});
window.matchMedia('(min-width:851px)').addEventListener('change', event => {
  if (event.matches) closeMenu();
});

const orbitSteps = [
  { title: 'Önce sizi\ntanıyoruz.', description: 'Sektörünüzü, rakiplerinizi, hedef kitlenizi ve içerik ihtiyacınızı inceliyoruz. Çözümünüzü markanızın gerçek ihtiyaçları üzerine tasarlıyoruz.' },
  { title: 'Sizin kimliğiniz.\nSizin dünyanız.', description: 'Logonuz, renk paletiniz, ürünleriniz ve iletişim tonunuz markanızın referans kütüphanesinde buluşur. Üretilen her içerik sizin kimliğinize bağlı kalır.' },
  { title: 'Tek kimlik.\nSonsuz ifade.', description: 'Kampanya görseli, sosyal medya içeriği, kısa video ve metin. İçerikleri markanızın kendi formatlarında, ihtiyaç duyduğu mecralar için üretiyoruz.' },
  { title: 'Ekibinizin\nritminde.', description: 'Çözümü ekibinizin çalışma biçimine göre kuruyoruz. Planlama, onay ve teslim süreçlerini bir araya getiriyor, üretimi günlük iş akışınıza yerleştiriyoruz.' },
  { title: 'Sizinle birlikte\ngelişir.', description: 'Yeni ürünler, kampanyalar ve mecralar eklendikçe çözümünüzü güncelliyoruz. Pilot üretim ve ince ayarla başlayan süreç, markanızla birlikte gelişmeye devam eder.' }
];
const orbitButtons = [...document.querySelectorAll('[data-orbit]')];
orbitButtons.forEach(button => button.addEventListener('click', () => {
  const index = Number(button.dataset.orbit);
  const step = orbitSteps[index];
  orbitButtons.forEach((item, i) => {
    item.classList.toggle('is-active', i === index);
    item.setAttribute('aria-pressed', String(i === index));
  });
  const title = document.querySelector('#orbit-title');
  title.replaceChildren();
  step.title.split('\n').forEach((line, i) => {
    if (i) title.append(document.createTextNode(' '), document.createElement('br'));
    title.append(document.createTextNode(line));
  });
  document.querySelector('#orbit-description').textContent = step.description;
  document.querySelector('.orbit-counter').firstChild.textContent = `0${index + 1} `;
  document.querySelectorAll('.orbit-progress span').forEach((item, i) => item.classList.toggle('active', i === index));
}));

// Native details provide keyboard and no-script support; keep each group tidy.
document.querySelectorAll('.service-list, .faq-list').forEach(group => {
  group.querySelectorAll('details').forEach(detail => {
    detail.addEventListener('toggle', () => {
      if (detail.open) group.querySelectorAll('details').forEach(other => {
        if (other !== detail) other.open = false;
      });
    });
  });
});

const dialog = document.querySelector('#brief-dialog');
const briefForm = document.querySelector('#brief-form');
const entry = document.querySelector('#brief-entry');
const ready = document.querySelector('#brief-ready');
let returnFocus = null;
let preparedBrief = '';

function showEntry() {
  entry.hidden = false;
  ready.hidden = true;
  dialog.removeAttribute('aria-label');
  dialog.setAttribute('aria-labelledby', 'dialog-title');
}
function openBrief(source, values) {
  closeMenu();
  returnFocus = source;
  showEntry();
  if (values) ['name', 'email', 'message'].forEach(key => {
    briefForm.elements.namedItem(key).value = values.get(key) || '';
  });
  dialog.showModal();
  document.body.classList.add('modal-open');
  briefForm.elements.namedItem(values ? 'company' : 'name').focus();
}
document.querySelectorAll('[data-open-brief]').forEach(button => button.addEventListener('click', () => openBrief(button)));
document.querySelector('#quick-form').addEventListener('submit', event => {
  event.preventDefault();
  openBrief(event.submitter, new FormData(event.currentTarget));
});
document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  const bounds = dialog.getBoundingClientRect();
  if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
});
dialog.addEventListener('close', () => {
  document.body.classList.remove('modal-open');
  returnFocus?.focus();
});
briefForm.addEventListener('submit', event => {
  event.preventDefault();
  const data = new FormData(briefForm);
  const name = data.get('name').trim();
  const email = data.get('email').trim();
  const message = data.get('message').trim();
  if (!name || !message) {
    const field = briefForm.elements.namedItem(!name ? 'name' : 'message');
    field.setCustomValidity('Lütfen bu alanı doldur.');
    field.reportValidity();
    field.addEventListener('input', () => field.setCustomValidity(''), {once:true});
    return;
  }
  const company = data.get('company').trim();
  const service = data.get('service');
  preparedBrief = `Merhaba Hypnos Creative,\n\n${message}\n\nİlgilendiğim alan: ${service}\n${company ? `Marka / şirket: ${company}\n` : ''}Ad soyad: ${name}\nE-posta: ${email}`;
  document.querySelector('#brief-preview').textContent = preparedBrief;
  document.querySelector('#send-email').href = `mailto:info@hypnoscreative.com?subject=${encodeURIComponent(`${company || name} — Yeni proje / ${service}`)}&body=${encodeURIComponent(preparedBrief)}`;
  document.querySelector('#copy-status').textContent = 'Alıcı: info@hypnoscreative.com · Henüz gönderilmedi.';
  entry.hidden = true;
  ready.hidden = false;
  dialog.setAttribute('aria-label', 'Briefin hazır');
  dialog.removeAttribute('aria-labelledby');
  document.querySelector('#send-email').focus();
  dialog.scrollTop = 0;
});
document.querySelector('#edit-brief').addEventListener('click', () => {
  showEntry();
  briefForm.elements.namedItem('message').focus();
});
document.querySelector('#copy-brief').addEventListener('click', async () => {
  const status = document.querySelector('#copy-status');
  try {
    await navigator.clipboard.writeText(preparedBrief);
    status.textContent = 'Brief kopyalandı. info@hypnoscreative.com adresine gönderebilirsin.';
  } catch {
    const range = document.createRange();
    range.selectNodeContents(document.querySelector('#brief-preview'));
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    status.textContent = 'Brief seçildi. Kopyalayıp info@hypnoscreative.com adresine gönderebilirsin.';
  }
});

// Motion is progressive: content stays visible if scripting or observation fails.
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion:reduce)').matches) {
  const revealTargets = document.querySelectorAll('.manifesto h2, .manifesto>p, .split-heading, .production-card, .process-grid article, .studio-copy, .faq-heading');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(item => {
      if (item.isIntersecting) {
        item.target.classList.add('is-visible');
        observer.unobserve(item.target);
      }
    });
  }, {threshold:.08});
  document.documentElement.classList.add('js-motion');
  revealTargets.forEach(element => { element.classList.add('reveal'); observer.observe(element); });
}
