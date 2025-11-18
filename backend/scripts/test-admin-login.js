const axios = require('axios')

async function testAdminLogin() {
  try {
    console.log('🧪 Testing admin login...')
    
    const loginData = {
      email: 'superadmin@wine.com',
      password: 'Superadmincool123@!#'
    }

    const response = await axios.post('http://localhost:5000/api/admin/auth/login', loginData, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Admin-Test-Script/1.0'
      },
      timeout: 10000
    })

    if (response.data.success) {
      console.log('✅ Admin login successful!')
      console.log('📧 Admin:', response.data.data.admin.email)
      console.log('🔑 Role:', response.data.data.admin.role)
      console.log('🎫 Access Token:', response.data.data.accessToken ? 'Generated' : 'Missing')
      console.log('🆔 Session ID:', response.data.data.sessionId ? 'Created' : 'Missing')
    } else {
      console.log('❌ Login failed:', response.data.message)
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

// Test health endpoint first
async function testHealth() {
  try {
    console.log('🏥 Testing health endpoint...')
    const response = await axios.get('http://localhost:5000/health', { timeout: 5000 })
    console.log('✅ Health check passed:', response.data.data.status)
    return true
  } catch (error) {
    console.error('❌ Health check failed:', error.message)
    return false
  }
}

async function runTests() {
  const healthOk = await testHealth()
  if (healthOk) {
    await testAdminLogin()
  } else {
    console.log('⏳ Waiting for server to start...')
    setTimeout(runTests, 2000)
  }
}

runTests()