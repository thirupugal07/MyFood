/* Renders every route in jsdom to catch runtime errors before shipping. */
import { JSDOM } from 'jsdom';
import { createServer } from 'vite';
import React from 'react';
import { renderToString } from 'react-dom/server';

const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
  url: 'http://localhost:5173/',
  pretendToBeVisual: true,
});

global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;
global.HTMLElement = dom.window.HTMLElement;
global.Element = dom.window.Element;
global.Node = dom.window.Node;
global.localStorage = dom.window.localStorage;
global.getComputedStyle = dom.window.getComputedStyle;
global.requestAnimationFrame = (cb) => setTimeout(cb, 0);
global.cancelAnimationFrame = (id) => clearTimeout(id);
global.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
dom.window.matchMedia = global.matchMedia;
global.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} };
global.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
Object.defineProperty(global.navigator, 'clipboard', {
  value: { writeText: async () => {} },
  configurable: true,
});

const vite = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error',
});

const { default: App } = await vite.ssrLoadModule('/src/App.jsx');

const routes = [
  '/',
  '/restaurants',
  '/restaurants?search=biriyani',
  '/restaurant/a1-ambur-biriyani',
  '/cart',
  '/offers',
  '/favourites',
  '/login',
  '/signup',
  '/forgot-password',
  '/orders',
  '/checkout',
  '/profile',
  '/this-does-not-exist',
];

let failures = 0;

for (const route of routes) {
  dom.window.history.pushState({}, '', route);
  try {
    const html = renderToString(React.createElement(App));
    const hasRoot = html.length > 200;
    console.log(`${hasRoot ? 'OK  ' : 'THIN'} ${route.padEnd(38)} ${html.length} chars`);
    if (!hasRoot) failures += 1;
  } catch (error) {
    failures += 1;
    console.log(`FAIL ${route} -> ${error.message}`);
    if (process.env.VERBOSE) console.log(error.stack);
  }
}

await vite.close();
console.log(failures === 0 ? '\nALL ROUTES RENDERED' : `\n${failures} ROUTE(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
