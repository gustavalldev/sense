export function createServicePicker(titles) {
  const picker = document.querySelector("#picker");
  const trigger = document.querySelector("#picker-trigger");
  const list = document.querySelector("#service-options");
  const field = document.querySelector("#service");
  const value = document.querySelector("#picker-value");
  const error = document.querySelector("#service-error");
  let active = 0;
  let typed = "";
  let typedAt = 0;

  const options = titles.map((title, index) => {
    const option = document.createElement("li");
    option.id = "service-option-" + index;
    option.setAttribute("role", "option");
    option.setAttribute("aria-selected", "false");
    option.textContent = title;
    option.addEventListener("pointermove", () => highlight(index));
    option.addEventListener("pointerdown", (event) => event.preventDefault());
    option.addEventListener("click", () => select(title));
    list.append(option);
    return option;
  });

  function highlight(index) {
    active = (index + titles.length) % titles.length;
    for (const [i, option] of options.entries()) option.classList.toggle("active", i === active);
    trigger.setAttribute("aria-activedescendant", options[active].id);
  }
  function toggle(open) {
    list.inert = !open;
    list.hidden = !open;
    picker.classList.toggle("open", open);
    trigger.setAttribute("aria-expanded", String(open));
    if (open) highlight(Math.max(titles.indexOf(field.value), 0));
    else trigger.removeAttribute("aria-activedescendant");
  }
  function select(title) {
    field.value = title;
    value.textContent = title;
    error.hidden = true;
    trigger.removeAttribute("aria-invalid");
    options.forEach((option, i) => option.setAttribute("aria-selected", String(titles[i] === title)));
    field.dispatchEvent(new Event("input", { bubbles: true }));
    toggle(false);
  }

  trigger.addEventListener("click", () => toggle(list.hidden));
  trigger.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !list.hidden) {
      event.preventDefault();
      event.stopPropagation();
      toggle(false);
      return;
    }
    if (event.key === "Tab") { toggle(false); return }
    if (["Enter", " "].includes(event.key)) {
      event.preventDefault();
      if (list.hidden) toggle(true);
      else select(titles[active]);
      return;
    }
    if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
      event.preventDefault();
      if (list.hidden) toggle(true);
      else if (event.key === "ArrowDown") highlight(active + 1);
      else if (event.key === "ArrowUp") highlight(active - 1);
      if (event.key === "Home") highlight(0);
      if (event.key === "End") highlight(titles.length - 1);
    } else if (event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
      if (list.hidden) toggle(true);
      const now = Date.now();
      typed = (now - typedAt < 700 ? typed : "") + event.key.toLocaleLowerCase("ru");
      typedAt = now;
      const index = titles.findIndex((title) => title.toLocaleLowerCase("ru").startsWith(typed));
      if (index >= 0) highlight(index);
    } else return;
    options[active].scrollIntoView({ block: "nearest" });
  });
  document.addEventListener("pointerdown", (event) => {
    if (!list.hidden && !picker.contains(event.target)) toggle(false);
  });
  function validate() {
    if (field.value) return true;
    error.hidden = false;
    trigger.setAttribute("aria-invalid", "true");
    trigger.setAttribute("aria-describedby", "service-error");
    trigger.focus();
    toggle(true);
    return false;
  }
  return { select, validate, close: () => toggle(false) };
}
