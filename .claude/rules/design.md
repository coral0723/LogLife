# LogLife Design — Meta 기반 어댑테이션

> Meta DESIGN.md를 베이스로 LogLife에 맞게 조정한 디자인 룰.
> 새 컴포넌트를 만들 때 이 파일을 읽고 동일한 톤을 유지한다.

## LogLife 색상 재정의

Meta의 {colors.primary}(#0064E0) 대신 LogLife 브랜드 블루 사용:
- primary: #2cc2f7 (hover: #1aade0)

버튼 체계: Meta의 두 단계(마케팅 black / 구매 cobalt) 대신 LogLife는 단일 primary blue:
- variant="primary" → bg-[#2cc2f7] text-white (hover: bg-[#1aade0])
- variant="cancel"  → border border-zinc-200 bg-white text-zinc-600 (hover: bg-zinc-50)
- variant="danger"  → bg-red-500 text-white (hover: bg-red-600) — 탈퇴·삭제 등 파괴적 액션 전용
- disabled          → bg-zinc-300 text-white cursor-not-allowed (variant 무관)
- 모든 버튼은 rounded-full (Meta 컨벤션 동일)

## LogLife 컬러 팔레트 (현재 사용 중)

- 브랜드 블루: #2cc2f7
- 캔버스: #ffffff
- surface-soft: zinc-50 / zinc-100
- ink-deep: zinc-900
- ink: zinc-800
- 보조 텍스트: zinc-400
- hairline: zinc-100 / zinc-200

---
(이하 Meta DESIGN.md 전문)

---
version: alpha
name: Meta-design-analysis
description: Meta's design system spans hardware commerce (Quest VR, Ray-Ban Meta AI glasses) and brand surfaces with a confident product-merchandising voice. The system pairs a stark white canvas with full-bleed photographic product cards, a confident Optimistic VF wordmark/headline face, dual-CTA hero patterns (black primary + outlined secondary), and a saturated cobalt blue (#0064E0) for in-product purchase actions. Pill-shaped 100px-radius buttons, generous 24-32px card rounding, and tight three-tier text hierarchy carry across homepage, product detail (PDP), buy-now configurator, and accessory subpages.

colors:
  primary: "#0064e0"
  primary-deep: "#0457cb"
  primary-soft: "#0091ff"
  on-primary: "#ffffff"
  ink-button: "#000000"
  on-ink-button: "#ffffff"
  fb-blue: "#1876f2"
  meta-link: "#385898"
  oculus-purple: "#a121ce"
  success: "#31a24c"
  success-bg: "#24e400"
  attention: "#f2a918"
  warning: "#f7b928"
  warning-bg: "#ffe200"
  critical: "#e41e3f"
  critical-strong: "#f0284a"
  canvas: "#ffffff"
  surface-soft: "#f1f4f7"
  ink-deep: "#0a1317"
  ink: "#1c1e21"
  charcoal: "#444950"
  slate: "#4b4c4f"
  steel: "#5d6c7b"
  stone: "#8595a4"
  hairline: "#ced0d4"
  hairline-soft: "#dee3e9"
  disabled-text: "#bcc0c4"

typography:
  hero-display:
    fontFamily: Optimistic VF
    fontSize: 64px
    fontWeight: 500
    lineHeight: 1.16
    fontFeature: "ss01, ss02"
  display-lg:
    fontFamily: Optimistic VF
    fontSize: 48px
    fontWeight: 500
    lineHeight: 1.17
    fontFeature: "ss01, ss02"
  heading-lg:
    fontFamily: Optimistic VF
    fontSize: 36px
    fontWeight: 500
    lineHeight: 1.28
    fontFeature: "ss01, ss02"
  heading-md:
    fontFamily: Optimistic VF
    fontSize: 28px
    fontWeight: 300
    lineHeight: 1.21
    fontFeature: "ss01, ss02"
  heading-sm:
    fontFamily: Optimistic VF
    fontSize: 24px
    fontWeight: 500
    lineHeight: 1.25
  subtitle-lg:
    fontFamily: Optimistic VF
    fontSize: 18px
    fontWeight: 700
    lineHeight: 1.44
  subtitle-md:
    fontFamily: Optimistic VF
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.44
  body-md-bold:
    fontFamily: Optimistic VF
    fontSize: 16px
    fontWeight: 700
    lineHeight: 1.50
    letterSpacing: -0.16px
  body-md:
    fontFamily: Optimistic VF
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.50
    letterSpacing: -0.16px
  body-sm-bold:
    fontFamily: Optimistic VF
    fontSize: 14px
    fontWeight: 700
    lineHeight: 1.43
    letterSpacing: -0.14px
  body-sm:
    fontFamily: Optimistic VF
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.43
    letterSpacing: -0.14px
  caption-bold:
    fontFamily: Optimistic VF
    fontSize: 12px
    fontWeight: 700
    lineHeight: 1.33
  caption:
    fontFamily: Optimistic VF
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.33
  button-md:
    fontFamily: Optimistic VF
    fontSize: 14px
    fontWeight: 700
    lineHeight: 1.43
    letterSpacing: -0.14px
  link-md:
    fontFamily: Optimistic VF
    fontSize: 16px
    fontWeight: 700
    lineHeight: 1.50
    letterSpacing: -0.16px

rounded:
  xs: 2px
  sm: 4px
  md: 6px
  lg: 8px
  xl: 16px
  xxl: 24px
  xxxl: 32px
  feature: 40px
  full: 100px
  circle: 9999px

spacing:
  xxs: 4px
  xs: 8px
  sm: 10px
  md: 12px
  base: 16px
  lg: 20px
  xl: 24px
  xxl: 32px
  xxxl: 40px
  section-sm: 48px
  section: 64px
  section-lg: 80px
  hero: 120px

components:
  button-primary:
    backgroundColor: "{colors.ink-button}"
    textColor: "{colors.on-ink-button}"
    typography: "{typography.button-md}"
    rounded: "{rounded.full}"
    padding: "14px 30px"
  button-primary-pressed:
    backgroundColor: "{colors.charcoal}"
    textColor: "{colors.on-ink-button}"
  button-primary-disabled:
    backgroundColor: "{colors.disabled-text}"
    textColor: "{colors.canvas}"
  button-buy-cta:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button-md}"
    rounded: "{rounded.full}"
    padding: "14px 30px"
  button-buy-cta-pressed:
    backgroundColor: "{colors.primary-deep}"
    textColor: "{colors.on-primary}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink-deep}"
    typography: "{typography.button-md}"
    rounded: "{rounded.full}"
    padding: "12px 28px"
    border: "2px solid {colors.ink-deep}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink-deep}"
    typography: "{typography.button-md}"
    rounded: "{rounded.full}"
    padding: "10px 22px"
    border: "2px solid rgba(10, 19, 23, 0.12)"
  button-pill-tab:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-sm-bold}"
    rounded: "{rounded.full}"
    padding: "8px 16px"
    border: "1px solid {colors.hairline}"
  button-pill-tab-active:
    backgroundColor: "{colors.ink-deep}"
    textColor: "{colors.canvas}"
  button-icon-circular:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    rounded: "{rounded.circle}"
    size: 40px
  card-product-feature:
    backgroundColor: "{colors.canvas}"
    rounded: "{rounded.xxxl}"
    padding: "{spacing.xxl}"
    border: "1px solid {colors.hairline-soft}"
  card-feature-photo:
    backgroundColor: "{colors.canvas}"
    rounded: "{rounded.xxxl}"
    padding: "0"
    border: "none"
  card-promo-strip:
    backgroundColor: "{colors.ink-deep}"
    textColor: "{colors.canvas}"
    rounded: "{rounded.xxxl}"
    padding: "{spacing.section}"
  card-icon-feature:
    backgroundColor: "{colors.canvas}"
    rounded: "{rounded.xl}"
    padding: "{spacing.xl}"
  card-checkout-summary:
    backgroundColor: "{colors.canvas}"
    rounded: "{rounded.xl}"
    padding: "{spacing.xl}"
    border: "1px solid {colors.hairline-soft}"
    shadow: "rgba(20, 22, 26, 0.3) 0px 1px 4px 0px"
  product-thumbnail:
    backgroundColor: "{colors.surface-soft}"
    rounded: "{rounded.xl}"
    padding: "{spacing.base}"
    aspect-ratio: "1 / 1"
  text-input:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
    border: "1px solid {colors.hairline}"
    height: 44px
  text-input-focused:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    border: "2px solid {colors.fb-blue}"
  text-input-error:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    border: "1px solid {colors.critical-strong}"
  search-pill:
    backgroundColor: "{colors.surface-soft}"
    textColor: "{colors.steel}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.full}"
    padding: "{spacing.md} {spacing.lg}"
    height: 40px
  radio-option:
    backgroundColor: "{colors.canvas}"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
    border: "1px solid rgba(10, 19, 23, 0.12)"
  radio-option-selected:
    backgroundColor: "{colors.canvas}"
    rounded: "{rounded.lg}"
    border: "2px solid #0143b5"
  color-swatch-circle:
    rounded: "{rounded.circle}"
    size: 32px
    border: "2px solid {colors.canvas}"
  badge-promo-yellow:
    backgroundColor: "{colors.warning}"
    textColor: "{colors.ink-deep}"
    typography: "{typography.caption-bold}"
    rounded: "{rounded.full}"
    padding: "4px 10px"
  badge-attention:
    backgroundColor: "{colors.attention}"
    textColor: "{colors.canvas}"
    typography: "{typography.caption-bold}"
    rounded: "{rounded.full}"
    padding: "4px 10px"
  badge-success:
    backgroundColor: "{colors.success}"
    textColor: "{colors.canvas}"
    typography: "{typography.caption-bold}"
    rounded: "{rounded.full}"
    padding: "4px 10px"
  badge-critical:
    backgroundColor: "{colors.critical}"
    textColor: "{colors.canvas}"
    typography: "{typography.caption-bold}"
    rounded: "{rounded.full}"
    padding: "4px 10px"
  promo-banner:
    backgroundColor: "{colors.ink-deep}"
    textColor: "{colors.canvas}"
    typography: "{typography.body-sm-bold}"
    padding: "{spacing.md} {spacing.xl}"
  faq-accordion-item:
    backgroundColor: "{colors.canvas}"
    rounded: "{rounded.xl}"
    padding: "{spacing.xl}"
    border: "1px solid {colors.hairline-soft}"
  why-buy-tile:
    backgroundColor: "{colors.canvas}"
    rounded: "{rounded.xl}"
    padding: "{spacing.xxl} {spacing.xl}"
    border: "1px solid {colors.hairline-soft}"
  warranty-card:
    backgroundColor: "{colors.surface-soft}"
    rounded: "{rounded.xxl}"
    padding: "{spacing.xxl}"
  footer-region:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.steel}"
    typography: "{typography.body-sm}"
    padding: "{spacing.section} {spacing.xxl}"
    border: "1px solid {colors.hairline-soft}"
  hero-band-marketing:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.canvas}"
    typography: "{typography.hero-display}"
    rounded: "{rounded.xxxl}"
    padding: "{spacing.section-lg}"
  product-gallery-pdp:
    backgroundColor: "{colors.canvas}"
    rounded: "{rounded.xxxl}"
    padding: "{spacing.base}"
  color-sku-picker-row:
    backgroundColor: "{colors.surface-soft}"
    rounded: "{rounded.lg}"
    padding: "{spacing.base}"
  feature-icon-row:
    backgroundColor: "{colors.canvas}"
    rounded: "{rounded.xl}"
    padding: "{spacing.xl}"
    border: "1px solid {colors.hairline-soft}"
  tech-specs-table:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
    border: "1px solid {colors.hairline-soft}"
  testimonial-customer-card:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.xl}"
    padding: "{spacing.xxl}"
    border: "1px solid {colors.hairline-soft}"

