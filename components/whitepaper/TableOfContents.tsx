'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'

interface TOCItem {
  id: string
  title: string
  level: number
}

const tocItems: TOCItem[] = [
  { id: 'executive-summary', title: 'Executive Summary', level: 1 },
  { id: 'indenture-to-title', title: 'Indenture-to-Title Pipeline', level: 1 },
  { id: 'phase-1-indenture', title: 'Phase 1: The Indenture', level: 2 },
  { id: 'phase-2-registration', title: 'Phase 2: The Registration', level: 2 },
  { id: 'phase-3-final-title', title: 'Phase 3: The Final Title', level: 2 },
  { id: 'problem-space', title: 'The Problem Space', level: 1 },
  { id: 'forgery', title: 'Forgery Epidemic', level: 2 },
  { id: 'double-selling', title: 'Double-Selling Fraud', level: 2 },
  { id: 'inaccessible-records', title: 'Inaccessible Records', level: 2 },
  { id: 'technical-architecture', title: 'Technical Architecture', level: 1 },
  { id: 'ai-heuristics', title: 'A: AI Heuristics', level: 2 },
  { id: 'spatial-intelligence', title: 'B: Spatial Intelligence', level: 2 },
  { id: 'blockchain-anchor', title: 'C: Blockchain Anchor', level: 2 },
  { id: 'governance-ethics', title: 'Governance & Ethics', level: 1 },
  { id: 'buyers-checklist', title: 'Safe Land Checklist', level: 1 },
]

export function TableOfContents() {
  const [activeSection, setActiveSection] = useState<string>('')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      { rootMargin: '-20% 0px -70% 0px' }
    )

    tocItems.forEach((item) => {
      const element = document.getElementById(item.id)
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <nav className="sticky top-24 w-64 hidden lg:block print:hidden">
      <div className="border-l-2 border-slate-200 pl-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">
          Table of Contents
        </h3>
        <ul className="space-y-1">
          {tocItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => scrollToSection(item.id)}
                className={`
                  w-full text-left py-1.5 text-sm transition-all duration-200
                  ${item.level === 2 ? 'pl-4' : 'pl-0'}
                  ${activeSection === item.id 
                    ? 'text-amber-600 font-semibold' 
                    : 'text-slate-600 hover:text-slate-900'
                  }
                `}
              >
                <span className="flex items-center gap-1">
                  {activeSection === item.id && (
                    <motion.span
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <ChevronRight className="h-3 w-3 text-amber-600" />
                    </motion.span>
                  )}
                  {item.title}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
