import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { getAuthUser, validateSession } from "@/lib/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const [, setLocation] = useLocation();
  const [isValidating, setIsValidating] = useState(true);
  const [user, setUser] = useState(getAuthUser());

  useEffect(() => {
    const checkAuth = async () => {
      const validatedUser = await validateSession();
      setUser(validatedUser);
      setIsValidating(false);

      if (!validatedUser) {
        setLocation("/login");
        return;
      }

      if (allowedRoles && !allowedRoles.includes(validatedUser.role)) {
        if (validatedUser.role === "admin") {
          setLocation("/admin/dashboard");
        } else if (validatedUser.role === "store_owner") {
          setLocation("/owner/dashboard");
        } else {
          setLocation("/stores");
        }
      }
    };

    checkAuth();
  }, [allowedRoles, setLocation]);

  if (isValidating) {
    return null;
  }

  if (!user) {
    return null;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
