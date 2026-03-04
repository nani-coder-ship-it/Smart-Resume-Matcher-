"use client"

import * as React from "react"
import { motion } from "framer-motion"

export function BackgroundParticles() {
    const [particles, setParticles] = React.useState<{ id: number; top: string; left: string; size: number; delay: number; duration: number; opacityPulse: number[] }[]>([])

    React.useEffect(() => {
        // Generate particles only on the client side to avoid hydration mismatches
        const newParticles = Array.from({ length: 50 }).map((_, i) => ({
            id: i,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            size: Math.random() * 4 + 1,
            delay: Math.random() * 5,
            duration: Math.random() * 20 + 15, // Slower vertical drift
            opacityPulse: [Math.random() * 0.2, Math.random() * 0.8 + 0.2, Math.random() * 0.2] // Pulse effect
        }))
        setParticles(newParticles)
    }, [])

    return (
        <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden bg-transparent">
            {particles.map(p => (
                <motion.div
                    key={p.id}
                    className="absolute rounded-full bg-primary/40"
                    style={{
                        top: p.top,
                        left: p.left,
                        width: p.size,
                        height: p.size,
                        boxShadow: `0 0 ${p.size * 3}px rgba(139, 92, 246, 0.6)`
                    }}
                    animate={{
                        y: [0, -150],
                        x: [0, Math.random() * 30 - 15],
                        opacity: p.opacityPulse
                    }}
                    transition={{
                        y: { duration: p.duration, repeat: Infinity, ease: "linear", delay: p.delay },
                        x: { duration: p.duration * 0.8, repeatType: "mirror", repeat: Infinity, ease: "easeInOut", delay: p.delay },
                        opacity: { duration: Math.random() * 3 + 2, repeatType: "mirror", repeat: Infinity, ease: "easeInOut", delay: p.delay }
                    }}
                />
            ))}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#030014_100%)] opacity-80" />
        </div>
    )
}
