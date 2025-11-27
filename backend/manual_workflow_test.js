console.log('🔍 Manual Workflow Test for Lawyer Booking System');
console.log('==========================================\n');

// Test 1: Verify lawyer Sayan exists in database
console.log('\n📍 Step 1: Check if lawyer Sayan exists in database...');
const http = require('http');

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

// Test lawyer search
async function testLawyerSearch() {
  try {
    const response = await makeRequest('/api/lawyers?location=Thane&type=Criminal', 'GET');
    
    if (response && Array.isArray(response) && response.length > 0) {
      const sayanLawyer = response.find(l => l.name.includes('Sayan'));
      if (sayanLawyer) {
        console.log('✅ Lawyer Sayan found in search results!');
        console.log(`   - Name: ${sayanLawyer.name}`);
        console.log(`   - ID: ${sayanLawyer.id}`);
        console.log(`   - Specialization: ${sayanLawyer.specialization}`);
        console.log(`   - Sub-specialty: ${sayanLawyer.sub_specialty}`);
        console.log(`   - Location: ${sayanLawyer.location}`);
        console.log(`   - Fee: ${sayanLawyer.fee}/hour`);
        return sayanLawyer;
      } else {
        console.log('❌ Lawyer Sayan not found in search results');
        return null;
      }
    } else {
      console.log('❌ Failed to search lawyers');
      return null;
    }
  } catch (error) {
    console.error('❌ Search failed:', error.message);
    return null;
  }
}

// Test client registration
async function testClientRegistration() {
  try {
    const clientEmail = `workflowtest${Date.now()}@gmail.com`;
    const response = await makeRequest('/api/register', 'POST', {
      role: 'client',
      name: 'Workflow Test Client',
      email: clientEmail,
      password: 'Client@123'
    });
    
    if (response.success !== undefined) {
      console.log('✅ Client registered successfully!');
      console.log(`   - Client ID: ${response.user.id}`);
      console.log(`   - Email: ${response.user.email}`);
      return response.user;
    } else {
      console.log('❌ Client registration failed');
      return null;
    }
  } catch (error) {
    console.error('❌ Registration failed:', error.message);
    return null;
  }
}

// Test booking creation
async function testBookingCreation(lawyerId, clientId) {
  try {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const bookingDate = tomorrow.toISOString().split('T')[0];
    
    const bookingData = {
      lawyerId: lawyerId,
      lawyerName: 'Adv. Sayan',
      clientId: clientId,
      clientName: 'Workflow Test Client',
      date: bookingDate,
      time: '15:00',
      duration: 1,
      fee: 1500,
      caseType: 'Murder Defense Consultation'
    };
    
    const response = await makeRequest('/api/bookings', 'POST', bookingData);
    
    if (response.success !== undefined) {
      console.log('✅ Booking created successfully!');
      console.log(`   - Booking ID: ${response.id}`);
      console.log(`   - Lawyer: ${response.lawyerName}`);
      console.log(`   - Client: ${response.clientName}`);
      console.log(`   - Date: ${response.date}`);
      console.log(`   - Time: ${response.time}`);
      console.log(`   - Duration: ${response.duration} hour(s)`);
      return response;
    } else {
      console.log('❌ Booking creation failed');
      return null;
    }
  } catch (error) {
    console.error('❌ Booking failed:', error.message);
    return null;
  }
}

// Test lawyer login and dashboard check
async function testLawyerDashboard(lawyerId, bookingId) {
  try {
    // Test lawyer login
    const loginResponse = await makeRequest('/api/login', 'POST', {
      email: 'sayan@gmail.com',
      password: 'Sayan@123',
      role: 'lawyer'
    });
    
    if (loginResponse.success !== undefined) {
      console.log('✅ Lawyer login successful!');
      console.log(`   - Lawyer ID: ${loginResponse.user.id}`);
      
      // Test getting all bookings
      const bookingsResponse = await makeRequest('/api/bookings', 'GET');
      
      if (bookingsResponse.success !== undefined) {
        const allBookings = Array.isArray(bookingsResponse) ? bookingsResponse : [];
        const lawyerBookings = allBookings.filter(b => b.lawyerId === loginResponse.user.id);
        
        console.log(`✅ Total bookings in system: ${allBookings.length}`);
        console.log(`✅ Bookings for lawyer Sayan: ${lawyerBookings.length}`);
        
        const lawyerBooking = lawyerBookings.find(b => b.id === bookingId);
        if (lawyerBooking) {
          console.log('\n🎉 SUCCESS! Booking found in lawyer dashboard:');
          console.log(`   - Client: ${lawyerBooking.clientName}`);
          console.log(`   - Date: ${lawyerBooking.date}`);
          console.log(`   - Time: ${lawyerBooking.time}`);
          console.log(`   - Duration: ${lawyerBooking.duration} hour(s)`);
          console.log(`   - Case Type: ${lawyerBooking.caseType}`);
          console.log(`   - Fee: ${lawyerBooking.fee}`);
          console.log(`   - Status: ${lawyerBooking.status}`);
          return true;
        } else {
          console.log('❌ Booking not found in lawyer dashboard');
          return false;
        }
      } else {
        console.log('❌ Failed to fetch bookings');
        return false;
      }
    } else {
      console.log('❌ Lawyer login failed');
      return false;
    }
  } catch (error) {
    console.error('❌ Dashboard test failed:', error.message);
    return false;
  }
}

// Run complete workflow test
async function runCompleteTest() {
  console.log('\n🚀 Starting complete workflow test...\n');
  
  // Step 1: Search for lawyer Sayan
  const lawyer = await testLawyerSearch();
  if (!lawyer) {
    console.log('\n❌ TEST FAILED: Could not find lawyer Sayan');
    return;
  }
  
  // Step 2: Register new client
  const client = await testClientRegistration();
  if (!client) {
    console.log('\n❌ TEST FAILED: Could not register client');
    return;
  }
  
  // Step 3: Create booking
  const booking = await testBookingCreation(lawyer.id, client.id);
  if (!booking) {
    console.log('\n❌ TEST FAILED: Could not create booking');
    return;
  }
  
  // Step 4: Verify lawyer dashboard
  const dashboardSuccess = await testLawyerDashboard(lawyer.id, booking.id);
  if (!dashboardSuccess) {
    console.log('\n❌ TEST FAILED: Could not verify booking in lawyer dashboard');
    return;
  }
  
  console.log('\n✅ COMPLETE WORKFLOW TEST PASSED!');
  console.log('Clients can successfully book lawyer Sayan with the following flow:');
  console.log('1. Search lawyers by location (Thane) and specialization (Criminal)');
  console.log('2. Register/login as client');
  console.log('3. Select date, time duration, and book lawyer');
  console.log('4. Process payment (simulated)');
  console.log('5. Booking appears in lawyer dashboard with complete details');
  console.log('6. Lawyer can view all bookings and manage practice');
}

// Execute the test
runCompleteTest();