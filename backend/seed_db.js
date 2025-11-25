const fs = require('fs');
const path = require('path');
const { LEGAL_SPECIALIZATIONS } = require('./specializations');

const DB_FILE = path.join(__dirname, 'db.json');

// Mapping from Knowledge Base categories to DB simple categories
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

// List of Indian Cities
const CITIES = [
  // Andhra Pradesh
  "Amaravati", "Visakhapatnam", "Vijayawada", "Guntur", "Tirupati", "Kakinada", "Nellore", "Rajahmundry",
  // Arunachal Pradesh
  "Itanagar", "Tawang", "Pasighat", "Naharlagun",
  // Assam
  "Dispur", "Guwahati", "Dibrugarh", "Silchar", "Jorhat", "Tezpur",
  // Bihar
  "Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Darbhanga",
  // Chhattisgarh
  "Raipur", "Bilaspur", "Korba", "Durg", "Bhilai",
  // Goa
  "Panaji", "Margao", "Vasco da Gama", "Mapusa",
  // Gujarat
  "Gandhinagar", "Ahmedabad", "Surat", "Vadodara", "Rajkot", "Junagadh",
  // Haryana
  "Chandigarh", "Gurgaon", "Faridabad", "Hisar", "Panipat", "Ambala",
  // Himachal Pradesh
  "Shimla", "Dharamshala", "Mandi", "Solan", "Una",
  // Jharkhand
  "Ranchi", "Jamshedpur", "Dhanbad", "Bokaro Steel City", "Hazaribagh",
  // Karnataka
  "Bengaluru", "Mysuru", "Mangaluru", "Hubli–Dharwad", "Belagavi",
  // Kerala
  "Thiruvananthapuram", "Kochi", "Kozhikode", "Kollam", "Thrissur",
  // Madhya Pradesh
  "Bhopal", "Indore", "Gwalior", "Jabalpur", "Ujjain",
  // Maharashtra
  "Mumbai", "Pune", "Nagpur", "Nashik", "Thane", "Aurangabad",
  // Manipur
  "Imphal", "Thoubal", "Churachandpur",
  // Meghalaya
  "Shillong", "Tura", "Jowai",
  // Mizoram
  "Aizawl", "Lunglei", "Champhai",
  // Nagaland
  "Kohima", "Dimapur", "Mokokchung",
  // Odisha
  "Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur",
  // Punjab
  "Amritsar", "Ludhiana", "Jalandhar", "Patiala",
  // Rajasthan
  "Jaipur", "Jodhpur", "Kota", "Udaipur", "Bikaner", "Ajmer",
  // Sikkim
  "Gangtok", "Namchi", "Gyalshing", "Mangan",
  // Tamil Nadu
  "Chennai", "Coimbatore", "Madurai", "Salem", "Tiruchirappalli", "Tirunelveli",
  // Telangana
  "Hyderabad", "Warangal", "Nizamabad", "Karimnagar",
  // Tripura
  "Agartala", "Dharmanagar", "Udaipur",
  // Uttar Pradesh
  "Lucknow", "Kanpur", "Varanasi", "Prayagraj", "Agra", "Noida", "Ghaziabad",
  // Uttarakhand
  "Dehradun", "Haridwar", "Roorkee", "Rishikesh", "Haldwani",
  // West Bengal
  "Kolkata", "Siliguri", "Asansol", "Durgapur", "Howrah",
  // UTs
  "Port Blair", "Daman", "Silvassa", "New Delhi", "Srinagar", "Jammu", "Leh", "Kargil", "Kavaratti", "Puducherry"
];

