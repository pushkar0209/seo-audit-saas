import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex flex-col min-h-screen">
            <header className="border-b bg-white shadow-sm sticky top-0 z-10 w-full shrink-0 h-16 flex items-center h-16 bg-background">
                <div className="container mx-auto px-4 w-full flex justify-between items-center max-w-7xl">
                    <Link href="/" className="font-bold text-xl inline-block px-1 tracking-tight truncate mr-2">
                        SEO Audit AI
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="text-sm font-medium hover:underline px-2">
                            Audits
                        </Link>
                        <Link href="/settings" className="text-sm font-medium hover:underline px-2 mr-2 hidden sm:block">
                            Settings
                        </Link>
                        <div className="border border-gray-200 bg-gray-50 flex items-center justify-center p-1 rounded-full relative ml-1 shadow-[0_0_1px_rgba(0,0,0,0.1)] hover:shadow-sm px-[2px] transition-all">
                            <UserButton afterSignOutUrl="/" />
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 bg-gray-50 overflow-y-auto">
                <div className="mx-auto container p-2 max-w-7xl relative mx-auto my-0 pb-6 w-full mt-4 bg-white/50 backdrop-blur-sm rounded-xl min-h-[calc(100vh-6rem)] shadow-[0_2px_8px_rgba(0,0,0,0.02)] border border-[#EDEDED]">
                    {children}
                </div>
            </main>
        </div>
    );
}
