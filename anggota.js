/* Anggota — skeleton, pencarian, modal dua panel dengan QR Instagram */
(function () {
  "use strict";
  var SI = window.SI;
  var esc = SI.escapeHtml;
  var members = SI.MEMBERS || [];

  var grid = document.getElementById("member-grid");
  var empty = document.getElementById("member-empty");
  var countEl = document.getElementById("member-count");
  var resetBtn = document.getElementById("member-reset");
  var searchInput = document.getElementById("member-search");
  var dialog = document.getElementById("member-dialog");

  var totalLabel = document.getElementById("member-total-label");
  if (totalLabel) totalLabel.textContent = members.length;

  /* ---------------------------------------------------------- skeleton */
  function skeletonCard() {
    return (
      '<div class="sk-card" aria-hidden="true">' +
        '<div class="skeleton sk-card__media"></div>' +
        '<div class="sk-card__body">' +
          '<div class="skeleton sk-line" style="width:62%"></div>' +
          '<div class="skeleton sk-line sk-line--sm"></div>' +
        "</div>" +
      "</div>"
    );
  }
  function showSkeleton(n) {
    if (!grid) return;
    grid.innerHTML = new Array(n).fill(skeletonCard()).join("");
    grid.setAttribute("aria-busy", "true");
    if (countEl) countEl.textContent = "Memuat anggota…";
  }

  /* ------------------------------------------------------------ render */
  function render(filter) {
    if (!grid) return;
    var q = String(filter || "").trim().toLowerCase();
    var list = members.map(function (m, i) { return { m: m, i: i }; }).filter(function (item) {
      if (!q) return true;
      var m = item.m;
      return (m.name + " " + (m.ig || "")).toLowerCase().indexOf(q) !== -1;
    });

    grid.innerHTML = list.map(function (item) { return SI.memberCard(item.m, item.i); }).join("");
    grid.setAttribute("aria-busy", "false");
    if (empty) empty.hidden = list.length !== 0;
    if (countEl) countEl.textContent = q ? list.length + " dari " + members.length + " anggota" : members.length + " anggota aktif";
    if (resetBtn) resetBtn.hidden = !q;
    SI.refreshReveal();
  }

  showSkeleton(8);
  setTimeout(function () { render(""); }, 340);

  /* ------------------------------------------------------------ search */
  if (searchInput) {
    searchInput.addEventListener("input", function () { render(searchInput.value); });
  }
  if (resetBtn) {
    resetBtn.addEventListener("click", function () {
      if (searchInput) { searchInput.value = ""; searchInput.focus(); }
      render("");
    });
  }

  /* ------------------------------------------------------------- modal */
  var current = null;

  function openMember(index) {
    var m = members[index];
    if (!m || !dialog) return;
    current = m;
    var ig = SI.igUrl(m);

    document.getElementById("member-photo").src = m.photo;
    document.getElementById("member-photo").alt = "Foto " + m.name;
    document.getElementById("member-name").textContent = m.name;
    document.getElementById("member-index").textContent = "ANGGOTA / " + String(index + 1).padStart(2, "0");
    document.getElementById("member-tag").textContent = m.ig ? "Instagram pribadi" : "SI 2026";
    document.getElementById("member-handle").textContent = ig.handle;

    var qr = document.getElementById("member-qr");
    if (qr) qr.innerHTML = SI.qrSvg(ig.url);

    var link = document.getElementById("member-ig");
    if (link) link.href = ig.url;

    var foot = document.getElementById("member-foot");
    if (foot) {
      foot.textContent = ig.custom
        ? "QR menuju profil Instagram pribadi " + ig.handle + "."
        : "Anggota ini belum mengirim akun pribadi — QR mengarah ke akun kelas " + ig.handle + ".";
    }

    SI.openDialog(dialog);
    if (history.replaceState) history.replaceState(null, "", "#m-" + (index + 1));
  }

  grid.addEventListener("click", function (e) {
    var card = e.target.closest("[data-member]");
    if (!card) return;
    openMember(parseInt(card.getAttribute("data-member"), 10));
  });

  /* close buttons */
  Array.prototype.forEach.call(dialog.querySelectorAll("[data-close]"), function (btn) {
    btn.addEventListener("click", function () {
      SI.closeDialog(dialog);
      if (history.replaceState) history.replaceState(null, "", location.pathname + location.search);
    });
  });

  /* copy username */
  var copyBtn = document.getElementById("member-copy");
  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      if (!current) return;
      var ig = SI.igUrl(current);
      SI.copyText(ig.handle).then(function () { SI.toast("Username " + ig.handle + " disalin"); })
        .catch(function () { SI.toast("Gagal menyalin, salin manual: " + ig.handle); });
    });
  }

  /* deep link #m-3 */
  function openFromHash() {
    var match = /^#m-(\d+)$/.exec(location.hash || "");
    if (!match) return;
    var idx = parseInt(match[1], 10) - 1;
    if (idx >= 0 && idx < members.length) {
      setTimeout(function () { openMember(idx); }, 420);
    }
  }
  window.addEventListener("hashchange", openFromHash);
  openFromHash();
})();
