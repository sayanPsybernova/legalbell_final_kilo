import React, { useState, useRef, useEffect } from 'react'

const INDIAN_CITIES = ["mumbai","delhi","bangalore","bengaluru","hyderabad","chennai","kolkata","pune","ahmedabad","jaipur"]

export default function LandingChat({ onSearchComplete }) {
  const [step, setStep] = useState(0)
  const [messages, setMessages] = useState([{ role:'ai', text: "Hello! Online or Offline consultation?" }])
  const [input, setInput] = useState('')
  const endRef = useRef()

  useEffect(()=> endRef.current?.scrollIntoView({behavior:'smooth'}), [messages])

  const handleSend = () => {
    if (!input.trim()) return
    const txt = input.trim()
    setMessages(m => [...m, { role:'user', text: txt }])
    setInput('')
    setTimeout(()=> {
      if (step === 0) {
        const onlineKw = ['online','virtual','remote','video','call']
        const offlineKw = ['offline','in-person','person','office','physical','face to face','face-to-face']
        const isOnline = onlineKw.some(k => txt.toLowerCase().includes(k))
        const isOffline = offlineKw.some(k => txt.toLowerCase().includes(k))
        
        if (!isOnline && !isOffline) {
          setMessages(m => [...m, { role:'ai', text: "I didn't understand that. Please choose between 'Online' or 'Offline' consultation." }])
          return
        }
        
        setMessages(m => [...m, { role:'ai', text: isOnline ? 'Great — which city are you in?' : 'Great — which city are you in?' }])
        setStep(1)
        return
      }
      if (step === 1) {
        const city = txt
        const found = INDIAN_CITIES.find(c=> city.toLowerCase().includes(c))
        if (!found) {
          setMessages(m => [...m, { role:'ai', text: `I don't have lawyers in "${city}" yet. Available cities: ${INDIAN_CITIES.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(', ')}. Please choose one of these.` }])
          return
        }
        setMessages(m => [...m, { role:'ai', text: 'Please briefly describe your legal issue (e.g. Divorce, Property dispute).' }])
        setStep(2)
        // store city as message index 2
        setMessages(m => { const copy = [...m]; copy[2] = { role:'user', text: city }; return copy; })
        return
      }
      if (step === 2) {
        // Check if input is too short or vague
        if (txt.length < 3) {
          setMessages(m => [...m, { role:'ai', text: "Please provide more details about your legal issue. For example: 'divorce case', 'property dispute', 'criminal matter', etc." }])
          return
        }
        
        setMessages(m => [...m, { role:'ai', text: "Analyzing your case with AI to find the best matching lawyers..." }])
        
        // Call the LLM analysis API
        const analyzeCase = async () => {
          try {
            const cityMsg = messages[2] && messages[2].text ? messages[2].text : 'Mumbai'
            const response = await fetch('/api/analyze-case', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                caseDescription: txt,
                city: cityMsg
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
              message += ` in ${cityMsg}. Showing you the best matches...`;
              
              setMessages(m => [...m, {
                role:'ai',
                text: message
              }]);
              
              // Call parent with the matching lawyers
              setTimeout(() => {
                onSearchComplete({
                  location: cityMsg,
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
                text: `Based on your case description, I've identified this as a **${data.analysis.caseType}** matter. However, I couldn't find any specialized lawyers in ${cityMsg}. Would you like to see all available lawyers in ${cityMsg} or try a different city?`
              }]);
            }
          } catch (error) {
            setMessages(m => [...m, {
              role:'ai',
              text: "I'm having trouble analyzing your case right now. Let me connect you with general lawyers in your area..."
            }]);
            
            // Fallback to original behavior
            setTimeout(() => {
              const cityMsg = messages[2] && messages[2].text ? messages[2].text : 'Mumbai'
              onSearchComplete({ location: cityMsg, type: 'General' });
            }, 1500);
          }
        };
        
        analyzeCase();
      }
    }, 700)
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
