import React from 'react'
import { MapPin, Briefcase, Star, Clock, DollarSign, Shield, AlertTriangle, ArrowLeft, Info, FileText, CheckCircle } from 'lucide-react'

export default function LawyerResults({ lawyers, params, onSelect, onBackToChat, legalGuidance }) {
  const getMatchBadge = (lawyer) => {
    if (!lawyer.matchScore) return null;
    
    if (lawyer.matchScore >= 100) {
      return <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full ml-2">Exact Match</span>;
    } else if (lawyer.matchScore >= 75) {
      return <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-1 rounded-full ml-2">Related</span>;
    }
    return <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded-full ml-2">General</span>;
  };

  const getMatchScore = (lawyer) => {
    if (!lawyer.matchScore) return null;
    return (
      <div className="text-xs text-slate-500 mt-1 flex items-center">
        <SparklesIcon className="w-3 h-3 mr-1 text-blue-500" />
        Match Score: <span className="font-semibold text-slate-700 ml-1">{lawyer.matchScore}%</span>
        <span className="mx-1">•</span>
        <span className="italic">{lawyer.matchReason}</span>
      </div>
    );
  };

  const renderLawyerSection = (sectionLawyers, title, showBadge = true) => {
    if (!sectionLawyers || sectionLawyers.length === 0) return null;
    
    return (
      <div className="mb-10">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 border-l-4 border-blue-600 pl-3">{title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sectionLawyers.map(l=>(
            <div key={l.id} className="group bg-white rounded-xl p-5 border border-slate-200 hover:border-blue-300 transition-all duration-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                 {showBadge && getMatchBadge(l)}
              </div>
              
              <div className="flex items-start gap-4">
                <img src={l.image} className="w-16 h-16 rounded-full object-cover border-2 border-slate-100 shadow-sm group-hover:border-blue-100 transition-colors" alt={l.name} />
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900 text-lg leading-tight">{l.name}</h4>
                  <div className="text-xs font-medium text-blue-600 mt-1 flex items-center">
                    <Briefcase className="w-3 h-3 mr-1" />
                    {l.specialization}
                  </div>
                  <div className="text-xs text-slate-500 mt-1 flex items-center">
                    <MapPin className="w-3 h-3 mr-1" />
                    {l.location}
                  </div>
                  <div className="text-xs text-slate-500 mt-1 italic">
                    {l.sub_specialty}
                  </div>
                  {getMatchScore(l)}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 flex items-center text-lg">
                    <DollarSign className="w-4 h-4 text-slate-400 mr-0.5" />
                    {l.fee}<span className="text-xs text-slate-400 font-normal ml-1">/hr</span>
                  </div>
                  <div className="text-xs text-slate-500 flex items-center mt-0.5">
                    <Clock className="w-3 h-3 mr-1" />
                    {l.experience} years exp.
                  </div>
                </div>
                <button 
                  onClick={()=>onSelect(l)}
                  className="bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                >
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Search Results</h2>
          <div className="flex items-center gap-2 text-slate-500 text-sm mt-1">
            <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-medium">{params.location}</span>
            <span>•</span>
            <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-medium">{params.type}</span>
          </div>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors font-medium shadow-sm"
          onClick={onBackToChat}
        >
          <ArrowLeft className="w-4 h-4" /> Back to Chat
        </button>
      </div>

      {/* User Case Description Display */}
      {params.caseDescription && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 mb-8 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-400"></div>
          <div className="flex items-start gap-3">
            <div className="bg-slate-100 p-2 rounded-lg">
                <FileText className="w-5 h-5 text-slate-600" />
            </div>
            <div>
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide mb-1">Your Case Description</h3>
                <p className="text-slate-600 italic text-sm leading-relaxed">"{params.caseDescription}"</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Legal Guidance Section */}
      {legalGuidance && (
        <div className="bg-amber-50 rounded-2xl p-6 sm:p-8 ring-1 ring-amber-900/5 shadow-md mb-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100 rounded-full -mr-10 -mt-10 opacity-50 blur-2xl"></div>
          
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="bg-amber-100 p-2 rounded-lg text-amber-600">
                <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-amber-900">Legal Guidance & Analysis</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 relative z-10">
            <div className="space-y-4">
              <div>
                <div className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2">Case Summary</div>
                <p className="text-sm text-amber-900/80 leading-relaxed">{legalGuidance.summary}</p>
              </div>
              
              <div>
                <div className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2">Assessment</div>
                <div className="flex flex-wrap gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    legalGuidance.severity === 'Critical' ? 'bg-red-100 text-red-700 border-red-200' :
                    legalGuidance.severity === 'Serious' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                    legalGuidance.severity === 'Moderate' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                    'bg-green-100 text-green-700 border-green-200'
                  }`}>
                    Severity: {legalGuidance.severity}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    legalGuidance.urgency === 'Immediate' ? 'bg-red-100 text-red-700 border-red-200' :
                    legalGuidance.urgency === 'High' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                    'bg-green-100 text-green-700 border-green-200'
                  }`}>
                    Urgency: {legalGuidance.urgency}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-5 border border-amber-100/50">
               <div className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-3">Recommended Lawyer Type</div>
               <div className="text-sm font-medium text-amber-900 bg-white px-3 py-2 rounded-lg border border-amber-100 inline-block shadow-sm">
                 {legalGuidance.recommendedLawyerType}
               </div>
               
               <div className="mt-4">
                 <div className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2">Timeline & Cost</div>
                 <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-white px-3 py-2 rounded-lg border border-amber-100 shadow-sm">
                        <span className="block text-amber-600 font-semibold mb-1">Est. Timeline</span>
                        {legalGuidance.timeline}
                    </div>
                    <div className="bg-white px-3 py-2 rounded-lg border border-amber-100 shadow-sm">
                        <span className="block text-amber-600 font-semibold mb-1">Est. Cost</span>
                        {legalGuidance.costEstimate}
                    </div>
                 </div>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            <div>
              <div className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-200 flex items-center justify-center text-amber-700 font-bold text-[10px]">1</span>
                Immediate Steps
              </div>
              <ul className="space-y-2">
                {legalGuidance.immediateSteps.map((step, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-amber-900/90">
                    <CheckCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <div className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-200 flex items-center justify-center text-amber-700 font-bold text-[10px]">2</span>
                Documents Needed
              </div>
              <ul className="space-y-2">
                {legalGuidance.documentsNeeded.map((doc, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-amber-900/90">
                    <FileText className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                    <span>{doc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

            {/* Accordion-like expandable sections could go here, but keeping it expanded for visibility as per request */}
            <div className="mt-8 pt-6 border-t border-amber-200/50 grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <h4 className="font-bold text-amber-900 text-sm mb-2 flex items-center gap-2">
                        <Info className="w-4 h-4" /> Legal Process
                    </h4>
                    <p className="text-sm text-amber-900/80 leading-relaxed bg-white/50 p-3 rounded-lg border border-amber-100">
                        {legalGuidance.legalProcess}
                    </p>
                 </div>
                 
                 {legalGuidance.risks && legalGuidance.risks.length > 0 && (
                    <div>
                        <h4 className="font-bold text-red-700 text-sm mb-2 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" /> Potential Risks
                        </h4>
                        <ul className="space-y-1 bg-red-50 p-3 rounded-lg border border-red-100">
                            {legalGuidance.risks.map((risk, i) => (
                            <li key={i} className="text-sm text-red-800 flex items-start gap-2">
                                <span className="text-red-400">•</span> {risk}
                            </li>
                            ))}
                        </ul>
                    </div>
                 )}
            </div>
        </div>
      )}

      {/* Original AI Analysis (simplified) */}
      {!legalGuidance && params.analysis && (
        <div className="bg-blue-50 border-l-4 border-blue-600 rounded-r-xl p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
             <div className="bg-blue-100 p-1.5 rounded text-blue-600">
                <SparklesIcon className="w-5 h-5" />
             </div>
             <h3 className="font-bold text-blue-900">AI Case Analysis</h3>
          </div>
          
          {params.analysis.reasoning && (
            <div className="mb-4 p-3 bg-blue-100/50 rounded-lg text-sm text-blue-800 italic">
              <strong>🤖 Reasoning:</strong> {params.analysis.reasoning}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
             <div>
                <span className="font-semibold text-slate-700">Specialization:</span> {params.analysis.specialization || params.analysis.caseType}
             </div>
             <div>
                <span className="font-semibold text-slate-700">Severity:</span> 
                <span className={`ml-1 font-medium ${
                    params.analysis.severity === 'High' ? 'text-red-600' : 
                    params.analysis.severity === 'Medium' ? 'text-amber-600' : 'text-green-600'
                }`}>{params.analysis.severity}</span>
             </div>
          </div>
          <div className="mt-3 text-sm text-slate-700">
            <span className="font-semibold">Description:</span> {params.analysis.description}
          </div>
        </div>
      )}
      
      {lawyers.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No Specialized Lawyers Found</h3>
          <p className="text-slate-500 max-w-md mx-auto mb-6">{params.analysis ?
            `No lawyers specializing in ${params.analysis.specialization || params.analysis.caseType} law found in ${params.location}. Consider expanding your search or contacting general practitioners.` :
            'Try registering a lawyer with the required details to see results.'}</p>
            
           <button 
             onClick={onBackToChat}
             className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
           >
             Modify Search
           </button>
        </div>
      ) : (
        <div className="space-y-10">
          {renderLawyerSection(params.exactMatches, "Exact Sub-specialty Matches", true)}
          {renderLawyerSection(params.relatedMatches, "Related Specialization Matches", true)}
          {renderLawyerSection(params.generalMatches, "General Specialization Matches", true)}
          
          {!params.exactMatches && !params.relatedMatches && !params.generalMatches &&
            renderLawyerSection(lawyers, "Available Lawyers", false)
          }
        </div>
      )}
    </div>
  )
}

// Helper component for the sparkle icon used inside
function SparklesIcon({ className }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
    )
}

