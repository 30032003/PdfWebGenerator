import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StarRating } from "@/components/StarRating";
import { Skeleton } from "@/components/ui/skeleton";
import type { RatingWithUser } from "@shared/schema";

interface OwnerDashboardData {
  averageRating: number;
  totalRatings: number;
  ratings: RatingWithUser[];
}

export default function OwnerDashboard() {
  const { data, isLoading } = useQuery<OwnerDashboardData>({
    queryKey: ["/api/owner/dashboard"],
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-semibold">Dashboard</h1>
          <p className="text-muted-foreground">Your store performance</p>
        </div>
        <Skeleton className="h-40" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground">Your store performance</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Average Rating</CardTitle>
          <CardDescription>Overall rating from all customers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="text-6xl font-bold" data-testid="text-average-rating">
              {data?.averageRating.toFixed(1) || "0.0"}
            </div>
            <StarRating rating={data?.averageRating || 0} size="lg" />
            <p className="text-sm text-muted-foreground" data-testid="text-total-ratings">
              Based on {data?.totalRatings || 0} rating{data?.totalRatings !== 1 ? "s" : ""}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Customer Ratings</CardTitle>
          <CardDescription>All ratings submitted by customers</CardDescription>
        </CardHeader>
        <CardContent>
          {!data?.ratings || data.ratings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No ratings yet
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rating</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.ratings.map((rating) => (
                    <TableRow key={rating.id} data-testid={`row-rating-${rating.id}`}>
                      <TableCell className="font-medium" data-testid={`text-customer-name-${rating.id}`}>
                        {rating.user.name}
                      </TableCell>
                      <TableCell data-testid={`text-customer-email-${rating.id}`}>
                        {rating.user.email}
                      </TableCell>
                      <TableCell>
                        <StarRating rating={rating.rating} size="sm" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
