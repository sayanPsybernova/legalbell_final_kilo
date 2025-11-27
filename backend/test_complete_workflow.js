const http = require('http');

// Test complete workflow: Client searches for lawyers → books a lawyer → payment → booking appears on lawyer dashboard
async function testCompleteWorkflow() {
  console.log('🔍 Testing complete end-to-end workflow...\n');

  try {
    // Step 1: Search for lawyers in Thane (Criminal specialization)
    console.log('📍 Step 1: Searching for lawyers in Thane (Criminal)...');
    const searchResponse = await makeRequest('/api/lawyers?location=Thane&type=Criminal', 'GET');
    
    if (!searchResponse.success) {
      console.error('❌ Failed to search for lawyers');
      return;
    }
    
    const lawyers = searchResponse.data;
    console.log(`✅ Found ${lawyers.length} lawyers in Thane with Criminal specialization`);
    
    // Find our test lawyer Sayan
    const sayanLawyer = lawyers.find(l => l.name.includes('Sayan'));
    if (!sayanLawyer) {
      console.error('❌ Lawyer Sayan not found in search results');
      return;
    }
    
    console.log(`✅ Found lawyer Sayan: ${sayanLawyer.name} (ID: ${sayanLawyer.id})`);
    console.log(`   - Location: ${sayanLawyer.location}`);
    console.log(`   - Specialization: ${sayanLawyer.specialization}`);
    console.log(`   - Sub-specialty: ${sayanLawyer.sub_specialty}`);
    console.log(`   - Fee: ${sayanLawyer.fee}/hour`);

    // Step 2: Create a new client user
    console.log('\n👤 Step 2: Creating new client user...');
    const clientEmail = `testclient${Date.now()}@gmail.com`;
    const clientPassword = 'Client@123';
    
    const registerResponse = await makeRequest('/api/register', 'POST', {
      role: 'client',
      name: 'Test Workflow Client',
      email: clientEmail,
      password: clientPassword
    });
    
    if (!registerResponse.success) {
      console.error('❌ Failed to register client');
      return;
    }
    
    const clientUser = registerResponse.user;
    console.log(`✅ Client registered: ${clientUser.name} (${clientUser.email})`);

    // Step 3: Client login
    console.log('\n🔐 Step 3: Client login...');
    const loginResponse = await makeRequest('/api/login', 'POST', {
      email: clientEmail,
      password: clientPassword,
      role: 'client'
    });
    
    if (!loginResponse.success) {
      console.error('❌ Client login failed');
      return;
    }
    
    const loggedInClient = loginResponse.user;
    console.log(`✅ Client logged in: ${loggedInClient.name}`);

    // Step 4: Book lawyer Sayan
    console.log('\n📅 Step 4: Booking lawyer Sayan...');
    const bookingDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // Tomorrow
    const bookingData = {
      lawyerId: sayanLawyer.id,
      lawyerName: sayanLawyer.name,
      clientId: loggedInClient.id,
      clientName: loggedInClient.name,
      date: bookingDate,
      time: '14:00',
      duration: 1,
      fee: sayanLawyer.fee,
      caseType: 'Murder Defense Consultation'
    };
    
    const bookingResponse = await makeRequest('/api/bookings', 'POST', bookingData);
    
    if (!bookingResponse.success) {
      console.error('❌ Failed to create booking');
      return;
    }
    
    const booking = bookingResponse.booking;
    console.log(`✅ Booking created successfully!`);
    console.log(`   - Booking ID: ${booking.id}`);
    console.log(`   - Lawyer: ${booking.lawyerName}`);
    console.log(`   - Client: ${booking.clientName}`);
    console.log(`   - Date: ${booking.date}`);
    console.log(`   - Time: ${booking.time}`);
    console.log(`   - Duration: ${booking.duration} hour(s)`);
    console.log(`   - Fee: ${booking.fee}`);

    // Step 5: Process payment
    console.log('\n💳 Step 5: Processing payment...');
    const paymentData = {
      ...booking,
      paymentId: 'PAY_' + Date.now(),
      paymentMethod: 'card',
      status: 'paid',
      paidAt: new Date().toISOString()
    };
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const paymentResponse = await makeRequest('/api/bookings', 'POST', paymentData);
    
    if (!paymentResponse.success) {
      console.error('❌ Payment processing failed');
      return;
    }
    
    console.log(`✅ Payment processed successfully!`);
    console.log(`   - Payment ID: ${paymentData.paymentId}`);

    // Step 6: Lawyer login and check dashboard
    console.log('\n👨‍⚖️ Step 6: Lawyer login and dashboard check...');
    const lawyerLoginResponse = await makeRequest('/api/login', 'POST', {
      email: 'sayan@gmail.com',
      password: 'Sayan@123',
      role: 'lawyer'
    });
    
    if (!lawyerLoginResponse.success) {
      console.error('❌ Lawyer login failed');
      return;
    }
    
    const lawyerUser = lawyerLoginResponse.user;
    console.log(`✅ Lawyer logged in: ${lawyerUser.name}`);

    // Step 7: Get all bookings and check if lawyer's booking appears
    console.log('\n📋 Step 7: Checking lawyer dashboard...');
    const bookingsResponse = await makeRequest('/api/bookings', 'GET');
    
    if (!bookingsResponse.success) {
      console.error('❌ Failed to fetch bookings');
      return;
    }
    
    const allBookings = bookingsResponse.data;
    const lawyerBookings = allBookings.filter(b => b.lawyerId === lawyerUser.id);
    
    console.log(`✅ Total bookings in system: ${allBookings.length}`);
    console.log(`✅ Bookings for lawyer Sayan: ${lawyerBookings.length}`);
    
    if (lawyerBookings.length > 0) {
      const lawyerBooking = lawyerBookings.find(b => b.id === booking.id);
      if (lawyerBooking) {
        console.log('\n🎉 SUCCESS! Booking found in lawyer dashboard:');
        console.log(`   - Client: ${lawyerBooking.clientName}`);
        console.log(`   - Date: ${lawyerBooking.date}`);
        console.log(`   - Time: ${lawyerBooking.time}`);
        console.log(`   - Duration: ${lawyerBooking.duration} hour(s)`);
        console.log(`   - Case Type: ${lawyerBooking.caseType}`);
        console.log(`   - Fee: ${lawyerBooking.fee}`);
        console.log(`   - Status: ${lawyerBooking.status}`);
        console.log('\n✅ Complete end-to-end workflow verified!');
      } else {
        console.log('❌ Booking not found in lawyer dashboard');
      }
    } else {
      console.log('❌ No bookings found for lawyer Sayan');
    }

  } catch (error) {
    console.error('❌ Workflow test failed:', error.message);
  }
}

function makeRequest(path, method, data = null) {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : null;
    
    const options = {
      hostname: 'localhost',
      port: 4000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(postData && { 'Content-Length': Buffer.byteLength(postData) })
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve(parsed);
        } catch (parseError) {
          reject(new Error(`Failed to parse response: ${parseError.message}`));
        }
      });
    });

    req.on('error', reject);

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

// Run the complete workflow test
testCompleteWorkflow();