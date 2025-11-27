const http = require('http');

function testSubSpecialtyRegistration() {
  console.log('🔐 Testing Lawyer Registration with Sub-Specialty');
  console.log('='.repeat(60));

  const data = JSON.stringify({
    role: 'lawyer',
    name: 'Sub Specialty Test Lawyer',
    email: 'subspecialty@lawyer.com',
    password: 'Test@123',
    city: 'Delhi',
    specialization: 'Corporate',
    sub_specialty: 'Tax Law & GST Compliance',
    fee: 4000,
    experience: 12,
    about: 'Specializing in corporate taxation and GST matters'
  });

  const options = {
    hostname: 'localhost',
    port: 4000,
    path: '/api/register',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  const req = http.request(options, (res) => {
    let responseData = '';
    res.on('data', (chunk) => {
      responseData += chunk;
    });
    res.on('end', () => {
      console.log('📡 Registration Response:', responseData);
      
      try {
        const result = JSON.parse(responseData);
        if (result.ok) {
          console.log('✅ Registration successful!');
          console.log('📊 User Data:', {
            id: result.user.id,
            name: result.user.name,
            email: result.user.email,
            specialization: result.user.specialization
          });
          
          // Check database
          checkDatabase(result.user.id);
        } else {
          console.log('❌ Registration failed:', result.error);
        }
      } catch (e) {
        console.log('❌ Invalid response format:', responseData);
      }
    });
  });

  req.on('error', (e) => {
    console.error('❌ Request error:', e.message);
  });

  req.write(data);
  req.end();
}

function checkDatabase(userId) {
  console.log('\n🔍 Checking Database Storage...');
  
  const fs = require('fs');
  const db = JSON.parse(fs.readFileSync('db.json', 'utf8'));
  
  // Find lawyer in lawyers array
  const lawyer = db.lawyers.find(l => l.id === userId);
  if (lawyer) {
    console.log('✅ Lawyer found in database');
    console.log('📊 Lawyer Profile:', {
      name: lawyer.name,
      specialization: lawyer.specialization,
      sub_specialty: lawyer.sub_specialty,
      location: lawyer.location,
      fee: lawyer.fee,
      experience: lawyer.experience,
      about: lawyer.about
    });
    
    if (lawyer.sub_specialty === 'Tax Law & GST Compliance') {
      console.log('✅ Sub-specialty stored correctly!');
    } else {
      console.log('❌ Sub-specialty not stored correctly');
    }
  } else {
    console.log('❌ Lawyer not found in lawyers array');
  }
  
  // Find user in users array
  const user = db.users.find(u => u.id === userId);
  if (user) {
    console.log('✅ User account found in database');
    console.log('📊 User Account:', {
      name: user.name,
      email: user.email,
      role: user.role,
      hasPassword: !!user.password,
      isPasswordHashed: user.password.length === 64
    });
  } else {
    console.log('❌ User account not found in users array');
  }
}

// Run the test
testSubSpecialtyRegistration();