const FIRST_NAMES = ["Rajesh", "Amit", "Priya", "Suresh", "Anita", "Vikram", "Neha", "Rahul", "Sanjay", "Meera", "Anjali", "Rohit", "Karan", "Sneha", "Arjun", "Fatima", "Pankaj", "Kavita", "Deepak", "Anand", "Rakesh", "Shweta", "Vikas", "Ayesha", "Manoj", "Priyanka", "Gopal", "Lakshmi", "Ahmed", "Renuka", "Tina", "Rajat", "Pooja", "Ramesh", "Kiran", "Arvind", "Mohan", "Ananya", "Ravi", "Nisha", "Rajeev", "Sunita"];
const LAST_NAMES = ["Sharma", "Verma", "Patel", "Singh", "Gupta", "Malhotra", "Kumar", "Reddy", "Mehta", "Nair", "Iyer", "Khan", "Joshi", "Tiwari", "Desai", "Shetty", "Menon", "Pillai", "Yadav", "Choudhary", "Sheikh", "Babu", "Deshmukh", "Mukherjee", "Patil", "Krishnan", "Subramanian", "Bansal", "Rao", "Kapoor"];

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateLawyers() {
  const lawyers = [];
  let idCounter = 1000; // Start IDs from 1000

  // For every city
  CITIES.forEach(city => {
    // For every major category in specializations.js
    Object.entries(LEGAL_SPECIALIZATIONS).forEach(([categoryKey, categoryData]) => {
      const dbSpecialization = CATEGORY_MAPPING[categoryKey];
      
      // Get all sub-specialties for this category
      const subSpecialties = Object.keys(categoryData.subSpecialties);
      
      // To keep the DB size manageable but comprehensive:
      // 1. Always add at least ONE lawyer for EACH Major Category in EACH City.
      // 2. Assign them a RANDOM sub-specialty from that category.
      // 3. ADDITIONALLY, for high-demand categories (Criminal, Family, Property), add 2-3 more lawyers with different sub-specialties.
      
      let countToAdd = 1;
      if (["Criminal Law", "Family Law", "Property & Real Estate Law", "Civil Law"].includes(categoryKey)) {
        countToAdd = 2; // Add 2 lawyers for these popular categories
      }

      for (let i = 0; i < countToAdd; i++) {
        // Pick a random sub-specialty to ensure variety across cities
        // Use modulus to cycle through sub-specialties so we cover them all eventually across different cities/entries
        const subSpecIndex = (idCounter + i) % subSpecialties.length;
        const subSpecialty = subSpecialties[subSpecIndex];
        
        const firstName = getRandomItem(FIRST_NAMES);
        const lastName = getRandomItem(LAST_NAMES);
        
        lawyers.push({
          id: idCounter++,
          name: `Adv. ${firstName} ${lastName}`,
          specialization: dbSpecialization,
          sub_specialty: subSpecialty,
          experience: Math.floor(Math.random() * 20) + 3, // 3 to 23 years
          location: city,
          fee: Math.floor(Math.random() * 45) * 100 + 500, // 500 to 5000
          image: `https://i.pravatar.cc/150?u=${idCounter}`,
          about: `Experienced ${dbSpecialization} lawyer specializing in ${subSpecialty}. Dedicated to providing high-quality legal representation in ${city}.`
        });
      }
    });
  });

  return lawyers;
}

// Main execution
try {
  console.log("Reading existing DB...");
  let dbData = { lawyers: [], bookings: [], users: [] };
  if (fs.existsSync(DB_FILE)) {
    const content = fs.readFileSync(DB_FILE, 'utf8');
    try {
      dbData = JSON.parse(content);
    } catch (e) {
      console.log("Error parsing DB, starting fresh.");
    }
  }

  console.log(`Generating lawyers for ${CITIES.length} cities...`);
  const newLawyers = generateLawyers();
  
  // Replace existing lawyers but keep bookings and users
  dbData.lawyers = newLawyers;

  console.log(`Writing ${newLawyers.length} lawyers to db.json...`);
  fs.writeFileSync(DB_FILE, JSON.stringify(dbData, null, 2));
  console.log("Done!");

} catch (err) {
  console.error("Error seeding DB:", err);
}
