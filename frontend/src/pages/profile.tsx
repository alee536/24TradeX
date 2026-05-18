import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useGetProfile, useUpdateProfile } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getGetProfileQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, User as UserIcon, Mail, Hash, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const profileSchema = z.object({
  full_name: z.string().min(2, "Full name is required"),
  wallet_address: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function Profile() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useGetProfile();
  const updateProfile = useUpdateProfile();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: "",
      wallet_address: "",
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        full_name: profile.full_name,
        wallet_address: profile.wallet_address || "",
      });
    }
  }, [profile, form]);

  const onSubmit = (data: ProfileFormValues) => {
    updateProfile.mutate({ data }, {
      onSuccess: () => {
        toast({ title: "Profile updated successfully" });
        queryClient.invalidateQueries({ queryKey: getGetProfileQueryKey() });
      },
      onError: (err: any) => {
        toast({
          title: "Update failed",
          description: err?.message || "Failed to update profile",
          variant: "destructive",
        });
      }
    });
  };

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Identity Profile</h1>
        <p className="text-muted-foreground mt-2">Manage your personal information and default addresses.</p>
      </div>

      <div className="grid gap-6">
        <Card className="glass-panel overflow-hidden relative">
           <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-secondary" />
           <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                 <div className="h-24 w-24 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-4xl text-primary font-bold">
                    {profile?.username?.charAt(0).toUpperCase() || <UserIcon />}
                 </div>
                 <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                       <h2 className="text-2xl font-bold text-white">{profile?.username}</h2>
                       {profile?.is_admin && <Badge className="bg-red-500/20 text-red-500 border-none"><ShieldCheck className="w-3 h-3 mr-1"/> Admin</Badge>}
                       {profile?.is_active && <Badge className="bg-green-500/20 text-green-500 border-none">Active</Badge>}
                    </div>
                    
                    <div className="grid sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                       <div className="flex items-center gap-2"><Mail className="h-4 w-4" /> {profile?.email}</div>
                       <div className="flex items-center gap-2"><Hash className="h-4 w-4" /> Sponsor Code: {profile?.sponsor_code}</div>
                    </div>
                 </div>
              </div>
           </CardContent>
        </Card>

        <Card className="glass-panel">
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
            <CardDescription>Update your display name and default withdrawal address</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input {...field} className="bg-black/20 border-white/10" />
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
                      <FormLabel>Default Receiving Wallet (BEP20)</FormLabel>
                      <FormControl>
                        <Input placeholder="0x..." {...field} className="bg-black/20 font-mono text-sm border-white/10" />
                      </FormControl>
                      <p className="text-xs text-muted-foreground mt-1">This address will be pre-filled when you request withdrawals.</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end pt-4">
                   <Button 
                     type="submit" 
                     className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                     disabled={updateProfile.isPending}
                   >
                     {updateProfile.isPending ? (
                       <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                     ) : (
                       "Save Changes"
                     )}
                   </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}