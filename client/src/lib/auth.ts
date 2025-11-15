import type { UserWithoutPassword } from "@shared/schema";
import { queryClient } from "./queryClient";

const AUTH_STORAGE_KEY = "auth_user";

export function setAuthUser(user: UserWithoutPassword | null) {
  if (user) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
}

export function getAuthUser(): UserWithoutPassword | null {
  const stored = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export async function validateSession(): Promise<UserWithoutPassword | null> {
  try {
    const response = await fetch("/api/auth/me", {
      credentials: "include",
    });
    
    if (response.ok) {
      const user = await response.json();
      setAuthUser(user);
      return user;
    } else {
      setAuthUser(null);
      return null;
    }
  } catch (error) {
    setAuthUser(null);
    return null;
  }
}

export async function logout(): Promise<void> {
  try {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    setAuthUser(null);
    queryClient.clear();
  }
}

export function isAuthenticated(): boolean {
  return getAuthUser() !== null;
}

export function hasRole(role: string | string[]): boolean {
  const user = getAuthUser();
  if (!user) return false;
  if (Array.isArray(role)) {
    return role.includes(user.role);
  }
  return user.role === role;
}
