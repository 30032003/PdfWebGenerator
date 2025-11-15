import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updatePasswordSchema } from "@shared/schema";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function ChangePassword() {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof updatePasswordSchema>>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: z.infer<typeof updatePasswordSchema>) => {
      return apiRequest("POST", "/api/auth/change-password", data);
    },
    onSuccess: () => {
      toast({
        title: "Password updated",
        description: "Your password has been changed successfully",
      });
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to update password",
        description: error.message,
      });
    },
  });

  const onSubmit = (data: z.infer<typeof updatePasswordSchema>) => {
    changePasswordMutation.mutate(data);
  };

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4" data-testid="link-back">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
          <h1 className="text-3xl font-semibold">Change Password</h1>
          <p className="text-muted-foreground">Update your account password</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Update Password</CardTitle>
            <CardDescription>Enter your current password and choose a new one</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter current password"
                          data-testid="input-current-password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter new password"
                          data-testid="input-new-password"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        8-16 characters with at least one uppercase letter and one special character
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  disabled={changePasswordMutation.isPending}
                  data-testid="button-change-password"
                >
                  {changePasswordMutation.isPending ? "Updating..." : "Update Password"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
