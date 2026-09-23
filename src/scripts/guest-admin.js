(() => {
  'use strict';

  const DAY = 86400000;
  function parseStayDate(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
    const time = Date.parse(`${value}T00:00:00Z`);
    return Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === value ? time : null;
  }
  function malaysiaToday(now = new Date()) {
    return new Date(now.getTime() + 8 * 3600000).toISOString().slice(0, 10);
  }
  function validateStay(value, existing = null, today = malaysiaToday()) {
    const errors = {};
    const start = parseStayDate(value.check_in), end = parseStayDate(value.check_out);
    const minimum = parseStayDate(today), maximum = minimum + 365 * DAY;
    if (start === null) errors.check_in = 'date';
    else if (start < minimum && value.check_in !== existing?.check_in) errors.check_in = 'past';
    else if (start > maximum) errors.check_in = 'future';
    if (end === null) errors.check_out = 'date';
    else if (start !== null && end <= start) errors.check_out = 'after';
    else if (start !== null && end - start > 366 * DAY) errors.check_out = 'duration';
    if (typeof value.guest_name !== 'string' || !value.guest_name.trim()) errors.guest_name = 'name';
    else if (value.guest_name.trim().length > 120) errors.guest_name = 'nameLong';
    const count = Number(value.guest_count);
    if (!Number.isInteger(count) || count < 1 || count > 20) errors.guest_count = 'count';
    if (value.purpose != null && (typeof value.purpose !== 'string' || value.purpose.trim().length > 500)) errors.purpose = 'purpose';
    return errors;
  }
  if (typeof module === 'object' && module.exports) module.exports = { parseStayDate, malaysiaToday, validateStay };
  if (typeof document === 'undefined' || !document.querySelector('[data-guest-admin]')) return;

  const en = document.documentElement.lang.startsWith('en');
  const text = (ms, english) => en ? english : ms;
  const byId = id => document.getElementById(id);
  const pinPanel = byId('guestPinPanel'), pinForm = byId('guestPinForm'), pinStatus = byId('guestPinStatus');
  const pins = [1, 2, 3, 4].map(i => byId(`guestPin${i}`));
  const workspace = byId('guestWorkspace'), form = byId('guestDetailsForm'), formError = byId('guestFormError');
  const saveButton = byId('guestSave'), formTitle = byId('guestFormTitle'), cancelEdit = byId('guestCancelEdit');
  const logoutButton = byId('guestLogout');
  const list = byId('guestList'), listStatus = byId('guestListStatus'), refresh = byId('guestRefresh'), showHistory = byId('guestShowHistory');
  const retrySession = byId('guestSessionRetry'), storageNotice = byId('guestStorageNotice');
  const fields = { check_in: byId('guestCheckIn'), check_out: byId('guestCheckOut'), guest_name: byId('guestName'), guest_count: byId('guestCount'), purpose: byId('guestPurpose') };
  const SESSION_KEY = 'jitra2stay-guest-session';
  const SUCCESS_KEY = 'guest-save-success';
  const home = en ? 'en.html#kalendar' : './#kalendar';
  let session = null, expiryTimer = null, pinBusy = false, pinCooldown = 0, cooldownTimer = null;
  let records = [], editing = null, saving = false, listRequest = 0, pendingDraft = null;
  let lastRequest = { fingerprint: '', id: '' }, authGeneration = 0, sessionChecking = false;
  let sessionCheckController = null;
  let apiUrl = null;
  try {
    const candidate = new URL(window.GUEST_CONFIG?.apiUrl || '');
    if (candidate.protocol === 'https:' || (candidate.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(candidate.hostname))) apiUrl = candidate;
  } catch { /* The page explains missing configuration without exposing a broken form. */ }

  function focus(element) {
    element.focus({ preventScroll: true });
    element.scrollIntoView({ block: 'center', behavior: 'instant' });
  }
  function pinMessage(message, error = false) {
    pinStatus.textContent = message;
    pinStatus.classList.toggle('is-error', error);
  }
  function setPinsEnabled(enabled) { pins.forEach(input => { input.disabled = !enabled; }); }
  function clearPinError() { pins.forEach(input => input.removeAttribute('aria-invalid')); }
  function clearPins() { pins.forEach(input => { input.value = ''; }); }
  function readSession() {
    try {
      const value = JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null');
      return value && typeof value.token === 'string' && value.token && Number.isFinite(Date.parse(value.expires_at)) && Date.parse(value.expires_at) > Date.now() ? value : null;
    } catch { storageNotice.hidden = false; return null; }
  }
  function storeSession() {
    try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(session)); }
    catch { storageNotice.hidden = false; }
  }
  function removeSession() {
    try { sessionStorage.removeItem(SESSION_KEY); } catch { /* In-memory logout still works. */ }
  }
  function showFormError(message, moveFocus = true) {
    formError.textContent = message;
    formError.hidden = false;
    if (moveFocus) focus(formError);
  }
  function clearFieldErrors() {
    Object.values(fields).forEach(input => {
      input.removeAttribute('aria-invalid');
      byId(`${input.id}Error`).hidden = true;
      byId(`${input.id}Error`).textContent = '';
    });
    formError.hidden = true;
    formError.textContent = '';
  }
  function readForm() {
    return Object.fromEntries(Object.entries(fields).map(([key, input]) => [key, input.value]));
  }
  function hasDraft() {
    return Object.values(readForm()).some(value => value !== '');
  }
  function resetForm() {
    editing = null;
    form.reset();
    clearFieldErrors();
    cancelEdit.hidden = true;
    formTitle.textContent = text('Tambah tetamu', 'Add a guest');
    lastRequest = { fingerprint: '', id: '' };
    updateDateHints();
  }
  function captureDraft() {
    return hasDraft() ? { value: readForm(), editing, lastRequest: { ...lastRequest } } : null;
  }
  function clearPrivateContent(preserveDraft = false) {
    if (preserveDraft) pendingDraft = captureDraft();
    else pendingDraft = null;
    workspace.hidden = true;
    list.replaceChildren();
    records = [];
    listStatus.textContent = '';
    listRequest++;
    resetForm();
    setFormBusy(false);
  }
  function lock(message, preserveDraft = true) {
    authGeneration++;
    stopSessionCheck();
    session = null;
    clearTimeout(expiryTimer);
    removeSession();
    clearPrivateContent(preserveDraft);
    pinPanel.hidden = false;
    clearPins();
    clearPinError();
    pinBusy = false;
    retrySession.hidden = true;
    setPinsEnabled(Boolean(apiUrl) && !pinCooldown);
    pinMessage(message || text('Sesi tamat. Masukkan PIN semula untuk sambung.', 'Your session expired. Enter your PIN again to continue.'), true);
    if (!pins[0].disabled) focus(pins[0]);
  }
  function scheduleExpiry() {
    clearTimeout(expiryTimer);
    if (session) expiryTimer = setTimeout(() => lock(), Math.max(0, Math.min(Date.parse(session.expires_at) - Date.now(), 2147483647)));
  }
  function apiError(status, code, retryAfter = 0) {
    const error = new Error(code || 'request_failed');
    error.status = status;
    error.code = code || 'request_failed';
    error.retryAfter = retryAfter;
    return error;
  }
  async function api(action, { data, privateRequest = false, signal } = {}) {
    if (!apiUrl) throw apiError(0, 'not_configured');
    if (privateRequest && (!session || Date.parse(session.expires_at) <= Date.now())) throw apiError(401, 'session_expired');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    const abort = () => controller.abort();
    signal?.addEventListener('abort', abort, { once: true });
    const url = new URL(apiUrl);
    const headers = { Accept: 'application/json' };
    if (privateRequest) headers.Authorization = `Bearer ${session.token}`;
    const options = { method: data ? 'POST' : 'GET', headers, signal: controller.signal, cache: 'no-store', credentials: 'omit', referrerPolicy: 'no-referrer' };
    if (data) { headers['Content-Type'] = 'application/json'; options.body = JSON.stringify({ action, ...data }); }
    else { url.searchParams.set('action', action); if (action === 'guests' && showHistory.checked) url.searchParams.set('past', '1'); }
    try {
      const response = await fetch(url, options);
      let body;
      try { body = await response.json(); } catch { throw apiError(response.status, 'invalid_response'); }
      if (!response.ok) {
        const code = typeof body.error === 'string' ? body.error : body.error?.code || body.code;
        const retry = Number(response.headers.get('Retry-After') || body.retry_after || body.error?.retry_after || 0);
        throw apiError(response.status, code, retry);
      }
      return body;
    } catch (error) {
      if (error.status !== undefined) throw error;
      throw apiError(0, controller.signal.aborted ? 'timeout' : 'network');
    } finally {
      clearTimeout(timeout);
      signal?.removeEventListener('abort', abort);
    }
  }
  function failureMessage(error) {
    if (error.status === 429) return text('Terlalu banyak cubaan. Tunggu sebentar, kemudian cuba semula. Maklumat borang masih ada.', 'Too many attempts. Please wait a moment and try again. Your form details are still here.');
    if (error.status === 409 && /stale|version|changed/i.test(error.code)) return text('Rekod ini sudah berubah. Semak senarai terkini dan tekan Ubah pada rekod itu sebelum menyimpan semula.', 'This record has changed. Review the refreshed list and choose Edit on that record before saving again.');
    if (error.status === 409 && error.code === 'request_conflict') return text('Cubaan simpan ini sudah digunakan dengan maklumat berbeza. Muat semula senarai dan semak rekod sebelum mencuba lagi.', 'This save attempt was already used with different details. Refresh the list and review the record before trying again.');
    if (error.status === 409) return text('Tarikh ini bertindih dengan penginapan lain. Semak senarai tetamu atau pilih tarikh lain. Maklumat anda belum disimpan.', 'These dates overlap another stay. Check the guest list or choose other dates. Your details have not been saved.');
    if (error.status === 400 || error.status === 422) return text('Semak semula tarikh, nama dan bilangan orang. Tujuan boleh dikosongkan.', 'Please check the dates, name and number of guests. The purpose can be left empty.');
    if (error.status === 404) return text('Rekod ini tidak lagi ditemui. Muat semula senarai untuk melihat maklumat terkini.', 'This record can no longer be found. Refresh the list to see the latest details.');
    if (error.code === 'timeout') return text('Sambungan mengambil masa terlalu lama. Status simpanan belum dapat dipastikan. Cuba simpan semula; rekod yang sama tidak akan digandakan.', 'The connection took too long. The save status could not be confirmed. Try saving again; the same record will not be duplicated.');
    if (error.status === 0) return text('Tidak dapat menghubungi pelayan. Semak internet dan cuba lagi. Maklumat borang masih ada.', 'Could not reach the server. Check your internet connection and try again. Your form details are still here.');
    return text('Pelayan belum dapat menyelesaikan permintaan ini. Cuba semula sebentar lagi. Maklumat borang masih ada.', 'The server could not complete this request. Please try again shortly. Your form details are still here.');
  }
  function cooldown(seconds) {
    pinCooldown = Date.now() + Math.max(1, Math.min(Number.isFinite(seconds) && seconds > 0 ? seconds : 60, 3600)) * 1000;
    clearInterval(cooldownTimer);
    setPinsEnabled(false);
    const tick = () => {
      const left = Math.ceil((pinCooldown - Date.now()) / 1000);
      if (left > 0) pinMessage(text(`Terlalu banyak cubaan. Cuba semula dalam ${left} saat.`, `Too many attempts. Try again in ${left} seconds.`), true);
      else {
        clearInterval(cooldownTimer);
        pinCooldown = 0;
        clearPins();
        setPinsEnabled(true);
        pinMessage(text('Boleh cuba semula. Masukkan 4 digit PIN.', 'You can try again. Enter all 4 PIN digits.'));
        focus(pins[0]);
      }
    };
    tick();
    cooldownTimer = setInterval(tick, 1000);
  }
  function openWorkspace() {
    pinPanel.hidden = true;
    workspace.hidden = false;
    clearPins();
    clearPinError();
    retrySession.hidden = true;
    if (pendingDraft) {
      const draft = pendingDraft;
      pendingDraft = null;
      editing = draft.editing;
      lastRequest = draft.lastRequest || { fingerprint: '', id: '' };
      Object.entries(draft.value).forEach(([key, value]) => { fields[key].value = value; });
      cancelEdit.hidden = !editing;
      formTitle.textContent = editing ? text('Ubah rekod tetamu', 'Edit guest record') : text('Tambah tetamu', 'Add a guest');
    }
    updateDateHints();
    scheduleExpiry();
    focus(formTitle);
    loadGuests();
  }
  async function login() {
    const pin = pins.map(input => input.value).join('');
    if (pinBusy || pinCooldown || !/^\d{4}$/.test(pin)) return;
    const generation = authGeneration;
    pinBusy = true;
    setPinsEnabled(false);
    clearPinError();
    retrySession.hidden = true;
    pinForm.setAttribute('aria-busy', 'true');
    pinMessage(text('Menyemak PIN…', 'Checking your PIN…'));
    try {
      const result = await api('login', { data: { pin } });
      if (generation !== authGeneration) return;
      if (typeof result.token !== 'string' || !result.token || !Number.isFinite(Date.parse(result.expires_at)) || Date.parse(result.expires_at) <= Date.now()) throw apiError(502, 'invalid_response');
      session = { token: result.token, expires_at: result.expires_at };
      storeSession();
      openWorkspace();
    } catch (error) {
      if (generation !== authGeneration) return;
      clearPins();
      if (error.status === 429) cooldown(error.retryAfter);
      else {
        setPinsEnabled(true);
        if (error.status === 401 || error.status === 403) {
          pins.forEach(input => input.setAttribute('aria-invalid', 'true'));
          pinMessage(text('PIN tidak betul. Cuba masukkan semula.', 'That PIN is incorrect. Please try again.'), true);
        } else pinMessage(text('Tidak dapat menyemak PIN. Semak internet dan masukkan PIN semula.', 'Could not check your PIN. Check your connection and enter it again.'), true);
        focus(pins[0]);
      }
    } finally {
      pinBusy = false;
      pinForm.removeAttribute('aria-busy');
    }
  }
  pins.forEach((input, index) => {
    input.addEventListener('focus', () => input.select());
    input.addEventListener('input', () => {
      clearPinError();
      const digits = input.value.replace(/[^0-9]/g, '');
      if (digits.length > 1) {
        digits.slice(0, 4 - index).split('').forEach((digit, offset) => { pins[index + offset].value = digit; });
      } else input.value = digits;
      pinMessage(text('Masukkan 4 digit PIN.', 'Enter all 4 PIN digits.'));
      const next = pins.find(item => !item.value);
      if (next) next.focus();
      login();
    });
    input.addEventListener('keydown', event => {
      if (event.key === 'Backspace' && !input.value && index > 0) { event.preventDefault(); pins[index - 1].value = ''; pins[index - 1].focus(); }
      if (event.key === 'ArrowLeft' && index > 0) { event.preventDefault(); pins[index - 1].focus(); }
      if (event.key === 'ArrowRight' && index < 3) { event.preventDefault(); pins[index + 1].focus(); }
    });
    input.addEventListener('paste', event => {
      event.preventDefault();
      const digits = (event.clipboardData?.getData('text') || '').replace(/[^0-9]/g, '').slice(0, 4);
      if (!digits) return;
      clearPinError();
      const start = digits.length === 4 ? 0 : index;
      digits.slice(0, 4 - start).split('').forEach((digit, offset) => { pins[start + offset].value = digit; });
      (pins.find(item => !item.value) || pins[3]).focus();
      login();
    });
  });
  pinForm.addEventListener('submit', event => { event.preventDefault(); login(); });

  function updateDateHints() {
    const today = malaysiaToday();
    const last = new Date(parseStayDate(today) + 365 * DAY).toISOString().slice(0, 10);
    fields.check_in.min = editing && editing.check_in < today ? editing.check_in : today;
    fields.check_in.max = last;
    const start = parseStayDate(fields.check_in.value), end = parseStayDate(fields.check_out.value);
    fields.check_out.min = new Date((start === null ? parseStayDate(today) : start) + DAY).toISOString().slice(0, 10);
    fields.check_out.max = new Date((start === null ? parseStayDate(today) : start) + 366 * DAY).toISOString().slice(0, 10);
    byId('guestNights').textContent = start !== null && end !== null && end > start
      ? text(`${Math.round((end - start) / DAY)} malam penginapan`, `${Math.round((end - start) / DAY)} night${end - start === DAY ? '' : 's'} staying`)
      : text('Pilih tarikh masuk dan keluar.', 'Choose check-in and check-out dates.');
  }
  fields.check_in.addEventListener('input', updateDateHints);
  fields.check_out.addEventListener('input', updateDateHints);
  Object.values(fields).forEach(input => input.addEventListener('input', () => {
    input.removeAttribute('aria-invalid');
    byId(`${input.id}Error`).hidden = true;
  }));
  const validationMessages = {
    date: text('Pilih tarikh yang sah.', 'Choose a valid date.'),
    past: text('Untuk rekod baharu, pilih hari ini atau tarikh akan datang.', 'For a new record, choose today or a future date.'),
    future: text('Pilih tarikh dalam tempoh 365 hari dari hari ini.', 'Choose a date within the next 365 days.'),
    duration: text('Tempoh penginapan maksimum ialah 366 malam.', 'A stay can be up to 366 nights.'),
    after: text('Tarikh keluar mesti selepas tarikh masuk.', 'Check-out must be after check-in.'),
    name: text('Masukkan nama tetamu atau wakil tempahan.', 'Enter the guest or booking contact name.'),
    nameLong: text('Nama mestilah 120 aksara atau kurang.', 'Keep the name to 120 characters or fewer.'),
    count: text('Masukkan jumlah antara 1 hingga 20 orang.', 'Enter a total between 1 and 20 guests.'),
    purpose: text('Ringkaskan tujuan kepada 500 aksara atau kurang.', 'Keep the purpose to 500 characters or fewer.')
  };
  function uuid() {
    if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 15) | 64;
    bytes[8] = (bytes[8] & 63) | 128;
    const hex = [...bytes].map(value => value.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }
  function goHome(action) {
    try { sessionStorage.setItem(SUCCESS_KEY, JSON.stringify({ action })); } catch { /* Saving succeeded even if the optional toast cannot persist. */ }
    pendingDraft = null;
    clearPrivateContent();
    window.location.assign(home);
  }
  function setFormBusy(busy, action = 'save') {
    saving = busy;
    form.setAttribute('aria-busy', String(busy));
    [...Object.values(fields), saveButton, cancelEdit].forEach(input => { input.disabled = busy; });
    list.querySelectorAll('button').forEach(button => { button.disabled = busy; });
    refresh.disabled = showHistory.disabled = busy;
    logoutButton.disabled = busy;
    logoutButton.textContent = busy && action === 'logout' ? text('Sedang keluar…', 'Signing out…') : text('Keluar', 'Sign out');
    saveButton.textContent = busy && action !== 'logout' ? action === 'cancel' ? text('Sedang membatalkan…', 'Cancelling…') : text('Sedang menyimpan…', 'Saving…') : text('Simpan & kembali ke utama', 'Save & return home');
  }
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (saving) return;
    clearFieldErrors();
    const raw = readForm();
    const errors = validateStay(raw, editing);
    if (Object.keys(errors).length) {
      Object.entries(errors).forEach(([key, code]) => {
        fields[key].setAttribute('aria-invalid', 'true');
        const error = byId(`${fields[key].id}Error`);
        error.textContent = validationMessages[code];
        error.hidden = false;
      });
      focus(fields[Object.keys(errors)[0]]);
      return;
    }
    const data = { ...raw, guest_name: raw.guest_name.trim(), guest_count: Number(raw.guest_count), purpose: raw.purpose.trim() };
    if (editing) { data.id = editing.id; data.version = editing.version; }
    const fingerprint = JSON.stringify(data);
    if (lastRequest.fingerprint !== fingerprint) lastRequest = { fingerprint, id: uuid() };
    data.request_id = lastRequest.id;
    const wasEditing = Boolean(editing), generation = authGeneration;
    setFormBusy(true);
    try {
      const result = await api('save', { data, privateRequest: true });
      if (generation !== authGeneration) return;
      if (!result.guest?.id) throw apiError(502, 'invalid_response');
      goHome(wasEditing ? 'updated' : 'created');
    } catch (error) {
      if (generation !== authGeneration) return;
      if (error.status === 401) lock(text('Sesi tamat. Masukkan PIN semula; maklumat borang akan dikembalikan.', 'Your session expired. Enter your PIN again; your form details will be restored.'));
      else {
        showFormError(failureMessage(error));
        if (error.status === 409 || error.status === 404) loadGuests();
      }
    } finally { if (generation === authGeneration) setFormBusy(false); }
  });
  cancelEdit.addEventListener('click', () => { resetForm(); focus(formTitle); });

  function node(tag, className, value) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (value !== undefined) element.textContent = value;
    return element;
  }
  function formatDate(value) {
    const time = parseStayDate(value);
    return time === null ? '—' : new Intl.DateTimeFormat(en ? 'en-MY' : 'ms-MY', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(time));
  }
  function editGuest(record) {
    if (saving) return;
    editing = record;
    clearFieldErrors();
    Object.entries(fields).forEach(([key, input]) => { input.value = record[key] ?? ''; });
    lastRequest = { fingerprint: '', id: '' };
    formTitle.textContent = text('Ubah rekod tetamu', 'Edit guest record');
    cancelEdit.hidden = false;
    updateDateHints();
    focus(formTitle);
  }
  function cancelGuest(record, card, button) {
    if (saving) return;
    const previous = card.querySelector('.guest-cancel-confirm');
    if (previous) { focus(previous.querySelector('button')); return; }
    const panel = node('div', 'guest-cancel-confirm');
    const explanation = node('p', '', text('Batalkan penginapan ini? Tarikh akan dibuka semula pada kalendar.', 'Cancel this stay? Its dates will become available again on the calendar.'));
    const actions = node('div', 'guest-record-actions');
    const confirm = node('button', 'guest-button guest-button-danger', text('Ya, batalkan', 'Yes, cancel stay'));
    const back = node('button', 'guest-button guest-button-secondary', text('Kekalkan rekod', 'Keep this record'));
    confirm.type = back.type = 'button';
    confirm.dataset.guestCancelConfirm = record.id;
    back.addEventListener('click', () => { panel.remove(); button.focus(); });
    confirm.addEventListener('click', async () => {
      if (saving || confirm.disabled) return;
      setFormBusy(true, 'cancel');
      confirm.textContent = text('Membatalkan…', 'Cancelling…');
      const generation = authGeneration;
      try {
        await api('cancel', { data: { id: record.id, version: record.version }, privateRequest: true });
        if (generation === authGeneration) goHome('cancelled');
      } catch (error) {
        if (generation !== authGeneration) return;
        if (error.status === 401) lock();
        else {
          explanation.textContent = error.status === 409 ? text('Rekod ini sudah berubah. Muat semula senarai dan semak rekod sebelum membatalkannya.', 'This record has changed. Refresh the list and review it before cancelling.') : error.status === 0 ? text('Pembatalan belum dapat dipastikan. Semak internet dan muat semula senarai untuk melihat status terkini.', 'The cancellation could not be confirmed. Check your connection and refresh the list to see its current status.') : failureMessage(error);
          explanation.setAttribute('role', 'alert');
          confirm.textContent = text('Cuba batalkan semula', 'Try cancelling again');
          explanation.tabIndex = -1;
          focus(explanation);
        }
      } finally { if (generation === authGeneration) setFormBusy(false); }
    });
    actions.append(confirm, back);
    panel.append(explanation, actions);
    card.append(panel);
    focus(confirm);
  }
  function renderGuests() {
    list.replaceChildren();
    const today = malaysiaToday();
    records.forEach(record => {
      const past = record.check_out <= today, cancelled = record.status === 'cancelled';
      const card = node('article', `guest-record${past || cancelled ? ' is-past' : ''}`);
      const heading = node('div', 'guest-record-heading');
      heading.append(node('h3', '', record.guest_name), node('span', 'guest-record-tag', cancelled ? text('Dibatalkan', 'Cancelled') : past ? text('Selesai', 'Past stay') : record.check_in <= today ? text('Sedang menginap', 'Staying now') : text('Akan datang', 'Upcoming')));
      card.append(heading, node('p', 'guest-record-dates', `${formatDate(record.check_in)} → ${formatDate(record.check_out)}`), node('p', 'guest-record-count', text(`${record.guest_count} orang`, `${record.guest_count} guest${record.guest_count === 1 ? '' : 's'}`)));
      if (record.purpose) card.append(node('p', 'guest-record-purpose', record.purpose));
      if (!cancelled) {
        const actions = node('div', 'guest-record-actions');
        const edit = node('button', 'guest-button guest-button-secondary', text('Ubah', 'Edit'));
        const cancel = node('button', 'guest-button guest-button-secondary', text('Batalkan', 'Cancel stay'));
        edit.type = cancel.type = 'button';
        edit.disabled = cancel.disabled = saving;
        edit.disabled = cancel.disabled = saving;
        edit.dataset.guestEdit = cancel.dataset.guestCancel = record.id;
        edit.setAttribute('aria-label', text(`Ubah rekod ${record.guest_name}`, `Edit record for ${record.guest_name}`));
        cancel.setAttribute('aria-label', text(`Batalkan penginapan ${record.guest_name}`, `Cancel stay for ${record.guest_name}`));
        edit.addEventListener('click', () => editGuest(record));
        cancel.addEventListener('click', () => cancelGuest(record, card, cancel));
        actions.append(edit, cancel);
        card.append(actions);
      }
      list.append(card);
    });
  }
  async function loadGuests() {
    if (!session) return;
    const request = ++listRequest, generation = authGeneration;
    refresh.disabled = true;
    list.setAttribute('aria-busy', 'true');
    listStatus.classList.remove('is-error');
    listStatus.textContent = text('Memuatkan senarai tetamu…', 'Loading guest records…');
    try {
      const result = await api('guests', { privateRequest: true });
      if (generation !== authGeneration || request !== listRequest) return;
      if (!Array.isArray(result.guests)) throw apiError(502, 'invalid_response');
      records = result.guests;
      renderGuests();
      listStatus.textContent = records.length ? text(`${records.length} rekod penginapan.`, `${records.length} stay record${records.length === 1 ? '' : 's'}.`) : text('Belum ada rekod untuk dipaparkan. Tambah tetamu menggunakan borang ini.', 'No records to show yet. Add a guest using this form.');
    } catch (error) {
      if (generation !== authGeneration || request !== listRequest) return;
      if (error.status === 401) lock();
      else {
        listStatus.textContent = text('Senarai tidak dapat dimuatkan. Tekan Muat semula untuk cuba lagi.', 'The list could not be loaded. Choose Refresh to try again.');
        listStatus.classList.add('is-error');
      }
    } finally {
      if (request === listRequest) { refresh.disabled = saving; list.removeAttribute('aria-busy'); }
    }
  }
  refresh.addEventListener('click', loadGuests);
  showHistory.addEventListener('change', loadGuests);
  logoutButton.addEventListener('click', async () => {
    if (saving) return;
    const generation = authGeneration;
    setFormBusy(true, 'logout');
    try {
      await api('logout', { data: {}, privateRequest: true });
      if (generation !== authGeneration) return;
      lock(text('Anda sudah keluar. Masukkan PIN untuk masuk semula.', 'You have signed out. Enter your PIN to sign in again.'), false);
      pinStatus.classList.remove('is-error');
    } catch (error) {
      if (generation !== authGeneration) return;
      if (error.status === 401) lock(undefined, false);
      else showFormError(text('Belum dapat mengesahkan anda sudah keluar. Sesi masih aktif. Semak sambungan dan tekan Keluar sekali lagi.', 'Sign-out could not be confirmed. Your session is still active. Check your connection and choose Sign out again.'));
    } finally { if (generation === authGeneration) setFormBusy(false); }
  });

  function stopSessionCheck() {
    sessionCheckController?.abort();
    sessionCheckController = null;
    sessionChecking = false;
  }
  async function validateSession() {
    if (sessionChecking) return;
    if (!apiUrl) {
      pinMessage(text('Borang belum disambungkan kepada pangkalan data. Sila cuba semula selepas persediaan selesai.', 'This form is not connected to the database yet. Please try again after setup is complete.'), true);
      return;
    }
    if (!session) {
      setPinsEnabled(true);
      pinMessage(text('Masukkan 4 digit PIN.', 'Enter all 4 PIN digits.'));
      return;
    }
    sessionChecking = true;
    const generation = authGeneration;
    const controller = new AbortController();
    sessionCheckController = controller;
    pinMessage(text('Menyemak sesi anda…', 'Checking your session…'));
    setPinsEnabled(false);
    retrySession.hidden = true;
    try {
      const result = await api('session', { privateRequest: true, signal: controller.signal });
      if (generation !== authGeneration) return;
      if (!Number.isFinite(Date.parse(result.expires_at)) || Date.parse(result.expires_at) <= Date.now()) throw apiError(401, 'session_expired');
      session.expires_at = result.expires_at;
      storeSession();
      openWorkspace();
    } catch (error) {
      if (generation !== authGeneration) return;
      if (error.status === 401 || error.status === 403) lock();
      else {
        pinMessage(text('Belum dapat menyemak sesi. Semak sambungan internet dan cuba sambung semula.', 'Could not check your session. Check your connection and try connecting again.'), true);
        retrySession.hidden = false;
      }
    } finally {
      if (sessionCheckController === controller) {
        sessionChecking = false;
        sessionCheckController = null;
      }
    }
  }
  retrySession.addEventListener('click', validateSession);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && session && Date.parse(session.expires_at) <= Date.now()) lock();
  });
  window.addEventListener('pagehide', () => {
    // A back/forward-cache snapshot must not retain visible private guest details.
    authGeneration++;
    stopSessionCheck();
    clearPrivateContent(false);
  });
  window.addEventListener('pageshow', event => {
    if (event.persisted) {
      pinPanel.hidden = false;
      session = readSession();
      validateSession();
    }
  });
  session = readSession();
  updateDateHints();
  validateSession();
})();
