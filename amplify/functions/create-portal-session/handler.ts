import Stripe from 'stripe';
import { Schema } from '../../data/resource';

type CreatePortalSessionFunctionHandler = Schema["createPortalSession"]["functionHandler"];

/**
 * Validates that required environment variables are set
 * @throws {Error} If required environment variables are missing
 */
function validateEnvironment(): { secretKey: string; customerId: string } {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const customerId = process.env.STRIPE_CUSTOMER_ID;

  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY environment variable is not set');
  }

  if (!customerId) {
    throw new Error('STRIPE_CUSTOMER_ID environment variable is not set');
  }

  return { secretKey, customerId };
}

/**
 * Initializes and returns the Stripe client
 * @param secretKey - The Stripe secret key
 * @returns Configured Stripe client instance
 */
function createStripeClient(secretKey: string): Stripe {
  return new Stripe(secretKey, {
    apiVersion: '2025-12-15.clover',
  });
}

/**
 * Validates that the return URL is a valid URL format
 * @param returnUrl - The return URL to validate
 * @throws {Error} If the return URL is invalid
 */
function validateReturnUrl(returnUrl: string): void {
  if (!returnUrl || typeof returnUrl !== 'string' || returnUrl.trim().length === 0) {
    throw new Error('returnUrl is required and must be a non-empty string');
  }

  try {
    const url = new URL(returnUrl);
    if (!['http:', 'https:'].includes(url.protocol)) {
      throw new Error('returnUrl must use http or https protocol');
    }
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(`returnUrl must be a valid URL: ${returnUrl}`);
    }
    throw error;
  }
}

/**
 * Creates a Stripe Billing Portal session for the customer
 * @param stripe - The Stripe client instance
 * @param customerId - The Stripe customer ID
 * @param returnUrl - The URL to redirect to after the portal session
 * @returns The portal session URL
 * @throws {Error} If the portal session creation fails
 */
async function createPortalSession(
  stripe: Stripe,
  customerId: string,
  returnUrl: string
): Promise<string> {
  try {
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    if (!portalSession.url) {
      throw new Error('Portal session created but URL is missing');
    }

    return portalSession.url;
  } catch (error) {
    if (error instanceof Stripe.errors.StripeError) {
      throw new Error(`Stripe API error: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Creates a Stripe Billing Portal session
 * @param event - The event containing the return URL argument
 * @returns Object containing the portal session URL
 * @throws {Error} If environment variables are missing, returnUrl is invalid, or Stripe API call fails
 */
export const handler: CreatePortalSessionFunctionHandler = async (event) => {
  const { secretKey, customerId } = validateEnvironment();
  const stripe = createStripeClient(secretKey);

  const { returnUrl } = event.arguments;
  validateReturnUrl(returnUrl);

  const url = await createPortalSession(stripe, customerId, returnUrl);

  return {
    url,
  };
};
