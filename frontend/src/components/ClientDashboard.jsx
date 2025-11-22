import React from 'react'
export default function ClientDashboard({ user, bookings, onJoinCall, onSearch }) {
  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
        <h2>Client Dashboard</h2>
        <button className="btn" onClick={onSearch}>New Search</button>
      </div>
      {bookings.length===0 ? <div className="card">No active cases.</div> : bookings.map(b=>(
        <div key={b.id} className="card" style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
          <div>
            <div style={{fontWeight:700}}>{b.lawyerName}</div>
            <div style={{fontSize:12,color:'#64748b'}}>{b.date} @ {b.time}</div>
          </div>
          <button className="btn" onClick={onJoinCall}>Join Call</button>
        </div>
      ))}
    </div>
  )
}
