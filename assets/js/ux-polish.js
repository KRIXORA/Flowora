/**
 * Flowora — Premium UX polish
 * Scroll reveal, header elevation, ripple, scroll-to-top, smooth nav
 */
(function () {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function onReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function initScrollReveal() {
    // Disabled: opacity:0 reveal caused blank/blurred screens on mobile
    document.querySelectorAll('.reveal').forEach((el) => {
      el.classList.add('is-visible');
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
  }

  function initHeaderScroll() {
    const header =
      document.querySelector('.app-header') ||
      document.querySelector('.top-header') ||
      document.querySelector('.main-header') ||
      document.querySelector('.content-header');
    if (!header) return;

    const onScroll = () => {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function initScrollTopFab() {
    if (document.querySelector('.scroll-top-fab')) return;
    const fab = document.createElement('button');
    fab.type = 'button';
    fab.className = 'scroll-top-fab';
    fab.setAttribute('aria-label', 'Scroll to top');
    fab.innerHTML = '<i class="fa-solid fa-arrow-up" aria-hidden="true"></i>';
    fab.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    });
    document.body.appendChild(fab);

    const main =
      document.querySelector('.main-content') ||
      document.querySelector('.content-area') ||
      document.getElementById('mainContent') ||
      window;

    const update = () => {
      const y = main === window ? window.scrollY : main.scrollTop;
      fab.classList.toggle('is-visible', y > 320);
    };

    if (main === window) {
      window.addEventListener('scroll', update, { passive: true });
    } else {
      main.addEventListener('scroll', update, { passive: true });
      window.addEventListener('scroll', update, { passive: true });
    }
    update();
  }

  function initRipple() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn, .btn-primary, .btn-secondary');
      if (!btn || reduced) return;
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const ink = document.createElement('span');
      ink.className = 'ripple-ink';
      ink.style.width = ink.style.height = size + 'px';
      ink.style.left = e.clientX - rect.left - size / 2 + 'px';
      ink.style.top = e.clientY - rect.top - size / 2 + 'px';
      btn.appendChild(ink);
      setTimeout(() => ink.remove(), 650);
    });
  }

  function initHowToUse() {
    const body = document.getElementById('howToUseBody');
    const toggleBtn = document.getElementById('toggleHowToUseBtn');
    const openBtn = document.getElementById('openHowToUseBtn');
    const card = document.getElementById('howToUseCard');
    if (!body || !toggleBtn) return;

    const setOpen = (open) => {
      body.classList.toggle('is-collapsed', !open);
      toggleBtn.textContent = open ? 'Hide guide' : 'Show guide';
      toggleBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      try { localStorage.setItem('flowora_howto_open', open ? '1' : '0'); } catch (_) {}
    };

    // Guide stays collapsed unless user previously opened it
    let open = false;
    try {
      if (localStorage.getItem('flowora_howto_open') === '1') open = true;
    } catch (_) {}
    setOpen(open);

    toggleBtn.addEventListener('click', () => setOpen(body.classList.contains('is-collapsed')));
    if (openBtn && card) {
      openBtn.addEventListener('click', () => {
        setOpen(true);
        card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    }
  }

  function enhanceEmptyStates() {
    // Soft pulse on empty dashed boxes
    document.querySelectorAll('[style*="dashed"]').forEach((el) => {
      el.style.transition = 'border-color 0.3s ease, background 0.3s ease';
      el.addEventListener('mouseenter', () => {
        el.style.borderColor = 'var(--primary)';
        el.style.background = 'var(--primary-light)';
      });
      el.addEventListener('mouseleave', () => {
        el.style.borderColor = '';
        el.style.background = '';
      });
    });
  }

  onReady(() => {
    try {
      initScrollReveal();
      initHeaderScroll();
      initScrollTopFab();
      initRipple();
      enhanceEmptyStates();
      initHowToUse();
    } catch (err) {
      console.warn('[UX Polish]', err);
    }
  });
})();
