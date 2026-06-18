/* ==========================================================================
   VarAInce — Premium Animation Engine
   GSAP 3 + ScrollTrigger + Lenis
   --------------------------------------------------------------------------
   Requires: gsap.min.js, ScrollTrigger.min.js, lenis.min.js loaded BEFORE
   this file. All are pulled from CDN in each HTML page's <head>.

   This file replaces the IntersectionObserver-based scroll-reveal and the
   vanilla card-tilt from main.js. main.js still handles: mobile nav,
   active link state, event filters, contact form, stat counters, and
   the hero data-network background.
   ========================================================================== */

(function () {
  "use strict";

  /* ---- Guards ---------------------------------------------------------- */
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  var isDesktop = window.innerWidth >= 768;

  /* If GSAP isn't loaded, bail silently — site still works without it */
  if (typeof gsap === "undefined") return;

  /* Register ScrollTrigger plugin */
  if (typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
  }

  /* ====================================================================
     1. Lenis Smooth Scroll
     ==================================================================== */
  var lenis = null;

  function initLenis() {
    if (reducedMotion || typeof Lenis === "undefined") return;

    lenis = new Lenis({
      duration: 1.2,
      easing: function (t) {
        return Math.min(1, 1.001 - Math.pow(2, -10 * t));
      },
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      touchMultiplier: 2,
    });

    /* Sync Lenis with GSAP's ticker for frame-perfect scroll */
    gsap.ticker.add(function (time) {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    /* Keep ScrollTrigger in sync */
    if (typeof ScrollTrigger !== "undefined") {
      lenis.on("scroll", ScrollTrigger.update);
    }
  }

  /* ====================================================================
     2. Branded Preloader (index.html only, once per session)
     ==================================================================== */
  function initPreloader() {
    var preloader = document.getElementById("preloader");
    if (!preloader) return;

    /* Skip if already seen this session */
    if (sessionStorage.getItem("varaince_loaded")) {
      preloader.remove();
      document.body.classList.remove("is-loading");
      return;
    }

    document.body.classList.add("is-loading");

    if (reducedMotion) {
      preloader.remove();
      document.body.classList.remove("is-loading");
      sessionStorage.setItem("varaince_loaded", "1");
      return;
    }

    var tl = gsap.timeline({
      onComplete: function () {
        document.body.classList.remove("is-loading");
        sessionStorage.setItem("varaince_loaded", "1");
        /* Clean up DOM */
        preloader.remove();
        /* Now run hero entrance */
        initHeroEntrance();
      },
    });

    var logoEl = preloader.querySelector(".preloader-logo");
    var textEl = preloader.querySelector(".preloader-text");
    var lineEl = preloader.querySelector(".preloader-line");

    tl.set(preloader, { autoAlpha: 1 })
      .from(logoEl, {
        scale: 0.6,
        autoAlpha: 0,
        duration: 0.7,
        ease: "back.out(1.7)",
      })
      .from(
        lineEl,
        {
          scaleX: 0,
          duration: 0.6,
          ease: "power2.inOut",
        },
        "-=0.2"
      )
      .from(
        textEl,
        {
          autoAlpha: 0,
          y: 10,
          duration: 0.4,
          ease: "power2.out",
        },
        "-=0.2"
      )
      .to(preloader, {
        autoAlpha: 0,
        duration: 0.5,
        ease: "power2.inOut",
        delay: 0.3,
      });
  }

  /* ====================================================================
     3. Hero Entrance Sequence (orchestrated GSAP timeline)
     ==================================================================== */
  function initHeroEntrance() {
    var hero = document.querySelector(".hero");
    if (!hero || reducedMotion) return;

    var tl = gsap.timeline({ delay: 0.1 });

    var eyebrow = hero.querySelector(".hero-eyebrow");
    var wordmark = hero.querySelector(".hero-wordmark");
    var tagline = hero.querySelector(".hero-tagline");
    var sub = hero.querySelector(".hero-sub");
    var actions = hero.querySelector(".hero-actions");
    var scrollCue = hero.querySelector(".hero-scroll-cue");

    if (eyebrow)
      tl.from(eyebrow, {
        autoAlpha: 0,
        y: 20,
        duration: 0.6,
        ease: "power3.out",
      });
    if (wordmark)
      tl.from(
        wordmark,
        {
          autoAlpha: 0,
          scale: 0.85,
          y: 30,
          duration: 0.8,
          ease: "power3.out",
        },
        "-=0.3"
      );
    if (tagline)
      tl.from(
        tagline,
        {
          autoAlpha: 0,
          y: 20,
          duration: 0.6,
          ease: "power3.out",
        },
        "-=0.35"
      );
    if (sub)
      tl.from(
        sub,
        {
          autoAlpha: 0,
          y: 15,
          duration: 0.5,
          ease: "power3.out",
        },
        "-=0.3"
      );
    if (actions)
      tl.from(
        actions.children,
        {
          autoAlpha: 0,
          y: 15,
          duration: 0.5,
          stagger: 0.12,
          ease: "power3.out",
        },
        "-=0.25"
      );
    if (scrollCue)
      tl.from(
        scrollCue,
        {
          autoAlpha: 0,
          y: -10,
          duration: 0.4,
          ease: "power3.out",
        },
        "-=0.2"
      );
  }

  /* ====================================================================
     4. GSAP ScrollTrigger Reveals (replaces IntersectionObserver)
     ==================================================================== */
  function initGSAPScrollReveal() {
    if (typeof ScrollTrigger === "undefined") return;

    var fadeItems = document.querySelectorAll(".fade-in");
    if (!fadeItems.length) return;

    if (reducedMotion) {
      fadeItems.forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }

    /* Track which elements are handled by grid-stagger so we don't animate them twice */
    var gridHandled = new Set();

    /* Staggered grid reveals FIRST — cards within grids animate as a wave */
    var grids = document.querySelectorAll(
      ".pillars-grid, .events-grid, .team-grid, .dept-stats"
    );
    grids.forEach(function (grid) {
      var cards = grid.querySelectorAll(".card, .dept-stat");
      if (!cards.length) return;

      cards.forEach(function (c) { gridHandled.add(c); });

      gsap.fromTo(cards,
        { autoAlpha: 0, y: 60, scale: 0.95, filter: "blur(8px)" },
        {
          scrollTrigger: {
            trigger: grid,
            start: "top 85%",
            once: true,
          },
          autoAlpha: 1,
          y: 0,
          scale: 1,
          filter: "blur(0px)",
          duration: 0.8,
          stagger: 0.12,
          ease: "power3.out",
          clearProps: "filter,transform",
          onStart: function () {
            cards.forEach(function (c) {
              c.classList.add("is-visible");
            });
          },
        }
      );
    });

    /* Individual fade-in elements (skip hero children + grid-handled items) */
    fadeItems.forEach(function (el) {
      if (el.closest(".hero")) return;
      if (gridHandled.has(el)) return;

      /* Determine delay from class */
      var delay = 0;
      if (el.classList.contains("fade-in-delay-1")) delay = 0.08;
      else if (el.classList.contains("fade-in-delay-2")) delay = 0.16;
      else if (el.classList.contains("fade-in-delay-3")) delay = 0.24;
      else if (el.classList.contains("fade-in-delay-4")) delay = 0.32;
      else if (el.classList.contains("fade-in-delay-5")) delay = 0.4;

      gsap.fromTo(el,
        { autoAlpha: 0, y: 50, scale: 0.97, filter: "blur(6px)" },
        {
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            once: true,
          },
          autoAlpha: 1,
          y: 0,
          scale: 1,
          filter: "blur(0px)",
          duration: 0.9,
          delay: delay,
          ease: "power3.out",
          clearProps: "filter,transform",
          onStart: function () {
            el.classList.add("is-visible");
          },
        }
      );
    });
  }

  /* ====================================================================
     5. Character-Level Text Splitting for Section Headings
     ==================================================================== */
  function initCharSplit() {
    if (reducedMotion) return;

    var headings = document.querySelectorAll(".section-title");
    if (!headings.length) return;

    headings.forEach(function (heading) {
      /* Skip if already processed by main.js word reveal */
      if (heading.querySelector(".reveal-word") || heading.querySelector(".char")) return;

      var text = heading.textContent;
      heading.setAttribute("aria-label", text);
      heading.innerHTML = "";

      /* Split into words first, then characters within each word.
         Each word is wrapped in a .word span (inline-block, nowrap)
         so line breaks only happen between words, never mid-word. */
      var words = text.split(/(\s+)/);
      words.forEach(function (word) {
        if (/^\s+$/.test(word)) {
          /* Whitespace between words — keep as text node */
          heading.appendChild(document.createTextNode(word));
          return;
        }
        var wordWrap = document.createElement("span");
        wordWrap.className = "word-wrap";
        for (var i = 0; i < word.length; i++) {
          var span = document.createElement("span");
          span.className = "char";
          span.textContent = word[i];
          span.setAttribute("aria-hidden", "true");
          wordWrap.appendChild(span);
        }
        heading.appendChild(wordWrap);
      });

      /* Animate characters on scroll */
      if (typeof ScrollTrigger !== "undefined") {
        var chars = heading.querySelectorAll(".char");
        gsap.fromTo(chars,
          { autoAlpha: 0, y: "0.6em", filter: "blur(4px)" },
          {
            scrollTrigger: {
              trigger: heading,
              start: "top 88%",
              once: true,
            },
            autoAlpha: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.5,
            stagger: 0.02,
            ease: "power3.out",
            clearProps: "filter,transform",
          }
        );
      }
    });
  }

  /* ====================================================================
     6. Custom Cursor (desktop only)
     ==================================================================== */
  function initCustomCursor() {
    if (isTouchDevice || !isDesktop || reducedMotion) return;

    /* Create cursor elements */
    var dot = document.createElement("div");
    dot.className = "cursor-dot";
    var outline = document.createElement("div");
    outline.className = "cursor-outline";
    document.body.appendChild(dot);
    document.body.appendChild(outline);

    var mouseX = -100,
      mouseY = -100;
    var outlineX = -100,
      outlineY = -100;
    var isHovering = false;

    document.addEventListener("mousemove", function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;

      /* Dot follows exactly */
      dot.style.transform =
        "translate(" + mouseX + "px, " + mouseY + "px)";
    });

    /* Outline follows with spring delay */
    gsap.ticker.add(function () {
      outlineX += (mouseX - outlineX) * 0.15;
      outlineY += (mouseY - outlineY) * 0.15;
      outline.style.transform =
        "translate(" + outlineX + "px, " + outlineY + "px)" +
        (isHovering ? " scale(1.6)" : " scale(1)");
    });

    /* Expand on interactive elements */
    var hoverTargets = document.querySelectorAll(
      "a, button, .card, .filter-btn, input, textarea, .nav-toggle"
    );
    hoverTargets.forEach(function (el) {
      el.addEventListener("mouseenter", function () {
        isHovering = true;
        dot.classList.add("is-hovering");
        outline.classList.add("is-hovering");
      });
      el.addEventListener("mouseleave", function () {
        isHovering = false;
        dot.classList.remove("is-hovering");
        outline.classList.remove("is-hovering");
      });
    });

    /* Hide when leaving window */
    document.addEventListener("mouseleave", function () {
      dot.style.opacity = "0";
      outline.style.opacity = "0";
    });
    document.addEventListener("mouseenter", function () {
      dot.style.opacity = "1";
      outline.style.opacity = "1";
    });
  }

  /* ====================================================================
     7. Magnetic Buttons
     ==================================================================== */
  function initMagneticButtons() {
    if (isTouchDevice || !isDesktop || reducedMotion) return;

    var magnets = document.querySelectorAll(".btn, .nav-link, .team-link, .footer-social");

    magnets.forEach(function (el) {
      el.addEventListener("mousemove", function (e) {
        var rect = el.getBoundingClientRect();
        var centerX = rect.left + rect.width / 2;
        var centerY = rect.top + rect.height / 2;
        var deltaX = e.clientX - centerX;
        var deltaY = e.clientY - centerY;

        /* Strength of pull — 30% of distance */
        gsap.to(el, {
          x: deltaX * 0.3,
          y: deltaY * 0.3,
          duration: 0.3,
          ease: "power2.out",
        });
      });

      el.addEventListener("mouseleave", function () {
        gsap.to(el, {
          x: 0,
          y: 0,
          duration: 0.5,
          ease: "elastic.out(1, 0.3)",
        });
      });
    });
  }

  /* ====================================================================
     8. Nav Hide on Scroll Down / Reveal on Scroll Up
     ==================================================================== */
  function initNavScroll() {
    var nav = document.querySelector(".site-nav");
    if (!nav) return;

    var lastScroll = 0;
    var scrollThreshold = 80;

    function onScroll() {
      var currentScroll = window.pageYOffset || document.documentElement.scrollTop;

      if (currentScroll <= 10) {
        nav.classList.remove("nav-hidden");
        nav.classList.remove("nav-scrolled");
        return;
      }

      nav.classList.add("nav-scrolled");

      if (currentScroll > lastScroll && currentScroll > scrollThreshold) {
        /* Scrolling DOWN */
        nav.classList.add("nav-hidden");
      } else {
        /* Scrolling UP */
        nav.classList.remove("nav-hidden");
      }

      lastScroll = currentScroll;
    }

    /* Use lenis scroll event if available, else native */
    if (lenis) {
      lenis.on("scroll", onScroll);
    } else {
      window.addEventListener("scroll", onScroll, { passive: true });
    }
  }

  /* ====================================================================
     9. Text Scramble on Nav Link Hover
     ==================================================================== */
  function initTextScramble() {
    if (isTouchDevice || reducedMotion) return;

    var links = document.querySelectorAll(".nav-link");
    var chars = "!<>-_\\/[]{}—=+*^?#_01";

    links.forEach(function (link) {
      var originalText = link.textContent;

      link.addEventListener("mouseenter", function () {
        var iteration = 0;
        var maxIterations = originalText.length;

        var interval = setInterval(function () {
          link.textContent = originalText
            .split("")
            .map(function (char, index) {
              if (index < iteration) {
                return originalText[index];
              }
              return chars[Math.floor(Math.random() * chars.length)];
            })
            .join("");

          iteration += 1 / 2;

          if (iteration >= maxIterations) {
            link.textContent = originalText;
            clearInterval(interval);
          }
        }, 30);
      });
    });
  }

  /* ====================================================================
     10. Scroll Progress Bar
     ==================================================================== */
  function initScrollProgress() {
    var bar = document.createElement("div");
    bar.className = "scroll-progress";
    document.body.appendChild(bar);

    function update() {
      var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      var docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      var progress = docHeight > 0 ? scrollTop / docHeight : 0;
      bar.style.transform = "scaleX(" + progress + ")";
    }

    if (lenis) {
      lenis.on("scroll", update);
    } else {
      window.addEventListener("scroll", update, { passive: true });
    }

    update();
  }

  /* ====================================================================
     11. Card Tilt + Spotlight (GSAP version, replaces main.js version)
     ==================================================================== */
  function initCardTiltGSAP() {
    if (isTouchDevice || !isDesktop || reducedMotion) return;

    var cards = document.querySelectorAll(".card");
    if (!cards.length) return;

    cards.forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var rect = card.getBoundingClientRect();
        var px = ((e.clientX - rect.left) / rect.width) * 100;
        var py = ((e.clientY - rect.top) / rect.height) * 100;

        card.style.setProperty("--spot-x", px + "%");
        card.style.setProperty("--spot-y", py + "%");

        var rx = (0.5 - py / 100) * 8;
        var ry = (px / 100 - 0.5) * 8;

        gsap.to(card, {
          rotateX: rx,
          rotateY: ry,
          transformPerspective: 900,
          duration: 0.4,
          ease: "power2.out",
        });
      });

      card.addEventListener("mouseleave", function () {
        gsap.to(card, {
          rotateX: 0,
          rotateY: 0,
          duration: 0.6,
          ease: "elastic.out(1, 0.5)",
        });
      });
    });
  }

  /* ====================================================================
     12. Hero Parallax Layers
     ==================================================================== */
  function initParallax() {
    if (reducedMotion || typeof ScrollTrigger === "undefined") return;

    var hero = document.querySelector(".hero");
    if (!hero) return;

    var tealBlob = hero.querySelector(".aurora-blob.is-teal");
    var blueBlob = hero.querySelector(".aurora-blob.is-blue");
    var grid = hero.querySelector(".hero-grid");
    var content = hero.querySelector(".hero-content");

    if (tealBlob) {
      gsap.to(tealBlob, {
        y: 120,
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      });
    }

    if (blueBlob) {
      gsap.to(blueBlob, {
        y: 80,
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      });
    }

    if (grid) {
      gsap.to(grid, {
        y: 60,
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      });
    }

    if (content) {
      gsap.to(content, {
        y: 100,
        autoAlpha: 0,
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "60% top",
          scrub: 1,
        },
      });
    }
  }

  /* ====================================================================
     13. Animated Gradient Border on Card Hover
     ==================================================================== */
  function initGradientBorders() {
    if (reducedMotion) return;

    var cards = document.querySelectorAll(".card");
    cards.forEach(function (card) {
      card.classList.add("has-gradient-border");
    });
  }

  /* ====================================================================
     Init — waits for DOM, then orchestrates everything
     ==================================================================== */
  function init() {
    /* Signal to CSS that GSAP is active — overrides .fade-in opacity:0 */
    document.body.classList.add("gsap-ready");

    /* 1. Smooth scroll first — everything else depends on it */
    initLenis();

    /* 2. Preloader (blocks hero entrance until done) */
    var preloader = document.getElementById("preloader");
    if (preloader && !sessionStorage.getItem("varaince_loaded")) {
      initPreloader();
    } else {
      /* No preloader — run hero entrance directly */
      initHeroEntrance();
    }

    /* 3. Scroll-driven animations */
    initCharSplit();
    initGSAPScrollReveal();
    initParallax();

    /* 4. Interactions */
    initCustomCursor();
    initMagneticButtons();
    initCardTiltGSAP();
    initGradientBorders();

    /* 5. UI chrome */
    initNavScroll();
    initTextScramble();
    initScrollProgress();
  }

  /* Run on DOMContentLoaded */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
