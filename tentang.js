/* Tentang — isi kartu dosen wali + wajah kelas dari data.js */
(function () {
  "use strict";
  var SI = window.SI;
  var esc = SI.escapeHtml;
  var a = SI.ADVISOR || {};

  function setText(id, value) {
    var el = document.getElementById(id);
    if (el) el.textContent = value || "—";
  }

  setText("advisor-initials", a.initials);
  setText("advisor-name", a.name);
  setText("advisor-office", a.office);
  setText("advisor-hours", a.hours);

  var email = document.getElementById("advisor-email");
  if (email) { email.textContent = a.email || "—"; email.href = "mailto:" + (a.email || ""); }
  var phone = document.getElementById("advisor-phone");
  if (phone) { phone.textContent = a.phone || "—"; phone.href = "tel:" + String(a.phone || "").replace(/[^+\d]/g, ""); }
  var mail = document.getElementById("advisor-mail");
  if (mail) mail.href = "mailto:" + (a.email || "");

  var grid = document.getElementById("people-grid");
  if (grid) {
    var featured = (SI.MEMBERS || []).slice(0, 8);
    grid.innerHTML = featured.map(function (m) {
      var idx = SI.MEMBERS.indexOf(m) + 1;
      return (
        '<a class="person-card" href="anggota.html#m-' + idx + '" data-reveal>' +
          '<img src="' + esc(m.photo) + '" alt="Foto ' + esc(m.name) + '" loading="lazy" decoding="async" width="900" height="600">' +
          '<span><span class="person-card__name">' + esc(m.name) + "</span></span>" +
        "</a>"
      );
    }).join("");
  }

  SI.refreshReveal();
})();
