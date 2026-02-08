'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { 
  X, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Scan,
  Shield,
  MapPin,
  Fingerprint,
  Calendar,
  Stamp,
  ArrowRight,
  RotateCcw
} from 'lucide-react'

interface VerificationDemoProps {
  isOpen: boolean
  onClose: () => void
}

interface VerificationCheck {
  id: string
  name: string
  icon: React.ComponentType<{ className?: string }>
  fakeResult: 'pass' | 'fail' | 'warning'
  realResult: 'pass' | 'fail' | 'warning'
  fakeReason: string
  realReason: string
}

const verificationChecks: VerificationCheck[] = [
  {
    id: 'stamp',
    name: 'Official Stamp',
    icon: Stamp,
    fakeResult: 'fail',
    realResult: 'pass',
    fakeReason: 'Stamp pattern does not match official records',
    realReason: 'Stamp verified against Lands Commission database',
  },
  {
    id: 'signature',
    name: 'Signature Analysis',
    icon: Fingerprint,
    fakeResult: 'fail',
    realResult: 'pass',
    fakeReason: 'Signature inconsistencies detected',
    realReason: 'Signature matches registered official',
  },
  {
    id: 'date',
    name: 'Document Date',
    icon: Calendar,
    fakeResult: 'warning',
    realResult: 'pass',
    fakeReason: 'Date format inconsistent with period',
    realReason: 'Date format and registration period verified',
  },
  {
    id: 'coordinates',
    name: 'GPS Coordinates',
    icon: MapPin,
    fakeResult: 'fail',
    realResult: 'pass',
    fakeReason: 'Coordinates overlap with existing title',
    realReason: 'Unique coordinates, no overlapping claims',
  },
  {
    id: 'registry',
    name: 'Registry Match',
    icon: FileText,
    fakeResult: 'fail',
    realResult: 'pass',
    fakeReason: 'Document not found in official registry',
    realReason: 'Document verified in Lands Commission registry',
  },
]

