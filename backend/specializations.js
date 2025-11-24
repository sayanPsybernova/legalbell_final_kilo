// Comprehensive Indian Lawyer Specializations with Enhanced Keyword Matching
// This data structure enables precise lawyer matching and case analysis

// Utility functions for fuzzy matching
function calculateSimilarity(str1, str2) {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

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

// Helper function to check word combinations
function hasWordCombination(words, combo) {
  const comboWords = combo.words.map(w => w.toLowerCase());
  let foundCount = 0;
  let lastIndex = -1;
  
  for (const comboWord of comboWords) {
    const index = words.findIndex((word, i) =>
      i > lastIndex && word.includes(comboWord)
    );
    if (index !== -1) {
      foundCount++;
      lastIndex = index;
    }
  }
  
  return foundCount === comboWords.length;
}

const LEGAL_SPECIALIZATIONS = {
  "Criminal Law": {
    description: "Handles crimes against society",
    subSpecialties: {
      "Murder / Homicide Cases": {
        keywords: [
          // Primary keywords
          "murder", "homicide", "kill", "killing", "death", "manslaughter", "culpable homicide",
          // Variations and synonyms
          "killed someone", "someone died", "death caused", "caused death", "person died",
          "fatal incident", "someone killed", "murder case", "homicide case", "death case",
          // Hindi/regional variations
          "hatya", "maut", "katal", "maut ka case", "hatya ka case",
          // Contextual phrases
          "responsible for death", "led to death", "resulted in death", "death due to",
          // Typos and variations
          "murdr", "homocide", "kil", "kiling", "deth"
        ],
        phrasePatterns: [
          "someone killed", "person died", "caused death", "responsible for death",
          "death due to", "fatal incident", "murder accused", "homicide case"
        ],
        wordCombinations: [
          { words: ["kill", "person"], weight: 5 },
          { words: ["death", "cause"], weight: 4 },
          { words: ["someone", "died"], weight: 5 }
        ],
        severity: "Critical",
        urgency: "Immediate",
        relevantLaws: ["IPC Section 302", "IPC Section 304", "IPC Section 306", "CrPC"],
        description: "Cases involving murder, homicide, and death-related offenses"
      },
      "Assault / Hurt / Threat": {
        keywords: [
          // Primary keywords
          "assault", "hurt", "threat", "violence", "attack", "grievous hurt", "simple hurt",
          // Variations and synonyms
          "beating", "attack", "violence", "physical harm", "injury", "hurt me",
          "beat me", "threatened me", "danger", "threatening", "physical assault",
          "verbal threat", "life threat", "threat to kill", "assaulted me",
          // Hindi/regional variations
          "marpit", "dhamki", "jhagda", "maar peet", "hamla", "dhoka",
          // Contextual phrases
          "physically assaulted", "threatened to harm", "threatening calls",
          "threatening messages", "physical violence", "domestic violence",
          // Typos and variations
          "assult", "threten", "violenze", "atack"
        ],
        phrasePatterns: [
          "threatened to kill", "physically assaulted", "threatening calls",
          "domestic violence", "physical assault", "beat me up"
        ],
        wordCombinations: [
          { words: ["threaten", "kill"], weight: 5 },
          { words: ["physical", "harm"], weight: 4 },
          { words: ["beat", "me"], weight: 4 }
        ],
        severity: "Serious",
        urgency: "High",
        relevantLaws: ["IPC Section 323", "IPC Section 324", "IPC Section 325", "IPC Section 506"],
        description: "Cases involving physical assault, hurt, and criminal intimidation"
      },
      "Theft / Robbery / Burglary": {
        keywords: [
          // Primary keywords
          "theft", "robbery", "burglary", "stealing", "stolen", "snatching", "cheating", "fraud",
          // Variations and synonyms
          "stole", "robbed", "snatched", "pickpocket", "burgled", "theft case",
          "missing items", "someone took", "robbery case", "chain snatching",
          "mobile stolen", "wallet stolen", "car theft", "bike theft", "house robbery",
          // Hindi/regional variations
          "chori", "chhapa", "cheen liya", "chheena", "nakli", "thokar",
          // Contextual phrases
          "broke into house", "stolen from", "robbed at", "snatched bag",
          "pickpocketed", "burglary in house", "theft in office",
          // Typos and variations
          "theift", "robery", "burglery", "stealing", "snaching"
        ],
        phrasePatterns: [
          "broke into house", "stolen from", "robbed at", "chain snatching",
          "pickpocketed", "burglary in house", "someone stole my"
        ],
        wordCombinations: [
          { words: ["someone", "stole"], weight: 5 },
          { words: ["broke", "house"], weight: 4 },
          { words: ["chain", "snatch"], weight: 5 }
        ],
        severity: "Serious",
        urgency: "Immediate",
        relevantLaws: ["IPC Section 379", "IPC Section 390", "IPC Section 448", "IPC Section 420"],
        description: "Cases involving theft, robbery, burglary, and property crimes"
      },
      "Dowry Harassment (Sec 498A)": {
        keywords: [
          // Primary keywords
          "dowry", "498a", "harassment", "cruelty", "marriage", "wife harassment",
          // Variations and synonyms
          "dowry demand", "dowry death", "marriage harassment", "wife torture", "in-laws harassment",
          "family harassment", "marital cruelty", "domestic cruelty", "mental harassment",
          // Hindi/regional variations
          "dahej", "dahej pratha", "sasural", "sasural", "stri", "vivah",
          // Contextual phrases
          "harassing for dowry", "torturing for money", "demanding dowry", "cruel in-laws",
          "mental torture", "physical harassment", "emotional abuse", "family pressure"
        ],
        phrasePatterns: [
          "demanding dowry", "harassing for dowry", "dowry death", "cruel in-laws",
          "mental torture", "physical harassment", "family pressure"
        ],
        wordCombinations: [
          { words: ["dowry", "harassment"], weight: 5 },
          { words: ["marriage", "cruelty"], weight: 4 },
          { words: ["wife", "torture"], weight: 5 }
        ],
        severity: "Serious",
        urgency: "High",
        relevantLaws: ["IPC Section 498A", "Dowry Prohibition Act", "Protection of Women from Domestic Violence Act"],
        description: "Cases involving dowry harassment and cruelty against married women"
      },
      "Domestic Violence (DV Act)": {
        keywords: [
          // Primary keywords
          "domestic violence", "dv act", "protection order", "wife abuse", "family violence", "marital abuse",
          // Enhanced variations
          "husband abuse", "wife abuse", "spouse abuse", "marital violence", "family abuse", "home violence",
          "domestic abuse", "intimate partner violence", "domestic terror", "family terror",
          // Contextual phrases
          "husband threatening", "wife threatening", "spouse threatening", "family threatening",
          "domestic harassment", "marital harassment", "home harassment", "family harassment",
          "physical abuse at home", "emotional abuse", "mental abuse", "psychological abuse",
          "economic abuse", "financial abuse", "controlling behavior", "possessive behavior",
          // Legal terms
          "protection order", "restraining order", "dv case", "498a", "domestic complaint",
          "women protection", "family protection", "shelter home", "counseling",
          // Hindi/regional variations
          "ghar ka hinsa", "patni ke saath abuse", "pati ke saath abuse", "parivar ke andar hinsa",
          // Combined patterns
          "husband threatening to kill", "wife threatening to kill", "family threatening to harm",
          "domestic violence by husband", "domestic violence by wife", "abusive marriage",
          // Typos and variations
          "domestic violance", "domestic vilonce", "famly violence", "husband thretening"
        ],
        phrasePatterns: [
          "domestic violence", "husband threatening", "wife threatening", "spouse threatening",
          "family violence", "marital abuse", "domestic abuse", "protection order",
          "dv act", "498a case", "abusive marriage", "controlling behavior"
        ],
        wordCombinations: [
          { words: ["husband", "threatening"], weight: 6 },
          { words: ["wife", "threatening"], weight: 6 },
          { words: ["domestic", "violence"], weight: 6 },
          { words: ["family", "violence"], weight: 5 },
          { words: ["marital", "abuse"], weight: 5 },
          { words: ["spouse", "abuse"], weight: 5 }
        ],
        severity: "Serious",
        urgency: "Immediate",
        relevantLaws: ["Protection of Women from Domestic Violence Act 2005", "IPC Section 498A", "IPC Section 506"],
        description: "Cases involving domestic violence, abuse, and protection orders under DV Act"
      },
      "Bail (Regular, Anticipatory, Interim)": {
        keywords: ["bail", "anticipatory bail", "regular bail", "interim bail", "custody", "arrest"],
        severity: "High",
        urgency: "Immediate",
        relevantLaws: ["CrPC Section 436", "CrPC Section 437", "CrPC Section 438"],
        description: "Bail applications and matters related to custody and release"
      },
      "Sexual Offences (POCSO, Rape)": {
        keywords: ["rape", "sexual assault", "pocs", "molestation", "sexual harassment", "minor"],
        severity: "Critical",
        urgency: "Immediate",
        relevantLaws: ["IPC Section 376", "POCSO Act", "Sexual Harassment of Women at Workplace Act"],
        description: "Cases involving sexual offenses, rape, and crimes against minors"
      },
      "Narcotics (NDPS Cases)": {
        keywords: ["narcotics", "drugs", "ndps", "ganja", "cannabis", "cocaine", "heroin"],
        severity: "Serious",
        urgency: "High",
        relevantLaws: ["NDPS Act 1985", "Narcotic Drugs and Psychotropic Substances Act"],
        description: "Cases involving narcotics, drugs, and controlled substances"
      },
      "White-Collar Crime": {
        keywords: ["white collar", "financial fraud", "embezzlement", "corporate fraud", "money laundering"],
        severity: "Serious",
        urgency: "High",
        relevantLaws: ["Prevention of Money Laundering Act", "Companies Act", "IPC Sections 420-424"],
        description: "Financial crimes and corporate fraud cases"
      },
      "Economic Offences": {
        keywords: ["economic offence", "bank fraud", "cheating", "financial crime", "scam"],
        severity: "Serious",
        urgency: "High",
        relevantLaws: ["Prevention of Corruption Act", "Benami Transactions Act", "FEMA"],
        description: "Economic offenses and financial crimes"
      },
      "Cyber Crime": {
        keywords: ["cyber crime", "hacking", "online fraud", "data breach", "cybersecurity"],
        severity: "Serious",
        urgency: "Immediate",
        relevantLaws: ["IT Act 2000", "Cyber Laws", "Data Protection Laws"],
        description: "Cyber crimes and technology-related offenses"
      },
      "Juvenile Crime": {
        keywords: ["juvenile", "minor", "child crime", "juvenile justice", "minor offense"],
        severity: "Moderate",
        urgency: "Normal",
        relevantLaws: ["Juvenile Justice Act", "Child Protection Laws"],
        description: "Cases involving juvenile offenders and child protection"
      },
      "Police Action & Constitutional Rights": {
        keywords: [
          // Primary keywords
          "police", "police action", "seized", "seizure", "confiscated", "arrest", "detained", "custody",
          // Variations and synonyms
          "cop", "cops", "police seized", "police took", "without reason", "illegal seizure", "unlawful arrest",
          "false case", "fabricated case", "police harassment", "police brutality", "illegal detention",
          "vehicle seized", "bike seized", "car seized", "property seized", "documents seized",
          // Hindi/regional variations
          "police ne pakda", "police ne liya", "bina wajah", "jhol", "jhapta",
          // Contextual phrases
          "police without reason", "seized without warrant", "illegal police action", "police excess",
          "violation of rights", "constitutional rights", "fundamental rights", "police misconduct",
          // Legal process terms
          "FIR", "first information report", "anticipatory bail", "regular bail", "custody remand",
          // Typos and variations
          "polise", "sezed", "confiscated", "arest", "custdy"
        ],
        phrasePatterns: [
          "police seized", "without reason", "illegal seizure", "unlawful arrest", "police took",
          "vehicle seized", "bike seized", "car seized", "false case", "fabricated case"
        ],
        wordCombinations: [
          { words: ["police", "seized"], weight: 5 },
          { words: ["without", "reason"], weight: 4 },
          { words: ["illegal", "seizure"], weight: 5 },
          { words: ["false", "case"], weight: 4 }
        ],
        severity: "Serious",
        urgency: "Immediate",
        relevantLaws: ["CrPC Sections 41-60", "CrPC Sections 102-105", "Constitution Articles 21-22", "IPC Sections 166-167"],
        description: "Cases involving police action, illegal seizure, arrest, and violation of constitutional rights"
      },
      "Traffic & Road Accident Crime": {
        keywords: ["traffic accident", "road accident", "motor vehicle", "hit and run", "drunk driving"],
        severity: "Moderate",
        urgency: "High",
        relevantLaws: ["Motor Vehicles Act", "IPC Sections 279-304A"],
        description: "Traffic violations and road accident cases"
      }
    }
  },

  "Civil Law": {
    description: "Non-criminal disputes between individuals",
    subSpecialties: {
      "Contract Disputes": {
        keywords: ["contract", "agreement", "breach", "violation", "terms", "commercial dispute"],
        severity: "Moderate",
        urgency: "Normal",
        relevantLaws: ["Indian Contract Act 1872", "Specific Relief Act"],
        description: "Disputes related to contracts and agreements"
      },
      "Property Partition": {
        keywords: ["partition", "property division", "share", "joint property", "family property"],
        severity: "Serious",
        urgency: "Normal",
        relevantLaws: ["Partition Act", "Civil Procedure Code", "Property Laws"],
        description: "Partition of joint and family property"
      },
      "Recovery of Money": {
        keywords: ["recovery", "money", "debt", "loan", "payment", "due"],
        severity: "Moderate",
        urgency: "Normal",
        relevantLaws: ["Code of Civil Procedure", "Recovery of Debts Act"],
        description: "Cases related to recovery of money and debts"
      },
      "Permanent / Temporary Injunction": {
        keywords: ["injunction", "restraining order", "temporary injunction", "permanent injunction"],
        severity: "Moderate",
        urgency: "High",
        relevantLaws: ["Specific Relief Act", "Civil Procedure Code"],
        description: "Injunctions and restraining orders"
      },
      "Specific Performance Cases": {
        keywords: ["specific performance", "contract enforcement", "agreement enforcement"],
        severity: "Moderate",
        urgency: "Normal",
        relevantLaws: ["Specific Relief Act", "Contract Act"],
        description: "Cases demanding specific performance of contracts"
      },
      "Defamation Cases": {
        keywords: ["defamation", "libel", "slander", "reputation", "false statement"],
        severity: "Moderate",
        urgency: "Normal",
        relevantLaws: ["IPC Section 499", "IPC Section 500", "Civil Defamation Laws"],
        description: "Cases involving defamation and reputation damage"
      },
      "Trespassing": {
        keywords: ["trespass", "illegal entry", "property intrusion", "land invasion"],
        severity: "Moderate",
        urgency: "High",
        relevantLaws: ["IPC Section 447", "Property Laws", "Civil Procedure Code"],
        description: "Cases involving illegal entry and trespassing"
      },
      "Encroachment": {
        keywords: ["encroachment", "illegal occupation", "property takeover", "land grab"],
        severity: "Serious",
        urgency: "Immediate",
        relevantLaws: ["Property Laws", "Municipal Acts", "Civil Procedure Code"],
        description: "Cases involving illegal encroachment of property"
      },
      "Easement Rights": {
        keywords: ["easement", "right of way", "access", "property rights", "servitude"],
        severity: "Moderate",
        urgency: "Normal",
        relevantLaws: ["Easement Act", "Property Laws"],
        description: "Cases related to easement rights and property access"
      },
      "Rent Control Disputes": {
        keywords: ["rent", "tenant", "landlord", "rent control", "eviction"],
        severity: "Moderate",
        urgency: "Normal",
        relevantLaws: ["Rent Control Acts", "Tenant Protection Laws"],
        description: "Disputes between landlords and tenants"
      },
      "Co-operative Society Disputes": {
        keywords: ["cooperative society", "society", "housing society", "society dispute"],
        severity: "Moderate",
        urgency: "Normal",
        relevantLaws: ["Cooperative Societies Act", "Society Bye-laws"],
        description: "Disputes related to cooperative housing societies"
      }
    }
  },

  "Family Law": {
    description: "Personal and marital matters",
    subSpecialties: {
      "Divorce (Mutual / Contested)": {
        keywords: ["divorce", "separation", "marriage breakdown", "mutual consent", "contested divorce"],
        severity: "Moderate",
        urgency: "Normal",
        relevantLaws: ["Hindu Marriage Act", "Special Marriage Act", "Muslim Personal Law"],
        description: "Divorce proceedings and marriage dissolution"
      },
      "Child Custody": {
        keywords: ["child custody", "custody", "child welfare", "minor custody", "parental rights"],
        severity: "Moderate",
        urgency: "High",
        relevantLaws: ["Guardians and Wards Act", "Hindu Marriage Act", "Child Rights Laws"],
        description: "Child custody and guardianship matters"
      },
      "Maintenance & Alimony": {
        keywords: ["maintenance", "alimony", "support", "financial support", "wife maintenance"],
        severity: "Moderate",
        urgency: "Normal",
        relevantLaws: ["Hindu Marriage Act", "Criminal Procedure Code Section 125", "Personal Laws"],
        description: "Maintenance and alimony proceedings"
      },
      "Domestic Violence (also overlaps with criminal)": {
        keywords: ["domestic violence", "abuse", "family violence", "protection order"],
        severity: "Serious",
        urgency: "Immediate",
        relevantLaws: ["Protection of Women from Domestic Violence Act", "IPC Section 498A"],
        description: "Domestic violence protection and relief"
      },
      "Restitution of Conjugal Rights (RCR)": {
        keywords: ["restitution", "conjugal rights", "marriage rights", "rcr"],
        severity: "Moderate",
        urgency: "Normal",
        relevantLaws: ["Hindu Marriage Act", "Personal Laws"],
        description: "Restitution of conjugal rights proceedings"
      },
      "Adoption": {
        keywords: ["adoption", "child adoption", "legal adoption", "adoptive parents"],
        severity: "Moderate",
        urgency: "Normal",
        relevantLaws: ["Adoption Act", "Juvenile Justice Act", "CARA Guidelines"],
        description: "Legal adoption procedures and matters"
      },
      "Guardianship": {
        keywords: ["guardianship", "guardian", "minor guardian", "legal guardian"],
        severity: "Moderate",
        urgency: "Normal",
        relevantLaws: ["Guardians and Wards Act", "Family Laws"],
        description: "Guardianship matters for minors and incapacitated persons"
      },
      "Annulment of Marriage": {
        keywords: ["annulment", "void marriage", "nullity", "marriage annulment"],
        severity: "Moderate",
        urgency: "Normal",
        relevantLaws: ["Hindu Marriage Act", "Special Marriage Act", "Personal Laws"],
        description: "Annulment and nullity of marriage"
      },
      "Hindu Marriage Act issues": {
        keywords: ["hindu marriage", "hindu divorce", "hindu family", "hindu personal law"],
        severity: "Moderate",
        urgency: "Normal",
        relevantLaws: ["Hindu Marriage Act 1955", "Hindu Succession Act"],
        description: "Matters under Hindu Marriage Act"
      },
      "Muslim & Christian Personal Law issues": {
        keywords: ["muslim law", "christian law", "personal law", "religious marriage", "sharia"],
        severity: "Moderate",
        urgency: "Normal",
        relevantLaws: ["Muslim Personal Law (Shariat)", "Christian Marriage Act", "Personal Laws"],
        description: "Matters under Muslim and Christian personal laws"
      }
    }
  },

  "Property & Real Estate Law": {
    description: "Land, house, flats, and real estate matters",
    subSpecialties: {
      "Property Dispute": {
        keywords: ["property dispute", "land dispute", "real estate dispute", "ownership dispute"],
        severity: "Serious",
        urgency: "High",
        relevantLaws: ["Transfer of Property Act", "Registration Act", "Civil Procedure Code"],
        description: "General property and real estate disputes"
      },
      "Illegal Possession": {
        keywords: ["illegal possession", "possession", "property takeover", "illegal occupation"],
        severity: "Serious",
        urgency: "Immediate",
        relevantLaws: ["Property Laws", "Civil Procedure Code", "Criminal Procedure Code"],
        description: "Cases involving illegal possession of property"
      },
      "Property Title Check": {
        keywords: ["title check", "title verification", "property title", "ownership verification"],
        severity: "Moderate",
        urgency: "Normal",
        relevantLaws: ["Registration Act", "Property Laws", "Land Records Act"],
        description: "Property title verification and due diligence"
      },
      "Property Registration": {
        keywords: ["property registration", "registry", "property deed", "registration"],
        severity: "Moderate",
        urgency: "Normal",
        relevantLaws: ["Registration Act 1908", "Stamp Act", "Property Laws"],
        description: "Property registration and documentation"
      },
      "Builder Disputes (RERA Cases)": {
        keywords: ["builder", "rera", "construction", "builder dispute", "real estate project"],
        severity: "Serious",
        urgency: "High",
        relevantLaws: ["RERA Act 2016", "Consumer Protection Act", "Real Estate Regulations"],
        description: "Builder and real estate project disputes"
      },
      "Landlord–Tenant Disputes": {
        keywords: ["landlord", "tenant", "rental dispute", "eviction", "lease agreement"],
        severity: "Moderate",
        urgency: "High",
        relevantLaws: ["Rent Control Acts", "Transfer of Property Act", "Tenant Laws"],
        description: "Landlord-tenant relationship disputes"
      },
      "Society Transfer Issues": {
        keywords: ["society transfer", "housing society", "society membership", "society NOC"],
        severity: "Moderate",
        urgency: "Normal",
        relevantLaws: ["Cooperative Societies Act", "Society Bye-laws", "Property Laws"],
        description: "Housing society transfer and membership issues"
      },
      "Ancestral Property Partition": {
        keywords: ["ancestral property", "family property", "inheritance", "succession", "will"],
        severity: "Serious",
        urgency: "Normal",
        relevantLaws: ["Hindu Succession Act", "Indian Succession Act", "Partition Act"],
        description: "Ancestral property division and succession matters"
      },
      "Encroachment / Trespassing": {
        keywords: ["encroachment", "trespass", "property encroachment", "land invasion"],
        severity: "Serious",
        urgency: "Immediate",
        relevantLaws: ["Property Laws", "IPC Sections 441-447", "Civil Procedure Code"],
        description: "Property encroachment and trespassing issues"
      },
      "Real Estate Fraud": {
        keywords: ["real estate fraud", "property fraud", "land fraud", "fake documents"],
        severity: "Serious",
        urgency: "Immediate",
        relevantLaws: ["IPC Sections 420-424", "Property Laws", "Consumer Protection Act"],
        description: "Real estate fraud and cheating cases"
      },
      "Mutation & Revenue Cases": {
        keywords: ["mutation", "revenue", "land records", "property records", "khata"],
        severity: "Moderate",
        urgency: "Normal",
        relevantLaws: ["Land Revenue Code", "Revenue Laws", "Property Registration Laws"],
        description: "Property mutation and revenue record matters"
      }
    }
  },

  "Corporate / Commercial Law": {
    description: "Business-related legal compliances",
    subSpecialties: {
      "Company Formation": {
        keywords: ["company formation", "company registration", "incorporation", "startup"],
        severity: "Minor",
        urgency: "Normal",
        relevantLaws: ["Companies Act 2013", "LLP Act", "Startup India"],
        description: "Company formation and incorporation services"
      },
      "Shareholder Agreements": {
        keywords: ["shareholder", "shareholders agreement", "shareholding", "equity"],
        severity: "Moderate",
        urgency: "Normal",
        relevantLaws: ["Companies Act", "SEBI Regulations", "Contract Act"],
        description: "Shareholder agreements and equity matters"
      },
      "Business Contracts": {
        keywords: ["business contract", "commercial agreement", "business agreement", "service contract"],
        severity: "Moderate",
        urgency: "Normal",
        relevantLaws: ["Indian Contract Act", "Specific Relief Act", "Commercial Laws"],
        description: "Business and commercial contract matters"
      },
      "Mergers & Acquisitions": {
        keywords: ["merger", "acquisition", "m&a", "business sale", "takeover"],
        severity: "Serious",
        urgency: "Normal",
        relevantLaws: ["Companies Act", "Competition Act", "SEBI Regulations", "FEMA"],
        description: "Mergers, acquisitions, and business combinations"
      },
      "Corporate Governance": {
        keywords: ["corporate governance", "board matters", "compliance", "director duties"],
        severity: "Moderate",
        urgency: "Normal",
        relevantLaws: ["Companies Act", "SEBI Listing Regulations", "Corporate Laws"],
        description: "Corporate governance and compliance matters"
      },
      "Partnership disputes": {
        keywords: ["partnership", "partnership dispute", "firm", "partner conflict"],
        severity: "Moderate",
        urgency: "High",
        relevantLaws: ["Partnership Act", "Indian Partnership Act 1932"],
        description: "Partnership firm disputes and matters"
      },
      "Startup Legal Compliance": {
        keywords: ["startup", "startup compliance", "funding", "venture capital", "angel investment"],
        severity: "Moderate",
        urgency: "Normal",
        relevantLaws: ["Companies Act", "Startup India", "FEMA", "SEBI Regulations"],
        description: "Startup legal matters and funding compliance"
      },
      "Arbitration & Alternate Dispute Resolution (ADR)": {
        keywords: ["arbitration", "adr", "mediation", "conciliation", "dispute resolution"],
        severity: "Moderate",
        urgency: "Normal",
        relevantLaws: ["Arbitration and Conciliation Act", "ADR Rules"],
        description: "Arbitration and alternative dispute resolution"
      },
      "Insolvency & Bankruptcy (IBC)": {
        keywords: ["insolvency", "bankruptcy", "ibc", "nclt", "corporate insolvency"],
        severity: "Serious",
        urgency: "Immediate",
        relevantLaws: ["Insolvency and Bankruptcy Code 2016", "NCLT Procedures"],
        description: "Insolvency and bankruptcy proceedings"
      }
    }
  },

  "Taxation Law": {
    description: "Deals with taxes regulated by Government of India",
    subSpecialties: {
      "Income Tax": {
        keywords: ["income tax", "tax return", "tax assessment", "income tax notice"],
        severity: "Moderate",
        urgency: "High",
        relevantLaws: ["Income Tax Act 1961", "Tax Rules", "CBDT Notifications"],
        description: "Income tax matters and assessments"
      },
      "GST (Goods & Services Tax)": {
        keywords: ["gst", "goods and services tax", "gst return", "gst notice"],
        severity: "Moderate",
        urgency: "High",
        relevantLaws: ["CGST Act", "SGST Act", "IGST Act", "GST Rules"],
        description: "GST compliance and matters"
      },
      "Corporate Tax": {
        keywords: ["corporate tax", "company tax", "business tax", "tax planning"],
        severity: "Moderate",
        urgency: "Normal",
        relevantLaws: ["Income Tax Act", "Corporate Tax Laws", "Tax Planning Rules"],
        description: "Corporate taxation and planning"
      },
      "Tax Appeal Representation": {
        keywords: ["tax appeal", "tax tribunal", "income tax appeal", "gst appeal"],
        severity: "Serious",
        urgency: "High",
        relevantLaws: ["Income Tax Act", "GST Laws", "Tribunal Procedures"],
        description: "Tax appeals and tribunal representations"
      },
      "Tax Penalty Cases": {
        keywords: ["tax penalty", "tax notice", "tax demand", "tax prosecution"],
        severity: "Serious",
        urgency: "Immediate",
        relevantLaws: ["Income Tax Act", "GST Laws", "Penalty Provisions"],
        description: "Tax penalty and prosecution matters"
      },
      "International Taxation": {
        keywords: ["international tax", "transfer pricing", "double taxation", "nri tax"],
        severity: "Serious",
        urgency: "Normal",
        relevantLaws: ["Income Tax Act", "Double Taxation Avoidance Agreements", "FEMA"],
        description: "International taxation and cross-border tax matters"
      }
    }
  },

  "Labour & Employment Law": {
    description: "Workplace and job-related disputes",
    subSpecialties: {
      "Salary Disputes": {
        keywords: ["salary", "wages", "payment", "salary dispute", "unpaid salary"],
        severity: "Moderate",
        urgency: "High",
        relevantLaws: ["Payment of Wages Act", "Shops and Establishments Act", "Labour Laws"],
        description: "Salary and wage payment disputes"
      },
      "Wrongful Termination": {
        keywords: [
          // Primary keywords
          "termination", "dismissal", "firing", "wrongful termination", "job loss", "sacked", "fired",
          // Enhanced variations
          "unfair dismissal", "illegal termination", "wrongful dismissal", "unlawful termination",
          "terminated without cause", "fired without reason", "dismissed unfairly", "job termination",
          "employment termination", "contract termination", "service termination", "employment ended",
          // Contextual phrases
          "company fired me", "employer terminated", "lost job unfairly", "wrongful dismissal",
          "illegal dismissal", "unfair firing", "termination without notice", "forced resignation",
          "constructive dismissal", "forced to quit", "pressured to resign",
          // Legal terms
          "service rules", "employment contract", "labor laws", "industrial disputes", "termination benefits",
          "severance package", "notice period", "termination clause", "employment rights",
          // Combined patterns
          "company breached contract and fired me", "terminated without cause", "fired without justification",
          "wrongful termination compensation", "unfair dismissal claim", "illegal job termination",
          // Typos and variations
          "terminaton", "dismisal", "firing", "job los", "wrongfull termination"
        ],
        phrasePatterns: [
          "wrongful termination", "unfair dismissal", "illegal termination", "fired without reason",
          "company fired me", "terminated without cause", "lost job unfairly", "forced resignation"
        ],
        wordCombinations: [
          { words: ["company", "fired"], weight: 6 },
          { words: ["termination", "without"], weight: 5 },
          { words: ["unfair", "dismissal"], weight: 6 },
          { words: ["wrongful", "termination"], weight: 6 },
          { words: ["breached", "contract", "fired"], weight: 5 }
        ],
        severity: "Serious",
        urgency: "High",
        relevantLaws: ["Industrial Disputes Act", "Labour Laws", "Service Rules", "Shops and Establishments Act"],
        description: "Wrongful termination, unfair dismissal, and illegal termination matters"
      },
      "Workplace Harassment": {
        keywords: ["harassment", "workplace harassment", "sexual harassment", "posh"],
        severity: "Serious",
        urgency: "Immediate",
        relevantLaws: ["Sexual Harassment of Women at Workplace Act", "Labour Laws"],
        description: "Workplace harassment and POSH matters"
      },
      "Employee Contracts": {
        keywords: [
          // Primary keywords
          "employment contract", "service agreement", "employee terms", "job contract", "work contract",
          // Enhanced variations
          "employment agreement", "service terms", "job terms", "work terms", "employment conditions",
          "employee agreement", "staff contract", "worker contract", "labor contract", "employment terms",
          // Contextual phrases
          "breach of employment contract", "contract violation", "employment dispute", "service rules",
          "terms of employment", "working conditions", "employment clauses", "contract terms",
          "company breached contract", "employer breached agreement", "contract dispute with employer",
          // Legal terms
          "employment act", "labor laws", "service regulations", "employment rights", "worker rights",
          "employee protections", "workplace regulations", "employment compliance", "labor standards",
          // Combined patterns
          "company breached contract", "employer violated terms", "employment contract dispute",
          "service agreement breach", "job contract violation", "employment terms breach",
          // Typos and variations
          "employmnt contract", "servic agreement", "job contrat", "work agrement"
        ],
        phrasePatterns: [
          "employment contract", "service agreement", "breach of contract", "company breached",
          "employment dispute", "contract violation", "job contract", "work agreement"
        ],
        wordCombinations: [
          { words: ["company", "breached"], weight: 5 },
          { words: ["contract", "breach"], weight: 5 },
          { words: ["employment", "dispute"], weight: 4 },
          { words: ["service", "agreement"], weight: 4 }
        ],
        severity: "Moderate",
        urgency: "Normal",
        relevantLaws: ["Contract Act", "Labour Laws", "Employment Regulations", "Industrial Disputes Act"],
        description: "Employment contracts, service agreements, and workplace terms matters"
      },
      "PF & Gratuity Issues": {
        keywords: ["pf", "gratuity", "provident fund", "employee benefits", "retirement benefits"],
        severity: "Moderate",
        urgency: "Normal",
        relevantLaws: ["EPF Act", "Payment of Gratuity Act", "Employee Benefits Laws"],
        description: "PF, gratuity, and employee benefit matters"
      },
      "Industrial Disputes": {
        keywords: ["industrial dispute", "strike", "lockout", "labor union", "industrial action"],
        severity: "Serious",
        urgency: "Immediate",
        relevantLaws: ["Industrial Disputes Act", "Trade Union Act", "Labour Laws"],
        description: "Industrial disputes and labor matters"
      },
      "Factory Act cases": {
        keywords: ["factory act", "industrial safety", "workplace safety", "factory compliance"],
        severity: "Moderate",
        urgency: "Normal",
        relevantLaws: ["Factories Act", "Industrial Safety Laws", "Labour Regulations"],
        description: "Factory Act compliance and safety matters"
      },
      "Union & Labour Court matters": {
        keywords: ["labor court", "union", "labor tribunal", "industrial tribunal"],
        severity: "Serious",
        urgency: "High",
        relevantLaws: ["Industrial Disputes Act", "Labor Court Procedures", "Union Laws"],
        description: "Labor court and union-related matters"
      }
    }
  },

  "Consumer Protection Law": {
    description: "Against unfair trade and bad services",
    subSpecialties: {
      "Faulty Products": {
        keywords: ["faulty product", "defective product", "product liability", "product defect"],
        severity: "Moderate",
        urgency: "Normal",
        relevantLaws: ["Consumer Protection Act", "Product Liability Laws", "Sale of Goods Act"],
        description: "Faulty and defective product matters"
      },
      "Defective Services": {
        keywords: ["defective service", "bad service", "service deficiency", "poor service"],
        severity: "Moderate",
        urgency: "Normal",
        relevantLaws: ["Consumer Protection Act", "Service Quality Laws", "Contract Act"],
        description: "Defective and inadequate service matters"
      },
      "Fraud by Sellers": {
        keywords: ["seller fraud", "consumer fraud", "cheating", "misrepresentation"],
        severity: "Serious",
        urgency: "High",
        relevantLaws: ["Consumer Protection Act", "IPC Sections 420-424", "Sale of Goods Act"],
        description: "Consumer fraud and cheating by sellers"
      },
      "Medical Negligence (consumers)": {
        keywords: ["medical negligence", "doctor negligence", "hospital negligence", "medical error"],
        severity: "Serious",
        urgency: "High",
        relevantLaws: ["Consumer Protection Act", "Medical Council Act", "Clinical Establishments Act"],
        description: "Medical negligence as consumer protection"
      },
      "Online Shopping Scams": {
        keywords: ["online shopping", "ecommerce fraud", "online scam", "internet shopping"],
        severity: "Moderate",
        urgency: "Normal",
        relevantLaws: ["Consumer Protection Act", "IT Act", "E-commerce Rules"],
        description: "Online shopping and e-commerce disputes"
      },
      "Insurance Claim Issues": {
        keywords: ["insurance claim", "insurance rejection", "claim settlement", "insurance dispute"],
        severity: "Moderate",
        urgency: "High",
        relevantLaws: ["Insurance Act", "Consumer Protection Act", "IRDA Regulations"],
        description: "Insurance claim and settlement matters"
      },
      "Banking Fraud (consumer side)": {
        keywords: ["banking fraud", "bank fraud", "atm fraud", "card fraud", "banking dispute"],
        severity: "Serious",
        urgency: "Immediate",
        relevantLaws: ["Banking Regulation Act", "Consumer Protection Act", "Payment and Settlement Systems Act"],
        description: "Banking fraud and consumer banking disputes"
      },
      "E-commerce Refund Issues": {
        keywords: ["refund", "refund issue", "return policy", "ecommerce return", "money back"],
        severity: "Moderate",
        urgency: "Normal",
        relevantLaws: ["Consumer Protection Act", "E-commerce Rules", "Sale of Goods Act"],
        description: "E-commerce refund and return matters"
      }
    }
  },

  "Cyber Law": {
    description: "Technology & internet-related crimes",
    subSpecialties: {
      "Online Fraud": {
        keywords: ["online fraud", "internet fraud", "cyber fraud", "digital fraud"],
        severity: "Serious",
        urgency: "Immediate",
        relevantLaws: ["IT Act 2000", "IPC Sections 420-424", "Cyber Crime Laws"],
        description: "Online and internet fraud matters"
      },
      "Social Media Abuse": {
        keywords: ["social media", "facebook", "instagram", "twitter", "online abuse"],
        severity: "Moderate",
        urgency: "High",
        relevantLaws: ["IT Act", "Social Media Rules", "Cyber Laws"],
        description: "Social media abuse and online harassment"
      },
      "Hacking": {
        keywords: ["hacking", "hack", "cyber attack", "unauthorized access", "system breach"],
        severity: "Serious",
        urgency: "Immediate",
        relevantLaws: ["IT Act 2000", "Cyber Security Laws", "Data Protection Laws"],
        description: "Hacking and unauthorized system access"
      },
      "Phishing / Scams": {
        keywords: ["phishing", "scam", "email scam", "fake website", "online scam"],
        severity: "Serious",
        urgency: "High",
        relevantLaws: ["IT Act", "Consumer Protection Act", "Cyber Crime Laws"],
        description: "Phishing attacks and online scams"
      },
      "Cyberstalking": {
        keywords: ["cyberstalking", "online stalking", "digital stalking", "internet stalking"],
        severity: "Serious",
        urgency: "Immediate",
        relevantLaws: ["IT Act", "IPC Section 354D", "Cyber Laws"],
        description: "Cyberstalking and online harassment"
      },
      "Identity Theft": {
        keywords: ["identity theft", "identity fraud", "fake identity", "impersonation"],
        severity: "Serious",
        urgency: "Immediate",
        relevantLaws: ["IT Act", "IPC Sections 419-420", "Data Protection Laws"],
        description: "Identity theft and impersonation matters"
      },
      "Data Privacy": {
        keywords: ["data privacy", "data breach", "privacy violation", "data protection"],
        severity: "Serious",
        urgency: "High",
        relevantLaws: ["IT Act", "Data Protection Laws", "Privacy Regulations"],
        description: "Data privacy and protection matters"
      },
      "Digital Signature Issues": {
        keywords: ["digital signature", "digital certificate", "electronic signature", "dsc"],
        severity: "Moderate",
        urgency: "Normal",
        relevantLaws: ["IT Act", "Digital Signature Rules", "Electronic Transactions"],
        description: "Digital signature and electronic authentication matters"
      }
    }
  },

  "Intellectual Property (IPR) Law": {
    description: "Protects creativity and innovation",
    subSpecialties: {
      "Trademark Registration": {
        keywords: ["trademark", "brand registration", "logo registration", "trade name"],
        severity: "Moderate",
        urgency: "Normal",
        relevantLaws: ["Trade Marks Act 1999", "Intellectual Property Laws"],
        description: "Trademark registration and protection"
      },
      "Copyright Protection": {
        keywords: ["copyright", "intellectual property", "creative work", "artistic work"],
        severity: "Moderate",
        urgency: "Normal",
        relevantLaws: ["Copyright Act 1957", "Intellectual Property Laws"],
        description: "Copyright registration and protection"
      },
      "Patent Filing": {
        keywords: ["patent", "invention", "patent filing", "innovation protection"],
        severity: "Moderate",
        urgency: "Normal",
        relevantLaws: ["Patents Act 1970", "Intellectual Property Laws"],
        description: "Patent filing and invention protection"
      },
      "Design Registration": {
        keywords: ["design registration", "industrial design", "design protection"],
        severity: "Moderate",
        urgency: "Normal",
        relevantLaws: ["Designs Act 2000", "Intellectual Property Laws"],
        description: "Design registration and protection"
      },
      "IP Violations": {
        keywords: ["ip violation", "infringement", "copyright infringement", "trademark infringement"],
        severity: "Serious",
        urgency: "High",
        relevantLaws: ["IP Laws", "Copyright Act", "Trade Marks Act"],
        description: "Intellectual property violations and infringement"
      },
      "Brand Protection": {
        keywords: ["brand protection", "brand reputation", "counterfeit", "fake products"],
        severity: "Serious",
        urgency: "High",
        relevantLaws: ["Trade Marks Act", "Consumer Protection Act", "IP Laws"],
        description: "Brand protection and anti-counterfeiting"
      },
      "Licensing Agreements": {
        keywords: ["licensing", "license agreement", "ip license", "technology license"],
        severity: "Moderate",
        urgency: "Normal",
        relevantLaws: ["Contract Act", "IP Laws", "Licensing Regulations"],
        description: "Intellectual property licensing agreements"
      }
    }
  },

  "Immigration & Passport Law": {
    description: "Migration and documentation issues",
    subSpecialties: {
      "Visa Issues": {
        keywords: ["visa", "visa rejection", "visa application", "immigration visa"],
        severity: "Moderate",
        urgency: "High",
        relevantLaws: ["Passport Act", "Immigration Laws", "Foreigners Act"],
        description: "Visa application and related matters"
      },
      "Passport Disputes": {
        keywords: ["passport", "passport renewal", "passport issue", "travel document"],
        severity: "Moderate",
        urgency: "High",
        relevantLaws: ["Passport Act 1967", "Foreigners Act", "Immigration Rules"],
        description: "Passport application and renewal matters"
      },
      "OCI / PIO Issues": {
        keywords: ["oci", "pio", "overseas citizenship", "person of indian origin"],
        severity: "Moderate",
        urgency: "Normal",
        relevantLaws: ["Citizenship Act", "OCI Regulations", "Immigration Laws"],
        description: "OCI/PIO card and citizenship matters"
      },
      "Deportation matters": {
        keywords: ["deportation", "removal", "immigration detention", "deportation order"],
        severity: "Critical",
        urgency: "Immediate",
        relevantLaws: ["Foreigners Act", "Immigration Laws", "Human Rights Laws"],
        description: "Deportation and immigration detention matters"
      },
      "Immigration Fraud": {
        keywords: ["immigration fraud", "fake documents", "illegal immigration", "visa fraud"],
        severity: "Serious",
        urgency: "Immediate",
        relevantLaws: ["Immigration Laws", "IPC Sections 419-420", "Foreigners Act"],
        description: "Immigration fraud and illegal migration matters"
      }
    }
  },

  "Banking & Finance Law": {
    description: "Financial disputes & regulation",
    subSpecialties: {
      "Loan Disputes": {
        keywords: ["loan", "loan dispute", "bank loan", "personal loan", "home loan"],
        severity: "Moderate",
        urgency: "High",
        relevantLaws: ["Banking Regulation Act", "Consumer Protection Act", "Loan Agreements"],
        description: "Bank loan and financing disputes"
      },
      "Cheque Bounce (Sec 138 NI Act)": {
        keywords: ["cheque bounce", "dishonored cheque", "section 138", "negotiable instruments"],
        severity: "Serious",
        urgency: "High",
        relevantLaws: ["Negotiable Instruments Act", "Section 138", "Banking Laws"],
        description: "Cheque bounce and negotiable instrument matters"
      },
      "Bank Fraud": {
        keywords: ["bank fraud", "banking fraud", "account fraud", "banking scam"],
        severity: "Serious",
        urgency: "Immediate",
        relevantLaws: ["Banking Regulation Act", "IPC Sections 420-424", "Prevention of Money Laundering Act"],
        description: "Bank fraud and financial institution matters"
      },
      "Debt Recovery Tribunal (DRT)": {
        keywords: ["drt", "debt recovery", "debt tribunal", "bank recovery"],
        severity: "Serious",
        urgency: "High",
        relevantLaws: ["Recovery of Debts Due to Banks Act", "DRT Procedures", "Banking Laws"],
        description: "Debt recovery tribunal matters"
      },
      "NBFC Issues": {
        keywords: ["nbfc", "non-banking finance", "finance company", "nbfc dispute"],
        severity: "Moderate",
        urgency: "High",
        relevantLaws: ["RBI Act", "NBFC Regulations", "Consumer Protection Act"],
        description: "NBFC and non-banking finance matters"
      }
    }
  },

  "Environmental Law": {
    description: "Environmental protection matters",
    subSpecialties: {
      "Pollution Control": {
        keywords: ["pollution", "air pollution", "water pollution", "noise pollution", "environmental pollution"],
        severity: "Serious",
        urgency: "High",
        relevantLaws: ["Environment Protection Act", "Air Act", "Water Act", "Pollution Control Laws"],
        description: "Pollution control and environmental protection matters"
      },
      "Forest & Wildlife Protection": {
        keywords: ["forest", "wildlife", "animal protection", "forest conservation", "biodiversity"],
        severity: "Serious",
        urgency: "Normal",
        relevantLaws: ["Forest Conservation Act", "Wildlife Protection Act", "Biodiversity Act"],
        description: "Forest and wildlife protection matters"
      },
      "Factory Pollution Violations": {
        keywords: ["factory pollution", "industrial pollution", "environmental violation", "factory waste"],
        severity: "Serious",
        urgency: "High",
        relevantLaws: ["Environment Protection Act", "Factory Act", "Pollution Control Laws"],
        description: "Industrial and factory pollution matters"
      },
      "Environmental Clearances": {
        keywords: ["environmental clearance", "environmental approval", "project clearance", "environmental NOC"],
        severity: "Moderate",
        urgency: "Normal",
        relevantLaws: ["Environment Protection Act", "Environmental Impact Assessment", "Clearance Procedures"],
        description: "Environmental clearances and approvals"
      }
    }
  },

  "Medical / Healthcare Law": {
    description: "Legal disputes related to hospitals & doctors",
    subSpecialties: {
      "Medical Negligence": {
        keywords: ["medical negligence", "doctor negligence", "hospital negligence", "medical error"],
        severity: "Serious",
        urgency: "High",
        relevantLaws: ["Consumer Protection Act", "Medical Council Act", "Clinical Establishments Act"],
        description: "Medical negligence and malpractice matters"
      },
      "Wrong Treatment": {
        keywords: ["wrong treatment", "medical error", "incorrect diagnosis", "treatment mistake"],
        severity: "Serious",
        urgency: "High",
        relevantLaws: ["Consumer Protection Act", "Medical Ethics", "Healthcare Laws"],
        description: "Wrong treatment and medical error matters"
      },
      "Wrong Diagnosis": {
        keywords: ["wrong diagnosis", "misdiagnosis", "diagnostic error", "medical diagnosis"],
        severity: "Serious",
        urgency: "High",
        relevantLaws: ["Consumer Protection Act", "Medical Council Regulations", "Healthcare Laws"],
        description: "Wrong diagnosis and medical error matters"
      },
      "Consumer complaints against hospitals": {
        keywords: ["hospital complaint", "healthcare complaint", "hospital service", "medical service"],
        severity: "Moderate",
        urgency: "Normal",
        relevantLaws: ["Consumer Protection Act", "Clinical Establishments Act", "Healthcare Regulations"],
        description: "Consumer complaints against hospitals and healthcare providers"
      }
    }
  },

  "Education Law": {
    description: "School, college, institution disputes",
    subSpecialties: {
      "Unfair Fees": {
        keywords: ["unfair fees", "excessive fees", "school fees", "college fees"],
        severity: "Moderate",
        urgency: "Normal",
        relevantLaws: ["Consumer Protection Act", "Education Regulations", "Fee Regulation Acts"],
        description: "Unfair and excessive fee matters"
      },
      "Admission Disputes": {
        keywords: ["admission", "college admission", "school admission", "admission dispute"],
        severity: "Moderate",
        urgency: "High",
        relevantLaws: ["Education Acts", "Admission Regulations", "Consumer Protection Act"],
        description: "Admission related disputes and matters"
      },
      "Teacher/Staff Rights": {
        keywords: ["teacher rights", "staff rights", "employment in education", "teacher dispute"],
        severity: "Moderate",
        urgency: "Normal",
        relevantLaws: ["Labor Laws", "Education Acts", "Service Rules"],
        description: "Teacher and staff rights in educational institutions"
      },
      "Private School Regulations": {
        keywords: ["private school", "school regulations", "educational institution", "school compliance"],
        severity: "Moderate",
        urgency: "Normal",
        relevantLaws: ["Education Acts", "Private School Regulations", "Consumer Protection Act"],
        description: "Private school regulations and compliance matters"
      },
      "University Complaints": {
        keywords: ["university", "college complaint", "higher education", "university dispute"],
        severity: "Moderate",
        urgency: "Normal",
        relevantLaws: ["University Grants Commission Act", "Education Regulations", "Consumer Protection Act"],
        description: "University and higher education matters"
      }
    }
  }
};

// Specialized Niche Categories
const SPECIALIZED_NICHE_CATEGORIES = {
  "Motor Accident Claims (MACT Lawyer)": {
    keywords: ["motor accident", "car accident", "road accident", "mact", "accident claim"],
    specialization: "Civil",
    subSpecialty: "Motor Accident Claims",
    severity: "Serious",
    urgency: "High",
    relevantLaws: ["Motor Vehicles Act", "MACT Procedures", "Compensation Laws"],
    description: "Motor accident claims and compensation matters"
  },
  "Insurance Claim Lawyer": {
    keywords: ["insurance claim", "insurance settlement", "claim rejection", "insurance dispute"],
    specialization: "Civil",
    subSpecialty: "Insurance Claims",
    severity: "Moderate",
    urgency: "High",
    relevantLaws: ["Insurance Act", "Consumer Protection Act", "IRDA Regulations"],
    description: "Insurance claim and settlement matters"
  },
  "RERA (Builder) Lawyer": {
    keywords: ["rera", "builder", "real estate", "construction", "property project"],
    specialization: "Property",
    subSpecialty: "RERA & Builder Disputes",
    severity: "Serious",
    urgency: "High",
    relevantLaws: ["RERA Act 2016", "Consumer Protection Act", "Real Estate Regulations"],
    description: "RERA and real estate builder disputes"
  },
  "Human Rights Lawyer": {
    keywords: ["human rights", "rights violation", "constitutional rights", "fundamental rights"],
    specialization: "Civil",
    subSpecialty: "Human Rights",
    severity: "Serious",
    urgency: "High",
    relevantLaws: ["Constitution of India", "Human Rights Act", "Civil Rights Laws"],
    description: "Human rights violations and constitutional matters"
  },
  "Anti-Corruption Lawyer": {
    keywords: ["corruption", "anti-corruption", "bribery", "graft", "official misconduct"],
    specialization: "Criminal",
    subSpecialty: "Anti-Corruption",
    severity: "Critical",
    urgency: "Immediate",
    relevantLaws: ["Prevention of Corruption Act", "Lokayukta Act", "Anti-Corruption Laws"],
    description: "Anti-corruption and bribery matters"
  },
  "NDPS (Drugs Cases) Specialist": {
    keywords: ["ndps", "drugs", "narcotics", "drug case", "controlled substance"],
    specialization: "Criminal",
    subSpecialty: "NDPS & Narcotics",
    severity: "Serious",
    urgency: "Immediate",
    relevantLaws: ["NDPS Act 1985", "Narcotic Drugs and Psychotropic Substances Act"],
    description: "NDPS and narcotics drug cases"
  },
  "Sexual Harassment Lawyer (POSH)": {
    keywords: ["sexual harassment", "posh", "workplace harassment", "harassment at workplace"],
    specialization: "Labour & Employment",
    subSpecialty: "Sexual Harassment (POSH)",
    severity: "Serious",
    urgency: "Immediate",
    relevantLaws: ["Sexual Harassment of Women at Workplace Act", "Labor Laws"],
    description: "Sexual harassment at workplace (POSH) matters"
  },
  "Arbitration Lawyer": {
    keywords: ["arbitration", "adr", "alternative dispute resolution", "mediation", "conciliation"],
    specialization: "Corporate",
    subSpecialty: "Arbitration & ADR",
    severity: "Moderate",
    urgency: "Normal",
    relevantLaws: ["Arbitration and Conciliation Act", "ADR Rules", "Commercial Laws"],
    description: "Arbitration and alternative dispute resolution matters"
  }
};

// Enhanced Helper functions for specialization matching
function findBestSpecialization(caseDescription, city) {
  const lowerText = caseDescription.toLowerCase();
  const words = lowerText.split(/\s+/).filter(word => word.length > 0);
  
  let bestMatch = {
    specialization: "Civil",
    subSpecialty: "General Practice",
    confidence: 0,
    matchType: "none",
    keywords: [],
    severity: "Moderate",
    urgency: "Normal",
    relevantLaws: [],
    description: "Legal matter requiring professional consultation"
  };

  // Search through all specializations and sub-specialties
  for (const [specName, specData] of Object.entries(LEGAL_SPECIALIZATIONS)) {
    for (const [subSpecName, subSpecData] of Object.entries(specData.subSpecialties)) {
      let matchScore = 0;
      let matchedKeywords = [];
      let matchDetails = [];

      // Enhanced scoring with criminal matter priority
      const isCriminalMatter = specName === "Criminal Law";
      const phraseWeight = isCriminalMatter ? 8 : 5;
      const combinationWeight = isCriminalMatter ? 7 : 4;
      const keywordWeight = isCriminalMatter ? 5 : 3;
      const fuzzyWeight = isCriminalMatter ? 4 : 2;
      const partialWeight = isCriminalMatter ? 2 : 1;

      // 1. Check phrase patterns (highest weight: 5 for civil, 8 for criminal)
      if (subSpecData.phrasePatterns) {
        for (const pattern of subSpecData.phrasePatterns) {
          if (lowerText.includes(pattern.toLowerCase())) {
            matchScore += phraseWeight;
            matchDetails.push(`phrase: "${pattern}"`);
            matchedKeywords.push(pattern);
          }
        }
      }

      // 2. Check word combinations (weight: 4 for civil, 7 for criminal)
      if (subSpecData.wordCombinations) {
        for (const combo of subSpecData.wordCombinations) {
          if (hasWordCombination(words, combo)) {
            const comboWeight = isCriminalMatter ? (combo.weight || 7) : (combo.weight || 4);
            matchScore += comboWeight;
            matchDetails.push(`combo: "${combo.words.join(' ')}"`);
            matchedKeywords.push(combo.words.join(' '));
          }
        }
      }

      // 3. Check exact keyword matches (weight: 3 for civil, 5 for criminal)
      for (const keyword of subSpecData.keywords) {
        if (lowerText.includes(keyword.toLowerCase())) {
          matchScore += keywordWeight;
          matchedKeywords.push(keyword);
        }
      }

      // 4. Check fuzzy matches for typos (weight: 2 for civil, 4 for criminal)
      for (const keyword of subSpecData.keywords) {
        for (const word of words) {
          if (word.length > 3 && calculateSimilarity(word, keyword) > 0.8) {
            matchScore += fuzzyWeight;
            matchDetails.push(`fuzzy: "${word}" ≈ "${keyword}"`);
            if (!matchedKeywords.includes(keyword)) {
              matchedKeywords.push(keyword);
            }
            break; // Only count each word once for fuzzy matching
          }
        }
      }

      // 5. Check partial matches (weight: 1 for civil, 2 for criminal)
      for (const keyword of subSpecData.keywords) {
        for (const word of words) {
          if (word.length > 4 && keyword.includes(word) && word !== keyword) {
            matchScore += partialWeight;
            matchDetails.push(`partial: "${word}" in "${keyword}"`);
            if (!matchedKeywords.includes(keyword)) {
              matchedKeywords.push(keyword);
            }
            break;
          }
        }
      }

      // 6. Bonus for critical criminal matters
      if (isCriminalMatter && (subSpecData.severity === "Critical" || subSpecData.urgency === "Immediate")) {
        matchScore += 3; // Additional bonus for critical criminal matters
        matchDetails.push("critical-criminal-bonus");
      }

      // Update best match if this is better
      if (matchScore > bestMatch.confidence) {
        // Determine match type based on highest scoring pattern
        let matchType = "keyword";
        if (matchDetails.some(detail => detail.includes("phrase:"))) matchType = "phrase";
        else if (matchDetails.some(detail => detail.includes("combo:"))) matchType = "combination";
        else if (matchDetails.some(detail => detail.includes("fuzzy:"))) matchType = "fuzzy";
        else if (matchDetails.some(detail => detail.includes("partial:"))) matchType = "partial";

        bestMatch = {
          specialization: specName,
          subSpecialty: subSpecName,
          confidence: matchScore,
          matchType: matchType,
          keywords: matchedKeywords,
          matchDetails: matchDetails,
          severity: subSpecData.severity,
          urgency: subSpecData.urgency,
          relevantLaws: subSpecData.relevantLaws,
          description: subSpecData.description
        };
      }
    }
  }

  // Check specialized niche categories with enhanced matching
  for (const [categoryName, categoryData] of Object.entries(SPECIALIZED_NICHE_CATEGORIES)) {
    let matchScore = 0;
    let matchedKeywords = [];
    let matchDetails = [];

    // Apply same enhanced matching logic for niche categories
    for (const keyword of categoryData.keywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        matchScore += 3;
        matchedKeywords.push(keyword);
      }
    }

    // Fuzzy matching for niche categories
    for (const keyword of categoryData.keywords) {
      for (const word of words) {
        if (word.length > 3 && calculateSimilarity(word, keyword) > 0.8) {
          matchScore += 2;
          matchDetails.push(`fuzzy: "${word}" ≈ "${keyword}"`);
          if (!matchedKeywords.includes(keyword)) {
            matchedKeywords.push(keyword);
          }
          break;
        }
      }
    }

    if (matchScore > bestMatch.confidence) {
      bestMatch = {
        specialization: categoryData.specialization,
        subSpecialty: categoryData.subSpecialty,
        confidence: matchScore,
        matchType: matchDetails.length > 0 ? "fuzzy" : "keyword",
        keywords: matchedKeywords,
        matchDetails: matchDetails,
        severity: categoryData.severity,
        urgency: categoryData.urgency,
        relevantLaws: categoryData.relevantLaws,
        description: categoryData.description
      };
    }
  }

  // Add confidence level classification
  if (bestMatch.confidence >= 10) {
    bestMatch.confidenceLevel = "High";
  } else if (bestMatch.confidence >= 5) {
    bestMatch.confidenceLevel = "Medium";
  } else if (bestMatch.confidence > 0) {
    bestMatch.confidenceLevel = "Low";
  } else {
    bestMatch.confidenceLevel = "None";
  }

  // Enhanced priority system to prevent misclassification
  // Check for specific high-priority patterns that should override current best match
  const highPriorityPatterns = [
    {
      keywords: ["land", "property", "ancestral", "illegal", "took", "taken"],
      expectedSpec: "Property & Real Estate Law",
      expectedSubSpec: "Illegal Possession",
      description: "Property dispute involving illegal possession",
      priority: 1 // Higher priority for property disputes
    },
    {
      keywords: ["online", "fraud", "cheated", "internet", "digital"],
      expectedSpec: "Cyber Law",
      expectedSubSpec: "Online Fraud",
      description: "Online fraud matter",
      priority: 1 // Higher priority for cyber crimes
    },
    {
      keywords: ["hacked", "hacking", "account", "social media", "cyber"],
      expectedSpec: "Cyber Law",
      expectedSubSpec: "Hacking",
      description: "Cyber crime involving hacking",
      priority: 1 // Higher priority for cyber crimes
    },
    {
      keywords: ["builder", "rera", "construction", "flat", "delivery"],
      expectedSpec: "Property & Real Estate Law",
      expectedSubSpec: "Builder Disputes (RERA Cases)",
      description: "Builder and real estate dispute",
      priority: 1 // Higher priority for property disputes
    },
    {
      keywords: ["company", "breached", "contract", "fired", "termination", "dismissal"],
      expectedSpec: "Labour & Employment Law",
      expectedSubSpec: "Wrongful Termination",
      description: "Wrongful termination and employment dispute",
      priority: 1 // Higher priority for employment disputes
    }
  ];

  // Check if any high-priority pattern matches better than current best match
  for (const pattern of highPriorityPatterns) {
    const keywordMatches = pattern.keywords.filter(keyword =>
      lowerText.includes(keyword.toLowerCase())
    );
    
    if (keywordMatches.length >= 2) { // At least 2 keywords must match
      let patternScore = keywordMatches.length * 6; // High weight for priority patterns
      
      // Extra boost for employment-related patterns
      if (pattern.priority && pattern.priority === 1) {
        patternScore += 12; // Additional boost for employment disputes
      }
      
      if (patternScore > bestMatch.confidence) {
        // Find the specific sub-specialty in the expected specialization
        const targetSpec = LEGAL_SPECIALIZATIONS[pattern.expectedSpec];
        if (targetSpec && targetSpec.subSpecialties[pattern.expectedSubSpec]) {
          const targetSubSpec = targetSpec.subSpecialties[pattern.expectedSubSpec];
          bestMatch = {
            specialization: pattern.expectedSpec,
            subSpecialty: pattern.expectedSubSpec,
            confidence: patternScore,
            matchType: "priority-pattern",
            keywords: keywordMatches,
            matchDetails: [`priority-pattern: ${pattern.description}`],
            severity: targetSubSpec.severity,
            urgency: targetSubSpec.urgency,
            relevantLaws: targetSubSpec.relevantLaws,
            description: targetSubSpec.description
          };
        }
      }
    }
  }

  return bestMatch;
}

function getAllSpecializations() {
  return Object.keys(LEGAL_SPECIALIZATIONS);
}

function getSubSpecialties(specialization) {
  return LEGAL_SPECIALIZATIONS[specialization]?.subSpecialties || {};
}

function getSpecializedNicheCategories() {
  return Object.keys(SPECIALIZED_NICHE_CATEGORIES);
}

module.exports = {
  LEGAL_SPECIALIZATIONS,
  SPECIALIZED_NICHE_CATEGORIES,
  findBestSpecialization,
  getAllSpecializations,
  getSubSpecialties,
  getSpecializedNicheCategories
};
