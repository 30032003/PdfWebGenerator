import { Badge } from "@/components/ui/badge";
import { Shield, User, Store } from "lucide-react";

interface RoleBadgeProps {
  role: string;
  className?: string;
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  const roleConfig = {
    admin: {
      label: "System Admin",
      icon: Shield,
      variant: "default" as const,
    },
    user: {
      label: "User",
      icon: User,
      variant: "secondary" as const,
    },
    store_owner: {
      label: "Store Owner",
      icon: Store,
      variant: "outline" as const,
    },
  };

  const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.user;
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={className} data-testid={`badge-role-${role}`}>
      <Icon className="h-3 w-3 mr-1" />
      {config.label}
    </Badge>
  );
}
