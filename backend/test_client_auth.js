const http = require('http');

// Helper function to make HTTP requests
function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 4000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve({ status: res.statusCode, data: response });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Test client authentication flow
async function testClientAuth() {
  console.log('🧪 Starting Client Authentication Tests...\n');

  try {
    // Test 1: Register a new client
    console.log('📝 Test 1: Registering a new client...');
    const uniqueEmail = `testclient${Date.now()}@example.com`;
    const registerResponse = await makeRequest('/api/register', 'POST', {
      role: 'client',
      name: 'Test Client',
      email: uniqueEmail,
      password: 'TestPass123'
    });

    if (registerResponse.status === 200 && registerResponse.data.ok) {
      console.log('✅ Client registration successful');
      console.log(`   Client ID: ${registerResponse.data.user.id}`);
      console.log(`   Client Name: ${registerResponse.data.user.name}`);
      console.log(`   Client Email: ${registerResponse.data.user.email}\n`);
    } else {
      console.log('❌ Client registration failed:', registerResponse.data);
      return;
    }

    const clientId = registerResponse.data.user.id;
    const clientEmail = registerResponse.data.user.email;

    // Test 2: Login with correct credentials
    console.log('🔐 Test 2: Login with correct credentials...');
    const loginResponse = await makeRequest('/api/login', 'POST', {
      email: clientEmail,
      password: 'TestPass123',
      role: 'client'
    });

    if (loginResponse.status === 200 && loginResponse.data.ok) {
      console.log('✅ Client login successful');
      console.log(`   Logged in as: ${loginResponse.data.user.name}\n`);
    } else {
      console.log('❌ Client login failed:', loginResponse.data);
    }

    // Test 3: Login with wrong password
    console.log('🔐 Test 3: Login with wrong password...');
    const wrongPassResponse = await makeRequest('/api/login', 'POST', {
      email: clientEmail,
      password: 'WrongPass123',
      role: 'client'
    });

    if (wrongPassResponse.status === 200 && !wrongPassResponse.data.ok) {
      console.log('✅ Wrong password correctly rejected');
      console.log(`   Error: ${wrongPassResponse.data.error}\n`);
    } else {
      console.log('❌ Wrong password should be rejected');
    }

    // Test 4: Get client profile
    console.log('👤 Test 4: Get client profile...');
    const profileResponse = await makeRequest(`/api/client/${clientId}`);

    if (profileResponse.status === 200 && profileResponse.data.ok) {
      console.log('✅ Client profile retrieved successfully');
      console.log(`   Name: ${profileResponse.data.client.name}`);
      console.log(`   Email: ${profileResponse.data.client.email}`);
      console.log(`   Bookings: ${profileResponse.data.bookings.length}\n`);
    } else {
      console.log('❌ Profile retrieval failed:', profileResponse.data);
    }

    // Test 5: Update client profile
    console.log('✏️ Test 5: Update client profile...');
    const updateResponse = await makeRequest(`/api/client/${clientId}`, 'PUT', {
      name: 'Updated Test Client',
      email: 'updatedclient@example.com'
    });

    if (updateResponse.status === 200 && updateResponse.data.ok) {
      console.log('✅ Client profile updated successfully');
      console.log(`   New Name: ${updateResponse.data.client.name}`);
      console.log(`   New Email: ${updateResponse.data.client.email}\n`);
    } else {
      console.log('❌ Profile update failed:', updateResponse.data);
    }

    // Test 6: Change password
    console.log('🔒 Test 6: Change client password...');
    const passwordChangeResponse = await makeRequest(`/api/client/${clientId}`, 'PUT', {
      currentPassword: 'TestPass123',
      newPassword: 'NewTestPass456'
    });

    if (passwordChangeResponse.status === 200 && passwordChangeResponse.data.ok) {
      console.log('✅ Password changed successfully\n');
    } else {
      console.log('❌ Password change failed:', passwordChangeResponse.data);
    }

    // Test 7: Login with new password
    console.log('🔐 Test 7: Login with new password...');
    const newLoginResponse = await makeRequest('/api/login', 'POST', {
      email: 'updatedclient@example.com',
      password: 'NewTestPass456',
      role: 'client'
    });

    if (newLoginResponse.status === 200 && newLoginResponse.data.ok) {
      console.log('✅ Login with new password successful');
      console.log(`   Logged in as: ${newLoginResponse.data.user.name}\n`);
    } else {
      console.log('❌ Login with new password failed:', newLoginResponse.data);
    }

    // Test 8: Duplicate email registration
    console.log('📝 Test 8: Try to register with duplicate email...');
    const duplicateResponse = await makeRequest('/api/register', 'POST', {
      role: 'client',
      name: 'Another Client',
      email: 'updatedclient@example.com',
      password: 'AnotherPass123'
    });

    if (duplicateResponse.status === 200 && !duplicateResponse.data.ok) {
      console.log('✅ Duplicate email correctly rejected');
      console.log(`   Error: ${duplicateResponse.data.error}\n`);
    } else {
      console.log('❌ Duplicate email should be rejected');
    }

    // Test 9: Demo client login
    console.log('🔐 Test 9: Demo client login...');
    const demoLoginResponse = await makeRequest('/api/login', 'POST', {
      email: 'client@gmail.com',
      password: 'Client@123',
      role: 'client'
    });

    if (demoLoginResponse.status === 200 && demoLoginResponse.data.ok) {
      console.log('✅ Demo client login successful');
      console.log(`   Logged in as: ${demoLoginResponse.data.user.name}\n`);
    } else {
      console.log('❌ Demo client login failed:', demoLoginResponse.data);
    }

    console.log('🎉 All client authentication tests completed!');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the tests
testClientAuth();