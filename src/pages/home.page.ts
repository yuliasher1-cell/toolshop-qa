import { expect, type Locator, type Page } from '@playwright/test';

/** Catalog page: product grid, search and sorting. */
export class HomePage {
  readonly productNames: Locator;
  readonly productPrices: Locator;
  private readonly searchInput: Locator;
  private readonly searchButton: Locator;
  private readonly sortSelect: Locator;

  constructor(private readonly page: Page) {
    this.productNames = page.getByTestId('product-name');
    this.productPrices = page.getByTestId('product-price');
    this.searchInput = page.getByTestId('search-query');
    this.searchButton = page.getByTestId('search-submit');
    this.sortSelect = page.getByTestId('sort');
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
    await expect(this.productNames.first()).toBeVisible();
  }

  async search(term: string): Promise<void> {
    await this.searchInput.fill(term);
    await this.searchButton.click();
  }

  /** @param value sort option value, e.g. "price,asc" or "name,desc" */
  async sortBy(value: string): Promise<void> {
    // Wait for the products list to be reloaded after the change, not for a fixed time.
    // The match is deliberately independent of how the app encodes the sort (query string
    // or request body): the tests verify the resulting order themselves.
    const sorted = this.page.waitForResponse(
      (response) => response.url().includes('/products') && response.status() === 200,
    );
    await this.sortSelect.selectOption(value);
    await sorted;
  }

  async visiblePrices(): Promise<number[]> {
    const texts = await this.productPrices.allTextContents();
    return texts.map((text) => Number(text.replace(/[^0-9.]/g, '')));
  }

  async openProduct(name: string): Promise<void> {
    await this.productNames.filter({ hasText: name }).first().click();
  }
}
