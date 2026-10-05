/**
 * N6 - DOM helpers
 *
 * Thin wrappers around querySelector / createElement. Kept separate from
 * utils.js so that anything touching the document is greppable in one place.
 */

export const $ = (selector, root = document) => root.querySelector(selector);
export const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

/** Create an element with attributes, dataset, styles and children in one call. */
export function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') node.className = v;
    else if (k === 'html') node.innerHTML = v;
    else if (k === 'text') node.textContent = v;
    else if (k === 'dataset') Object.assign(node.dataset, v);
    else if (k === 'style' && typeof v === 'object') Object.assign(node.style, v);
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2).toLowerCase(), v);
    else node.setAttribute(k, v === true ? '' : String(v));
  }
  for (const child of [].concat(children)) {
    if (child == null) continue;
    node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
  }
  return node;
}

/** Set textContent only when the node exists. Safe to call before a view mounts. */
export function setText(selector, value, root = document) {
  const node = typeof selector === 'string' ? $(selector, root) : selector;
  if (node) node.textContent = value == null ? '' : String(value);
  return node;
}

/** Toggle a class and return the new state. */
export function toggleClass(node, className, force) {
  if (!node) return false;
  return node.classList.toggle(className, force);
}

/** addEventListener that returns its own unsubscribe function. */
export function on(target, type, handler, options) {
  if (!target) return () => {};
  target.addEventListener(type, handler, options);
  return () => target.removeEventListener(type, handler, options);
}

/** Delegate a listener from a container to matching descendants. */
export function delegate(root, type, selector, handler) {
  return on(root, type, (event) => {
    const match = event.target instanceof Element ? event.target.closest(selector) : null;
    if (match && root.contains(match)) handler(event, match);
  });
}

/**
 * Hide an element without leaving it in the accessibility tree or the tab
 * order. `hidden` alone is ignored by any rule that sets `display`, so this
 * also sets an inline display value the stylesheet cannot win against.
 */
export function hide(node) {
  if (!node) return;
  node.hidden = true;
  node.style.setProperty('display', 'none', 'important');
}

export function show(node) {
  if (!node) return;
  node.hidden = false;
  node.style.removeProperty('display');
}

export function remove(node) {
  if (node && node.parentNode) node.parentNode.removeChild(node);
}

/** Replace a container's children with markup in one shot. */
export function render(node, markup) {
  if (node) node.innerHTML = markup;
  return node;
}

/** Resolve once every <link> in the list has fired load or error. */
export function whenStylesLoaded(hrefs) {
  return Promise.all(hrefs.map((href) => new Promise((resolve) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.addEventListener('load', () => resolve(href));
    link.addEventListener('error', () => resolve(href));
    document.head.appendChild(link);
  })));
}

/** Load and execute a classic script, resolving once it has run. */
export function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-n6-src="${src}"]`);
    if (existing) { resolve(src); return; }
    const script = document.createElement('script');
    script.src = src;
    script.async = false;
    script.dataset.n6Src = src;
    script.addEventListener('load', () => resolve(src));
    script.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)));
    document.body.appendChild(script);
  });
}

/** Read a numeric dataset value, falling back when absent. */
export function dataNumber(node, key, fallback = 0) {
  const raw = node?.dataset?.[key];
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}