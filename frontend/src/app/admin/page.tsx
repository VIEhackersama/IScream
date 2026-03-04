import { redirect } from "next/navigation";

export default function AdminIndexPage() {
    // Tạm thời redirect thẳng vào trang quản lý recipes
    redirect("/admin/recipes");
}
