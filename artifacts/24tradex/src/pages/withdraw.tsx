import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  useGetUnlockedAmount, 
  useCreateWithdrawal,
  useListWithdrawals
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getGetUnlockedAmountQueryKey, getListWithdrawalsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowDownToLine, CheckCircle2, Clock, XCircle, Lock, Unlock } from "lucide-react";
import { formatCrypto } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const withdrawSchema = z.object({
  amount: z.coerce.number().positive("Amount must be positive"),
  wallet_address: z.string().min(10, "Receiving wallet address is required"),
});

type WithdrawFormValues = z.infer<typeof withdrawSchema>;

export default function Withdraw() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: unlockData, isLoading: loadingUnlock } = useGetUnlockedAmount();
  const { data: withdrawals, isLoading: loadingWithdrawals } = useListWithdrawals({ page: 1 });
  const createWithdrawal = useCreateWithdrawal();

  const form = useForm<WithdrawFormValues>({
    resolver: zodResolver(withdrawSchema),
    defaultValues: {
      amount: 0,
      wallet_address: "",
    },
  });

  const availableAmount = unlockData?.available || 0;

  const onSubmit = (data: WithdrawFormValues) => {
    if (data.amount > availableAmount) {
      form.setError("amount", { message: "Amount exceeds available balance" });
      return;
    }

    createWithdrawal.mutate({ data }, {
      onSuccess: () => {
        toast({
          title: "Withdrawal requested",
          description: "Your request is now pending admin approval.",
        });
        form.reset();
        queryClient.invalidateQueries({ queryKey: getListWithdrawalsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetUnlockedAmountQueryKey() });
      },
      onError: (err: any) => {
        toast({
          title: "Submission failed",
          description: err?.message || "Failed to submit withdrawal request",
          variant: "destructive",
        });
      }
    });
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'approved': return <Badge className="bg-green-500/20 text-green-500 border-green-500/50"><CheckCircle2 className="w-3 h-3 mr-1"/> Approved</Badge>;
      case 'rejected': return <Badge variant="destructive" className="bg-red-500/20 text-red-500 border-red-500/50"><XCircle className="w-3 h-3 mr-1"/> Rejected</Badge>;
      default: return <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-500 border-yellow-500/50"><Clock className="w-3 h-3 mr-1"/> Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Withdraw Tokens</h1>
        <p className="text-muted-foreground mt-2">Request withdrawal for your unlocked tokens.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle>Unlock Status</CardTitle>
            <CardDescription>Your token vesting progress</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
               <div className="p-4 bg-black/30 rounded-lg border border-white/5">
                  <div className="text-sm text-muted-foreground flex items-center gap-1 mb-1">
                     <Unlock className="w-3 h-3" /> Available
                  </div>
                  <div className="text-2xl font-bold text-green-400">
                     {loadingUnlock ? <Loader2 className="h-4 w-4 animate-spin" /> : formatCrypto(availableAmount)}
                  </div>
               </div>
               <div className="p-4 bg-black/30 rounded-lg border border-white/5">
                  <div className="text-sm text-muted-foreground flex items-center gap-1 mb-1">
                     <Lock className="w-3 h-3" /> Total Unlocked
                  </div>
                  <div className="text-xl font-bold text-white">
                     {loadingUnlock ? <Loader2 className="h-4 w-4 animate-spin" /> : formatCrypto(unlockData?.total_unlocked || 0)}
                  </div>
               </div>
            </div>

            <div className="space-y-4 mt-6">
               <h3 className="text-sm font-medium">Stage Breakdown</h3>
               {loadingUnlock ? (
                  <div className="space-y-2"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></div>
               ) : unlockData?.breakdown?.length ? (
                  unlockData.breakdown.map((item, idx) => (
                     <div key={idx} className="bg-black/20 p-3 rounded border border-white/5 space-y-2">
                        <div className="flex justify-between text-sm">
                           <span className="font-mono text-xs text-muted-foreground">{item.transaction_id}</span>
                           <span className="text-primary font-medium">Stage {item.stage}</span>
                        </div>
                        <div className="flex justify-between items-end">
                           <div className="text-lg font-bold">{formatCrypto(item.unlocked)}</div>
                           <div className="text-xs text-muted-foreground">of {formatCrypto(item.amount)}</div>
                        </div>
                        <Progress value={(item.unlocked / item.amount) * 100} className="h-1" />
                     </div>
                  ))
               ) : (
                  <div className="text-sm text-muted-foreground text-center p-4">No active purchases found.</div>
               )}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel">
          <CardHeader>
            <CardTitle>Withdrawal Request</CardTitle>
            <CardDescription>Withdraw unlocked tokens to your wallet</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount to Withdraw</FormLabel>
                      <FormControl>
                        <div className="relative">
                           <Input type="number" step="any" placeholder="0.00" {...field} className="bg-black/20" />
                           <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm" 
                              className="absolute right-1 top-1 h-7 text-xs text-primary hover:text-primary/80"
                              onClick={() => form.setValue("amount", availableAmount)}
                           >
                              MAX
                           </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="wallet_address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Receiving Wallet Address</FormLabel>
                      <FormControl>
                        <Input placeholder="0x..." {...field} className="bg-black/20 font-mono text-sm" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold mt-4"
                  disabled={createWithdrawal.isPending || availableAmount <= 0}
                >
                  {createWithdrawal.isPending ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                  ) : (
                    <><ArrowDownToLine className="mr-2 h-4 w-4" /> Request Withdrawal</>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Recent Withdrawals</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
           {loadingWithdrawals ? (
              Array(3).fill(0).map((_, i) => (
                 <Card key={i} className="glass-panel opacity-50">
                    <CardContent className="p-6 space-y-3">
                       <div className="h-4 bg-white/10 rounded w-1/2 animate-pulse"></div>
                       <div className="h-8 bg-white/10 rounded w-3/4 animate-pulse"></div>
                    </CardContent>
                 </Card>
              ))
           ) : withdrawals?.results?.length ? (
              withdrawals.results.slice(0, 6).map((withdrawal) => (
                 <Card key={withdrawal.id} className="glass-panel hover:bg-white/[0.07] transition-colors">
                    <CardContent className="p-5 flex flex-col gap-2">
                       <div className="flex justify-between items-start">
                          <span className="text-xs text-muted-foreground truncate w-24" title={withdrawal.wallet_address}>{withdrawal.wallet_address.substring(0,6)}...{withdrawal.wallet_address.substring(withdrawal.wallet_address.length-4)}</span>
                          {getStatusBadge(withdrawal.status)}
                       </div>
                       <div className="text-2xl font-bold text-white">
                          {formatCrypto(withdrawal.amount)}
                       </div>
                       <div className="text-xs text-muted-foreground mt-2 flex justify-between">
                          <span>{new Date(withdrawal.created_at).toLocaleDateString()}</span>
                          {withdrawal.manual_tx_hash && <span className="font-mono text-primary">TX: {withdrawal.manual_tx_hash.substring(0,8)}...</span>}
                       </div>
                    </CardContent>
                 </Card>
              ))
           ) : (
              <div className="col-span-full p-8 text-center text-muted-foreground border border-white/10 border-dashed rounded-lg">
                 No withdrawal history found.
              </div>
           )}
        </div>
      </div>
    </div>
  );
}