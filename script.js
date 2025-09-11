document.addEventListener("DOMContentLoaded", () => {
  // ---------- Menu toggle (robust) ----------
  const menuToggle = document.querySelector(".menu-toggle");
  const mobileMenu = document.querySelector(".mobile-menu");
  let isMenuOpen = false;

  if (menuToggle && mobileMenu) {
    // Handle menu toggle
    menuToggle.addEventListener("click", (e) => {
      e.preventDefault();
      toggleMenu();
    });

    // Handle escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && isMenuOpen) {
        toggleMenu();
      }
    });

    // Close menu when clicking outside
    document.addEventListener("click", (e) => {
      if (
        isMenuOpen &&
        !mobileMenu.contains(e.target) &&
        !menuToggle.contains(e.target)
      ) {
        toggleMenu();
      }
    });

    // Close menu when clicking on a link inside mobile menu
    const mobileMenuLinks = mobileMenu.querySelectorAll("a");
    mobileMenuLinks.forEach((link) => {
      link.addEventListener("click", () => {
        // only close if open
        if (isMenuOpen) toggleMenu();
      });
    });
  }

  // Toggle menu function (safe guards for icon)
  function toggleMenu() {
    isMenuOpen = !isMenuOpen;
    if (mobileMenu) mobileMenu.classList.toggle("active");
    if (menuToggle) menuToggle.classList.toggle("active");

    // Change menu icon safely
    if (menuToggle) {
      const menuIcon = menuToggle.querySelector("i");
      if (menuIcon) {
        menuIcon.classList.toggle("fa-bars");
        menuIcon.classList.toggle("fa-times");
      }
    }

    // Prevent body scroll when menu is open
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
  }

  // ---------- Design thinking tab/carousel behavior ----------
  const tabs = document.querySelectorAll(".design-tabs .tab");
  const track = document.querySelector(".design-tabs .carousel-track");
  const panels = document.querySelectorAll(".design-tabs .panel");
  let current = 0;
  let isAnimating = false;

  if (tabs.length && panels.length && track) {
    // initialize panels and track
    panels.forEach((panel, i) => {
      if (i === current) {
        panel.setAttribute("aria-hidden", "false");
        panel.tabIndex = 0;
      } else {
        panel.setAttribute("aria-hidden", "true");
        panel.tabIndex = -1;
      }
    });

    const setTrackPosition = (idx) => {
      const panelPercent = 100 / panels.length;
      track.style.transform = `translateX(-${idx * panelPercent}%)`;
    };

    // place track initial position
    setTrackPosition(current);

    // updateTabs updates visual state and moves the carousel
    function updateTabs(idx) {
      if (isAnimating || idx === current || idx < 0 || idx >= tabs.length)
        return;
      isAnimating = true;

      // update tab attributes and classes
      tabs.forEach((t, i) => {
        const isActive = i === idx;
        t.classList.toggle("active", isActive);
        t.setAttribute("aria-selected", isActive ? "true" : "false");
        t.tabIndex = isActive ? 0 : -1;
      });

      // update panels
      panels.forEach((panel, i) => {
        const visible = i === idx;
        panel.setAttribute("aria-hidden", visible ? "false" : "true");
        panel.tabIndex = visible ? 0 : -1;
      });

      // move track
      setTrackPosition(idx);
      current = idx;

      // clear animating flag after transition
      const onEnd = () => {
        isAnimating = false;
        track.removeEventListener("transitionend", onEnd);
      };
      track.addEventListener("transitionend", onEnd);
    }

    // attach events
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const idx = Number(tab.getAttribute("data-index"));
        updateTabs(idx);
      });

      tab.addEventListener("keydown", (e) => {
        if (e.key === "ArrowRight") {
          e.preventDefault();
          const next = (current + 1) % tabs.length;
          updateTabs(next);
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          const prev = (current - 1 + tabs.length) % tabs.length;
          updateTabs(prev);
        }
      });
    });

    // Make carousel responsive on resize to keep panels equal width
    window.addEventListener("resize", () => {
      // ensure transform remains correct
      track.style.transition = "none";
      setTrackPosition(current);
      // force reflow then restore transition
      // eslint-disable-next-line no-unused-expressions
      track.offsetHeight;
      track.style.transition = "";
    });
  }

  // ---------- CTA mailto (progressive enhancement) ----------
  try {
    const ctaButton = document.querySelector("#cta .btn-primary");
    if (ctaButton) {
      ctaButton.addEventListener("click", (e) => {
        // Open user's mail client with prefilled recipient
        window.location.href = "mailto:ewelina@amrogowicz.com";
      });
    }
  } catch (err) {
    // fail silently; progressive enhancement
  }
});
