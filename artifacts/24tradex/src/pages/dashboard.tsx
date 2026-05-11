import { useGetDashboardSummary } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCrypto, formatCurrency } from "@/lib/utils";
import { Wallet, ArrowDownToLine, Clock, Users } from "lucide-react";
import { useState, useEffect } from "react";

// Simple animated counter component
function AnimatedCounter({ value, isCurrency = false, symbol = "24X" }: { value: number, isCurrency?: boolean, symbol?: string }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1000; // 1 second
    const increment = value / (duration / 16); // 60fps
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(start);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value]);

  if (isCurrency) {
    return <span>{formatCurrency(displayValue)}</span>;
  }
  return <span>{formatCrypto(displayValue, symbol)}</span>;
}

export default function Dashboard() {
  const { data: summary, isLoading } = useGetDashboardSummary();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <p className="text-muted-foreground mt-2">Welcome to your trading terminal.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass-panel border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Purchased
            </CardTitle>
            <Wallet className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-[120px]" />
            ) : (
              <div className="text-2xl font-bold text-white">
                <AnimatedCounter value={summary?.total_purchased || 0} />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-panel border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Available Withdrawal
            </CardTitle>
            <ArrowDownToLine className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-[120px]" />
            ) : (
              <div className="text-2xl font-bold text-white">
                <AnimatedCounter value={summary?.available_withdrawal || 0} />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-panel border-l-4 border-l-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Withdrawal
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-[120px]" />
            ) : (
              <div className="text-2xl font-bold text-white">
                <AnimatedCounter value={summary?.pending_withdrawal || 0} />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-panel border-l-4 border-l-secondary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Sponsor Earnings
            </CardTitle>
            <Users className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-[120px]" />
            ) : (
              <div className="text-2xl font-bold text-white">
                <AnimatedCounter value={summary?.sponsor_earnings || 0} isCurrency />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* More dashboard content could go here, like recent transactions */}
      <div className="mt-8 rounded-xl border border-white/10 glass-panel p-8 text-center">
         <h2 className="text-xl font-medium text-white mb-2">Terminal Active</h2>
         <p className="text-muted-foreground">All systems operational. Ready for trading execution.</p>
      </div>
    </div>
  );
}
