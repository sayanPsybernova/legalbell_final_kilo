import React, { useState, useRef, useEffect } from 'react'

// Removed hardcoded list to allow dynamic city entry
// const INDIAN_CITIES = ["mumbai","delhi", ...] 

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

    // Helper to detect if a word is likely a city (starts with capital in original text, not a keyword)
    const extractCity = (text, origText) => {
       // Simple heuristic: if the user provides a city name, it's likely a noun.
       // If we are in the "asking for city" state, almost any input that isn't a command is a city.
       if (state.consultationType && !state.city) {
          // Exclude common keywords
          const cleanText = origText.replace(/[.,!?;:]/g, '').trim();
          if (cleanText.length > 2 && !onlineKw.includes(cleanText.toLowerCase()) && !offlineKw.includes(cleanText.toLowerCase())) {
             return cleanText.charAt(0).toUpperCase() + cleanText.slice(1);
          }
       }
       // Check for common cities in the text even if not in specific state (for "online in Mumbai")
       // Since we don't have a list, we rely on the flow.
       return null;
    }

    // Check for consultation type change/setting
    if (!newState.consultationType) {
      if (isOnline || isOffline) {
        newState.consultationType = isOnline ? 'online' : 'offline'
        
        // Check if city is also provided in the same message (heuristic: any capitalized word or remaining text)
        // For simplicity in this "any city" version, we'll ask for city next unless explicitly clear.
        response = `Perfect! ${isOnline ? 'Online' : 'Offline'} consultation it is. Which city are you in?`
      }
    } else if (!newState.city) {
        // If we are expecting a city
        const potentialCity = originalText.replace(/[.,!?;:]/g, '').trim();
        if (potentialCity.length > 2) {
            newState.city = potentialCity.charAt(0).toUpperCase() + potentialCity.slice(1);
            response = `Great! ${newState.city} it is. Now, please briefly describe your legal issue (for example: divorce case, property dispute, criminal matter, etc.).`
        } else {
             response = "Could you please provide the name of your city?"
        }
    } else if (!newState.caseDescription) {
        // Expecting case description
         if (originalText.length >= 3) {
            newState.caseDescription = originalText
            response = "Thank you for the details. I'm analyzing your case to find the best matching lawyers..."
            setTimeout(() => analyzeCase(newState), 1500)
          } else {
            response = "Could you provide a bit more detail about your legal issue? For example: 'divorce case', 'property dispute', 'criminal matter', etc."
          }
    } else {
        // Already have everything, maybe user is chatting or changing something
        // Check for change requests
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

    // Handle the "all in one" case (e.g. "Online in Mumbai") - Simplified logic
    // If we just set consultation type but haven't returned, check if there's more text that could be a city
    if (newState.consultationType && !state.consultationType && !newState.city) {
        const cleanText = originalText.toLowerCase();
        // Remove online/offline keywords
        let remaining = cleanText;
        [...onlineKw, ...offlineKw].forEach(k => remaining = remaining.replace(k, ''));
        remaining = remaining.replace('consultation', '').replace(' in ', '').trim();
        
        if (remaining.length > 3) {
            // Assume the rest is the city
            newState.city = remaining.charAt(0).toUpperCase() + remaining.slice(1);
            response = `Perfect! ${newState.consultationType === 'online' ? 'Online' : 'Offline'} consultation in ${newState.city}. Now, please briefly describe your legal issue.`
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
