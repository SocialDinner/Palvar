/**
 * HubSpot Property Mapping Layer
 * Controls which form fields are sent to HubSpot and how they are mapped
 * 
 * IMPORTANT: Custom properties must be created in HubSpot before use:
 * Settings > Properties > Contact Properties > Create Property
 */

// Internal fields that should NEVER be sent to HubSpot
export const EXCLUDED_FIELDS = [
  'id',
  'createdAt',
  'updatedAt',
  'consentGiven',
  'consentTimestamp',
  'marketingConsent',
  'status',
  'internalNotes',
  'dbId',
] as const;

// Property type definitions for HubSpot
export type HubSpotPropertyType = 'string' | 'number' | 'date' | 'enumeration' | 'bool';

interface PropertyMapping {
  hubspotName: string;
  type: HubSpotPropertyType;
  description?: string;
}

// Booking form field to HubSpot property mapping
export const BOOKING_PROPERTY_MAP: Record<string, PropertyMapping> = {
  // Standard HubSpot properties
  name: { hubspotName: '_split_name', type: 'string', description: 'Split into firstname/lastname' },
  email: { hubspotName: 'email', type: 'string' },
  phone: { hubspotName: 'phone', type: 'string' },
  
  // Custom properties (created in HubSpot)
  service: { hubspotName: 'booking_type', type: 'string', description: 'Service type requested' },
  message: { hubspotName: 'booking_message', type: 'string', description: 'Customer message' },
  packageType: { hubspotName: 'booking_package', type: 'string', description: 'Selected package' },
  // buildingType: { hubspotName: 'palvar_building_type', type: 'string', description: 'Building type (EFH, ZFH, MFH)' },
};

// Calculator form field to HubSpot property mapping
export const CALCULATOR_PROPERTY_MAP: Record<string, PropertyMapping> = {
  name: { hubspotName: '_split_name', type: 'string' },
  email: { hubspotName: 'email', type: 'string' },
  // calculatorType: { hubspotName: 'calculator_type', type: 'string', description: 'Calculator used' },
};

// Career form field to HubSpot property mapping
export const CAREER_PROPERTY_MAP: Record<string, PropertyMapping> = {
  name: { hubspotName: '_split_name', type: 'string' },
  email: { hubspotName: 'email', type: 'string' },
  phone: { hubspotName: 'phone', type: 'string' },
  // position: { hubspotName: 'career_position', type: 'string', description: 'Position applied for' },
};

// Partner form field to HubSpot property mapping
export const PARTNER_PROPERTY_MAP: Record<string, PropertyMapping> = {
  contactPerson: { hubspotName: '_split_name', type: 'string' },
  email: { hubspotName: 'email', type: 'string' },
  phone: { hubspotName: 'phone', type: 'string' },
  companyName: { hubspotName: 'company', type: 'string' },
  website: { hubspotName: 'website', type: 'string' },
  address: { hubspotName: 'address', type: 'string' },
  // trades: { hubspotName: 'partner_trades', type: 'string', description: 'Trade types (comma-separated)' },
};

// Confirmation properties for workflow triggers
export const CONFIRMATION_PROPERTIES = {
  booking: { type: 'booking_confirmed', value: 'true' },
  calculator: { type: 'calculator_confirmed', value: 'true' },
  career: { type: 'career_confirmed', value: 'true' },
  partner: { type: 'partner_confirmed', value: 'true' },
} as const;

/**
 * Maps form data to HubSpot properties
 * @param data - Raw form data
 * @param propertyMap - Property mapping configuration
 * @returns Object with { properties, unmappedFields }
 */
export function mapToHubSpotProperties(
  data: Record<string, any>,
  propertyMap: Record<string, PropertyMapping>
): { properties: Record<string, string>; unmappedFields: string[] } {
  const properties: Record<string, string> = {};
  const unmappedFields: string[] = [];
  
  for (const [formField, value] of Object.entries(data)) {
    // Skip excluded/internal fields
    if (EXCLUDED_FIELDS.includes(formField as any)) {
      continue;
    }
    
    // Skip null/undefined values
    if (value === null || value === undefined || value === '') {
      continue;
    }
    
    const mapping = propertyMap[formField];
    
    if (!mapping) {
      unmappedFields.push(formField);
      continue;
    }
    
    // Handle special _split_name case
    if (mapping.hubspotName === '_split_name') {
      const nameParts = String(value).trim().split(' ');
      properties['firstname'] = nameParts[0] || '';
      properties['lastname'] = nameParts.slice(1).join(' ') || '';
      continue;
    }
    
    // Handle arrays (e.g., trades)
    if (Array.isArray(value)) {
      properties[mapping.hubspotName] = value.join(', ');
      continue;
    }
    
    // Handle other types
    properties[mapping.hubspotName] = String(value);
  }
  
  return { properties, unmappedFields };
}

/**
 * Get all custom properties that need to be created in HubSpot
 */
export function getRequiredCustomProperties(): Array<{
  name: string;
  type: HubSpotPropertyType;
  description: string;
  formType: string;
}> {
  const allMappings = [
    { map: BOOKING_PROPERTY_MAP, formType: 'Booking' },
    { map: CALCULATOR_PROPERTY_MAP, formType: 'Calculator' },
    { map: CAREER_PROPERTY_MAP, formType: 'Career' },
    { map: PARTNER_PROPERTY_MAP, formType: 'Partner' },
  ];
  
  const customProperties: Array<{
    name: string;
    type: HubSpotPropertyType;
    description: string;
    formType: string;
  }> = [];
  
  const standardProperties = ['email', 'phone', 'company', 'website', 'address', 'firstname', 'lastname'];
  
  for (const { map, formType } of allMappings) {
    for (const [, mapping] of Object.entries(map)) {
      if (
        mapping.hubspotName !== '_split_name' &&
        !standardProperties.includes(mapping.hubspotName) &&
        !customProperties.some(p => p.name === mapping.hubspotName)
      ) {
        customProperties.push({
          name: mapping.hubspotName,
          type: mapping.type,
          description: mapping.description || `Property for ${formType} form`,
          formType,
        });
      }
    }
  }
  
  // Add confirmation properties
  for (const [formType, conf] of Object.entries(CONFIRMATION_PROPERTIES)) {
    customProperties.push({
      name: conf.type,
      type: 'string',
      description: `Set to "true" after ${formType} sync for workflow trigger`,
      formType: formType.charAt(0).toUpperCase() + formType.slice(1),
    });
  }
  
  return customProperties;
}
