import { z } from 'zod';

/**
 * Validates an API payload against a Zod schema and, on failure, throws one readable
 * error that lists every violated field. Used by contract tests.
 */
export function parseContract<S extends z.ZodTypeAny>(schema: S, data: unknown): z.infer<S> {
  const result = schema.safeParse(data);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('\n');
    throw new Error(`Contract violation:\n${issues}`);
  }
  return result.data;
}
