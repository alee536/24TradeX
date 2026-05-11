import { useState } from "react";
import { useAdminListUsers, useAdminUpdateUser, getAdminListUsersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatCrypto } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search, ChevronLeft, ChevronRight, ShieldAlert, ShieldCheck } from "lucide-react";

export default function AdminUsers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: users, isLoading } = useAdminListUsers({ 
    page,
    search: searchQuery || undefined
  });

  const updateUser = useAdminUpdateUser();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(search);
    setPage(1);
  };

  const toggleStatus = (id: number, currentStatus: boolean, field: 'is_active' | 'is_banned') => {
    updateUser.mutate({ id, data: { [field]: !currentStatus } }, {
      onSuccess: () => {
        toast({ title: `User ${field.replace('is_', '')} status updated` });
        queryClient.invalidateQueries({ queryKey: getAdminListUsersQueryKey() });
      },
      onError: () => toast({ title: "Failed to update user", variant: "destructive" })
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground mt-2">Manage system users and access controls.</p>
      </div>

      <Card className="glass-panel border-white/10">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle>Registered Users</CardTitle>
          <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:w-auto">
             <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search by username or email..." 
                  className="pl-9 bg-black/20 border-white/10" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
             </div>
             <Button type="submit" variant="secondary" className="bg-white/10 hover:bg-white/20">Search</Button>
          </form>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-white/10 overflow-x-auto bg-black/20">
            <Table>
              <TableHeader className="bg-white/5">
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableHead>User</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Purchases</TableHead>
                  <TableHead className="text-right">Withdrawals</TableHead>
                  <TableHead className="text-center">Status</TableHead>
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
                ) : users?.results?.length ? (
                  users.results.map((user) => (
                    <TableRow key={user.id} className="border-white/5 hover:bg-white/5">
                      <TableCell>
                        <div className="font-medium text-white">{user.username}</div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(user.date_joined).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right font-mono text-primary">
                         {formatCrypto(user.total_purchased || 0)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-green-400">
                         {formatCrypto(user.total_withdrawn || 0)}
                      </TableCell>
                      <TableCell className="text-center">
                         <div className="flex justify-center gap-2">
                           {user.is_active ? 
                             <Badge className="bg-green-500/20 text-green-500 border-none">Active</Badge> : 
                             <Badge variant="outline" className="text-muted-foreground">Inactive</Badge>}
                           {user.is_banned && <Badge variant="destructive" className="bg-red-500/20 text-red-500 border-none">Banned</Badge>}
                         </div>
                      </TableCell>
                      <TableCell className="text-right">
                         <div className="flex justify-end gap-2">
                           <Button 
                             size="sm" 
                             variant="outline" 
                             className="border-white/10 bg-black/20 text-xs"
                             onClick={() => toggleStatus(user.id, user.is_active, 'is_active')}
                             disabled={updateUser.isPending}
                           >
                             {user.is_active ? 'Deactivate' : 'Activate'}
                           </Button>
                           <Button 
                             size="sm" 
                             variant="outline" 
                             className={user.is_banned ? "border-green-500/20 text-green-500 bg-green-500/10" : "border-red-500/20 text-red-500 bg-red-500/10"}
                             onClick={() => toggleStatus(user.id, user.is_banned, 'is_banned')}
                             disabled={updateUser.isPending}
                           >
                             {user.is_banned ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                           </Button>
                         </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      No users found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {users && users.count > 0 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {((page - 1) * 10) + 1} to {Math.min(page * 10, users.count)} of {users.count}
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
                  disabled={!users.results || users.results.length < 10}
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