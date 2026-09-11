(() => {
  "use strict";
  const button = document.getElementById("copyAddress");
  const feedback = document.getElementById("copyAddressFeedback");
  const fallback = document.getElementById("addressCopyFallback");
  const text = document.getElementById("addressCopyText");
  if (!button || !feedback || !fallback || !text) return;
  const address = button.dataset.copyAddress;
  if (typeof address !== "string" || !address.trim()) return;
  const en = document.documentElement.lang.startsWith("en");
  let copying = false;
  text.readOnly = true;
  text.value = address;

  button.addEventListener("click", async () => {
    if (copying) return;
    copying = true;
    button.setAttribute("aria-busy", "true");
    try {
      // The only copied content is the existing owner address rendered in the template.
      await navigator.clipboard.writeText(address);
      fallback.hidden = true;
      feedback.textContent = en ? "Address copied." : "Alamat disalin.";
    } catch {
      feedback.textContent = en
        ? "Automatic copying is unavailable. Copy the selected address below."
        : "Salinan automatik tidak tersedia. Salin alamat yang dipilih di bawah.";
      fallback.hidden = false;
      text.focus();
      text.select();
    } finally {
      copying = false;
      button.removeAttribute("aria-busy");
    }
  });
  button.hidden = false;
})();
