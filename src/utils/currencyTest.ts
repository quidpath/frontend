/**
 * Currency conversion test utilities
 * Use this to verify currency conversions are working correctly
 */

import { convertAmount, CurrencyCode } from '@/store/currencyStore';

// Example rates (these would come from the API)
const exampleRates = {
  KES: 1,
  USD: 0.0077,  // 1 KES = 0.0077 USD
  EUR: 0.0071,  // 1 KES = 0.0071 EUR
  GBP: 0.0061,  // 1 KES = 0.0061 GBP
  UGX: 28.5,    // 1 KES = 28.5 UGX
  TZS: 19.8,    // 1 KES = 19.8 TZS
};

/**
 * Test currency conversion
 */
export function testCurrencyConversion() {
  console.group('Currency Conversion Tests');
  
  // Test 1: Same currency (should return same amount)
  const test1 = convertAmount(1000, exampleRates, 'KES', 'KES');
  console.log('Test 1 - Same currency (1000 KES to KES):', test1, test1 === 1000 ? '✅' : '❌');
  
  // Test 2: KES to USD
  const test2 = convertAmount(1000, exampleRates, 'KES', 'USD');
  console.log('Test 2 - KES to USD (1000 KES to USD):', test2.toFixed(2), test2.toFixed(2) === '7.70' ? '✅' : '❌');
  
  // Test 3: USD to KES (reverse)
  const test3 = convertAmount(7.70, exampleRates, 'USD', 'KES');
  console.log('Test 3 - USD to KES (7.70 USD to KES):', test3.toFixed(2), Math.abs(test3 - 1000) < 1 ? '✅' : '❌');
  
  // Test 4: Cross currency (USD to EUR)
  const test4 = convertAmount(100, exampleRates, 'USD', 'EUR');
  const expected4 = (100 / exampleRates.USD) * exampleRates.EUR;
  console.log('Test 4 - USD to EUR (100 USD to EUR):', test4.toFixed(2), Math.abs(test4 - expected4) < 0.01 ? '✅' : '❌');
  
  // Test 5: Zero amount
  const test5 = convertAmount(0, exampleRates, 'KES', 'USD');
  console.log('Test 5 - Zero amount:', test5, test5 === 0 ? '✅' : '❌');
  
  // Test 6: Negative amount (should work)
  const test6 = convertAmount(-1000, exampleRates, 'KES', 'USD');
  console.log('Test 6 - Negative amount (-1000 KES to USD):', test6.toFixed(2), test6.toFixed(2) === '-7.70' ? '✅' : '❌');
  
  console.groupEnd();
}

/**
 * Format test results
 */
export function testCurrencyFormatting() {
  console.group('Currency Formatting Tests');
  
  const testCases = [
    { amount: 1000, currency: 'KES', expected: 'KSh 1,000.00' },
    { amount: 1234.56, currency: 'USD', expected: '$1,234.56' },
    { amount: 999.99, currency: 'EUR', expected: '€999.99' },
    { amount: 0, currency: 'GBP', expected: '£0.00' },
  ];
  
  testCases.forEach((test, index) => {
    try {
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: test.currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(test.amount);
      
      console.log(`Test ${index + 1} - ${test.currency}:`, formatted);
    } catch (error) {
      console.error(`Test ${index + 1} - ${test.currency} failed:`, error);
    }
  });
  
  console.groupEnd();
}

/**
 * Run all tests
 */
export function runAllCurrencyTests() {
  console.log('🧪 Running Currency System Tests...\n');
  testCurrencyConversion();
  console.log('');
  testCurrencyFormatting();
  console.log('\n✅ All tests completed');
}
