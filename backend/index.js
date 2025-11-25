const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");
const { LEGAL_SPECIALIZATIONS, findBestSpecialization } = require("./specializations");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const DB_FILE = path.join(__dirname, "db.json");

// Initialize Gemini AI with Safety Settings to allow legal analysis of sensitive topics
const genAI = new GoogleGenerativeAI("AIzaSyD2fD3IeBNvGq5P6pJEmHoYAYmsH-fDKaY");
const model = genAI.getGenerativeModel({ 
  model: "gemini-1.5-flash",
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
  ],
});

function readDB() {
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
  } catch (e) {
    return { lawyers: [], bookings: [], users: [] };
  }
}

function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// Ensure DB exists
if (!fs.existsSync(DB_FILE)) {
  const initial = {
    lawyers: [
      {
        id: 1,
        name: "Adv. Demo Lawyer",
        specialization: "Criminal",
        sub_specialty: "Bail Matters",
        experience: 10,
        location: "Mumbai",
        fee: 500,
        image: "https://i.pravatar.cc/150?u=1",
        about:
          "Demo lawyer entry. Register a new lawyer to test the live database.",
      },
    ],
    bookings: [],
    users: [],
  };
  writeDB(initial);
}

// Routes

// Get all lawyers (with optional query ?location=&type=)
app.get("/api/lawyers", (req, res) => {
  const { location = "", type = "" } = req.query;
  const db = readDB();
  let results = db.lawyers;
  if (location) {
    const loc = location.toLowerCase();
    results = results.filter(
      (l) => l.location && l.location.toLowerCase().includes(loc)
    );
  }
  if (type && type !== "General") {
    results = results.filter((l) => l.specialization === type);
  }
  res.json(results);
});

// Register (lawyer or client)
app.post("/api/register", (req, res) => {
  const db = readDB();
  const { role, name, email, city, specialization, fee, experience, about } =
    req.body;
  if (role === "lawyer") {
    const id = Date.now();
    const newLawyer = {
      id,
      name,
      specialization: specialization || "General",
      sub_specialty: "General Practice",
      experience: Number(experience) || 0,
      location: city || "",
      fee: Number(fee) || 0,
      image: `https://i.pravatar.cc/150?u=${id}`,
      about: about || "",
    };
    db.lawyers.push(newLawyer);
    db.users.push({ id, name, role: "lawyer", email });
    writeDB(db);
    return res.json({ ok: true, user: { id, name, role: "lawyer" } });
  } else {
    const id = Date.now();
    db.users.push({ id, name, role: "client", email });
    writeDB(db);
    return res.json({ ok: true, user: { id, name, role: "client" } });
  }
});

// Simple login (mock)
app.post("/api/login", (req, res) => {
  const { role } = req.body;
  if (role === "lawyer") {
    return res.json({
      ok: true,
      user: { id: 1, name: "Adv. Demo Lawyer", role: "lawyer" },
    });
  } else {
    return res.json({
      ok: true,
      user: { id: 100, name: "John Doe", role: "client" },
    });
  }
});

// Create booking
app.post("/api/bookings", (req, res) => {
  const db = readDB();
  const booking = req.body;
  booking.id = Date.now();
  db.bookings.push(booking);
  writeDB(db);
  res.json({ ok: true, booking });
});

// List bookings
app.get("/api/bookings", (req, res) => {
  const db = readDB();
  res.json(db.bookings);
});

// Get single lawyer
app.get("/api/lawyers/:id", (req, res) => {
  const db = readDB();
  const l = db.lawyers.find((x) => x.id === Number(req.params.id));
  if (!l) return res.status(404).json({ error: "Not found" });
  res.json(l);
});

