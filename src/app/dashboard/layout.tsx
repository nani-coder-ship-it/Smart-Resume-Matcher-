"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { LayoutDashboard, Upload, Search, LogOut, FileText } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, loading, logout } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    if (loading || !user) {
        return (
            <div className="flex items-center justify-center min-h-screen w-full">
                <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
            </div>
        );
    }

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    return (
        <div className="flex min-h-[calc(100vh-80px)] w-full max-w-7xl mx-auto items-start">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/10 h-full p-6 flex flex-col gap-2">
                <div className="mb-8">
                    <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-cyan-400">
                        Dashboard
                    </h2>
                    <p className="text-sm text-gray-400 truncate mt-1">Hello, {user.full_name || user.email}</p>
                </div>

                <nav className="flex-1 space-y-2">
                    <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 transition-colors text-gray-300 hover:text-white">
                        <LayoutDashboard size={20} />
                        <span>Overview</span>
                    </Link>
                    <Link href="/dashboard/upload" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 transition-colors text-gray-300 hover:text-white">
                        <Upload size={20} />
                        <span>Upload Resume</span>
                    </Link>
                    <Link href="/dashboard/match" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 transition-colors text-gray-300 hover:text-white">
                        <Search size={20} />
                        <span>Job Match</span>
                    </Link>
                    <Link href="/dashboard/edit" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 transition-colors text-gray-300 hover:text-white">
                        <FileText size={20} />
                        <span>Edit Suggestions</span>
                    </Link>
                </nav>

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-500/10 transition-colors text-red-400 hover:text-red-300 w-full mt-auto"
                >
                    <LogOut size={20} />
                    <span>Sign Out</span>
                </button>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
