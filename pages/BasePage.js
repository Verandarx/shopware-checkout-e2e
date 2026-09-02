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
    // Scroll the element to the center of the viewport first. Checkout
    // pages often have a sticky order-summary sidebar that can overlap
    // elements near the bottom of the page, causing a native click to be
    // "intercepted" by that overlapping element instead of reaching the
    // real target.
    await this.driver.executeScript('arguments[0].scrollIntoView({block: "center", inline: "center"});', el);
    try {
      await el.click();
    } catch (err) {
      // Fallback: dispatch the click via JS directly on the element. This
      // bypasses whatever is visually overlapping it. Used only as a
      // fallback (not the default) because it can mask a genuine UI bug
      // where an element is legitimately unusable - worth keeping in mind
      // if this fallback ever fires unexpectedly.
      await this.driver.executeScript('arguments[0].click();', el);
    }
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

  /**
   * Cookie-consent banners often style multiple buttons with the exact
   * same CSS classes ("Accept necessary" vs "Configure"), so a class
   * selector can't tell them apart reliably. Matching by visible text via
   * XPath is the more robust choice for this specific kind of element.
   */
  async waitAndClickByText(tagName, text, timeout = DEFAULT_TIMEOUT_MS) {
    const xpath = `//${tagName}[contains(normalize-space(.), "${text}")]`;
    const locator = By.xpath(xpath);
    const el = await this.driver.wait(until.elementLocated(locator), timeout, `Timed out waiting for ${tagName} containing text: ${text}`);
    await this.driver.wait(until.elementIsVisible(el), timeout);
    await this.driver.wait(until.elementIsEnabled(el), timeout);
    await this.driver.executeScript('arguments[0].scrollIntoView({block: "center", inline: "center"});', el);
    try {
      await el.click();
    } catch (err) {
      await this.driver.executeScript('arguments[0].click();', el);
    }
    return el;
  }

  async dismissCookieBannerIfPresent(timeout = 4000) {
    try {
      await this.waitAndClickByText('button', 'Nur technisch notwendige', timeout);
    } catch (e) {
      // Banner wasn't shown (e.g. already dismissed earlier in this
      // browser session) - nothing to do.
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