const picker = document.querySelector("[data-client-picker]");
const copyButton = document.querySelector("[data-copy-button]");
const commandOutput = document.querySelector("[data-command-output]");

if (picker && copyButton && commandOutput) {
  const trigger = picker.querySelector("[data-client-trigger]");
  const menu = picker.querySelector("[data-client-menu]");
  const searchInput = picker.querySelector("[data-client-search]");
  const labelOutput = picker.querySelector("[data-client-label]");
  const avatarOutput = picker.querySelector("[data-client-avatar]");
  const options = Array.from(picker.querySelectorAll(".client-option"));
  let resetLabelTimer = null;

  const closeMenu = () => {
    menu.hidden = true;
    trigger.setAttribute("aria-expanded", "false");
  };

  const openMenu = () => {
    menu.hidden = false;
    trigger.setAttribute("aria-expanded", "true");
    searchInput.focus();
  };

  const setButtonIdleState = () => {
    copyButton.textContent = "Copy add command";
    copyButton.classList.remove("copied");
  };

  const setClient = (option) => {
    for (const item of options) {
      item.classList.toggle("is-active", item === option);
    }

    const label = option.dataset.label ?? "";
    const avatar = option.dataset.avatar ?? "";
    const command = option.dataset.command ?? "";

    labelOutput.textContent = label;
    avatarOutput.textContent = avatar;
    commandOutput.textContent = command;
    copyButton.dataset.copy = command;
    setButtonIdleState();
  };

  trigger.addEventListener("click", () => {
    if (menu.hidden) {
      openMenu();
      return;
    }

    closeMenu();
  });

  searchInput.addEventListener("input", () => {
    const term = searchInput.value.trim().toLowerCase();

    for (const option of options) {
      const haystack = [
        option.dataset.label,
        option.dataset.group,
        option.textContent
      ]
        .join(" ")
        .toLowerCase();

      option.hidden = term !== "" && !haystack.includes(term);
    }
  });

  for (const option of options) {
    option.addEventListener("click", () => {
      setClient(option);
      closeMenu();
    });
  }

  copyButton.addEventListener("click", async () => {
    const command = copyButton.dataset.copy ?? "";

    try {
      await navigator.clipboard.writeText(command);
      copyButton.textContent = "Copied";
      copyButton.classList.add("copied");
      window.clearTimeout(resetLabelTimer);
      resetLabelTimer = window.setTimeout(() => {
        setButtonIdleState();
      }, 1800);
    } catch {
      copyButton.textContent = command;
    }
  });

  document.addEventListener("click", (event) => {
    if (!(event.target instanceof Node) || picker.contains(event.target)) {
      return;
    }

    closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });

  setClient(options[0]);
}
