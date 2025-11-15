import { useQuery } from "@tanstack/react-query";
import { Users, Store, Star } from "lucide-react";
import { StatsCard } from "@/components/admin/StatsCard";
import type { DashboardStats } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/admin/stats"],
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-semibold">Dashboard</h1>
          <p className="text-muted-foreground">Overview of platform statistics</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of platform statistics</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          icon={Users}
          testId="stat-total-users"
        />
        <StatsCard
          title="Total Stores"
          value={stats?.totalStores || 0}
          icon={Store}
          testId="stat-total-stores"
        />
        <StatsCard
          title="Total Ratings"
          value={stats?.totalRatings || 0}
          icon={Star}
          testId="stat-total-ratings"
        />
      </div>
    </div>
  );
}
