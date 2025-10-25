// js/auth.js
document.addEventListener("DOMContentLoaded", () => {
  const navbar = document.querySelector("#navbar");
  const mobileMenu = document.querySelector("#navbar-mobile ul");

  const isLoggedIn = localStorage.getItem("loggedInUser");

  // Desktop replacements
  const dashboardLink = `
    <a href="user-dashboard.html" class="px-3 py-1 text-sm font-semibold text-white">Dashboard</a>
  `;
  const logoutLink = `
    <a href="#" id="logoutLink" class="px-3 py-1 text-sm font-semibold text-white">Logout</a>
  `;

  // If logged in → replace Login & Sign Up
  if (isLoggedIn) {
    navbar?.querySelectorAll('a[href="login.html"], a[href="signup.html"]').forEach((a) => a.remove());
    navbar?.insertAdjacentHTML("beforeend", dashboardLink + logoutLink);

    // Mobile menu
    if (mobileMenu) {
      mobileMenu.querySelectorAll('a[href="login.html"], a[href="signup.html"]').forEach((a) => a.parentElement.remove());
      const dashItem = document.createElement("li");
      dashItem.innerHTML = `<a href="user-dashboard.html" class="flex items-center justify-center px-6 py-4 text-white hover:bg-indigo-600 rounded-xl">Dashboard</a>`;
      const logoutItem = document.createElement("li");
      logoutItem.innerHTML = `<a href="#" id="mobileLogout" class="flex items-center justify-center px-6 py-4 text-red-500 hover:bg-red-700 hover:text-white rounded-xl">Logout</a>`;
      mobileMenu.appendChild(dashItem);
      mobileMenu.appendChild(logoutItem);
    }
  }

  // Logout action
  function logoutUser() {
    localStorage.removeItem("loggedInUser");
    location.reload();
  }
  document.querySelector("#logoutLink")?.addEventListener("click", logoutUser);
  document.querySelector("#mobileLogout")?.addEventListener("click", logoutUser);
});
