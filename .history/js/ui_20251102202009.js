// ...new file...
/**
 * ui.js
 * Common interactive behaviors used across pages.
 * Depends on js/auth.js for showModal() and displayLoggedInUser()
 */

(function () {
  // safe no-op if showModal isn't available yet
  const modal = window.showModal || ((msg) => window.alert(msg));

  function qs(sel, ctx = document) { return ctx.querySelector(sel); }
  function qsa(sel, ctx = document) { return Array.from((ctx || document).querySelectorAll(sel)); }
  function download(filename, content, mime = 'text/csv') {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  }

  // Mobile menu + overlay (shared selector names used in your pages)
  function initMobileMenu() {
    const toggle = qs('#mobile-menu-toggle');
    const closeBtn = qs('#close-menu');
    const mobile = qs('#navbar-mobile');
    const overlay = qs('#menu-overlay');

    if (!toggle || !mobile) return;
    toggle.addEventListener('click', () => {
      mobile.classList.add('active');
      if (overlay) overlay.classList.remove('hidden');
      // show mobile user if logged in
      qs('#mobileUserInfo')?.classList.toggle('hidden', !localStorage.getItem('loggedInUser'));
    });
    closeBtn?.addEventListener('click', () => {
      mobile.classList.remove('active');
      overlay?.classList.add('hidden');
    });
    overlay?.addEventListener('click', () => {
      mobile.classList.remove('active');
      overlay.classList.add('hidden');
    });
  }

  // Search listings by text (listing pages)
  function initListingSearch() {
    const input = qs('#searchInput');
    if (!input) return;
    input.addEventListener('input', (e) => {
      const q = e.target.value.trim().toLowerCase();
      const items = qsa('.listing-item');
      items.forEach(it => {
        const txt = it.innerText.toLowerCase();
        it.style.display = q === '' || txt.includes(q) ? '' : 'none';
      });
    });
  }

  // Notifications: mark single and mark-all-read (delegated)
  function initNotifications() {
    // mark-all-read button id or class
    const markAll = qs('button:where(#markAllRead, .mark-all-read, [data-mark-all])') || qs('button:contains("Mark All Read")');
    if (markAll) {
      markAll.addEventListener('click', () => {
        qsa('.bg-blue-50, .notification-unread').forEach(n => {
          n.classList.remove('bg-blue-50');
          n.classList.add('bg-white', 'opacity-60');
        });
        modal('All notifications marked as read');
      });
    }

    // delegated mark-as-read / view-details in notifications container
    document.addEventListener('click', (e) => {
      const mr = e.target.closest('[data-mark-read], .mark-read, button:where(.mark-as-read)');
      if (mr) {
        const row = mr.closest('[data-notification]') || mr.closest('.notification');
        if (row) { row.classList.remove('bg-blue-50'); row.classList.add('bg-white'); }
        modal('Marked as read');
        return;
      }

      const vd = e.target.closest('[data-view-details], .view-details, .view-receipt');
      if (vd) {
        const row = vd.closest('tr, .notification, .card');
        let detail = '';
        if (row) detail = (row.innerText || '').trim().slice(0, 120);
        modal(detail || 'Details not available');
        return;
      }
    });
  }

  // Transactions: view receipt modal, export visible rows to CSV
  function initTransactions() {
    document.addEventListener('click', (e) => {
      const view = e.target.closest('.view-receipt, [data-view-receipt]');
      if (view) {
        const tr = view.closest('tr');
        if (!tr) { modal('Receipt not available'); return; }
        const cols = Array.from(tr.querySelectorAll('td')).map(td => td.innerText.trim());
        const html = `
          Date: ${cols[0]||''}
          Property: ${cols[1]||''}
          Type: ${cols[2]||''}
          Amount: ${cols[3]||''}
          Status: ${cols[4]||''}
          `;
        modal(html, { title: 'Receipt' });
        return;
      }

      // export CSV: element with class .export-csv or data-export
      const exportBtn = e.target.closest('.export-csv, [data-export]');
      if (exportBtn) {
        // find nearest table
        const table = exportBtn.closest('table') || document.querySelector('table');
        if (!table) { modal('No table to export'); return; }
        const rows = Array.from(table.querySelectorAll('thead tr, tbody tr')).filter(r=> r.style.display !== 'none');
        const csv = rows.map(r => Array.from(r.querySelectorAll('th,td')).map(c => `"${c.innerText.replace(/"/g,'""')}"`).join(',')).join('\r\n');
        download('transactions.csv', csv);
      }
    });
  }

  // "Load more" buttons reveal hidden items (notifications, listings etc)
  function initLoadMore() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.load-more, [data-load-more]');
      if (!btn) return;
      const containerSelector = btn.getAttribute('data-target') || btn.getAttribute('data-list') || '.mobile-card, .notification, .listing-item';
      const containerItems = qsa(containerSelector).filter(el => el.style.display === 'none' || el.classList.contains('hidden'));
      // show next 5 hidden
      containerItems.slice(0, 5).forEach(el => { el.style.display = ''; el.classList.remove('hidden'); });
      if (containerItems.length <= 5) btn.style.display = 'none';
    });
  }

  // Filter dropdown helper (generic)
  function initFilterDropdowns() {
    document.addEventListener('click', (e) => {
      const toggle = e.target.closest('[data-filter-toggle]');
      if (toggle) {
        const menu = document.querySelector(toggle.getAttribute('data-filter-toggle'));
        menu?.classList.toggle('hidden');
      }
      // close on outside click is handled elsewhere; keep simple
    });
  }

  // Small enhancement: turn any element with data-copy="selector" into a copy button
  function initCopyButtons() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-copy]');
      if (!btn) return;
      const sel = btn.getAttribute('data-copy');
      const src = qs(sel);
      if (!src) { modal('Nothing to copy'); return; }
      const text = src.innerText || src.value || src.getAttribute('href') || '';
      navigator.clipboard?.writeText(text).then(() => modal('Copied to clipboard'), () => modal('Copy failed'));
    });
  }

  // Auto-run app initializers
  function initAll() {
    initMobileMenu();
    initListingSearch();
    initNotifications();
    initTransactions();
    initLoadMore();
    initFilterDropdowns();
    initCopyButtons();
    // trigger display update if auth helper is present
    if (window.displayLoggedInUser) window.displayLoggedInUser();
  }

  // run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

  // expose helpers for debugging/testing
  window.ui = {
    initAll, initMobileMenu, initListingSearch, initNotifications, initTransactions
  };
});