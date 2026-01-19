import Stripe from 'stripe';
import { getRequiredEnv } from './env';

/**
 * Stripe API version to use
 */
const STRIPE_API_VERSION : Stripe.LatestApiVersion = '2025-12-15.clover';

/**
 * Creates and returns a configured Stripe client instance
 * @returns Configured Stripe client
 * @throws {Error} If STRIPE_SECRET_KEY environment variable is not set
 */
export function createStripeClient(): Stripe {
  const secretKey = getRequiredEnv('STRIPE_SECRET_KEY');

  return new Stripe(secretKey, {
    apiVersion: STRIPE_API_VERSION,
  });
}
