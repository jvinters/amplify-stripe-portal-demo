import Stripe from 'stripe';
import { Schema } from '../../data/resource';

type SubscriptionResponse = Schema["SubscriptionResponse"]["type"];

/**
 * The SubscriptionStatus type
 */
type SubscriptionStatus = SubscriptionResponse['subscriptionStatus'];

/**
 * The type of the getSubscriptions function handler
 */
type GetSubscriptionsFunctionHandler = Schema["getSubscriptions"]["functionHandler"];

type StripeSubscription = Stripe.Subscription & {
  plan: Stripe.Plan;
};

/**
 * The Stripe client
 */
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

/**
 * Maps a Stripe subscription status to a SubscriptionStatus
 * @param status - The Stripe subscription status
 * @returns The SubscriptionStatus
 */
function mapSubscriptionStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
  switch (status) {
    case 'active':
    case 'trialing':
    case 'past_due':
    case 'canceled':
    case 'unpaid':
    case 'incomplete':
      return status;
    default:
      throw new Error(`Unknown subscription status: ${status}`);
  }
}

/**
 * Gets the subscriptions for the authenticated user
 * @returns The subscriptions
 */
export const handler: GetSubscriptionsFunctionHandler = async () => {
  const customerId = process.env.STRIPE_CUSTOMER_ID!;

  if (!customerId) {
    throw new Error('STRIPE_CUSTOMER_ID is not set');
  }

  const subscriptionsQuery = await stripe.subscriptions.list({
    customer: customerId,
    expand: ['data.plan.product'],
  });

  return subscriptionsQuery.data.map((subscription) => {
    const stripeSubscription = subscription as StripeSubscription;
    const currentPeriodStart = new Date(subscription.items.data[0].current_period_start * 1000).toISOString();
    const currentPeriodEnd = new Date(subscription.items.data[0].current_period_end * 1000).toISOString();

    return {
      subscriptionId: stripeSubscription.id,
      subscriptionStatus: mapSubscriptionStatus(stripeSubscription.status),
      planName: (stripeSubscription.plan.product as Stripe.Product)?.name ?? "Unknown Plan",
      price: stripeSubscription.plan.amount ?? 0,
      currency: stripeSubscription.plan.currency ?? "USD",
      currentPeriodStart,
      currentPeriodEnd,
    } satisfies SubscriptionResponse;
  });
};
