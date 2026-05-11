import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { UserCircle, LogOut } from "lucide-react";

export default function Settings() {
  const { logout } = useAuth();

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your account settings and preferences.</p>
      </div>

      <Card className="glass-panel">
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Manage your identity and session</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Link href="/profile">
            <Button variant="outline" className="w-full justify-start border-white/10 bg-black/20 hover:bg-white/10" size="lg">
              <UserCircle className="mr-2 h-5 w-5 text-primary" />
              Edit Profile & Wallet Address
            </Button>
          </Link>
          <Button variant="outline" className="w-full justify-start border-red-500/20 text-red-500 bg-red-500/10 hover:bg-red-500/20" size="lg" onClick={() => logout()}>
            <LogOut className="mr-2 h-5 w-5" />
            Logout
          </Button>
        </CardContent>
      </Card>
      
      <Card className="glass-panel">
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Terminal visual settings</CardDescription>
        </CardHeader>
        <CardContent>
           <div className="p-4 rounded-lg bg-black/40 border border-white/10 text-center">
              <span className="text-primary font-mono text-sm">Theme is locked to Dark Mode for optimal trading execution.</span>
           </div>
        </CardContent>
      </Card>
    </div>
  );
}