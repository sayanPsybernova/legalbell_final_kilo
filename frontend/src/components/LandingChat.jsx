import React, { useState, useRef, useEffect } from 'react'

const INDIAN_CITIES = ["mumbai","delhi","bangalore","bengaluru","hyderabad","chennai","kolkata","pune","ahmedabad","jaipur"]

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
    
    // Check for complete information in one sentence (first priority)
    if (!state.consultationType || !state.city) {
      const onlineKw = ['online','virtual','remote','video','call']
      const offlineKw = ['offline','in-person','person','office','physical','face to face','face-to-face','ofline']
      const isOnline = onlineKw.some(k => lowerText.includes(k))
      const isOffline = offlineKw.some(k => lowerText.includes(k))
      
      // Check if user provided all info in one sentence
      if ((isOnline || isOffline) && !state.consultationType) {
        newState.consultationType = isOnline ? 'online' : 'offline'
        
        // Look for city in the same sentence
        const foundCity = INDIAN_CITIES.find(c => lowerText.includes(c))
        if (foundCity && !state.city) {
          newState.city = foundCity.charAt(0).toUpperCase() + foundCity.slice(1)
          response = `Perfect! ${isOnline ? 'Online' : 'Offline'} consultation it is in ${newState.city}. Now, please briefly describe your legal issue (for example: divorce case, property dispute, criminal matter, etc.).`
          
          // Check if case description is also in the same sentence
          const words = originalText.split(' ')
          const caseDescWords = words.filter(word => 
            word.length > 3 && 
            !onlineKw.some(k => word.toLowerCase().includes(k)) && 
            !offlineKw.some(k => word.toLowerCase().includes(k)) &&
            !INDIAN_CITIES.some(c => word.toLowerCase().includes(c)) &&
            !word.toLowerCase().includes('need') &&
            !word.toLowerCase().includes('from') &&
            !word.toLowerCase().includes('lawer') &&
            !word.toLowerCase().includes('lawyer') &&
            !word.toLowerCase().includes('lwyer')
          )
          
          if (caseDescWords.length > 0) {
            newState.caseDescription = caseDescWords.join(' ')
            response = `Perfect! I have all your information: ${isOnline ? 'online' : 'offline'} consultation in ${newState.city} for ${caseDescWords.join(' ')}. Analyzing your case...`
            setTimeout(() => analyzeCase(newState), 1500)
          }
        } else {
          response = `Perfect! ${isOnline ? 'Online' : 'Offline'} consultation it is. Which city are you in?`
        }
      }
    }
    
    // Check for change requests - more comprehensive detection
    const changeIndicators = ['change', 'different', 'wrong', 'instead', 'rather', 'nono', 'no no', 'actually', 'acrtually', 'wait', 'prefer', 'pereferd', 'can you', 'i want', 'switch', 'mode', 'for']
    const isChangeRequest = changeIndicators.some(indicator => lowerText.includes(indicator))
    
    // Check for consultation type change first (highest priority)
    const onlineKw = ['online','virtual','remote','video','call']
    const offlineKw = ['offline','in-person','person','office','physical','face to face','face-to-face','ofline'] // Added 'ofline' for typo
    const isOnline = onlineKw.some(k => lowerText.includes(k))
    const isOffline = offlineKw.some(k => lowerText.includes(k))
    
    // Check for combined change requests (both mode and city in one message)
    if (isChangeRequest) {
      let hasModeChange = false
      let hasCityChange = false
      let newMode = null
      let newCity = null
      
      // Check for mode change
      if (isOnline || isOffline) {
        hasModeChange = true
        newMode = isOnline ? 'online' : 'offline'
        newState.consultationType = newMode
      }
      
      // Check for city change - improved pattern matching
      const foundCity = INDIAN_CITIES.find(c => lowerText.includes(c))
      const cityIndicators = ['city', 'location', 'lawer', 'lawyer', 'from']
      const hasCityIndicator = cityIndicators.some(indicator => lowerText.includes(indicator))
      
      if (foundCity || hasCityIndicator) {
        hasCityChange = true
        if (foundCity) {
          newCity = foundCity.charAt(0).toUpperCase() + foundCity.slice(1)
          newState.city = newCity
        }
      }
      
      // Build response based on what changed
      if (hasModeChange && hasCityChange && newCity) {
        response = `Sure! I'll change your preferred mode to ${newMode} consultation and update your city to ${newCity}.`
      } else if (hasModeChange && hasCityChange) {
        response = `Sure! I'll change your preferred mode to ${newMode} consultation. Which city would you prefer instead?`
        newState.awaitingClarification = 'city'
      } else if (hasModeChange) {
        response = `Sure! I'll change your preferred mode to ${newMode} consultation.`
      } else if (hasCityChange && newCity) {
        response = `Sure! I've updated your city to ${newCity}.`
      } else if (hasCityChange) {
        response = "Sure! Which city would you prefer instead?"
        newState.awaitingClarification = 'city'
      }
      
      // Add follow-up based on what's still needed
      if (!newState.city && !hasCityChange) {
        response += " Which city are you in?"
      } else if (!newState.caseDescription && (!hasCityChange || newCity)) {
        response += " Now, please describe your legal issue."
      } else if (!newState.caseDescription && hasCityChange && !newCity) {
        response += " After you choose a city, please describe your legal issue."
      } else if (newState.consultationType && newState.city && !newState.caseDescription) {
        response += " Please describe your legal issue."
      } else if (newState.consultationType && newState.city && newState.caseDescription) {
        response += " I have all your information. Would you like me to find lawyers for you now?"
      }
    }
    
    // Check for consultation type
    if (!newState.consultationType && !response) {
      const onlineKw = ['online','virtual','remote','video','call']
      const offlineKw = ['offline','in-person','person','office','physical','face to face','face-to-face']
      const isOnline = onlineKw.some(k => lowerText.includes(k))
      const isOffline = offlineKw.some(k => lowerText.includes(k))
      
      if (isOnline || isOffline) {
        newState.consultationType = isOnline ? 'online' : 'offline'
        response = `Perfect! ${isOnline ? 'Online' : 'Offline'} consultation it is. Which city are you in?`
      }
    }
    
    // Check for city
    if (newState.consultationType && !newState.city && !response) {
      const found = INDIAN_CITIES.find(c => lowerText.includes(c))
      if (found) {
        newState.city = found.charAt(0).toUpperCase() + found.slice(1)
        response = `Great! ${newState.city} it is. Now, please briefly describe your legal issue (for example: divorce case, property dispute, criminal matter, etc.).`
      } else if (!state.awaitingClarification) {
        response = `I don't have lawyers in that city yet. I can help you in: ${INDIAN_CITIES.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(', ')}. Which one would you prefer?`
      }
    }
    
    // Handle clarification responses
    if (state.awaitingClarification === 'city' && !response) {
      const found = INDIAN_CITIES.find(c => lowerText.includes(c))
      if (found) {
        newState.city = found.charAt(0).toUpperCase() + found.slice(1)
        newState.awaitingClarification = false
        response = `Perfect! I've updated your city to ${newState.city}. Now, please describe your legal issue.`
      }
    }
    
    // Check for case description
    if (newState.consultationType && newState.city && !newState.caseDescription && !response) {
      if (originalText.length >= 3) {
        newState.caseDescription = originalText
        response = "Thank you for the details. I'm analyzing your case to find the best matching lawyers..."
        
        // Proceed with analysis
        setTimeout(() => analyzeCase(newState), 1500)
      } else {
        response = "Could you provide a bit more detail about your legal issue? For example: 'divorce case', 'property dispute', 'criminal matter', etc."
      }
    }
    
    // Handle clarification for case description
    if (state.awaitingClarification === 'case' && !response) {
      if (originalText.length >= 3) {
        newState.caseDescription = originalText
        newState.awaitingClarification = false
        response = "Thank you for the clarification. I'm analyzing your case to find the best matching lawyers..."
        
        setTimeout(() => analyzeCase(newState), 1500)
      } else {
        response = "I need a bit more information. Could you describe what kind of legal help you need?"
      }
    }
    
    // Default response if nothing matched
    if (!response) {
      if (!newState.consultationType) {
        response = "I'd be happy to help! Would you prefer online or offline consultation?"
      } else if (!newState.city) {
        response = "Which city are you in? I can help you in: " + INDIAN_CITIES.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(', ')
      } else if (!newState.caseDescription) {
        response = "Please describe your legal issue so I can find the right lawyer for you."
      } else {
        response = "I have all your information. Would you like me to find lawyers for you now, or is there anything you'd like to change?"
      }
    }
    
    setConversationState(newState)
    setMessages(m => [...m, { role: 'ai', text: response }])
  }

  // Use Gemini API for intelligent conversation understanding
  const getAIResponse = async (userMessage, currentState) => {
    try {
      const response = await fetch('/api/analyze-case', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          caseDescription: currentState.caseDescription || userMessage,
          city: currentState.city,
          context: `User is asking: "${userMessage}". Current state: consultationType=${currentState.consultationType}, city=${currentState.city}, caseDescription=${currentState.caseDescription}`,
          useGeminiForResponse: true // Flag to use Gemini for intelligent response
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
      
      // Direct API call to analyze case
      const response = await fetch('/api/analyze-case', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          caseDescription: state.caseDescription,
          city: state.city
        })
      });
      
      console.log("API response status:", response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("API response data:", data);
      
      // Handle clarification requests
      if (data.needsClarification) {
        setMessages(m => [...m, {
          role:'ai',
          text: data.message
        }]);
        
        if (data.clarificationQuestion) {
          setTimeout(() => {
            setMessages(m => [...m, {
              role:'ai',
              text: data.clarificationQuestion
            }]);
          }, 1000);
        }
        
        // Update conversation state to wait for clarification
        setConversationState(prev => ({
          ...prev,
          awaitingClarification: 'case',
          caseDescription: null // Reset case description to get better input
        }));
        return;
      }
      
      // If no clarification needed, proceed with analysis
      const guidanceMessage = data.legalGuidance ?
        `📋 **Legal Analysis & Guidance**\n\n**Summary:** ${data.legalGuidance.summary}\n**Severity:** ${data.legalGuidance.severity}\n**Urgency:** ${data.legalGuidance.urgency}\n\n**Recommended Lawyer:** ${data.legalGuidance.recommendedLawyerType}\n\n**Immediate Steps:**\n${data.legalGuidance.immediateSteps.map((step, i) => `${i + 1}. ${step}`).join('\n')}\n\n**Documents Needed:**\n${data.legalGuidance.documentsNeeded.map((doc, i) => `${i + 1}. ${doc}`).join('\n')}\n\n**Legal Process:** ${data.legalGuidance.legalProcess}\n\n**Timeline:** ${data.legalGuidance.timeline}\n\n**Cost Estimate:** ${data.legalGuidance.costEstimate}\n\n**Success Probability:** ${data.legalGuidance.successProbability}\n\n**Risks:**\n${data.legalGuidance.risks.map((risk, i) => `${i + 1}. ${risk}`).join('\n')}\n\n**Additional Advice:** ${data.legalGuidance.additionalAdvice}` :
        data.analysis.description || data.analysis.caseType || "I've analyzed your case and found matching lawyers.";
      
      setMessages(m => [...m, {
        role:'ai',
        text: guidanceMessage
      }]);
      
      setTimeout(() => {
        console.log("Calling onSearchComplete with:", {
          location: state.city,
          type: data.analysis.caseType || data.analysis.specialization || 'General',
          lawyers: data.matchingLawyers || [],
          analysis: data.analysis,
          exactMatches: data.exactMatches,
          relatedMatches: data.relatedMatches,
          generalMatches: data.generalMatches
        });
        
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
      setMessages(m => [...m, {
        role:'ai',
        text: "I'm sorry, I encountered an error while analyzing your case. Please try again."
      }]);
    }
  }

  return (
    <div className="card" style={{maxWidth:720,margin:'0 auto'}}>
      <div style={{padding:12,borderBottom:'1px solid #f1f5f9'}}><strong>LegalBell</strong></div>
      <div style={{height:320,overflowY:'auto',padding:12}}>
        {messages.map((m,i)=> (
          <div key={i} style={{display:'flex',justifyContent: m.role==='user'?'flex-end':'flex-start', marginBottom:8}}>
            <div style={{background: m.role==='user'?'#0f172a':'#fff', color: m.role==='user'?'#fff':'#0f172a', padding:10, borderRadius:12, maxWidth:'75%'}}>{m.text}</div>
          </div>
        ))}
        <div ref={endRef}></div>
      </div>
      <div style={{padding:12,borderTop:'1px solid #f1f5f9',display:'flex',gap:8}}>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleSend()} placeholder="Type here..." />
        <button className="btn" onClick={handleSend}>Send</button>
      </div>
    </div>
  )
}