---

## Overview

Meta's commerce surfaces (homepage, Quest configurator, Ray-Ban product detail, prescription page) read as a confident hardware merchandiser. The brand voice is photography-first: large, full-bleed product imagery dominates above-the-fold real estate, with white space and tight typographic hierarchy carrying the rest. The system has a recognizable dual-CTA pattern — a black pill-shaped primary on marketing surfaces shifting to a saturated cobalt blue ({colors.primary}) inside the buy-now flows, paired with an outlined ghost button for secondary navigation.

**Key Characteristics:**
- Stark white canvas carrying full-bleed product photography with `{rounded.xxxl}` (32px) corner softening on showcase tiles
- Pill-shaped buttons (`{rounded.full}`) as the dominant geometric signature
- Photographic feature cards with no card chrome (no border, no shadow)
- Saturated promotional banners used sparingly

## Colors

### Brand & Accent
- **Cobalt Primary** ({colors.primary}): The buy-now CTA color.
- **Deep Cobalt** ({colors.primary-deep}): Pressed-state variant.
- **Facebook Blue** ({colors.fb-blue}): Selected radio/checkbox state.

### Surface
- **Canvas White** ({colors.canvas}): Page background and primary card surface.
- **Soft Cloud** ({colors.surface-soft}): Subtle product-thumbnail background.
- **Hairline Gray** ({colors.hairline}): 1px input border.
- **Hairline Soft** ({colors.hairline-soft}): Quieter divider used on cards.

