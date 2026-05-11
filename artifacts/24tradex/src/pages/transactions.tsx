import { useState } from "react";
import { useListTransactions } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { formatCrypto } from "@/lib/utils";
import { Loader2, ArrowUpRight, ArrowDownLeft, Gift, ChevronLeft, ChevronRight } from "lucide-react";

export default function Transactions() {
  const [page, setPage] = useState(1);
  const [type, setType] = useState<string>("all");

  const { data, isLoading } = useListTransactions({ 
    page, 
    type: type !== "all" ? type : undefined 
  });

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'approved': return <Badge className="bg-green-500/20 text-green-500">Approved</Badge>;
      case 'rejected': return <Badge variant="destructive" className="bg-red-500/20 text-red-500">Rejected</Badge>;
      case 'completed': return <Badge className="bg-blue-500/20 text-blue-500">Completed</Badge>;
      default: return <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-500">Pending</Badge>;
    }
  };

  const getTypeIcon = (txType: string) => {
    switch(txType) {
      case 'purchase': return <ArrowDownLeft className="h-4 w-4 text-primary" />;
      case 'withdrawal': return <ArrowUpRight className="h-4 w-4 text-green-500" />;
      case 'sponsor_earning': return <Gift className="h-4 w-4 text-secondary" />;
      default: return null;
    }
  };

  const formatType = (txType: string) => {
    return txType.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Transaction History</h1>
        <p className="text-muted-foreground mt-2">View all your terminal activities.</p>
      </div>

      <Card className="glass-panel border-white/10">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle>All Transactions</CardTitle>
          <div className="w-full sm:w-48">
            <Select value={type} onValueChange={(val) => { setType(val); setPage(1); }}>
              <SelectTrigger className="bg-black/20 border-white/10">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="purchase">Purchase</SelectItem>
                <SelectItem value="withdrawal">Withdrawal</SelectItem>
                <SelectItem value="sponsor_earning">Sponsor Earning</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-white/10 overflow-hidden bg-black/20">
            <Table>
              <TableHeader className="bg-white/5">
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                    </TableCell>
                  </TableRow>
                ) : data?.results?.length ? (
                  data.results.map((tx) => (
                    <TableRow key={tx.id} className="border-white/5 hover:bg-white/5">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(tx.type)}
                          <span className="font-medium">{formatType(tx.type)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(tx.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {tx.description || "-"}
                      </TableCell>
                      <TableCell className="text-right font-mono font-medium">
                        <span className={tx.type === 'withdrawal' ? 'text-green-400' : 'text-primary'}>
                           {tx.type === 'withdrawal' ? '-' : '+'}{formatCrypto(tx.amount)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {getStatusBadge(tx.status)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      No transactions found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {data && data.count > 0 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {((page - 1) * 10) + 1} to {Math.min(page * 10, data.count)} of {data.count} entries
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="bg-black/20 border-white/10"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => p + 1)}
                  disabled={!data.results || data.results.length < 10}
                  className="bg-black/20 border-white/10"
                >
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}