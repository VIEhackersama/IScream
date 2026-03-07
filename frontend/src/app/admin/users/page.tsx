"use client";

import { useState, useEffect, useCallback } from "react";
import AdminShell from "../_components/AdminShell";
import { MaterialIcon } from "@/components/ui";
import { apiClient } from "@/lib/api-client";
import type { ApiResponse, PagedResult } from "@/types";

// ── Types ─────────────────────────────────────────────────────────────────────
interface AdminUser {
  id: string;
  username: string;
  fullName?: string;
  email?: string;
  role: "MEMBER" | "ADMIN";
  isActive?: boolean;
  createdAt?: string;
  lastLogin?: string;
}

// Since backend auth endpoints expose limited user info,
// we compose display data from what's available.
type UserStatus = "Active" | "Suspended" | "Payment Failed" | "Expiring Soon";
type UserRole = "Member" | "Contributor" | "Editor" | "Admin";

// ── Helpers ───────────────────────────────────────────────────────────────────
const STATUS_STYLES: Record<UserStatus, string> = {
  Active: "bg-green-100 text-green-700",
  Suspended: "bg-gray-200 text-gray-600",
  "Payment Failed": "bg-red-100 text-red-600",
  "Expiring Soon": "bg-yellow-100 text-yellow-700",
};

const ROLE_STYLES: Record<UserRole, string> = {
  Member: "text-gray-500",
  Contributor: "text-purple-500",
  Editor: "text-orange-500",
  Admin: "text-primary",
};

const ROLE_ICONS: Record<UserRole, string> = {
  Member: "person",
  Contributor: "edit",
  Editor: "draw",
  Admin: "admin_panel_settings",
};

function mapRole(role: string): UserRole {
  if (role === "ADMIN") return "Admin";
  return "Member";
}

function timeAgo(dateStr?: string): string {
  if (!dateStr) return "—";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} min${mins !== 1 ? "s" : ""} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs !== 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days} day${days !== 1 ? "s" : ""} ago`;
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

// Static demo stats (since backend doesn't expose aggregate user stats endpoint)
const STAT_CARDS = [
  {
    label: "Total Users",
    value: "12,345",
    trend: "+12%",
    trendLabel: "from last month",
    icon: "group",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-500",
  },
  {
    label: "Active Premium",
    value: "8,102",
    trend: "+5%",
    trendLabel: "new subscriptions",
    icon: "verified_user",
    iconBg: "bg-orange-50",
    iconColor: "text-orange-500",
  },
  {
    label: "Pending Review",
    value: "45",
    trend: null,
    trendLabel: "Requires admin approval",
    icon: "pending_actions",
    iconBg: "bg-purple-50",
    iconColor: "text-purple-500",
  },
  {
    label: "Total Revenue",
    value: "$45.2k",
    trend: "+18%",
    trendLabel: "monthly recurring",
    icon: "payments",
    iconBg: "bg-green-50",
    iconColor: "text-green-500",
  },
];

// ── Status Badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: UserStatus }) {
  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[status]}`}
    >
      {status}
    </span>
  );
}

// ── User Avatar ───────────────────────────────────────────────────────────────
function UserAvatar({ name, isActive }: { name: string; isActive?: boolean }) {
  const colors = [
    "bg-blue-400",
    "bg-purple-400",
    "bg-pink-400",
    "bg-orange-400",
    "bg-teal-400",
  ];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div className="relative shrink-0">
      <div
        className={`flex size-9 items-center justify-center rounded-full ${color} text-sm font-bold text-white`}
      >
        {name[0]?.toUpperCase()}
      </div>
      <span
        className={`absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full ring-2 ring-white ${
          isActive !== false ? "bg-green-400" : "bg-gray-300"
        }`}
      />
    </div>
  );
}

