# PALVAR Website

## Overview
A comprehensive German-language business website for PALVAR - a company offering energy consulting (Energieberatung), project management (Projektmanagement), and building/property services (Gebäudeservices). Features extensive educational content in the "Wissen" section about legal requirements (GEG), funding programs (BAFA/KfW), and renovation obligations.

## Tech Stack
- **Frontend**: React with TypeScript, Tailwind CSS, Shadcn UI components
- **Backend**: Express.js
- **Database**: PostgreSQL (Neon.tech) with Drizzle ORM - uses NEON_DATABASE_URL
- **CRM**: HubSpot integration for contact/company sync
- **Routing**: Wouter
- **State Management**: TanStack Query
- **Forms**: React Hook Form with Zod validation
- **SEO**: react-helmet-async for dynamic meta tags
- **Animations**: Framer Motion
- **Email**: Resend API for transactional emails

## Project Structure
```
client/
├── src/
│   ├── components/
│   │   ├── ui/              # Shadcn UI components
│   │   ├── Header.tsx       # Navigation header with dropdowns
│   │   ├── Footer.tsx       # Site footer
│   │   ├── SEO.tsx          # SEO component with structured data helpers
│   │   ├── CookieConsent.tsx
│   │   └── motion.tsx       # Animation components
│   ├── pages/
│   │   ├── Home.tsx         # Homepage with testimonials, challenges, services
│   │   ├── Energieberatung.tsx
│   │   ├── Projektmanagement.tsx
│   │   ├── PropertyServices.tsx
│   │   ├── Booking.tsx
│   │   ├── energieberatung/  # Subpages: ISFP, Foerdermittel, Energieausweis, etc.
│   │   ├── projektmanagement/ # Subpages: Bauherrenvertretung, Heizungsprojekte, etc.
│   │   ├── property-services/ # Subpages: FM, PM, Asset Management
│   │   └── wissen/           # Educational content: GEG, Foerderung, Sanierungspflicht
│   └── App.tsx
server/
├── routes.ts
├── storage.ts
├── db.ts           # PostgreSQL connection with Drizzle
├── email.ts        # Resend email functions
└── hubspot.ts      # HubSpot CRM integration
shared/
└── schema.ts       # Drizzle schema (users, bookingRequests, partnerRegistrations)
```

## Routes
### Main Pages
- `/` - Homepage with hero, challenges, testimonials, services overview
- `/energieberatung` - Energy Consulting services
- `/projektmanagement` - Project Management services
- `/gebaeudeservices` - Building/Property Services
- `/anfrage` - Contact form with service packages and step-by-step wizard
- `/rechner` - Wirtschaftlichkeitsrechner für Sanierungsmaßnahmen

### Legal Pages
- `/impressum` - Legal notice (§5 TMG compliant)
- `/agb` - Allgemeine Geschäftsbedingungen with Widerrufsrecht
- `/datenschutz` - Datenschutzerklärung (DSGVO compliant)

### Wissen (Knowledge Section)
- `/wissen/geg` - Gebäudeenergiegesetz (building energy law)
- `/wissen/foerderung` - Förderlandschaft 2024/2025 (funding programs)
- `/wissen/sanierungspflicht` - Sanierungspflichten (renovation obligations)
- `/wissen/kfw-standards` - KfW-Effizienzhaus-Standards
- `/wissen/solarpflicht` - Solarpflicht im Bestand (by state)
- `/wissen/beg` - Bundesförderung für effiziente Gebäude
- `/wissen/betreiberverantwortung` - Betreiberverantwortung für Gebäudeeigentümer
- `/wissen/lexikon` - Bau-Lexikon mit 55 Fachbegriffen in 6 Kategorien (Wirtschaftlichkeit, Energie, Sanierung, Förderung, Rechtlich, Property Management)

### Bauteile (Gebäudebauteile mit Förderinfo)
- `/bauteile` - Umfassende Übersicht aller Gebäudebauteile (Dach, Fassade, Fenster, Keller, Heizung, Lüftung, Solar, Elektro) mit Förderinformationen für jede Maßnahme

## SEO Implementation
- **Meta Tags**: Unique title (50-60 chars) and description (150-160 chars) per page
- **Open Graph & Twitter Cards**: For social media sharing
- **Structured Data (JSON-LD)**:
  - Organization schema (homepage)
  - WebSite schema (homepage)
  - ProfessionalService schema with service catalog
  - BreadcrumbList schema (subpages)
  - FAQPage schema (knowledge pages)
  - Service schema (service pages)
- **Canonical URLs**: Configured for all pages
- **Robots directives**: Optimized for indexing

## Design
- Professional green primary color (HSL 158) representing sustainability
- Clean, modern layout inspired by deutsche-sanierungsberatung.de
- Responsive design for all screen sizes
- German language content throughout
- Dark mode support

