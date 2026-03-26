/**
 * Billing check utility to determine if user needs billing setup
 */

export interface BillingCheckResult {
  needsSetup: boolean;
  reason?: string;
  redirectTo?: string;
}

export function checkBillingSetup(user: any, accessData: any): BillingCheckResult {
  if (!user) {
    return { needsSetup: false };
  }

  // Check if user has access
  if (accessData?.has_access) {
    return { needsSetup: false };
  }

  // Individual users need to pay immediately
  if (user.role?.name === 'Individual') {
    return {
      needsSetup: true,
      reason: 'Individual users must complete payment to access the system',
      redirectTo: '/billing-setup',
    };
  }

  // Corporate users need to set up billing contact
  if (user.role?.name === 'SuperAdmin' && user.corporate) {
    // Check if corporate has phone number set
    if (!user.corporate.phone && !accessData?.trial) {
      return {
        needsSetup: true,
        reason: 'Please provide billing contact information to start your trial',
        redirectTo: '/billing-setup',
      };
    }
  }

  return { needsSetup: false };
}
