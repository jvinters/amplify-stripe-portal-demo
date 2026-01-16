import type { UserProfile, StripeInfo, Subscription } from "@/types";
import { SubscriptionStatus } from "@/types";

export const mockUserProfile: UserProfile = {
  id: "user_123",
  email: "user@example.com",
  name: "John Doe",
  createdAt: new Date("2024-01-15"),
};

export const mockStripeInfo: StripeInfo = {
  customerId: "cus_abc123",
  totalSubscriptions: 3,
  activeSubscriptions: 2,
  totalMonthlyRevenue: 49.99,
  currency: "USD",
};

export const mockSubscriptions: Subscription[] = [
  {
    id: "sub_123456",
    status: SubscriptionStatus.ACTIVE,
    planName: "Pro Plan",
    price: 29.99,
    currency: "USD",
    currentPeriodStart: new Date("2024-01-01"),
    currentPeriodEnd: new Date("2024-02-01"),
    cancelAtPeriodEnd: false,
  },
  {
    id: "sub_789012",
    status: SubscriptionStatus.ACTIVE,
    planName: "Enterprise Plan",
    price: 99.99,
    currency: "USD",
    currentPeriodStart: new Date("2024-01-10"),
    currentPeriodEnd: new Date("2024-02-10"),
    cancelAtPeriodEnd: false,
  },
  {
    id: "sub_345678",
    status: SubscriptionStatus.CANCELED,
    planName: "Basic Plan",
    price: 9.99,
    currency: "USD",
    currentPeriodStart: new Date("2023-12-01"),
    currentPeriodEnd: new Date("2024-01-01"),
    cancelAtPeriodEnd: true,
  },
];

// Simulated API functions
export async function fetchUserProfile(): Promise<UserProfile> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 100));
  return mockUserProfile;
}

export async function fetchStripeInfo(): Promise<StripeInfo> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 100));
  return mockStripeInfo;
}

export async function fetchSubscriptions(): Promise<Subscription[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 100));
  return mockSubscriptions;
}
