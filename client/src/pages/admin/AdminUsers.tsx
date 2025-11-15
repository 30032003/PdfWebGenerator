import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AddUserDialog } from "@/components/admin/AddUserDialog";
import { RoleBadge } from "@/components/RoleBadge";
import { ArrowUpDown } from "lucide-react";
import type { UserWithoutPassword } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function AdminUsers() {
  const [nameFilter, setNameFilter] = useState("");
  const [emailFilter, setEmailFilter] = useState("");
  const [addressFilter, setAddressFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<"name" | "email" | "address" | "role">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const { data: users = [], isLoading } = useQuery<UserWithoutPassword[]>({
    queryKey: ["/api/admin/users"],
  });

  const filteredAndSortedUsers = useMemo(() => {
    let filtered = users.filter((user) => {
      const matchesName = user.name.toLowerCase().includes(nameFilter.toLowerCase());
      const matchesEmail = user.email.toLowerCase().includes(emailFilter.toLowerCase());
      const matchesAddress = user.address.toLowerCase().includes(addressFilter.toLowerCase());
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      return matchesName && matchesEmail && matchesAddress && matchesRole;
    });

    filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [users, nameFilter, emailFilter, addressFilter, roleFilter, sortField, sortOrder]);

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
          <h1 className="text-3xl font-semibold">Users</h1>
          <p className="text-muted-foreground">Manage all users on the platform</p>
        </div>
        <AddUserDialog />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Input
          placeholder="Filter by name..."
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
          data-testid="input-filter-name"
        />
        <Input
          placeholder="Filter by email..."
          value={emailFilter}
          onChange={(e) => setEmailFilter(e.target.value)}
          data-testid="input-filter-email"
        />
        <Input
          placeholder="Filter by address..."
          value={addressFilter}
          onChange={(e) => setAddressFilter(e.target.value)}
          data-testid="input-filter-address"
        />
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger data-testid="select-filter-role">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">System Admin</SelectItem>
            <SelectItem value="user">Normal User</SelectItem>
            <SelectItem value="store_owner">Store Owner</SelectItem>
          </SelectContent>
        </Select>
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
                    data-testid="sort-name"
                  >
                    Name <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => toggleSort("email")}
                    className="hover-elevate"
                    data-testid="sort-email"
                  >
                    Email <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => toggleSort("address")}
                    className="hover-elevate"
                    data-testid="sort-address"
                  >
                    Address <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => toggleSort("role")}
                    className="hover-elevate"
                    data-testid="sort-role"
                  >
                    Role <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndSortedUsers.map((user) => (
                  <TableRow key={user.id} data-testid={`row-user-${user.id}`}>
                    <TableCell className="font-medium" data-testid={`text-user-name-${user.id}`}>
                      {user.name}
                    </TableCell>
                    <TableCell data-testid={`text-user-email-${user.id}`}>{user.email}</TableCell>
                    <TableCell className="max-w-xs truncate" data-testid={`text-user-address-${user.id}`}>
                      {user.address}
                    </TableCell>
                    <TableCell>
                      <RoleBadge role={user.role} />
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
