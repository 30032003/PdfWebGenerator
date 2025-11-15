import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertStoreSchema } from "@shared/schema";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";
import type { UserWithoutPassword } from "@shared/schema";

export function AddStoreDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const { data: storeOwners = [] } = useQuery<UserWithoutPassword[]>({
    queryKey: ["/api/admin/store-owners"],
    enabled: open,
  });

  const form = useForm<z.infer<typeof insertStoreSchema>>({
    resolver: zodResolver(insertStoreSchema),
    defaultValues: {
      name: "",
      email: "",
      address: "",
      ownerId: 0,
    },
  });

  const addStoreMutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertStoreSchema>) => {
      return apiRequest("POST", "/api/admin/stores", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stores"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: "Store added",
        description: "The store has been added successfully",
      });
      setOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to add store",
        description: error.message,
      });
    },
  });

  const onSubmit = (data: z.infer<typeof insertStoreSchema>) => {
    addStoreMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button data-testid="button-add-store">
          <Plus className="h-4 w-4 mr-2" />
          Add Store
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Store</DialogTitle>
          <DialogDescription>Register a new store on the platform</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Store Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Store name" data-testid="input-store-name" {...field} />
                  </FormControl>
                  <FormDescription className="text-xs">20-60 characters</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="store@example.com" data-testid="input-store-email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Store address" className="resize-none" rows={2} data-testid="input-store-address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ownerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Store Owner</FormLabel>
                  <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                    <FormControl>
                      <SelectTrigger data-testid="select-store-owner">
                        <SelectValue placeholder="Select store owner" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {storeOwners.map((owner) => (
                        <SelectItem key={owner.id} value={owner.id.toString()}>
                          {owner.name} ({owner.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} data-testid="button-cancel-store">
                Cancel
              </Button>
              <Button type="submit" disabled={addStoreMutation.isPending} data-testid="button-submit-store">
                {addStoreMutation.isPending ? "Adding..." : "Add Store"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
