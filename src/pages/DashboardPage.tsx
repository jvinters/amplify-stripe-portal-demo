import { Link } from "react-router-dom";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { generateClient } from "@aws-amplify/api";
import type { Schema } from "../../amplify/data/resource";
import { useState, useEffect } from "react";

const client = generateClient<Schema>();

interface DashboardData {
  subscriptionCount: number;
}

export function DashboardPage() {
  const { user } = useAuthenticator();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    /**
     * Loads the dashboard data from the API. Not scalable for large number of subscriptions, very inefficient.
     * 
     * Better solution would be to use a query to get the subscription count from the database / external API
     */
    async function loadDashboardData() {
      try {
        setError(null);
        setLoading(true);
        const data = await client.queries.getSubscriptions();

        if(data.errors && data.errors.length > 0) {
          const errorMessage = data.errors[0].message;
          setError(errorMessage);
          console.error("Failed to load dashboard data:", errorMessage);
          return;
        }

        setDashboardData({
          subscriptionCount: data.data?.length ?? 0,
        } satisfies DashboardData);

      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard data");
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  return (
    loading ? (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading dashboard data...</p>
      </div>
    ) : error ? (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-destructive font-medium">Error loading dashboard data</p>
      </div>
    ) : ( 
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.signInDetails?.loginId || "User"}
        </p>
      </div>

      <Card>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Subscriptions</p>
              <p className="text-2xl font-semibold">{dashboardData?.subscriptionCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex gap-4 pt-4 justify-end">
            <Button asChild variant="outline">
              <Link to="/subscriptions">View all subscriptions</Link>
            </Button>
          </div>
    </div>
    )
  );
}
