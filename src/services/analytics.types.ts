import type { SubscriptionStatus } from "@/types";

/**
 * Event name constants for analytics tracking
 */
export const AnalyticsEventNames = {
  SUBSCRIPTION_PAGE_VIEWED: "subscription_page_viewed",
  MANAGE_BILLING_CLICKED: "manage_billing_clicked",
  SUBSCRIPTION_STATUS_CHANGED: "subscription_status_changed",
} as const;

/**
 * Properties for subscription status changed event
 */
export interface SubscriptionStatusChangedProperties {
  subscriptionId: string;
  previousStatus: SubscriptionStatus;
  newStatus: SubscriptionStatus;
  planName?: string;
}

/**
 * Union type of all event names
 */
export type AnalyticsEventName = typeof AnalyticsEventNames[keyof typeof AnalyticsEventNames];
