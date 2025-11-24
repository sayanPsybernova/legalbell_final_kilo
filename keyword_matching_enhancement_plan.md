# Keyword Matching Enhancement Plan for LegalBell

## Current Issues Identified

### 1. Limited Keyword Coverage
- Current keywords are too specific and don't include common variations
- Missing colloquial terms and regional language variations
- No handling of typos or misspellings

### 2. Lack of Contextual Patterns
- No phrase-based matching (e.g., "took my land" vs individual words)
- Missing contextual relationships between words
- No weighted importance for different keywords

### 3. Simple Matching Algorithm
- Only uses basic string inclusion
- No fuzzy matching or similarity scoring
- No consideration of word order or proximity

## Enhancement Strategy

### Phase 1: Enhanced Keyword Arrays

#### Criminal Law Enhancements
**Murder / Homicide Cases:**
- Add variations: "kill someone", "someone died", "death caused", "caused death", "person died", "fatal incident", "someone killed", "murder case", "homicide"
- Include Hindi variations: "hatya", "maut", "katal"
- Add contextual phrases: "responsible for death", "led to death"

**Assault / Hurt / Threat:**
- Add variations: "beating", "attack", "violence", "physical harm", "injury", "hurt me", "beat me", "threatened me", "danger", "threatening"
- Include Hindi: "marpit", "dhamki", "jhagda"
- Contextual: "physically assaulted", "threatened to harm"

**Theft / Robbery / Burglary:**
- Add variations: "stole", "robbed", "snatched", "pickpocket", "burgled", "theft", "missing items", "someone took", "robbery"
- Include Hindi: "chori", "chhapa", "cheen liya"
- Contextual: "broke into house", "stolen from", "robbed at"

**Dowry Harassment:**
- Add variations: "dowry torture", "marriage harassment", "in-laws torture", "family harassment", "demanding dowry"
- Include Hindi: "dahej", "dahej ke liye torture"
- Contextual: "harassed for dowry", "tortured after marriage"

#### Property Law Enhancements
**Property Disputes:**
- Add variations: "land dispute", "property conflict", "ownership issue", "title problem", "boundary dispute", "ancestral property"
- Include Hindi: "jameen jhagda", "property jhagda", "khatedari"
- Contextual: "someone occupied my land", "property taken illegally", "boundary issue"

**Illegal Possession:**
- Add variations: "occupied my property", "illegal occupation", "someone took over", "possession dispute", "forcible occupation"
- Include Hindi: "kabza", "zabardasti occupy"
- Contextual: " forcefully occupied", "illegal possession of"

#### Family Law Enhancements
**Divorce Cases:**
- Add variations: "marriage breakdown", "separation", "want divorce", "file divorce", "marital problems"
- Include Hindi: "talaq", "divorce chahiye"
- Contextual: "want to separate", "marriage not working"

**Child Custody:**
- Add variations: "child custody", "kids custody", "child access", "visitation rights", "child welfare"
- Include Hindi: "bachche ka custody", "bachche kis ke honge"
- Contextual: "who will keep children", "child's future"

### Phase 2: Contextual Pattern Matching

#### Phrase Patterns
- "someone took my land" → Property Dispute
- "brother occupied property" → Property Dispute
- "police arrested me" → Criminal Defense
- "wife filed case" → Family/Criminal Matter
- "builder not giving flat" → Real Estate Dispute
- "company terminated job" → Employment Law

#### Weighted Keywords
- Primary keywords (weight: 3): murder, theft, divorce, property, assault
- Secondary keywords (weight: 2): land, house, family, job, money
- Contextual keywords (weight: 1): problem, issue, dispute, case, matter

### Phase 3: Fuzzy Matching Implementation

#### Misspelling Handling
- Common typos: "divorse" → "divorce", "propety" → "property", "crimal" → "criminal"
- Phonetic variations: "attorny" → "lawyer", "kort" → "court"
- Regional variations: "advocate", "vakil"

#### Similarity Scoring
- Levenshtein distance for close matches
- Soundex for phonetic matching
- Jaccard similarity for word overlap

### Phase 4: Enhanced findBestSpecialization Function

