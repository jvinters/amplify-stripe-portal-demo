import type { APIGatewayProxyHandlerV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { getRequiredEnv } from "../../shared/env";
import { createStripeClient } from "../../shared/stripe";
import Stripe from "stripe";

/**
 * Creates a standardized API Gateway response
 * @param statusCode - HTTP status code
 * @param body - Response body object
 * @returns Formatted API Gateway response
 */
function createResponse<T>(statusCode: number, body: T): APIGatewayProxyResultV2<string> {
  return {
    statusCode,
    body: JSON.stringify(body),
  };
}

/**
 * Validates that a Stripe subscription object has required fields
 * @param subscription - The subscription object to validate
 * @throws {Error} If required fields are missing
 */
function validateSubscription(subscription: Stripe.Subscription): void {
  if (!subscription.id) {
    throw new Error('Subscription is missing id');
  }
  if (!subscription.customer) {
    throw new Error('Subscription is missing customer');
  }
}

/**
 * Handles customer subscription events from Stripe webhooks
 * @param event - The verified Stripe event
 * @throws {Error} If the subscription data is invalid
 */
function handleSubscriptionEvent(event: Stripe.Event): void {
  const subscription = event.data.object as Stripe.Subscription;
  validateSubscription(subscription);

  switch (event.type) {
    case 'customer.subscription.created':
      console.log(`Subscription ${subscription.id} was created for customer ${subscription.customer}`);
      break;
    case 'customer.subscription.deleted':
      console.log(`Subscription ${subscription.id} was deleted for customer ${subscription.customer}`);
      break;
    case 'customer.subscription.paused':
      console.log(`Subscription ${subscription.id} was paused for customer ${subscription.customer}`);
      break;
    case 'customer.subscription.resumed':
      console.log(`Subscription ${subscription.id} was resumed for customer ${subscription.customer}`);
      break;
    case 'customer.subscription.trial_will_end': {
      const trialEndDate = subscription.trial_end 
        ? new Date(subscription.trial_end * 1000).toISOString()
        : 'unknown';
      console.log(`Subscription ${subscription.id} trial will end on ${trialEndDate} for customer ${subscription.customer}`);
      break;
    }
    case 'customer.subscription.updated':
      console.log(`Subscription ${subscription.id} was updated for customer ${subscription.customer}`);
      break;
    default:
      console.warn(`Unhandled subscription event type: ${event.type}`);
  }
}

/**
 * Verifies and constructs a Stripe webhook event from the request
 * @param stripe - The Stripe client instance
 * @param body - The raw request body
 * @param signature - The Stripe signature header
 * @param webhookSecret - The webhook secret for verification
 * @returns The verified Stripe event
 * @throws {Error} If signature verification fails
 */
function verifyWebhookEvent(
  stripe: Stripe,
  body: string,
  signature: string,
  webhookSecret: string
): Stripe.Event {
  try {
    return stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    if (error instanceof Error) {
      console.error('Webhook signature verification failed:', error.message);
      throw new Error(`Webhook signature verification failed: ${error.message}`);
    }
    throw new Error('Webhook signature verification failed: Unknown error');
  }
}

/**
 * Handles Stripe webhook events for subscription lifecycle management
 * 
 * This handler processes webhook events from Stripe to track subscription changes.
 * Currently, it logs subscription events. Future enhancements could include
 * updating a local database or triggering additional business logic.
 * 
 * @param request - The API Gateway request containing the webhook payload
 * @returns API Gateway response with status code and message
 * @throws {Error} If environment variables are missing, signature verification fails, or event processing fails
 */
export const handler: APIGatewayProxyHandlerV2 = async (request) => {
  try {
    // Validate request body
    if (!request?.body) {
      return createResponse(400, { error: 'Request body is required' });
    }

    // Validate required environment variables
    const stripeWebhookSecret = getRequiredEnv('STRIPE_WEBHOOK_SECRET');
    const stripe = createStripeClient();

    // Validate signature header
    const signature = request.headers['stripe-signature'];
    if (!signature || typeof signature !== 'string') {
      return createResponse(400, { error: 'Missing or invalid stripe-signature header' });
    }

    // Verify and construct the webhook event
    const event = verifyWebhookEvent(
      stripe,
      request.body,
      signature,
      stripeWebhookSecret
    );

    // Process subscription-related events
    if (event.type.startsWith('customer.subscription.')) {
      handleSubscriptionEvent(event);
    } else {
      console.info(`Received unhandled event type: ${event.type}`);
    }

    // Return success response to acknowledge receipt
    return createResponse(200, { received: true });
  } catch (error) {
    // Handle known error types
    if (error instanceof Error) {
      console.error('Webhook handler error:', error.message);
      
      // Return appropriate status codes based on error type
      if (error.message.includes('environment variable')) {
        return createResponse(500, { error: 'Server configuration error' });
      }
      if (error.message.includes('signature verification')) {
        return createResponse(400, { error: 'Invalid webhook signature' });
      }
      if (error.message.includes('missing')) {
        return createResponse(400, { error: error.message });
      }
      
      // Generic error response
      return createResponse(500, { error: 'Internal server error' });
    }

    // Handle unknown error types
    console.error('Unknown error in webhook handler:', error);
    return createResponse(500, { error: 'Internal server error' });
  }
};