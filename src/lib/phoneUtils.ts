import { parsePhoneNumberFromString, CountryCode } from 'libphonenumber-js';

/**
 * Formats a raw phone number string into E.164 format.
 * Specifically handles Moroccan local numbers (06... or 07...) by prefixing with +212.
 * 
 * @param phone The raw phone number string
 * @param defaultCountry The default country code (e.g., 'MA')
 * @returns The formatted E.164 number or null if invalid
 */
export const formatToE164 = (phone: string, defaultCountry: CountryCode = 'MA'): string | null => {
  // Remove all non-numeric characters except '+'
  let cleaned = phone.replace(/[^\d+]/g, '');

  // Handle Moroccan local format (06... or 07...)
  if (defaultCountry === 'MA' && cleaned.startsWith('0') && (cleaned.startsWith('06') || cleaned.startsWith('07'))) {
    cleaned = '+212' + cleaned.substring(1);
  }

  // If it doesn't start with '+', assume it's a local number for the default country
  // and try to parse it. If it starts with '+', parse it as is.
  try {
    const phoneNumber = parsePhoneNumberFromString(cleaned, defaultCountry);
    if (phoneNumber && phoneNumber.isValid()) {
      return phoneNumber.format('E.164');
    }
  } catch (error) {
    console.error('Phone parsing error:', error);
  }

  return null;
};

/**
 * Formats a phone number for display as the user types.
 * 
 * @param phone The raw phone number string
 * @param country The country code
 * @returns A formatted string for the input field
 */
export const formatDisplayPhone = (phone: string, country: CountryCode = 'MA'): string => {
  // Just a simple cleaner for now, libphonenumber-js AsYouType can be used for more complex cases
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  // If user is typing a local Moroccan number starting with 0
  if (country === 'MA' && cleaned.startsWith('0')) {
    // Format as 06 12 34 56 78
    const match = cleaned.match(/^(\d{2})(\d{0,2})(\d{0,2})(\d{0,2})(\d{0,2})$/);
    if (match) {
      return [match[1], match[2], match[3], match[4], match[5]].filter(Boolean).join(' ');
    }
  }

  try {
    const phoneNumber = parsePhoneNumberFromString(cleaned, country);
    if (phoneNumber) {
      return phoneNumber.formatInternational();
    }
  } catch (e) {
    // Fallback to cleaned
  }

  return cleaned;
};
