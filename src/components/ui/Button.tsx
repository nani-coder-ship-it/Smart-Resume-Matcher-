"use client"

import * as React from "react"
import { motion, HTMLMotionProps, AnimatePresence } from "framer-motion"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

interface ButtonProps extends HTMLMotionProps<"button"> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
    size?: 'sm' | 'md' | 'lg'
}

export function Button({
    className,
    variant = 'primary',
    size = 'md',
    children,
    ...props
}: ButtonProps) {
    const [ripples, setRipples] = React.useState<{ x: number; y: number; id: number }[]>([])

    const handleRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
        const button = e.currentTarget
        const rect = button.getBoundingClientRect()
        const size = Math.max(rect.width, rect.height)
        const x = e.clientX - rect.left - size / 2
        const y = e.clientY - rect.top - size / 2

        const newRipple = { x, y, id: Date.now() }
        setRipples(prev => [...prev, newRipple])

        // Cleanup ripple
        setTimeout(() => {
            setRipples(prev => prev.filter(r => r.id !== newRipple.id))
        }, 600)

        if (props.onClick) {
            props.onClick(e)
        }
    }

    const baseStyles = "relative inline-flex items-center justify-center font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:pointer-events-none overflow-hidden rounded-full group"

    const variants = {
        primary: "text-white shadow-glow hover:shadow-glow-hover",
        secondary: "bg-white/10 text-white hover:bg-white/20 border border-white/10",
        outline: "border border-primary/50 text-white hover:bg-primary/10",
        ghost: "text-gray-300 hover:text-white hover:bg-white/5",
    }

    const sizes = {
        sm: "h-9 px-4 text-xs",
        md: "h-11 px-8 text-sm",
        lg: "h-14 px-10 text-base",
    }

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRipple}
            className={cn(baseStyles, variants[variant], sizes[size], className)}
            {...props}
        >
            {variant === 'primary' && (
                <>
                    {/* Base gradient */}
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-cyan-500 opacity-90 transition-opacity" />
                    {/* Hover gradient shift */}
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-violet-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    {/* Outer glow */}
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-cyan-500 blur-md opacity-40 group-hover:opacity-80 transition-opacity duration-300" />

                    {/* Ripples */}
                    <AnimatePresence>
                        {ripples.map(ripple => (
                            <motion.span
                                key={ripple.id}
                                initial={{ scale: 0, opacity: 0.5 }}
                                animate={{ scale: 3, opacity: 0 }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                                className="absolute bg-white rounded-full pointer-events-none"
                                style={{
                                    left: ripple.x,
                                    top: ripple.y,
                                    width: Math.max(200, className?.includes('lg') ? 300 : 200),
                                    height: Math.max(200, className?.includes('lg') ? 300 : 200),
                                }}
                            />
                        ))}
                    </AnimatePresence>
                </>
            )}
            <span className="relative z-10 flex items-center gap-2 pointer-events-none">{children}</span>
        </motion.button>
    )
}
