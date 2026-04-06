"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  DEFAULT_AUTHENTICATED_ROUTE,
  isAuthenticated,
} from "@/lib/auth";

const PUBLIC_ROUTES = new Set(["/login", "/signup"]);

export default function AuthGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setIsMounted(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const authed = isAuthenticated();
    const isPublicRoute = PUBLIC_ROUTES.has(pathname);

    if (!authed && !isPublicRoute) {
      router.replace("/login");
      return;
    }

    if (authed && isPublicRoute) {
      router.replace(DEFAULT_AUTHENTICATED_ROUTE);
    }
  }, [isMounted, pathname, router]);

  if (!isMounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f5f5] text-sm text-gray-500">
        Loading BetterMailer...
      </div>
    );
  }

  const authed = isAuthenticated();
  const isPublicRoute = PUBLIC_ROUTES.has(pathname);

  if ((!authed && !isPublicRoute) || (authed && isPublicRoute)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f5f5] text-sm text-gray-500">
        Loading BetterMailer...
      </div>
    );
  }

  return <>{children}</>;
}
