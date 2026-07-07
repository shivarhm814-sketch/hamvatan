# Handoff: وب‌سایت مجموعه اسماعیلی (املاک + خدمات اداری و ثبتی)

> A Persian (RTL) marketing + services website for "مجموعه اسماعیلی" — real-estate listings and administrative/registry (title-deed) services. Audience: ordinary Iranian users concerned about legitimacy and legal safety, so the design is trust-first, professional, and simple.

---

## Overview
Seven-page RTL website:
1. **Home** (صفحه اصلی) — most important page; conveys the full business value in the first 5 seconds.
2. **Listings** (آگهی‌های ملکی) — filterable property grid.
3. **Property Detail** (جزئیات آگهی) — gallery, specs, sticky contact box.
4. **Free Document Review** (بررسی رایگان مدارک) — lead-gen form + success state with tracking code.
5. **Case Tracking** (پیگیری پرونده) — enter tracking code → status badge + vertical timeline.
6. **Contact** (تماس با ما).
7. **About** (درباره ما).

Two selectable **visual directions** re-theme the entire site at runtime (see "Visual Directions").

## About the Design Files
The file in this bundle (`اسماعیلی.dc.html`) is a **design reference created in HTML** — a working prototype that shows the intended look, layout, copy, and behavior. It is **not production code to copy directly**. It is authored as a "Design Component" (a custom streaming-template runtime) and is not representative of a normal app stack.

**Your task:** recreate these designs in the target codebase's existing environment (React, Vue, Next.js, etc.) using its established patterns, component library, and conventions. If no codebase exists yet, choose an appropriate stack — **Next.js + React + Tailwind CSS** is a good default for this project (marketing site, RTL, SEO-relevant). Wire real data/endpoints where the prototype uses in-memory sample data.

## Fidelity
**High-fidelity (hifi).** Final colors, typography, spacing, radii, and interactions are specified below and should be recreated faithfully. Only the imagery is placeholder (striped boxes with monospace captions) — replace with real photos/renders.

---

## Global Requirements
- **RTL**: `dir="rtl"` on `<html>`. All layout, icons flow right-to-left. Logo on the RIGHT, nav after it, login button on the LEFT.
- **Mobile-first & responsive** with NO media queries in the prototype — it uses fluid techniques you should preserve or convert to your framework's responsive utilities:
  - `clamp()` for font sizes and section padding.
  - CSS grid `repeat(auto-fit/auto-fill, minmax(Xpx, 1fr))` for all card grids (naturally 3→2→1 columns).
  - `flex-wrap` for button rows.
  - A JS `matchMedia('(max-width: 880px)')` listener toggles desktop nav ↔ hamburger drawer.
- **Accessibility**: body text ≥16px, WCAG AA contrast. Touch targets ≥44px.
- **Phone-first conversion**: phone number + WhatsApp button must be reachable on every page (header shows phone; footer + CTAs repeat it).
- **Trust cues**: green check seals, registry/document icons, explicit "بررسی رایگان" (free review) wording.
- **Fonts**: Body **Vazirmatn** (weights 300–900); also used for headings. Load from Google Fonts.
- **Icons**: **Phosphor Icons** web font (`@phosphor-icons/web`), regular + fill variants. WhatsApp uses `ph-whatsapp-logo`.
- **Persian digits**: all numbers (prices, area, phone, dates, tracking codes) render in Persian numerals (۰۱۲۳۴۵۶۷۸۹). Provide a `toFa()` helper: replace each ASCII digit with the Persian equivalent.

---

## Visual Direction — «معتمد» (single theme)
One visual direction: **«معتمد»** — trusted, classic; cool, structured, sans-serif. Implement the values below as CSS custom properties on the root wrapper (a theme object / provider). Every element references them via `var(--token, fallback)`.

