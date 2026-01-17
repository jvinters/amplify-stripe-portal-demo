import Stripe from 'stripe';
import { Schema } from '../../data/resource';

/**
 * The SubscriptionStatus type
 */
type SubscriptionStatus = Schema["SubscriptionResponse"]["type"]['subscriptionStatus'];

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
export const handler: Schema["getSubscriptions"]["functionHandler"] = async () => {
  const customerId = process.env.STRIPE_CUSTOMER_ID!;

  if (!customerId) {
    throw new Error('STRIPE_CUSTOMER_ID is not set');
  }

  const subscriptionsQuery = await stripe.subscriptions.list({
    customer: customerId,
    expand: ['data.items'],
  });

  console.log(subscriptionsQuery.data);

  const subscriptions = subscriptionsQuery.data.map((subscription) => {
    const item = subscription.items.data[0];
    const price = item?.price;
    const product = price?.product as Stripe.Product | null;

    const planName =
      price?.nickname ??
      product?.name ??
      'Unknown Plan';

    const renewalDate = subscription.start_date
      ? new Date(subscription.start_date * 1000).toISOString()
      : undefined;

    return {
      id: subscription.id,
      status: mapSubscriptionStatus(subscription.status),
      planName,
      renewalDate,
    };
  });


  return subscriptions.map((subscription) => ({
    subscriptionId: subscription.id,
    subscriptionStatus: subscription.status,
    planName: subscription.planName,
    renewalDate: subscription.renewalDate,
  }));
};
