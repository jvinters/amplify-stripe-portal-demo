import { defineFunction, secret } from '@aws-amplify/backend';

export const getSubscription = defineFunction({
    name: "get-subscription",
    environment: {
        STRIPE_SECRET_KEY: secret('STRIPE_SECRET_KEY')
    }
});