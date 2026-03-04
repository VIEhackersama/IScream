"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { itemService, orderService } from "@/services";
import type { Item, CreateOrderRequest } from "@/types";
import { routes } from "@/config";

/* ─── Skeleton ────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <article className="flex flex-col gap-4 rounded-2xl bg-card-light dark:bg-card-dark p-4 border border-gray-100 dark:border-white/5 animate-pulse">
      <div className="aspect-[3/4] w-full rounded-xl bg-gray-200 dark:bg-white/10" />
      <div className="flex flex-col gap-2">
        <div className="h-5 bg-gray-200 dark:bg-white/10 rounded w-3/4" />
        <div className="h-3 bg-gray-200 dark:bg-white/10 rounded w-full" />
        <div className="h-3 bg-gray-200 dark:bg-white/10 rounded w-2/3" />
      </div>
      <div className="h-10 bg-gray-200 dark:bg-white/10 rounded-full" />
    </article>
  );
}

/* ─── Order Modal ─────────────────────────────────────── */
function OrderModal({
  item,
  onClose,
}: {
  item: Item;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Omit<CreateOrderRequest, "itemId">>({
    customerName: "",
    email: "",
    phone: "",
    address: "",
    quantity: 1,
  });
  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerName.trim()) {
      setError("Vui lòng nhập tên của bạn.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await orderService.placeOrder({ ...form, itemId: item.id });
      setOrderId(res.data?.orderId ?? "N/A");
    } catch {
      setError("Đặt hàng thất bại. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  const price = typeof item.price === "number"
    ? item.price.toLocaleString("vi-VN") + " " + (item.currency || "VND")
    : String(item.price);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 flex flex-col gap-5"
        onClick={(e) => e.stopPropagation()}
      >
        {orderId ? (
          /* Success state */
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <div className="size-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600">
              <span className="material-symbols-outlined text-4xl">check_circle</span>
            </div>
            <h3 className="text-xl font-black">Đặt hàng thành công! 🎉</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Mã đơn hàng của bạn:
            </p>
            <code className="bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-lg text-sm font-mono break-all">
              {orderId}
            </code>
            <p className="text-xs text-gray-400">Chúng tôi sẽ liên hệ sớm nhất có thể!</p>
            <button
              onClick={onClose}
              className="mt-2 h-11 px-8 rounded-full bg-primary text-white font-bold hover:bg-red-600 transition-colors"
            >
              Đóng
            </button>
          </div>
        ) : (
          /* Form state */
          <>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-black leading-tight">{item.title}</h3>
                <p className="text-primary font-bold text-base">{price}</p>
              </div>
              <button
                onClick={onClose}
                className="shrink-0 size-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {error && (
              <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-lg">
                {error}
              </p>
            )}

            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  Họ tên <span className="text-primary">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Nguyễn Văn A"
                  value={form.customerName}
                  onChange={(e) => setForm((f) => ({ ...f, customerName: e.target.value }))}
                  className="h-11 px-4 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Email</label>
                <input
                  type="email"
                  placeholder="email@example.com"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="h-11 px-4 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Số điện thoại</label>
                <input
                  type="tel"
                  placeholder="0912 345 678"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  className="h-11 px-4 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Địa chỉ giao hàng</label>
                <input
                  type="text"
                  placeholder="123 Đường ABC, TP. HCM"
                  value={form.address}
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                  className="h-11 px-4 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Số lượng</label>
                <input
                  type="number"
                  min={1}
                  max={item.stock || 99}
                  value={form.quantity}
                  onChange={(e) => setForm((f) => ({ ...f, quantity: Number(e.target.value) }))}
                  className="h-11 px-4 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary w-24"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="mt-2 h-12 w-full rounded-full bg-primary text-white font-bold text-base hover:bg-red-600 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-lg">shopping_bag</span>
                    Xác nhận đặt hàng
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────── */
export default function OrderBooksPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  useEffect(() => {
    setLoading(true);
    itemService
      .getAll(1, 12)
      .then((res) => setItems(res.data?.items ?? []))
      .catch(() => setError("Không thể tải danh sách sách. Vui lòng thử lại."))
      .finally(() => setLoading(false));
  }, []);

  const fallbackImg =
    "https://lh3.googleusercontent.com/aida-public/AB6AXuC4vXTKgm_jzDVZ1LBV-Al_QCtiJsxWH4jj1Sx_8p0Poht4fOOPU7wSZq83uaR6AvWYqaogDtlNy8E1f7Qm5NZGPWOJK9-Zu6jiC18XxaKhE9g-iKbkTtj06zueGlVjCOZ6napZsIPAtYf2KUqHJKXYndvaL7jsxqnXxTWXWXNLG3vm5e2xUZp8mja3g8xq3_ZpkvsshqrVFlojEjrpwj0WfTpj0rWYbVa_TS8I9NhOq5kvKyEk7D2QcQgKR5HoDRUjhoYp9Ud6Sd0";

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 md:py-20 w-full max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="flex flex-col gap-6 text-center lg:text-left order-2 lg:order-1">
            <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-gray-900 dark:text-white md:text-5xl lg:text-6xl">
              Scoop Up the Secrets:{" "}
              <span className="text-primary">Mr. A&apos;s Recipe Collection</span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto lg:mx-0">
              From our parlor to your kitchen. Discover the magic behind our famous flavors with our exclusive cookbooks.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
              <button
                onClick={() => document.getElementById("books-grid")?.scrollIntoView({ behavior: "smooth" })}
                className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-base font-bold text-white shadow-lg shadow-primary/30 transition-all hover:bg-red-600 hover:scale-105 hover:-translate-y-0.5"
              >
                View Collection
              </button>
            </div>
          </div>

          <div className="relative order-1 lg:order-2">
            <div className="aspect-[4/3] w-full overflow-hidden rounded-[2.5rem] bg-gray-100 dark:bg-white/5 shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500 ease-out relative">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDnZJctqOY43WhOZ5XpuScd8y6iLiOEVEwEWB9CFAvQ1Gcn-E8zUwTT_Ovbf-Xf3xlA9hJ93Hv1n4RoLS0D4hikPDSln8MlJXGvF1ZH74EEVeqmaS2UJIIExBB0JgNLgt9plZSmBK03DNXgtuQIFVvQScSivBp4-Lbcy35b_9rarXuemLikygw0CH2vLGRjmz2fJCSxKxMX83tk-mD7_Z6qz_SrqraioDFcE632y7z_--7ehORWEeIGsgjFhrvI1ALcoGiSsUNerlE')",
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/90 backdrop-blur px-4 py-2 shadow-lg">
                  <span className="material-symbols-outlined text-primary">auto_stories</span>
                  <span className="text-sm font-bold text-gray-900">Featured: The Summer Edit</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <section id="books-grid" className="w-full max-w-7xl pb-20">
        <h2 className="text-2xl font-black mb-8">
          {loading ? "Loading..." : error ? "Error" : `Recipe Books (${items.length})`}
        </h2>

        {error && (
          <div className="py-12 text-center">
            <span className="material-symbols-outlined text-4xl text-red-400 block mb-3">error</span>
            <p className="text-gray-500">{error}</p>
          </div>
        )}

        {!error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {loading
              ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
              : items.length === 0
                ? (
                  <div className="col-span-4 py-20 text-center text-gray-400">
                    <span className="material-symbols-outlined text-5xl mb-4 block">auto_stories</span>
                    <p className="text-lg font-medium">Chưa có sách nào. Hãy quay lại sau!</p>
                  </div>
                )
                : items.map((item) => (
                  <article
                    key={item.id}
                    className="group relative flex flex-col gap-4 rounded-2xl bg-card-light dark:bg-card-dark p-4 shadow-sm transition-all hover:-translate-y-2 hover:shadow-xl border border-gray-100 dark:border-white/5"
                  >
                    <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-gray-100 dark:bg-white/5">
                      <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                        style={{ backgroundImage: `url('${item.imageUrl || fallbackImg}')` }}
                      />
                      {item.stock === 0 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="bg-white/90 text-gray-800 text-xs font-bold px-3 py-1 rounded-full">
                            Hết hàng
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col justify-between gap-4">
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="text-lg font-bold leading-tight text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                            {item.title}
                          </h3>
                          <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary dark:bg-primary/20">
                            {typeof item.price === "number"
                              ? item.price.toLocaleString("vi-VN") + " " + item.currency
                              : item.price}
                          </span>
                        </div>
                        {item.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                            {item.description}
                          </p>
                        )}
                      </div>

                      <button
                        disabled={item.stock === 0}
                        onClick={() => setSelectedItem(item)}
                        className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-bold text-white transition-colors hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="material-symbols-outlined text-lg">shopping_bag</span>
                        {item.stock === 0 ? "Hết hàng" : "Mua ngay"}
                      </button>
                    </div>
                  </article>
                ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="w-full py-20 bg-gray-100 dark:bg-card-dark/50">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col items-center text-center gap-6 rounded-3xl bg-white dark:bg-card-dark p-10 md:p-16 shadow-xl border border-gray-100 dark:border-white/5">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-2">
              <span className="material-symbols-outlined text-4xl">lightbulb</span>
            </div>
            <h2 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white md:text-4xl">
              Have a flavor idea?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-xl">
              Our community is built on creativity. Submit your wildest recipe ideas and if Mr. A picks it, it goes in our next book!
            </p>
            <Link
              href={routes.addRecipe}
              className="mt-4 flex min-w-[200px] items-center justify-center rounded-full bg-primary px-8 py-4 text-base font-bold text-white shadow-lg shadow-primary/30 transition-all hover:bg-red-600 hover:scale-105 hover:-translate-y-1"
            >
              Submit Recipe
            </Link>
          </div>
        </div>
      </section>

      {/* Order Modal */}
      {selectedItem && (
        <OrderModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}
    </>
  );
}