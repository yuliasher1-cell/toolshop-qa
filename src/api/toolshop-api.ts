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
}
