import React, { useState } from 'react'

export default function AuthScreen({ onLogin, onRegister }) {
  const [role, setRole] = useState('client')
  const [isRegister, setIsRegister] = useState(false)
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
    <div className="card" style={{maxWidth:520,margin:'0 auto'}}>
      <h2 style={{textAlign:'center'}}>{isRegister ? `Register as ${role}` : 'Welcome Back'}</h2>
      <div style={{display:'flex',gap:8,marginBottom:12}}>
        <button className="btn" onClick={()=>setRole('client')} style={{flex:1,background: role==='client'?'#0f172a':'#fff', color: role==='client'?'#fff':'#0f172a'}}>Client</button>
        <button className="btn" onClick={()=>setRole('lawyer')} style={{flex:1,background: role==='lawyer'?'#0f172a':'#fff', color: role==='lawyer'?'#fff':'#0f172a'}}>Lawyer</button>
      </div>
      <form onSubmit={submit} className="grid">
        {isRegister && (
          <>
            <input required placeholder="Full Name" onChange={e=>setFormData({...formData,name:e.target.value})} />
            {role==='lawyer' && <>
              <input required placeholder="City (e.g. Mumbai)" onChange={e=>setFormData({...formData,city:e.target.value})} />
              <div style={{display:'flex',gap:8}}>
                <select onChange={e=>setFormData({...formData,specialization:e.target.value})} value={formData.specialization}>
                  <option>Criminal</option><option>Civil</option><option>Corporate</option><option>Family</option><option>Property</option><option>Cyber</option>
                </select>
                <input required type="number" placeholder="Years Exp." onChange={e=>setFormData({...formData,experience:e.target.value})} />
              </div>
              <input required type="number" placeholder="Hourly Fee ($)" onChange={e=>setFormData({...formData,fee:e.target.value})} />
            </>}
          </>
        )}
        <input required type="email" placeholder="Email" />
        <input required type="password" placeholder="Password" />
        <button className="btn" type="submit">{isRegister ? 'Create Account' : 'Login'}</button>
      </form>
      <div style={{textAlign:'center',marginTop:12}}>
        <button onClick={()=>setIsRegister(!isRegister)} className="btn" style={{background:'#fff', color:'#0f172a'}}>{isRegister ? 'Already have an account? Login' : "Don't have an account? Sign Up"}</button>
      </div>
    </div>
  )
}
