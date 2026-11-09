import type { Locator, Page } from '@playwright/test';

/** Navigation bar shown on every page. */
export class Header {
  readonly signInLink: Locator;
  readonly userMenu: Locator;
  readonly cartLink: Locator;
  readonly cartQuantity: Locator;

  constructor(private readonly page: Page) {
    this.signInLink = page.getByTestId('nav-sign-in');
    this.userMenu = page.getByTestId('nav-menu');
    this.cartLink = page.getByTestId('nav-cart');
    this.cartQuantity = page.getByTestId('cart-quantity');
  }

  async openCart(): Promise<void> {
    await this.cartLink.click();
  }
}
