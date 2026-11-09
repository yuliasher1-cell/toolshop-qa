import { z } from 'zod';

/** One product, as returned by GET /products and GET /products/{id} (see docs/openapi, ProductResponse) */
export const ProductSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  price: z.number().nonnegative(),
  in_stock: z.boolean(),
  is_rental: z.boolean(),
  description: z.string().optional(),
  is_location_offer: z.boolean().optional(),
  is_eco_friendly: z.boolean().optional(),
  co2_rating: z.string().nullable().optional(),
  brand: z.object({ id: z.string(), name: z.string() }).optional(),
  category: z.object({ id: z.string(), name: z.string() }).optional(),
  product_image: z.object({ id: z.string(), file_name: z.string() }).optional(),
});

/** GET /products -> 200 (paginated) */
export const PaginatedProductsSchema = z.object({
  current_page: z.number().int(),
  data: z.array(ProductSchema),
  from: z.number().int().nullable(),
  last_page: z.number().int(),
  per_page: z.number().int(),
  to: z.number().int().nullable(),
  total: z.number().int(),
});

export type Product = z.infer<typeof ProductSchema>;
export type PaginatedProducts = z.infer<typeof PaginatedProductsSchema>;