### Text
- **Deep Ink** ({colors.ink-deep}): Primary headline and body text.
- **Ink** ({colors.ink}): Standard body text.
- **Steel** ({colors.steel}): Quieter caption text and footer links.

## Buttons

**`button-primary`** — Black pill primary CTA for marketing surfaces.
- Background `{colors.ink-button}`, rounded `{rounded.full}`, padding `14px 30px`.

**`button-buy-cta`** — Cobalt pill primary CTA for commerce flows.
- Background `{colors.primary}`, rounded `{rounded.full}`, padding `14px 30px`.

**`button-secondary`** — Outlined ghost CTA.
- Background transparent, border `2px solid {colors.ink-deep}`, rounded `{rounded.full}`.

## Shapes

| Token | Value | Use |
|---|---|---|
| `{rounded.lg}` | 8px | Form inputs |
| `{rounded.xl}` | 16px | Standard feature cards |
| `{rounded.xxl}` | 24px | Accessory tiles |
| `{rounded.xxxl}` | 32px | Photographic feature cards |
| `{rounded.full}` | 100px | Pill buttons, tab chips, badges |
| `{rounded.circle}` | 50% | Color swatches, circular icon buttons |

## Do's and Don'ts

### Do
- Apply `{rounded.full}` to every button, every category pill, every badge — buttons are NEVER squared.
- Apply `{rounded.xxxl}` to photographic product cards and `{rounded.xl}` to icon-feature tiles.

### Don't
- Don't soften the corners of pill buttons below `{rounded.full}`. The pill is a brand signature.
- Don't apply heavy shadows to marketing cards.
- Don't introduce additional accent colors unnecessarily.
