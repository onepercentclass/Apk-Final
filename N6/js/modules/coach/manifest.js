/**
 * N6 build manifest - coach
 *
 * Every unit of the original coach.html main script is stored in exactly one file
 * under js/modules/coach/. This array restores the original source order when the
 * fragments are concatenated.
 *
 * shape: [ '<file-stem>', <how many consecutive units come from that file> ]
 *
 * Regenerate with: powershell -ExecutionPolicy Bypass -File tools/build.ps1
 */
//__N6_MANIFEST__
export const MANIFEST_COACH = [
  ['_core', 1],
  ['klien', 1],
  ['_core', 7],
  ['klien', 1],
  ['_core', 6],
  ['klien', 3],
  ['_core', 3],
  ['jadwal', 2],
  ['home', 1],
  ['_core', 6],
  ['klien', 1],
  ['home', 1],
  ['_core', 3],
  ['klien', 4],
  ['info', 1],
  ['_core', 2],
  ['info', 1],
  ['_core', 3],
  ['info', 1],
  ['_core', 3],
  ['info', 1],
  ['_core', 1],
  ['jadwal', 2],
  ['_core', 2],
  ['jadwal', 1],
  ['_core', 8],
  ['jadwal', 3],
  ['klien', 1],
  ['_core', 7],
  ['jadwal', 1],
  ['klien', 1],
  ['_core', 1],
  ['info', 1]
];

export default MANIFEST_COACH;
