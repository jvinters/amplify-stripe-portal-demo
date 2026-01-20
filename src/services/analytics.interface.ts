import type { SubscriptionStatusChangedProperties } from "./analytics.types";

/**
 * Interface defining the analytics service contract
 * Enables dependency inversion and makes the service easily testable
 */
export interface IAnalyticsService {
  /**
   * Initialize the analytics service with an API key
   * @param apiKey - The Amplitude API key
   */
  initialize(apiKey: string): void;

  /**
   * Set the user ID for analytics tracking
   * @param userId - The user identifier
   */
  setUserId(userId: string): void;

  /**
   * Track a generic event with optional properties
   * @param eventName - The name of the event
   * @param properties - Optional event properties
   */
  trackEvent(eventName: string, properties?: Record<string, unknown>): void;

  /**
   * Track when user views the subscription page
   */
  trackSubscriptionPageViewed(): void;

  /**
   * Track when user clicks the Manage Billing button
   */
  trackManageBillingClicked(): void;

  /**
   * Track when a subscription status changes
   * @param data - The status change data
   */
  trackSubscriptionStatusChanged(data: SubscriptionStatusChangedProperties): void;
}
