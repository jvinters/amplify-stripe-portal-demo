import { type ClientSchema, a, defineData } from "@aws-amplify/backend";
import { getSubscriptions } from "../functions/get-subscriptions/resource";
import { createPortalSession } from "../functions/create-portal-session/resource";

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
    price: a.float(),
    currency: a.string(),
    currentPeriodStart: a.datetime(),
    currentPeriodEnd: a.datetime(),
  }),
  getSubscriptions: a
    .query()
    .returns(a.ref('SubscriptionResponse').array())
    .authorization(allow => [allow.authenticated()])
    .handler(a.handler.function(getSubscriptions)),
  createPortalSession: a
    .mutation()
    .arguments({ returnUrl: a.string().required() })
    .returns(a.customType({
      url: a.string(),
    }))
    .authorization(allow => [allow.authenticated()])
    .handler(a.handler.function(createPortalSession))
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