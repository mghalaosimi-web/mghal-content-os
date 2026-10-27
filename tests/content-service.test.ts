import { describe, it, expect } from 'vitest';
import { ContentService } from '@/modules/content/service';

describe('ContentService Unit Tests', () => {
  it('should validate and parse input via validateContentInput', () => {
    const input = {
      title: 'التخطيط الاستراتيجي',
      topic: 'ريادة الأعمال',
      brief: 'شرح مبسط لكيفية وضع أهداف ربع سنوية.',
      contentType: 'EDUCATIONAL',
    };

    const validated = ContentService.validateContentInput(input);
    expect(validated.title).toBe('التخطيط الاستراتيجي');
    expect(validated.contentType).toBe('EDUCATIONAL');
    expect(validated.status).toBe('DRAFT');
    expect(validated.language).toBe('ar');
  });

  it('should validate platform variant input', () => {
    const variantInput = {
      contentItemId: 'content-abc',
      platform: 'INSTAGRAM',
      caption: 'خطوات عملية لتحقيق أهدافك هذا العام 🎯',
      hashtags: ['#أهداف', '#نجاح'],
    };

    const validated = ContentService.validateVariantInput(variantInput);
    expect(validated.platform).toBe('INSTAGRAM');
    expect(validated.hashtags).toHaveLength(2);
  });

  it('should throw validation error when missing required fields', () => {
    const invalidInput = {
      title: '', // empty title
      topic: 'ريادة الأعمال',
    };

    expect(() => ContentService.validateContentInput(invalidInput)).toThrow();
  });
});
