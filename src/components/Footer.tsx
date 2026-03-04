import * as React from "react"
import { BrainCircuit, Twitter, Github, Linkedin } from "lucide-react"

export function Footer() {
    return (
        <footer className="w-full border-t border-white/5 bg-black/20 backdrop-blur-sm relative py-12">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="col-span-1 md:col-span-1">
                    <div className="flex items-center gap-2 mb-4">
                        <BrainCircuit className="w-6 h-6 text-primary" />
                        <span className="font-bold text-white">SmartResume</span>
                    </div>
                    <p className="text-sm text-gray-400 mb-6 max-w-xs">
                        AI-powered resume intelligence built for modern job seekers to land their dream roles.
                    </p>
                    <div className="flex items-center gap-4">
                        <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                            <Twitter className="w-5 h-5" />
                        </a>
                        <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                            <Github className="w-5 h-5" />
                        </a>
                        <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                            <Linkedin className="w-5 h-5" />
                        </a>
                    </div>
                </div>

                <div>
                    <h3 className="font-medium text-white mb-4">Product</h3>
                    <ul className="space-y-3">
                        {['Features', 'Integrations', 'Pricing', 'Changelog'].map(item => (
                            <li key={item}><a href="#" className="text-sm text-gray-400 hover:text-primary transition-colors">{item}</a></li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h3 className="font-medium text-white mb-4">Resources</h3>
                    <ul className="space-y-3">
                        {['Resume Guide', 'ATS Secrets', 'Blog', 'Help Center'].map(item => (
                            <li key={item}><a href="#" className="text-sm text-gray-400 hover:text-primary transition-colors">{item}</a></li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h3 className="font-medium text-white mb-4">Company</h3>
                    <ul className="space-y-3">
                        {['About Us', 'Careers', 'Privacy Policy', 'Terms of Service'].map(item => (
                            <li key={item}><a href="#" className="text-sm text-gray-400 hover:text-primary transition-colors">{item}</a></li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between">
                <p className="text-sm text-gray-500">© 2026 Smart Resume Matcher. All rights reserved.</p>
                <p className="text-sm text-gray-500 mt-2 md:mt-0 flex items-center gap-1">
                    Designed with <span className="text-primary">✦</span> Anti-Gravity UI
                </p>
            </div>
        </footer>
    )
}
