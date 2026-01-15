import Stripe from 'stripe';
import { Schema } from '../../data/resource';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

export const handler: Schema["getSubscription"]["functionHandler"] = async () => {
  // Simple call that doesn't mutate anything
  const subscriptions = await stripe.subscriptions.list({
    limit: 1,
  });

  return {
    ok: true,
    subscriptionId: subscriptions.data[0]?.id ?? null,
    subscriptionStatus: subscriptions.data[0]?.status ?? null,
  };
};
