// Main interactions: page transitions, nav toggle, reveal on scroll, rotating words, form mock submit
(function () {
    const $ = (s, scope = document) => scope.querySelector(s);
    const $$ = (s, scope = document) => Array.from(scope.querySelectorAll(s));
  
    // Theme: apply saved theme and prepare toggle
    const THEME_KEY = 'lwm-theme';
    function applyTheme(theme){
      const root = document.documentElement;
      const isDark = theme === 'gray';
      // сброс противоположного класса
      root.classList.remove('is-theming-dark', 'is-theming-light');
      // поставить нужный класс для анимации, только если вкладка активна
      if (!document.hidden) root.classList.add(isDark ? 'is-theming-dark' : 'is-theming-light');
      root.setAttribute('data-theme', theme);
      try{ localStorage.setItem(THEME_KEY, theme); }catch{}
      document.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
      if (!document.hidden){
        setTimeout(() => { root.classList.remove('is-theming-dark', 'is-theming-light'); }, 900);
      } else {
        root.classList.remove('is-theming-dark', 'is-theming-light');
      }
    }
    (function initTheme(){
      const saved = (()=>{ try{ return localStorage.getItem(THEME_KEY); }catch{ return null; } })();
      const theme = saved === 'gray' ? 'gray' : 'light';
      applyTheme(theme);
    })();

    // inject toggle button with logo
    window.addEventListener('DOMContentLoaded', () => {
      const header = document.querySelector('.site-header .container');
      if (!header) return;
      const btn = document.createElement('button');
      btn.className = 'theme-toggle';
      btn.setAttribute('aria-label', 'Сменить тему');
      const img = document.createElement('img');
      img.src = 'assets/img/lwm.png';
      img.alt = 'LWM';
      btn.appendChild(img);
      header.appendChild(btn);
      btn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme') || 'light';
        applyTheme(current === 'light' ? 'gray' : 'light');
      });
    });

    // Remove loading overlay on load
    window.addEventListener('load', () => {
      document.body.classList.remove('is-loading');
      // initial reveal for above-the-fold
      setTimeout(() => {
        $$('.reveal').forEach(el => {
          const rect = el.getBoundingClientRect();
          if (rect.top < window.innerHeight - 40) el.classList.add('is-visible');
        });
      }, 120);
    });
  
    // Mobile burger toggle
    const burger = $('#burger');
    const nav = $('#site-nav');
    if (burger && nav) {
      burger.addEventListener('click', () => {
        const expanded = burger.getAttribute('aria-expanded') === 'true';
        burger.setAttribute('aria-expanded', String(!expanded));
        if (window.innerWidth <= 720){
          if (!expanded) nav.classList.add('is-open'); else nav.classList.remove('is-open');
        }
      });
      // close on nav link click (mobile)
      $$('.nav-link').forEach(a => {
        a.addEventListener('click', () => {
          if (window.innerWidth <= 720){
            burger.setAttribute('aria-expanded', 'false');
            nav.classList.remove('is-open');
          }
        });
      });
    }
  
    // Highlight active nav link based on URL
    const path = location.pathname.split('/').pop() || 'index.html';
    $$('.nav-link').forEach(a => {
      const href = a.getAttribute('href');
      if (href === path) a.classList.add('active');
    });
  
    // Smooth page transitions for internal links
    const pageTransition = $('.page-transition');
    function navigateWithTransition(href) {
      if (!pageTransition) { location.href = href; return; }
      // show overlay
      document.body.classList.add('is-loading');
      pageTransition.style.transform = 'translateY(0)';
      setTimeout(() => { location.href = href; }, 260); // short delay before leaving
    }
    $$('a[data-transition]').forEach(a => {
      a.addEventListener('click', (e) => {
        const href = a.getAttribute('href');
        if (!href || href.startsWith('http') || a.target === '_blank') return;
        e.preventDefault();
        navigateWithTransition(href);
      });
    });
  
    // Reveal on scroll
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    $$('.reveal').forEach(el => io.observe(el));
  
    // Rotating words
    class Rotator {
      constructor(el) {
        this.el = el;
        try { this.words = JSON.parse(el.getAttribute('data-rotate')); }
        catch { this.words = (el.getAttribute('data-rotate') || '').split(',').map(s => s.trim()); }
        this.index = 0; this.txt = '';
        this.isDeleting = false; this.period = 1400;
        this.tick();
      }
      tick() {
        const full = this.words[this.index % this.words.length] || '';
        this.txt = this.isDeleting ? full.substring(0, this.txt.length - 1) : full.substring(0, this.txt.length + 1);
        this.el.textContent = this.txt;
        let delta = 120 - Math.random() * 60;
        if (this.isDeleting) delta /= 2;
        if (!this.isDeleting && this.txt === full) { delta = this.period; this.isDeleting = true; }
        else if (this.isDeleting && this.txt === '') { this.isDeleting = false; this.index++; delta = 220; }
        setTimeout(() => this.tick(), delta);
      }
    }
    $$('.rotate').forEach(el => new Rotator(el));
  
    // Contact form (demo validation + success message)
    const form = $('#contact-form');
    if (form) {
      const status = $('#form-status');
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(form).entries());
        // simple validation
        if (!data.name || !data.email || !data.subject || !data.message) {
          status.textContent = 'Заполните все поля.';
          status.style.color = '#ffb4b4';
          return;
        }
        // Emulate sending
        status.textContent = 'Отправляем...';
        status.style.color = '#a1a1aa';
        await new Promise(r => setTimeout(r, 900));
        form.reset();
        status.textContent = 'Спасибо! Сообщение отправлено.';
        status.style.color = '#b7ffb7';
        // To integrate real sending: connect a backend or Formspree endpoint here.
      });
    }
  })();