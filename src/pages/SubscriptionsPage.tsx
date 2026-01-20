import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ItemGroup, ItemSeparator } from "@/components/ui/item";
import { SubscriptionItem } from "@/components/features/SubscriptionItem";
import type { SubscriptionRenewalInterval, SubscriptionStatus } from "@/types";
import { generateClient } from "@aws-amplify/api";
import type { Schema } from "../../amplify/data/resource";
import { analytics } from "@/services/analytics";

const client = generateClient<Schema>();

interface SubscriptionData {
  subscriptionId: string;
  subscriptionStatus: SubscriptionStatus;
  planName: string;
  price?: number;
  currency?: string;
  renewalInterval?: SubscriptionRenewalInterval;
  currentPeriodEnd?: string;
}

export function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creatingSession, setCreatingSession] = useState(false);

  // Track page view on mount
  useEffect(() => {
    analytics.trackSubscriptionPageViewed();
  }, []);

  useEffect(() => {
    async function loadSubscriptions() {
      try {
        setError(null);
        setLoading(true);
        const data = await client.queries.getSubscriptions();
        const subscriptions =
          data.data?.map((subscription) => ({
            subscriptionId: subscription?.subscriptionId ?? "",
            subscriptionStatus: (subscription?.subscriptionStatus as SubscriptionStatus) ?? "",
            planName: subscription?.planName ?? "",
            price: subscription?.price ?? undefined,
            currency: subscription?.currency ?? undefined,
            renewalInterval: (subscription?.renewalInterval as SubscriptionRenewalInterval) ?? undefined,
            currentPeriodEnd: subscription?.currentPeriodEnd ?? undefined,
          } satisfies SubscriptionData)) ?? [];

        setSubscriptions(subscriptions);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load subscriptions";
        setError(errorMessage);
        console.error("Failed to load subscriptions:", err);
      } finally {
        setLoading(false);
      }
    }

    loadSubscriptions();
  }, []);

  const handleManageBillingClick = () => {
    analytics.trackManageBillingClicked();
    setDialogOpen(true);
  };

  const handleConfirmManageBilling = async () => {
    try {
      setCreatingSession(true);
      const data = await client.mutations.createPortalSession({ returnUrl: 'http://localhost:5173/subscriptions' });
      
      // Check for errors in the response
      if (data.errors && data.errors.length > 0) {
        console.error("Failed to create portal session:", data.errors);
        return;
      }
      
      if (data.data?.url) {
        window.location.href = data.data.url;
      } else {
        throw new Error("No URL returned from portal session creation");
      }
    } catch (err) {
      console.error("Failed to create portal session:", err);
    } finally {
      setDialogOpen(false);
      setCreatingSession(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Subscriptions</h1>
          <p className="text-muted-foreground">
            Manage your active and past subscriptions
          </p>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" asChild>
            <Link to="/dashboard">Back to Dashboard</Link>
          </Button>
          <Button
            onClick={handleManageBillingClick}
            disabled={creatingSession}
          >
            {creatingSession ? <Spinner /> : ""}
            Manage Billing
          </Button>
        </div>
      </div>

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Manage Billing</AlertDialogTitle>
            <AlertDialogDescription>
              You will be redirected to the billing portal where you can manage your subscription, update payment methods, and view billing history. Do you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmManageBilling}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Loading subscriptions...</p>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-2">
            <p className="text-destructive font-medium">Error loading subscriptions</p>
            <p className="text-muted-foreground text-sm">{error}</p>
          </div>
        </div>
      ) : subscriptions.length === 0 ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">No subscriptions found</p>
        </div>
      ) : (
        <ItemGroup className="space-y-4">
          {subscriptions.map((subscription, index) => (
            <div key={subscription.subscriptionId}>
              <SubscriptionItem
                subscriptionId={subscription.subscriptionId}
                subscriptionStatus={subscription.subscriptionStatus}
                planName={subscription.planName}
                price={subscription.price}
                currency={subscription.currency}
                renewalInterval={subscription.renewalInterval}
                currentPeriodEnd={subscription.currentPeriodEnd}
              />
              {index < subscriptions.length - 1 && <ItemSeparator />}
            </div>
          ))}
        </ItemGroup>
      )}
    </div>
  );
}
