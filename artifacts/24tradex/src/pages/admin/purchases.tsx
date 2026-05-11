import { useState } from "react";
import { useAdminListPurchases, useAdminApprovePurchase, useAdminRejectPurchase, getAdminListPurchasesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { formatCrypto } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ChevronLeft, ChevronRight, Check, X } from "lucide-react";

export default function AdminPurchases() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>("pending");
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [reason, setReason] = useState("");

  const { data: purchases, isLoading } = useAdminListPurchases({ 
    page,
    status: status !== "all" ? status : undefined
  });

  const approvePurchase = useAdminApprovePurchase();
  const rejectPurchase = useAdminRejectPurchase();

  const handleApprove = (id: number) => {
    approvePurchase.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Purchase approved successfully" });
        queryClient.invalidateQueries({ queryKey: getAdminListPurchasesQueryKey() });
      },
      onError: (err: any) => toast({ title: "Failed to approve", description: err?.message, variant: "destructive" })
    });
  };

  const handleReject = () => {
    if (!rejectId || !reason.trim()) return;
    rejectPurchase.mutate({ id: rejectId, data: { reason } }, {
      onSuccess: () => {
        toast({ title: "Purchase rejected" });
        setRejectId(null);
        setReason("");
        queryClient.invalidateQueries({ queryKey: getAdminListPurchasesQueryKey() });
      },
      onError: (err: any) => toast({ title: "Failed to reject", description: err?.message, variant: "destructive" })
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Purchase Management</h1>
        <p className="text-muted-foreground mt-2">Verify and approve token purchase requests.</p>
      </div>

      <Card className="glass-panel border-white/10">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle>Purchase Requests</CardTitle>
          <div className="w-full sm:w-48">
            <Select value={status} onValueChange={(val) => { setStatus(val); setPage(1); }}>
              <SelectTrigger className="bg-black/20 border-white/10">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-white/10 overflow-x-auto bg-black/20">
            <Table>
              <TableHeader className="bg-white/5">
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableHead>User ID</TableHead>
                  <TableHead>Transaction</TableHead>
                  <TableHead className="text-right">Amount (USDT)</TableHead>
                  <TableHead>TXID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                    </TableCell>
                  </TableRow>
                ) : purchases?.results?.length ? (
                  purchases.results.map((purchase) => (
                    <TableRow key={purchase.id} className="border-white/5 hover:bg-white/5">
                      <TableCell className="font-medium text-white">
                        {/* The API doesn't return user details here, just showing the ID or mock */}
                        User #{purchase.id}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-mono text-muted-foreground">{purchase.transaction_id}</div>
                        <div className="text-xs text-muted-foreground">{new Date(purchase.created_at).toLocaleString()}</div>
                      </TableCell>
                      <TableCell className="text-right font-mono text-primary font-bold">
                         {formatCrypto(purchase.amount)}
                      </TableCell>
                      <TableCell>
                         <div className="text-sm font-mono truncate w-32" title={purchase.txid || ""}>
                           {purchase.txid}
                         </div>
                      </TableCell>
                      <TableCell>
                         {purchase.status === 'approved' && <Badge className="bg-green-500/20 text-green-500 border-none">Approved</Badge>}
                         {purchase.status === 'rejected' && <Badge variant="destructive" className="bg-red-500/20 text-red-500 border-none">Rejected</Badge>}
                         {purchase.status === 'pending' && <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-500 border-none">Pending</Badge>}
                      </TableCell>
                      <TableCell className="text-right">
                        {purchase.status === 'pending' && (
                           <div className="flex justify-end gap-2">
                             <Button 
                               size="sm" 
                               className="bg-green-600 hover:bg-green-700 text-white h-8 px-2"
                               onClick={() => handleApprove(purchase.id)}
                               disabled={approvePurchase.isPending || rejectPurchase.isPending}
                             >
                               <Check className="w-4 h-4" />
                             </Button>
                             <Button 
                               size="sm" 
                               variant="destructive"
                               className="h-8 px-2"
                               onClick={() => setRejectId(purchase.id)}
                               disabled={approvePurchase.isPending || rejectPurchase.isPending}
                             >
                               <X className="w-4 h-4" />
                             </Button>
                           </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      No purchases found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {purchases && purchases.count > 0 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {((page - 1) * 10) + 1} to {Math.min(page * 10, purchases.count)} of {purchases.count}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="bg-black/20 border-white/10">
                  <ChevronLeft className="h-4 w-4 mr-1" /> Prev
                </Button>
                <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={!purchases.results || purchases.results.length < 10} className="bg-black/20 border-white/10">
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!rejectId} onOpenChange={(open) => !open && setRejectId(null)}>
        <DialogContent className="glass-panel border-white/10 bg-background/95">
          <DialogHeader>
            <DialogTitle>Reject Purchase</DialogTitle>
            <DialogDescription>Please provide a reason for rejecting this transaction.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
             <Input 
               placeholder="Reason (e.g. Invalid TXID, insufficient funds)" 
               value={reason}
               onChange={(e) => setReason(e.target.value)}
               className="bg-black/20 border-white/10"
             />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectId(null)} className="border-white/10">Cancel</Button>
            <Button variant="destructive" onClick={handleReject} disabled={!reason.trim() || rejectPurchase.isPending}>
              {rejectPurchase.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}