export function VerificationDemo({ isOpen, onClose }: VerificationDemoProps) {
  const [activeTab, setActiveTab] = useState<'fake' | 'real'>('fake')
  const [isScanning, setIsScanning] = useState(false)
  const [currentCheckIndex, setCurrentCheckIndex] = useState(-1)
  const [scanComplete, setScanComplete] = useState(false)

  const startScan = () => {
    setIsScanning(true)
    setCurrentCheckIndex(0)
    setScanComplete(false)
  }

  const resetDemo = () => {
    setIsScanning(false)
    setCurrentCheckIndex(-1)
    setScanComplete(false)
  }

  useEffect(() => {
    if (isScanning && currentCheckIndex >= 0 && currentCheckIndex < verificationChecks.length) {
      const timer = setTimeout(() => {
        setCurrentCheckIndex(prev => prev + 1)
      }, 800)
      return () => clearTimeout(timer)
    } else if (currentCheckIndex >= verificationChecks.length) {
      setIsScanning(false)
      setScanComplete(true)
    }
  }, [isScanning, currentCheckIndex])

  useEffect(() => {
    if (!isOpen) {
      resetDemo()
    }
  }, [isOpen])

  const getResultIcon = (result: 'pass' | 'fail' | 'warning') => {
    switch (result) {
      case 'pass':
        return <CheckCircle className="h-5 w-5 text-emerald-500" />
      case 'fail':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
    }
  }

  const getResultBg = (result: 'pass' | 'fail' | 'warning') => {
    switch (result) {
      case 'pass':
        return 'bg-emerald-50 border-emerald-200'
      case 'fail':
        return 'bg-red-50 border-red-200'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200'
    }
  }

  const getFakeScore = () => {
    const passed = verificationChecks.filter(c => c.fakeResult === 'pass').length
    return Math.round((passed / verificationChecks.length) * 100)
  }

  const getRealScore = () => {
    const passed = verificationChecks.filter(c => c.realResult === 'pass').length
    return Math.round((passed / verificationChecks.length) * 100)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-navy-900 to-navy-800 text-white p-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Scan className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">AI Verification Demo</h2>
                <p className="text-gray-300">See how our AI detects fake vs real documents</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-gray-200 flex-shrink-0">
          <button
            onClick={() => { setActiveTab('fake'); resetDemo(); }}
            className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
              activeTab === 'fake' 
                ? 'bg-red-50 text-red-700 border-b-2 border-red-500' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <XCircle className="h-5 w-5" />
              <span>Fake Document</span>
            </div>
          </button>
          <button
            onClick={() => { setActiveTab('real'); resetDemo(); }}
            className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
              activeTab === 'real' 
                ? 'bg-emerald-50 text-emerald-700 border-b-2 border-emerald-500' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="h-5 w-5" />
              <span>Real Document</span>
            </div>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 min-h-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Document Preview */}
            <div>
              <h3 className="text-lg font-semibold text-navy-900 mb-4">Document Preview</h3>
              <div className={`relative rounded-xl border-2 p-6 ${
                activeTab === 'fake' ? 'border-red-200 bg-red-50/50' : 'border-emerald-200 bg-emerald-50/50'
              }`}>
                {/* Mock Document */}
                <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="h-6 w-6 text-navy-900" />
                      <span className="font-bold text-navy-900">LAND TITLE CERTIFICATE</span>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      activeTab === 'fake' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {activeTab === 'fake' ? 'SAMPLE FAKE' : 'SAMPLE REAL'}
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Parcel ID:</span>
                      <span className="font-medium">GA/2024/0001234</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Owner:</span>
                      <span className="font-medium">Kwame Mensah</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Location:</span>
                      <span className="font-medium">East Legon, Accra</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Coordinates:</span>
                      <span className="font-medium">5.6037° N, 0.1870° W</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Date Issued:</span>
                      <span className="font-medium">15 January 2024</span>
                    </div>
                  </div>

                  {/* Mock Stamp Area */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className={`w-16 h-16 rounded-full border-2 flex items-center justify-center ${
                      activeTab === 'fake' ? 'border-red-300 bg-red-50' : 'border-emerald-300 bg-emerald-50'
                    }`}>
                      <Stamp className={`h-8 w-8 ${activeTab === 'fake' ? 'text-red-400' : 'text-emerald-500'}`} />
                    </div>
                    <div className="text-right">
                      <div className={`h-8 w-24 rounded ${activeTab === 'fake' ? 'bg-red-100' : 'bg-emerald-100'}`} />
                      <p className="text-xs text-gray-400 mt-1">Signature</p>
                    </div>
                  </div>
                </div>

                {/* Scanning Overlay */}
                {isScanning && (
                  <div className="absolute inset-0 bg-navy-900/80 rounded-xl flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                      <p className="font-medium">Scanning Document...</p>
                      <p className="text-sm text-gray-300">
                        Checking {verificationChecks[currentCheckIndex]?.name || 'Complete'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Verification Results */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-navy-900">AI Analysis Results</h3>
                {scanComplete && (
                  <button 
                    onClick={resetDemo}
                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset
                  </button>
                )}
              </div>

              {!isScanning && !scanComplete ? (
                <div className="text-center py-12">
                  <Scan className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 mb-6">
                    Click the button below to start the AI verification demo
                  </p>
                  <Button 
                    onClick={startScan}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Scan className="h-4 w-4 mr-2" />
                    Start AI Scan
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {verificationChecks.map((check, index) => {
                    const Icon = check.icon
                    const result = activeTab === 'fake' ? check.fakeResult : check.realResult
                    const reason = activeTab === 'fake' ? check.fakeReason : check.realReason
                    const isChecked = index < currentCheckIndex || scanComplete
                    const isChecking = index === currentCheckIndex && isScanning

                    return (
                      <div 
                        key={check.id}
                        className={`rounded-lg border p-4 transition-all duration-300 ${
                          isChecked 
                            ? getResultBg(result)
                            : isChecking
                              ? 'bg-blue-50 border-blue-200 animate-pulse'
                              : 'bg-gray-50 border-gray-200 opacity-50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            isChecked 
                              ? result === 'pass' ? 'bg-emerald-100' : result === 'fail' ? 'bg-red-100' : 'bg-yellow-100'
                              : 'bg-gray-100'
                          }`}>
                            <Icon className={`h-5 w-5 ${
                              isChecked 
                                ? result === 'pass' ? 'text-emerald-600' : result === 'fail' ? 'text-red-600' : 'text-yellow-600'
                                : 'text-gray-400'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-navy-900">{check.name}</span>
                              {isChecked && getResultIcon(result)}
                              {isChecking && (
                                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                              )}
                            </div>
                            {isChecked && (
                              <p className={`text-sm mt-1 ${
                                result === 'pass' ? 'text-emerald-600' : result === 'fail' ? 'text-red-600' : 'text-yellow-600'
                              }`}>
                                {reason}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}

                  {/* Final Score */}
                  {scanComplete && (
                    <div className={`mt-6 rounded-xl p-6 text-center ${
                      activeTab === 'fake' ? 'bg-red-100 border-2 border-red-300' : 'bg-emerald-100 border-2 border-emerald-300'
                    }`}>
                      <div className={`text-5xl font-bold mb-2 ${
                        activeTab === 'fake' ? 'text-red-600' : 'text-emerald-600'
                      }`}>
                        {activeTab === 'fake' ? getFakeScore() : getRealScore()}%
                      </div>
                      <p className={`font-semibold ${
                        activeTab === 'fake' ? 'text-red-700' : 'text-emerald-700'
                      }`}>
                        {activeTab === 'fake' ? 'VERIFICATION FAILED' : 'VERIFICATION PASSED'}
                      </p>
                      <p className={`text-sm mt-2 ${
                        activeTab === 'fake' ? 'text-red-600' : 'text-emerald-600'
                      }`}>
                        {activeTab === 'fake' 
                          ? 'This document shows signs of forgery and cannot be trusted.'
                          : 'This document is authentic and verified against official records.'
                        }
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 p-6 flex-shrink-0">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-600">
              This is a demonstration. Real verification uses advanced AI and blockchain technology.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose}>
                Close Demo
              </Button>
              <Link href="/dashboard">
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  Start Real Verification
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
