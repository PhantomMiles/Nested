// js/auth.js
document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector("#myHeader");
  const mobileMenu = document.querySelector("#navbar-mobile ul");
  const userEmail = localStorage.getItem("loggedInUser");

  if (userEmail) {
    // Remove Login & Sign Up links in header
    header?.querySelectorAll('a[href="login.html"], a[href="signup.html"]').forEach((a) => a.remove());

    // Add Profile Avatar Dropdown (Desktop)
    const profileMenu = `
      <div class="relative group ml-4">
        <button class="flex items-center focus:outline-none">
          <img src="img/user-avatar.png" alt="User Avatar" class="w-9 h-9 rounded-full border-2 border-indigo-500">
        </button>

        <!-- Dropdown -->
        <div class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 origin-top-right z-50">
          <a href="user-profile.html" class="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-100">Profile</a>
          <a href="user-notifications.html" class="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-100">Notifications</a>
          <a href="user-settings.html" class="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-100">Settings</a>
          <a href="#" id="logoutLink" class="block px-4 py-2 text-sm text-red-600 hover:bg-red-100">Logout</a>
        </div>
      </div>
    `;
    header.insertAdjacentHTML("beforeend", profileMenu);

    // Update Mobile Menu
    if (mobileMenu) {
      // Remove login/signup links
      mobileMenu.querySelectorAll('a[href="login.html"], a[href="signup.html"]').forEach((a) => a.parentElement.remove());

      // Add user dropdown (simplified)
      const mobileProfile = document.createElement("li");
      mobileProfile.innerHTML = `
        <div class="bg-white rounded-2xl p-4 text-center shadow-lg space-y-2">
          <img src="img/user-avatar.png" alt="User Avatar" class="mx-auto w-16 h-16 rounded-full border-2 border-indigo-500">
          <p class="font-semibold text-darkBlue">${userEmail}</p>
          <div class="flex flex-col gap-2 mt-2">
            <a href="user-profile.html" class="text-sm text-gray-700 hover:text-indigo-600">Profile</a>
            <a href="user-notifications.html" class="text-sm text-gray-700 hover:text-indigo-600">Notifications</a>
            <a href="user-settings.html" class="text-sm text-gray-700 hover:text-indigo-600">Settings</a>
            <a href="#" id="mobileLogout" class="text-sm text-red-500 hover:text-red-700">Logout</a>
          </div>
        </div>
      `;
      mobileMenu.appendChild(mobileProfile);
    }
  }

  // Logout functionality
  function logoutUser() {
    localStorage.removeItem("loggedInUser");
    location.reload();
  }

  document.querySelector("#logoutLink")?.addEventListener("click", logoutUser);
  document.querySelector("#mobileLogout")?.addEventListener("click", logoutUser);
});
