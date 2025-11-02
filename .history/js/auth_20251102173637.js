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

  function updateNavbarUserDisplay(user) {
    const name = user?.name || user?.firstName || user?.email || localStorage.getItem("loggedInUser") || "";
    if (profileUserName) profileUserName.textContent = name;
    if (mobileUserName) mobileUserName.textContent = name;

    // update any other places that display the name/avatar
    document.querySelectorAll("[data-user-name]").forEach(el => el.textContent = name);
    if (user?.avatar) {
      document.querySelectorAll("[data-user-avatar]").forEach(img => { if (img.tagName === "IMG") img.src = user.avatar; });
    }
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

    // fill form fields if present
    if (form && data) {
      Object.keys(data).forEach(k => {
        const el = form.querySelector(`[name="${k}"]`);
        if (!el) return;
        if (el.type === "checkbox") el.checked = !!data[k];
        else el.value = data[k] ?? "";
      });
    }

    // update UI names/avatars
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
      // ensure we capture all named inputs
      profileForm.querySelectorAll('input[type="checkbox"][name]').forEach(cb => { formData[cb.name] = cb.checked; });
      // persist and update UI
      saveLoggedInUserChanges(formData);
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