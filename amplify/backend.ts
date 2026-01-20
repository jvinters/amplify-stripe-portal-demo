import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { getSubscriptions } from './functions/get-subscriptions/resource';
import { createPortalSession } from './functions/create-portal-session/resource';
import { stripeWebhookHandler } from './functions/stripe-webhook-handler/resource';
import { Stack } from 'aws-cdk-lib';
import {HttpMethod, HttpApi, CorsHttpMethod, HttpNoneAuthorizer } from 'aws-cdk-lib/aws-apigatewayv2';
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';

const backend = defineBackend({
  auth,
  data,
  getSubscriptions,
  createPortalSession,
  stripeWebhookHandler,
});

// create a new API stack
const apiStack = backend.createStack("api-stack");

// create a new HTTP Lambda integration
const httpLambdaIntegration = new HttpLambdaIntegration(
  "LambdaIntegration",
  backend.stripeWebhookHandler.resources.lambda
);

// create a new HTTP API with IAM as default authorizer
const httpApi = new HttpApi(apiStack, "HttpApi", {
  apiName: "stripeWebhookApi",
  corsPreflight: {
    allowMethods: [
      CorsHttpMethod.POST,
    ],
    allowOrigins: ["*"],
    allowHeaders: ["*"],
  },
  createDefaultStage: true,
});

// add routes to the API with a None authorizer
httpApi.addRoutes({
  path: "/webhook",
  methods: [HttpMethod.POST],
  integration: httpLambdaIntegration,
  authorizer: new HttpNoneAuthorizer(),
});

// add outputs to the configuration file
backend.addOutput({
  custom: {
    API: {
      [httpApi.httpApiName!]: {
        endpoint: httpApi.url,
        region: Stack.of(httpApi).region,
        apiName: httpApi.httpApiName,
      },
    },
  },
});
