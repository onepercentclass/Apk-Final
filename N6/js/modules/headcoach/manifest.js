/**
 * N6 build manifest - headcoach
 *
 * Every unit of the original headcoach.html main script is stored in exactly one file
 * under js/modules/headcoach/. This array restores the original source order when the
 * fragments are concatenated.
 *
 * shape: [ '<file-stem>', <how many consecutive units come from that file> ]
 *
 * Regenerate with: powershell -ExecutionPolicy Bypass -File tools/build.ps1
 */
//__N6_MANIFEST__
export const MANIFEST_HEADCOACH = [
  ['_core', 20],
  ['hub', 3],
  ['_core', 1],
  ['klien', 1],
  ['hub', 1],
  ['_core', 1],
  ['klien', 1],
  ['coach', 1],
  ['_core', 1],
  ['klien', 1],
  ['_core', 1],
  ['coach', 2],
  ['_core', 5],
  ['coach', 5],
  ['klien', 3],
  ['_core', 2],
  ['atlet', 1],
  ['_core', 2],
  ['atlet', 2],
  ['_core', 1],
  ['atlet', 2],
  ['_core', 1],
  ['atlet', 3],
  ['_core', 11],
  ['koreksi', 5],
  ['_core', 2],
  ['klien', 1],
  ['_core', 6],
  ['klien', 1],
  ['_core', 1],
  ['klien', 1],
  ['koreksi', 1],
  ['_core', 1],
  ['koreksi', 1],
  ['_core', 3],
  ['klien', 1],
  ['_core', 8],
  ['klien', 1]
];

export default MANIFEST_HEADCOACH;
