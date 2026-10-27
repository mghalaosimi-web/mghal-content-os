'use client';

import React, { useState, useEffect, useCallback } from 'react';

type Platform = 'FACEBOOK' | 'INSTAGRAM' | 'TIKTOK';
type ContentStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
type ActiveTab = 'STUDIO' | 'DRAFTS' | 'AUDIT_LOGS' | 'SYSTEM_HEALTH';

interface VariantData {
  id?: string;
  platform: Platform;
  caption: string;
  hashtags: string[];
  mediaSuggestion: string;
  callToAction?: string;
  status?: string;
}

interface StoredItem {
  id: string;
  title: string;
  topic: string;
  brief: string | null;
  contentType: string;
  status: ContentStatus;
  language: string;
  createdAt: string;
  updatedAt: string;
  platformVariants: VariantData[];
}

interface AuditLogItem {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  status: string;
  durationMs: number | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('STUDIO');
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

  // Active studio preview variants
  const [studioVariants, setStudioVariants] = useState<Record<Platform, VariantData>>({
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

  // Content library & Drafts management state
  const [contentList, setContentList] = useState<StoredItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingItem, setEditingItem] = useState<StoredItem | null>(null);
  const [editingPlatform, setEditingPlatform] = useState<Platform>('INSTAGRAM');
  const [editCaption, setEditCaption] = useState('');

  // Audit Logs state
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  // Fetch content items from API
  const fetchContent = useCallback(async () => {
    try {
      const url = statusFilter !== 'ALL' ? `/api/content?status=${statusFilter}` : '/api/content';
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setContentList(data.data);
      }
    } catch (e) {
      console.error('Failed to load content:', e);
    }
  }, [statusFilter]);

