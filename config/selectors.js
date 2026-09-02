/**
 * CENTRALIZED SELECTORS
 * ----------------------
 * Every CSS selector the test suite uses lives here, in one place.
 * Why: if the site's markup changes, you fix it in ONE file instead of
 * hunting through every Page Object / test file. This is a standard
 * Page Object Model practice and something worth mentioning if asked
 * "how did you make this maintainable?"
 *
 * STATUS: all selectors actually exercised by tests/guestCheckoutCashOnDelivery.test.js
 * were verified against the live DOM on 2026-09-02 by walking the real
 * checkout flow in Chrome DevTools (see README "Verifying selectors").
 * Two fields remain unverified/unused and are safe to ignore for now:
 *   - salutationSelect: not touched by the current happy-path test
 *   - quantityInput: not touched by the current happy-path test
 *     (POS-01 uses the default quantity of 1)
 * termsCheckbox was not observed on this store's confirm step at all -
 * CheckoutPage.acceptTerms() guards for its absence and no-ops safely.
 */

module.exports = {
  baseUrl: 'https://www.shopware6-demo.development-s25.com',
  productUrl: 'https://www.shopware6-demo.development-s25.com/Demo-Produkt/SW10001',

  productPage: {
    addToCartButton: 'button.btn-buy',              // VERIFIED 2026-09-02
    quantityInput: 'input.product-detail-quantity-select, select.product-detail-quantity-select', // VERIFY - qty stepper can be <input> or <select> depending on theme
    offCanvasGoToCheckoutLink: 'a.begin-checkout-btn', // VERIFIED 2026-09-02 - "Zur Kasse" link inside the drawer
  },

  cartPage: {
    url: 'https://www.shopware6-demo.development-s25.com/checkout/cart',
    lineItem: '.line-item-label',                    // VERIFIED 2026-09-02 - one link per cart row (product name)
    cartTotal: 'span.header-cart-total',              // VERIFIED 2026-09-02
    proceedToCheckoutButton: 'a.begin-checkout-btn',  // VERIFIED 2026-09-02 - "Weiter zur Kasse" / "Zur Kasse" button
  },

  checkoutGuestPage: {
    // Guest checkout / register form
    guestFormToggle: null,                              // NOT NEEDED - this store shows the guest form directly, no toggle
    emailInput: '#personalMail',                        // VERIFIED 2026-09-02
    salutationSelect: '#personalSalutation',            // VERIFY (not used by current test, salutation left at default)
    firstNameInput: '#billingAddress-personalFirstName', // VERIFIED 2026-09-02
    lastNameInput: '#billingAddress-personalLastName',   // VERIFIED 2026-09-02
    streetInput: '#billingAddress-AddressStreet',       // VERIFIED 2026-09-02
    zipcodeInput: '#billingAddressAddressZipcode',       // VERIFIED 2026-09-02
    cityInput: '#billingAddressAddressCity',             // VERIFIED 2026-09-02
    countrySelect: '#billingAddressAddressCountry',      // VERIFIED 2026-09-02 - defaults to Germany already selected, not touched by the test
    submitButton: 'button[type="submit"].btn-primary.btn-lg', // VERIFIED 2026-09-02 - "Weiter" button (only submit button on this page)
  },

  checkoutConfirmPage: {
    cashOnDeliveryLabel: 'label[for="paymentMethod019bf75c3a21734c80c6bf7200e2dd21"]', // VERIFIED 2026-09-02 - clicking the label, not the visually-hidden radio input
    termsCheckbox: '#tos, input[name="tos"]',           // VERIFY - not observed on this store's confirm step; code guards for its absence
    submitOrderButton: '#confirmFormSubmit',             // VERIFIED 2026-09-02
  },

  confirmationPage: {
    // The order confirmation page URL typically contains /checkout/finish
    urlContains: '/checkout/finish',
    successHeading: '.finish-header',                    // VERIFIED 2026-09-02 - actually an <h1 class="finish-header">
    orderNumber: '.finish-ordernumber',                  // VERIFIED 2026-09-02 - also has data-order-number attr, cleaner to read than text
  },
};
