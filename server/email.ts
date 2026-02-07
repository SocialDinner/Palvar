// Resend Email Service for PALVAR
// Uses Replit Resend Integration (connection:conn_resend_01KCW569Z18152CFT1VZ1JR72F)

import { Resend } from 'resend';

let connectionSettings: any;

async function getCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=resend',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  if (!connectionSettings || (!connectionSettings.settings.api_key)) {
    throw new Error('Resend not connected - please set up the Resend integration');
  }
  return {
    apiKey: connectionSettings.settings.api_key, 
    fromEmail: connectionSettings.settings.from_email
  };
}

// Get Resend client - must be called fresh each time (tokens expire)
export async function getResendClient() {
  const { apiKey, fromEmail } = await getCredentials();
  return {
    client: new Resend(apiKey),
    fromEmail: fromEmail
  };
}

// PALVAR Brand Colors - matching website design
const COLORS = {
  primary: '#2e7d5e',      // HSL 152 45% 38% - Forest green (website primary)
  primaryDark: '#1a4d3a',  // Darker forest green for gradients
  primaryDeep: '#0f3528',  // Very dark forest for header gradient start
  background: '#fdfcfa',   // Warm cream-white (website background)
  summaryBox: '#f5f3f0',   // Warm light gray for boxes
  text: '#1f2d25',         // Dark forest-tinted text
  textMuted: '#5a6b5f',    // Muted green-gray
  border: '#e5e0da',       // Warm border color
  white: '#ffffff',
  accent: '#c26a37',       // Copper accent for CTAs
};

