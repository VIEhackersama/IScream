import { redirect } from "next/navigation";

export default function AdminIndexPage() {
    // Temporarily redirect straight to recipes management page
    redirect("/admin/recipes");
}
