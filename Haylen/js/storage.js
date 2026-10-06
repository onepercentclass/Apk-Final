/* Lapisan data localStorage (dipakai selama USE_API = false) */
(function () {
  const PREFIX = Haylen.config.STORAGE_PREFIX;
  const key = (k) => PREFIX + k;

  const Storage = {
    get(name, fallback = null) {
      try {
        const raw = localStorage.getItem(key(name));
        return raw === null ? fallback : JSON.parse(raw);
      } catch (e) {
        return fallback;
      }
    },
    set(name, value) {
      localStorage.setItem(key(name), JSON.stringify(value));
    },
    list(name) { return this.get(name, []); },
    create(name, item) {
      const rows = this.list(name);
      item.id = rows.reduce((m, r) => Math.max(m, r.id || 0), 0) + 1;
      rows.push(item);
      this.set(name, rows);
      return item;
    },
    update(name, id, patch) {
      const rows = this.list(name);
      const i = rows.findIndex((r) => r.id === id);
      if (i < 0) return null;
      rows[i] = Object.assign({}, rows[i], patch);
      this.set(name, rows);
      return rows[i];
    },
    remove(name, id) {
      this.set(name, this.list(name).filter((r) => r.id !== id));
      return true;
    },
  };

  Haylen.storage = Storage;
})();
