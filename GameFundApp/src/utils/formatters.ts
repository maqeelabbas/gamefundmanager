// src/utils/formatters.ts

/**
 * Format a number as a currency string
 * @param amount Amount to format
 * @param currency Currency code (default: EUR)
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number, currency: string = 'EUR'): string => {
  // Use a different symbol based on the currency
  let symbol = '€';
  switch (currency.toUpperCase()) {
    case 'USD':
      symbol = '$';
      break;
    case 'GBP':
      symbol = '£';
      break;
    // Add more currencies as needed
    default:
      symbol = '€'; // Default to Euro
  }

  // Format the number with 2 decimal places
  return `${symbol}${amount.toFixed(2)}`;
};

/**
 * Format a date as a readable string
 * @param date Date to format
 * @returns Formatted date string
 */
export const formatDate = (date: Date | string): string => {
  if (!date) return 'N/A';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return 'Invalid date';
  
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Return relative time (e.g. "2 hours ago")
 * @param date Date to compare
 * @returns Formatted relative time string
 */
export const getRelativeTime = (date: Date | string): string => {
  if (!date) return 'N/A';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return 'Invalid date';
  
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHour = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHour / 24);
  
  if (diffSec < 60) {
    return 'Just now';
  } else if (diffMin < 60) {
    return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`;
  } else if (diffHour < 24) {
    return `${diffHour} hour${diffHour !== 1 ? 's' : ''} ago`;
  } else if (diffDay < 7) {
    return `${diffDay} day${diffDay !== 1 ? 's' : ''} ago`;
  } else {
    return formatDate(dateObj);
  }
};