## Key Features
1. Homepage sections: Hero, Stats, Challenges, Sanierungsmaßnahmen, Services, Testimonials, CTA
2. Comprehensive service pages with pricing and process steps
3. Educational "Wissen" section about legal requirements
4. Multi-step booking form with service category tabs and package selection
5. Cookie consent banner
6. Responsive navigation with dropdown menus
7. Floating contact button
8. ScrollToTop component for navigation between pages
9. Complete legal pages (Impressum, AGB, Datenschutz) for German compliance
10. Interactive Wirtschaftlichkeitsrechner with 4 calculator types (Heizungstausch, PV, Dämmung, Komplett)

## Important Business Rules
- **Building Types**: Website focuses on residential buildings with max. 6 Wohneinheiten (WE): EFH, ZFH, and small MFH. NO commercial/Gewerbe properties.
- **Energieausweis**: PALVAR creates both Bedarfsausweise (demand-based) AND Verbrauchsausweise (consumption-based energy certificates).
- **Service Focus**: All services target residential property owners with emphasis on energy efficiency and sustainability.

## Förderung Rules (BEG EM)
### Gebäudehülle (Dach, Fassade, Fenster, Keller)
- BAFA Basis: 15%, mit iSFP: 20% (+5% Bonus)
- Max. förderfähige Kosten: 60.000€ pro WE

### Heizungstausch (KEIN iSFP-Bonus!)
- Basis: 30% + Klimabonus bis +20% + Einkommensbonus bis +30% = max. 70%
- Förderfähige Kosten nach Wohneinheiten:
  - 1 WE: 30.000€
  - 2 WE: 45.000€
  - 3 WE: 60.000€
  - 4 WE: 75.000€
  - 5 WE: 90.000€
  - 6 WE: 105.000€ (Maximum)

## Energieberatung Subpages (Routes with /energieberatung/ prefix)
- `/energieberatung/isfp` - Individueller Sanierungsfahrplan
- `/energieberatung/foerdermittel` - Fördermittelberatung
- `/energieberatung/energieausweis` - Bedarfsausweis (only)
- `/energieberatung/heizlastberechnung` - Heizlastberechnung
- `/energieberatung/zeb` - Zero Emission Building
- `/energieberatung/oekobilanz` - Ökobilanzierung

## Projektmanagement Subpages
- `/projektmanagement/bauherrenvertretung` - Detailed owner representation services
- `/projektmanagement/qualitaetssicherung` - Quality assurance (Baubegleitung)
- `/projektmanagement/heizungsprojekte` - Heating system projects

## HubSpot Integration Setup

### Property Mapping Layer (server/hubspotPropertyMap.ts)
Controls which fields are sent to HubSpot. Excluded internal fields:
- `id`, `createdAt`, `updatedAt` (database fields)
- `consentGiven`, `consentTimestamp`, `marketingConsent` (DSGVO internal)
- `status`, `internalNotes`, `dbId` (internal status)

### Custom Properties (create in HubSpot > Settings > Properties > Contact Properties)
Create the following custom properties for workflow triggers:

| Property Name | Type | Description |
|--------------|------|-------------|
| `booking_type` | Single-line text | Service type from booking form |
| `booking_message` | Single-line text | Customer message |
| `booking_package` | Single-line text | Selected package |
| `booking_building_type` | Single-line text | Building type |
| `booking_confirmed` | Single-line text | Set to "true" after successful sync |
| `calculator_type` | Single-line text | Calculator type used |
| `calculator_confirmed` | Single-line text | Set to "true" after sync |
| `career_position` | Single-line text | Position applied for |
| `career_confirmed` | Single-line text | Set to "true" after sync |
| `partner_trades` | Single-line text | Partner trade types |
| `partner_confirmed` | Single-line text | Set to "true" after sync |

### Workflow Setup (HubSpot > Automation > Workflows)
Create workflows with these triggers:

1. **Booking Confirmation Email**
   - Trigger: Contact property `booking_confirmed` is known
   - Action: Send transactional email (Buchungsbestätigung)

2. **Calculator Results Email**
   - Trigger: Contact property `calculator_confirmed` is known
   - Action: Send transactional email (Rechner-Ergebnisse)

3. **Career Application Email**
   - Trigger: Contact property `career_confirmed` is known
   - Action: Send transactional email (Bewerbungseingang)

4. **Partner Registration Email**
   - Trigger: Contact property `partner_confirmed` is known
   - Action: Send transactional email (Partner-Registrierung)

### Backend Flow
1. Form submission saved to PostgreSQL
2. Contact created OR updated in HubSpot (upsert by email)
3. Unmapped fields logged for debugging
4. Confirmation property set to "true"
5. HubSpot workflow triggers email automatically
6. Graceful failure if HubSpot unavailable (DB records preserved)

## Running the Project
Run `npm run dev` which starts Express server and Vite dev server on port 5000.
