'use client'

import { useState } from 'react'
import { Navbar } from '@/components/Navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Mail, 
  Phone, 
  MapPin, 
  MessageSquare, 
  HelpCircle,
  FileText,
  Clock,
  CheckCircle,
  Send,
  ExternalLink
} from 'lucide-react'
import Link from 'next/link'

const faqs = [
  {
    question: 'How long does verification take?',
    answer: 'AI verification typically completes within 2-5 minutes. If human review is required, it may take up to 24-48 hours.',
  },
  {
    question: 'What documents do you accept?',
    answer: 'We accept Indentures, Certificates of Occupancy (C of O), Land Certificates, and other official land title documents. Files can be PDF, JPG, or PNG format.',
  },
  {
    question: 'How does blockchain verification work?',
    answer: 'Once your document is verified, we create an immutable record on the Polygon blockchain. This creates a permanent, tamper-proof proof of verification that anyone can verify.',
  },
  {
    question: 'What if my document fails verification?',
    answer: 'If verification fails, you\'ll receive a detailed report explaining the issues found. You can appeal the decision or submit additional documentation for human review.',
  },
  {
    question: 'How do credits work?',
    answer: 'Each verification costs 1 credit, and minting to blockchain costs 5 credits. Credits are included in your subscription plan and refresh monthly.',
  },
  {
    question: 'Is my data secure?',
    answer: 'Yes. We use bank-grade encryption, are GDPR and NDPR compliant, and your documents are stored securely. Only you control who can access your verification records.',
  },
]

export default function SupportPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setSubmitted(true)
    setLoading(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        {/* Hero */}
        <section className="bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">How Can We Help?</h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Our support team is here to assist you with any questions about land title verification.
            </p>
          </div>
        </section>

        <div className="container mx-auto px-4 py-12">
          {/* Contact Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 -mt-16">
            <Card className="shadow-lg">
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Email Support</h3>
                <p className="text-gray-600 text-sm mb-3">Get a response within 24 hours</p>
                <a href="mailto:support@landregistry.africa" className="text-emerald-600 hover:text-emerald-700 font-medium">
                  support@landregistry.africa
                </a>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Phone Support</h3>
                <p className="text-gray-600 text-sm mb-3">Mon-Fri, 9am-5pm WAT</p>
                <span className="text-blue-600 font-medium">+233 XXX XXX XXXX</span>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Office Location</h3>
                <p className="text-gray-600 text-sm mb-3">Visit us in person</p>
                <span className="text-purple-600 font-medium">Accra, Ghana</span>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Send Us a Message
                  </CardTitle>
                  <CardDescription>
                    Fill out the form below and we'll get back to you as soon as possible.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {submitted ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="h-8 w-8 text-emerald-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-navy-900 mb-2">Message Sent!</h3>
                      <p className="text-gray-600 mb-4">
                        Thank you for contacting us. We'll respond within 24 hours.
                      </p>
                      <Button onClick={() => setSubmitted(false)} variant="outline">
                        Send Another Message
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Name</Label>
                          <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Your name"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="your@email.com"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="subject">Subject</Label>
                        <Input
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleInputChange}
                          placeholder="How can we help?"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="message">Message</Label>
                        <Textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleInputChange}
                          placeholder="Describe your issue or question..."
                          rows={5}
                          required
                        />
                      </div>
                      <Button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-emerald-600 hover:bg-emerald-700"
                      >
                        {loading ? (
                          <>
                            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Send Message
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* FAQs */}
            <div>
              <h2 className="text-2xl font-bold text-navy-900 mb-6 flex items-center gap-2">
                <HelpCircle className="h-6 w-6" />
                Frequently Asked Questions
              </h2>
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <Card key={index}>
                    <CardContent className="pt-4">
                      <h3 className="font-semibold text-navy-900 mb-2">{faq.question}</h3>
                      <p className="text-gray-600 text-sm">{faq.answer}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Resources */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-navy-900 mb-6">Helpful Resources</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link href="/whitepaper">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-navy-900 mb-1">White Paper</h3>
                        <p className="text-gray-600 text-sm">Learn about our technology and verification process</p>
                      </div>
                      <ExternalLink className="h-4 w-4 text-gray-400 ml-auto" />
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/how-it-works">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Clock className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-navy-900 mb-1">How It Works</h3>
                        <p className="text-gray-600 text-sm">Step-by-step guide to verification</p>
                      </div>
                      <ExternalLink className="h-4 w-4 text-gray-400 ml-auto" />
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/pricing">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-navy-900 mb-1">Pricing Plans</h3>
                        <p className="text-gray-600 text-sm">View our subscription options</p>
                      </div>
                      <ExternalLink className="h-4 w-4 text-gray-400 ml-auto" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
