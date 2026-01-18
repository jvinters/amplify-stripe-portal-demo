import Stripe from 'stripe';
import { Schema } from '../../data/resource';

/**
 * The type of the createPortalSession function handler
 */
type CreatePortalSessionFunctionHandler = Schema["createPortalSession"]["functionHandler"];

/**
 * The Stripe client
 */
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

/**
 * Creates a Stripe Billing Portal session
 * @param event - The event containing the return URL
 * @returns The portal session
 */
export const handler: CreatePortalSessionFunctionHandler = async (event) => {
  const customerId = process.env.STRIPE_CUSTOMER_ID!;

  if (!customerId) {
    throw new Error('STRIPE_CUSTOMER_ID is not set');
  }

  const { returnUrl } = event.arguments;

  if (!returnUrl) {
    throw new Error('returnUrl is not set');
  }

    const portalSessionQuery = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    },
  );

  console.log(portalSessionQuery.url);

  return {
    url: portalSessionQuery.url,
  };
};
