# Design Guidelines: Store Rating Platform

## Design Approach

**Selected Approach:** Design System - Material Design inspired
**Justification:** This is a utility-focused, data-intensive application with dashboards, tables, and forms. Material Design provides excellent patterns for admin panels, data visualization, and role-based interfaces while maintaining consistency across complex workflows.

## Core Design Elements

### A. Typography
- **Primary Font:** Inter (Google Fonts)
- **Hierarchy:**
  - Page Headers: text-3xl font-semibold
  - Section Headers: text-xl font-semibold
  - Card Titles: text-lg font-medium
  - Body Text: text-base font-normal
  - Table Headers: text-sm font-semibold uppercase tracking-wide
  - Labels/Captions: text-sm font-medium
  - Stats/Metrics: text-4xl font-bold

### B. Layout System
**Spacing Primitives:** Tailwind units of 2, 4, 6, and 8
- Component padding: p-6
- Section gaps: gap-6, gap-8
- Card spacing: p-4, p-6
- Form field spacing: space-y-4
- Table cell padding: px-4 py-3

**Grid System:**
- Dashboard stats: grid-cols-1 md:grid-cols-3 gap-6
- Store cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4
- Forms: Single column max-w-2xl
- Tables: Full width with responsive horizontal scroll

### C. Component Library

**1. Navigation**
- **Top Bar:** Fixed header with logo, role indicator, user menu dropdown
- **Sidebar (Admin):** Collapsible navigation with icons and labels
  - Dashboard, Users, Stores, Logout sections
  - Active state with left border accent

**2. Dashboard Cards**
- **Stats Cards:** Elevated cards with icon, label, and large numeric value
  - Total Users, Total Stores, Total Ratings
  - Icon positioned top-left, value centered and prominent

**3. Data Tables**
- **Table Structure:** Striped rows with hover states
- **Headers:** Sticky with sort indicators (↑↓ icons)
- **Filters:** Top-aligned filter bar with search inputs and role dropdowns
- **Actions:** Row-level action buttons (view, edit) aligned right
- **Pagination:** Bottom-aligned with page numbers and next/prev

**4. Forms**
- **Input Fields:** 
  - Outlined style with floating labels
  - Error states with red border and helper text below
  - Success states with green checkmark icon
- **Buttons:**
  - Primary: Solid fill, medium size (px-6 py-2)
  - Secondary: Outline style
  - Positioned right-aligned on forms
- **Validation Messages:** text-sm below inputs, icon + message format

**5. Rating Component**
- **Star Display:** 5-star row, filled/outlined states
- **Interactive Rating:** Clickable stars with hover preview
- **Rating Summary:** 
  - Large average number with stars below
  - "Based on X ratings" subtitle

**6. Store Cards (Normal User View)**
- **Card Layout:**
  - Store name (text-lg font-semibold)
  - Address (text-sm)
  - Overall rating (stars + number)
  - Your rating section (stars + edit button)
  - Submit/Modify rating button
- **Card Style:** Bordered with shadow-sm, hover:shadow-md transition

**7. Modals/Dialogs**
- **Add User/Store Modal:** Centered overlay with form
- **Rating Submission:** Compact modal with star selector
- **Confirmation Dialogs:** Small centered dialogs for destructive actions

**8. Authentication Pages**
- **Layout:** Split screen - left side form, right side branding/image
- **Form Container:** Centered card with max-w-md
- **Fields:** Stacked vertically with clear labels

### D. Animations
**Minimal Motion:**
- Button hovers: subtle scale (hover:scale-105)
- Card interactions: shadow transitions (transition-shadow duration-200)
- Star ratings: gentle fill animation
- No page transitions or complex animations

## Role-Specific Layouts

**System Admin:**
- Sidebar + main content area layout
- Dashboard: 3-column stats grid + recent activity table
- User/Store management: Filter bar + sortable table + action buttons

**Normal User:**
- Top navigation bar only
- Store browsing: Search bar + grid of store cards
- Store detail: Modal overlay with rating submission

**Store Owner:**
- Simple top navigation
- Dashboard: Single-column layout with average rating card + ratings list table

## Images

**Hero Image:** Not required for this application
**User Avatars:** Circle placeholders (40x40px) in navigation and user lists
**Store Images:** Optional square thumbnails (80x80px) in store cards
**Empty States:** Simple illustration placeholders for empty tables/lists

## Critical Patterns

- **Consistent Data Density:** Tables use comfortable row heights (py-3) for readability
- **Clear Role Context:** Header always displays current user role badge
- **Responsive Tables:** Horizontal scroll on mobile, full display on desktop
- **Inline Validation:** Real-time feedback as users type
- **Loading States:** Skeleton screens for tables, spinner for button actions
- **Success Feedback:** Toast notifications for actions (rating submitted, user added)