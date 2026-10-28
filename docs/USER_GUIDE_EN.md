# Official Visual User Guide — M.GH.AL Content Studio
### Operational & Visual Guide for AI Content Automation, RTL Media Studio & Direct Publishing

---

## 📌 Table of Contents
1. [Overview & Architecture Principles](#overview)
2. [Visual Walkthrough (20 Real Production Screenshots)](#visual-walkthrough)
   - [01. Main Dashboard & Commander Overview](#01-main-dashboard--commander-overview)
   - [02. Gemini Autonomous Commander Chat](#02-gemini-autonomous-commander-chat)
   - [03. Autonomous Self-Scheduler Agreement Card](#03-autonomous-self-scheduler-agreement-card)
   - [04. Arabic RTL Image Studio (M004) Workspace](#04-arabic-rtl-image-studio-m004-workspace)
   - [05. Typography, Aspect Ratio & Theme Customizer](#05-typography-aspect-ratio--theme-customizer)
   - [06. Rendered Media Gallery & Disk Storage](#06-rendered-media-gallery--disk-storage)
   - [07. Content Library, Drafts & Publishing Queue](#07-content-library-drafts--publishing-queue)
   - [08. Facebook Variant Preview (Narrative & Engagement Hook)](#08-facebook-variant-preview)
   - [09. Instagram Variant Preview (Aesthetic & Discovery Hashtags)](#09-instagram-variant-preview)
   - [10. TikTok Variant Preview (Fast 3-Second Hook Video Script)](#10-tiktok-variant-preview)
   - [11. Connected Accounts & Direct Publishing Hub](#11-connected-accounts--direct-publishing-hub)
   - [12. Facebook Page Meta Graph API Integration](#12-facebook-page-meta-graph-api-integration)
   - [13. Instagram Professional / Business Integration](#13-instagram-professional--business-integration)
   - [14. TikTok Content Posting API Integration](#14-tiktok-content-posting-api-integration)
   - [15. Audit Logs & Forensic Action Trace](#15-audit-logs--forensic-action-trace)
   - [16. System Health, Storage Mode & Security Verification](#16-system-health-storage-mode--security-verification)
   - [17. Quickstart Guide: Facebook Meta Explorer Walkthrough](#17-quickstart-guide-facebook-meta-explorer)
   - [18. Quickstart Guide: Instagram Business Setup](#18-quickstart-guide-instagram-business-setup)
   - [19. Quickstart Guide: TikTok Developer Setup](#19-quickstart-guide-tiktok-developer-setup)
   - [20. Quickstart Guide: Google Gemini API Key Setup](#20-quickstart-guide-google-gemini-api-key-setup)
3. [Production Content Generation Prompts](#production-content-generation-prompts)
4. [Security Best Practices & Zero-WhatsApp Policy](#security-best-practices)

---

## Overview

**M.GH.AL Content Studio** (`mghal-content-os`) is a personal, end-to-end automation operating system engineered to produce, customize, design, schedule, and publish high-engagement Arabic social media content directly to official platform endpoints.

### Key Capabilities
- **Google Gemini 2.5 Flash:** High-grade Arabic NLP adapter tailored for conversational social hooks and platform formatting.
- **RTL Image Studio:** Server-side Sharp & SVG vector rendering for clean Arabic typography on high-resolution canvas cards (1080x1080, 1080x1350, 1080x1920).
- **Multi-Platform Publishing Engine:** Official Meta Graph API v21.0 (Facebook Pages & Instagram Professional) and TikTok Content Posting API v2 integrations.
- **Autonomous Commander:** Self-scheduling bot with natural language agreements and idempotency-locked publishing queue.
- **Strict Privacy & Safety:** Zero-WhatsApp architecture, masked credentials, and audited database operations.

---

## Visual Walkthrough

### 01. Main Dashboard & Commander Overview
![Main Dashboard Overview](./images/01-dashboard-overview.png)

- **Purpose:** Central command center displaying live Gemini connection status, autonomous scheduler status, and navigation across the 6 core modules.
- **What You See:**
  - Modern, dark glassmorphism navigation header with the brand identifier.
  - Active indicator badge: `LIVE_GEMINI` (indicating direct cloud connection to Google AI).
  - Quick action to open the interactive Quickstart Onboarding Guide.
  - Left card: Active Auto-Pilot Agreement (time, approval policy, platform toggles).
  - Right card: Gemini Executive Commander conversational chat interface.
- **How to Use:**
  1. Verify the AI engine status badge in the top-left corner.
  2. Switch tabs via the top navigation bar to access the Image Studio, Drafts, Accounts, Logs, or System Health.

---

### 02. Gemini Autonomous Commander Chat
![Gemini Autonomous Commander Chat](./images/02-commander-chat-view.png)

- **Purpose:** Conversational management interface allowing natural Arabic commands to establish publishing agreements, generate content batches, or trigger immediate runs.
- **What You See:**
  - Dedicated chat log between the Owner and Gemini Commander.
  - Quick-action prompt chips: *"Daily 9 PM Publishing + First Post"* and *"Instant Post Generation with Card"*.
  - Natural language input bar supporting plain Arabic speech and formal phrasing.
- **How to Use:**
  1. Type your instruction, e.g.: *"Let's schedule a daily post at 9 PM on personal growth"*.
  2. Gemini Commander parses the agreement, configures the schedule engine, and queues drafts.

---

### 03. Autonomous Self-Scheduler Agreement Card
![Autonomous Self-Scheduler Agreement Card](./images/03-autonomous-scheduler-card.png)

- **Purpose:** Real-time visibility and manual override controls for the autonomous publishing cron.
- **What You See:**
  - Agreement title, scheduled daily time (`21:00 Asia/Aden`), and approval policy (`Strict Review` / `Auto Approve`).
  - Allowed platforms (Facebook, Instagram, TikTok).
  - Next scheduled execution timestamp and last successful cycle run.
  - One-click trigger button: `Run Autonomous Cycle Now (تشغيل دورة Gemini الذاتية الآن)`.
- **How to Use:** Click the trigger button anytime you want to force an immediate content generation and card rendering cycle.

---

### 04. Arabic RTL Image Studio (M004) Workspace
![Arabic RTL Image Studio Workspace](./images/04-image-studio-canvas.png)

- **Purpose:** High-resolution card generator for Arabic quotes, announcements, and visual hooks.
- **What You See:**
  - Live interactive preview area showing how the card will look when saved to disk.
  - Primary Arabic text input (Headline/Quote) with auto-wrapping geometry.
  - Secondary Arabic text input (Complementary thought / Subtitle).
  - Quick draft importer dropdown to load existing drafts directly.
- **How to Use:**
  1. Choose a draft or write your custom quote.
  2. Inspect the live RTL typography rendering.

---

### 05. Typography, Aspect Ratio & Theme Customizer
![Typography, Aspect Ratio & Theme Customizer](./images/05-image-studio-controls.png)

- **Purpose:** Dimension and visual theme styling controls.
- **What You See:**
  - Standard aspect ratio buttons:
    - **Square (1:1):** 1080×1080 px for Instagram & Facebook feeds.
    - **Portrait (4:5):** 1080×1350 px for maximum feed visibility.
    - **Vertical (9:16):** 1080×1920 px for TikTok, Reels, and Stories.
  - Curated themes: `emerald-dark`, `royal-gold`, `minimal-slate`, and `midnight-teal`.
  - Brand watermark field (`M.GH.AL STUDIO`).
  - Action button: `Render & Save PNG to Disk`.
- **How to Use:** Select desired aspect ratio, pick theme, and hit render. The asset is generated via Sharp and saved to `/public/generated/images/`.

---

### 06. Rendered Media Gallery & Disk Storage
![Rendered Media Gallery](./images/06-image-studio-rendered.png)

- **Purpose:** Physical asset gallery displaying all rendered PNG files stored on disk.
- **What You See:**
  - Grid showing previously rendered cards with real file sizes (e.g. 93KB - 137KB) and aspect ratio badges.
  - Download options and direct asset references.
- **How to Use:** Click on any generated card to download or link it to a draft.

---

### 07. Content Library, Drafts & Publishing Queue
![Content Library & Drafts](./images/07-drafts-library.png)

- **Purpose:** Comprehensive content management system for drafts, approved items, and scheduled posts.
- **What You See:**
  - Status filter pills: `All`, `Draft`, `Reviewed`, `Approved`, `Scheduled`, `Published`.
  - Search bar filtering by title and topic.
  - Item cards with associated visual card thumbnail, platform variant switcher, and action buttons (`Approve`, `Schedule`, `Live Publish`, `Delete`).
- **How to Use:** Review pending drafts, switch between platform versions, approve, or publish immediately.

---

### 08. Facebook Variant Preview
![Facebook Variant Preview](./images/08-content-variant-facebook.png)

- **Purpose:** Evaluates Facebook-optimized copy tailored for conversation and engagement.
- **What You See:**
  - Narrative storytelling structure.
  - Explicit discussion hook encouraging user comments.
  - Minimal, high-relevance hashtags.

---

### 09. Instagram Variant Preview
![Instagram Variant Preview](./images/09-content-variant-instagram.png)

- **Purpose:** Evaluates Instagram-optimized visual caption.
- **What You See:**
  - Inspiring tone with clean spacing.
  - Direct call-to-action to save the post (`Save this post as your daily reminder`).
  - Curated hashtag cluster for discoverability.

---

### 10. TikTok Variant Preview
![TikTok Variant Preview](./images/10-content-variant-tiktok.png)

- **Purpose:** Evaluates TikTok vertical video short script.
- **What You See:**
  - 3-second hook to prevent scrolling.
  - Concise 15-30 second spoken script.
  - Visual stage directions (camera angles, gestures, pacing).
  - Background sound/audio suggestion.

---

### 11. Connected Accounts & Direct Publishing Hub
![Connected Accounts Hub](./images/11-connected-accounts-overview.png)

- **Purpose:** Account connection and credential validation dashboard.
- **What You See:**
  - Verified owner identity badge (M.GH.AL) with social links.
  - Transparent security policy explanation regarding OAuth tokens.
  - Connection cards for Facebook Page, Instagram Business, and TikTok.
  - Global refresh button to test live platform health.

---

### 12. Facebook Page Meta Graph API Integration
![Facebook Page Meta Graph API Integration](./images/12-meta-facebook-connection.png)

- **Purpose:** Direct connection to official Facebook Page via Meta Graph API v21.0.
- **What You See:**
  - Facebook Page ID input.
  - Masked Page Access Token field with show/hide toggle.
  - Required permission flags: `pages_manage_posts`, `pages_read_engagement`.
  - Direct link to Meta Graph API Explorer.
  - `Verify & Connect` action button.

---

### 13. Instagram Professional / Business Integration
![Instagram Business Integration](./images/13-meta-instagram-connection.png)

- **Purpose:** Connects Instagram Creator or Business account linked to Facebook Page.
- **What You See:**
  - Instagram Account ID input.
  - Masked User/Page Access Token.
  - Required permission: `instagram_content_publish`.
  - Step-by-step verification instructions.

---

### 14. TikTok Content Posting API Integration
![TikTok Content Posting API Integration](./images/14-tiktok-connection.png)

- **Purpose:** Official TikTok Content Posting API v2 connection for automated video publishing.
- **What You See:**
  - TikTok Access Token input.
  - Creator Open ID input.
  - Required scopes: `video.publish`, `video.upload`.
  - Direct button to TikTok Developer Portal.

---

### 15. Audit Logs & Forensic Action Trace
![Audit Logs Table](./images/15-audit-logs-view.png)

- **Purpose:** Chronological, audited event log recording every action executed by user or AI agent.
- **What You See:**
  - Timestamped entries with action types (`MEDIA_RENDER`, `CONTENT_GENERATE`, `AUTONOMOUS_SCHEDULE`).
  - Duration recorded in milliseconds.
  - Execution outcome (`SUCCESS` or `FAILED`).
  - JSON metadata inspector.

---

### 16. System Health, Storage Mode & Security Verification
![System Health Dashboard](./images/16-system-health.png)

- **Purpose:** Real-time environment and infrastructure status monitor.
- **What You See:**
  - AI Engine health (Gemini 2.5 Flash active model).
  - Database status (PostgreSQL via Prisma or resilient local JSON fallback).
  - Environment schema validation via Zod.
  - Zero-WhatsApp enforcement confirmation.

---

### 17. Quickstart Guide: Facebook Meta Explorer
![Quickstart Guide Facebook Meta Explorer](./images/17-onboarding-meta-guide.png)

- **Purpose:** Modal guide providing step-by-step instructions for obtaining Meta credentials in under 2 minutes.
- **What You See:** Direct links to Graph API Explorer, permission checkboxes, and token generation steps.

---

### 18. Quickstart Guide: Instagram Business Setup
![Quickstart Guide Instagram Business](./images/18-onboarding-instagram-guide.png)

- **Purpose:** Explains prerequisites for publishing to Instagram via Graph API (converting account to Professional and linking to Facebook Page).

---

### 19. Quickstart Guide: TikTok Developer Setup
![Quickstart Guide TikTok Developer](./images/19-onboarding-tiktok-guide.png)

- **Purpose:** Walkthrough of TikTok for Developers portal registration and Content Posting API activation.

---

### 20. Quickstart Guide: Google Gemini API Key Setup
![Quickstart Guide Google Gemini API](./images/20-onboarding-gemini-guide.png)

- **Purpose:** Walkthrough for creating a free API key at Google AI Studio and adding it to `.env`.

---

## Production Content Generation Prompts

You can paste these structured prompts directly into **Gemini Commander** for instant multi-platform packages:

### Prompt 1: Practical Growth & Entrepreneurship
```text
Task: Generate a multi-platform content bundle on "The Power of Quiet Daily Consistency".
Target Audience: Arab entrepreneurs, software engineers, and digital creators.
Tone: Inspiring, grounded, actionable, zero fluff.
Target Platforms:
  - Facebook: Engaging story starting with a relatable obstacle and ending with an open question.
  - Instagram: Punchy, visual caption with a bookmark CTA and 8 specific hashtags.
  - TikTok: 15-second fast hook script starting with a gesture and text overlay suggestion.
Constraints: No WhatsApp references. Include a concise headline suitable for the Image Studio.
Expected Output: Full multi-platform variants ready for one-click approval.
```

### Prompt 2: Technical Knowledge & Modern AI
```text
Task: Explain "Prompt Engineering Best Practices" for non-technical professionals.
Target Audience: Knowledge workers and students adopting generative AI.
Tone: Educational, crystal clear, practical.
Target Platforms:
  - Facebook: Comparison table concept ("Vague Prompt" vs "Engineered Prompt").
  - Instagram: 3 golden rules formatted for a swipeable carousel or image card.
  - TikTok: Hook: "Why your AI outputs are mediocre — fix it in 3 steps."
Constraints: Modern Standard Arabic, professional terminology.
Expected Output: Formatted variants ready for review.
```

---

## Security Best Practices

1. **Zero WhatsApp Integration:** The codebase strictly rejects WhatsApp at the schema, type, and API layers to prevent unauthorized automation.
2. **Encrypted Credentials:** Platform credentials are encrypted or stored locally in `.env` and never pushed to Git.
3. **Strict Human Review:** The default approval policy requires explicit human confirmation before any content is published to live accounts.
