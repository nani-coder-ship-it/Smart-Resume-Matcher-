"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { GlowingCard } from "@/components/ui/GlowingCard";
import { FileText, Target, BarChart2, Briefcase } from "lucide-react";

interface DashboardSummary {
    total_resumes_uploaded: number;
    latest_ats_score: number;
    average_match_score: number;
    total_job_matches_run: number;
}

export default function DashboardOverviewPage() {
    const [summary, setSummary] = useState<DashboardSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const response = await api.get("/dashboard/summary");
                setSummary(response.data);
            } catch (err) {
                setError("Failed to load dashboard summary");
            } finally {
                setLoading(false);
            }
        };

        fetchSummary();
    }, []);

    if (loading) {
        return (
            <div className="flex w-full h-64 items-center justify-center">
                <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
            </div>
        );
    }

    if (error || !summary) {
        return <div className="text-red-400 p-4 rounded-lg bg-red-500/10 border border-red-500/20">{error}</div>;
    }

    const statCards = [
        { title: "Total Resumes", value: summary.total_resumes_uploaded, icon: FileText, color: "text-blue-400" },
        { title: "Latest ATS Score", value: `${summary.latest_ats_score}%`, icon: Target, color: "text-emerald-400" },
        { title: "Avg Job Match", value: `${summary.average_match_score}%`, icon: BarChart2, color: "text-violet-400" },
        { title: "Matches Run", value: summary.total_job_matches_run, icon: Briefcase, color: "text-cyan-400" },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header>
                <h1 className="text-3xl font-bold mb-2">Overview</h1>
                <p className="text-gray-400">Here's a summary of your resume and job matching activity.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, i) => (
                    <GlowingCard key={i} className="p-6 flex flex-col min-h-[140px]">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-gray-400">{stat.title}</h3>
                            <stat.icon className={`w-5 h-5 ${stat.color}`} />
                        </div>
                        <div className="text-3xl font-bold mt-auto">{stat.value}</div>
                    </GlowingCard>
                ))}
            </div>

            <div className="mt-12 p-8 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] -z-10 rounded-full" />
                <h2 className="text-2xl font-bold mb-4">Ready to optimize?</h2>
                <p className="text-gray-300 max-w-2xl mb-6">
                    Upload your latest resume to get an updated ATS score, or paste a new job description to see how well you match.
                </p>
                <div className="flex gap-4">
                    <a href="/dashboard/upload" className="px-6 py-3 rounded-full bg-primary text-white font-medium hover:bg-primary-light transition-colors shadow-glow">
                        Upload Resume
                    </a>
                    <a href="/dashboard/match" className="px-6 py-3 rounded-full glass border border-white/10 font-medium hover:bg-white/5 transition-colors">
                        Find Match
                    </a>
                </div>
            </div>
        </div>
    );
}
