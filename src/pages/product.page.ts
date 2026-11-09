import type { Locator, Page } from '@playwright/test';

/** Product details page. */
export class ProductPage {
  readonly name: Locator;
  readonly unitPrice: Locator;
  private readonly addToCartButton: Locator;

  constructor(private readonly page: Page) {
    this.name = page.getByTestId('product-name');
    this.unitPrice = page.getByTestId('unit-price');
    this.addToCartButton = page.getByTestId('add-to-cart');
  }

  async goto(productId: string): Promise<void> {
    await this.page.goto(`/product/${productId}`);
  }

  async addToCart(): Promise<void> {
    await this.addToCartButton.click();
  }
}
