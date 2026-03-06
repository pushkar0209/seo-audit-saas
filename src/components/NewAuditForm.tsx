"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function NewAuditForm({ tenantId }: { tenantId: string }) {
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            const res = await fetch("/api/audit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url, tenantId }),
            });

            if (!res.ok) throw new Error("Failed to run audit");

            const data = await res.json();
            router.push(`/dashboard/audit/${data.id}`);
        } catch (error) {
            console.error(error);
            alert("Error generating audit");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex gap-4">
            <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="flex-1 placeholder:text-gray-400 border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                required
                disabled={loading}
            />
            <button
                type="submit"
                disabled={loading}
                className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
                {loading ? "Running..." : "Run Audit"}
            </button>
        </form>
    );
}
