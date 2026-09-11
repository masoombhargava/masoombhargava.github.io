/* ============================================================
   Masoom Bhargava — site behaviour
   Plain JavaScript, no libraries. Everything degrades gracefully.
   ============================================================ */
(function () {
  "use strict";

  var SECTIONS = ["home","about","research","publications","talks","teaching","cv","contact"];
  var mqMobile = window.matchMedia("(max-width: 900px)");

  var panels     = Array.prototype.slice.call(document.querySelectorAll(".panel"));
  var navLinks   = Array.prototype.slice.call(document.querySelectorAll("[data-target]"));
  var progress   = document.querySelector(".rail-progress-fill");
  var pagerCount = document.getElementById("pagerCount");
  var prevBtn    = document.getElementById("prevBtn");
  var nextBtn    = document.getElementById("nextBtn");
  var menuBtn    = document.getElementById("menuBtn");
  var mobileMenu = document.getElementById("mobileMenu");

  var current = 0;

  function indexOf(name) {
    var i = SECTIONS.indexOf(name);
    return i < 0 ? 0 : i;
  }
  function pad(n) { return (n < 10 ? "0" : "") + n; }

  /* ---- switch to a section (desktop panel mode) ---- */
  function show(name, updateHash) {
    var idx = indexOf(name);
    current = idx;

    panels.forEach(function (p) {
      p.classList.toggle("is-active", p.dataset.name === name);
    });

    navLinks.forEach(function (a) {
      a.classList.toggle("is-current", a.dataset.target === name);
    });

    if (progress) progress.style.width = ((idx + 1) / SECTIONS.length * 100) + "%";
    if (pagerCount) pagerCount.textContent = pad(idx + 1) + " / " + pad(SECTIONS.length);
    if (prevBtn) prevBtn.disabled = (idx === 0);
    if (nextBtn) nextBtn.disabled = (idx === SECTIONS.length - 1);

    if (updateHash !== false) {
      history.replaceState(null, "", "#" + name);
    }

    // move focus to the panel for screen readers / keyboard, without scrolling desktop
    var active = document.getElementById("panel-" + name);
    if (active && !mqMobile.matches) {
      active.focus({ preventScroll: true });
      active.scrollTop = 0;
    }
  }

  /* ---- navigation on mobile = smooth scroll to the stacked panel ---- */
  function goTo(name) {
    if (mqMobile.matches) {
      var el = document.getElementById("panel-" + name);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      closeMenu();
      history.replaceState(null, "", "#" + name);
      // still update active state
      navLinks.forEach(function (a) {
        a.classList.toggle("is-current", a.dataset.target === name);
      });
    } else {
      show(name);
    }
  }

  /* ---- click handlers on every nav link / in-page jump ---- */
  navLinks.forEach(function (a) {
    a.addEventListener("click", function (e) {
      var name = a.dataset.target;
      if (!name) return;
      e.preventDefault();
      goTo(name);
    });
  });

  /* ---- pager arrows ---- */
  function step(delta) {
    var idx = Math.min(SECTIONS.length - 1, Math.max(0, current + delta));
    show(SECTIONS[idx]);
  }
  if (prevBtn) prevBtn.addEventListener("click", function () { step(-1); });
  if (nextBtn) nextBtn.addEventListener("click", function () { step(1); });

  /* ---- keyboard: arrows move between panels (desktop) ---- */
  document.addEventListener("keydown", function (e) {
    if (mqMobile.matches) return;
    var tag = (e.target.tagName || "").toLowerCase();
    if (tag === "input" || tag === "textarea" || e.target.isContentEditable) return;
    if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === "PageDown") {
      e.preventDefault(); step(1);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp" || e.key === "PageUp") {
      e.preventDefault(); step(-1);
    } else if (e.key === "Home") {
      e.preventDefault(); show(SECTIONS[0]);
    } else if (e.key === "End") {
      e.preventDefault(); show(SECTIONS[SECTIONS.length - 1]);
    }
  });

  /* ---- touch swipe on the stage (desktop panel mode only) ---- */
  var tx = 0, ty = 0;
  var stage = document.getElementById("stage");
  if (stage) {
    stage.addEventListener("touchstart", function (e) {
      if (mqMobile.matches) return;
      tx = e.changedTouches[0].clientX;
      ty = e.changedTouches[0].clientY;
    }, { passive: true });
    stage.addEventListener("touchend", function (e) {
      if (mqMobile.matches) return;
      var dx = e.changedTouches[0].clientX - tx;
      var dy = e.changedTouches[0].clientY - ty;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) {
        step(dx < 0 ? 1 : -1);
      }
    }, { passive: true });
  }

  /* ---- mobile menu ---- */
  function openMenu() {
    mobileMenu.hidden = false;
    requestAnimationFrame(function () { mobileMenu.classList.add("open"); });
    menuBtn.setAttribute("aria-expanded", "true");
  }
  function closeMenu() {
    if (!mobileMenu.classList.contains("open")) return;
    mobileMenu.classList.remove("open");
    menuBtn.setAttribute("aria-expanded", "false");
    setTimeout(function () { mobileMenu.hidden = true; }, 300);
  }
  if (menuBtn) {
    menuBtn.addEventListener("click", function () {
      if (mobileMenu.classList.contains("open")) closeMenu(); else openMenu();
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeMenu();
  });

  /* ---- keep active nav in sync while scrolling on mobile ---- */
  if ("IntersectionObserver" in window) {
    var obs = new IntersectionObserver(function (entries) {
      if (!mqMobile.matches) return;
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          var name = en.target.dataset.name;
          navLinks.forEach(function (a) {
            a.classList.toggle("is-current", a.dataset.target === name);
          });
        }
      });
    }, { rootMargin: "-45% 0px -45% 0px" });
    panels.forEach(function (p) { obs.observe(p); });
  }

  /* ---- expandable research threads ---- */
  document.querySelectorAll(".area-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var open = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!open));
      var body = btn.nextElementSibling;
      if (body) body.classList.toggle("open", !open);
    });
  });

  /* ---- expandable publications ---- */
  document.querySelectorAll(".pub-row").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var open = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!open));
      var body = btn.nextElementSibling;
      if (body) body.classList.toggle("open", !open);
    });
  });

  /* ---- publication year filter ---- */
  var chips = Array.prototype.slice.call(document.querySelectorAll(".chip"));
  var pubs  = Array.prototype.slice.call(document.querySelectorAll(".pub"));
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) { c.classList.remove("is-on"); });
      chip.classList.add("is-on");
      var y = chip.dataset.year;
      pubs.forEach(function (p) {
        p.hidden = !(y === "all" || p.dataset.year === y);
      });
    });
  });

  /* ---- initial section from URL hash ---- */
  function initFromHash() {
    var name = (location.hash || "").replace("#", "");
    if (SECTIONS.indexOf(name) >= 0) {
      if (mqMobile.matches) {
        var el = document.getElementById("panel-" + name);
        if (el) el.scrollIntoView({ block: "start" });
        navLinks.forEach(function (a) {
          a.classList.toggle("is-current", a.dataset.target === name);
        });
      } else {
        show(name, false);
      }
    } else {
      show("home", false);
    }
  }
  initFromHash();

  /* respond to manual hash edits and browser back/forward */
  window.addEventListener("hashchange", function () {
    var name = (location.hash || "").replace("#", "");
    if (SECTIONS.indexOf(name) >= 0) {
      if (mqMobile.matches) {
        var el = document.getElementById("panel-" + name);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        navLinks.forEach(function (a) {
          a.classList.toggle("is-current", a.dataset.target === name);
        });
      } else {
        show(name, false);
      }
    }
  });

  /* re-sync when crossing the mobile/desktop boundary */
  mqMobile.addEventListener("change", function () {
    if (!mqMobile.matches) show(SECTIONS[current], false);
  });

  /* ============================================================
     PHASE PORTRAIT — a damped oscillator flow, drawn faintly on
     the paper. Particles follow  x' = y,  y' = -x - mu*y  and
     leave short trails as they spiral toward the origin, then
     respawn. Authentic to the dynamical-systems work, deliberately
     low-contrast so it never competes with the text.
     ============================================================ */
  (function flowField() {
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var canvas = document.getElementById("flow");
    if (!canvas || reduce) return;
    var ctx = canvas.getContext("2d");
    if (!ctx) return;

    var W, H, DPR, cx, cy, scale;
    var particles = [];
    var N = 34;
    var mu = 0.22;         // damping
    var dt = 0.02;
    var running = true;

    function resize() {
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = W * DPR; canvas.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      cx = W * 0.5; cy = H * 0.5;
      scale = Math.min(W, H) * 0.16;   // world -> screen
    }

    function spawn() {
      var r = 2.6 + Math.random() * 2.6;
      var a = Math.random() * Math.PI * 2;
      return { x: r * Math.cos(a), y: r * Math.sin(a), px: 0, py: 0, life: 0, max: 220 + Math.random() * 260 };
    }

    function reset() {
      particles = [];
      for (var i = 0; i < N; i++) {
        var p = spawn();
        p.life = Math.floor(Math.random() * p.max);
        particles.push(p);
      }
    }

    function toScreenX(x) { return cx + x * scale; }
    function toScreenY(y) { return cy - y * scale; }

    function frame() {
      if (!running) return;
      // gentle fade of previous frame -> soft trails on the paper
      ctx.clearRect(0, 0, W, H);

      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.px = p.x; p.py = p.y;

        // integrate the vector field (semi-implicit Euler)
        var ax = p.y;
        var ay = -p.x - mu * p.y;
        p.x += ax * dt * 6;
        p.y += ay * dt * 6;
        p.life++;

        var speed = Math.sqrt(ax * ax + ay * ay);
        var alpha = Math.max(0, 0.16 * (1 - p.life / p.max));

        ctx.strokeStyle = "rgba(47, 75, 124," + alpha + ")";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(toScreenX(p.px), toScreenY(p.py));
        ctx.lineTo(toScreenX(p.x), toScreenY(p.y));
        ctx.stroke();

        var rr = p.x * p.x + p.y * p.y;
        if (p.life >= p.max || rr < 0.02) {
          particles[i] = spawn();
        }
        void speed;
      }
      requestAnimationFrame(frame);
    }

    resize();
    reset();
    frame();

    window.addEventListener("resize", function () { resize(); });
    document.addEventListener("visibilitychange", function () {
      running = !document.hidden;
      if (running) frame();
    });
  })();

})();
