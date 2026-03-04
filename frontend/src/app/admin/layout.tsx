import type { Metadata } from "next";
import AdminGuard from "./AdminGuard";

export const metadata: Metadata = {
    title: "Admin Dashboard | IScream",
    description: "IScream Admin Management Hub",
};

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        // Admin pages bypass root Navbar/Footer and use AdminGuard for auth protection
        <AdminGuard>{children}</AdminGuard>
    );
}