#### Improved Scoring Algorithm
```javascript
function findBestSpecialization(caseDescription, city) {
  const lowerText = caseDescription.toLowerCase();
  let bestMatch = {
    specialization: "Civil",
    subSpecialty: "General Practice",
    confidence: 0,
    keywords: [],
    severity: "Moderate",
    urgency: "Normal",
    relevantLaws: [],
    description: "Legal matter requiring professional consultation"
  };

  // Enhanced matching with multiple strategies
  for (const [specName, specData] of Object.entries(LEGAL_SPECIALIZATIONS)) {
    for (const [subSpecName, subSpecData] of Object.entries(specData.subSpecialties)) {
      let matchScore = 0;
      let matchedKeywords = [];
      
      // 1. Exact keyword matching
      for (const keyword of subSpecData.keywords) {
        if (lowerText.includes(keyword)) {
          matchScore += 3; // Higher weight for exact matches
          matchedKeywords.push(keyword);
        }
      }
      
      // 2. Phrase pattern matching
      if (subSpecData.phrasePatterns) {
        for (const pattern of subSpecData.phrasePatterns) {
          if (lowerText.includes(pattern)) {
            matchScore += 5; // Highest weight for phrase patterns
            matchedKeywords.push(pattern);
          }
        }
      }
      
      // 3. Fuzzy matching
      for (const keyword of subSpecData.keywords) {
        const similarity = calculateSimilarity(lowerText, keyword);
        if (similarity > 0.8) {
          matchScore += 2;
          matchedKeywords.push(keyword);
        }
      }
      
      // 4. Contextual scoring
      matchScore += calculateContextualScore(lowerText, subSpecData);
      
      if (matchScore > bestMatch.confidence) {
        bestMatch = {
          specialization: specName,
          subSpecialty: subSpecName,
          confidence: matchScore,
          keywords: matchedKeywords,
          severity: subSpecData.severity,
          urgency: subSpecData.urgency,
          relevantLaws: subSpecData.relevantLaws,
          description: subSpecData.description
        };
      }
    }
  }
  
  return bestMatch;
}
```

#### Helper Functions
```javascript
// Calculate string similarity
function calculateSimilarity(str1, str2) {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

// Calculate contextual score based on word proximity and order
function calculateContextualScore(text, subSpecData) {
  let score = 0;
  const words = text.split(' ');
  
  // Check for word combinations
  if (subSpecData.wordCombinations) {
    for (const combo of subSpecData.wordCombinations) {
      if (hasWordCombination(words, combo)) {
        score += combo.weight || 2;
      }
    }
  }
  
  return score;
}

// Check if word combination exists in text
function hasWordCombination(words, combo) {
  const comboWords = combo.words.map(w => w.toLowerCase());
  let foundCount = 0;
  let lastIndex = -1;
  
  for (const comboWord of comboWords) {
    const index = words.findIndex((word, i) => 
      i > lastIndex && word.toLowerCase().includes(comboWord)
    );
    if (index !== -1) {
      foundCount++;
      lastIndex = index;
    }
  }
  
  return foundCount === comboWords.length;
}
```

### Phase 5: Testing Strategy

#### Test Cases
1. **Property Disputes:**
   - "brother took my land" → Property Law
   - "someone occupied my ancestral property" → Property Law
   - "boundary dispute with neighbor" → Property Law

2. **Criminal Matters:**
   - "police arrested me without reason" → Criminal Law
   - "someone threatened to kill me" → Criminal Law
   - "my wallet was stolen" → Criminal Law

3. **Family Matters:**
   - "want divorce from husband" → Family Law
   - "wife left with children" → Family Law
   - "in-laws harassing for dowry" → Family Law

4. **Corporate Matters:**
   - "company fired me unfairly" → Corporate Law
   - "business partner cheated me" → Corporate Law
   - "contract breach by client" → Corporate Law

### Phase 6: Integration with Gemini AI

#### Enhanced Prompts
- Use structured keyword data to guide Gemini analysis
- Provide context about matched keywords and confidence scores
- Ask Gemini to validate and refine specialization matching
- Include Indian legal context and regional variations

## Implementation Priority

1. **High Priority:** Enhanced keyword arrays and phrase patterns
2. **Medium Priority:** Fuzzy matching and similarity scoring
3. **Low Priority:** Advanced contextual analysis and machine learning

## Expected Outcomes

1. **Improved Accuracy:** 90%+ correct specialization identification
2. **Better User Experience:** Fewer clarification requests
3. **Enhanced Matching:** More precise lawyer recommendations
4. **Regional Support:** Handle Hindi/Regional language variations
5. **Error Tolerance:** Handle typos and misspellings gracefully

## Success Metrics

- Reduction in clarification requests by 70%
- Increase in exact match rate from 60% to 90%
- User satisfaction score improvement
- Reduction in case reclassification requests