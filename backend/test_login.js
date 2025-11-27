const axios = require('axios');

async function testLawyerLogin() {
  try {
    console.log('Testing lawyer login for Sayan...');
    
    // Test login with Sayan's credentials
    const loginData = {
      email: 'sayan@gmail.com',
      password: 'Sayan@123',
      role: 'lawyer'
    };
    
    const response = await axios.post('http://localhost:4000/api/login', loginData);
    
    if (response.data.ok) {
      console.log('✅ Login successful!');
      console.log('User details:', response.data.user);
      console.log('- Name:', response.data.user.name);
      console.log('- Email:', response.data.user.email);
      console.log('- Role:', response.data.user.role);
      console.log('- ID:', response.data.user.id);
    } else {
      console.log('❌ Login failed:', response.data.error || 'Unknown error');
    }
    
  } catch (error) {
    console.error('❌ Login test failed with error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Test the login
testLawyerLogin();