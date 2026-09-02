const { By } = require('selenium-webdriver');
const BasePage = require('./BasePage');
const selectors = require('../config/selectors');

/**
 * CheckoutPage
 * ------------
 * Corresponds to POS-01 steps 6-9: fill in guest billing details,
 * select "Cash on Delivery" (Nachnahme) as the payment method, accept
 * the T&Cs, and submit the order.
 *
 * Two Shopware steps (guest details, then payment/shipping confirm)
 * are modeled as one Page Object here for simplicity, since in the
 * default flow they're really one continuous "checkout" journey for a
 * guest. If the real site splits them into two distinct URLs/pages
 * with a page reload in between, it's clean to split this into
 * CheckoutRegisterPage + CheckoutConfirmPage later — the test file
 * below wouldn't need to change much either way.
 */
class CheckoutPage extends BasePage {
  async fillGuestDetails({ email, firstName, lastName, street, zipcode, city }) {
    // Some Shopware installs show a "Register | Guest" tab toggle before
    // the address form; this demo store shows the guest form directly, so
    // guestFormToggle is null. Guard here so the code still works on
    // installs that DO have a toggle, without breaking this one.
    if (selectors.checkoutGuestPage.guestFormToggle
        && await this.isDisplayed(selectors.checkoutGuestPage.guestFormToggle, 3000)) {
      await this.waitAndClick(selectors.checkoutGuestPage.guestFormToggle);
    }

    await this.waitAndType(selectors.checkoutGuestPage.emailInput, email);
    await this.waitAndType(selectors.checkoutGuestPage.firstNameInput, firstName);
    await this.waitAndType(selectors.checkoutGuestPage.lastNameInput, lastName);
    await this.waitAndType(selectors.checkoutGuestPage.streetInput, street);
    await this.waitAndType(selectors.checkoutGuestPage.zipcodeInput, zipcode);
    await this.waitAndType(selectors.checkoutGuestPage.cityInput, city);
    // Country select left at its default value on purpose — POS-01 is the
    // happy path and the demo store's default country is expected to be valid.
  }

  async submitGuestDetails() {
    await this.waitAndClick(selectors.checkoutGuestPage.submitButton);
  }

  async selectCashOnDelivery() {
    // Click the <label>, not the radio <input> - Shopware's default theme
    // visually hides the raw input and styles the label as the clickable
    // control. Clicking a hidden input directly would throw an
    // ElementNotInteractableError in Selenium.
    await this.waitAndClick(selectors.checkoutConfirmPage.cashOnDeliveryLabel);
  }

  async acceptTerms() {
    if (await this.isDisplayed(selectors.checkoutConfirmPage.termsCheckbox, 3000)) {
      await this.waitAndClick(selectors.checkoutConfirmPage.termsCheckbox);
    }
  }

  async placeOrder() {
    await this.waitAndClick(selectors.checkoutConfirmPage.submitOrderButton);
  }
}

module.exports = CheckoutPage;
