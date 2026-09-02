const BasePage = require('./BasePage');
const selectors = require('../config/selectors');

/**
 * ConfirmationPage
 * ----------------
 * Corresponds to POS-01's Expected Result: an order confirmation page
 * with a generated order number. This is where the test's meaningful
 * assertions live (URL changed, success message visible, order number
 * is actually present and non-empty) rather than just "page loaded".
 */
class ConfirmationPage extends BasePage {
  async waitUntilLoaded() {
    await this.waitForUrlContains(selectors.confirmationPage.urlContains);
    await this.waitForElement(selectors.confirmationPage.successHeading);
  }

  async getSuccessHeadingText() {
    return this.getText(selectors.confirmationPage.successHeading);
  }

  async getOrderNumberText() {
    const el = await this.waitForElement(selectors.confirmationPage.orderNumber);
    // Prefer the data-order-number attribute over the element's visible
    // text: the text is "Ihre Bestellnummer:10871" (German, prefixed) and
    // would need parsing, while the attribute is just the raw number -
    // more robust and not dependent on store language settings.
    const attr = await el.getAttribute('data-order-number');
    if (attr) {
      return attr;
    }
    return el.getText();
  }
}

module.exports = ConfirmationPage;
