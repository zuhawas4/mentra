"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDemoStore } from "@/lib/store/demo-store";
import { Skeleton } from "@/components/skeleton";

function AuthGateInner({
  children,
  role,
}: {
  children: React.ReactNode;
  role?: "tutor" | "student";
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const user = useDemoStore((s) => s.user);
  const hydrated = useDemoStore((s) => s.hydrated);

  useEffect(() => {
    if (!hydrated) return;
    if (!user) {
      const search = searchParams?.toString();
      const next = `${pathname}${search ? `?${search}` : ""}`;
      router.replace(`/login?next=${encodeURIComponent(next)}`);
      return;
    }
    if (role && user.role !== role) {
      router.replace(user.role === "tutor" ? "/dashboard" : "/student");
    }
  }, [hydrated, user, role, router, pathname, searchParams]);

  if (!hydrated || !user || (role && user.role !== role)) {
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

export function AuthGate({
  children,
  role,
}: {
  children: React.ReactNode;
  role?: "tutor" | "student";
}) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[var(--mentra-background)] p-6">
          <div className="w-full max-w-md space-y-3">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      }
    >
      <AuthGateInner role={role}>{children}</AuthGateInner>
    </Suspense>
  );
}