  // Fetch audit logs
  const fetchAuditLogs = useCallback(async () => {
    setIsLoadingLogs(true);
    try {
      const res = await fetch('/api/audit-logs');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setAuditLogs(data.data);
      }
    } catch (e) {
      console.error('Failed to load audit logs:', e);
    } finally {
      setIsLoadingLogs(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const url = statusFilter !== 'ALL' ? `/api/content?status=${statusFilter}` : '/api/content';
        const res = await fetch(url);
        const data = await res.json();
        if (active && data.success && Array.isArray(data.data)) {
          setContentList(data.data);
        }
      } catch (e) {
        console.error('Failed to load content:', e);
      }
    })();
    return () => {
      active = false;
    };
  }, [statusFilter]);

  useEffect(() => {
    if (activeTab !== 'AUDIT_LOGS') return;
    let active = true;
    void (async () => {
      setIsLoadingLogs(true);
      try {
        const res = await fetch('/api/audit-logs');
        const data = await res.json();
        if (active && data.success && Array.isArray(data.data)) {
          setAuditLogs(data.data);
        }
      } catch (e) {
        console.error('Failed to load audit logs:', e);
      } finally {
        if (active) setIsLoadingLogs(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [activeTab]);

  // Handle live AI generation
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
        const newVariants: Record<Platform, VariantData> = { ...studioVariants };

        gen.variants.forEach((v: VariantData) => {
          if (v.platform === 'FACEBOOK' || v.platform === 'INSTAGRAM' || v.platform === 'TIKTOK') {
            newVariants[v.platform] = v;
          }
        });

        setStudioVariants(newVariants);
        setGenerationMeta({
          modelUsed: gen.modelUsed,
          durationMs: gen.durationMs,
          visualPrompt: gen.suggestedVisualPrompt,
        });

        // Refresh drafts
        await fetchContent();
      }
    } catch (err) {
      console.error('Failed to generate content:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Update item status (Approve / Reject / Draft)
  const handleUpdateStatus = async (id: string, newStatus: ContentStatus) => {
    try {
      const res = await fetch(`/api/content/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchContent();
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  // Delete item
  const handleDeleteItem = async (id: string) => {
    if (!confirm('هل أنت متأكد من رغبتك في حذف هذا المحتوى؟')) return;
    try {
      const res = await fetch(`/api/content/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        await fetchContent();
      }
    } catch (err) {
      console.error('Failed to delete item:', err);
    }
  };

  // Open Edit Modal
  const openEditor = (item: StoredItem) => {
    setEditingItem(item);
    setEditingPlatform('INSTAGRAM');
    const igVariant = item.platformVariants.find((v) => v.platform === 'INSTAGRAM');
    setEditCaption(igVariant?.caption || '');
  };

  // Save Edit Caption
  const handleSaveEdit = async () => {
    if (!editingItem) return;
    try {
      const res = await fetch(`/api/content/${editingItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platformUpdate: {
            platform: editingPlatform,
            caption: editCaption,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEditingItem(null);
        await fetchContent();
      }
    } catch (err) {
      console.error('Failed to save edit:', err);
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

  const activeVariant = studioVariants[selectedPlatform];
  const activeMeta = platformMeta[selectedPlatform];

  const filteredContent = contentList.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return item.title.toLowerCase().includes(q) || (item.topic && item.topic.toLowerCase().includes(q));
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#070b12] text-zinc-100 font-['Cairo',sans-serif]">
      {/* Top Navigation */}
      <header className="border-b border-slate-800/80 bg-[#090e17]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 p-0.5 glow-emerald flex items-center justify-center">
              <span className="text-xl font-black text-black">M</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-wide text-white">M.GH.AL Content Studio</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  لوحة تحكم كاملة M003
                </span>
              </div>
              <p className="text-xs text-zinc-400">إدارة ودورة حياة المحتوى العربي المؤتمت</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center p-1 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('STUDIO')}
              className={`px-4 py-2 rounded-xl transition-all ${
                activeTab === 'STUDIO' ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              ✨ استوديو التوليد
            </button>
            <button
              onClick={() => setActiveTab('DRAFTS')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'DRAFTS' ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>📑 إدارة المسودات والمحتوى</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-emerald-300 border border-slate-700">
                {contentList.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('AUDIT_LOGS')}
              className={`px-4 py-2 rounded-xl transition-all ${
                activeTab === 'AUDIT_LOGS' ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              📊 سجل العمليات (Audit)
            </button>
            <button
              onClick={() => setActiveTab('SYSTEM_HEALTH')}
              className={`px-4 py-2 rounded-xl transition-all ${
                activeTab === 'SYSTEM_HEALTH' ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              🛡️ حالة البنية والأمان
            </button>
          </nav>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>نظام جاهز</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-10">
        {/* Mobile Navigation Bar */}
        <div className="flex md:hidden overflow-x-auto gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('STUDIO')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap ${activeTab === 'STUDIO' ? 'bg-emerald-500 text-black font-bold' : 'text-zinc-400'}`}
          >
            ✨ الاستوديو
          </button>
          <button
            onClick={() => setActiveTab('DRAFTS')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap ${activeTab === 'DRAFTS' ? 'bg-emerald-500 text-black font-bold' : 'text-zinc-400'}`}
          >
            📑 المسودات ({contentList.length})
          </button>
          <button
            onClick={() => setActiveTab('AUDIT_LOGS')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap ${activeTab === 'AUDIT_LOGS' ? 'bg-emerald-500 text-black font-bold' : 'text-zinc-400'}`}
          >
            📊 سجل العمليات
          </button>
          <button
            onClick={() => setActiveTab('SYSTEM_HEALTH')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap ${activeTab === 'SYSTEM_HEALTH' ? 'bg-emerald-500 text-black font-bold' : 'text-zinc-400'}`}
          >
            🛡️ الأمان
          </button>
        </div>

        {/* TAB 1: STUDIO (AI Content Generator & Live Variant Visualizer) */}
        {activeTab === 'STUDIO' && (
          <div className="space-y-10">
            {/* AI Generator Input Bar */}
            <section className="rounded-3xl glass-panel p-6 sm:p-8 border border-slate-800 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <span>⚡</span>
                    <span>مولد المحتوى الذكي الفوري (AI Content Generator)</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                    أدخل فكرتك لتوليد نسخ متزامنة ومخصصة لفيسبوك وإنستغرام وتيك توك مع حفظها كمسودات.
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
                        <span>جاري التوليد...</span>
                      </>
                    ) : (
                      <>
                        <span>✨</span>
                        <span>توليد وحفظ في المسودات</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </section>

            {/* Platform Variants Showcase */}
            <section className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <span>🎯</span>
                    <span>معاينة النسخ المخصصة للمنصات</span>
                  </h2>
                  <p className="text-sm text-zinc-400 mt-1">
                    صياغات مستقلة بالكامل لكل منصة مع مراعاة قواعد الطول والجمهور والوسوم.
                  </p>
                </div>

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

                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${activeMeta.badgeColor}`}>
                      جاهز للمراجعة
                    </span>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                      النص المولد المخصص (Caption):
                    </label>
                    <div className="p-5 rounded-2xl bg-[#090e17] border border-slate-800/80 text-sm sm:text-base leading-relaxed text-zinc-200 whitespace-pre-line font-normal">
                      {activeVariant.caption}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                      الوسوم (Hashtags):
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

                  <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/60 space-y-1 text-xs">
                    <span className="text-zinc-400 font-medium block">توجيه إنتاج الوسائط (Media Directive):</span>
                    <p className="text-zinc-200 leading-normal">{activeVariant.mediaSuggestion}</p>
                  </div>
                </div>

                <div className="lg:col-span-4 rounded-3xl glass-panel p-6 sm:p-8 border border-slate-800 space-y-6">
                  <div className="border-b border-slate-800/80 pb-4">
                    <h3 className="font-bold text-base text-white flex items-center gap-2">
                      <span>🎨</span>
                      <span>الوصف البصري للصورة (Visual Prompt)</span>
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1">برومبت بصري مهيأ لاستوديو الصور في M004.</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#090e17] border border-slate-800 text-xs font-mono text-emerald-300/90 leading-relaxed break-words">
                    {generationMeta?.visualPrompt || 'No visual prompt'}
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3 text-xs">
                    <h4 className="font-bold text-white">إحصاءات سريعة:</h4>
                    <div className="flex justify-between text-zinc-400">
                      <span>إجمالي المحتويات بالمسودات:</span>
                      <strong className="text-white font-mono">{contentList.length}</strong>
                    </div>
                    <div className="flex justify-between text-zinc-400">
                      <span>المعتمد للنشر:</span>
                      <strong className="text-emerald-400 font-mono">
                        {contentList.filter((i) => i.status === 'APPROVED').length}
                      </strong>
                    </div>
                    <div className="flex justify-between text-zinc-400">
                      <span>قيد المراجعة:</span>
                      <strong className="text-amber-400 font-mono">
                        {contentList.filter((i) => i.status === 'PENDING_APPROVAL').length}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* TAB 2: DRAFTS & CONTENT MANAGEMENT (M003 Core) */}
        {activeTab === 'DRAFTS' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <span>📑</span>
                  <span>لوحة إدارة المسودات والمحتوى (Content Management)</span>
                </h2>
                <p className="text-sm text-zinc-400 mt-1">
                  استعراض المحتويات المولدة، تعديل الكابشن والوسوم، وإدارة دورة الاعتماد والرفض.
                </p>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { key: 'ALL', label: 'الكل' },
                  { key: 'PENDING_APPROVAL', label: 'قيد المراجعة' },
                  { key: 'APPROVED', label: 'معتمد' },
                  { key: 'DRAFT', label: 'مسودات' },
                  { key: 'REJECTED', label: 'مرفوض' },
                ].map((s) => (
                  <button
                    key={s.key}
                    onClick={() => setStatusFilter(s.key)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      statusFilter === s.key
                        ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                        : 'bg-slate-900 text-zinc-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Input */}
            <div className="rounded-2xl glass-panel p-4 border border-slate-800 flex items-center gap-3">
              <span className="text-zinc-500 text-sm">🔍</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث بالعنوان أو الموضوع..."
                className="w-full bg-transparent text-sm text-white focus:outline-none placeholder-zinc-500"
              />
            </div>

            {/* Content Items List */}
            {filteredContent.length === 0 ? (
              <div className="rounded-3xl glass-panel p-12 border border-slate-800 text-center space-y-3">
                <span className="text-4xl block">📭</span>
                <h3 className="text-lg font-bold text-white">لا توجد عناصر تطابق الفلتر المحدد</h3>
                <p className="text-xs text-zinc-400">
                  يمكنك توليد محتوى جديد من علامة التبويب «استوديو التوليد».
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredContent.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl glass-panel p-6 border border-slate-800 hover:border-slate-700 transition-all space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-base text-white">{item.title}</h3>
                          <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-zinc-300 border border-slate-700">
                            {item.contentType}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400">الموضوع: {item.topic}</p>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold border ${
                            item.status === 'APPROVED'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : item.status === 'PENDING_APPROVAL'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                              : item.status === 'REJECTED'
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                              : 'bg-slate-800 text-zinc-400 border-slate-700'
                          }`}
                        >
                          {item.status === 'APPROVED'
                            ? 'معتمد للنشر'
                            : item.status === 'PENDING_APPROVAL'
                            ? 'قيد المراجعة'
                            : item.status === 'REJECTED'
                            ? 'مرفوض'
                            : 'مسودة'}
                        </span>
                      </div>
                    </div>

                    {/* Brief preview */}
                    {item.brief && (
                      <p className="text-xs text-zinc-300 leading-relaxed bg-[#090e17] p-3 rounded-xl border border-slate-800/80">
                        {item.brief}
                      </p>
                    )}

                    {/* Platform Variant Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {item.platformVariants.map((v) => (
                        <div
                          key={v.platform}
                          className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2 text-xs"
                        >
                          <div className="flex items-center justify-between text-zinc-400 font-semibold border-b border-slate-800/60 pb-1.5">
                            <span className="flex items-center gap-1.5">
                              <span>{platformMeta[v.platform].icon}</span>
                              <span className="text-white">{platformMeta[v.platform].name.split(' ')[0]}</span>
                            </span>
                            <span className="text-[10px] text-zinc-500">{v.status || 'READY'}</span>
                          </div>
                          <p className="text-zinc-300 line-clamp-3 leading-relaxed">{v.caption}</p>
                          <div className="flex flex-wrap gap-1 pt-1">
                            {v.hashtags.slice(0, 3).map((t) => (
                              <span key={t} className="text-[10px] text-emerald-400">
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Actions Row */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80 text-xs">
                      <span className="text-zinc-500 font-mono text-[11px]">
                        ID: {item.id} • {new Date(item.createdAt).toLocaleDateString('ar-EG')}
                      </span>

                      <div className="flex items-center gap-2">
                        {item.status !== 'APPROVED' && (
                          <button
                            onClick={() => handleUpdateStatus(item.id, 'APPROVED')}
                            className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all shadow-sm"
                          >
                            ✓ اعتماد
                          </button>
                        )}
                        {item.status !== 'REJECTED' && (
                          <button
                            onClick={() => handleUpdateStatus(item.id, 'REJECTED')}
                            className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-medium transition-all"
                          >
                            ✕ رفض
                          </button>
                        )}
                        <button
                          onClick={() => openEditor(item)}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-zinc-200 border border-slate-700 font-medium transition-all"
                        >
                          ✏️ تعديل
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-rose-950/40 text-zinc-500 hover:text-rose-400 border border-slate-800 transition-all"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Edit Modal */}
            {editingItem && (
              <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-[#0b101b] border border-slate-700 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white">تعديل محتوى المنصة</h3>
                      <p className="text-xs text-zinc-400">{editingItem.title}</p>
                    </div>
                    <button
                      onClick={() => setEditingItem(null)}
                      className="text-zinc-400 hover:text-white text-lg font-bold"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Platform Tabs in Modal */}
                  <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-900 border border-slate-800">
                    {(['INSTAGRAM', 'FACEBOOK', 'TIKTOK'] as Platform[]).map((plat) => (
                      <button
                        key={plat}
                        onClick={() => {
                          setEditingPlatform(plat);
                          const variant = editingItem.platformVariants.find((v) => v.platform === plat);
                          setEditCaption(variant?.caption || '');
                        }}
                        className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                          editingPlatform === plat
                            ? 'bg-emerald-500 text-black font-bold'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        {platformMeta[plat].icon} {platformMeta[plat].name.split(' ')[0]}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-zinc-300">
                      نص المنشور المخصص لـ ({platformMeta[editingPlatform].name}):
                    </label>
                    <textarea
                      rows={6}
                      value={editCaption}
                      onChange={(e) => setEditCaption(e.target.value)}
                      className="w-full rounded-2xl bg-[#070b12] border border-slate-800 p-4 text-sm text-white focus:outline-none focus:border-emerald-500 leading-relaxed font-normal"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                    <button
                      onClick={() => setEditingItem(null)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white"
                    >
                      إلغاء
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20"
                    >
                      حفظ التعديلات
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: AUDIT LOGS (Real-time Operations & Diagnostics) */}
        {activeTab === 'AUDIT_LOGS' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <span>📊</span>
                  <span>سجل العمليات والتدقيق (Audit Logs)</span>
                </h2>
                <p className="text-sm text-zinc-400 mt-1">
                  تسجيل حقيقي وفوري لكل حدث، مع المدة الزمنية بالأجزاء من الثانية والبيانات الوصفية.
                </p>
              </div>

              <button
                onClick={fetchAuditLogs}
                disabled={isLoadingLogs}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-zinc-300 border border-slate-800 flex items-center gap-2 self-start sm:self-auto"
              >
                <span>🔄</span>
                <span>تحديث السجل</span>
              </button>
            </div>

            <div className="rounded-3xl glass-panel border border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-900/90 text-zinc-400 border-b border-slate-800">
                    <tr>
                      <th className="p-4">نوع الحدث (Action)</th>
                      <th className="p-4">الكيان (Entity)</th>
                      <th className="p-4">الحالة</th>
                      <th className="p-4">المدة (Duration)</th>
                      <th className="p-4">بيانات العملية (Metadata)</th>
                      <th className="p-4">الوقت</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {auditLogs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-zinc-500">
                          لا توجد سجلات مسجلة بعد.
                        </td>
                      </tr>
                    ) : (
                      auditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-900/40 transition-colors">
                          <td className="p-4 font-mono font-bold text-emerald-400">{log.action}</td>
                          <td className="p-4 font-mono text-zinc-300">{log.entityType}</td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                              {log.status}
                            </span>
                          </td>
                          <td className="p-4 font-mono text-zinc-400">{log.durationMs ? `${log.durationMs}ms` : '—'}</td>
                          <td className="p-4 font-mono text-zinc-400 max-w-xs truncate">
                            {log.metadata ? JSON.stringify(log.metadata) : '—'}
                          </td>
                          <td className="p-4 text-zinc-500 text-[11px] whitespace-nowrap">
                            {new Date(log.createdAt).toLocaleTimeString('ar-EG')}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SYSTEM HEALTH & INTEGRATIONS */}
        {activeTab === 'SYSTEM_HEALTH' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <span>🛡️</span>
                <span>فحص البنية التحتية والأمان (System Architecture)</span>
              </h2>
              <p className="text-sm text-zinc-400 mt-1">حالة المكونات البرمجية والحدود المفروضة وفق الوثيقة المرجعية.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="rounded-2xl glass-panel p-6 border border-slate-800 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center text-xl font-bold">
                  🗄️
                </div>
                <h3 className="font-bold text-white text-base">مخطط قاعدة البيانات</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  4 نماذج متكاملة: <code>ContentItem</code>, <code>PlatformVariant</code>, <code>MediaAsset</code>, <code>AuditLog</code>.
                </p>
                <div className="text-[11px] font-mono text-emerald-400 pt-1">Prisma 7 • Validated ✓</div>
              </div>

              <div className="rounded-2xl glass-panel p-6 border border-slate-800 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center text-xl font-bold">
                  🛡️
                </div>
                <h3 className="font-bold text-white text-base">الأمان والبيئة الصارمة</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  التحقق عبر Zod، عزل ملفات <code>.env</code> عن Git، وحجب الأسرار وكلمات المرور من أي مخرجات أو سجلات.
                </p>
                <div className="text-[11px] font-mono text-cyan-400 pt-1">Strict Zod Env • Safe ✓</div>
              </div>

              <div className="rounded-2xl glass-panel p-6 border border-slate-800 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center text-xl font-bold">
                  🧪
                </div>
                <h3 className="font-bold text-white text-base">الاختبارات وضمان الجودة</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  25 اختبار وحدة وتكامل ناجح بنسبة 100% عبر Vitest، واجتياز الفحص النوعي <code>tsc --noEmit</code> و ESLint.
                </p>
                <div className="text-[11px] font-mono text-purple-400 pt-1">25/25 Tests Passed ✓</div>
              </div>

              <div className="rounded-2xl glass-panel p-6 border border-slate-800 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center text-xl font-bold">
                  🚫
                </div>
                <h3 className="font-bold text-white text-base">استبعاد واتساب</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  حظر برمجي صارم على مستوى النماذج والمخططات والمحولات يمنع أي تكامل أو توليد لحالات واتساب.
                </p>
                <div className="text-[11px] font-mono text-rose-400 pt-1">WhatsApp Strict Exclusion ✓</div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#060a10] py-8 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 M.GH.AL Content Studio — نظام شخصي مستقل لأتمتة المحتوى العربي</p>
          <div className="flex items-center gap-4 text-zinc-400">
            <span>المراحل: M001 و M002 و M003 منجزة</span>
            <span>•</span>
            <span>المنصات: Facebook, Instagram, TikTok</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
