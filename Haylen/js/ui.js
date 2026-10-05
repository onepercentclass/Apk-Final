/* Helper UI: format, modal, toast, escape */
(function () {
  const UI = {
    esc(v) {
      return String(v == null ? "" : v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    },
    rupiah(n) { return "Rp " + Number(n || 0).toLocaleString("id-ID"); },
    number(n) { return Number(n || 0).toLocaleString("id-ID"); },
    trend(t) {
      if (t === 0) return '<span class="trend flat">0%</span>';
      return t > 0 ? `<span class="trend">↑ ${t}%</span>` : `<span class="trend down">↓ ${Math.abs(t)}%</span>`;
    },
    toast(msg) {
      const root = document.getElementById("toastRoot");
      const el = document.createElement("div");
      el.className = "toast";
      el.textContent = msg;
      root.appendChild(el);
      setTimeout(() => el.remove(), 2600);
    },
    today() {
      return new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    },
    modal(html, onMount) {
      const back = document.createElement("div");
      back.className = "modal-back";
      back.innerHTML = `<div class="modal">${html}</div>`;
      document.body.appendChild(back);
      const close = () => back.remove();
      back.addEventListener("click", (e) => { if (e.target === back) close(); });
      if (onMount) onMount(back.querySelector(".modal"), close);
      return close;
    },
    confirm(message) { return window.confirm(message); },
    denied(menu) {
      return `<div class="card denied"><h3>Akses ditolak</h3><p>Tier Anda tidak memiliki akses ke menu ini.</p></div>`;
    },
  };
  Haylen.ui = UI;
})();
