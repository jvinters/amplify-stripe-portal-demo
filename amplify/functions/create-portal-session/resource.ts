import { defineFunction, secret } from '@aws-amplify/backend';

export const createPortalSession = defineFunction({
    name: "create-portal-session",
    environment: {
        STRIPE_SECRET_KEY: secret('STRIPE_SECRET_KEY'),
        STRIPE_CUSTOMER_ID: secret('STRIPE_CUSTOMER_ID')
    }
});