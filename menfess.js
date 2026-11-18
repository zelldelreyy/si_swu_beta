/* Menfess — form, filter, moderasi, dan papan pesan */
(function () {
  "use strict";
  var SI = window.SI;
  var store = SI.MenfessStore;
  var esc = SI.escapeHtml;
  if (!store) return;

  var form = document.getElementById("menfess-form");
  var textEl = document.getElementById("fess-text");
  var fromEl = document.getElementById("fess-from");
  var counter = document.getElementById("fess-counter");
  var statusEl = document.getElementById("fess-status");
  var submitBtn = document.getElementById("fess-submit");
  var wall = document.getElementById("fess-wall");
  var countEl = document.getElementById("fess-count");
  var max = (store.limits && store.limits.maxLength) || 280;

  /* --------------------------------------------------------- helpers */
  function timeAgo(iso) {
    var then = new Date(iso).getTime();
    if (isNaN(then)) return "";
    var diff = Math.max(0, Date.now() - then);
    var min = Math.floor(diff / 60000);
    if (min < 1) return "baru saja";
    if (min < 60) return min + " menit lalu";
    var hr = Math.floor(min / 60);
    if (hr < 24) return hr + " jam lalu";
    var day = Math.floor(hr / 24);
    if (day < 7) return day + " hari lalu";
    return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date(iso));
  }

  function setStatus(kind, message) {
    if (!statusEl) return;
    statusEl.className = "form-status is-shown form-status--" + kind;
    statusEl.textContent = message;
  }
  function clearStatus() {
    if (!statusEl) return;
    statusEl.className = "form-status";
    statusEl.textContent = "";
  }

  function updateCounter() {
    if (!counter || !textEl) return;
    var n = textEl.value.length;
    counter.textContent = n + "/" + max;
    counter.classList.toggle("is-near", n > max * 0.85 && n <= max);
    counter.classList.toggle("is-over", n > max);
  }

  if (textEl) {
    textEl.setAttribute("maxlength", String(max));
    textEl.addEventListener("input", updateCounter);
    updateCounter();
  }

  /* ------------------------------------------------------------ wall */
  function renderWall(items) {
    if (!wall) return;
    if (countEl) countEl.textContent = String(items.length);
    if (!items.length) {
      wall.innerHTML =
        '<div class="empty-state">Belum ada menfess yang tayang. Jadilah yang pertama menitip pesan.</div>';
      return;
    }
    wall.innerHTML = items.map(function (m, i) {
      var variant = ["", "fess--gold", "fess--orange"][i % 3];
      var sender = m.sender && m.sender !== "anonim" ? m.sender : "anonim";
      return (
        '<article class="fess ' + variant + '" data-reveal style="--i:' + (i % 4) + '">' +
          '<p class="fess__text">' + esc(m.text) + "</p>" +
          '<div class="fess__meta">' +
            '<span>— ' + esc(sender) + "</span>" +
            '<span><span class="fess__tag">#' + esc(m.tag || "menfess") + "</span> · " + esc(timeAgo(m.created_at)) + "</span>" +
          "</div>" +
        "</article>"
      );
    }).join("");
    SI.refreshReveal();
  }

  function loadWall() {
    store.listApproved().then(renderWall).catch(function () {
      if (wall) {
        wall.innerHTML =
          '<div class="empty-state">Gagal memuat papan menfess. Coba muat ulang halaman.</div>';
      }
    });
  }
  loadWall();

  /* ------------------------------------------------------------ form */
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      clearStatus();

      var text = textEl ? textEl.value : "";
      var sender = fromEl ? fromEl.value : "";

      if (store.findProfanity(text) || store.findProfanity(sender)) {
        setStatus("warn", "Pesan mengandung kata yang tidak pantas. Mohon tulis ulang dengan bahasa yang lebih sopan.");
        if (textEl) textEl.focus();
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Mengirim…";
      }

      store.submit({ text: text, sender: sender })
        .then(function () {
          setStatus("ok", "Pesan terkirim dan masuk antrean moderasi. Setelah disetujui pengurus, pesan akan tampil di papan.");
          if (textEl) textEl.value = "";
          if (fromEl) fromEl.value = "";
          updateCounter();
          SI.toast("Menfess terkirim, menunggu review pengurus");
        })
        .catch(function (err) {
          if (err && err.code === "cooldown") setStatus("warn", err.message);
          else if (err && err.message) setStatus("error", err.message === "remote-admin" ? "Mode admin tidak tersedia di browser." : "Gagal mengirim pesan. Coba lagi sebentar lagi.");
          else setStatus("error", "Gagal mengirim pesan. Coba lagi.");
        })
        .finally(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "Kirim menfess";
          }
        });
    });
  }

  /* Tampilkan sisa cooldown saat halaman dibuka, kalau ada. */
  var left = store.cooldownLeft && store.cooldownLeft();
  if (left > 0) {
    setStatus("warn", "Kamu baru saja mengirim menfess. Tunggu " + left + " detik sebelum mengirim lagi.");
  }
})();
