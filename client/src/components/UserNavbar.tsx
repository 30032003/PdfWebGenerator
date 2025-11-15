import { getAuthUser, logout } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { RoleBadge } from "./RoleBadge";
import { LogOut, KeyRound } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function UserNavbar() {
  const user = getAuthUser();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleLogout = async () => {
    await logout();
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
    setLocation("/login");
  };

  const initials = user?.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="border-b bg-card sticky top-0 z-50">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold">Store Rating Platform</h1>
          <RoleBadge role={user?.role || "user"} />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full" data-testid="button-user-menu">
              <Avatar className="h-9 w-9">
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setLocation("/change-password")} data-testid="menu-change-password">
              <KeyRound className="mr-2 h-4 w-4" />
              Change Password
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout} data-testid="menu-logout">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
