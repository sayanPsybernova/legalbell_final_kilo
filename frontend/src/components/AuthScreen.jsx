import React, { useState } from 'react'
import { User, Mail, Lock, MapPin, Briefcase, DollarSign, Clock, ArrowLeft } from 'lucide-react'

export default function AuthScreen({ onLogin, onRegister, onBackToResults, isClientConnection = false, isFromBooking = false }) {
  const [role, setRole] = useState('client')
  const [isRegister, setIsRegister] = useState((isClientConnection && role === 'client') || isFromBooking)
  const [formData, setFormData] = useState({ name:'', email:'', city:'', specialization:'Criminal', sub_specialty:'', fee:'', experience:'', about:'' })
  const [loginData, setLoginData] = useState({ email: '', password: '' })

  const submit = (e) => {
    e.preventDefault()
    if (isRegister) {
      onRegister({ ...formData, role })
    } else {
      onLogin({ ...loginData, role })
    }
  }

  return (
    <div className="max-w-md mx-auto">
      {onBackToResults && (
        <button
          onClick={onBackToResults}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors font-medium shadow-sm mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Search Results
        </button>
      )}
      
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
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
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-300 focus:ring-blue-200 focus:ring-opacity-50 transition-all"
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
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-300 focus:ring-blue-200 focus:ring-opacity-50 transition-all"
                                    onChange={e=>setFormData({...formData,city:e.target.value})} 
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="relative">
                                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <select
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-300 focus:ring-blue-200 focus:ring-opacity-50 transition-all appearance-none"
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
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-300 focus:ring-blue-200 focus:ring-opacity-50 transition-all"
                                        onChange={e=>setFormData({...formData,experience:e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="relative">
                                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    required
                                    type="text"
                                    placeholder="Sub-specialty (e.g. Tax Law, Property Disputes)"
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-300 focus:ring-blue-200 focus:ring-opacity-50 transition-all"
                                    onChange={e=>setFormData({...formData,sub_specialty:e.target.value})}
                                    value={formData.sub_specialty}
                                />
                            </div>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input 
                                    required 
                                    type="number" 
                                    placeholder="Hourly Fee ($)" 
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-300 focus:ring-blue-200 focus:ring-opacity-50 transition-all"
                                    onChange={e=>setFormData({...formData,fee:e.target.value})} 
                                />
                            </div>
                        </div>
                    )}
                </>
                )}
                
                {!isRegister && (
                  <>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            required
                            type="email"
                            placeholder="Email Address"
                            value={loginData.email}
                            onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-300 focus:ring-blue-200 focus:ring-opacity-50 transition-all"
                        />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            required
                            type="password"
                            placeholder="Password"
                            value={loginData.password}
                            onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-300 focus:ring-blue-200 focus:ring-opacity-50 transition-all"
                        />
                    </div>
                  </>
                )}

                {isRegister && (
                  <>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            required
                            type="email"
                            placeholder="Email Address"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-300 focus:ring-blue-200 focus:ring-opacity-50 transition-all"
                        />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            required
                            type="password"
                            placeholder="Password (min. 6 characters)"
                            value={formData.password || ''}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            minLength="6"
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-300 focus:ring-blue-200 focus:ring-opacity-50 transition-all"
                        />
                    </div>
                    {role === 'client' && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-xs text-blue-700">
                            <strong>Note:</strong> Your password will be securely encrypted for your protection.
                        </p>
                      </div>
                    )}
                  </>
                )}

                <button 
                    type="submit"
                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 hover:-translate-y-0.5 active:translate-y-0"
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
            
            {/* Demo Credentials */}
            {!isRegister && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs font-medium text-blue-900 mb-2">Demo Credentials:</p>
                    <div className="text-xs text-blue-700 space-y-1">
                        <p><strong>Client:</strong> client@gmail.com / Client@123</p>
                        <p><strong>Lawyer:</strong> lawyer@gmail.com / Lawyer@123</p>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  )
}
