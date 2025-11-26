import React, { useState } from 'react'
import { User, Mail, Lock, MapPin, Briefcase, DollarSign, Clock, ArrowLeft } from 'lucide-react'

export default function AuthScreen({ onLogin, onRegister, onBackToResults, isClientConnection = false, isFromBooking = false }) {
  const [role, setRole] = useState('client')
  const [isRegister, setIsRegister] = useState((isClientConnection && role === 'client') || isFromBooking)
  const [formData, setFormData] = useState({ name:'', email:'', city:'', specialization:'Criminal', fee:'', experience:'', about:'' })

  const submit = (e) => {
    e.preventDefault()
    if (isRegister) {
      onRegister({ ...formData, role })
    } else {
      onLogin(role)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      {onBackToResults && (
        <button
          onClick={onBackToResults}
          className="flex items-center text-slate-500 hover:text-slate-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Search Results
        </button>
      )}
      
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="px-8 pt-8 pb-6">
            <h2 className="text-2xl font-bold text-center text-slate-900 mb-2">
                {isRegister ? `Create ${role === 'client' ? 'Client' : 'Lawyer'} Account` : 'Welcome Back'}
            </h2>
            <p className="text-center text-slate-500 text-sm mb-8">
                {isRegister ? 'Join us to access legal services' : 'Sign in to your account'}
            </p>

            {/* Role Switcher */}
            <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
                <button 
                    onClick={()=>{setRole('client'); if(isClientConnection || isFromBooking) setIsRegister(true);}} 
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${role === 'client' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Client
                </button>
                <button 
                    onClick={()=>setRole('lawyer')} 
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${role === 'lawyer' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Lawyer
                </button>
            </div>

            <form onSubmit={submit} className="space-y-4">
                {isRegister && (
                <>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input 
                            required 
                            placeholder="Full Name" 
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            onChange={e=>setFormData({...formData,name:e.target.value})} 
                        />
                    </div>
                    {role==='lawyer' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input 
                                    required 
                                    placeholder="City (e.g. Mumbai)" 
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    onChange={e=>setFormData({...formData,city:e.target.value})} 
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="relative">
                                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <select 
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none"
                                        onChange={e=>setFormData({...formData,specialization:e.target.value})} 
                                        value={formData.specialization}
                                    >
                                        <option>Criminal</option><option>Civil</option><option>Corporate</option><option>Family</option><option>Property</option><option>Cyber</option>
                                    </select>
                                </div>
                                <div className="relative">
                                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input 
                                        required 
                                        type="number" 
                                        placeholder="Yrs Exp." 
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                        onChange={e=>setFormData({...formData,experience:e.target.value})} 
                                    />
                                </div>
                            </div>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input 
                                    required 
                                    type="number" 
                                    placeholder="Hourly Fee ($)" 
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    onChange={e=>setFormData({...formData,fee:e.target.value})} 
                                />
                            </div>
                        </div>
                    )}
                </>
                )}
                
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                        required 
                        type="email" 
                        placeholder="Email Address" 
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                </div>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                        required 
                        type="password" 
                        placeholder="Password" 
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                </div>

                <button 
                    type="submit"
                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
                >
                    {isRegister ? 'Create Account' : 'Login'}
                </button>
            </form>
        </div>
        
        <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 text-center">
            <button 
                onClick={()=>setIsRegister(!isRegister)} 
                className="text-sm text-slate-600 hover:text-blue-600 font-medium transition-colors"
            >
                {isRegister ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
            </button>
            {isFromBooking && isRegister && (
                <p className="text-xs text-slate-400 mt-2">
                    Create an account to complete your booking
                </p>
            )}
        </div>
      </div>
    </div>
  )
}
