const axios = require('axios')

async function testDirectAdminLogin() {
  try {
    console.log('🧪 Testing direct admin login (bypassing health check)...')
    
    const loginData = {
      email: 'superadmin@wine.com',
      password: 'Superadmincool123@!#'
    }

    console.log('📤 Sending login request...')
    const response = await axios.post('http://localhost:5000/api/admin/auth/login', loginData, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Admin-Test-Script/1.0'
      },
      timeout: 10000,
      validateStatus: function (status) {
        return status < 500 // Accept any status code less than 500
      }
    })

    console.log('📥 Response status:', response.status)
    console.log('📥 Response data:', JSON.stringify(response.data, null, 2))

    if (response.status === 200 && response.data.success) {
      console.log('✅ Admin login successful!')
      console.log('📧 Admin:', response.data.data.admin.email)
      console.log('🔑 Role:', response.data.data.admin.role)
      console.log('🎫 Access Token:', response.data.data.accessToken ? 'Generated' : 'Missing')
      console.log('🆔 Session ID:', response.data.data.sessionId ? 'Created' : 'Missing')
    } else {
      console.log('❌ Login failed')
      console.log('Status:', response.status)
      console.log('Message:', response.data.message || response.data.error?.message)
    }

  } catch (error) {
    console.error('❌ Login test failed:')
    
    if (error.response) {
      console.error('Status:', error.response.status)
      console.error('Data:', JSON.stringify(error.response.data, null, 2))
    } else if (error.request) {
      console.error('No response received:', error.message)
    } else {
      console.error('Error:', error.message)
    }
  }
}

testDirectAdminLogin()