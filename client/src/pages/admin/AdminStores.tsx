import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AddStoreDialog } from "@/components/admin/AddStoreDialog";
import { StarRating } from "@/components/StarRating";
import { ArrowUpDown } from "lucide-react";
import type { StoreWithRating } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function AdminStores() {
  const [nameFilter, setNameFilter] = useState("");
  const [emailFilter, setEmailFilter] = useState("");
  const [addressFilter, setAddressFilter] = useState("");
  const [sortField, setSortField] = useState<"name" | "email" | "address" | "averageRating">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const { data: stores = [], isLoading } = useQuery<StoreWithRating[]>({
    queryKey: ["/api/admin/stores"],
  });

  const filteredAndSortedStores = useMemo(() => {
    let filtered = stores.filter((store) => {
      const matchesName = store.name.toLowerCase().includes(nameFilter.toLowerCase());
      const matchesEmail = store.email.toLowerCase().includes(emailFilter.toLowerCase());
      const matchesAddress = store.address.toLowerCase().includes(addressFilter.toLowerCase());
      return matchesName && matchesEmail && matchesAddress;
    });

    filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [stores, nameFilter, emailFilter, addressFilter, sortField, sortOrder]);

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Stores</h1>
          <p className="text-muted-foreground">Manage all stores on the platform</p>
        </div>
        <AddStoreDialog />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          placeholder="Filter by name..."
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
          data-testid="input-filter-store-name"
        />
        <Input
          placeholder="Filter by email..."
          value={emailFilter}
          onChange={(e) => setEmailFilter(e.target.value)}
          data-testid="input-filter-store-email"
        />
        <Input
          placeholder="Filter by address..."
          value={addressFilter}
          onChange={(e) => setAddressFilter(e.target.value)}
          data-testid="input-filter-store-address"
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => toggleSort("name")}
                    className="hover-elevate"
                    data-testid="sort-store-name"
                  >
                    Name <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => toggleSort("email")}
                    className="hover-elevate"
                    data-testid="sort-store-email"
                  >
                    Email <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => toggleSort("address")}
                    className="hover-elevate"
                    data-testid="sort-store-address"
                  >
                    Address <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => toggleSort("averageRating")}
                    className="hover-elevate"
                    data-testid="sort-store-rating"
                  >
                    Rating <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedStores.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No stores found
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndSortedStores.map((store) => (
                  <TableRow key={store.id} data-testid={`row-store-${store.id}`}>
                    <TableCell className="font-medium" data-testid={`text-store-name-${store.id}`}>
                      {store.name}
                    </TableCell>
                    <TableCell data-testid={`text-store-email-${store.id}`}>{store.email}</TableCell>
                    <TableCell className="max-w-xs truncate" data-testid={`text-store-address-${store.id}`}>
                      {store.address}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <StarRating rating={store.averageRating} size="sm" />
                        <span className="text-sm text-muted-foreground">
                          ({store.totalRatings})
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
