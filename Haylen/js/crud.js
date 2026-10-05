/* Halaman tabel generik (list + tambah/ubah/hapus) yang dipakai menu non-dashboard.
   Aksi dibatasi oleh tier lewat Haylen.access.can(menu, aksi). */
(function () {
  const { ui, api, access } = Haylen;

  Haylen.crud = {
    async render(el, cfg) {
      // cfg: { menu, resource, title, subtitle, addLabel, columns[], fields[] }
      const canAdd = access.can(cfg.menu, "add");
      const canEdit = access.can(cfg.menu, "edit");
      const canDel = access.can(cfg.menu, "delete");
      let rows = await api.list(cfg.resource);
      let q = "";

      el.innerHTML = `
        <div class="page-head">
          <div><h2>${ui.esc(cfg.title)}</h2><p>${ui.esc(cfg.subtitle || "")}</p></div>
          <span class="spacer"></span>
          ${canAdd ? `<button class="btn" id="crudAdd">+ ${ui.esc(cfg.addLabel || "Tambah")}</button>` : ""}
        </div>
        ${cfg.summary ? `<div class="summary-grid" id="crudSummary"></div>` : ""}
        <div class="card">
          <div class="page-tools"><input id="crudSearch" placeholder="Cari..."></div>
          <div class="table-wrap"><table class="table" id="crudTable"></table></div>
        </div>`;

      const fmt = (col, row) => {
        const v = row[col.key];
        if (col.type === "money") return ui.rupiah(v);
        if (col.type === "badge") {
          const tone = { Aktif: "green", Baik: "green", Pemasukan: "green", Cuti: "yellow", Belum: "yellow", "Perlu Perawatan": "yellow", Pengeluaran: "red", Hadir: "green" }[v] || "blue";
          return `<span class="badge ${tone}">${ui.esc(v)}</span>`;
        }
        return ui.esc(v);
      };

      const draw = () => {
        const list = rows.filter((r) => JSON.stringify(r).toLowerCase().includes(q));
        const head = cfg.columns.map((c) => `<th>${ui.esc(c.label)}</th>`).join("") + (canEdit || canDel ? "<th></th>" : "");
        const body = list.length
          ? list.map((r) => `<tr>${cfg.columns.map((c) => `<td data-label="${ui.esc(c.label)}">${fmt(c, r)}</td>`).join("")}${
              canEdit || canDel
                ? `<td class="td-actions"><div class="actions">${canEdit ? `<button class="btn ghost sm" data-edit="${r.id}">Ubah</button>` : ""}${canDel ? `<button class="btn danger sm" data-del="${r.id}">Hapus</button>` : ""}</div></td>`
                : ""
            }</tr>`).join("")
          : `<tr><td class="empty" colspan="${cfg.columns.length + 1}">Belum ada data.</td></tr>`;
        el.querySelector("#crudTable").innerHTML = `<thead><tr>${head}</tr></thead><tbody>${body}</tbody>`;
        if (cfg.summary) {
          el.querySelector("#crudSummary").innerHTML = cfg.summary(rows)
            .map((s) => `<div class="summary-box"><small>${ui.esc(s.label)}</small><strong>${ui.esc(s.value)}</strong></div>`).join("");
        }
      };

      const reload = async () => { rows = await api.list(cfg.resource); draw(); };

      const form = (row) => {
        const html = `<h3>${row ? "Ubah" : "Tambah"} ${ui.esc(cfg.title)}</h3><form id="crudForm">${cfg.fields.map((f) => {
          const val = row ? row[f.key] : (f.default != null ? f.default : "");
          if (f.options) {
            return `<div class="field"><label>${ui.esc(f.label)}</label><select name="${f.key}">${f.options.map((o) => `<option ${o === val ? "selected" : ""}>${ui.esc(o)}</option>`).join("")}</select></div>`;
          }
          return `<div class="field"><label>${ui.esc(f.label)}</label><input name="${f.key}" type="${f.type || "text"}" value="${ui.esc(val)}" required></div>`;
        }).join("")}<div class="modal-actions"><button type="button" class="btn ghost" id="crudCancel">Batal</button><button class="btn" type="submit">Simpan</button></div></form>`;
        ui.modal(html, (m, close) => {
          m.querySelector("#crudCancel").onclick = close;
          m.querySelector("#crudForm").onsubmit = async (e) => {
            e.preventDefault();
            const data = {};
            cfg.fields.forEach((f) => {
              const v = e.target.elements[f.key].value;
              data[f.key] = f.type === "number" ? Number(v) : v;
            });
            if (row) await api.update(cfg.resource, row.id, data);
            else await api.create(cfg.resource, data);
            close();
            ui.toast("Data tersimpan");
            reload();
          };
        });
      };

      el.querySelector("#crudSearch").oninput = (e) => { q = e.target.value.toLowerCase(); draw(); };
      if (canAdd) el.querySelector("#crudAdd").onclick = () => form(null);
      el.addEventListener("click", async (e) => {
        const ed = e.target.closest("[data-edit]");
        const dl = e.target.closest("[data-del]");
        if (ed) form(rows.find((r) => r.id === Number(ed.dataset.edit)));
        if (dl && ui.confirm("Hapus data ini?")) {
          await api.remove(cfg.resource, Number(dl.dataset.del));
          ui.toast("Data dihapus");
          reload();
        }
      });

      draw();
      // Aksi cepat dari dashboard (mis. Tambah Member)
      if (Haylen.pendingAction === "add" && canAdd) { Haylen.pendingAction = null; form(null); }
    },
  };
})();
