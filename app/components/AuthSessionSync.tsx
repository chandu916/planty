"use client";

import { useEffect } from "react";
import { useAdminStore } from "@/lib/adminStore";
import { useUserStore } from "@/lib/userStore";

type SessionResponse =
  | { success: true; authenticated: false }
  | {
      success: true;
      authenticated: true;
      role: "user";
      user: {
        email: string;
        fullName: string;
        phone: string;
        address: string;
        city: string;
        state: string;
        pincode: string;
      };
    }
  | {
      success: true;
      authenticated: true;
      role: "admin";
      admin: {
        email: string;
        name: string;
        role: string;
      };
    };

export default function AuthSessionSync() {
  useEffect(() => {
    let cancelled = false;

    const sync = async () => {
      try {
        const res = await fetch("/api/auth/session", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });
        const json = await res.json() as SessionResponse;
        if (cancelled || !json.success) return;

        if (!json.authenticated) {
          useUserStore.getState().logout();
          useAdminStore.getState().logout();
          return;
        }

        if (json.role === "user") {
          useAdminStore.getState().logout();
          useUserStore.getState().login(json.user);
          return;
        }

        useUserStore.getState().logout();
        useAdminStore.getState().login(json.admin);
      } catch {
        if (!cancelled) {
          useUserStore.getState().logout();
          useAdminStore.getState().logout();
        }
      }
    };

    void sync();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}