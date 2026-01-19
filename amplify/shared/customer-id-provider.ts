import { getRequiredEnv } from './env';

/**
 * Function type for providing a Stripe customer ID from various sources (env vars, JWT tokens, storage, etc.)
 */
export type CustomerIdProvider = () => Promise<string>;

/**
 * Provider that retrieves the customer ID from the STRIPE_CUSTOMER_ID environment variable.
 */
export const envCustomerIdProvider: CustomerIdProvider = async () => {
  return getRequiredEnv('STRIPE_CUSTOMER_ID');
};