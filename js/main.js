/* =========================================================================
   Mohammed Sayeed — AI Agent Builder
   Vanilla JS only. No dependencies, no build step.

   01. Helpers
   02. Split headlines into words
   03. Scroll reveal
   04. Nav (sticky state, mobile menu, active link)
   05. Hero light follows cursor
   06. Magnetic buttons
   07. Skills — stacked card depth on scroll
   08. Projects — sync sticky index with detail panels
   09. Copy to clipboard
   10. Placeholder link guard
   11. FORM -> WHATSAPP  (swap this block for Tally later)
   12. Floating WhatsApp button + year
   ========================================================================= */
(function () {
  'use strict';

  /* ---------- 01. HELPERS ---------- */
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // rAF-throttled scroll dispatcher
  var scrollJobs = [];
  var ticking = false;
  function onScroll(fn) { scrollJobs.push(fn); }
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      for (var i = 0; i < scrollJobs.length; i++) scrollJobs[i]();
      ticking = false;
    });
  }, { passive: true });

  var toastEl = $('#toast');
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('is-visible'); }, 2600);
  }

  /* ---------- 02. SPLIT HEADLINES INTO WORDS ---------- */
  $$('[data-split]').forEach(function (el) {
    var words = el.textContent.trim().split(/\s+/);
    el.textContent = '';
    words.forEach(function (w, i) {
      var outer = document.createElement('span');
      outer.className = 'word';
      var inner = document.createElement('span');
      inner.textContent = w;
      inner.style.setProperty('--wd', i);
      outer.appendChild(inner);
      el.appendChild(outer);
      if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
    });
    el.classList.add('reveal', 'reveal--split');
  });

  /* ---------- 03. SCROLL REVEAL ---------- */
  $$('[data-delay]').forEach(function (el) {
    el.style.setProperty('--d', el.getAttribute('data-delay'));
  });

  var revealables = $$('.reveal');

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealables.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          revealObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    revealables.forEach(function (el) { revealObs.observe(el); });

    // hero fires immediately on load rather than waiting for a scroll
    requestAnimationFrame(function () {
      $$('.hero .reveal').forEach(function (el, i) {
        setTimeout(function () { el.classList.add('is-in'); }, 120 + i * 90);
      });
    });
  }

  /* ---------- 04. NAV ---------- */
  var nav     = $('#nav');
  var burger  = $('#navBurger');
  var links   = $('#navLinks');

  onScroll(function () {
    if (nav) nav.classList.toggle('is-stuck', window.scrollY > 24);
  });

  if (burger && links) {
    burger.addEventListener('click', function () {
      var open = links.classList.toggle('is-open');
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    // close the menu after tapping a link
    $$('a', links).forEach(function (a) {
      a.addEventListener('click', function () {
        links.classList.remove('is-open');
        burger.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // highlight the section currently on screen
  var navAnchors = $$('#navLinks a[href^="#"]').filter(function (a) {
    return !a.classList.contains('btn');
  });
  var sections = navAnchors.map(function (a) { return $(a.getAttribute('href')); }).filter(Boolean);

  if (sections.length && 'IntersectionObserver' in window) {
    var navObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        navAnchors.forEach(function (a) {
          a.classList.toggle('is-active', a.getAttribute('href') === '#' + e.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { navObs.observe(s); });
  }

  /* ---------- 05. HERO LIGHT FOLLOWS CURSOR ---------- */
  var heroLight = $('#heroLight');
  if (heroLight && !reduceMotion && window.matchMedia('(pointer: fine)').matches) {
    window.addEventListener('mousemove', function (ev) {
      var x = (ev.clientX / window.innerWidth) * 2 - 1;   // -1 .. 1
      var y = (ev.clientY / window.innerHeight) * 2 - 1;
      heroLight.style.setProperty('--mx', x.toFixed(3));
      heroLight.style.setProperty('--my', y.toFixed(3));
    }, { passive: true });
  }

  /* ---------- 06. MAGNETIC BUTTONS ---------- */
  if (!reduceMotion && window.matchMedia('(pointer: fine)').matches) {
    $$('.magnetic').forEach(function (el) {
      el.addEventListener('mousemove', function (ev) {
        var r = el.getBoundingClientRect();
        var dx = (ev.clientX - (r.left + r.width / 2)) / r.width;
        var dy = (ev.clientY - (r.top + r.height / 2)) / r.height;
        el.style.transform = 'translate(' + (dx * 12).toFixed(2) + 'px,' + (dy * 8).toFixed(2) + 'px)';
      });
      el.addEventListener('mouseleave', function () { el.style.transform = ''; });
    });
  }

  /* ---------- 07. SKILLS — STACKED CARD DEPTH ---------- */
  var stackCards = $$('.stack__card');
  var stackMQ = window.matchMedia('(min-width: 621px)');

  function updateStack() {
    if (reduceMotion || !stackMQ.matches) return;
    var navH = parseInt(getComputedStyle(document.documentElement)
                .getPropertyValue('--nav-h'), 10) || 74;

    stackCards.forEach(function (card, i) {
      var inner = card.querySelector('.stack__inner');
      var next  = stackCards[i + 1];
      if (!inner) return;
      if (!next) { inner.style.transform = ''; inner.style.filter = ''; return; }

      var stickTop = navH + 26 + i * 16;
      var nextTop  = next.getBoundingClientRect().top;
      var p = clamp((window.innerHeight - nextTop) / (window.innerHeight - stickTop), 0, 1);

      inner.style.transform = 'scale(' + (1 - p * 0.05).toFixed(4) + ') translateY(' + (-p * 10).toFixed(2) + 'px)';
      inner.style.filter    = 'brightness(' + (1 - p * 0.4).toFixed(3) + ')';
    });
  }

  if (stackCards.length) {
    onScroll(updateStack);
    window.addEventListener('resize', updateStack);
    stackMQ.addEventListener ? stackMQ.addEventListener('change', function () {
      stackCards.forEach(function (c) {
        var inner = c.querySelector('.stack__inner');
        if (inner) { inner.style.transform = ''; inner.style.filter = ''; }
      });
      updateStack();
    }) : null;
    updateStack();
  }

  /* ---------- 08. PROJECTS — SYNC STICKY INDEX ---------- */
  var pcards    = $$('.pcard');
  var pindexEls = $$('.pindex__item');

  function setActiveProject(id) {
    pindexEls.forEach(function (el) {
      el.classList.toggle('is-active', el.getAttribute('data-target') === id);
    });
    pcards.forEach(function (c) { c.classList.toggle('is-active', c.id === id); });
  }

  if (pcards.length && 'IntersectionObserver' in window) {
    var projObs = new IntersectionObserver(function (entries) {
      // pick the entry closest to the middle of the viewport
      var best = null;
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        if (!best || e.intersectionRatio > best.intersectionRatio) best = e;
      });
      if (best) setActiveProject(best.target.id);
    }, { rootMargin: '-30% 0px -45% 0px', threshold: [0, 0.25, 0.6, 1] });

    pcards.forEach(function (c) { projObs.observe(c); });
    setActiveProject(pcards[0].id);
  } else {
    pcards.forEach(function (c) { c.classList.add('is-active'); });
  }

  /* ---------- 09. COPY TO CLIPBOARD ---------- */
  $$('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var value = btn.getAttribute('data-copy');
      var done = function () {
        var original = btn.firstChild.nodeValue;
        btn.firstChild.nodeValue = 'Copied ';
        btn.classList.add('is-done');
        toast(value + ' copied to clipboard');
        setTimeout(function () {
          btn.firstChild.nodeValue = original;
          btn.classList.remove('is-done');
        }, 1800);
      };

      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(value).then(done).catch(fallback);
      } else {
        fallback();
      }

      function fallback() {
        var ta = document.createElement('textarea');
        ta.value = value;
        ta.setAttribute('readonly', '');
        ta.style.cssText = 'position:absolute;left:-9999px';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); done(); }
        catch (e) { toast('Copy failed — the value is ' + value); }
        document.body.removeChild(ta);
      }
    });
  });

  /* ---------- 10. PLACEHOLDER LINK GUARD ---------- */
  // Any link still marked data-placeholder-link does nothing but say so.
  // Delete the attribute once you paste in the real URL.
  $$('[data-placeholder-link]').forEach(function (a) {
    a.addEventListener('click', function (ev) {
      ev.preventDefault();
      toast('Placeholder — add the real URL in index.html');
    });
  });

  /* =======================================================================
     11. FORM -> WHATSAPP
     Until Tally is connected, submitting composes a WhatsApp message from
     the fields and opens the chat. Nothing is stored on this site.

     TO SWITCH TO TALLY: delete this whole block and replace the <form> in
     index.html with your Tally embed (or point form action= at Tally).
     ======================================================================= */
  var WHATSAPP_NUMBER = '919980301901';   // country code + number, digits only
  var form = $('#callForm');

  if (form) {
    var note = $('#formNote');
    var noteDefault = note ? note.textContent : '';

    var rules = {
      name:        function (v) { return v.length >= 2 || 'Please enter your name.'; },
      phone:       function (v) { return /^[\d+()\-\s]{7,}$/.test(v) || 'Please enter a valid phone number.'; },
      email:       function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) || 'Please enter a valid email address.'; },
      requirement: function (v) { return v.length >= 10 || 'A line or two about what you need, please.'; }
    };

    function validateField(input) {
      var field = input.closest('.field');
      var err   = field ? field.querySelector('[data-err]') : null;
      var rule  = rules[input.name];
      var res   = rule ? rule(input.value.trim()) : true;

      if (res === true) {
        if (field) field.classList.remove('has-error');
        if (err) err.textContent = '';
        return true;
      }
      if (field) field.classList.add('has-error');
      if (err) err.textContent = res;
      return false;
    }

    $$('input, textarea', form).forEach(function (input) {
      input.addEventListener('blur', function () { validateField(input); });
      input.addEventListener('input', function () {
        if (input.closest('.field').classList.contains('has-error')) validateField(input);
      });
    });

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();

      var inputs = $$('input, textarea', form);
      var ok = true;
      var firstBad = null;
      inputs.forEach(function (input) {
        if (!validateField(input) && ok) { ok = false; firstBad = input; }
      });

      if (!ok) {
        if (note) { note.textContent = 'Please fix the highlighted fields.'; note.classList.remove('is-ok'); }
        if (firstBad) firstBad.focus();
        return;
      }

      var data = new FormData(form);
      var msg =
        'Hi Mohammed, I\'d like to book a call.\n\n' +
        'Name: '        + data.get('name').trim()  + '\n' +
        'Phone: '       + data.get('phone').trim() + '\n' +
        'Email: '       + data.get('email').trim() + '\n' +
        'Requirement: ' + data.get('requirement').trim();

      window.open('https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(msg), '_blank', 'noopener');

      if (note) {
        note.textContent = 'Opening WhatsApp with your details…';
        note.classList.add('is-ok');
        setTimeout(function () {
          note.textContent = noteDefault;
          note.classList.remove('is-ok');
        }, 5000);
      }
      form.reset();
    });
  }

  /* ---------- 12. FLOATING WHATSAPP + YEAR ---------- */
  var fab  = $('.fab');
  var hero = $('#hero');
  if (fab && hero) {
    onScroll(function () {
      fab.classList.toggle('is-visible', window.scrollY > hero.offsetHeight * 0.75);
    });
  }

  var year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

})();
