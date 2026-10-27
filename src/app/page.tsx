'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { AspectRatio, StudioTheme } from '@/modules/media/image-renderer';
import type { PlatformType, ContentStatus } from '@/types';
import type {
  AutomationRule,
  ScheduledPublishJob,
  AgentAction,
  ApprovalPolicy,
  AIConnectionStatus,
} from '@/modules/agent/types';
import type { AccountConnectionStatus } from '@/modules/publishing/types';
import { OnboardingGuideModal } from '@/components/OnboardingGuideModal';

type ActiveTab = 'COMMANDER' | 'IMAGE_STUDIO' | 'DRAFTS' | 'CONNECTED_ACCOUNTS' | 'AUDIT_LOGS' | 'SYSTEM_HEALTH';

interface ChatMessage {
  id: string;
  sender: 'OWNER' | 'GEMINI';
  text: string;
  timestamp: string;
  executedActions?: AgentAction[];
}

interface StoredVariant {
  id: string;
  platform: PlatformType;
  caption: string;
  hashtags: string[];
  status: string;
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
  platformVariants: StoredVariant[];
}

interface MediaAssetItem {
  id: string;
  contentItemId: string;
  mediaType: string;
  storageKey: string | null;
  mediaUrl: string | null;
  mimeType: string;
  metadata?: {
    width?: number;
    height?: number;
    sizeBytes?: number;
    format?: string;
    aspectRatio?: string;
    theme?: string;
    filename?: string;
    title?: string;
    subtitle?: string;
  } | null;
  createdAt: string;
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

interface GeneratedImageState {
  publicUrl: string;
  width: number;
  height: number;
  sizeBytes: number;
  format: string;
  theme: StudioTheme;
  aspectRatio: AspectRatio;
  durationMs: number;
  filename: string;
  title: string;
  subtitle?: string;
}

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('COMMANDER');
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // AI & Commander Status
  const [aiStatus, setAiStatus] = useState<AIConnectionStatus>('AWAITING_GEMINI_KEY');
  const [activeModel, setActiveModel] = useState<string>('Gemini Commander');
  const [hasValidApiKey, setHasValidApiKey] = useState(false);

