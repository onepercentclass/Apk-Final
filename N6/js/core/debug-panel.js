/**
 * N6 - Debug Panel (Fase H3)
 *
 * Panel debug kecil yang muncul saat ?debug=1.
 * Menampilkan: versi, role, status API, jumlah data di memory.
 */

import { N6_VERSION } from './version.js';
import { logger } from './logger.js';

let panelEl = null;

function getMemoryStats() {
  const stats = {};
  try {
    // Coba akses variabel global dari role bundles
    if (typeof clients !== 'undefined' && Array.isArray(clients)) {
      stats.clients = clients.length;
    }
    if (typeof coachRoster !== 'undefined' && Array.isArray(coachRoster)) {
      stats.coaches = coachRoster.length;
    }
    if (typeof tickets !== 'undefined' && Array.isArray(tickets)) {
      stats.tickets = tickets.length;
    }
  } catch (e) {
    // abaikan
  }
  return stats;
}

export function showDebugPanel() {
  if (panelEl) return; // sudah tampil

  const params = new URLSearchParams(window.location.search);
  const role = params.get('role') || 'unknown';

  const memStats = getMemoryStats();
  const memHtml = Object.entries(memStats)
    .map(([k, v]) => `<div>${k}: <b>${v}</b></div>`)
    .join('') || '<div><i>no data</i></div>';

  const apiEnabled = window.N6_API?.enabled ? '✅ enabled' : '❌ disabled';
  const apiBase = window.N6_API?.base || '-';

  panelEl = document.createElement('div');
  panelEl.id = 'n6-debug-panel';
  panelEl.innerHTML = `
    <div style="position:fixed;bottom:10px;right:10px;z-index:99999;
                background:#1a1a1a;color:#0f0;font-family:monospace;font-size:11px;
                padding:10px 12px;border-radius:8px;border:1px solid #0f0;
                max-width:280px;box-shadow:0 2px 10px rgba(0,0,0,0.5);">
      <div style="font-weight:bold;margin-bottom:6px;color:#ff0;">🔧 N6 DEBUG</div>
      <div>Version: <b>${N6_VERSION}</b></div>
      <div>Role: <b>${role}</b></div>
      <div>API: <b>${apiEnabled}</b></div>
      <div style="font-size:10px;color:#888;">${apiBase}</div>
      <div style="margin-top:6px;border-top:1px solid #333;padding-top:6px;">
        <div style="color:#ff0;">Memory:</div>
        ${memHtml}
      </div>
      <div style="margin-top:6px;">
        <button onclick="localStorage.removeItem('n6:debug');location.search=location.search.replace(/[?&]debug=1/,'')"
                style="background:#333;color:#fff;border:1px solid #555;border-radius:4px;
                       padding:2px 8px;font-size:10px;cursor:pointer;">
          Hide (clear flag)
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(panelEl);
  logger.info('debug-panel', 'Debug panel ditampilkan', { version: N6_VERSION, role });
}

export function hideDebugPanel() {
  if (panelEl) {
    panelEl.remove();
    panelEl = null;
  }
}

export default { showDebugPanel, hideDebugPanel };
