import React from 'react'
import { Users, DollarSign, FileText, Video, Clock, Calendar, ChevronRight } from 'lucide-react'

export default function LawyerDashboard({ user, bookings, onJoinCall, onDraft }) {
  // Filter bookings for the current lawyer
  const lawyerBookings = bookings.filter(booking => booking.lawyerId === user.id);
  
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Lawyer Dashboard</h2>
        <p className="text-slate-500">Overview of your practice and upcoming sessions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mr-4">
                <Calendar className="w-6 h-6" />
            </div>
            <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bookings</div>
                <div className="text-3xl font-bold text-slate-900">{lawyerBookings.length}</div>
            </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center">
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600 mr-4">
                <DollarSign className="w-6 h-6" />
            </div>
            <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Revenue</div>
                <div className="text-3xl font-bold text-slate-900">$0</div>
            </div>
        </div>
        <div 
            className="group bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-2xl shadow-lg shadow-blue-600/20 text-white cursor-pointer hover:scale-[1.02] transition-all"
            onClick={onDraft}
        >
            <div className="flex justify-between items-start mb-2">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
                    <FileText className="w-6 h-6 text-white" />
                </div>
                <ChevronRight className="w-5 h-5 text-white/70 group-hover:translate-x-1 transition-transform" />
            </div>
            <div className="text-xs font-bold text-blue-200 uppercase tracking-wider">AI Tools</div>
            <div className="text-xl font-bold">Smart Drafter</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-900">Today's Schedule</h3>
            <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded-lg">
                {new Date().toLocaleDateString()}
            </span>
        </div>
        <div className="divide-y divide-slate-100">
            {lawyerBookings.length===0 ? (
                <div className="p-12 text-center">
                    <p className="text-slate-500">No appointments scheduled for today.</p>
                </div>
            ) : (
                lawyerBookings.map(b=>(
                <div key={b.id} className="p-4 sm:p-6 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-center bg-blue-50 rounded-xl p-2 w-16">
                            <span className="text-xs font-bold text-blue-600 uppercase">Time</span>
                            <span className="text-lg font-bold text-slate-900">{b.time}</span>
                        </div>
                        <div className="flex-1">
                            <div className="font-bold text-slate-900 text-lg">{b.clientName}</div>
                            {b.clientEmail && (
                                <div className="text-sm text-slate-600">{b.clientEmail}</div>
                            )}
                            <div className="flex items-center text-sm text-slate-500 mt-1">
                                <Clock className="w-3 h-3 mr-1" /> {b.duration || 1} Hour{b.duration > 1 ? 's' : ''} Session
                            </div>
                            <div className="text-xs text-slate-400 mt-1">
                                Date: {b.date} | Case: {b.caseType || 'General Consultation'}
                            </div>
                            {b.status && (
                                <div className="mt-2">
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                        b.status === 'paid' ? 'bg-green-100 text-green-800' :
                                        b.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                                        'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {b.status === 'paid' ? 'Paid' :
                                         b.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                                    </span>
                                </div>
                            )}
                            {b.fee && (
                                <div className="text-sm font-semibold text-slate-900 mt-1">
                                    Fee: ${b.fee}
                                </div>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={() => onJoinCall(b)}
                        className="flex items-center bg-green-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-green-700 transition-colors shadow-sm"
                    >
                        <Video className="w-4 h-4 mr-2" /> Start Session
                    </button>
                </div>
                ))
            )}
        </div>
      </div>
    </div>
  )
}
