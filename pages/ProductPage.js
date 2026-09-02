const BasePage = require('./BasePage');
const selectors = require('../config/selectors');

/**
 * ProductPage
 * -----------
 * Corresponds to POS-01 steps 1-4 of the manual test plan:
 * open the product detail page and add it to the cart.
 */
class ProductPage extends BasePage {
  async open() {
    await this.driver.get(selectors.productUrl);
    // A cookie-consent banner covers part of the page on first visit and
    // physically blocks clicks on elements underneath it (produces a
    // Selenium ElementClickInterceptedError otherwise) - dismiss it before
    // interacting with anything else.
    await this.dismissCookieBannerIfPresent();
  }

  async addToCart() {
    await this.waitAndClick(selectors.productPage.addToCartButton);
    // After clicking, Shopware's default theme opens a slide-in
    // "offcanvas" cart drawer rather than navigating away. Rather than
    // waiting on the drawer's own (unverified) wrapper class, we wait
    // directly for the "Zur Kasse" button we actually need next -
    // it only exists once the drawer has finished opening.
    await this.waitForElement(selectors.productPage.offCanvasGoToCheckoutLink);
  }

  async goToCheckoutFromOffCanvas() {
    await this.waitAndClick(selectors.productPage.offCanvasGoToCheckoutLink);
  }
}

module.exports = ProductPage;