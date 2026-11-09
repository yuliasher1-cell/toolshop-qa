import type { Locator, Page } from '@playwright/test';

/** Shopping cart (first step of the checkout). */
export class CartPage {
  readonly productTitles: Locator;
  readonly cartTotal: Locator;
  readonly proceedToCheckout: Locator;

  constructor(page: Page) {
    this.productTitles = page.getByTestId('product-title');
    this.cartTotal = page.getByTestId('cart-total');
    this.proceedToCheckout = page.getByTestId('proceed-1');
  }
}
