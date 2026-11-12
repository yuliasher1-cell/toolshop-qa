import type { APIRequestContext, APIResponse } from '@playwright/test';
import { env } from '../config/env';
import type { NewUser } from '../data/user-factory';

export type ProductQuery = Record<string, string | number>;

/**
 * Thin client over the Toolshop REST API. It returns raw responses on purpose:
 * tests decide what to assert (status, schema, business rules).
 * Absolute URLs are built from the active target, so it works from any Playwright project.
 */
export class ToolshopApi {
  constructor(private readonly request: APIRequestContext) {}

  private url(path: string): string {
    return `${env.apiURL}${path}`;
  }

  register(user: NewUser): Promise<APIResponse> {
    return this.request.post(this.url('/users/register'), { data: user });
  }

  login(email: string, password: string): Promise<APIResponse> {
    return this.request.post(this.url('/users/login'), { data: { email, password } });
  }

  getProducts(params: ProductQuery = {}): Promise<APIResponse> {
    return this.request.get(this.url('/products'), { params });
  }

  getProduct(id: string): Promise<APIResponse> {
    return this.request.get(this.url(`/products/${id}`));
  }

  /** Requires a bearer token obtained from login(). */
  addFavorite(token: string, productId: string): Promise<APIResponse> {
    return this.request.post(this.url('/favorites'), {
      headers: { Authorization: `Bearer ${token}` },
      data: { product_id: productId },
    });
  }

  /** Logs in and returns the bearer token. Fails loudly: it is a precondition, not the thing under test. */
  async tokenFor(email: string, password: string): Promise<string> {
    const response = await this.login(email, password);
    if (response.status() !== 200) {
      throw new Error(`Precondition failed: login for ${email} returned ${response.status()}: ${await response.text()}`);
    }
    return (await response.json()).access_token as string;
  }

  /** Generic authenticated (or anonymous, when token is omitted) GET. */
  get(path: string, token?: string): Promise<APIResponse> {
    return this.request.get(this.url(path), { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  }

  createBrand(token: string, brand: { name: string; slug: string }): Promise<APIResponse> {
    return this.request.post(this.url('/brands'), {
      headers: { Authorization: `Bearer ${token}` },
      data: brand,
    });
  }

  /** DELETE with an optional token (omit it to call the endpoint anonymously). */
  deleteBrand(id: string | number, token?: string): Promise<APIResponse> {
    return this.request.delete(this.url(`/brands/${id}`), {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  }

  getBrand(id: string | number): Promise<APIResponse> {
    return this.request.get(this.url(`/brands/${id}`));
  }

  getInvoices(token: string): Promise<APIResponse> {
    return this.get('/invoices', token);
  }

  getUser(id: string | number, token: string): Promise<APIResponse> {
    return this.get(`/users/${id}`, token);
  }
}
