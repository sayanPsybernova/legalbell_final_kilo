# Testing Framework for Enhanced Keyword Matching

## Test Cases for Validation

### 1. Criminal Law Test Cases

#### Murder/Homicide Cases
```javascript
const murderTestCases = [
  {
    input: "someone killed my father",
    expected: { specialization: "Criminal Law", subSpecialty: "Murder / Homicide Cases" },
    description: "Direct murder description"
  },
  {
    input: "person died due to accident caused by someone",
    expected: { specialization: "Criminal Law", subSpecialty: "Murder / Homicide Cases" },
    description: "Indirect death description"
  },
  {
    input: "hatya case mein fasaya gaya hun",
    expected: { specialization: "Criminal Law", subSpecialty: "Murder / Homicide Cases" },
    description: "Hindi variation"
  },
  {
    input: "murdr case",
    expected: { specialization: "Criminal Law", subSpecialty: "Murder / Homicide Cases" },
    description: "Typo variation"
  }
];
```

#### Assault/Violence Cases
```javascript
const assaultTestCases = [
  {
    input: "someone threatened to kill me",
    expected: { specialization: "Criminal Law", subSpecialty: "Assault / Hurt / Threat" },
    description: "Threat with kill"
  },
  {
    input: "physically assaulted by colleague",
    expected: { specialization: "Criminal Law", subSpecialty: "Assault / Hurt / Threat" },
    description: "Physical assault"
  },
  {
    input: "dhamki de rahe hain",
    expected: { specialization: "Criminal Law", subSpecialty: "Assault / Hurt / Threat" },
    description: "Hindi threat"
  },
  {
    input: "beat me up badly",
    expected: { specialization: "Criminal Law", subSpecialty: "Assault / Hurt / Threat" },
    description: "Beating description"
  }
];
```

#### Theft/Robbery Cases
```javascript
const theftTestCases = [
  {
    input: "someone stole my wallet",
    expected: { specialization: "Criminal Law", subSpecialty: "Theft / Robbery / Burglary" },
    description: "Wallet theft"
  },
  {
    input: "broke into my house and stole items",
    expected: { specialization: "Criminal Law", subSpecialty: "Theft / Robbery / Burglary" },
    description: "House burglary"
  },
  {
    input: "chain snatching happened",
    expected: { specialization: "Criminal Law", subSpecialty: "Theft / Robbery / Burglary" },
    description: "Chain snatching"
  },
  {
    input: "chori kar liya mobile",
    expected: { specialization: "Criminal Law", subSpecialty: "Theft / Robbery / Burglary" },
    description: "Hindi theft"
  }
];
```

### 2. Property Law Test Cases

#### Property Disputes
```javascript
const propertyTestCases = [
  {
    input: "brother took my land",
    expected: { specialization: "Property & Real Estate Law", subSpecialty: "Property Dispute" },
    description: "Brother land dispute"
  },
  {
    input: "someone occupied my ancestral property",
    expected: { specialization: "Property & Real Estate Law", subSpecialty: "Illegal Possession" },
    description: "Ancestral property occupation"
  },
  {
    input: "jameen par kabza kar liya",
    expected: { specialization: "Property & Real Estate Law", subSpecialty: "Illegal Possession" },
    description: "Hindi land occupation"
  },
  {
    input: "property boundary dispute with neighbor",
    expected: { specialization: "Property & Real Estate Law", subSpecialty: "Property Dispute" },
    description: "Boundary dispute"
  }
];
```

#### Property Partition
```javascript
const partitionTestCases = [
  {
    input: "want partition of joint family property",
    expected: { specialization: "Civil Law", subSpecialty: "Property Partition" },
    description: "Joint property partition"
  },
  {
    input: "property ka batwara chahiye",
    expected: { specialization: "Civil Law", subSpecialty: "Property Partition" },
    description: "Hindi partition"
  },
  {
    input: "ancestral property division among siblings",
    expected: { specialization: "Civil Law", subSpecialty: "Property Partition" },
    description: "Ancestral division"
  }
];
```

### 3. Family Law Test Cases

