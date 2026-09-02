const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { expect } = require('chai');

const ProductPage = require('../pages/ProductPage');
const CartPage = require('../pages/CartPage');
const CheckoutPage = require('../pages/CheckoutPage');
const ConfirmationPage = require('../pages/ConfirmationPage');

/**
 * Automates POS-01 from the manual test plan:
 * "Guest completes checkout with Cash on Delivery — happy path"
 *
 * Steps mirrored 1:1 from the test plan so anyone reading the manual
 * test case can follow this file line-by-line:
 *   1-4. Open product page, add Demo Produkt to cart
 *   5.   Open cart, proceed to checkout
 *   6.   Fill in guest email + billing address
 *   7.   Select "Nachnahme" (Cash on Delivery)
 *   8.   Accept T&Cs
 *   9.   Submit the order
 * Expected result: order confirmation page with a generated order number.
 */
describe('Guest checkout with Cash on Delivery (POS-01)', function () {
  // End-to-end browser tests are slower than unit tests; extend Mocha's
  // default 2s timeout so a real page load doesn't fail the test early.
  this.timeout(60000);

  let driver;
  let productPage, cartPage, checkoutPage, confirmationPage;

  before(async function () {
    const options = new chrome.Options();
    // Comment out .headless() while you're first verifying selectors —
    // watching the real browser makes it obvious where a selector is wrong.
    options.addArguments('--window-size=1366,900');

    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();

    productPage = new ProductPage(driver);
    cartPage = new CartPage(driver);
    checkoutPage = new CheckoutPage(driver);
    confirmationPage = new ConfirmationPage(driver);
  });

  after(async function () {
    if (driver) {
      await driver.quit();
    }
  });

  it('completes an order end-to-end and shows an order number', async function () {
    // Steps 1-4: open product, add to cart
       await productPage.open();
    await driver.sleep(2000);
    await productPage.addToCart();
    await driver.sleep(4000);

    // Assertion: cart actually received the item before we go further.
    // Catches a real class of Shopware bugs (AJAX add-to-cart silently failing).
    await productPage.goToCheckoutFromOffCanvas();

    // Step 5 (already navigated via off-canvas link above).
    // If your site instead requires visiting the cart page directly, swap
    // the line above for: await cartPage.open(); await cartPage.proceedToCheckout();
    const itemCount = await cartPage.getLineItemCount();
    expect(itemCount, 'expected exactly one line item in the cart').to.equal(1);

    // Step 6: guest details
    await checkoutPage.fillGuestDetails({
      email: `qa.selenium.${Date.now()}@example.com`, // unique per run, avoids account-exists conflicts
      firstName: 'Jane',
      lastName: 'Tester',
      street: 'Teststraße 1',
      zipcode: '10115',
      city: 'Berlin',
    });
    await checkoutPage.submitGuestDetails();

    // Step 7: payment method
    await checkoutPage.selectCashOnDelivery();

    // Step 8: accept terms
    await checkoutPage.acceptTerms();

    // Step 9: place the order
    await checkoutPage.placeOrder();

    // Expected result: confirmation page with an order number
    await confirmationPage.waitUntilLoaded();

    const currentUrl = await confirmationPage.getCurrentUrl();
    expect(currentUrl, 'expected to land on the order confirmation page').to.include('/checkout/finish');

    const orderNumberText = await confirmationPage.getOrderNumberText();
    expect(orderNumberText.trim(), 'expected a non-empty order number to be displayed').to.not.equal('');
  });
});
