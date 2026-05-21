"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) setIsOpen(false);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  const navItems = [
    { href: "/", label: "Home", icon: "🏠" },
    { href: "/analysis", label: "Analysis", icon: "📊" },
    { href: "/rules-engine", label: "Rules Library", icon: "⚙️" },
    { href: "/publication", label: "Publication", icon: "📄" },
    { href: "/patient", label: "Patient", icon: "👤" },
  ];

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed md:hidden top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-soft hover:bg-bgSecondary transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
          />
        </svg>
      </button>

      {/* Sidebar */}
      <aside
        className={`${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 fixed md:relative z-40 h-screen w-64 bg-white border-r border-borderLight transition-transform duration-200 ease-out flex flex-col`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-borderLight">
          <h1 className="text-2xl font-bold text-textPrimary">MSKPredict</h1>
          <p className="text-xs text-textSecondary mt-1">Clinical Decision Support</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => isMobile && setIsOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive(item.href)
                  ? "bg-infoPrimary text-white font-medium shadow-soft"
                  : "text-textSecondary hover:text-textPrimary hover:bg-bgSecondary"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-borderLight">
          <button
            onClick={() => {
              window.location.href = "/api/auth/logout";
            }}
            className="w-full px-4 py-3 text-sm font-medium text-dangerPrimary hover:bg-dangerLight rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
