/* ==========================================================================
   BONAL — Celovite poslovne storitve
   script.js — navigation, scroll effects, reveal animations, contact form
   ========================================================================== */

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    initMobileNav();
    initHeaderScroll();
    initActiveNavLink();
    initScrollReveal();
    initBackToTop();
    initFooterYear();
    initContactForm();
    initCookieConsent();
  });

  /* ---------- Mobile navigation toggle ---------- */
  function initMobileNav() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".main-nav");
    if (!toggle || !nav) return;

    toggle.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
      document.body.style.overflow = isOpen ? "hidden" : "";
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && nav.classList.contains("is-open")) {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
        toggle.focus();
      }
    });
  }

  /* ---------- Header shadow on scroll ---------- */
  function initHeaderScroll() {
    var header = document.querySelector(".site-header");
    if (!header) return;

    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Highlight current page in nav ---------- */
  function initActiveNavLink() {
    var current = (window.location.pathname.split("/").pop() || "index.html");
    if (current === "") current = "index.html";

    document.querySelectorAll(".main-nav a[href]").forEach(function (link) {
      var href = link.getAttribute("href");
      if (href === current || (current === "index.html" && href === "./")) {
        link.setAttribute("aria-current", "page");
      }
    });
  }

  /* ---------- Reveal-on-scroll animations ---------- */
  function initScrollReveal() {
    var targets = document.querySelectorAll(".reveal");
    if (!targets.length) return;

    if (!("IntersectionObserver" in window)) {
      targets.forEach(function (el) {
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
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    targets.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ---------- Back-to-top button ---------- */
  function initBackToTop() {
    var button = document.querySelector(".back-to-top");
    if (!button) return;

    window.addEventListener(
      "scroll",
      function () {
        button.classList.toggle("is-visible", window.scrollY > 480);
      },
      { passive: true }
    );

    button.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------- Footer year ---------- */
  function initFooterYear() {
    var el = document.querySelector("#current-year");
    if (el) el.textContent = String(new Date().getFullYear());
  }

  /* ---------- Contact form validation ---------- */
  function initContactForm() {
    var form = document.querySelector("#contact-form");
    if (!form) return;

    var successBox = document.querySelector("#form-success");

    var validators = {
      name: function (value) {
        return value.trim().length >= 2 ? "" : "Vnesite vaše ime in priimek.";
      },
      email: function (value) {
        var pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return pattern.test(value.trim()) ? "" : "Vnesite veljaven e-poštni naslov.";
      },
      message: function (value) {
        return value.trim().length >= 10 ? "" : "Sporočilo naj vsebuje vsaj 10 znakov.";
      }
    };

    function showFieldError(field, message) {
      var wrapper = field.closest(".form-field");
      if (!wrapper) return;
      var errorEl = wrapper.querySelector(".error-msg");
      wrapper.classList.toggle("has-error", Boolean(message));
      if (errorEl) errorEl.textContent = message;
    }

    Object.keys(validators).forEach(function (name) {
      var field = form.elements.namedItem(name);
      if (!field) return;
      field.addEventListener("blur", function () {
        showFieldError(field, validators[name](field.value));
      });
      field.addEventListener("input", function () {
        if (field.closest(".form-field").classList.contains("has-error")) {
          showFieldError(field, validators[name](field.value));
        }
      });
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var isValid = true;

      Object.keys(validators).forEach(function (name) {
        var field = form.elements.namedItem(name);
        if (!field) return;
        var message = validators[name](field.value);
        showFieldError(field, message);
        if (message) isValid = false;
      });

      if (!isValid) {
        var firstError = form.querySelector(".has-error input, .has-error textarea");
        if (firstError) firstError.focus();
        return;
      }

      if (successBox) {
        successBox.classList.add("is-visible");
        successBox.setAttribute("tabindex", "-1");
        successBox.focus();
      }

      form.reset();
    });
  }

  /* ---------- Cookie consent (banner + settings modal) ---------- */
  function initCookieConsent() {
    var STORAGE_KEY = "bonalCookieConsent";

    var banner = document.querySelector("#cookie-banner");
    var overlay = document.querySelector("#cookie-modal-overlay");
    if (!banner || !overlay) return;

    var acceptBtn = document.querySelector("#cookie-accept");
    var rejectBtn = document.querySelector("#cookie-reject");
    var manageBtn = document.querySelector("#cookie-manage");
    var moreBtn = document.querySelector("#cookie-more");
    var closeBtn = document.querySelector("#cookie-modal-close");
    var saveBtn = document.querySelector("#cookie-save");
    var toggles = overlay.querySelectorAll("input[data-category]");

    function readConsent() {
      try {
        var raw = window.localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
      } catch (e) {
        return null;
      }
    }

    function writeConsent(consent) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
      } catch (e) {
        /* localStorage unavailable (private browsing) — consent still applies for this page view */
      }
    }

    function updateToggleLabel(toggle) {
      var label = overlay.querySelector('.toggle-state[data-state-for="' + toggle.id + '"]');
      if (label) label.textContent = toggle.checked ? "Vključen" : "Izključen";
    }

    function applyToggleStates(consent) {
      toggles.forEach(function (toggle) {
        var category = toggle.getAttribute("data-category");
        if (category === "essential") return;
        toggle.checked = Boolean(consent && consent[category]);
        updateToggleLabel(toggle);
      });
    }

    function hasNonEssentialConsent(consent) {
      return Boolean(consent && (consent.advertising || consent.analytics || consent.preferences));
    }

    function applyMapConsent(consent) {
      var iframe = document.querySelector("#map-iframe");
      var placeholder = document.querySelector("#map-placeholder");
      if (!iframe || !placeholder) return;

      if (hasNonEssentialConsent(consent)) {
        if (!iframe.getAttribute("src") && iframe.dataset.src) {
          iframe.setAttribute("src", iframe.dataset.src);
        }
        iframe.hidden = false;
        placeholder.hidden = true;
      } else {
        iframe.hidden = true;
        placeholder.hidden = false;
      }
    }

    function hideBanner() {
      banner.hidden = true;
    }

    function showBanner() {
      banner.hidden = false;
    }

    function openModal() {
      overlay.hidden = false;
      document.body.style.overflow = "hidden";
      if (closeBtn) closeBtn.focus();
    }

    function closeModal() {
      overlay.hidden = true;
      document.body.style.overflow = "";
    }

    function saveConsent(consent) {
      writeConsent(consent);
      applyToggleStates(consent);
      applyMapConsent(consent);
      hideBanner();
      closeModal();
    }

    function acceptAll() {
      saveConsent({ essential: true, advertising: true, analytics: true, preferences: true });
    }

    function rejectAll() {
      saveConsent({ essential: true, advertising: false, analytics: false, preferences: false });
    }

    var existing = readConsent();
    if (existing) {
      applyToggleStates(existing);
      applyMapConsent(existing);
      hideBanner();
    } else {
      applyMapConsent(null);
      showBanner();
    }

    toggles.forEach(function (toggle) {
      toggle.addEventListener("change", function () {
        updateToggleLabel(toggle);
      });
    });

    if (acceptBtn) acceptBtn.addEventListener("click", acceptAll);
    if (rejectBtn) rejectBtn.addEventListener("click", rejectAll);
    if (manageBtn) manageBtn.addEventListener("click", openModal);
    if (moreBtn) moreBtn.addEventListener("click", openModal);
    if (closeBtn) closeBtn.addEventListener("click", closeModal);

    overlay.addEventListener("click", function (event) {
      if (event.target === overlay) closeModal();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !overlay.hidden) closeModal();
    });

    if (saveBtn) {
      saveBtn.addEventListener("click", function () {
        var consent = { essential: true };
        toggles.forEach(function (toggle) {
          var category = toggle.getAttribute("data-category");
          if (category === "essential") return;
          consent[category] = toggle.checked;
        });
        saveConsent(consent);
      });
    }

    var mapConsentBtn = document.querySelector("#map-consent-btn");
    if (mapConsentBtn) {
      mapConsentBtn.addEventListener("click", acceptAll);
    }
  }
})();
