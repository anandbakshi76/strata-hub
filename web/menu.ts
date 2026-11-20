// On phones the section links fold into a Menu button (DESIGN.md 5). Without JavaScript the
// links stay visible, because the folding CSS only applies under the .js class.

export function setUpMenu(button: HTMLButtonElement, links: HTMLElement): void {
  const set = (open: boolean) => {
    button.setAttribute("aria-expanded", String(open));
    links.classList.toggle("open", open);
  };
  button.addEventListener("click", () => set(button.getAttribute("aria-expanded") !== "true"));
  links.addEventListener("click", (event) => {
    if ((event.target as HTMLElement).closest("a")) set(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && button.getAttribute("aria-expanded") === "true") {
      set(false);
      button.focus();
    }
  });
}
