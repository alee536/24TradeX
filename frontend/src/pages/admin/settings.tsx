import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAdminGetSettings, useAdminUpdateSettings } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getAdminGetSettingsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save } from "lucide-react";

const settingsSchema = z.object({
  stage1_hours: z.coerce.number().min(0),
  stage1_percent: z.coerce.number().min(0).max(100),
  stage2_hours: z.coerce.number().min(0),
  stage2_percent: z.coerce.number().min(0).max(100),
  stage3_hours: z.coerce.number().min(0),
  stage3_percent: z.coerce.number().min(0).max(100),
  min_purchase: z.coerce.number().min(0),
  max_purchase: z.coerce.number().min(0),
  usdt_wallet_address: z.string().min(10),
  sponsor_percentage: z.coerce.number().min(0).max(100),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export default function AdminSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useAdminGetSettings();
  const updateSettings = useAdminUpdateSettings();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      stage1_hours: 24,
      stage1_percent: 30,
      stage2_hours: 48,
      stage2_percent: 30,
      stage3_hours: 72,
      stage3_percent: 40,
      min_purchase: 50,
      max_purchase: 10000,
      usdt_wallet_address: "",
      sponsor_percentage: 10,
    },
  });

  useEffect(() => {
    if (settings) {
      form.reset(settings);
    }
  }, [settings, form]);

  const onSubmit = (data: SettingsFormValues) => {
    updateSettings.mutate({ data }, {
      onSuccess: () => {
        toast({ title: "System settings updated successfully" });
        queryClient.invalidateQueries({ queryKey: getAdminGetSettingsQueryKey() });
      },
      onError: (err: any) => {
        toast({
          title: "Update failed",
          description: err?.message || "Failed to update settings",
          variant: "destructive",
        });
      }
    });
  };

  if (isLoading) {
    return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Configuration</h1>
        <p className="text-muted-foreground mt-2">Manage platform parameters and unlock stages.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="glass-panel">
              <CardHeader>
                <CardTitle>Global Limits</CardTitle>
                <CardDescription>Deposit addresses and purchase boundaries</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="usdt_wallet_address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Platform USDT (BEP20) Deposit Address</FormLabel>
                      <FormControl>
                        <Input {...field} className="bg-black/20 border-white/10 font-mono text-sm" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                   <FormField
                     control={form.control}
                     name="min_purchase"
                     render={({ field }) => (
                       <FormItem>
                         <FormLabel>Min Purchase (USDT)</FormLabel>
                         <FormControl>
                           <Input type="number" {...field} className="bg-black/20 border-white/10" />
                         </FormControl>
                         <FormMessage />
                       </FormItem>
                     )}
                   />
                   <FormField
                     control={form.control}
                     name="max_purchase"
                     render={({ field }) => (
                       <FormItem>
                         <FormLabel>Max Purchase (USDT)</FormLabel>
                         <FormControl>
                           <Input type="number" {...field} className="bg-black/20 border-white/10" />
                         </FormControl>
                         <FormMessage />
                       </FormItem>
                     )}
                   />
                </div>
                <FormField
                  control={form.control}
                  name="sponsor_percentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sponsor Reward Percentage (%)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} className="bg-black/20 border-white/10" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card className="glass-panel">
              <CardHeader>
                <CardTitle>Vesting Stages</CardTitle>
                <CardDescription>Token unlock timeline configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-black/30 border border-white/5">
                   <FormField
                     control={form.control}
                     name="stage1_hours"
                     render={({ field }) => (
                       <FormItem>
                         <FormLabel className="text-primary">Stage 1 (Hours)</FormLabel>
                         <FormControl>
                           <Input type="number" {...field} className="bg-black/20 border-white/10" />
                         </FormControl>
                         <FormMessage />
                       </FormItem>
                     )}
                   />
                   <FormField
                     control={form.control}
                     name="stage1_percent"
                     render={({ field }) => (
                       <FormItem>
                         <FormLabel className="text-primary">Stage 1 Unlock (%)</FormLabel>
                         <FormControl>
                           <Input type="number" {...field} className="bg-black/20 border-white/10" />
                         </FormControl>
                         <FormMessage />
                       </FormItem>
                     )}
                   />
                </div>

                <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-black/30 border border-white/5">
                   <FormField
                     control={form.control}
                     name="stage2_hours"
                     render={({ field }) => (
                       <FormItem>
                         <FormLabel className="text-secondary">Stage 2 (Hours)</FormLabel>
                         <FormControl>
                           <Input type="number" {...field} className="bg-black/20 border-white/10" />
                         </FormControl>
                         <FormMessage />
                       </FormItem>
                     )}
                   />
                   <FormField
                     control={form.control}
                     name="stage2_percent"
                     render={({ field }) => (
                       <FormItem>
                         <FormLabel className="text-secondary">Stage 2 Unlock (%)</FormLabel>
                         <FormControl>
                           <Input type="number" {...field} className="bg-black/20 border-white/10" />
                         </FormControl>
                         <FormMessage />
                       </FormItem>
                     )}
                   />
                </div>

                <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-black/30 border border-white/5">
                   <FormField
                     control={form.control}
                     name="stage3_hours"
                     render={({ field }) => (
                       <FormItem>
                         <FormLabel className="text-green-400">Stage 3 (Hours)</FormLabel>
                         <FormControl>
                           <Input type="number" {...field} className="bg-black/20 border-white/10" />
                         </FormControl>
                         <FormMessage />
                       </FormItem>
                     )}
                   />
                   <FormField
                     control={form.control}
                     name="stage3_percent"
                     render={({ field }) => (
                       <FormItem>
                         <FormLabel className="text-green-400">Stage 3 Unlock (%)</FormLabel>
                         <FormControl>
                           <Input type="number" {...field} className="bg-black/20 border-white/10" />
                         </FormControl>
                         <FormMessage />
                       </FormItem>
                     )}
                   />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end">
            <Button 
              type="submit" 
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8"
              disabled={updateSettings.isPending}
            >
              {updateSettings.isPending ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Save className="mr-2 h-5 w-5" />
              )}
              Save Configuration
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}