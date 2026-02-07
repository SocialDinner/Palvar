# PALVAR Website - Organic Nature Design Guidelines

## Design Philosophy
**Warm, Inviting & Sustainable**: The design evokes nature, sustainability, and trust. Moving away from cold, institutional aesthetics toward an organic, welcoming experience that represents energy consulting and environmental responsibility.

## Color Palette

### Primary Colors (Forest/Moss Green)
- **Primary**: HSL 152 45% 38% - Warm forest green for buttons, links, accents
- **Primary Foreground**: Pure white for text on primary backgrounds
- **Primary (Dark Mode)**: HSL 152 50% 48% - Slightly brighter for visibility

### Background Colors (Warm Cream Undertones)
- **Background**: HSL 45 20% 99% - Warm off-white with subtle cream
- **Card**: HSL 48 25% 98% - Gentle cream for cards
- **Muted**: HSL 45 12% 95% - Warm gray for subtle backgrounds

### Dark Mode (Rich, Warm Tones)
- **Background**: HSL 152 15% 8% - Deep forest-tinted dark
- **Card**: HSL 152 14% 11% - Elevated surfaces with warmth
- **Foreground**: HSL 45 15% 95% - Warm cream text

### Accent Colors
- **Accent**: HSL 152 25% 92% - Soft sage green
- **Teal**: HSL 178 55% 40% - Deep teal (secondary accent, harmonizes with green)
- **Warm/Amber**: HSL 38 85% 52% - Warm amber
- **Info**: HSL 195 70% 48% - Natural sky blue

### Service Color Coding
- **Energieberatung**: Amber/Warm (`text-amber-600`, `bg-amber-100`)
- **Projektmanagement**: Primary Green (`text-primary`, `bg-primary/10`)
- **Property Services**: Teal (`text-teal`, `bg-teal-muted`)

## Typography

### Font Families
- **Headings (font-heading)**: Poppins - Modern, friendly, approachable
- **Body (font-sans)**: Nunito Sans - Warm, readable, humanist sans-serif

### Usage
```css
/* Headings - use font-heading class */
h1, h2, h3 { @apply font-heading; }

/* Body text uses default font-sans */
body { @apply font-sans; }
```

### Hierarchy
- **H1**: 3xl-6xl, font-bold, font-heading
- **H2**: 2xl-4xl, font-bold, font-heading
- **H3**: lg-xl, font-semibold, font-heading
- **Body**: base, regular weight
- **Small/Muted**: sm, text-muted-foreground

## Border Radius (Organic, Soft)
- **lg**: 1rem (16px) - Cards, modals, large containers
- **md**: 0.75rem (12px) - Buttons, inputs
- **sm**: 0.5rem (8px) - Small elements, badges
- **xs**: 0.25rem (4px) - Minimal rounding

## Shadows (Soft, Natural)
All shadows use green-tinted colors for organic feel:
```css
--shadow-sm: 0 2px 4px -1px hsl(152 20% 20% / 0.06);
--shadow-md: 0 8px 16px -4px hsl(152 20% 20% / 0.1);
--shadow-lg: 0 16px 32px -8px hsl(152 20% 20% / 0.12);
```

## Component Styling

### Cards
- Use `<Card>` component with default styling
- Background: card token (warm cream in light mode)
- Border: subtle, natural warmth
- Border-radius: lg (1rem)
- Shadow: subtle, layered

### Buttons
- Primary: bg-primary with white text
- Outline: transparent with border
- Ghost: transparent, subtle hover
- All buttons use md border-radius

### Hero Sections
- Full-width background images
- Overlay: `bg-gradient-to-b from-emerald-950/80` (forest green tint, not black)
- Light text always (white/white-80)
- Backdrop blur for badges and buttons

### Icons
- Primary color for decorative icons
- Size: w-6 h-6 for inline, w-7 h-7 for cards
- Background circles: bg-primary/10 rounded-full

## Spacing

### Section Padding
- Standard: py-16 sm:py-24
- Compact: py-12
- Hero: min-h-[85vh]

### Container
- Max width: max-w-7xl for main content
- Padding: px-4 sm:px-6 lg:px-8

### Card Grid Gaps
- Standard: gap-6 or gap-8
- Tight: gap-4

## Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Cards: 1 column mobile, 2-3 tablet, 3-4 desktop

## Accessibility
- High contrast text colors
- Focus states with ring-primary
- Semantic HTML structure
- Descriptive alt text for images

## Do's and Don'ts

### Do
- Use font-heading for ALL h1, h2, h3 elements
- Apply soft shadows sparingly
- Use primary/10 backgrounds for icon containers
- Keep hero overlays warm (emerald-950, not black)

### Don't
- Use pure black backgrounds or overlays
- Apply angular/sharp corners
- Use cold blue-tinted grays
- Forget font-heading on card titles
