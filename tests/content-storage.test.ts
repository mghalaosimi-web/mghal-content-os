import { describe, it, expect } from 'vitest';
import { ContentStorage } from '@/modules/content/storage';

describe('ContentStorage & Dashboard Operations Tests (M003)', () => {
  it('should fetch content items with status filters', async () => {
    const allItems = await ContentStorage.getAll();
    expect(allItems.length).toBeGreaterThan(0);

    const pending = await ContentStorage.getAll({ status: 'PENDING_APPROVAL' });
    pending.forEach((i) => expect(i.status).toBe('PENDING_APPROVAL'));
  });

  it('should update content item status and log audit event', async () => {
    const items = await ContentStorage.getAll();
    const testItem = items[0];

    const updated = await ContentStorage.updateStatus(testItem.id, 'APPROVED');
    expect(updated).not.toBeNull();
    expect(updated?.status).toBe('APPROVED');

    // Platform variants should update accordingly
    updated?.platformVariants.forEach((v) => {
      expect(v.status).toBe('APPROVED');
    });
  });

  it('should update variant caption and record audit event', async () => {
    const items = await ContentStorage.getAll();
    const testItem = items[0];

    const updatedVariant = await ContentStorage.updateVariant(testItem.id, 'INSTAGRAM', {
      caption: 'نص إنستغرام معدل بواسطة المحرر اليدوي 🎯',
    });

    expect(updatedVariant).not.toBeNull();
    expect(updatedVariant?.caption).toContain('نص إنستغرام معدل');
  });

  it('should fetch audit logs in reverse chronological order', async () => {
    const logs = await ContentStorage.getAuditLogs(10);
    expect(logs.length).toBeGreaterThan(0);
    expect(logs[0].action).toBeDefined();
    expect(logs[0].createdAt).toBeDefined();
  });
});
