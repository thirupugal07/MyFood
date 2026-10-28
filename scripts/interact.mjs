/* Drives the real UI in jsdom: add to cart, sign in, checkout. */
import { JSDOM } from 'jsdom';
import { createServer } from 'vite';
import React from 'react';

const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
  url: 'http://localhost:5173/',
  pretendToBeVisual: true,
});

const w = dom.window;
global.window = w;
global.document = w.document;
global.navigator = w.navigator;
global.HTMLElement = w.HTMLElement;
global.HTMLInputElement = w.HTMLInputElement;
global.Element = w.Element;
global.Node = w.Node;
global.Event = w.Event;
global.MouseEvent = w.MouseEvent;
global.PopStateEvent = w.PopStateEvent;
global.localStorage = w.localStorage;
global.getComputedStyle = w.getComputedStyle;
global.requestAnimationFrame = (cb) => setTimeout(cb, 0);
global.cancelAnimationFrame = (id) => clearTimeout(id);
global.IS_REACT_ACT_ENVIRONMENT = true;
w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
global.matchMedia = w.matchMedia;
Object.defineProperty(w.navigator, 'clipboard', { value: { writeText: async () => {} }, configurable: true });

const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
const { default: App } = await vite.ssrLoadModule('/src/App.jsx');
const { createRoot } = await import('react-dom/client');
const { act } = await import('react-dom/test-utils');

const container = document.getElementById('root');
const root = createRoot(container);
await act(async () => {
  root.render(React.createElement(App));
});

const flush = async (ms = 700) => {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, ms));
  });
};

const go = async (path) => {
  await act(async () => {
    w.history.pushState({}, '', path);
    w.dispatchEvent(new w.PopStateEvent('popstate'));
  });
  await flush();
};

const texts = () => container.textContent || '';

const findButton = (label, scope = container) =>
  [...scope.querySelectorAll('button')].find((b) => (b.textContent || '').trim().toLowerCase() === label.toLowerCase());

const click = async (el) => {
  if (!el) throw new Error('element not found to click');
  await act(async () => {
    el.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  });
  await flush();
};

const typeInto = async (input, value) => {
  const setter = Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype, 'value').set;
  await act(async () => {
    setter.call(input, value);
    input.dispatchEvent(new w.Event('input', { bubbles: true }));
  });
};

const results = [];
const check = (name, condition, detail = '') => {
  results.push({ name, ok: Boolean(condition), detail });
  console.log(`${condition ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
};

/* 1. Home page loads restaurants from the mock API */
await go('/');
check('home renders hero', texts().includes('Hungry?'));
check('home lists restaurants', texts().includes('A1 Ambur Biriyani'));

/* 2. Restaurant page: add an item to the cart */
await go('/restaurant/a1-ambur-biriyani');
check('menu page renders items', texts().includes('Ambur Chicken Biriyani'));
const addButton = findButton('Add');
await click(addButton);
check('adding an item updates the header cart badge', /1/.test(container.querySelector('.hdr__badge')?.textContent || ''));
const storedCart = JSON.parse(w.localStorage.getItem('myfood:cart') || '{}');
check('cart persisted to localStorage', storedCart.items?.length === 1, JSON.stringify(storedCart.items?.map((i) => i.name)));

/* 3. Quantity stepper */
const plus = container.querySelector('.menu-item__stepper .stepper__btn:last-of-type');
await click(plus);
const storedCart2 = JSON.parse(w.localStorage.getItem('myfood:cart') || '{}');
check('stepper increases quantity', storedCart2.items?.[0]?.qty === 2, `qty=${storedCart2.items?.[0]?.qty}`);

/* 4. Cart page shows the bill */
await go('/cart');
check('cart page shows item total', texts().includes('Item total'));
check('cart page shows taxes', texts().includes('Taxes'));

/* 5. Checkout is protected */
await go('/checkout');
check('checkout redirects anonymous users to login', w.location.pathname === '/login', w.location.pathname);

/* 6. Sign in with the demo account */
await go('/login');
const inputs = container.querySelectorAll('input');
await typeInto(inputs[0], 'demo@myfood.app');
await typeInto(inputs[1], 'demo1234');
const submit = findButton('Sign in');
await act(async () => {
  submit.closest('form').dispatchEvent(new w.Event('submit', { bubbles: true, cancelable: true }));
});
await flush(900);
check('login succeeds and leaves the auth screen', w.location.pathname !== '/login', `path=${w.location.pathname}`);
check('token stored', Boolean(w.localStorage.getItem('myfood:token')));

/* 7. Checkout with the saved address */
await go('/checkout');
check('checkout renders saved address', texts().includes('12/4, Second Main Road'));
check('checkout shows payment options', texts().includes('Cash on delivery'));
const placeOrder = [...container.querySelectorAll('button')].find((b) => (b.textContent || '').includes('Place order'));
check('place order button is enabled', placeOrder && !placeOrder.disabled);
await click(placeOrder);
await flush(1200);
check('order placed and routed to the order page', /^\/orders\/ord_/.test(w.location.pathname), w.location.pathname);
check('cart cleared after ordering', JSON.parse(w.localStorage.getItem('myfood:cart') || '{}').items?.length === 0);
check('order confirmation shown', texts().includes('Order confirmed'));

/* 8. Order history contains the order */
await go('/orders');
check('order appears in history', texts().includes('A1 Ambur Biriyani') && texts().includes('MF-'));

/* 9. Search filters the listing */
await go('/restaurants');
await go('/restaurants?search=pizza');
check('search narrows results', texts().includes("Domino's Pizza"));

/* 10. 404 */
await go('/definitely-not-a-page');
check('404 page renders', texts().includes('404'));

const failed = results.filter((r) => !r.ok);
await act(async () => root.unmount());
await vite.close();
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length === 0 ? 0 : 1);
