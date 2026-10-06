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
  ['_synced', 1],
];
