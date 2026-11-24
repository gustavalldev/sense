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
    const arriving = entries.filter(entry => entry.isIntersecting);
    if (!arriving.length) return;
    for (const entry of arriving) observer.unobserve(entry.target);

    // Sample one frame on entry. A fast swipe should show the content immediately.
    const scrollStart = window.scrollY;
    const timeStart = performance.now();
    requestAnimationFrame(() => {
      const fast = Math.abs(window.scrollY - scrollStart) > 1.4 * Math.max(8, performance.now() - timeStart);
      for (const { target, boundingClientRect, rootBounds } of arriving) {
        const nearEdge = rootBounds && boundingClientRect.top >= rootBounds.bottom - 80;
        const animate = motion.matches && !fast && nearEdge &&
          !target.closest("dialog") && !target.matches(":focus-within");
        if (animate) target.classList.replace("reveal-pending", "reveal-enter");
        else target.classList.remove("reveal-pending");
      }
    });
  }, { rootMargin: "0px 0px 24px" });

  // Read positions before writing styles. Visible and restored content stays put.
  const viewport = document.documentElement.clientHeight;
  const upcoming = [...document.querySelectorAll(blocks)].filter(block => block.getBoundingClientRect().top >= viewport);
  for (const block of upcoming) {
    block.classList.add("reveal-pending");
    observer.observe(block);
  }
}

if (document.readyState === "complete") revealOnScroll();
else document.addEventListener("DOMContentLoaded", revealOnScroll, { once: true });
