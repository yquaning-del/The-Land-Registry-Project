'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HelpCircle, ChevronDown, Lightbulb, AlertTriangle, Info } from 'lucide-react'

type CalloutType = 'faq' | 'tip' | 'warning' | 'info'

interface CalloutBoxProps {
  type?: CalloutType
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}

const typeStyles = {
  faq: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    icon: HelpCircle,
    iconColor: 'text-amber-600',
    titleColor: 'text-amber-900',
  },
  tip: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    icon: Lightbulb,
    iconColor: 'text-emerald-600',
    titleColor: 'text-emerald-900',
  },
  warning: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: AlertTriangle,
    iconColor: 'text-red-600',
    titleColor: 'text-red-900',
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: Info,
    iconColor: 'text-blue-600',
    titleColor: 'text-blue-900',
  },
}

export function CalloutBox({ type = 'faq', title, children, defaultOpen = false }: CalloutBoxProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const styles = typeStyles[type]
  const Icon = styles.icon

  return (
    <div className={`rounded-lg border ${styles.border} ${styles.bg} my-6 overflow-hidden print:border-gray-300`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-3">
          <Icon className={`h-5 w-5 ${styles.iconColor}`} />
          <span className={`font-semibold ${styles.titleColor}`}>{title}</span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className={`h-5 w-5 ${styles.iconColor}`} />
        </motion.div>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-4 pb-4 pt-0 text-slate-700 leading-relaxed">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
