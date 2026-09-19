(() => {
  "use strict";
  if (typeof document === "undefined") return;

  const section = document.getElementById("galeri");
  const grid = document.getElementById("galleryGrid");
  const controls = document.getElementById("galleryControls");
  const results = document.getElementById("galleryResults");
  const more = document.getElementById("galleryMore");
  if (!section || !grid || !controls || !results || !more) return;

  const en = document.documentElement.lang.startsWith("en");
  const filters = Array.from(controls.querySelectorAll("[data-gallery-filter]"));
  const items = Array.from(grid.querySelectorAll(".gallery-card")).map(card => ({
    card, anchor: card.querySelector(".gallery-trigger"), category: card.dataset.galleryCategory
  })).filter(item => item.anchor);
  if (!items.length || !filters.length) return;
  const initialCount = 6;
  let activeCategory = "all";
  let activeItems = items.slice();
  let expanded = false;

  function renderGrid() {
    activeItems = items.filter(item => activeCategory === "all" || item.category === activeCategory);
    const visible = new Set((expanded ? activeItems : activeItems.slice(0, initialCount)).map(item => item.card));
    items.forEach(item => { item.card.hidden = !visible.has(item.card); });
    filters.forEach(button => button.setAttribute("aria-pressed", String(button.dataset.galleryFilter === activeCategory)));
    const categoryLabel = filters.find(button => button.dataset.galleryFilter === activeCategory)?.textContent.trim() || "";
    results.textContent = en
      ? `${visible.size} of ${activeItems.length} photos · ${categoryLabel}`
      : `${visible.size} daripada ${activeItems.length} gambar · ${categoryLabel}`;
    more.hidden = activeItems.length <= initialCount;
    more.setAttribute("aria-expanded", String(expanded));
    more.textContent = expanded
      ? en ? "Show fewer photos" : "Ringkaskan galeri"
      : en ? `Show ${Math.max(0, activeItems.length - initialCount)} more photos` : `Lihat ${Math.max(0, activeItems.length - initialCount)} gambar lagi`;
  }

  filters.forEach(button => button.addEventListener("click", () => {
    activeCategory = button.dataset.galleryFilter;
    expanded = false;
    renderGrid();
  }));
  more.addEventListener("click", () => { expanded = !expanded; renderGrid(); });
  renderGrid();
  controls.hidden = false;

  const dialog = document.getElementById("galleryDialog");
  const image = document.getElementById("galleryImage");
  const stage = document.getElementById("galleryImageStage");
  const caption = document.getElementById("galleryCaption");
  const roomDescription = document.getElementById("galleryDescription");
  const thumbnails = document.getElementById("galleryThumbnails");
  const close = document.getElementById("galleryClose");
  const previous = document.getElementById("galleryPrev");
  const next = document.getElementById("galleryNext");
  const count = document.getElementById("galleryCount");
  const status = document.getElementById("galleryImageStatus");
  const original = document.getElementById("galleryOriginalLink");
  const retry = document.getElementById("galleryRetry");
  if (!dialog || typeof dialog.showModal !== "function" || !image || !stage || !caption || !close || !previous || !next || !count || !status || !original || !retry) return;

  let dialogItems = [];
  let selected = 0;
  let opener = null;
  let previousOverflow = "";
  let requestId = 0;
  let touchStart = null;
  let thumbnailButtons = [];

  function renderThumbnails() {
    if (!thumbnails) return;
    // Build only after opening. The initial page has no thumbnail image nodes,
    // and these small previews never trigger preloading of full-size photos.
    const fragment = document.createDocumentFragment();
    thumbnailButtons = dialogItems.map((item, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "gallery-thumbnail";
      button.dataset.galleryIndex = String(index);
      const title = item.anchor.dataset.caption || item.anchor.querySelector("img")?.alt || "";
      button.setAttribute("aria-label", en
        ? `Show photo ${index + 1} of ${dialogItems.length}: ${title}`
        : `Lihat gambar ${index + 1} daripada ${dialogItems.length}: ${title}`);
      button.setAttribute("aria-controls", "galleryImageStage");
      if (item.anchor.dataset.thumbnail) {
        const preview = document.createElement("img");
        preview.alt = "";
        preview.width = 80;
        preview.height = 60;
        preview.loading = "lazy";
        preview.decoding = "async";
        preview.draggable = false;
        preview.src = item.anchor.dataset.thumbnail;
        button.append(preview);
      }
      const number = document.createElement("span");
      number.className = "gallery-thumbnail-number";
      number.textContent = String(index + 1);
      number.setAttribute("aria-hidden", "true");
      button.append(number);
      // Selection updates existing nodes, preserving native button focus.
      button.addEventListener("click", () => showImage(index));
      fragment.append(button);
      return button;
    });
    thumbnails.replaceChildren(fragment);
    thumbnails.hidden = false;
    thumbnails.scrollLeft = 0;
  }

  function updateThumbnails() {
    thumbnailButtons.forEach((button, index) => {
      if (index === selected) button.setAttribute("aria-current", "true");
      else button.removeAttribute("aria-current");
    });
    const current = thumbnailButtons[selected];
    if (!thumbnails || !current) return;
    const bounds = thumbnails.getBoundingClientRect();
    const target = current.getBoundingClientRect();
    // Scroll this strip only: scrollIntoView would also move the dialog/page.
    // Immediate movement avoids animation, including under reduced motion.
    if (target.left < bounds.left + 6) thumbnails.scrollLeft += target.left - bounds.left - 6;
    else if (target.right > bounds.right - 6) thumbnails.scrollLeft += target.right - bounds.right + 6;
  }

  function showImage(index) {
    selected = (index + dialogItems.length) % dialogItems.length;
    const anchor = dialogItems[selected].anchor;
    const description = anchor.dataset.caption || anchor.querySelector("img")?.alt || "";
    const currentRequest = ++requestId;
    caption.textContent = description;
    if (roomDescription) {
      roomDescription.textContent = anchor.dataset.description || "";
      roomDescription.hidden = !roomDescription.textContent;
    }
    updateThumbnails();
    count.textContent = `${selected + 1} / ${dialogItems.length}`;
    image.hidden = true;
    image.alt = description;
    original.href = anchor.dataset.original || anchor.href;
    previous.hidden = next.hidden = dialogItems.length < 2;
    retry.hidden = true;
    stage.dataset.state = "loading";
    stage.setAttribute("aria-busy", "true");
    status.textContent = en ? "Loading photo…" : "Memuatkan gambar…";

    // A separate loader prevents a late response replacing a newer selection.
    const loader = new Image();
    loader.decoding = "async";
    loader.onload = () => {
      if (currentRequest !== requestId) return;
      image.src = loader.src;
      image.hidden = false;
      stage.dataset.state = "ready";
      stage.setAttribute("aria-busy", "false");
      status.textContent = "";
    };
    loader.onerror = () => {
      if (currentRequest !== requestId) return;
      stage.dataset.state = "error";
      stage.setAttribute("aria-busy", "false");
      status.textContent = en ? "This photo could not load. Try again or open the original photo below." : "Gambar ini tidak dapat dimuatkan. Cuba lagi atau buka gambar asal di bawah.";
      retry.hidden = false;
    };
    loader.src = anchor.dataset.full || anchor.href;
  }

  function openGallery(event, item, collection) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const index = collection.indexOf(item);
    if (index < 0) return;
    dialogItems = collection.slice();
    opener = event.currentTarget;
    previousOverflow = document.body.style.overflow;
    showImage(index);
    try { dialog.showModal(); }
    catch { requestId++; return; }
    event.preventDefault();
    document.body.style.overflow = "hidden";
    dialog.scrollTop = 0;
    renderThumbnails();
    updateThumbnails();
    close.focus();
  }
  items.forEach(item => item.anchor.addEventListener("click", event => openGallery(event, item, activeItems)));
  // Contextual links open the matching real photo and its category without
  // changing the gallery filter or expansion the guest already chose.
  document.querySelectorAll('.amenity-photo[data-gallery-photo]').forEach(link => {
    const item = items.find(entry => entry.anchor.dataset.galleryPhoto === link.dataset.galleryPhoto);
    if (!item) return;
    link.addEventListener('click', event => openGallery(event, item, items.filter(entry => entry.category === item.category)));
  });

  close.addEventListener("click", () => dialog.close());
  previous.addEventListener("click", () => showImage(selected - 1));
  next.addEventListener("click", () => showImage(selected + 1));
  retry.addEventListener("click", () => {
    // Retrying hides this control, so keep keyboard focus on a persistent control.
    close.focus({ preventScroll: true });
    showImage(selected);
  });
  dialog.addEventListener("keydown", event => {
    if (event.key === "Tab") {
      const focusable = Array.from(dialog.querySelectorAll("button:not([disabled]), a[href], [tabindex]:not([tabindex='-1'])"))
        .filter(element => !element.closest("[hidden]") && element.getClientRects().length > 0);
      const first = focusable[0];
      const last = focusable.at(-1);
      const atBoundary = event.shiftKey ? document.activeElement === first : document.activeElement === last;
      if (first && (atBoundary || !focusable.includes(document.activeElement))) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      }
    }
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      showImage(selected + (event.key === "ArrowLeft" ? -1 : 1));
    }
  });
  dialog.addEventListener("click", event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  dialog.addEventListener("close", () => {
    requestId++;
    touchStart = null;
    document.body.style.overflow = previousOverflow;
    stage.setAttribute("aria-busy", "false");
    if (thumbnails) {
      thumbnails.replaceChildren();
      thumbnails.hidden = true;
      thumbnailButtons = [];
    }
    if (opener?.isConnected && !opener.closest("[hidden]")) opener.focus();
    else filters.find(button => button.dataset.galleryFilter === activeCategory)?.focus();
  });

  // Only horizontal, single-finger gestures switch photos; vertical scrolling and pinch zoom remain native.
  stage.addEventListener("touchstart", event => {
    touchStart = event.touches.length === 1
      ? { x: event.touches[0].clientX, y: event.touches[0].clientY, at: Date.now() }
      : null;
  }, { passive: true });
  stage.addEventListener("touchmove", event => {
    if (!touchStart) return;
    if (event.touches.length !== 1 || Math.abs(event.touches[0].clientY - touchStart.y) > 40) touchStart = null;
  }, { passive: true });
  stage.addEventListener("touchend", event => {
    if (!touchStart || event.touches.length || event.changedTouches.length !== 1) { touchStart = null; return; }
    const dx = event.changedTouches[0].clientX - touchStart.x;
    const dy = event.changedTouches[0].clientY - touchStart.y;
    const duration = Date.now() - touchStart.at;
    touchStart = null;
    if (duration <= 1000 && Math.abs(dx) >= 60 && Math.abs(dx) > Math.abs(dy) * 1.5) showImage(selected + (dx < 0 ? 1 : -1));
  }, { passive: true });
  stage.addEventListener("touchcancel", () => { touchStart = null; }, { passive: true });
})();
