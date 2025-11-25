import React from 'react'

export default function LawyerResults({ lawyers, params, onSelect, onBackToChat, legalGuidance }) {
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
      <div style={{marginBottom:12, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <div>
          <h2>Search Results</h2>
          <p>Location: <strong>{params.location}</strong> | Case Type: <strong>{params.type}</strong></p>
        </div>
        <button
          className="btn"
          onClick={onBackToChat}
          style={{backgroundColor:'#6b7280', padding:'8px 16px'}}
        >
          ← Back to Chat
        </button>
      </div>

      {/* User Case Description Display */}
      {params.caseDescription && (
        <div className="card" style={{background:'#f3f4f6', borderLeft:'4px solid #4b5563', marginBottom:16}}>
          <div style={{fontWeight:700, color:'#374151', marginBottom:8, display:'flex', alignItems:'center'}}>
            <span style={{marginRight:8}}>📝</span> Your Case Description
          </div>
          <div style={{fontSize:15, fontStyle:'italic', color:'#4b5563', lineHeight:1.5}}>
            "{params.caseDescription}"
          </div>
        </div>
      )}
      
      {/* Legal Guidance Section - Prominently displayed */}
      {legalGuidance && (
        <div className="card" style={{background:'#fef3c7',borderLeft:'4px solid #f59e0b',marginBottom:16}}>
          <div style={{fontWeight:700,color:'#d97706',fontSize:18,marginBottom:12}}>📋 Legal Guidance & What to Do</div>
          
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:16,marginBottom:16}}>
            <div>
              <div style={{fontWeight:600,color:'#374151',marginBottom:4}}>📄 Case Summary</div>
              <div style={{fontSize:14,lineHeight:1.5}}>{legalGuidance.summary}</div>
            </div>
            
            <div>
              <div style={{fontWeight:600,color:'#374151',marginBottom:4}}>⚡ Urgency & Severity</div>
              <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                <span style={{
                  background: legalGuidance.severity === 'Critical' ? '#dc2626' :
                           legalGuidance.severity === 'Serious' ? '#ea580c' :
                           legalGuidance.severity === 'Moderate' ? '#f59e0b' : '#10b981',
                  color:'white',padding:'4px 8px',borderRadius:4,fontSize:12,fontWeight:600
                }}>
                  {legalGuidance.severity}
                </span>
                <span style={{
                  background: legalGuidance.urgency === 'Immediate' ? '#dc2626' :
                           legalGuidance.urgency === 'High' ? '#f59e0b' :
                           legalGuidance.urgency === 'Normal' ? '#10b981' : '#6b7280',
                  color:'white',padding:'4px 8px',borderRadius:4,fontSize:12,fontWeight:600
                }}>
                  {legalGuidance.urgency}
                </span>
              </div>
            </div>
          </div>

          <div style={{marginBottom:16}}>
            <div style={{fontWeight:600,color:'#374151',marginBottom:4}}>⚖️ Recommended Lawyer</div>
            <div style={{fontSize:14,background:'#fff',padding:8,borderRadius:4,border:'1px solid #e5e7eb'}}>{legalGuidance.recommendedLawyerType}</div>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:16,marginBottom:16}}>
            <div>
              <div style={{fontWeight:600,color:'#374151',marginBottom:4}}>🚀 Immediate Steps</div>
              <ul style={{margin:0,paddingLeft:20,fontSize:14,lineHeight:1.5}}>
                {legalGuidance.immediateSteps.map((step, i) => (
                  <li key={i} style={{marginBottom:4}}>{step}</li>
                ))}
              </ul>
            </div>
            
            <div>
              <div style={{fontWeight:600,color:'#374151',marginBottom:4}}>📋 Documents Needed</div>
              <ul style={{margin:0,paddingLeft:20,fontSize:14,lineHeight:1.5}}>
                {legalGuidance.documentsNeeded.map((doc, i) => (
                  <li key={i} style={{marginBottom:4}}>{doc}</li>
                ))}
              </ul>
            </div>
          </div>

          <div style={{marginBottom:16}}>
            <div style={{fontWeight:600,color:'#374151',marginBottom:4}}>⚖️ Legal Process</div>
            <div style={{fontSize:14,lineHeight:1.5,background:'#fff',padding:12,borderRadius:4,border:'1px solid #e5e7eb'}}>
              {legalGuidance.legalProcess}
            </div>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:16,marginBottom:16}}>
            <div>
              <div style={{fontWeight:600,color:'#374151',marginBottom:4}}>⏱️ Timeline</div>
              <div style={{fontSize:14}}>{legalGuidance.timeline}</div>
            </div>
            
            <div>
              <div style={{fontWeight:600,color:'#374151',marginBottom:4}}>💰 Cost Estimate</div>
              <div style={{fontSize:14}}>{legalGuidance.costEstimate}</div>
            </div>
            
            <div>
              <div style={{fontWeight:600,color:'#374151',marginBottom:4}}>📈 Success Probability</div>
              <div style={{fontSize:14}}>{legalGuidance.successProbability}</div>
            </div>
          </div>

          {legalGuidance.risks && legalGuidance.risks.length > 0 && (
            <div style={{marginBottom:16}}>
              <div style={{fontWeight:600,color:'#dc2626',marginBottom:4}}>⚠️ Potential Risks</div>
              <ul style={{margin:0,paddingLeft:20,fontSize:14,lineHeight:1.5}}>
                {legalGuidance.risks.map((risk, i) => (
                  <li key={i} style={{marginBottom:4}}>{risk}</li>
                ))}
              </ul>
            </div>
          )}

          {legalGuidance.additionalAdvice && (
            <div>
              <div style={{fontWeight:600,color:'#059669',marginBottom:4}}>💡 Additional Advice</div>
              <div style={{fontSize:14,lineHeight:1.5,background:'#ecfdf5',padding:12,borderRadius:4,border:'1px solid #10b981'}}>
                {legalGuidance.additionalAdvice}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Original AI Analysis (simplified) */}
      {params.analysis && (
        <div className="card" style={{background:'#f8fafc',borderLeft:'4px solid #2563eb',marginBottom:12}}>
          <div style={{fontWeight:700,color:'#1e40af'}}>Case Analysis</div>
          
          {/* New AI Reasoning Display */}
          {params.analysis.reasoning && (
            <div style={{marginTop:8, marginBottom:12, padding:8, background:'#e0e7ff', borderRadius:4, fontSize:13, color:'#3730a3', fontStyle:'italic'}}>
              <strong>🤖 AI Reasoning:</strong> {params.analysis.reasoning}
            </div>
          )}

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
      
      {lawyers.length === 0 ? (
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
