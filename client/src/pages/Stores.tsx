import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/StarRating";
import { RatingDialog } from "@/components/RatingDialog";
import { Search } from "lucide-react";
import type { StoreWithRating } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

export default function Stores() {
  const [nameFilter, setNameFilter] = useState("");
  const [addressFilter, setAddressFilter] = useState("");
  const [selectedStore, setSelectedStore] = useState<StoreWithRating | null>(null);

  const { data: stores = [], isLoading } = useQuery<StoreWithRating[]>({
    queryKey: ["/api/stores"],
  });

  const filteredStores = stores.filter((store) => {
    const matchesName = store.name.toLowerCase().includes(nameFilter.toLowerCase());
    const matchesAddress = store.address.toLowerCase().includes(addressFilter.toLowerCase());
    return matchesName && matchesAddress;
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Browse Stores</h1>
        <p className="text-muted-foreground">Discover and rate stores on the platform</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by store name..."
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            className="pl-9"
            data-testid="input-search-name"
          />
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by address..."
            value={addressFilter}
            onChange={(e) => setAddressFilter(e.target.value)}
            className="pl-9"
            data-testid="input-search-address"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      ) : filteredStores.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">No stores found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStores.map((store) => (
            <Card key={store.id} className="hover-elevate" data-testid={`card-store-${store.id}`}>
              <CardHeader>
                <CardTitle className="text-lg" data-testid={`text-store-name-${store.id}`}>
                  {store.name}
                </CardTitle>
                <CardDescription className="line-clamp-2" data-testid={`text-store-address-${store.id}`}>
                  {store.address}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Overall Rating</p>
                  <div className="flex items-center gap-2">
                    <StarRating rating={store.averageRating} />
                    <span className="text-sm text-muted-foreground">
                      ({store.totalRatings} rating{store.totalRatings !== 1 ? "s" : ""})
                    </span>
                  </div>
                </div>
                {store.userRating !== undefined && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Your Rating</p>
                    <StarRating rating={store.userRating} size="sm" />
                  </div>
                )}
                <Button
                  className="w-full"
                  variant={store.userRating !== undefined ? "outline" : "default"}
                  onClick={() => setSelectedStore(store)}
                  data-testid={`button-rate-${store.id}`}
                >
                  {store.userRating !== undefined ? "Update Rating" : "Rate Store"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedStore && (
        <RatingDialog
          storeId={selectedStore.id}
          storeName={selectedStore.name}
          currentRating={selectedStore.userRating}
          open={!!selectedStore}
          onOpenChange={(open) => !open && setSelectedStore(null)}
        />
      )}
    </div>
  );
}
