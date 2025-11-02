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
    const markup = `
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
      // if the existing container is empty or missing required nodes, populate it
      try {
        if (!modal.querySelector('#modalTitle') || !modal.querySelector('#modalMessage') || !modal.querySelector('#modalOk')) {
          modal.innerHTML = markup;
        }
        return modal;
      } catch (e) {
        // fallback to recreate if something odd
        modal.remove();
        modal = null;
      }
    }

    // create modal markup if not present
    modal = document.createElement("div");
    modal.id = "infoModal";
    modal.className = "fixed inset-0 z-50 items-center justify-center hidden";
    modal.innerHTML = markup;
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

  // New: fill empty label/value slots in cards and profile panels
  function fillEmptyProfileSpaces() {
    const email = getLoggedInEmail();
    let data = {};
    if (email) data = getUserRecord(email) || {};
    if (!data || Object.keys(data).length === 0) {
      try { data = JSON.parse(localStorage.getItem("nestedProfile") || "{}"); } catch {}
    }
    // helper to fetch sensible fallback values
    const getVal = (key) => {
      if (!data) return '';
      if (key === 'fullname') return data.name || `${data.firstName || ''} ${data.lastName || ''}`.trim();
      return data[key] ?? '';
    };

    // Fill rows that follow pattern: <div class="flex justify-between"><span>Label</span><span></span></div>
    document.querySelectorAll('.flex.justify-between, .flex.justify-between.items-center, .flex.justify-between > span + span').forEach(row => {
      const spans = Array.from(row.querySelectorAll('span'));
      if (spans.length < 2) return;
      const label = (spans[0].textContent || '').trim().toLowerCase();
      const target = spans[1];
      if (target && target.textContent.trim()) return; // already filled
      if (label.includes('first name')) { target.textContent = getVal('firstName'); return; }
      if (label.includes('last name')) { target.textContent = getVal('lastName'); return; }
      if (label.includes('full name')) { target.textContent = getVal('fullname'); return; }
      if (label.includes('phone')) { target.textContent = getVal('phone') || getVal('phoneNumber') || getVal('phone_num'); return; }
      if (label.includes('e-mail') || label.includes('email') || label.includes('recovery e-mail')) { target.textContent = getVal('email'); return; }
      if (label.includes('date of birth') || label === 'dob') { target.textContent = getVal('dob') || getVal('dateOfBirth'); return; }
      if (label.includes('gender')) { target.textContent = getVal('gender'); return; }
      if (label.includes('nin')) { target.textContent = getVal('nin'); return; }
      if (label.includes('bank')) { target.textContent = getVal('bank') || ''; return; }
      if (label.includes('acc') && label.includes('num')) { target.textContent = getVal('accountNumber') || getVal('accNum') || ''; return; }
      if (label.includes('acc') && label.includes('name')) { target.textContent = getVal('accountName') || ''; return; }
      if (label.includes('password')) { const pwd = getVal('password'); target.textContent = pwd ? '•'.repeat(Math.max(6, String(pwd).length)) : ''; return; }
      // fallback: try mapping by common field names inside label
      if (label.includes('address')) { target.textContent = getVal('address'); return; }
      if (label.includes('email') && !target.textContent) { target.textContent = getVal('email'); return; }
    });

    // Fill empty small placeholders inside cards (e.g., value-only spans)
    document.querySelectorAll('span[data-fill-empty], .card .value, .info-value').forEach(el => {
      if (el.textContent.trim()) return;
      const key = el.getAttribute('data-fill-empty') || el.dataset.key;
      if (key && getVal(key)) el.textContent = getVal(key);
    });

    // Ensure top-level welcome and profile name elements are updated
    updateNavbarUserDisplay(data);
  }

  function displayLoggedInUser() {
    const email = getLoggedInEmail();
    const form = document.getElementById("profileForm");
    let data = {};
    if (email) data = getUserRecord(email) || {};
    if (!data || Object.keys(data).length === 0) {
      try { data = JSON.parse(localStorage.getItem("nestedProfile") || "{}"); } catch {}
    }
    if (form && data) {
      Array.from(form.elements).forEach(el => {
        if (!el.name) return;
        if (el.type === "checkbox") el.checked = !!data[el.name];
        else if (el.type === "radio") { if (String(data[el.name]) === el.value) el.checked = true; }
        else el.value = data[el.name] ?? "";
      });
    }
    updateNavbarUserDisplay(data);
    // fill any empty card fields on page
    fillEmptyProfileSpaces();
  }

  function saveLoggedInUserChanges(profileData) {
    const email = getLoggedInEmail();
    if (email) {
      const existing = getUserRecord(email);
      const merged = Object.assign({}, existing, profileData);
      merged.name = merged.name || (merged.firstName ? (merged.firstName + (merged.lastName ? " " + merged.lastName : "")) : undefined);
      if (!merged.email) merged.email = email;
      saveUserRecord(email, merged);
      localStorage.setItem("nestedProfile", JSON.stringify(merged));
      updateNavbarUserDisplay(merged);
      // update card fields immediately
      fillEmptyProfileSpaces();
      localStorage.setItem("nestedProfile_lastUpdated", Date.now().toString());
      return merged;
    } else {
      localStorage.setItem("nestedProfile", JSON.stringify(profileData));
      updateNavbarUserDisplay(profileData);
      fillEmptyProfileSpaces();
      return profileData;
    }
  }

  window.displayLoggedInUser = displayLoggedInUser;
  window.saveLoggedInUserChanges = saveLoggedInUserChanges;
  window.getUserRecord = getUserRecord;
  window.fillEmptyProfileSpaces = fillEmptyProfileSpaces;

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
