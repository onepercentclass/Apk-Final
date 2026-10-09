/** Registry aksi untuk atribut data-act. Setiap modul mendaftarkan aksinya sendiri. */
export const A = {};

export function registerActions(map) {
  Object.assign(A, map);
}
