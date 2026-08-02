export function isOutOfCreditsError(error: any): boolean {
  return error?.response?.status === 402 ||
    error?.message?.includes('free AI generations') ||
    error?.message?.includes('Purchase more');
}

export const BUNDLE_CREDITS = 10;
export const BUNDLE_PRICE_GHS = '20.00';
