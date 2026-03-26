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

  // If access check is successful and user has access, no setup needed
  if (accessData?.success && accessData?.has_access) {
    return { needsSetup: false };
  }

  // Individual users need to pay immediately if they don't have access
  if (user.role?.name === 'Individual') {
    return {
      needsSetup: true,
      reason: 'Individual users must complete payment to access the system',
      redirectTo: '/billing-setup',
    };
  }

  // Corporate SuperAdmin users need to set up billing if they don't have access
  if (user.role?.name === 'SuperAdmin' && user.corporate) {
    // If no access and no trial, they need to set up billing
    if (!accessData?.has_access) {
      return {
        needsSetup: true,
        reason: 'Please provide billing contact information to start your trial',
        redirectTo: '/billing-setup',
      };
    }
  }

  return { needsSetup: false };
}
