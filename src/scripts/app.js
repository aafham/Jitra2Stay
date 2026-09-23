(() => {
  "use strict";

  const DAY_MS = 86400000;
  const DRAFT_KEY = "jitra2stay.enquiry-draft.v1";
  const DRAFT_TTL_MS = 2 * 60 * 60 * 1000;

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

  function estimatePayment(estimate, securityDeposit) {
    return estimate && Number.isFinite(estimate.total) && estimate.total >= 0 && Number.isFinite(securityDeposit) && securityDeposit >= 0
      ? { accommodation: estimate.total, securityDeposit, totalPayable: estimate.total + securityDeposit }
      : null;
  }

  function buildEnquiryMessage({ language, checkin, checkout, guests, rooms, notes = "", estimate, securityDeposit, depositCategory = "standard" }) {
    const en = language === "en";
    const lines = en
      ? ["Hi Jitra2Stay, I would like to ask about a stay.", `Check-in: ${checkin}`, `Check-out: ${checkout}`, `Guests: ${guests}`, `Room package: ${rooms} rooms`]
      : ["Salam Jitra2Stay, saya ingin bertanya tentang penginapan.", `Daftar masuk: ${checkin}`, `Daftar keluar: ${checkout}`, `Tetamu: ${guests}`, `Pakej bilik: ${rooms} bilik`];
    if (estimate) {
      lines.push(en
        ? `Stay estimate: RM${estimate.total} (${estimate.nights} night(s) × RM${estimate.nightlyRate}). Deposit and extra charges excluded.`
        : `Anggaran penginapan: RM${estimate.total} (${estimate.nights} malam × RM${estimate.nightlyRate}). Tidak termasuk deposit dan caj tambahan.`);
    }
    const payment = estimatePayment(estimate, securityDeposit);
    if (payment) {
      const category = depositCategory === "large" ? en ? "large group / major event" : "rombongan / majlis besar" : en ? "regular stay / small group" : "biasa / kumpulan kecil";
      lines.push(`${en ? "Security deposit" : "Deposit keselamatan"}: RM${payment.securityDeposit} (${category})`);
      lines.push(en ? `Initial payment estimate: RM${payment.totalPayable} (RM${payment.accommodation} accommodation + RM${payment.securityDeposit} deposit). Extra charges excluded.` : `Anggaran bayaran awal: RM${payment.totalPayable} (RM${payment.accommodation} sewaan + RM${payment.securityDeposit} deposit). Caj tambahan tidak termasuk.`);
      lines.push(en ? "Deposit refunded after a satisfactory house inspection; forfeited if damage or unwanted incidents occur. Please confirm the deposit category." : "Deposit dipulangkan selepas pemeriksaan rumah memuaskan; hangus jika berlaku kerosakan atau perkara tidak diingini. Mohon sahkan kategori deposit.");
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

  // The family summary deliberately accepts only the public planning fields.
  // Guest counts and private enquiry notes cannot enter the shared text.
  function buildFamilyPlanMessage({ language, checkin, checkout, rooms, roomRates, securityDeposit, depositCategory = "standard", publicUrl }) {
    const estimate = estimateStay(checkin, checkout, rooms, roomRates);
    if (!estimate || !Number.isFinite(securityDeposit) || securityDeposit < 0) return null;
    let url;
    try { url = new URL(publicUrl); } catch { return null; }
    if (url.protocol !== "https:" || url.username || url.password) return null;
    url.search = "";
    url.hash = "";
    const en = language === "en";
    const money = value => `RM${Number(value).toLocaleString(en ? "en-MY" : "ms-MY")}`;
    return [
      en ? "A stay to discuss · Jitra2Stay" : "Cadangan penginapan · Jitra2Stay",
      `${en ? "Room package" : "Pakej bilik"}: ${rooms} ${en ? "rooms" : "bilik"}`,
      `Check-in: ${checkin}`,
      `Check-out: ${checkout}`,
      `${en ? "Stay length" : "Tempoh"}: ${estimate.nights} ${en ? estimate.nights === 1 ? "night" : "nights" : "malam"}`,
      `${en ? "Accommodation estimate" : "Anggaran sewaan"}: ${money(estimate.total)} (${money(estimate.nightlyRate)} / ${en ? "night" : "malam"})`,
      `${en ? "Separate security deposit" : "Deposit keselamatan berasingan"}: ${money(securityDeposit)} (${depositCategory === "large" ? en ? "large group / major event" : "rombongan / majlis besar" : en ? "regular stay / small group" : "biasa / kumpulan kecil"})`,
      `${en ? "Initial payment estimate" : "Anggaran bayaran awal"}: ${money(estimatePayment(estimate, securityDeposit).totalPayable)} (${money(estimate.total)} + ${money(securityDeposit)})`,
      en ? "Deposit refunded after a satisfactory house inspection; forfeited if damage or unwanted incidents occur." : "Deposit dipulangkan selepas pemeriksaan rumah memuaskan; hangus jika berlaku kerosakan atau perkara tidak diingini.",
      en ? "Extra charges are excluded. The owner confirms the deposit category, dates and final price. This is a plan, not a confirmed booking."
        : "Caj tambahan tidak termasuk. Owner mengesahkan kategori deposit, tarikh dan harga akhir. Ini rancangan, belum merupakan tempahan yang disahkan.",
      url.href
    ].join("\n");
  }

  // Validate the storage envelope without requiring the enquiry itself to be valid.
  // Past dates, reversed dates and out-of-range guest counts remain editable drafts.
  function parseEnquiryDraft(serialized, roomValues, now = Date.now()) {
    if (typeof serialized !== "string" || serialized.length > 7000 || !Array.isArray(roomValues) || !Number.isFinite(now)) return null;
    let draft;
    try { draft = JSON.parse(serialized); } catch { return null; }
    if (!draft || typeof draft !== "object" || Array.isArray(draft) || draft.version !== 1 || typeof draft.packageChosen !== "boolean") return null;
    if (Object.keys(draft).some(key => !["version", "savedAt", "fields", "packageChosen", "plannedNights", "depositCategory"].includes(key))) return null;
    if (Object.prototype.hasOwnProperty.call(draft, "plannedNights") && ![1, 2, 3].includes(draft.plannedNights)) return null;
    if (Object.prototype.hasOwnProperty.call(draft, "depositCategory") && !["standard", "large"].includes(draft.depositCategory)) return null;
    if (!Number.isSafeInteger(draft.savedAt) || draft.savedAt < 0 || draft.savedAt > now || now - draft.savedAt >= DRAFT_TTL_MS) return null;
    const fields = draft.fields;
    const names = ["checkin", "checkout", "guests", "rooms", "notes"];
    if (!fields || typeof fields !== "object" || Array.isArray(fields) || Object.keys(fields).length !== names.length) return null;
    if (!names.every(name => Object.prototype.hasOwnProperty.call(fields, name) && typeof fields[name] === "string")) return null;
    if (![fields.checkin, fields.checkout].every(value => value === "" || parseDateOnly(value) !== null)) return null;
    if (fields.guests.length > 20 || fields.guests !== "" && (!/^-?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(fields.guests) || !Number.isFinite(Number(fields.guests)))) return null;
    if (fields.rooms !== "" && !roomValues.includes(fields.rooms)) return null;
    if (fields.notes.length > 1000 || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(fields.notes)) return null;
    return { version: 1, savedAt: draft.savedAt, packageChosen: draft.packageChosen, fields: Object.fromEntries(names.map(name => [name, fields[name]])), ...(draft.plannedNights ? { plannedNights: draft.plannedNights } : {}), ...(draft.depositCategory ? { depositCategory: draft.depositCategory } : {}) };
  }

  if (typeof module === "object" && module.exports) {
    module.exports = { parseDateOnly, addDays, nightsBetween, estimateStay, estimatePayment, buildEnquiryMessage, buildFamilyPlanMessage, getEnquiryUrl, parseEnquiryDraft, DRAFT_KEY, DRAFT_TTL_MS };
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
    checkinRequired: en ? "Choose a check-in date." : "Pilih tarikh check-in.",
    checkinPast: en ? "Choose today or a later date." : "Pilih hari ini atau tarikh selepasnya.",
    checkoutRequired: en ? "Choose a check-out date or use a stay-length shortcut." : "Pilih tarikh check-out atau gunakan pilihan bilangan malam.",
    ready: en ? "Your enquiry is ready. Press Send in WhatsApp to send it to the owner. If WhatsApp did not open, use the link below. This does not confirm a booking." : "Pertanyaan anda sedia. Tekan Hantar dalam WhatsApp untuk menghantarnya kepada owner. Jika WhatsApp tidak terbuka, guna pautan di bawah. Ini belum mengesahkan tempahan.",
    invalid: en ? "Please check the highlighted fields." : "Sila semak ruangan yang ditandakan.",
    copied: en ? "Enquiry message copied." : "Mesej pertanyaan telah disalin.",
    copyFailed: en ? "Copy the enquiry message below." : "Salin mesej pertanyaan di bawah.",
    draftSaved: en ? "Draft saved in this tab for up to 2 hours. You can switch language or reload." : "Draf disimpan dalam tab ini sehingga 2 jam. Anda boleh tukar bahasa atau muat semula.",
    draftRestored: en ? "Your draft was restored. Review the details before opening WhatsApp." : "Draf anda dipulihkan. Semak butiran sebelum membuka WhatsApp.",
    draftUnavailable: en ? "This browser could not save the draft. Keep this page open to retain your details." : "Browser ini tidak dapat menyimpan draf. Kekalkan halaman ini untuk mengekalkan butiran anda.",
    draftExpired: en ? "The saved draft expired. Details on this page remain available until you leave or reset them." : "Draf simpanan telah tamat tempoh. Butiran di halaman ini kekal sehingga anda meninggalkan halaman atau mengosongkannya.",
    draftCleared: en ? "Draft cleared. You can start a new enquiry." : "Draf dikosongkan. Anda boleh mulakan pertanyaan baharu.",
    draftClearFailed: en ? "The form was reset, but this browser could not remove the saved draft." : "Borang ditetapkan semula, tetapi browser ini tidak dapat memadamkan draf simpanan."
  };

  // Preserve links used by the previous single-page language switcher.
  const url = new URL(window.location.href);
  if (url.searchParams.get("lang") === "en" && !en) {
    const paired = document.querySelector('.mobile-language a[hreflang="en"]');
    const destination = new URL(paired?.getAttribute("href") || "en.html", url);
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
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const header = menuToggle.closest("header");
    let menuOpen = false;
    let closeTimer = 0;

    function sizeMenu() {
      if (!mobile.matches || !header) return;
      const viewport = window.visualViewport;
      const bottom = (viewport?.offsetTop || 0) + (viewport?.height || window.innerHeight);
      nav.style.setProperty("--menu-space", `${Math.max(0, bottom - header.getBoundingClientRect().bottom - 20)}px`);
    }

    function finishClosing() {
      if (mobile.matches && !menuOpen) nav.hidden = true;
    }

    function updateMenu(open, immediate = false) {
      window.clearTimeout(closeTimer);
      menuOpen = mobile.matches && open;
      nav.dataset.mobile = String(mobile.matches);
      menuToggle.hidden = !mobile.matches;
      menuToggle.setAttribute("aria-expanded", String(menuOpen));
      menuToggle.setAttribute("aria-label", menuOpen ? copy.closeMenu : copy.openMenu);

      if (!mobile.matches) {
        nav.hidden = false;
        nav.inert = false;
        nav.removeAttribute("aria-hidden");
        delete nav.dataset.state;
        return;
      }

      sizeMenu();
      if (menuOpen) {
        const wasHidden = nav.hidden;
        nav.hidden = false;
        nav.inert = false;
        nav.removeAttribute("aria-hidden");
        // Establish the closed frame after display:none. Reversing an active
        // transition needs no reset, so rapid taps stay smooth and predictable.
        if (wasHidden) {
          nav.dataset.state = "closed";
          void nav.offsetHeight;
        }
        nav.dataset.state = "open";
      } else {
        // Keep the fading panel out of keyboard navigation immediately.
        if (nav.contains(document.activeElement)) menuToggle.focus({ preventScroll: true });
        nav.inert = true;
        nav.setAttribute("aria-hidden", "true");
        nav.dataset.state = "closed";
        if (immediate || reducedMotion.matches || nav.hidden) finishClosing();
        else closeTimer = window.setTimeout(finishClosing, 240);
      }
    }

    menuToggle.addEventListener("click", () => updateMenu(!menuOpen));
    nav.addEventListener("transitionend", (event) => {
      if (event.target === nav && event.propertyName === "opacity" && !menuOpen && Number(window.getComputedStyle(nav).opacity) < 0.01) finishClosing();
    });
    nav.addEventListener("click", (event) => {
      if (event.target.closest("a") && mobile.matches) updateMenu(false);
    });
    function dismissOutsideMenu(event) {
      if (!mobile.matches || !menuOpen || !header || header.contains(event.target)) return;
      updateMenu(false);
    }
    document.addEventListener("focusin", dismissOutsideMenu);
    document.addEventListener("pointerdown", dismissOutsideMenu);
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && mobile.matches && menuOpen) {
        updateMenu(false);
        menuToggle.focus({ preventScroll: true });
      }
    });
    const onResize = () => {
      const toggleWasFocused = document.activeElement === menuToggle;
      updateMenu(false, true);
      if (!mobile.matches && toggleWasFocused) nav.querySelector("a")?.focus({ preventScroll: true });
    };
    if (mobile.addEventListener) mobile.addEventListener("change", onResize);
    else mobile.addListener(onResize);
    window.addEventListener("resize", sizeMenu, { passive: true });
    window.visualViewport?.addEventListener("resize", sizeMenu, { passive: true });
    window.visualViewport?.addEventListener("scroll", sizeMenu, { passive: true });
    if (header && "ResizeObserver" in window) new ResizeObserver(sizeMenu).observe(header);
    updateMenu(false, true);
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
  root.classList.remove("nav-pending");

  const form = document.getElementById("dateForm");
  if (!form) return;
  const checkin = form.elements.namedItem("checkin");
  const checkout = form.elements.namedItem("checkout");
  const guests = form.elements.namedItem("guests");
  const rooms = form.elements.namedItem("rooms");
  const depositCategory = form.elements.namedItem("depositCategory");
  const notes = form.elements.namedItem("notes");
  const estimatePrompt = document.getElementById("estimatePrompt");
  const estimateBreakdown = document.getElementById("estimateBreakdown");
  const estimateTotal = document.getElementById("estimateTotal");
  const estimateDeposit = document.getElementById("estimateDeposit");
  const estimatePayable = document.getElementById("estimatePayable");
  const estimateEquation = document.getElementById("estimateEquation");
  const estimateStayText = document.getElementById("estimateStay");
  const estimateRate = document.getElementById("estimateRate");
  const stayShortcuts = document.getElementById("stayShortcuts");
  const comparison = document.getElementById("stayComparison");
  const comparisonStatus = document.getElementById("comparisonStatus");
  const familyPlan = document.getElementById("familyPlan");
  const familyPlanText = document.getElementById("familyPlanText");
  const familyPlanShare = document.getElementById("familyPlanShare");
  const familyPlanFeedback = document.getElementById("familyPlanFeedback");
  const familyPlanFallback = document.getElementById("familyPlanFallback");
  const familyPlanCopyText = document.getElementById("familyPlanCopyText");
  const preview = document.getElementById("enquiryPreview");
  const previewText = document.getElementById("enquiryPreviewText");
  const feedback = document.getElementById("formFeedback");
  const enquiryLink = document.getElementById("enquiryLink");
  const copyMessage = document.getElementById("enquiryCopyMessage");
  const enquiryCopyFeedback = document.getElementById("enquiryCopyFeedback");
  const enquiryCopyFallback = document.getElementById("enquiryCopyFallback");
  const enquiryCopyText = document.getElementById("enquiryCopyText");
  const clearDraft = document.getElementById("clearEnquiryDraft");
  const draftFeedback = document.getElementById("draftFeedback");
  if (!checkin || !checkout || !guests || !rooms || !enquiryLink || !getEnquiryUrl(config.phone, "")) return;
  let preparedMessage = "";
  let enquiryCopyRevision = 0;
  let enquiryCopyInFlight = false;
  let submitted = false;
  let packageChosen = false;
  let plannedNights = null;
  let familyMessage = "";
  let familyPlanRevision = 0;
  let familyShareInFlight = false;
  const touched = new Set();
  const enquiryShortcuts = Array.from(document.querySelectorAll('#heroPrimaryCta, #mainNav > .button, .enquiry-section .button-light, .mobile-whatsapp')).map(link => ({link, href:link.href, label:link.getAttribute('aria-label')}));
  const money = value => `RM${Number(value).toLocaleString(en ? "en-MY" : "ms-MY")}`;
  const selectedDeposit = () => Number(depositCategory?.value === "large" ? config.largeGroupSecurityDeposit : config.securityDeposit);
  [checkin, checkout, guests, rooms].forEach((field) => { field.required = true; });
  // Keep native validity checks, but use the inline errors and a visible focus
  // target instead of a browser popup underneath the sticky header.
  form.noValidate = true;
  guests.min = "1";
  guests.max = String(config.maxGuests || 20);
  guests.step = "1";

  const draftFields = { checkin, checkout, guests, rooms, notes };
  const draftDefaults = Object.fromEntries(Object.entries(draftFields).map(([name, field]) => [name, field?.value || ""]));
  const roomValues = Array.from(rooms.options).map(option => option.value);
  let expiryTimer = 0;
  let draftChanged = false;
  let savedDraftAt = null;

  function announceDraft(message) {
    if (draftFeedback && draftFeedback.textContent !== message) draftFeedback.textContent = message;
  }

  function removeSavedDraft() {
    window.clearTimeout(expiryTimer);
    savedDraftAt = null;
    try { window.sessionStorage.removeItem(DRAFT_KEY); return true; }
    catch { return false; }
  }

  function scheduleDraftExpiry(savedAt) {
    window.clearTimeout(expiryTimer);
    savedDraftAt = savedAt;
    expiryTimer = window.setTimeout(() => {
      removeSavedDraft();
      announceDraft(copy.draftExpired);
    }, Math.max(0, savedAt + DRAFT_TTL_MS - Date.now()));
  }

  function saveDraft() {
    // Avoid creating a personal-data record for an untouched form or just after reset.
    if (!draftChanged) return;
    const candidate = {
      version: 1, savedAt: Date.now(), packageChosen,
      fields: Object.fromEntries(Object.entries(draftFields).map(([name, field]) => [name, field?.value || ""])),
      depositCategory: depositCategory?.value || "standard",
      ...(plannedNights !== null ? { plannedNights } : {})
    };
    const serialized = JSON.stringify(candidate);
    if (!parseEnquiryDraft(serialized, roomValues, candidate.savedAt)) {
      removeSavedDraft();
      announceDraft(copy.draftUnavailable);
      return;
    }
    try { window.sessionStorage.setItem(DRAFT_KEY, serialized); }
    catch { announceDraft(copy.draftUnavailable); return; }
    scheduleDraftExpiry(candidate.savedAt);
    announceDraft(copy.draftSaved);
  }

  function restoreDraft() {
    let stored;
    try { stored = window.sessionStorage.getItem(DRAFT_KEY); }
    catch { return "unavailable"; }
    if (stored === null) return "missing";
    const draft = parseEnquiryDraft(stored, roomValues);
    if (!draft) { removeSavedDraft(); return "invalid"; }
    Object.entries(draft.fields).forEach(([name, value]) => {
      if (draftFields[name]) draftFields[name].value = value;
      if (value && name !== "notes") touched.add(name);
    });
    packageChosen = draft.packageChosen;
    if (depositCategory) depositCategory.value = draft.depositCategory || "standard";
    plannedNights = draft.plannedNights || null;
    draftChanged = true;
    scheduleDraftExpiry(draft.savedAt);
    announceDraft(copy.draftRestored);
    return "restored";
  }

  function resetDraftForm() {
    form.reset();
    packageChosen = false;
    plannedNights = null;
    draftChanged = false;
    submitted = false;
    touched.clear();
    if (preview) preview.open = false;
    if (familyPlan) familyPlan.open = false;
    if (feedback) feedback.textContent = "";
    announceDraft("");
    updateEnquiry();
  }

  function showFieldError(field) {
    const output = document.getElementById(`${field.name}Error`);
    if (!output) return;
    const invalid = touched.has(field.name) && !field.validity.valid;
    output.hidden = !invalid;
    if (!invalid) { field.removeAttribute("aria-invalid"); output.textContent = ""; return; }
    field.setAttribute("aria-invalid", "true");
    output.textContent = field === checkin ? (field.validity.valueMissing ? copy.checkinRequired : copy.checkinPast)
      : field === checkout ? (field.validity.valueMissing ? copy.checkoutRequired : copy.checkout)
      : field === guests ? copy.guests : copy.rooms;
  }

  function updatePackageCards() {
    document.querySelectorAll(".package-card[data-package]").forEach(card => {
      const selected = packageChosen && card.dataset.package === rooms.value;
      card.dataset.selected = String(selected);
      const badge = card.querySelector(".package-selected");
      if (badge) badge.hidden = !selected;
    });
    const summary = document.getElementById("enquiryPackage");
    const name = document.getElementById("enquiryPackageName");
    const meta = document.getElementById("enquiryPackageMeta");
    const option = rooms.selectedOptions[0];
    const rate = Number(config.roomRates?.[rooms.value]);
    if (summary && name && meta) {
      summary.hidden = !option || !Number.isFinite(rate);
      if (!summary.hidden) {
        const title = `${rooms.value} ${en ? "rooms" : "bilik"} · ${money(rate)} / ${en ? "night" : "malam"}`;
        const details = en ? `${option.dataset.bathrooms} bathrooms · Full-house privacy` : `${option.dataset.bathrooms} bilik air · Privasi satu rumah`;
        if (name.textContent !== title) name.textContent = title;
        if (meta.textContent !== details) meta.textContent = details;
      }
    }
  }

  function updateComparison(validDates, estimate) {
    if (!comparison) return;
    const nights = validDates ? estimate.nights : plannedNights || 1;
    comparison.querySelectorAll("[data-compare-nights]").forEach(button => {
      button.setAttribute("aria-pressed", String(nights === Number(button.dataset.compareNights)));
    });
    document.querySelectorAll(".package-card[data-package]").forEach(card => {
      const total = card.querySelector(".package-total");
      const value = card.querySelector(".package-total-value");
      const label = card.querySelector(".package-total-label");
      const nightlyRate = Number(config.roomRates?.[card.dataset.package]);
      if (!total || !value || !label || !Number.isFinite(nightlyRate)) return;
      label.textContent = en ? `Accommodation · ${nights} ${nights === 1 ? "night" : "nights"}` : `Sewaan · ${nights} malam`;
      value.textContent = money(nightlyRate * nights);
      total.hidden = false;
    });
    const statusMessage = validDates
      ? en ? `Comparing ${nights} ${nights === 1 ? "night" : "nights"}, following your enquiry dates.` : `Perbandingan ${nights} malam, mengikut tarikh dalam borang.`
      : checkin.value || checkout.value
        ? en ? `Comparing ${nights} ${nights === 1 ? "night" : "nights"}. Complete or correct your dates to match your stay.` : `Perbandingan ${nights} malam. Lengkapkan atau betulkan tarikh penginapan dalam borang.`
        : plannedNights !== null
          ? en ? `${nights} ${nights === 1 ? "night" : "nights"} selected. Choose check-in and check-out will follow.` : `${nights} malam dipilih. Tetapkan check-in untuk mengisi check-out.`
          : en ? "Compare a stay before choosing your dates." : "Bandingkan sewaan sebelum memilih tarikh.";
    if (comparisonStatus && comparisonStatus.textContent !== statusMessage) comparisonStatus.textContent = statusMessage;
    comparison.hidden = false;
    document.getElementById("kadar")?.classList.add("has-comparison");
  }

  function updateFamilyPlan(valid) {
    const message = (valid ? buildFamilyPlanMessage({ language, checkin: checkin.value, checkout: checkout.value, rooms: rooms.value, roomRates: config.roomRates, securityDeposit: selectedDeposit(), depositCategory: depositCategory?.value || "standard", publicUrl: familyPlan?.dataset.shareUrl }) : "") || "";
    if (message !== familyMessage) {
      familyPlanRevision++;
      if (familyPlanFeedback) familyPlanFeedback.textContent = "";
      if (familyPlanFallback) familyPlanFallback.hidden = true;
    }
    familyMessage = message || "";
    if (familyPlan) familyPlan.hidden = !familyMessage;
    if (familyPlanText) familyPlanText.textContent = familyMessage;
    if (familyPlanCopyText) familyPlanCopyText.value = familyMessage;
  }

  function chooseNights(nights) {
    if (![1, 2, 3].includes(nights)) return;
    plannedNights = nights;
    draftChanged = true;
    if (checkin.value && checkin.validity.valid) {
      checkout.value = addDays(checkin.value, nights) || "";
      touched.add("checkout");
    }
    updateEnquiry();
    saveDraft();
  }

  function followPlannedNights(field) {
    // A direct checkout edit takes precedence, including an incomplete/invalid
    // date that the guest is still correcting. Restore never rewrites dates.
    if (field === checkout) plannedNights = null;
    if (field === checkin && plannedNights !== null && checkin.value && checkin.validity.valid) {
      checkout.value = addDays(checkin.value, plannedNights) || "";
    }
  }

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
    const validDates = Boolean(estimate && checkin.validity.valid && checkout.validity.valid);
    if (estimatePrompt && estimateBreakdown) {
      estimatePrompt.hidden = validDates;
      estimateBreakdown.hidden = !validDates;
      if (validDates) {
        const payment = estimatePayment(estimate, selectedDeposit());
        estimateTotal.textContent = money(estimate.total);
        estimateStayText.textContent = `${rooms.value} ${en ? "rooms" : "bilik"} · ${estimate.nights} ${en ? (estimate.nights === 1 ? "night" : "nights") : "malam"}`;
        estimateRate.textContent = `${money(estimate.nightlyRate)} / ${en ? "night" : "malam"}`;
        if (payment) {
          if (estimateDeposit) estimateDeposit.textContent = money(payment.securityDeposit);
          if (estimatePayable) estimatePayable.textContent = money(payment.totalPayable);
          if (estimateEquation) estimateEquation.textContent = `${money(payment.accommodation)} + ${money(payment.securityDeposit)} = ${money(payment.totalPayable)}`;
        }
      }
    }
    if (stayShortcuts) {
      stayShortcuts.hidden = !(checkin.value && checkin.validity.valid);
      stayShortcuts.querySelectorAll("[data-nights]").forEach(button => button.setAttribute("aria-pressed", String(validDates && estimate.nights === Number(button.dataset.nights))));
    }
    [checkin, checkout, guests, rooms].forEach(showFieldError);
    updatePackageCards();
    updateComparison(validDates, estimate);
    const valid = estimate && Array.from(form.elements).every((field) => !field.willValidate || field.validity.valid);
    const nextMessage = valid ? buildEnquiryMessage({ language, checkin: checkin.value, checkout: checkout.value, guests: guests.value, rooms: rooms.value, notes: notes?.value || "", estimate, securityDeposit: selectedDeposit(), depositCategory: depositCategory?.value || "standard" }) : "";
    if (nextMessage !== preparedMessage) {
      enquiryCopyRevision++;
      if (enquiryCopyFeedback) enquiryCopyFeedback.textContent = "";
      if (enquiryCopyFallback) enquiryCopyFallback.hidden = true;
      if (enquiryCopyText) enquiryCopyText.value = "";
    }
    preparedMessage = nextMessage;
    enquiryLink.hidden = !preparedMessage;
    if (copyMessage) copyMessage.hidden = !preparedMessage;
    if (preparedMessage) enquiryLink.href = getEnquiryUrl(config.phone, preparedMessage);
    else enquiryLink.removeAttribute("href");
    if (preview) preview.hidden = !preparedMessage;
    if (previewText) previewText.textContent = preparedMessage;
    enquiryShortcuts.forEach(({link,href,label}) => {
      link.href = preparedMessage ? enquiryLink.href : href;
      if (preparedMessage) link.setAttribute('aria-label', en ? 'Open your prepared enquiry in WhatsApp' : 'Buka pertanyaan yang disediakan di WhatsApp');
      else if (label) link.setAttribute('aria-label', label);
      else link.removeAttribute('aria-label');
    });
    updateFamilyPlan(valid);
    if (clearDraft) clearDraft.hidden = !packageChosen && plannedNights === null && (!depositCategory || depositCategory.value === "standard") && Object.entries(draftFields).every(([name,field]) => (field?.value || '') === draftDefaults[name]);
    return Boolean(preparedMessage);
  }

  form.addEventListener("input", event => { followPlannedNights(event.target); draftChanged = true; updateEnquiry(); saveDraft(); if (feedback && submitted) feedback.textContent = ""; });
  form.addEventListener("change", event => {
    followPlannedNights(event.target);
    if (event.target === rooms) packageChosen = true;
    draftChanged = true;
    updateEnquiry();
    saveDraft();
    if (feedback && submitted) feedback.textContent = "";
  });
  form.addEventListener("focusout", event => {
    if ([checkin, checkout, guests, rooms].includes(event.target)) {
      touched.add(event.target.name);
      showFieldError(event.target);
    }
  });
  form.addEventListener("invalid", event => {
    touched.add(event.target.name);
    showFieldError(event.target);
    if (feedback) feedback.textContent = copy.invalid;
  }, true);
  stayShortcuts?.addEventListener("click", event => {
    const button = event.target.closest("button[data-nights]");
    if (!button || !checkin.value || !checkin.validity.valid) return;
    chooseNights(Number(button.dataset.nights));
  });
  comparison?.addEventListener("click", event => {
    const button = event.target.closest("button[data-compare-nights]");
    if (button) chooseNights(Number(button.dataset.compareNights));
  });
  document.querySelectorAll(".package-link[data-rooms]").forEach((link) => {
    link.addEventListener("click", (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const selectedRooms = link.dataset.rooms;
      if (!Array.from(rooms.options).some((option) => option.value === selectedRooms)) return;
      form.hidden = false;
      rooms.value = selectedRooms;
      rooms.dispatchEvent(new Event("change", { bubbles: true }));
      event.preventDefault();
      // Preserve the public section URL and native no-JS link, but land at the
      // actual form instead of the long introduction above it on a phone.
      if (window.location.hash !== link.hash) window.history.pushState(null, "", link.hash);
      const title = document.getElementById("enquiryFormTitle");
      const target = !checkin.validity.valid ? checkin : !checkout.validity.valid ? checkout : title;
      target?.focus({ preventScroll: true });
      const headerBottom = Math.max(0, document.querySelector(".site-header")?.getBoundingClientRect().bottom || 0);
      const top = window.scrollY + (title || form).getBoundingClientRect().top - headerBottom - 20;
      window.scrollTo({ top: Math.max(0, top), behavior: "instant" });
      // On short/landscape screens the summary and dates may not fit together.
      // Prioritise the focused input over keeping the summary at the top.
      if (target && target !== title) {
        const view = window.visualViewport;
        const visibleTop = Math.max(view?.offsetTop || 0, headerBottom) + 16;
        const visibleBottom = (view?.offsetTop || 0) + (view?.height || window.innerHeight) - 16;
        const rect = target.getBoundingClientRect();
        if (rect.top < visibleTop || rect.bottom > visibleBottom) {
          window.scrollBy({ top: rect.top - (visibleTop + (visibleBottom - visibleTop - rect.height) / 2), behavior: "instant" });
        }
      }
    });
  });
  document.getElementById("changeEnquiryPackage")?.addEventListener("click", event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const selected = Array.from(document.querySelectorAll(".package-link[data-rooms]")).find(link => link.dataset.rooms === rooms.value);
    if (!selected) return;
    event.preventDefault();
    if (window.location.hash !== "#kadar") window.history.pushState(null, "", "#kadar");
    selected.focus({ preventScroll: true });
    selected.scrollIntoView({ block: "center", behavior: "instant" });
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const valid = updateEnquiry();
    submitted = true;
    const nativeValid = form.checkValidity();
    if (!valid || !nativeValid) {
      if (feedback) feedback.textContent = copy.invalid;
      const firstInvalid = Array.from(form.elements).find(field => field.willValidate && !field.validity.valid);
      if (firstInvalid) {
        firstInvalid.focus({preventScroll:true});
        firstInvalid.scrollIntoView({block:'center',behavior:'instant'});
      }
      return;
    }
    if (feedback) feedback.textContent = copy.ready;
    // Keep the prepared link and form intact when the browser blocks a new tab.
    try { window.open(enquiryLink.href, "_blank", "noopener,noreferrer"); } catch { /* The real link remains available. */ }
  });
  copyMessage?.addEventListener("click", async () => {
    if (!preparedMessage || enquiryCopyInFlight) return;
    const text = preparedMessage;
    const revision = enquiryCopyRevision;
    const currentMessageVisible = () => revision === enquiryCopyRevision && preparedMessage === text &&
      !copyMessage.hidden && copyMessage.getClientRects().length > 0;
    enquiryCopyInFlight = true;
    copyMessage.setAttribute("aria-busy", "true");
    // Pointer activation does not focus buttons in every browser. Keep a
    // reliable origin for the delayed manual-copy focus guard below.
    copyMessage.focus({ preventScroll: true });
    if (enquiryCopyFeedback) enquiryCopyFeedback.textContent = "";
    if (enquiryCopyFallback) enquiryCopyFallback.hidden = true;
    try {
      await navigator.clipboard.writeText(text);
      if (currentMessageVisible() && enquiryCopyFeedback) enquiryCopyFeedback.textContent = copy.copied;
    } catch {
      // An older clipboard request must not reveal stale personal details or
      // move focus after the guest changes or clears the enquiry.
      if (!currentMessageVisible()) return;
      if (enquiryCopyFeedback) enquiryCopyFeedback.textContent = copy.copyFailed;
      if (enquiryCopyFallback && enquiryCopyText) {
        enquiryCopyText.value = text;
        enquiryCopyFallback.hidden = false;
        if (document.activeElement === copyMessage) {
          enquiryCopyText.focus({ preventScroll: true });
          enquiryCopyText.select();
          enquiryCopyText.scrollIntoView({ block: "center", behavior: "instant" });
        }
      }
    } finally {
      enquiryCopyInFlight = false;
      copyMessage.removeAttribute("aria-busy");
    }
  });
  familyPlanShare?.addEventListener("click", async () => {
    if (!familyMessage || !familyPlan?.open || familyShareInFlight) return;
    const text = familyMessage;
    const revision = familyPlanRevision;
    // Keep the button focused while the native share/clipboard request is
    // pending. A revision also catches edits that later restore the same text.
    const currentPlanVisible = () => revision === familyPlanRevision && familyMessage === text &&
      familyPlan.open && !familyPlan.hidden && familyPlanShare.getClientRects().length > 0;
    familyShareInFlight = true;
    familyPlanShare.setAttribute("aria-busy", "true");
    familyPlanShare.focus({ preventScroll: true });
    if (familyPlanFeedback) familyPlanFeedback.textContent = "";
    if (familyPlanFallback) familyPlanFallback.hidden = true;
    try {
      if (typeof navigator.share === "function") {
        try {
          await navigator.share({ title: en ? "Jitra2Stay stay plan" : "Rancangan penginapan Jitra2Stay", text });
          if (currentPlanVisible() && familyPlanFeedback) familyPlanFeedback.textContent = en ? "The sharing menu was opened." : "Menu perkongsian telah dibuka.";
          return;
        } catch (error) { if (error?.name === "AbortError") return; }
      }
      // Do not start copying the old snapshot after a failed native request if
      // the guest has since edited, cleared or closed the preview.
      if (!currentPlanVisible()) return;
      try {
        await navigator.clipboard.writeText(text);
        if (currentPlanVisible() && familyPlanFeedback) familyPlanFeedback.textContent = en ? "Summary copied. You can paste it into your family conversation." : "Ringkasan disalin. Anda boleh tampal dalam perbualan keluarga.";
      } catch {
        if (!currentPlanVisible()) return;
        if (familyPlanFeedback) familyPlanFeedback.textContent = en ? "Copy the selected summary below." : "Salin ringkasan yang dipilih di bawah.";
        if (familyPlanFallback && familyPlanCopyText) {
          familyPlanCopyText.value = text;
          familyPlanFallback.hidden = false;
          if (document.activeElement === familyPlanShare) {
            familyPlanCopyText.focus({ preventScroll: true });
            familyPlanCopyText.select();
            familyPlanCopyText.scrollIntoView({ block: "center", behavior: "instant" });
          }
        }
      }
    } finally {
      familyShareInFlight = false;
      familyPlanShare.removeAttribute("aria-busy");
    }
  });
  document.querySelectorAll(".language-links a[hreflang], .mobile-language a[hreflang]").forEach(link => {
    const snapshotLanguageDraft = () => {
      if (packageChosen || Object.entries(draftFields).some(([name, field]) => (field?.value || "") !== draftDefaults[name])) draftChanged = true;
      saveDraft();
    };
    link.addEventListener("click", snapshotLanguageDraft);
    link.addEventListener("auxclick", snapshotLanguageDraft);
  });
  clearDraft?.addEventListener("click", () => {
    const removed = removeSavedDraft();
    resetDraftForm();
    announceDraft(removed ? copy.draftCleared : copy.draftClearFailed);
  });
  restoreDraft();
  let packageFromPage = false;
  if (document.body.dataset.view === "hubungi" && url.searchParams.has("rooms")) {
    const requested = url.searchParams.get("rooms");
    if (Array.from(rooms.options).some(option => option.value === requested)) {
      rooms.value = requested;
      packageChosen = true;
      draftChanged = true;
      saveDraft();
      packageFromPage = true;
    }
    url.searchParams.delete("rooms");
    history.replaceState(null, "", url.href);
  }
  updateEnquiry();
  form.hidden = false;
  if (packageFromPage) {
    const title = document.getElementById("enquiryFormTitle");
    title?.focus({ preventScroll: true });
    title?.scrollIntoView({ block: "start", behavior: "instant" });
  }
  window.addEventListener("pageshow", event => {
    if (event.persisted) {
      const restored = restoreDraft();
      if (restored === "missing" || restored === "invalid") resetDraftForm();
    }
    updateEnquiry();
  });
  window.addEventListener("focus", () => {
    if (savedDraftAt !== null && Date.now() - savedDraftAt >= DRAFT_TTL_MS) {
      removeSavedDraft();
      announceDraft(copy.draftExpired);
    }
    updateEnquiry();
  });
})();
