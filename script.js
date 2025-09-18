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

  // ---------- Project tabs (vertical, independent) ----------
  (function initProjectTabs() {
    const pTabs = document.querySelectorAll(".project-tabs .tab");
    const pTrack = document.querySelector(".project-tabs .carousel-track");
    const pPanels = document.querySelectorAll(".project-tabs .panel");
    if (!pTabs.length || !pPanels.length || !pTrack) return;

    let pCurrent = 0;
    let pAnimating = false;
    // Use percentage-based sliding on desktop, but switch to native scrolling on small screens
    const panelCount = pPanels.length;
    const panelPercent = 100 / panelCount;

    const isMobileView = () => window.matchMedia("(max-width: 768px)").matches;

    const setProjectTrack = (idx, userTriggered = false) => {
      if (!pTrack) return;
      if (isMobileView()) {
        // on mobile, scroll the page so the target panel is visible below the sticky header
        // NOTE: avoid auto-scrolling on initial page load. Only scroll when the
        // user has triggered navigation (tab click) or when the URL hash
        // explicitly targets the panel (deep link).
        const target = pPanels[idx];
        if (target) {
          const hashMatches = window.location.hash === `#${target.id}`;
          if (userTriggered || hashMatches) {
            scrollToPanel(target);
          }
        }
      } else {
        // desktop: percentage translateY sliding
        pTrack.style.transform = `translateY(-${idx * panelPercent}%)`;
      }
    };

    // Scroll helper that accounts for a sticky header height
    const scrollToPanel = (panel) => {
      if (!panel) return;
      const header = document.querySelector("header");
      const headerHeight = header ? header.getBoundingClientRect().height : 0;
      const gap = 12; // small gap between header and panel
      const rect = panel.getBoundingClientRect();
      const top = rect.top + window.scrollY - headerHeight - gap;
      window.scrollTo({ top, behavior: "smooth" });
    };

    // initial
    // IntersectionObserver to watch panels in mobile stacked flow
    let observer = null;

    const createObserver = () => {
      if (observer) observer.disconnect();
      // observe panels relative to the viewport (root: null)
      const options = {
        root: null,
        rootMargin: "0px 0px -30% 0px", // consider panel active when majority visible
        threshold: [0.25, 0.5, 0.75],
      };

      observer = new IntersectionObserver((entries) => {
        // pick the most visible panel among entries
        const visible = entries.filter((e) => e.isIntersecting);
        if (!visible.length) return;
        visible.sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const topEntry = visible[0];
        const panel = topEntry.target;
        const idx = Array.prototype.indexOf.call(pPanels, panel);
        if (idx >= 0 && idx !== pCurrent) {
          pTabs.forEach((t, i) => {
            const isActive = i === idx;
            t.classList.toggle("active", isActive);
            t.setAttribute("aria-selected", isActive ? "true" : "false");
            t.tabIndex = isActive ? 0 : -1;
          });
          pPanels.forEach((pl, i) => {
            const isAct = i === idx;
            pl.classList.toggle("is-active", isAct);
            pl.setAttribute("aria-hidden", isAct ? "false" : "true");
            pl.tabIndex = isAct ? 0 : -1;
          });
          pCurrent = idx;
        }
      }, options);

      pPanels.forEach((panel) => observer.observe(panel));
    };

    const initProject = () => {
      const mobile = isMobileView();

      if (mobile) {
        // stacked panels, allow native scrolling inside the track
        // clear any desktop-imposed heights/transforms so panels flow
        pTrack.style.height = "";
        pTrack.style.transform = "";
        pTrack.style.overflowY = "auto";
        pTrack.style.webkitOverflowScrolling = "touch";
        pPanels.forEach((panel) => {
          panel.style.display = "block";
          panel.style.height = "auto";
          panel.style.pointerEvents = "auto";
          panel.style.opacity = 1;
          panel.style.position = "relative";
        });

        // use IntersectionObserver to track active panel
        createObserver();

        // ensure left rail tabs sit below the sticky header (avoid being covered)
        const setTabsOffset = () => {
          const header = document.querySelector("header");
          const headerHeight = header
            ? header.getBoundingClientRect().height
            : 0;
          const extraGap = 4; // small breathing room
          const tabsEls = document.querySelectorAll(".project-tabs .tabs");
          tabsEls.forEach((el) => {
            el.style.top = `${headerHeight + extraGap}px`;
          });
        };
        setTabsOffset();
      } else {
        // desktop behaviour: set track height and percentage-based panel heights
        if (observer) {
          observer.disconnect();
          observer = null;
        }
        pTrack.style.overflowY = "hidden";
        pTrack.style.height = `${panelCount * 100}%`;
        pPanels.forEach((panel) => {
          panel.style.display = "grid";
          panel.style.height = `${panelPercent}%`;
          panel.style.pointerEvents = "none";
          panel.style.position = "";
        });

        // clear any inline 'top' applied for mobile so desktop layout resets cleanly
        const tabsEls = document.querySelectorAll(".project-tabs .tabs");
        tabsEls.forEach((el) => {
          el.style.top = "";
        });
      }

      // mark active panel visually and enable pointer events for it
      pPanels.forEach((panel, i) => {
        const active = i === pCurrent;
        panel.classList.toggle("is-active", active);
        panel.tabIndex = active ? 0 : -1;
        panel.style.pointerEvents = active ? "auto" : mobile ? "auto" : "none";
      });

      // position track to current panel (scroll on mobile, translate on desktop)
      // pass `false` to avoid forcing an initial scroll on mobile when the
      // user has just navigated to the page from elsewhere.
      setProjectTrack(pCurrent, false);
    };

    initProject();

    // re-init on load and when images inside panels load (to ensure sizes)
    window.addEventListener("load", () => {
      initProject();
    });
    pPanels.forEach((panel) => {
      const imgs = panel.querySelectorAll("img");
      imgs.forEach((img) => {
        img.addEventListener("load", () => {
          initProject();
        });
      });
    });

    function updateProjectTabs(idx) {
      if (pAnimating || idx === pCurrent || idx < 0 || idx >= pTabs.length)
        return;
      pAnimating = true;

      pTabs.forEach((t, i) => {
        const isActive = i === idx;
        t.classList.toggle("active", isActive);
        t.setAttribute("aria-selected", isActive ? "true" : "false");
        t.tabIndex = isActive ? 0 : -1;
      });

      // update aria states and visual classes
      pPanels.forEach((panel, i) => {
        const visible = i === idx;
        panel.setAttribute("aria-hidden", visible ? "false" : "true");
        panel.tabIndex = visible ? 0 : -1;
        panel.classList.toggle("is-active", visible);
        // pointer events handled in initProject; ensure active panel is interactable
        panel.style.pointerEvents = visible
          ? "auto"
          : isMobileView()
          ? "auto"
          : "none";
      });

      // position track (will scroll on mobile or translate on desktop)
      // mark this as a user-triggered action so mobile will smoothly scroll.
      setProjectTrack(idx, true);
      pCurrent = idx;

      // clear animating after CSS transition duration
      setTimeout(() => {
        pAnimating = false;
      }, 650);
    }

    pTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const idx = Number(tab.getAttribute("data-index"));
        updateProjectTabs(idx);
      });
      tab.addEventListener("keydown", (e) => {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          const next = (pCurrent + 1) % pTabs.length;
          updateProjectTabs(next);
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          const prev = (pCurrent - 1 + pTabs.length) % pTabs.length;
          updateProjectTabs(prev);
        }
      });
    });

    window.addEventListener("resize", () => {
      // Reconfigure layout when crossing responsive breakpoints
      pTrack.style.transition = "none";
      initProject();
      // force reflow then restore transition
      // eslint-disable-next-line no-unused-expressions
      pTrack.offsetHeight;
      pTrack.style.transition = "";
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

  // ---------- Hero: navigate to profile.html (View Profile) ----------
  try {
    const heroProfileBtn = document.querySelector("#home .btn-primary");
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
