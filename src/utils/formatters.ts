/**
 * Centralized Business Currency Formatter for Devolatical Global Info-Tech & Analytics.
 * Standardizes monetary values to Indian Rupees (INR / ₹) using en-IN locale formatting.
 *
 * @param amount Numeric value or numeric string to format
 * @param currency ISO 4217 currency code (defaults to 'INR')
 * @returns Formatted currency string (e.g. ₹10,000.00)
 */
export function formatCurrency(amount?: number | string | null, currency = 'INR'): string {
  const numericAmount = Number(amount || 0);
  if (isNaN(numericAmount)) {
    return '₹0.00';
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(numericAmount);
}
