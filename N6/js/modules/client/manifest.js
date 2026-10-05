/**
 * N6 build manifest - client
 *
 * Every unit of the original client.html main script is stored in exactly one file
 * under js/modules/client/. This array restores the original source order when the
 * fragments are concatenated.
 *
 * shape: [ '<file-stem>', <how many consecutive units come from that file> ]
 *
 * Regenerate with: powershell -ExecutionPolicy Bypass -File tools/build.ps1
 */
//__N6_MANIFEST__
export const MANIFEST_CLIENT = [
  ['_core', 20],
  ['chat', 1],
  ['_core', 4],
  ['performa', 1],
  ['_core', 3],
  ['performa', 1],
  ['_core', 1],
  ['chat', 1],
  ['_core', 2],
  ['chat', 1],
  ['_core', 4],
  ['performa', 1]
];

export default MANIFEST_CLIENT;
