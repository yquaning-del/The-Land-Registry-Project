'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Square, CheckSquare, Shield, AlertTriangle } from 'lucide-react'

interface ChecklistItem {
  id: string
  title: string
  description: string
  critical: boolean
}

const checklistItems: ChecklistItem[] = [
  {
    id: 'indenture-scan',
    title: 'High-Res Scan of the Indenture',
    description: 'Upload a high-resolution scan so AI can analyze stamps, signatures, and tamper patterns.',
    critical: true,
  },
  {
    id: 'survey-plan',
    title: 'Certified Survey Plan (Coordinate Beacons)',
    description: 'Survey plan must include coordinate beacons so we can geofence and detect overlaps.',
    critical: true,
  },
  {
    id: 'biometric-id',
    title: 'Seller’s Biometric ID',
    description: 'Biometric identity must match the name on the deed to reduce impersonation risk.',
    critical: true,
  },
  {
    id: 'site-video',
    title: 'Timestamped, GPS-Tagged Site Video',
    description: 'Walkthrough video of the plot (“bush”) with GPS metadata for environmental evidence.',
    critical: true,
  },
  {
    id: 'tax-clearance',
    title: 'Current Tax Clearance Certificate',
    description: 'Latest clearance from local revenue authorities to confirm the property is not tax-encumbered.',
    critical: true,
  },
]

export function BuyerChecklist() {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set())

  const toggleItem = (id: string) => {
    setCheckedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const progress = (checkedItems.size / checklistItems.length) * 100
  const criticalItems = checklistItems.filter(item => item.critical)
  const criticalChecked = criticalItems.filter(item => checkedItems.has(item.id)).length
  const allCriticalChecked = criticalChecked === criticalItems.length

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="bg-gradient-to-r from-navy-900 to-slate-800 text-white p-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="h-8 w-8 text-amber-400" />
          <h3 className="text-2xl font-bold font-serif">Safe Land Checklist (Trust Score 90+)</h3>
        </div>
        <p className="text-slate-300 text-sm">
          Upload these five artifacts to reach a Trust Score of 90+. Items marked with ⚠️ are required.
        </p>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-2">
            <span>{checkedItems.size} of {checklistItems.length} completed</span>
            <span className="text-amber-400 font-semibold">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-400 to-emerald-400"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      {/* Checklist Items */}
      <div className="divide-y divide-slate-100">
        {checklistItems.map((item, index) => {
          const isChecked = checkedItems.has(item.id)
          
          return (
            <motion.button
              key={item.id}
              onClick={() => toggleItem(item.id)}
              className={`w-full text-left p-4 flex items-start gap-4 transition-colors ${
                isChecked ? 'bg-emerald-50' : 'hover:bg-slate-50'
              }`}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              {/* Checkbox */}
              <div className={`flex-shrink-0 mt-0.5 ${isChecked ? 'text-emerald-600' : 'text-slate-400'}`}>
                {isChecked ? (
                  <CheckSquare className="h-6 w-6" />
                ) : (
                  <Square className="h-6 w-6" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={`font-semibold ${isChecked ? 'text-emerald-700 line-through' : 'text-slate-900'}`}>
                    {item.title}
                  </span>
                  {item.critical && (
                    <span className="text-amber-500" title="Critical item">
                      <AlertTriangle className="h-4 w-4" />
                    </span>
                  )}
                </div>
                <p className={`text-sm mt-1 ${isChecked ? 'text-emerald-600' : 'text-slate-600'}`}>
                  {item.description}
                </p>
              </div>

              {/* Check indicator */}
              {isChecked && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex-shrink-0"
                >
                  <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                </motion.div>
              )}
            </motion.button>
          )
        })}
      </div>

      {/* Footer */}
      <div className={`p-4 ${allCriticalChecked ? 'bg-emerald-100' : 'bg-amber-50'}`}>
        {allCriticalChecked ? (
          <div className="flex items-center gap-3 text-emerald-700">
            <Shield className="h-5 w-5" />
            <span className="font-semibold">All critical items verified! You&apos;re ready to proceed safely.</span>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-amber-700">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-semibold">
              {criticalItems.length - criticalChecked} critical items remaining. Complete all before purchasing.
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
