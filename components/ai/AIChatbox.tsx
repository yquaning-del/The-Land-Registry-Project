'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot, User, Loader2, Sparkles, HelpCircle, FileText, CreditCard, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface QuickAction {
  icon: React.ComponentType<{ className?: string }>
  label: string
  prompt: string
}

const quickActions: QuickAction[] = [
  {
    icon: FileText,
    label: 'How to submit a claim?',
    prompt: 'How do I submit a land claim for verification?',
  },
  {
    icon: Shield,
    label: 'Verification process',
    prompt: 'How does the AI verification process work?',
  },
  {
    icon: CreditCard,
    label: 'Credits & pricing',
    prompt: 'How do credits work and what are the pricing plans?',
  },
  {
    icon: HelpCircle,
    label: 'Get support',
    prompt: 'I need help with an issue on my account.',
  },
]

const aiResponses: Record<string, string> = {
  'submit': `To submit a land claim for verification:

1. **Click "New Claim"** in the header or sidebar
2. **Upload your land title document** (PDF format)
3. **Enter the GPS coordinates** of your land
4. **Add property details** like size and address
5. **Submit for AI verification**

The AI will analyze your document and provide results within 2-5 minutes. Each verification costs 1 credit.`,

  'verification': `Our AI verification process uses multiple agents:

🔍 **Document Analysis Agent** - Extracts text and validates document authenticity
🛰️ **Satellite Verification Agent** - Cross-references with satellite imagery
📊 **Historical Records Agent** - Checks against existing land records
⚖️ **Legal Compliance Agent** - Ensures West African legal standards

Each agent provides a confidence score, and the combined result determines if your claim is verified.`,

  'credit': `**Credit System:**
- 1 credit = 1 land title verification
- New users get **5 free credits**
- Credits never expire

**Pricing Plans:**
- **Starter**: 20 credits/month - $49
- **Professional**: 100 credits/month - $199
- **Enterprise**: 500 credits/month - $799

You can purchase additional credits anytime from the Billing section.`,

  'support': `I'm here to help! Here are your support options:

📧 **Email**: support@landregistry.africa
📞 **Phone**: +234 XXX XXX XXXX
💬 **Live Chat**: Available 9 AM - 6 PM WAT

For urgent issues, please email us with your account email and a description of the problem.

Is there something specific I can help you with right now?`,

  'default': `I'm your Land Registry AI assistant! I can help you with:

• Submitting and tracking land claims
• Understanding the verification process
• Managing your credits and subscription
• Navigating the platform features

What would you like to know more about?`,
}

function getAIResponse(message: string): string {
  const lowerMessage = message.toLowerCase()
  
  if (lowerMessage.includes('submit') || lowerMessage.includes('claim') || lowerMessage.includes('upload')) {
    return aiResponses['submit']
  }
  if (lowerMessage.includes('verification') || lowerMessage.includes('verify') || lowerMessage.includes('ai') || lowerMessage.includes('process')) {
    return aiResponses['verification']
  }
  if (lowerMessage.includes('credit') || lowerMessage.includes('price') || lowerMessage.includes('pricing') || lowerMessage.includes('cost') || lowerMessage.includes('plan')) {
    return aiResponses['credit']
  }
  if (lowerMessage.includes('help') || lowerMessage.includes('support') || lowerMessage.includes('issue') || lowerMessage.includes('problem')) {
    return aiResponses['support']
  }
  
  return aiResponses['default']
}

export function AIChatbox() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm your Land Registry AI assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleSend = async (messageText?: string) => {
    const text = messageText || input.trim()
    if (!text) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    // Simulate AI thinking time
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000))

    const aiResponse: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: getAIResponse(text),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, aiResponse])
    setIsTyping(false)
  }

  const handleQuickAction = (prompt: string) => {
    handleSend(prompt)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          'fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110',
          isOpen && 'hidden'
        )}
      >
        <MessageCircle className="h-6 w-6" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold">
          1
        </span>
      </button>

      {/* Chat Window */}
      <div
        className={cn(
          'fixed bottom-6 right-6 z-50 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 transform',
          isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'
        )}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">AI Assistant</h3>
                <p className="text-xs text-white/80">Always here to help</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex gap-3',
                message.role === 'user' ? 'flex-row-reverse' : ''
              )}
            >
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                  message.role === 'user'
                    ? 'bg-emerald-100 text-emerald-600'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                )}
              >
                {message.role === 'user' ? (
                  <User className="h-4 w-4" />
                ) : (
                  <Bot className="h-4 w-4" />
                )}
              </div>
              <div
                className={cn(
                  'max-w-[75%] rounded-2xl px-4 py-3 text-sm',
                  message.role === 'user'
                    ? 'bg-emerald-500 text-white rounded-tr-none'
                    : 'bg-white text-gray-700 shadow-sm rounded-tl-none'
                )}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>
                <p
                  className={cn(
                    'text-[10px] mt-1',
                    message.role === 'user' ? 'text-white/70' : 'text-gray-400'
                  )}
                >
                  {isMounted
                    ? message.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : null}
                </p>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center text-white">
                <Bot className="h-4 w-4" />
              </div>
              <div className="bg-white rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        {messages.length <= 2 && (
          <div className="px-4 py-3 bg-white border-t">
            <p className="text-xs text-gray-500 mb-2">Quick questions:</p>
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickAction(action.prompt)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-gray-100 hover:bg-emerald-50 hover:text-emerald-600 rounded-full transition-colors"
                >
                  <action.icon className="h-3 w-3" />
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 bg-white border-t">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
            <Button
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
              size="icon"
              className="rounded-full bg-emerald-500 hover:bg-emerald-600"
            >
              {isTyping ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
