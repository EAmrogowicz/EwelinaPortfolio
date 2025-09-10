document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.querySelector(".menu-toggle");
  const mobileMenu = document.querySelector(".mobile-menu");
  let isMenuOpen = false;

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

  // Close menu when clicking on a link
  const mobileMenuLinks = document.querySelectorAll(".mobile-menu a");
  mobileMenuLinks.forEach((link) => {
    link.addEventListener("click", () => {
      toggleMenu();
    });
  });

  // Toggle menu function
  function toggleMenu() {
    isMenuOpen = !isMenuOpen;
    mobileMenu.classList.toggle("active");
    menuToggle.classList.toggle("active");

    // Change menu icon
    const menuIcon = menuToggle.querySelector("i");
    menuIcon.classList.toggle("fa-bars");
    menuIcon.classList.toggle("fa-times");

    // Prevent body scroll when menu is open
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
  }
});

// Design thinking tab/carousel behavior
document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll(".design-tabs .tab");
  const track = document.querySelector(".design-tabs .carousel-track");
  const panels = document.querySelectorAll(".design-tabs .panel");
  let current = 0;
  let isAnimating = false;

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
  const panelPercent = 100 / panels.length;
  track.style.transform = `translateX(-${current * panelPercent}%)`;

  // initialize video / fallback visibility
  panels.forEach((panel) => {
    const video = panel.querySelector("video");
    const fallback = panel.querySelector(".video-fallback");
    if (video) {
      // hide fallback if video exists; video will be shown/played when active
      if (fallback) fallback.style.display = "none";
      video.style.display = "none"; // only show when active or when autoplay succeeds
    } else {
      // if there's no video, ensure fallback (if present) is visible
      if (fallback) fallback.style.display = "block";
    }
  });
  // Optional: set this to your server proxy endpoint if you want the
  // page to request the file through a small server-side proxy that
  // streams the Drive file with correct headers. Leave null to skip.
  // Example: const PROXY_URL = 'https://yourdomain.com/drive-proxy';
  const PROXY_URL = null;

  // Helper: try to determine whether a remote URL serves raw video
  // (returns true), serves HTML (Drive confirmation page => false),
  // or is undetermined (null). Uses HEAD then falls back to a tiny
  // ranged GET. Network/CORS errors return null.
  async function isUrlStreamable(url) {
    try {
      // First try a HEAD request
      const head = await fetch(url, { method: "HEAD", mode: "cors" });
      const ctype = head.headers.get("content-type");
      if (ctype) {
        if (ctype.indexOf("video") === 0) return true;
        if (ctype.indexOf("text/html") === 0) return false;
      }
    } catch (e) {
      // HEAD may be blocked by CORS; fall through to ranged GET
    }

    try {
      // Try a small ranged GET to inspect response headers/body
      const resp = await fetch(url, {
        method: "GET",
        headers: { Range: "bytes=0-1023" },
        mode: "cors",
      });
      const ctype2 = resp.headers.get("content-type");
      if (ctype2) {
        if (ctype2.indexOf("video") === 0) return true;
        if (ctype2.indexOf("text/html") === 0) return false;
      }
      // If we got an OK response but no clear content-type, try to
      // inspect the first bytes for an HTML tag as a last resort.
      const txt = await resp.text();
      if (txt && txt.trim().startsWith("<")) return false; // likely HTML
      // otherwise unknown but leaning towards streamable
      return true;
    } catch (e) {
      // Could not determine due to CORS/network; return null so caller
      // can surface the generic overlay flow.
      return null;
    }
  }

  // attempt autoplay for the currently visible panel if it contains a video
  (async function tryAutoplayCurrent() {
    const currentVideo = panels[current].querySelector("video");
    const currentFallback = panels[current].querySelector(".video-fallback");
    const currentOverlay = panels[current].querySelector(".video-play-overlay");
    if (!currentVideo) return;

    currentVideo.muted = true;
    currentVideo.style.display = "block";
    if (currentFallback) currentFallback.style.display = "none";

    try {
      await currentVideo.play();
      // autoplay succeeded
      if (currentOverlay) currentOverlay.style.display = "none";
    } catch (err) {
      // autoplay failed: check whether the remote URL is streamable
      const src = currentVideo.getAttribute("src") || currentVideo.currentSrc;
      let streamable = null;
      if (src) streamable = await isUrlStreamable(src);

      if (streamable === false) {
        // Drive likely showing a confirmation/html page — show fallback
        if (currentFallback) currentFallback.style.display = "block";
        currentVideo.style.display = "none";
        if (currentOverlay) {
          // clicking overlay will open Drive view (user can download there)
          currentOverlay.dataset.driveView =
            getDriveViewUrlFromVideo(currentVideo);
          currentOverlay.style.display = "block";
        }
      } else {
        // streamable === true or unknown (null) — most likely autoplay
        // blocked by browser policy. Show overlay to let user initiate play.
        if (currentOverlay) currentOverlay.style.display = "block";
        if (currentFallback) currentFallback.style.display = "none";
      }
    }
  })();

  // Use IntersectionObserver to autoplay video only when Development panel (panel-2) is scrolled into view
  const devPanel = document.getElementById("panel-2");
  if (devPanel) {
    const devVideo = devPanel.querySelector("video");
    const devFallback = devPanel.querySelector(".video-fallback");
    const devOverlay = devPanel.querySelector(".video-play-overlay");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // panel-2 visible in viewport — if it's the active panel, try autoplay
            if (current === 2 && devVideo) {
              // attempt autoplay with improved fallback handling
              (async () => {
                devVideo.muted = true;
                devVideo.style.display = "block";
                if (devFallback) devFallback.style.display = "none";
                try {
                  await devVideo.play();
                  if (devOverlay) devOverlay.style.display = "none";
                } catch (e) {
                  // play() rejected — determine cause
                  const src =
                    devVideo.getAttribute("src") || devVideo.currentSrc;
                  const streamable = src ? await isUrlStreamable(src) : null;
                  if (streamable === false) {
                    // Drive confirmation / HTML — show fallback and provide link
                    if (devFallback) devFallback.style.display = "block";
                    devVideo.style.display = "none";
                    if (devOverlay) {
                      devOverlay.dataset.driveView =
                        getDriveViewUrlFromVideo(devVideo);
                      devOverlay.style.display = "block";
                    }
                  } else {
                    // autoplay blocked by policy — show overlay for manual play
                    if (devOverlay) devOverlay.style.display = "block";
                    if (devFallback) devFallback.style.display = "none";
                  }
                }
              })();
            }
          } else {
            // panel scrolled out — pause video if playing
            if (devVideo && !devVideo.paused) {
              try {
                devVideo.pause();
              } catch (e) {}
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(devPanel);

    // overlay click: either attempt to play, or open Drive view when
    // we previously detected a confirmation page.
    if (devOverlay) {
      devOverlay.addEventListener("click", async () => {
        const driveView = devOverlay.dataset.driveView;
        if (driveView) {
          window.open(driveView, "_blank", "noopener noreferrer");
          return;
        }

        if (!devVideo) return;

        // If a proxy is configured, try to use it to serve the file.
        if (PROXY_URL) {
          const id = devVideo.dataset.driveId;
          if (id) {
            devVideo.src = `${PROXY_URL}?id=${encodeURIComponent(id)}`;
          }
        }

        // show the video element over the fallback and attempt to play
        try {
          devVideo.style.display = "block";
          // unmute because this is user-initiated
          devVideo.muted = false;
          if (devFallback) devFallback.style.display = "none";
          await devVideo.play();
          // success: hide overlay
          devOverlay.style.display = "none";
        } catch (e) {
          // playback still failed — revert to fallback and offer Drive view
          if (devFallback) devFallback.style.display = "block";
          devVideo.style.display = "none";
          const view = getDriveViewUrlFromVideo(devVideo);
          if (view) window.open(view, "_blank", "noopener noreferrer");
        }
      });
    }
  }

  // Helper: construct a Drive view URL from a video element's data-drive-id
  function getDriveViewUrlFromVideo(videoEl) {
    if (!videoEl) return null;
    const id = videoEl.dataset.driveId || videoEl.getAttribute("data-drive-id");
    if (!id) return null;
    return `https://drive.google.com/file/d/${id}/view?usp=sharing`;
  }

  function updateTabs(newIndex) {
    if (newIndex === current || isAnimating) return;
    isAnimating = true;

    // update active tab attributes
    tabs[current].classList.remove("active");
    tabs[current].setAttribute("aria-selected", "false");
    tabs[newIndex].classList.add("active");
    tabs[newIndex].setAttribute("aria-selected", "true");

    // update panels' aria-hidden and tabindex
    panels[current].setAttribute("aria-hidden", "true");
    panels[current].tabIndex = -1;
    panels[newIndex].setAttribute("aria-hidden", "false");
    panels[newIndex].tabIndex = 0;

    // handle video autoplay/pause and fallback image visibility
    const prevVideo = panels[current].querySelector("video");
    const prevFallback = panels[current].querySelector(".video-fallback");
    const nextVideo = panels[newIndex].querySelector("video");
    const nextFallback = panels[newIndex].querySelector(".video-fallback");

    // pause previous video's playback if present
    if (prevVideo && !prevVideo.paused) {
      try {
        prevVideo.pause();
      } catch (e) {
        // ignore
      }
    }
    // hide previous fallback (we'll show fallback only when needed)
    if (prevFallback) prevFallback.style.display = "none";

    // try to autoplay next video if present
    if (nextVideo) {
      // ensure video is muted (autoplay rules)
      nextVideo.muted = true;
      // show video element, hide fallback by default
      nextVideo.style.display = "block";
      if (nextFallback) nextFallback.style.display = "none";

      const playPromise = nextVideo.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // autoplay succeeded
          })
          .catch((err) => {
            // autoplay failed (browser policy or missing file) - show fallback
            if (nextFallback) nextFallback.style.display = "block";
            nextVideo.style.display = "none";
          });
      }
    } else {
      // no video - ensure fallback is visible
      if (nextFallback) nextFallback.style.display = "block";
    }

    // slide track by translateX using panel percent
    const offset = newIndex * panelPercent;
    track.style.transform = `translateX(-${offset}%)`;

    const onEnd = () => {
      isAnimating = false;
      track.removeEventListener("transitionend", onEnd);
    };
    track.addEventListener("transitionend", onEnd);

    // move focus to the selected tab for keyboard users
    tabs[newIndex].focus();

    current = newIndex;
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", (e) => {
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
    // use the same percent per panel as initialization so alignment stays correct
    const panelPercent = 100 / panels.length;
    track.style.transform = `translateX(-${current * panelPercent}%)`;
    // force reflow then restore transition
    // eslint-disable-next-line no-unused-expressions
    track.offsetHeight;
    track.style.transition = "";
  });
});

// Attach mailto behaviour to CTA button without changing markup
document.addEventListener("DOMContentLoaded", () => {
  try {
    const ctaButton = document.querySelector("#cta .btn-primary");
    if (!ctaButton) return;

    ctaButton.addEventListener("click", (e) => {
      // preserve any default behaviour for forms etc. (there are none)
      // Open user's mail client with prefilled recipient
      window.location.href = "mailto:ewelina@amrogowicz.com";
    });
  } catch (err) {
    // fail silently; this feature is progressive enhancement
    // console.error(err);
  }
});