// Validate case description using Gemini AI
async function validateCaseDescription(caseDescription) {
  try {
    const prompt = `
    You are a legal AI assistant specializing in Indian law recognition. Your task is to analyze if a case description contains meaningful legal information.

    Case Description: "${caseDescription}"
    
    IMPORTANT: Respond ONLY with a JSON object in this exact format:
    {
      "isValid": true/false,
      "reason": "Brief explanation",
      "clarificationNeeded": "Specific question if needed (empty string if none)",
      "confidence": 0.0-1.0
    }
    
    VALIDATION RULES (be very lenient):
    
    ✅ ALWAYS VALID if mentions:
    - Criminal matters: kill, murder, death, assault, rape, theft, robbery, fraud, violence, abuse
    - Family issues: divorce, custody, property, land, inheritance, marriage dispute
    - Property matters: land dispute, house issue, ownership problem, illegal occupation
    - Civil matters: contract breach, consumer dispute, employment issue
    - Corporate issues: business dispute, partnership problem, company matter
    - Cyber issues: online fraud, hacking, data privacy
    
    ❌ INVALID only if:
    - Complete gibberish (e.g., "asdfghjkl", random characters)
    - Single non-legal words (e.g., "hello", "car", "food")
    - Greetings or pleasantries with no legal context
    
    📝 Examples of VALID inputs:
    - "i kill someone" → VALID (criminal matter)
    - "divorce case" → VALID (family matter)
    - "property dispute" → VALID (property matter)
    - "brother took my land" → VALID (property dispute)
    - "my wife left me" → VALID (family matter)
    - "someone hacked my account" → VALID (cyber matter)
    
    ⚠️ When in doubt, mark as VALID - better to analyze than reject a real case.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log("Gemini validation response:", text); // Debug log

    // Extract JSON from the response - more robust parsing
    let jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      // Try to find JSON in different formats
      jsonMatch = text.match(/```json\s*(\{[\s\S]*?\})\s*```/);
      if (!jsonMatch) {
        console.error("No JSON found in Gemini response:", text);
        throw new Error("Invalid response format from Gemini - no JSON found");
      }
    }

    try {
      const parsed = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      console.log("Parsed validation result:", parsed); // Debug log
      return parsed;
    } catch (parseError) {
      console.error("JSON parsing error:", parseError, "Raw text:", jsonMatch[0]);
      throw new Error(`Failed to parse Gemini response: ${parseError.message}`);
    }
  } catch (error) {
    console.error("Validation error:", error);
    // Enhanced fallback validation with legal issue detection
    const words = caseDescription.trim().split(/\s+/);
    const lowerText = caseDescription.toLowerCase();
    
    // Check for serious legal matters that should always be considered valid
    const seriousLegalKeywords = [
      'kill', 'murder', 'death', 'die', 'homicide', 'assault', 'rape', 'theft', 'robbery',
      'fraud', 'cheat', 'scam', 'divorce', 'custody', 'property', 'land', 'dispute', 'case',
      'court', 'lawyer', 'legal', 'sue', 'sued', 'complaint', 'police', 'fir', 'charge',
      'arrest', 'bail', 'jail', 'prison', 'violence', 'harassment', 'domestic', 'abuse',
      'cop', 'police', 'snatched', 'bike', 'vehicle', 'car', 'seized', 'seizure', 'confiscated',
      'stole', 'stolen', 'stealing', 'theft', 'robbery', 'burglary'
    ];
    
    const containsLegalKeywords = seriousLegalKeywords.some(keyword => lowerText.includes(keyword));
    
    // Check for obvious gibberish patterns - more lenient
    const isGibberish = words.length < 2 ||
                       /^[a-z]{15,}$/i.test(caseDescription.replace(/\s/g, '')) ||
                       (/^[a-z\s]+$/i.test(caseDescription) && words.every(word => word.length < 2));
    
    // If it contains legal keywords, it's valid even if short
    const isValid = containsLegalKeywords || !isGibberish || words.length >= 3;
    
    let reason = "";
    let clarificationNeeded = "";
    let confidence = 0.5;
    
    if (containsLegalKeywords) {
      reason = "Input mentions serious legal matter requiring immediate attention";
      clarificationNeeded = "";
      confidence = 0.9;
    } else if (isGibberish && words.length < 3) {
      reason = "Input appears to be gibberish or too short";
      clarificationNeeded = "Please describe your legal issue in detail (e.g., property dispute, divorce case, criminal matter, etc.)";
      confidence = 0.2;
    } else {
      reason = "Input seems to contain meaningful information";
      clarificationNeeded = "";
      confidence = 0.8;
    }
    
    return {
      isValid,
      reason,
      clarificationNeeded,
      confidence
    };
  }
}

// Analyze case using real Gemini AI
app.post("/api/analyze-case", async (req, res) => {
  const { caseDescription, city } = req.body;

  try {
    // First validate the case description
    const validation = await validateCaseDescription(caseDescription);
    
    if (!validation.isValid) {
      return res.json({
        needsClarification: true,
        message: validation.reason,
        clarificationQuestion: validation.clarificationNeeded,
        confidence: validation.confidence
      });
    }

    if (validation.clarificationNeeded) {
      return res.json({
        needsClarification: true,
        message: "I need more details to understand your case properly.",
        clarificationQuestion: validation.clarificationNeeded,
        confidence: validation.confidence
      });
    }
    // First, get comprehensive legal guidance
    const guidancePrompt = `
    You are an expert Indian legal advisor providing detailed guidance for a legal case. Analyze the case description and provide comprehensive legal advice.

    Case Description: "${caseDescription}"
    City: "${city}"
    
    Provide detailed legal guidance in this exact JSON format:
    {
      "legalGuidance": {
        "summary": "Brief summary of the legal issue",
        "severity": "Critical|Serious|Moderate|Minor",
        "urgency": "Immediate|High|Normal|Low",
        "recommendedLawyerType": "Specific type of lawyer needed",
        "relevantLaws": ["Law1", "Law2", "Law3"],
        "immediateSteps": ["Step 1", "Step 2", "Step 3"],
        "documentsNeeded": ["Document 1", "Document 2", "Document 3"],
        "legalProcess": "Detailed explanation of the legal process",
        "timeline": "Expected timeline for resolution",
        "costEstimate": "Estimated legal costs",
        "successProbability": "High|Medium|Low",
        "risks": ["Risk 1", "Risk 2"],
        "additionalAdvice": "Additional important advice"
      },
      "caseAnalysis": {
        "specialization": "Family|Criminal|Property|Corporate|Cyber|Civil",
        "subSpecialty": "Specific sub-specialty name",
        "caseType": "Brief category name",
        "keywords": ["keyword1", "keyword2", "keyword3"],
        "description": "Brief description of the legal matter"
      }
    }
    
    IMPORTANT GUIDELINES:
    - Focus on Indian law context
    - Provide practical, actionable advice
    - Include specific sections of relevant Indian laws (CrPC, IPC, etc.)
    - Give realistic timelines and cost estimates
    - Consider the city context for local procedures
    - Be thorough but clear and organized
    - Include both immediate steps and long-term strategy
    - Mention potential risks and mitigation strategies
    
    Example for police seizure case:
    - Mention CrPC sections 102, 451, 457
    - Suggest filing application before Judicial Magistrate
    - Include steps for obtaining seizure memo
    - Mention option of writ petition in High Court
    `;
    
    let guidanceResult;
    try {
      const guidanceResponse = await model.generateContent(guidancePrompt);
      const guidanceText = guidanceResponse.response.text();
      
      console.log("Gemini guidance response:", guidanceText);
      
      let guidanceJsonMatch = guidanceText.match(/\{[\s\S]*\}/);
      if (!guidanceJsonMatch) {
        guidanceJsonMatch = guidanceText.match(/```json\s*(\{[\s\S]*?\})\s*```/);
      }
      
      if (guidanceJsonMatch) {
        guidanceResult = JSON.parse(guidanceJsonMatch[1] || guidanceJsonMatch[0]);
        console.log("Parsed guidance result:", guidanceResult);
      }
    } catch (guidanceError) {
      console.error("Guidance generation error:", guidanceError);
    }

    // Build a dynamic knowledge base string from the imported specializations
    const knowledgeBase = Object.entries(LEGAL_SPECIALIZATIONS)
      .map(([category, data]) => {
        const subs = Object.keys(data.subSpecialties).join(", ");
        return `- ${category}: ${data.description} (Includes: ${subs})`;
      })
      .join("\n");

    // Now get the lawyer matching analysis
    const analysisPrompt = `
    You are a highly intelligent legal AI assistant for the Indian judicial system. Your goal is to analyze a case description and classify it into the correct legal domain for lawyer matching.

    CASE DESCRIPTION: "${caseDescription}"

    ---
    
    LEGAL KNOWLEDGE BASE (Use this to understand specific legal issues):
    ${knowledgeBase}

    ---

    Your task is to map the case to one of the following 6 STRICT Database Categories:
    1. **Criminal**: Theft, Murder, Assault, Violence, Drugs (NDPS), Cheating (420), Forgery, Police Harassment, Bail, Cyber Crime (if serious).
    2. **Family**: Divorce, Child Custody, Maintenance, Domestic Violence (Protection), Restitution of Conjugal Rights, Adoption.
    3. **Property**: Land Disputes, Illegal Possession, Ancestral Property, Real Estate, Builder Disputes (RERA), Tenant/Landlord Eviction.
    4. **Corporate**: Business Contracts, Company Formation, Startups, M&A, Insolvency, Intellectual Property (IPR), Taxation (Income Tax/GST), Banking & Finance.
    5. **Cyber**: Online Fraud, Hacking, Data Privacy, Social Media Abuse.
    6. **Civil**: Everything else - Breach of Contract, Money Recovery, Employment/Labor, Consumer Disputes, Medical Negligence, Education, Insurance Claims, Motor Accidents, Defamation.

    IMPORTANT MAPPING RULES:
    - **Theft/Stealing** is ALWAYS **Criminal**.
    - **Taxation/GST** -> Map to **Corporate**.
    - **Intellectual Property (IPR)** -> Map to **Corporate**.
    - **Banking/Loans** -> Map to **Corporate** (unless pure fraud -> Criminal).
    - **Employment/Labor** -> Map to **Civil**.
    - **Medical Negligence** -> Map to **Civil**.
    - **Consumer Disputes** -> Map to **Civil**.
    - **Cyber Crime** -> Prefer **Cyber** if it involves online/digital tech, otherwise **Criminal**.

    SPECIFIC INDIAN CONTEXT:
    - "Stole current" or "Current theft" refers to **Electricity Theft**. This is a **CRIMINAL** offense (Theft).
    - "Cheating" (420) is **Criminal**.
    - "Bail" matters are **Criminal**.

    ---

    RESPONSE FORMAT (JSON ONLY):
    {
      "reasoning": "Explain your classification logic step-by-step. Mention specific keywords found.",
      "specialization": "Criminal|Family|Property|Corporate|Cyber|Civil",
      "subSpecialty": "The most precise sub-category from the Knowledge Base (e.g., 'Murder & Homicide', 'Income Tax', 'Medical Negligence')",
      "severity": "High|Medium|Low",
      "urgency": "Immediate|High|Normal|Low",
      "description": "A professional legal summary of the case",
      "keywords": ["keyword1", "keyword2", "keyword3"],
      "caseType": "Brief display title (e.g., 'Tax Dispute')"
    }
    `;

    const result = await model.generateContent(analysisPrompt);
    const response = await result.response;
    const text = response.text();

    console.log("Gemini analysis response:", text); // Debug log

    // Extract JSON from the response - more robust parsing
    let jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      // Try to find JSON in different formats
      jsonMatch = text.match(/```json\s*(\{[\s\S]*?\})\s*```/);
      if (!jsonMatch) {
        console.error("No JSON found in Gemini analysis response:", text);
        throw new Error("Invalid response format from Gemini - no JSON found");
      }
    }

    let analysis;
    try {
      analysis = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      console.log("Parsed analysis result:", analysis); // Debug log
    } catch (parseError) {
      console.error("JSON parsing error for analysis:", parseError, "Raw text:", jsonMatch[0]);
      throw new Error(`Failed to parse Gemini analysis: ${parseError.message}`);
    }

    // Validate the parsed analysis has required fields
    if (!analysis.specialization || !analysis.subSpecialty) {
      console.error("Invalid analysis structure:", analysis);
      throw new Error("Invalid analysis structure from Gemini");
    }

    // Find and score matching lawyers in the specified city
    const db = readDB();
    console.log("=== DEBUG INFO ===");
    console.log("City:", city);
    console.log("Analysis:", analysis);
    console.log("Total lawyers in DB:", db.lawyers.length);

    const scoredLawyers = db.lawyers
      .filter((lawyer) => {
        const cityMatch = lawyer.location
          .toLowerCase()
          .includes(city.toLowerCase());
        const specializationMatch = lawyer.specialization === analysis.specialization;
        return cityMatch && specializationMatch;
      })
      .map((lawyer) => {
        let score = 50; // Base score for matching specialization and city
        
        // Enhanced matching for property disputes
        if (analysis.specialization === 'Property') {
          // Exact sub-specialty match gets highest bonus
          if (lawyer.sub_specialty.toLowerCase() === analysis.subSpecialty.toLowerCase()) {
            score += 50;
          }
          // Special bonus for "Land Disputes & Title Issues" - this is the most relevant for property disputes
          else if (lawyer.sub_specialty.toLowerCase().includes('land disputes') ||
                   lawyer.sub_specialty.toLowerCase().includes('title issues') ||
                   lawyer.sub_specialty.toLowerCase().includes('partition')) {
            score += 40;
          }
          // Bonus for related property sub-specialties
          else if (lawyer.sub_specialty.toLowerCase().includes('property') ||
                   lawyer.sub_specialty.toLowerCase().includes('real estate')) {
            score += 30;
          }
          // Bonus for civil lawyers with property partition expertise
          else if (lawyer.specialization === 'Civil' &&
                   (lawyer.sub_specialty.toLowerCase().includes('partition') ||
                    lawyer.sub_specialty.toLowerCase().includes('property'))) {
            score += 25;
          }
          // Bonus for family lawyers with property division expertise
          else if (lawyer.specialization === 'Family' &&
                   lawyer.sub_specialty.toLowerCase().includes('property')) {
            score += 20;
          }
          // Keyword matching in sub-specialty
          else if (analysis.keywords.some(keyword =>
              lawyer.sub_specialty.toLowerCase().includes(keyword.toLowerCase())
          )) {
            score += 15;
          }
        } else {
          // Original logic for non-property cases
          // Bonus for exact sub-specialty match
          if (lawyer.sub_specialty.toLowerCase() === analysis.subSpecialty.toLowerCase()) {
            score += 50;
          }
          // Partial match for sub-specialty containing keywords
          else if (analysis.keywords.some(keyword =>
              lawyer.sub_specialty.toLowerCase().includes(keyword.toLowerCase())
          )) {
            score += 25;
          }
        }
        
        // Enhanced experience bonus for property disputes
        if (analysis.specialization === 'Property' && analysis.severity === 'High') {
          if (lawyer.experience >= 15) {
            score += 15; // Higher bonus for very experienced lawyers
          } else if (lawyer.experience >= 10) {
            score += 10;
          } else if (lawyer.experience >= 5) {
            score += 5;
          }
        }
        // Standard experience bonus for other cases
        else if (analysis.severity === 'High' && lawyer.experience >= 10) {
          score += 10;
        }
        
        // Bonus for high urgency cases - prioritize lawyers with reasonable fees
        if (analysis.urgency === 'Immediate' || analysis.urgency === 'High') {
          if (lawyer.fee <= 1000) {
            score += 5; // Small bonus for affordable lawyers in urgent cases
          }
        }
        
        return {
          ...lawyer,
          matchScore: score,
          matchReason: score >= 100 ? 'Exact sub-specialty match' :
                      score >= 85 ? 'Highly relevant sub-specialty' :
                      score >= 75 ? 'Related sub-specialty' :
                      score >= 65 ? 'Partial specialization match' :
                      'Specialization match'
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore);

    console.log(
      "Scored lawyers:",
      scoredLawyers.map((l) => `${l.name} (${l.matchScore}: ${l.matchReason})`)
    );
    console.log("==================");

    // Group lawyers by match quality
    const exactMatches = scoredLawyers.filter(l => l.matchScore >= 100);
    const relatedMatches = scoredLawyers.filter(l => l.matchScore >= 75 && l.matchScore < 100);
    const generalMatches = scoredLawyers.filter(l => l.matchScore < 75);

    res.json({
      legalGuidance,
      analysis: {
        ...analysis,
        caseType: analysis.specialization // Keep backward compatibility
      },
      matchingLawyers: scoredLawyers,
      exactMatches,
      relatedMatches,
      generalMatches,
      city: city,
      totalMatches: scoredLawyers.length,
    });
  } catch (error) {
    console.error("Gemini API Error:", error);

    // Enhanced fallback using the comprehensive rules engine from specializations.js
    // This ensures consistent classification even if the AI fails or is blocked
    const fallbackAnalysis = findBestSpecialization(caseDescription, city);
    
    const analysis = {
      specialization: fallbackAnalysis.specialization,
      subSpecialty: fallbackAnalysis.subSpecialty,
      severity: fallbackAnalysis.severity,
      urgency: fallbackAnalysis.urgency,
      description: fallbackAnalysis.description,
      keywords: fallbackAnalysis.keywords,
      caseType: fallbackAnalysis.subSpecialty,
      reasoning: `Automated Keyword Analysis: Matched keywords [${fallbackAnalysis.keywords.join(', ')}] to category '${fallbackAnalysis.specialization}'`
    };

    const db = readDB();
    
    // Enhanced matching with scoring for fallback
    const scoredLawyers = db.lawyers
      .filter((lawyer) => {
        const cityMatch = lawyer.location
          .toLowerCase()
          .includes(city.toLowerCase());
        const specializationMatch = lawyer.specialization === analysis.specialization;
        return cityMatch && specializationMatch;
      })
      .map((lawyer) => {
        let score = 50; // Base score for matching specialization and city
        
        // Enhanced matching for property disputes
        if (analysis.specialization === 'Property') {
          // Exact sub-specialty match gets highest bonus
          if (lawyer.sub_specialty.toLowerCase() === analysis.subSpecialty.toLowerCase()) {
            score += 50;
          }
          // Special bonus for "Land Disputes & Title Issues" - this is the most relevant for property disputes
          else if (lawyer.sub_specialty.toLowerCase().includes('land disputes') ||
                   lawyer.sub_specialty.toLowerCase().includes('title issues') ||
                   lawyer.sub_specialty.toLowerCase().includes('partition')) {
            score += 40;
          }
          // Bonus for related property sub-specialties
          else if (lawyer.sub_specialty.toLowerCase().includes('property') ||
                   lawyer.sub_specialty.toLowerCase().includes('real estate')) {
            score += 30;
          }
          // Bonus for civil lawyers with property partition expertise
          else if (lawyer.specialization === 'Civil' &&
                   (lawyer.sub_specialty.toLowerCase().includes('partition') ||
                    lawyer.sub_specialty.toLowerCase().includes('property'))) {
            score += 25;
          }
          // Bonus for family lawyers with property division expertise
          else if (lawyer.specialization === 'Family' &&
                   lawyer.sub_specialty.toLowerCase().includes('property')) {
            score += 20;
          }
          // Keyword matching in sub-specialty
          else if (analysis.keywords.some(keyword =>
              lawyer.sub_specialty.toLowerCase().includes(keyword.toLowerCase())
          )) {
            score += 15;
          }
        } else {
          // Original logic for non-property cases
          // Bonus for exact sub-specialty match
          if (lawyer.sub_specialty.toLowerCase() === analysis.subSpecialty.toLowerCase()) {
            score += 50;
          }
          // Partial match for sub-specialty containing keywords
          else if (analysis.keywords.some(keyword =>
              lawyer.sub_specialty.toLowerCase().includes(keyword.toLowerCase())
          )) {
            score += 25;
          }
        }
        
        // Enhanced experience bonus for property disputes
        if (analysis.specialization === 'Property' && analysis.severity === 'High') {
          if (lawyer.experience >= 15) {
            score += 15; // Higher bonus for very experienced lawyers
          } else if (lawyer.experience >= 10) {
            score += 10;
          } else if (lawyer.experience >= 5) {
            score += 5;
          }
        }
        // Standard experience bonus for other cases
        else if (analysis.severity === 'High' && lawyer.experience >= 10) {
          score += 10;
        }
        
        // Bonus for high urgency cases - prioritize lawyers with reasonable fees
        if (analysis.urgency === 'Immediate' || analysis.urgency === 'High') {
          if (lawyer.fee <= 1000) {
            score += 5; // Small bonus for affordable lawyers in urgent cases
          }
        }
        
        return {
          ...lawyer,
          matchScore: score,
          matchReason: score >= 100 ? 'Exact sub-specialty match' :
                      score >= 85 ? 'Highly relevant sub-specialty' :
                      score >= 75 ? 'Related sub-specialty' :
                      score >= 65 ? 'Partial specialization match' :
                      'Specialization match'
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore);

    // Group lawyers by match quality
    const exactMatches = scoredLawyers.filter(l => l.matchScore >= 100);
    const relatedMatches = scoredLawyers.filter(l => l.matchScore >= 75 && l.matchScore < 100);
    const generalMatches = scoredLawyers.filter(l => l.matchScore < 75);

    // Create fallback legal guidance for error cases
    const fallbackLegalGuidance = {
      summary: analysis.description || "Legal matter requiring professional consultation",
      severity: analysis.severity === "High" ? "Serious" : analysis.severity === "Medium" ? "Moderate" : "Minor",
      urgency: analysis.urgency,
      recommendedLawyerType: `${analysis.specialization} Lawyer specializing in ${analysis.subSpecialty}`,
      relevantLaws: fallbackAnalysis.relevantLaws || [],
      immediateSteps: ["Consult a qualified lawyer immediately", "Gather all relevant documents", "Follow legal advice carefully"],
      documentsNeeded: ["Identity proof", "Address proof", "Case-related documents"],
      legalProcess: "Your lawyer will guide you through the specific legal process based on your case details.",
      timeline: "Depends on case complexity and court procedures",
      costEstimate: "Varies based on lawyer experience and case complexity",
      successProbability: "Medium",
      risks: ["Legal delays", "Documentation issues"],
      additionalAdvice: "Follow your lawyer's guidance and maintain proper documentation"
    };

    res.json({
      legalGuidance: fallbackLegalGuidance,
      analysis: {
        ...analysis,
        caseType: analysis.specialization // Keep backward compatibility
      },
      matchingLawyers: scoredLawyers,
      exactMatches,
      relatedMatches,
      generalMatches,
      city: city,
      totalMatches: scoredLawyers.length,
      fallback: true,
    });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log("Backend listening on", PORT));
