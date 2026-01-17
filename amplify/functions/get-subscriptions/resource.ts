import { defineFunction, secret } from '@aws-amplify/backend';

export const getSubscriptions = defineFunction({
    name: "get-subscription",
    environment: {
        STRIPE_SECRET_KEY: secret('STRIPE_SECRET_KEY'),
        STRIPE_CUSTOMER_ID: secret('STRIPE_CUSTOMER_ID')
    }
});