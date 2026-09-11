(() => {
  "use strict";

  const DAY_MS = 86400000;

  // Date inputs are calendar dates, so arithmetic must not depend on time zones or DST.
  function parseDateOnly(value) {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(0);
    date.setUTCFullYear(year, month - 1, day);
    date.setUTCHours(0, 0, 0, 0);
    if (year < 1 || date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
    return date.getTime() / DAY_MS;
  }

  function addDays(value, days) {
    const start = parseDateOnly(value);
    if (start === null || !Number.isInteger(days)) return null;
    const result = new Date((start + days) * DAY_MS);
    const year = result.getUTCFullYear();
    return year >= 1 && year <= 9999 ? result.toISOString().slice(0, 10) : null;
  }

  function nightsBetween(checkin, checkout) {
    const start = parseDateOnly(checkin);
    const end = parseDateOnly(checkout);
    return start !== null && end !== null && end > start ? end - start : null;
  }

  function estimateStay(checkin, checkout, rooms, roomRates) {
    const nights = nightsBetween(checkin, checkout);
    if (!roomRates || !Object.prototype.hasOwnProperty.call(roomRates, String(rooms))) return null;
    const nightlyRate = Number(roomRates[String(rooms)]);
    return nights !== null && Number.isFinite(nightlyRate) && nightlyRate > 0
      ? { nights, nightlyRate, total: nights * nightlyRate }
      : null;
  }

  function buildEnquiryMessage({ language, checkin, checkout, guests, rooms, notes = "", estimate }) {
    const en = language === "en";
    const lines = en
      ? ["Hi Jitra2Stay, I would like to ask about a stay.", `Check-in: ${checkin}`, `Check-out: ${checkout}`, `Guests: ${guests}`, `Room package: ${rooms} rooms`]
      : ["Salam Jitra2Stay, saya ingin bertanya tentang penginapan.", `Daftar masuk: ${checkin}`, `Daftar keluar: ${checkout}`, `Tetamu: ${guests}`, `Pakej bilik: ${rooms} bilik`];
    if (estimate) {
      lines.push(en
        ? `Stay estimate: RM${estimate.total} (${estimate.nights} night(s) × RM${estimate.nightlyRate}). Security deposit excluded.`
        : `Anggaran penginapan: RM${estimate.total} (${estimate.nights} malam × RM${estimate.nightlyRate}). Tidak termasuk deposit keselamatan.`);
    }
    if (String(notes).trim()) lines.push(`${en ? "Notes" : "Catatan"}: ${String(notes).trim()}`);
    lines.push(en
      ? "Please confirm availability, the final price and booking terms. This is an enquiry, not a confirmed booking."
      : "Mohon sahkan kekosongan, harga akhir dan syarat tempahan. Ini pertanyaan, belum merupakan tempahan yang disahkan.");
    return lines.join("\n");
  }

  function getEnquiryUrl(phone, message) {
    const digits = String(phone || "").replace(/\D/g, "");
    return digits ? `https://wa.me/${digits}?text=${encodeURIComponent(message)}` : null;
  }

  if (typeof module === "object" && module.exports) {
    module.exports = { parseDateOnly, addDays, nightsBetween, estimateStay, buildEnquiryMessage, getEnquiryUrl };
  }
  if (typeof window === "undefined" || typeof document === "undefined") return;

  const root = document.documentElement;
  root.classList.add("js");
  const config = window.APP_CONFIG || {};
  const language = config.language || (root.lang.startsWith("en") ? "en" : "ms");
  const en = language === "en";
  const copy = {
    openMenu: en ? "Open navigation" : "Buka menu navigasi",
    closeMenu: en ? "Close navigation" : "Tutup menu navigasi",
    lightTheme: en ? "Use light theme" : "Guna tema cerah",
    darkTheme: en ? "Use dark theme" : "Guna tema gelap",
    checkout: en ? "Check-out must be after check-in." : "Tarikh daftar keluar mesti selepas tarikh daftar masuk.",
    guests: en ? `Enter 1–${config.maxGuests || 20} guests.` : `Masukkan 1–${config.maxGuests || 20} tetamu.`,
    rooms: en ? "Choose a room package." : "Pilih pakej bilik.",
    prompt: en ? "Choose dates and a room package to see an estimate." : "Pilih tarikh dan pakej bilik untuk melihat anggaran.",
    exclusions: en ? "Security deposit excluded. The host will confirm availability and the final price." : "Tidak termasuk deposit keselamatan. Hos akan sahkan kekosongan dan harga akhir.",
    ready: en ? "Your enquiry is ready. Press Send in WhatsApp to send it to the owner. If WhatsApp did not open, use the link below. This does not confirm a booking." : "Pertanyaan anda sedia. Tekan Hantar dalam WhatsApp untuk menghantarnya kepada owner. Jika WhatsApp tidak terbuka, guna pautan di bawah. Ini belum mengesahkan tempahan.",
    invalid: en ? "Please check the highlighted fields." : "Sila semak ruangan yang ditandakan.",
    copied: en ? "Enquiry message copied." : "Mesej pertanyaan telah disalin.",
    copyFailed: en ? "Unable to copy here. Use the WhatsApp link to open your prepared message." : "Mesej tidak dapat disalin di sini. Guna pautan WhatsApp untuk membuka mesej yang disediakan."
  };

  // Preserve links used by the previous single-page language switcher.
  const url = new URL(window.location.href);
  if (url.searchParams.get("lang") === "en" && !en) {
    const destination = new URL("en.html", url);
    destination.hash = url.hash;
    url.searchParams.delete("lang");
    destination.search = url.search;
    window.location.replace(destination.href);
    return;
  }

  const nav = document.getElementById("mainNav");
  const menuToggle = document.getElementById("menuToggle");
  if (nav && menuToggle) {
    const mobile = window.matchMedia("(max-width: 900px)");
    let menuOpen = false;
    function updateMenu() {
      nav.dataset.mobile = String(mobile.matches);
      nav.hidden = mobile.matches && !menuOpen;
      nav.inert = mobile.matches && !menuOpen;
      menuToggle.hidden = !mobile.matches;
      menuToggle.setAttribute("aria-expanded", String(mobile.matches && menuOpen));
      menuToggle.setAttribute("aria-label", menuOpen ? copy.closeMenu : copy.openMenu);
    }
    menuToggle.addEventListener("click", () => { menuOpen = !menuOpen; updateMenu(); });
    nav.addEventListener("click", (event) => {
      if (event.target.closest("a") && mobile.matches) { menuOpen = false; updateMenu(); }
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && mobile.matches && menuOpen) {
        menuOpen = false;
        updateMenu();
        menuToggle.focus();
      }
    });
    const onResize = () => { menuOpen = false; updateMenu(); };
    if (mobile.addEventListener) mobile.addEventListener("change", onResize);
    else mobile.addListener(onResize);
    updateMenu();
  }

  const themeToggle = document.getElementById("themeToggle");
  if (themeToggle) {
    const preferredTheme = window.matchMedia("(prefers-color-scheme: dark)");
    let savedTheme = null;
    try { savedTheme = window.localStorage.getItem("theme"); } catch { /* Theme preference is optional. */ }
    let theme = savedTheme === "light" || savedTheme === "dark" ? savedTheme : preferredTheme.matches ? "dark" : "light";
    function applyTheme() {
      root.dataset.theme = theme;
      root.style.colorScheme = theme;
      const label = theme === "dark" ? copy.lightTheme : copy.darkTheme;
      themeToggle.setAttribute("aria-label", label);
      themeToggle.title = label;
      themeToggle.removeAttribute("aria-pressed");
      themeToggle.hidden = false;
    }
    themeToggle.addEventListener("click", () => {
      theme = theme === "dark" ? "light" : "dark";
      savedTheme = theme;
      try { window.localStorage.setItem("theme", theme); } catch { /* Theme still changes when storage is unavailable. */ }
      applyTheme();
    });
    const onPreference = () => {
      if (savedTheme !== "light" && savedTheme !== "dark") {
        theme = preferredTheme.matches ? "dark" : "light";
        applyTheme();
      }
    };
    if (preferredTheme.addEventListener) preferredTheme.addEventListener("change", onPreference);
    else preferredTheme.addListener(onPreference);
    applyTheme();
  }

  const dialog = document.getElementById("galleryDialog");
  const galleryImage = document.getElementById("galleryImage");
  const galleryCaption = document.getElementById("galleryCaption");
  const galleryClose = document.getElementById("galleryClose");
  const galleryPrev = document.getElementById("galleryPrev");
  const galleryNext = document.getElementById("galleryNext");
  const galleryCount = document.getElementById("galleryCount");
  const gallery = Array.from(document.querySelectorAll(".gallery-trigger"));
  if (dialog && typeof dialog.showModal === "function" && galleryImage && gallery.length) {
    let selected = 0;
    let opener = null;
    let previousOverflow = "";
    function showImage(index) {
      selected = (index + gallery.length) % gallery.length;
      const item = gallery[selected];
      const caption = item.dataset.caption || item.querySelector("img")?.alt || "";
      galleryImage.src = item.dataset.full || item.href;
      galleryImage.alt = caption;
      if (galleryCaption) galleryCaption.textContent = caption;
      if (galleryCount) galleryCount.textContent = `${selected + 1} / ${gallery.length}`;
      if (galleryPrev) galleryPrev.hidden = gallery.length < 2;
      if (galleryNext) galleryNext.hidden = gallery.length < 2;
    }
    gallery.forEach((item, index) => item.addEventListener("click", (event) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      opener = item;
      showImage(index);
      previousOverflow = document.body.style.overflow;
      dialog.showModal();
      document.body.style.overflow = "hidden";
      galleryClose?.focus();
    }));
    galleryClose?.addEventListener("click", () => dialog.close());
    galleryPrev?.addEventListener("click", () => showImage(selected - 1));
    galleryNext?.addEventListener("click", () => showImage(selected + 1));
    dialog.addEventListener("keydown", (event) => {
      if (event.key === "Tab") {
        const controls = Array.from(dialog.querySelectorAll("button:not([disabled])"))
          .filter((button) => !button.closest("[hidden]") && button.getClientRects().length > 0);
        const first = controls[0];
        const last = controls.at(-1);
        if (first && (event.shiftKey && document.activeElement === first || !event.shiftKey && document.activeElement === last || !controls.includes(document.activeElement))) {
          event.preventDefault();
          (event.shiftKey ? last : first).focus();
        }
      }
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        showImage(selected + (event.key === "ArrowLeft" ? -1 : 1));
      }
    });
    dialog.addEventListener("click", (event) => {
      if (event.target !== dialog) return;
      const bounds = dialog.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
    });
    dialog.addEventListener("close", () => {
      document.body.style.overflow = previousOverflow;
      if (opener?.isConnected) opener.focus();
    });
  }

  const form = document.getElementById("dateForm");
  if (!form) return;
  const checkin = form.elements.namedItem("checkin");
  const checkout = form.elements.namedItem("checkout");
  const guests = form.elements.namedItem("guests");
  const rooms = form.elements.namedItem("rooms");
  const notes = form.elements.namedItem("notes");
  const estimateOutput = document.getElementById("priceEstimate");
  const feedback = document.getElementById("formFeedback");
  const enquiryLink = document.getElementById("enquiryLink");
  const copyMessage = document.getElementById("enquiryCopyMessage");
  if (!checkin || !checkout || !guests || !rooms || !enquiryLink || !getEnquiryUrl(config.phone, "")) return;
  let preparedMessage = "";
  let submitted = false;
  [checkin, checkout, guests, rooms].forEach((field) => { field.required = true; });
  guests.min = "1";
  guests.max = String(config.maxGuests || 20);
  guests.step = "1";

  function updateEnquiry() {
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    checkin.min = today;
    checkout.min = addDays(checkin.value, 1) || addDays(today, 1);
    checkout.setCustomValidity(checkin.value && checkout.value && nightsBetween(checkin.value, checkout.value) === null ? copy.checkout : "");
    const guestCount = Number(guests.value);
    guests.setCustomValidity(guests.value && (!Number.isInteger(guestCount) || guestCount < 1 || guestCount > Number(guests.max)) ? copy.guests : "");
    const estimate = estimateStay(checkin.value, checkout.value, rooms.value, config.roomRates);
    rooms.setCustomValidity(rooms.value && !Object.prototype.hasOwnProperty.call(config.roomRates || {}, rooms.value) ? copy.rooms : "");
    if (estimateOutput) {
      estimateOutput.textContent = estimate && checkin.validity.valid && checkout.validity.valid
        ? `${en ? "Stay estimate" : "Anggaran penginapan"}: RM${estimate.total} · ${estimate.nights} ${en ? (estimate.nights === 1 ? "night" : "nights") : "malam"} × RM${estimate.nightlyRate}. ${copy.exclusions}`
        : copy.prompt;
    }
    const valid = estimate && Array.from(form.elements).every((field) => !field.willValidate || field.validity.valid);
    preparedMessage = valid ? buildEnquiryMessage({ language, checkin: checkin.value, checkout: checkout.value, guests: guests.value, rooms: rooms.value, notes: notes?.value || "", estimate }) : "";
    enquiryLink.hidden = !preparedMessage;
    if (copyMessage) copyMessage.hidden = !preparedMessage;
    if (preparedMessage) enquiryLink.href = getEnquiryUrl(config.phone, preparedMessage);
    else enquiryLink.removeAttribute("href");
    if (feedback && submitted) feedback.textContent = "";
    return Boolean(preparedMessage);
  }

  form.addEventListener("input", updateEnquiry);
  form.addEventListener("change", updateEnquiry);
  document.querySelectorAll(".package-link[data-rooms]").forEach((link) => {
    link.addEventListener("click", (event) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const selectedRooms = link.dataset.rooms;
      if (!Array.from(rooms.options).some((option) => option.value === selectedRooms)) return;
      form.hidden = false;
      rooms.value = selectedRooms;
      rooms.dispatchEvent(new Event("change", { bubbles: true }));
      // The normal anchor scrolls to the enquiry section, including without JavaScript.
    });
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const valid = updateEnquiry();
    submitted = true;
    const nativeValid = form.reportValidity();
    if (!valid || !nativeValid) {
      if (feedback) feedback.textContent = copy.invalid;
      return;
    }
    if (feedback) feedback.textContent = copy.ready;
    // Keep the prepared link and form intact when the browser blocks a new tab.
    try { window.open(enquiryLink.href, "_blank", "noopener,noreferrer"); } catch { /* The real link remains available. */ }
  });
  copyMessage?.addEventListener("click", async () => {
    if (!preparedMessage) return;
    try {
      await navigator.clipboard.writeText(preparedMessage);
      if (feedback) feedback.textContent = copy.copied;
    } catch {
      if (feedback) feedback.textContent = copy.copyFailed;
    }
  });
  updateEnquiry();
  form.hidden = false;
})();
