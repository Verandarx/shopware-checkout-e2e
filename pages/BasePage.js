const { By, until } = require('selenium-webdriver');

const DEFAULT_TIMEOUT_MS = 10000;

/**
 * BasePage
 * --------
 * Every Page Object extends this class. It wraps the raw Selenium
 * `driver` with small, named helper methods (waitAndClick, waitAndType,
 * etc.) so the actual Page Objects read like plain English steps
 * instead of repeating `driver.wait(until.elementLocated(...))`
 * everywhere.
 *
 * This is the core idea behind the Page Object Model:
 * - Page Objects know WHERE things are (selectors) and WHAT you can do
 *   on that page (methods like addToCart(), fillGuestDetails()).
 * - Test files know WHAT the test is trying to prove (assertions).
 * They don't mix, so a UI change breaks only the Page Object, never
 * the test's logic.
 */
class BasePage {
  constructor(driver) {
    this.driver = driver;
  }

  async waitForElement(cssSelector, timeout = DEFAULT_TIMEOUT_MS) {
    const locator = By.css(cssSelector);
    return this.driver.wait(until.elementLocated(locator), timeout, `Timed out waiting for element: ${cssSelector}`)
      .then(async (el) => {
        await this.driver.wait(until.elementIsVisible(el), timeout);
        return el;
      });
  }

  async waitAndClick(cssSelector, timeout = DEFAULT_TIMEOUT_MS) {
    const el = await this.waitForElement(cssSelector, timeout);
    await this.driver.wait(until.elementIsEnabled(el), timeout);
    await el.click();
    return el;
  }

  async waitAndType(cssSelector, text, timeout = DEFAULT_TIMEOUT_MS) {
    const el = await this.waitForElement(cssSelector, timeout);
    await el.clear();
    await el.sendKeys(text);
    return el;
  }

  async getText(cssSelector, timeout = DEFAULT_TIMEOUT_MS) {
    const el = await this.waitForElement(cssSelector, timeout);
    return el.getText();
  }

  async isDisplayed(cssSelector, timeout = 3000) {
    try {
      await this.waitForElement(cssSelector, timeout);
      return true;
    } catch (e) {
      return false;
    }
  }

  async waitForUrlContains(fragment, timeout = DEFAULT_TIMEOUT_MS) {
    return this.driver.wait(until.urlContains(fragment), timeout, `Timed out waiting for URL to contain: ${fragment}`);
  }

  async getCurrentUrl() {
    return this.driver.getCurrentUrl();
  }
}

module.exports = BasePage;
