import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation, Link } from "wouter";
import { setAuthUser } from "@/lib/auth";
import type { UserWithoutPassword } from "@shared/schema";

export default function Signup() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const signupFormSchema = insertUserSchema.omit({ role: true });

  const form = useForm<z.infer<typeof signupFormSchema>>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      address: "",
    },
  });

  const signupMutation = useMutation({
    mutationFn: async (data: z.infer<typeof signupFormSchema>) => {
      return apiRequest<UserWithoutPassword>("POST", "/api/auth/signup", data);
    },
    onSuccess: (user) => {
      setAuthUser(user);
      toast({
        title: "Account created",
        description: "Your account has been created successfully!",
      });
      setLocation("/stores");
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Signup failed",
        description: error.message,
      });
    },
  });

  const onSubmit = (data: z.infer<typeof signupFormSchema>) => {
    signupMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-semibold">Create an account</CardTitle>
          <CardDescription>Enter your information to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Your full name (20-60 characters)"
                        data-testid="input-name"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Must be between 20 and 60 characters
                    </FormDescription>
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
                      <Input
                        type="email"
                        placeholder="name@example.com"
                        data-testid="input-email"
                        {...field}
                      />
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
                      <Textarea
                        placeholder="Your address (max 400 characters)"
                        className="resize-none"
                        rows={2}
                        data-testid="input-address"
                        {...field}
                      />
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
                      <Input
                        type="password"
                        placeholder="Create a strong password"
                        data-testid="input-password"
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
                className="w-full"
                disabled={signupMutation.isPending}
                data-testid="button-signup"
              >
                {signupMutation.isPending ? "Creating account..." : "Create account"}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline" data-testid="link-login">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
