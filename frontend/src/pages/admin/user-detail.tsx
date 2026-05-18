import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useAdminApprovePurchase, useAdminRejectPurchase, useAdminApproveWithdrawal, useAdminRejectWithdrawal } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCrypto, formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ChevronLeft, Users, Wallet, ArrowDown, ArrowUp, TrendingUp, Clock } from "lucide-react";

interface UserDetail {
  user: any;
  statistics: any;
  child_users: any[];
  purchases: any[];
  withdrawals: any[];
  sponsor_earnings: any[];
}

export default function AdminUserDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [detail, setDetail] = useState<UserDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState<{ type: 'purchase' | 'withdrawal'; id: number } | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    if (!id) return;
    const fetchDetail = async () => {
      try {
        const token = localStorage.getItem("24tradex_token");
        const response = await fetch(`/api/admin/users/${id}/detail`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          }
        });
        const data = await response.json();
        setDetail(data);
      } catch (error) {
        console.error(error);
        toast({ title: "Failed to load user details", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetail();
  }, [id, toast]);

  const approvePurchase = useAdminApprovePurchase();
  const rejectPurchase = useAdminRejectPurchase();
  const approveWithdrawal = useAdminApproveWithdrawal();
  const rejectWithdrawal = useAdminRejectWithdrawal();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">User not found</p>
        <Button variant="outline" className="mt-4" onClick={() => setLocation('/admin/users')}>
          Back to Users
        </Button>
      </div>
    );
  }

  const user = detail.user;
  const stats = detail.statistics;
  const childUsers = detail.child_users || [];
  const purchases = detail.purchases || [];
  const withdrawals = detail.withdrawals || [];
  const sponsorEarnings = detail.sponsor_earnings || [];

  const handleApprovePurchase = (purchaseId: number) => {
    approvePurchase.mutate({ id: purchaseId }, {
      onSuccess: () => {
        toast({ title: "Purchase approved successfully" });
      },
      onError: (err: any) => toast({ title: "Failed", description: err?.message, variant: "destructive" })
    });
  };

  const handleRejectPurchase = () => {
    if (!rejectModal || rejectModal.type !== 'purchase' || !rejectReason.trim()) return;
    rejectPurchase.mutate({ id: rejectModal.id, data: { reason: rejectReason } }, {
      onSuccess: () => {
        toast({ title: "Purchase rejected" });
        setRejectModal(null);
        setRejectReason("");
      },
      onError: (err: any) => toast({ title: "Failed", description: err?.message, variant: "destructive" })
    });
  };

  const handleApproveWithdrawal = (withdrawalId: number) => {
    const txHash = prompt("Enter transaction hash:");
    if (!txHash) return;
    approveWithdrawal.mutate({ id: withdrawalId, data: { manual_tx_hash: txHash } }, {
      onSuccess: () => {
        toast({ title: "Withdrawal approved successfully" });
      },
      onError: (err: any) => toast({ title: "Failed", description: err?.message, variant: "destructive" })
    });
  };

  const handleRejectWithdrawal = () => {
    if (!rejectModal || rejectModal.type !== 'withdrawal' || !rejectReason.trim()) return;
    rejectWithdrawal.mutate({ id: rejectModal.id, data: { reason: rejectReason } }, {
      onSuccess: () => {
        toast({ title: "Withdrawal rejected" });
        setRejectModal(null);
        setRejectReason("");
      },
      onError: (err: any) => toast({ title: "Failed", description: err?.message, variant: "destructive" })
    });
  };

  return (
    <div className="space-y-6">
      <Button variant="outline" className="border-white/10" onClick={() => setLocation('/admin/users')}>
        <ChevronLeft className="w-4 h-4 mr-2" />
        Back to Users
      </Button>

      {/* User Profile Header */}
      <Card className="glass-panel border-white/10 bg-linear-to-r from-blue-500/10 to-purple-500/10">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">{user.full_name || user.username}</h1>
              <div className="flex gap-4 flex-wrap">
                <p className="text-muted-foreground text-sm">Username: <span className="text-white font-mono">{user.username}</span></p>
                <p className="text-muted-foreground text-sm">Email: <span className="text-white font-mono">{user.email}</span></p>
                <p className="text-muted-foreground text-sm">Sponsor Code: <span className="text-white font-mono">{user.sponsor_code}</span></p>
              </div>
            </div>
            <div className="text-right">
              {user.is_active ? <Badge className="bg-green-500/20 text-green-500">Active</Badge> : <Badge variant="outline">Inactive</Badge>}
              {user.is_banned && <Badge variant="destructive" className="ml-2">Banned</Badge>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="glass-panel border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Wallet className="w-4 h-4" /> Total Purchased
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">{formatCrypto(stats.total_purchased)}</div>
            <p className="text-xs text-muted-foreground mt-1">Approved purchases</p>
          </CardContent>
        </Card>

        <Card className="glass-panel border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ArrowDown className="w-4 h-4" /> Total Withdrawn
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">{formatCrypto(stats.total_withdrawn)}</div>
            <p className="text-xs text-muted-foreground mt-1">Approved withdrawals</p>
          </CardContent>
        </Card>

        <Card className="glass-panel border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Sponsor Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-400">{formatCrypto(stats.total_sponsor_earnings)}</div>
            <p className="text-xs text-muted-foreground mt-1">From sponsored users</p>
          </CardContent>
        </Card>

        <Card className="glass-panel border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4" /> Child Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-400">{stats.child_users_count}</div>
            <p className="text-xs text-muted-foreground mt-1">Sponsored by this user</p>
          </CardContent>
        </Card>

        <Card className="glass-panel border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4" /> Joined
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold text-cyan-400">{new Date(user.date_joined).toLocaleDateString()}</div>
            <p className="text-xs text-muted-foreground mt-1">{new Date(user.date_joined).toLocaleTimeString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="purchases" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-black/30 border border-white/10">
          <TabsTrigger value="purchases">Purchases {stats.pending_purchases > 0 && <span className="ml-2 badge">{stats.pending_purchases}</span>}</TabsTrigger>
          <TabsTrigger value="withdrawals">Withdrawals {stats.pending_withdrawals > 0 && <span className="ml-2 badge">{stats.pending_withdrawals}</span>}</TabsTrigger>
          <TabsTrigger value="sponsor_earnings">Sponsor Earnings</TabsTrigger>
          <TabsTrigger value="children">Child Users</TabsTrigger>
        </TabsList>

        {/* Purchases Tab */}
        <TabsContent value="purchases">
          <Card className="glass-panel border-white/10">
            <CardHeader>
              <CardTitle>Purchase Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-white/10 overflow-x-auto bg-black/20">
                <Table>
                  <TableHeader className="bg-white/5">
                    <TableRow className="border-white/10">
                      <TableHead>Transaction ID</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {purchases.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          No purchases found
                        </TableCell>
                      </TableRow>
                    ) : (
                      purchases.map((p: any) => (
                        <TableRow key={p.id} className="border-white/5">
                          <TableCell className="font-mono text-sm">{p.transaction_id}</TableCell>
                          <TableCell className="text-right font-bold text-blue-400">{formatCrypto(p.amount)}</TableCell>
                          <TableCell>
                            <Badge variant={p.status === 'pending' ? 'secondary' : p.status === 'approved' ? 'default' : 'destructive'}>
                              {p.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            {p.status === 'pending' && (
                              <div className="flex justify-end gap-2">
                                <Button size="sm" className="bg-green-500/20 hover:bg-green-500/30 text-green-500" onClick={() => handleApprovePurchase(p.id)}>
                                  Approve
                                </Button>
                                <Button size="sm" className="bg-red-500/20 hover:bg-red-500/30 text-red-500" onClick={() => setRejectModal({ type: 'purchase', id: p.id })}>
                                  Reject
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Withdrawals Tab */}
        <TabsContent value="withdrawals">
          <Card className="glass-panel border-white/10">
            <CardHeader>
              <CardTitle>Withdrawal Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-white/10 overflow-x-auto bg-black/20">
                <Table>
                  <TableHeader className="bg-white/5">
                    <TableRow className="border-white/10">
                      <TableHead>Amount</TableHead>
                      <TableHead>Wallet Address</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {withdrawals.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          No withdrawals found
                        </TableCell>
                      </TableRow>
                    ) : (
                      withdrawals.map((w: any) => (
                        <TableRow key={w.id} className="border-white/5">
                          <TableCell className="font-bold text-green-400">{formatCrypto(w.amount)}</TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground">{w.wallet_address.slice(0, 20)}...</TableCell>
                          <TableCell>
                            <Badge variant={w.status === 'pending' ? 'secondary' : w.status === 'approved' ? 'default' : 'destructive'}>
                              {w.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{new Date(w.created_at).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            {w.status === 'pending' && (
                              <div className="flex justify-end gap-2">
                                <Button size="sm" className="bg-green-500/20 hover:bg-green-500/30 text-green-500" onClick={() => handleApproveWithdrawal(w.id)}>
                                  Approve
                                </Button>
                                <Button size="sm" className="bg-red-500/20 hover:bg-red-500/30 text-red-500" onClick={() => setRejectModal({ type: 'withdrawal', id: w.id })}>
                                  Reject
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sponsor Earnings Tab */}
        <TabsContent value="sponsor_earnings">
          <Card className="glass-panel border-white/10">
            <CardHeader>
              <CardTitle>Sponsor Earnings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-white/10 overflow-x-auto bg-black/20">
                <Table>
                  <TableHeader className="bg-white/5">
                    <TableRow className="border-white/10">
                      <TableHead>Sponsored User</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sponsorEarnings.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                          No sponsor earnings
                        </TableCell>
                      </TableRow>
                    ) : (
                      sponsorEarnings.map((e: any) => (
                        <TableRow key={e.id} className="border-white/5">
                          <TableCell className="font-medium">{e.sponsored_user}</TableCell>
                          <TableCell className="text-right font-bold text-amber-400">{formatCrypto(e.amount)}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{new Date(e.created_at).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Child Users Tab */}
        <TabsContent value="children">
          <Card className="glass-panel border-white/10">
            <CardHeader>
              <CardTitle>Sponsored Users (Child Users)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-white/10 overflow-x-auto bg-black/20">
                <Table>
                  <TableHeader className="bg-white/5">
                    <TableRow className="border-white/10">
                      <TableHead>Username</TableHead>
                      <TableHead>Full Name</TableHead>
                      <TableHead className="text-right">Total Purchased</TableHead>
                      <TableHead className="text-right">Total Withdrawn</TableHead>
                      <TableHead>Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {childUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          No child users found
                        </TableCell>
                      </TableRow>
                    ) : (
                      childUsers.map((child: any) => (
                        <TableRow key={child.id} className="border-white/5 cursor-pointer hover:bg-white/5" onClick={() => setLocation(`/admin/users/${child.id}`)}>
                          <TableCell className="font-mono text-sm text-blue-400">{child.username}</TableCell>
                          <TableCell>{child.full_name}</TableCell>
                          <TableCell className="text-right font-bold text-blue-400">{formatCrypto(child.total_purchased)}</TableCell>
                          <TableCell className="text-right font-bold text-green-400">{formatCrypto(child.total_withdrawn)}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{new Date(child.date_joined).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Reject Dialog */}
      <Dialog open={!!rejectModal} onOpenChange={() => { setRejectModal(null); setRejectReason(""); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject {rejectModal?.type === 'purchase' ? 'Purchase' : 'Withdrawal'}</DialogTitle>
            <DialogDescription>Provide a reason for rejection. This will be notified to the user.</DialogDescription>
          </DialogHeader>
          <Input 
            placeholder="Rejection reason..." 
            value={rejectReason} 
            onChange={(e) => setRejectReason(e.target.value)}
            className="bg-black/20 border-white/10"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setRejectModal(null); setRejectReason(""); }}>Cancel</Button>
            <Button 
              className="bg-red-500/20 hover:bg-red-500/30 text-red-500"
              onClick={rejectModal?.type === 'purchase' ? handleRejectPurchase : handleRejectWithdrawal}
              disabled={!rejectReason.trim()}
            >
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