#### Divorce Cases
```javascript
const divorceTestCases = [
  {
    input: "want divorce from husband",
    expected: { specialization: "Family Law", subSpecialty: "Divorce (Mutual / Contested)" },
    description: "Direct divorce request"
  },
  {
    input: "marriage not working want separation",
    expected: { specialization: "Family Law", subSpecialty: "Divorce (Mutual / Contested)" },
    description: "Marriage breakdown"
  },
  {
    input: "talaq chahiye",
    expected: { specialization: "Family Law", subSpecialty: "Divorce (Mutual / Contested)" },
    description: "Hindi divorce"
  },
  {
    input: "divorse case",
    expected: { specialization: "Family Law", subSpecialty: "Divorce (Mutual / Contested)" },
    description: "Typo variation"
  }
];
```

#### Child Custody
```javascript
const custodyTestCases = [
  {
    input: "wife left with children want custody",
    expected: { specialization: "Family Law", subSpecialty: "Child Custody" },
    description: "Child custody dispute"
  },
  {
    input: "bachche ka custody ka case",
    expected: { specialization: "Family Law", subSpecialty: "Child Custody" },
    description: "Hindi custody"
  },
  {
    input: "who will keep children after divorce",
    expected: { specialization: "Family Law", subSpecialty: "Child Custody" },
    description: "Child custody question"
  }
];
```

#### Dowry Harassment
```javascript
const dowryTestCases = [
  {
    input: "in-laws harassing for dowry",
    expected: { specialization: "Criminal Law", subSpecialty: "Dowry Harassment (Sec 498A)" },
    description: "Dowry harassment"
  },
  {
    input: "dahej ke liye pareshan kar rahe hain",
    expected: { specialization: "Criminal Law", subSpecialty: "Dowry Harassment (Sec 498A)" },
    description: "Hindi dowry harassment"
  },
  {
    input: "tortured after marriage for money",
    expected: { specialization: "Criminal Law", subSpecialty: "Dowry Harassment (Sec 498A)" },
    description: "Indirect dowry reference"
  }
];
```

### 4. Corporate Law Test Cases

#### Business Disputes
```javascript
const corporateTestCases = [
  {
    input: "company terminated job unfairly",
    expected: { specialization: "Corporate / Commercial Law", subSpecialty: "Business Contracts" },
    description: "Unfair termination"
  },
  {
    input: "business partner cheated me",
    expected: { specialization: "Corporate / Commercial Law", subSpecialty: "Business Contracts" },
    description: "Partnership dispute"
  },
  {
    input: "contract breach by client",
    expected: { specialization: "Corporate / Commercial Law", subSpecialty: "Business Contracts" },
    description: "Contract breach"
  },
  {
    input: "company dhoka diya",
    expected: { specialization: "Corporate / Commercial Law", subSpecialty: "Business Contracts" },
    description: "Hindi business dispute"
  }
];
```

### 5. Cyber Law Test Cases

#### Cyber Crimes
```javascript
const cyberTestCases = [
  {
    input: "someone hacked my account",
    expected: { specialization: "Cyber Law", subSpecialty: "Hacking" },
    description: "Account hacking"
  },
  {
    input: "online fraud happened with me",
    expected: { specialization: "Cyber Law", subSpecialty: "Online Fraud" },
    description: "Online fraud"
  },
  {
    input: "data breach in company",
    expected: { specialization: "Cyber Law", subSpecialty: "Data Privacy" },
    description: "Data breach"
  },
  {
    input: "cyber crime case",
    expected: { specialization: "Cyber Law", subSpecialty: "Hacking" },
    description: "Direct cyber crime"
  }
];
```

## Test Execution Framework

