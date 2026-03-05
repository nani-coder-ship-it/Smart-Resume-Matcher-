"use client";

import React, { useState, useEffect } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { GlowingCard } from "@/components/ui/GlowingCard";
import { CheckCircle2, AlertCircle, Loader, Download, FileText, Zap } from "lucide-react";

interface Resume {
    id: number;
    filename: string;
    status: string;
}

interface ImproveResult {
    ats_score: number;
    matching_skills: string[];
    missing_skills: string[];
    suggestions: string[];
    optimized_resume: string;
    optimized_resume_pdf: string;
    comparison: {
        keyword_density: number;
        matching_count: number;
        missing_count: number;
    };
}

export default function ResumeImproveAndDownloadPage() {
    const [resumes, setResumes] = useState<Resume[]>([]);
    const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);
    const [jobDescription, setJobDescription] = useState("");
    const [jobTitle, setJobTitle] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [result, setResult] = useState<ImproveResult | null>(null);
    const [downloading, setDownloading] = useState(false);

    // Fetch resumes on mount
    useEffect(() => {
        const fetchResumes = async () => {
            try {
                const res = await api.get("/resume/");
                setResumes(res.data.filter((r: Resume) => r.status === "completed"));
                if (res.data.length > 0) {
                    setSelectedResumeId(res.data[0].id);
                }
            } catch (err) {
                console.error("Failed to load resumes", err);
            }
        };
        fetchResumes();
    }, []);

    const handleImprove = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedResumeId || !jobDescription.trim()) {
            setError("Please select a resume and enter job description");
            return;
        }

        setLoading(true);
        setError("");
        setResult(null);

        try {
            const res = await api.post("/resume-improve/optimize", {
                resume_id: selectedResumeId,
                job_description: jobDescription,
                job_title: jobTitle,
            });
            setResult(res.data);
        } catch (err: any) {
            setError(err.response?.data?.detail || "Failed to improve resume");
        } finally {
            setLoading(false);
        }
    };

    const downloadOptimizedResume = async () => {
        if (!result || !selectedResumeId) return;

        setDownloading(true);
        try {
            // Download PDF using the dedicated endpoint
            const response = await api.post(
                "/resume-improve/download-pdf",
                {
                    resume_id: selectedResumeId,
                    job_description: jobDescription,
                    job_title: jobTitle,
                },
                { responseType: "blob" }
            );
            
            // Create blob and download
            const blob = new Blob([response.data], { type: "application/pdf" });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `optimized-resume-${selectedResumeId}-${Date.now()}.pdf`;
            document.body.appendChild(link);
            link.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(link);
        } catch (err) {
            console.error("PDF download failed:", err);
            setError("Failed to download PDF. Trying text format...");
            // Fallback to text download
            try {
                const content = result.optimized_resume;
                const blob = new Blob([content], { type: "text/plain" });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `optimized-resume-${Date.now()}.txt`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } catch (fallbackErr) {
                console.error("Fallback download also failed:", fallbackErr);
            }
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header>
                <h1 className="text-4xl font-bold mb-3 flex items-center gap-3">
                    <Zap className="w-8 h-8 text-primary" />
                    AI Resume Improvement
                </h1>
                <p className="text-gray-400 text-lg">Upload your resume and job description to get AI-powered optimization suggestions and a better-aligned resume.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Input Form */}
                <div className="glass p-8 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-2xl">
                    <h2 className="text-2xl font-bold mb-6">Resume Analysis</h2>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg mb-4">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleImprove} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Select Your Resume</label>
                            <select
                                title="Select Resume"
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary"
                                value={selectedResumeId || ""}
                                onChange={(e) => setSelectedResumeId(Number(e.target.value))}
                                required
                            >
                                <option value="" disabled>-- Select a Resume --</option>
                                {resumes.map((r) => (
                                    <option key={r.id} value={r.id}>
                                        {r.filename}
                                    </option>
                                ))}
                            </select>
                            {resumes.length === 0 && (
                                <p className="text-xs text-yellow-500 mt-2">Upload and process a resume first in the Resume Upload section.</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Job Title (Optional)</label>
                            <input
                                type="text"
                                placeholder="e.g., Senior Full Stack Developer"
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary"
                                value={jobTitle}
                                onChange={(e) => setJobTitle(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Job Description *</label>
                            <textarea
                                placeholder="Paste the complete job description here..."
                                className="w-full h-56 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary resize-none"
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                                required
                            />
                            <p className="text-xs text-gray-500 mt-2">Include requirements, responsibilities, and skills needed</p>
                        </div>

                        <Button 
                            type="submit" 
                            disabled={loading || !selectedResumeId} 
                            className="w-full py-3 text-lg flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader className="w-5 h-5 animate-spin" />
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <Zap className="w-5 h-5" />
                                    Get AI Improvement
                                </>
                            )}
                        </Button>
                    </form>
                </div>

                {/* Results */}
                {result ? (
                    <div className="space-y-6">
                        {/* ATS Score */}
                        <GlowingCard className="p-6 bg-black/40 backdrop-blur-2xl">
                            <h3 className="text-sm font-medium text-gray-400 mb-3">Optimization Score</h3>
                            <div className="flex items-end gap-4">
                                <div>
                                    <div className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">
                                        {result.ats_score}%
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">ATS Compatibility</p>
                                </div>
                                <div className="flex-1">
                                    <div className="w-full bg-white/5 rounded-full h-2">
                                        <div
                                            className="bg-gradient-to-r from-violet-500 to-cyan-500 h-2 rounded-full transition-all"
                                            style={{ width: `${result.ats_score}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </GlowingCard>

                        {/* Matching Skills */}
                        <GlowingCard className="p-6 bg-black/40 backdrop-blur-2xl">
                            <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4" /> Matching Skills
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {result.matching_skills.length > 0 ? (
                                    result.matching_skills.map((skill, i) => (
                                        <span key={i} className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-medium">
                                            ✓ {skill}
                                        </span>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500">No matching skills found</p>
                                )}
                            </div>
                        </GlowingCard>

                        {/* Missing Skills */}
                        <GlowingCard className="p-6 bg-black/40 backdrop-blur-2xl">
                            <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" /> Missing Skills
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {result.missing_skills.length > 0 ? (
                                    result.missing_skills.map((skill, i) => (
                                        <span key={i} className="px-3 py-1 rounded-full bg-red-500/20 text-red-300 text-xs font-medium">
                                            ⊕ {skill}
                                        </span>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500">No skills missing!</p>
                                )}
                            </div>
                        </GlowingCard>
                    </div>
                ) : (
                    <div className="glass p-6 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-2xl flex flex-col items-center justify-center min-h-[400px]">
                        <FileText className="w-16 h-16 text-gray-600 mb-4" />
                        <h3 className="text-lg font-medium text-white mb-2">Ready to Improve</h3>
                        <p className="text-gray-400 text-center">Select a resume and enter a job description to get AI-powered optimization suggestions.</p>
                    </div>
                )}
            </div>

            {/* Suggestions & Download */}
            {result && (
                <div className="space-y-6">
                    {/* Improvement Suggestions */}
                    <GlowingCard className="p-8 bg-black/40 backdrop-blur-2xl">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                            <Zap className="w-6 h-6 text-primary" />
                            Improvement Suggestions
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {result.suggestions.map((suggestion, idx) => (
                                <div key={idx} className="p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors">
                                    <p className="text-white font-medium flex items-start gap-3">
                                        <span className="text-primary font-bold text-lg mt-0.5">{idx + 1}.</span>
                                        {suggestion}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </GlowingCard>

                    {/* Optimized Resume Preview */}
                    <GlowingCard className="p-8 bg-black/40 backdrop-blur-2xl">
                        <h2 className="text-2xl font-bold mb-4">Optimized Resume Preview</h2>
                        <div className="bg-white/5 rounded-lg p-6 border border-white/10 max-h-96 overflow-y-auto">
                            <pre className="text-gray-300 text-sm whitespace-pre-wrap font-mono">
                                {result.optimized_resume}
                            </pre>
                        </div>
                        <div className="mt-6 flex gap-4">
                            <Button 
                                onClick={downloadOptimizedResume}
                                disabled={downloading}
                                className="flex-1 flex items-center justify-center gap-2 py-3"
                            >
                                {downloading ? (
                                    <>
                                        <Loader className="w-5 h-5 animate-spin" />
                                        Downloading...
                                    </>
                                ) : (
                                    <>
                                        <Download className="w-5 h-5" />
                                        Download Optimized Resume
                                    </>
                                )}
                            </Button>
                        </div>
                    </GlowingCard>
                </div>
            )}
        </div>
    );
}
