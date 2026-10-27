import { describe, it, expect } from 'vitest';
import { envSchema, getValidatedEnv } from '@/lib/config/env';

describe('Environment Configuration Validation', () => {
  it('should validate valid environment variables with default values', () => {
    const validEnv = {
      NODE_ENV: 'development',
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/mghal_content_os?schema=public',
      NEXT_PUBLIC_APP_NAME: 'M.GH.AL Content Studio',
      NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
    };

    const parsed = envSchema.safeParse(validEnv);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.NODE_ENV).toBe('development');
      expect(parsed.data.PORT).toBe('3000');
    }
  });

  it('should reject invalid NEXT_PUBLIC_APP_URL', () => {
    const invalidEnv = {
      DATABASE_URL: 'postgresql://localhost:5432/test',
      NEXT_PUBLIC_APP_URL: 'not-a-valid-url',
    };

    const parsed = envSchema.safeParse(invalidEnv);
    expect(parsed.success).toBe(false);
  });

  it('should not leak sensitive database passwords in error messages', () => {
    const invalidEnv = {
      NODE_ENV: 'invalid_env_mode',
      DATABASE_URL: 'postgresql://user:super_secret_password_123@localhost:5432/db',
    };

    try {
      getValidatedEnv(invalidEnv);
      expect.fail('Should have thrown an error');
    } catch (error: unknown) {
      const message = (error as Error).message;
      expect(message).not.toContain('super_secret_password_123');
      expect(message).toContain('Environment validation failed');
    }
  });
});
