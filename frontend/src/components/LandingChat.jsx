import React, { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Sparkles } from 'lucide-react'
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

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col h-full">
            {/* Chat Header */}
            <div className="px-6 py-4 bg-white border-b border-slate-100 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-full">
                        <Sparkles className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-slate-900">Legal Assistant</h2>
                        <p className="text-xs text-slate-500">Powered by Gemini AI</p>
                    </div>
                </div>
                <div className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded-full flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Online
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50/50 scroll-smooth">
                {messages.map((m, i) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        key={i} 
                        className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} items-start gap-3`}
                    >
                        {m.role === 'ai' && (
                            <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm shrink-0 mt-1">
                                <Bot className="w-5 h-5 text-blue-600" />
                            </div>
                        )}
                        
                        <div 
                            className={`max-w-[85%] sm:max-w-[75%] p-4 shadow-sm whitespace-pre-wrap leading-relaxed ${
                                m.role === 'user' 
                                ? 'bg-blue-600 text-white rounded-2xl rounded-tr-none' 
                                : 'bg-white text-slate-800 border border-slate-200 rounded-2xl rounded-tl-none'
                            }`}
                        >
                            {m.text}
                        </div>

                        {m.role === 'user' && (
                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shadow-sm shrink-0 mt-1">
                                <User className="w-5 h-5 text-slate-600" />
                            </div>
                        )}
                    </motion.div>
                ))}
                <div ref={endRef}></div>
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-100">
                <div className="relative flex items-center gap-2">
                    <input 
                        value={input} 
                        onChange={e => setInput(e.target.value)} 
                        onKeyDown={e => e.key === 'Enter' && handleSend()} 
                        placeholder="Type your message here..." 
                        className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                    <button 
                        onClick={handleSend}
                        disabled={!input.trim()}
                        className="absolute right-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
                <div className="text-center mt-2">
                    <p className="text-[10px] text-slate-400">AI can make mistakes. Please verify legal advice.</p>
                </div>
            </div>
        </div>
    </div>
  )
}
