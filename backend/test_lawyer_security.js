const axios = require('axios');
const crypto = require('crypto');

const API_BASE = 'http://localhost:4000/api';

async function testLawyerSecurity() {
  console.log('🔐 Testing Lawyer Registration and Login Security');
  console.log('='.repeat(60));

  try {
    // Test 1: Register a new lawyer
    console.log('\n📝 Test 1: Registering new lawyer...');
    const lawyerData = {
      role: 'lawyer',
      name: 'Security Test Lawyer',
      email: 'securitytest@lawyer.com',
      password: 'SecurePass@123',
      city: 'Bangalore',
      specialization: 'Corporate',
      fee: 3000,
      experience: 8,
      about: 'Testing security features'
    };

    const registerResponse = await axios.post(`${API_BASE}/register`, lawyerData);
    console.log('✅ Registration successful:', registerResponse.data.user.name);

    // Test 2: Verify password is hashed in database
    console.log('\n🔍 Test 2: Verifying password hashing in database...');
    const fs = require('fs');
    const path = require('path');
    const dbPath = path.join(__dirname, 'db.json');
    const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    
    const registeredUser = db.users.find(u => u.email === 'securitytest@lawyer.com');
    if (registeredUser) {
      const isHashed = registeredUser.password.length === 64 && /^[a-f0-9]{64}$/.test(registeredUser.password);
      console.log(isHashed ? '✅ Password is properly hashed' : '❌ Password is not hashed');
      console.log('📊 Hash length:', registeredUser.password.length);
      
      // Test 3: Verify hash matches original password
      const expectedHash = crypto.createHash('sha256').update('SecurePass@123').digest('hex');
      const hashMatches = registeredUser.password === expectedHash;
      console.log(hashMatches ? '✅ Hash matches expected value' : '❌ Hash mismatch');
    }

    // Test 4: Login with correct password
    console.log('\n🔑 Test 4: Login with correct password...');
    const loginResponse = await axios.post(`${API_BASE}/login`, {
      email: 'securitytest@lawyer.com',
      password: 'SecurePass@123',
      role: 'lawyer'
    });
    console.log('✅ Login successful:', loginResponse.data.user.name);
    console.log('📊 Lawyer details loaded:', {
      specialization: loginResponse.data.user.specialization,
      location: loginResponse.data.user.location,
      fee: loginResponse.data.user.fee
    });

    // Test 5: Login with incorrect password
    console.log('\n🚫 Test 5: Login with incorrect password...');
    try {
      await axios.post(`${API_BASE}/login`, {
        email: 'securitytest@lawyer.com',
        password: 'WrongPassword@123',
        role: 'lawyer'
      });
      console.log('❌ Login should have failed but succeeded');
    } catch (error) {
      if (error.response && error.response.status === 200 && error.response.data.ok === false) {
        console.log('✅ Login correctly rejected invalid password');
      } else {
        console.log('⚠️ Unexpected error:', error.message);
      }
    }

    // Test 6: Verify demo accounts still work
    console.log('\n👤 Test 6: Verify demo accounts still work...');
    const demoLoginResponse = await axios.post(`${API_BASE}/login`, {
      email: 'lawyer@gmail.com',
      password: 'Lawyer@123',
      role: 'lawyer'
    });
    console.log('✅ Demo lawyer login works:', demoLoginResponse.data.user.name);

    // Test 7: Check lawyer profile in database
    console.log('\n📋 Test 7: Verify lawyer profile in database...');
    const lawyerProfile = db.lawyers.find(l => l.id === registeredUser.id);
    if (lawyerProfile) {
      console.log('✅ Lawyer profile found in database');
      console.log('📊 Profile details:', {
        name: lawyerProfile.name,
        specialization: lawyerProfile.specialization,
        location: lawyerProfile.location,
        fee: lawyerProfile.fee,
        experience: lawyerProfile.experience
      });
    } else {
      console.log('❌ Lawyer profile not found in database');
    }

    console.log('\n🎉 All security tests completed!');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testLawyerSecurity();