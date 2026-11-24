// Each block enters once. The existing headline keeps its own scroll timeline.
const blocks = [
  ".section-head", ".service", "#projects-title", ".project", ".all-projects", ".partners",
  ".contact-inner > h2", ".contact-inner > form", ".goose", "footer .wrap > *",
  ".about-title", ".about-sub", ".about-intro", ".story > h2", ".story-cols > *",
  ".today .wrap", ".team-section > h2", ".person", ".approach > h2", ".approach > p",
  ".case-intro", ".carousel", ".full-art > picture", ".case-board", ".case-work",
  ".case-links", ".privacy > h1", ".privacy > section"
].join(", ");

function revealOnScroll() {
  const motion = matchMedia("(prefers-reduced-motion: no-preference)");
  if (!("IntersectionObserver" in window)) return;

  function finishEntrance(event) {
    if (event.animationName === "block-enter") event.target.classList.remove("reveal-enter");
  }
  document.addEventListener("animationend", finishEntrance);
  document.addEventListener("animationcancel", finishEntrance);

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      observer.unobserve(entry.target);
      if (motion.matches && !entry.target.closest("dialog") && !entry.target.matches(":focus-within")) {
        entry.target.classList.add("reveal-enter");
      }
    }
  });
  document.querySelectorAll(blocks).forEach((block) => observer.observe(block));
}

if (document.readyState === "complete") revealOnScroll();
else document.addEventListener("DOMContentLoaded", revealOnScroll, { once: true });
