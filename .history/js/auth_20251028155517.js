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
  const mobileMenu = document.querySelector("#navbar-mobile ul");
  const isLoggedIn = localStorage.getItem("loggedInUser");

  // ===== Handle Login State =====
  if (isLoggedIn) {
    // Desktop
    loginLink?.classList.add("hidden");
    signupLink?.classList.add("hidden");
    userProfile?.classList.remove("hidden");

    // Mobile
    mobileUserInfo?.classList.remove("hidden");
    mobileUserName.textContent = isLoggedIn;

    // Hide login/signup buttons
    mobileMenu.querySelectorAll("a[href='login.html'], a[href='signup.html']").forEach(el => el.parentElement.remove());

    // Add dropdown links
    if (!document.getElementById("mobileProfileLinks")) {
      const profileLinks = document.createElement("div");
      profileLinks.id = "mobileProfileLinks";
      profileLinks.className = "flex flex-col items-center w-full gap-2 mt-2";
      profileLinks.innerHTML = `
        <a href="user-profile.html" class="flex items-center justify-center px-6 py-4 text-white transition-all duration-300 border-2 menu-item border-indigo-400/50 rounded-2xl backdrop-filter backdrop-blur-lg hover:border-indigo-400 hover:bg-indigo-500/20">
          <i class='bx bx-user text-xl'></i> Profile
        </a>
        <a href="user-notifications.html" class="flex items-center justify-center px-6 py-4 text-white transition-all duration-300 border-2 menu-item border-indigo-400/50 rounded-2xl backdrop-filter backdrop-blur-lg hover:border-indigo-400 hover:bg-indigo-500/20">
          <i class='bx bx-bell text-xl'></i> Notifications
        </a>
        <a href="user-settings.html" class="flex items-center justify-center px-6 py-4 text-white transition-all duration-300 border-2 menu-item border-indigo-400/50 rounded-2xl backdrop-filter backdrop-blur-lg hover:border-indigo-400 hover:bg-indigo-500/20">
          <i class='
