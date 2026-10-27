/* ==========================================================
   لمسة باستيل — إعدادات وتفاعل الموقع
   ========================================================== */

/* عدّل هنا: رقم الواتساب بالصيغة الدولية بدون + أو أصفار في البداية
   مثال: '9665XXXXXXXX'  — اتركه فاضي إلى أن يجهز الرقم */
const CONFIG = {
  whatsapp: '966558118167',
  displayNumber: '055 811 8167',
  greeting: 'السلام عليكم، أبغى أجدد مطبخي مع لمسة باستيل'
};

(function () {
  'use strict';

  /* ---------- روابط واتساب ---------- */
  const waBase = CONFIG.whatsapp ? 'https://wa.me/' + CONFIG.whatsapp : '';

  function waLink(message) {
    return waBase + '?text=' + encodeURIComponent(message);
  }

  if (waBase) {
    document.querySelectorAll('[data-wa]').forEach(function (a) {
      a.href = waLink(CONFIG.greeting);
      a.target = '_blank';
      a.rel = 'noopener';
    });
    document.querySelectorAll('[data-wa-text]').forEach(function (el) {
      el.textContent = CONFIG.displayNumber || ('+' + CONFIG.whatsapp);
      el.setAttribute('dir', 'ltr');
    });
  }

  /* ---------- قائمة الجوال ---------- */
  const menuBtn = document.getElementById('menu-btn');
  const menu = document.getElementById('mobile-menu');

  function setMenu(open) {
    menu.hidden = !open;
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'إغلاق القائمة' : 'القائمة');
    document.body.classList.toggle('menu-open', open);
  }

  if (menuBtn && menu) {
    menuBtn.addEventListener('click', function () {
      setMenu(menuBtn.getAttribute('aria-expanded') !== 'true');
    });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { setMenu(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !menu.hidden) { setMenu(false); menuBtn.focus(); }
    });
    window.matchMedia('(min-width: 961px)').addEventListener('change', function (mq) {
      if (mq.matches) setMenu(false);
    });
  }

  /* ---------- زر واتساب العائم: يظهر بعد الواجهة ---------- */
  const waFloat = document.querySelector('.wa-float');
  const hero = document.getElementById('hero');
  if (waFloat && hero && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      waFloat.classList.toggle('show', !entries[0].isIntersecting);
    }, { rootMargin: '-40% 0px 0px 0px' }).observe(hero);
  } else if (waFloat) {
    waFloat.classList.add('show');
  }

  /* ---------- سلايدر قبل وبعد ---------- */
  const ba = document.getElementById('ba');
  if (ba) {
    const range = ba.querySelector('.ba-range');
    let dragging = false;

    function setPos(pct) {
      pct = Math.max(0, Math.min(100, pct));
      ba.style.setProperty('--pos', pct + '%');
      range.value = Math.round(pct);
    }

    function fromEvent(e) {
      const rect = ba.getBoundingClientRect();
      return ((e.clientX - rect.left) / rect.width) * 100;
    }

    ba.addEventListener('pointerdown', function (e) {
      dragging = true;
      ba.setPointerCapture(e.pointerId);
      setPos(fromEvent(e));
    });
    ba.addEventListener('pointermove', function (e) {
      if (dragging) setPos(fromEvent(e));
    });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(function (type) {
      ba.addEventListener(type, function () { dragging = false; });
    });

    // لوحة المفاتيح (أسهم يمين/يسار)
    range.addEventListener('input', function () { setPos(Number(range.value)); });

    // حركة تعريفية صغيرة أول ما يظهر السلايدر
    if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const io = new IntersectionObserver(function (entries) {
        if (!entries[0].isIntersecting) return;
        io.disconnect();
        const frames = [50, 62, 70, 62, 50, 38, 30, 38, 50];
        let i = 0;
        const timer = setInterval(function () {
          if (dragging || i >= frames.length) { clearInterval(timer); return; }
          setPos(frames[i++]);
        }, 90);
      }, { threshold: 0.6 });
      io.observe(ba);
    }
  }

  /* ---------- فلتر معرض الأفكار ---------- */
  const filters = document.querySelectorAll('.filter');
  const shots = document.querySelectorAll('.shot');
  filters.forEach(function (btn) {
    btn.addEventListener('click', function () {
      const tone = btn.dataset.filter;
      filters.forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
      shots.forEach(function (s) { s.hidden = !(tone === 'all' || s.dataset.tone === tone); });
    });
  });

  /* ---------- نموذج طلب المعاينة ---------- */
  const form = document.getElementById('lead-form');
  const note = document.getElementById('form-note');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const nameEl = document.getElementById('f-name');
      const phoneEl = document.getElementById('f-phone');
      const name = nameEl.value.trim();
      const phone = phoneEl.value.trim();
      const area = document.getElementById('f-area').value.trim();
      const color = document.getElementById('f-color').value;

      note.classList.remove('error');
      if (!name || !phone) {
        note.textContent = 'فضلاً اكتبي الاسم ورقم الجوال.';
        note.classList.add('error');
        (name ? phoneEl : nameEl).focus();
        return;
      }
      if (!waBase) {
        note.textContent = 'خدمة الإرسال عبر واتساب تشتغل بعد إضافة رقم الواتساب للموقع.';
        note.classList.add('error');
        return;
      }

      const msg = [
        'السلام عليكم، أبغى معاينة لمطبخي',
        'الاسم: ' + name,
        'الجوال: ' + phone,
        area ? 'الحي: ' + area : '',
        'اللون المفضل: ' + color
      ].filter(Boolean).join('\n');

      const link = waLink(msg);
      const win = window.open(link, '_blank', 'noopener');
      note.textContent = '';
      if (win === null) {
        // بعض المتصفحات تمنع فتح نافذة جديدة: نعرض رابط مباشر بدلها
        const a = document.createElement('a');
        a.href = link;
        a.target = '_blank';
        a.rel = 'noopener';
        a.textContent = 'اضغطي هنا لفتح واتساب وإرسال الطلب';
        note.appendChild(a);
      } else {
        note.textContent = 'جهّزنا رسالتك في واتساب، اضغطي إرسال ونتواصل معك قريب.';
      }
    });
  }
})();
