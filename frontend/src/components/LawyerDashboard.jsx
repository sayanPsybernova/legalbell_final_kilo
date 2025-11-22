import React from 'react'
export default function LawyerDashboard({ user, bookings, onJoinCall, onDraft }) {
  return (
    <div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:12}}>
        <div className="card"><div style={{fontSize:12,color:'#64748b'}}>BOOKINGS</div><div style={{fontWeight:700,fontSize:24}}>{bookings.length}</div></div>
        <div className="card"><div style={{fontSize:12,color:'#64748b'}}>REVENUE</div><div style={{fontWeight:700,fontSize:24}}>$0</div></div>
        <div className="card" style={{background:'#2563eb',color:'#fff',cursor:'pointer'}} onClick={onDraft}><div style={{fontSize:12}}>AI TOOLS</div><div style={{fontWeight:700,fontSize:20}}>Drafter</div></div>
      </div>
      <div className="card">
        <h3>Schedule</h3>
        {bookings.length===0 ? <p>No bookings.</p> : bookings.map(b=>(
          <div key={b.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0'}}>
            <div><div style={{fontWeight:700}}>{b.time}</div><div style={{fontSize:12}}>{b.clientName}</div></div>
            <button className="btn" onClick={onJoinCall}>Start</button>
          </div>
        ))}
      </div>
    </div>
  )
}
