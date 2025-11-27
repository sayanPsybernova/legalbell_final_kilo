const axios = require('axios');

const API_BASE = 'http://localhost:4000/api';

async function testClientDB() {
  console.log('🧪 Testing Client Database Separation...\n');

  try {
    // Test 1: Register a new client
    console.log('1. Testing client registration...');
    const registerResponse = await axios.post(`${API_BASE}/register`, {
      role: 'client',
      name: 'Test Client',
      email: 'testclient@example.com',
      password: 'TestPass123'
    });
    
    const registerResult = registerResponse.data;
    console.log('Registration result:', registerResult);
    
    if (registerResult.ok) {
      console.log('✅ Client registration successful');
      
      // Test 2: Login with the new client
      console.log('\n2. Testing client login...');
      const loginResponse = await axios.post(`${API_BASE}/login`, {
        email: 'testclient@example.com',
        password: 'TestPass123',
        role: 'client'
      });
      
      const loginResult = loginResponse.data;
      console.log('Login result:', loginResult);
      
      if (loginResult.ok) {
        console.log('✅ Client login successful');
        
        // Test 3: Get client profile
        console.log('\n3. Testing client profile retrieval...');
        const profileResponse = await axios.get(`${API_BASE}/client/${loginResult.user.id}`);
        const profileResult = profileResponse.data;
        console.log('Profile result:', profileResult);
        
        if (profileResult.ok) {
          console.log('✅ Client profile retrieval successful');
        } else {
          console.log('❌ Client profile retrieval failed');
        }
      } else {
        console.log('❌ Client login failed');
      }
    } else {
      console.log('❌ Client registration failed');
    }
    
    // Test 4: Verify lawyer login still works
    console.log('\n4. Testing lawyer login (should use main DB)...');
    const lawyerLoginResponse = await axios.post(`${API_BASE}/login`, {
      email: 'lawyer@gmail.com',
      password: 'Lawyer@123',
      role: 'lawyer'
    });
    
    const lawyerLoginResult = lawyerLoginResponse.data;
    console.log('Lawyer login result:', lawyerLoginResult);
    
    if (lawyerLoginResult.ok) {
      console.log('✅ Lawyer login successful (using main DB)');
    } else {
      console.log('❌ Lawyer login failed');
    }
    
    console.log('\n🎉 Client database separation test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testClientDB();