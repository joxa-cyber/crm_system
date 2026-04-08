"use client";

import { Button } from "@/components/ui/button";
import { logoutAction } from "@/actions/auth";
import { MobileNav } from "./mobile-nav";

interface HeaderProps {
  userName: string;
  userRole: string;
}

export function Header({ userName, userRole }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 h-16">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        {/* Mobile menu */}
        <div className="lg:hidden">
          <MobileNav userRole={userRole} />
        </div>

        {/* Logo for mobile */}
        <div className="lg:hidden font-bold text-lg text-gray-900">CRM</div>

        {/* Spacer for desktop */}
        <div className="hidden lg:block" />

        {/* User info */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-gray-900">{userName}</p>
            <p className="text-xs text-gray-500">
              {userRole === "ADMIN" ? "CEO" : "Menejer"}
            </p>
          </div>
          <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-semibold text-blue-700">
              {userName.charAt(0).toUpperCase()}
            </span>
          </div>
          <form action={logoutAction}>
            <Button variant="ghost" size="sm" type="submit" className="text-gray-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
