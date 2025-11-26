import React from 'react'
import { Plus, Video, Calendar, Clock, User } from 'lucide-react'

export default function ClientDashboard({ user, bookings, onJoinCall, onSearch }) {
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

      {bookings.length===0 ? (
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
              {bookings.map(b=>(
                <div key={b.id} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                            <User className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 text-lg">{b.lawyerName}</h4>
                            <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                                <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" /> {b.date}</span>
                                <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> {b.time}</span>
                            </div>
                        </div>
                    </div>
                    <button 
                        onClick={onJoinCall}
                        className="w-full sm:w-auto flex items-center justify-center bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors shadow-sm"
                    >
                        <Video className="w-4 h-4 mr-2" /> Join Call
                    </button>
                </div>
              ))}
          </div>
      )}
    </div>
  )
}
