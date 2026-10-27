import type { ContentStatus, PlatformType } from '@/types';

export type ApprovalPolicy = 'REQUIRE_APPROVAL' | 'AUTO_PUBLISH';
export type AIConnectionStatus = 'LIVE_GEMINI' | 'AWAITING_GEMINI_KEY';
export type ScheduledJobStatus = 'PENDING_APPROVAL' | 'SCHEDULED' | 'PUBLISHED' | 'FAILED' | 'CANCELLED';

export interface AutomationRule {
  id: string;
  name: string;
  isEnabled: boolean;
  cronOrTimes: string[]; // e.g. ["21:00"] or ["10:00", "20:00"]
  timezone: string; // default "Asia/Aden"
  topicsPool: string[]; // pool of agreed topics
  targetPlatforms: PlatformType[]; // strictly 'FACEBOOK' | 'INSTAGRAM' | 'TIKTOK'
  approvalPolicy: ApprovalPolicy;
  lastRunAt: string | null;
  nextRunAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduledPublishJob {
  id: string;
  contentItemId: string;
  platform: PlatformType;
  scheduledTime: string;
  status: ScheduledJobStatus;
  idempotencyKey: string; // hash(contentItemId + platform + scheduledTime)
  executedAt: string | null;
  ruleId: string | null;
  createdAt: string;
}

export interface AgentAction {
  action: string;
  params: Record<string, unknown>;
  result: Record<string, unknown>;
  success: boolean;
  message: string;
}

export interface AgentChatResponse {
  success: boolean;
  reply: string;
  executedActions: AgentAction[];
  aiStatus: AIConnectionStatus;
  activeModel: string;
}

export interface AgentAutonomousRunResult {
  rule: AutomationRule;
  contentItem: {
    id: string;
    title: string;
    topic: string;
    status: ContentStatus;
  };
  mediaAsset: {
    id: string;
    publicUrl: string;
    width: number;
    height: number;
    sizeBytes: number;
  };
  scheduledJobs: ScheduledPublishJob[];
  idempotencyKeys: string[];
  durationMs: number;
}
