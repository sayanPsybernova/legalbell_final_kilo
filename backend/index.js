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
const genAI = new GoogleGenerativeAI("AIzaSyASbci512GXBFtrFX30nGmuUCiqYYjvU1Y");
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

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

// Analyze case using real Gemini AI
app.post("/api/analyze-case", async (req, res) => {
  const { caseDescription, city } = req.body;

  try {
    const prompt = `
    You are a legal AI assistant specializing in Indian law. Analyze the following case description and determine the exact lawyer specialization and sub-specialty needed.

    Case Description: "${caseDescription}"
    
    Please respond with a JSON object in this exact format:
    {
      "specialization": "Family|Criminal|Property|Corporate|Cyber|Civil",
      "subSpecialty": "Specific sub-specialty name (e.g., 'Murder & Homicide', 'Divorce & Custody', 'Real Estate Disputes')",
      "severity": "High|Medium|Low",
      "urgency": "Immediate|High|Normal|Low",
      "description": "Brief description of the legal matter",
      "keywords": ["keyword1", "keyword2", "keyword3"],
      "caseType": "Brief category name"
    }
    
    Rules for Indian legal cases and sub-specialties:
    
    FAMILY LAW:
    - "Divorce & Custody" for divorce, separation, child custody, alimony
    - "Marriage & Divorce" for marriage issues, divorce proceedings
    - "Child Custody & Support" for child custody, child support, maintenance
    - "Domestic Violence & Protection" for domestic violence, protection orders
    - "Inheritance & Will Disputes" for inheritance, will disputes, succession
    - "Family Dispute Resolution" for family mediation, dispute resolution
    - "Adoption & Guardianship" for adoption, guardianship matters
    
    CRIMINAL LAW:
    - "Murder & Homicide" for murder, homicide, killing cases
    - "Assault & Violence" for assault, violence, domestic abuse
    - "Theft & Robbery" for theft, robbery, burglary, stealing
    - "White Collar Crimes" for financial fraud, embezzlement, corporate crimes
    - "Narcotics & Drug Cases" for drug offenses, narcotics cases
    - "Cyber Crime & Hacking" for cyber crimes, hacking, IT violations
    
    PROPERTY LAW:
    - "Real Estate Disputes" for real estate disputes, property conflicts
    - "Land Disputes & Title Issues" for land disputes, title verification
    - "Rental & Lease Agreements" for rental disputes, lease issues
    - "Property Registration" for property registration, documentation
    - "Construction & Builder Disputes" for construction disputes, builder issues
    
    CORPORATE LAW:
    - "Business Contracts" for business contracts, commercial agreements
    - "Company Formation & Compliance" for company registration, compliance
    - "Mergers & Acquisitions" for M&A, business acquisitions
    - "Intellectual Property" for patents, trademarks, copyright
    - "Startup & Venture Capital" for startup incorporation, venture capital
    - "Taxation & GST" for tax matters, GST compliance
    
    CYBER LAW:
    - "Cyber Crime & Hacking" for cyber crimes, hacking offenses
    - "Data Privacy & Security" for data privacy, security breaches
    - "Online Fraud & Scams" for online fraud, cyber scams
    
    CIVIL LAW:
    - "Personal Injury & Accidents" for injury claims, accident compensation
    - "Consumer Disputes" for consumer rights, product liability
    - "Contract Disputes" for breach of contract, commercial disputes
    - "Employment & Labor Law" for employment disputes, labor issues
    - "Medical Negligence" for medical malpractice, negligence cases
    
    Consider the context of Indian legal system and be precise in determining the sub-specialty.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Invalid response format from Gemini");
    }

    const analysis = JSON.parse(jsonMatch[0]);

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
        
        // Bonus for high severity cases - prioritize experienced lawyers
        if (analysis.severity === 'High' && lawyer.experience >= 10) {
          score += 10;
        }
        
        return {
          ...lawyer,
          matchScore: score,
          matchReason: score >= 100 ? 'Exact sub-specialty match' :
                      score >= 75 ? 'Related sub-specialty' :
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

    // Enhanced keyword matching with sub-specialties
    if (text.includes("kill") || text.includes("murder") || text.includes("homicide")) {
      analysis = {
        specialization: "Criminal",
        subSpecialty: "Murder & Homicide",
        severity: "High",
        urgency: "Immediate",
        description: "Serious criminal matter involving homicide charges",
        keywords: ["murder", "homicide", "killing", "criminal"],
        caseType: "Homicide"
      };
    } else if (text.includes("divorce") || text.includes("separation") || text.includes("wife") || text.includes("husband")) {
      analysis = {
        specialization: "Family",
        subSpecialty: "Divorce & Custody",
        severity: "Medium",
        urgency: "Normal",
        description: "Family law matter involving divorce or separation",
        keywords: ["divorce", "separation", "custody", "family"],
        caseType: "Divorce/Separation"
      };
    } else if (text.includes("theft") || text.includes("stealing") || text.includes("robbery") || text.includes("burglary")) {
      analysis = {
        specialization: "Criminal",
        subSpecialty: "Theft & Robbery",
        severity: "Medium",
        urgency: "High",
        description: "Criminal matter related to theft or robbery",
        keywords: ["theft", "robbery", "stealing", "burglary"],
        caseType: "Theft/Robbery"
      };
    } else if (text.includes("property") || text.includes("land") || text.includes("real estate") || text.includes("house")) {
      analysis = {
        specialization: "Property",
        subSpecialty: "Real Estate Disputes",
        severity: "Medium",
        urgency: "Normal",
        description: "Civil matter related to property or land disputes",
        keywords: ["property", "land", "real estate", "house"],
        caseType: "Property Dispute"
      };
    } else if (text.includes("contract") || text.includes("agreement") || text.includes("breach")) {
      analysis = {
        specialization: "Corporate",
        subSpecialty: "Business Contracts",
        severity: "Medium",
        urgency: "Normal",
        description: "Matter involving business contracts or agreements",
        keywords: ["contract", "agreement", "business", "breach"],
        caseType: "Contract Dispute"
      };
    } else if (text.includes("cyber") || text.includes("online") || text.includes("hacking") || text.includes("fraud")) {
      analysis = {
        specialization: "Cyber",
        subSpecialty: "Cyber Crime & Hacking",
        severity: "High",
        urgency: "High",
        description: "Matter involving cyber crime or online fraud",
        keywords: ["cyber", "online", "hacking", "fraud"],
        caseType: "Cyber Crime"
      };
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
        
        // Bonus for high severity cases - prioritize experienced lawyers
        if (analysis.severity === 'High' && lawyer.experience >= 10) {
          score += 10;
        }
        
        return {
          ...lawyer,
          matchScore: score,
          matchReason: score >= 100 ? 'Exact sub-specialty match' :
                      score >= 75 ? 'Related sub-specialty' :
                      'Specialization match'
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore);

    // Group lawyers by match quality
    const exactMatches = scoredLawyers.filter(l => l.matchScore >= 100);
    const relatedMatches = scoredLawyers.filter(l => l.matchScore >= 75 && l.matchScore < 100);
    const generalMatches = scoredLawyers.filter(l => l.matchScore < 75);

    res.json({
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
