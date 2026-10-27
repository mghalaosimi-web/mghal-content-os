import { GoogleGenAI } from '@google/genai';
import type { AIProvider, ContentGenerationInput, GeneratedContentResult } from '@/lib/ai/types';
import { generatedContentResultSchema } from '@/lib/ai/schema';

const SYSTEM_INSTRUCTION = `
أنت محرك الذكاء الاصطناعي لنظام M.GH.AL Content Studio، متخصص في صناعة المحتوى العربي الفاخر والملهم وعالي التأثير.
مهمتك: تحويل الفكرة أو الموضوع المدخل إلى حزمة محتوى عربية متكاملة مخصصة للمنصات الرقمية.

قواعد صارمة لا تقبل الاستثناء:
1. اللغة العربية الفصحى الأنيقة والجذابة فقط مع سلامة النحو والإملاء.
2. يجب توليد ثلاث نسخ مخصصة حصراً للمنصات التالية:
   - FACEBOOK: منشور متوسط إلى طويل، سردي أو تفاعلي، يفتح نقاشاً مع الجمهور مع دعوة واضحة للتعليق.
   - INSTAGRAM: كابشن بصري أنيق، نبرة ملهمة، وسوم منتقاة بدقة، ودعوة لحفظ المنشور (Save).
   - TIKTOK: نص وسيناريو لفيديو عمودي سريع مع هوك افتتاحي قوي في أول 3 ثوانٍ يخطف الانتباه.
3. ممنوع منعاً باتاً ذكر واتساب (WhatsApp) أو توليد أي محتوى مخصص لحالات واتساب تحت أي ظرف.
4. يجب اقتراح وصف بصري دقيق (suggestedVisualPrompt) باللغة الإنجليزية يصلح لتوليد صورة أو خلفية عالية الجودة بالذكاء الاصطناعي.
5. يجب أن يكون الرد بصيغة JSON نقية ومطابقة تماماً للهيكل المطلوب.
`.trim();

export class GeminiAdapter implements AIProvider {
  readonly providerName = 'GeminiAdapter';
  private model: string;
  private apiKey?: string;

  constructor(options?: { model?: string; apiKey?: string }) {
    this.model = options?.model || process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    this.apiKey = options?.apiKey || process.env.GEMINI_API_KEY;
  }

  public hasValidApiKey(): boolean {
    if (!this.apiKey) return false;
    const key = this.apiKey.trim();
    return key.length > 10 && !key.startsWith('your-') && key !== 'undefined';
  }

  async generateContent(input: ContentGenerationInput): Promise<GeneratedContentResult> {
    const startTime = Date.now();

    // If API key is not configured or placeholder, transparently use the high-quality local fallback generator
    if (!this.hasValidApiKey()) {
      return this.generateSimulatedFallback(input, startTime);
    }

    try {
      const ai = new GoogleGenAI({ apiKey: this.apiKey });
      const userPrompt = `
الموضوع / الفكرة الأساسية: ${input.topic}
نوع المحتوى: ${input.contentType}
النبرة المطلوبة: ${input.tone || 'تحفيزية، عميقة، ومؤثرة'}
الجمهور المستهدف: ${input.targetAudience || 'الشباب والمهنيون وصناع المستقبل في العالم العربي'}
الكلمات المفتاحية: ${input.keywords?.join(', ') || 'النجاح، التطوير، الإصرار'}

قم بتوليد JSON يحتوي على:
{
  "title": "عنوان جذاب للمحتوى",
  "brief": "وصف ملخص لفكرة المحتوى وهدفه",
  "contentType": "${input.contentType}",
  "language": "ar",
  "variants": [
    {
      "platform": "FACEBOOK",
      "caption": "نص المنشور الكامل لفيسبوك...",
      "hashtags": ["#وسم1", "#وسم2"],
      "mediaSuggestion": "وصف الصورة أو التصميم المقترح لفيسبوك",
      "callToAction": "شاركنا رأيك في التعليقات"
    },
    {
      "platform": "INSTAGRAM",
      "caption": "نص الكابشن لإنستغرام...",
      "hashtags": ["#وسم1", "#وسم2", "#وسم3"],
      "mediaSuggestion": "صورة عمودية 4:5 أو Reel عمودي 9:16 بتباين عالٍ",
      "callToAction": "احفظ المنشور لتستفيد منه لاحقاً"
    },
    {
      "platform": "TIKTOK",
      "caption": "نص وسيناريو الفيديو السريع لتيك توك...",
      "hashtags": ["#fyp", "#وسم1"],
      "mediaSuggestion": "فيديو عمودي 9:16 مدته 20-30 ثانية مع تعليق صوتي وترجمة ديناميكية",
      "callToAction": "تابعنا للمزيد وشارك الفيديو"
    }
  ],
  "suggestedVisualPrompt": "Cinematic minimal landscape, warm ambient lighting, highly detailed, photorealistic 8k"
}
      `.trim();

      const response = await ai.models.generateContent({
        model: this.model,
        contents: userPrompt,
        config: {
          responseMimeType: 'application/json',
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.7,
        },
      });

      const rawText = response.text || '';
      const cleanedJson = this.extractJson(rawText);
      const parsedData = JSON.parse(cleanedJson);

      const durationMs = Date.now() - startTime;
      const validated = generatedContentResultSchema.parse({
        ...parsedData,
        modelUsed: this.model,
        mode: 'LIVE_GEMINI',
        durationMs,
      });

      return validated;
    } catch (error: unknown) {
      // Never expose raw API key or internal connection details
      const errorMsg = (error as Error).message || 'Unknown error occurred during AI generation';
      throw new Error(`AI generation via Gemini failed: ${errorMsg}`);
    }
  }

