"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("username", email);
            formData.append("password", password);

            const response = await api.post("/auth/login", formData, {
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
            });

            await login(response.data.access_token);
            router.push("/dashboard");
        } catch (err: any) {
            setError(err.response?.data?.detail || "Login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col flex-1 items-center justify-center p-6 w-full">
            <div className="w-full max-w-md p-8 rounded-2xl glass border border-white/10 shadow-glow relative overflow-hidden bg-black/40 backdrop-blur-2xl">
                <h2 className="text-3xl font-bold mb-6 text-center text-white">Welcome Back</h2>

                {error && (
                    <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
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
                        />
                    </div>

                    <Button type="submit" disabled={loading} className="w-full py-4 mt-2">
                        {loading ? "Signing in..." : "Sign In"}
                    </Button>
                </form>

                <p className="mt-6 text-center text-gray-400">
                    Don't have an account?{" "}
                    <Link href="/register" className="text-primary hover:text-primary-light transition-colors">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
}
