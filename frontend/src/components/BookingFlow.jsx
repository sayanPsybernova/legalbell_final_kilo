import React, { useState } from 'react'
import { Calendar, Clock, CheckCircle, User, MapPin, DollarSign } from 'lucide-react'

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
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Book Appointment</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Lawyer Info Card */}
        <div className="col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-24">
                <div className="flex flex-col items-center text-center">
                    <div className="w-24 h-24 rounded-full p-1 bg-blue-50 mb-4">
                        <img src={lawyer.image} className="w-full h-full rounded-full object-cover border-2 border-white shadow-sm" alt={lawyer.name} />
                    </div>
                    <h3 className="font-bold text-slate-900 text-lg">{lawyer.name}</h3>
                    <p className="text-blue-600 text-sm font-medium mb-1">{lawyer.specialization}</p>
                    <div className="flex items-center text-slate-500 text-xs mb-4">
                        <MapPin className="w-3 h-3 mr-1" /> {lawyer.location}
                    </div>
                    <div className="w-full border-t border-slate-100 pt-4 text-left space-y-2">
                         <div className="flex justify-between text-sm">
                             <span className="text-slate-500">Rate</span>
                             <span className="font-semibold text-slate-900">${lawyer.fee}/hr</span>
                         </div>
                         <div className="flex justify-between text-sm">
                             <span className="text-slate-500">Experience</span>
                             <span className="font-semibold text-slate-900">{lawyer.experience} years</span>
                         </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Booking Controls */}
        <div className="col-span-1 md:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-blue-600" /> Select Date & Duration
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Date</label>
                        <input 
                            type="date" 
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            onChange={e=>setDate(e.target.value)} 
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Duration</label>
                        <select 
                            value={duration} 
                            onChange={e=>setDuration(Number(e.target.value))}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none"
                        >
                            <option value={1}>1 Hour Session</option>
                            <option value={2}>2 Hours Session</option>
                        </select>
                    </div>
                </div>
            </div>

            {date && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
                        <Clock className="w-5 h-5 mr-2 text-blue-600" /> Available Slots
                    </h3>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                        {generateSlots().map(s=>(
                            <button 
                                key={s} 
                                onClick={()=>setSelectedSlot(s)} 
                                className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                                    selectedSlot===s 
                                    ? 'bg-blue-600 text-white shadow-md transform scale-105' 
                                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 hover:border-blue-200 border border-transparent'
                                }`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                    {generateSlots().length === 0 && (
                        <p className="text-slate-500 text-sm text-center py-4">No slots available for this date.</p>
                    )}
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                 <div className="flex justify-between items-center mb-6">
                     <div>
                         <p className="text-slate-500 text-sm">Total Amount</p>
                         <p className="text-2xl font-bold text-slate-900">${lawyer.fee * duration}</p>
                     </div>
                     {selectedSlot ? (
                         <div className="text-right">
                             <p className="text-slate-500 text-sm">Selected Slot</p>
                             <p className="font-medium text-blue-600">{date} at {selectedSlot}</p>
                         </div>
                     ) : (
                         <span className="text-sm text-slate-400 italic">Select a slot to proceed</span>
                     )}
                 </div>
                 
                 <button 
                    disabled={!selectedSlot} 
                    onClick={()=> onConfirm({ lawyerId: lawyer.id, lawyerName: lawyer.name, clientId: user.id, clientName: user.name, date, time:selectedSlot, duration, fee: lawyer.fee * duration })}
                    className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl active:scale-[0.99]"
                >
                    Confirm & Pay
                </button>
            </div>
        </div>
      </div>
    </div>
  )
}
