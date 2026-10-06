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
  ['_synced', 1],
];
