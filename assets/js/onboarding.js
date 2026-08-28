/**
 * First-run onboarding + lightweight tips
 * Storage: flowora_onboarding_done = '1'
 */
(function () {
  'use strict';

  const KEY = 'flowora_onboarding_done';

  function done() {
    try {
      return localStorage.getItem(KEY) === '1';
    } catch {
      return true;
    }
  }

  function markDone() {
    try {
      localStorage.setItem(KEY, '1');
    } catch (_) {}
  }

  function el(html) {
    const t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }

  function openOnboarding() {
    if (document.getElementById('onboardingOverlay')) return;

    const overlay = el(`
      <div class="onboarding-overlay" id="onboardingOverlay" role="dialog" aria-modal="true" aria-labelledby="onboardTitle">
        <div class="onboarding-card glass-card">
          <div class="onboarding-progress">
            <span class="ob-dot active" data-step="0"></span>
            <span class="ob-dot" data-step="1"></span>
            <span class="ob-dot" data-step="2"></span>
          </div>
          <div class="onboarding-slides">
            <div class="ob-slide active" data-step="0">
              <div class="ob-icon"><i class="fa-solid fa-list-check"></i></div>
              <h2 id="onboardTitle">Plan your day on Home</h2>
              <p>Add today’s tasks with Quick Add. Check them off as you finish. Use filters: All, Active, Done.</p>
            </div>
            <div class="ob-slide" data-step="1">
              <div class="ob-icon"><i class="fa-solid fa-clock"></i></div>
              <h2>Focus with the timer</h2>
              <p>Open <strong>Focus Timer</strong> for 25-minute deep work. Take a short break, then continue your list.</p>
            </div>
            <div class="ob-slide" data-step="2">
              <div class="ob-icon"><i class="fa-solid fa-shield-halved"></i></div>
              <h2>Save your data</h2>
              <p>Go to <strong>Settings → Export backup</strong> so your tasks and habits stay safe. You can also <strong>Install</strong> this app from the browser menu.</p>
            </div>
          </div>
          <div class="onboarding-actions">
            <button type="button" class="btn btn-secondary" id="obSkipBtn">Skip</button>
            <button type="button" class="btn btn-primary" id="obNextBtn">Next</button>
          </div>
        </div>
      </div>
    `);

    document.body.appendChild(overlay);
    document.body.classList.add('onboarding-open');

    let step = 0;
    const slides = overlay.querySelectorAll('.ob-slide');
    const dots = overlay.querySelectorAll('.ob-dot');
    const nextBtn = overlay.querySelector('#obNextBtn');
    const skipBtn = overlay.querySelector('#obSkipBtn');

    const paint = () => {
      slides.forEach((s, i) => s.classList.toggle('active', i === step));
      dots.forEach((d, i) => d.classList.toggle('active', i === step));
      nextBtn.textContent = step >= slides.length - 1 ? 'Get started' : 'Next';
    };

    const close = () => {
      markDone();
      overlay.classList.add('is-leaving');
      setTimeout(() => {
        overlay.remove();
        document.body.classList.remove('onboarding-open');
      }, 220);
    };

    nextBtn.addEventListener('click', () => {
      if (step >= slides.length - 1) {
        close();
        if (window.router && typeof window.router.navigateTo === 'function') {
          window.router.navigateTo('dashboard');
        }
        return;
      }
      step += 1;
      paint();
    });
    skipBtn.addEventListener('click', close);
    paint();
  }

  function improveEmptyStates() {
    // Dashboard empty already has text; enhance via CSS class hooks if list empty message exists
    document.querySelectorAll('.empty-state, [data-empty="true"]').forEach((node) => {
      node.classList.add('empty-state-enhanced');
    });
  }

  function boot() {
    improveEmptyStates();
    if (!done()) {
      // slight delay so UI paints first
      setTimeout(openOnboarding, 450);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  // Allow Settings / help to reopen
  window.FloworaOnboarding = { open: openOnboarding, reset: () => { try { localStorage.removeItem(KEY); } catch (_) {} openOnboarding(); } };
})();
