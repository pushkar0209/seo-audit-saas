import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChatInterface } from "@/components/ChatInterface";
import { ScoreChart } from "@/components/ScoreChart";

interface Props {
    params: { id: string };
}

export default async function AuditDetailPage({ params }: Props) {
    const { userId } = auth();
    if (!userId) redirect("/");

    // Verify ownership
    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) redirect("/");

    const audit = await prisma.audit.findUnique({
        where: { id: params.id },
    });

    if (!audit || audit.tenantId !== user.tenantId) {
        notFound();
    }

    // Parse JSON columns
    const issues = audit.issues as string[] | null;
    const recommendations = audit.recommendations as string[] | null;

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8">
            <div>
                <Link href="/dashboard" className="text-sm text-gray-500 hover:text-black hover:underline mb-4 inline-block">
                    &larr; Back to Dashboard
                </Link>
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold truncate pr-4">{audit.url}</h1>
                    <ScoreChart score={audit.score || 0} />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                    Audited on {new Date(audit.createdAt).toLocaleString()}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div className="bg-white border rounded-xl shadow-sm p-6 line-clamp-none">
                        <h2 className="text-xl font-bold mb-4 border-b pb-2 text-red-600">Discovered Issues</h2>
                        {issues && issues.length > 0 ? (
                            <ul className="list-disc pl-5 space-y-2 text-gray-800">
                                {issues.map((i, idx) => <li key={idx}>{i}</li>)}
                            </ul>
                        ) : (
                            <p className="text-gray-500 italic">No major issues found!</p>
                        )}
                    </div>

                    <div className="bg-white border rounded-xl shadow-sm p-6">
                        <h2 className="text-xl font-bold mb-4 border-b pb-2 text-green-600">AI Recommendations</h2>
                        {recommendations && recommendations.length > 0 ? (
                            <ul className="list-disc pl-5 space-y-2 text-gray-800">
                                {recommendations.map((r, idx) => <li key={idx}>{r}</li>)}
                            </ul>
                        ) : (
                            <p className="text-gray-500 italic">No recommendations available.</p>
                        )}
                    </div>
                </div>

                <div className="bg-gray-50 border rounded-xl p-6 shadow-inner flex flex-col h-[600px]">
                    <h2 className="text-lg font-bold mb-2">Ask the AI SEO Expert</h2>
                    <p className="text-sm text-gray-500 mb-6">Powered by our SEO Best Practices RAG Engine.</p>
                    <div className="flex-1 bg-white border rounded-lg overflow-hidden shadow-sm flex flex-col">
                        <ChatInterface />
                    </div>
                </div>
            </div>
        </div>
    );
}
