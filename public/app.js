import { services } from "./services.js";
import { createServicePicker } from "./picker.js";

const brief = document.querySelector("#brief");
const picker = createServicePicker([...services.map((service) => service.title), "Другая задача"]);
const detail = document.querySelector("#detail");
const contact = document.querySelector("#contact-popup");
const groups = document.querySelector("#detail-groups");
const serviceList = document.querySelector("#service-list");
const formHome = brief.parentElement;
const draft = document.querySelector("#draft");
let current;
let emailText = "";

function showService(service) {
  if (detail.open || contact.open) return;
  current = service;
  document.querySelector("#detail-title").textContent = service.heading;
  document.querySelector("#detail-text").textContent = service.intro;
  groups.replaceChildren();
  for (const group of service.groups) {
    const section = document.createElement("section");
    const title = document.createElement("h3");
    title.textContent = group.title;
    const ul = document.createElement("ul");
    for (const item of group.items) {
      const li = document.createElement("li");
      li.textContent = item;
      ul.append(li);
    }
    section.append(title, ul);
    groups.append(section);
  }
  detail.showModal();
}
for (const service of services) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "service";
  button.setAttribute("aria-haspopup", "dialog");
  button.setAttribute("aria-controls", "detail");
  button.innerHTML = '<span class="service-label"><strong class="service-title"></strong><span class="more">подробнее <span aria-hidden="true">↗</span></span></span><img loading="lazy" alt="">';
  button.querySelector("strong").textContent = service.title;
  const image = button.querySelector("img");
  const thumbnail = "assets/home/" + service.slug;
  const original = "assets/" + service.slug + ".webp";
  image.width = service.imageWidth;
  image.height = service.imageHeight;
  image.decoding = "async";
  // On narrow cards the cover crop is sized by its height.
  const ratio = service.imageWidth / service.imageHeight;
  const mobileSize = service.slug === "print" ? "max(79px, 25.2vw)" :
    `clamp(${Math.ceil(100 * ratio)}px, ${(23 * ratio).toFixed(2)}vw, ${Math.ceil(135 * ratio)}px)`;
  image.sizes = "(max-width: 680px) " + mobileSize + ", 130px";
  image.srcset = thumbnail + "-160.webp 160w, " + thumbnail + "-320.webp 320w, " + original + " " + service.imageWidth + "w";
  image.src = original;
  button.addEventListener("click", () => showService(service));
  serviceList.append(button);
}
function showContact() {
  if (contact.open) return;
  document.querySelector("#popup-form").append(brief);
  contact.showModal();
}
document.querySelectorAll("[data-open-contact]").forEach((link) => {
  link.addEventListener("click", (event) => { event.preventDefault(); showContact() });
});
document.querySelector("#detail-contact").addEventListener("click", (event) => {
  event.preventDefault();
  picker.select(current.title);
  detail.close();
  showContact();
});
contact.addEventListener("close", async () => {
  if (contact.open) return;
  picker.close();
  const exit = contact.getAnimations().find((animation) => animation.transitionProperty === "display");
  if (exit) {
    await exit.finished.catch(() => {});
    if (contact.open) return;
  }
  formHome.insertBefore(brief, formHome.querySelector(".goose"));
});
for (const dialog of [detail, contact]) {
  dialog.addEventListener("click", (event) => {
    const r = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom)) dialog.close();
  });
}

brief.addEventListener("input", () => { draft.hidden = true });
brief.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!picker.validate()) return;
  const data = new FormData(brief);
  const fields = [["Направление", "service"], ["Имя", "name"], ["Телефон", "phone"], ["Почта", "email"], ["Задача", "message"]];
  emailText = fields.filter(([, key]) => data.get(key)).map(([label, key]) => label + ": " + data.get(key)).join("\n");
  const subject = "Задача для sense.studio — " + data.get("service");
  document.querySelector("#open-email").href = "mailto:sense.studio@yandex.ru?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(emailText);
  document.querySelector("#copy-email").textContent = "скопировать текст";
  draft.hidden = false;
});
document.querySelector("#copy-email").addEventListener("click", async (event) => {
  const button = event.currentTarget;
  try { await navigator.clipboard.writeText(emailText); button.textContent = "текст скопирован" }
  catch { window.prompt("Скопируйте текст письма", emailText) }
});
if (new URLSearchParams(location.search).get("brief") === "1") showContact();

// Older browsers use the same reveal keyframes with a scroll-controlled delay.
if (!CSS.supports("(animation-timeline: --statement) and (animation-range: cover 6% cover 26%)")) {
  const intro = document.querySelector(".introduction");
  const motion = matchMedia("(prefers-reduced-motion: no-preference)");
  let frame = 0;
  let previousProgress;

  function updateStatement() {
    frame = 0;
    const bounds = intro.getBoundingClientRect();
    const viewport = document.documentElement.clientHeight;
    const progress = Math.max(0, Math.min(1, (viewport - bounds.top) / (viewport + bounds.height)));
    if (progress === previousProgress) return;
    previousProgress = progress;
    intro.style.setProperty("--scroll", progress);
  }
  function scheduleStatement() {
    if (!frame) frame = requestAnimationFrame(updateStatement);
  }
  function trackStatement(active) {
    if (active) {
      document.addEventListener("scroll", scheduleStatement, { passive: true });
      window.addEventListener("resize", scheduleStatement);
    } else {
      document.removeEventListener("scroll", scheduleStatement);
      window.removeEventListener("resize", scheduleStatement);
      cancelAnimationFrame(frame);
      frame = 0;
    }
  }
  const visibility = "IntersectionObserver" in window
    ? new IntersectionObserver((entries) => {
        if (!motion.matches) return;
        trackStatement(entries[entries.length - 1].isIntersecting);
        scheduleStatement();
      }, { rootMargin: "64px 0px" })
    : null;
  function syncMotion() {
    intro.classList.toggle("scroll-fallback", motion.matches);
    trackStatement(motion.matches && !visibility);
    if (motion.matches) {
      updateStatement();
      visibility?.observe(intro);
    } else {
      visibility?.disconnect();
    }
  }
  syncMotion();
  window.addEventListener("pageshow", syncMotion);
  motion.addEventListener("change", syncMotion);
}
