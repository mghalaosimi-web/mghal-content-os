'use client';

import React, { useState } from 'react';

interface OnboardingGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type GuideTab = 'OVERVIEW' | 'META_SETUP' | 'TIKTOK_SETUP' | 'GEMINI_SETUP' | 'PUBLISHING_WORKFLOW';

export function OnboardingGuideModal({ isOpen, onClose }: OnboardingGuideModalProps) {
  const [activeTab, setActiveTab] = useState<GuideTab>('OVERVIEW');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-4xl max-h-[90vh] bg-[#090e17] border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-zinc-100 font-['Cairo',sans-serif]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-[#070b12]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 p-0.5 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <span className="text-xl">📚</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>دليل البدء والربط السريع للمستخدمين</span>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  User Quickstart Guide
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                خطوات واضحة وروابط مباشرة للهدف لتشغيل النظام وربط حساباتك وتنفيذ النشر الحقيقي فوراً.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-zinc-400 hover:text-white flex items-center justify-center transition-all text-sm"
          >
            ✕
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="px-6 py-2.5 border-b border-slate-800/80 bg-slate-900/60 overflow-x-auto flex items-center gap-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'OVERVIEW'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span>🔄</span>
            <span>1. كيف يعمل النظام؟</span>
          </button>

          <button
            onClick={() => setActiveTab('META_SETUP')}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'META_SETUP'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span>📘</span>
            <span>2. ربط فيسبوك وإنستغرام (Meta)</span>
          </button>

          <button
            onClick={() => setActiveTab('TIKTOK_SETUP')}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'TIKTOK_SETUP'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span>🎵</span>
            <span>3. ربط تيك توك</span>
          </button>

          <button
            onClick={() => setActiveTab('GEMINI_SETUP')}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'GEMINI_SETUP'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span>⚡</span>
            <span>4. مفتاح الذكاء الاصطناعي (Gemini)</span>
          </button>

          <button
            onClick={() => setActiveTab('PUBLISHING_WORKFLOW')}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'PUBLISHING_WORKFLOW'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span>🚀</span>
            <span>5. تنفيذ النشر الفعلي</span>
          </button>
        </div>

        {/* Modal Scrollable Content Area */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs text-zinc-300 leading-relaxed">
          {/* TAB 1: SYSTEM OVERVIEW & ARCHITECTURE FLOW */}
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent border border-emerald-500/30 space-y-2">
                <h3 className="font-bold text-sm text-emerald-300 flex items-center gap-2">
                  <span>💡</span>
                  <span>ما هو نظام M.GH.AL Content Studio؟</span>
                </h3>
                <p className="text-zinc-300">
                  هو منصة مؤتمتة ذكية مصممة لصناع المحتوى وأصحاب الأعمال لنشر محتوى عربي رصين وصور مصممة برمجياً بدقة فائقة على منصات <strong>فيسبوك، إنستغرام، وتيك توك</strong>، إما عبر محادثة ذكية مع وكيل Gemini أو بضغطة زر واحدة.
                </p>
              </div>

              {/* Visual Flowchart */}
              <div className="space-y-3">
                <h4 className="font-bold text-white text-xs">مخطط دورة العمل الآلية (4 خطوات):</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-center">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 mx-auto flex items-center justify-center text-emerald-400 text-lg">
                      🧠
                    </div>
                    <strong className="block text-white font-bold text-xs">1. التوليد بالذكاء الاصطناعي</strong>
                    <p className="text-[11px] text-zinc-400">
                      يكتب Gemini 2.5 نصوص المنشور والوسوم المخصصة لكل منصة بأسلوب عربي بليغ.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-center">
                    <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 mx-auto flex items-center justify-center text-teal-400 text-lg">
                      🎨
                    </div>
                    <strong className="block text-white font-bold text-xs">2. استوديو الصور العربية</strong>
                    <p className="text-[11px] text-zinc-400">
                      محرك فيزيائي (SVG+Sharp) يرسم الصورة بالخطوط والأبعاد المناسبة ويحفظها كملف PNG.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-center">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 mx-auto flex items-center justify-center text-cyan-400 text-lg">
                      ⏰
                    </div>
                    <strong className="block text-white font-bold text-xs">3. الجدولة والاعتماد</strong>
                    <p className="text-[11px] text-zinc-400">
                      تخزين المسودات بقفل SHA-256 لمنع تكرار النشر، مع إمكانية المراجعة البشرية.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-center">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 mx-auto flex items-center justify-center text-blue-400 text-lg">
                      🚀
                    </div>
                    <strong className="block text-white font-bold text-xs">4. النشر الحقيقي المباشر</strong>
                    <p className="text-[11px] text-zinc-400">
                      إرسال المنشور والصورة لخوادم Meta و TikTok وحفظ رابط المنشور الحي بسجل التدقيق.
                    </p>
                  </div>
                </div>
              </div>

              {/* Supported Platforms Notice */}
              <div className="p-3.5 rounded-2xl bg-[#03060a] border border-slate-800 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-xl">🎯</span>
                  <div>
                    <strong className="text-white">المنصات المعتمدة حصرياً في النظام:</strong>
                    <div className="text-zinc-400 text-[11px] mt-0.5">
                      فيسبوك (صفحات عامة) • إنستغرام (حسابات أعمال/مبدعين) • تيك توك.
                    </div>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  WhatsApp محظور نهائياً
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: META GRAPH API (FACEBOOK & INSTAGRAM) */}
          {activeTab === 'META_SETUP' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-blue-600/10 border border-blue-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-sm text-blue-300 flex items-center gap-2">
                    <span>📘</span>
                    <span>كيف تربط فيسبوك وإنستغرام في دقيقة واحدة؟</span>
                  </h3>
                  <p className="text-zinc-300 text-xs mt-1">
                    توفر شركة Meta أداة رسمية وسريعة اسمها <strong>Graph API Explorer</strong> تتيح توليد رمز الوصول دون الحاجة لبرمجة مسبقة.
                  </p>
                </div>

                <a
                  href="https://developers.facebook.com/tools/explorer/"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 flex items-center gap-1.5 whitespace-nowrap self-start sm:self-auto"
                >
                  <span>افتح Meta Explorer مباشرة ↗</span>
                </a>
              </div>

              {/* Step-by-step Meta Guide */}
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                      1
                    </span>
                    <strong className="text-white text-xs">الدخول وتحديد صفحتك:</strong>
                  </div>
                  <p className="text-zinc-400 text-xs pr-8">
                    ادخل إلى رابط <a href="https://developers.facebook.com/tools/explorer/" target="_blank" rel="noreferrer" className="text-blue-400 underline">Meta Graph API Explorer</a>. في أعلى اليمين تحت خانة <strong>User or Page</strong>، اضغط واختر صفحتك (Page) بدلاً من حسابك الشخصي.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                      2
                    </span>
                    <strong className="text-white text-xs">إضافة الصلاحيات الثلاث الأساسية:</strong>
                  </div>
                  <p className="text-zinc-400 text-xs pr-8">
                    في قائمة <strong>Permissions</strong>، أضف الصلاحيات التالية (اضغط زر النسخ لإضافتها مباشرة):
                  </p>
                  <div className="pr-8 flex flex-wrap gap-2">
                    {[
                      'pages_manage_posts',
                      'pages_read_engagement',
                      'instagram_content_publish',
                      'instagram_basic',
                    ].map((perm) => (
                      <button
                        key={perm}
                        onClick={() => handleCopy(perm, perm)}
                        className="px-3 py-1.5 rounded-xl bg-[#03060a] hover:bg-slate-800 border border-slate-700 font-mono text-[11px] text-emerald-400 flex items-center gap-1.5"
                        title="انقر للنسخ"
                      >
                        <span>{perm}</span>
                        <span className="text-[10px] text-zinc-500">
                          {copiedText === perm ? '✓ تم النسخ' : '📋'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                      3
                    </span>
                    <strong className="text-white text-xs">توليد الرمز ونسخه:</strong>
                  </div>
                  <p className="text-zinc-400 text-xs pr-8">
                    اضغط على زر <strong>Generate Access Token</strong>، ووافق على الصلاحيات المطلوبة. سيظهر لك رمز طويل يبدأ عادةً بـ <code className="text-emerald-300 font-mono">EAAB...</code>. انسخ هذا الرمز كاملاً.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                      4
                    </span>
                    <strong className="text-white text-xs">الربط في النظام:</strong>
                  </div>
                  <p className="text-zinc-400 text-xs pr-8">
                    توجه إلى تبويب <strong>«ربط الحسابات»</strong> في هذا النظام، والصق الرمز في خانة فيسبوك أو إنستغرام واضغط <strong>«فحص الاتصال والربط»</strong>. ستتصل الخوادم وتظهر الشارة باللون الأخضر فوراً!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TIKTOK API */}
          {activeTab === 'TIKTOK_SETUP' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-cyan-600/10 border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-sm text-cyan-300 flex items-center gap-2">
                    <span>🎵</span>
                    <span>ربط تيك توك عبر Content Posting API</span>
                  </h3>
                  <p className="text-zinc-300 text-xs mt-1">
                    يتطلب تيك توك إنشاء حساب مطور وتوليد تصريح نشر (OAuth Token).
                  </p>
                </div>

                <a
                  href="https://developers.tiktok.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs shadow-md shadow-cyan-600/20 flex items-center gap-1.5 whitespace-nowrap self-start sm:self-auto"
                >
                  <span>افتح TikTok Developers ↗</span>
                </a>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <strong className="text-white text-xs block">1. تسجيل الدخول وإنشاء تطبيق:</strong>
                  <p className="text-zinc-400 text-xs">
                    ادخل إلى <a href="https://developers.tiktok.com/" target="_blank" rel="noreferrer" className="text-cyan-400 underline">TikTok Developer Portal</a> وسجّل الدخول بحسابك <strong>@m.gh.al.2006</strong>.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <strong className="text-white text-xs block">2. اختيار صلاحيات النشر:</strong>
                  <p className="text-zinc-400 text-xs">
                    فعّل صلاحية النشر الآلي المباشر:
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCopy('video.publish', 'video.publish')}
                      className="px-3 py-1.5 rounded-xl bg-[#03060a] border border-slate-700 font-mono text-[11px] text-cyan-300 flex items-center gap-1.5"
                    >
                      <span>video.publish</span>
                      <span className="text-[10px] text-zinc-500">
                        {copiedText === 'video.publish' ? '✓ تم النسخ' : '📋'}
                      </span>
                    </button>
                    <button
                      onClick={() => handleCopy('video.upload', 'video.upload')}
                      className="px-3 py-1.5 rounded-xl bg-[#03060a] border border-slate-700 font-mono text-[11px] text-cyan-300 flex items-center gap-1.5"
                    >
                      <span>video.upload</span>
                      <span className="text-[10px] text-zinc-500">
                        {copiedText === 'video.upload' ? '✓ تم النسخ' : '📋'}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <strong className="text-white text-xs block">3. لصق الرمز:</strong>
                  <p className="text-zinc-400 text-xs">
                    انسخ الرمز والصقه في خانة رمز وصول تيك توك في تبويب «ربط الحسابات».
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: GEMINI API SETUP */}
          {activeTab === 'GEMINI_SETUP' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-emerald-600/10 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-sm text-emerald-300 flex items-center gap-2">
                    <span>⚡</span>
                    <span>كيف تحصل على مفتاح Gemini API مجاناً في 30 ثانية؟</span>
                  </h3>
                  <p className="text-zinc-300 text-xs mt-1">
                    توفر Google مفاتيح Gemini API مجانية تماماً للمطورين بدون الحاجة لإدخال أي بطاقة بنكية.
                  </p>
                </div>

                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center gap-1.5 whitespace-nowrap self-start sm:self-auto"
                >
                  <span>احصل على المفتاح مجاناً ↗</span>
                </a>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <strong className="text-white text-xs block">1. الدخول إلى Google AI Studio:</strong>
                  <p className="text-zinc-400 text-xs">
                    افتح <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-emerald-400 underline">aistudio.google.com/app/apikey</a> بحسابك في Google.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <strong className="text-white text-xs block">2. إنشاء المفتاح:</strong>
                  <p className="text-zinc-400 text-xs">
                    اضغط على زر <strong>Create API Key</strong>، ثم انسخ المفتاح الذي يبدأ بـ <code className="text-emerald-300 font-mono">AIza...</code>.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <strong className="text-white text-xs block">3. التفعيل في المشروع:</strong>
                  <p className="text-zinc-400 text-xs">
                    افتح ملف <code className="text-white font-mono bg-black/40 px-1.5 py-0.5 rounded">.env</code> في مجلد المشروع وضعه كما يلي:
                  </p>
                  <div className="p-3 rounded-xl bg-[#03060a] border border-slate-800 font-mono text-[11px] text-emerald-400 flex items-center justify-between">
                    <span>GEMINI_API_KEY=&quot;مفتاحك_هنا&quot;</span>
                    <button
                      onClick={() => handleCopy('GEMINI_API_KEY=""', 'env_var')}
                      className="text-zinc-500 hover:text-white"
                    >
                      {copiedText === 'env_var' ? '✓ تم النسخ' : '📋 نسخ'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: STEP-BY-STEP PUBLISHING WORKFLOW */}
          {activeTab === 'PUBLISHING_WORKFLOW' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <span>🚀</span>
                  <span>طريقة توليد ونشر أول منشور حقيقي:</span>
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-xs text-zinc-300">
                  <li>
                    <strong>غرفة القيادة:</strong> تحدث مع وكيل Gemini في تبويب «⚡ غرفة القيادة»، وقل له مثلاً: <em>&quot;ولّد منشوراً تحفيزياً عن الاستمرارية مع الصورة وجدوله للنشر&quot;</em>.
                  </li>
                  <li>
                    <strong>استوديو الصور:</strong> يمكنك الدخول لتبويب «🎨 استوديو الصور» وتعديل القياس (1:1 أو 4:5 أو 9:16) أو تغيير الثيم البصري والضغط على «توليد وحفظ الصورة».
                  </li>
                  <li>
                    <strong>المسودات:</strong> انتقل لتبويب «📑 المسودات والمنشورات»، ستجد بطاقة المنشور بصورته الحقيقية والصياغة المخصصة لكل منصة.
                  </li>
                  <li>
                    <strong>النشر الحي:</strong> اختر المنصة (Facebook أو Instagram أو TikTok) واضغط زر <strong>«نشر حقيقي 🚀»</strong>.
                  </li>
                  <li>
                    <strong>المشاهدة الحية:</strong> فور اكتمال النشر، سيظهر لك تنبيه أخضر يحتوي على زر <strong>«عرض المنشور ↗»</strong> يفتح لك البوست المنشور مباشرة على صفحتك الرسمية!
                  </li>
                </ol>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
                ✨ <strong>ملاحظة للمستخدم:</strong> كافة البيانات تسجل في ملف <code className="text-white font-mono">data/local-store.json</code> تلقائياً وتظل محفوظة حتى بعد إغلاق المتصفح أو إعادة تشغيل الجهاز.
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-[#070b12] flex items-center justify-between">
          <span className="text-[11px] text-zinc-500">
            M.GH.AL Content Studio • دليل المطور والمستخدم السريع
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-md shadow-emerald-500/20"
          >
            فهمت ذلك، إغلاق الدليل ✓
          </button>
        </div>
      </div>
    </div>
  );
}
