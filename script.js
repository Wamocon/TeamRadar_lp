/* ==============================================
   TeamRadar Landing Page : Immersive Interactions
   Vanilla JS, no dependencies
   ============================================== */

(function () {
  'use strict';

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };
  var clamp = function (v, min, max) { return Math.min(Math.max(v, min), max); };

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ==============================================
     1. REVEAL ON SCROLL
     ============================================== */
  function initReveal() {
    var els = $$('.reveal');
    if (!els.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal--visible');
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    els.forEach(function (el) { observer.observe(el); });
  }

  /* ==============================================
     2. NAVBAR
     ============================================== */
  function initNavbar() {
    var nav = $('#nav');
    if (!nav) return;
    var ticking = false;

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        nav.classList.toggle('nav-scrolled', window.scrollY > 60);
        ticking = false;
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ==============================================
     3. SMOOTH SCROLL
     ============================================== */
  function initSmoothScroll() {
    $$('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var id = link.getAttribute('href');
        if (id === '#') return;
        var target = $(id);
        if (!target) return;
        e.preventDefault();
        var top = target.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: top, behavior: 'smooth' });
      });
    });
  }

  /* ==============================================
     4. HERO PARTICLES : TR Text Formation
     ============================================== */
  function initParticles() {
    if (prefersReduced) return;

    var canvas = document.getElementById('heroParticles');
    var hero = document.getElementById('hero');
    if (!canvas || !hero) return;

    var ctx = canvas.getContext('2d');
    var particles = [];
    var isMobile = window.innerWidth < 768;
    var count = isMobile ? 150 : 300;
    var running = true;

    function resize() {
      canvas.width = hero.offsetWidth;
      canvas.height = hero.offsetHeight;
    }

    function create() {
      var angle = Math.random() * Math.PI * 2;
      var speed = Math.random() * 0.5 + 0.1;
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.5 + 0.1
      };
    }

    function seed() {
      resize();
      for (var i = 0; i < count; i++) {
        particles.push(create());
      }
    }

    function animate() {
      if (!running) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(99,102,241,' + p.opacity + ')';
        ctx.fill();
      }
      requestAnimationFrame(animate);
    }

    seed();
    animate();
    window.addEventListener('resize', resize);
  }

  /* ==============================================
     5. ONBOARDING TIMELINE
     ============================================== */
  function initOnboarding() {
    var timeline = document.getElementById('onboardingTimeline');
    var pathFill = document.getElementById('rmPathFill');
    if (!timeline || !pathFill) return;

    window.addEventListener('scroll', function() {
       var rect = timeline.getBoundingClientRect();
       var vh = window.innerHeight;
       var progress = clamp((vh * 0.7 - rect.top) / rect.height, 0, 1);
       var totalLen = pathFill.getTotalLength();
       pathFill.style.strokeDasharray = totalLen;
       pathFill.style.strokeDashoffset = totalLen * (1 - progress);
    }, { passive: true });
  }

  /* ==============================================
     INITIALIZATION
     ============================================== */
  document.addEventListener('DOMContentLoaded', function () {
    initReveal();
    initNavbar();
    initSmoothScroll();
    initParticles();
    initOnboarding();
  });

})();
