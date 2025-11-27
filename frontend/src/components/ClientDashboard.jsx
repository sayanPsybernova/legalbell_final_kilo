import React from 'react'
import { Plus, Video, Calendar, Clock, User, MapPin, DollarSign } from 'lucide-react'

export default function ClientDashboard({ user, bookings, onJoinCall, onSearch }) {
  // Filter bookings for the current client
  const clientBookings = bookings.filter(booking =>
    booking.clientId === user.id ||
    booking.clientEmail === user.email ||
    booking.clientName === user.name
  );
  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
            <h2 className="text-2xl font-bold text-slate-900">Client Dashboard</h2>
            <p className="text-slate-500">Manage your appointments and legal matters</p>
        </div>
        <button 
            onClick={onSearch}
            className="flex items-center bg-slate-900 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 hover:-translate-y-0.5"
        >
            <Plus className="w-4 h-4 mr-2" /> Find Lawyer
        </button>
      </div>

      {clientBookings.length===0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">No active bookings</h3>
              <p className="text-slate-500 mb-6">You haven't booked any consultations yet.</p>
              <button onClick={onSearch} className="text-blue-600 font-medium hover:underline">Find a lawyer now</button>
          </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {clientBookings.map(b=>(
                <div key={b.id} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-all">
                    <div className="flex items-start gap-4 mb-4">
                        <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 border-2 border-slate-100">
                            {b.lawyerDetails ? (
                                <img src={b.lawyerDetails.image} className="w-full h-full object-cover" alt={b.lawyerDetails.name} />
                            ) : (
                                <div className="w-full h-full bg-blue-50 flex items-center justify-center">
                                    <User className="w-8 h-8 text-blue-600" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-slate-900 text-lg">
                                {b.lawyerDetails ? b.lawyerDetails.name : b.lawyerName}
                            </h4>
                            {b.lawyerDetails && (
                                <>
                                    <p className="text-blue-600 text-sm font-medium">{b.lawyerDetails.specialization}</p>
                                    <p className="text-slate-500 text-xs mt-1">{b.lawyerDetails.sub_specialty}</p>
                                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-2">
                                        <span className="flex items-center"><MapPin className="w-3 h-3 mr-1" /> {b.lawyerDetails.location}</span>
                                        <span className="flex items-center"><DollarSign className="w-3 h-3 mr-1" /> {b.lawyerDetails.fee}/hr</span>
                                        <span className="flex items-center">{b.lawyerDetails.experience} years</span>
                                    </div>
                                </>
                            )}
                            <div className="flex items-center gap-3 text-sm text-slate-500 mt-2">
                                <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" /> {b.date}</span>
                                <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> {b.time}</span>
                                {b.duration && <span className="bg-slate-100 px-2 py-1 rounded text-xs">{b.duration} hour{b.duration > 1 ? 's' : ''}</span>}
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                        <div>
                            <p className="text-xs text-slate-500">Consultation Fee</p>
                            <p className="font-semibold text-slate-900">${b.fee || (b.lawyerDetails ? b.lawyerDetails.fee * (b.duration || 1) : 'N/A')}</p>
                        </div>
                        <button
                            onClick={onJoinCall}
                            className="flex items-center justify-center bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors shadow-sm"
                        >
                            <Video className="w-4 h-4 mr-2" /> Join Call
                        </button>
                    </div>
                </div>
              ))}
          </div>
      )}
    </div>
  )
}
