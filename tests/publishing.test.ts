import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PublisherService } from '@/modules/publishing/publisher-service';
import { FacebookPublisher } from '@/modules/publishing/facebook-publisher';
import { InstagramPublisher } from '@/modules/publishing/instagram-publisher';
import { TikTokPublisher } from '@/modules/publishing/tiktok-publisher';
import { LocalJsonStorage } from '@/modules/content/local-store';
import type { PlatformType } from '@/types';

describe('Real Live Publishing & Accounts Connection (M006)', () => {
  beforeEach(() => {
    // Reset test connected accounts
    LocalJsonStorage.deleteConnectedAccount('FACEBOOK');
    LocalJsonStorage.deleteConnectedAccount('INSTAGRAM');
    LocalJsonStorage.deleteConnectedAccount('TIKTOK');
  });

  it('strictly forbids WHATSAPP on all levels', async () => {
    expect(() => {
      PublisherService.getCredential('WHATSAPP' as PlatformType);
    }).toThrow(/محظورة/);

    const saveRes = await PublisherService.saveAndVerifyCredential({
      platform: 'WHATSAPP' as PlatformType,
      accessToken: 'test-token',
    });
    expect(saveRes.success).toBe(false);
    expect(saveRes.error).toContain('محظورة');

    const pubRes = await PublisherService.publishLive({
      contentItemId: 'item-demo-1',
      platform: 'WHATSAPP' as PlatformType,
      caption: 'Test',
      hashtags: [],
    });
    expect(pubRes.success).toBe(false);
    expect(pubRes.error).toContain('محظورة');
  });

  it('returns proper error when platform credentials are not connected', async () => {
    const res = await PublisherService.publishLive({
      contentItemId: 'item-demo-1',
      platform: 'FACEBOOK',
      caption: 'منشور تجريبي حقيقي',
      hashtags: ['#تجربة'],
    });

    expect(res.success).toBe(false);
    expect(res.platform).toBe('FACEBOOK');
    expect(res.error).toContain('غير مربوط');
  });

  it('handles Facebook verification failures truthfully with accurate diagnostics', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      json: async () => ({ error: { message: 'Invalid OAuth access token.' } }),
    } as Response);

    const res = await FacebookPublisher.verifyConnection('invalid_page_id', 'invalid_token');
    fetchSpy.mockRestore();
    expect(res.success).toBe(false);
    expect(res.error).toBeDefined();
    expect(res.error).toContain('فشل التحقق');
  });

  it('handles Instagram verification failures truthfully with accurate diagnostics', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      json: async () => ({ error: { message: 'The access token could not be decrypted' } }),
    } as Response);

    const res = await InstagramPublisher.verifyConnection('invalid_ig_id', 'invalid_token');
    fetchSpy.mockRestore();
    expect(res.success).toBe(false);
    expect(res.error).toBeDefined();
  });

  it('handles TikTok verification failures truthfully with accurate diagnostics', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      json: async () => ({ error: { message: 'Invalid token' } }),
    } as Response);

    const res = await TikTokPublisher.verifyConnection('invalid_token');
    fetchSpy.mockRestore();
    expect(res.success).toBe(false);
    expect(res.error).toBeDefined();
  });

  it('stores and retrieves credentials in persistent LocalJsonStorage', () => {
    LocalJsonStorage.saveConnectedAccount({
      platform: 'FACEBOOK',
      accountName: 'صفحة M.GH.AL الرسمية',
      accountId: '1234567890',
      accessToken: 'EAAB_test_mock_token_strictly_for_local_testing',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const account = LocalJsonStorage.getConnectedAccountByPlatform('FACEBOOK');
    expect(account).not.toBeNull();
    expect(account?.accountName).toBe('صفحة M.GH.AL الرسمية');
    expect(account?.accountId).toBe('1234567890');

    // Clean up
    LocalJsonStorage.deleteConnectedAccount('FACEBOOK');
    expect(LocalJsonStorage.getConnectedAccountByPlatform('FACEBOOK')).toBeNull();
  });
});
