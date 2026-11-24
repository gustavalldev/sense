const compact = window.matchMedia("(max-width: 680px)");
const people = [...document.querySelectorAll(".person")];
function setLayout() {
  for (const person of people) person.open = !compact.matches;
}
setLayout();
compact.addEventListener("change", setLayout);
for (const person of people) {
  person.querySelector("summary").addEventListener("click", (event) => {
    if (!compact.matches) event.preventDefault();
  });
}
