import { defineFunction, secret } from '@aws-amplify/backend';

export const stripeWebhookHandler = defineFunction({
    name: "stripe-webhook-handler",
    environment: {
        STRIPE_SECRET_KEY: secret('STRIPE_SECRET_KEY'),
        STRIPE_WEBHOOK_SECRET: secret('STRIPE_WEBHOOK_SECRET'),
    }
    
});