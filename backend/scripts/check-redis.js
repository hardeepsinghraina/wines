const { redisService } = require('../dist/services/redis.service')

async function checkRedis() {
  try {
    console.log('🔍 Checking Redis connection...')
    
    // Try to connect
    await redisService.connect()
    console.log('✅ Redis connected successfully')
    
    // Test basic operations
    await redisService.set('test_key', 'test_value')
    const value = await redisService.get('test_key')
    
    if (value === 'test_value') {
      console.log('✅ Redis read/write operations working')
    } else {
      console.log('❌ Redis read/write operations failed')
    }
    
    // Clean up
    await redisService.del('test_key')
    console.log('✅ Redis cleanup successful')
    
  } catch (error) {
    console.error('❌ Redis connection failed:', error.message)
    console.log('ℹ️  This is expected if Redis is not installed or running')
    console.log('ℹ️  The application should still work without Redis (with degraded performance)')
  } finally {
    try {
      await redisService.disconnect()
    } catch (e) {
      // Ignore disconnect errors
    }
  }
}

checkRedis()