const copyButton = document.querySelector("[data-copy]");

if (copyButton) {
  copyButton.addEventListener("click", async () => {
    const command = copyButton.getAttribute("data-copy");

    try {
      await navigator.clipboard.writeText(command);
      copyButton.textContent = "Copied";
      copyButton.classList.add("copied");
      window.setTimeout(() => {
        copyButton.textContent = "Copy install command";
        copyButton.classList.remove("copied");
      }, 1800);
    } catch {
      copyButton.textContent = command;
    }
  });
}
