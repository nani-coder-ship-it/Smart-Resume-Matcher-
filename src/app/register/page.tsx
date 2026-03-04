"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { Button } from "@/components/ui/Button";

export default function RegisterPage() {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await api.post("/auth/register", {
                email,
                password,
                full_name: fullName,
            });

            // Redirect to login after successful registration
            router.push("/login");
        } catch (err: any) {
            setError(err.response?.data?.detail || "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col flex-1 items-center justify-center p-6 w-full">
            <div className="w-full max-w-md p-8 rounded-2xl glass border border-white/10 shadow-glow relative overflow-hidden bg-black/40 backdrop-blur-2xl">
                <h2 className="text-3xl font-bold mb-6 text-center text-white">Create Account</h2>

                {error && (
                    <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                            placeholder="John Doe"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                            placeholder="you@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                            placeholder="••••••••"
                            minLength={8}
                        />
                    </div>

                    <Button type="submit" disabled={loading} className="w-full py-4 mt-2">
                        {loading ? "Creating account..." : "Sign Up"}
                    </Button>
                </form>

                <p className="mt-6 text-center text-gray-400">
                    Already have an account?{" "}
                    <Link href="/login" className="text-primary hover:text-primary-light transition-colors">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
