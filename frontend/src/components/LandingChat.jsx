import React, { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Sparkles, Shield, Clock, Users, CheckCircle, ArrowRight, Star, Scale, Gavel } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function LandingChat({ onSearchComplete }) {
  const [messages, setMessages] = useState([{ role:'ai', text: "Hello! I'm here to help you find the right lawyer. Would you prefer online or offline consultation?" }])
  const [input, setInput] = useState('')
  const [conversationState, setConversationState] = useState({
    consultationType: null,
    city: null,
    caseDescription: null,
    awaitingClarification: false
  })
  const [showChat, setShowChat] = useState(false)
  const endRef = useRef()

  useEffect(()=> endRef.current?.scrollIntoView({behavior:'smooth'}), [messages])

  const handleSend = () => {
    if (!input.trim()) return
    const txt = input.trim().toLowerCase()
    setMessages(m => [...m, { role:'user', text: input.trim() }])
    setInput('')
    
    setTimeout(() => {
      processUserInput(txt, input.trim())
    }, 700)
  }

  const processUserInput = (lowerText, originalText) => {
    const state = conversationState
    let response = ""
    let newState = { ...state }
    
    const onlineKw = ['online','virtual','remote','video','call']
    const offlineKw = ['offline','in-person','person','office','physical','face to face','face-to-face','ofline']
    const isOnline = onlineKw.some(k => lowerText.includes(k))
    const isOffline = offlineKw.some(k => lowerText.includes(k))

    const extractCity = (text, origText) => {
       if (state.consultationType && !state.city) {
          const cleanText = origText.replace(/[.,!?;:]/g, '').trim();
          if (cleanText.length > 2 && !onlineKw.includes(cleanText.toLowerCase()) && !offlineKw.includes(cleanText.toLowerCase())) {
             return cleanText.charAt(0).toUpperCase() + cleanText.slice(1);
          }
       }
       return null;
    }

    if (!newState.consultationType) {
      if (isOnline || isOffline) {
        newState.consultationType = isOnline ? 'online' : 'offline'
        response = `Perfect! ${isOnline ? 'Online' : 'Offline'} consultation it is. Which city are you in?`
      }
    } else if (!newState.city) {
        const potentialCity = originalText.replace(/[.,!?;:]/g, '').trim();
        if (potentialCity.length > 2) {
            newState.city = potentialCity.charAt(0).toUpperCase() + potentialCity.slice(1);
            response = `Great! ${newState.city} it is. Now, please briefly describe your legal issue (for example: divorce case, property dispute, criminal matter, etc.).`
        } else {
             response = "Could you please provide the name of your city?"
        }
    } else if (!newState.caseDescription) {
         if (originalText.length >= 3) {
            newState.caseDescription = originalText
            response = "Thank you for the details. I'm analyzing your case to find the best matching lawyers..."
            setTimeout(() => analyzeCase(newState), 1500)
          } else {
            response = "Could you provide a bit more detail about your legal issue? For example: 'divorce case', 'property dispute', 'criminal matter', etc."
          }
    } else {
        const changeIndicators = ['change', 'different', 'wrong', 'instead', 'rather', 'nono', 'no no', 'actually', 'switch']
        if (changeIndicators.some(indicator => lowerText.includes(indicator))) {
             response = "I understand you want to make a change. Let's start over. Would you prefer online or offline consultation?";
             newState = {
                consultationType: null,
                city: null,
                caseDescription: null,
                awaitingClarification: false
             };
        } else {
            response = "I have all your information. If you need to start over, just say 'change'."
        }
    }

    if (newState.consultationType && !state.consultationType && !newState.city) {
        const cleanText = originalText.toLowerCase();
        let remaining = cleanText;
        [...onlineKw, ...offlineKw].forEach(k => remaining = remaining.replace(k, ''));
        remaining = remaining.replace('consultation', '').replace(' in ', '').trim();
        
        if (remaining.length > 3) {
            newState.city = remaining.charAt(0).toUpperCase() + remaining.slice(1);
            response = `Perfect! ${newState.consultationType === 'online' ? 'Online' : 'Offline'} consultation in ${newState.city}. Now, please briefly describe your legal issue.`
        }
    }
    
    setConversationState(newState)
    setMessages(m => [...m, { role: 'ai', text: response }])
  }

  const getAIResponse = async (userMessage, currentState) => {
    try {
      const response = await fetch('/api/analyze-case', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseDescription: currentState.caseDescription || userMessage,
          city: currentState.city,
          context: `User is asking: "${userMessage}". Current state: consultationType=${currentState.consultationType}, city=${currentState.city}, caseDescription=${currentState.caseDescription}`,
          useGeminiForResponse: true
        })
      });
      const data = await response.json();
      return data.geminiResponse || data.analysis;
    } catch (error) {
      console.error("Gemini API Error:", error);
      return null;
    }
  }

  const analyzeCase = async (state) => {
    try {
      console.log("Analyzing case with state:", state);
      
      const response = await fetch('/api/analyze-case', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseDescription: state.caseDescription,
          city: state.city
        })
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      
      if (data.needsClarification) {
        setMessages(m => [...m, { role:'ai', text: data.message }]);
        if (data.clarificationQuestion) {
          setTimeout(() => {
            setMessages(m => [...m, { role:'ai', text: data.clarificationQuestion }]);
          }, 1000);
        }
        setConversationState(prev => ({ ...prev, awaitingClarification: 'case', caseDescription: null }));
        return;
      }
      
      const guidanceMessage = data.legalGuidance ?
        `📋 **Legal Analysis & Guidance**\n\n**Summary:** ${data.legalGuidance.summary}\n**Severity:** ${data.legalGuidance.severity}\n**Urgency:** ${data.legalGuidance.urgency}\n\n**Recommended Lawyer:** ${data.legalGuidance.recommendedLawyerType}\n\n**Immediate Steps:**\n${data.legalGuidance.immediateSteps.map((step, i) => `${i + 1}. ${step}`).join('\n')}\n\n**Documents Needed:**\n${data.legalGuidance.documentsNeeded.map((doc, i) => `${i + 1}. ${doc}`).join('\n')}\n\n**Legal Process:** ${data.legalGuidance.legalProcess}\n\n**Timeline:** ${data.legalGuidance.timeline}\n\n**Cost Estimate:** ${data.legalGuidance.costEstimate}\n\n**Success Probability:** ${data.legalGuidance.successProbability}\n\n**Risks:**\n${data.legalGuidance.risks.map((risk, i) => `${i + 1}. ${risk}`).join('\n')}\n\n**Additional Advice:** ${data.legalGuidance.additionalAdvice}` :
        data.analysis.description || data.analysis.caseType || "I've analyzed your case and found matching lawyers.";
      
      setMessages(m => [...m, { role:'ai', text: guidanceMessage }]);
      
      setTimeout(() => {
        onSearchComplete({
          location: state.city,
          type: data.analysis.caseType || data.analysis.specialization || 'General',
          lawyers: data.matchingLawyers || [],
          analysis: data.analysis,
          legalGuidance: data.legalGuidance,
          exactMatches: data.exactMatches,
          relatedMatches: data.relatedMatches,
          generalMatches: data.generalMatches,
          caseDescription: state.caseDescription
        });
      }, 2000);
    } catch (error) {
      console.error("Error analyzing case:", error);
      setMessages(m => [...m, { role:'ai', text: "I'm sorry, I encountered an error while analyzing your case. Please try again." }]);
    }
  }

  if (!showChat) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <div className="flex justify-center mb-8">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-blue-600 rounded-2xl blur-xl opacity-20 animate-pulse"></div>
                  <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 p-4 rounded-2xl shadow-2xl">
                    <Gavel className="w-12 h-12 text-white" />
                  </div>
                </motion.div>
              </div>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="text-5xl sm:text-6xl lg:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-900 mb-6 leading-tight"
              >
                Legal<span className="text-blue-600">Bell</span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="text-xl sm:text-2xl text-slate-600 max-w-3xl mx-auto mb-8 leading-relaxed"
              >
                Connect with expert lawyers instantly. AI-powered legal guidance and personalized lawyer matching at your fingertips.
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              >
                <button
                  onClick={() => setShowChat(true)}
                  className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex items-center gap-3 text-lg"
                >
                  <span>Find Your Lawyer</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </button>
                
                <div className="flex items-center gap-2 text-slate-500">
                  <Shield className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium">100% Confidential</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Bot className="w-6 h-6" />,
                title: "AI-Powered Analysis",
                description: "Get instant legal guidance with our advanced AI that analyzes your case and recommends the best approach.",
                color: "from-blue-500 to-cyan-500"
              },
              {
                icon: <Users className="w-6 h-6" />,
                title: "Expert Lawyers",
                description: "Connect with verified legal professionals specializing in your specific legal needs.",
                color: "from-indigo-500 to-purple-500"
              },
              {
                icon: <Clock className="w-6 h-6" />,
                title: "Instant Consultation",
                description: "Book appointments online or offline. Get legal help when you need it, where you need it.",
                color: "from-emerald-500 to-teal-500"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1, duration: 0.6 }}
                className="group relative"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity blur"></div>
                <div className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100">
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.color} text-white mb-6`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 pb-20"
        >
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-3xl p-8 border border-slate-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { number: "10K+", label: "Happy Clients" },
                { number: "500+", label: "Expert Lawyers" },
                { number: "98%", label: "Success Rate" },
                { number: "24/7", label: "Support Available" }
              ].map((stat, index) => (
                <div key={index}>
                  <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-2">
                    {stat.number}
                  </div>
                  <div className="text-sm text-slate-600 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Testimonials */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20"
        >
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">What Our Clients Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                role: "Business Owner",
                content: "LegalBell connected me with the perfect corporate lawyer. The AI analysis was incredibly accurate and saved me hours of research.",
                rating: 5
              },
              {
                name: "Michael Chen",
                role: "Individual Client",
                content: "Found an excellent family lawyer through LegalBell. The process was smooth and the consultation was scheduled within minutes.",
                rating: 5
              },
              {
                name: "Emily Rodriguez",
                role: "Startup Founder",
                content: "The AI guidance helped me understand my legal needs before even talking to a lawyer. Highly recommend this platform!",
                rating: 5
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3 + index * 0.1, duration: 0.6 }}
                className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-600 mb-4 italic">"{testimonial.content}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">{testimonial.name}</div>
                    <div className="text-sm text-slate-500">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20"
        >
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-12 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black opacity-10"></div>
            <div className="relative z-10">
              <h2 className="text-4xl font-bold mb-4">Ready to Get Legal Help?</h2>
              <p className="text-xl mb-8 opacity-90">Start your journey with AI-powered legal guidance today</p>
              <button
                onClick={() => setShowChat(true)}
                className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex items-center gap-3 mx-auto text-lg"
              >
                <Scale className="w-5 h-5" />
                <span>Start Free Consultation</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] max-w-4xl mx-auto relative">
        {/* Chat Header */}
        <div className="px-6 py-4 flex items-center justify-between bg-white/80 backdrop-blur-md border-b border-slate-200 rounded-t-2xl shadow-sm z-10 shrink-0">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                    <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-slate-900">Legal Assistant</h2>
                    <p className="text-xs text-slate-500">AI-powered legal guidance</p>
                </div>
            </div>
            <button
              onClick={() => setShowChat(false)}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <ArrowRight className="w-5 h-5 rotate-180" />
            </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-8 space-y-6 scroll-smooth bg-gradient-to-b from-white to-slate-50">
            {messages.map((m, i) => (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    key={i}
                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} items-start gap-4 group`}
                >
                    {m.role === 'ai' && (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shrink-0 mt-1 text-white">
                            <Bot className="w-6 h-6" />
                        </div>
                    )}
                    
                    <div
                        className={`max-w-[85%] sm:max-w-[75%] text-[15px] leading-relaxed ${
                            m.role === 'user'
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-3 rounded-[2rem] rounded-tr-none font-medium shadow-lg'
                            : 'text-slate-800 px-0 py-1 font-normal'
                        }`}
                    >
                        {m.text}
                    </div>
                </motion.div>
            ))}
            <div ref={endRef} className="h-24"></div> {/* Spacer for floating input */}
        </div>

        {/* Input Area - Floating Pill */}
        <div className="absolute bottom-6 left-4 right-4 flex justify-center">
            <div className="w-full max-w-3xl bg-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-200/60 p-2 flex items-center gap-2 focus-within:shadow-[0_8px_30px_rgb(59,130,246,0.15)] focus-within:border-blue-200 transition-all duration-300">
                <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                    placeholder="Describe your legal issue..."
                    className="flex-1 pl-6 pr-4 py-3 bg-transparent border-none text-slate-800 placeholder:text-slate-400 focus:outline-none text-[15px]"
                />
                <button
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md active:scale-95 shrink-0"
                >
                    <Send className="w-4 h-4" />
                </button>
            </div>
        </div>
    </div>
  )
}
