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
    You are a legal AI assistant specializing in Indian law. Analyze the following case description and categorize it accurately:

    Case Description: "${caseDescription}"
    
    Please respond with a JSON object in this exact format:
    {
      "caseType": "Family|Criminal|Property|Corporate|Cyber|Civil|General",
      "category": "Brief category name",
      "severity": "High|Medium|Low",
      "description": "Brief description of the legal matter",
      "keywords": ["keyword1", "keyword2", "keyword3"]
    }
    
    Rules for Indian legal cases:
    - "Family" for divorce, separation, marriage, custody, child support, alimony, domestic violence, inheritance, will disputes, adoption, maintenance
    - "Criminal" for murder, homicide, killing, assault, theft, robbery, fraud, cheating, dowry death, rape, molestation, narcotics, white collar crimes, cyber crimes
    - "Property" for land disputes, real estate, property ownership, rental disputes, lease agreements, builder disputes, property registration, title issues
    - "Corporate" for business contracts, company law, startup issues, mergers & acquisitions, intellectual property, taxation, GST, labor law, employment disputes
    - "Cyber" for online fraud, data privacy, hacking, cyber security, online scams, digital evidence, cyber stalking, IT Act violations
    - "Civil" for personal injury, accidents, compensation claims, medical negligence, consumer disputes, contract disputes, defamation, tort claims
    - "General" only if none of the above categories fit
    
    Consider the context of Indian legal system and common case types in India.
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

    // Find matching lawyers in the specified city
    const db = readDB();
    console.log("=== DEBUG INFO ===");
    console.log("City:", city);
    console.log("Analysis:", analysis);
    console.log("Total lawyers in DB:", db.lawyers.length);

    const matchingLawyers = db.lawyers.filter((lawyer) => {
      const cityMatch = lawyer.location
        .toLowerCase()
        .includes(city.toLowerCase());
      const specializationMatch = lawyer.specialization === analysis.caseType;
      console.log(
        `Lawyer: ${lawyer.name}, Location: ${lawyer.location}, Specialization: ${lawyer.specialization}, City Match: ${cityMatch}, Specialization Match: ${specializationMatch}`
      );
      return cityMatch && specializationMatch;
    });

    console.log(
      "Matching lawyers:",
      matchingLawyers.map((l) => l.name)
    );
    console.log("==================");

    res.json({
      analysis,
      matchingLawyers,
      city: city,
      totalMatches: matchingLawyers.length,
    });
  } catch (error) {
    console.error("Gemini API Error:", error);

    // Fallback to basic keyword matching
    const text = caseDescription.toLowerCase();
    let analysis = {
      caseType: "General",
      category: "Civil Matter",
      severity: "Medium",
      description: "Legal matter requiring professional consultation",
      keywords: [],
    };

    if (
      text.includes("divorce") ||
      text.includes("separation") ||
      text.includes("marriage") ||
      text.includes("custody") ||
      text.includes("wife") ||
      text.includes("husband")
    ) {
      analysis = {
        caseType: "Family",
        category: "Divorce/Separation",
        severity: "Medium",
        description: "Family law matter involving divorce or separation",
        keywords: ["divorce", "family", "separation", "marriage"],
      };
    } else if (
      text.includes("murder") ||
      text.includes("homicide") ||
      text.includes("killing")
    ) {
      analysis = {
        caseType: "Criminal",
        category: "Homicide",
        severity: "High",
        description: "Serious criminal matter involving homicide charges",
        keywords: ["murder", "criminal", "homicide", "killing"],
      };
    } else if (
      text.includes("theft") ||
      text.includes("stealing") ||
      text.includes("robbery") ||
      text.includes("burglary")
    ) {
      analysis = {
        caseType: "Criminal",
        category: "Theft/Robbery",
        severity: "Medium",
        description: "Criminal matter related to theft or robbery",
        keywords: ["theft", "robbery", "criminal", "stealing", "burglary"],
      };
    } else if (
      text.includes("property") ||
      text.includes("land") ||
      text.includes("real estate") ||
      text.includes("house")
    ) {
      analysis = {
        caseType: "Property",
        category: "Property Dispute",
        severity: "Medium",
        description: "Civil matter related to property or land disputes",
        keywords: ["property", "civil", "land", "real estate"],
      };
    }

    const db = readDB();
    const matchingLawyers = db.lawyers.filter(
      (lawyer) =>
        lawyer.location.toLowerCase().includes(city.toLowerCase()) &&
        lawyer.specialization === analysis.caseType
    );

    res.json({
      analysis,
      matchingLawyers,
      city: city,
      totalMatches: matchingLawyers.length,
      fallback: true,
    });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log("Backend listening on", PORT));
