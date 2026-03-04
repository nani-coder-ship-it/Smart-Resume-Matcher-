"use client";

import React, { useState, useRef, useEffect } from "react";
import api from "@/lib/api";
import { UploadCloud, File, CheckCircle2, AlertCircle, Loader, Linkedin, Github } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GlowingCard } from "@/components/ui/GlowingCard";

interface ResumeDetail {
    id: number;
    filename: string;
    ats_score: number | null;
    status: string;
    parsed_data: {
        skills?: string[];
        [key: string]: any;
    } | null;
    created_at: string;
}

interface UploadResponse {
    resume_id: number;
    status: string;
}

export default function UploadPage() {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const [uploadedResumeId, setUploadedResumeId] = useState<number | null>(null);
    const [resumeDetail, setResumeDetail] = useState<ResumeDetail | null>(null);
    const [processing, setProcessing] = useState(false);
    const [resumeHistory, setResumeHistory] = useState<ResumeDetail[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Fetch resume details with polling
    const fetchResumeDetails = async (resumeId: number, retries = 0) => {
        try {
            console.log(`Fetching resume details for ID: ${resumeId} (attempt ${retries + 1})`);
            const response = await api.get(`/resume/${resumeId}`);
            console.log("Resume details fetched:", response.data);
            setResumeDetail(response.data);

            // Scroll to results
            setTimeout(() => {
                document.querySelector('[data-results-section]')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);

            if (response.data.status === "completed") {
                setProcessing(false);
                if (pollingIntervalRef.current) {
                    clearInterval(pollingIntervalRef.current);
                }
            } else if (response.data.status === "pending" || response.data.status === "processing") {
                // Continue polling if still processing
                if (retries < 30) {
                    setTimeout(() => fetchResumeDetails(resumeId, retries + 1), 1000);
                }
            } else if (response.data.status === "failed") {
                setProcessing(false);
                setError("Resume processing failed. Please try again.");
            }
        } catch (err: any) {
            console.error(`Error fetching resume details:`, err?.response?.data || err?.message || err);
            // Retry if it's a network error and we haven't exceeded retries
            if (retries < 30) {
                setTimeout(() => fetchResumeDetails(resumeId, retries + 1), 1000);
            }
        }
    };

    // Fetch resume history
    const fetchResumeHistory = async () => {
        setLoadingHistory(true);
        try {
            const response = await api.get("/resume/");
            console.log("Resume history fetched:", response.data);
            setResumeHistory(response.data);
        } catch (err: any) {
            console.error("Error fetching history:", err?.response?.data || err?.message || err);
        } finally {
            setLoadingHistory(false);
        }
    };

    // Fetch history on mount
    useEffect(() => {
        fetchResumeHistory();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
            setError("");
            setSuccess(false);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setLoading(true);
        setError("");
        setSuccess(false);
        setProcessing(true);

        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await api.post<UploadResponse>("/resume/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            setSuccess(true);
            setUploadedResumeId(response.data.resume_id);
            setFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }

            // Start polling for resume details
            fetchResumeDetails(response.data.resume_id);

            // Refresh history
            fetchResumeHistory();
        } catch (err: any) {
            setError(err.response?.data?.detail || "Failed to upload resume.");
            setProcessing(false);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header>
                <h1 className="text-3xl font-bold mb-2">Upload Resume</h1>
                <p className="text-gray-400">Upload your latest PDF or DOCX file to be analyzed by our AI engine.</p>
            </header>

            {error && (
                <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p>{error}</p>
                </div>
            )}

            {success && (
                <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <div>
                        <p className="font-semibold">Upload Successful!</p>
                        <p className="text-sm opacity-90">Processing your resume... This may take a moment.</p>
                    </div>
                </div>
            )}

            <div
                className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all ${
                    file ? "border-primary/50 bg-primary/5" : "border-white/10 hover:border-white/20 bg-white/5"
                }`}
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.docx"
                />

                {file ? (
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="w-16 h-16 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                            <File className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-lg font-medium text-white">{file.name}</p>
                            <p className="text-sm text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                        <p className="text-sm text-primary hover:underline cursor-pointer">Click to change file</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center space-y-4 cursor-pointer">
                        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-gray-400">
                            <UploadCloud className="w-10 h-10" />
                        </div>
                        <div>
                            <p className="text-xl font-medium text-white mb-2">Click to browse or drag and drop</p>
                            <p className="text-gray-400">Supported formats: PDF, DOCX (Max 5MB)</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex justify-end">
                <Button
                    onClick={handleUpload}
                    disabled={!file || loading}
                    className="px-8 py-6 text-lg"
                >
                    {loading ? "Uploading..." : "Analyze Resume"}
                </Button>
            </div>

            {/* Resume Details After Upload */}
            {resumeDetail && (
                <div className="space-y-6" data-results-section>
                    <h2 className="text-2xl font-bold">Analysis Results</h2>

                    {processing && (
                        <div className="flex items-center gap-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 p-4 rounded-xl">
                            <Loader className="w-5 h-5 animate-spin flex-shrink-0" />
                            <p>Processing your resume... Please wait.</p>
                        </div>
                    )}

                    {/* ATS Score */}
                    <GlowingCard className="p-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-medium text-gray-400 mb-2">ATS Score</h3>
                                <div className="text-5xl font-bold text-primary">
                                    {resumeDetail.ats_score !== null ? `${Math.round(resumeDetail.ats_score)}%` : "—"}
                                </div>
                            </div>
                            <div className="w-32 h-32 rounded-full bg-primary/20 flex items-center justify-center">
                                <div className="text-center">
                                    <p className="text-sm text-gray-400">Score</p>
                                    <p className="text-2xl font-bold text-primary">
                                        {resumeDetail.ats_score !== null ? Math.round(resumeDetail.ats_score) : 0}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </GlowingCard>

                    {/* Extracted Skills */}
                    {resumeDetail.parsed_data?.skills && (
                        <GlowingCard className="p-8">
                            <h3 className="text-lg font-bold mb-4">Extracted Skills</h3>
                            <div className="flex flex-wrap gap-3">
                                {resumeDetail.parsed_data.skills.map((skill: string, idx: number) => (
                                    <span
                                        key={idx}
                                        className="px-4 py-2 rounded-full bg-primary/20 text-primary border border-primary/30 text-sm font-medium"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </GlowingCard>
                    )}

                    {/* Resume Details */}
                    {resumeDetail.parsed_data && Object.keys(resumeDetail.parsed_data).length > 0 && (
                        <GlowingCard className="p-8">
                            <h3 className="text-lg font-bold mb-6">Resume Details</h3>
                            
                            {/* Social Media Links */}
                            {(resumeDetail.parsed_data?.linkedin?.trim() || resumeDetail.parsed_data?.github?.trim()) && (
                                <div className="mb-8 pb-8 border-b border-white/10">
                                    <p className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wide">📱 Connect with me</p>
                                    <div className="flex flex-wrap gap-4">
                                        {resumeDetail.parsed_data?.linkedin?.trim() && (
                                            <a
                                                href={resumeDetail.parsed_data.linkedin}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 px-5 py-3 rounded-lg bg-gradient-to-r from-blue-600/30 to-blue-600/10 text-blue-300 hover:from-blue-600/50 hover:to-blue-600/30 transition-all border border-blue-600/40 hover:border-blue-600/70 shadow-lg hover:shadow-blue-500/20"
                                                title="Visit LinkedIn Profile"
                                            >
                                                <Linkedin className="w-5 h-5" />
                                                <span className="font-medium text-sm">LinkedIn</span>
                                            </a>
                                        )}
                                        {resumeDetail.parsed_data?.github?.trim() && (
                                            <a
                                                href={resumeDetail.parsed_data.github}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 px-5 py-3 rounded-lg bg-gradient-to-r from-gray-600/30 to-gray-600/10 text-gray-300 hover:from-gray-600/50 hover:to-gray-600/30 transition-all border border-gray-600/40 hover:border-gray-600/70 shadow-lg hover:shadow-gray-500/20"
                                                title="Visit GitHub Profile"
                                            >
                                                <Github className="w-5 h-5" />
                                                <span className="font-medium text-sm">GitHub</span>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="space-y-3 text-sm text-gray-300">
                                {Object.entries(resumeDetail.parsed_data).map(([key, value]: [string, any]) => {
                                    if (key === "skills" || key === "linkedin" || key === "github" || !value) return null;
                                    return (
                                        <div key={key} className="flex justify-between">
                                            <span className="text-gray-400 capitalize">{key}:</span>
                                            <span className="text-white font-medium">
                                                {Array.isArray(value) ? value.join(", ") : String(value)}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </GlowingCard>
                    )}
                </div>
            )}

            {/* Resume Upload History */}
            {resumeHistory.length > 0 && (
                <div className="space-y-6 mt-12">
                    <h2 className="text-2xl font-bold">Resume History</h2>

                    {loadingHistory && (
                        <div className="flex items-center justify-center p-8">
                            <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                        </div>
                    )}

                    <div className="grid gap-4">
                        {resumeHistory.map((resume) => (
                            <GlowingCard 
                                key={resume.id} 
                                className="p-6 bg-white/5 cursor-pointer hover:bg-white/10 transition-all"
                                onClick={() => fetchResumeDetails(resume.id)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4 flex-1">
                                        <File className="w-6 h-6 text-primary" />
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-white hover:text-primary transition-colors">{resume.filename}</h4>
                                            <p className="text-sm text-gray-400">
                                                {new Date(resume.created_at).toLocaleDateString()} {new Date(resume.created_at).toLocaleTimeString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-3xl font-bold text-primary">
                                            {resume.ats_score !== null ? `${Math.round(resume.ats_score)}%` : "—"}
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1">
                                            <span className={`px-2 py-1 rounded-full ${
                                                resume.status === "completed" ? "bg-emerald-500/20 text-emerald-400" :
                                                resume.status === "pending" ? "bg-yellow-500/20 text-yellow-400" :
                                                "bg-red-500/20 text-red-400"
                                            }`}>
                                                {resume.status}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            </GlowingCard>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
