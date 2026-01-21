# Stripe Portal Demo

A full-stack application built with AWS Amplify Gen 2, React + TypeScript, and Stripe Billing. Authenticated users can view their current subscription status and manage their plan via Stripe's Billing Portal.

## Running the Application Locally

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn
- AWS CLI configured (for Amplify sandbox)
- A Stripe account with test mode API keys

### Environment Variables

Before running the application, you need to configure the following:

#### Backend Secrets (AWS Amplify)

Configure the following secrets in AWS Amplify:

1. **STRIPE_SECRET_KEY**: Your Stripe secret key (test mode)
   - Get this from your [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
   - Format: `sk_test_...`

2. **STRIPE_CUSTOMER_ID**: A Stripe customer ID to use for testing
   - Create a test customer in Stripe Dashboard
   - Format: `cus_...`

3. **STRIPE_WEBHOOK_SECRET**: Your Stripe webhook signing secret (test mode)
   - Get this from your webhook endpoint in the [Stripe Dashboard](https://dashboard.stripe.com/test/webhooks) (Signing secret)
   - Format: `whsec_...`

Use the Amplify CLI to set secrets:

```bash
npx ampx sandbox secret set STRIPE_SECRET_KEY
npx ampx sandbox secret set STRIPE_CUSTOMER_ID
npx ampx sandbox secret set STRIPE_WEBHOOK_SECRET
```

When prompted, enter the respective values.

#### Frontend Environment Variables

Create a `.env` file in the project root (or `.env.local` for local development):

1. **VITE_AMPLITUDE_API_KEY**: Your Amplitude API key for analytics tracking
   - Get this from your [Amplitude Dashboard](https://amplitude.com/)
   - Format: A string of alphanumeric characters
   - This is optional - the application will work without it, but analytics tracking will be disabled
   - Example: `.env` file:
     ```
     VITE_AMPLITUDE_API_KEY=your_amplitude_api_key_here
     ```

### Installation

1. Install dependencies:
```bash
npm install
```

### Running the Application

1. **Start the Amplify sandbox** (in one terminal):
   ```bash
   npm run sandbox
   ```
   This command:
   - Deploys the backend resources (Auth, Data API, Functions) to your AWS account
   - Generates `amplify_outputs.json` with configuration
   - Streams function logs for debugging

2. **Start the development server** (in another terminal):
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`

### First-Time Setup

1. When you first run `npm run sandbox`, Amplify will:
   - Create a Cognito User Pool for authentication
   - Set up AppSync GraphQL API
   - Deploy Lambda functions for subscription management
   - Configure IAM roles and permissions

2. After the sandbox starts, you can:
   - Sign up a new user via the login page
   - Sign in with your credentials
   - View subscriptions (if the test customer has any)
   - Access the Stripe Billing Portal

### Stripe Webhook (Current State)

The `stripe-webhook-handler` function is currently **unfinished by design**: it verifies Stripe webhook signatures, then **only logs subscription lifecycle events**. It does not persist data or trigger any downstream business logic yet.

- **Where to view logs**: run `npm run sandbox` and watch the sandbox console logs/terminal output (Amplify streams function logs while the sandbox is running).
- **Supported events**: any event with type prefix `customer.subscription.*` is accepted; the handler currently has explicit logging for:
  - `customer.subscription.created`
  - `customer.subscription.deleted`
  - `customer.subscription.paused`
  - `customer.subscription.resumed`
  - `customer.subscription.trial_will_end`
  - `customer.subscription.updated`

## Architectural Decisions

### Backend Architecture

1. **Function Separation & Single Responsibility**:
   - Two focused Lambda functions, each with a single, well-defined purpose:
     - `get-subscriptions`: Fetches and normalizes subscription data from Stripe
     - `create-portal-session`: Creates Stripe Billing Portal sessions with URL validation
   - A third function (`stripe-webhook-handler`) is implemented for future extensibility, currently logging events

2. **Shared Code Organization**:
   - Centralized Stripe client creation and utilities in `amplify/shared/`
   - Reusable environment variable validation (`getRequiredEnv`)
   - Consistent error handling patterns across functions

3. **Customer ID Provider Pattern**:
   - Abstracted customer ID retrieval via `CustomerIdProvider` interface
   - Current implementation uses environment variable (`envCustomerIdProvider`)
   - Pattern enables future extension to database lookups or JWT token extraction without changing function code

4. **Data Transformation Layer**:
   - Normalizes Stripe's subscription data to a consistent internal format
   - Maps Stripe status values to typed enums with validation
   - Handles edge cases (missing items, undefined values) with explicit error handling
   - Extracts period information from subscription items with proper type safety

5. **GraphQL Schema Design**:
   - Custom types (`SubscriptionResponse`) with explicit enum definitions for status and renewal intervals
   - Type-safe query and mutation definitions with required arguments
   - All operations require authentication via `allow.authenticated()`

6. **Error Handling Strategy**:
   - Distinguishes between Stripe API errors and generic errors
   - Provides meaningful error messages while avoiding sensitive data exposure
   - Validates inputs (e.g., return URL format) before external API calls

### Frontend Architecture

1. **Type Safety Approach**:
   - Leverages generated types from GraphQL schema for API contract compliance
   - Custom type definitions (`SubscriptionStatus`, `SubscriptionRenewalInterval`) aligned with backend
   - Minimal type assertions, preferring type guards and explicit transformations

2. **Component Architecture**:
   - Clear separation: Pages (`src/pages/`) orchestrate data fetching and state management
   - Presentational components (`src/components/`) handle UI rendering
   - Direct API calls using generated Amplify client (intentional choice to avoid premature abstraction)

3. **State Management**:
   - Local component state for subscriptions, loading, and error states
   - Tracks subscription status changes using refs to detect transitions for analytics
   - Handles edge cases (empty subscriptions, errors) with appropriate UI feedback

4. **Analytics Service Design**:
   - Interface-based architecture (`IAnalyticsService`) following SOLID principles
   - Graceful degradation: service initializes only if API key is provided
   - Tracks key user interactions: page views, button clicks, subscription status changes
   - User ID set on authentication, enabling user-level analytics

5. **URL Validation**:
   - Return URL validated in backend before creating portal session
   - Ensures protocol is http/https and URL is well-formed
   - Prevents potential security issues from malformed URLs

### Security Decisions

1. **Stripe API Key Management**:
   - Never exposed to frontend
   - Stored as secrets in Amplify, accessed only in backend functions
   - Environment variable validation ensures functions fail fast if misconfigured

2. **Input Validation**:
   - Return URLs validated for format and protocol before use
   - Required arguments enforced at GraphQL schema level
   - Type-safe argument handling prevents injection vulnerabilities

## Assumptions

### Business Logic Assumptions

- **Multiple Subscriptions**: All active subscriptions for a customer are displayed. The implementation fetches all subscriptions from Stripe and displays them in a list format. No prioritization or filtering is applied.

- **Subscription Status Transitions**: Status changes are reflected on the next page load. The application fetches fresh data from Stripe on each page visit; there is no real-time synchronization. The webhook handler is implemented but currently only logs events.

- **Canceled Subscriptions**: Canceled subscriptions are displayed with their current status. Stripe's status field is authoritative—if a subscription is canceled but still in the current billing period, it will show as "canceled" in the UI.

- **Subscription Data Source**: Subscription data is always fetched directly from Stripe API; there is no local caching or persistence layer. This ensures data accuracy but may impact performance at scale.

### Technical Assumptions

- **Single Customer ID**: A single Stripe customer ID is used for all authenticated users, retrieved from the `STRIPE_CUSTOMER_ID` environment variable. This is a demo limitation; production would require per-user customer mapping.

- **Test Mode Only**: The implementation uses Stripe test mode API keys. Production deployment would require live mode keys, proper customer mapping, and additional security considerations.

- **No Persistent Storage**: There is no database for storing user-to-customer mappings or subscription state. The customer ID provider pattern is designed to support future database integration without code changes.

- **Webhook Handler**: The webhook handler is implemented and validates Stripe signatures, but currently only logs events. It does not persist subscription state changes or trigger additional business logic.

- **No Retry Logic**: API calls to Stripe do not include retry mechanisms or exponential backoff. Transient failures will result in error messages to the user.

### User Experience Assumptions

- **Return URL**: The return URL for the billing portal is dynamically constructed from `window.location.origin` and the current route pathname. This works across any environment without configuration changes.

- **Error Handling**: Basic error messages are displayed to users. There are no retry mechanisms, and errors are logged to the console for debugging. The UI shows generic error states without specific recovery actions.

- **Loading States**: Simple loading text is displayed during data fetching. No skeleton screens or progressive loading states are implemented.

- **Analytics**: Analytics tracking is optional and gracefully degrades if the API key is not provided. The service continues to function without analytics.

## What I Would Improve With More Time

### High Priority

1. **User-to-Customer Mapping**
   - **Current State**: Single hardcoded customer ID for all users via environment variable
   - **Improvement**: Implement DynamoDB table to map Cognito user IDs to Stripe customer IDs. Leverage the existing `CustomerIdProvider` pattern to swap `envCustomerIdProvider` with a database-backed implementation. Create Stripe customers on user signup and store the mapping.
   - **Considerations**: Migration strategy for existing users, handling cases where Stripe customer creation fails during signup

2. **Webhook Persistence & Business Logic**
   - **Current State**: Webhook handler validates signatures and logs events but doesn't persist state
   - **Improvement**: Store subscription state changes in DynamoDB when webhooks are received. This enables real-time updates without polling and provides an audit trail. Consider idempotency keys to handle duplicate webhook deliveries (which is part of the stripe webhook payload already).
   - **Considerations**: Whether to use DynamoDB as source of truth or always fetch from Stripe (hybrid approach: cache in DynamoDB, verify with Stripe on critical operations)

3. **Error Handling & Retry Logic**
   - **Current State**: Basic error messages, no retry mechanisms for transient failures
   - **Improvement**: Implement exponential backoff for Stripe API calls in Lambda functions. Add user-friendly error messages with actionable guidance (e.g., "Service temporarily unavailable, please try again"). Consider circuit breaker pattern for repeated failures.
   - **Considerations**: Retry limits (3 attempts), timeout values (30s), and user-facing messaging strategy

### Medium Priority

4. **API Layer Abstraction**
   - **Current State**: Direct Amplify client calls in page components
   - **Improvement**: Create `src/api/subscription.ts` to centralize API calls, error handling, and response transformation. This improves testability and makes it easier to add features like request caching or request/response logging.
   - **Considerations**: Keep it simple initially—avoid over-engineering. Add caching only if performance becomes an issue.

5. **Subscription History & Invoices**
   - **Current State**: Only displays current active subscriptions
   - **Improvement**: Add queries to fetch subscription history, past invoices, and payment methods. Display billing history in a separate view or expandable section.
   - **Considerations**: Pagination for large histories, date range filtering, export functionality

### Low Priority

6. **Loading States & Skeleton Screens**
   - **Current State**: Basic "Loading subscriptions..." text
   - **Improvement**: Implement skeleton loaders that match the subscription item layout. This improves perceived performance and provides better visual feedback during data fetching.

7. **Comprehensive Testing**
   - **Current State**: No unit or integration tests
   - **Improvement**: Add Jest + React Testing Library for frontend components, unit tests for Lambda handlers (focusing on transformation logic and error handling), and integration tests for critical user flows (viewing subscriptions, creating portal session).
   - **Target Coverage**: 80% for business logic, 60% for UI components
