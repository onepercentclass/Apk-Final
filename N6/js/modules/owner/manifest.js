/**
 * N6 build manifest - owner
 *
 * Every unit of the original owner.html main script is stored in exactly one file
 * under js/modules/owner/. This array restores the original source order when the
 * fragments are concatenated.
 *
 * shape: [ '<file-stem>', <how many consecutive units come from that file> ]
 *
 * Regenerate with: powershell -ExecutionPolicy Bypass -File tools/build.ps1
 */
//__N6_MANIFEST__
export const MANIFEST_OWNER = [
  ['_core', 1],
  ['komisi', 1],
  ['_core', 35],
  ['klien', 1],
  ['_core', 25],
  ['beranda', 3],
  ['klien', 3],
  ['_core', 4],
  ['klien', 2],
  ['_core', 2],
  ['klien', 1],
  ['jadwalklien', 1],
  ['_core', 1],
  ['harga', 1],
  ['_core', 1],
  ['harga', 1],
  ['_core', 5],
  ['jadwalcoach', 1],
  ['_core', 3],
  ['komisi', 3],
  ['keuangan', 1],
  ['_core', 7],
  ['keuangan', 1],
  ['_core', 3],
  ['keuangan', 2],
  ['_core', 1],
  ['keuangan', 2],
  ['klien', 1],
  ['_core', 4],
  ['tiket', 2],
  ['klien', 1],
  ['pesan', 4],
  ['_core', 3],
  ['pesan', 1],
  ['_core', 2],
  ['jadwalcoach', 1],
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
  ['_core', 5],
  ['beranda', 1],
  ['_core', 1],
  ['beranda', 2],
  ['jadwalcoach', 1]
];

export default MANIFEST_OWNER;
