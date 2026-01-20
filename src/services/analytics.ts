import * as amplitude from "@amplitude/analytics-browser";
import type { IAnalyticsService } from "./analytics.interface";
import {
  AnalyticsEventNames,
  SubscriptionStatusChangedProperties,
} from "./analytics.types";

/**
 * Analytics service implementation using Amplitude
 * Follows SOLID principles:
 * - Single Responsibility: Only handles event tracking
 * - Open/Closed: Extensible via interface without modifying core
 * - Dependency Inversion: Implements IAnalyticsService interface
 */
class AnalyticsService implements IAnalyticsService {
  private isInitialized = false;
  private userId: string | null = null;

  /**
   * Initialize the analytics service with an API key
   * @param apiKey - The Amplitude API key
   */
  initialize(apiKey: string): void {
    if (!apiKey || apiKey.trim() === "") {
      if (import.meta.env.DEV) {
        console.warn(
          "Amplitude API key is missing. Analytics tracking will be disabled."
        );
      }
      return;
    }

    try {
      amplitude.init(apiKey, {
        defaultTracking: {
          pageViews: false, // We'll track page views manually
          sessions: true,
          formInteractions: false,
          fileDownloads: false,
        },
      });
      this.isInitialized = true;

      if (this.userId) {
        amplitude.setUserId(this.userId);
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Failed to initialize Amplitude:", error);
      }
    }
  }

  /**
   * Set the user ID for analytics tracking
   * @param userId - The user identifier
   */
  setUserId(userId: string): void {
    this.userId = userId;
    if (this.isInitialized) {
      try {
        amplitude.setUserId(userId);
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error("Failed to set Amplitude user ID:", error);
        }
      }
    }
  }

  /**
   * Track a generic event with optional properties
   * @param eventName - The name of the event
   * @param properties - Optional event properties
   */
  trackEvent(eventName: string, properties?: Record<string, unknown>): void {
    if (!this.isInitialized) {
      return;
    }

    try {
      amplitude.track(eventName, properties);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error(`Failed to track event "${eventName}":`, error);
      }
    }
  }

  /**
   * Track when user views the subscription page
   */
  trackSubscriptionPageViewed(): void {
    this.trackEvent(AnalyticsEventNames.SUBSCRIPTION_PAGE_VIEWED);
  }

  /**
   * Track when user clicks the Manage Billing button
   */
  trackManageBillingClicked(): void {
    this.trackEvent(AnalyticsEventNames.MANAGE_BILLING_CLICKED);
  }

  // Added as an example, but not used in the application. This would ideally be handled in the backend with its own analytics service.
  /**
   * Track when a subscription status changes
   * @param data - The status change data
   */
  trackSubscriptionStatusChanged(
    data: SubscriptionStatusChangedProperties
  ): void {
    this.trackEvent(AnalyticsEventNames.SUBSCRIPTION_STATUS_CHANGED, {
      subscriptionId: data.subscriptionId,
      previousStatus: data.previousStatus,
      newStatus: data.newStatus,
      planName: data.planName,
    });
  }
}

/**
 * Singleton instance of the analytics service
 * Initialized with the API key from environment variables
 */
export const analytics: IAnalyticsService = new AnalyticsService();

// Initialize with environment variable
const apiKey = import.meta.env.VITE_AMPLITUDE_API_KEY;
if (apiKey) {
  analytics.initialize(apiKey);
} else if (import.meta.env.DEV) {
  console.warn(
    "VITE_AMPLITUDE_API_KEY is not set. Analytics tracking will be disabled."
  );
}