// ── Add User Modal ────────────────────────────────────────────────────────────
function AddUserModal({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    username: "",
    email: "",
    fullName: "",
    password: "",
    role: "MEMBER",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.username || !form.password) {
      setError("Username and password are required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await apiClient.post<ApiResponse<{ userId: string }>>("/auth/register", {
        username: form.username.trim(),
        password: form.password,
        email: form.email || undefined,
        fullName: form.fullName || undefined,
      });
      onSaved();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create user.");
    } finally {
      setLoading(false);
    }
  }

  const inputCls =
    "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-black outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/15";
  const labelCls = "block text-xs font-semibold text-gray-500 mb-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-7 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
              <MaterialIcon
                name="person_add"
                filled
                className="text-primary text-[20px]"
              />
            </div>
            <h2 className="text-lg font-black text-text-main">Add New User</h2>
          </div>
          <button
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-full hover:bg-gray-100 text-gray-400"
          >
            <MaterialIcon name="close" className="text-[20px]" />
          </button>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            <MaterialIcon
              name="error"
              filled
              className="text-[16px] shrink-0"
            />
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
          noValidate
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Username *</label>
              <input
                value={form.username}
                onChange={(e) =>
                  setForm((p) => ({ ...p, username: e.target.value }))
                }
                placeholder="johndoe"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Full Name</label>
              <input
                value={form.fullName}
                onChange={(e) =>
                  setForm((p) => ({ ...p, fullName: e.target.value }))
                }
                placeholder="John Doe"
                className={inputCls}
              />
            </div>
          </div>
          <div>
            <label className={labelCls}>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm((p) => ({ ...p, email: e.target.value }))
              }
              placeholder="john@example.com"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Password *</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) =>
                setForm((p) => ({ ...p, password: e.target.value }))
              }
              placeholder="Min 6 characters"
              className={inputCls}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-text-muted hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-bold text-white shadow-md shadow-primary/25 hover:bg-primary-hover disabled:opacity-60"
            >
              {loading && (
                <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              )}
              Create User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
const PAGE_SIZE = 10;

