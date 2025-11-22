import React from 'react'

export default function LawyerResults({ lawyers, params, onSelect }) {
  return (
    <div>
      <div style={{marginBottom:12}}>
        <h2>Search Results</h2>
        <p>Location: <strong>{params.location}</strong> | Case Type: <strong>{params.type}</strong></p>
        {params.analysis && (
          <div className="card" style={{background:'#f8fafc',borderLeft:'4px solid #2563eb',marginBottom:12}}>
            <div style={{fontWeight:700,color:'#1e40af'}}>AI Case Analysis</div>
            <div style={{fontSize:14,marginBottom:4}}><strong>Category:</strong> {params.analysis.category}</div>
            <div style={{fontSize:14,marginBottom:4}}><strong>Severity:</strong> {params.analysis.severity}</div>
            <div style={{fontSize:14}}><strong>Description:</strong> {params.analysis.description}</div>
          </div>
        )}
      </div>
      {lawyers.length===0 ? (
        <div className="card" style={{textAlign:'center',padding:40}}>
          <h3>No Specialized Lawyers Found</h3>
          <p>{params.analysis ?
            `No lawyers specializing in ${params.analysis.caseType} law found in ${params.location}. Consider expanding your search or contacting general practitioners.` :
            'Try registering a lawyer with the required details to see results.'}</p>
        </div>
      ) : (
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:12}}>
          {lawyers.map(l=>(
            <div key={l.id} className="card">
              <div style={{display:'flex',gap:12,alignItems:'center'}}>
                <img src={l.image} style={{width:64,height:64,borderRadius:999}} />
                <div>
                  <div style={{fontWeight:700}}>{l.name}</div>
                  <div style={{fontSize:12,color:'#64748b'}}>{l.specialization} • {l.location}</div>
                </div>
              </div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:12}}>
                <div style={{fontWeight:700}}>${l.fee}/hr</div>
                <button className="btn" onClick={()=>onSelect(l)}>Book Now</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
