const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const DB_FILE = path.join(__dirname, "db.json");

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI("AIzaSyD2fD3IeBNvGq5P6pJEmHoYAYmsH-fDKaY");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

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

    // Now get the lawyer matching analysis
    const analysisPrompt = `
    You are a legal AI assistant specializing in Indian law. Analyze the case description and determine the exact lawyer specialization needed.

    Case Description: "${caseDescription}"
    
    IMPORTANT: Respond ONLY with this JSON format:
    {
      "specialization": "Family|Criminal|Property|Corporate|Cyber|Civil",
      "subSpecialty": "Specific sub-specialty name",
      "severity": "High|Medium|Low",
      "urgency": "Immediate|High|Normal|Low",
      "description": "Brief description of the legal matter",
      "keywords": ["keyword1", "keyword2", "keyword3"],
      "caseType": "Brief category name"
    }
    
    PRIORITY ANALYSIS:
    
    🚨 CRIMINAL MATTERS (Highest Priority):
    - kill/murder/death → "Murder & Homicide", severity: High, urgency: Immediate
    - assault/violence/abuse → "Assault & Violence", severity: High, urgency: High
    - theft/robbery → "Theft & Robbery", severity: Medium, urgency: High
    - fraud/scam → "White Collar Crimes", severity: Medium, urgency: High
    
    👨‍👩‍👧‍👦 FAMILY MATTERS:
    - divorce/separation → "Divorce & Custody", severity: Medium, urgency: Normal
    - child custody → "Child Custody & Support", severity: Medium, urgency: Normal
    - domestic violence → "Domestic Violence & Protection", severity: High, urgency: High
    - inheritance/will → "Inheritance & Will Disputes", severity: Medium, urgency: Normal
    
    🏠 PROPERTY MATTERS (Very Common):
    - land/property dispute → "Land Disputes & Title Issues", severity: High, urgency: High
    - brother/sister/family property → "Land Disputes & Title Issues", severity: High, urgency: High
    - illegal occupation/taken over → "Land Disputes & Title Issues", severity: High, urgency: High
    - ancestral/joint property → "Land Disputes & Title Issues", severity: High, urgency: High
    - house/real estate → "Real Estate Disputes", severity: Medium, urgency: Normal
    
    💼 CORPORATE MATTERS:
    - business/contract → "Business Contracts", severity: Medium, urgency: Normal
    - company/compliance → "Company Formation & Compliance", severity: Low, urgency: Normal
    - M&A/business sale → "Mergers & Acquisitions", severity: High, urgency: Normal
    
    💻 CYBER MATTERS:
    - hacking/fraud online → "Cyber Crime & Hacking", severity: High, urgency: Immediate
    - data privacy → "Data Privacy & Security", severity: Medium, urgency: High
    
    ⚖️ CIVIL MATTERS:
    - injury/accident → "Personal Injury & Accidents", severity: Medium, urgency: Normal
    - consumer dispute → "Consumer Disputes", severity: Low, urgency: Normal
    - employment issue → "Employment & Labor Law", severity: Medium, urgency: Normal
    
    KEYWORDS TO WATCH FOR:
    - Property: land, house, property, brother, sister, family, ancestral, joint, occupation, taken, share, plot
    - Criminal: kill, murder, death, assault, theft, fraud, violence, abuse
    - Family: divorce, custody, wife, husband, marriage, children, domestic
    - Corporate: business, contract, company, partnership, M&A
    - Cyber: online, hacking, fraud, data, privacy, cyber
    
    Be thorough but decisive. Pick the most appropriate category based on the main issue.
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

    // Enhanced fallback with sub-specialty detection
    const text = caseDescription.toLowerCase();
    let analysis = {
      specialization: "General",
      subSpecialty: "General Practice",
      severity: "Medium",
      urgency: "Normal",
      description: "Legal matter requiring professional consultation",
      keywords: [],
      caseType: "Civil Matter"
    };

    // Enhanced keyword matching with sub-specialties - more comprehensive patterns
    const words = text.split(/\s+/);
    const hasWord = (word) => words.includes(word);
    const hasAnyWord = (wordList) => wordList.some(word => text.includes(word));
    const hasWordsInSequence = (word1, word2) => text.includes(word1) && text.includes(word2);
    
    // CRIMINAL MATTERS - Highest priority
    if (hasAnyWord(["kill", "killed", "killing", "murder", "homicide", "death", "die"]) ||
        hasWordsInSequence("father", "kill") || hasWordsInSequence("mother", "kill") ||
        hasWordsInSequence("family", "kill") || hasWordsInSequence("someone", "kill")) {
      analysis = {
        specialization: "Criminal",
        subSpecialty: "Murder & Homicide",
        severity: "High",
        urgency: "Immediate",
        description: "Extremely serious criminal matter involving homicide charges - immediate legal assistance required",
        keywords: ["murder", "homicide", "killing", "criminal", "death"],
        caseType: "Homicide"
      };
    } else if (hasAnyWord(["assault", "violence", "abuse", "harassment", "threat", "hurt", "harm"]) ||
               hasWordsInSequence("domestic", "violence") || hasWordsInSequence("physical", "harm")) {
      analysis = {
        specialization: "Criminal",
        subSpecialty: "Assault & Violence",
        severity: "High",
        urgency: "High",
        description: "Criminal matter involving assault, violence, or abuse - urgent legal assistance needed",
        keywords: ["assault", "violence", "abuse", "harassment", "threat"],
        caseType: "Assault/Violence"
      };
    } else if (hasAnyWord(["theft", "stealing", "robbery", "burglary", "stolen", "cheat", "scam", "snatched", "seized", "confiscated"])) {
      analysis = {
        specialization: "Criminal",
        subSpecialty: "Theft & Robbery",
        severity: "High",
        urgency: "Immediate",
        description: "Criminal matter involving theft, robbery, or illegal seizure of property - immediate legal assistance required",
        keywords: ["theft", "robbery", "stealing", "snatched", "seized", "property"],
        caseType: "Theft/Robbery"
      };
    }
    // FAMILY MATTERS
    else if (hasAnyWord(["divorce", "separation", "divorced"]) ||
              hasWordsInSequence("file", "divorce") || hasWordsInSequence("want", "divorce")) {
      analysis = {
        specialization: "Family",
        subSpecialty: "Divorce & Custody",
        severity: "Medium",
        urgency: "Normal",
        description: "Family law matter involving divorce or separation proceedings",
        keywords: ["divorce", "separation", "custody", "family"],
        caseType: "Divorce/Separation"
      };
    } else if (hasAnyWord(["custody", "child", "children", "maintenance", "alimony"]) ||
               hasWordsInSequence("child", "custody") || hasWordsInSequence("child", "support")) {
      analysis = {
        specialization: "Family",
        subSpecialty: "Child Custody & Support",
        severity: "Medium",
        urgency: "Normal",
        description: "Family law matter involving child custody or support",
        keywords: ["custody", "child", "support", "maintenance", "alimony"],
        caseType: "Child Custody"
      };
    } else if (hasAnyWord(["wife", "husband", "married", "marriage"]) &&
               hasAnyWord(["problem", "dispute", "issue", "trouble", "fight"])) {
      analysis = {
        specialization: "Family",
        subSpecialty: "Marriage & Divorce",
        severity: "Medium",
        urgency: "Normal",
        description: "Family law matter involving marital disputes",
        keywords: ["marriage", "wife", "husband", "family"],
        caseType: "Marital Dispute"
      };
    } else if (hasAnyWord(["inheritance", "will", "succession", "property", "share"]) &&
               hasAnyWord(["father", "mother", "parent", "family", "brother", "sister"])) {
      analysis = {
        specialization: "Family",
        subSpecialty: "Inheritance & Will Disputes",
        severity: "Medium",
        urgency: "Normal",
        description: "Family law matter involving inheritance or will disputes",
        keywords: ["inheritance", "will", "succession", "property"],
        caseType: "Inheritance Dispute"
      };
    }
    // PROPERTY MATTERS - Very comprehensive patterns
    else if (hasAnyWord(["property", "land", "house", "home", "real estate", "flat", "apartment"]) ||
             hasAnyWord(["plot", "ground", "site", "building"]) ||
             (hasAnyWord(["brother", "sister", "family", "relative"]) &&
              hasAnyWord(["property", "land", "house", "share", "take", "took"]))) {
      analysis = {
        specialization: "Property",
        subSpecialty: "Land Disputes & Title Issues",
        severity: "High",
        urgency: "High",
        description: "Property dispute involving ownership, title, or possession issues",
        keywords: ["property", "land", "dispute", "title", "possession", "ownership"],
        caseType: "Property Dispute"
      };
    } else if (hasAnyWord(["illegal", "occupation", "occupied", "takeover", "taken", "seized"]) ||
               hasWordsInSequence("illegal", "occupation") || hasWordsInSequence("taken", "over") ||
               hasWordsInSequence("property", "taken")) {
      analysis = {
        specialization: "Property",
        subSpecialty: "Land Disputes & Title Issues",
        severity: "High",
        urgency: "Immediate",
        description: "Urgent property matter involving illegal occupation or takeover",
        keywords: ["illegal", "occupation", "takeover", "property", "urgent"],
        caseType: "Illegal Occupation"
      };
    } else if (hasAnyWord(["ancestral", "joint", "partition", "share", "portion", "half"]) ||
               hasWordsInSequence("ancestral", "property") || hasWordsInSequence("joint", "property") ||
               hasWordsInSequence("property", "partition") || hasWordsInSequence("half", "plot")) {
      analysis = {
        specialization: "Property",
        subSpecialty: "Land Disputes & Title Issues",
        severity: "High",
        urgency: "High",
        description: "Property dispute involving ancestral or joint family property partition",
        keywords: ["ancestral", "joint", "partition", "property", "family"],
        caseType: "Property Partition"
      };
    }
    // CORPORATE MATTERS
    else if (hasAnyWord(["business", "company", "firm", "partnership", "corporate"]) ||
             hasWordsInSequence("business", "dispute") || hasWordsInSequence("company", "matter")) {
      analysis = {
        specialization: "Corporate",
        subSpecialty: "Business Contracts",
        severity: "Medium",
        urgency: "Normal",
        description: "Matter involving business or corporate legal issues",
        keywords: ["business", "company", "corporate", "contract"],
        caseType: "Business Matter"
      };
    } else if (hasAnyWord(["contract", "agreement", "breach", "violation", "terms"])) {
      analysis = {
        specialization: "Corporate",
        subSpecialty: "Business Contracts",
        severity: "Medium",
        urgency: "Normal",
        description: "Matter involving business contracts or agreement breaches",
        keywords: ["contract", "agreement", "business", "breach"],
        caseType: "Contract Dispute"
      };
    }
    // POLICE/GOVERNMENT ACTIONS - New category for police-related issues
    else if (hasAnyWord(["cop", "police", "seized", "snatched", "confiscated", "arrested", "detained"]) ||
             hasWordsInSequence("cop", "snatched") || hasWordsInSequence("police", "seized") ||
             hasWordsInSequence("bike", "seized") || hasWordsInSequence("vehicle", "taken")) {
      analysis = {
        specialization: "Criminal",
        subSpecialty: "Criminal Procedure & Constitutional Law",
        severity: "High",
        urgency: "Immediate",
        description: "Legal matter involving police action, property seizure, or violation of rights - immediate legal assistance required",
        keywords: ["police", "seized", "snatched", "constitutional", "crpc", "rights"],
        caseType: "Police Action"
      };
    }
    // CYBER MATTERS
    else if (hasAnyWord(["cyber", "online", "hacking", "hack", "data", "privacy"]) ||
             hasWordsInSequence("online", "fraud") || hasWordsInSequence("cyber", "crime") ||
             hasWordsInSequence("account", "hacked")) {
      analysis = {
        specialization: "Cyber",
        subSpecialty: "Cyber Crime & Hacking",
        severity: "High",
        urgency: "Immediate",
        description: "Matter involving cyber crime, hacking, or online fraud",
        keywords: ["cyber", "online", "hacking", "fraud", "data"],
        caseType: "Cyber Crime"
      };
    }
    // CIVIL MATTERS
    else if (hasAnyWord(["injury", "accident", "compensation", "claim"]) ||
             hasWordsInSequence("personal", "injury") || hasWordsInSequence("car", "accident")) {
      analysis = {
        specialization: "Civil",
        subSpecialty: "Personal Injury & Accidents",
        severity: "Medium",
        urgency: "Normal",
        description: "Civil matter involving injury claims or accident compensation",
        keywords: ["injury", "accident", "compensation", "claim"],
        caseType: "Personal Injury"
      };
    } else if (hasAnyWord(["consumer", "product", "service", "complaint", "refund"])) {
      analysis = {
        specialization: "Civil",
        subSpecialty: "Consumer Disputes",
        severity: "Low",
        urgency: "Normal",
        description: "Civil matter involving consumer rights or product issues",
        keywords: ["consumer", "product", "service", "complaint"],
        caseType: "Consumer Dispute"
      };
    } else if (hasAnyWord(["employment", "job", "work", "employer", "employee", "salary", "termination"])) {
      analysis = {
        specialization: "Civil",
        subSpecialty: "Employment & Labor Law",
        severity: "Medium",
        urgency: "Normal",
        description: "Civil matter involving employment or labor disputes",
        keywords: ["employment", "job", "work", "employer", "labor"],
        caseType: "Employment Dispute"
      };
    }
    // DEFAULT FALLBACK
    else {
      // Try to determine at least a basic category
      if (text.length > 10) {
        analysis = {
          specialization: "Civil",
          subSpecialty: "General Practice",
          severity: "Medium",
          urgency: "Normal",
          description: "Legal matter requiring professional consultation and analysis",
          keywords: ["legal", "consultation", "advice"],
          caseType: "General Legal Matter"
        };
      }
    }

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
      relevantLaws: [],
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
