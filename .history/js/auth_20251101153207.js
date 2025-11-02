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

  // Modal helper (creates #infoModal if missing)
  function createOrGetInfoModal() {
    let modal = document.getElementById("infoModal");
    if (modal) return modal;
    modal = document.createElement("div");
    modal.id = "infoModal";
    modal.className = "fixed inset-0 z-50 items-center justify-center hidden";
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
    document.body.appendChild(modal);
    return modal;
  }

  function showModal(message, options = {}) {
    const modal = createOrGetInfoModal();
    const title = options.title || "Notice";
    const cb = typeof options.callback === "function" ? options.callback : null;
    modal.querySelector("#modalTitle").textContent = title;
    modal.querySelector("#modalMessage").textContent = String(message ?? "");
    modal.classList.remove("hidden"); modal.classList.add("flex");
    const ok = modal.querySelector("#modalOk");
    function handler() {
      modal.classList.add("hidden"); modal.classList.remove("flex");
      ok.removeEventListener("click", handler);
      if (cb) cb();
    }
    ok.addEventListener("click", handler);
    function escHandler(e) { if (e.key === "Escape") { handler(); document.removeEventListener("keydown", escHandler); } }
    document.addEventListener("keydown", escHandler);
  }

  // override alert to use modal
  window.showModal = showModal;
  window.alert = function (msg) { showModal(String(msg)); };

  function updateNavbarUserDisplay(user) {
    const name = user?.name || user?.firstName || user?.email || localStorage.getItem("loggedInUser") || "";
    if (profileUserName) profileUserName.textContent = name;
    if (mobileUserName) mobileUserName.textContent = name;
    document.querySelectorAll("[data-user-name]").forEach(el => el.textContent = name);
    document.querySelectorAll("[data-user-email]").forEach(el => el.textContent = user?.email || "");
    document.querySelectorAll("[data-user-phone]").forEach(el => el.textContent = user?.phone || "");
    document.querySelectorAll("[data-user-dob]").forEach(el => el.textContent = user?.dob || "");
    document.querySelectorAll("[data-user-address]").forEach(el => el.textContent = user?.address || "");
    if (user?.avatar) document.querySelectorAll("[data-user-avatar]").forEach(img => { if (img.tagName === "IMG") img.src = user.avatar; });
    document.querySelectorAll(".welcome-user").forEach(el => { el.textContent = name ? `Welcome, ${name}` : "Welcome"; });
  }

  function displayLoggedInUser() {
    const email = getLoggedInEmail();
    const form = document.getElementById("profileForm");
    // priority: user_{email} > nestedProfile (legacy)
    let data = {};
    if (email) data = getUserRecord(email) || {};
    if (!data || Object.keys(data).length === 0) {
      try { data = JSON.parse(localStorage.getItem("nestedProfile") || "{}"); } catch {}
    }

    // fill form fields if present (handles text inputs, selects, textareas, checkboxes)
    if (form && data) {
      Array.from(form.elements).forEach(el => {
        if (!el.name) return;
        if (el.type === "checkbox") {
          el.checked = !!data[el.name];
        } else if (el.type === "radio") {
          if (String(data[el.name]) === el.value) el.checked = true;
        } else {
          el.value = data[el.name] ?? "";
        }
      });
    }

    // update UI names/avatars and data-* placeholders
    updateNavbarUserDisplay(data);

    // new: populate other label/value slots on page
    populateProfilePlaceholders(data);
  }

  // Save profile changes and propagate across app
  function saveLoggedInUserChanges(profileData) {
    const email = getLoggedInEmail();
    if (email) {
      const existing = getUserRecord(email);
      const merged = Object.assign({}, existing, profileData);
      // keep a convenience 'name' field
      merged.name = merged.name || (merged.firstName ? (merged.firstName + (merged.lastName ? " " + merged.lastName : "")) : undefined);
      // ensure email field present if changed
      if (!merged.email) merged.email = email;
      saveUserRecord(email, merged);
      // also keep legacy key for pages that use it
      localStorage.setItem("nestedProfile", JSON.stringify(merged));
      updateNavbarUserDisplay(merged);
      // update placeholder slots too
      populateProfilePlaceholders(merged);
      // emit storage event across tabs by touching localStorage
      localStorage.setItem("nestedProfile_lastUpdated", Date.now().toString());
      return merged;
    } else {
      // not logged in: still save to nestedProfile for demo/guest
      localStorage.setItem("nestedProfile", JSON.stringify(profileData));
      updateNavbarUserDisplay(profileData);
      populateProfilePlaceholders(profileData);
      return profileData;
    }
  }

  window.displayLoggedInUser = displayLoggedInUser;
  window.saveLoggedInUserChanges = saveLoggedInUserChanges;
  window.getUserRecord = getUserRecord;

  const profileForm = document.getElementById("profileForm");
  if (profileForm) {
    profileForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const formData = Object.fromEntries(new FormData(profileForm).entries());
      profileForm.querySelectorAll('input[type="checkbox"][name]').forEach(cb => { formData[cb.name] = cb.checked; });
      saveLoggedInUserChanges(formData);
      showModal("Profile updated", { title: "Success" });
    });
  }

  window.addEventListener("storage", (e) => {
    if (e.key === "nestedProfile" || e.key?.startsWith("user_") || e.key === "nestedProfile_lastUpdated") {
      displayLoggedInUser();
    }
  });

  displayLoggedInUser();
});
