import Stripe from 'stripe';
import { Schema } from '../../data/resource';

type SubscriptionResponse = Schema["SubscriptionResponse"]["type"];
type SubscriptionStatus = SubscriptionResponse['subscriptionStatus'];
type GetSubscriptionsFunctionHandler = Schema["getSubscriptions"]["functionHandler"];

type StripeSubscription = Stripe.Subscription & {
  plan: Stripe.Plan;
};

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
 * Maps a Stripe subscription status to our SubscriptionStatus type
 * @param status - The Stripe subscription status
 * @returns The mapped SubscriptionStatus
 * @throws {Error} If the status is not supported
 */
function mapSubscriptionStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
  switch (status) {
    case 'active':
    case 'trialing':
    case 'past_due':
    case 'canceled':
    case 'unpaid':
    case 'incomplete':
    case 'incomplete_expired':
    case 'paused':
      return status;
    default:
      throw new Error(`Unsupported subscription status: ${status}`);
  }
}

/**
 * Extracts period information from a subscription item
 * @param item - The subscription item
 * @returns Object with currentPeriodStart and currentPeriodEnd as ISO strings
 * @throws {Error} If the item is missing required period information
 */
function extractPeriodInfo(item: Stripe.SubscriptionItem): {
  currentPeriodStart: string;
  currentPeriodEnd: string;
} {
  if (!item.current_period_start || !item.current_period_end) {
    throw new Error('Subscription item is missing period information');
  }

  return {
    currentPeriodStart: new Date(item.current_period_start * 1000).toISOString(),
    currentPeriodEnd: new Date(item.current_period_end * 1000).toISOString(),
  };
}

/**
 * Transforms a Stripe subscription to our SubscriptionResponse format
 * @param subscription - The Stripe subscription
 * @returns The transformed subscription response
 * @throws {Error} If the subscription is missing required data
 */
function transformSubscription(subscription: StripeSubscription): SubscriptionResponse {
  if (!subscription.items?.data || subscription.items.data.length === 0) {
    throw new Error(`Subscription ${subscription.id} has no items`);
  }

  const firstItem = subscription.items.data[0];
  const periodInfo = extractPeriodInfo(firstItem);
  const product = subscription.plan.product as Stripe.Product | undefined;

  return {
    subscriptionId: subscription.id,
    subscriptionStatus: mapSubscriptionStatus(subscription.status),
    planName: product?.name ?? 'Unknown Plan',
    price: subscription.plan.amount ?? 0,
    currency: subscription.plan.currency ?? 'usd',
    currentPeriodStart: periodInfo.currentPeriodStart,
    currentPeriodEnd: periodInfo.currentPeriodEnd,
  } satisfies SubscriptionResponse;
}

/**
 * Gets all subscriptions for the authenticated user
 * @returns Array of subscription responses
 * @throws {Error} If environment variables are missing or Stripe API call fails
 */
export const handler: GetSubscriptionsFunctionHandler = async () => {
  const { secretKey, customerId } = validateEnvironment();
  const stripe = createStripeClient(secretKey);

  try {
    const subscriptionsQuery = await stripe.subscriptions.list({
      customer: customerId,
      expand: ['data.plan.product'],
    });

    return subscriptionsQuery.data.map((subscription) => {
      const stripeSubscription = subscription as StripeSubscription;
      return transformSubscription(stripeSubscription);
    });
  } catch (error) {
    if (error instanceof Stripe.errors.StripeError) {
      throw new Error(`Stripe API error: ${error.message}`);
    }
    throw error;
  }
};