// Simulated display status (backend doesn't expose payment/subscription status)
const DEMO_STATUSES: UserStatus[] = [
  "Active",
  "Payment Failed",
  "Suspended",
  "Active",
  "Expiring Soon",
];
const DEMO_SUBS = [
  { plan: "Yearly Pro", billing: "Oct 24, 2024", amount: "$120.00" },
  { plan: "Monthly Basic", billing: "Nov 01, 2024", amount: "$15.00" },
  { plan: "Free Tier", billing: "", amount: "$0.00" },
  { plan: "Staff Access", billing: "", amount: "—" },
  { plan: "Monthly Basic", billing: "Oct 29, 2024", amount: "$15.00" },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("All Plans");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchUsers = useCallback(async (page: number) => {
    setLoading(true);
    setError("");
    try {
      // Backend doesn't have a "list users" endpoint — we use auth/me proxy pattern.
      // For demo, we call the recipes endpoint for pagination pattern,
      // but display with mock user data layered on top.
      // In production, you'd add GET /api/management/users endpoint.
      const res = await apiClient.get<ApiResponse<PagedResult<AdminUser>>>(
        "/management/users",
        { params: { page: String(page), pageSize: String(PAGE_SIZE) } },
      );
      if (res.success && res.data) {
        setUsers(res.data.items);
        setTotalCount(res.data.totalCount);
        setTotalPages(res.data.totalPages);
      }
    } catch {
      // If endpoint not yet available, show friendly state
      setUsers([]);
      setTotalCount(0);
      setTotalPages(1);
      setError(
        "User list endpoint is not yet available on the backend. Add GET /api/management/users to retrieve real data.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage, fetchUsers]);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      !q ||
      u.username.toLowerCase().includes(q) ||
      (u.fullName ?? "").toLowerCase().includes(q) ||
      (u.email ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <AdminShell activePage="users" pageTitle="User Management">
      {/* ── Stat Cards ── */}
      <div className="mb-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
        {STAT_CARDS.map((card) => (
          <div
            key={card.label}
            className="flex items-start justify-between rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100"
          >
            <div>
              <p className="text-xs font-semibold text-gray-400">
                {card.label}
              </p>
              <p className="mt-1 text-2xl font-black text-text-main">
                {card.value}
              </p>
              <p className="mt-1.5 flex items-center gap-1 text-xs text-gray-400">
                {card.trend && (
                  <span className="flex items-center gap-0.5 font-bold text-green-500">
                    <MaterialIcon name="trending_up" className="text-[14px]" />
                    {card.trend}
                  </span>
                )}
                {card.trendLabel}
              </p>
            </div>
            <div
              className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${card.iconBg}`}
            >
              <MaterialIcon
                name={card.icon}
                filled
                className={`text-[22px] ${card.iconColor}`}
              />
            </div>
          </div>
        ))}
      </div>

      {/* ── Table card ── */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
        {/* Table header controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-6 py-4">
          <h2 className="text-base font-bold text-text-main">All Users</h2>

          <div className="flex flex-wrap items-center gap-2">
            {/* Plan filter */}
            <div className="relative">
              <select
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
                className="h-9 appearance-none rounded-xl border border-gray-200 bg-white pl-3 pr-8 text-sm font-semibold text-text-muted outline-none focus:border-primary"
              >
                {[
                  "All Plans",
                  "Yearly Pro",
                  "Monthly Basic",
                  "Free Tier",
                  "Staff Access",
                ].map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
              <MaterialIcon
                name="keyboard_arrow_down"
                className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[18px] text-gray-400"
              />
            </div>

            {/* Status filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 appearance-none rounded-xl border border-gray-200 bg-white pl-3 pr-8 text-sm font-semibold text-text-muted outline-none focus:border-primary"
              >
                {[
                  "All Status",
                  "Active",
                  "Suspended",
                  "Payment Failed",
                  "Expiring Soon",
                ].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              <MaterialIcon
                name="keyboard_arrow_down"
                className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[18px] text-gray-400"
              />
            </div>

            {/* Add user button */}
            <button
              onClick={() => setShowAddModal(true)}
              className="flex h-9 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-white shadow-md shadow-primary/25 transition hover:bg-primary-hover"
            >
              <MaterialIcon name="add" className="text-[18px]" />
              Add User
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="border-b border-gray-100 px-6 py-3">
          <div className="relative max-w-sm">
            <MaterialIcon
              name="search"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-gray-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users by name or email..."
              className="h-9 w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-4 text-sm text-black outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/15"
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-6 my-4 flex items-start gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
            <MaterialIcon
              name="warning"
              filled
              className="mt-0.5 shrink-0 text-[16px]"
            />
            <span>{error}</span>
          </div>
        )}

        {/* Table */}
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {[
                "User",
                "Role",
                "Subscription",
                "Amount",
                "Status",
                "Last Login",
                "Actions",
              ].map((h) => (
                <th
                  key={h}
                  className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-gray-400"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="py-16 text-center">
                  <span className="inline-block size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </td>
              </tr>
            ) : filtered.length === 0 && !error ? (
              /* Demo rows (shown when backend endpoint not yet available) */
              [
                {
                  name: "Alex Johnson",
                  email: "alex.j@example.com",
                  role: "Member" as UserRole,
                  sub: DEMO_SUBS[0],
                  status: "Active" as UserStatus,
                  last: "2 mins ago",
                },
                {
                  name: "Sarah Smith",
                  email: "sarah.s@example.com",
                  role: "Contributor" as UserRole,
                  sub: DEMO_SUBS[1],
                  status: "Payment Failed" as UserStatus,
                  last: "5 hours ago",
                },
                {
                  name: "Michael Chen",
                  email: "m.chen@example.com",
                  role: "Member" as UserRole,
                  sub: DEMO_SUBS[2],
                  status: "Suspended" as UserStatus,
                  last: "2 months ago",
                },
                {
                  name: "Emily Davis",
                  email: "emily.d@example.com",
                  role: "Editor" as UserRole,
                  sub: DEMO_SUBS[3],
                  status: "Active" as UserStatus,
                  last: "1 day ago",
                },
                {
                  name: "Jessica Wong",
                  email: "j.wong@example.com",
                  role: "Member" as UserRole,
                  sub: DEMO_SUBS[4],
                  status: "Expiring Soon" as UserStatus,
                  last: "3 days ago",
                },
              ].map((row, i) => (
                <tr
                  key={i}
                  className="group border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <UserAvatar
                        name={row.name}
                        isActive={row.status === "Active"}
                      />
                      <div>
                        <p className="font-bold text-text-main">{row.name}</p>
                        <p className="text-xs text-gray-400">{row.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`flex items-center gap-1.5 text-sm font-semibold ${ROLE_STYLES[row.role]}`}
                    >
                      <MaterialIcon
                        name={ROLE_ICONS[row.role]}
                        className="text-[16px]"
                      />
                      {row.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-text-main">
                      {row.sub.plan}
                    </p>
                    {row.sub.billing && (
                      <p className="text-xs text-gray-400">
                        Next billing: {row.sub.billing}
                      </p>
                    )}
                    {!row.sub.billing && row.sub.plan !== "Free Tier" && (
                      <p className="text-xs text-gray-400">—</p>
                    )}
                  </td>
                  <td className="px-6 py-4 font-semibold text-text-main">
                    {row.sub.amount}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={row.status} />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {row.last}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100">
                      <button
                        title="Edit"
                        className="flex size-7 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-primary/30 hover:bg-primary/5 hover:text-primary transition"
                      >
                        <MaterialIcon name="edit" className="text-[14px]" />
                      </button>
                      <button
                        title="Suspend"
                        className="flex size-7 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-yellow-200 hover:bg-yellow-50 hover:text-yellow-600 transition"
                      >
                        <MaterialIcon name="block" className="text-[14px]" />
                      </button>
                      <button
                        title="Delete"
                        className="flex size-7 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-red-200 hover:bg-red-50 hover:text-red-500 transition"
                      >
                        <MaterialIcon name="delete" className="text-[14px]" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              filtered.map((user, idx) => {
                const role = mapRole(user.role);
                const status = DEMO_STATUSES[idx % DEMO_STATUSES.length];
                const sub = DEMO_SUBS[idx % DEMO_SUBS.length];
                return (
                  <tr
                    key={user.id}
                    className="group border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <UserAvatar
                          name={user.fullName ?? user.username}
                          isActive={user.isActive}
                        />
                        <div>
                          <p className="font-bold text-text-main">
                            {user.fullName ?? user.username}
                          </p>
                          <p className="text-xs text-gray-400">
                            {user.email ?? "@" + user.username}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`flex items-center gap-1.5 text-sm font-semibold ${ROLE_STYLES[role]}`}
                      >
                        <MaterialIcon
                          name={ROLE_ICONS[role]}
                          className="text-[16px]"
                        />
                        {role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-text-main">{sub.plan}</p>
                      {sub.billing && (
                        <p className="text-xs text-gray-400">
                          Next billing: {sub.billing}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 font-semibold text-text-main">
                      {sub.amount}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={status} />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {timeAgo(user.lastLogin ?? user.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100">
                        <button className="flex size-7 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-primary/30 hover:bg-primary/5 hover:text-primary transition">
                          <MaterialIcon name="edit" className="text-[14px]" />
                        </button>
                        <button className="flex size-7 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-yellow-200 hover:bg-yellow-50 hover:text-yellow-600 transition">
                          <MaterialIcon name="block" className="text-[14px]" />
                        </button>
                        <button className="flex size-7 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-red-200 hover:bg-red-50 hover:text-red-500 transition">
                          <MaterialIcon name="delete" className="text-[14px]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
          <p className="text-sm text-text-muted">
            Showing{" "}
            <span className="font-bold text-text-main">
              {filtered.length === 0
                ? "1 to 5"
                : `${(currentPage - 1) * PAGE_SIZE + 1} to ${Math.min(currentPage * PAGE_SIZE, totalCount)}`}
            </span>{" "}
            of{" "}
            <span className="font-bold text-text-main">{totalCount || 97}</span>{" "}
            results
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-text-muted transition hover:bg-gray-50 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPages || 10, p + 1))
              }
              disabled={currentPage === (totalPages || 10)}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-text-muted transition hover:bg-gray-50 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <AddUserModal
          onClose={() => setShowAddModal(false)}
          onSaved={() => {
            setShowAddModal(false);
            fetchUsers(currentPage);
          }}
        />
      )}
    </AdminShell>
  );
}
