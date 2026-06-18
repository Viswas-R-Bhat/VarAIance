/* ==========================================================================
   VarAInce — Shared JS
   Vanilla JS only. No frameworks, no animation libraries.
   Covers: mobile nav, active link state, scroll-reveal (Intersection
   Observer), word-stagger heading reveal, hero data-network background,
   animated stat counters, event filter tabs, card spotlight/tilt,
   and progressive-enhancement for the contact form.
   ========================================================================== */

(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ------------------------------------------------------------------
     1. Mobile navigation (hamburger)
  ------------------------------------------------------------------ */
  function initMobileNav() {
    var toggle = document.querySelector(".nav-toggle");
    var menu = document.querySelector(".mobile-menu");
    if (!toggle || !menu) return;

    function closeMenu() {
      toggle.setAttribute("aria-expanded", "false");
      menu.classList.remove("is-open");
      document.body.style.overflow = "";
    }

    function openMenu() {
      toggle.setAttribute("aria-expanded", "true");
      menu.classList.add("is-open");
      document.body.style.overflow = "hidden";
    }

    toggle.addEventListener("click", function () {
      var isOpen = toggle.getAttribute("aria-expanded") === "true";
      isOpen ? closeMenu() : openMenu();
    });

    // Close on link click, so navigation feels instant
    menu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });

    // Close on Escape
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenu();
    });

    // Close if viewport grows past mobile breakpoint
    window.addEventListener("resize", function () {
      if (window.innerWidth >= 768) closeMenu();
    });
  }

  /* ------------------------------------------------------------------
     2. Active nav link — driven by data-page on <body>
  ------------------------------------------------------------------ */
  function initActiveNavLink() {
    var page = document.body.getAttribute("data-page");
    if (!page) return;
    document
      .querySelectorAll('[data-nav-link="' + page + '"]')
      .forEach(function (link) {
        link.classList.add("active");
        link.setAttribute("aria-current", "page");
      });
  }

  /* ------------------------------------------------------------------
     3. Scroll-reveal via IntersectionObserver
     NOTE: When premium.js (GSAP) is loaded, it handles scroll reveals
     with ScrollTrigger instead. This function only runs as a fallback
     if GSAP is not available.
  ------------------------------------------------------------------ */
  function initScrollReveal() {
    /* Defer to premium.js when GSAP is loaded */
    if (typeof gsap !== "undefined") return;

    var items = document.querySelectorAll(".fade-in");
    if (!items.length) return;

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      items.forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );

    items.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ------------------------------------------------------------------
     4. Hero data-network background
     A field of drifting "data points" with faint connecting lines —
     a quiet nod to the club's namesake: variance is the spread of
     points around a mean. Positions are generated once in a 0–100
     coordinate space shared by the DOM nodes (left/top %) and the
     SVG overlay (viewBox 0 0 100 100), so nothing has to be
     recalculated on resize.
  ------------------------------------------------------------------ */
  function initHeroNetwork() {
    var field = document.getElementById("heroNetwork");
    var svg = document.getElementById("networkSvg");
    if (!field || !svg) return;

    var isMobile = window.innerWidth < 640;
    var nodeCount = isMobile ? 16 : 34;
    var maxLinkDist = isMobile ? 16 : 14;
    var maxLinksPerNode = 2;

    var points = [];
    for (var i = 0; i < nodeCount; i++) {
      points.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        blue: Math.random() > 0.5,
      });
    }

    // Render nodes
    var frag = document.createDocumentFragment();
    points.forEach(function (p) {
      var node = document.createElement("span");
      node.className = "network-node" + (p.blue ? " is-blue" : "");
      node.style.left = p.x + "%";
      node.style.top = p.y + "%";
      node.style.setProperty("--dur", 4 + Math.random() * 5 + "s");
      node.style.setProperty("--delay", Math.random() * -6 + "s");
      frag.appendChild(node);
    });
    field.appendChild(frag);

    // Build a gradient + connect nearby points (bounded fan-out per node)
    if (!prefersReducedMotion) {
      svg.setAttribute("viewBox", "0 0 100 100");
      svg.setAttribute("preserveAspectRatio", "none");

      var defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
      var grad = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "linearGradient"
      );
      grad.setAttribute("id", "networkLineGrad");
      grad.setAttribute("x1", "0%");
      grad.setAttribute("y1", "0%");
      grad.setAttribute("x2", "100%");
      grad.setAttribute("y2", "100%");
      var stop1 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
      stop1.setAttribute("offset", "0%");
      stop1.setAttribute("stop-color", "#00c9a7");
      var stop2 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
      stop2.setAttribute("offset", "100%");
      stop2.setAttribute("stop-color", "#0099ff");
      grad.appendChild(stop1);
      grad.appendChild(stop2);
      defs.appendChild(grad);
      svg.appendChild(defs);

      var linkCount = new Array(points.length).fill(0);
      var lineFrag = document.createDocumentFragment();
      var linesDrawn = 0;
      var maxLines = isMobile ? 10 : 26;

      for (var a = 0; a < points.length && linesDrawn < maxLines; a++) {
        for (var b = a + 1; b < points.length && linesDrawn < maxLines; b++) {
          if (linkCount[a] >= maxLinksPerNode || linkCount[b] >= maxLinksPerNode)
            continue;
          var dx = points[a].x - points[b].x;
          var dy = points[a].y - points[b].y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxLinkDist) {
            var line = document.createElementNS(
              "http://www.w3.org/2000/svg",
              "line"
            );
            line.setAttribute("x1", points[a].x);
            line.setAttribute("y1", points[a].y);
            line.setAttribute("x2", points[b].x);
            line.setAttribute("y2", points[b].y);
            line.setAttribute("stroke", "url(#networkLineGrad)");
            line.style.animationDelay = Math.random() * -7 + "s";
            lineFrag.appendChild(line);
            linkCount[a]++;
            linkCount[b]++;
            linesDrawn++;
          }
        }
      }
      svg.appendChild(lineFrag);
    }
  }

  /* ------------------------------------------------------------------
     5. Animated stat counters
     Reads data-target / data-prefix / data-suffix and counts up once
     the element scrolls into view. Numbers are formatted en-IN so the
     prize pool reads ₹15,000 rather than ₹15000.
  ------------------------------------------------------------------ */
  function initStatCounters() {
    var stats = document.querySelectorAll("[data-target]");
    if (!stats.length) return;

    function animate(el) {
      var target = parseInt(el.getAttribute("data-target"), 10) || 0;
      var prefix = el.getAttribute("data-prefix") || "";
      var suffix = el.getAttribute("data-suffix") || "";
      var duration = 1200;
      var startTime = null;

      if (prefersReducedMotion) {
        el.textContent = prefix + target.toLocaleString("en-IN") + suffix;
        return;
      }

      function step(timestamp) {
        if (startTime === null) startTime = timestamp;
        var progress = Math.min((timestamp - startTime) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        var current = Math.floor(eased * target);
        el.textContent = prefix + current.toLocaleString("en-IN") + suffix;
        if (progress < 1) {
          window.requestAnimationFrame(step);
        } else {
          el.textContent = prefix + target.toLocaleString("en-IN") + suffix;
        }
      }
      window.requestAnimationFrame(step);
    }

    if (!("IntersectionObserver" in window)) {
      stats.forEach(animate);
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animate(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    stats.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ------------------------------------------------------------------
     6. Event filter tabs (events.html)
  ------------------------------------------------------------------ */
  function initEventFilters() {
    var tabs = document.querySelectorAll(".filter-btn");
    var cards = document.querySelectorAll("[data-category]");
    if (!tabs.length || !cards.length) return;

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        tabs.forEach(function (t) {
          t.setAttribute("aria-pressed", "false");
        });
        tab.setAttribute("aria-pressed", "true");

        var filter = tab.getAttribute("data-filter");
        cards.forEach(function (card) {
          var match = filter === "all" || card.getAttribute("data-category") === filter;
          card.classList.toggle("is-hidden", !match);
        });
      });
    });
  }

  /* ------------------------------------------------------------------
     7. Contact form — progressive AJAX submission to Formspree
     Falls back to a normal POST (full page reload to Formspree's
     thank-you page) if fetch is unavailable or blocked.
  ------------------------------------------------------------------ */
  function initContactForm() {
    var form = document.getElementById("contactForm");
    if (!form) return;

    var status = document.getElementById("formStatus");
    var submitBtn = form.querySelector('button[type="submit"]');

    form.addEventListener("submit", function (e) {
      if (!window.fetch) return; // let the browser submit normally

      e.preventDefault();
      if (status) {
        status.className = "form-status";
        status.textContent = "";
      }
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.dataset.originalText = submitBtn.textContent;
        submitBtn.textContent = "Sending...";
      }

      fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      })
        .then(function (response) {
          if (response.ok) {
            form.reset();
            if (status) {
              status.textContent =
                "Message sent — we'll get back to you soon.";
              status.className = "form-status is-success";
            }
          } else {
            throw new Error("Form submission failed");
          }
        })
        .catch(function () {
          if (status) {
            status.textContent =
              "Something went wrong. Please email us or try again.";
            status.className = "form-status is-error";
          }
        })
        .finally(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = submitBtn.dataset.originalText || "Send message";
          }
        });
    });
  }

  /* ------------------------------------------------------------------
     8. Word-stagger reveal for section headings
     NOTE: When premium.js (GSAP) is loaded, it handles character-level
     text splitting instead. This function only runs as a fallback.
  ------------------------------------------------------------------ */
  function initHeadingReveal() {
    /* Defer to premium.js character-split when GSAP is loaded */
    if (typeof gsap !== "undefined") return;

    if (prefersReducedMotion) return;
    var headings = document.querySelectorAll(".section-title");
    if (!headings.length) return;

    headings.forEach(function (heading) {
      var text = heading.textContent;
      heading.setAttribute("aria-label", text);

      var parts = text.split(/(\s+)/); // keeps whitespace as separate tokens
      heading.innerHTML = "";
      var wordIndex = 0;

      parts.forEach(function (part) {
        if (part.trim() === "") {
          heading.appendChild(document.createTextNode(part));
          return;
        }
        var span = document.createElement("span");
        span.className = "reveal-word";
        span.textContent = part;
        span.setAttribute("aria-hidden", "true");
        span.style.transitionDelay = (0.08 + wordIndex * 0.045) + "s";
        heading.appendChild(span);
        wordIndex++;
      });
    });
  }

  /* ------------------------------------------------------------------
     9. Card spotlight + tilt
     NOTE: When premium.js (GSAP) is loaded, it handles card tilt with
     GSAP springs instead. This function only runs as a fallback.
  ------------------------------------------------------------------ */
  function initCardTilt() {
    /* Defer to premium.js GSAP-powered tilt when available */
    if (typeof gsap !== "undefined") return;

    if (prefersReducedMotion) return;
    var cards = document.querySelectorAll(".card");
    if (!cards.length) return;

    cards.forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var rect = card.getBoundingClientRect();
        var px = ((e.clientX - rect.left) / rect.width) * 100;
        var py = ((e.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty("--spot-x", px + "%");
        card.style.setProperty("--spot-y", py + "%");

        var rx = (0.5 - py / 100) * 6;
        var ry = (px / 100 - 0.5) * 6;
        card.style.transform =
          "translateY(-4px) perspective(900px) rotateX(" + rx.toFixed(2) + "deg) rotateY(" + ry.toFixed(2) + "deg)";
      });

      card.addEventListener("mouseleave", function () {
        card.style.transform = "";
      });
    });
  }

  /* ------------------------------------------------------------------
     Init
  ------------------------------------------------------------------ */
  document.addEventListener("DOMContentLoaded", function () {
    initMobileNav();
    initActiveNavLink();
    initHeadingReveal();
    initScrollReveal();
    initHeroNetwork();
    initStatCounters();
    initEventFilters();
    initContactForm();
    initCardTilt();
  });
})();