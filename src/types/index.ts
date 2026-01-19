export enum SubscriptionStatus {
  ACTIVE = "active",
  CANCELED = "canceled",
  INCOMPLETE = "incomplete",
  INCOMPLETE_EXPIRED = "incomplete_expired",
  PAST_DUE = "past_due",
  PAUSED = "paused",
  TRIALING = "trialing",
  UNPAID = "unpaid",
}

export enum SubscriptionRenewalInterval {
  DAY = "day",
  WEEK = "week",
  MONTH = "month",
  YEAR = "year",
}

export interface Subscription {
  id: string;
  status: SubscriptionStatus;
  planName: string;
  price: number;
  currency: string;
  renewalInterval: SubscriptionRenewalInterval;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
}
