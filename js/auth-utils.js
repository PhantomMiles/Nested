// Lightweight auth helpers used by reg/login pages and auth.js
(function () {
  function normalizeEmail(email) {
    return (String(email || '').trim().toLowerCase());
  }

  // modal wrapper: supports auth.js showModal signature or falls back to alert()
  function showModalCompat(message, opts) {
    // opts may be { title, callback } or a callback function
    const options = typeof opts === 'function' ? { callback: opts } : (opts || {});
    if (typeof window.showModal === 'function') {
      try { window.showModal(String(message), options); return; } catch (e) {}
    }
    // fallback
    alert(String(message));
    if (typeof options.callback === 'function') options.callback();
  }

  function getUserKey(email) { return 'user_' + normalizeEmail(email); }
  function getUser(email) {
    try { return JSON.parse(localStorage.getItem(getUserKey(email)) || '{}'); } catch { return {}; }
  }
  function saveUser(email, userObj) {
    if (!email) throw new Error('email required');
    localStorage.setItem(getUserKey(email), JSON.stringify(userObj));
  }

  // Register: returns { ok: boolean, reason?, user? }
  function register(formData) {
    const email = normalizeEmail(formData.email);
    if (!email) return { ok: false, reason: 'missing_email' };
    if (!formData.password) return { ok: false, reason: 'missing_password' };

    if (localStorage.getItem(getUserKey(email))) return { ok: false, reason: 'exists' };

    const user = {
      email,
      firstName: formData.firstName || '',
      lastName: formData.lastName || '',
      name: (formData.firstName || '') + (formData.lastName ? ' ' + formData.lastName : ''),
      phone: formData.phone || '',
      dob: formData.dob || '',
      address: formData.address || '',
      nin: formData.nin || '',
      gender: formData.gender || '',
      bank: formData.bank || '',
      accountNumber: formData.accountNumber || '',
      accountName: formData.accountName || '',
      password: formData.password || '',
      avatar: formData.avatar || ''
    };

    saveUser(email, user);
    localStorage.setItem('loggedInUser', email);
    // update shared profile store and UI if auth.js helpers exist
    if (typeof window.saveLoggedInUserChanges === 'function') {
      window.saveLoggedInUserChanges(user);
    } else {
      localStorage.setItem('nestedProfile', JSON.stringify(user));
    }
    // broadcast change
    localStorage.setItem('nestedProfile_lastUpdated', Date.now().toString());
    return { ok: true, user };
  }

  // Login: returns { ok: boolean, reason?, user? }
  function login(emailRaw, password) {
    const email = normalizeEmail(emailRaw);
    if (!email) return { ok: false, reason: 'missing_email' };
    const stored = localStorage.getItem(getUserKey(email));
    if (!stored) return { ok: false, reason: 'not_found' };
    const user = JSON.parse(stored);
    if (String(user.password || '') !== String(password || '')) return { ok: false, reason: 'invalid_password' };

    localStorage.setItem('loggedInUser', email);
    // ensure nestedProfile is in sync
    if (typeof window.saveLoggedInUserChanges === 'function') {
      window.saveLoggedInUserChanges(user);
    } else {
      localStorage.setItem('nestedProfile', JSON.stringify(user));
    }
    localStorage.setItem('nestedProfile_lastUpdated', Date.now().toString());
    return { ok: true, user };
  }

  // Expose helpers
  window.authUtils = {
    normalizeEmail,
    showModalCompat,
    register,
    login,
    getUser
  };
})();