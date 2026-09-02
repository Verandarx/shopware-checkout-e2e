const BasePage = require('./BasePage');
const selectors = require('../config/selectors');

/**
 * CartPage
 * --------
 * Corresponds to POS-01 step 5: open the cart and proceed to checkout.
 * Kept separate from ProductPage/CheckoutPage even though it's a small
 * page, because in the manual test plan the cart page is also the
 * target of several negative/edge cases (NEG-01, NEG-04) — having it
 * as its own Page Object means those future tests can reuse it too.
 */
class CartPage extends BasePage {
  async open() {
    await this.driver.get(selectors.cartPage.url);
  }

  async getLineItemCount() {
    const items = await this.driver.findElements({ css: selectors.cartPage.lineItem });
    return items.length;
  }

  async getCartTotalText() {
    return this.getText(selectors.cartPage.cartTotal);
  }

  async proceedToCheckout() {
    await this.waitAndClick(selectors.cartPage.proceedToCheckoutButton);
  }
}

module.exports = CartPage;
