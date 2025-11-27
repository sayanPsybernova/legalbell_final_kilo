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

// Add a test booking for lawyer Sayan
function addTestBooking() {
  const db = readDB();
  
  // Find lawyer Sayan
  const lawyerSayan = db.lawyers.find(l => l.email === 'sayan@gmail.com' || l.name.includes('Sayan'));
  
  if (!lawyerSayan) {
    console.log('Lawyer Sayan not found in database');
    return;
  }
  
  // Create test booking
  const testBooking = {
    id: Date.now(),
    lawyerId: lawyerSayan.id,
    lawyerName: lawyerSayan.name,
    clientName: 'Test Client',
    clientEmail: 'testclient@gmail.com',
    date: new Date().toLocaleDateString(),
    time: '10:00 AM',
    duration: 1,
    caseType: 'Murder Defense Consultation',
    fee: lawyerSayan.fee,
    status: 'confirmed',
    createdAt: new Date().toISOString()
  };
  
  db.bookings.push(testBooking);
  writeDB(db);
  
  console.log('Successfully added test booking for lawyer Sayan:');
  console.log('- Lawyer:', testBooking.lawyerName);
  console.log('- Client:', testBooking.clientName);
  console.log('- Date:', testBooking.date);
  console.log('- Time:', testBooking.time);
  console.log('- Case Type:', testBooking.caseType);
  console.log('- Fee:', testBooking.fee);
  console.log('- Booking ID:', testBooking.id);
}

// Run the function
addTestBooking();