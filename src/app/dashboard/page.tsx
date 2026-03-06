import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { NewAuditForm } from "@/components/NewAuditForm";
import Link from "next/link";

export default async function DashboardPage() {
    const { userId } = auth();
    const user = await currentUser();

    if (!userId || !user) {
        redirect("/");
    }

    // Identify tenant from the db...
    // Since we haven't strictly created the user -> tenant flow on signup,
    // we will auto-detect or create a default tenant if one doesn't exist for their userId.
    let dbUser = await prisma.user.findUnique({
        where: { clerkId: userId },
        include: { tenant: true }
    });

    if (!dbUser) {
        // Create Tenant and User if this is their first login
        const tenant = await prisma.tenant.create({
            data: { name: user.firstName ? `${user.firstName}'s Workspace` : "My Workspace" }
        });
        dbUser = await prisma.user.create({
            data: {
                clerkId: userId,
                email: user.emailAddresses[0].emailAddress,
                name: user.firstName || "Unknown",
                tenantId: tenant.id
            },
            include: { tenant: true }
        });
    }

    const audits = await prisma.audit.findMany({
        where: { tenantId: dbUser.tenantId },
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-4">Welcome, {dbUser.tenant.name}</h1>
            <p className="text-gray-600 mb-8">Run hyper-local SEO audits and chat with your AI assistant.</p>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-8 max-w-2xl">
                <h2 className="text-xl font-semibold mb-4">Run a New Audit</h2>
                <NewAuditForm tenantId={dbUser.tenantId} />
            </div>

            <h2 className="text-2xl font-semibold mb-4">Audit History</h2>
            {audits.length === 0 ? (
                <div className="text-gray-500 italic p-6 border rounded bg-gray-50 text-center max-w-2xl">
                    No audits yet. Run your first audit to see the report here!
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {audits.map((a) => (
                        <Link href={`/dashboard/audit/${a.id}`} key={a.id} className="block group">
                            <div className="border border-gray-200 p-5 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
                                <p className="text-sm font-medium text-blue-600 truncate mb-2">{a.url}</p>
                                <div className="flex justify-between items-end">
                                    <span className="text-sm text-gray-400">
                                        {new Date(a.createdAt).toLocaleDateString()}
                                    </span>
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${a.score && a.score >= 80 ? 'bg-green-100 text-green-700' :
                                        a.score && a.score >= 50 ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-red-100 text-red-700'
                                        }`}>
                                        {a.score} / 100
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
