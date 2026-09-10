---
name: NotaryGo Operational Control
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#43474e'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#74777f'
  outline-variant: '#c4c6cf'
  surface-tint: '#476083'
  primary: '#000613'
  on-primary: '#ffffff'
  primary-container: '#001f3f'
  on-primary-container: '#6f88ad'
  inverse-primary: '#afc8f0'
  secondary: '#944a00'
  on-secondary: '#ffffff'
  secondary-container: '#fc8f34'
  on-secondary-container: '#663100'
  tertiary: '#000610'
  on-tertiary: '#ffffff'
  tertiary-container: '#0d2031'
  on-tertiary-container: '#76889d'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d4e3ff'
  primary-fixed-dim: '#afc8f0'
  on-primary-fixed: '#001c3a'
  on-primary-fixed-variant: '#2f486a'
  secondary-fixed: '#ffdcc5'
  secondary-fixed-dim: '#ffb783'
  on-secondary-fixed: '#301400'
  on-secondary-fixed-variant: '#713700'
  tertiary-fixed: '#d1e4fb'
  tertiary-fixed-dim: '#b5c8df'
  on-tertiary-fixed: '#091d2e'
  on-tertiary-fixed-variant: '#36485b'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
  status-active: '#3498DB'
  status-success: '#10B981'
  status-warning-low: '#F1C40F'
  status-warning-medium: '#E67E22'
  status-critical: '#E74C3C'
  status-archived: '#94A3B8'
  surface-card: '#FFFFFF'
  border-subtle: '#E2E8F0'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  title-md:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-base:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  stats-number:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  sidebar-width: 260px
  container-padding: 2rem
  gutter: 1.5rem
  stack-sm: 0.5rem
  stack-md: 1rem
  touch-target-min: 44px
---

## Brand & Style

The design system embodies a **Corporate / Modern** aesthetic tailored for the legal and notary sector. The brand personality is rooted in authority, efficiency, and meticulous organization. It follows the philosophy of "Simple on the surface, complete underneath," ensuring that while the interface remains clean and uncluttered, the full depth of legal data is accessible when needed.

The visual direction prioritizes high legibility and a sense of "calm control." It utilizes a large, white workspace to reduce cognitive load, paired with high-contrast functional elements that signal professional reliability. The design is "exception-driven," focusing attention on critical tasks and bottlenecks through a refined semantic system.

**Key Stylistic Pillars:**
- **Minimalism:** Use of generous whitespace to separate legal records and operational modules.
- **Precision:** Strict alignment and consistent use of subtle borders to define structured data.
- **Authority:** A heavy reliance on Deep Navy to establish a traditional legal presence within a modern SaaS framework.

## Colors

The palette is anchored by **Deep Navy (#001F3F)**, representing legal authority and professionalism. This is contrasted against a **Very Light Warm Gray (#F8F9FA)** background to ensure a soft, low-strain reading environment for long periods of administrative work.

**Functional Color Application:**
- **Primary (Navy):** Used for side navigation backgrounds, primary action buttons, and headings.
- **Secondary (Orange/Gold):** Used sparingly as an accent for highlights, primary call-to-actions, or to indicate premium status features.
- **Semantic Logic:**
    - **Blue (Active):** Matters currently in progress.
    - **Emerald (Success):** Completed, verified, or paid items.
    - **Amber/Orange (Warning):** Approaching deadlines (3-7 days).
    - **Red (Critical):** Overdue tasks or immediate priority (H-1).
    - **Gray (Archived):** Historical records and cancelled matters.

## Typography

This design system uses **Inter** for its exceptional legibility in data-dense environments. The type scale is optimized for professional document management and quick scanning of matter registries.

**Implementation Rules:**
- **Legal Formatting:** For PDF and document previews, maintain 16px as the base body size to ensure readability for physical prints.
- **Data Grids:** Use `body-sm` (14px) for table data to maximize information density without sacrificing clarity.
- **Dashboard Stats:** Use `stats-number` for KPI cards (Active Matters, Overdue) to provide immediate visual impact.
- **Language Support:** All typography must support Indonesian grammatical structures, ensuring line heights accommodate taller character ascenders where necessary.

## Layout & Spacing

The system utilizes a **Fixed Grid** approach for the main workspace, ensuring a consistent 260px sidebar for navigation. The content area follows a structured 12-column layout that reflows based on screen density.

**Layout Philosophy:**
- **Sidebar:** Persistent left-hand navigation containing Icon + Text labels.
- **Workspace:** White canvas with 32px (`2rem`) outer padding to create a "breathing room" effect.
- **Responsiveness:**
    - **Desktop:** Full dashboard with multi-column KPI cards and data tables.
    - **Tablet:** Sidebar collapses to icons only; 2-column card layouts.
    - **Mobile:** Single column stack; hidden sidebar accessible via a burger menu.
- **Touch Targets:** A strict minimum of 44px for all interactive elements to ensure accessibility for office staff using tablets.

## Elevation & Depth

Visual hierarchy is achieved through **Tonal Layers** and **Restrained Shadows**, avoiding excessive depth to maintain a clean, "flat-plus" professional appearance.

- **Level 0 (Background):** Very light gray (#F8F9FA). Provides a soft base.
- **Level 1 (Cards/Surfaces):** Pure white (#FFFFFF). Used for the main content areas, matter files, and dashboard cards. These should feature a 1px subtle border (#E2E8F0) and a very soft, diffused shadow (0px 4px 12px rgba(0,0,0,0.03)).
- **Level 2 (Modals/Popovers):** Standard white surface with a more pronounced shadow (0px 10px 25px rgba(0,0,0,0.08)) to indicate focus.
- **Sidebar:** Solid Deep Navy background or a very light gray with a vertical separator, depending on the specific module intensity.

## Shapes

The shape language is **Rounded**, using a consistent 12px (`0.75rem` or `rounded-xl` in this system's scale) radius for primary containers and cards.

- **Cards & Modals:** 12px radius to soften the professional edge and align with modern SaaS aesthetics.
- **Buttons & Inputs:** 8px radius to maintain a precise, "clickable" look.
- **Status Tags/Chips:** Fully rounded (pill-shaped) to distinguish them from actionable buttons and data cells.
- **Selection States:** Use a 4px inner radius for highlight indicators within lists.

## Components

### Navigation Sidebar
- **Requirement:** Icon + Text labels are mandatory.
- **State:** Active state uses a left-accent border (4px) in Accent Gold or a subtle Navy background tint.

### Buttons
- **Primary:** Deep Navy background with white text.
- **Secondary:** White background, 1px Navy border, Navy text.
- **Actionable Icons:** Must be paired with tooltips or text if not self-evident.

### Status Indicators (Chips)
- **Constraint:** Must use **Icon + Text + Color**. For example, a "Critical" status uses a Red background/text, a "Warning" icon, and the text "Overdue".
- **Contrast:** Ensure text on status chips meets WCAG AA standards for accessibility.

### Cards
- **Usage:** KPI stats, Matter Summaries, and Document Previews.
- **Style:** 12px rounded corners, 1px subtle border, white background.

### Input Fields
- **Style:** 44px height for touch-readiness. Light gray border that darkens on focus. Labels must always be visible above the field (no floating labels that disappear).

### Data Tables (Matter Registry)
- **Density:** High-density rows with `body-sm` text.
- **Features:** Alternate row striping is discouraged; use subtle 1px dividers instead. Every row should have a trailing "Actions" menu (Three dots).