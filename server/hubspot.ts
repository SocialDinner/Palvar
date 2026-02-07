// HubSpot Integration - Replit Connector with Complete Property Mapping
import { Client } from '@hubspot/api-client';
import {
  mapToHubSpotProperties,
  BOOKING_PROPERTY_MAP,
  CALCULATOR_PROPERTY_MAP,
  CAREER_PROPERTY_MAP,
  PARTNER_PROPERTY_MAP,
  CONFIRMATION_PROPERTIES,
} from './hubspotPropertyMap';

let connectionSettings: any;

// Retry helper with exponential backoff
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      
      // Don't retry on 409 (conflict/duplicate) - handle via upsert
      if (error?.code === 409) {
        throw error;
      }
      
      // Don't retry on 400 (bad request) - that's a client error
      if (error?.response?.status === 400) {
        throw error;
      }
      
      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt - 1);
        console.log(`HubSpot retry attempt ${attempt}/${maxRetries} after ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  console.error(`HubSpot operation failed after ${maxRetries} attempts`);
  throw lastError;
}

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
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
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=hubspot',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings?.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('HubSpot not connected');
  }
  return accessToken;
}

async function getUncachableHubSpotClient() {
  const accessToken = await getAccessToken();
  return new Client({ accessToken });
}

// Form types for HubSpot workflow triggers
export type FormType = 'booking' | 'calculator' | 'partner' | 'career';

/**
 * Find existing contact by email
 */
async function findContactByEmail(hubspot: Client, email: string): Promise<string | null> {
  try {
    const response = await hubspot.crm.contacts.searchApi.doSearch({
      filterGroups: [{
        filters: [{
          propertyName: 'email',
          operator: 'EQ',
          value: email,
        }]
      }],
      properties: ['email'],
      limit: 1,
    });
    
    if (response.results && response.results.length > 0) {
      return response.results[0].id;
    }
    return null;
  } catch (error) {
    console.log('Contact search failed, will try to create');
    return null;
  }
}

/**
 * Create or update contact based on email (upsert pattern)
 */
async function upsertContact(
  hubspot: Client,
  email: string,
  properties: Record<string, string>,
  formType: FormType
): Promise<{ contactId: string; created: boolean }> {
  // Check if contact exists
  const existingContactId = await findContactByEmail(hubspot, email);
  
  if (existingContactId) {
    // Update existing contact
    await hubspot.crm.contacts.basicApi.update(existingContactId, {
      properties: {
        ...properties,
        [CONFIRMATION_PROPERTIES[formType].type]: CONFIRMATION_PROPERTIES[formType].value,
      }
    });
    console.log(`HubSpot contact updated for ${formType}:`, existingContactId);
    return { contactId: existingContactId, created: false };
  }
  
  // Create new contact with standard properties
  const createProperties = {
    ...properties,
    hs_lead_status: 'NEW',
    lifecyclestage: 'lead',
  };
  
  const contact = await hubspot.crm.contacts.basicApi.create({
    properties: createProperties,
    associations: []
  });
  
  console.log(`HubSpot contact created for ${formType}:`, contact.id);
  
  // Set confirmation property for workflow trigger
  try {
    await hubspot.crm.contacts.basicApi.update(contact.id, {
      properties: {
        [CONFIRMATION_PROPERTIES[formType].type]: CONFIRMATION_PROPERTIES[formType].value,
      }
    });
    console.log(`HubSpot ${CONFIRMATION_PROPERTIES[formType].type} set to true for workflow trigger`);
  } catch (updateError) {
    console.log(`Custom property ${CONFIRMATION_PROPERTIES[formType].type} update skipped - create it in HubSpot`);
  }
  
  return { contactId: contact.id, created: true };
}

/**
 * Add a note to a contact
 */
async function addNoteToContact(hubspot: Client, contactId: string, noteBody: string): Promise<void> {
  try {
    await hubspot.crm.objects.notes.basicApi.create({
      properties: {
        hs_note_body: noteBody,
        hs_timestamp: new Date().toISOString(),
      },
      associations: [{
        to: { id: contactId },
        types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 202 }]
      }]
    });
  } catch (noteError) {
    console.log('Note creation skipped (optional)');
  }
}

// ==========================================
// PUBLIC API - Form-specific sync functions
// ==========================================

/**
 * Sync booking form data to HubSpot
 * Creates or updates contact based on email
 */
export async function createBookingContact(data: {
  name: string;
  email: string;
  phone?: string;
  service: string;
  message?: string;
  packageType?: string;
  buildingType?: string;
}) {
  return withRetry(async () => {
    const hubspot = await getUncachableHubSpotClient();
    
    // Map form data to HubSpot properties using mapping layer
    const { properties, unmappedFields } = mapToHubSpotProperties(data, BOOKING_PROPERTY_MAP);
    
    // Log unmapped fields for debugging
    if (unmappedFields.length > 0) {
      console.log('Unmapped booking fields (not sent to HubSpot):', unmappedFields);
    }
    
    // Upsert contact
    const { contactId, created } = await upsertContact(hubspot, data.email, properties, 'booking');
    
    // Add detailed note with all booking info
    const notes = [
      `Anfrage: ${data.service}`,
      data.packageType ? `Paket: ${data.packageType}` : '',
      data.buildingType ? `Gebäudetyp: ${data.buildingType}` : '',
      data.message ? `Nachricht: ${data.message}` : '',
    ].filter(Boolean).join('\n');
    
    await addNoteToContact(hubspot, contactId, notes);
    
    return { contactId, created };
  });
}

/**
 * Sync calculator form data to HubSpot
 */
export async function createCalculatorContact(data: {
  email: string;
  name?: string;
  calculatorType: string;
}) {
  return withRetry(async () => {
    const hubspot = await getUncachableHubSpotClient();
    
    const { properties, unmappedFields } = mapToHubSpotProperties(data, CALCULATOR_PROPERTY_MAP);
    
    if (unmappedFields.length > 0) {
      console.log('Unmapped calculator fields:', unmappedFields);
    }
    
    const { contactId, created } = await upsertContact(hubspot, data.email, properties, 'calculator');
    
    await addNoteToContact(hubspot, contactId, `Rechner-Anfrage: ${data.calculatorType}`);
    
    return { contactId, created };
  });
}

/**
 * Sync career application to HubSpot
 */
export async function createCareerContact(data: {
  name: string;
  email: string;
  phone?: string;
  position: string;
}) {
  return withRetry(async () => {
    const hubspot = await getUncachableHubSpotClient();
    
    const { properties, unmappedFields } = mapToHubSpotProperties(data, CAREER_PROPERTY_MAP);
    
    if (unmappedFields.length > 0) {
      console.log('Unmapped career fields:', unmappedFields);
    }
    
    const { contactId, created } = await upsertContact(hubspot, data.email, properties, 'career');
    
    await addNoteToContact(hubspot, contactId, `Karriere-Bewerbung: ${data.position}`);
    
    return { contactId, created };
  });
}

/**
 * Sync partner registration to HubSpot
 */
export async function createPartnerContact(data: {
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  website?: string;
  trades: string[];
}) {
  return withRetry(async () => {
    const hubspot = await getUncachableHubSpotClient();
    
    const { properties, unmappedFields } = mapToHubSpotProperties(data, PARTNER_PROPERTY_MAP);
    
    if (unmappedFields.length > 0) {
      console.log('Unmapped partner fields:', unmappedFields);
    }
    
    const { contactId, created } = await upsertContact(hubspot, data.email, properties, 'partner');
    
    // Create company record
    try {
      const company = await hubspot.crm.companies.basicApi.create({
        properties: {
          name: data.companyName,
          phone: data.phone,
          website: data.website || '',
          address: data.address,
          description: `Handwerkspartner - Gewerke: ${data.trades.join(', ')}`,
        },
        associations: []
      });
      console.log('HubSpot company created:', company.id);
    } catch (companyError) {
      console.log('Company creation skipped (may already exist)');
    }
    
    await addNoteToContact(hubspot, contactId, `Partner-Registrierung: ${data.companyName}\nGewerke: ${data.trades.join(', ')}`);
    
    return { contactId, created };
  });
}

/**
 * Generic sync function for any form data
 * Use this for flexible form handling with explicit property mapping
 */
export async function syncFormToHubSpot(
  formType: FormType,
  data: Record<string, any>,
  propertyMap: Record<string, any>
): Promise<{ success: boolean; contactId?: string; error?: string }> {
  try {
    const hubspot = await getUncachableHubSpotClient();
    
    const { properties, unmappedFields } = mapToHubSpotProperties(data, propertyMap);
    
    if (unmappedFields.length > 0) {
      console.log(`Unmapped ${formType} fields:`, unmappedFields);
    }
    
    if (!data.email) {
      console.error('Email is required for HubSpot sync');
      return { success: false, error: 'Email is required' };
    }
    
    const { contactId } = await upsertContact(hubspot, data.email, properties, formType);
    
    return { success: true, contactId };
  } catch (error: any) {
    console.error(`HubSpot ${formType} sync failed:`, error.message);
    return { success: false, error: error.message };
  }
}
