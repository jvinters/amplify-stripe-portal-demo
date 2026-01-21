import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Item,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemActions,
} from "@/components/ui/item";
import { SubscriptionRenewalInterval, SubscriptionStatus } from "@/types";
import { SubscriptionStatus as StatusEnum } from "@/types";

interface SubscriptionItemProps {
  subscriptionId: string;
  subscriptionStatus: SubscriptionStatus;
  planName: string;
  price?: number;
  currency?: string;
  renewalInterval?: SubscriptionRenewalInterval;
  currentPeriodEnd?: string;
  onView?: () => void;
}

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

function formatDate(date?: string): string | null {
  if (!date) return null;
  try {
    const dateObject = new Date(date);
    return dateObject.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return null;
  }
}

function formatPrice(price?: number, currency?: string): string | null {
  if (price === undefined || price === null || currency === undefined) return null;
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
  });
  return formatter.format(price / 100);
}

function formatRenewalInterval(interval: SubscriptionRenewalInterval): string {
  switch (interval) {
    case SubscriptionRenewalInterval.DAY:
    return "Daily";
    case SubscriptionRenewalInterval.WEEK:
    return "Weekly";
    case SubscriptionRenewalInterval.MONTH:
    return "Monthly";
    case SubscriptionRenewalInterval.YEAR:
    return "Yearly";
  }
}

export function SubscriptionItem({
  subscriptionStatus,
  planName,
  price,
  currency,
  renewalInterval,
  currentPeriodEnd,
  onView,
}: SubscriptionItemProps) {
  const formattedPrice = formatPrice(price, currency);
  const formattedRenewalInterval = renewalInterval ? formatRenewalInterval(renewalInterval) : null;
  const formattedCurrentPeriodEnd = formatDate(currentPeriodEnd);
  const hasPlanName = planName && planName.trim() !== "";
  const hasCurrentPeriodInfo = formattedRenewalInterval !== null && formattedCurrentPeriodEnd !== null;
  const displayRenewalInterval = hasCurrentPeriodInfo && (subscriptionStatus === StatusEnum.ACTIVE || subscriptionStatus === StatusEnum.TRIALING);

  return (
    <Item variant="muted">
      <ItemContent>
        <div className="space-y-1">
          <div className="flex items-center justify-start gap-4">
            {hasPlanName && <ItemTitle>{planName}</ItemTitle>}
            <Badge variant={getStatusVariant(subscriptionStatus)}>
              {formatStatus(subscriptionStatus)}
            </Badge>
          </div>
          {formattedPrice && (
            <ItemDescription>{formattedPrice}</ItemDescription>
          )}
          {displayRenewalInterval && (
            <ItemDescription>
              Renews {formattedRenewalInterval} on {formattedCurrentPeriodEnd}
            </ItemDescription>
          )}
        </div>
      </ItemContent>
      {onView && (
        <ItemActions>
          <Button variant="outline" size="sm" onClick={onView}>
            View
          </Button>
        </ItemActions>
      )}
    </Item>
  );
}
