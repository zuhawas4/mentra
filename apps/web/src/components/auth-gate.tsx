"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useDemoStore } from "@/lib/store/demo-store";
import { Skeleton } from "@/components/skeleton";

export function AuthGate({
  children,
  role,
}: {
  children: React.ReactNode;
  role?: "tutor" | "student";
}) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useDemoStore((s) => s.user);
  const hydrated = useDemoStore((s) => s.hydrated);

  useEffect(() => {
    if (!hydrated) return;
    if (!user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    if (role && user.role !== role) {
      router.replace(user.role === "tutor" ? "/dashboard" : "/student");
    }
  }, [hydrated, user, role, router, pathname]);

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--mentra-background)] p-6">
        <div className="w-full max-w-md space-y-3">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!user || (role && user.role !== role)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--mentra-background)] p-6">
        <div className="w-full max-w-md space-y-3">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
