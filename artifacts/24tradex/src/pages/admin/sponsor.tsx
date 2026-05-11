import { useState } from "react";
import { useAdminListSponsorRelations } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCrypto, formatCurrency } from "@/lib/utils";
import { Loader2, Search, ChevronLeft, ChevronRight, Users } from "lucide-react";

export default function AdminSponsor() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: relations, isLoading } = useAdminListSponsorRelations({ 
    page,
    search: searchQuery || undefined
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(search);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Sponsor Relations</h1>
        <p className="text-muted-foreground mt-2">View network structure and referral earnings.</p>
      </div>

      <Card className="glass-panel border-white/10">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5 text-secondary" /> Network Tree</CardTitle>
          <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:w-auto">
             <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search by sponsor or user..." 
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
                  <TableHead>Sponsor</TableHead>
                  <TableHead>Sponsored User</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead className="text-right">Purchases</TableHead>
                  <TableHead className="text-right text-secondary">Generated Earnings</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-secondary" />
                    </TableCell>
                  </TableRow>
                ) : relations?.results?.length ? (
                  relations.results.map((rel, idx) => (
                    <TableRow key={idx} className="border-white/5 hover:bg-white/5">
                      <TableCell className="font-medium text-white">
                        {rel.sponsor_username}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">{rel.sponsored_username}</div>
                        <div className="text-xs text-muted-foreground">{rel.sponsored_full_name}</div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(rel.date_joined).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right font-mono text-primary">
                         {formatCrypto(rel.purchase_amount || 0)}
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold text-secondary">
                         {formatCurrency(rel.earnings || 0)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      No sponsor relations found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {relations && relations.count > 0 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {((page - 1) * 10) + 1} to {Math.min(page * 10, relations.count)} of {relations.count}
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
                  disabled={!relations.results || relations.results.length < 10}
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