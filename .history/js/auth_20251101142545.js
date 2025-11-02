// js/auth.js
document.addEventListener("DOMContentLoaded", () => {
  // Desktop elements
  const loginLink = document.getElementById("loginLink");
  const signupLink = document.getElementById("signupLink");
  const userProfile = document.getElementById("userProfile");
  const profileBtn = document.getElementById("profileBtn");
  const profileDropdown = document.getElementById("profileDropdown");
  const profileUserName = document.getElementById("profileUserName");

  // Mobile elements
  const mobileUserInfo = document.getElementById("mobileUserInfo");
  const mobileUserName = document.getElementById("mobileUserName");
  const mobileAuthLinks = document.getElementById("mobileAuthLinks");
  const mobileProfileLinks = document.getElementById("mobileProfileLinks");

  const loggedInEmail = localStorage.getItem("loggedInUser");
  let userName = "";

  if (loggedInEmail) {
    const storedUser = localStorage.getItem("user_" + loggedInEmail);
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      userName = userData.name || userData.firstName || loggedInEmail;
    }
  }

  // ===== Update Navbar State =====
  if (loggedInEmail && userName) {
    // Desktop
    loginLink?.classList.add("hidden");
    signupLink?.classList.add("hidden");
    userProfile?.classList.remove("hidden");
    if (profileUserName) profileUserName.textContent = userName;

    // Mobile
    mobileAuthLinks?.classList.add("hidden");
    mobileUserInfo?.classList.remove("hidden");
    mobileProfileLinks?.classList.remove("hidden");
    if (mobileUserName) mobileUserName.textContent = userName;
  }

  // ===== Dropdown Toggle =====
  if (profileBtn && profileDropdown) {
    profileBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      profileDropdown.classList.toggle("hidden");
    });
    document.addEventListener("click", (e) => {
      if (!userProfile.contains(e.target)) {
        profileDropdown.classList.add("hidden");
      }
    });
  }

  // ===== Logout =====
  function logoutUser() {
    localStorage.removeItem("loggedInUser");
    userProfile?.classList.add("hidden");
    loginLink?.classList.remove("hidden");
    signupLink?.classList.remove("hidden");

    mobileUserInfo?.classList.add("hidden");
    mobileProfileLinks?.classList.add("hidden");
    mobileAuthLinks?.classList.remove("hidden");

    location.reload();
  }

  document.getElementById("logoutLink")?.addEventListener("click", logoutUser);
  document.getElementById("mobileLogout")?.addEventListener("click", logoutUser);

  // ===== new: user helpers & sync =====

  function getLoggedInEmail() {
    return localStorage.getItem("loggedInUser");
  }

  function getUserRecord(email) {
    try {
      return JSON.parse(localStorage.getItem("user_" + email) || "{}");
    } catch (e) {
      return {};
    }
  }

  function saveUserRecord(email, data) {
    if (!email) return;
    localStorage.setItem("user_" + email, JSON.stringify(data));
  }

  // Modal helper: uses existing #infoModal if present, otherwise creates one.
  function createOrGetInfoModal() {
    let modal = document.getElementById("infoModal");
    if (modal) return modal;

    // create modal markup
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
    modal.classList.remove("hidden");
    modal.classList.add("flex");

    const ok = modal.querySelector("#modalOk");
    function handler() {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
      ok.removeEventListener("click", handler);
      if (cb) cb();
    }
    ok.addEventListener("click", handler);

    // allow ESC to close
    function escHandler(e) {
      if (e.key === "Escape") {
        handler();
        document.removeEventListener("keydown", escHandler);
      }
    }
    document.addEventListener("keydown", escHandler);
  }

  // replace window.alert with modal-based implementation so legacy alert(...) calls render nicely
  window.showModal = showModal;
  window.alert = function (msg) { showModal(String(msg)); };

  function updateNavbarUserDisplay(user) {
    const name = user?.name || user?.firstName || user?.email || localStorage.getItem("loggedInUser") || "";
    if (profileUserName) profileUserName.textContent = name;
    if (mobileUserName) mobileUserName.textContent = name;

    // update any other places that display the name/email/avatar via data attributes
    document.querySelectorAll("[data-user-name]").forEach(el => el.textContent = name);
    document.querySelectorAll("[data-user-email]").forEach(el => el.textContent = user?.email || "");
    document.querySelectorAll("[data-user-phone]").forEach(el => el.textContent = user?.phone || "");
    document.querySelectorAll("[data-user-dob]").forEach(el => el.textContent = user?.dob || "");
    document.querySelectorAll("[data-user-address]").forEach(el => el.textContent = user?.address || "");
    if (user?.avatar) {
      document.querySelectorAll("[data-user-avatar]").forEach(img => { if (img.tagName === "IMG") img.src = user.avatar; });
    }

    // convenience: elements with .welcome-user get "Welcome, Name"
    document.querySelectorAll(".welcome-user").forEach(el => {
      el.textContent = name ? `Welcome, ${name}` : "Welcome";
    });
  }

  // Populate settings/profile form fields and common UI from stored user
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
      // emit storage event across tabs by touching localStorage
      localStorage.setItem("nestedProfile_lastUpdated", Date.now().toString());
      return merged;
    } else {
      // not logged in: still save to nestedProfile for demo/guest
      localStorage.setItem("nestedProfile", JSON.stringify(profileData));
      updateNavbarUserDisplay(profileData);
      return profileData;
    }
  }

  // expose helper to global window so other inline scripts can call
  window.displayLoggedInUser = displayLoggedInUser;
  window.saveLoggedInUserChanges = saveLoggedInUserChanges;
  window.getUserRecord = getUserRecord;

  // auto-hook settings profile form (if present) so changes reflect everywhere
  const profileForm = document.getElementById("profileForm");
  if (profileForm) {
    // if other code prevents default, this still runs; preventDefault to avoid double submits
    profileForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const formData = Object.fromEntries(new FormData(profileForm).entries());
      // also include checkboxes / other inputs not in entries if needed
      profileForm.querySelectorAll('input[type="checkbox"][name]').forEach(cb => { formData[cb.name] = cb.checked; });
      // persist and update UI
      const merged = saveLoggedInUserChanges(formData);
      // give user feedback via modal
      showModal("Profile updated", { title: "Success" });
    });
  }

  // Listen for storage changes in other tabs and refresh UI
  window.addEventListener("storage", (e) => {
    if (e.key === "nestedProfile" || e.key?.startsWith("user_") || e.key === "nestedProfile_lastUpdated") {
      displayLoggedInUser();
    }
  });

  // run initial population
  displayLoggedInUser();
});
