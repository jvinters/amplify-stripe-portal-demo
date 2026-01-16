import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { fetchSubscriptions } from "@/lib/mockData";
import type { Subscription, SubscriptionStatus } from "@/types";
import { SubscriptionStatus as StatusEnum } from "@/types";

function getStatusVariant(status: SubscriptionStatus): "default" | "destructive" | "secondary" | "outline" {
  switch (status) {
    case StatusEnum.ACTIVE:
    case StatusEnum.TRIALING:
      return "default";
    case StatusEnum.CANCELED:
    case StatusEnum.INCOMPLETE_EXPIRED:
      return "destructive";
    case StatusEnum.PAST_DUE:
    case StatusEnum.UNPAID:
      return "outline";
    case StatusEnum.PAUSED:
    case StatusEnum.INCOMPLETE:
      return "secondary";
    default:
      return "default";
  }
}

function formatStatus(status: SubscriptionStatus): string {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSubscriptions() {
      try {
        const data = await fetchSubscriptions();
        setSubscriptions(data);
      } catch (error) {
        console.error("Failed to load subscriptions:", error);
      } finally {
        setLoading(false);
      }
    }

    loadSubscriptions();
  }, []);

  const handleManageBilling = () => {
    // Placeholder for future backend integration
    console.log("Manage Billing clicked - will integrate with backend function");
    // TODO: Call backend function to create Stripe Billing Portal Session
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading subscriptions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Subscriptions</h1>
          <p className="text-muted-foreground">
            Manage your active and past subscriptions
          </p>
        </div>
        <Button onClick={handleManageBilling}>Manage Billing</Button>
      </div>

      {subscriptions.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">No subscriptions found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {subscriptions.map((subscription) => (
            <Card key={subscription.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{subscription.planName}</CardTitle>
                  <Badge variant={getStatusVariant(subscription.status)}>
                    {formatStatus(subscription.status)}
                  </Badge>
                </div>
                <CardDescription className="font-mono text-xs">
                  {subscription.id}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="font-medium text-lg">
                    {subscription.currency === "USD" ? "$" : ""}
                    {subscription.price.toFixed(2)} {subscription.currency}
                  </p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">
                    Current Period
                  </p>
                  <p className="font-medium">
                    {subscription.currentPeriodStart.toLocaleDateString()} -{" "}
                    {subscription.currentPeriodEnd.toLocaleDateString()}
                  </p>
                </div>
                {subscription.cancelAtPeriodEnd && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm text-warning">
                        This subscription will cancel at the end of the current
                        period
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="flex justify-start">
        <Button variant="outline" asChild>
          <Link to="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
