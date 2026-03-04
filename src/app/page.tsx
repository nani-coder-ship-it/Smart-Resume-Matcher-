"use client"

import * as React from "react"
import { motion, useScroll, useTransform, animate } from "framer-motion"
import { Upload, ArrowRight, FileText, CheckCircle, BarChart3, ShieldAlert, Zap, Search, Star, User, Brain, Target } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button, cn } from "@/components/ui/Button"
import { GlowingCard } from "@/components/ui/GlowingCard"

function Counter({ from, to, duration = 2, delay = 0 }: { from: number, to: number, duration?: number, delay?: number }) {
  const nodeRef = React.useRef<HTMLSpanElement>(null)

  React.useEffect(() => {
    const node = nodeRef.current
    if (!node) return

    const controls = animate(from, to, {
      duration,
      delay,
      ease: "easeOut",
      onUpdate: (value) => {
        node.textContent = Math.round(value).toString()
      },
    })

    return () => controls.stop()
  }, [from, to, duration, delay])

  return <span ref={nodeRef}>{from}</span>
}

export default function Home() {
  const router = useRouter()
  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])

  return (
    <div className="flex flex-col items-center w-full">

      {/* HERO SECTION */}
      <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 pt-24 md:pt-32 pb-40 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl flex flex-col items-center"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass border-primary/30 mb-8 md:mb-10 text-primary font-medium text-sm md:text-base shadow-[0_0_20px_rgba(139,92,246,0.2)]">
            <span className="relative flex h-2 w-2 md:h-2.5 md:w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 md:h-2.5 md:w-2.5 bg-primary"></span>
            </span>
            Smart Resume Analyzer v2.0 is Live
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-8xl font-extrabold tracking-tight mb-6 md:mb-8 leading-tight">
            Analyze. Match. <br className="hidden sm:block" />
            <span className="text-gradient">Get Hired.</span>
          </h1>

          <p className="text-lg sm:text-xl md:text-2xl text-gray-400 mb-10 md:mb-12 max-w-3xl leading-relaxed px-4">
            AI-powered resume intelligence built for modern job seekers. Upload your resume, uncover hidden gaps, and match with the top 1% of jobs in seconds.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full px-4 sm:px-0 justify-center">
            <Button size="lg" className="w-full sm:w-auto text-lg md:text-xl gap-3 px-8 md:px-10 py-6 md:py-7" onClick={() => router.push('/dashboard/upload')}>
              <Upload className="w-5 h-5 md:w-6 md:h-6" />
              Upload Resume
            </Button>
            <Button variant="secondary" size="lg" className="w-full sm:w-auto text-lg md:text-xl gap-3 px-8 md:px-10 py-6 md:py-7" onClick={() => { document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }) }}>
              Try Demo <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
            </Button>
          </div>
        </motion.div>

        {/* 3D Floating Resume Dashboard Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          className="w-full max-w-5xl mt-28 relative perspective-[1200px]"
        >
          {/* Main Dashboard Frame */}
          <motion.div
            animate={{ y: [-15, 15, -15], rotateX: [4, -1, 4], rotateY: [-2, 2, -2] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="w-full aspect-[16/9] rounded-2xl glass border border-white/10 shadow-glow-hover overflow-hidden flex flex-col relative bg-black/40 backdrop-blur-2xl"
          >
            {/* Top Bar Navigation UI */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/[0.02]">
              <div className="flex gap-2">
                <div className="w-3.5 h-3.5 rounded-full bg-red-500/80 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                <div className="w-3.5 h-3.5 rounded-full bg-yellow-500/80 shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
                <div className="w-3.5 h-3.5 rounded-full bg-green-500/80 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
              </div>
              <div className="flex gap-4">
                <div className="w-48 h-6 bg-white/5 rounded-full" />
                <div className="w-8 h-6 bg-white/5 rounded-full" />
              </div>
            </div>

            {/* Split Panel Dashboard Content */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden p-6 gap-6">

              {/* Left Column: Animated Resume Document */}
              <div className="flex-[2] relative rounded-xl bg-white/[0.03] border border-white/5 p-6 overflow-hidden flex flex-col gap-4 shadow-inner min-h-[300px]">
                {/* Scanning Laser Effect over the resume */}
                <motion.div
                  animate={{ top: ['0%', '100%', '0%'] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="absolute left-0 right-0 h-32 bg-gradient-to-b from-transparent via-primary/20 to-transparent z-20 pointer-events-none border-b border-primary/50 shadow-[0_5px_20px_rgba(139,92,246,0.3)]"
                />

                {/* Resume Header Skeleton */}
                <div className="flex items-center gap-4 md:gap-6 pb-6 border-b border-white/5">
                  <div className="w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-full bg-gradient-to-br from-white/10 to-transparent border border-white/10 flex items-center justify-center">
                    <User className="w-6 h-6 md:w-8 md:h-8 text-white/30" />
                  </div>
                  <div className="flex-1 space-y-2 md:space-y-3">
                    <div className="w-1/2 h-5 md:h-6 bg-white/10 rounded-md" />
                    <div className="w-1/3 h-3 md:h-4 bg-primary/20 rounded-md" />
                  </div>
                  <div className="bg-primary/20 border border-primary/30 text-primary px-3 py-1 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-bold flex flex-col items-center">
                    Match
                    <span className="text-lg md:text-xl">94%</span>
                  </div>
                </div>

                {/* Resume Body Skeleton */}
                <div className="flex-1 flex flex-col gap-6 pt-2">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center mb-2">
                      <div className="w-1/4 h-5 bg-white/10 rounded-md" />
                      <div className="w-16 h-4 bg-white/5 rounded-md" />
                    </div>
                    <div className="w-[90%] h-3 bg-white/5 rounded-full" />
                    <div className="w-[95%] h-3 bg-white/5 rounded-full" />
                    <div className="w-[85%] h-3 bg-white/5 rounded-full" />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center mb-2">
                      <div className="w-1/4 h-5 bg-white/10 rounded-md" />
                      <div className="w-16 h-4 bg-white/5 rounded-md" />
                    </div>
                    <div className="w-[88%] h-3 bg-white/5 rounded-full" />
                    <div className="w-[92%] h-3 bg-white/5 rounded-full" />
                  </div>
                </div>

                {/* Floating Skill Tags overlaid */}
                <div className="absolute bottom-6 right-6 flex flex-wrap gap-2 w-1/2 justify-end z-30">
                  {['React', 'TypeScript', 'Node.js', 'AWS'].map((skill, i) => (
                    <motion.div
                      key={skill}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: i * 0.4, duration: 0.5 }}
                      className="px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-semibold shadow-[0_0_10px_rgba(16,185,129,0.2)] flex items-center gap-1"
                    >
                      <CheckCircle className="w-3 h-3" /> {skill}
                    </motion.div>
                  ))}
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1, y: [0, -5, 0] }}
                    transition={{ delay: 2, duration: 2, y: { repeat: Infinity, duration: 2 } }}
                    className="px-3 py-1.5 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-semibold shadow-[0_0_10px_rgba(239,68,68,0.2)] flex items-center gap-1"
                  >
                    <ShieldAlert className="w-3 h-3" /> Missing: GraphQL
                  </motion.div>
                </div>
              </div>

              {/* Right Column: Analytics & Metrics */}
              <div className="flex-1 flex flex-col gap-6">

                {/* Score Circular Meter */}
                <div className="rounded-xl bg-white/[0.03] border border-white/5 p-6 flex flex-col items-center justify-center flex-1 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-secondary/10 opacity-50" />
                  <div className="relative z-10 w-32 h-32 rounded-full border-8 border-white/5 flex items-center justify-center mb-4">
                    <motion.svg className="absolute inset-0 w-full h-full -rotate-90">
                      <motion.circle
                        cx="50%" cy="50%" r="46%"
                        stroke="url(#gradient)" strokeWidth="8" fill="none"
                        initial={{ strokeDasharray: "289 289", strokeDashoffset: 289 }}
                        animate={{ strokeDashoffset: 17 }} // approx 94%
                        transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}
                        strokeLinecap="round"
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#8b5cf6" />
                          <stop offset="100%" stopColor="#0ea5e9" />
                        </linearGradient>
                      </defs>
                    </motion.svg>
                    <div className="text-center">
                      <div className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">
                        <Counter from={0} to={94} duration={2} delay={0.5} />%
                      </div>
                    </div>
                  </div>
                  <h3 className="text-gray-300 font-medium z-10">Overall ATS Score</h3>
                  <p className="text-xs text-emerald-400 mt-1 z-10 flex items-center gap-1"><ArrowRight className="w-3 h-3 -rotate-45" /> Top 5% of applicants</p>
                </div>

                {/* Metric Bars */}
                <div className="rounded-xl bg-white/[0.03] border border-white/5 p-6 flex flex-col justify-center flex-1 gap-4 relative">
                  <div>
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-gray-400">Keyword Optimization</span>
                      <span className="text-cyan-400 font-bold"><Counter from={0} to={88} duration={1.5} delay={0.8} />%</span>
                    </div>
                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "88%" }}
                        transition={{ duration: 1.5, delay: 0.8, ease: "easeOut" }}
                        className="h-full bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-gray-400">Impact Metrics</span>
                      <span className="text-violet-400 font-bold"><Counter from={0} to={100} duration={1.5} delay={1.0} />%</span>
                    </div>
                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 1.5, delay: 1.0, ease: "easeOut" }}
                        className="h-full bg-violet-400 rounded-full shadow-[0_0_10px_rgba(139,92,246,0.5)]"
                      />
                    </div>
                  </div>
                </div>

              </div>
            </div>
            {/* Global Glare Effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </motion.div>
        </motion.div>

        {/* TRUST ELEMENTS SECTION - Inserted right after the hero mockup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="w-full mt-32 pt-16 border-t border-white/5 flex flex-col items-center"
        >
          <p className="text-sm font-medium text-gray-500 mb-8 uppercase tracking-widest">Trusted by 5,000+ job seekers landing roles at</p>
          <div className="flex flex-wrap justify-center items-center gap-x-16 gap-y-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Mock Company Logos using text styling for simplicity but conveying the visual weight */}
            {['Google', 'Microsoft', 'Amazon', 'Meta', 'Netflix'].map((company, i) => (
              <div key={company} className="text-2xl md:text-3xl font-black tracking-tighter hover:text-white transition-colors cursor-default">
                {company}
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* SECTION DIVIDER BLUR */}
      <div className="w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent my-10 relative">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1/2 h-32 bg-primary/10 blur-[100px] pointer-events-none" />
      </div>

      {/* FEATURES SECTION */}
      <section id="features" className="w-full max-w-7xl mx-auto px-6 py-32 relative">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">Supercharged by <span className="text-gradient">AI</span></h2>
          <p className="text-gray-400 text-xl max-w-3xl mx-auto leading-relaxed">Get comprehensive insights into your professional profile with our proprietary AI analysis engine.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { icon: Search, title: "Resume Skill Extraction", desc: "Automatically identify and categorize over 10,000+ industry-specific skills hidden in your text." },
            { icon: BarChart3, title: "ATS Score Analyzer", desc: "Run your resume through checks that mirror exact enterprise Applicant Tracking Systems." },
            { icon: Zap, title: "Job Match Percentage", desc: "Paste a job URL and instantly see how well your profile aligns with the role requirements." },
            { icon: ShieldAlert, title: "Missing Skill Detection", desc: "Find out exactly what keywords you're missing to beat the competition for your dream role." },
            { icon: FileText, title: "AI Resume Feedback", desc: "Receive line-by-line constructive feedback to improve action verbs and impact metrics." },
            { icon: Star, title: "Premium Templates", desc: "Export your optimized content into beautifully designed, ATS-friendly PDF templates." }
          ].map((feature, i) => (
            <GlowingCard key={i} className="flex flex-col items-start gap-5 p-8">
              <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-3">
                <feature.icon className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed text-base">
                {feature.desc}
              </p>
            </GlowingCard>
          ))}
        </div>
      </section>

      {/* SECTION DIVIDER BLUR */}
      <div className="w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent my-10 relative">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1/2 h-32 bg-primary/10 blur-[100px] pointer-events-none" />
      </div>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="w-full max-w-7xl mx-auto px-6 py-32 relative">
        <div className="text-center mb-20 space-y-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold"
          >
            How it <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">works</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-xl text-gray-400 max-w-2xl mx-auto"
          >
            Three simple steps to optimize your resume and land your dream job faster.
          </motion.p>
        </div>

        <div className="relative">
          {/* Connecting Line that animates drawing down */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-white/10 -translate-x-1/2">
            <motion.div
              initial={{ height: 0 }}
              whileInView={{ height: "100%" }}
              viewport={{ once: true, margin: "0px 0px -20% 0px" }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="w-full bg-gradient-to-b from-primary via-secondary to-primary"
            />
          </div>

          <div className="space-y-24">
            {[
              {
                step: "01",
                title: "Upload Your Resume",
                description: "Simply drop your current resume (PDF or Word) into our secure platform. Our AI instantly extracts and structures your experience.",
                icon: <FileText className="w-10 h-10 text-violet-400" />
              },
              {
                step: "02",
                title: "AI Analysis & Matching",
                description: "We compare your profile against million of job descriptions. Our engine identifies missing keywords and suggests impactful achievements.",
                icon: <Brain className="w-10 h-10 text-cyan-400" />
              },
              {
                step: "03",
                title: "Optimize & Apply",
                description: "Receive a perfectly tailored resume designed to beat the ATS. Get a higher match score and land 3x more interviews.",
                icon: <Target className="w-10 h-10 text-emerald-400" />
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className={cn(
                  "flex flex-col md:flex-row items-center gap-8 md:gap-16",
                  index % 2 === 1 ? "md:flex-row-reverse" : ""
                )}
              >
                <div className="flex-1 text-center md:text-left">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                    className="inline-block text-6xl font-black text-white/5 mb-6 leading-none select-none"
                  >
                    {item.step}
                  </motion.div>
                  <h3 className="text-3xl font-bold mb-4">{item.title}</h3>
                  <p className="text-xl text-gray-400 leading-relaxed">{item.description}</p>
                </div>

                {/* Center Node on the line */}
                <div className="hidden md:flex relative z-10 w-16 h-16 rounded-full glass border-2 border-primary/50 items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.5)]">
                  <div className="w-4 h-4 rounded-full bg-primary/80 animate-ping absolute" />
                  <div className="w-4 h-4 rounded-full bg-primary relative z-10" />
                </div>

                <div className="flex-1 w-full flex justify-center">
                  <GlowingCard className="w-full max-w-sm aspect-square flex items-center justify-center p-12">
                    {item.icon}
                  </GlowingCard>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="w-full max-w-7xl mx-auto px-6 py-24 md:py-32 flex flex-col items-center text-center relative z-10">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent pointer-events-none" />
        <h2 className="text-4xl md:text-5xl font-bold mb-8">Ready to land your dream job?</h2>
        <p className="text-xl text-gray-400 mb-10 max-w-2xl">
          Join thousands of job seekers who use our AI to optimize their resumes and beat the ATS.
        </p>
        <Button size="lg" className="text-xl px-12 py-8 rounded-full shadow-[0_0_30px_rgba(139,92,246,0.3)]" onClick={() => router.push('/register')}>
          Start Your Free Analysis
        </Button>
      </section>

    </div >
  )
}