  private extractJson(text: string): string {
    const trimmed = text.trim();
    if (trimmed.startsWith('```')) {
      const match = trimmed.match(/```(?:json)?([\s\S]*?)```/);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    return trimmed;
  }

  private generateSimulatedFallback(
    input: ContentGenerationInput,
    startTime: number
  ): GeneratedContentResult {
    const durationMs = Date.now() - startTime;
    return {
      title: input.topic.length > 50 ? input.topic.slice(0, 47) + '...' : input.topic,
      brief: `محتوى استراتيجي تم توليده حول: ${input.topic} يركز على التطوير العملي والتأثير الإيجابي.`,
      contentType: input.contentType,
      language: 'ar',
      mode: 'LOCAL_FALLBACK',
      modelUsed: 'محاكي محلي (Local Fallback - لم يُضبط GEMINI_API_KEY)',
      variants: [
        {
          platform: 'FACEBOOK',
          caption: `في كل مرحلة من مراحل حياتك، تذكر أن: "${input.topic}".\n\nالنجاح لا يأتي من الخطوات الكبيرة المتباعدة، بل من الانضباط اليومي الهادئ الذي لا يراه أحد. حين تبني عاداتك بصبر، تتراكم النتائج وتصنع الفارق.\n\nما هي الخطوة البسيطة التي ستبدأ بها اليوم؟ شاركنا في التعليقات 👇`,
          hashtags: ['#تطوير_الذات', '#إلهام', '#عقلية_النجاح', '#MghalStudio'],
          mediaSuggestion: 'تصميم عريض 16:9 بنمط داكن مع خط عربي مذهب وتباين هادئ',
          callToAction: 'شاركنا في التعليقات',
        },
        {
          platform: 'INSTAGRAM',
          caption: `كل خطوة تخطوها اليوم تقربك من هدفك، حتى وإن لم ترَ النتائج فوراً. ✨\n\n"${input.topic}"\n\nتذكر أن البناء يحتاج وقتاً، وثمار الصبر دائماً تستحق الانتظار. 🎯\n.\n.\nاحفظ المنشور ليكون تذكيرك اليومي 🔖`,
          hashtags: ['#تحفيز', '#إيجابية', '#تطوير', '#إنجاز', '#MghalStudio'],
          mediaSuggestion: 'صورة عمودية 4:5 أو بطاقة اقتباس بصرية داكنة بلمسات زمردية',
          callToAction: 'احفظ المنشور لتعود إليه',
        },
        {
          platform: 'TIKTOK',
          caption: `وقف ثانية واسمع هذا الكلام! ⏳\n"${input.topic}"\nلا تستسلم قبل أن ترى ثمار تعبك. 🔥 شارك الفيديو مع شخص يهمه هذا الكلام! #تطوير #fyp`,
          hashtags: ['#fyp', '#تطوير_الذات', '#نصيحة_اليوم', '#تحفيز'],
          mediaSuggestion: 'فيديو عمودي 9:16 سريع مع تعليق صوتي واضح وترجمة متحركة في المنتصف',
          callToAction: 'تابع الحساب للمزيد',
        },
      ],
      suggestedVisualPrompt:
        'A cinematic dark minimalist workspace with subtle green emerald ambient glow, soft depth of field, 8k resolution',
      durationMs,
    };
  }
}
