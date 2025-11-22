import React, { useState, useEffect } from 'react'
import axios from 'axios'

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

  useEffect(() => {
    // fetch initial lawyers
    fetchLawyers()
    fetchBookings()
  }, [])

  const fetchLawyers = async (params = {}) => {
    // If lawyers are already provided from LLM analysis, use them
    if (params.lawyers) {
      setLawyers(params.lawyers)
      return
    }
    
    // Otherwise, fetch from the regular API
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
    <div className="container">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
        <h1>Legal<span style={{color:'#2563eb'}}>Bell</span></h1>
        <div>
          {user ? (
            <>
              <span style={{marginRight:12}}>Welcome, {user.name}</span>
              <button className="btn" onClick={()=>{ setUser(null); setView('landing') }}>Logout</button>
            </>
          ) : (
            <button className="btn" onClick={()=>setView('auth')}>Login / Register</button>
          )}
        </div>
      </div>

      {view === 'landing' && <LandingChat onSearchComplete={(p)=>{ setSearchParams(p); fetchLawyers(p); setView('results'); }} />}
      {view === 'results' && <LawyerResults lawyers={lawyers} params={searchParams} onSelect={(l)=>{ setSelectedLawyer(l); if (!user) setView('auth'); else setView('booking'); }} />}
      {view === 'auth' && <AuthScreen onLogin={handleLogin} onRegister={handleRegister} />}
      {view === 'booking' && selectedLawyer && <BookingFlow lawyer={selectedLawyer} user={user} existingBookings={bookings} onConfirm={async (b)=>{ await axios.post('/api/bookings', b); fetchBookings(); setView('client-dash'); }} />}
      {view === 'client-dash' && <ClientDashboard user={user} bookings={bookings} onJoinCall={()=>setView('video')} onSearch={()=>setView('landing')} />}
      {view === 'lawyer-dash' && <LawyerDashboard user={user} bookings={bookings} onJoinCall={()=>setView('video')} onDraft={()=>setView('drafting')} />}
      {view === 'video' && <VideoRoom onEnd={()=>setView(user && user.role==='lawyer' ? 'lawyer-dash' : 'client-dash')} />}
      {view === 'drafting' && <AIDrafter onBack={()=>setView('lawyer-dash')} />}
    </div>
  )
}