| token | value |
|---|---|
| `--primary` | `#1A5276` |
| `--secondary` | `#D4AC0D` |
| `--bg` | `#F5F7F9` |
| `--surface` | `#FFFFFF` |
| `--ink` | `#2C3E50` |
| `--muted` | `#6B7A88` |
| `--line` | `#E3E8EC` |
| `--radius` | `12px` |
| heading font | `'Vazirmatn', sans-serif` |
| placeholder stripes | `#e6ebef` / `#eef3f6` |
| hero bg | `#12405E` (dark solid) |
| soft (tint) | `#EAF1F6` |
| shadow | `0 18px 40px -26px rgba(26,82,118,.45)` |

Headings use the heading font (`--heading`, here Vazirmatn); Markazi Text is not needed. (An earlier draft had a second «گرم» warm/serif direction with a runtime switch — that has been removed; there is now only this single theme.)

---

## Screens / Views

### 1. Header (all pages)
- Sticky, `rgba(255,255,255,.9)` + `backdrop-filter: blur(12px)`, bottom border `--line`. Max-width 1200px, padding 12px 20px, flex row, gap 18px.
- **Logo (right):** 46×46 rounded (13px) square in `--primary`, white `ph-house-line` fill icon with a small `--secondary` `ph-seal-check` overlaid bottom-left. Next to it: "اسماعیلی" (heading font, 800, 21px, `--primary`) over "املاک و خدمات ثبتی" (11px, `--muted`).
- **Desktop nav** (>880px): links خانه / آگهی‌های ملکی / بررسی رایگان مدارک / پیگیری پرونده / درباره ما / تماس. 600 weight, 15px, `--ink`; hover → `--primary`. Active item shows a 3px `--secondary` underline pill at bottom.
- **Right cluster:** phone chip (`ph-phone-call` + number, `--soft` bg, `--primary`, LTR number) + "ورود" ghost button (1.5px `--primary` border; hover fills `--primary`).
- **Mobile** (≤880px): phone icon button + hamburger (`ph-list`, `--primary` bg). Hamburger toggles a full-width drawer with the same nav links (14px 12px padding rows, hover `--soft`) and a filled "ورود / ثبت‌نام" button.

