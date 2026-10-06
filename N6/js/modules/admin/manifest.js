/**
 * N6 build manifest - admin
 *
 * Every unit of the original admin.html main script is stored in exactly one file
 * under js/modules/admin/. This array restores the original source order when the
 * fragments are concatenated.
 *
 * shape: [ '<file-stem>', <how many consecutive units come from that file> ]
 *
 * Regenerate with: powershell -ExecutionPolicy Bypass -File tools/build.ps1
 */
//__N6_MANIFEST__
export const MANIFEST_ADMIN = [
  ['_core', 34],
  ['harga', 1],
  ['klien', 1],
  ['_core', 13],
  ['beranda', 2],
  ['klien', 3],
  ['_core', 4],
  ['klien', 2],
  ['_core', 4],
  ['harga', 1],
  ['jadwalcoach', 1],
  ['jadwalklien', 1],
  ['harga', 1],
  ['_core', 2],
  ['tiket', 2],
  ['klien', 1],
  ['pesan', 4],
  ['_core', 3],
  ['pesan', 1],
  ['_core', 1],
  ['jadwalcoach', 3],
  ['_core', 8],
  ['jadwalcoach', 3],
  ['klien', 1],
  ['jadwalcoach', 2],
  ['_core', 1],
  ['klien', 1],
  ['_core', 4],
  ['klien', 1],
  ['_core', 1],
  ['beranda', 2],
  ['_core', 3],
  ['beranda', 1],
  ['_core', 1],
  ['jadwalcoach', 1]
];

export default MANIFEST_ADMIN;
