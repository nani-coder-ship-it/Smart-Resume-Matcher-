"use client";

import React, { useState, useEffect } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, ShieldAlert, FileText, Briefcase } from "lucide-react";

interface Resume {
    id: number;
    filename: string;
    status: string;
    created_at: string;
}

interface MatchResult {
    match_percentage: number;
    matching_skills: string[];
    missing_skills: string[];
}

export default function JobMatchPage() {
    const [resumes, setResumes] = useState<Resume[]>([]);
    const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);
    const [jobTitle, setJobTitle] = useState("");
    const [jobText, setJobText] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [matchResult, setMatchResult] = useState<MatchResult | null>(null);

    useEffect(() => {
        // Fetch user's resumes on mount
        const fetchResumes = async () => {
            try {
                const res = await api.get("/resume/");
                setResumes(res.data);
                if (res.data.length > 0) {
                    setSelectedResumeId(res.data[0].id);
                }
            } catch (err) {
                console.error("Failed to load resumes", err);
            }
        };
        fetchResumes();
    }, []);

    const handleMatch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedResumeId) {
            setError("Please select a resume first.");
            return;
        }

        setLoading(true);
        setError("");
        setMatchResult(null);

        try {
            // 1. Analyze Job Description
            const jobRes = await api.post("/job/analyze", {
                job_title: jobTitle,
                job_text: jobText,
            });

            const jobId = jobRes.data.id;

            // 2. Compute Match
            const matchRes = await api.post(`/job/match/${selectedResumeId}/${jobId}`);
            setMatchResult(matchRes.data);

        } catch (err: any) {
            setError(err.response?.data?.detail || "An error occurred during matching.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header>
                <h1 className="text-3xl font-bold mb-2">Job Match Analysis</h1>
                <p className="text-gray-400">Compare your resume against a job description to discover matching skills and identify gaps.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Left Column: Input Form */}
                <div className="glass p-6 rounded-2xl border border-white/10 relative overflow-hidden bg-black/40 backdrop-blur-2xl">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-primary" /> Setup Analysis
                    </h2>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg mb-4 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleMatch} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Select Resume</label>
                            <select
                                title="Select Resume"
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary appearance-none"
                                value={selectedResumeId || ""}
                                onChange={(e) => setSelectedResumeId(Number(e.target.value))}
                                required
                            >
                                <option value="" disabled>-- Select a Resume --</option>
                                {resumes.map(r => (
                                    <option key={r.id} value={r.id}>
                                        {r.filename} {r.status !== 'completed' ? `(${r.status})` : ''}
                                    </option>
                                ))}
                            </select>
                            {resumes.length === 0 && (
                                <p className="text-xs text-yellow-500 mt-1">You need to upload a resume first.</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Job Title</label>
                            <input
                                type="text"
                                placeholder="e.g. Senior Frontend Engineer"
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary"
                                value={jobTitle}
                                onChange={(e) => setJobTitle(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Job Description</label>
                            <textarea
                                placeholder="Paste the full job description here..."
                                className="w-full h-48 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary resize-none"
                                value={jobText}
                                onChange={(e) => setJobText(e.target.value)}
                                required
                            />
                        </div>

                        <Button type="submit" disabled={loading || !selectedResumeId} className="w-full py-4 mt-2">
                            {loading ? "Analyzing Match..." : "Run AI Matcher"}
                        </Button>
                    </form>
                </div>

                {/* Right Column: Execution Results */}
                <div className="flex flex-col gap-6">
                    {matchResult ? (
                        <>
                            {/* Score Card */}
                            <div className="glass p-6 rounded-2xl border border-white/10 flex flex-col items-center justify-center relative overflow-hidden bg-black/40 backdrop-blur-2xl">
                                <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-secondary/10 opacity-50" />
                                <h3 className="text-lg font-medium text-gray-400 mb-4 z-10">Match Score</h3>
                                <div className="relative z-10 w-32 h-32 rounded-full border-8 border-white/5 flex items-center justify-center">
                                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                                        <circle
                                            cx="50%" cy="50%" r="46%"
                                            stroke="url(#gradient-match)" strokeWidth="8" fill="none"
                                            strokeDasharray="289 289"
                                            strokeDashoffset={289 - (289 * matchResult.match_percentage) / 100}
                                            strokeLinecap="round"
                                            className="transition-all duration-1000 ease-out"
                                        />
                                        <defs>
                                            <linearGradient id="gradient-match" x1="0%" y1="0%" x2="100%" y2="0%">
                                                <stop offset="0%" stopColor="#8b5cf6" />
                                                <stop offset="100%" stopColor="#0ea5e9" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                    <div className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">
                                        {Math.round(matchResult.match_percentage)}%
                                    </div>
                                </div>
                            </div>

                            {/* Skills Split */}
                            <div className="glass p-6 rounded-2xl border border-white/10 flex flex-col gap-6 bg-black/40 backdrop-blur-2xl flex-1">
                                <div>
                                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Matching Skills
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {matchResult.matching_skills.length > 0 ? (
                                            matchResult.matching_skills.map((skill, i) => (
                                                <span key={i} className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
                                                    {skill}
                                                </span>
                                            ))
                                        ) : (
                                            <p className="text-sm text-gray-500 italic">No matching keywords found.</p>
                                        )}
                                    </div>
                                </div>

                                <div className="w-full h-px bg-white/5" />

                                <div>
                                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <ShieldAlert className="w-4 h-4 text-red-400" /> Missing Skills (Gaps)
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {matchResult.missing_skills.length > 0 ? (
                                            matchResult.missing_skills.map((skill, i) => (
                                                <span key={i} className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                                                    {skill}
                                                </span>
                                            ))
                                        ) : (
                                            <p className="text-sm text-gray-500 italic">No missing keywords! Perfect match.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="glass p-6 rounded-2xl border border-white/10 flex-1 flex flex-col items-center justify-center text-center bg-black/40 backdrop-blur-2xl h-full min-h-[400px]">
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                <FileText className="w-8 h-8 text-gray-500" />
                            </div>
                            <h3 className="text-lg font-medium text-white mb-2">Awaiting Input</h3>
                            <p className="text-gray-400 text-sm max-w-xs">Fill out the job details and select a resume to see your personalized AI match report.</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
