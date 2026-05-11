import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  useListPurchases, 
  useCreatePurchase, 
  useAdminGetSettings 
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getListPurchasesQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Copy, Wallet, CheckCircle2, Clock, XCircle } from "lucide-react";
import { formatCrypto, generateTxId, copyToClipboard } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const purchaseSchema = z.object({
  amount: z.coerce.number().positive("Amount must be positive"),
  txid: z.string().min(5, "Transaction Hash/ID is required"),
  wallet_address: z.string().min(10, "Your receiving wallet address is required"),
});

type PurchaseFormValues = z.infer<typeof purchaseSchema>;

export default function Purchase() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: settings } = useAdminGetSettings();
  const { data: purchases, isLoading: loadingPurchases } = useListPurchases({ page: 1 });
  const createPurchase = useCreatePurchase();
  const [copied, setCopied] = useState(false);

  const form = useForm<PurchaseFormValues>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      amount: 0,
      txid: "",
      wallet_address: "",
    },
  });

  const onSubmit = (data: PurchaseFormValues) => {
    createPurchase.mutate({ data }, {
      onSuccess: () => {
        toast({
          title: "Purchase request submitted",
          description: "Your request is now pending admin approval.",
        });
        form.reset();
        queryClient.invalidateQueries({ queryKey: getListPurchasesQueryKey() });
      },
      onError: (err: any) => {
        toast({
          title: "Submission failed",
          description: err?.message || "Failed to submit purchase request",
          variant: "destructive",
        });
      }
    });
  };

  const handleCopy = async () => {
    if (settings?.usdt_wallet_address) {
      await copyToClipboard(settings.usdt_wallet_address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: "Address copied to clipboard" });
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'approved': return <Badge className="bg-green-500/20 text-green-500 border-green-500/50"><CheckCircle2 className="w-3 h-3 mr-1"/> Approved</Badge>;
      case 'rejected': return <Badge variant="destructive" className="bg-red-500/20 text-red-500 border-red-500/50"><XCircle className="w-3 h-3 mr-1"/> Rejected</Badge>;
      default: return <Badge variant="secondary" className="bg-blue-500/20 text-blue-500 border-blue-500/50"><Clock className="w-3 h-3 mr-1"/> Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Purchase Tokens</h1>
        <p className="text-muted-foreground mt-2">Execute a new token purchase request.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle>Deposit Instructions</CardTitle>
            <CardDescription>Send USDT (BEP20) to the address below</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-black/40 border border-white/10 flex flex-col items-center justify-center text-center space-y-4">
               <div className="w-32 h-32 bg-white rounded-lg p-2 flex items-center justify-center">
                  <div className="w-full h-full border-4 border-black border-dashed flex items-center justify-center">
                     <span className="text-black font-bold">QR CODE</span>
                  </div>
               </div>
               <div className="w-full">
                 <p className="text-sm text-muted-foreground mb-1">Official USDT (BEP20) Address</p>
                 <div className="flex items-center gap-2 bg-black/50 p-2 rounded border border-white/10">
                   <code className="text-xs flex-1 truncate text-primary">
                     {settings?.usdt_wallet_address || "Loading address..."}
                   </code>
                   <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-white" onClick={handleCopy}>
                     {copied ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                   </Button>
                 </div>
               </div>
            </div>
            
            <div className="text-sm text-muted-foreground space-y-2">
              <p>1. Send only USDT on the Binance Smart Chain (BEP20).</p>
              <p>2. Minimum purchase: <strong className="text-white">{settings?.min_purchase || 0} USDT</strong></p>
              <p>3. After sending, copy the Transaction Hash (TXID) and fill the form.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel">
          <CardHeader>
            <CardTitle>Purchase Form</CardTitle>
            <CardDescription>Submit your transaction details</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Token Amount (USDT)</FormLabel>
                      <FormControl>
                        <div className="relative">
                           <Wallet className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                           <Input type="number" step="any" placeholder="0.00" {...field} className="pl-9 bg-black/20" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="txid"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Transaction Hash (TXID)</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter Blockchain TXID" {...field} className="bg-black/20 font-mono text-sm" />
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
                      <FormLabel>Your Receiving Wallet (BEP20)</FormLabel>
                      <FormControl>
                        <Input placeholder="0x..." {...field} className="bg-black/20 font-mono text-sm" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold mt-4"
                  disabled={createPurchase.isPending}
                >
                  {createPurchase.isPending ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
                  ) : (
                    "Submit Purchase"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Recent Purchases</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
           {loadingPurchases ? (
              Array(3).fill(0).map((_, i) => (
                 <Card key={i} className="glass-panel opacity-50">
                    <CardContent className="p-6 space-y-3">
                       <div className="h-4 bg-white/10 rounded w-1/2 animate-pulse"></div>
                       <div className="h-8 bg-white/10 rounded w-3/4 animate-pulse"></div>
                    </CardContent>
                 </Card>
              ))
           ) : purchases?.results?.length ? (
              purchases.results.slice(0, 6).map((purchase) => (
                 <Card key={purchase.id} className="glass-panel hover:bg-white/[0.07] transition-colors">
                    <CardContent className="p-5 flex flex-col gap-2">
                       <div className="flex justify-between items-start">
                          <span className="text-xs font-mono text-muted-foreground">{purchase.transaction_id}</span>
                          {getStatusBadge(purchase.status)}
                       </div>
                       <div className="text-2xl font-bold text-white">
                          {formatCrypto(purchase.amount)}
                       </div>
                       <div className="text-xs text-muted-foreground mt-2">
                          Date: {new Date(purchase.created_at).toLocaleDateString()}
                       </div>
                    </CardContent>
                 </Card>
              ))
           ) : (
              <div className="col-span-full p-8 text-center text-muted-foreground border border-white/10 border-dashed rounded-lg">
                 No purchase history found.
              </div>
           )}
        </div>
      </div>
    </div>
  );
}