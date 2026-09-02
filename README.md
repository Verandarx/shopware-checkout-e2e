# Shopware 6 Guest Checkout — E2E Test (Selenium + JavaScript)

Automates **POS-01** from the manual test plan: a guest visitor adds "Demo Produkt"
(SW10001) to the cart and completes checkout using **Cash on Delivery (Nachnahme)**
as the payment method, then verifies an order confirmation page with an order number.

**Target environment:** the public demo store, `https://www.shopware6-demo.development-s25.com/`

## Stack
- [selenium-webdriver](https://www.npmjs.com/package/selenium-webdriver) — browser automation
- [Mocha](https://mochajs.org/) — test runner
- [Chai](https://www.chaijs.com/) — assertions
- Page Object Model — see `pages/` and `config/selectors.js`

## Project structure
```
config/selectors.js   # every CSS selector used, in one place
pages/BasePage.js     # shared Selenium wait/interaction helpers
pages/ProductPage.js  # product detail page actions
pages/CartPage.js     # cart page actions
pages/CheckoutPage.js # guest details + payment method + place order
pages/ConfirmationPage.js # order confirmation assertions
tests/guestCheckoutCashOnDelivery.test.js # the actual test (POS-01)
```

## Setup
1. Install [Node.js](https://nodejs.org/) (v18+ recommended).
2. Install [Google Chrome](https://www.google.com/chrome/) and make sure it's
   on your PATH (selenium-webdriver's Chrome driver manager will fetch a
   matching chromedriver automatically as of Selenium 4.6+).
3. From this project folder, install dependencies:
   ```
   npm install
   ```

## Selector verification status
All selectors actually used by `tests/guestCheckoutCashOnDelivery.test.js` were
verified on 2026-09-02 by walking the real checkout flow in Chrome DevTools
(add to cart → cart → guest address form → payment method → order confirmation)
and copying the real `id`/`class`/`data-*` attributes into `config/selectors.js`.

A couple of notable findings from that process, worth mentioning if asked:
- The "Cash on Delivery" payment option's underlying `<input>` has an opaque,
  environment-specific `id` (a payment-method UUID) and is visually hidden by
  the theme's custom radio styling — the test clicks the associated `<label>`
  instead, which is what a real user actually interacts with.
- The order confirmation element (`.finish-ordernumber`) carries a
  `data-order-number="10871"` attribute, so the test reads that directly
  instead of parsing the German label text ("Ihre Bestellnummer:10871") —
  more robust and not dependent on store language settings.
- `salutationSelect` and `quantityInput` are defined but unused by the current
  happy-path test (POS-01 uses default quantity 1 and doesn't set a salutation).
- No terms-and-conditions checkbox was present on this store's confirm step;
  `CheckoutPage.acceptTerms()` checks for it and safely no-ops if absent.

If you re-run this against a different Shopware install or a future version of
this demo store, re-verify selectors the same way — walk the flow manually in
DevTools once, since the payment-method ID in particular is not guaranteed
to stay the same across environments.

## Running the test
```
npm test
```

## What this test actually asserts (not just "page loaded")
- The cart contains exactly 1 line item after adding the product.
- After submitting the order, the URL contains `/checkout/finish`.
- The order confirmation page displays a **non-empty** order number.

These map directly to the "Expected Result" column of POS-01 in the manual
test plan — the goal was meaningful, specific assertions rather than a script
that just clicks through and checks nothing failed.

## Design decisions worth knowing (for explaining this in an interview)
- **Page Object Model**: test logic (what we're proving) is separated from
  page interaction logic (how we click/type on a given page). A UI change
  only requires touching the relevant Page Object, not the test itself.
- **Centralized selectors**: all CSS selectors live in `config/selectors.js`
  instead of being scattered across Page Objects, so future maintenance is a
  single-file change.
- **Unique email per run**: the guest email uses `Date.now()` so re-running
  the suite doesn't collide with a previous run's data.
- **Headless toggle**: headless for CI/fast runs, but easy to disable for
  local debugging — I call this out explicitly in the test file's `before()`.

## What I'd improve with more time
- Add explicit negative-path tests from the manual test plan (empty cart,
  missing required fields, invalid email) as separate test files reusing the
  same Page Objects — this suite currently only covers the one required
  positive case.
- Add a `data-testid`-based selector strategy proposal for the dev team,
  since class-name selectors (`.btn-buy`, etc.) are more brittle to
  unrelated CSS/theme changes than dedicated test hooks.
- Wrap the "add to cart" step with a wait on the mini-cart item **count**
  updating (not just the drawer opening), to guard against a race condition
  where the drawer animates in before the AJAX call actually completes.
- Add a GitHub Actions workflow to run the suite on every push.
- Take a screenshot automatically on test failure (Selenium's
  `driver.takeScreenshot()`) to speed up debugging flaky runs.