### 2. Home (صفحه اصلی)
Order of sections:
1. **Hero** — `--hero` (#12405E) bg, white text, 2-col grid (`minmax(300px,1fr)` auto-fit). Left: pill badge "بررسی اولیه مدارک، کاملاً رایگان" (translucent, `ph-seal-check` in `--secondary`); H1 "از خانه رویایی تا سند رسمی، / **در کنار شما هستیم**" (heading, 800, `clamp(30px,5vw,52px)`, second line `--secondary`); subhead 19px `rgba(255,255,255,.82)`; two CTAs: white "مشاهده آگهی‌های ملکی" (`ph-buildings`) + `--secondary` "بررسی اولیه رایگان مدارک" (`ph-file-magnifying-glass`, dark text `#3a2f00`, glow shadow); phone link "تماس مستقیم: {number}" (number in `--secondary`). Right: 4/3 placeholder box "HERO IMAGE · ویلا / نمای شهری".
2. **Two service groups** — 2-col auto-fit. Each is a clickable card (`--surface`, 1px `--line`, `--radius`, shadow, hover `translateY(-5px)`): 64px rounded icon tile (`--soft` bg, `--primary` icon) + H3 (24px) + 2-line desc + "→" link in `--secondary`.
   - Card 1: **گروه املاک** (`ph-buildings`) → Listings. Desc: "خرید و فروش خانه ویلایی، زمین، مغازه و آپارتمان با مشاوره تخصصی و آگهی‌های راستی‌آزمایی‌شده."
   - Card 2: **گروه خدمات اداری** (`ph-stamp`) → Review. Desc: "اخذ سند تک‌برگ، تبدیل سند قدیمی، نقشه‌برداری و تفکیک ملک؛ پیگیری کامل امور ثبتی تا صدور سند."
3. **Advantages** — `--soft` band, 3-col auto-fit. Each: white card, 48px green seal tile (`rgba(30,142,90,.12)` / `#1E8E5A` `ph-seal-check`), H4 + desc. Items: (a) "بررسی اولیه رایگان مدارک" — "پیش از هر اقدامی، مدارک شما را بدون هیچ هزینه‌ای بررسی می‌کنیم." (b) "ارزیابی کارشناسی پیش از شروع" — "زمان، هزینه و مسیر قانونی پرونده را شفاف به شما اعلام می‌کنیم." (c) "پیگیری صفر تا صد امور" — "تمام مراحل اداری و ثبتی را تا صدور سند نهایی خودمان پیگیری می‌کنیم."
4. **Featured listings** — section header (6px×26px `--secondary` accent bar + H2 `--primary` + subhead) with an outline "مشاهده همه آگهی‌ها" button. Grid `auto-fill minmax(290px,1fr)` of the first 4 property cards (see Property Card component).
5. **Admin services** — white band (top/bottom `--line` borders). Accent-bar header. 4-col auto-fit of service tiles: 54px `--soft` icon tile + H4 + desc. Then a `--secondary` "درخواست بررسی رایگان مدارک" button. (Services list in Design Tokens > Data.)
6. **Final CTA** — `--primary` bg, centered, white. `ph-scroll` in `--secondary`, H2 "زمین بدون سند داری و نمی‌دونی از کجا شروع کنی؟", subhead, then gold "همین الان با ما مشورت کن" (`ph-chats-circle`) + green `#25D366` WhatsApp button (`ph-whatsapp-logo`).

### 3. Listings (آگهی‌های ملکی)
- Accent-bar H1 + result count ("{N} ملک مطابق فیلتر شما", Persian digit).
- **Filter bar:** white card, `auto-fit minmax(180px,1fr)`, align-end. Controls: نوع ملک `<select>` (همه انواع / ویلایی / زمین / مغازه / آپارتمان), نوع معامله `<select>` (خرید و اجاره / فروش / اجاره), شهر `<input>` (placeholder "مثلاً نوشهر"), and "اعمال فیلتر" primary button (`ph-funnel`, height 47px). Inputs: `--bg` bg, 1px `--line`, 10px radius, focus → `--primary` border.
- **Grid:** `auto-fill minmax(290px,1fr)` of ALL matching property cards. Filtering: type exact match, deal exact match, city substring-includes; all optional (empty = no constraint). Filter applies on button click (copy draft state → applied state).
- **Empty state:** centered `ph-magnifying-glass` + "ملکی با این مشخصات پیدا نشد. فیلترها را تغییر دهید."
- **Pagination:** centered row — prev caret, page buttons ۱ (active `--primary`) / ۲ / ۳, next caret. (Prototype pagination is visual only; wire to real paging.)

### 4. Property Detail (جزئیات آگهی)
- "→ بازگشت به آگهی‌ها" back link.
- 2-col grid (`minmax(300px,1fr)` auto-fit), align-start:
  - **Left:** 16:10 main gallery placeholder ("GALLERY IMAGE {n}") with deal badge top-right; row of 4 thumbnail buttons (`grid 4×`, 4:3), selected thumb has 2px `--primary`/`--secondary` border, others transparent — clicking sets active gallery index. Then H1 (title), location line (`ph-map-pin` city · district), a 3-up spec grid (نوع ملک / متراژ / وضعیت سند — each a bordered white tile with muted label + bold value), "توضیحات ملک" H3 + description paragraph (line-height 2.1).
  - **Right (sticky, `top:90px`):** white card — "قیمت" label + big price (30px `--primary`) + unit; "تماس با مشاور" (`--primary`, `ph-phone-call`, `tel:`); "پیام واتساپ" (`#25D366`, `wa.me`); "ارسال پیام" ghost → Contact; footer note `ph-shield-check` "مشخصات این ملک راستی‌آزمایی شده است."

### 5. Free Document Review (بررسی رایگان مدارک) — priority page #2
- Centered, max-width 820px. **Pending state:** green pill "کاملاً رایگان و بدون تعهد" (`ph-gift`), H1 "بررسی اولیه رایگان مدارک", explanatory subhead. Form card:
  - **شماره موبایل** (required `tel`, large 18px, placeholder "۰۹۱۲۳۴۵۶۷۸۹").
  - **نوع خدمت** `<select>`: اخذ سند تک‌برگ / تبدیل سند قدیمی به تک‌برگ / نقشه‌برداری و اخذ کد SSBR / تفکیک و صورت‌مجلس تفکیکی / مشاوره خرید یا فروش ملک / سایر موارد.
  - **توضیحات** optional textarea.
  - **آپلود مدارک** optional dashed dropzone (`ph-upload-simple`, "فرمت‌های مجاز: JPG، PNG، PDF — حداکثر ۱۰ مگابایت").
  - Submit: gold "ارسال درخواست بررسی" (`ph-paper-plane-tilt`).
- **Success state** (after submit): green `ph-check-circle` seal, H1 "درخواست شما ثبت شد", note "کارشناسان ما در کمتر از ۲۴ ساعت کاری با شما تماس می‌گیرند…", a dashed tracking-code chip `ES-۱۴۰۴-XXXX` (generated), then "پیگیری پرونده" + "بازگشت به خانه" buttons. Generate code as `ES-` + `toFa('1404')` + `-` + `toFa(4-digit random)`.

### 6. Case Tracking (پیگیری پرونده)
- Centered max-width 760px. Icon tile + H1 "پیگیری وضعیت پرونده" + hint "کد نمونه: ES-۱۴۰۴-۲۲۳۱".
- Search form: code `<input>` (centered, letter-spacing) + "جستجو" primary button (`ph-magnifying-glass`). Empty submit → red inline error "لطفاً کد رهگیری را وارد کنید.".
- **Result** (any non-empty code in prototype → sample case): white card. Header row = code + case name ("پرونده اخذ سند تک‌برگ") on the right, status badge on the left (`#F39C12` bg, white, `ph-spinner-gap`, "در حال پیگیری اداری"). Below: **vertical timeline** — each stage = 34px status dot (done: `#1E8E5A` `ph-check`; current: `#F39C12` `ph-dots-three`; pending: `#EDF1F4`/`#9AA6B0` `ph-circle`) with a connecting 2px line, + label (colored by state) + date. Stages: ثبت اولیه درخواست (۱۴۰۴/۰۲/۰۵, done) → بررسی و تأیید مدارک (۱۴۰۴/۰۲/۰۹, done) → ارزیابی کارشناسی پرونده (۱۴۰۴/۰۲/۱۴, done) → پیگیری اداری و ثبتی (در جریان, current) → صدور و تحویل سند (—, pending).

### 7. Contact (تماس با ما)
- Accent-bar H1 + subhead. 2-col grid (`minmax(300px,1fr)`), align-start:
  - **Info column:** tel card (`ph-phone-call`, LTR number), WhatsApp card (`ph-whatsapp-logo`, green icon tile, mobile number), working hours card (`ph-clock`, "شنبه تا پنجشنبه، ۹ تا ۱۹"), address card (`ph-map-pin`, sample address). Each a white bordered card, hover `translateY(-3px)`.
  - **Form column:** نام و نام خانوادگی / شماره موبایل / پیام, submit "ارسال پیام" (`ph-paper-plane-tilt`). On submit → success card (green `ph-check-circle`, "پیام شما ارسال شد").

### 8. About (درباره ما)
- Accent-bar H1. 2-col grid: 4:5 portrait placeholder ("PORTRAIT · فرهاد اسماعیلی", `ph-user-circle`) + text: two paragraphs introducing the company and manager **فرهاد اسماعیلی**, plus a highlighted callout (`--soft` bg, right 4px `--secondary` border) "تمایز اصلی ما" about the free initial review. Then "خدمات ما" H3 + a grid of the 4 services as icon+label chips.

### Footer (all pages)
- `#0e2c3f` bg, `rgba(255,255,255,.78)` text. 3-col auto-fit: brand (gold logo tile + name + blurb) / quick links (buttons → Listings, Review, Tracking, About; hover `--secondary`) / contact (tel, WhatsApp, address). Bottom bar: "© ۱۴۰۴ مجموعه اسماعیلی — تمام حقوق محفوظ است." centered.

### Login modal
- Triggered by "ورود". Overlay `rgba(15,30,44,.55)` + blur, centered card (max-width 400px, 20px radius). Close X top-left. Icon tile + "ورود / ثبت‌نام" + "با شماره موبایل خود وارد شوید". Phone input + "دریافت کد تأیید" button. On submit → success ("کد تأیید برای شماره‌ی شما ارسال شد" + "(نسخه‌ی نمایشی)"). Click-outside closes; click-inside stops propagation.

---

## Property Card (shared component)
Used on Home (4) and Listings (all). Clickable → opens Detail.
- `--surface` bg, 1px `--line`, `--radius`, hidden overflow, shadow; hover `translateY(-5px)` + stronger shadow (transition 0.2s).
- **Image area:** 16:11, diagonal striped placeholder (`--ph1`/`--ph2`, 45deg, 12px bands), centered monospace "PROPERTY PHOTO". Top-right deal badge (فروش = `#1E8E5A`, اجاره = `#2563A8`, white text, pill). Top-left "تک‌برگ" badge (only if deed OK): white pill, `#1E8E5A` text, `ph-seal-check`.
- **Body (18px pad):** title (heading, 700, 18px, `--ink`); meta row (`ph-map-pin` city, `ph-ruler` area, `ph-house` type — 13.5px `--muted`, flex-wrap); dashed top border; price (heading, 800, 20–21px, `--primary`) + unit, and on Listings a "جزئیات →" link in `--secondary`.

---

## Interactions & Behavior
- **Navigation:** SPA-style page switch via state (`page` ∈ home/listings/detail/review/tracking/contact/about). On navigate: close menu + login, `window.scrollTo(0,0)`. In a real app use the router (Next.js routes / React Router) with real URLs for SEO.
- **Mobile menu:** `matchMedia('(max-width:880px)')` → `isMobile`; hamburger toggles drawer.
- **Filter (Listings):** draft state (`fType/fDeal/fCity`) committed to applied state on "اعمال فیلتر"; grid recomputes; empty → empty state.
- **Detail gallery:** thumbnail click sets active index (updates main caption + selected border).
- **Review form:** submit → generate tracking code → success state. "→ Review" nav resets to pending state.
- **Contact form:** submit → success state. "→ Contact" nav resets to pending.
- **Tracking:** submit empty → error; non-empty → sample result (replace with real lookup).
- **Login:** open/close/submit demo states.
- **Transitions:** page content fades in via `esFade` keyframe (opacity 0→1, translateY 10px→0, ~0.4s). Card/button hovers use `transform` + `box-shadow`, 0.2s ease. Keep animations light (weak-connection audience).

## State Management
Prototype uses a single component's local state. In your app, split sensibly:
- Global/UI: `page` (→ routing), `isMobile`, `menuOpen`, `loginOpen/loginSent`.
- Listings: `fType/fDeal/fCity` (draft) + `appliedType/appliedDeal/appliedCity`.
- Detail: `detail` (selected property), `gallery` (active image index).
- Review: `reviewCode`. Contact: `contactSent`. Tracking: `trackCode`, `trackState` (idle/empty/found).
- **Data fetching (real app):** properties list + filters, property detail, review submission (returns tracking code), tracking lookup by code, contact submission, OTP login. All are in-memory samples in the prototype.

## Design Tokens
**Colors:** see the «معتمد» token table above. Fixed (non-theme) colors: deal-sale `#1E8E5A`, deal-rent `#2563A8`, success/seal `#1E8E5A` (tint `rgba(30,142,90,.12)`), current/warning `#F39C12`, error `#C0392B`, WhatsApp `#25D366` (text `#083b1d`), gold-on-dark text `#3a2f00`, footer bg `#0e2c3f`.
**Radius:** 12px (`--radius`); pills 100px; icon tiles 13–18px; inputs 10–12px.
**Typography:** Vazirmatn 300–900 (used for both body and headings). Sizes via `clamp()` — H1 `clamp(26–38px…52–72px)`, H2 `clamp(24px,3.4vw,34px)`, body 15–17px, small 11–14px. Line-height 1.7 base, 1.9–2.2 for paragraphs. Body ≥16px.
**Spacing:** section padding `clamp(44–48px, 6–7vw, 72–84px)`; container max-width 1200px, pad 20px; grid gaps 16–26px.
**Shadows:** `--shadow` = `0 18px 40px -26px rgba(26,82,118,.45)`; hover cards `0 28px 55px -30px rgba(0,0,0,.42)`.
**Data — services (4):** {اخذ سند تک‌برگ برای هر نوع ملک · `ph-certificate`}, {تبدیل سند قدیمی به تک‌برگ · `ph-arrows-clockwise`}, {نقشه‌برداری و اخذ کد SSBR · `ph-map-trifold`}, {تفکیک و صورت‌مجلس تفکیکی · `ph-squares-four`}. **Sample properties (6):** ویلای مدرن دوبلکس (نوشهر، فروش، ۳۲۰م، تک‌برگ، ۸٫۵ میلیارد) · زمین مسکونی (لاهیجان، فروش، ۴۵۰م، قولنامه‌ای، ۲٫۹ میلیارد) · مغازه تجاری (رشت/گلسار، فروش، ۴۸م، تک‌برگ، ۶٫۲ میلیارد) · آپارتمان نوساز (ساری، فروش، ۱۴۵م، تک‌برگ، ۴٫۱ میلیارد) · باغ‌ویلای محصور (چالوس، فروش، ۸۰۰م، قولنامه‌ای، ۵٫۵ میلیارد) · آپارتمان ساحلی (بابلسر، اجاره، ۹۵م، تک‌برگ، ودیعه ۴۰۰م/ماهی ۱۵م). Full titles/descriptions are in the HTML source `baseProps()`.

## Contact placeholders (replace with real values)
- Phone (tel): `۰۱۱-۴۴۵۵۶۶۷۷` → `tel:+981144556677`
- WhatsApp / mobile: `۰۹۱۱ ۱۲۳ ۴۵۶۷` → `https://wa.me/989111234567`
- Address: "مازندران، نوشهر، خیابان امام، نبش کوچه‌ی هفتم، دفتر مجموعه اسماعیلی"
- Manager: **فرهاد اسماعیلی**
- Working hours: شنبه تا پنجشنبه، ۹ تا ۱۹

## Assets
- **No real images** — all imagery is placeholder (diagonal-striped boxes with monospace captions like "PROPERTY PHOTO", "HERO IMAGE", "GALLERY IMAGE", "PORTRAIT"). Replace with real property photos, a hero shot, and a manager portrait.
- **Icons:** Phosphor Icons web font (`@phosphor-icons/web@2.1.1`), regular + fill.
- **Fonts:** Google Fonts — Vazirmatn.

## Screenshots (`screens/`)
Reference captures (top-of-page / viewport, not full-length):
- `01-home-a.png` — Home hero (dark split hero).
- `02-listings.png` — Listings page with filter bar + card grid.
- `03-detail.png` — Property detail (sticky contact box + gallery).
- `04-review.png` — Free document-review request form.
- `05-tracking.png` — Case tracking, result state (status badge + timeline start).
- `06-contact.png` — Contact page (form + info cards).
- `07-about.png` — About page.

(An earlier `08-home-b.png` showed a second warm direction that has since been removed.)

## Files
- `اسماعیلی.dc.html` — the full design reference (all 7 pages, both directions, header/footer/modal). It is a "Design Component": markup + a `class Component` logic block. Read `baseProps()`, `services()`, `advantages()`, `trackData()`, and `renderVals()` for exact data, copy, and handler logic; read the template for exact inline styles per element.
