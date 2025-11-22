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
    
    // Check for change requests - more comprehensive detection
    const changeIndicators = ['change', 'different', 'wrong', 'instead', 'rather', 'nono', 'no no', 'actually', 'wait', 'prefer', 'pereferd', 'can you', 'i want']
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
      
      // Check for city change
      const foundCity = INDIAN_CITIES.find(c => lowerText.includes(c))
      if (foundCity || lowerText.includes('city') || lowerText.includes('location') || lowerText.includes('lawer') || lowerText.includes('lawyer') || lowerText.includes('from')) {
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

  const analyzeCase = async (state) => {
    try {
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
      
      const data = await response.json();
      
      if (data.totalMatches > 0) {
        const exactCount = data.exactMatches ? data.exactMatches.length : 0;
        const relatedCount = data.relatedMatches ? data.relatedMatches.length : 0;
        let message = `Based on your case description, I've identified this as a **${data.analysis.caseType}** matter`;
        
        if (data.analysis.subSpecialty && data.analysis.subSpecialty !== 'General Practice') {
          message += ` requiring expertise in **${data.analysis.subSpecialty}**`;
        }
        
        message += `. ${data.analysis.description}. `;
        
        if (exactCount > 0) {
          message += `I found ${exactCount} lawyer${exactCount > 1 ? 's' : ''} with exact sub-specialty matching`;
          if (relatedCount > 0) {
            message += ` and ${relatedCount} with related expertise`;
          }
        } else {
          message += `I found ${data.totalMatches} specialized lawyer${data.totalMatches > 1 ? 's' : ''}`;
        }
        message += ` in ${state.city}. Showing you the best matches...`;
        
        setMessages(m => [...m, {
          role:'ai',
          text: message
        }]);
        
        // Call parent with the matching lawyers
        setTimeout(() => {
          onSearchComplete({
            location: state.city,
            type: data.analysis.caseType,
            lawyers: data.matchingLawyers,
            analysis: data.analysis,
            exactMatches: data.exactMatches,
            relatedMatches: data.relatedMatches,
            generalMatches: data.generalMatches
          });
        }, 1500);
      } else {
        setMessages(m => [...m, {
          role:'ai',
          text: `Based on your case description, I've identified this as a **${data.analysis.caseType}** matter. However, I couldn't find any specialized lawyers in ${state.city}. Would you like to see all available lawyers in ${state.city} or try a different city?`
        }]);
      }
    } catch (error) {
      setMessages(m => [...m, {
        role:'ai',
        text: "I'm having trouble analyzing your case right now. Let me connect you with general lawyers in your area..."
      }]);
      
      // Fallback to original behavior
      setTimeout(() => {
        onSearchComplete({ location: state.city, type: 'General' });
      }, 1500);
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
