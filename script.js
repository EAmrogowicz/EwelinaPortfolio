/* script.js */
document.addEventListener("DOMContentLoaded", () => {
  // Simple fade-in animation for hero text
  const heroHeading = document.querySelector(".hero h1");
  if (heroHeading) {
    heroHeading.style.opacity = 0;
    heroHeading.style.transform = "translateY(20px)";
    setTimeout(() => {
      heroHeading.style.transition = "all 0.8s ease";
      heroHeading.style.opacity = 1;
      heroHeading.style.transform = "translateY(0)";
    }, 300);
  }

  // Scroll reveal for project cards
  const cards = document.querySelectorAll(".project-card");
  const revealOnScroll = () => {
    cards.forEach((card) => {
      const rect = card.getBoundingClientRect();
      if (rect.top < window.innerHeight - 100) {
        card.classList.add("visible");
      }
    });
  };

  window.addEventListener("scroll", revealOnScroll);
  revealOnScroll();
});
