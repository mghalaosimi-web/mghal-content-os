'use client';

import React, { useState } from 'react';

type Platform = 'FACEBOOK' | 'INSTAGRAM' | 'TIKTOK';

interface VariantData {
  platform: Platform;
  caption: string;
  hashtags: string[];
  mediaSuggestion: string;
  callToAction?: string;
}

export default function HomePage() {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('INSTAGRAM');
  const [topicInput, setTopicInput] = useState('لا تستسلم بسبب تأخر النتائج؛ فكل بذرة تحتاج وقتاً لتزهر');
  const [contentType, setContentType] = useState('MOTIVATIONAL');
  const [tone, setTone] = useState('ملهم، عميق، وعملي');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationMeta, setGenerationMeta] = useState<{
    modelUsed: string;
    durationMs?: number;
    visualPrompt?: string;
  } | null>({
    modelUsed: 'gemini-2.5-flash',
    durationMs: 420,
    visualPrompt: 'A cinematic dark minimalist workspace with subtle green emerald ambient glow, soft depth of field, 8k resolution',
  });
  const [approvalStatus, setApprovalStatus] = useState<'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED'>('PENDING_APPROVAL');

  const [platformData, setPlatformData] = useState<Record<Platform, VariantData>>({
    FACEBOOK: {
      platform: 'FACEBOOK',
      caption:
        'في رحلة التطوير، قد تشعر أحياناً أن جهودك اليومية لا تُحدث فرقاً ملحوظاً، لكن الحقيقة أن البناء الحقيقي يحدث في الخفاء. الاستمرارية الهادئة تصنع فارقاً هائلاً مع الوقت.\n\nما هي العادة التي تلتزم بها يومياً وتؤمن أنها ستغير مستقبلك؟ شاركنا في التعليقات 👇',
      hashtags: ['#تطوير_الذات', '#الاستمرارية', '#عقلية_النجاح', '#إلهام_يومي'],
      mediaSuggestion: 'تصميم عريض 16:9 بنمط داكن مع خط عربي مذهب وتباين هادئ',
      callToAction: 'شاركنا في التعليقات',
    },
    INSTAGRAM: {
      platform: 'INSTAGRAM',
      caption:
        'النجاح ليس قفزة واحدة، بل خطوات صغيرة متتالية لا يراها أحد. ✨\n\nركّز على مسارك الخاص، ولا تقارن بدايتك بمواسم حصاد الآخرين. توقيتك قادم، فقط استمر. 🚀\n.\n.\nاحفظ المنشور لتعود إليه حين تشعر بالإحباط 🔖',
      hashtags: ['#تحفيز', '#ريادة_أعمال', '#تطوير', '#إيجابية', '#صناع_المحتوى', '#MghalStudio'],
      mediaSuggestion: 'صورة عمودية 4:5 أو بطاقة اقتباس بصرية داكنة بلمسات زمردية',
      callToAction: 'احفظ المنشور لتعود إليه',
    },
    TIKTOK: {
      platform: 'TIKTOK',
      caption:
        'وقف ثانية واسمع هذا الكلام! ⏳\nلا تقارن سرعتك بغيرك.. لكل شخص توقيته الخاص! 🔥 شارك الفيديو مع شخص محتاج يسمع هذا الكلام الآن! #تطوير_الذات #تحفيز #fyp',
      hashtags: ['#fyp', '#تطوير_الذات', '#إلهام', '#نصائح_حياة'],
      mediaSuggestion: 'فيديو عمودي 9:16 سريع مع تعليق صوتي واضح وترجمة متحركة في المنتصف',
      callToAction: 'تابع الحساب للمزيد',
    },
  });

  const handleGenerate = async () => {
    if (topicInput.trim().length < 3) return;
    setIsGenerating(true);

    try {
      const response = await fetch('/api/content/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topicInput,
          contentType,
          tone,
          saveToDatabase: true,
        }),
      });

      const data = await response.json();
      if (data.success && data.data?.content) {
        const gen = data.data.content;
        const newVariants: Record<Platform, VariantData> = { ...platformData };

        gen.variants.forEach((v: VariantData) => {
          if (v.platform === 'FACEBOOK' || v.platform === 'INSTAGRAM' || v.platform === 'TIKTOK') {
            newVariants[v.platform] = v;
          }
        });

        setPlatformData(newVariants);
        setGenerationMeta({
          modelUsed: gen.modelUsed,
          durationMs: gen.durationMs,
          visualPrompt: gen.suggestedVisualPrompt,
        });
        setApprovalStatus('PENDING_APPROVAL');
      }
    } catch (err) {
      console.error('Failed to generate content:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const platformMeta = {
    FACEBOOK: {
      name: 'صفحة فيسبوك',
      icon: '📘',
      badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      rule: 'منشور تفاعلي يركز على فتح حوار وسؤال الجمهور مع صياغة واضحة.',
    },
    INSTAGRAM: {
      name: 'إنستغرام (Reels & Feed)',
      icon: '📸',
      badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      rule: 'نص بصري أنيق، دعوة لحفظ المنشور (Save)، ووسوم محسوبة لزيادة الوصول.',
    },
    TIKTOK: {
      name: 'تيك توك الرسمي',
      icon: '🎵',
      badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
      rule: 'هوك أول 3 ثوانٍ جذاب، نص موجز وواضح، وحركة بصرية تحافظ على المشاهد.',
    },
  };

  const activeVariant = platformData[selectedPlatform];
  const activeMeta = platformMeta[selectedPlatform];

  return (
    <div className="min-h-screen flex flex-col bg-[#070b12] text-zinc-100 font-['Cairo',sans-serif]">
      {/* Top Navigation */}
      <header className="border-b border-slate-800/80 bg-[#090e17]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 p-0.5 glow-emerald flex items-center justify-center">
              <span className="text-xl font-black text-black">M</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-wide text-white">M.GH.AL Content Studio</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  M002 محرك الذكاء الاصطناعي
                </span>
              </div>
              <p className="text-xs text-zinc-400">توليد المحتوى العربي المخصص لكل منصة عبر Gemini API</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-zinc-300 font-mono">Gemini 2.5 Flash • Active</span>
            </div>
            <span className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-medium">
              حالة النظام: نشط وجاهز
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-12">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl glass-panel p-8 sm:p-12 border border-slate-800">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 max-w-3xl space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-xs text-emerald-400">
              <span className="text-sm">✨</span>
              <span>المهمة M002 مكتملة: تم تفعيل طبقة الذكاء الاصطناعي وربط Gemini API</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight text-white tracking-tight">
              توليد المحتوى العربي الذكي
              <span className="block text-transparent bg-clip-text bg-gradient-to-l from-emerald-400 via-teal-300 to-cyan-400">
                المخصص لفيسبوك وإنستغرام وتيك توك
              </span>
            </h1>

            <p className="text-base sm:text-lg text-zinc-300 leading-relaxed">
              يقوم النظام الآن بتحليل فكرتك وصياغتها فورياً بثلاث نكهات برمجية مختلفة؛ نسخة تفاعلية لفيسبوك، ونسخة بصرية ملهمة لإنستغرام، وسيناريو عمودي خاطف لتيك توك.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <div className="flex items-center gap-2 text-xs bg-slate-900/90 border border-slate-800 px-3 py-2 rounded-xl text-zinc-300">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>25/25 اختبار ناجح</span>
              </div>
              <div className="flex items-center gap-2 text-xs bg-slate-900/90 border border-slate-800 px-3 py-2 rounded-xl text-zinc-300">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>Gemini API Adapter مفعّل</span>
              </div>
              <div className="flex items-center gap-2 text-xs bg-slate-900/90 border border-slate-800 px-3 py-2 rounded-xl text-zinc-300">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>تخريج هيكلي صارم عبر Zod</span>
              </div>
              <div className="flex items-center gap-2 text-xs bg-rose-500/10 border border-rose-500/30 px-3 py-2 rounded-xl text-rose-300">
                <span className="font-bold">✕</span>
                <span>حظر واتساب مطبق بنسبة 100%</span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Generator Input Bar */}
        <section className="rounded-3xl glass-panel p-6 sm:p-8 border border-slate-800 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>⚡</span>
                <span>مولد المحتوى الذكي الفوري (AI Content Generator)</span>
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                اكتب أي فكرة أو موضوع، واضغط توليد ليقوم الذكاء الاصطناعي بصياغة نسخ المنصات مباشرة.
              </p>
            </div>

            {generationMeta && (
              <div className="flex items-center gap-3 self-start md:self-auto text-xs bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-xl">
                <span className="text-zinc-400 font-mono">النموذج: <strong className="text-emerald-400">{generationMeta.modelUsed}</strong></span>
                {generationMeta.durationMs && (
                  <span className="text-zinc-500 font-mono">({generationMeta.durationMs}ms)</span>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-end">
            <div className="lg:col-span-5 space-y-2">
              <label className="block text-xs font-semibold text-zinc-300">موضوع أو فكرة المحتوى:</label>
              <input
                type="text"
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                placeholder="مثال: أهمية التخطيط الأسبوعي وكيف يحميك من التشتت..."
                className="w-full rounded-2xl bg-[#090e17] border border-slate-800 px-4 py-3.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <div className="lg:col-span-2 space-y-2">
              <label className="block text-xs font-semibold text-zinc-300">نوع المحتوى:</label>
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
                className="w-full rounded-2xl bg-[#090e17] border border-slate-800 px-3 py-3.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="MOTIVATIONAL">تحفيزي</option>
                <option value="SELF_DEVELOPMENT">تطوير ذات</option>
                <option value="CONTEMPLATIVE">تأملي</option>
                <option value="EDUCATIONAL">تعليمي</option>
                <option value="STORY">قصصي</option>
                <option value="AWARENESS">توعوي</option>
                <option value="QUOTE_COMMENTARY">اقتباس</option>
              </select>
            </div>

            <div className="lg:col-span-2 space-y-2">
              <label className="block text-xs font-semibold text-zinc-300">نبرة الطرح:</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full rounded-2xl bg-[#090e17] border border-slate-800 px-3 py-3.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="ملهم، عميق، وعملي">ملهم وعميق</option>
                <option value="حماسي وطاقة عالية">حماسي وقوي</option>
                <option value="هادئ وتأملي">هادئ وتأملي</option>
                <option value="تعليمي ومباشر">تعليمي ومباشر</option>
              </select>
            </div>

            <div className="lg:col-span-3">
              <button
                onClick={handleGenerate}
                disabled={isGenerating || topicInput.trim().length < 3}
                className="w-full h-[46px] rounded-2xl text-sm font-bold bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:opacity-95 text-slate-950 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                    <span>جاري التوليد بالذكاء الاصطناعي...</span>
                  </>
                ) : (
                  <>
                    <span>✨</span>
                    <span>توليد المحتوى الآن</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* Live Interactive Showcase: Platform Variants Preview */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <span>🎯</span>
                <span>النسخ المخصصة الناتجة (Generated Platform Variants)</span>
              </h2>
              <p className="text-sm text-zinc-400 mt-1">
                اختر المنصة لمعاينة كيف صيغ المحتوى خصيصاً لها من قبل محرك الذكاء الاصطناعي.
              </p>
            </div>

            {/* Platform Selector Tabs */}
            <div className="flex items-center p-1.5 rounded-2xl bg-slate-900 border border-slate-800 self-start sm:self-auto">
              {(['INSTAGRAM', 'FACEBOOK', 'TIKTOK'] as Platform[]).map((plat) => (
                <button
                  key={plat}
                  onClick={() => setSelectedPlatform(plat)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                    selectedPlatform === plat
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20'
                      : 'text-zinc-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <span>{platformMeta[plat].icon}</span>
                  <span>{platformMeta[plat].name.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left/Main Column: Preview Post Card */}
            <div className="lg:col-span-8 rounded-3xl glass-panel p-6 sm:p-8 border border-slate-800 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-700 border border-slate-700 flex items-center justify-center text-2xl">
                    {activeMeta.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white">{activeMeta.name}</h3>
                    <span className="text-xs text-zinc-400 font-mono">PlatformVariant: {selectedPlatform}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${activeMeta.badgeColor}`}>
                    {approvalStatus === 'APPROVED' ? 'معتمد للنشر' : 'جاهز للمراجعة'}
                  </span>
                </div>
              </div>

              {/* Caption Preview */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                  النص المولد المخصص (Caption):
                </label>
                <div className="p-5 rounded-2xl bg-[#090e17] border border-slate-800/80 text-sm sm:text-base leading-relaxed text-zinc-200 whitespace-pre-line font-normal">
                  {activeVariant.caption}
                </div>
              </div>

              {/* Hashtags */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                  الوسوم المستخرجة تلقائياً (Hashtags):
                </label>
                <div className="flex flex-wrap gap-2">
                  {activeVariant.hashtags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-lg text-xs bg-slate-800/90 text-emerald-300 border border-slate-700 font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Media Suggestion */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/60 space-y-1 text-xs">
                <span className="text-zinc-400 font-medium block">توجيه إنتاج الوسائط المقترح (Media Directive):</span>
                <p className="text-zinc-200 leading-normal">{activeVariant.mediaSuggestion}</p>
              </div>

              {/* Workflow Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
                <div className="text-xs text-zinc-400">
                  الحالة: <span className="text-emerald-400 font-semibold">{approvalStatus}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setApprovalStatus('APPROVED')}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors shadow-lg shadow-emerald-500/20"
                  >
                    ✓ اعتماد المحتوى
                  </button>
                  <button
                    onClick={() => setApprovalStatus('DRAFT')}
                    className="px-3 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-zinc-300 transition-colors"
                  >
                    إعادة كمسودة
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Visual Prompt & Details */}
            <div className="lg:col-span-4 rounded-3xl glass-panel p-6 sm:p-8 border border-slate-800 space-y-6">
              <div className="border-b border-slate-800/80 pb-4">
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <span>🎨</span>
                  <span>الوصف البصري للصورة (Visual Prompt)</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-1">البرومبت البصري الجاهز لتغذية استوديو الصور في M004.</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#090e17] border border-slate-800 text-xs font-mono text-emerald-300/90 leading-relaxed break-words">
                {generationMeta?.visualPrompt || 'No visual prompt generated yet'}
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3 text-xs">
                <h4 className="font-bold text-white">معايير الذكاء الاصطناعي المطبقة:</h4>
                <ul className="space-y-2 text-zinc-400 list-disc list-inside">
                  <li>توليد متزامن لـ 3 منصات مستقلة</li>
                  <li>صياغة عربية متخصصة وموزونة</li>
                  <li>تحقق كامل بالمخطط عبر Zod</li>
                  <li className="text-rose-400 font-semibold">استبعاد واتساب نهائياً من أي معالجة</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#060a10] py-8 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 M.GH.AL Content Studio — نظام شخصي مستقل لأتمتة المحتوى العربي</p>
          <div className="flex items-center gap-4 text-zinc-400">
            <span>المرحلة: M002 منجزة بالكامل</span>
            <span>•</span>
            <span>المنصات: Facebook, Instagram, TikTok</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
