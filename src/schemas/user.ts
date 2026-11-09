import { z } from 'zod';

/** POST /users/login -> 200 (see docs/openapi, TokenResponse) */
export const TokenSchema = z.object({
  access_token: z.string().min(1),
  token_type: z.string(),
  expires_in: z.number(),
});

/** POST /users/register -> 201 (see docs/openapi, UserResponse) */
export const UserSchema = z.object({
  id: z.string().min(1),
  first_name: z.string(),
  last_name: z.string(),
  email: z.string().email(),
  dob: z.string(),
  phone: z.string().nullable().optional(),
  address: z
    .object({
      street: z.string(),
      city: z.string(),
      country: z.string(),
      house_number: z.string().nullable().optional(),
      state: z.string().nullable().optional(),
      postal_code: z.string().nullable().optional(),
    })
    .optional(),
});

export type Token = z.infer<typeof TokenSchema>;
export type UserDto = z.infer<typeof UserSchema>;
