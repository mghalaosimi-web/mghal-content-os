import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z
    .string()
    .min(1, 'DATABASE_URL is required')
    .default('postgresql://postgres:postgres@localhost:5432/mghal_content_os?schema=public'),
  PORT: z.string().optional().default('3000'),
  NEXT_PUBLIC_APP_NAME: z.string().default('M.GH.AL Content Studio'),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  GEMINI_API_KEY: z.string().optional(),
  ENCRYPTION_KEY: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

export function getValidatedEnv(customEnv?: Record<string, string | undefined>): Env {
  const source = customEnv || process.env;
  const parsed = envSchema.safeParse(source);

  if (!parsed.success) {
    const errorDetails = parsed.error.issues.map((issue) => issue.path.join('.')).join(', ');
    throw new Error(`Environment validation failed for variables: [${errorDetails}]. Check .env configuration.`);
  }

  return parsed.data;
}

export const env = getValidatedEnv();
