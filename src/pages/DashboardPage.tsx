import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { fetchUserProfile, fetchStripeInfo } from "@/lib/mockData";
import type { UserProfile, StripeInfo } from "@/types";

export function DashboardPage() {
  const { user } = useAuthenticator();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stripeInfo, setStripeInfo] = useState<StripeInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [profileData, stripeData] = await Promise.all([
          fetchUserProfile(),
          fetchStripeInfo(),
        ]);
        setProfile(profileData);
        setStripeInfo(stripeData);
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.signInDetails?.loginId || "User"}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile Summary</CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {profile && (
              <>
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{profile.name}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{profile.email}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Member Since</p>
                  <p className="font-medium">
                    {profile.createdAt.toLocaleDateString()}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stripe Information</CardTitle>
            <CardDescription>Your subscription overview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {stripeInfo && (
              <>
                <div>
                  <p className="text-sm text-muted-foreground">Customer ID</p>
                  <p className="font-medium font-mono text-sm">
                    {stripeInfo.customerId}
                  </p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">
                    Active Subscriptions
                  </p>
                  <p className="font-medium">
                    {stripeInfo.activeSubscriptions} of{" "}
                    {stripeInfo.totalSubscriptions}
                  </p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">
                    Monthly Revenue
                  </p>
                  <p className="font-medium">
                    {stripeInfo.currency === "USD" ? "$" : ""}
                    {stripeInfo.totalMonthlyRevenue.toFixed(2)}{" "}
                    {stripeInfo.currency}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button asChild>
          <Link to="/subscriptions">View Subscriptions</Link>
        </Button>
      </div>
    </div>
  );
}
