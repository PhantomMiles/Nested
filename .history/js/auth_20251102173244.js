// js/auth.js
document.addEventListener("DOMContentLoaded", () => {
  const loginLink = document.getElementById("loginLink");
  const signupLink = document.getElementById("signupLink");
  const userProfile = document.getElementById("userProfile");
  const profileBtn = document.getElementById("profileBtn");
  const profileDropdown = document.getElementById("profileDropdown");
  const profileUserName = document.getElementById("profileUserName");
  const mobileUserInfo = document.getElementById("mobileUserInfo");
  const mobileUserName = document.getElementById("mobileUserName");
  const mobileAuthLinks = document.getElementById("mobileAuthLinks");
  const mobileProfileLinks = document.getElementById("mobileProfileLinks");

  const loggedInEmail = localStorage.getItem("loggedInUser");

  // Navbar / auth state update
  if (loggedInEmail) {
    const storedUser = localStorage.getItem("user_" + loggedInEmail);
    const userName = storedUser ? (JSON.parse(storedUser).name || JSON.parse(storedUser).firstName || loggedInEmail) : loggedInEmail;
    loginLink?.classList.add("hidden");
    signupLink?.classList.add("hidden");
    userProfile?.classList.remove("hidden");
    profileUserName && (profileUserName.textContent = userName);
    mobileAuthLinks?.classList.add("hidden");
    mobileUserInfo?.classList.remove("hidden");
    mobileProfileLinks?.classList.remove("hidden");
    mobileUserName && (mobileUserName.textContent = userName);
  }

  if (profileBtn && profileDropdown) {
    profileBtn.addEventListener("click", (e) => { e.stopPropagation(); profileDropdown.classList.toggle("hidden"); });
    document.addEventListener("click", (e) => { if (!userProfile?.contains(e.target)) profileDropdown.classList.add("hidden"); });
  }

  function logoutUser() {
    localStorage.removeItem("loggedInUser");
    location.reload();
  }
  document.getElementById("logoutLink")?.addEventListener("click", logoutUser);
  document.getElementById("mobileLogout")?.addEventListener("click", logoutUser);

  // helpers
  function getLoggedInEmail() { return localStorage.getItem("loggedInUser"); }
  function getUserRecord(email) { try { return JSON.parse(localStorage.getItem("user_" + email) || "{}"); } catch { return {}; } }
  function saveUserRecord(email, data) { if (!email) return; localStorage.setItem("user_" + email, JSON.stringify(data)); }

  // Modal helper: uses existing #infoModal on pages if present; otherwise creates one.
  function createOrGetInfoModal() {
    let modal = document.getElementById("infoModal");
    const baseInner = `
      <div class="absolute inset-0 bg-black/40"></div>
      <div class="relative z-10 w-11/12 max-w-md p-6 bg-white rounded-lg shadow-lg">
        <h3 id="modalTitle" class="mb-2 text-lg font-semibold">Notice</h3>
        <p id="modalMessage" class="mb-4 text-sm text-gray-700"></p>
        <div class="text-right">
          <button id="modalOk" class="px-4 py-2 text-white bg-indigo-700 rounded-md">OK</button>
        </div>
      </div>
    `;
    if (modal) {
      try {
        // populate if missing inner structure
        if (!modal.querySelector('#modalTitle') || !modal.querySelector('#modalMessage') || !modal.querySelector('#modalOk')) {
          modal.innerHTML = baseInner;
        }
        return modal;
      } catch (e) {
        try { modal.remove(); } catch {}
        modal = null;
      }
    }

    modal = document.createElement("div");
    modal.id = "infoModal";
    modal.className = "fixed inset-0 z-50 items-center justify-center hidden";
    modal.innerHTML = baseInner;
    document.body.appendChild(modal);
    return modal;
  }

  // simple informational modal (OK)
  function showModal(message, options = {}) {
    const modal = createOrGetInfoModal();
    const title = options.title || "Notice";
    const cb = typeof options.callback === "function" ? options.callback : null;
    modal.querySelector("#modalTitle").textContent = title;
    modal.querySelector("#modalMessage").textContent = String(message ?? "");
    modal.classList.remove("hidden");
    modal.classList.add("flex");

    const ok = modal.querySelector("#modalOk");

    function cleanup() {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
      ok.removeEventListener("click", onOk);
      document.removeEventListener("keydown", escHandler);
    }
    function onOk() {
      cleanup();
      if (cb) cb();
    }
    function escHandler(e) { if (e.key === "Escape") onOk(); }

    ok.addEventListener("click", onOk);
    document.addEventListener("keydown", escHandler);
  }

  // confirm modal with Cancel + Confirm
  function showConfirmModal(message, options = {}, onConfirm) {
    // options: { title, confirmText, cancelText }
    const title = options.title || "Please confirm";
    const confirmText = options.confirmText || "Confirm";
    const cancelText = options.cancelText || "Cancel";

    // reuse the #infoModal container but replace innerHTML with confirm layout
    let modal = document.getElementById("infoModal");
    if (!modal) modal = createOrGetInfoModal();

    modal.classList.remove("hidden");
    modal.classList.add("flex");
    modal.innerHTML = `
      <div class="absolute inset-0 bg-black/40"></div>
      <div class="relative z-10 w-11/12 max-w-md p-6 bg-white rounded-lg shadow-lg">
        <h3 id="modalTitle" class="mb-2 text-lg font-semibold">${escapeHtml(title)}</h3>
        <p id="modalMessage" class="mb-4 text-sm text-gray-700">${escapeHtml(String(message ?? ""))}</p>
        <div class="flex justify-end gap-3">
          <button id="modalCancel" class="px-4 py-2 border rounded bg-white text-gray-700">${escapeHtml(cancelText)}</button>
          <button id="modalConfirm" class="px-4 py-2 text-white bg-red-600 rounded">${escapeHtml(confirmText)}</button>
        </div>
      </div>
    `;

    const btnConfirm = modal.querySelector("#modalConfirm");
    const btnCancel = modal.querySelector("#modalCancel");

    function cleanup() {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
      btnConfirm.removeEventListener("click", onConfirmClick);
      btnCancel.removeEventListener("click", onCancelClick);
      document.removeEventListener("keydown", escHandler);
      // restore default simple modal markup so other showModal calls work
      modal.innerHTML = `
        <div class="absolute inset-0 bg-black/40"></div>
        <div class="relative z-10 w-11/12 max-w-md p-6 bg-white rounded-lg shadow-lg">
          <h3 id="modalTitle" class="mb-2 text-lg font-semibold">Notice</h3>
          <p id="modalMessage" class="mb-4 text-sm text-gray-700"></p>
          <div class="text-right">
            <button id="modalOk" class="px-4 py-2 text-white bg-indigo-700 rounded-md">OK</button>
          </div>
        </div>
      `;
    }

    function onConfirmClick() {
      cleanup();
      if (typeof onConfirm === "function") onConfirm();
    }
    function onCancelClick() { cleanup(); }

    function escHandler(e) { if (e.key === "Escape") onCancelClick(); }

    btnConfirm.addEventListener("click", onConfirmClick);
    btnCancel.addEventListener("click", onCancelClick);
    document.addEventListener("keydown", escHandler);
  }

  // small helper to avoid injecting raw HTML
  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  // expose modals
  window.showModal = showModal;
  window.showConfirmModal = showConfirmModal;
  // keep backward compatibility for code that used window.alert
  window.alert = function (msg) { showModal(String(msg)); };

  // ===== Delete account handlers =====
  function wipeUserLocalData(fullWipe = true) {
    const email = localStorage.getItem("loggedInUser");
    if (!email) {
      // nothing specific, but if fullWipe clear everything
      if (fullWipe) localStorage.clear();
      return;
    }
    if (fullWipe) {
      // clear entire localStorage (user asked to wipe off local storage)
      localStorage.clear();
    } else {
      // remove user-specific keys only
      localStorage.removeItem("user_" + email);
      localStorage.removeItem("loggedInUser");
      localStorage.removeItem("nestedProfile");
      localStorage.removeItem("nestedProfile_lastUpdated");
    }
  }

  // delegate click: elements with id #deleteAccountBtn, #mobileDeleteAccount or data-delete-account
  document.addEventListener("click", (e) => {
    const del = e.target.closest('#deleteAccountBtn, #mobileDeleteAccount, [data-delete-account]');
    if (!del) return;
    // show confirmation modal
    showConfirmModal(
      "This will remove all user data from your browser and sign you out. This action cannot be undone. Do you want to proceed?",
      { title: "Delete account", confirmText: "Delete", cancelText: "Cancel" },
      () => {
        // perform wipe and redirect to index
        try {
          wipeUserLocalData(true); // full wipe as requested
        } catch (err) {
          // fallback: try removing user-specific keys
          const email = localStorage.getItem("loggedInUser");
          if (email) {
            localStorage.removeItem("user_" + email);
            localStorage.removeItem("loggedInUser");
            localStorage.removeItem("nestedProfile");
            localStorage.removeItem("nestedProfile_lastUpdated");
          } else {
            localStorage.clear();
          }
        }
        // give feedback then redirect
        showModal("Your local data has been removed. Redirecting...", { title: "Deleted", callback: () => { location.href = 'index.html'; } });
      }
    );
  });

  // helpers
  function getLoggedInEmail() { return localStorage.getItem("loggedInUser"); }
  function getUserRecord(email) { try { return JSON.parse(localStorage.getItem("user_" + email) || "{}"); } catch { return {}; } }
  function saveUserRecord(email, data) { if (!email) return; localStorage.setItem("user_" + email, JSON.stringify(data)); }

  // Modal helper: uses existing #infoModal on pages if present; otherwise creates one.
  function createOrGetInfoModal() {
    let modal = document.getElementById("infoModal");
    const baseInner = `
      <div class="absolute inset-0 bg-black/40"></div>
      <div class="relative z-10 w-11/12 max-w-md p-6 bg-white rounded-lg shadow-lg">
        <h3 id="modalTitle" class="mb-2 text-lg font-semibold">Notice</h3>
        <p id="modalMessage" class="mb-4 text-sm text-gray-700"></p>
        <div class="text-right">
          <button id="modalOk" class="px-4 py-2 text-white bg-indigo-700 rounded-md">OK</button>
        </div>
      </div>
    `;
    if (modal) {
      try {
        // populate if missing inner structure
        if (!modal.querySelector('#modalTitle') || !modal.querySelector('#modalMessage') || !modal.querySelector('#modalOk')) {
          modal.innerHTML = baseInner;
        }
        return modal;
      } catch (e) {
        try { modal.remove(); } catch {}
        modal = null;
      }
    }

    modal = document.createElement("div");
    modal.id = "infoModal";
    modal.className = "fixed inset-0 z-50 items-center justify-center hidden";
    modal.innerHTML = baseInner;
    document.body.appendChild(modal);
    return modal;
  }

  // simple informational modal (OK)
  function showModal(message, options = {}) {
    const modal = createOrGetInfoModal();
    const title = options.title || "Notice";
    const cb = typeof options.callback === "function" ? options.callback : null;
    modal.querySelector("#modalTitle").textContent = title;
    modal.querySelector("#modalMessage").textContent = String(message ?? "");
    modal.classList.remove("hidden");
    modal.classList.add("flex");

    const ok = modal.querySelector("#modalOk");

    function cleanup() {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
      ok.removeEventListener("click", onOk);
      document.removeEventListener("keydown", escHandler);
    }
    function onOk() {
      cleanup();
      if (cb) cb();
    }
    function escHandler(e) { if (e.key === "Escape") onOk(); }

    ok.addEventListener("click", onOk);
    document.addEventListener("keydown", escHandler);
  }

  // confirm modal with Cancel + Confirm
  function showConfirmModal(message, options = {}, onConfirm) {
    // options: { title, confirmText, cancelText }
    const title = options.title || "Please confirm";
    const confirmText = options.confirmText || "Confirm";
    const cancelText = options.cancelText || "Cancel";

    // reuse the #infoModal container but replace innerHTML with confirm layout
    let modal = document.getElementById("infoModal");
    if (!modal) modal = createOrGetInfoModal();

    modal.classList.remove("hidden");
    modal.classList.add("flex");
    modal.innerHTML = `
      <div class="absolute inset-0 bg-black/40"></div>
      <div class="relative z-10 w-11/12 max-w-md p-6 bg-white rounded-lg shadow-lg">
        <h3 id="modalTitle" class="mb-2 text-lg font-semibold">${escapeHtml(title)}</h3>
        <p id="modalMessage" class="mb-4 text-sm text-gray-700">${escapeHtml(String(message ?? ""))}</p>
        <div class="flex justify-end gap-3">
          <button id="modalCancel" class="px-4 py-2 border rounded bg-white text-gray-700">${escapeHtml(cancelText)}</button>
          <button id="modalConfirm" class="px-4 py-2 text-white bg-red-600 rounded">${escapeHtml(confirmText)}</button>
        </div>
      </div>
    `;

    const btnConfirm = modal.querySelector("#modalConfirm");
    const btnCancel = modal.querySelector("#modalCancel");

    function cleanup() {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
      btnConfirm.removeEventListener("click", onConfirmClick);
      btnCancel.removeEventListener("click", onCancelClick);
      document.removeEventListener("keydown", escHandler);
      // restore default simple modal markup so other showModal calls work
      modal.innerHTML = `
        <div class="absolute inset-0 bg-black/40"></div>
        <div class="relative z-10 w-11/12 max-w-md p-6 bg-white rounded-lg shadow-lg">
          <h3 id="modalTitle" class="mb-2 text-lg font-semibold">Notice</h3>
          <p id="modalMessage" class="mb-4 text-sm text-gray-700"></p>
          <div class="text-right">
            <button id="modalOk" class="px-4 py-2 text-white bg-indigo-700 rounded-md">OK</button>
          </div>
        </div>
      `;
    }

    function onConfirmClick() {
      cleanup();
      if (typeof onConfirm === "function") onConfirm();
    }
    function onCancelClick() { cleanup(); }

    function escHandler(e) { if (e.key === "Escape") onCancelClick(); }

    btnConfirm.addEventListener("click", onConfirmClick);
    btnCancel.addEventListener("click", onCancelClick);
    document.addEventListener("keydown", escHandler);
  }

  // small helper to avoid injecting raw HTML
  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  // expose modals
  window.showModal = showModal;
  window.showConfirmModal = showConfirmModal;
  // keep backward compatibility for code that used window.alert
  window.alert = function (msg) { showModal(String(msg)); };

  // ===== Delete account handlers =====
  function wipeUserLocalData(fullWipe = true) {
    const email = localStorage.getItem("loggedInUser");
    if (!email) {
      // nothing specific, but if fullWipe clear everything
      if (fullWipe) localStorage.clear();
      return;
    }
    if (fullWipe) {
      // clear entire localStorage (user asked to wipe off local storage)
      localStorage.clear();
    } else {
      // remove user-specific keys only
      localStorage.removeItem("user_" + email);
      localStorage.removeItem("loggedInUser");
      localStorage.removeItem("nestedProfile");
      localStorage.removeItem("nestedProfile_lastUpdated");
    }
  }

  // delegate click: elements with id #deleteAccountBtn, #mobileDeleteAccount or data-delete-account
  document.addEventListener("click", (e) => {
    const del = e.target.closest('#deleteAccountBtn, #mobileDeleteAccount, [data-delete-account]');
    if (!del) return;
    // show confirmation modal
    showConfirmModal(
      "This will remove all user data from your browser and sign you out. This action cannot be undone. Do you want to proceed?",
      { title: "Delete account", confirmText: "Delete", cancelText: "Cancel" },
      () => {
        // perform wipe and redirect to index
        try {
          wipeUserLocalData(true); // full wipe as requested
        } catch (err) {
          // fallback: try removing user-specific keys
          const email = localStorage.getItem("loggedInUser");
          if (email) {
            localStorage.removeItem("user_" + email);
            localStorage.removeItem("loggedInUser");
            localStorage.removeItem("nestedProfile");
            localStorage.removeItem("nestedProfile_lastUpdated");
          } else {
            localStorage.clear();
          }
        }
        // give feedback then redirect
        showModal("Your local data has been removed. Redirecting...", { title: "Deleted", callback: () => { location.href = 'index.html'; } });
      }
    );
  });

  // helpers
  function getLoggedInEmail() { return localStorage.getItem("loggedInUser"); }
  function getUserRecord(email) { try { return JSON.parse(localStorage.getItem("user_" + email) || "{}"); } catch { return {}; } }
  function saveUserRecord(email, data) { if (!email) return; localStorage.setItem("user_" + email, JSON.stringify(data)); }

  // Modal helper: uses existing #infoModal on pages if present; otherwise creates one.
  function createOrGetInfoModal() {
    let modal = document.getElementById("infoModal");
    const baseInner = `
      <div class="absolute inset-0 bg-black/40"></div>
      <div class="relative z-10 w-11/12 max-w-md p-6 bg-white rounded-lg shadow-lg">
        <h3 id="modalTitle" class="mb-2 text-lg font-semibold">Notice</h3>
        <p id="modalMessage" class="mb-4 text-sm text-gray-700"></p>
        <div class="text-right">
          <button id="modalOk" class="px-4 py-2 text-white bg-indigo-700 rounded-md">OK</button>
        </div>
      </div>
    `;
    if (modal) {
      try {
        // populate if missing inner structure
        if (!modal.querySelector('#modalTitle') || !modal.querySelector('#modalMessage') || !modal.querySelector('#modalOk')) {
          modal.innerHTML = baseInner;
        }
        return modal;
      } catch (e) {
        try { modal.remove(); } catch {}
        modal = null;
      }
    }

    modal = document.createElement("div");
    modal.id = "infoModal";
    modal.className = "fixed inset-0 z-50 items-center justify-center hidden";
    modal.innerHTML = baseInner;
    document.body.appendChild(modal);
    return modal;
  }

  // simple informational modal (OK)
  function showModal(message, options = {}) {
    const modal = createOrGetInfoModal();
    const title = options.title || "Notice";
    const cb = typeof options.callback === "function" ? options.callback : null;
    modal.querySelector("#modalTitle").textContent = title;
    modal.querySelector("#modalMessage").textContent = String(message ?? "");
    modal.classList.remove("hidden");
    modal.classList.add("flex");

    const ok = modal.querySelector("#modalOk");

    function cleanup() {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
      ok.removeEventListener("click", onOk);
      document.removeEventListener("keydown", escHandler);
    }
    function onOk() {
      cleanup();
      if (cb) cb();
    }
    function escHandler(e) { if (e.key === "Escape") onOk(); }

    ok.addEventListener("click", onOk);
    document.addEventListener("keydown", escHandler);
  }

  // confirm modal with Cancel + Confirm
  function showConfirmModal(message, options = {}, onConfirm) {
    // options: { title, confirmText, cancelText }
    const title = options.title || "Please confirm";
    const confirmText = options.confirmText || "Confirm";
    const cancelText = options.cancelText || "Cancel";

    // reuse the #infoModal container but replace innerHTML with confirm layout
    let modal = document.getElementById("infoModal");
    if (!modal) modal = createOrGetInfoModal();

    modal.classList.remove("hidden");
    modal.classList.add("flex");
    modal.innerHTML = `
      <div class="absolute inset-0 bg-black/40"></div>
      <div class="relative z-10 w-11/12 max-w-md p-6 bg-white rounded-lg shadow-lg">
        <h3 id="modalTitle" class="mb-2 text-lg font-semibold">${escapeHtml(title)}</h3>
        <p id="modalMessage" class="mb-4 text-sm text-gray-700">${escapeHtml(String(message ?? ""))}</p>
        <div class="flex justify-end gap-3">
          <button id="modalCancel" class="px-4 py-2 border rounded bg-white text-gray-700">${escapeHtml(cancelText)}</button>
          <button id="modalConfirm" class="px-4 py-2 text-white bg-red-600 rounded">${escapeHtml(confirmText)}</button>
        </div>
      </div>
    `;

    const btnConfirm = modal.querySelector("#modalConfirm");
    const btnCancel = modal.querySelector("#modalCancel");

    function cleanup() {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
      btnConfirm.removeEventListener("click", onConfirmClick);
      btnCancel.removeEventListener("click", onCancelClick);
      document.removeEventListener("keydown", escHandler);
      // restore default simple modal markup so other showModal calls work
      modal.innerHTML = `
        <div class="absolute inset-0 bg-black/40"></div>
        <div class="relative z-10 w-11/12 max-w-md p-6 bg-white rounded-lg shadow-lg">
          <h3 id="modalTitle" class="mb-2 text-lg font-semibold">Notice</h3>
          <p id="modalMessage" class="mb-4 text-sm text-gray-700"></p>
          <div class="text-right">
            <button id="modalOk" class="px-4 py-2 text-white bg-indigo-700 rounded-md">OK</button>
          </div>
        </div>
      `;
    }

    function onConfirmClick() {
      cleanup();
      if (typeof onConfirm === "function") onConfirm();
    }
    function onCancelClick() { cleanup(); }

    function escHandler(e) { if (e.key === "Escape") onCancelClick(); }

    btnConfirm.addEventListener("click", onConfirmClick);
    btnCancel.addEventListener("click", onCancelClick);
    document.addEventListener("keydown", escHandler);
  }

  // small helper to avoid injecting raw HTML
  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  // expose modals
  window.showModal = showModal;
  window.showConfirmModal = showConfirmModal;
  // keep backward compatibility for code that used window.alert
  window.alert = function (msg) { showModal(String(msg)); };

  // ===== Delete account handlers =====
  function wipeUserLocalData(fullWipe = true) {
    const email = localStorage.getItem("loggedInUser");
    if (!email) {
      // nothing specific, but if fullWipe clear everything
      if (fullWipe) localStorage.clear();
      return;
    }
    if (fullWipe) {
      // clear entire localStorage (user asked to wipe off local storage)
      localStorage.clear();
    } else {
      // remove user-specific keys only
      localStorage.removeItem("user_" + email);
      localStorage.removeItem("loggedInUser");
      localStorage.removeItem("nestedProfile");
      localStorage.removeItem("nestedProfile_lastUpdated");
    }
  }

  // delegate click: elements with id #deleteAccountBtn, #mobileDeleteAccount or data-delete-account
  document.addEventListener("click", (e) => {
    const del = e.target.closest('#deleteAccountBtn, #mobileDeleteAccount, [data-delete-account]');
    if (!del) return;
    // show confirmation modal
    showConfirmModal(
      "This will remove all user data from your browser and sign you out. This action cannot be undone. Do you want to proceed?",
      { title: "Delete account", confirmText: "Delete", cancelText: "Cancel" },
      () => {
        // perform wipe and redirect to index
        try {
          wipeUserLocalData(true); // full wipe as requested
        } catch (err) {
          // fallback: try removing user-specific keys
          const email = localStorage.getItem("loggedInUser");
          if (email) {
            localStorage.removeItem("user_" + email);
            localStorage.removeItem("loggedInUser");
            localStorage.removeItem("nestedProfile");
            localStorage.removeItem("nestedProfile_lastUpdated");
          } else {
            localStorage.clear();
          }
        }
        // give feedback then redirect
        showModal("Your local data has been removed. Redirecting...", { title: "Deleted", callback: () => { location.href = 'index.html'; } });
      }
    );
  });

  // helpers
  function getLoggedInEmail() { return localStorage.getItem("loggedInUser"); }
  function getUserRecord(email) { try { return JSON.parse(localStorage.getItem("user_" + email) || "{}"); } catch { return {}; } }
  function saveUserRecord(email, data) { if (!email) return; localStorage.setItem("user_" + email, JSON.stringify(data)); }

  // Modal helper: uses existing #infoModal on pages if present; otherwise creates one.
  function createOrGetInfoModal() {
    let modal = document.getElementById("infoModal");
    const baseInner = `
      <div class="absolute inset-0 bg-black/40"></div>
      <div class="relative z-10 w-11/12 max-w-md p-6 bg-white rounded-lg shadow-lg">
        <h3 id="modalTitle" class="mb-2 text-lg font-semibold">Notice</h3>
        <p id="modalMessage" class="mb-4 text-sm text-gray-700"></p>
        <div class="text-right">
          <button id="modalOk" class="px-4 py-2 text-white bg-indigo-700 rounded-md">OK</button>
        </div>
      </div>
    `;
    if (modal) {
      try {
        // populate if missing inner structure
        if (!modal.querySelector('#modalTitle') || !modal.querySelector('#modalMessage') || !modal.querySelector('#modalOk')) {
          modal.innerHTML = baseInner;
        }
        return modal;
      } catch (e) {
        try { modal.remove(); } catch {}
        modal = null;
      }
    }

    modal = document.createElement("div");
    modal.id = "infoModal";
    modal.className = "fixed inset-0 z-50 items-center justify-center hidden";
    modal.innerHTML = baseInner;
    document.body.appendChild(modal);
    return modal;
  }

  // simple informational modal (OK)
  function showModal(message, options = {}) {
    const modal = createOrGetInfoModal();
    const title = options.title || "Notice";
    const cb = typeof options.callback === "function" ? options.callback : null;
    modal.querySelector("#modalTitle").textContent = title;
    modal.querySelector("#modalMessage").textContent = String(message ?? "");
    modal.classList.remove("hidden");
    modal.classList.add("flex");

    const ok = modal.querySelector("#modalOk");

    function cleanup() {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
      ok.removeEventListener("click", onOk);
      document.removeEventListener("keydown", escHandler);
    }
    function onOk() {
      cleanup();
      if (cb) cb();
    }
    function escHandler(e) { if (e.key === "Escape") onOk(); }

    ok.addEventListener("click", onOk);
    document.addEventListener("keydown", escHandler);
  }

  // confirm modal with Cancel + Confirm
  function showConfirmModal(message, options = {}, onConfirm) {
    // options: { title, confirmText, cancelText }
    const title = options.title || "Please confirm";
    const confirmText = options.confirmText || "Confirm";
    const cancelText = options.cancelText || "Cancel";

    // reuse the #infoModal container but replace innerHTML with confirm layout
    let modal = document.getElementById("infoModal");
    if (!modal) modal = createOrGetInfoModal();

    modal.classList.remove("hidden");
    modal.classList.add("flex");
    modal.innerHTML = `
      <div class="absolute inset-0 bg-black/40"></div>
      <div class="relative z-10 w-11/12 max-w-md p-6 bg-white rounded-lg shadow-lg">
        <h3 id="modalTitle" class="mb-2 text-lg font-semibold">${escapeHtml(title)}</h3>
        <p id="modalMessage" class="mb-4 text-sm text-gray-700">${escapeHtml(String(message ?? ""))}</p>
        <div class="flex justify-end gap-3">
          <button id="modalCancel" class="px-4 py-2 border rounded bg-white text-gray-700">${escapeHtml(cancelText)}</button>
          <button id="modalConfirm" class="px-4 py-2 text-white bg-red-600 rounded">${escapeHtml(confirmText)}</button>
        </div>
      </div>
    `;

    const btnConfirm = modal.querySelector("#modalConfirm");
    const btnCancel = modal.querySelector("#modalCancel");

    function cleanup() {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
      btnConfirm.removeEventListener("click", onConfirmClick);
      btnCancel.removeEventListener("click", onCancelClick);
      document.removeEventListener("keydown", escHandler);
      // restore default simple modal markup so other showModal calls work
      modal.innerHTML = `
        <div class="absolute inset-0 bg-black/40"></div>
        <div class="relative z-10 w-11/12 max-w-md p-6 bg-white rounded-lg shadow-lg">
          <h3 id="modalTitle" class="mb-2 text-lg font-semibold">Notice</h3>
          <p id="modalMessage" class="mb-4 text-sm text-gray-700"></p>
          <div class="text-right">
            <button id="modalOk" class="px-4 py-2 text-white bg-indigo-700 rounded-md">OK</button>
          </div>
        </div>
      `;
    }

    function onConfirmClick() {
      cleanup();
      if (typeof onConfirm === "function") onConfirm();
    }
    function onCancelClick() { cleanup(); }

    function escHandler(e) { if (e.key === "Escape") onCancelClick(); }

    btnConfirm.addEventListener("click", onConfirmClick);
    btnCancel.addEventListener("click", onCancelClick);
    document.addEventListener("keydown", escHandler);
  }

  // small helper to avoid injecting raw HTML
  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  // expose modals
  window.showModal = showModal;
  window.showConfirmModal = showConfirmModal;
  // keep backward compatibility for code that used window.alert
  window.alert = function (msg) { showModal(String(msg)); };

  // ===== Delete account handlers =====
  function wipeUserLocalData(fullWipe = true) {
    const email = localStorage.getItem("loggedInUser");
    if (!email) {
      // nothing specific, but if fullWipe clear everything
      if (fullWipe) localStorage.clear();
      return;
    }
    if (fullWipe) {
      // clear entire localStorage (user asked to wipe off local storage)
      localStorage.clear();
    } else {
      // remove user-specific keys only
      localStorage.removeItem("user_" + email);
      localStorage.removeItem("loggedInUser");
      localStorage.removeItem("nestedProfile");
      localStorage.removeItem("nestedProfile_lastUpdated");
    }
  }

  // delegate click: elements with id #deleteAccountBtn, #mobileDeleteAccount or data-delete-account
  document.addEventListener("click", (e) => {
    const del = e.target.closest('#deleteAccountBtn, #mobileDeleteAccount, [data-delete-account]');
    if (!del) return;
    // show confirmation modal
    showConfirmModal(
      "This will remove all user data from your browser and sign you out. This action cannot be undone. Do you want to proceed?",
      { title: "Delete account", confirmText: "Delete", cancelText: "Cancel" },
      () => {
        // perform wipe and redirect to index
        try {
          wipeUserLocalData(true); // full wipe as requested
        } catch (err) {
          // fallback: try removing user-specific keys
          const email = localStorage.getItem("loggedInUser");
          if (email) {
            localStorage.removeItem("user_" + email);
            localStorage.removeItem("loggedInUser");
            localStorage.removeItem("nestedProfile");
            localStorage.removeItem("nestedProfile_lastUpdated");
          } else {
            localStorage.clear();
          }
        }
        // give feedback then redirect
        showModal("Your local data has been removed. Redirecting...", { title: "Deleted", callback: () => { location.href = 'index.html'; } });
      }
    );
  });

  // helpers
  function getLoggedInEmail() { return localStorage.getItem("loggedInUser"); }
  function getUserRecord(email) { try { return JSON.parse(localStorage.getItem("user_" + email) || "{}"); } catch { return {}; } }
  function saveUserRecord(email, data) { if (!email) return; localStorage.setItem("user_" + email, JSON.stringify(data)); }

  // Modal helper: uses existing #infoModal on pages if present; otherwise creates one.
  function createOrGetInfoModal() {
    let modal = document.getElementById("infoModal");
    const baseInner = `
      <div class="absolute inset-0 bg-black/40"></div>
      <div class="relative z-10 w-11/12 max-w-md p-6 bg-white rounded-lg shadow-lg">
        <h3 id="modalTitle" class="mb-2 text-lg font-semibold">Notice</h3>
        <p id="modalMessage" class="mb-4 text-sm text-gray-700"></p>
        <div class="text-right">
          <button id="modalOk" class="px-4 py-2 text-white bg-indigo-700 rounded-md">OK</button>
        </div>
      </div>
    `;
    if (modal) {
      try {
        // populate if missing inner structure
        if (!modal.querySelector('#modalTitle') || !modal.querySelector('#modalMessage') || !modal.querySelector('#modalOk')) {
          modal.innerHTML = baseInner;
        }
        return modal;
      } catch (e) {
        try { modal.remove(); } catch {}
        modal = null;
      }
    }

    modal = document.createElement("div");
    modal.id = "infoModal";
    modal.className = "fixed inset-0 z-50 items-center justify-center hidden";
    modal.innerHTML = baseInner;
    document.body.appendChild(modal);
    return modal;
  }

  // simple informational modal (OK)
  function showModal(message, options = {}) {
    const modal = createOrGetInfoModal();
    const title = options.title || "Notice";
    const cb = typeof options.callback === "function" ? options.callback : null;
    modal.querySelector("#modalTitle").textContent = title;
    modal.querySelector("#modalMessage").textContent = String(message ?? "");
    modal.classList.remove("hidden");
    modal.classList.add("flex");

    const ok = modal.querySelector("#modalOk");

    function cleanup() {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
      ok.removeEventListener("click", onOk);
      document.removeEventListener("keydown", escHandler);
    }
    function onOk() {
      cleanup();
      if (cb) cb();
    }
    function escHandler(e) { if (e.key === "Escape") onOk(); }

    ok.addEventListener("click", onOk);
    document.addEventListener("keydown", escHandler);
  }

  // confirm modal with Cancel + Confirm
  function showConfirmModal(message, options = {}, onConfirm) {
    // options: { title, confirmText, cancelText }
    const title = options.title || "Please confirm";
    const confirmText = options.confirmText || "Confirm";
    const cancelText = options.cancelText || "Cancel";

    // reuse the #infoModal container but replace innerHTML with confirm layout
    let modal = document.getElementById("infoModal");
    if (!modal) modal = createOrGetInfoModal();

    modal.classList.remove("hidden");
    modal.classList.add("flex");
    modal.innerHTML = `
      <div class="absolute inset-0 bg-black/40"></div>
      <div class="relative z-10 w-11/12 max-w-md p-6 bg-white rounded-lg shadow-lg">
        <h3 id="modalTitle" class="mb-2 text-lg font-semibold">${escapeHtml(title)}</h3>
        <p id="modalMessage" class="mb-4 text-sm text-gray-700">${escapeHtml(String(message ?? ""))}</p>
        <div class="flex justify-end gap-3">
          <button id="modalCancel" class="px-4 py-2 border rounded bg-white text-gray-700">${escapeHtml(cancelText)}</button>
          <button id="modalConfirm" class="px-4 py-2 text-white bg-red-600 rounded">${escapeHtml(confirmText)}</button>
        </div>
      </div>
    `;

    const btnConfirm = modal.querySelector("#modalConfirm");
    const btnCancel = modal.querySelector("#modalCancel");

    function cleanup() {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
      btnConfirm.removeEventListener("click", onConfirmClick);
      btnCancel.removeEventListener("click", onCancelClick);
      document.removeEventListener("keydown", escHandler);
      // restore default simple modal markup so other showModal calls work
      modal.innerHTML = `
        <div class="absolute inset-0 bg-black/40"></div>
        <div class="relative z-10 w-11/12 max-w-md p-6 bg-white rounded-lg shadow-lg">
          <h3 id="modalTitle" class="mb-2 text-lg font-semibold">Notice</h3>
          <p id="modalMessage" class="mb-4 text-sm text-gray-700"></p>
          <div class="text-right">
            <button id="modalOk" class="px-4 py-2 text-white bg-indigo-700 rounded-md">OK</button>
          </div>
        </div>
      `;
    }

    function onConfirmClick() {
      cleanup();
      if (typeof onConfirm === "function") onConfirm();
    }
    function onCancelClick() { cleanup(); }

    function escHandler(e) { if (e.key === "Escape") onCancelClick(); }

    btnConfirm.addEventListener("click", onConfirmClick);
    btnCancel.addEventListener("click", onCancelClick);
    document.addEventListener("keydown", escHandler);
  }

  // small helper to avoid injecting raw HTML
  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  // expose modals
  window.showModal = showModal;
  window.showConfirmModal = showConfirmModal;
  // keep backward compatibility for code that used window.alert
  window.alert = function (msg) { showModal(String(msg)); };

  // ===== Delete account handlers =====
  function wipeUserLocalData(fullWipe = true) {
    const email = localStorage.getItem("loggedInUser");
    if (!email) {
      // nothing specific, but if fullWipe clear everything
      if (fullWipe) localStorage.clear();
      return;
    }
    if (fullWipe) {
      // clear entire localStorage (user asked to wipe off local storage)
      localStorage.clear();
    } else {
      // remove user-specific keys only
      localStorage.removeItem("user_" + email);
      localStorage.removeItem("loggedInUser");
      localStorage.removeItem("nestedProfile");
      localStorage.removeItem("nestedProfile_lastUpdated");
    }
  }

  // delegate click: elements with id #deleteAccountBtn, #mobileDeleteAccount or data-delete-account
  document.addEventListener("click", (e) => {
    const del = e.target.closest('#deleteAccountBtn, #mobileDeleteAccount, [data-delete-account]');
    if (!del) return;
    // show confirmation modal
    showConfirmModal(
      "This will remove all user data from your browser and sign you out. This action cannot be undone. Do you want to proceed?",
      { title: "Delete account", confirmText: "Delete", cancelText: "Cancel" },
      () => {
        // perform wipe and redirect to index
        try {
          wipeUserLocalData(true); // full wipe as requested
        } catch (err) {
          // fallback: try removing user-specific keys
          const email = localStorage.getItem("loggedInUser");
          if (email) {
            localStorage.removeItem("user_" + email);
            localStorage.removeItem("loggedInUser");
            localStorage.removeItem("nestedProfile");
            localStorage.removeItem("nestedProfile_lastUpdated");
          } else {
            localStorage.clear();
          }
        }
        // give feedback then redirect
        showModal("Your local data has been removed. Redirecting...", { title: "Deleted", callback: () => { location.href = 'index.html'; } });
      }
    );
  });

  // helpers
  function getLoggedInEmail() { return localStorage.getItem("loggedInUser"); }
  function getUserRecord(email) { try { return JSON.parse(localStorage.getItem("user_" + email) || "{}"); } catch { return {}; } }
  function saveUserRecord(email, data) { if (!email) return; localStorage.setItem("user_" + email, JSON.stringify(data)); }

  // Modal helper: uses existing #infoModal on pages if present; otherwise creates one.
  function createOrGetInfoModal() {
    let modal = document.getElementById("infoModal");
    const baseInner = `
      <div class="absolute inset-0 bg-black/40"></div>
      <div class="relative z-10 w-11/12 max-w-md p-6 bg-white rounded-lg shadow-lg">
        <h3 id="modalTitle" class="mb-2 text-lg font-semibold">Notice</h3>
        <p id="modalMessage" class="mb-4 text-sm text-gray-700"></p>
        <div class="text-right">
          <button id="modalOk" class="px-4 py-2 text-white bg-indigo-700 rounded-md">OK</button>
        </div>
      </div>
    `;
    if (modal) {
      try {
        // populate if missing inner structure
        if (!modal.querySelector('#modalTitle') || !modal.querySelector('#modalMessage') || !modal.querySelector('#modalOk')) {
          modal.innerHTML = baseInner;
        }
        return modal;
      } catch (e) {
        try { modal.remove(); } catch {}
        modal = null;
      }
    }

    modal = document.createElement("div");
    modal.id = "infoModal";
    modal.className = "fixed inset-0 z-50 items-center justify-center hidden";
    modal.innerHTML = baseInner;
    document.body.appendChild(modal);
    return modal;
  }

  // simple informational modal (OK)
  function showModal(message, options = {}) {
    const modal = createOrGetInfoModal();
    const title = options.title || "Notice";
    const cb = typeof options.callback === "function" ? options.callback : null;
    modal.querySelector("#modalTitle").textContent = title;
    modal.querySelector("#modalMessage").textContent = String(message ?? "");
    modal.classList.remove("hidden");
    modal.classList.add("flex");

    const ok = modal.querySelector("#modalOk");

    function cleanup() {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
      ok.removeEventListener("click", onOk);
      document.removeEventListener("keydown", escHandler);
    }
    function onOk() {
      cleanup();
      if (cb) cb();
    }
    function escHandler(e) { if (e.key === "Escape") onOk(); }

    ok.addEventListener("click", onOk);
    document.addEventListener("keydown", escHandler);
  }

  // confirm modal with Cancel + Confirm
  function showConfirmModal(message, options = {}, onConfirm) {
    // options: { title, confirmText, cancelText }
    const title = options.title || "Please confirm";
    const confirmText = options.confirmText || "Confirm";
    const cancelText = options.cancelText || "Cancel";

    // reuse the #infoModal container but replace innerHTML with confirm layout
    let modal = document.getElementById("infoModal");
    if (!modal) modal = createOrGetInfoModal();

    modal.classList.remove("hidden");
    modal.classList.add("flex");
    modal.innerHTML = `
      <div class="absolute inset-0 bg-black/40"></div>
      <div class="relative z-10 w-11/12 max-w-md p-6 bg-white rounded-lg shadow-lg">
        <h3 id="modalTitle" class="mb-2 text-lg font-semibold">${escapeHtml(title)}</h3>
        <p id="modalMessage" class="mb-4 text-sm text-gray-700">${escapeHtml(String(message ?? ""))}</p>
        <div class="flex justify-end gap-3">
          <button id="modalCancel" class="px-4 py-2 border rounded bg-white text-gray-700">${escapeHtml(cancelText)}</button>
          <button id="modalConfirm" class="px-4 py-2 text-white bg-red-600 rounded">${escapeHtml(confirmText)}</button>
        </div>
      </div>
    `;

    const btnConfirm = modal.querySelector("#modalConfirm");
    const btnCancel = modal.querySelector("#modalCancel");

    function cleanup() {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
      btnConfirm.removeEventListener("click", onConfirmClick);
      btnCancel.removeEventListener("click", onCancelClick);
      document.removeEventListener("keydown", escHandler);
      // restore default simple modal markup so other showModal calls work
      modal.innerHTML = `
        <div class="absolute inset-0 bg-black/40"></div>
        <div class="relative z-10 w-11/12 max-w-md p-6 bg-white rounded-lg shadow-lg">
          <h3 id="modalTitle" class="mb-2 text-lg font-semibold">Notice</h3>
          <p id="modalMessage" class="mb-4 text-sm text-gray-700"></p>
          <div class="text-right">
            <button id="modalOk" class="px-4 py-2 text-white bg-indigo-700 rounded-md">OK</button>
          </div>
        </div>
      `;
    }

    function onConfirmClick() {
      cleanup();
      if (typeof onConfirm === "function") onConfirm();
    }
    function onCancelClick() { cleanup(); }

    function escHandler(e) { if (e.key === "Escape") onCancelClick(); }

    btnConfirm.addEventListener("click", onConfirmClick);
    btnCancel.addEventListener("click", onCancelClick);
    document.addEventListener("keydown", escHandler);
  }

  // small helper to avoid injecting raw HTML
  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  // expose modals
  window.showModal = showModal;
  window.showConfirmModal = showConfirmModal;
  // keep backward compatibility for code that used window.alert
  window.alert = function (msg) { showModal(String(msg)); };

  // ===== Delete account handlers =====
  function wipeUserLocalData(fullWipe = true) {
    const email = localStorage.getItem("loggedInUser");
    if (!email) {
      // nothing specific, but if fullWipe clear everything
      if (fullWipe) localStorage.clear();
      return;
    }
    if (fullWipe) {
      // clear entire localStorage (user asked to wipe off local storage)
      localStorage.clear();
    } else {
      // remove user-specific keys only
      localStorage.removeItem("user_" + email);
      localStorage.removeItem("loggedInUser");
      localStorage.removeItem("nestedProfile");
      localStorage.removeItem("nestedProfile_lastUpdated");
    }
  }

  // delegate click: elements with id #deleteAccountBtn, #mobileDeleteAccount or data-delete-account
  document.addEventListener("click", (e) => {
    const del = e.target.closest('#deleteAccountBtn, #mobileDeleteAccount, [data-delete-account]');
    if (!del) return;
    // show confirmation modal
    showConfirmModal(
      "This will remove all user data from your browser and sign you out. This action cannot be undone. Do you want to proceed?",
      { title: "Delete account", confirmText: "Delete", cancelText: "Cancel" },
      () => {
        // perform wipe and redirect to index
        try {
          wipeUserLocalData(true); // full wipe as requested
        } catch (err) {
          // fallback: try removing user-specific keys
          const email = localStorage.getItem("loggedInUser");
          if (email) {
            localStorage.removeItem("user_" + email);
            localStorage.removeItem("loggedInUser");
            localStorage.removeItem("nestedProfile");
            localStorage.removeItem("nestedProfile_lastUpdated");
          } else {
            localStorage.clear();
          }
        }
        // give feedback then redirect
        showModal("Your local data has been removed. Redirecting...", { title: "Deleted", callback: () => { location.href = 'index.html'; } });
      }
    );
  });

  // helpers
  function getLoggedInEmail() { return localStorage.getItem("loggedInUser"); }
  function getUserRecord(email) { try { return JSON.parse(localStorage.getItem("user_" + email) || "{}"); } catch { return {}; } }
  function saveUserRecord(email, data) { if (!email) return; localStorage.setItem("user_" + email, JSON.stringify(data)); }

  // Modal helper: uses existing #infoModal on pages if present; otherwise creates one.
  function createOrGetInfoModal() {
    let modal = document.getElementById("infoModal");
    const baseInner = `
      <div class="absolute inset-0 bg-black/40"></div>
      <div class="relative z-10 w-11/12 max-w-md p-6 bg-white rounded-lg shadow-lg">
        <h3 id="modalTitle" class="mb-2 text-lg font-semibold">Notice</h3>
        <p id="modalMessage" class="mb-4 text-sm text-gray-700"></p>
        <div class="text-right">
          <button id="modalOk" class="px-4 py-2 text-white bg-indigo-700 rounded-md">OK</button>
        </div>
      </div>
    `;
    if (modal) {
      try {
        // populate if missing inner structure
        if (!modal.querySelector('#modalTitle') || !modal.querySelector('#modalMessage') || !modal.querySelector('#modalOk')) {
          modal.innerHTML = baseInner;
        }
        return modal;