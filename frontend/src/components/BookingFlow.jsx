import React, { useState } from 'react'

export default function BookingFlow({ lawyer, user, existingBookings, onConfirm }) {
  const [date, setDate] = useState('')
  const [duration, setDuration] = useState(1)
  const [selectedSlot, setSelectedSlot] = useState(null)

  const generateSlots = () => {
    const slots = []
    let start = 9*60
    const end = 17*60
    while (start + duration*60 <= end) {
      const h = Math.floor(start/60)
      const m = start%60
      const t = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`
      const taken = existingBookings.some(b=> b.lawyerId === lawyer.id && b.date === date && b.time === t)
      if (!taken) slots.push(t)
      start += duration*60 + 10
    }
    return slots
  }

  return (
    <div className="card" style={{maxWidth:720,margin:'0 auto'}}>
      <h2>Book Appointment</h2>
      <div style={{display:'flex',gap:12,alignItems:'center',marginBottom:12}}>
        <img src={lawyer.image} style={{width:64,height:64,borderRadius:999}} />
        <div>
          <div style={{fontWeight:700}}>{lawyer.name}</div>
          <div style={{fontSize:12,color:'#64748b'}}>{lawyer.specialization} • {lawyer.location}</div>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:12}}>
        <input type="date" onChange={e=>setDate(e.target.value)} />
        <select value={duration} onChange={e=>setDuration(Number(e.target.value))}>
          <option value={1}>1 Hour</option>
          <option value={2}>2 Hours</option>
        </select>
      </div>

      {date && <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginBottom:12}}>
        {generateSlots().map(s=>(
          <button key={s} onClick={()=>setSelectedSlot(s)} className="btn" style={{background: selectedSlot===s?'#0f172a':'#fff', color: selectedSlot===s?'#fff':'#0f172a'}}>{s}</button>
        ))}
      </div>}

      <button disabled={!selectedSlot} className="btn" onClick={()=> onConfirm({ lawyerId: lawyer.id, lawyerName: lawyer.name, clientId: user.id, clientName: user.name, date, time:selectedSlot, duration, fee: lawyer.fee * duration })}>Confirm & Pay</button>
    </div>
  )
}
