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
  model: "gemini-2.5-flash",
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
    users: [
      {
        id: 100,
        name: "Demo Client",
        email: "client@gmail.com",
        password: "Client@123",
        role: "client"
      },
      {
        id: 200,
        name: "Demo Lawyer",
        email: "lawyer@gmail.com",
        password: "Lawyer@123",
        role: "lawyer"
      }
    ],
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
  const { role, name, email, city, specialization, sub_specialty, fee, experience, about, password } =
    req.body;
  
  // Debug logging for sub_specialty
  console.log('🔍 Registration data received:', {
    role, name, email, city, specialization, sub_specialty, fee, experience, about,
    hasPassword: !!password
  });
  
  if (role === "lawyer") {
    // Validate required fields for lawyer registration
    if (!name || !email || !password || !city || !specialization || !sub_specialty || !fee || !experience) {
      return res.json({
        ok: false,
        error: "Missing required fields: name, email, password, city, specialization, sub_specialty, fee, experience"
      });
    }

    const id = Date.now();
    const newLawyer = {
      id,
      name,
      specialization: specialization || "General",
      sub_specialty: sub_specialty,
      experience: Number(experience) || 0,
      location: city || "",
      fee: Number(fee) || 0,
      image: `https://i.pravatar.cc/150?u=${id}`,
      about: about || "",
    };
    
    // Store lawyer in lawyers array
    db.lawyers.push(newLawyer);
    
    // Store lawyer credentials in users array for login (HASH PASSWORD)
    const crypto = require('crypto');
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
    
    db.users.push({
      id,
      name,
      role: "lawyer",
      email,
      password: hashedPassword // Store hashed password for security
    });
    
    writeDB(db);
    console.log(`✅ Lawyer registered: ${name} (${email}) - ID: ${id}`);
    
    return res.json({
      ok: true,
      user: {
        id,
        name,
        role: "lawyer",
        email,
        specialization: newLawyer.specialization,
        location: newLawyer.location
      }
    });
  } else {
    // Client registration
    if (!name || !email) {
      return res.json({
        ok: false,
        error: "Missing required fields: name, email"
      });
    }
    
    const id = Date.now();
    db.users.push({
      id,
      name,
      role: "client",
      email,
      password: password || "" // Optional password for clients
    });
    writeDB(db);
    
    return res.json({
      ok: true,
      user: {
        id,
        name,
        role: "client"
      }
    });
  }
});

// Login with email/password authentication
app.post("/api/login", (req, res) => {
  const { email, password, role } = req.body;
  const db = readDB();
  const crypto = require('crypto');
  
  // Find user by email and role first
  const user = db.users.find(u =>
    u.email === email &&
    u.role === role
  );
  
  // Debug logging for login attempts
  console.log(`🔍 Login attempt: ${email} (${role})`);
  console.log(`🔍 Looking for user with email: ${email}`);
  
  if (user) {
    console.log(`🔍 Found user:`, {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    });
    
    // Hash the provided password and compare with stored hash
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
    const isPasswordValid = hashedPassword === user.password;
    
    console.log(`🔍 Password validation: ${isPasswordValid ? '✅ Valid' : '❌ Invalid'}`);
    
    if (isPasswordValid) {
      console.log(`✅ ${role} login successful: ${user.name} (${email}) - ID: ${user.id}`);
      
      // For lawyers, also fetch their lawyer details
      let userData = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      };
      
      if (role === "lawyer") {
        const lawyerDetails = db.lawyers.find(l => l.id === user.id);
        if (lawyerDetails) {
          userData = {
            ...userData,
            specialization: lawyerDetails.specialization,
            location: lawyerDetails.location,
            fee: lawyerDetails.fee,
            experience: lawyerDetails.experience
          };
          console.log(`✅ Lawyer details loaded: ${lawyerDetails.name} - ${lawyerDetails.specialization}`);
        }
      }
      
      return res.json({
        ok: true,
        user: userData
      });
    } else {
      console.log(`❌ Password mismatch for: ${email} (${role})`);
      return res.json({
        ok: false,
        error: "Invalid email, password, or role"
      });
    }
  } else {
    // Check for dummy accounts if not found in DB (these use plain text passwords)
    if (role === "lawyer" && email === "lawyer@gmail.com" && password === "Lawyer@123") {
      console.log(`✅ Demo lawyer login: lawyer@gmail.com`);
      return res.json({
        ok: true,
        user: {
          id: 200,
          name: "Demo Lawyer",
          email: "lawyer@gmail.com",
          role: "lawyer",
          specialization: "Criminal",
          location: "Mumbai",
          fee: 500,
          experience: 10
        },
      });
    } else if (role === "client" && email === "client@gmail.com" && password === "Client@123") {
      console.log(`✅ Demo client login: client@gmail.com`);
      return res.json({
        ok: true,
        user: {
          id: 100,
          name: "Demo Client",
          email: "client@gmail.com",
          role: "client"
        },
      });
    } else {
      console.log(`❌ User not found: ${email} (${role})`);
      return res.json({
        ok: false,
        error: "Invalid email, password, or role"
      });
    }
  }
});

