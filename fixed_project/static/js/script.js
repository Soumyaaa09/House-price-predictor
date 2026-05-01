// script.js — EstateIQ · Enhanced Animations

// ─── Cursor Glow ──────────────────────────────────────────────────────────
const glow = document.createElement('div');
glow.id = 'cursor-glow';
document.body.appendChild(glow);
document.addEventListener('mousemove', e => {
  glow.style.left = e.clientX + 'px';
  glow.style.top  = e.clientY + 'px';
});

// ─── Floating Particles ───────────────────────────────────────────────────
(function spawnParticles() {
  const scene = document.querySelector('.bg-scene');
  if (!scene) return;
  for (let i = 0; i < 18; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.cssText = `
      left: ${Math.random() * 100}%;
      --dur: ${6 + Math.random() * 10}s;
      --delay: ${Math.random() * 10}s;
      width: ${1 + Math.random() * 2}px;
      height: ${1 + Math.random() * 2}px;
      opacity: ${0.3 + Math.random() * 0.4};
    `;
    scene.appendChild(p);
  }
})();

// ─── Stepper Controls ─────────────────────────────────────────────────────
const limits = {
  bedrooms:  { min: 1, max: 8 },
  bathrooms: { min: 1, max: 8 }
};

function step(field, delta) {
  const input   = document.getElementById(field);
  const display = document.getElementById(field + 'Val');
  if (!input || !display) return;

  let val = parseInt(input.value) + delta;
  val = Math.max(limits[field].min, Math.min(limits[field].max, val));

  if (field === 'bathrooms') {
    const beds = parseInt(document.getElementById('bedrooms').value);
    val = Math.min(val, beds);
  }
  if (field === 'bedrooms') {
    const bathInput   = document.getElementById('bathrooms');
    const bathDisplay = document.getElementById('bathroomsVal');
    if (parseInt(bathInput.value) > val) {
      bathInput.value = val;
      bathDisplay.textContent = val;
      popAnimate(bathDisplay);
    }
  }

  input.value = val;
  display.textContent = val;
  popAnimate(display);
}

function popAnimate(el) {
  el.style.transition = 'transform .15s cubic-bezier(.34,1.56,.64,1)';
  el.style.transform = 'scale(1.4)';
  setTimeout(() => { el.style.transform = 'scale(1)'; }, 160);
}

// ─── Form Submit Loader ───────────────────────────────────────────────────
const form = document.getElementById('predictForm');
if (form) {
  form.addEventListener('submit', function (e) {
    const area     = document.getElementById('area');
    const location = document.getElementById('location');

    if (!area.value || parseFloat(area.value) <= 0) {
      e.preventDefault();
      shakeField(area);
      return;
    }
    if (location && !location.value) {
      e.preventDefault();
      shakeField(location);
      return;
    }

    const btn = document.getElementById('submitBtn');
    if (btn) {
      btn.querySelector('.btn-text').classList.add('hidden');
      btn.querySelector('.btn-loader').classList.remove('hidden');
      btn.disabled = true;
      // Ripple on click
      ripple(btn);
    }
  });
}

function shakeField(el) {
  el.style.borderColor = '#f87171';
  el.style.animation = 'none';
  el.offsetHeight; // reflow
  el.style.animation = 'shake .4s ease';
  setTimeout(() => {
    el.style.borderColor = '';
    el.style.animation = '';
    el.focus();
  }, 2000);
}

function ripple(btn) {
  const circle = document.createElement('span');
  circle.style.cssText = `
    position:absolute; border-radius:50%;
    background:rgba(255,255,255,.4);
    width:10px; height:10px;
    top:50%; left:50%;
    transform:translate(-50%,-50%) scale(0);
    animation: rippleOut .6s ease forwards;
    pointer-events:none;
  `;
  const style = document.createElement('style');
  style.textContent = `@keyframes rippleOut {
    to { transform:translate(-50%,-50%) scale(30); opacity:0; }
  }`;
  document.head.appendChild(style);
  btn.appendChild(circle);
  setTimeout(() => circle.remove(), 700);
}

// ─── Input Focus Glow ─────────────────────────────────────────────────────
document.querySelectorAll('input[type="number"], select').forEach(el => {
  el.addEventListener('focus', () => {
    el.parentElement.style.filter = 'drop-shadow(0 0 10px rgba(201,168,76,.35))';
  });
  el.addEventListener('blur', () => {
    el.parentElement.style.filter = '';
  });
});

// ─── Scroll-triggered reveal for .animate-in ──────────────────────────────
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.animationPlayState = 'running';
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.animate-in').forEach(el => {
  el.style.animationPlayState = 'paused';
  observer.observe(el);
});

// ─── Stat card tilt on hover ───────────────────────────────────────────────
document.querySelectorAll('.stat-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width  - 0.5;
    const y = (e.clientY - rect.top)  / rect.height - 0.5;
    card.style.transform = `translateY(-5px) rotateX(${-y * 8}deg) rotateY(${x * 8}deg)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
    card.style.transition = 'transform .4s ease';
  });
});

// ─── Price card tilt ──────────────────────────────────────────────────────
const priceCard = document.querySelector('.price-card');
if (priceCard) {
  priceCard.addEventListener('mousemove', e => {
    const rect = priceCard.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width  - 0.5;
    const y = (e.clientY - rect.top)  / rect.height - 0.5;
    priceCard.style.transform = `rotateX(${-y * 5}deg) rotateY(${x * 5}deg)`;
    priceCard.style.transformStyle = 'preserve-3d';
  });
  priceCard.addEventListener('mouseleave', () => {
    priceCard.style.transform = '';
  });
}

// ─── Detail row stagger entrance ──────────────────────────────────────────
document.querySelectorAll('.detail-row').forEach((row, i) => {
  row.style.opacity = '0';
  row.style.transform = 'translateX(-12px)';
  row.style.transition = `opacity .4s ${i * 0.06}s ease, transform .4s ${i * 0.06}s ease`;
  setTimeout(() => {
    row.style.opacity = '1';
    row.style.transform = 'translateX(0)';
  }, 400 + i * 60);
});

// ─── Pill hover sparkle ───────────────────────────────────────────────────
document.querySelectorAll('.pill').forEach(pill => {
  pill.addEventListener('mouseenter', () => {
    pill.querySelector('i').style.animation = 'sparkle .4s ease';
    setTimeout(() => pill.querySelector('i').style.animation = '', 400);
  });
});

// ─── More Details Toggle ─────────────────────────────────────────────────
function toggleMoreDetails() {
  const grid    = document.getElementById('moreDetailsGrid');
  const chevron = document.getElementById('moreDetailsChevron');
  const btn     = document.querySelector('.more-details-btn');
  const btnText = document.getElementById('moreBtnText');
  const isOpen  = grid.classList.contains('open');

  grid.classList.toggle('open');
  grid.classList.toggle('hidden');
  chevron.classList.toggle('open');
  btn.classList.toggle('open');
  btnText.textContent = isOpen ? 'More Details' : 'Hide Details';

  if (!isOpen) {
    grid.querySelectorAll('.field-group').forEach((el, i) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(12px)';
      el.style.transition = `opacity .3s ${i * 0.07}s ease, transform .3s ${i * 0.07}s ease`;
      setTimeout(() => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }, 20);
    });
  }
}
