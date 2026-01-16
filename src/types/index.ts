export enum SubscriptionStatus {
  ACTIVE = "active",
  CANCELED = "canceled",
  PAST_DUE = "past_due",
  UNPAID = "unpaid",
  INCOMPLETE = "incomplete",
  INCOMPLETE_EXPIRED = "incomplete_expired",
  TRIALING = "trialing",
  PAUSED = "paused",
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export interface StripeInfo {
  customerId: string;
  totalSubscriptions: number;
  activeSubscriptions: number;
  totalMonthlyRevenue: number;
  currency: string;
}

export interface Subscription {
  id: string;
  status: SubscriptionStatus;
  planName: string;
  price: number;
  currency: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
}
