import Stripe from 'stripe';
import { Schema } from '../../data/resource';

type SubscriptionResponse = Schema["SubscriptionResponse"]["type"];
type SubscriptionStatus = SubscriptionResponse['subscriptionStatus'];
type GetSubscriptionsFunctionHandler = Schema["getSubscriptions"]["functionHandler"];

type StripeSubscription = Stripe.Subscription & {
  plan: Stripe.Plan;
};

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
  const customerId = await envCustomerIdProvider();
  const stripe = createStripeClient();

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
