"use client"

import * as React from "react"
import { motion, HTMLMotionProps } from "framer-motion"
import { cn } from "./Button"

interface GlowingCardProps extends HTMLMotionProps<"div"> {
    glowColor?: string;
}

export function GlowingCard({ className, children, glowColor = "rgba(139, 92, 246, 0.4)", ...props }: GlowingCardProps) {
    return (
        <motion.div
            whileHover={{
                y: -8,
                scale: 1.02,
                boxShadow: `0 30px 60px -15px ${glowColor.replace('0.4', '0.6')}`
            }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            className={cn(
                "relative rounded-2xl glass p-6 overflow-hidden border border-white/5 hover:border-primary/50 bg-gradient-to-br from-white/[0.05] to-transparent group transition-colors duration-300",
                className
            )}
            {...props}
        >
            {/* Subtle background glow that follows the gradient */}
            <div
                className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-20 group-hover:opacity-70 transition-opacity duration-500"
                style={{ background: glowColor.replace('0.4', '1') }}
            />

            <div className="relative z-10">
                {children}
            </div>
        </motion.div>
    )
}
