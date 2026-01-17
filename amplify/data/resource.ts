import { type ClientSchema, a, defineData } from "@aws-amplify/backend";
import { getSubscriptions } from "../functions/get-subscriptions/resource";

const schema = a.schema({
  SubscriptionResponse: a.customType({
    subscriptionId: a.string(),
    subscriptionStatus: a.enum([
      'active',
      'canceled',
      'incomplete',
      'incomplete_expired',
      'past_due',
      'paused',
      'trialing',
      'unpaid'
    ]),
    planName: a.string(),
    renewalDate: a.string(),
  }),
  getSubscriptions: a
    .query()
    .returns(a.ref('SubscriptionResponse').array())
    .authorization(allow => [allow.authenticated()])
    .handler(a.handler.function(getSubscriptions))
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
    // API Key is used for a.allow.public() rules
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});