"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { MaterialIcon } from "@/components/ui";
import { routes } from "@/config";
import { useAuth } from "@/context/AuthContext";
import { itemService, orderService } from "@/services";
import type { Item } from "@/types";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoggedIn, loading: isAuthLoading } = useAuth();

  const itemId = searchParams.get("item");

  const [item, setItem] = useState<Item | null>(null);
  const [fetchingItem, setFetchingItem] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    customerName: "",
    email: "",
    phone: "",
    address: "",
    quantity: 1,
  });

  // Fetch item data
  useEffect(() => {
    if (!itemId) return;
    setFetchingItem(true);
    itemService
      .getById(itemId)
      .then((res) => setItem(res.data ?? null))
      .catch(() => setItem(null))
      .finally(() => setFetchingItem(false));
  }, [itemId]);

  // Pre-fill form with user data as soon as auth resolves
  useEffect(() => {
    if (!isAuthLoading && user) {
      setForm((f) => ({
        ...f,
        customerName: user.fullName || f.customerName,
        email: user.email || f.email,
      }));
    }
  }, [isAuthLoading, user]);

  // Redirect if not logged in
  useEffect(() => {
    if (!isAuthLoading && !isLoggedIn) {
      router.push(
        `${routes.login}?returnUrl=${encodeURIComponent(`/order-books/checkout?item=${itemId || ""}`)}`,
      );
    }
  }, [isAuthLoading, isLoggedIn, itemId, router]);

  // Redirect back if no item id or item not found
  useEffect(() => {
    if (!fetchingItem && !item && !isAuthLoading) {
      router.push(routes.orderBooks);
    }
  }, [fetchingItem, item, isAuthLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;
    if (!form.customerName.trim()) {
      setError("Please enter your full name.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await orderService.placeOrder({ ...form, itemId: item.id });
      setOrderId(res.data?.orderId ?? "N/A");
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Order failed. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (isAuthLoading || fetchingItem) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <MaterialIcon
          name="sync"
          className="animate-spin text-4xl text-primary"
        />
      </div>
    );
  }

  if (!isLoggedIn || !item) return null;

  const price =
    typeof item.price === "number"
      ? item.price.toLocaleString("vi-VN") + " " + (item.currency || "VND")
      : String(item.price);

  if (success) {
    return (
      <div className="flex w-full min-h-[80vh] flex-col items-center justify-center py-20 bg-gradient-to-br from-[#ffe5ec] to-[#f8edeb] dark:from-surface-dark dark:to-[#2a1a1e]">
        <div className="flex flex-col items-center gap-6 rounded-[2.5rem] bg-white px-12 py-16 text-center shadow-2xl shadow-primary/10 max-w-xl w-full mx-4 dark:bg-surface-dark border sm:border-transparent border-gray-100">
          <div className="flex size-24 items-center justify-center rounded-full bg-primary text-white shadow-xl shadow-primary/30">
            <MaterialIcon name="check_circle" filled className="text-[48px]" />
          </div>
          <div>
            <h2 className="text-4xl font-black text-text-main dark:text-white mb-2">
              Order Placed! 🎉
            </h2>
            <p className="mt-2 text-lg text-text-muted">
              Your order for{" "}
              <span className="font-bold text-text-main dark:text-white">
                {item.title}
              </span>{" "}
              has been received.
            </p>
          </div>
          {orderId && (
            <div className="w-full rounded-2xl bg-gray-50 dark:bg-black/20 px-6 py-4 text-left">
              <p className="text-xs font-bold uppercase tracking-wide text-text-muted mb-1">
                Order ID
              </p>
              <code className="text-sm font-mono text-text-main dark:text-white break-all">
                {orderId}
              </code>
            </div>
          )}
          <p className="text-sm text-text-muted">
            We will contact you as soon as possible!
          </p>
          <div className="flex flex-col gap-3 w-full mt-2">
            <button
              onClick={() => router.push(routes.orderBooks)}
              className="rounded-full bg-primary px-10 py-4 font-bold text-white shadow-lg shadow-primary/20 hover:bg-red-600 hover:scale-105 transition-all"
            >
              Browse More Books
            </button>
            <button
              onClick={() => router.push(routes.profile)}
              className="text-sm font-semibold text-text-muted hover:text-primary transition-colors"
            >
              View My Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#ffe5ec] to-[#f8edeb] dark:from-[#1a1012] dark:to-surface-dark py-12 px-4 md:py-20 flex flex-col items-center">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-black text-text-main dark:text-white mb-2">
          Confirm Your Order
        </h1>
        <p className="text-text-muted">
          Review your book and fill in the delivery details below.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full max-w-[1000px] items-start">
        {/* Left – Order Summary */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="rounded-[2rem] bg-white p-8 shadow-xl shadow-primary/5 dark:bg-surface-dark border border-gray-50 dark:border-white/5 flex flex-col gap-6">
            <h2 className="text-xl font-bold text-text-main dark:text-white">
              Order Summary
            </h2>

            {/* Book preview */}
            <div className="flex items-start gap-4">
              <div className="shrink-0 size-20 rounded-2xl overflow-hidden bg-gray-100 dark:bg-white/5">
                {item.imageUrl ? (
                  <div
                    className="w-full h-full bg-cover bg-center"
                    style={{ backgroundImage: `url('${item.imageUrl}')` }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <MaterialIcon
                      name="auto_stories"
                      className="text-3xl text-gray-400"
                    />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-text-main dark:text-white leading-tight">
                  {item.title}
                </h3>
                {item.description && (
                  <p className="text-xs text-text-muted mt-1 line-clamp-2">
                    {item.description}
                  </p>
                )}
                <Link
                  href={routes.orderBooks}
                  className="text-xs font-bold text-primary mt-2 inline-block hover:underline"
                >
                  Change Item
                </Link>
              </div>
            </div>

            <div className="border-t border-dashed border-gray-200 dark:border-white/10" />

            <div className="flex flex-col gap-3 text-sm">
              <div className="flex justify-between text-text-muted">
                <span>Unit price</span>
                <span>{price}</span>
              </div>
              <div className="flex justify-between text-text-muted">
                <span>Quantity</span>
                <span>{form.quantity}</span>
              </div>
            </div>

            <div className="border-t border-dashed border-gray-200 dark:border-white/10" />

            <div className="flex justify-between items-end">
              <span className="font-bold text-text-main dark:text-white">
                Total
              </span>
              <span className="text-2xl font-black text-text-main dark:text-white">
                {typeof item.price === "number"
                  ? (item.price * form.quantity).toLocaleString("vi-VN") +
                    " " +
                    (item.currency || "VND")
                  : price}
              </span>
            </div>
          </div>

          <div className="rounded-full bg-white/50 dark:bg-white/5 py-3 px-6 text-center text-sm font-semibold text-text-muted flex items-center justify-center gap-2">
            <MaterialIcon
              name="verified_user"
              className="text-lg text-primary/70"
            />
            Secure &amp; Encrypted Checkout
          </div>
        </div>

        {/* Right – Order Form */}
        <div className="lg:col-span-7 rounded-[2.5rem] bg-white p-8 md:p-10 shadow-2xl shadow-primary/10 dark:bg-surface-dark border border-gray-100 dark:border-white/5">
          <div className="flex items-center gap-4 mb-8">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <MaterialIcon name="local_shipping" filled className="text-2xl" />
            </div>
            <h2 className="text-2xl font-bold text-text-main dark:text-white">
              Delivery Details
            </h2>
          </div>

          {error && (
            <div className="mb-6 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-5 py-4 text-sm font-medium border border-red-200 dark:border-red-800">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Full Name */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-text-main dark:text-white">
                Full Name <span className="text-primary">*</span>
              </label>
              <div className="relative">
                <MaterialIcon
                  name="person"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  required
                  placeholder="Jane Doe"
                  value={form.customerName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, customerName: e.target.value }))
                  }
                  className="w-full rounded-full border border-gray-200 bg-gray-50/50 py-3.5 pl-12 pr-4 text-text-main outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:border-white/10 dark:bg-black/20 dark:text-white"
                />
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-text-main dark:text-white">
                Email Address
              </label>
              <div className="relative">
                <MaterialIcon
                  name="mail"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="email"
                  placeholder="email@example.com"
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                  className="w-full rounded-full border border-gray-200 bg-gray-50/50 py-3.5 pl-12 pr-4 text-text-main outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:border-white/10 dark:bg-black/20 dark:text-white"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-text-main dark:text-white">
                Phone Number
              </label>
              <div className="relative">
                <MaterialIcon
                  name="phone"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="tel"
                  placeholder="0912 345 678"
                  value={form.phone}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, phone: e.target.value }))
                  }
                  className="w-full rounded-full border border-gray-200 bg-gray-50/50 py-3.5 pl-12 pr-4 text-text-main outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:border-white/10 dark:bg-black/20 dark:text-white"
                />
              </div>
            </div>

            {/* Address */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-text-main dark:text-white">
                Shipping Address
              </label>
              <div className="relative">
                <MaterialIcon
                  name="home"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="123 Main St, Ho Chi Minh City"
                  value={form.address}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, address: e.target.value }))
                  }
                  className="w-full rounded-full border border-gray-200 bg-gray-50/50 py-3.5 pl-12 pr-4 text-text-main outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:border-white/10 dark:bg-black/20 dark:text-white"
                />
              </div>
            </div>

            {/* Quantity */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-text-main dark:text-white">
                Quantity
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setForm((f) => ({
                      ...f,
                      quantity: Math.max(1, f.quantity - 1),
                    }))
                  }
                  className="size-11 rounded-full border border-gray-200 dark:border-white/10 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                >
                  <MaterialIcon name="remove" className="text-lg" />
                </button>
                <span className="w-10 text-center text-lg font-bold text-text-main dark:text-white">
                  {form.quantity}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setForm((f) => ({
                      ...f,
                      quantity: Math.min(item.stock || 99, f.quantity + 1),
                    }))
                  }
                  className="size-11 rounded-full border border-gray-200 dark:border-white/10 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                >
                  <MaterialIcon name="add" className="text-lg" />
                </button>
                {item.stock > 0 && (
                  <span className="text-xs text-text-muted ml-1">
                    {item.stock} in stock
                  </span>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 rounded-full bg-primary py-4 font-bold text-white text-base shadow-lg shadow-primary/20 hover:bg-red-600 hover:scale-[1.02] transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <MaterialIcon name="sync" className="animate-spin text-lg" />
                  Processing...
                </>
              ) : (
                <>
                  <MaterialIcon name="shopping_bag" className="text-lg" />
                  Confirm Order
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function OrderBooksCheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <MaterialIcon
            name="sync"
            className="animate-spin text-4xl text-primary"
          />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
