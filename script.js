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

  /* ---------- Contact form: validation + real submission (Formspree) ----------
     Submits via fetch() to the form's own `action` (a Formspree endpoint).
     Success is only ever shown after a genuine 2xx response; any network
     failure or non-ok response shows a real error state with a mailto
     fallback — no simulated/fake success. ---------- */
  function initContactForm() {
    var form = document.querySelector("#contact-form");
    if (!form) return;

    var successBox = document.querySelector("#form-success");
    var errorBox = document.querySelector("#form-error");
    var submitBtn = form.querySelector('button[type="submit"]');
    var submitLabel = submitBtn ? submitBtn.querySelector(".btn-label") : null;

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

    function setSubmitting(isSubmitting) {
      if (!submitBtn) return;
      submitBtn.disabled = isSubmitting;
      if (submitLabel) {
        submitLabel.textContent = isSubmitting ? "Pošiljanje …" : "Pošlji sporočilo";
      }
    }

    function hideStatusBoxes() {
      if (successBox) successBox.classList.remove("is-visible");
      if (errorBox) errorBox.classList.remove("is-visible");
    }

    function showSuccess() {
      hideStatusBoxes();
      if (successBox) {
        successBox.classList.add("is-visible");
        successBox.setAttribute("tabindex", "-1");
        successBox.focus();
      }
    }

    function showError() {
      hideStatusBoxes();
      if (errorBox) {
        errorBox.classList.add("is-visible");
        errorBox.setAttribute("tabindex", "-1");
        errorBox.focus();
      }
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
      hideStatusBoxes();

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

      setSubmitting(true);

      fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      })
        .then(function (response) {
          setSubmitting(false);
          if (response.ok) {
            showSuccess();
            form.reset();
          } else {
            showError();
          }
        })
        .catch(function () {
          setSubmitting(false);
          showError();
        });
    });
  }

  /* ---------- Cookie consent (banner + settings modal) ----------
     Categories reflect only what actually exists on this site today:
     "essential" (storing the consent choice itself — exempt from consent
     under Art. 5(3) of the ePrivacy Directive / ZEKom-2) and "maps" (the
     Google Maps embed on kontakt.html, the only real non-essential,
     third-party integration). No fake "advertising"/"analytics" toggles
     are shown, since no such trackers exist on the site. The schema is
     versioned and time-limited so that changing categories in future, or
     the passage of time, invalidates stale stored consent and re-prompts
     the visitor rather than silently carrying old choices forward. ---------- */
  function initCookieConsent() {
    var STORAGE_KEY = "bonalCookieConsent";
    var CONSENT_VERSION = 2;
    var CONSENT_MAX_AGE_MS = 180 * 24 * 60 * 60 * 1000; // 180 days

    var banner = document.querySelector("#cookie-banner");
    var overlay = document.querySelector("#cookie-modal-overlay");
    if (!banner || !overlay) return;

    var acceptBtn = document.querySelector("#cookie-accept");
    var rejectBtn = document.querySelector("#cookie-reject");
    var manageBtn = document.querySelector("#cookie-manage");
    var moreBtn = document.querySelector("#cookie-more");
    var closeBtn = document.querySelector("#cookie-modal-close");
    var saveBtn = document.querySelector("#cookie-save");
    var settingsTriggers = document.querySelectorAll(".js-cookie-settings-trigger");
    var toggles = overlay.querySelectorAll("input[data-category]");

    function readConsent() {
      var raw;
      try {
        raw = window.localStorage.getItem(STORAGE_KEY);
      } catch (e) {
        return null;
      }
      if (!raw) return null;

      var parsed;
      try {
        parsed = JSON.parse(raw);
      } catch (e) {
        return null;
      }

      if (!parsed || parsed.version !== CONSENT_VERSION) return null;

      var age = Date.now() - Date.parse(parsed.timestamp || "");
      if (!isFinite(age) || age > CONSENT_MAX_AGE_MS) return null;

      return parsed;
    }

    function writeConsent(partial) {
      var consent = {
        version: CONSENT_VERSION,
        essential: true,
        maps: Boolean(partial.maps),
        timestamp: new Date().toISOString()
      };
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
      } catch (e) {
        /* localStorage unavailable (private browsing) — consent still applies for this page view only */
      }
      return consent;
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

    function applyMapConsent(consent) {
      var iframe = document.querySelector("#map-iframe");
      var placeholder = document.querySelector("#map-placeholder");
      if (!iframe || !placeholder) return;

      if (consent && consent.maps) {
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

    function saveConsent(partial) {
      var consent = writeConsent(partial);
      applyToggleStates(consent);
      applyMapConsent(consent);
      hideBanner();
      closeModal();
    }

    function acceptAll() {
      saveConsent({ maps: true });
    }

    function rejectAll() {
      saveConsent({ maps: false });
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

    // Always available (footer link on every page, plus the in-page
    // button on the privacy policy page), so consent can be withdrawn
    // or changed at any time — not just on first visit.
    settingsTriggers.forEach(function (trigger) {
      trigger.addEventListener("click", function () {
        applyToggleStates(readConsent());
        openModal();
      });
    });

    overlay.addEventListener("click", function (event) {
      if (event.target === overlay) closeModal();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !overlay.hidden) closeModal();
    });

    if (saveBtn) {
      saveBtn.addEventListener("click", function () {
        var partial = {};
        toggles.forEach(function (toggle) {
          var category = toggle.getAttribute("data-category");
          if (category === "essential") return;
          partial[category] = toggle.checked;
        });
        saveConsent(partial);
      });
    }

    var mapConsentBtn = document.querySelector("#map-consent-btn");
    if (mapConsentBtn) {
      mapConsentBtn.addEventListener("click", acceptAll);
    }
  }
})();
