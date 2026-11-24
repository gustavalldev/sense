const header = document.querySelector(".case-header");
const hero = document.querySelector(".case-hero");
let heroObserver;

// Switch the background when the cover passes the lower edge of the fixed menu.
new ResizeObserver(() => {
  const headerHeight = Math.round(header.getBoundingClientRect().height);
  heroObserver?.disconnect();
  heroObserver = new IntersectionObserver(([entry]) => {
    header.classList.toggle("is-solid", !entry.isIntersecting && entry.boundingClientRect.top < 0);
  }, { rootMargin: `-${headerHeight}px 0px 0px` });
  heroObserver.observe(hero);
}).observe(header);

const carousel = document.querySelector(".carousel");
if (carousel) {
  const positions = ["center", "right", "left"];
  const slides = positions.map((position) => carousel.querySelector("." + position));
  const brand = document.querySelector(".brand-tab").alt;
  const status = carousel.querySelector("[aria-live]");
  let current = 0;
  let touchStart;
  function turn(direction) {
    const previous = current;
    current = (current + direction + slides.length) % slides.length;
    for (const [index, slide] of slides.entries()) {
      const position = positions[(index - current + slides.length) % slides.length];
      slide.classList.remove(...positions);
      slide.classList.add(position);
      slide.classList.toggle("outgoing", index === previous);
      slide.alt = index === current ? brand + " — вариант " + (index + 1) + " из " + slides.length : "";
    }
    status.textContent = slides[current].alt;
  }
  carousel.querySelector(".prev").addEventListener("click", () => turn(-1));
  carousel.querySelector(".next").addEventListener("click", () => turn(1));
  carousel.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
    event.preventDefault();
    turn(event.key === "ArrowRight" ? 1 : -1);
  });
  carousel.addEventListener("touchstart", (event) => {
    touchStart = event.changedTouches[0];
  }, { passive: true });
  carousel.addEventListener("touchend", (event) => {
    if (!touchStart) return;
    const end = event.changedTouches[0];
    const dx = end.clientX - touchStart.clientX;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(end.clientY - touchStart.clientY)) turn(dx < 0 ? 1 : -1);
    touchStart = null;
  }, { passive: true });
}
const viewer = document.querySelector("#zoom");
document.querySelector("[data-zoom]").addEventListener("click", (event) => {
  if (event.ctrlKey || event.metaKey || event.shiftKey) return;
  event.preventDefault();
  viewer.querySelector("img").src = event.currentTarget.href;
  viewer.showModal();
});
viewer.addEventListener("click", (event) => {
  if (event.target === viewer) viewer.close();
});
