# M.GH.AL Content Studio
> **Autonomous Arabic AI Content Automation & Visual Publishing System**
>
> An end-to-end personal Content Operating System engineered to research, generate, adapt, design, schedule, and publish high-impact Arabic social content directly to official platform endpoints.

[![Next.js](https://img.shields.io/badge/Next.js-16.4.3-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Google Gemini](https://img.shields.io/badge/Gemini-2.5_Flash-orange?logo=google)](https://ai.google.dev/)
[![Prisma](https://img.shields.io/badge/Prisma-7.10.1-2D3748?logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Tests-46_Passed-success?logo=vitest)](https://vitest.dev/)

---

## 📖 Languages & Documentation
- [English Documentation (README)](#overview)
- [📖 Full Visual User Guide (Arabic) — دليل الاستخدام المصور الشامل بالعربية](./docs/USER_GUIDE_AR.md)
- [📖 Full Visual User Guide (English)](./docs/USER_GUIDE_EN.md)
- [Architecture Blueprint — وثيقة المعمارية الرئيسية](./docs/PROJECT_MASTER_BLUEPRINT.md)

---

## Overview

High-engagement Arabic content creators and brand owners face severe fragmentation across daily workflows:
1. Brainstorming ideas and formatting Arabic copy for distinct platforms requires hours of manual rewrites.
2. Designing social media cards requires switching to external graphic suites (Photoshop, Canva, Illustrator).
3. Scheduling and publishing requires manual copy-pasting across disparate platform dashboards.

**M.GH.AL Content Studio** solves this by unifying the entire lifecycle within a single, autonomous, privacy-first platform:
- **Natural Language Executive Commander:** Powered by **Google Gemini 2.5 Flash** with native Function Calling. Agree on daily publishing schedules and topics through plain Arabic conversation.
- **RTL Image Studio:** Built-in programmatic rendering engine using **Sharp** and mathematical **SVG vectors** for clean, pixel-perfect Arabic typography with custom themes and zero external dependencies.
- **Multi-Platform Content Engine:** Generates three tailored variants from a single core idea (Facebook narrative, Instagram aesthetic + hashtags, TikTok 3-second hook script).
- **Direct Official Publishing:** Integrates with official **Meta Graph API v21.0** (Facebook Pages and Instagram Professional accounts) and **TikTok Content Posting API v2**.
- **Auditability & Safety:** Persistent chronological audit logs, masked credentials, and strict zero-WhatsApp architecture.

---

## Visual Tour

### 1. Command Center & Gemini Autonomous Agent
![Command Center](./docs/user-guide/images/01-dashboard-overview.png)
*Executive dashboard displaying live Gemini cloud status, automated publishing agreement, and interactive commander chat.*

### 2. Arabic RTL Image Studio (Programmatic Typography)
![Arabic Image Studio](./docs/user-guide/images/04-image-studio-canvas.png)
*Real-time Arabic vector rendering engine supporting 1:1, 4:5, and 9:16 aspect ratios with curated luxury color themes.*

### 3. Multi-Platform Variants & Content Library
![Content Library & Drafts](./docs/user-guide/images/07-drafts-library.png)
*Central repository organizing drafts, review cycles, and tailored variants with direct one-click live publishing.*

### 4. Official Accounts Integration Hub
![Connected Accounts Hub](./docs/user-guide/images/11-connected-accounts-overview.png)
*Secure credentials hub for Meta Graph API (Facebook Page & Instagram) and TikTok Content Posting API with instant token verification.*

---

## Real Implemented Features

| Module | Real Status | Verification Evidence |
| :--- | :--- | :--- |
| **Gemini AI Engine** | Production-Ready | `@google/genai` adapter with prompt engineering for Arabic social formats and local fallback mode. |
| **Autonomous Commander** | Production-Ready | Natural language agreement negotiation, function calling, and automated schedule engine. |
| **Arabic Image Studio** | Production-Ready | Server-side Sharp & SVG generator producing physical 1080px PNG cards directly to disk. |
| **Content Management** | Production-Ready | Complete Draft/Review/Approval lifecycle with search, filtering, and platform previewers. |
| **Meta Graph API (Facebook)** | Production-Ready | Meta Graph API v21.0 integration for live page verification and direct photo/feed publishing. |
| **Instagram Publishing** | Production-Ready | Professional/Business API integration for image container and carousel/feed posting. |
| **TikTok Content Posting** | Production-Ready | TikTok Content Posting API v2 integration for video and creator open ID workflows. |
| **Audit Logs** | Production-Ready | Chronological event logs with millisecond execution timings and structured metadata. |
| **WhatsApp Exclusion** | Strictly Enforced | Architectural block forbidding WhatsApp endpoints, schemas, or status generation. |

---

## System Requirements
- **Node.js:** `v20.x` or `v24.x` (LTS recommended)
- **Package Manager:** `pnpm` (v12+ recommended)
- **Database:** PostgreSQL 15+ / 16+ (or Docker), with automatic resilient local JSON fallback
- **Browsers Supported:** Modern Chrome, Edge, Firefox, Safari

---

## Quickstart Guide

### 1. Clone the Repository
```bash
git clone https://github.com/mghalaosimi-web/mghal-content-os.git
cd mghal-content-os
```

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Configure Environment Variables
Copy the secure template file:
```bash
cp .env.example .env
```
Open `.env` and configure your credentials:
```env
# Server
PORT=3000
NODE_ENV="development"

# AI Engine (Google Gemini API)
GEMINI_API_KEY="AIzaSy..."
GEMINI_MODEL="gemini-2.5-flash"

# Database (PostgreSQL) - Optional: local fallback is active if omitted
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mghal_content_os?schema=public"

# Meta Graph API (Facebook & Instagram)
# FACEBOOK_PAGE_ID="your_page_id"
# FACEBOOK_PAGE_ACCESS_TOKEN="EAAB..."
# INSTAGRAM_ACCOUNT_ID="your_instagram_account_id"
# INSTAGRAM_ACCESS_TOKEN="EAAB..."

# TikTok Content Posting API
# TIKTOK_ACCESS_TOKEN="act..."
# TIKTOK_CREATOR_ID="your_creator_id"
```

> **Note:** If `GEMINI_API_KEY` is not provided, the system seamlessly uses its high-fidelity internal fallback generator so you can test all features offline without interruption.

### 4. (Optional) Run Local Database with Docker
If you want to use PostgreSQL locally:
```bash
docker compose up -d
pnpm run prisma:generate
```

### 5. Start the Development Server
```bash
pnpm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Verification & Commands

| Command | Description |
| :--- | :--- |
| `pnpm test` | Run full test suite with Vitest (46 tests passing across 10 suites) |
| `pnpm run typecheck` | Perform strict TypeScript type checking (`tsc --noEmit`) |
| `pnpm run lint` | Run ESLint 9 code quality checks |
| `pnpm run build` | Compile optimized Next.js production build |
| `pnpm run dev` | Launch local Turbopack development server |

---

## End-to-End Workflow

```mermaid
graph TD
    A["👤 User / Owner"] -->|"Arabic Command"| B["⚡ Gemini Commander"]
    B -->|"Autonomous Scheduling"| C["📅 Scheduler Engine"]
    C -->|"Generate Content Package"| D["🤖 Gemini 2.5 Flash Engine"]
    D --> E1["📘 Facebook Variant (Narrative & Discussion)"]
    D --> E2["📸 Instagram Variant (Aesthetic & Discovery)"]
    D --> E3["🎵 TikTok Script (3s Hook & Visual Cue)"]
    D --> F["🎨 RTL Image Studio (Sharp / SVG Vector)"]
    F --> G["💾 Physical PNG Rendered on Disk"]
    E1 & E2 & E3 & G --> H["📑 Drafts & Review Library"]
    H -->|"Human Approval"| I{"Approve or Edit?"}
    I -->|"Approved"| J["🚀 Publishing Engine"]
    J --> K1["Facebook Page via Meta Graph API"]
    J --> K2["Instagram via Content Publishing API"]
    J --> K3["TikTok via Content Posting API"]
    J --> L["📊 Immutable Audit Log Recorded"]
```

---

## Architecture & Directory Map

```
mghal-content-os/
├── docs/                             # Documentation & user manuals
│   ├── user-guide/images/            # 20 real production screenshots
│   ├── USER_GUIDE_AR.md              # Comprehensive Arabic visual guide
│   ├── USER_GUIDE_EN.md              # Comprehensive English visual guide
│   ├── PROJECT_MASTER_BLUEPRINT.md   # Architectural blueprint
│   └── PROJECT_STATUS.md             # Execution milestones log
├── prisma/
│   └── schema.prisma                 # Database schema (Content, Variants, Media, Audit)
├── public/
│   └── generated/images/             # Physical rendered PNG cards
├── scripts/
│   └── capture-user-guide.mjs        # Production screenshot automation script
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── agent/                # Gemini chat and scheduling endpoints
│   │   │   ├── content/              # Generation and draft CRUD routes
│   │   │   ├── media/                # High-res image rendering endpoint
│   │   │   ├── platforms/            # Account connections and verification
│   │   │   └── publishing/           # Direct live publishing route
│   │   ├── layout.tsx                # App root layout with Cairo typography
│   │   └── page.tsx                  # Single-page multi-tab operational dashboard
│   ├── components/
│   │   └── OnboardingGuideModal.tsx  # Step-by-step interactive setup modal
│   ├── lib/
│   │   ├── ai/                       # Gemini adapter, schema, and fallback engine
│   │   ├── config/                   # Zod environment validation
│   │   └── db/                       # Prisma client wrapper
│   └── modules/
│       ├── agent/                    # Commander and autonomous scheduler
│       ├── content/                  # Business logic and resilient local store
│       ├── media/                    # Sharp & SVG Arabic RTL card renderer
│       └── publishing/               # Facebook, Instagram & TikTok publishers
└── tests/                            # 10 test suites covering all modules
```

---

## Security & Privacy Guarantees

1. **Zero WhatsApp Integration:** The system strictly rejects WhatsApp integration at the database, code, and routing levels. No private messaging channels are exposed or automated.
2. **Local Credential Seclusion:** All OAuth access tokens, page IDs, and API secrets are stored solely on your machine in `.env` or encrypted local stores. They are never transmitted to external analytics.
3. **Idempotency Protection:** The autonomous publishing queue incorporates deterministic hash locks to prevent duplicate postings of the same content item.
4. **Strict Approval Default:** Posts require manual human review by default before live publication, unless the owner explicitly enables `AUTO_APPROVE` in the scheduler agreement.

---

## Troubleshooting & FAQ

<details>
<summary><strong>Q: What happens if I don't provide a Gemini API Key?</strong></summary>

The system features an automatic fallback engine (`local-generator.ts`). It generates high-quality structured Arabic variants with authentic social hooks, media suggestions, and hashtags without making external API calls.
</details>

<details>
<summary><strong>Q: How do I obtain a Facebook Page Access Token?</strong></summary>

Click on the **دليل البدء والربط السريع** button in the top navigation header. Select the **Facebook & Meta** tab for direct links to the Meta Graph API Explorer and copy-paste permission requirements (`pages_manage_posts`, `pages_read_engagement`).
</details>

<details>
<summary><strong>Q: Can I use this without Docker or PostgreSQL?</strong></summary>

Yes. If PostgreSQL is offline, the system seamlessly activates its built-in `LocalJsonStorage` engine (`data/local-store.json`), allowing drafts, rendered cards, and accounts to persist safely across restarts.
</details>

---

## Roadmap

- [x] **M001:** Foundation, PostgreSQL / Prisma Schema, Strict Environment Validation.
- [x] **M002:** Google Gemini AI Engine Adapter & Social Prompt Engineering.
- [x] **M003:** Arabic RTL Content Studio Dashboard & Draft Management.
- [x] **M004:** Programmatic Arabic Image Studio (Sharp / SVG Vector Renderer).
- [x] **M005:** Multi-Platform Publishing Engine (Meta Graph API & TikTok API).
- [x] **M006:** Autonomous Commander & Self-Scheduler with Natural Language Agreements.
- [ ] **M007:** Automated FFmpeg Video Reel Assembly & Arabic Subtitle Burn-in.
- [ ] **M008:** Advanced Historical Audience Analytics & Engagement Metrics.

---

## License

This project is privately owned and engineered by **M.GH.AL**. All rights reserved.
Refer to [LICENSE](./LICENSE) if distributed.
