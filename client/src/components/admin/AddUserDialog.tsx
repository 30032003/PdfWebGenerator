import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";

export function AddUserDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof insertUserSchema>>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      address: "",
      role: "user",
    },
  });

  const addUserMutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertUserSchema>) => {
      return apiRequest("POST", "/api/admin/users", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: "User added",
        description: "The user has been added successfully",
      });
      setOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to add user",
        description: error.message,
      });
    },
  });

  const onSubmit = (data: z.infer<typeof insertUserSchema>) => {
    addUserMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button data-testid="button-add-user">
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>Create a new user or admin account</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Full name" data-testid="input-user-name" {...field} />
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
                    <Input type="email" placeholder="email@example.com" data-testid="input-user-email" {...field} />
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
                    <Textarea placeholder="Address" className="resize-none" rows={2} data-testid="input-user-address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Password" data-testid="input-user-password" {...field} />
                  </FormControl>
                  <FormDescription className="text-xs">
                    8-16 chars, 1 uppercase, 1 special char
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-user-role">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="user">Normal User</SelectItem>
                      <SelectItem value="admin">System Admin</SelectItem>
                      <SelectItem value="store_owner">Store Owner</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} data-testid="button-cancel-user">
                Cancel
              </Button>
              <Button type="submit" disabled={addUserMutation.isPending} data-testid="button-submit-user">
                {addUserMutation.isPending ? "Adding..." : "Add User"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
