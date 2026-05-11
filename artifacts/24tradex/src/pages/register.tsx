import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useRegister } from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff, TrendingUp, Shield, Coins, Users } from "lucide-react";

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  full_name: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  sponsor_code: z.string().optional(),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const features = [
  { icon: TrendingUp, text: "Up to 100% returns on trading" },
  { icon: Shield, text: "Staged unlock system for security" },
  { icon: Coins, text: "USDT BEP20 secure deposits" },
  { icon: Users, text: "Earn commissions by referring others" },
];

const stats = [
  { value: "$12M+", label: "Total Volume" },
  { value: "8,400+", label: "Active Traders" },
  { value: "99.9%", label: "Uptime" },
];

export default function Register() {
  const [, setLocation] = useLocation();
  const [showPass, setShowPass] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();
  const registerMutation = useRegister();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: "", full_name: "", email: "", password: "", sponsor_code: "" },
  });

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search).get("sp");
    if (sp) form.setValue("sponsor_code", sp);
  }, [form]);

  const onSubmit = (data: RegisterFormValues) => {
    const submitData = { ...data, sponsor_code: data.sponsor_code || undefined };
    registerMutation.mutate({ data: submitData }, {
      onSuccess: (res) => {
        login(res);
        toast({ title: "Welcome to 24TradeX!", description: "Your account has been created." });
        setLocation("/");
      },
      onError: (err: any) => {
        toast({
          title: "Registration failed",
          description: err?.message || "Something went wrong",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <div className="min-h-screen w-full flex" style={{ background: "#070b14" }}>
      {/* LEFT PANEL */}
      <div
        className="hidden lg:flex flex-col justify-between w-[45%] relative overflow-hidden p-12"
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
        <div className="absolute top-1/3 left-1/4 w-80 h-80 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #3b82f6, transparent 70%)", filter: "blur(60px)" }} />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm"
            style={{ background: "#3b82f6", color: "#ffffff" }}>24</div>
          <span className="text-white font-bold text-xl tracking-wide">24TradeX</span>
        </div>

        {/* Center content */}
        <div className="relative z-10 flex-1 flex flex-col justify-center py-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-8 w-fit"
            style={{ background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.3)", color: "#3b82f6" }}>
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Join the Elite Network
          </div>

          <h1 className="text-3xl xl:text-4xl font-bold text-white leading-tight mb-4">
            Start Your{" "}
            <span style={{ color: "#3b82f6" }}>Crypto Trading</span>{" "}
            Journey Today
          </h1>
          <p className="text-gray-400 text-base mb-10 leading-relaxed">
            Create your account and begin earning through our proven staged trading platform.
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
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative overflow-y-auto">
        {/* Mobile logo */}
        <div className="absolute top-6 left-6 flex items-center gap-2 lg:hidden">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs"
            style={{ background: "#3b82f6", color: "#ffffff" }}>24</div>
          <span className="text-white font-bold">24TradeX</span>
        </div>

        <div className="w-full max-w-md py-12 lg:py-0">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-1">Create your account</h2>
            <p className="text-gray-500 text-sm">Join the 24TradeX trading network</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300 text-sm">Username</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="johndoe"
                          {...field}
                          className="h-11 text-white placeholder:text-gray-600 border-0 focus-visible:ring-1 focus-visible:ring-blue-500/50"
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
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300 text-sm">Full Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="John Doe"
                          {...field}
                          className="h-11 text-white placeholder:text-gray-600 border-0 focus-visible:ring-1 focus-visible:ring-blue-500/50"
                          style={{ background: "rgba(255,255,255,0.05)", borderRadius: "8px" }}
                          autoComplete="name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300 text-sm">Email Address</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="john@example.com"
                        {...field}
                        className="h-11 text-white placeholder:text-gray-600 border-0 focus-visible:ring-1 focus-visible:ring-blue-500/50"
                        style={{ background: "rgba(255,255,255,0.05)", borderRadius: "8px" }}
                        autoComplete="email"
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
                    <FormLabel className="text-gray-300 text-sm">Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPass ? "text" : "password"}
                          placeholder="Minimum 6 characters"
                          {...field}
                          className="h-11 pr-10 text-white placeholder:text-gray-600 border-0 focus-visible:ring-1 focus-visible:ring-blue-500/50"
                          style={{ background: "rgba(255,255,255,0.05)", borderRadius: "8px" }}
                          autoComplete="new-password"
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

              <FormField
                control={form.control}
                name="sponsor_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300 text-sm">
                      Sponsor Code{" "}
                      <span className="text-gray-600 font-normal">(Optional)</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="24TX-XXXXXX"
                        {...field}
                        className="h-11 text-white placeholder:text-gray-600 border-0 focus-visible:ring-1 focus-visible:ring-blue-500/50"
                        style={{ background: "rgba(255,255,255,0.05)", borderRadius: "8px" }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full h-12 font-semibold text-sm tracking-wide transition-all duration-200 border-0 cursor-pointer"
                  style={{
                    background: registerMutation.isPending ? "rgba(59,130,246,0.6)" : "#3b82f6",
                    color: "#070b14",
                    borderRadius: "8px",
                  }}
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Account...</>
                  ) : "Create Account"}
                </Button>
              </div>
            </form>
          </Form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/login">
              <span className="font-medium cursor-pointer hover:opacity-80 transition-opacity" style={{ color: "#3b82f6" }}>
                Sign in
              </span>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
