"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { GlowingCard } from "@/components/ui/GlowingCard";
import {
    AlertCircle,
    CheckCircle2,
    Copy,
    FileText,
    Lightbulb,
    Loader,
    Edit3,
    ArrowRight,
} from "lucide-react";

interface Resume {
    id: number;
    file_name: string;
    status: string;
}

interface EditSuggestion {
    section: string;
    action: string;
    original_text: string;
    suggested_text: string;
    reason: string;
}

interface EditSuggestionsResult {
    matching_skills: string[];
    missing_skills: string[];
    edit_suggestions: EditSuggestion[];
}

export default function EditSuggestionsPage() {
    const [resumes, setResumes] = useState<Resume[]>([]);
    const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);
    const [jobTitle, setJobTitle] = useState("");
    const [jobDescription, setJobDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [result, setResult] = useState<EditSuggestionsResult | null>(null);
    const [copiedSuggestion, setCopiedSuggestion] = useState<number | null>(null);

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
                console.error("Failed to fetch resumes:", err);
                setError("Failed to load resumes");
            }
        };
        fetchResumes();
    }, []);

    const handleGetSuggestions = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedResumeId || !jobDescription.trim()) {
            setError("Please select a resume and enter job description");
            return;
        }

        setLoading(true);
        setError("");
        setResult(null);

        try {
            const res = await api.post("/resume-improve/get-edit-suggestions", {
                resume_id: selectedResumeId,
                job_description: jobDescription,
                job_title: jobTitle,
            });

            setResult(res.data);
        } catch (err: any) {
            setError(err.response?.data?.detail || "Failed to get suggestions");
            console.error("API Error:", err);
        } finally {
            setLoading(false);
        }
    };

    const copySuggestion = (index: number, text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedSuggestion(index);
        setTimeout(() => setCopiedSuggestion(null), 1500);
    };

    return (
        <div className="relative min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            {/* Content */}
            <div className="relative max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-pink-400 to-cyan-400 mb-4">
                        Resume Editing Assistant
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Get precise editing suggestions to improve your resume for the job you're targeting
                    </p>
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Input Form */}
                    <div className="lg:col-span-1">
                        <GlowingCard className="p-8 bg-black/40 backdrop-blur-2xl h-full">
                            <h2 className="text-xl font-bold mb-6">Provide Details</h2>
                            <form onSubmit={handleGetSuggestions} className="space-y-6">
                                {/* Resume Selector */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Select Resume
                                    </label>
                                    <select
                                        value={selectedResumeId || ""}
                                        onChange={(e) =>
                                            setSelectedResumeId(parseInt(e.target.value))
                                        }
                                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-primary outline-none"
                                    >
                                        <option value="">-- Select Resume --</option>
                                        {resumes.map((resume) => (
                                            <option key={resume.id} value={resume.id}>
                                                {resume.file_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Job Title */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Job Title
                                    </label>
                                    <input
                                        type="text"
                                        value={jobTitle}
                                        onChange={(e) => setJobTitle(e.target.value)}
                                        placeholder="e.g., Senior React Developer"
                                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-primary outline-none"
                                    />
                                </div>

                                {/* Job Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Job Description *
                                    </label>
                                    <textarea
                                        value={jobDescription}
                                        onChange={(e) => setJobDescription(e.target.value)}
                                        placeholder="Paste the full job description here..."
                                        rows={8}
                                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-primary outline-none resize-none"
                                    />
                                </div>

                                {/* Error Message */}
                                {error && (
                                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                                        <p className="text-red-400 text-sm">{error}</p>
                                    </div>
                                )}

                                {/* Submit Button */}
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full px-6 py-3 bg-gradient-to-r from-violet-500 to-cyan-500 hover:from-violet-600 hover:to-cyan-600 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <Loader className="w-5 h-5 animate-spin" />
                                            Analyzing...
                                        </>
                                    ) : (
                                        <>
                                            <Lightbulb className="w-5 h-5" />
                                            Get Suggestions
                                        </>
                                    )}
                                </Button>
                            </form>
                        </GlowingCard>
                    </div>

                    {/* Right: Results */}
                    <div className="lg:col-span-2 space-y-6">
                        {!result && !loading && (
                            <GlowingCard className="p-12 bg-black/40 backdrop-blur-2xl text-center">
                                <FileText className="w-20 h-20 text-gray-600 mx-auto mb-6 opacity-50" />
                                <h3 className="text-xl font-bold text-gray-400 mb-2">
                                    No Analysis Yet
                                </h3>
                                <p className="text-gray-500">
                                    Fill in the details and click "Get Suggestions" to receive
                                    personalized editing recommendations
                                </p>
                            </GlowingCard>
                        )}

                        {loading && (
                            <GlowingCard className="p-12 bg-black/40 backdrop-blur-2xl text-center">
                                <Loader className="w-12 h-12 text-cyan-400 mx-auto animate-spin mb-4" />
                                <p className="text-gray-400">Analyzing your resume...</p>
                            </GlowingCard>
                        )}

                        {result && (
                            <div className="space-y-6">
                                {/* Matching Skills */}
                                <GlowingCard className="p-6 bg-black/40 backdrop-blur-2xl">
                                    <h3 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                                        <CheckCircle2 className="w-5 h-5" />
                                        Matching Skills ({result.matching_skills.length})
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {result.matching_skills.length > 0 ? (
                                            result.matching_skills.map((skill) => (
                                                <span
                                                    key={skill}
                                                    className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-sm font-medium"
                                                >
                                                    ✓ {skill}
                                                </span>
                                            ))
                                        ) : (
                                            <p className="text-gray-500">No matching skills found</p>
                                        )}
                                    </div>
                                </GlowingCard>

                                {/* Missing Skills */}
                                {result.missing_skills.length > 0 && (
                                    <GlowingCard className="p-6 bg-black/40 backdrop-blur-2xl">
                                        <h3 className="text-lg font-bold text-red-400 mb-4 flex items-center gap-2">
                                            <AlertCircle className="w-5 h-5" />
                                            Missing Skills ({result.missing_skills.length})
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {result.missing_skills.map((skill) => (
                                                <span
                                                    key={skill}
                                                    className="px-3 py-1 rounded-full bg-red-500/20 text-red-300 text-sm font-medium"
                                                >
                                                    + {skill}
                                                </span>
                                            ))}
                                        </div>
                                        <p className="text-xs text-gray-400 mt-4">
                                            Add these skills to your Skills section in your resume
                                        </p>
                                    </GlowingCard>
                                )}

                                {/* Edit Suggestions */}
                                {result.edit_suggestions.length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                            <Edit3 className="w-5 h-5 text-violet-400" />
                                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">
                                                Editing Suggestions ({result.edit_suggestions.length})
                                            </span>
                                        </h3>

                                        <div className="space-y-4">
                                            {result.edit_suggestions.map(
                                                (suggestion, idx) => (
                                                    <GlowingCard
                                                        key={idx}
                                                        className="p-6 bg-black/40 backdrop-blur-2xl border border-white/10"
                                                    >
                                                        {/* Section & Action */}
                                                        <div className="flex items-center justify-between mb-4">
                                                            <div className="flex items-center gap-3">
                                                                <span className="px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 text-xs font-bold">
                                                                    {suggestion.section}
                                                                </span>
                                                                <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold">
                                                                    {suggestion.action}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Reason */}
                                                        <p className="text-sm text-yellow-300 mb-4 flex items-start gap-2">
                                                            <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                                            {suggestion.reason}
                                                        </p>

                                                        {/* Original Text */}
                                                        {suggestion.original_text && (
                                                            <div className="mb-4">
                                                                <label className="block text-xs font-semibold text-gray-400 mb-2">
                                                                    Current Text:
                                                                </label>
                                                                <div className="bg-red-500/5 border border-red-500/20 rounded px-3 py-2 text-sm text-gray-300 break-words">
                                                                    {suggestion.original_text.substring(
                                                                        0,
                                                                        200
                                                                    )}
                                                                    {suggestion.original_text.length >
                                                                        200 && "..."}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Suggested Text */}
                                                        <div className="mb-4">
                                                            <label className="block text-xs font-semibold text-gray-400 mb-2">
                                                                Suggested Improvement:
                                                            </label>
                                                            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded px-3 py-2 text-sm text-gray-200 break-words">
                                                                {suggestion.suggested_text}
                                                            </div>
                                                        </div>

                                                        {/* Copy Button */}
                                                        <button
                                                            onClick={() =>
                                                                copySuggestion(
                                                                    idx,
                                                                    suggestion.suggested_text
                                                                )
                                                            }
                                                            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded border border-white/10 text-sm text-gray-300 transition-colors"
                                                        >
                                                            {copiedSuggestion === idx ? (
                                                                <>
                                                                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                                                    Copied!
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Copy className="w-4 h-4" />
                                                                    Copy Suggestion
                                                                </>
                                                            )}
                                                        </button>
                                                    </GlowingCard>
                                                )
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Summary */}
                                <GlowingCard className="p-6 bg-blue-500/10 border border-blue-500/30">
                                    <p className="text-sm text-blue-300">
                                        <strong>How to use:</strong> Copy each suggestion and
                                        apply it directly to your resume. Update the specific
                                        sections mentioned (Skills, Experience, etc.) and then
                                        download your improved resume.
                                    </p>
                                </GlowingCard>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
