// ===== Year in footer =====
document.getElementById('year').textContent = new Date().getFullYear();

// ===== Mobile nav toggle =====
const toggle = document.querySelector('.nav-toggle');
const links = document.querySelector('.nav-links');

if (toggle && links) {
  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
  });

  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      links.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// ===== Theme toggle =====
const root = document.documentElement;
const themeBtn = document.getElementById('themeToggle');
const storedTheme = localStorage.getItem('theme');

if (storedTheme) {
  root.setAttribute('data-theme', storedTheme);
}

function updateThemeIcon() {
  const isLight = root.getAttribute('data-theme') === 'light';
  themeBtn.textContent = isLight ? '☀' : '☾';
}

if (themeBtn) {
  updateThemeIcon();
  themeBtn.addEventListener('click', () => {
    const current = root.getAttribute('data-theme');
    const next = current === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    updateThemeIcon();
  });
}

// ===== Reveal on scroll =====
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal, .card, .project, .timeline-item').forEach(el => {
  el.classList.add('reveal');
  observer.observe(el);
});

// ===== Animate skill bars =====
const skillObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.width = getComputedStyle(entry.target).getPropertyValue('--target').trim();
      skillObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.skill-fill').forEach(fill => {
  fill.style.width = '0';
  skillObserver.observe(fill);
});

// ===== Count-up metrics =====
const counters = document.querySelectorAll('.metric-num');
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = Number(el.getAttribute('data-count') || 0);
    let curr = 0;
    const step = Math.max(1, Math.round(target / 60));
    const tick = () => {
      curr += step;
      if (curr >= target) curr = target;
      el.textContent = curr;
      if (curr < target) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    counterObserver.unobserve(el);
  });
}, { threshold: 0.8 });

counters.forEach(c => counterObserver.observe(c));

// ===== Contact form submission =====
const form = document.querySelector('form.contact');

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const msg = form.message.value.trim();

    if (!name || !email || !msg) {
      alert('⚠️ Please fill out all fields.');
      console.warn('Form validation failed: Missing field(s)');
      return;
    }

    const payload = { name, email, message: msg };
    console.log('📤 Sending form data:', payload);

    try {
      const res = await fetch('/send-mail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      console.log('📥 Server response:', data);

      if (res.ok && data.success) {
        alert('✅ Message sent successfully!');
        form.reset();
      } else {
        alert(`❌ Error: ${data.error || 'Message not sent'}`);
      }
    } catch (err) {
      alert('⚠️ Could not send message. Please try again later.');
      console.error('❌ Network or server error:', err);
    }
  });
}
