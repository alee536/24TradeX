import { useAdminGetStats } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCrypto, formatCurrency } from "@/lib/utils";
import { Users, Wallet, ArrowDownToLine, Activity, Clock } from "lucide-react";
import { useState, useEffect } from "react";

function AnimatedCounter({ value, isCurrency = false, symbol = "24X", raw = false }: { value: number, isCurrency?: boolean, symbol?: string, raw?: boolean }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1000;
    const increment = value / (duration / 16);
    
    if (value === 0) {
      setDisplayValue(0);
      return;
    }

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

  if (raw) return <span>{Math.floor(displayValue)}</span>;
  if (isCurrency) return <span>{formatCurrency(displayValue)}</span>;
  return <span>{formatCrypto(displayValue, symbol)}</span>;
}

export default function AdminDashboard() {
  const { data: stats, isLoading } = useAdminGetStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Control Center</h1>
        <p className="text-muted-foreground mt-2">System overview and key metrics.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="glass-panel border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-[120px]" /> : (
              <div className="text-2xl font-bold text-white">
                <AnimatedCounter value={stats?.total_users || 0} raw />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-panel border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Purchases</CardTitle>
            <Wallet className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-[120px]" /> : (
              <div className="text-2xl font-bold text-white">
                <AnimatedCounter value={stats?.total_purchases || 0} />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-panel border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Withdrawals</CardTitle>
            <ArrowDownToLine className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-[120px]" /> : (
              <div className="text-2xl font-bold text-white">
                <AnimatedCounter value={stats?.total_withdrawals || 0} />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-panel border-l-4 border-l-secondary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Volume</CardTitle>
            <Activity className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-[120px]" /> : (
              <div className="text-2xl font-bold text-white">
                <AnimatedCounter value={stats?.total_volume || 0} isCurrency />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-panel border-l-4 border-l-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Purchases</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-[120px]" /> : (
              <div className="text-2xl font-bold text-white">
                <AnimatedCounter value={stats?.pending_purchases || 0} raw />
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="glass-panel border-l-4 border-l-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Withdrawals</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-[120px]" /> : (
              <div className="text-2xl font-bold text-white">
                <AnimatedCounter value={stats?.pending_withdrawals || 0} raw />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}