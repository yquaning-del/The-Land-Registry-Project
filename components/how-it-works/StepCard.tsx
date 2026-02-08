'use client'

import { ReactNode } from 'react'

interface StepCardProps {
  number: number
  title: string
  description: string
  icon: ReactNode
  visual: ReactNode
  reverse?: boolean
}

export function StepCard({ number, title, description, icon, visual, reverse = false }: StepCardProps) {
  return (
    <div className={`grid lg:grid-cols-2 gap-12 items-center mb-20 ${reverse ? 'lg:mb-32' : ''}`}>
      {/* Visual */}
      <div className={reverse ? 'order-2' : 'order-2 lg:order-1'}>
        {visual}
      </div>

      {/* Content */}
      <div className={reverse ? 'order-1' : 'order-1 lg:order-2'}>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
            <span className="text-2xl font-bold text-emerald-600">{number}</span>
          </div>
          <div className="p-2 bg-emerald-50 rounded-lg">
            {icon}
          </div>
        </div>
        <h3 className="text-3xl lg:text-4xl font-bold text-navy-900 mb-4">{title}</h3>
        <p className="text-xl text-gray-600 leading-relaxed">{description}</p>
      </div>
    </div>
  )
}
