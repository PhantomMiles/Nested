// js/auth.js
document.addEventListener("DOMContentLoaded", () => {
  // Desktop elements
  const loginLink = document.getElementById("loginLink");
  const signupLink = document.getElementById("signupLink");
  const userProfile = document.getElementById("userProfile");
  const profileBtn = document.getElementById("profileBtn");
  const profileDropdown = document.getElementById("profileDropdown");

  // Mobile elements
  const mobileUserInfo = document.getElementById("mobileUserInfo");
  const mobileUserName = document.getElementById("mobileUserName");
  const mobileAuthLinks = document.getElementById("mobileAuthLinks");
  const mobileProfileLinks = document.getElementById("mobileProfileLinks");

  const isLoggedIn = localStorage.getItem("loggedInUser");

  // ===== Handle Login State =====
  if (isLoggedIn) {
    // Desktop
    loginLink?.classList.add("hidden");
    signupLink?.classList.add("hidden");
    userProfile?.classList.remove("hidden");

    // Mobile
    mobileAuthLinks?.classList.add("hidden");
    mobileUserInfo?.classList.remove("hidden");
    mobileProfileLinks?.classList.remove("hidden");
    mobileUserName.textContent = isLoggedIn;
  }

  // ===== Desktop Dropdown Toggle =====
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
});
