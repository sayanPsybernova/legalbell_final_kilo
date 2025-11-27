const http = require('http');

function testLawyerLogin() {
  const postData = JSON.stringify({
    email: 'sayan@gmail.com',
    password: 'Sayan@123',
    role: 'lawyer'
  });

  const options = {
    hostname: 'localhost',
    port: 4000,
    path: '/api/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        
        if (response.ok) {
          console.log('✅ Login successful!');
          console.log('User details:', response.user);
          console.log('- Name:', response.user.name);
          console.log('- Email:', response.user.email);
          console.log('- Role:', response.user.role);
          console.log('- ID:', response.user.id);
        } else {
          console.log('❌ Login failed:', response.error || 'Unknown error');
        }
      } catch (parseError) {
        console.error('❌ Failed to parse response:', parseError.message);
        console.log('Raw response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Login test failed with error:', error.message);
  });

  req.write(postData);
  req.end();
}

console.log('Testing lawyer login for Sayan...');
testLawyerLogin();