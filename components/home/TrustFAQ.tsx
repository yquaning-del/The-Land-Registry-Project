'use client'

import { Brain, Lock, Satellite } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

export function TrustFAQ() {
  const items = [
    {
      id: 'real-owner',
      icon: <Brain className="h-4 w-4 text-emerald-600" />,
      title: 'How can I be sure the person selling to me is the real owner?',
      body: "Our AI compares the seller's biometric ID against the historical 'Chain of Custody' on the Indenture. We also flag if the signature on your deed doesn't match the known official registrar's signature from that year.",
    },
    {
      id: 'bush-double-sell',
      icon: <Satellite className="h-4 w-4 text-blue-600" />,
      title: "The land is currently 'bush.' How do I know it's not being sold to five other people?",
      body: "Once we verify your coordinates, we create a 'Digital Geofence.' If another indenture is uploaded for the same plot, our system blocks it instantly. We also use 10 years of satellite history to see if anyone else has cleared or fenced that land recently.",
    },
    {
      id: 'registry-blockchain',
      icon: <Lock className="h-4 w-4 text-purple-600" />,
      title: "What if the government registry doesn't recognize your blockchain?",
      body: "We don't replace the government; we provide the 'Due Diligence' evidence they lack. Our platform gives you a 'Verification Report' that your lawyer can use to speed up the official Titling process, proving you have a clean, audited claim.",
    },
  ]

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-sm font-semibold text-emerald-700">Trust & FAQ</div>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-navy-900">Diaspora Trust Answers</h2>
            <p className="mt-4 text-slate-600">
              Clear, evidence-based answers to the biggest questions buyers ask before wiring funds.
            </p>
          </div>

          <div className="mt-10 rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <Accordion type="single" collapsible className="w-full">
              {items.map((item) => (
                <AccordionItem key={item.id} value={item.id} className="px-6">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3 text-left">
                      <div className="h-8 w-8 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center">
                        {item.icon}
                      </div>
                      <div className="font-semibold text-navy-900">{item.title}</div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-600">
                    <div className="pt-2 pb-4">{item.body}</div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  )
}
