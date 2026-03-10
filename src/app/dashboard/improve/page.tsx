"use client";

import React, { useState, useEffect } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { GlowingCard } from "@/components/ui/GlowingCard";
import { CheckCircle2, AlertCircle, Loader, Download, FileText, Zap, Copy } from "lucide-react";

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
    original_resume: string;
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
    const [copiedSkills, setCopiedSkills] = useState<string | null>(null);

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
            
            // Store result with improved resume PDF
            setResult(res.data);
        } catch (err: any) {
            setError(err.response?.data?.detail || "Failed to improve resume");
            console.error("API Error:", err);
        } finally {
            setLoading(false);
        }
    };

    const downloadAsEditedPDF = async () => {
        if (!result || !result.optimized_resume_pdf) {
            setError("PDF not available. Please analyze the resume first.");
            return;
        }

        setDownloading(true);
        try {
            // Decode base64 PDF and download
            const binaryString = atob(result.optimized_resume_pdf);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            const blob = new Blob([bytes], { type: "application/pdf" });
            
            // Download the improved resume as PDF
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `optimized-resume-${Date.now()}.pdf`;
            document.body.appendChild(link);
            link.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(link);
            
            setError("");
        } catch (err) {
            console.error("PDF download failed:", err);
            setError("Failed to download PDF. Please try again.");
        } finally {
            setDownloading(false);
        }
    };

    const copyMissingSkillsToClipboard = () => {
        if (result && result.missing_skills.length > 0) {
            const skillsText = result.missing_skills.join(", ");
            navigator.clipboard.writeText(skillsText);
            setCopiedSkills("all");
            setTimeout(() => setCopiedSkills(null), 2000);
        }
    };

    const copySingleSkill = (skill: string) => {
        navigator.clipboard.writeText(skill);
        setCopiedSkills(skill);
        setTimeout(() => setCopiedSkills(null), 1500);
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header>
                <h1 className="text-4xl font-bold mb-3 flex items-center gap-3">
                    <Zap className="w-8 h-8 text-primary" />
                    Resume Improvement Assistant
                </h1>
                <p className="text-gray-400 text-lg">
                    Get AI suggestions to match job requirements, then manually edit and download your resume.
                </p>
            </header>

            {/* Input Form */}
            <div className="glass p-8 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-2xl">
                <h2 className="text-2xl font-bold mb-6">Analyze Your Resume</h2>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleImprove} className="space-y-5">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                Select Your Resume
                            </label>
                            <select
                                title="Select Resume"
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary"
                                value={selectedResumeId || ""}
                                onChange={(e) => setSelectedResumeId(Number(e.target.value))}
                                required
                            >
                                <option value="" disabled>
                                    -- Select a Resume --
                                </option>
                                {resumes.map((r) => (
                                    <option key={r.id} value={r.id}>
                                        {r.filename}
                                    </option>
                                ))}
                            </select>
                            {resumes.length === 0 && (
                                <p className="text-xs text-yellow-500 mt-2">
                                    Upload and process a resume first.
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                Job Title (Optional)
                            </label>
                            <input
                                type="text"
                                placeholder="e.g., Senior Full Stack Developer"
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary"
                                value={jobTitle}
                                onChange={(e) => setJobTitle(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                            Job Description *
                        </label>
                        <textarea
                            placeholder="Paste the complete job description here..."
                            className="w-full h-40 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary resize-none"
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            required
                        />
                        <p className="text-xs text-gray-500 mt-2">
                            Include requirements, responsibilities, and skills needed
                        </p>
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
                                Analyze & Get Suggestions
                            </>
                        )}
                    </Button>
                </form>
            </div>

            {/* Main Results Area with AI Suggestions + Download */}
            {result && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Panel: AI Suggestions */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* ATS Score */}
                        <GlowingCard className="p-6 bg-black/40 backdrop-blur-2xl">
                            <h3 className="text-sm font-medium text-gray-400 mb-3">Match Score</h3>
                            <div className="flex items-end gap-4">
                                <div>
                                    <div className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">
                                        {result.ats_score}%
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Match with Job</p>
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
                                <CheckCircle2 className="w-4 h-4" /> Matching ({result.matching_skills.length})
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {result.matching_skills.length > 0 ? (
                                    result.matching_skills.map((skill, i) => (
                                        <span
                                            key={i}
                                            className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-medium"
                                        >
                                            ✓ {skill}
                                        </span>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500">None found</p>
                                )}
                            </div>
                        </GlowingCard>

                        {/* Missing Skills with Copy Buttons */}
                        <GlowingCard className="p-6 bg-black/40 backdrop-blur-2xl">
                            <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" /> Missing ({result.missing_skills.length})
                            </h3>
                            <div className="space-y-2">
                                {result.missing_skills.length > 0 ? (
                                    <>
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {result.missing_skills.map((skill, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => copySingleSkill(skill)}
                                                    className="px-3 py-1 rounded-full bg-red-500/20 text-red-300 text-xs font-medium hover:bg-red-500/30 transition-all cursor-pointer"
                                                    title="Click to copy"
                                                >
                                                    {copiedSkills === skill ? "✓ Copied" : skill}
                                                </button>
                                            ))}
                                        </div>
                                        <button
                                            onClick={copyMissingSkillsToClipboard}
                                            className="w-full text-xs py-2 bg-white/5 hover:bg-white/10 rounded border border-white/10 text-gray-400 transition-colors flex items-center justify-center gap-1"
                                        >
                                            <Copy className="w-3 h-3" />
                                            {copiedSkills === "all" ? "Copied All!" : "Copy All Skills"}
                                        </button>
                                    </>
                                ) : (
                                    <p className="text-sm text-gray-500">Perfect match!</p>
                                )}
                            </div>
                        </GlowingCard>

                        {/* Improvement Suggestions */}
                        <GlowingCard className="p-6 bg-black/40 backdrop-blur-2xl">
                            <h3 className="text-sm font-bold text-yellow-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <Zap className="w-4 h-4" /> Tips
                            </h3>
                            <div className="space-y-2">
                                {result.suggestions.slice(0, 4).map((suggestion, idx) => (
                                    <div
                                        key={idx}
                                        className="text-xs bg-white/5 p-3 rounded border border-white/10 text-gray-300"
                                    >
                                        <strong className="text-yellow-300">{idx + 1}.</strong> {suggestion}
                                    </div>
                                ))}
                            </div>
                        </GlowingCard>
                    </div>

                    {/* Right Panel: Download Improved Resume */}
                    <div className="lg:col-span-2">
                        <GlowingCard className="p-8 bg-black/40 backdrop-blur-2xl h-full flex flex-col justify-center items-center text-center">
                            <Zap className="w-20 h-20 text-cyan-400 mb-6 mx-auto" />
                            <h2 className="text-3xl font-bold mb-3">Ready to Download!</h2>
                            <p className="text-gray-400 mb-8 max-w-md leading-relaxed">
                                Your resume has been analyzed and improved with AI suggestions. The enhanced version incorporates missing skills and better action verbs. Download your optimized resume now!
                            </p>

                            {/* Download Button */}
                            <Button
                                onClick={downloadAsEditedPDF}
                                disabled={downloading}
                                className="mb-6 px-8 py-4 text-lg flex items-center justify-center gap-3 bg-gradient-to-r from-violet-500 to-cyan-500 hover:from-violet-600 hover:to-cyan-600 disabled:opacity-50"
                            >
                                {downloading ? (
                                    <>
                                        <Loader className="w-6 h-6 animate-spin" />
                                        Generating PDF...
                                    </>
                                ) : (
                                    <>
                                        <Download className="w-6 h-6" />
                                        Download Improved Resume (PDF)
                                    </>
                                )}
                            </Button>

                            {/* Info Box */}
                            <div className="w-full bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-sm text-blue-300">
                                <p>
                                    ✨ <strong>What's included:</strong> Missing skills added, weak verbs improved, optimized formatting, and professional layout.
                                </p>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-4 mt-8 w-full">
                                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                                    <div className="text-2xl font-bold text-emerald-400">{result.matching_skills.length}</div>
                                    <div className="text-xs text-gray-500 mt-1">Matching Skills</div>
                                </div>
                                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                                    <div className="text-2xl font-bold text-red-400">{result.missing_skills.length}</div>
                                    <div className="text-xs text-gray-500 mt-1">Skills Added</div>
                                </div>
                                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                                    <div className="text-2xl font-bold text-cyan-400">{result.ats_score}%</div>
                                    <div className="text-xs text-gray-500 mt-1">Match Score</div>
                                </div>
                            </div>
                        </GlowingCard>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!result && !loading && (
                <div className="glass p-12 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-2xl flex flex-col items-center justify-center">
                    <FileText className="w-20 h-20 text-gray-600 mb-4" />
                    <h3 className="text-xl font-medium text-white mb-2">Ready to Improve</h3>
                    <p className="text-gray-400 text-center max-w-2xl">
                        Step 1: Select your resume and enter a job description  <br />
                        Step 2: Let AI analyze the match  <br />
                        Step 3: Manually edit your resume with suggestions  <br />
                        Step 4: Download your improved resume
                    </p>
                </div>
            )}
        </div>
    );
}
