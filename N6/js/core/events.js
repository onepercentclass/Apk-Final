/**
 * N6 - event bus
 *
 * A single channel for cross-module notifications. The five original
 * dashboards used a mix of CustomEvent on document and direct function calls;
 * the bus exists so new modules do not have to guess which.
 *
 *   const bus = getBus();
 *   const off = bus.on('clients:changed', () => reload());
 *   bus.emit('clients:changed', { id });
 *   off();
 */

const CHANNEL = '__n6_bus__';

function createBus() {
  const listeners = new Map();

  return {
    on(event, handler) {
      if (typeof handler !== 'function') return () => {};
      if (!listeners.has(event)) listeners.set(event, new Set());
      listeners.get(event).add(handler);
      return () => this.off(event, handler);
    },

    once(event, handler) {
      const off = this.on(event, (payload) => {
        off();
        handler(payload);
      });
      return off;
    },

    off(event, handler) {
      const set = listeners.get(event);
      if (set) {
        set.delete(handler);
        if (set.size === 0) listeners.delete(event);
      }
    },

    emit(event, payload) {
      const set = listeners.get(event);
      if (!set) return 0;
      let delivered = 0;
      for (const handler of Array.from(set)) {
        delivered += 1;
        try {
          handler(payload, event);
        } catch (err) {
          console.error(`[n6] listener for "${event}" threw`, err);
        }
      }
      return delivered;
    },

    count(event) {
      return listeners.get(event)?.size ?? 0;
    },

    clear(event) {
      if (event) listeners.delete(event);
      else listeners.clear();
    },
  };
}

/** Lazily create the bus so importing this module has no side effects. */
export function getBus() {
  if (typeof window === 'undefined') return createBus();
  if (!window[CHANNEL]) window[CHANNEL] = createBus();
  return window[CHANNEL];
}

/** Event names, kept in one place so typos surface fast. */
export const EVENTS = {
  READY: 'app:ready',
  ROLE_CHANGED: 'app:role-changed',
  PANEL_CHANGED: 'app:panel-changed',
  ACCESS_DENIED: 'access:denied',
  DATA_SOURCE_CHANGED: 'data:source-changed',
  CLIENTS_CHANGED: 'clients:changed',
  SCHEDULE_CHANGED: 'schedule:changed',
  MESSAGES_CHANGED: 'messages:changed',
  TICKETS_CHANGED: 'tickets:changed',
  PROGRAMS_CHANGED: 'programs:changed',
  PRICING_CHANGED: 'pricing:changed',
  FINANCE_CHANGED: 'finance:changed',
};

export const bus = getBus();
export default bus;