  // Chat Window State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'GEMINI',
      text: 'مرحباً بك يا قائد! أنا وكيل Gemini التنفيذي ومجدولك الذاتي لنظام M.GH.AL Content Studio.\n\nاتفق معي الآن على موعد النشر اليومي وموضوعاتك، أو اطلب مني توليد أول منشور بصورته وجدولته فوراً.',
      timestamp: 'الآن',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isSendingChat, setIsSendingChat] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Autonomous Schedule State
  const [activeRule, setActiveRule] = useState<AutomationRule | null>(null);
  const [scheduledJobs, setScheduledJobs] = useState<ScheduledPublishJob[]>([]);
  const [isRunningTick, setIsRunningTick] = useState(false);
  const [tickFeedback, setTickFeedback] = useState<string | null>(null);

  // Image Studio State (M004)
  const [imageTitle, setImageTitle] = useState('لا تستسلم بسبب تأخر النتائج؛ فكل بذرة تحتاج وقتاً لتزهر');
  const [imageSubtitle, setImageSubtitle] = useState('الانضباط اليومي الهادئ يصنع الفارق الحقيقي في النهاية.');
  const [imageAspectRatio, setImageAspectRatio] = useState<AspectRatio>('1:1');
  const [imageTheme, setImageTheme] = useState<StudioTheme>('emerald-dark');
  const [imageWatermark, setImageWatermark] = useState('M.GH.AL STUDIO');
  const [isRenderingImage, setIsRenderingImage] = useState(false);
  const [imageRenderError, setImageRenderError] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<GeneratedImageState | null>(null);
  const [mediaGallery, setMediaGallery] = useState<MediaAssetItem[]>([]);
  const [isLoadingGallery, setIsLoadingGallery] = useState(false);

  // Content Library & Drafts State
  const [contentList, setContentList] = useState<StoredItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDraftPlatform, setSelectedDraftPlatform] = useState<Record<string, PlatformType>>({});

  // Connected Accounts State (M006)
  const [connectedAccounts, setConnectedAccounts] = useState<AccountConnectionStatus[]>([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
  const [fbPageId, setFbPageId] = useState('');
  const [fbToken, setFbToken] = useState('');
  const [showFbToken, setShowFbToken] = useState(false);
  const [igAccountId, setIgAccountId] = useState('q_v94');
  const [igToken, setIgToken] = useState('');
  const [showIgToken, setShowIgToken] = useState(false);
  const [ttToken, setTtToken] = useState('');
  const [showTtToken, setShowTtToken] = useState(false);
  const [ttCreatorId, setTtCreatorId] = useState('m.gh.al.2006');
  const [accountActionLoading, setAccountActionLoading] = useState<string | null>(null);
  const [accountActionMessage, setAccountActionMessage] = useState<{
    platform: string;
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Live Publishing Execution State
  const [publishingItemId, setPublishingItemId] = useState<string | null>(null);
  const [publishFeedback, setPublishFeedback] = useState<{
    id: string;
    type: 'success' | 'error';
    text: string;
    url?: string;
  } | null>(null);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);

  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  // Scroll chat to bottom
  const scrollToBottom = () => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  // Load schedule and agent status
  const fetchSchedule = useCallback(async () => {
    try {
      const res = await fetch('/api/agent/schedule');
      const data = await res.json();
      if (data.success && data.data) {
        setActiveRule(data.data.rule);
        setScheduledJobs(data.data.scheduledJobs || []);
        if (data.aiStatus) {
          setAiStatus(data.aiStatus);
          setHasValidApiKey(data.aiStatus === 'LIVE_GEMINI');
        }
        if (data.activeModel) {
          setActiveModel(data.activeModel);
        }
      }
    } catch (e) {
      console.error('Failed to load schedule:', e);
    }
  }, []);

  // Load content items
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

  // Load media gallery
  const fetchMediaGallery = useCallback(async () => {
    setIsLoadingGallery(true);
    try {
      const res = await fetch('/api/media/image');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setMediaGallery(data.data);
      }
    } catch (e) {
      console.error('Failed to load media:', e);
    } finally {
      setIsLoadingGallery(false);
    }
  }, []);

  // Load audit logs
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

  // Load connected accounts
  const fetchAccounts = useCallback(async () => {
    setIsLoadingAccounts(true);
    try {
      const res = await fetch('/api/platforms/accounts');
      const data = await res.json();
      if (data.success && Array.isArray(data.accounts)) {
        setConnectedAccounts(data.accounts);
      }
    } catch (e) {
      console.error('Failed to load accounts:', e);
    } finally {
      setIsLoadingAccounts(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      try {
        const [schedRes, contentRes, mediaRes, accRes] = await Promise.all([
          fetch('/api/agent/schedule').then((r) => r.json()).catch(() => null),
          fetch('/api/content').then((r) => r.json()).catch(() => null),
          fetch('/api/media/image').then((r) => r.json()).catch(() => null),
          fetch('/api/platforms/accounts').then((r) => r.json()).catch(() => null),
        ]);

        if (!isMounted) return;

        if (schedRes?.success && schedRes.data) {
          setActiveRule(schedRes.data.rule);
          setScheduledJobs(schedRes.data.scheduledJobs || []);
          if (schedRes.aiStatus) {
            setAiStatus(schedRes.aiStatus);
            setHasValidApiKey(schedRes.aiStatus === 'LIVE_GEMINI');
          }
          if (schedRes.activeModel) {
            setActiveModel(schedRes.activeModel);
          }
        }

        if (contentRes?.success && Array.isArray(contentRes.data)) {
          setContentList(contentRes.data);
        }

        if (mediaRes?.success && Array.isArray(mediaRes.data)) {
          setMediaGallery(mediaRes.data);
        }

        if (accRes?.success && Array.isArray(accRes.accounts)) {
          setConnectedAccounts(accRes.accounts);
        }
      } catch (err) {
        console.error('Failed to initialize page state:', err);
      }
    };

    void init();
    return () => {
      isMounted = false;
    };
  }, []);

  // Tab switch refresher
  useEffect(() => {
    let isMounted = true;
    const refreshTab = async () => {
      if (activeTab === 'COMMANDER') {
        const res = await fetch('/api/agent/schedule').then((r) => r.json()).catch(() => null);
        if (isMounted && res?.success && res.data) {
          setActiveRule(res.data.rule);
          setScheduledJobs(res.data.scheduledJobs || []);
        }
      } else if (activeTab === 'IMAGE_STUDIO') {
        const res = await fetch('/api/media/image').then((r) => r.json()).catch(() => null);
        if (isMounted && res?.success && Array.isArray(res.data)) {
          setMediaGallery(res.data);
        }
      } else if (activeTab === 'DRAFTS') {
        const [cRes, mRes] = await Promise.all([
          fetch(statusFilter !== 'ALL' ? `/api/content?status=${statusFilter}` : '/api/content')
            .then((r) => r.json())
            .catch(() => null),
          fetch('/api/media/image').then((r) => r.json()).catch(() => null),
        ]);
        if (isMounted) {
          if (cRes?.success && Array.isArray(cRes.data)) setContentList(cRes.data);
          if (mRes?.success && Array.isArray(mRes.data)) setMediaGallery(mRes.data);
        }
      } else if (activeTab === 'CONNECTED_ACCOUNTS') {
        const res = await fetch('/api/platforms/accounts').then((r) => r.json()).catch(() => null);
        if (isMounted && res?.success && Array.isArray(res.accounts)) {
          setConnectedAccounts(res.accounts);
        }
      } else if (activeTab === 'AUDIT_LOGS') {
        const res = await fetch('/api/audit-logs').then((r) => r.json()).catch(() => null);
        if (isMounted && res?.success && Array.isArray(res.data)) {
          setAuditLogs(res.data);
        }
      }
    };

    void refreshTab();
    return () => {
      isMounted = false;
    };
  }, [activeTab, statusFilter]);

  // Send message to Gemini Commander
  const handleSendChat = async (presetText?: string) => {
    const textToSend = presetText || chatInput;
    if (!textToSend.trim() || isSendingChat) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'OWNER',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    if (!presetText) setChatInput('');
    setIsSendingChat(true);

    try {
      const res = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend }),
      });

      const data = await res.json();
      if (data.success) {
        const geminiMsg: ChatMessage = {
          id: `gem-${Date.now()}`,
          sender: 'GEMINI',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
          executedActions: data.executedActions || [],
        };
        setChatMessages((prev) => [...prev, geminiMsg]);

        // Refresh all local state after tools execution
        await fetchSchedule();
        await fetchContent();
        await fetchMediaGallery();
      } else {
        const errMsg: ChatMessage = {
          id: `err-${Date.now()}`,
          sender: 'GEMINI',
          text: `⚠️ عذراً، حدث خطأ: ${data.error || 'تعذر استلام الرد'}`,
          timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
        };
        setChatMessages((prev) => [...prev, errMsg]);
      }
    } catch (err: unknown) {
      const errMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'GEMINI',
        text: `⚠️ فشل الاتصال بالخادم: ${(err as Error).message}`,
        timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsSendingChat(false);
    }
  };

  // Trigger Autonomous Cycle Immediately
  const handleRunTickNow = async () => {
    setIsRunningTick(true);
    setTickFeedback(null);
    try {
      const res = await fetch('/api/agent/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'RUN_TICK_NOW', force: true }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setTickFeedback(`تم توليد وجدولة منشور جديد بنجاح: "${data.data.contentItem.title}"`);
        await fetchSchedule();
        await fetchContent();
        await fetchMediaGallery();
      } else {
        setTickFeedback(`خطأ: ${data.error || 'فشل تشغيل الدورة'}`);
      }
    } catch (e: unknown) {
      setTickFeedback(`فشل الاتصال: ${(e as Error).message}`);
    } finally {
      setIsRunningTick(false);
    }
  };

  // Toggle Policy (Require Approval vs Auto Publish)
  const handleTogglePolicy = async () => {
    if (!activeRule) return;
    const newPolicy: ApprovalPolicy =
      activeRule.approvalPolicy === 'REQUIRE_APPROVAL' ? 'AUTO_PUBLISH' : 'REQUIRE_APPROVAL';

    try {
      const res = await fetch('/api/agent/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_RULE',
          rule: { approvalPolicy: newPolicy },
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setActiveRule(data.data);
      }
    } catch (e) {
      console.error('Failed to update policy:', e);
    }
  };

  // Render Image via Sharp (Image Studio)
  const handleRenderImage = async () => {
    if (imageTitle.trim().length < 3) return;
    setIsRenderingImage(true);
    setImageRenderError(null);

    try {
      const res = await fetch('/api/media/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: imageTitle,
          subtitle: imageSubtitle,
          aspectRatio: imageAspectRatio,
          theme: imageTheme,
          brandWatermark: imageWatermark,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setGeneratedImage({
          publicUrl: json.data.publicUrl,
          width: json.data.width,
          height: json.data.height,
          sizeBytes: json.data.sizeBytes,
          format: json.data.format,
          theme: json.data.theme,
          aspectRatio: json.data.aspectRatio,
          durationMs: json.data.durationMs,
          filename: json.data.filename,
          title: imageTitle,
          subtitle: imageSubtitle,
        });

        await fetchMediaGallery();
        await fetchContent();
      } else {
        setImageRenderError(json.error || 'فشل توليد الصورة');
      }
    } catch (err: unknown) {
      setImageRenderError((err as Error).message || 'تعذر الاتصال بخادم توليد الصور');
    } finally {
      setIsRenderingImage(false);
    }
  };

  // Update Content Item Status (Drafts Tab)
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
        await fetchSchedule();
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  // Delete Content Item
  const handleDeleteItem = async (id: string) => {
    if (!confirm('هل أنت متأكد من رغبتك في حذف هذا المحتوى؟')) return;
    try {
      const res = await fetch(`/api/content/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        await fetchContent();
        await fetchSchedule();
      }
    } catch (err) {
      console.error('Failed to delete item:', err);
    }
  };

  // Switch to image studio prefilled from draft
  const openInImageStudio = (title: string, subtitle?: string | null) => {
    setImageTitle(title);
    setImageSubtitle(subtitle || '');
    setActiveTab('IMAGE_STUDIO');
  };

  // Save Platform Credentials & Test Connection (M006)
  const handleSaveAccount = async (platform: PlatformType) => {
    setAccountActionLoading(platform);
    setAccountActionMessage(null);
    try {
      let body: Record<string, string> = { platform };
      if (platform === 'FACEBOOK') {
        body = { platform, accountId: fbPageId, accessToken: fbToken };
      } else if (platform === 'INSTAGRAM') {
        body = { platform, accountId: igAccountId, accessToken: igToken };
      } else if (platform === 'TIKTOK') {
        body = { platform, accountId: ttCreatorId, accessToken: ttToken };
      }

      const res = await fetch('/api/platforms/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        setAccountActionMessage({
          platform,
          type: 'success',
          text: data.message || `تم ربط حساب ${platform} بنجاح!`,
        });
        await fetchAccounts();
        await fetchAuditLogs();
      } else {
        setAccountActionMessage({
          platform,
          type: 'error',
          text: data.error || `فشل ربط حساب ${platform}`,
        });
      }
    } catch (err) {
      setAccountActionMessage({
        platform,
        type: 'error',
        text: (err as Error).message || 'تعذر الاتصال بالخادم',
      });
    } finally {
      setAccountActionLoading(null);
    }
  };

  // Disconnect Platform (M006)
  const handleDisconnectAccount = async (platform: PlatformType) => {
    if (!confirm(`هل أنت متأكد من رغبتك في إلغاء ربط منصة ${platform}؟`)) return;
    setAccountActionLoading(platform);
    setAccountActionMessage(null);
    try {
      const res = await fetch(`/api/platforms/accounts?platform=${platform}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setAccountActionMessage({
          platform,
          type: 'success',
          text: `تم إلغاء ربط منصة ${platform} بنجاح.`,
        });
        await fetchAccounts();
        await fetchAuditLogs();
      }
    } catch (err) {
      console.error('Failed to disconnect:', err);
    } finally {
      setAccountActionLoading(null);
    }
  };

  // Execute Real Live Publishing (M006)
  const handleLivePublish = async (contentItemId: string, platform: PlatformType) => {
    setPublishingItemId(contentItemId);
    setPublishFeedback(null);
    try {
      const res = await fetch('/api/publishing/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentItemId, platform }),
      });
      const data = await res.json();
      if (data.success) {
        setPublishFeedback({
          id: contentItemId,
          type: 'success',
          text: `تم النشر الحقيقي بنجاح على منصة ${platform}! ${data.result?.platformPostId ? `(معرف: ${data.result.platformPostId})` : ''}`,
          url: data.result?.postUrl,
        });
        await fetchContent();
        await fetchAuditLogs();
      } else {
        setPublishFeedback({
          id: contentItemId,
          type: 'error',
          text: data.error || `فشل النشر على ${platform}`,
        });
      }
    } catch (err) {
      setPublishFeedback({
        id: contentItemId,
        type: 'error',
        text: (err as Error).message || 'تعذر الاتصال بالخادم للنشر الحقيقي',
      });
    } finally {
      setPublishingItemId(null);
    }
  };

  const filteredContent = contentList.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return item.title.toLowerCase().includes(q) || (item.topic && item.topic.toLowerCase().includes(q));
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#070b12] text-zinc-100 font-['Cairo',sans-serif] selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Header & Navigation */}
      <header className="border-b border-slate-800/80 bg-[#090e17]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 p-0.5 shadow-lg shadow-emerald-500/20 flex items-center justify-center">
              <span className="text-xl font-black text-black">M</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-wide text-white">M.GH.AL Content Studio</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Autonomous Agent
                </span>
              </div>
              <p className="text-xs text-zinc-400">وكيل Gemini التنفيذي والمجدول الذاتي واستوديو الصور العربية</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden lg:flex items-center p-1 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('COMMANDER')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
                activeTab === 'COMMANDER'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>⚡</span>
              <span>غرفة قيادة Gemini والأتمتة</span>
            </button>
            <button
              onClick={() => setActiveTab('IMAGE_STUDIO')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'IMAGE_STUDIO'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>🎨</span>
              <span>استوديو الصور العربية (M004)</span>
              {mediaGallery.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-emerald-300 border border-slate-700">
                  {mediaGallery.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('DRAFTS')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'DRAFTS'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>📑</span>
              <span>المسودات والمنشورات</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-emerald-300 border border-slate-700">
                {contentList.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('CONNECTED_ACCOUNTS')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'CONNECTED_ACCOUNTS'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>🔗</span>
              <span>ربط الحسابات والنشر المباشر</span>
              {connectedAccounts.some((a) => a.isConnected) && (
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('AUDIT_LOGS')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'AUDIT_LOGS'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>📊</span>
              <span>سجل العمليات</span>
            </button>
            <button
              onClick={() => setActiveTab('SYSTEM_HEALTH')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'SYSTEM_HEALTH'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>🛡️</span>
              <span>حالة البنية</span>
            </button>
          </nav>

          {/* Real AI Connection Status Badge & Quickstart Guide Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsGuideOpen(true)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 text-emerald-300 border border-emerald-500/40 transition-all flex items-center gap-1.5 shadow-sm"
              title="دليل التشغيل والربط السريع للمستخدمين الجدد"
            >
              <span>📚</span>
              <span className="hidden md:inline">دليل البدء والربط السريع</span>
              <span className="md:hidden">الدليل</span>
            </button>

            {aiStatus === 'LIVE_GEMINI' ? (
              <span
                title="متصل مباشرة بسحابة Google Gemini API مع Function Calling نشط"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-xs font-semibold"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>LIVE_GEMINI (سحابي مباشر)</span>
              </span>
            ) : (
              <span
                title="يعمل بنظام التشغيل الذاتي الداخلي لعدم ضبط GEMINI_API_KEY"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-semibold"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                <span>AWAITING_GEMINI_KEY (وضع محلي دائم)</span>
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main App Container */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        {/* Mobile Navigation */}
        <div className="flex lg:hidden overflow-x-auto gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
          <button
            onClick={() => setIsGuideOpen(true)}
            className="px-3 py-1.5 rounded-xl whitespace-nowrap bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold"
          >
            📚 الدليل
          </button>
          <button
            onClick={() => setActiveTab('COMMANDER')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap ${
              activeTab === 'COMMANDER' ? 'bg-emerald-500 text-black font-bold' : 'text-zinc-400'
            }`}
          >
            ⚡ غرفة القيادة
          </button>
          <button
            onClick={() => setActiveTab('IMAGE_STUDIO')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap ${
              activeTab === 'IMAGE_STUDIO' ? 'bg-emerald-500 text-black font-bold' : 'text-zinc-400'
            }`}
          >
            🎨 الصور ({mediaGallery.length})
          </button>
          <button
            onClick={() => setActiveTab('DRAFTS')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap ${
              activeTab === 'DRAFTS' ? 'bg-emerald-500 text-black font-bold' : 'text-zinc-400'
            }`}
          >
            📑 المسودات ({contentList.length})
          </button>
          <button
            onClick={() => setActiveTab('CONNECTED_ACCOUNTS')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap ${
              activeTab === 'CONNECTED_ACCOUNTS' ? 'bg-emerald-500 text-black font-bold' : 'text-zinc-400'
            }`}
          >
            🔗 الحسابات
          </button>
          <button
            onClick={() => setActiveTab('AUDIT_LOGS')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap ${
              activeTab === 'AUDIT_LOGS' ? 'bg-emerald-500 text-black font-bold' : 'text-zinc-400'
            }`}
          >
            📊 العمليات
          </button>
          <button
            onClick={() => setActiveTab('SYSTEM_HEALTH')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap ${
              activeTab === 'SYSTEM_HEALTH' ? 'bg-emerald-500 text-black font-bold' : 'text-zinc-400'
            }`}
          >
            🛡️ البنية
          </button>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: AI COMMANDER & AUTONOMOUS SELF-SCHEDULER (MAIN)    */}
        {/* ======================================================== */}
        {activeTab === 'COMMANDER' && (
          <div className="space-y-8">
            {/* Top Overview & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Interactive Chat Window with Gemini Commander (7 cols) */}
              <div className="lg:col-span-7 flex flex-col rounded-3xl bg-[#090e17] border border-slate-800 p-6 space-y-5 h-[680px]">
                {/* Chat Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-xl shadow-md shadow-emerald-500/20">
                      🤖
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-white flex items-center gap-2">
                        <span>محادثة Gemini Commander التنفيذية</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                          Function Calling
                        </span>
                      </h3>
                      <p className="text-xs text-zinc-400">
                        اكتب أوامرك بالعربية وسيقوم الوكيل بتنفيذها وتوليد الصور وجدولة المهام ذاتياً.
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] text-zinc-500 font-mono">data/local-store.json</span>
                </div>

                {/* Chat Messages Body */}
                <div className="flex-1 overflow-y-auto space-y-4 pr-1 pl-2">
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${msg.sender === 'OWNER' ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 text-[11px] text-zinc-500">
                        <span>{msg.sender === 'OWNER' ? '👤 أنت (المالك)' : '🤖 Gemini Commander'}</span>
                        <span>•</span>
                        <span>{msg.timestamp}</span>
                      </div>

                      <div
                        className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed whitespace-pre-line ${
                          msg.sender === 'OWNER'
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-tr-none shadow-md shadow-emerald-600/20'
                            : 'bg-slate-900 border border-slate-800 text-zinc-200 rounded-tl-none'
                        }`}
                      >
                        {msg.text}

                        {/* Executed Tools Actions Badges */}
                        {msg.executedActions && msg.executedActions.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2">
                            <span className="text-xs font-bold text-emerald-400 block">
                              🛠️ الإجراءات البرمجية المنفذة:
                            </span>
                            {msg.executedActions.map((action, i) => (
                              <div
                                key={i}
                                className="p-2.5 rounded-xl bg-black/40 border border-slate-800 text-xs space-y-1 font-mono"
                              >
                                <div className="flex items-center justify-between text-zinc-300">
                                  <strong className="text-emerald-300">{action.action}</strong>
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                                    نجح ✓
                                  </span>
                                </div>
                                <p className="text-[11px] text-zinc-400 font-sans">{action.message}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {isSendingChat && (
                    <div className="flex items-center gap-2 text-xs text-zinc-400 p-2">
                      <span className="w-3.5 h-3.5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></span>
                      <span>Gemini يفكر وينفذ الأدوات البرمجية...</span>
                    </div>
                  )}

                  <div ref={chatBottomRef} />
                </div>

                {/* Quick Prompts Chips */}
                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <span className="text-[11px] text-zinc-400 block font-medium">أوامر سريعة بنقرة واحدة:</span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        handleSendChat(
                          'اتفقنا أن تنشئ كل يوم الساعة 9 مساءً منشورًا تحفيزيًا مع صورته وتجدوله على فيسبوك وإنستغرام وتيك توك، وأنشئ لي الآن أول منشور عن الصبر والاستمرارية'
                        )
                      }
                      className="px-2.5 py-1 rounded-xl text-[11px] bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-slate-800 transition-all text-right truncate max-w-full"
                    >
                      💬 اتفقنا: نشر يومي 9 م + أول منشور
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleSendChat('أنشئ لي الآن منشوراً فورياً عن عقلية الوفرة والتركيز مع صورته الزمردية')
                      }
                      className="px-2.5 py-1 rounded-xl text-[11px] bg-slate-900 hover:bg-slate-800 text-teal-300 border border-slate-800 transition-all text-right"
                    >
                      ⚡ توليد منشور فوري مع صورته
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSendChat('شغّل دورة الأتمتة الذاتية الآن')}
                      className="px-2.5 py-1 rounded-xl text-[11px] bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-800 transition-all text-right"
                    >
                      🔄 تشغيل دورة النشر فوراً
                    </button>
                  </div>
                </div>

                {/* Chat Input Bar */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void handleSendChat();
                  }}
                  className="flex items-center gap-2 pt-2"
                >
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="اكتب أمرك أو اتفاقك لـ Gemini هنا (مثال: اتفقنا أن تنشئ...)"
                    disabled={isSendingChat}
                    className="flex-1 rounded-2xl bg-[#03060a] border border-slate-800 px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={isSendingChat || !chatInput.trim()}
                    className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-sm hover:opacity-95 transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                  >
                    <span>إرسال</span>
                    <span>🚀</span>
                  </button>
                </form>
              </div>

              {/* Right Column: Auto-Pilot Active Agreement & Controls (5 cols) */}
              <div className="lg:col-span-5 space-y-6">
                {/* Auto-Pilot Agreement Panel */}
                <div className="rounded-3xl bg-[#090e17] border border-slate-800 p-6 space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                        ⚡
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-white">اتفاقية الجدولة الذاتية النشطة</h3>
                        <p className="text-xs text-zinc-400">Auto-Pilot Self-Scheduling Agreement</p>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                        activeRule?.isEnabled
                          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                          : 'bg-slate-800 text-zinc-400 border-slate-700'
                      }`}
                    >
                      {activeRule?.isEnabled ? 'نشط ومفعّل ✓' : 'متوقف مؤقتاً'}
                    </span>
                  </div>

                  {/* Agreement Details Grid */}
                  <div className="space-y-4 text-xs">
                    <div className="p-3.5 rounded-2xl bg-[#03060a] border border-slate-800 space-y-1">
                      <span className="text-zinc-500 block">عنوان الاتفاقية:</span>
                      <strong className="text-white text-sm block">
                        {activeRule?.name || 'اتفاقية الجدولة الذاتية اليومية لـ M.GH.AL'}
                      </strong>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3.5 rounded-2xl bg-[#03060a] border border-slate-800 space-y-1">
                        <span className="text-zinc-500 block">أوقات النشر اليومية:</span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {(activeRule?.cronOrTimes || ['21:00']).map((t) => (
                            <span
                              key={t}
                              className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 font-mono font-bold text-xs"
                            >
                              {t}
                            </span>
                          ))}
                          <span className="text-[10px] text-zinc-500 font-mono">({activeRule?.timezone || 'Asia/Aden'})</span>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-[#03060a] border border-slate-800 space-y-1">
                        <span className="text-zinc-500 block">سياسة الاعتماد:</span>
                        <button
                          type="button"
                          onClick={handleTogglePolicy}
                          className="w-full text-right group flex items-center justify-between"
                        >
                          <strong
                            className={`text-xs font-bold ${
                              activeRule?.approvalPolicy === 'AUTO_PUBLISH'
                                ? 'text-cyan-400'
                                : 'text-amber-400'
                            }`}
                          >
                            {activeRule?.approvalPolicy === 'AUTO_PUBLISH'
                              ? '⚡ نشر تلقائي'
                              : '🛡️ بموافقتي أولاً'}
                          </strong>
                          <span className="text-[10px] text-zinc-500 group-hover:text-white underline">تبديل</span>
                        </button>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#03060a] border border-slate-800 space-y-2">
                      <span className="text-zinc-500 block">المنصات المعتمدة حصرياً:</span>
                      <div className="flex items-center gap-2">
                        {(activeRule?.targetPlatforms || ['FACEBOOK', 'INSTAGRAM', 'TIKTOK']).map((p) => (
                          <span
                            key={p}
                            className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-zinc-200 text-xs font-medium flex items-center gap-1.5"
                          >
                            <span>{p === 'FACEBOOK' ? '📘' : p === 'INSTAGRAM' ? '📸' : '🎵'}</span>
                            <span>{p}</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-2xl bg-[#03060a] border border-slate-800 space-y-1">
                        <span className="text-zinc-500 block">الموعد القادم للتشغيل:</span>
                        <strong className="text-emerald-400 font-mono text-[11px] block truncate">
                          {activeRule?.nextRunAt ? new Date(activeRule.nextRunAt).toLocaleString('ar-SA') : 'اليوم 21:00'}
                        </strong>
                      </div>

                      <div className="p-3 rounded-2xl bg-[#03060a] border border-slate-800 space-y-1">
                        <span className="text-zinc-500 block">آخر تشغيل ناجح:</span>
                        <strong className="text-zinc-300 font-mono text-[11px] block truncate">
                          {activeRule?.lastRunAt ? new Date(activeRule.lastRunAt).toLocaleString('ar-SA') : 'لم يُشغّل بعد'}
                        </strong>
                      </div>
                    </div>

                    {/* Topics Pool */}
                    <div className="p-3.5 rounded-2xl bg-[#03060a] border border-slate-800 space-y-2">
                      <span className="text-zinc-500 block">حوض موضوعات التناوب ({activeRule?.topicsPool?.length || 0}):</span>
                      <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                        {(activeRule?.topicsPool || []).map((topic, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-lg bg-slate-900 text-zinc-300 text-[11px] border border-slate-800"
                          >
                            • {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Run Autonomous Cycle Button */}
                  <div className="space-y-3 pt-2">
                    <button
                      type="button"
                      onClick={handleRunTickNow}
                      disabled={isRunningTick}
                      className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-slate-950 font-bold text-sm hover:opacity-95 transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isRunningTick ? (
                        <>
                          <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                          <span>جاري تنفيذ الدورة وتوليد المحتوى والصورة...</span>
                        </>
                      ) : (
                        <>
                          <span>⚡</span>
                          <span>تشغيل دورة Gemini الذاتية الآن (Run Autonomous Cycle)</span>
                        </>
                      )}
                    </button>

                    {tickFeedback && (
                      <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
                        {tickFeedback}
                      </div>
                    )}
                  </div>
                </div>

                {/* Scheduled Jobs Counter */}
                <div className="rounded-3xl bg-[#090e17] border border-slate-800 p-5 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-white">مهام النشر المجدولة بقفل منع التكرار:</h4>
                    <p className="text-zinc-400">Idempotency-locked publish queue</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black font-mono text-emerald-400">{scheduledJobs.length}</span>
                    <span className="text-zinc-500">مهمة</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: ARABIC IMAGE STUDIO (M004)                         */}
        {/* ======================================================== */}
        {activeTab === 'IMAGE_STUDIO' && (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2.5">
                  <span className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-lg">
                    🎨
                  </span>
                  <span>استوديو الصور العربية الفعلي (M004)</span>
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                  توليد بطاقات وبوستات عربية حقيقية برمجياً عبر محرك <code>sharp</code> وحفظها على القرص في <code>public/generated/images/</code>.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-zinc-300">
                  المحرك: <strong className="text-emerald-400">Sharp + SVG RTL Vector</strong>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Controls Column (5 cols) */}
              <div className="lg:col-span-5 rounded-3xl bg-[#090e17] border border-slate-800 p-6 sm:p-7 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <h3 className="font-bold text-base text-white flex items-center gap-2">
                    <span>⚙️</span>
                    <span>إعدادات التصميم والبطاقة</span>
                  </h3>
                  <span className="text-xs text-zinc-400 font-mono">Server-Side Pipeline</span>
                </div>

                {/* Quick-fill from Drafts */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-zinc-300">استيراد سريع من المسودات:</label>
                  <select
                    onChange={(e) => {
                      const item = contentList.find((i) => i.id === e.target.value);
                      if (item) {
                        setImageTitle(item.title);
                        setImageSubtitle(item.brief || '');
                      }
                    }}
                    className="w-full rounded-2xl bg-[#03060a] border border-slate-800 px-3.5 py-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">-- اختر مسودة للتحميل التلقائي --</option>
                    {contentList.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.title.length > 50 ? item.title.slice(0, 47) + '...' : item.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Main Title / Quote */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-zinc-300">النص العربي الرئيسي (العنوان أو الاقتباس):</label>
                  <textarea
                    rows={3}
                    value={imageTitle}
                    onChange={(e) => setImageTitle(e.target.value)}
                    placeholder="اكتب النص العربي الرئيسي هنا..."
                    className="w-full rounded-2xl bg-[#03060a] border border-slate-800 p-3.5 text-sm text-white focus:outline-none focus:border-emerald-500 leading-relaxed"
                  />
                  <p className="text-[11px] text-zinc-500">
                    يلتف النص العربي تلقائياً مع محاذاة RTL وتوسيط هندسي مثالي.
                  </p>
                </div>

                {/* Subtitle */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-zinc-300">النص الثانوي / الفكرة المتممة (اختياري):</label>
                  <input
                    type="text"
                    value={imageSubtitle}
                    onChange={(e) => setImageSubtitle(e.target.value)}
                    placeholder="نص متمم أو فكرة ثانوية..."
                    className="w-full rounded-2xl bg-[#03060a] border border-slate-800 px-3.5 py-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Aspect Ratio Selector */}
                <div className="space-y-2.5">
                  <label className="block text-xs font-semibold text-zinc-300">المقاس القياسي المستهدف:</label>
                  <div className="grid grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setImageAspectRatio('1:1')}
                      className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                        imageAspectRatio === '1:1'
                          ? 'border-emerald-500 bg-emerald-500/15 text-white'
                          : 'border-slate-800 bg-[#03060a] text-zinc-400 hover:text-white'
                      }`}
                    >
                      <div className="w-6 h-6 border-2 border-current rounded flex items-center justify-center text-[10px] font-bold">
                        1:1
                      </div>
                      <span className="text-xs font-bold">مربع (فيسبوك/إنستا)</span>
                      <span className="text-[10px] text-zinc-500 font-mono">1080×1080</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setImageAspectRatio('4:5')}
                      className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                        imageAspectRatio === '4:5'
                          ? 'border-emerald-500 bg-emerald-500/15 text-white'
                          : 'border-slate-800 bg-[#03060a] text-zinc-400 hover:text-white'
                      }`}
                    >
                      <div className="w-5 h-6 border-2 border-current rounded flex items-center justify-center text-[10px] font-bold">
                        4:5
                      </div>
                      <span className="text-xs font-bold">بورتريه إنستغرام</span>
                      <span className="text-[10px] text-zinc-500 font-mono">1080×1350</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setImageAspectRatio('9:16')}
                      className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                        imageAspectRatio === '9:16'
                          ? 'border-emerald-500 bg-emerald-500/15 text-white'
                          : 'border-slate-800 bg-[#03060a] text-zinc-400 hover:text-white'
                      }`}
                    >
                      <div className="w-4 h-7 border-2 border-current rounded flex items-center justify-center text-[10px] font-bold">
                        9:16
                      </div>
                      <span className="text-xs font-bold">رأسي (ريلز/تيك توك)</span>
                      <span className="text-[10px] text-zinc-500 font-mono">1080×1920</span>
                    </button>
                  </div>
                </div>

                {/* Theme Selector */}
                <div className="space-y-2.5">
                  <label className="block text-xs font-semibold text-zinc-300">الثيم البصري الفاخر (Visual Theme):</label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setImageTheme('emerald-dark')}
                      className={`p-3 rounded-2xl border text-right transition-all flex items-center gap-3 ${
                        imageTheme === 'emerald-dark'
                          ? 'border-emerald-500 bg-emerald-950/40 text-white'
                          : 'border-slate-800 bg-[#03060a] text-zinc-400 hover:text-white'
                      }`}
                    >
                      <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-emerald-600 to-emerald-400 shadow-sm shadow-emerald-500/50"></div>
                      <div>
                        <div className="text-xs font-bold">الزمرد الداكن</div>
                        <div className="text-[10px] text-emerald-400">emerald-dark</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setImageTheme('royal-gold')}
                      className={`p-3 rounded-2xl border text-right transition-all flex items-center gap-3 ${
                        imageTheme === 'royal-gold'
                          ? 'border-amber-500 bg-amber-950/40 text-white'
                          : 'border-slate-800 bg-[#03060a] text-zinc-400 hover:text-white'
                      }`}
                    >
                      <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-600 to-amber-300 shadow-sm shadow-amber-500/50"></div>
                      <div>
                        <div className="text-xs font-bold">الذهبي الملكي</div>
                        <div className="text-[10px] text-amber-400">royal-gold</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setImageTheme('midnight-teal')}
                      className={`p-3 rounded-2xl border text-right transition-all flex items-center gap-3 ${
                        imageTheme === 'midnight-teal'
                          ? 'border-cyan-500 bg-cyan-950/40 text-white'
                          : 'border-slate-800 bg-[#03060a] text-zinc-400 hover:text-white'
                      }`}
                    >
                      <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-cyan-600 to-cyan-400 shadow-sm shadow-cyan-500/50"></div>
                      <div>
                        <div className="text-xs font-bold">التيل الليلي</div>
                        <div className="text-[10px] text-cyan-400">midnight-teal</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setImageTheme('minimal-slate')}
                      className={`p-3 rounded-2xl border text-right transition-all flex items-center gap-3 ${
                        imageTheme === 'minimal-slate'
                          ? 'border-slate-400 bg-slate-900/60 text-white'
                          : 'border-slate-800 bg-[#03060a] text-zinc-400 hover:text-white'
                      }`}
                    >
                      <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-slate-600 to-slate-300 shadow-sm"></div>
                      <div>
                        <div className="text-xs font-bold">الرمادي المينيمال</div>
                        <div className="text-[10px] text-slate-400">minimal-slate</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Brand Watermark */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-zinc-300">العلامة المائية / الهوية:</label>
                  <input
                    type="text"
                    value={imageWatermark}
                    onChange={(e) => setImageWatermark(e.target.value)}
                    placeholder="M.GH.AL STUDIO"
                    className="w-full rounded-2xl bg-[#03060a] border border-slate-800 px-3.5 py-3 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                {imageRenderError && (
                  <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                    ⚠️ {imageRenderError}
                  </div>
                )}

                {/* Render Button */}
                <button
                  type="button"
                  onClick={handleRenderImage}
                  disabled={isRenderingImage || imageTitle.trim().length < 3}
                  className="w-full h-12 rounded-2xl text-sm font-bold bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:opacity-95 text-slate-950 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRenderingImage ? (
                    <>
                      <span className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                      <span>جاري المعالجة والرسم بـ Sharp...</span>
                    </>
                  ) : (
                    <>
                      <span>⚡</span>
                      <span>توليد الصورة فعلياً وحفظها على القرص (PNG)</span>
                    </>
                  )}
                </button>
              </div>

              {/* Right Column: Display Rendered Image & Gallery (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                <div className="rounded-3xl bg-[#090e17] border border-slate-800 p-6 sm:p-8 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                    <div>
                      <h3 className="font-bold text-base text-white flex items-center gap-2">
                        <span>🖼️</span>
                        <span>معاينة الصورة الناتجة (Real PNG File)</span>
                      </h3>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        ملف PNG فيزيائي محفوظ في <code>public/generated/images/</code>
                      </p>
                    </div>

                    {generatedImage && (
                      <div className="flex items-center gap-2">
                        <a
                          href={generatedImage.publicUrl}
                          download={generatedImage.filename}
                          className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
                        >
                          <span>⬇️</span>
                          <span>تحميل PNG</span>
                        </a>
                        <a
                          href={generatedImage.publicUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-zinc-300 border border-slate-800 transition-all"
                        >
                          🔍 تكبير
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Render Area */}
                  <div className="rounded-2xl bg-[#03060a] border border-slate-800/80 p-4 sm:p-6 flex items-center justify-center min-h-[420px] relative overflow-hidden">
                    {isRenderingImage ? (
                      <div className="flex flex-col items-center gap-4 text-center">
                        <div className="w-12 h-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div>
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-white">جاري الرسم والتصدير البرمجي...</p>
                          <p className="text-xs text-zinc-400">
                            رسم متجهات SVG • تشكيل الحروف العربية • التحويل إلى PNG عالي الدقة
                          </p>
                        </div>
                      </div>
                    ) : generatedImage ? (
                      <div className="flex flex-col items-center gap-4 w-full">
                        <div
                          className="relative max-h-[520px] w-auto rounded-xl overflow-hidden shadow-2xl border border-slate-700/60"
                          style={{
                            aspectRatio:
                              generatedImage.aspectRatio === '1:1'
                                ? '1/1'
                                : generatedImage.aspectRatio === '4:5'
                                ? '4/5'
                                : '9/16',
                          }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={generatedImage.publicUrl}
                            alt={generatedImage.title}
                            className="w-full h-full object-contain max-h-[520px]"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3 text-center p-8">
                        <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-3xl">
                          🎨
                        </div>
                        <h4 className="font-bold text-white text-base">لا توجد صورة معروضة حالياً</h4>
                        <p className="text-xs text-zinc-400 max-w-sm">
                          اختر النص والمقاس والثيم واضغط على زر «توليد الصورة فعلياً» لإنشاء الملف الحقيقي.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* File Metadata Badges */}
                  {generatedImage && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1">
                        <span className="text-zinc-500 text-[11px] block">الأبعاد الفيزيائية:</span>
                        <strong className="text-white font-mono block text-sm">
                          {generatedImage.width} × {generatedImage.height} px
                        </strong>
                      </div>

                      <div className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1">
                        <span className="text-zinc-500 text-[11px] block">الحجم على القرص:</span>
                        <strong className="text-emerald-400 font-mono block text-sm">
                          {Math.round(generatedImage.sizeBytes / 1024)} KB
                        </strong>
                      </div>

                      <div className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1">
                        <span className="text-zinc-500 text-[11px] block">صيغة الملف:</span>
                        <strong className="text-cyan-400 font-mono block text-sm">
                          {generatedImage.format.toUpperCase()} (Sharp)
                        </strong>
                      </div>

                      <div className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1">
                        <span className="text-zinc-500 text-[11px] block">وقت المعالجة:</span>
                        <strong className="text-purple-400 font-mono block text-sm">
                          {generatedImage.durationMs}ms
                        </strong>
                      </div>
                    </div>
                  )}
                </div>

                {/* Gallery of Rendered Images */}
                <div className="rounded-3xl bg-[#090e17] border border-slate-800 p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="font-bold text-sm text-white flex items-center gap-2">
                      <span>📚</span>
                      <span>معرض البطاقات المولدة سابقاً ({mediaGallery.length})</span>
                    </h3>
                    <button
                      onClick={fetchMediaGallery}
                      disabled={isLoadingGallery}
                      className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                    >
                      <span>🔄</span>
                      <span>تحديث</span>
                    </button>
                  </div>

                  {mediaGallery.length === 0 ? (
                    <p className="text-xs text-zinc-500 text-center py-6">
                      لم يتم توليد بطاقات بصرية بعد. اضغط على «توليد الصورة فعلياً» لإنشاء أول بطاقة.
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {mediaGallery.map((asset) => (
                        <div
                          key={asset.id}
                          onClick={() => {
                            if (asset.mediaUrl && asset.metadata) {
                              setGeneratedImage({
                                publicUrl: asset.mediaUrl,
                                width: asset.metadata.width || 1080,
                                height: asset.metadata.height || 1080,
                                sizeBytes: asset.metadata.sizeBytes || 0,
                                format: asset.metadata.format || 'png',
                                theme: (asset.metadata.theme as StudioTheme) || 'emerald-dark',
                                aspectRatio: (asset.metadata.aspectRatio as AspectRatio) || '1:1',
                                durationMs: 250,
                                filename: asset.metadata.filename || 'card.png',
                                title: asset.metadata.title || 'بطاقة بصرية',
                                subtitle: asset.metadata.subtitle,
                              });
                            }
                          }}
                          className="group relative rounded-xl overflow-hidden border border-slate-800 hover:border-emerald-500 cursor-pointer transition-all bg-black/40"
                        >
                          {asset.mediaUrl ? (
                            <div className="aspect-square w-full overflow-hidden">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={asset.mediaUrl}
                                alt="بطاقة مولدة"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                          ) : (
                            <div className="aspect-square flex items-center justify-center text-xs text-zinc-500">
                              صورة
                            </div>
                          )}
                          <div className="p-2 bg-slate-900/90 text-[10px] flex items-center justify-between">
                            <span className="font-mono text-emerald-400">
                              {asset.metadata?.aspectRatio || '1:1'}
                            </span>
                            <span className="text-zinc-500 font-mono">
                              {asset.metadata?.sizeBytes
                                ? `${Math.round(asset.metadata.sizeBytes / 1024)}KB`
                                : ''}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: DRAFTS & SCHEDULED POSTS                           */}
        {/* ======================================================== */}
        {activeTab === 'DRAFTS' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <span>📑</span>
                  <span>إدارة المسودات والمنشورات المجدولة</span>
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                  استعراض البطاقات مع صورها الحقيقية، والتحكم بحالاتها (DRAFT, PENDING_APPROVAL, APPROVED, SCHEDULED, PUBLISHED).
                </p>
              </div>

              <button
                onClick={fetchContent}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-zinc-300 border border-slate-800 flex items-center gap-2 self-start sm:self-auto"
              >
                <span>🔄</span>
                <span>تحديث القائمة</span>
              </button>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                {(['ALL', 'PENDING_APPROVAL', 'APPROVED', 'SCHEDULED', 'PUBLISHED', 'DRAFT'] as const).map(
                  (st) => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                        statusFilter === st
                          ? 'bg-emerald-500 text-black font-bold shadow-md shadow-emerald-500/20'
                          : 'bg-slate-900 text-zinc-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {st === 'ALL'
                        ? 'الكل'
                        : st === 'PENDING_APPROVAL'
                        ? 'قيد المراجعة'
                        : st === 'APPROVED'
                        ? 'معتمد'
                        : st === 'SCHEDULED'
                        ? 'مجدول للنشر'
                        : st === 'PUBLISHED'
                        ? 'تم النشر'
                        : 'مسودة'}
                    </button>
                  )
                )}
              </div>

              <input
                type="text"
                placeholder="بحث في العناوين والموضوعات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-72 rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Content Cards Grid */}
            <div className="grid grid-cols-1 gap-6">
              {filteredContent.length === 0 ? (
                <div className="p-12 text-center rounded-3xl bg-[#090e17] border border-slate-800">
                  <p className="text-sm text-zinc-400">لا توجد محتويات مطابقة للفلتر المحدد.</p>
                </div>
              ) : (
                filteredContent.map((item) => {
                  // Find associated media asset if any
                  const asset = mediaGallery.find((a) => a.contentItemId === item.id);
                  const currentPlatform = selectedDraftPlatform[item.id] || 'INSTAGRAM';
                  const activeVariant = item.platformVariants.find((v) => v.platform === currentPlatform);

                  return (
                    <div
                      key={item.id}
                      className="p-6 rounded-3xl bg-[#090e17] border border-slate-800 hover:border-slate-700/80 transition-all space-y-5"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`px-2.5 py-0.5 rounded text-[11px] font-bold border ${
                              item.status === 'SCHEDULED'
                                ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                                : item.status === 'PUBLISHED'
                                ? 'bg-blue-500/10 text-blue-300 border-blue-500/30'
                                : item.status === 'APPROVED'
                                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                                : item.status === 'REJECTED'
                                ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                                : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                            }`}
                          >
                            {item.status === 'SCHEDULED'
                              ? '⏰ مجدول للنشر'
                              : item.status === 'PUBLISHED'
                              ? '🚀 تم النشر'
                              : item.status === 'APPROVED'
                              ? '✓ معتمد'
                              : item.status === 'REJECTED'
                              ? '✕ مرفوض'
                              : '⏳ قيد المراجعة'}
                          </span>
                          <span className="text-xs text-zinc-500 font-mono">{item.id}</span>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => openInImageStudio(item.title, item.brief)}
                            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all flex items-center gap-1.5"
                          >
                            <span>🎨</span>
                            <span>استوديو الصور</span>
                          </button>

                          {/* Live Real Publishing Button */}
                          <button
                            onClick={() => handleLivePublish(item.id, currentPlatform)}
                            disabled={publishingItemId === item.id}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5 disabled:opacity-50"
                            title={`نشر حقيقي ومباشر على ${currentPlatform}`}
                          >
                            <span>🚀</span>
                            <span>
                              {publishingItemId === item.id
                                ? 'جارٍ النشر...'
                                : `نشر حقيقي (${currentPlatform})`}
                            </span>
                          </button>

                          {item.status !== 'APPROVED' && item.status !== 'SCHEDULED' && (
                            <button
                              onClick={() => handleUpdateStatus(item.id, 'APPROVED')}
                              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-sm"
                            >
                              اعتماد ✓
                            </button>
                          )}

                          {item.status !== 'SCHEDULED' && (
                            <button
                              onClick={() => handleUpdateStatus(item.id, 'SCHEDULED')}
                              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/20 transition-all"
                            >
                              جدولة ⏰
                            </button>
                          )}

                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="px-3 py-1.5 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-all"
                          >
                            حذف
                          </button>
                        </div>
                      </div>

                      {/* Live Publishing Feedback Banner */}
                      {publishFeedback?.id === item.id && (
                        <div
                          className={`p-3.5 rounded-2xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                            publishFeedback.type === 'success'
                              ? 'bg-emerald-500/15 text-emerald-200 border border-emerald-500/40'
                              : 'bg-rose-500/15 text-rose-200 border border-rose-500/40'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span>{publishFeedback.type === 'success' ? '🚀' : '⚠️'}</span>
                            <span className="font-medium leading-relaxed">{publishFeedback.text}</span>
                          </div>
                          {publishFeedback.url && (
                            <a
                              href={publishFeedback.url}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs whitespace-nowrap shadow-sm self-start sm:self-auto"
                            >
                              عرض المنشور ↗
                            </a>
                          )}
                        </div>
                      )}

                      {/* Content Card Body with Image & Variants */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                        {/* Real Image Preview (if generated) */}
                        <div className="md:col-span-3">
                          {asset?.mediaUrl ? (
                            <div className="rounded-2xl overflow-hidden border border-slate-800 aspect-square relative group bg-black/50">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={asset.mediaUrl}
                                alt={item.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2.5">
                                <span className="text-[10px] text-emerald-300 font-mono">
                                  {asset.metadata?.aspectRatio || '1:1'} • {Math.round((asset.metadata?.sizeBytes || 0) / 1024)}KB
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="rounded-2xl border border-dashed border-slate-800 p-6 flex flex-col items-center justify-center text-center gap-2 aspect-square bg-[#03060a]">
                              <span className="text-2xl">🖼️</span>
                              <span className="text-[11px] text-zinc-500">لا توجد صورة مولدة بعد</span>
                              <button
                                onClick={() => openInImageStudio(item.title, item.brief)}
                                className="px-2.5 py-1 rounded-lg text-[10px] bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-slate-800"
                              >
                                توليد صورة الآن
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Title, Brief, Platform Variants (9 cols) */}
                        <div className="md:col-span-9 space-y-4">
                          <div>
                            <h3 className="font-bold text-base text-white">{item.title}</h3>
                            {item.brief && (
                              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{item.brief}</p>
                            )}
                          </div>

                          {/* Platform Variant Switcher */}
                          <div className="space-y-2.5">
                            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                              {(['INSTAGRAM', 'FACEBOOK', 'TIKTOK'] as PlatformType[]).map((p) => (
                                <button
                                  key={p}
                                  onClick={() =>
                                    setSelectedDraftPlatform((prev) => ({ ...prev, [item.id]: p }))
                                  }
                                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                                    currentPlatform === p
                                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                      : 'text-zinc-400 hover:text-white'
                                  }`}
                                >
                                  <span>{p === 'FACEBOOK' ? '📘' : p === 'INSTAGRAM' ? '📸' : '🎵'}</span>
                                  <span>{p}</span>
                                </button>
                              ))}
                            </div>

                            {activeVariant ? (
                              <div className="p-3.5 rounded-2xl bg-[#03060a] border border-slate-800 space-y-2 text-xs">
                                <p className="text-zinc-200 leading-relaxed whitespace-pre-line">
                                  {activeVariant.caption}
                                </p>
                                <div className="flex flex-wrap gap-1 pt-1">
                                  {activeVariant.hashtags.map((tag) => (
                                    <span
                                      key={tag}
                                      className="px-2 py-0.5 rounded bg-slate-900 text-emerald-400 text-[10px] font-mono"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <p className="text-xs text-zinc-500 italic">لا توجد صياغة مخصصة لهذه المنصة.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB: CONNECTED ACCOUNTS & REAL PUBLISHING (M006)          */}
        {/* ======================================================== */}
        {activeTab === 'CONNECTED_ACCOUNTS' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <span>🔗</span>
                  <span>ربط الحسابات والنشر المباشر (Meta Graph API & TikTok Content Posting)</span>
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                  اربط حساباتك الرسمية لنشر المحتوى المولد حقيقياً وبشكل مباشر دون وسطاء، مع فحص فوري للصلاحيات.
                </p>
              </div>

              <button
                onClick={fetchAccounts}
                disabled={isLoadingAccounts}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-zinc-300 border border-slate-800 flex items-center gap-2 self-start sm:self-auto"
              >
                <span>🔄</span>
                <span>{isLoadingAccounts ? 'جارٍ التحقق...' : 'تحديث حالة الحسابات'}</span>
              </button>
            </div>

            {/* Global Alert Message */}
            {accountActionMessage && (
              <div
                className={`p-4 rounded-2xl text-xs flex items-center justify-between gap-3 ${
                  accountActionMessage.type === 'success'
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{accountActionMessage.type === 'success' ? '✓' : '⚠️'}</span>
                  <span className="font-medium leading-relaxed">{accountActionMessage.text}</span>
                </div>
                <button
                  onClick={() => setAccountActionMessage(null)}
                  className="text-zinc-400 hover:text-white px-2"
                >
                  ✕
                </button>
              </div>
            )}

            {/* User Verified Identity Banner */}
            <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-[#0d1527] to-slate-900 border border-slate-800 p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 p-0.5 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <div className="w-full h-full bg-[#090e17] rounded-[14px] flex items-center justify-center text-xl font-bold text-white">
                      MG
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg text-white">محمد غالب العصيمي (M.GH.AL)</h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                        Owner Identity ✓
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      مطور برمجيات ومصمم ومبدع محتوى • الحسابات المسجلة: إنستغرام <span className="text-emerald-400 font-mono">@q_v94</span>، تيك توك <span className="text-cyan-400 font-mono">@m.gh.al.2006</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <a
                    href="https://github.com/mghalaosimi-web"
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl text-xs bg-slate-900 hover:bg-slate-800 text-zinc-300 border border-slate-700/80 flex items-center gap-1.5"
                  >
                    <span>🐙 GitHub</span>
                  </a>
                  <a
                    href="https://www.linkedin.com/in/mohammed-alaosimi-038155443"
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl text-xs bg-slate-900 hover:bg-slate-800 text-zinc-300 border border-slate-700/80 flex items-center gap-1.5"
                  >
                    <span>💼 LinkedIn</span>
                  </a>
                  <a
                    href="https://www.credly.com/users/mohammed-ghaleb-al-aosimi"
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl text-xs bg-slate-900 hover:bg-slate-800 text-zinc-300 border border-slate-700/80 flex items-center gap-1.5"
                  >
                    <span>🎖️ Credly</span>
                  </a>
                </div>
              </div>

              {/* Informational security note explaining Access Token requirement */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 leading-relaxed flex items-start gap-3">
                <span className="text-lg">🔐</span>
                <div>
                  <strong className="block text-amber-100 font-bold mb-1">
                    توضيح أمني هام حول النشر الحقيقي المباشر:
                  </strong>
                  روابط الحسابات العامة (Public URLs) تعرّف النظام على هويتك، ولكن لأسباب أمنية مشددة، تمنع شركات Meta (فيسبوك وإنستغرام) وتيك توك أي نظام برمجي خارجي من النشر التلقائي داخل حسابك بمجرد معرفة رابطه العام دون تصريح رقمي رسمي مشفر (<code className="text-white bg-black/40 px-1 py-0.5 rounded font-mono">Access Token</code>). تم تجهيز معرفات حساباتك تلقائياً أدناه، وبمجرد وضع رمز الوصول والضغط على «فحص الاتصال والربط» سينفذ النشر الحقيقي فوراً!
                </div>
              </div>
            </div>

            {/* Accounts Grid (3 Platforms Strictly) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* FACEBOOK CARD */}
              {(() => {
                const fbStatus = connectedAccounts.find((a) => a.platform === 'FACEBOOK');
                const isConnected = !!fbStatus?.isConnected;

                return (
                  <div className="rounded-3xl bg-[#090e17] border border-slate-800 p-6 space-y-5 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400 text-xl font-bold">
                            📘
                          </div>
                          <div>
                            <h3 className="font-bold text-white text-base">صفحة فيسبوك</h3>
                            <span className="text-[11px] text-blue-400 font-mono">Meta Graph API v21.0</span>
                          </div>
                        </div>

                        <span
                          className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border ${
                            isConnected
                              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                              : 'bg-slate-800 text-zinc-400 border-slate-700'
                          }`}
                        >
                          {isConnected ? 'متصل ✓' : 'غير متصل'}
                        </span>
                      </div>

                      {isConnected && (
                        <div className="p-3 rounded-2xl bg-[#03060a] border border-emerald-500/20 text-xs space-y-1">
                          <div className="flex justify-between text-zinc-400">
                            <span>اسم الصفحة:</span>
                            <strong className="text-emerald-300">{fbStatus.accountName}</strong>
                          </div>
                          <div className="flex justify-between text-zinc-400">
                            <span>معرف الصفحة:</span>
                            <span className="text-zinc-300 font-mono text-[11px]">{fbStatus.accountId}</span>
                          </div>
                          <div className="flex justify-between text-zinc-400">
                            <span>حالة النشر:</span>
                            <span className="text-emerald-400 font-medium">جاهز للنشر الحقيقي</span>
                          </div>
                        </div>
                      )}

                      <div className="space-y-3 text-xs">
                        <div>
                          <label className="block text-zinc-400 text-[11px] mb-1">
                            معرف الصفحة (Facebook Page ID):
                          </label>
                          <input
                            type="text"
                            placeholder="مثال: 104829374619..."
                            value={fbPageId}
                            onChange={(e) => setFbPageId(e.target.value)}
                            className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-zinc-400 text-[11px]">
                              رمز الوصول (Page Access Token):
                            </label>
                            <button
                              type="button"
                              onClick={() => setShowFbToken(!showFbToken)}
                              className="text-[10px] text-zinc-500 hover:text-zinc-300"
                            >
                              {showFbToken ? 'إخفاء 👁️' : 'إظهار 👁️'}
                            </button>
                          </div>
                          <input
                            type={showFbToken ? 'text' : 'password'}
                            placeholder="EAAB..."
                            value={fbToken}
                            onChange={(e) => setFbToken(e.target.value)}
                            className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-[#03060a] border border-slate-800/80 text-[11px] text-zinc-400 space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-zinc-300">💡 تعليمات فيسبوك المباشرة:</p>
                          <a
                            href="https://developers.facebook.com/tools/explorer/"
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-[10px] font-bold flex items-center gap-1"
                          >
                            <span>افتح Meta Explorer ↗</span>
                          </a>
                        </div>
                        <p>1. ادخل واختر صفحتك في <code className="text-blue-300">User or Page</code>.</p>
                        <p>2. أضف صلاحيات: <code className="text-emerald-400">pages_manage_posts</code> و <code className="text-emerald-400">pages_read_engagement</code>.</p>
                        <button
                          type="button"
                          onClick={() => setIsGuideOpen(true)}
                          className="text-emerald-400 hover:text-emerald-300 underline font-medium text-[11px] pt-1 block text-right"
                        >
                          📖 شاهد الشرح المصور خطوة بخطوة في الدليل
                        </button>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-800 flex items-center gap-2">
                      <button
                        onClick={() => handleSaveAccount('FACEBOOK')}
                        disabled={accountActionLoading === 'FACEBOOK'}
                        className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-md shadow-blue-600/20 disabled:opacity-50"
                      >
                        {accountActionLoading === 'FACEBOOK' ? 'جارٍ التحقق...' : 'فحص الاتصال والربط'}
                      </button>
                      {isConnected && (
                        <button
                          onClick={() => handleDisconnectAccount('FACEBOOK')}
                          className="px-3 py-2.5 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 border border-rose-500/20"
                        >
                          إلغاء
                        </button>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* INSTAGRAM CARD */}
              {(() => {
                const igStatus = connectedAccounts.find((a) => a.platform === 'INSTAGRAM');
                const isConnected = !!igStatus?.isConnected;

                return (
                  <div className="rounded-3xl bg-[#090e17] border border-slate-800 p-6 space-y-5 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500/20 via-rose-500/20 to-purple-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 text-xl font-bold">
                            📸
                          </div>
                          <div>
                            <h3 className="font-bold text-white text-base">إنستغرام للأعمال</h3>
                            <span className="text-[11px] text-rose-400 font-mono">Instagram Publishing API</span>
                          </div>
                        </div>

                        <span
                          className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border ${
                            isConnected
                              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                              : 'bg-slate-800 text-zinc-400 border-slate-700'
                          }`}
                        >
                          {isConnected ? 'متصل ✓' : 'غير متصل'}
                        </span>
                      </div>

                      {isConnected && (
                        <div className="p-3 rounded-2xl bg-[#03060a] border border-emerald-500/20 text-xs space-y-1">
                          <div className="flex justify-between text-zinc-400">
                            <span>الحساب:</span>
                            <strong className="text-emerald-300">{igStatus.accountName}</strong>
                          </div>
                          <div className="flex justify-between text-zinc-400">
                            <span>معرف إنستغرام:</span>
                            <span className="text-zinc-300 font-mono text-[11px]">{igStatus.accountId}</span>
                          </div>
                          <div className="flex justify-between text-zinc-400">
                            <span>حالة النشر:</span>
                            <span className="text-emerald-400 font-medium">جاهز للنشر الحقيقي</span>
                          </div>
                        </div>
                      )}

                      <div className="space-y-3 text-xs">
                        <div>
                          <label className="block text-zinc-400 text-[11px] mb-1">
                            معرف حساب إنستغرام (Instagram Account ID):
                          </label>
                          <input
                            type="text"
                            placeholder="مثال: q_v94 أو 178414..."
                            value={igAccountId}
                            onChange={(e) => setIgAccountId(e.target.value)}
                            className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-rose-500"
                          />
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-zinc-400 text-[11px]">
                              رمز الوصول (User/Page Access Token):
                            </label>
                            <button
                              type="button"
                              onClick={() => setShowIgToken(!showIgToken)}
                              className="text-[10px] text-zinc-500 hover:text-zinc-300"
                            >
                              {showIgToken ? 'إخفاء 👁️' : 'إظهار 👁️'}
                            </button>
                          </div>
                          <input
                            type={showIgToken ? 'text' : 'password'}
                            placeholder="EAAB..."
                            value={igToken}
                            onChange={(e) => setIgToken(e.target.value)}
                            className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-rose-500"
                          />
                        </div>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-[#03060a] border border-slate-800/80 text-[11px] text-zinc-400 space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-zinc-300">💡 متطلبات إنستغرام المباشرة:</p>
                          <a
                            href="https://developers.facebook.com/tools/explorer/"
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-[10px] font-bold flex items-center gap-1"
                          >
                            <span>توليد Token ↗</span>
                          </a>
                        </div>
                        <p>1. حساب احترافي (Business أو Creator) مربوط بصفحتك على فيسبوك.</p>
                        <p>2. صلاحية: <code className="text-rose-400">instagram_content_publish</code>.</p>
                        <button
                          type="button"
                          onClick={() => setIsGuideOpen(true)}
                          className="text-rose-400 hover:text-rose-300 underline font-medium text-[11px] pt-1 block text-right"
                        >
                          📖 شاهد الشرح المصور خطوة بخطوة في الدليل
                        </button>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-800 flex items-center gap-2">
                      <button
                        onClick={() => handleSaveAccount('INSTAGRAM')}
                        disabled={accountActionLoading === 'INSTAGRAM'}
                        className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-400 hover:to-purple-500 text-white transition-all shadow-md shadow-rose-600/20 disabled:opacity-50"
                      >
                        {accountActionLoading === 'INSTAGRAM' ? 'جارٍ التحقق...' : 'فحص الاتصال والربط'}
                      </button>
                      {isConnected && (
                        <button
                          onClick={() => handleDisconnectAccount('INSTAGRAM')}
                          className="px-3 py-2.5 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 border border-rose-500/20"
                        >
                          إلغاء
                        </button>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* TIKTOK CARD */}
              {(() => {
                const ttStatus = connectedAccounts.find((a) => a.platform === 'TIKTOK');
                const isConnected = !!ttStatus?.isConnected;

                return (
                  <div className="rounded-3xl bg-[#090e17] border border-slate-800 p-6 space-y-5 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-xl font-bold">
                            🎵
                          </div>
                          <div>
                            <h3 className="font-bold text-white text-base">تيك توك</h3>
                            <span className="text-[11px] text-cyan-400 font-mono">Content Posting API v2</span>
                          </div>
                        </div>

                        <span
                          className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border ${
                            isConnected
                              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                              : 'bg-slate-800 text-zinc-400 border-slate-700'
                          }`}
                        >
                          {isConnected ? 'متصل ✓' : 'غير متصل'}
                        </span>
                      </div>

                      {isConnected && (
                        <div className="p-3 rounded-2xl bg-[#03060a] border border-emerald-500/20 text-xs space-y-1">
                          <div className="flex justify-between text-zinc-400">
                            <span>المنشئ:</span>
                            <strong className="text-emerald-300">{ttStatus.accountName}</strong>
                          </div>
                          <div className="flex justify-between text-zinc-400">
                            <span>المعرف:</span>
                            <span className="text-zinc-300 font-mono text-[11px]">{ttStatus.accountId}</span>
                          </div>
                          <div className="flex justify-between text-zinc-400">
                            <span>حالة النشر:</span>
                            <span className="text-emerald-400 font-medium">جاهز للنشر الحقيقي</span>
                          </div>
                        </div>
                      )}

                      <div className="space-y-3 text-xs">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-zinc-400 text-[11px]">
                              رمز الوصول (TikTok Access Token):
                            </label>
                            <button
                              type="button"
                              onClick={() => setShowTtToken(!showTtToken)}
                              className="text-[10px] text-zinc-500 hover:text-zinc-300"
                            >
                              {showTtToken ? 'إخفاء 👁️' : 'إظهار 👁️'}
                            </button>
                          </div>
                          <input
                            type={showTtToken ? 'text' : 'password'}
                            placeholder="act.example_tiktok_token..."
                            value={ttToken}
                            onChange={(e) => setTtToken(e.target.value)}
                            className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
                          />
                        </div>

                        <div>
                          <label className="block text-zinc-400 text-[11px] mb-1">
                            معرف المنشئ (Open ID - اختياري):
                          </label>
                          <input
                            type="text"
                            placeholder="m.gh.al.2006 أو open_id_..."
                            value={ttCreatorId}
                            onChange={(e) => setTtCreatorId(e.target.value)}
                            className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
                          />
                        </div>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-[#03060a] border border-slate-800/80 text-[11px] text-zinc-400 space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-zinc-300">💡 تعليمات تيك توك المباشرة:</p>
                          <a
                            href="https://developers.tiktok.com/"
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold flex items-center gap-1"
                          >
                            <span>TikTok Developers ↗</span>
                          </a>
                        </div>
                        <p>1. استخرج Token من TikTok for Developers.</p>
                        <p>2. الصلاحيات: <code className="text-cyan-400">video.upload</code> أو <code className="text-cyan-400">video.publish</code>.</p>
                        <button
                          type="button"
                          onClick={() => setIsGuideOpen(true)}
                          className="text-cyan-400 hover:text-cyan-300 underline font-medium text-[11px] pt-1 block text-right"
                        >
                          📖 شاهد الشرح المصور خطوة بخطوة في الدليل
                        </button>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-800 flex items-center gap-2">
                      <button
                        onClick={() => handleSaveAccount('TIKTOK')}
                        disabled={accountActionLoading === 'TIKTOK'}
                        className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-slate-950 transition-all shadow-md shadow-cyan-600/20 disabled:opacity-50"
                      >
                        {accountActionLoading === 'TIKTOK' ? 'جارٍ التحقق...' : 'فحص الاتصال والربط'}
                      </button>
                      {isConnected && (
                        <button
                          onClick={() => handleDisconnectAccount('TIKTOK')}
                          className="px-3 py-2.5 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 border border-rose-500/20"
                        >
                          إلغاء
                        </button>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}


        {/* ======================================================== */}
        {/* TAB 4: AUDIT LOGS                                         */}
        {/* ======================================================== */}
        {activeTab === 'AUDIT_LOGS' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <span>📊</span>
                  <span>سجل العمليات والتدقيق (Audit Log)</span>
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                  سجل غير قابل للتعديل يوثق كافة إجراءات Gemini والأتمتة الذاتية مع بصمة منع التكرار والزمن المستغرق.
                </p>
              </div>

              <button
                onClick={fetchAuditLogs}
                disabled={isLoadingLogs}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-zinc-300 border border-slate-800 flex items-center gap-2"
              >
                <span>🔄</span>
                <span>تحديث السجل</span>
              </button>
            </div>

            <div className="rounded-3xl bg-[#090e17] border border-slate-800 divide-y divide-slate-800/80 overflow-hidden">
              {auditLogs.length === 0 ? (
                <div className="p-8 text-center text-xs text-zinc-500">لا توجد سجلات بعد.</div>
              ) : (
                auditLogs.map((log) => (
                  <div key={log.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                            log.status === 'SUCCESS'
                              ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                              : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {log.status}
                        </span>
                        <strong className="text-white font-mono text-sm">{log.action}</strong>
                        {log.durationMs !== null && (
                          <span className="text-[11px] text-zinc-500 font-mono">({log.durationMs}ms)</span>
                        )}
                      </div>

                      <div className="text-zinc-400 text-[11px] flex items-center gap-2">
                        <span>الكيان: {log.entityType}</span>
                        {log.entityId && <span className="font-mono text-zinc-500">[{log.entityId}]</span>}
                      </div>

                      {log.metadata && (
                        <div className="mt-1 text-[11px] font-mono text-emerald-300/80 truncate max-w-xl">
                          {JSON.stringify(log.metadata)}
                        </div>
                      )}
                    </div>

                    <div className="text-zinc-500 text-[11px] font-mono self-start sm:self-auto whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString('ar-SA')}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 5: SYSTEM HEALTH & ARCHITECTURE                      */}
        {/* ======================================================== */}
        {activeTab === 'SYSTEM_HEALTH' && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <span>🛡️</span>
                <span>حالة البنية التحتية والشفافية (System Architecture)</span>
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                تقرير الشفافية الحقيقية لوسائط التخزين والذكاء الاصطناعي وسياسات المنصات المعتمدة.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Storage Mode Card */}
              <div className="rounded-3xl bg-[#090e17] border border-slate-800 p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-lg">
                    💾
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">التخزين المحلي الدائم</h3>
                    <span className="text-[11px] text-emerald-400 font-mono">Persistent Local Store</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#03060a] border border-slate-800 text-xs space-y-2">
                  <div className="flex justify-between text-zinc-400">
                    <span>الملف النشط:</span>
                    <strong className="text-white font-mono">data/local-store.json</strong>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>المسودات المحفوظة:</span>
                    <strong className="text-white font-mono">{contentList.length}</strong>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>الوسائط المولدة:</span>
                    <strong className="text-white font-mono">{mediaGallery.length}</strong>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>مهام الجدولة:</span>
                    <strong className="text-white font-mono">{scheduledJobs.length}</strong>
                  </div>
                </div>

                <p className="text-[11px] text-zinc-500">
                  كافة التغييرات تُكتب فوراً على القرص وتظل محفوظة حتى بعد إعادة تشغيل الخادم.
                </p>
              </div>

              {/* AI Connection State Card */}
              <div className="rounded-3xl bg-[#090e17] border border-slate-800 p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 text-lg">
                    🧠
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">محرك Gemini والذكاء الاصطناعي</h3>
                    <span className="text-[11px] text-teal-400 font-mono">AI Provider Engine</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#03060a] border border-slate-800 text-xs space-y-2">
                  <div className="flex justify-between text-zinc-400">
                    <span>حالة الاتصال:</span>
                    <strong className="text-white font-mono">{aiStatus}</strong>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>النموذج الفعال:</span>
                    <strong className="text-emerald-400 font-mono text-[11px]">{activeModel}</strong>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>استدعاء الدوال:</span>
                    <strong className="text-cyan-400 font-mono">Function Calling ✓</strong>
                  </div>
                </div>

                <p className="text-[11px] text-zinc-500">
                  {hasValidApiKey
                    ? 'يعمل مباشرة عبر Google Gemini API السحابي ومفتاح معتمد.'
                    : 'يعمل بوضع التنفيذ الذاتي الداخلي لحين ضبط GEMINI_API_KEY في ملف .env.'}
                </p>
              </div>

              {/* Strict Platform Boundaries Card */}
              <div className="rounded-3xl bg-[#090e17] border border-slate-800 p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-lg">
                    🎯
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">حدود المنصات المعتمدة</h3>
                    <span className="text-[11px] text-cyan-400 font-mono">Platform Guardrails</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#03060a] border border-slate-800 text-xs space-y-2">
                  <div className="flex items-center justify-between text-zinc-300">
                    <span>📘 فيسبوك (Facebook)</span>
                    <span className="text-emerald-400 font-bold">معتمد ✓</span>
                  </div>
                  <div className="flex items-center justify-between text-zinc-300">
                    <span>📸 إنستغرام (Instagram)</span>
                    <span className="text-emerald-400 font-bold">معتمد ✓</span>
                  </div>
                  <div className="flex items-center justify-between text-zinc-300">
                    <span>🎵 تيك توك (TikTok)</span>
                    <span className="text-emerald-400 font-bold">معتمد ✓</span>
                  </div>
                  <div className="flex items-center justify-between text-zinc-500">
                    <span>🚫 واتساب (WhatsApp)</span>
                    <span className="text-rose-400 font-bold">مستبعد قطعياً ✕</span>
                  </div>
                </div>

                <p className="text-[11px] text-zinc-500">
                  يمنع النظام برمجياً وعلى مستوى Zod Schema إضافة أي منصة غير المنصات الثلاث المعتمدة.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#070b12] py-6 text-center text-xs text-zinc-500">
        <p>M.GH.AL Content Studio • نظام الأتمتة وصناعة المحتوى بالذكاء الاصطناعي • 2026</p>
      </footer>

      {/* Interactive Quickstart Onboarding & Developer Links Guide Modal */}
      <OnboardingGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </div>
  );
}
