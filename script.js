document.addEventListener("DOMContentLoaded", () => {
  // ---------- Scroll Animations (Intersection Observer) ----------
  (function initScrollAnimations() {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      // Immediately show all elements if reduced motion is preferred
      const animatedElements = document.querySelectorAll(
        '[class*="fade-in"], [class*="slide-up"]'
      );
      animatedElements.forEach((el) => el.classList.add("animate-in"));
      return;
    }

    // Intersection Observer options
    const observerOptions = {
      root: null,
      rootMargin: "0px 0px -50px 0px", // Trigger when 50px from bottom of viewport
      threshold: [0, 0.1, 0.3, 0.5],
    };

    // Create the observer
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const element = entry.target;

        if (entry.isIntersecting) {
          // Element is entering the viewport
          if (!element.classList.contains("animate-in")) {
            // Add a small delay to ensure smooth animation
            requestAnimationFrame(() => {
              element.classList.add("animate-in");
            });
          }
        } else {
          // Element is leaving the viewport
          // Only remove animation if it's completely out of view
          if (entry.intersectionRatio === 0) {
            element.classList.remove("animate-in");
          }
        }
      });
    }, observerOptions);

    // Find and observe all elements with animation classes
    const animationSelectors = [
      ".fade-in",
      ".fade-in-up",
      ".fade-in-left",
      ".fade-in-right",
      ".fade-in-scale",
      ".slide-up",
      ".slide-up-large",
    ];

    animationSelectors.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((el) => {
        // Add the base animate-element class if not already present
        if (!el.classList.contains("animate-element")) {
          el.classList.add("animate-element");
        }

        // Start observing the element
        observer.observe(el);
      });
    });

    // Optional: Cleanup observer on page unload
    window.addEventListener("beforeunload", () => {
      observer.disconnect();
    });
  })();

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

  // ---------- Design thinking tab/carousel behavior (original horizontal) ----------
  (function initDesignTabs() {
    const dTabs = document.querySelectorAll(".design-tabs .tab");
    const dTrack = document.querySelector(".design-tabs .carousel-track");
    const dPanels = document.querySelectorAll(".design-tabs .panel");
    if (!dTabs.length || !dPanels.length || !dTrack) return;

    let dCurrent = 0;
    let dAnimating = false;

    // initialize panels
    dPanels.forEach((panel, i) => {
      if (i === dCurrent) {
        panel.setAttribute("aria-hidden", "false");
        panel.tabIndex = 0;
      } else {
        panel.setAttribute("aria-hidden", "true");
        panel.tabIndex = -1;
      }
    });

    const setDesignTrackPosition = (idx) => {
      const panelPercent = 100 / dPanels.length;
      dTrack.style.transform = `translateX(-${idx * panelPercent}%)`;
    };

    // initial
    setDesignTrackPosition(dCurrent);

    function updateDesignTabs(idx) {
      if (dAnimating || idx === dCurrent || idx < 0 || idx >= dTabs.length)
        return;
      dAnimating = true;

      dTabs.forEach((t, i) => {
        const isActive = i === idx;
        t.classList.toggle("active", isActive);
        t.setAttribute("aria-selected", isActive ? "true" : "false");
        t.tabIndex = isActive ? 0 : -1;
      });

      dPanels.forEach((panel, i) => {
        const visible = i === idx;
        panel.setAttribute("aria-hidden", visible ? "false" : "true");
        panel.tabIndex = visible ? 0 : -1;
      });

      setDesignTrackPosition(idx);
      dCurrent = idx;

      const onEnd = () => {
        dAnimating = false;
        dTrack.removeEventListener("transitionend", onEnd);
      };
      dTrack.addEventListener("transitionend", onEnd);
    }

    dTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const idx = Number(tab.getAttribute("data-index"));
        updateDesignTabs(idx);
      });
      tab.addEventListener("keydown", (e) => {
        if (e.key === "ArrowRight") {
          e.preventDefault();
          const next = (dCurrent + 1) % dTabs.length;
          updateDesignTabs(next);
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          const prev = (dCurrent - 1 + dTabs.length) % dTabs.length;
          updateDesignTabs(prev);
        }
      });
    });

    // responsive: keep percentage-based translate correct
    window.addEventListener("resize", () => {
      dTrack.style.transition = "none";
      setDesignTrackPosition(dCurrent);
      // force reflow then restore transition
      // eslint-disable-next-line no-unused-expressions
      dTrack.offsetHeight;
      dTrack.style.transition = "";
    });
  })();

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

  // ---------- Project GEH: navigate to project-geh.html ----------
  try {
    const gehBtn = document.getElementById("btn-geh");
    if (gehBtn) {
      gehBtn.addEventListener("click", (e) => {
        // Use same-origin navigation to the project page
        window.location.href = "project-geh.html";
      });
    }
  } catch (err) {
    // silent fail; non-critical
  }

  // ---------- Project EDU: navigate to project-edu.html ----------
  try {
    // specifically target the project link inside the #projects section
    const eduAnchor = document.querySelector(
      '#projects a[href="project-edu.html"]'
    );
    if (eduAnchor) {
      const eduArticle = eduAnchor.closest("article");
      const eduBtn = eduArticle
        ? eduArticle.querySelector(".btn-primary")
        : null;
      if (eduBtn) {
        // ensure explicit button behaviour and avoid accidental form submit
        eduBtn.setAttribute("type", "button");
        // dev hint: log once so it's easy to confirm in browser devtools
        console.info("project-edu button wired");
        eduBtn.addEventListener("click", (e) => {
          // same-origin navigation to the project page
          window.location.href = "project-edu.html";
        });
      }
    }
  } catch (err) {
    // silent fail; progressive enhancement
  }

  // ---------- Project EUROPE: navigate to project-europe.html ----------
  try {
    const europeBtn = document.getElementById("btn-europe");
    if (europeBtn) {
      europeBtn.addEventListener("click", (e) => {
        window.location.href = "project-europe.html";
      });
    }
  } catch (err) {
    // silent fail; non-critical
  }

  // ---------- Project GEH: open live site from hero button ----------
  try {
    const liveBtn = document.querySelector(".hero-geh .btn-primary");
    if (liveBtn) {
      liveBtn.setAttribute("type", "button");
      liveBtn.addEventListener("click", (e) => {
        window.open("https://www.globaleducationhub.com", "_blank", "noopener");
      });
    }
  } catch (err) {
    // silent fail; non-critical
  }

  // ---------- Project GEH: open live site from #geh-live button ----------
  try {
    const gehLiveBtn = document.getElementById("geh-live");
    if (gehLiveBtn) {
      // explicit button behaviour to avoid accidental form submit
      gehLiveBtn.setAttribute("type", "button");
      gehLiveBtn.addEventListener("click", (e) => {
        // Open the external site in a new tab safely
        window.open(
          "https://globaleducationhub.com",
          "_blank",
          "noopener,noreferrer"
        );
      });
    }
  } catch (err) {
    // silent fail; non-critical
  }

  // ---------- Project EUROPE: open live site from #europe-live button ----------
  try {
    const europeLiveBtn = document.getElementById("europe-live");
    if (europeLiveBtn) {
      europeLiveBtn.setAttribute("type", "button");
      europeLiveBtn.addEventListener("click", (e) => {
        // open external site in new tab safely
        window.open(
          "https://globalstudyeurope.com",
          "_blank",
          "noopener,noreferrer"
        );
      });
    }
  } catch (err) {
    // silent fail; non-critical
  }

  // ---------- Hero: navigate to profile.html (View Profile) ----------
  try {
    const heroProfileBtn = document.querySelector("#btn-profile");
    if (heroProfileBtn) {
      // make behaviour explicit and avoid accidental form submit
      heroProfileBtn.setAttribute("type", "button");
      heroProfileBtn.addEventListener("click", (e) => {
        // same-origin navigation to profile page
        window.location.href = "profile.html";
      });
    }
  } catch (err) {
    // silent fail; non-critical progressive enhancement
  }

  // ---------- Profile: open CV PDF in a new tab ----------
  try {
    // target the Download CV button inside the #profile section
    const profileCvBtn = document.querySelector("#profile .btn-primary");
    if (profileCvBtn) {
      // ensure button behaviour is explicit
      profileCvBtn.setAttribute("type", "button");
      profileCvBtn.addEventListener("click", (e) => {
        // open the PDF in a new tab; rely on same-origin relative path
        window.open(
          "media/EAmrogowicz-CV-Web.pdf",
          "_blank",
          "noopener,noreferrer"
        );
      });
    }
  } catch (err) {
    // silent fail; non-critical progressive enhancement
  }

  // ---------- Tool icon labels: show on hover (CSS) and on tap/click for mobile ----------
  (function tooltipsForITools() {
    const tools = document.querySelectorAll(".i-tool[data-label]");
    if (!tools || !tools.length) return;

    let activeTool = null;
    const clearActive = () => {
      if (activeTool) {
        activeTool.classList.remove("is-active");
        activeTool = null;
      }
    };

    // Click/tap toggles tooltip
    tools.forEach((tool) => {
      tool.addEventListener("click", (e) => {
        // prevent this being treated as a focus-trigger only
        e.stopPropagation();
        // toggle
        if (tool === activeTool) {
          clearActive();
        } else {
          clearActive();
          tool.classList.add("is-active");
          activeTool = tool;
          // auto-hide after 2.5s
          setTimeout(() => {
            if (tool === activeTool) clearActive();
          }, 2500);
        }
      });

      // keyboard support: Enter or Space
      tool.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          tool.click();
        }
      });
    });

    // clicking anywhere else should dismiss
    document.addEventListener("click", (e) => {
      if (!e.target.closest || !e.target.closest(".i-tool")) {
        clearActive();
      }
    });

    // also clear on Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") clearActive();
    });
  })();
});
