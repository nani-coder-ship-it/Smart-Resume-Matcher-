"use client"

import * as React from "react"
import { useEffect } from "react"
import { motion } from "framer-motion"
import { BrainCircuit, LogOut } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"

export function Navbar() {
    const router = useRouter()
    const pathname = usePathname()
    const { user, logout } = useAuth()

    // Handle hash-based navigation and smooth scrolling
    useEffect(() => {
        const hash = window.location.hash.slice(1)
        if (hash) {
            const element = document.getElementById(hash)
            if (element) {
                setTimeout(() => {
                    element.scrollIntoView({ behavior: 'smooth' })
                }, 100)
            }
        }
    }, [pathname])

    const handleNavClick = (id: string) => {
        // If on home page, scroll to section
        if (typeof window !== 'undefined' && window.location.pathname === '/') {
            const element = document.getElementById(id)
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' })
            }
        } else {
            // If not on home page, navigate to home and then scroll
            router.push(`/#${id}`)
        }
    }

    const handleLogout = async () => {
        await logout()
        router.push('/')
    }

    return (
        <motion.nav
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5"
        >
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <div 
                    className="flex items-center gap-2 group cursor-pointer"
                    onClick={() => router.push('/')}
                >
                    <div className="relative">
                        <div className="absolute inset-0 bg-primary/50 blur-lg rounded-full group-hover:bg-primary/80 transition-all duration-300" />
                        <BrainCircuit className="w-8 h-8 text-primary relative z-10" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-white">
                        Smart<span className="text-primary">Resume</span>
                    </span>
                </div>

                <div className="hidden md:flex items-center gap-8">
                    <button
                        onClick={() => handleNavClick('features')}
                        className="text-sm font-medium text-gray-300 hover:text-white transition-colors relative group"
                    >
                        Features
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
                    </button>
                    <button
                        onClick={() => handleNavClick('how-it-works')}
                        className="text-sm font-medium text-gray-300 hover:text-white transition-colors relative group"
                    >
                        How It Works
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
                    </button>
                    {user && (
                        <>
                            <Link href="/dashboard" className="text-sm font-medium text-gray-300 hover:text-white transition-colors relative group">
                                Dashboard
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
                            </Link>
                            <Link href="/dashboard/improve" className="text-sm font-medium text-gray-300 hover:text-white transition-colors relative group">
                                Improve Resume
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
                            </Link>
                        </>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    {user ? (
                        <>
                            <span className="hidden sm:inline text-sm text-gray-300">{user.email}</span>
                            <button 
                                onClick={handleLogout}
                                className="p-2 text-gray-300 hover:text-red-400 transition-colors"
                                title="Logout"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => router.push('/login')} className="hidden md:block text-sm font-medium text-white hover:text-primary transition-colors">
                                Login
                            </button>
                            <button onClick={() => router.push('/register')} className="relative group px-6 py-2.5 rounded-full overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-80 group-hover:opacity-100 transition-opacity" />
                                <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary blur-lg opacity-50 group-hover:opacity-100 transition-opacity" />
                                <span className="relative z-10 text-sm font-medium text-white shadow-sm">
                                    Get Started
                                </span>
                            </button>
                        </>
                    )}
                </div>
            </div>
        </motion.nav>
    )
}
