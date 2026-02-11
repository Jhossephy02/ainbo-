---
name: "ui-ux-pro-max"
description: "Generates a tailored design system and UI patterns. Invoke when user requests professional UI/UX, design alignment, or sitewide visual consistency."
---

# UI/UX Pro Max

This skill provides a practical, opinionated design system and implementation guidance to elevate visual quality and consistency across pages, aligned with hero-centric + social proof patterns and mobile-first responsiveness.

## When to Invoke
- The user asks to improve visual design or mobile experience
- The user wants alignment with a reference site’s look/feel
- The project needs consistent navbar/hero/cards/buttons across pages

## Core Guidance
- Use a hero-centric layout with clear CTA above the fold; repeat CTA after testimonials.
- Adopt soft shadows, smooth transitions (200–300ms), gentle hover states, focus-visible styles.
- Respect accessibility: minimum 4.5:1 contrast, visible focus, keyboard navigation.
- Mobile-first: optimize at 375px, 768px, 1024px, 1440px breakpoints.
- Avoid neon colors and harsh animations; keep light mode only.

## Design Tokens
- Colors:
  - --brand-green: #114B34 (navbar/primary surfaces)
  - --brand-green-dark: #0C3A27 (hover/darker)
  - --accent-gold: #D4AF37 (CTA accent)
  - --surface: #ffffff
  - --text: #2D3436
- Typography: Montserrat (primary), system fallback
- Radius: 10–14px for cards/buttons
- Shadows: soft-lift 0 8px 18px rgba(0,0,0,.08)

## Components
- Navbar: dark brand background, white links, right-side search + phone CTA
- Hero: image background with subtle overlay, large title, subcopy, primary CTA
- Cards: white surface, soft shadow, rounded corners, subtle hover scale (1.02)
- Buttons: primary/outline with smooth transitions and focus rings

## Implementation Steps
1. Define tokens in the main CSS and add utility classes (bg-brand, text-brand, shadow-soft).
2. Unify navbar markup across pages with the same structure and responsive behavior.
3. Apply hero overlay style and section spacing utilities.
4. Validate mobile and accessibility states (focus-visible, reduced motion).

## Example Snippets
- Utility classes:
  - .bg-brand { background: var(--brand-green); }
  - .shadow-soft { box-shadow: 0 8px 18px rgba(0,0,0,.08); }
  - .cta-phone { background: var(--brand-green); color: #fff; border-radius: 10px; }

## Pre-Delivery Checklist
- Consistent navbar across all pages
- Hero section with overlay and CTA
- Buttons and cards with soft shadows and transitions
- Visible focus states
- Mobile nav and layout tested at common breakpoints
