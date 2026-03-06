import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl">
            SEO Audit AI
          </Link>
          <div className="flex items-center gap-4">
            <SignedOut>
              <SignInButton mode="redirect">
                <button className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors">
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard" className="text-sm font-medium hover:underline underline-offset-4">
                Dashboard
              </Link>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50">
        <h1 className="text-5xl font-extrabold tracking-tight mb-6">
          Hyper-Local SEO Intelligence
        </h1>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl">
          Paste in a website URL and receive an AI-generated SEO audit report.
          Grounded in live e-commerce data via RAG.
        </p>

        <SignedOut>
          <SignInButton mode="redirect">
            <button className="bg-black text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-800 transition-colors">
              Get Started for Free
            </button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <Link href="/dashboard" className="bg-black text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-800 transition-colors">
            Go to Dashboard
          </Link>
        </SignedIn>
      </main>

      <footer className="border-t py-8 text-center text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} SEO Audit AI. All rights reserved.</p>
      </footer>
    </div>
  );
}

