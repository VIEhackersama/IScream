"use client";

import { useEffect, useState } from "react";
import AdminShell from "../_components/AdminShell";
import { adminSubmissionService, RecipeSubmission } from "@/services/admin.submission.service";
import { adminRecipeService } from "@/services/admin.recipe.service";
import { Button, MaterialIcon } from "@/components/ui";

export default function AdminContributionsPage() {
    const [submissions, setSubmissions] = useState<RecipeSubmission[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [filterStatus, setFilterStatus] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("ALL");
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const pageSize = 10;

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, filterStatus]);

    async function loadData() {
        setLoading(true);
        try {
            const statusParams = filterStatus === "ALL" ? undefined : filterStatus;
            const res = await adminSubmissionService.getAll(page, pageSize, statusParams);
            setSubmissions(res.items);
            setTotalPages(res.totalPages);
            setTotalCount(res.totalCount);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    async function handleApproveAndPublish(sub: RecipeSubmission) {
        if (!confirm(`Are you sure you want to APPROVE this submission and PUBLISH it as a new recipe?`)) return;
        setActionLoading(sub.id);
        try {
            await adminSubmissionService.review(sub.id, true);
            // Also publish it to the recipes table!
            await adminRecipeService.create({
                flavorName: sub.title,
                shortDescription: sub.description || `A community recipe contributed by ${sub.name || 'Guest'}.`,
                ingredients: sub.ingredients,
                procedure: sub.steps,
                imageUrl: sub.imageUrl
            });

            await loadData();
        } catch (error) {
            alert("Failed to approve and publish. The system may have been partially updated.");
            console.error(error);
        } finally {
            setActionLoading(null);
        }
    }

    async function handleReject(id: string) {
        if (!confirm(`Are you sure you want to REJECT this submission?`)) return;
        setActionLoading(id);
        try {
            await adminSubmissionService.review(id, false);
            await loadData();
        } catch (error) {
            alert("Failed to reject submission");
        } finally {
            setActionLoading(null);
        }
    }

    function StatusBadge({ status }: { status: string }) {
        switch (status) {
            case "APPROVED":
                return <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">Approved</span>;
            case "REJECTED":
                return <span className="inline-flex rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-700">Rejected</span>;
            default:
                return <span className="inline-flex rounded-full bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-700">Pending</span>;
        }
    }

    return (
        <AdminShell activePage="contributions" pageTitle="Contributions Management">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-xl font-bold text-text-main">Community Submissions</h2>
                    <p className="text-sm text-gray-500">Review and approve recipes submitted by users.</p>
                </div>
                {/* Filters */}
                <div className="flex gap-2">
                    {(["ALL", "PENDING", "APPROVED", "REJECTED"] as const).map(s => (
                        <button
                            key={s}
                            onClick={() => { setFilterStatus(s); setPage(1); }}
                            className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${filterStatus === s ? "bg-primary text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="rounded-2xl bg-white p-5 shadow-sm border border-black/5">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="border-b border-gray-100 text-xs uppercase text-gray-400">
                            <tr>
                                <th className="pb-3 pr-4 font-bold">Recipe Info</th>
                                <th className="pb-3 px-4 font-bold">Submitter</th>
                                <th className="pb-3 px-4 font-bold">Status</th>
                                <th className="pb-3 px-4 font-bold">Details</th>
                                <th className="pb-3 pl-4 text-right font-bold w-40">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center text-gray-400">
                                        <div className="flex items-center justify-center gap-2">
                                            <MaterialIcon name="refresh" className="animate-spin" />
                                            <span>Loading submissions...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : submissions.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center text-gray-400">
                                        No submissions found for the selected filter.
                                    </td>
                                </tr>
                            ) : submissions.map((sub) => (
                                <tr key={sub.id} className="group hover:bg-gray-50/50 transition-colors">
                                    <td className="py-4 pr-4">
                                        <div className="font-bold text-text-main line-clamp-1">{sub.title}</div>
                                        <div className="text-xs text-gray-400 mt-1">Submitted: {new Date(sub.createdAt).toLocaleDateString()}</div>
                                    </td>
                                    <td className="py-4 px-4">
                                        <div className="font-semibold text-gray-700">{sub.name || "Guest"}</div>
                                        <div className="text-xs text-gray-500">{sub.email || "No email"}</div>
                                    </td>
                                    <td className="py-4 px-4">
                                        <StatusBadge status={sub.status} />
                                    </td>
                                    <td className="py-4 px-4">
                                        <div className="text-xs text-gray-500 line-clamp-2 max-w-[200px]" title={sub.description}>
                                            {sub.description || '<No description>'}
                                        </div>
                                    </td>
                                    <td className="py-4 pl-4 text-right">
                                        {sub.status === "PENDING" && (
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleApproveAndPublish(sub)}
                                                    disabled={actionLoading === sub.id}
                                                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50 text-green-600 hover:bg-green-100 disabled:opacity-50 transition-colors"
                                                    title="Approve & Publish"
                                                >
                                                    <MaterialIcon name={actionLoading === sub.id ? "hourglass_empty" : "publish"} className="text-[18px]" />
                                                </button>
                                                <button
                                                    onClick={() => handleReject(sub.id)}
                                                    disabled={actionLoading === sub.id}
                                                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50 transition-colors"
                                                    title="Reject"
                                                >
                                                    <MaterialIcon name={actionLoading === sub.id ? "hourglass_empty" : "close"} className="text-[18px]" />
                                                </button>
                                            </div>
                                        )}
                                        {sub.status !== "PENDING" && (
                                            <span className="text-xs text-gray-400">Reviewed</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
                        <p className="text-sm text-gray-500">
                            Showing <span className="font-medium">1</span> to <span className="font-medium">{submissions.length}</span> of <span className="font-medium">{totalCount}</span> submissions
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                className="h-8 px-3 text-xs"
                                disabled={page === 1}
                                onClick={() => setPage(p => p - 1)}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                className="h-8 px-3 text-xs"
                                disabled={page === totalPages}
                                onClick={() => setPage(p => p + 1)}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </AdminShell>
    );
}
