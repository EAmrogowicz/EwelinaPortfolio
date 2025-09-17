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

    // initialize: ensure all panels are stacked (visible) so we can translate the track
    pPanels.forEach((panel) => {
      panel.style.display = "grid";
    });

    // Use percentage-based sliding so CSS-defined track/panel heights work reliably
    const panelCount = pPanels.length;
    const panelPercent = 100 / panelCount;

    const setProjectTrack = (idx) => {
      if (!pTrack) return;
      pTrack.style.transform = `translateY(-${idx * panelPercent}%)`;
    };

    // initial
    const initProject = () => {
      // make track and panels sized by percentage so they fill the carousel
      if (pTrack) pTrack.style.height = `${panelCount * 100}%`;
      pPanels.forEach((panel) => {
        panel.style.height = `${panelPercent}%`;
      });

      // mark active panel visually
      pPanels.forEach((panel, i) => {
        panel.classList.toggle("is-active", i === pCurrent);
        panel.style.pointerEvents = i === pCurrent ? "auto" : "none";
      });
      setProjectTrack(pCurrent);
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
        panel.style.pointerEvents = visible ? "auto" : "none";
      });

      setProjectTrack(idx);
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
      pTrack.style.transition = "none";
      setProjectTrack(pCurrent);
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
