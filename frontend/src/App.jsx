import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Gavel, LogOut, User, Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

import LandingChat from './components/LandingChat'
import LawyerResults from './components/LawyerResults'
import AuthScreen from './components/AuthScreen'
import BookingFlow from './components/BookingFlow'
import ClientDashboard from './components/ClientDashboard'
import LawyerDashboard from './components/LawyerDashboard'
import VideoRoom from './components/VideoRoom'
import AIDrafter from './components/AIDrafter'

export default function App() {
  const [user, setUser] = useState(null)
  const [view, setView] = useState('landing')
  const [lawyers, setLawyers] = useState([])
  const [searchParams, setSearchParams] = useState({ location: '', type: '' })
  const [selectedLawyer, setSelectedLawyer] = useState(null)
  const [bookings, setBookings] = useState([])
  const [previousSearch, setPreviousSearch] = useState(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    // fetch initial lawyers
    fetchLawyers()
    fetchBookings()
  }, [])

  const fetchLawyers = async (params = {}) => {
    if (params.lawyers) {
      setLawyers(params.lawyers)
      return
    }
    const res = await axios.get('/api/lawyers', { params })
    setLawyers(res.data)
  }

  const fetchBookings = async () => {
    const res = await axios.get('/api/bookings')
    setBookings(res.data)
  }

  const handleRegister = async (formData) => {
    const res = await axios.post('/api/register', formData)
    if (res.data.ok) {
      setUser(res.data.user)
      setView(res.data.user.role === 'lawyer' ? 'lawyer-dash' : 'client-dash')
      fetchLawyers()
    }
  }

  const handleLogin = async (role) => {
    const res = await axios.post('/api/login', { role })
    if (res.data.ok) {
      setUser(res.data.user)
      setView(res.data.user.role === 'lawyer' ? 'lawyer-dash' : 'client-dash')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center cursor-pointer" onClick={() => setView('landing')}>
              <div className="bg-blue-600 p-1.5 rounded-lg mr-2">
                <Gavel className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Legal<span className="text-blue-600">Bell</span>
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <>
                  <div className="flex items-center space-x-2 px-3 py-1.5 bg-slate-100 rounded-full">
                    <User className="h-4 w-4 text-slate-500" />
                    <span className="text-sm font-medium text-slate-700">{user.name}</span>
                  </div>
                  <button 
                    onClick={() => { setUser(null); setView('landing'); }}
                    className="flex items-center space-x-1 text-slate-600 hover:text-red-600 transition-colors px-3 py-2 rounded-lg hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="font-medium">Logout</span>
                  </button>
                  <button 
                    onClick={() => setView(user.role === 'lawyer' ? 'lawyer-dash' : 'client-dash')}
                    className="px-4 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-all shadow-sm hover:shadow-md"
                  >
                    Dashboard
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => setView('auth')}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                >
                  Login / Register
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-slate-600 hover:text-slate-900 p-2">
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-slate-200 bg-white"
            >
              <div className="px-4 py-4 space-y-3">
                {user ? (
                  <>
                    <div className="flex items-center space-x-2 px-2 py-2">
                      <User className="h-5 w-5 text-slate-500" />
                      <span className="font-medium text-slate-900">{user.name}</span>
                    </div>
                    <button 
                      onClick={() => { setView(user.role === 'lawyer' ? 'lawyer-dash' : 'client-dash'); setMobileMenuOpen(false); }}
                      className="w-full text-left px-3 py-2 bg-slate-50 rounded-lg font-medium text-slate-700"
                    >
                      Dashboard
                    </button>
                    <button 
                      onClick={() => { setUser(null); setView('landing'); setMobileMenuOpen(false); }}
                      className="w-full text-left px-3 py-2 text-red-600 font-medium hover:bg-red-50 rounded-lg"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => { setView('auth'); setMobileMenuOpen(false); }}
                    className="w-full px-4 py-3 bg-blue-600 text-white rounded-xl font-medium shadow-sm"
                  >
                    Login / Register
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {view === 'landing' && (
              <LandingChat 
                onSearchComplete={(p) => {
                  setSearchParams(p);
                  fetchLawyers(p);
                  setPreviousSearch({ params: p, lawyers: p.lawyers || [] });
                  setView('results');
                }} 
              />
            )}
            
            {view === 'results' && (
              <LawyerResults
                lawyers={lawyers}
                params={searchParams}
                legalGuidance={searchParams.legalGuidance}
                onSelect={(l) => {
                  setSelectedLawyer(l);
                  if (!user) {
                    setPreviousSearch({ params: searchParams, lawyers: lawyers });
                    setView('auth');
                  } else {
                    setView('booking');
                  }
                }}
                onBackToChat={() => setView('landing')}
              />
            )}
            
            {view === 'auth' && (
              <AuthScreen
                onLogin={handleLogin}
                onRegister={handleRegister}
                onBackToResults={previousSearch ? () => {
                  setSearchParams(previousSearch.params);
                  setLawyers(previousSearch.lawyers);
                  setView('results');
                } : null}
                isFromBooking={!!selectedLawyer}
              />
            )}
            
            {view === 'booking' && selectedLawyer && (
              <BookingFlow 
                lawyer={selectedLawyer} 
                user={user} 
                existingBookings={bookings} 
                onConfirm={async (b) => { 
                  await axios.post('/api/bookings', b); 
                  fetchBookings(); 
                  setView('booking-confirmed'); 
                }} 
              />
            )}
            
            {view === 'booking-confirmed' && (
              <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg border border-slate-100 p-10 text-center">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-4">Booking Confirmed!</h2>
                <p className="text-slate-600 text-lg mb-8">Your consultation has been successfully booked with <span className="font-semibold text-slate-900">{selectedLawyer?.name}</span>.</p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <button 
                    className="px-6 py-3 border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors"
                    onClick={() => { setSelectedLawyer(null); setView('results'); }}
                  >
                    ← Back to Search
                  </button>
                  <button 
                    className="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
                    onClick={() => setView(user && user.role === 'lawyer' ? 'lawyer-dash' : 'client-dash')}
                  >
                    Go to Dashboard
                  </button>
                </div>
              </div>
            )}
            
            {view === 'client-dash' && (
              <ClientDashboard user={user} bookings={bookings} onJoinCall={() => setView('video')} onSearch={() => setView('landing')} />
            )}
            
            {view === 'lawyer-dash' && (
              <LawyerDashboard user={user} bookings={bookings} onJoinCall={() => setView('video')} onDraft={() => setView('drafting')} />
            )}
            
            {view === 'video' && (
              <VideoRoom onEnd={() => setView(user && user.role === 'lawyer' ? 'lawyer-dash' : 'client-dash')} />
            )}
            
            {view === 'drafting' && (
              <AIDrafter onBack={() => setView('lawyer-dash')} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}
