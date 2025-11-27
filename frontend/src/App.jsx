import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Gavel, LogOut, User, Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

import LandingChat from './components/LandingChat'
import LawyerResults from './components/LawyerResults'
import AuthScreen from './components/AuthScreen'
import BookingFlow from './components/BookingFlow'
import PaymentGateway from './components/PaymentGateway'
import PaymentSuccess from './components/PaymentSuccess'
import ClientDashboard from './components/ClientDashboard'
import LawyerDashboard from './components/LawyerDashboard'
import VideoRoom from './components/VideoRoom'
import AIDrafter from './components/AIDrafter'
import { getBookingPreferences, clearBookingPreferences, saveBookingPreferences } from './utils/bookingPreferences'

export default function App() {
  const [user, setUser] = useState(null)
  const [view, setView] = useState('landing')
  const [lawyers, setLawyers] = useState([])
  const [searchParams, setSearchParams] = useState({ location: '', type: '' })
  const [selectedLawyer, setSelectedLawyer] = useState(null)
  const [bookingData, setBookingData] = useState(null)
  const [bookings, setBookings] = useState([])
  const [previousSearch, setPreviousSearch] = useState(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [forceLoginMode, setForceLoginMode] = useState(false)

  useEffect(() => {
    // fetch initial lawyers
    fetchLawyers()
    fetchBookings()
  }, [])

  useEffect(() => {
    // Reset forceLoginMode when navigating away from auth view
    if (view !== 'auth') {
      setForceLoginMode(false)
    }
  }, [view])

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
    const bookings = res.data
    
    // Fetch lawyer details for each booking
    const bookingsWithLawyerDetails = await Promise.all(
      bookings.map(async (booking) => {
        try {
          const lawyerRes = await axios.get(`/api/lawyers/${booking.lawyerId}`)
          return {
            ...booking,
            lawyerDetails: lawyerRes.data
          }
        } catch (error) {
          console.error('Error fetching lawyer details:', error)
          return booking
        }
      })
    )
    
    setBookings(bookingsWithLawyerDetails)
  }

  const handleRegister = async (formData) => {
    const res = await axios.post('/api/register', formData)
    if (res.data.ok) {
      // Show success message and redirect to login page
      alert('Registration successful! Please login with your credentials.')
      setView('auth')
      fetchLawyers()
      // Set a flag to force login mode
      setTimeout(() => {
        setForceLoginMode(true)
      }, 100)
    }
  }

  const handleLogin = async (loginData) => {
    const res = await axios.post('/api/login', loginData)
    if (res.data.ok) {
      setUser(res.data.user)
      // Reset force login mode after successful login
      setForceLoginMode(false)
      
      // Check if there are saved booking preferences
      const bookingPreferences = loginData.bookingPreferences || getBookingPreferences()
      
      if (bookingPreferences && bookingPreferences.searchResults && res.data.user.role === 'client') {
        // User has saved preferences and is a client, restore the search results
        setSearchParams(bookingPreferences.searchResults)
        setLawyers(bookingPreferences.searchResults.lawyers || [])
        setPreviousSearch({
          params: bookingPreferences.searchResults,
          lawyers: bookingPreferences.searchResults.lawyers || []
        })
        
        // Check if a specific lawyer was selected
        if (bookingPreferences.selectedLawyer) {
          setSelectedLawyer(bookingPreferences.selectedLawyer)
          setView('booking')
        } else {
          setView('results')
        }
        
        // Clear the preferences after using them
        clearBookingPreferences()
      } else {
        // Normal login flow
        setView(res.data.user.role === 'lawyer' ? 'lawyer-dash' : 'client-dash')
      }
    } else {
      alert('Invalid email, password, or role. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-100">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center cursor-pointer" onClick={() => { setView('landing'); setForceLoginMode(false); }}>
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
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
                  >
                    Dashboard
                  </button>
                </>
              ) : (
                <button
                  onClick={() => { setView('auth'); setForceLoginMode(false); }}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
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
                      onClick={() => { setView(user.role === 'lawyer' ? 'lawyer-dash' : 'client-dash'); setMobileMenuOpen(false); setForceLoginMode(false); }}
                      className="w-full text-left px-3 py-2 bg-slate-50 rounded-lg font-medium text-slate-700"
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={() => { setUser(null); setView('landing'); setMobileMenuOpen(false); setForceLoginMode(false); }}
                      className="w-full text-left px-3 py-2 text-red-600 font-medium hover:bg-red-50 rounded-lg"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => { setView('auth'); setMobileMenuOpen(false); setForceLoginMode(false); }}
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
                    // Save the selected lawyer to preferences
                    const currentPreferences = getBookingPreferences()
                    if (currentPreferences) {
                      saveBookingPreferences({
                        ...currentPreferences,
                        selectedLawyer: l
                      })
                    }
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
                  setForceLoginMode(false);
                } : null}
                isFromBooking={!!selectedLawyer}
                forceLoginMode={forceLoginMode}
              />
            )}
            
            {view === 'booking' && selectedLawyer && user && (
              <BookingFlow
                lawyer={selectedLawyer}
                user={user}
                existingBookings={bookings}
                onConfirm={(bookingInfo) => {
                  setBookingData(bookingInfo)
                  setView('payment')
                }}
              />
            )}
            
            {view === 'payment' && bookingData && (
              <PaymentGateway
                bookingData={bookingData}
                onBack={() => setView('booking')}
                onPaymentSuccess={async (paymentData) => {
                  await axios.post('/api/bookings', paymentData);
                  await fetchBookings(); // Refresh bookings with new data
                  setBookingData(paymentData);
                  setView('payment-success');
                }}
              />
            )}

            {view === 'payment-success' && bookingData && (
              <PaymentSuccess
                bookingData={bookingData}
                onViewBooking={() => setView(user && user.role === 'lawyer' ? 'lawyer-dash' : 'client-dash')}
                onGoToDashboard={() => setView(user && user.role === 'lawyer' ? 'lawyer-dash' : 'client-dash')}
              />
            )}
            
            {view === 'client-dash' && (
              <ClientDashboard user={user} bookings={bookings} onJoinCall={() => setView('video')} onSearch={() => setView('landing')} />
            )}
            
            {view === 'lawyer-dash' && (
              <LawyerDashboard user={user} bookings={bookings} onJoinCall={(booking) => setView('video')} onDraft={() => setView('drafting')} />
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
