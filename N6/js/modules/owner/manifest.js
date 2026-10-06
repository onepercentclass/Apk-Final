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
  ['_synced', 1],
];
