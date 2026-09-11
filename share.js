(() => {
  "use strict";

  function getPublicShareUrl(value) {
    if (typeof value !== "string" || value.length > 2048) return null;
    let url;
    try { url = new URL(value); } catch { return null; }
    if (url.protocol !== "https:" || url.username || url.password || !/(?:\/|\/en\.html|\/index\.html)$/.test(url.pathname)) return null;
    url.search = "";
    url.hash = "";
    return url.href;
  }

  if (typeof module === "object" && module.exports) module.exports = { getPublicShareUrl };
  if (typeof document === "undefined") return;
  const button = document.getElementById("shareStay");
  if (!button) return;
  const publicUrl = getPublicShareUrl(button.dataset.shareUrl);
  if (!publicUrl) return;
  const feedback = document.getElementById("shareFeedback");
  const fallback = document.getElementById("shareFallback");
  const en = document.documentElement.lang.startsWith("en");
  const copy = {
    opened: en ? "The sharing menu was opened." : "Menu perkongsian telah dibuka.",
    copied: en ? "Homestay link copied. Your enquiry details are not included." : "Pautan homestay disalin. Butiran pertanyaan anda tidak disertakan.",
    manual: en ? "Copy the selected homestay link below." : "Salin pautan homestay yang dipilih di bawah.",
    label: en ? "Homestay link to copy" : "Pautan homestay untuk disalin"
  };
  if (fallback) {
    fallback.readOnly = true;
    fallback.value = publicUrl;
    if (!fallback.hasAttribute("aria-label")) fallback.setAttribute("aria-label", copy.label);
  }

  button.addEventListener("click", async () => {
    button.disabled = true;
    try {
      if (typeof navigator.share === "function") {
        try {
          // Called directly in the click handler to preserve browser user activation.
          await navigator.share({ title: "Jitra2Stay", url: publicUrl });
          if (fallback) fallback.hidden = true;
          if (feedback) feedback.textContent = copy.opened;
          return;
        } catch (error) {
          if (error?.name === "AbortError") return;
        }
      }
      try {
        await navigator.clipboard.writeText(publicUrl);
        if (fallback) fallback.hidden = true;
        if (feedback) feedback.textContent = copy.copied;
      } catch {
        if (feedback) feedback.textContent = fallback ? copy.manual : `${copy.manual} ${publicUrl}`;
        if (fallback) {
          fallback.hidden = false;
          fallback.focus();
          fallback.select();
        }
      }
    } finally { button.disabled = false; }
  });
  button.hidden = false;
})();
