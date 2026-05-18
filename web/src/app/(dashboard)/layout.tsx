import Link from "next/link";
import { LogoutButton } from "@/components/LogoutButton";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bgPrimary flex flex-col">
      {/* Header/Nav */}
      <header className="bg-bgSecondary border-b border-borderLight shadow-soft">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/(dashboard)" className="font-bold text-2xl text-textPrimary">
            MSKPredict
          </Link>

          <nav className="flex items-center gap-8">
            <Link
              href="/(dashboard)"
              className="text-sm font-medium text-textSecondary hover:text-textPrimary transition-colors"
            >
              Home
            </Link>
            <Link
              href="/(dashboard)/analysis"
              className="text-sm font-medium text-textSecondary hover:text-textPrimary transition-colors"
            >
              Analysis
            </Link>
            <Link
              href="/(dashboard)/rules"
              className="text-sm font-medium text-textSecondary hover:text-textPrimary transition-colors"
            >
              Rules Library
            </Link>
            <Link
              href="/(dashboard)/publication"
              className="text-sm font-medium text-textSecondary hover:text-textPrimary transition-colors"
            >
              Publication
            </Link>
            <Link
              href="/(dashboard)/patient"
              className="text-sm font-medium text-textSecondary hover:text-textPrimary transition-colors"
            >
              Patient
            </Link>
            <LogoutButton />
          </nav>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-bgSecondary border-b border-borderLight">
        <div className="max-w-7xl mx-auto px-6 flex gap-8">
          <Link
            href="/(dashboard)"
            className="py-4 px-1 border-b-2 border-transparent hover:border-infoPrimary text-sm font-medium text-textSecondary hover:text-textPrimary transition-colors"
          >
            🏠 Home
          </Link>
          <Link
            href="/(dashboard)/analysis"
            className="py-4 px-1 border-b-2 border-transparent hover:border-infoPrimary text-sm font-medium text-textSecondary hover:text-textPrimary transition-colors"
          >
            📊 Analysis
          </Link>
          <Link
            href="/(dashboard)/rules"
            className="py-4 px-1 border-b-2 border-transparent hover:border-infoPrimary text-sm font-medium text-textSecondary hover:text-textPrimary transition-colors"
          >
            📋 Rules
          </Link>
          <Link
            href="/(dashboard)/publication"
            className="py-4 px-1 border-b-2 border-transparent hover:border-infoPrimary text-sm font-medium text-textSecondary hover:text-textPrimary transition-colors"
          >
            📄 Publication
          </Link>
          <Link
            href="/(dashboard)/patient"
            className="py-4 px-1 border-b-2 border-transparent hover:border-infoPrimary text-sm font-medium text-textSecondary hover:text-textPrimary transition-colors"
          >
            👤 Patient
          </Link>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
