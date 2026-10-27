# M.GH.AL — AI Content Automation System
### نظام أتمتة المحتوى بالذكاء الاصطناعي (`mghal-content-os`)

نظام ذكي متكامل مصمم لإدارة وإنتاج المحتوى العربي بالذكاء الاصطناعي، وتجهيز الصور والفيديوهات، ومراجعتها وجدولتها ونشرها تلقائياً على منصات التواصل الاجتماعي الرسمية (Facebook، Instagram، TikTok).

---

## 🚀 التقنيات المستخدمة
- **الإطار والخادم:** [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **لغة البرمجة:** [TypeScript](https://www.typescriptlang.org/) (Strict Mode)
- **قاعدة البيانات:** PostgreSQL 16
- **ORM:** [Prisma ORM 7](https://www.prisma.io/) مع `@prisma/adapter-pg`
- **التحقق من البيانات:** [Zod](https://zod.dev/)
- **التصميم:** Tailwind CSS v4
- **مدير الحزم:** `pnpm`
- **الاختبارات:** [Vitest](https://vitest.dev/)
- **فحص الكود:** ESLint 9

---

## 📁 هيكلية المشروع
```
mghal-content-os/
├── prisma/
│   └── schema.prisma         # مخطط قاعدة البيانات (ContentItem, Variant, Media, Audit)
├── prisma.config.ts          # إعدادات Prisma 7 للاتصال والترحيل
├── src/
│   ├── app/                  # صفحات ومسارات Next.js App Router
│   ├── lib/
│   │   ├── config/           # التحقق من متغيرات البيئة بواسطة Zod
│   │   ├── db/               # عميل Prisma Client الموحد
│   │   └── validation/       # مخططات التحقق للنماذج وقواعد الأعمال
│   ├── modules/
│   │   └── content/          # خدمات ومنطق أعمال المحتوى
│   └── types/                # واجهات وأنواع البيانات العامة
├── tests/                    # اختبارات الوحدة والتكامل
├── docs/                     # وثائق المشروع الرسمية وسجلات الحالة
├── docker-compose.yml        # تشغيل حاوية PostgreSQL محلية
└── .env.example              # نموذج متغيرات البيئة الآمن
```

---

## 🛠️ متطلبات التشغيل
- **Node.js:** v20+ أو v24+
- **pnpm:** v12+
- **PostgreSQL:** v15+ أو v16+ (أو Docker)

---

## ⚙️ طريقة التثبيت والتشغيل

### 1. تثبيت الحزم
```bash
pnpm install
```

### 2. إعداد متغيرات البيئة
انسخ ملف `.env.example` إلى `.env`:
```bash
cp .env.example .env
```

### 3. إعداد وتشغيل قاعدة البيانات (PostgreSQL)
يمكنك تشغيل قاعدة بيانات محلية عبر Docker بسهولة:
```bash
docker compose up -d
```
أو ربط أي قاعدة بيانات PostgreSQL خارجية بتعديل المتغير `DATABASE_URL` في ملف `.env`.

### 4. التحقق وتوليد عميل Prisma
```bash
# فحص والتحقق من صحة المخطط
pnpm run prisma:validate

# توليد أنواع عميل Prisma
pnpm run prisma:generate

# عند توفر اتصال حي بقاعدة البيانات، قم بتطبيق الترحيل:
pnpm exec prisma migrate dev --name init
```

---

## 🧪 تشغيل الفحوصات والاختبارات

| الأمر | الوظيفة |
| :--- | :--- |
| `pnpm test` | تشغيل اختبارات Vitest (18 اختبار ناجح) |
| `pnpm run typecheck` | التحقق من صحة الأنواع في TypeScript بوضع strict |
| `pnpm run lint` | تشغيل مدقق الأكواد ESLint |
| `pnpm run build` | بناء حزمة الإنتاج لـ Next.js |
| `pnpm run dev` | تشغيل بيئة التطوير المحلية |

---

## 🔒 ضوابط الأمان والحدود
1. **استبعاد واتساب:** منصة واتساب (WhatsApp) وحالاتها مستبعدة نهائياً من نطاق المشروع برمجياً ومخططاً.
2. **عزل الأسرار:** لا يتم رفع أو حفظ أي مفاتيح API أو كلمات مرور أو رموز OAuth في الكود المصدري أو Git.
3. **التكاملات الرسمية:** التعامل حصرياً مع واجهات المنصات المعتمدة (Facebook, Instagram, TikTok).
4. **المسار المرحلي:** الانتقال بين المهام يتم بصرامة بعد التحقق والاختبار الفعلي لكل مرحلة.
