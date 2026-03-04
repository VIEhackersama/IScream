"use client";

/**
 * AdminGuard — protects all /admin/* routes (except /admin/login).
 *
 * Reads the stored token + user from localStorage (tokenStorage).
 * If no token or role !== "ADMIN", redirects to /admin/login immediately.
 * Shows a full-screen loading spinner while hydrating to prevent flash.
 */

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { tokenStorage } from "@/services/auth.service";

interface Props {
    children: React.ReactNode;
}

export default function AdminGuard({ children }: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const [status, setStatus] = useState<"loading" | "allowed" | "denied">("loading");

    useEffect(() => {
        // /admin/login is public — always allow
        if (pathname === "/admin/login") {
            setStatus("allowed");
            return;
        }

        const token = tokenStorage.getToken();
        const user = tokenStorage.getUser();

        if (!token || !user || user.role !== "ADMIN") {
            setStatus("denied");
            router.replace("/admin/login");
        } else {
            setStatus("allowed");
        }
    }, [pathname, router]);

    if (status === "loading") {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#f5f5f7]">
                <div className="flex flex-col items-center gap-4">
                    {/* Spinner */}
                    <span className="size-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <p className="text-sm font-semibold text-gray-400">Verifying access…</p>
                </div>
            </div>
        );
    }

    if (status === "denied") {
        // Redirect is in progress — render nothing to avoid flash
        return null;
    }

    return <>{children}</>;
}
