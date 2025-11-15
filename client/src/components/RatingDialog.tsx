import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StarRating } from "./StarRating";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface RatingDialogProps {
  storeId: number;
  storeName: string;
  currentRating?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RatingDialog({ storeId, storeName, currentRating, open, onOpenChange }: RatingDialogProps) {
  const [rating, setRating] = useState(currentRating || 0);
  const { toast } = useToast();

  const submitRatingMutation = useMutation({
    mutationFn: async (data: { storeId: number; rating: number }) => {
      return apiRequest("POST", "/api/ratings", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stores"] });
      toast({
        title: currentRating ? "Rating updated" : "Rating submitted",
        description: `Your rating for ${storeName} has been ${currentRating ? "updated" : "submitted"} successfully`,
      });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to submit rating",
        description: error.message,
      });
    },
  });

  const handleSubmit = () => {
    if (rating === 0) {
      toast({
        variant: "destructive",
        title: "Please select a rating",
        description: "You must select at least 1 star",
      });
      return;
    }
    submitRatingMutation.mutate({ storeId, rating });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{currentRating ? "Update Rating" : "Rate Store"}</DialogTitle>
          <DialogDescription>
            How would you rate {storeName}?
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-6 py-4">
          <StarRating
            rating={rating}
            size="lg"
            interactive
            onRatingChange={setRating}
            className="justify-center"
          />
          <p className="text-sm text-muted-foreground">
            {rating === 0 ? "Click to rate" : `You selected ${rating} star${rating > 1 ? "s" : ""}`}
          </p>
        </div>
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            data-testid="button-cancel-rating"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitRatingMutation.isPending || rating === 0}
            data-testid="button-submit-rating"
          >
            {submitRatingMutation.isPending ? "Submitting..." : currentRating ? "Update Rating" : "Submit Rating"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
