import React from 'react'

export default function LawyerResults({ lawyers, params, onSelect }) {
  const getMatchBadge = (lawyer) => {
    if (!lawyer.matchScore) return null;
    
    if (lawyer.matchScore >= 100) {
      return <span style={{background:'#10b981',color:'white',fontSize:10,padding:'2px 6px',borderRadius:4,marginLeft:4}}>Exact Match</span>;
    } else if (lawyer.matchScore >= 75) {
      return <span style={{background:'#f59e0b',color:'white',fontSize:10,padding:'2px 6px',borderRadius:4,marginLeft:4}}>Related</span>;
    }
    return <span style={{background:'#6b7280',color:'white',fontSize:10,padding:'2px 6px',borderRadius:4,marginLeft:4}}>General</span>;
  };

  const getMatchScore = (lawyer) => {
    if (!lawyer.matchScore) return null;
    return (
      <div style={{fontSize:11,color:'#6b7280',marginTop:2}}>
        Match Score: {lawyer.matchScore}% • {lawyer.matchReason}
      </div>
    );
  };

  const renderLawyerSection = (sectionLawyers, title, showBadge = true) => {
    if (!sectionLawyers || sectionLawyers.length === 0) return null;
    
    return (
      <div style={{marginBottom:24}}>
        <h3 style={{marginBottom:12,fontSize:16,color:'#374151'}}>{title}</h3>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:12}}>
          {sectionLawyers.map(l=>(
            <div key={l.id} className="card" style={{position:'relative'}}>
              {showBadge && getMatchBadge(l)}
              <div style={{display:'flex',gap:12,alignItems:'center'}}>
                <img src={l.image} style={{width:64,height:64,borderRadius:999}} />
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,display:'flex',alignItems:'center'}}>
                    {l.name}
                  </div>
                  <div style={{fontSize:12,color:'#64748b',marginBottom:2}}>
                    {l.specialization} • {l.location}
                  </div>
                  <div style={{fontSize:11,color:'#4b5563',fontStyle:'italic'}}>
                    {l.sub_specialty}
                  </div>
                  {getMatchScore(l)}
                </div>
              </div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:12}}>
                <div>
                  <div style={{fontWeight:700}}>${l.fee}/hr</div>
                  <div style={{fontSize:11,color:'#6b7280'}}>{l.experience} years exp.</div>
                </div>
                <button className="btn" onClick={()=>onSelect(l)}>Book Now</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div style={{marginBottom:12}}>
        <h2>Search Results</h2>
        <p>Location: <strong>{params.location}</strong> | Case Type: <strong>{params.type}</strong></p>
        {params.analysis && (
          <div className="card" style={{background:'#f8fafc',borderLeft:'4px solid #2563eb',marginBottom:12}}>
            <div style={{fontWeight:700,color:'#1e40af'}}>AI Case Analysis</div>
            <div style={{fontSize:14,marginBottom:4}}>
              <strong>Specialization:</strong> {params.analysis.specialization || params.analysis.caseType}
              {params.analysis.subSpecialty && params.analysis.subSpecialty !== 'General Practice' &&
                <span> • <strong>Sub-specialty:</strong> {params.analysis.subSpecialty}</span>
              }
            </div>
            <div style={{fontSize:14,marginBottom:4}}>
              <strong>Severity:</strong>
              <span style={{
                color: params.analysis.severity === 'High' ? '#dc2626' :
                       params.analysis.severity === 'Medium' ? '#f59e0b' : '#10b981',
                fontWeight: 600
              }}> {params.analysis.severity}</span>
              {params.analysis.urgency && params.analysis.urgency !== 'Normal' &&
                <span> • <strong>Urgency:</strong>
                  <span style={{
                    color: params.analysis.urgency === 'Immediate' ? '#dc2626' :
                           params.analysis.urgency === 'High' ? '#f59e0b' : '#10b981',
                    fontWeight: 600
                  }}> {params.analysis.urgency}</span>
                </span>
              }
            </div>
            <div style={{fontSize:14}}><strong>Description:</strong> {params.analysis.description}</div>
          </div>
        )}
      </div>
      
      {lawyers.length===0 ? (
        <div className="card" style={{textAlign:'center',padding:40}}>
          <h3>No Specialized Lawyers Found</h3>
          <p>{params.analysis ?
            `No lawyers specializing in ${params.analysis.specialization || params.analysis.caseType} law found in ${params.location}. Consider expanding your search or contacting general practitioners.` :
            'Try registering a lawyer with the required details to see results.'}</p>
        </div>
      ) : (
        <div>
          {/* Show exact matches first */}
          {renderLawyerSection(params.exactMatches, "Exact Sub-specialty Matches", true)}
          
          {/* Show related matches */}
          {renderLawyerSection(params.relatedMatches, "Related Specialization Matches", true)}
          
          {/* Show general matches */}
          {renderLawyerSection(params.generalMatches, "General Specialization Matches", true)}
          
          {/* If no分组, show all lawyers */}
          {!params.exactMatches && !params.relatedMatches && !params.generalMatches &&
            renderLawyerSection(lawyers, "Available Lawyers", false)
          }
        </div>
      )}
    </div>
  )
}