// Base email template - responsive design
function baseTemplate(content: string, preheader: string = '') {
  return `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>PALVAR</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style type="text/css">
    /* Reset styles */
    body, table, td, p, a, li, blockquote {
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    table, td {
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    img {
      -ms-interpolation-mode: bicubic;
      border: 0;
      height: auto;
      line-height: 100%;
      outline: none;
      text-decoration: none;
    }
    /* Responsive styles - Vollbild auf Mobilgeräten */
    @media only screen and (max-width: 620px) {
      .email-container {
        width: 100% !important;
        max-width: 100% !important;
        margin: 0 !important;
      }
      .responsive-padding {
        padding-left: 0 !important;
        padding-right: 0 !important;
      }
      .content-padding {
        padding: 24px 16px !important;
      }
      .header-padding {
        padding: 24px 16px !important;
        border-radius: 0 !important;
      }
      .footer-padding {
        padding: 24px 16px !important;
        border-radius: 0 !important;
      }
      .mobile-text-center {
        text-align: center !important;
      }
      .mobile-font-small {
        font-size: 14px !important;
      }
      h1 {
        font-size: 24px !important;
      }
      h2, h3 {
        font-size: 16px !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${COLORS.background}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  ${preheader ? `<div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">${preheader}</div>` : ''}
  
  <!-- Email wrapper -->
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: ${COLORS.background};">
    <tr>
      <td align="center" class="responsive-padding" style="padding: 24px 16px;">
        
        <!-- Email container -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" class="email-container" style="max-width: 600px; margin: 0 auto;">
          
          <!-- Header -->
          <tr>
            <td class="header-padding" align="center" style="background: linear-gradient(135deg, ${COLORS.primaryDeep} 0%, ${COLORS.primaryDark} 50%, ${COLORS.primary} 100%); padding: 40px 32px; border-radius: 12px 12px 0 0;">
              <!-- Logo and Brand -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center" style="padding-bottom: 8px;">
                    <svg width="48" height="48" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M30 8C30 8 35 15 32 25C29 35 18 38 18 38C18 38 18 28 20 20C22 12 30 8 30 8Z" fill="#4ade80" stroke="#22c55e" stroke-width="1.5"/>
                      <path d="M18 38C18 28 20 20 20 20" stroke="#22c55e" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <span style="font-size: 28px; font-weight: 700; color: #ffffff; letter-spacing: 3px;">PALVAR</span>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 12px;">
                    <span style="font-size: 13px; font-weight: 400; color: rgba(255,255,255,0.85); letter-spacing: 1px;">
                      Energieberatung | Projektmanagement | Gebäudeservices
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td class="content-padding" style="background-color: ${COLORS.white}; padding: 32px;">
              ${content}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td class="footer-padding" style="background: linear-gradient(135deg, ${COLORS.primaryDark} 0%, ${COLORS.primaryDeep} 100%); padding: 28px 32px; border-radius: 0 0 12px 12px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td align="center" style="color: rgba(255,255,255,0.75); font-size: 13px; line-height: 1.7;">
                    <p style="margin: 0 0 8px 0;">
                      <strong style="color: ${COLORS.white}; font-size: 15px; letter-spacing: 1px;">PALVAR</strong>
                    </p>
                    <p style="margin: 0 0 16px 0;">
                      Ihr Partner für nachhaltige Gebäudelösungen
                    </p>
                    <p style="margin: 0 0 8px 0;">
                      <a href="mailto:service@palvar.de" style="color: rgba(255,255,255,0.9); text-decoration: none;">service@palvar.de</a>
                    </p>
                    <p style="margin: 20px 0 0 0; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.15); font-size: 11px; color: rgba(255,255,255,0.5);">
                      Diese E-Mail wurde automatisch generiert.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

// Customer confirmation email after booking request
export function createCustomerConfirmationEmail(data: {
  name: string;
  email: string;
  phone?: string;
  serviceCategory: string;
  packageName: string;
  message?: string;
}) {
  const content = `
    <h1 style="margin: 0 0 24px 0; font-size: 28px; font-weight: 700; color: ${COLORS.primaryDark};">
      Vielen Dank für Ihre Anfrage!
    </h1>
    
    <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.7; color: ${COLORS.text};">
      Guten Tag ${data.name},
    </p>
    
    <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.7; color: ${COLORS.text};">
      wir haben Ihre Beratungsanfrage erhalten und freuen uns über Ihr Interesse an unseren Dienstleistungen. Unser Team wird sich innerhalb von <strong>24 Stunden</strong> bei Ihnen melden.
    </p>
    
    <!-- Summary Box -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: ${COLORS.summaryBox}; border-radius: 12px; margin: 32px 0;">
      <tr>
        <td style="padding: 24px;">
          <h2 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600; color: ${COLORS.primaryDark};">
            Ihre Anfrage im Überblick
          </h2>
          
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid ${COLORS.border};">
                <span style="color: ${COLORS.textMuted}; font-size: 14px;">Leistungsbereich</span><br>
                <span style="color: ${COLORS.text}; font-size: 16px; font-weight: 500;">${data.serviceCategory}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid ${COLORS.border};">
                <span style="color: ${COLORS.textMuted}; font-size: 14px;">Gewähltes Paket</span><br>
                <span style="color: ${COLORS.text}; font-size: 16px; font-weight: 500;">${data.packageName}</span>
              </td>
            </tr>
            ${data.message ? `
            <tr>
              <td style="padding: 8px 0;">
                <span style="color: ${COLORS.textMuted}; font-size: 14px;">Ihre Nachricht</span><br>
                <span style="color: ${COLORS.text}; font-size: 14px; font-style: italic;">"${data.message}"</span>
              </td>
            </tr>
            ` : ''}
          </table>
        </td>
      </tr>
    </table>
    
    <!-- Next Steps -->
    <h3 style="margin: 32px 0 16px 0; font-size: 18px; font-weight: 600; color: ${COLORS.primaryDark};">
      Nächste Schritte
    </h3>
    
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
      <tr>
        <td style="padding: 12px 0;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0">
            <tr>
              <td style="background-color: ${COLORS.primary}; color: ${COLORS.white}; width: 28px; height: 28px; border-radius: 50%; text-align: center; font-size: 14px; font-weight: 600; vertical-align: middle;">1</td>
              <td style="padding-left: 16px; color: ${COLORS.text}; font-size: 15px;">Wir prüfen Ihre Anfrage und Ihre Anforderungen</td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding: 12px 0;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0">
            <tr>
              <td style="background-color: ${COLORS.primary}; color: ${COLORS.white}; width: 28px; height: 28px; border-radius: 50%; text-align: center; font-size: 14px; font-weight: 600; vertical-align: middle;">2</td>
              <td style="padding-left: 16px; color: ${COLORS.text}; font-size: 15px;">Ein Experte kontaktiert Sie für ein Erstgespräch</td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding: 12px 0;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0">
            <tr>
              <td style="background-color: ${COLORS.primary}; color: ${COLORS.white}; width: 28px; height: 28px; border-radius: 50%; text-align: center; font-size: 14px; font-weight: 600; vertical-align: middle;">3</td>
              <td style="padding-left: 16px; color: ${COLORS.text}; font-size: 15px;">Gemeinsam planen wir die nächsten Schritte</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    
    <p style="margin: 32px 0 0 0; font-size: 16px; line-height: 1.7; color: ${COLORS.text};">
      Bei dringenden Fragen erreichen Sie uns unter <a href="mailto:service@palvar.de" style="color: ${COLORS.primary}; text-decoration: none; font-weight: 500;">service@palvar.de</a>.
    </p>
    
    <p style="margin: 24px 0 0 0; font-size: 16px; line-height: 1.7; color: ${COLORS.text};">
      Mit freundlichen Grußen,<br>
      <strong>Ihr PALVAR-Team</strong>
    </p>
  `;

  return baseTemplate(content, `Vielen Dank für Ihre Anfrage bei PALVAR - wir melden uns innerhalb von 24 Stunden.`);
}

// Admin notification email
export function createAdminNotificationEmail(data: {
  name: string;
  email: string;
  phone?: string;
  serviceCategory: string;
  packageName: string;
  message?: string;
  buildingType?: string;
  units?: string;
  submittedAt: string;
}) {
  const content = `
    <h1 style="margin: 0 0 24px 0; font-size: 24px; font-weight: 700; color: ${COLORS.primaryDark};">
      Neue Beratungsanfrage
    </h1>
    
    <p style="margin: 0 0 24px 0; font-size: 15px; color: ${COLORS.textMuted};">
      Eingegangen am ${data.submittedAt}
    </p>
    
    <!-- Customer Data -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: ${COLORS.summaryBox}; border-radius: 12px; margin: 0 0 24px 0;">
      <tr>
        <td style="padding: 24px;">
          <h2 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 600; color: ${COLORS.primary};">
            Kundendaten
          </h2>
          
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid ${COLORS.border}; width: 120px; color: ${COLORS.textMuted}; font-size: 14px;">Name</td>
              <td style="padding: 8px 0; border-bottom: 1px solid ${COLORS.border}; color: ${COLORS.text}; font-size: 14px; font-weight: 500;">${data.name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid ${COLORS.border}; color: ${COLORS.textMuted}; font-size: 14px;">E-Mail</td>
              <td style="padding: 8px 0; border-bottom: 1px solid ${COLORS.border};">
                <a href="mailto:${data.email}" style="color: ${COLORS.primary}; text-decoration: none; font-size: 14px;">${data.email}</a>
              </td>
            </tr>
            ${data.phone ? `
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid ${COLORS.border}; color: ${COLORS.textMuted}; font-size: 14px;">Telefon</td>
              <td style="padding: 8px 0; border-bottom: 1px solid ${COLORS.border};">
                <a href="tel:${data.phone}" style="color: ${COLORS.primary}; text-decoration: none; font-size: 14px;">${data.phone}</a>
              </td>
            </tr>
            ` : ''}
          </table>
        </td>
      </tr>
    </table>
    
    <!-- Service Details -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: ${COLORS.summaryBox}; border-radius: 12px; margin: 0 0 24px 0;">
      <tr>
        <td style="padding: 24px;">
          <h2 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 600; color: ${COLORS.primary};">
            Angefragte Leistung
          </h2>
          
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid ${COLORS.border}; width: 120px; color: ${COLORS.textMuted}; font-size: 14px;">Bereich</td>
              <td style="padding: 8px 0; border-bottom: 1px solid ${COLORS.border}; color: ${COLORS.text}; font-size: 14px; font-weight: 500;">${data.serviceCategory}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid ${COLORS.border}; color: ${COLORS.textMuted}; font-size: 14px;">Paket</td>
              <td style="padding: 8px 0; border-bottom: 1px solid ${COLORS.border}; color: ${COLORS.text}; font-size: 14px; font-weight: 500;">${data.packageName}</td>
            </tr>
            ${data.buildingType ? `
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid ${COLORS.border}; color: ${COLORS.textMuted}; font-size: 14px;">Gebudetyp</td>
              <td style="padding: 8px 0; border-bottom: 1px solid ${COLORS.border}; color: ${COLORS.text}; font-size: 14px;">${data.buildingType}</td>
            </tr>
            ` : ''}
            ${data.units ? `
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid ${COLORS.border}; color: ${COLORS.textMuted}; font-size: 14px;">Wohneinheiten</td>
              <td style="padding: 8px 0; border-bottom: 1px solid ${COLORS.border}; color: ${COLORS.text}; font-size: 14px;">${data.units}</td>
            </tr>
            ` : ''}
          </table>
        </td>
      </tr>
    </table>
    
    ${data.message ? `
    <!-- Message -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: ${COLORS.summaryBox}; border-radius: 12px;">
      <tr>
        <td style="padding: 24px;">
          <h2 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 600; color: ${COLORS.primary};">
            Nachricht des Kunden
          </h2>
          <p style="margin: 0; font-size: 14px; line-height: 1.6; color: ${COLORS.text}; white-space: pre-wrap;">${data.message}</p>
        </td>
      </tr>
    </table>
    ` : ''}
    
    <p style="margin: 32px 0 0 0; padding: 16px; background-color: #fef3c7; border-radius: 8px; font-size: 14px; color: #92400e;">
      <strong>Aktion erforderlich:</strong> Bitte kontaktieren Sie den Kunden innerhalb von 24 Stunden.
    </p>
  `;

  return baseTemplate(content, `Neue Anfrage von ${data.name} - ${data.serviceCategory} / ${data.packageName}`);
}

// Calculator results email
export function createCalculatorResultsEmail(data: {
  name?: string;
  email: string;
  calculatorType: string;
  results: {
    label: string;
    value: string;
  }[];
  inputs: {
    label: string;
    value: string;
  }[];
}) {
  const typeNames: Record<string, string> = {
    heizung: 'Heizungstausch-Rechner',
    pv: 'Photovoltaik-Rechner',
    daemmung: 'Dammungs-Rechner',
    komplett: 'Komplettsanierungs-Rechner',
  };

  const typeName = typeNames[data.calculatorType] || 'Wirtschaftlichkeitsrechner';

  const content = `
    <h1 style="margin: 0 0 24px 0; font-size: 28px; font-weight: 700; color: ${COLORS.primaryDark};">
      Ihre Berechnungsergebnisse
    </h1>
    
    <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.7; color: ${COLORS.text};">
      ${data.name ? `Guten Tag ${data.name},` : 'Guten Tag,'}
    </p>
    
    <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.7; color: ${COLORS.text};">
      vielen Dank für die Nutzung unseres <strong>${typeName}s</strong>. Hier sind Ihre personalisierten Ergebnisse:
    </p>
    
    <!-- Results Box -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: linear-gradient(135deg, ${COLORS.primaryDark} 0%, ${COLORS.primary} 100%); border-radius: 12px; margin: 32px 0;">
      <tr>
        <td style="padding: 32px;">
          <h2 style="margin: 0 0 24px 0; font-size: 20px; font-weight: 600; color: ${COLORS.white};">
            Ergebnisse
          </h2>
          
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            ${data.results.map((result, index) => `
            <tr>
              <td style="padding: 12px 0; ${index < data.results.length - 1 ? `border-bottom: 1px solid rgba(255,255,255,0.2);` : ''}">
                <span style="color: rgba(255,255,255,0.8); font-size: 14px; display: block;">${result.label}</span>
                <span style="color: ${COLORS.white}; font-size: 24px; font-weight: 700;">${result.value}</span>
              </td>
            </tr>
            `).join('')}
          </table>
        </td>
      </tr>
    </table>
    
    <!-- Inputs Summary -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: ${COLORS.summaryBox}; border-radius: 12px; margin: 0 0 32px 0;">
      <tr>
        <td style="padding: 24px;">
          <h2 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 600; color: ${COLORS.primaryDark};">
            Ihre Eingaben
          </h2>
          
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            ${data.inputs.map((input, index) => `
            <tr>
              <td style="padding: 6px 0; ${index < data.inputs.length - 1 ? `border-bottom: 1px solid ${COLORS.border};` : ''} width: 50%; color: ${COLORS.textMuted}; font-size: 14px;">${input.label}</td>
              <td style="padding: 6px 0; ${index < data.inputs.length - 1 ? `border-bottom: 1px solid ${COLORS.border};` : ''} color: ${COLORS.text}; font-size: 14px; font-weight: 500; text-align: right;">${input.value}</td>
            </tr>
            `).join('')}
          </table>
        </td>
      </tr>
    </table>
    
    <p style="margin: 0 0 16px 0; font-size: 14px; color: ${COLORS.textMuted}; font-style: italic;">
      * Diese Berechnung dient als erste Orientierung. Die tatsachlichen Werte können je nach individueller Situation abweichen.
    </p>
    
    <!-- CTA -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 32px 0;">
      <tr>
        <td style="text-align: center;">
          <p style="margin: 0 0 16px 0; font-size: 16px; color: ${COLORS.text};">
            Mochten Sie Ihr Einsparpotenzial voll ausschopfen?
          </p>
          <a href="https://palvar.de/booking" style="display: inline-block; background-color: ${COLORS.primary}; color: ${COLORS.white}; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
            Kostenlose Beratung anfragen
          </a>
        </td>
      </tr>
    </table>
    
    <p style="margin: 24px 0 0 0; font-size: 16px; line-height: 1.7; color: ${COLORS.text};">
      Mit freundlichen Grußen,<br>
      <strong>Ihr PALVAR-Team</strong>
    </p>
  `;

  return baseTemplate(content, `Ihre ${typeName}-Ergebnisse von PALVAR`);
}

// Generate ICS calendar file content
function generateICSFile(data: {
  name: string;
  email: string;
  serviceCategory: string;
  packageName: string;
  phone?: string;
}): string {
  const now = new Date();
  // Schedule callback appointment for next business day at 10:00
  const callbackDate = new Date(now);
  callbackDate.setDate(callbackDate.getDate() + 1);
  // Skip weekends
  if (callbackDate.getDay() === 0) callbackDate.setDate(callbackDate.getDate() + 1);
  if (callbackDate.getDay() === 6) callbackDate.setDate(callbackDate.getDate() + 2);
  callbackDate.setHours(10, 0, 0, 0);
  
  const endDate = new Date(callbackDate);
  endDate.setMinutes(endDate.getMinutes() + 30);
  
  const formatICSDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };
  
  const uid = `palvar-${now.getTime()}@palvar.de`;
  const dtstamp = formatICSDate(now);
  const dtstart = formatICSDate(callbackDate);
  const dtend = formatICSDate(endDate);
  
  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//PALVAR//Booking//DE
CALSCALE:GREGORIAN
METHOD:REQUEST
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${dtstamp}
DTSTART:${dtstart}
DTEND:${dtend}
SUMMARY:PALVAR Beratung - Rückruf erwartet
DESCRIPTION:Sie haben eine ${data.serviceCategory}-Beratung (${data.packageName}) bei PALVAR angefragt. Ein Experte wird Sie zu diesem Zeitpunkt kontaktieren.\\n\\nBei Fragen: service@palvar.de
LOCATION:Telefonische Beratung
ORGANIZER;CN=PALVAR:mailto:service@palvar.de
ATTENDEE;CN=${data.name};RSVP=TRUE:mailto:${data.email}
STATUS:TENTATIVE
TRANSP:OPAQUE
BEGIN:VALARM
ACTION:DISPLAY
DESCRIPTION:PALVAR Beratungsgespraech in 15 Minuten
TRIGGER:-PT15M
END:VALARM
END:VEVENT
END:VCALENDAR`;
}

// Email configuration for PALVAR
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'service@palvar.de';

// Send booking confirmation emails
export async function sendBookingEmails(data: {
  name: string;
  email: string;
  phone?: string;
  serviceCategory: string;
  packageName: string;
  message?: string;
  buildingType?: string;
  units?: string;
}) {
  const { client, fromEmail } = await getResendClient();
  const submittedAt = new Date().toLocaleString('de-DE', {
    dateStyle: 'full',
    timeStyle: 'short',
  });

  // Use fromEmail from integration or fallback
  const senderEmail = fromEmail || 'onboarding@resend.dev';
  const customerFrom = `PALVAR <${senderEmail}>`;
  const adminFrom = `PALVAR Buchung <${senderEmail}>`;

  console.log('=== Email Debug ===');
  console.log('Using fromEmail from integration:', senderEmail);
  console.log('Customer email to:', data.email);
  console.log('Admin email to:', ADMIN_EMAIL);

  // Generate ICS calendar file
  const icsContent = generateICSFile(data);
  const icsBase64 = Buffer.from(icsContent).toString('base64');

  // Send customer confirmation with ICS attachment
  let customerEmail;
  try {
    customerEmail = await client.emails.send({
      from: customerFrom,
      to: data.email,
      subject: 'Ihre Beratungsanfrage bei PALVAR - Bestätigung',
      html: createCustomerConfirmationEmail(data),
      attachments: [
        {
          filename: 'PALVAR-Beratungstermin.ics',
          content: icsBase64,
          contentType: 'text/calendar',
        },
      ],
    });
    console.log('Customer email result:', JSON.stringify(customerEmail, null, 2));
  } catch (customerEmailError) {
    console.error('Exception sending customer email:', customerEmailError);
    customerEmail = { error: customerEmailError };
  }

  // Send admin notification
  let adminEmail;
  try {
    adminEmail = await client.emails.send({
      from: adminFrom,
      to: ADMIN_EMAIL,
      replyTo: data.email,
      subject: `Neue Anfrage: ${data.name} - ${data.serviceCategory}/${data.packageName}`,
      html: createAdminNotificationEmail({ ...data, submittedAt }),
    });

    if (adminEmail.error) {
      console.error('Admin email error:', JSON.stringify(adminEmail.error, null, 2));
    } else {
      console.log('Admin email sent! ID:', adminEmail.data?.id);
    }
  } catch (adminEmailError) {
    console.error('Exception sending admin email:', adminEmailError);
    adminEmail = { error: adminEmailError };
  }

  return { customerEmail, adminEmail };
}

// Send partner registration email to admin
export async function sendPartnerRegistrationEmail(data: {
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  website?: string;
  trades: string[];
  employees: string;
  experience: string;
  motivation: string;
  certifications?: string;
}) {
  const { client, fromEmail } = await getResendClient();
  const senderEmail = fromEmail || 'onboarding@resend.dev';
  const adminFrom = `PALVAR Buchung <${senderEmail}>`;
  const submittedAt = new Date().toLocaleString('de-DE', {
    dateStyle: 'full',
    timeStyle: 'short',
  });

  const tradeLabels: Record<string, string> = {
    heizung: 'Heizung / Sanitär',
    elektro: 'Elektroinstallation',
    daemmung: 'Wärmedämmung / WDVS',
    dach: 'Dachdeckerei',
    fenster: 'Fenster / Türen',
    solar: 'Photovoltaik / Solar',
    lueftung: 'Lüftungstechnik',
    maler: 'Maler / Stuckateur',
    maurer: 'Maurer / Trockenbau',
    zimmerei: 'Zimmerei / Holzbau',
  };

  const tradesFormatted = data.trades.map(t => tradeLabels[t] || t).join(', ');

  const content = `
    <h1 style="margin: 0 0 24px 0; font-size: 24px; font-weight: 700; color: ${COLORS.primaryDark};">
      Neue Handwerkspartner-Bewerbung
    </h1>
    
    <p style="margin: 0 0 24px 0; font-size: 15px; color: ${COLORS.textMuted};">
      Eingegangen am ${submittedAt}
    </p>
    
    <!-- Company Data -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: ${COLORS.summaryBox}; border-radius: 12px; margin: 0 0 24px 0;">
      <tr>
        <td style="padding: 24px;">
          <h2 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 600; color: ${COLORS.primary};">
            Unternehmensdaten
          </h2>
          
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid ${COLORS.border}; width: 140px; color: ${COLORS.textMuted}; font-size: 14px;">Firma</td>
              <td style="padding: 8px 0; border-bottom: 1px solid ${COLORS.border}; color: ${COLORS.text}; font-size: 14px; font-weight: 500;">${data.companyName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid ${COLORS.border}; color: ${COLORS.textMuted}; font-size: 14px;">Ansprechpartner</td>
              <td style="padding: 8px 0; border-bottom: 1px solid ${COLORS.border}; color: ${COLORS.text}; font-size: 14px;">${data.contactPerson}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid ${COLORS.border}; color: ${COLORS.textMuted}; font-size: 14px;">E-Mail</td>
              <td style="padding: 8px 0; border-bottom: 1px solid ${COLORS.border};">
                <a href="mailto:${data.email}" style="color: ${COLORS.primary}; text-decoration: none; font-size: 14px;">${data.email}</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid ${COLORS.border}; color: ${COLORS.textMuted}; font-size: 14px;">Telefon</td>
              <td style="padding: 8px 0; border-bottom: 1px solid ${COLORS.border};">
                <a href="tel:${data.phone}" style="color: ${COLORS.primary}; text-decoration: none; font-size: 14px;">${data.phone}</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid ${COLORS.border}; color: ${COLORS.textMuted}; font-size: 14px;">Adresse</td>
              <td style="padding: 8px 0; border-bottom: 1px solid ${COLORS.border}; color: ${COLORS.text}; font-size: 14px;">${data.address}</td>
            </tr>
            ${data.website ? `
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid ${COLORS.border}; color: ${COLORS.textMuted}; font-size: 14px;">Website</td>
              <td style="padding: 8px 0; border-bottom: 1px solid ${COLORS.border};">
                <a href="${data.website.startsWith('http') ? data.website : 'https://' + data.website}" style="color: ${COLORS.primary}; text-decoration: none; font-size: 14px;">${data.website}</a>
              </td>
            </tr>
            ` : ''}
            <tr>
              <td style="padding: 8px 0; color: ${COLORS.textMuted}; font-size: 14px;">Mitarbeiter</td>
              <td style="padding: 8px 0; color: ${COLORS.text}; font-size: 14px;">${data.employees}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    
    <!-- Trades -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: ${COLORS.summaryBox}; border-radius: 12px; margin: 0 0 24px 0;">
      <tr>
        <td style="padding: 24px;">
          <h2 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 600; color: ${COLORS.primary};">
            Gewerke
          </h2>
          <p style="margin: 0; font-size: 14px; color: ${COLORS.text};">${tradesFormatted}</p>
        </td>
      </tr>
    </table>
    
    <!-- Experience & Motivation -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: ${COLORS.summaryBox}; border-radius: 12px; margin: 0 0 24px 0;">
      <tr>
        <td style="padding: 24px;">
          <h2 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 600; color: ${COLORS.primary};">
            Erfahrung
          </h2>
          <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: ${COLORS.text}; white-space: pre-wrap;">${data.experience}</p>
          
          <h2 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 600; color: ${COLORS.primary};">
            Motivation
          </h2>
          <p style="margin: 0; font-size: 14px; line-height: 1.6; color: ${COLORS.text}; white-space: pre-wrap;">${data.motivation}</p>
        </td>
      </tr>
    </table>
    
    ${data.certifications ? `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: ${COLORS.summaryBox}; border-radius: 12px; margin: 0 0 24px 0;">
      <tr>
        <td style="padding: 24px;">
          <h2 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 600; color: ${COLORS.primary};">
            Zertifizierungen
          </h2>
          <p style="margin: 0; font-size: 14px; line-height: 1.6; color: ${COLORS.text}; white-space: pre-wrap;">${data.certifications}</p>
        </td>
      </tr>
    </table>
    ` : ''}
    
    <p style="margin: 32px 0 0 0; padding: 16px; background-color: #dbeafe; border-radius: 8px; font-size: 14px; color: #1e40af;">
      <strong>Aktion erforderlich:</strong> Bitte prüfen Sie die Bewerbung und kontaktieren Sie den Interessenten innerhalb von 5 Werktagen.
    </p>
  `;

  const result = await client.emails.send({
    from: adminFrom,
    to: ADMIN_EMAIL,
    replyTo: data.email,
    subject: `Neue Handwerkspartner-Bewerbung: ${data.companyName}`,
    html: baseTemplate(content, `Neue Handwerkspartner-Bewerbung von ${data.companyName} - ${tradesFormatted}`),
  });

  console.log('Partner registration email sent to admin:', ADMIN_EMAIL);
  return result;
}

// Send calculator results email
export async function sendCalculatorResultsEmail(data: {
  name?: string;
  email: string;
  calculatorType: string;
  results: { label: string; value: string }[];
  inputs: { label: string; value: string }[];
}) {
  const { client, fromEmail } = await getResendClient();
  const senderEmail = fromEmail || 'onboarding@resend.dev';
  const customerFrom = `PALVAR <${senderEmail}>`;

  const typeNames: Record<string, string> = {
    heizung: 'Heizungstausch',
    pv: 'Photovoltaik',
    daemmung: 'Dämmung',
    komplett: 'Komplettsanierung',
  };

  const typeName = typeNames[data.calculatorType] || 'Wirtschaftlichkeit';

  const result = await client.emails.send({
    from: customerFrom,
    to: data.email,
    subject: `Ihre ${typeName}-Berechnung von PALVAR`,
    html: createCalculatorResultsEmail(data),
  });

  return result;
}