### Test Runner Function
```javascript
function runTests() {
  const allTestCases = [
    { category: "Murder/Homicide", cases: murderTestCases },
    { category: "Assault/Violence", cases: assaultTestCases },
    { category: "Theft/Robbery", cases: theftTestCases },
    { category: "Property Disputes", cases: propertyTestCases },
    { category: "Property Partition", cases: partitionTestCases },
    { category: "Divorce Cases", cases: divorceTestCases },
    { category: "Child Custody", cases: custodyTestCases },
    { category: "Dowry Harassment", cases: dowryTestCases },
    { category: "Corporate Disputes", cases: corporateTestCases },
    { category: "Cyber Crimes", cases: cyberTestCases }
  ];

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = [];

  for (const category of allTestCases) {
    console.log(`\n=== Testing ${category.category} ===`);
    
    for (const testCase of category.cases) {
      totalTests++;
      const result = findBestSpecialization(testCase.input, "Mumbai");
      
      const passed = result.specialization === testCase.expected.specialization &&
                   result.subSpecialty === testCase.expected.subSpecialty;
      
      if (passed) {
        passedTests++;
        console.log(`✅ PASS: "${testCase.input}" -> ${result.specialization} / ${result.subSpecialty} (Confidence: ${result.confidence})`);
      } else {
        failedTests.push({
          input: testCase.input,
          expected: testCase.expected,
          actual: {
            specialization: result.specialization,
            subSpecialty: result.subSpecialty,
            confidence: result.confidence
          },
          description: testCase.description
        });
        console.log(`❌ FAIL: "${testCase.input}"`);
        console.log(`   Expected: ${testCase.expected.specialization} / ${testCase.expected.subSpecialty}`);
        console.log(`   Actual: ${result.specialization} / ${result.subSpecialty} (Confidence: ${result.confidence})`);
      }
    }
  }

  // Summary
  console.log(`\n=== Test Summary ===`);
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${totalTests - passedTests}`);
  console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(2)}%`);

  if (failedTests.length > 0) {
    console.log(`\n=== Failed Tests ===`);
    failedTests.forEach(test => {
      console.log(`\nInput: "${test.input}"`);
      console.log(`Description: ${test.description}`);
      console.log(`Expected: ${test.expected.specialization} / ${test.expected.subSpecialty}`);
      console.log(`Actual: ${test.actual.specialization} / ${test.actual.subSpecialty} (Confidence: ${test.actual.confidence})`);
    });
  }

  return {
    total: totalTests,
    passed: passedTests,
    failed: totalTests - passedTests,
    successRate: (passedTests / totalTests) * 100,
    failedTests
  };
}
```

### Performance Metrics
```javascript
function analyzePerformance(testResults) {
  const metrics = {
    overallAccuracy: testResults.successRate,
    categoryPerformance: {},
    confidenceAnalysis: {
      high: 0,    // > 10
      medium: 0,   // 5-10
      low: 0       // < 5
    }
  };

  // Analyze by category
  const categories = ["Murder/Homicide", "Assault/Violence", "Theft/Robbery", 
                   "Property Disputes", "Divorce Cases", "Corporate Disputes", "Cyber Crimes"];
  
  categories.forEach(category => {
    const categoryTests = testResults.failedTests.filter(t => 
      t.description.includes(category.split('/')[0]) || 
      t.description.includes(category.split(' ')[0])
    );
    
    metrics.categoryPerformance[category] = {
      total: categoryTests.length,
      failed: categoryTests.length,
      accuracy: ((categoryTests.length - categoryTests.length) / categoryTests.length) * 100
    };
  });

  return metrics;
}
```

## Expected Results

### Success Criteria
1. **Overall Accuracy**: > 90%
2. **Critical Cases** (Murder, Rape, Dowry): > 95%
3. **Property Disputes**: > 90%
4. **Family Matters**: > 85%
5. **Corporate/Cyber**: > 80%

### Confidence Score Analysis
- **High Confidence** (> 10): Should be for clear, direct cases
- **Medium Confidence** (5-10): Should be for contextual cases
- **Low Confidence** (< 5): Should be for vague cases

## Integration Testing

### API Integration Test
```javascript
async function testAPIIntegration() {
  const testCases = [
    "brother took my land",
    "want divorce from husband", 
    "someone stole my wallet",
    "company terminated job unfairly",
    "someone hacked my account"
  ];

  for (const testCase of testCases) {
    try {
      const response = await fetch('/api/analyze-case', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseDescription: testCase,
          city: 'Mumbai'
        })
      });

      const data = await response.json();
      console.log(`Input: "${testCase}"`);
      console.log(`Result: ${data.analysis.specialization} / ${data.analysis.subSpecialty}`);
      console.log(`Confidence: ${data.analysis.confidence || 'N/A'}`);
      console.log(`Lawyers found: ${data.matchingLawyers.length}`);
      console.log('---');
    } catch (error) {
      console.error(`Error testing "${testCase}":`, error);
    }
  }
}
```

## Continuous Improvement

### Monitoring
1. **Log all mismatches** for analysis
2. **Track confidence scores** distribution
3. **Monitor user feedback** on lawyer matches
4. **Analyze clarification requests** patterns

### Iteration
1. **Add new keywords** based on failed tests
2. **Adjust weights** based on performance
3. **Add new patterns** for edge cases
4. **Regional variations** expansion

This comprehensive testing framework will ensure the enhanced keyword matching system works accurately across all case types and variations.