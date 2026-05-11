import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useLogin } from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff, TrendingUp, Shield, Coins, Users } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const features = [
  { icon: TrendingUp, text: "Up to 100% returns on trading" },
  { icon: Shield, text: "Staged unlock system for security" },
  { icon: Coins, text: "USDT BEP20 secure deposits" },
  { icon: Users, text: "Referral rewards program" },
];

const stats = [
  { value: "$12M+", label: "Total Volume" },
  { value: "8,400+", label: "Active Traders" },
  { value: "99.9%", label: "Uptime" },
];

export default function Login() {
  const [, setLocation] = useLocation();
  const [showPass, setShowPass] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();
  const loginMutation = useLogin();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const onSubmit = (data: LoginFormValues) => {
    loginMutation.mutate({ data }, {
      onSuccess: (res) => {
        login(res);
        setLocation("/");
      },
      onError: (err: any) => {
        toast({
          title: "Login failed",
          description: err?.message || "Invalid credentials",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <div className="min-h-screen w-full flex" style={{ background: "#070b14" }}>
      {/* LEFT PANEL */}
      <div
        className="hidden lg:flex flex-col justify-between w-[55%] relative overflow-hidden p-12"
        style={{
          background: "linear-gradient(135deg, #070b14 0%, #0d1628 60%, #0a1020 100%)",
          borderRight: "1px solid rgba(245,158,11,0.1)",
        }}
      >
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(59,130,246,0.6) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(59,130,246,0.6) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
        {/* Glow */}
        <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #3b82f6, transparent 70%)", filter: "blur(60px)" }} />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm"
            style={{ background: "#3b82f6", color: "#ffffff" }}>24</div>
          <span className="text-white font-bold text-xl tracking-wide">24TradeX</span>
        </div>

        {/* Center content */}
        <div className="relative z-10 flex-1 flex flex-col justify-center py-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-8 w-fit"
            style={{ background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.3)", color: "#3b82f6" }}>
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Platform Live — Trade Now
          </div>

          <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-4">
            Grow Your Wealth with{" "}
            <span style={{ color: "#3b82f6" }}>Smart Crypto</span>{" "}
            Trading
          </h1>
          <p className="text-gray-400 text-lg mb-10 leading-relaxed">
            Join thousands of traders earning passive income through our secure, staged trading platform.
          </p>

          <div className="space-y-4">
            {features.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.2)" }}>
                  <Icon className="w-4 h-4" style={{ color: "#3b82f6" }} />
                </div>
                <span className="text-gray-300 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="relative z-10 grid grid-cols-3 gap-4 pt-8"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          {stats.map(({ value, label }) => (
            <div key={label}>
              <div className="text-xl font-bold" style={{ color: "#3b82f6" }}>{value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative">
        {/* Mobile logo */}
        <div className="absolute top-6 left-6 flex items-center gap-2 lg:hidden">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs"
            style={{ background: "#3b82f6", color: "#ffffff" }}>24</div>
          <span className="text-white font-bold">24TradeX</span>
        </div>

        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-1">Welcome back</h2>
            <p className="text-gray-500 text-sm">Sign in to your trading account</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300 text-sm">Username</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your username"
                        {...field}
                        className="h-12 text-white placeholder:text-gray-600 border-0 focus-visible:ring-1 focus-visible:ring-blue-500/50"
                        style={{ background: "rgba(255,255,255,0.05)", borderRadius: "8px" }}
                        autoComplete="username"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-gray-300 text-sm">Password</FormLabel>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPass ? "text" : "password"}
                          placeholder="Enter your password"
                          {...field}
                          className="h-12 pr-10 text-white placeholder:text-gray-600 border-0 focus-visible:ring-1 focus-visible:ring-blue-500/50"
                          style={{ background: "rgba(255,255,255,0.05)", borderRadius: "8px" }}
                          autoComplete="current-password"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                          onClick={() => setShowPass(!showPass)}
                        >
                          {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full h-12 font-semibold text-sm tracking-wide transition-all duration-200 border-0 cursor-pointer"
                style={{
                  background: loginMutation.isPending ? "rgba(59,130,246,0.6)" : "#3b82f6",
                  color: "#070b14",
                  borderRadius: "8px",
                }}
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...</>
                ) : "Sign In"}
              </Button>
            </form>
          </Form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Don't have an account?{" "}
            <Link href="/register">
              <span className="font-medium cursor-pointer hover:opacity-80 transition-opacity" style={{ color: "#3b82f6" }}>
                Create account
              </span>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
