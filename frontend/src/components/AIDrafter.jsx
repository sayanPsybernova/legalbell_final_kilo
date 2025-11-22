import React from 'react'
export default function AIDrafter({ onBack }) {
  return (
    <div className="card" style={{maxWidth:720,margin:'0 auto'}}>
      <button onClick={onBack} className="btn" style={{background:'#fff', color:'#0f172a'}}>Back</button>
      <h2 style={{marginTop:12}}>AI Drafter Active</h2>
      <p>This is a placeholder for the AI drafting tool (templates, generate drafts, etc.).</p>
    </div>
  )
}
