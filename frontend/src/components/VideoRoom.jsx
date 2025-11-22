import React from 'react'
export default function VideoRoom({ onEnd }) {
  return (
    <div style={{position:'fixed',inset:0,background:'#0f172a',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div>
        <h2>Video Simulation</h2>
        <button className="btn" onClick={onEnd} style={{marginTop:12}}>End Simulation</button>
      </div>
    </div>
  )
}