// Create booking
app.post("/api/bookings", (req, res) => {
  const db = readDB();
  const booking = req.body;
  
  // Ensure booking has all required fields
  const completeBooking = {
    id: Date.now(),
    lawyerId: booking.lawyerId,
    lawyerName: booking.lawyerName,
    clientId: booking.clientId,
    clientName: booking.clientName,
    clientEmail: booking.clientEmail || (db.users.find(u => u.id === booking.clientId)?.email),
    date: booking.date,
    time: booking.time,
    duration: booking.duration || 1,
    fee: booking.fee,
    caseType: booking.caseType || 'General Consultation',
    status: booking.status || 'confirmed',
    paymentId: booking.paymentId,
    paymentMethod: booking.paymentMethod,
    paidAt: booking.paidAt,
    createdAt: booking.createdAt || new Date().toISOString()
  };
  
  db.bookings.push(completeBooking);
  writeDB(db);
  res.json({ ok: true, booking: completeBooking });
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

// Helper functions for fuzzy matching
function levenshteinDistance(str1, str2) {
  const matrix = [];
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[str2.length][str1.length];
}

function calculateSimilarity(str1, str2) {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  if (longer.length === 0) return 1.0;
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

// ... (previous code)

// Context from: https://www.advocateshivakumar.com/2025/11/types-of-court-cases-in-india-complete.html
const INDIAN_COURT_CASES_CONTEXT = `
**Types of Court Cases in India & Relevant Acts**

1. **Criminal Cases**: Offenses against State/society.
   - *Acts/Sections*: IPC (Theft, Cheating 420, Assault, Murder 302), CrPC (Bail, Anticipatory Bail, Quash 482), NDPS Act (Drugs), POCSO Act, Domestic Violence Act (498A), Negotiable Instruments Act (Cheque Bounce Sec 138).
   
2. **Civil Cases**: Disputes between individuals/organizations.
   - *Types*: Property disputes, Injunction suits, Partition suits, Specific Performance, Money Recovery suits, Rent Control.
   - *Acts*: CPC (Civil Procedure Code), Specific Relief Act, Transfer of Property Act.

3. **Family & Matrimonial Cases**: Family Courts.
   - *Types*: Divorce (Mutual/Contested), Maintenance (Sec 125 CrPC), Child Custody, Restitution of Conjugal Rights (RCR), Guardianship.
   - *Acts*: Hindu Marriage Act, Special Marriage Act, DV Act.

4. **Consumer Cases**: Consumer Commissions.
   - *Types*: Deficiency of service, Unfair trade practices, Real-estate builder disputes, Insurance claim rejections, Product defects.
   - *Acts*: Consumer Protection Act 2019.

5. **Labour & Industrial Cases**: Employer-employee disputes.
   - *Types*: Illegal termination, Back wages, Gratuity, Bonus, PF issues.
   - *Acts*: Industrial Disputes Act, Payment of Gratuity Act.

6. **Corporate & Commercial Cases**: NCLT / Commercial Courts.
   - *Types*: Insolvency & Bankruptcy (IBC), Company Law disputes, Shareholder oppression, Mergers.
   - *Acts*: Companies Act 2013, IBC 2016.

7. **Taxation Cases**: Government tax disputes.
   - *Types*: GST appeals, Income Tax appeals, Customs & Excise.
   - *Acts*: GST Act, Income Tax Act 1961.

8. **Revenue & Land Matters**: Tahsildar/Collector/Revenue Courts.
   - *Types*: Mutation, Pattadar passbook, Land survey, Encroachment.
   - *Acts*: State Land Revenue Acts.

9. **Writ Petitions**: High Court / Supreme Court (Constitutional).
   - *Types*: Mandamus (Order to official), Habeas Corpus (Missing person), Certiorari (Quash order), PIL (Public Interest).
   - *Acts*: Constitution of India (Art 226, Art 32).

10. **Motor Accident Claims (MACT)**: Road accidents.
    - *Types*: Injury compensation, Death claims, Third-party insurance.
    - *Acts*: Motor Vehicles Act.

11. **Intellectual Property (IPR)**: Business rights.
    - *Types*: Trademark infringement, Copyright violation, Patent disputes.
    - *Acts*: Trademarks Act, Copyright Act.

12. **Cyber Law Cases**: Online offenses.
    - *Types*: Online fraud, Phishing, Cyber-stalking, Data theft.
    - *Acts*: Information Technology Act 2000.

13. **Arbitration & ADR**: Out-of-court settlement.
    - *Types*: Contractual disputes with arbitration clause.
    - *Acts*: Arbitration and Conciliation Act 1996.
`;

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
    
    Use the following Indian Legal Context to inform your analysis:
    ${INDIAN_COURT_CASES_CONTEXT}

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
    - Include specific sections of relevant Indian laws (CrPC, IPC, etc.) based on the context provided.
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

    Use the following Indian Legal Context to inform your classification:
    ${INDIAN_COURT_CASES_CONTEXT}

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
    // ... (rest of the function)
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
        const lawyerCity = lawyer.location.toLowerCase();
        const searchCity = city.toLowerCase();
        
        // Fuzzy match for city (handle typos like 'derahrun' -> 'dehradun')
        const citySimilarity = calculateSimilarity(lawyerCity, searchCity);
        const isCityMatch = lawyerCity.includes(searchCity) || 
                           searchCity.includes(lawyerCity) || 
                           citySimilarity > 0.4; // Allow 40%+ similarity (e.g. "derahrun" vs "dehradun" is ~0.5)

        const specializationMatch = lawyer.specialization === analysis.specialization;
        
        // Debug logging for Dehradun/Derahrun case
        if (searchCity.includes('dehra') || searchCity.includes('derah')) {
             if (lawyerCity.includes('dehra')) {
                 console.log(`Checking ${lawyer.name} (${lawyer.location}): Sim=${citySimilarity.toFixed(2)}, CityMatch=${isCityMatch}, SpecMatch=${specializationMatch} (Req: ${analysis.specialization}, Has: ${lawyer.specialization})`);
             }
        }

        return isCityMatch && specializationMatch;
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
    
    // Normalize specialization to match DB categories
    const CATEGORY_MAPPING = {
      "Criminal Law": "Criminal",
      "Family Law": "Family",
      "Property & Real Estate Law": "Property",
      "Corporate / Commercial Law": "Corporate",
      "Taxation Law": "Corporate",
      "Labour & Employment Law": "Civil",
      "Consumer Protection Law": "Civil",
      "Cyber Law": "Cyber",
      "Intellectual Property (IPR) Law": "Corporate",
      "Immigration & Passport Law": "Civil",
      "Banking & Finance Law": "Corporate",
      "Environmental Law": "Civil",
      "Medical / Healthcare Law": "Civil",
      "Education Law": "Civil"
    };

    const dbSpecialization = CATEGORY_MAPPING[fallbackAnalysis.specialization] || "Civil"; // Default to Civil if mapping fails

    const analysis = {
      specialization: dbSpecialization,
      subSpecialty: fallbackAnalysis.subSpecialty,
      severity: fallbackAnalysis.severity,
      urgency: fallbackAnalysis.urgency,
      description: fallbackAnalysis.description,
      keywords: fallbackAnalysis.keywords,
      caseType: fallbackAnalysis.subSpecialty,
      reasoning: `Automated Keyword Analysis: Matched keywords [${fallbackAnalysis.keywords.join(', ')}] to category '${dbSpecialization}'`
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
