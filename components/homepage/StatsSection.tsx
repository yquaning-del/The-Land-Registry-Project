'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { Users, FileCheck, Brain, Clock } from 'lucide-react'

const STATS = [
  { icon: Users,     end: 1200, suffix: '+', label: 'Verified Users',       decimals: 0 },
  { icon: FileCheck, end: 50,   suffix: 'K+', label: 'Title Verifications', decimals: 0 },
  { icon: Brain,     end: 99.8, suffix: '%',  label: 'AI OCR Accuracy',     decimals: 1 },
  { icon: Clock,     end: 3,    suffix: ' min', label: 'Avg Verification',  decimals: 0, prefix: '<' },
]

function AnimatedNumber({ end, suffix, decimals, prefix = '' }: { end: number; suffix: string; decimals: number; prefix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  useEffect(() => {
    if (!inView) return
    const duration = 1600
    const start = performance.now()
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(parseFloat((eased * end).toFixed(decimals)))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [inView, end, decimals])

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}{decimals > 0 ? count.toFixed(decimals) : Math.floor(count)}{suffix}
    </span>
  )
}

export function StatsSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const inView = useInView(sectionRef, { once: true, margin: '-60px' })

  return (
    <section ref={sectionRef} className="relative py-14 overflow-hidden" style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1a2d 50%, #0a0f1e 100%)' }}>
      {/* Fine dot grid */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(16,185,129,0.35) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />
      {/* Top/bottom fade */}
      <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-navy-950 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-navy-950 to-transparent" />

      <div className="relative z-10 container mx-auto px-4">
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6"
          initial="hidden"
          animate={inView ? 'show' : 'hidden'}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
        >
          {STATS.map(({ icon: Icon, end, suffix, label, decimals, prefix }) => (
            <motion.div
              key={label}
              variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } } }}
              className="relative text-center px-4 py-6 rounded-2xl border border-white/10 backdrop-blur-sm overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.04)' }}
            >
              {/* Corner glow */}
              <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-emerald-500/10 blur-2xl" />
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 mb-3 mx-auto">
                <Icon className="h-5 w-5 text-emerald-400" />
              </div>
              <div className="text-3xl lg:text-4xl font-bold text-white mb-1">
                <AnimatedNumber end={end} suffix={suffix} decimals={decimals} prefix={prefix} />
              </div>
              <p className="text-sm text-gray-400">{label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
