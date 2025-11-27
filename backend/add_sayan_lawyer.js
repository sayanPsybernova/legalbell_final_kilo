const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'db.json');

function readDB() {
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch (e) {
    return { lawyers: [], bookings: [], users: [] };
  }
}

function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// Add the new criminal lawyer Sayan
function addSayanLawyer() {
  const db = readDB();
  
  // Check if Sayan already exists
  const existingLawyer = db.lawyers.find(l => l.name.toLowerCase().includes('sayan'));
  const existingUser = db.users.find(u => u.email === 'sayan@gmail.com');
  
  if (existingLawyer) {
    console.log('Lawyer Sayan already exists in the database');
    return;
  }
  
  if (existingUser) {
    console.log('User with email sayan@gmail.com already exists');
    return;
  }
  
  // Generate unique ID for the lawyer
  const lawyerId = Date.now();
  
  // Add lawyer entry
  const newLawyer = {
    id: lawyerId,
    name: "Adv. Sayan",
    specialization: "Criminal",
    sub_specialty: "Murder / Homicide Cases",
    experience: 8,
    location: "Thane",
    fee: 1500,
    image: `https://i.pravatar.cc/150?u=${lawyerId}`,
    about: "Experienced criminal lawyer specializing in murder and homicide cases. Dedicated to providing strong legal defense and ensuring justice for clients in Thane and surrounding areas."
  };
  
  // Add user entry for authentication
  const newUser = {
    id: lawyerId,
    name: "Adv. Sayan",
    email: "sayan@gmail.com",
    password: "Sayan@123",
    role: "lawyer"
  };
  
  db.lawyers.push(newLawyer);
  db.users.push(newUser);
  
  writeDB(db);
  
  console.log('Successfully added lawyer Sayan to the database:');
  console.log('- Name:', newLawyer.name);
  console.log('- Email:', newUser.email);
  console.log('- Specialization:', newLawyer.specialization);
  console.log('- Sub-specialty:', newLawyer.sub_specialty);
  console.log('- Location:', newLawyer.location);
  console.log('- Experience:', newLawyer.experience, 'years');
  console.log('- Fee:', newLawyer.fee, 'per hour');
  console.log('- Login Password:', newUser.password);
}

// Run the function
addSayanLawyer();